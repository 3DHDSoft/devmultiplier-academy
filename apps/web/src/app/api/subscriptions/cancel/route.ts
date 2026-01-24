/**
 * Subscription Cancellation API
 *
 * Cancels a user's subscription (at period end by default).
 *
 * @module api/subscriptions/cancel
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cancelSubscription } from '@/lib/stripe';
import { withErrorHandling } from '@/lib/api-handler';
import { ValidationError, NotFoundError, AuthenticationError, AuthorizationError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

const cancelSchema = z.object({
  subscriptionId: z.string().uuid(),
  cancelImmediately: z.boolean().optional().default(false),
});

export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const body = await req.json();
    const result = cancelSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError('Invalid request body', result.error.flatten().fieldErrors);
    }

    const { subscriptionId, cancelImmediately } = result.data;

    // Find the subscription
    const subscription = await prisma.subscriptions.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription', subscriptionId);
    }

    // Verify ownership
    if (subscription.userId !== session.user.id) {
      throw new AuthorizationError('You do not have permission to cancel this subscription');
    }

    // Check if already canceled
    if (subscription.status === 'canceled') {
      throw new ValidationError('Subscription is already canceled');
    }

    // Cancel in Stripe
    const cancelAtPeriodEnd = !cancelImmediately;
    await cancelSubscription(subscription.stripeSubscriptionId, cancelAtPeriodEnd);

    // Update local record
    const updatedSubscription = await prisma.subscriptions.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd,
        canceledAt: cancelImmediately ? new Date() : null,
        status: cancelImmediately ? 'canceled' : subscription.status,
        updatedAt: new Date(),
      },
    });

    apiLogger.info({ subscriptionId, cancelImmediately, userId: session.user.id }, 'Subscription cancellation requested');

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
      },
      message: cancelImmediately ? 'Subscription has been canceled immediately.' : `Subscription will be canceled at the end of the billing period (${updatedSubscription.currentPeriodEnd.toISOString()}).`,
    });
  },
  { route: '/api/subscriptions/cancel' }
);
