import { signOut } from '@/auth';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api-handler';
import { authLogger } from '@/lib/logger';

export const POST = withErrorHandling(
  async () => {
    authLogger.info('User signing out');

    // Use Auth.js signOut with redirect option
    await signOut({ redirectTo: '/login' });

    return NextResponse.json({ success: true });
  },
  { route: '/api/auth/logout' }
);
