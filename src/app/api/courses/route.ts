import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    const userLocale = session?.user?.locale || 'en';

    // Get all published courses with translations for user's locale
    const courses = await prisma.course.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        translations: {
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
                user: { email: session.user.email },
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
      title: course.translations[0]?.title || 'Untitled Course',
      description: course.translations[0]?.description || '',
      thumbnail: course.translations[0]?.thumbnail,
      enrollmentCount: course._count.enrollments,
      userEnrollment: session?.user?.email ? course.enrollments?.[0] : null,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
