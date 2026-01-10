import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, RouteContext } from '@/lib/api-handler';
import { NotFoundError, AuthorizationError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

export const GET = withErrorHandling(
  async (_req: NextRequest, context?: RouteContext) => {
    if (!context?.params) {
      throw new NotFoundError('Course');
    }
    const session = await auth();
    const userLocale = session?.user?.locale || 'en';
    const { id: courseId } = await context.params;

    apiLogger.debug({ courseId, userLocale }, 'Fetching course details');

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
            content: true,
            thumbnail: true,
            seoTitle: true,
            seoDescription: true,
          },
        },
        instructors: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            module_translations: {
              where: { locale: userLocale },
              select: {
                title: true,
                description: true,
              },
            },
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                order: true,
                videoUrl: true,
                duration: true,
                lesson_translations: {
                  where: { locale: userLocale },
                  select: {
                    title: true,
                    content: true,
                  },
                },
              },
            },
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
                completedAt: true,
                enrolledAt: true,
              },
            }
          : false,
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Course', courseId);
    }

    // Check if course is published (or user is admin/instructor)
    if (course.status !== 'published') {
      throw new AuthorizationError('Course not available');
    }

    // Format response with translation fallbacks
    const formattedCourse = {
      id: course.id,
      slug: course.slug,
      title: course.course_translations[0]?.title || 'Untitled Course',
      description: course.course_translations[0]?.description || '',
      content: course.course_translations[0]?.content || '',
      thumbnail: course.course_translations[0]?.thumbnail,
      seoTitle: course.course_translations[0]?.seoTitle,
      seoDescription: course.course_translations[0]?.seoDescription,
      instructors: course.instructors,
      modules: course.modules.map((module: (typeof course.modules)[number]) => ({
        id: module.id,
        order: module.order,
        title: module.module_translations[0]?.title || 'Untitled Module',
        description: module.module_translations[0]?.description,
        lessons: module.lessons.map((lesson: (typeof module.lessons)[number]) => ({
          id: lesson.id,
          order: lesson.order,
          title: lesson.lesson_translations[0]?.title || 'Untitled Lesson',
          content: lesson.lesson_translations[0]?.content || '',
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
        })),
      })),
      enrollmentCount: course._count.enrollments,
      userEnrollment: session?.user?.email ? course.enrollments?.[0] : null,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    return NextResponse.json(formattedCourse);
  },
  { route: '/api/courses/[id]' }
);
