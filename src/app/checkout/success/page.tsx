/**
 * Checkout Success Page
 *
 * Displays confirmation after successful payment.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCheckoutSession } from '@/lib/stripe';
import { CheckCircle } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect('/');
  }

  // Verify the session exists and was successful
  let sessionDetails: {
    purchaseType: string;
    customerEmail: string | null;
  } | null = null;

  try {
    const session = await getCheckoutSession(session_id);

    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      redirect('/checkout/cancel');
    }

    sessionDetails = {
      purchaseType: (session.metadata?.purchaseType as string) || 'purchase',
      customerEmail: session.customer_email,
    };
  } catch {
    // If we can't verify the session, still show success
    // The webhook will handle the actual fulfillment
  }

  const purchaseType = sessionDetails?.purchaseType || 'purchase';

  const getMessage = () => {
    switch (purchaseType) {
      case 'course':
        return {
          title: 'Course Purchase Successful!',
          description: 'You now have access to your new course. Start learning right away!',
          cta: 'Go to My Courses',
          href: '/dashboard',
        };
      case 'bundle':
        return {
          title: 'Bundle Purchase Successful!',
          description:
            'You now have access to all courses in the bundle. Start your learning journey!',
          cta: 'Go to My Courses',
          href: '/dashboard',
        };
      case 'subscription':
        return {
          title: 'Subscription Activated!',
          description:
            'Your team subscription is now active. You can manage your subscription from your account settings.',
          cta: 'Go to Dashboard',
          href: '/dashboard',
        };
      default:
        return {
          title: 'Payment Successful!',
          description: 'Thank you for your purchase. You can access your content from the dashboard.',
          cta: 'Go to Dashboard',
          href: '/dashboard',
        };
    }
  };

  const message = getMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{message.title}</h1>

        <p className="text-gray-600 mb-6">{message.description}</p>

        {sessionDetails?.customerEmail && (
          <p className="text-sm text-gray-500 mb-6">
            A confirmation email has been sent to{' '}
            <span className="font-medium">{sessionDetails.customerEmail}</span>
          </p>
        )}

        <div className="space-y-3">
          <Link
            href={message.href}
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {message.cta}
          </Link>

          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
