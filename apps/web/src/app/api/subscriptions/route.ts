/**
 * Subscriptions API
 *
 * Retrieves user's subscription information.
 *
 * @module api/subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/api-handler';
import { AuthenticationError } from '@/lib/errors';

export const GET = withErrorHandling(
  async (_req: NextRequest) => {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const subscriptions = await prisma.subscriptions.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        stripeSubscriptionId: true,
        status: true,
        planType: true,
        seatCount: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        canceledAt: true,
        createdAt: true,
      },
    });

    // Get the active subscription if any
    const activeSubscription = subscriptions.find((sub) => sub.status === 'active' || sub.status === 'trialing');

    return NextResponse.json({
      subscriptions,
      activeSubscription: activeSubscription || null,
      hasActiveSubscription: !!activeSubscription,
    });
  },
  { route: '/api/subscriptions' }
);
