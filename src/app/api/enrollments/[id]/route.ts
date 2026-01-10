import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, RouteContext } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, AuthorizationError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

export const GET = withErrorHandling(
  async (_req: NextRequest, context?: RouteContext) => {
    if (!context?.params) {
      throw new NotFoundError('Enrollment');
    }
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const { id: enrollmentId } = await context.params;

    apiLogger.debug({ enrollmentId }, 'Fetching enrollment details');

    const enrollment = await prisma.enrollments.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        userId: true,
        courseId: true,
        status: true,
        progress: true,
        completedAt: true,
        enrolledAt: true,
        updatedAt: true,
        users: {
          select: {
            email: true,
            id: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment', enrollmentId);
    }

    // Verify user owns this enrollment
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (enrollment.userId !== user!.id) {
      throw new AuthorizationError('You do not have access to this enrollment');
    }

    const courseProgress = await prisma.course_progress.findUnique({
      where: {
        userId_courseId: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
        },
      },
      select: {
        modulesComplete: true,
        lessonsComplete: true,
        lastAccessedAt: true,
      },
    });

    return NextResponse.json({
      ...enrollment,
      progress: {
        modulesComplete: courseProgress?.modulesComplete || 0,
        lessonsComplete: courseProgress?.lessonsComplete || 0,
        lastAccessedAt: courseProgress?.lastAccessedAt,
      },
    });
  },
  { route: '/api/enrollments/[id]' }
);
