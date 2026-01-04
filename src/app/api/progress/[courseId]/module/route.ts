import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const markModuleCompleteSchema = z.object({
  moduleId: z.string().uuid('Invalid module ID'),
});

export async function PATCH(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.courseId;
    const body = await req.json();
    const { moduleId } = markModuleCompleteSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
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

    // Verify module belongs to this course
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true },
    });

    if (!module || module.courseId !== courseId) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Get all lessons in module
    const lessonsInModule = await prisma.lesson.findMany({
      where: { moduleId },
      select: { id: true },
    });

    // Mark all lessons as complete in progress
    const courseProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!courseProgress) {
      // Create new progress tracking
      await prisma.courseProgress.create({
        data: {
          userId: user.id,
          courseId,
          modulesComplete: 1,
          lessonsComplete: lessonsInModule.length,
        },
      });
    } else {
      // Update existing progress
      await prisma.courseProgress.update({
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
    const updatedProgress = await prisma.courseProgress.findUnique({
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
    await prisma.enrollment.update({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Error marking module complete:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
