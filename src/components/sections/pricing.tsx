'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, Loader2 } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  purchaseType: 'course' | 'bundle' | 'subscription';
  featured: boolean;
  // For courses - would need courseId
  // For bundles - would need bundleId
  // For subscriptions - would need pricingTierId
  itemId?: string;
}

const tiers: PricingTier[] = [
  {
    id: 'individual',
    name: 'Individual Course',
    price: '$79',
    description: 'Perfect for focused learning on a specific topic.',
    features: [
      'Full course access',
      'Downloadable resources',
      'Certificate of completion',
      'Lifetime updates',
    ],
    cta: 'Choose a Course',
    purchaseType: 'course',
    featured: false,
  },
  {
    id: 'bundle',
    name: 'Complete Bundle',
    price: '$299',
    description: 'All five courses at a significant discount.',
    features: [
      'All 5 courses included',
      'Downloadable resources',
      'Certificates of completion',
      'Lifetime updates',
      'Priority support',
      'Bonus: Architecture templates',
    ],
    cta: 'Get the Bundle',
    purchaseType: 'bundle',
    featured: true,
  },
  {
    id: 'team',
    name: 'Team Subscription',
    price: '$49',
    period: '/seat/month',
    description: 'For teams who want continuous learning.',
    features: [
      'All current & future courses',
      'Team progress dashboard',
      'Admin controls',
      'Priority support',
      'Custom invoicing',
      'Onboarding session',
    ],
    cta: 'Start Free Trial',
    purchaseType: 'subscription',
    featured: false,
  },
];

export function Pricing() {
  const { status } = useSession();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (tier: PricingTier) => {
    setError(null);

    // Redirect to login if not authenticated
    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent('/#pricing')}`);
      return;
    }

    // For individual courses, redirect to course selection
    if (tier.purchaseType === 'course') {
      router.push('/courses');
      return;
    }

    // For bundle and subscription, initiate checkout
    setLoadingTier(tier.id);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseType: tier.purchaseType,
          bundleId: tier.purchaseType === 'bundle' ? tier.itemId : undefined,
          pricingTierId: tier.purchaseType === 'subscription' ? tier.itemId : undefined,
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
      setLoadingTier(null);
    }
  };

  return (
    <section
      id="pricing"
      className="bg-white dark:bg-[#0d1117] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[#0969da] dark:text-[#4493f8] text-sm font-semibold tracking-wider uppercase">
            Pricing
          </h2>
          <p className="text-[#1f2328] dark:text-[#e6edf3] mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Invest in Your Career
          </p>
          <p className="text-[#656d76] dark:text-[#848d97] mt-4 text-lg">
            Choose the plan that fits your learning goals. All plans include lifetime access to
            purchased content.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-auto mt-8 max-w-md rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl p-8 ${
                tier.featured
                  ? 'border-[#0969da] dark:border-[#4493f8] bg-[#1f2328] dark:bg-[#161b22] border-2 text-white shadow-xl'
                  : 'border-[#d1d9e0] dark:border-[#30363d] border bg-white dark:bg-[#161b22]'
              }`}
            >
              {tier.featured && (
                <div className="bg-[#0969da] dark:bg-[#4493f8] absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <h3
                className={`text-lg font-semibold ${tier.featured ? 'text-white' : 'text-[#1f2328] dark:text-[#e6edf3]'}`}
              >
                {tier.name}
              </h3>

              <div className="mt-4 flex items-baseline">
                <span
                  className={`text-4xl font-bold ${tier.featured ? 'text-white' : 'text-[#1f2328] dark:text-[#e6edf3]'}`}
                >
                  {tier.price}
                </span>
                {tier.period && (
                  <span
                    className={`ml-1 text-sm ${tier.featured ? 'text-[#848d97]' : 'text-[#656d76] dark:text-[#848d97]'}`}
                  >
                    {tier.period}
                  </span>
                )}
              </div>

              <p
                className={`mt-4 text-sm ${tier.featured ? 'text-[#848d97]' : 'text-[#656d76] dark:text-[#848d97]'}`}
              >
                {tier.description}
              </p>

              <ul className="mt-6 flex-grow space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start"
                  >
                    <Check
                      className={`mr-2 h-5 w-5 shrink-0 ${tier.featured ? 'text-[#3fb950]' : 'text-[#0969da] dark:text-[#4493f8]'}`}
                    />
                    <span
                      className={`text-sm ${tier.featured ? 'text-[#848d97]' : 'text-[#656d76] dark:text-[#848d97]'}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(tier)}
                disabled={loadingTier === tier.id}
                className={`mt-8 flex items-center justify-center rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                  tier.featured
                    ? 'text-[#1f2328] bg-white hover:bg-[#f6f8fa]'
                    : 'bg-[#1f883d] dark:bg-[#238636] hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] text-white'
                }`}
              >
                {loadingTier === tier.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  tier.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Note about subscriptions */}
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-[#656d76] dark:text-[#848d97]">
          Team subscriptions include a 14-day free trial. Cancel anytime. Prices shown exclude
          applicable taxes.
        </p>
      </div>
    </section>
  );
}
