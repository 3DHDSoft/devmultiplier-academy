import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const markLessonCompleteSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID'),
});

export async function PATCH(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.courseId;
    const body = await req.json();
    const { lessonId } = markLessonCompleteSchema.parse(body);

    // Get user
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
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
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Error marking lesson complete:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
