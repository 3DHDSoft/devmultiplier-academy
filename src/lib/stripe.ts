/**
 * Stripe Payment Integration Service
 *
 * This module provides a centralized interface for Stripe operations including:
 * - Checkout session creation
 * - Customer management
 * - Subscription management
 * - Webhook signature verification
 *
 * @module lib/stripe
 */

import Stripe from 'stripe';
import { externalLogger } from './logger';
import { ExternalServiceError } from './errors';

// Lazy-initialize Stripe client
let stripeClient: Stripe | null = null;

/**
 * Get the Stripe client instance (lazy initialization)
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new ExternalServiceError(
        'Stripe',
        'STRIPE_SECRET_KEY environment variable is not set'
      );
    }

    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeClient;
}

// ==========================================
// Checkout Session Management
// ==========================================

export interface CreateCheckoutOptions {
  userId: string;
  userEmail: string;
  purchaseType: 'course' | 'bundle' | 'subscription';
  priceId: string;
  courseId?: string;
  bundleId?: string;
  successUrl: string;
  cancelUrl: string;
  quantity?: number;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(
  options: CreateCheckoutOptions
): Promise<Stripe.Checkout.Session> {
  const startTime = Date.now();
  const stripe = getStripeClient();

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: options.purchaseType === 'subscription' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: options.priceId,
          quantity: options.quantity || 1,
        },
      ],
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.userEmail,
      client_reference_id: options.userId,
      metadata: {
        userId: options.userId,
        purchaseType: options.purchaseType,
        ...(options.courseId && { courseId: options.courseId }),
        ...(options.bundleId && { bundleId: options.bundleId }),
        ...options.metadata,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    externalLogger.info(
      {
        sessionId: session.id,
        purchaseType: options.purchaseType,
        duration: Date.now() - startTime,
      },
      'Stripe checkout session created'
    );

    return session;
  } catch (error) {
    externalLogger.error(
      { err: error, duration: Date.now() - startTime },
      'Failed to create Stripe checkout session'
    );
    throw new ExternalServiceError('Stripe', 'Failed to create checkout session', {
      originalError: error,
    });
  }
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();

  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
    });
  } catch (error) {
    externalLogger.error({ err: error, sessionId }, 'Failed to retrieve checkout session');
    throw new ExternalServiceError('Stripe', 'Failed to retrieve checkout session', {
      originalError: error,
    });
  }
}

// ==========================================
// Customer Management
// ==========================================

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  const stripe = getStripeClient();
  const startTime = Date.now();

  try {
    // First, try to find existing customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length > 0) {
      externalLogger.debug({ customerId: customers.data[0].id }, 'Found existing Stripe customer');
      return customers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: { userId },
    });

    externalLogger.info(
      { customerId: customer.id, duration: Date.now() - startTime },
      'Created new Stripe customer'
    );

    return customer;
  } catch (error) {
    externalLogger.error(
      { err: error, duration: Date.now() - startTime },
      'Failed to get or create Stripe customer'
    );
    throw new ExternalServiceError('Stripe', 'Failed to get or create customer', {
      originalError: error,
    });
  }
}

// ==========================================
// Subscription Management
// ==========================================

/**
 * Cancel a subscription (at period end by default)
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();
  const startTime = Date.now();

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    externalLogger.info(
      {
        subscriptionId,
        cancelAtPeriodEnd,
        duration: Date.now() - startTime,
      },
      'Subscription cancellation updated'
    );

    return subscription;
  } catch (error) {
    externalLogger.error(
      { err: error, subscriptionId, duration: Date.now() - startTime },
      'Failed to cancel subscription'
    );
    throw new ExternalServiceError('Stripe', 'Failed to cancel subscription', {
      originalError: error,
    });
  }
}

/**
 * Retrieve a subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    externalLogger.error({ err: error, subscriptionId }, 'Failed to retrieve subscription');
    throw new ExternalServiceError('Stripe', 'Failed to retrieve subscription', {
      originalError: error,
    });
  }
}

/**
 * Resume a canceled subscription (if still in grace period)
 */
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    externalLogger.info({ subscriptionId }, 'Subscription resumed');

    return subscription;
  } catch (error) {
    externalLogger.error({ err: error, subscriptionId }, 'Failed to resume subscription');
    throw new ExternalServiceError('Stripe', 'Failed to resume subscription', {
      originalError: error,
    });
  }
}

// ==========================================
// Webhook Handling
// ==========================================

/**
 * Verify a webhook signature and return the event
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new ExternalServiceError(
      'Stripe',
      'STRIPE_WEBHOOK_SECRET environment variable is not set'
    );
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    externalLogger.warn({ err: error }, 'Webhook signature verification failed');
    throw new ExternalServiceError('Stripe', 'Invalid webhook signature');
  }
}

// ==========================================
// Price Management
// ==========================================

/**
 * Retrieve a price by ID
 */
export async function getPrice(priceId: string): Promise<Stripe.Price> {
  const stripe = getStripeClient();

  try {
    return await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });
  } catch (error) {
    externalLogger.error({ err: error, priceId }, 'Failed to retrieve price');
    throw new ExternalServiceError('Stripe', 'Failed to retrieve price', {
      originalError: error,
    });
  }
}

/**
 * Create a new price in Stripe
 */
export async function createPrice(options: {
  productId: string;
  unitAmount: number;
  currency: string;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count?: number;
  };
}): Promise<Stripe.Price> {
  const stripe = getStripeClient();

  try {
    const price = await stripe.prices.create({
      product: options.productId,
      unit_amount: options.unitAmount,
      currency: options.currency,
      ...(options.recurring && { recurring: options.recurring }),
    });

    externalLogger.info({ priceId: price.id }, 'Created new Stripe price');

    return price;
  } catch (error) {
    externalLogger.error({ err: error }, 'Failed to create price');
    throw new ExternalServiceError('Stripe', 'Failed to create price', {
      originalError: error,
    });
  }
}

/**
 * Create a new product in Stripe
 */
export async function createProduct(options: {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Product> {
  const stripe = getStripeClient();

  try {
    const product = await stripe.products.create({
      name: options.name,
      description: options.description,
      metadata: options.metadata,
    });

    externalLogger.info({ productId: product.id }, 'Created new Stripe product');

    return product;
  } catch (error) {
    externalLogger.error({ err: error }, 'Failed to create product');
    throw new ExternalServiceError('Stripe', 'Failed to create product', {
      originalError: error,
    });
  }
}
