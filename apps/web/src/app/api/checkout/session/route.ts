/**
 * Checkout Session API
 *
 * Creates Stripe Checkout sessions for course, bundle, and subscription purchases.
 *
 * @module api/checkout/session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession } from '@/lib/stripe';
import { withErrorHandling } from '@/lib/api-handler';
import { ValidationError, NotFoundError, AuthenticationError, AuthorizationError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';
import { checkBotId } from 'botid/server';

const createSessionSchema = z.object({
  purchaseType: z.enum(['course', 'bundle', 'subscription']),
  courseId: z.string().uuid().optional(),
  bundleId: z.string().uuid().optional(),
  pricingTierId: z.string().uuid().optional(),
  quantity: z.number().min(1).max(100).optional(),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    // BotID check - block automated checkout attempts
    const botCheck = await checkBotId();
    if (botCheck.isBot) {
      apiLogger.warn({ reason: 'bot_detected' }, 'Checkout blocked - bot detected');
      throw new AuthorizationError('Access denied');
    }

    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      throw new AuthenticationError();
    }

    const body = await req.json();
    const result = createSessionSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Invalid request body', result.error.flatten().fieldErrors);
    }

    const { purchaseType, courseId, bundleId, pricingTierId, quantity } = result.data;

    // Validate based on purchase type
    let priceId: string;
    let itemCourseId: string | undefined;
    let itemBundleId: string | undefined;

    if (purchaseType === 'course') {
      if (!courseId) {
        throw new ValidationError('courseId is required for course purchases');
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, stripePriceId: true, status: true },
      });

      if (!course) {
        throw new NotFoundError('Course', courseId);
      }

      if (course.status !== 'published') {
        throw new ValidationError('Course is not available for purchase');
      }

      if (!course.stripePriceId) {
        throw new ValidationError('Course does not have a price configured');
      }

      // Check if already enrolled
      const existingEnrollment = await prisma.enrollments.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId } },
      });

      if (existingEnrollment) {
        throw new ValidationError('You are already enrolled in this course');
      }

      priceId = course.stripePriceId;
      itemCourseId = courseId;
    } else if (purchaseType === 'bundle') {
      if (!bundleId) {
        throw new ValidationError('bundleId is required for bundle purchases');
      }

      const bundle = await prisma.bundles.findUnique({
        where: { id: bundleId },
        select: { id: true, stripePriceId: true, isActive: true },
      });

      if (!bundle) {
        throw new NotFoundError('Bundle', bundleId);
      }

      if (!bundle.isActive) {
        throw new ValidationError('Bundle is not available for purchase');
      }

      if (!bundle.stripePriceId) {
        throw new ValidationError('Bundle does not have a price configured');
      }

      priceId = bundle.stripePriceId;
      itemBundleId = bundleId;
    } else if (purchaseType === 'subscription') {
      if (!pricingTierId) {
        throw new ValidationError('pricingTierId is required for subscription purchases');
      }

      const pricingTier = await prisma.pricing_tiers.findUnique({
        where: { id: pricingTierId },
        select: { id: true, stripePriceId: true, isActive: true, interval: true },
      });

      if (!pricingTier) {
        throw new NotFoundError('Pricing tier', pricingTierId);
      }

      if (!pricingTier.isActive) {
        throw new ValidationError('Pricing tier is not available');
      }

      if (!pricingTier.stripePriceId) {
        throw new ValidationError('Pricing tier does not have a Stripe price configured');
      }

      if (!pricingTier.interval) {
        throw new ValidationError('Pricing tier is not a subscription');
      }

      // Check for existing active subscription
      const existingSubscription = await prisma.subscriptions.findFirst({
        where: {
          userId: session.user.id,
          status: { in: ['active', 'trialing'] },
        },
      });

      if (existingSubscription) {
        throw new ValidationError('You already have an active subscription');
      }

      priceId = pricingTier.stripePriceId;
    } else {
      throw new ValidationError('Invalid purchase type');
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout/cancel`;

    // Create Stripe Checkout session
    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      purchaseType,
      priceId,
      courseId: itemCourseId,
      bundleId: itemBundleId,
      successUrl,
      cancelUrl,
      quantity: quantity || 1,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  },
  { route: '/api/checkout/session' }
);
