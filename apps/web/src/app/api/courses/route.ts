import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api-handler';
import { apiLogger } from '@/lib/logger';

export const GET = withErrorHandling(
  async () => {
    const session = await auth();
    const userLocale = session?.user?.locale || 'en';

    apiLogger.debug({ userLocale }, 'Fetching courses');

    // Get all published courses with translations for user's locale
    const courses = await prisma.course.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        course_translations: {
          where: { locale: userLocale },
          select: {
            title: true,
            description: true,
            thumbnail: true,
          },
        },
        enrollments: session?.user?.email
          ? {
              where: {
                users: { email: session.user.email },
              },
              select: {
                id: true,
                status: true,
                progress: true,
                enrolledAt: true,
              },
            }
          : false,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response with translation fallback
    const formattedCourses = courses.map((course: (typeof courses)[number]) => ({
      id: course.id,
      slug: course.slug,
      title: course.course_translations[0]?.title || 'Untitled Course',
      description: course.course_translations[0]?.description || '',
      thumbnail: course.course_translations[0]?.thumbnail,
      enrollmentCount: course._count.enrollments,
      userEnrollment: session?.user?.email ? course.enrollments?.[0] : null,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return NextResponse.json(formattedCourses);
  },
  { route: '/api/courses' }
);
