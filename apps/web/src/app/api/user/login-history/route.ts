import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { getLoginHistory } from '@/lib/login-logger';
import { withErrorHandling } from '@/lib/api-handler';
import { AuthenticationError, ValidationError } from '@/lib/errors';

export const GET = withErrorHandling(
  async () => {
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    // Get the user ID from session
    const userId = (session.user as { id?: string }).id;

    if (!userId) {
      throw new ValidationError('User ID not found in session');
    }

    // Get login history for the user
    const loginHistory = await getLoginHistory(userId, 20);

    return NextResponse.json({
      history: loginHistory,
      total: loginHistory.length,
    });
  },
  { route: '/api/user/login-history' }
);
