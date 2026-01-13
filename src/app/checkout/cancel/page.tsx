/**
 * Checkout Cancel Page
 *
 * Displays message when checkout is canceled or fails.
 */

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Canceled</h1>

        <p className="text-gray-600 mb-6">
          Your payment was not completed. No charges have been made to your account. If you
          experienced any issues, please try again or contact our support team.
        </p>

        <div className="space-y-3">
          <Link
            href="/#pricing"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Pricing Options
          </Link>

          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
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
