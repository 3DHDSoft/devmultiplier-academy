'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { EnrolledCourses } from '@/components/ui/enrolled-courses';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117]">
        <p className="text-[#1f2328] dark:text-[#e6edf3]">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117]">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="mb-4 text-3xl font-bold text-[#1f2328] dark:text-[#e6edf3]">Welcome, {session.user?.name || 'Student'}!</h2>
          <p className="text-[#656d76] dark:text-[#848d97]">Start learning with our courses or continue where you left off.</p>
        </div>

        {/* User Info Card */}
        <div className="mb-8 rounded-lg border border-[#d1d9e0] bg-white p-6 shadow dark:border-[#30363d] dark:bg-[#161b22]">
          <h3 className="mb-4 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">Your Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#656d76] dark:text-[#848d97]">Email</p>
              <p className="font-medium text-[#1f2328] dark:text-[#e6edf3]">{session.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-[#656d76] dark:text-[#848d97]">Name</p>
              <p className="font-medium text-[#1f2328] dark:text-[#e6edf3]">{session.user?.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-[#656d76] dark:text-[#848d97]">Language</p>
              <p className="font-medium text-[#1f2328] dark:text-[#e6edf3]">{(session.user as { locale?: string })?.locale || 'English'}</p>
            </div>
            <div>
              <p className="text-sm text-[#656d76] dark:text-[#848d97]">Timezone</p>
              <p className="font-medium text-[#1f2328] dark:text-[#e6edf3]">{(session.user as { timezone?: string })?.timezone || 'UTC'}</p>
            </div>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">My Courses</h3>
            <Link href="/courses" className="text-sm text-[#0969da] hover:underline dark:text-[#4493f8]">
              Browse all courses
            </Link>
          </div>
          <EnrolledCourses limit={3} showViewAll />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link href="/courses" className="cursor-pointer rounded-lg border border-[#d1d9e0] bg-white p-6 shadow transition hover:border-[#0969da] hover:shadow-lg dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-[#4493f8]">
            <div className="mb-3 text-3xl">📚</div>
            <h3 className="mb-2 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">Browse Courses</h3>
            <p className="text-[#656d76] dark:text-[#848d97]">Explore all available courses</p>
          </Link>

          <Link href="/enrollments" className="cursor-pointer rounded-lg border border-[#d1d9e0] bg-white p-6 shadow transition hover:border-[#0969da] hover:shadow-lg dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-[#4493f8]">
            <div className="mb-3 text-3xl">📖</div>
            <h3 className="mb-2 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">My Enrollments</h3>
            <p className="text-[#656d76] dark:text-[#848d97]">View your active courses</p>
          </Link>

          <Link href="/profile" className="cursor-pointer rounded-lg border border-[#d1d9e0] bg-white p-6 shadow transition hover:border-[#0969da] hover:shadow-lg dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-[#4493f8]">
            <div className="mb-3 text-3xl">👤</div>
            <h3 className="mb-2 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">Edit Profile</h3>
            <p className="text-[#656d76] dark:text-[#848d97]">Update your information</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
