import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling, RouteContext } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, AuthorizationError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

const markModuleCompleteSchema = z.object({
  moduleId: z.string().uuid('Invalid module ID'),
});

export const PATCH = withErrorHandling(
  async (req: NextRequest, context?: RouteContext) => {
    if (!context?.params) {
      throw new NotFoundError('Module');
    }
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const { courseId } = await context.params;
    const body = await req.json();
    const { moduleId } = markModuleCompleteSchema.parse(body);

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
      select: { id: true },
    });

    if (!enrollment) {
      throw new AuthorizationError('Not enrolled in this course');
    }

    // Verify module belongs to this course
    const courseModule = await prisma.modules.findUnique({
      where: { id: moduleId },
      select: { courseId: true },
    });

    if (!courseModule || courseModule.courseId !== courseId) {
      throw new NotFoundError('Module', moduleId);
    }

    apiLogger.debug({ userId: user.id, courseId, moduleId }, 'Marking module complete');

    // Get all lessons in module
    const lessonsInModule = await prisma.lessons.findMany({
      where: { moduleId },
      select: { id: true },
    });

    // Mark all lessons as complete in progress
    const courseProgress = await prisma.course_progress.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!courseProgress) {
      // Create new progress tracking
      await prisma.course_progress.create({
        data: {
          userId: user.id,
          courseId,
          modulesComplete: 1,
          lessonsComplete: lessonsInModule.length,
          updatedAt: new Date(),
        },
      });
    } else {
      // Update existing progress
      await prisma.course_progress.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        data: {
          modulesComplete: { increment: 1 },
          lessonsComplete: { increment: lessonsInModule.length },
          lastAccessedAt: new Date(),
        },
      });
    }

    // Get updated progress
    const updatedProgress = await prisma.course_progress.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      select: {
        modulesComplete: true,
        lessonsComplete: true,
      },
    });

    // Calculate overall progress
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        _count: {
          select: { modules: true },
        },
      },
    });

    const overallProgress = Math.round(((updatedProgress?.modulesComplete || 0) / (course?._count.modules || 1)) * 100);

    // Update enrollment progress
    await prisma.enrollments.update({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      data: {
        progress: overallProgress,
      },
    });

    return NextResponse.json({
      success: true,
      progress: {
        moduleId,
        lessonsInModule: lessonsInModule.length,
        modulesComplete: updatedProgress?.modulesComplete,
        lessonsComplete: updatedProgress?.lessonsComplete,
        overallProgress,
      },
    });
  },
  { route: '/api/progress/[courseId]/module' }
);
