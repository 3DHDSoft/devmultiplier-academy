import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, RouteContext } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, AuthorizationError } from '@/lib/errors';

export const GET = withErrorHandling(
  async (_req: NextRequest, context?: RouteContext) => {
    if (!context?.params) {
      throw new NotFoundError('Course progress');
    }
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const { courseId } = await context.params;

    // Get user
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify enrollment
    const enrollment = await prisma.enrollments.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      select: { id: true, status: true, progress: true },
    });

    if (!enrollment) {
      throw new AuthorizationError('Not enrolled in this course');
    }

    // Get course progress
    const courseProgress = await prisma.course_progress.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      select: {
        modulesComplete: true,
        lessonsComplete: true,
        lastAccessedAt: true,
        updatedAt: true,
      },
    });

    // Get course structure for total count
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        modules: {
          select: {
            id: true,
            _count: {
              select: { lessons: true },
            },
          },
        },
        _count: {
          select: {
            modules: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Course', courseId);
    }

    // Calculate totals
    const totalModules = course._count.modules;
    const totalLessons = course.modules.reduce(
      (sum: number, mod: (typeof course.modules)[number]) => sum + mod._count.lessons,
      0
    );

    const modulesComplete = courseProgress?.modulesComplete || 0;
    const lessonsComplete = courseProgress?.lessonsComplete || 0;

    return NextResponse.json({
      courseId,
      enrollmentStatus: enrollment.status,
      progress: {
        modules: {
          complete: modulesComplete,
          total: totalModules,
          percentage: totalModules > 0 ? Math.round((modulesComplete / totalModules) * 100) : 0,
        },
        lessons: {
          complete: lessonsComplete,
          total: totalLessons,
          percentage: totalLessons > 0 ? Math.round((lessonsComplete / totalLessons) * 100) : 0,
        },
        overallProgress: enrollment.progress,
      },
      lastAccessedAt: courseProgress?.lastAccessedAt || enrollment.progress > 0 ? new Date() : null,
      updatedAt: courseProgress?.updatedAt,
    });
  },
  { route: '/api/progress/[courseId]' }
);
