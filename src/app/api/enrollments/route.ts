import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/api-handler';
import { AuthenticationError, NotFoundError, AuthorizationError, ConflictError } from '@/lib/errors';

const enrollmentSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
});

/**
 * GET /api/enrollments
 * Get all enrollments for the authenticated user
 */
export const GET = withErrorHandling(
  async () => {
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const userLocale = session.user.locale || 'en';

    const enrollments = await prisma.enrollments.findMany({
      where: {
        users: { email: session.user.email },
      },
      select: {
        id: true,
        status: true,
        progress: true,
        completedAt: true,
        enrolledAt: true,
        updatedAt: true,
        Course: {
          select: {
            id: true,
            slug: true,
            course_translations: {
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
      courseId: enrollment.Course.id,
      courseSlug: enrollment.Course.slug,
      courseTitle: enrollment.Course.course_translations[0]?.title || 'Untitled Course',
      courseThumbnail: enrollment.Course.course_translations[0]?.thumbnail,
      status: enrollment.status,
      progress: enrollment.progress,
      completedAt: enrollment.completedAt,
      enrolledAt: enrollment.enrolledAt,
      updatedAt: enrollment.updatedAt,
    }));

    return NextResponse.json(formattedEnrollments);
  },
  { route: '/api/enrollments' }
);

/**
 * POST /api/enrollments
 * Create a new enrollment for the authenticated user
 */
export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const body = await req.json();
    const { courseId } = enrollmentSchema.parse(body);

    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, status: true },
    });

    if (!course) {
      throw new NotFoundError('Course', courseId);
    }

    if (course.status !== 'published') {
      throw new AuthorizationError('Course is not available for enrollment');
    }

    // Get user
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollments.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictError('Already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await prisma.enrollments.create({
      data: {
        userId: user.id,
        courseId,
        status: 'active',
        updatedAt: new Date(),
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
  },
  { route: '/api/enrollments' }
);
