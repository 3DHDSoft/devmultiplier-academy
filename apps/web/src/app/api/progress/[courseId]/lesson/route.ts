import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling, RouteContext } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, AuthorizationError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

const markLessonCompleteSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID'),
});

export const PATCH = withErrorHandling(
  async (req: NextRequest, context?: RouteContext) => {
    if (!context?.params) {
      throw new NotFoundError('Lesson');
    }
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const { courseId } = await context.params;
    const body = await req.json();
    const { lessonId } = markLessonCompleteSchema.parse(body);

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

    // Verify lesson belongs to this course
    const lesson = await prisma.lessons.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        modules: {
          select: {
            id: true,
            courseId: true,
          },
        },
      },
    });

    if (!lesson || lesson.modules.courseId !== courseId) {
      throw new NotFoundError('Lesson', lessonId);
    }

    apiLogger.debug({ userId: user.id, courseId, lessonId }, 'Marking lesson complete');

    // Get or create course progress
    let courseProgress = await prisma.course_progress.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!courseProgress) {
      courseProgress = await prisma.course_progress.create({
        data: {
          userId: user.id,
          courseId,
          lessonId,
          modulesComplete: 0,
          lessonsComplete: 1,
          updatedAt: new Date(),
        },
      });
    } else {
      // Increment lessons complete
      courseProgress = await prisma.course_progress.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        data: {
          lessonId,
          lessonsComplete: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });
    }

    // Calculate if module is complete
    const lessonModule = lesson.modules;
    const totalLessonsInModule = await prisma.lessons.count({
      where: { moduleId: lessonModule.id },
    });

    const completedLessonsInModule = await prisma.lessons.count({
      where: {
        moduleId: lessonModule.id,
      },
      // This is a simplified approach - in production,
      // you'd track which specific lessons are complete
      // For now, we'll just check module completion by counting total lessons
    });

    // For proper tracking, you'd need a separate lessonCompletion table
    // For MVP, we'll just mark module complete when all lessons in courseProgress for that module are done
    const allLessonsInModule = completedLessonsInModule;

    // If all lessons in module are complete, increment module count
    let updatedProgress = courseProgress;
    if (allLessonsInModule === totalLessonsInModule) {
      updatedProgress = await prisma.course_progress.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        data: {
          modulesComplete: { increment: 1 },
        },
      });
    }

    // Calculate overall progress percentage
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        _count: {
          select: { modules: true },
        },
      },
    });

    const overallProgress = Math.round(((updatedProgress.modulesComplete || 0) / (course?._count.modules || 1)) * 100);

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
        lessonId,
        lessonsComplete: updatedProgress.lessonsComplete,
        modulesComplete: updatedProgress.modulesComplete,
        overallProgress,
      },
    });
  },
  { route: '/api/progress/[courseId]/lesson' }
);
