/**
 * Stripe Webhook Handler
 *
 * Processes Stripe webhook events for:
 * - Checkout session completions (course/bundle purchases)
 * - Subscription lifecycle events
 * - Payment/refund events
 *
 * @module api/webhooks/stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/stripe';
import { externalLogger } from '@/lib/logger';
import type Stripe from 'stripe';

// Disable body parsing - we need the raw body for signature verification
export const runtime = 'nodejs';

/**
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      externalLogger.warn('Stripe webhook received without signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch {
      externalLogger.warn('Stripe webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    externalLogger.info({ eventType: event.type, eventId: event.id }, 'Processing Stripe webhook');

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        externalLogger.debug({ eventType: event.type }, 'Unhandled Stripe event type');
    }

    externalLogger.info(
      { eventType: event.type, eventId: event.id, duration: Date.now() - startTime },
      'Stripe webhook processed successfully'
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    externalLogger.error({ err: error, duration: Date.now() - startTime }, 'Stripe webhook processing failed');
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle successful checkout session completion
 * Creates payment record and enrollments for courses/bundles
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { metadata, amount_total, currency, id: checkoutId } = session;

  if (!metadata?.userId || !metadata?.purchaseType) {
    externalLogger.warn({ sessionId: session.id }, 'Checkout session missing required metadata');
    return;
  }

  const { userId, purchaseType, courseId, bundleId } = metadata;

  // Create payment record
  const payment = await prisma.payments.create({
    data: {
      userId,
      stripeCheckoutId: checkoutId,
      purchaseType,
      courseId: courseId || null,
      bundleId: bundleId || null,
      amount: amount_total || 0,
      currency: currency || 'usd',
      status: 'completed',
      metadata: metadata as Record<string, string>,
      updatedAt: new Date(),
    },
  });

  externalLogger.info({ paymentId: payment.id, purchaseType }, 'Payment record created');

  // Create enrollments based on purchase type
  if (purchaseType === 'course' && courseId) {
    await createEnrollment(userId, courseId);
  } else if (purchaseType === 'bundle' && bundleId) {
    await createBundleEnrollments(userId, bundleId);
  } else if (purchaseType === 'subscription') {
    // Subscription enrollments are handled via invoice.paid for recurring access
    externalLogger.info({ userId }, 'Subscription checkout completed, awaiting invoice');
  }

  // Update user's Stripe customer ID if not set
  if (session.customer && typeof session.customer === 'string') {
    await prisma.users.update({
      where: { id: userId },
      data: {
        stripeCustomerId: session.customer,
        updatedAt: new Date(),
      },
    });
  }
}

/**
 * Handle invoice payment (for subscriptions)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Get subscription ID from the invoice
  const subscriptionField = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
  if (!subscriptionField) {
    return;
  }

  const subscriptionId = typeof subscriptionField === 'string'
    ? subscriptionField
    : subscriptionField.id;

  // Find the subscription in our database
  const subscription = await prisma.subscriptions.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) {
    externalLogger.warn({ subscriptionId }, 'Subscription not found for invoice');
    return;
  }

  // Update the subscription period
  await prisma.subscriptions.update({
    where: { id: subscription.id },
    data: {
      currentPeriodStart: new Date((invoice.period_start || 0) * 1000),
      currentPeriodEnd: new Date((invoice.period_end || 0) * 1000),
      status: 'active',
      updatedAt: new Date(),
    },
  });

  // Create payment record for the invoice
  await prisma.payments.create({
    data: {
      userId: subscription.userId,
      stripeInvoiceId: invoice.id,
      purchaseType: 'subscription',
      amount: invoice.amount_paid || 0,
      currency: invoice.currency || 'usd',
      status: 'completed',
      updatedAt: new Date(),
    },
  });

  externalLogger.info({ subscriptionId, invoiceId: invoice.id }, 'Subscription invoice processed');
}

/**
 * Handle subscription updates (plan changes, cancellation scheduled)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Cast to access period fields that may vary by API version
  const sub = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };

  const existingSubscription = await prisma.subscriptions.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  // Get period dates from subscription or use current date as fallback
  const periodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : new Date();
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now as fallback

  if (!existingSubscription) {
    // New subscription - create it
    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

    // Find user by Stripe customer ID
    const user = await prisma.users.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      externalLogger.warn({ customerId }, 'User not found for new subscription');
      return;
    }

    await prisma.subscriptions.create({
      data: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        stripePriceId:
          subscription.items.data[0]?.price.id || '',
        status: subscription.status,
        planType: determinePlanType(subscription),
        seatCount: subscription.items.data[0]?.quantity || 1,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        updatedAt: new Date(),
      },
    });

    externalLogger.info({ subscriptionId: subscription.id }, 'New subscription created');
  } else {
    // Update existing subscription
    await prisma.subscriptions.update({
      where: { id: existingSubscription.id },
      data: {
        status: subscription.status,
        seatCount: subscription.items.data[0]?.quantity || 1,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        updatedAt: new Date(),
      },
    });

    externalLogger.info({ subscriptionId: subscription.id }, 'Subscription updated');
  }
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existingSubscription = await prisma.subscriptions.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSubscription) {
    externalLogger.warn({ subscriptionId: subscription.id }, 'Deleted subscription not found');
    return;
  }

  await prisma.subscriptions.update({
    where: { id: existingSubscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    },
  });

  externalLogger.info({ subscriptionId: subscription.id }, 'Subscription canceled');
}

/**
 * Handle charge refunds
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  // Find payment by payment intent ID
  if (!charge.payment_intent || typeof charge.payment_intent !== 'string') {
    return;
  }

  const payment = await prisma.payments.findFirst({
    where: { stripePaymentIntentId: charge.payment_intent },
  });

  if (!payment) {
    externalLogger.warn({ paymentIntentId: charge.payment_intent }, 'Payment not found for refund');
    return;
  }

  await prisma.payments.update({
    where: { id: payment.id },
    data: {
      status: 'refunded',
      updatedAt: new Date(),
    },
  });

  externalLogger.info({ paymentId: payment.id }, 'Payment marked as refunded');
}

/**
 * Create enrollment for a single course
 */
async function createEnrollment(userId: string, courseId: string) {
  // Check if enrollment already exists
  const existing = await prisma.enrollments.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    externalLogger.debug({ userId, courseId }, 'Enrollment already exists');
    return;
  }

  await prisma.enrollments.create({
    data: {
      userId,
      courseId,
      status: 'active',
      progress: 0,
      updatedAt: new Date(),
    },
  });

  externalLogger.info({ userId, courseId }, 'Enrollment created');
}

/**
 * Create enrollments for all courses in a bundle
 */
async function createBundleEnrollments(userId: string, bundleId: string) {
  // Get all courses in the bundle
  const bundleCourses = await prisma.bundle_courses.findMany({
    where: { bundleId },
    select: { courseId: true },
  });

  for (const { courseId } of bundleCourses) {
    await createEnrollment(userId, courseId);
  }

  externalLogger.info(
    { userId, bundleId, courseCount: bundleCourses.length },
    'Bundle enrollments created'
  );
}

/**
 * Determine plan type from subscription metadata or price
 */
function determinePlanType(subscription: Stripe.Subscription): string {
  const metadata = subscription.metadata;
  if (metadata?.planType) {
    return metadata.planType;
  }

  // Default based on billing interval
  const price = subscription.items.data[0]?.price;
  if (price?.recurring?.interval === 'year') {
    return 'team_annual';
  }
  return 'team_monthly';
}
