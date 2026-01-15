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
          description: 'You now have access to all courses in the bundle. Start your learning journey!',
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">{message.title}</h1>

        <p className="mb-6 text-gray-600">{message.description}</p>

        {sessionDetails?.customerEmail && (
          <p className="mb-6 text-sm text-gray-500">
            A confirmation email has been sent to <span className="font-medium">{sessionDetails.customerEmail}</span>
          </p>
        )}

        <div className="space-y-3">
          <Link
            href={message.href}
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            {message.cta}
          </Link>

          <Link
            href="/"
            className="block w-full rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
