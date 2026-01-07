import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const enrollmentSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userLocale = session.user.locale || 'en';

    const enrollments = await prisma.enrollment.findMany({
      where: {
        user: { email: session.user.email },
      },
      select: {
        id: true,
        status: true,
        progress: true,
        completedAt: true,
        enrolledAt: true,
        updatedAt: true,
        course: {
          select: {
            id: true,
            slug: true,
            translations: {
              where: { locale: userLocale },
              select: {
                title: true,
                description: true,
                thumbnail: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Format response with translation fallbacks
    const formattedEnrollments = enrollments.map((enrollment: (typeof enrollments)[number]) => ({
      id: enrollment.id,
      courseId: enrollment.course.id,
      courseSlug: enrollment.course.slug,
      courseTitle: enrollment.course.translations[0]?.title || 'Untitled Course',
      courseThumbnail: enrollment.course.translations[0]?.thumbnail,
      status: enrollment.status,
      progress: enrollment.progress,
      completedAt: enrollment.completedAt,
      enrolledAt: enrollment.enrolledAt,
      updatedAt: enrollment.updatedAt,
    }));

    return NextResponse.json(formattedEnrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId } = enrollmentSchema.parse(body);

    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.status !== 'published') {
      return NextResponse.json({ error: 'Course is not available for enrollment' }, { status: 403 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: (await prisma.users.findUnique({
            where: { email: session.user.email },
            select: { id: true },
          }))!.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 });
    }

    // Create enrollment
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user!.id,
        courseId,
        status: 'active',
      },
      select: {
        id: true,
        status: true,
        progress: true,
        enrolledAt: true,
        courseId: true,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Error creating enrollment:', error);
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
  }
}
