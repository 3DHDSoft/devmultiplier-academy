import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { getLoginHistory } from '@/lib/login-logger';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user ID from session
    const userId = (session.user as { id?: string }).id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Get login history for the user
    const loginHistory = await getLoginHistory(userId, 20);

    return NextResponse.json({
      history: loginHistory,
      total: loginHistory.length,
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json({ error: 'Failed to fetch login history' }, { status: 500 });
  }
}
