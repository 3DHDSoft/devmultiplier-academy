'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

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
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Dev Academy</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut({ redirectTo: '/login' })}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Welcome, {session.user?.name || 'Student'}!</h2>
          <p className="text-gray-600">Start learning with our courses or continue where you left off.</p>
        </div>

        {/* User Info Card */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Your Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{session.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{session.user?.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Language</p>
              <p className="font-medium text-gray-900">{(session.user as any)?.locale || 'English'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timezone</p>
              <p className="font-medium text-gray-900">{(session.user as any)?.timezone || 'UTC'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            href="/courses"
            className="cursor-pointer rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
          >
            <div className="mb-3 text-3xl">📚</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Browse Courses</h3>
            <p className="text-gray-600">Explore all available courses</p>
          </Link>

          <Link
            href="/enrollments"
            className="cursor-pointer rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
          >
            <div className="mb-3 text-3xl">📖</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">My Enrollments</h3>
            <p className="text-gray-600">View your active courses</p>
          </Link>

          <Link
            href="/profile"
            className="cursor-pointer rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
          >
            <div className="mb-3 text-3xl">👤</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Edit Profile</h3>
            <p className="text-gray-600">Update your information</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
