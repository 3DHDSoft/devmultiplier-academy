import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enrollmentId = params.id;

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
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Verify user owns this enrollment
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (enrollment.userId !== user!.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollment' }, { status: 500 });
  }
}
