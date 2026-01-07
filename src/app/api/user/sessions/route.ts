import { auth } from '@/auth';
import { getUserSessions, terminateSession, terminateAllOtherSessions } from '@/lib/session-tracker';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * GET /api/user/sessions
 * Get all active sessions for the current user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await getUserSessions(session.user.id);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

const deleteSessionSchema = z.object({
  sessionId: z.string().optional(),
  terminateAll: z.boolean().optional(),
});

/**
 * DELETE /api/user/sessions
 * Terminate a specific session or all other sessions
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = deleteSessionSchema.parse(body);

    if (validatedData.terminateAll) {
      // Terminate all other sessions
      const count = await terminateAllOtherSessions(session.user.id);
      return NextResponse.json({
        success: true,
        message: `${count} session(s) terminated`,
        count,
      });
    } else if (validatedData.sessionId) {
      // Terminate specific session
      const success = await terminateSession(session.user.id, validatedData.sessionId);
      if (!success) {
        return NextResponse.json(
          { error: 'Session not found or already terminated' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Session terminated',
      });
    } else {
      return NextResponse.json(
        { error: 'Either sessionId or terminateAll must be provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error terminating session:', error);
    return NextResponse.json({ error: 'Failed to terminate session' }, { status: 500 });
  }
}
