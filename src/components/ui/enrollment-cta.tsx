'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Play, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface EnrollmentCTAProps {
  courseId: string;
  courseSlug: string;
  price?: number; // Price in cents (e.g., 7900 = $79.00)
  currency?: string;
}

export function EnrollmentCTA({
  courseId,
  courseSlug,
  price,
  currency = 'usd',
}: EnrollmentCTAProps) {
  const { status } = useSession();
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check enrollment status when authenticated
  useEffect(() => {
    async function checkEnrollment() {
      if (status !== 'authenticated') {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/enrollments');
        if (response.ok) {
          const data = await response.json();
          const enrollments = data.data || [];
          const enrolled = enrollments.some(
            (e: { courseId: string }) => e.courseId === courseId
          );
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error('Failed to check enrollment:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkEnrollment();
  }, [status, courseId]);

  const formatPrice = (priceInCents: number, curr: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(priceInCents / 100);
  };

  const handlePurchase = async () => {
    setError(null);

    // Redirect to login if not authenticated
    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/courses/${courseSlug}`)}`);
      return;
    }

    setIsPurchasing(true);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseType: 'course',
          courseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsPurchasing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d1d9e0] dark:border-[#30363d] rounded-md p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#656d76] dark:text-[#848d97]" />
      </div>
    );
  }

  // Enrolled state - show Continue Learning
  if (isEnrolled) {
    return (
      <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d1d9e0] dark:border-[#30363d] rounded-md p-8 text-center">
        <h2 className="text-[#1f2328] dark:text-[#e6edf3] mb-2 text-2xl font-semibold">
          Continue Learning
        </h2>
        <p className="text-[#656d76] dark:text-[#848d97] mb-6">
          Pick up where you left off.
        </p>
        <Link
          href={`/courses/${courseSlug}/module-1/lesson-1`}
          className="bg-[#1f883d] dark:bg-[#238636] hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] inline-flex items-center justify-center gap-2 rounded-md px-8 py-3 font-medium text-white transition-colors"
        >
          <Play className="h-5 w-5" />
          Continue Course
        </Link>
      </div>
    );
  }

  // Not enrolled - show purchase CTA
  return (
    <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d1d9e0] dark:border-[#30363d] rounded-md p-8 text-center">
      <h2 className="text-[#1f2328] dark:text-[#e6edf3] mb-2 text-2xl font-semibold">
        Ready to start learning?
      </h2>
      <p className="text-[#656d76] dark:text-[#848d97] mb-6">
        Join thousands of developers mastering modern software architecture.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {price && price > 0 ? (
        <div className="mb-6">
          <span className="text-3xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
            {formatPrice(price, currency)}
          </span>
          <span className="text-[#656d76] dark:text-[#848d97] ml-2 text-sm">
            one-time purchase
          </span>
        </div>
      ) : null}

      <button
        onClick={handlePurchase}
        disabled={isPurchasing}
        className="bg-[#1f883d] dark:bg-[#238636] hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-md px-8 py-3 font-medium text-white transition-colors"
      >
        {isPurchasing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : status !== 'authenticated' ? (
          'Sign in to Enroll'
        ) : price && price > 0 ? (
          <>
            <ShoppingCart className="h-5 w-5" />
            Buy Course
          </>
        ) : (
          'Enroll Now'
        )}
      </button>

      {status !== 'authenticated' && (
        <p className="mt-4 text-sm text-[#656d76] dark:text-[#848d97]">
          Already have an account?{' '}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/courses/${courseSlug}`)}`}
            className="text-[#0969da] dark:text-[#4493f8] hover:underline"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
