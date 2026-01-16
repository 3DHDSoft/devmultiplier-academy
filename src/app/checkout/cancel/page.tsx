/**
 * Checkout Cancel Page
 *
 * Displays message when checkout is canceled or fails.
 */

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Checkout Canceled</h1>

        <p className="mb-6 text-gray-600">Your payment was not completed. No charges have been made to your account. If you experienced any issues, please try again or contact our support team.</p>

        <div className="space-y-3">
          <Link href="/#pricing" className="block w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700">
            View Pricing Options
          </Link>

          <Link href="/" className="block w-full rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200">
            Return to Home
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Need help?{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
