'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Play, BookOpen, CheckCircle } from 'lucide-react';

interface EnrolledCourse {
  id: string;
  courseId: string;
  status: string;
  progress: number;
  enrolledAt: string;
  Course: {
    id: string;
    slug: string;
    course_translations: Array<{
      title: string;
      description: string;
    }>;
  };
}

interface EnrolledCoursesProps {
  limit?: number;
  showViewAll?: boolean;
}

export function EnrolledCourses({ limit, showViewAll = false }: EnrolledCoursesProps) {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const response = await fetch('/api/enrollments');
        if (!response.ok) {
          throw new Error('Failed to fetch enrollments');
        }
        const data = await response.json();
        const enrollmentList = data.data || [];
        setEnrollments(limit ? enrollmentList.slice(0, limit) : enrollmentList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEnrollments();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#656d76] dark:text-[#848d97]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-8 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-[#656d76] dark:text-[#848d97] mb-4" />
        <h3 className="text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-2">
          No courses yet
        </h3>
        <p className="text-[#656d76] dark:text-[#848d97] mb-4">
          Start your learning journey by enrolling in a course.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center justify-center rounded-md bg-[#1f883d] dark:bg-[#238636] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => {
        const title =
          enrollment.Course.course_translations[0]?.title ||
          'Untitled Course';
        const description =
          enrollment.Course.course_translations[0]?.description || '';

        return (
          <div
            key={enrollment.id}
            className="rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 transition hover:border-[#0969da] dark:hover:border-[#4493f8]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/courses/${enrollment.Course.slug}`}
                  className="text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3] hover:text-[#0969da] dark:hover:text-[#4493f8] transition-colors"
                >
                  {title}
                </Link>
                <p className="mt-1 text-sm text-[#656d76] dark:text-[#848d97] line-clamp-2">
                  {description}
                </p>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-[#656d76] dark:text-[#848d97] mb-1">
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1f883d] dark:bg-[#238636] transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {enrollment.progress === 100 ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-[#1f883d] dark:text-[#3fb950]">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </span>
                ) : (
                  <Link
                    href={`/courses/${enrollment.Course.slug}/module-1/lesson-1`}
                    className="flex items-center gap-1 rounded-md bg-[#1f883d] dark:bg-[#238636] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] transition-colors"
                  >
                    <Play className="h-3 w-3" />
                    Continue
                  </Link>
                )}
                <span className="text-xs text-[#656d76] dark:text-[#848d97]">
                  Enrolled{' '}
                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {showViewAll && enrollments.length > 0 && (
        <div className="text-center pt-2">
          <Link
            href="/enrollments"
            className="text-sm text-[#0969da] dark:text-[#4493f8] hover:underline"
          >
            View all enrollments
          </Link>
        </div>
      )}
    </div>
  );
}
