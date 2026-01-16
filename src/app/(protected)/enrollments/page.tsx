'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { EnrolledCourses } from '@/components/ui/enrolled-courses';

export const dynamic = 'force-dynamic';

export default function EnrollmentsPage() {
  const { status } = useSession();
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

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117]">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm text-[#656d76] transition-colors hover:text-[#0969da] dark:text-[#848d97] dark:hover:text-[#4493f8]">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[#1f2328] dark:text-[#e6edf3]">My Enrollments</h1>
          <p className="text-[#656d76] dark:text-[#848d97]">Track your progress across all enrolled courses.</p>
        </div>

        {/* Enrolled courses list */}
        <EnrolledCourses />
      </main>
    </div>
  );
}
