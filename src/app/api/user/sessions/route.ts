import { auth } from '@/auth';
import { getUserSessions, terminateSession, terminateAllOtherSessions } from '@/lib/session-tracker';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, ValidationError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

/**
 * GET /api/user/sessions
 * Get all active sessions for the current user
 */
export const GET = withErrorHandling(
  async () => {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const sessions = await getUserSessions(session.user.id);

    return NextResponse.json({ sessions });
  },
  { route: '/api/user/sessions' }
);

const deleteSessionSchema = z.object({
  sessionId: z.string().optional(),
  terminateAll: z.boolean().optional(),
});

/**
 * DELETE /api/user/sessions
 * Terminate a specific session or all other sessions
 */
export const DELETE = withErrorHandling(
  async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const body = await req.json();
    const validatedData = deleteSessionSchema.parse(body);

    if (validatedData.terminateAll) {
      // Terminate all other sessions (excluding current one)
      const currentSessionId = session.user.sessionId;
      const count = await terminateAllOtherSessions(session.user.id, currentSessionId);

      apiLogger.info({ userId: session.user.id, count }, 'Terminated all other sessions');

      return NextResponse.json({
        success: true,
        message: `${count} session(s) terminated`,
        count,
      });
    } else if (validatedData.sessionId) {
      // Prevent terminating current session
      if (session.user.sessionId && validatedData.sessionId === session.user.sessionId) {
        throw new ValidationError('Cannot terminate your current session. Please log out instead.');
      }

      // Terminate specific session
      const success = await terminateSession(session.user.id, validatedData.sessionId);
      if (!success) {
        throw new NotFoundError('Session');
      }

      apiLogger.info({ userId: session.user.id, sessionId: validatedData.sessionId }, 'Session terminated');

      return NextResponse.json({
        success: true,
        message: 'Session terminated',
      });
    } else {
      throw new ValidationError('Either sessionId or terminateAll must be provided');
    }
  },
  { route: '/api/user/sessions' }
);
