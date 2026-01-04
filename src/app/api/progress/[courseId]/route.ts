import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.courseId;

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
      select: { id: true, status: true, progress: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    // Get course progress
    const courseProgress = await prisma.courseProgress.findUnique({
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
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
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
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
