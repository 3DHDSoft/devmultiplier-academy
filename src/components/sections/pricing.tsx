import Link from 'next/link';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Individual Course',
    price: '$79',
    description: 'Perfect for focused learning on a specific topic.',
    features: ['Full course access', 'Downloadable resources', 'Certificate of completion', 'Lifetime updates'],
    cta: 'Choose a Course',
    href: '/courses',
    featured: false,
  },
  {
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
    href: '/pricing',
    featured: true,
  },
  {
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
    cta: 'Contact Sales',
    href: '/contact',
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-blue text-sm font-semibold tracking-wider uppercase">Pricing</h2>
          <p className="text-navy mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Invest in Your Career</p>
          <p className="text-slate mt-4 text-lg">
            Choose the plan that fits your learning goals. All plans include lifetime access to purchased content.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl p-8 ${
                tier.featured
                  ? 'border-blue bg-navy border-2 text-white shadow-xl'
                  : 'border-light-gray border bg-white'
              }`}
            >
              {tier.featured && (
                <div className="bg-blue absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <h3 className={`text-lg font-semibold ${tier.featured ? 'text-white' : 'text-navy'}`}>{tier.name}</h3>

              <div className="mt-4 flex items-baseline">
                <span className={`text-4xl font-bold ${tier.featured ? 'text-white' : 'text-navy'}`}>{tier.price}</span>
                {tier.period && (
                  <span className={`ml-1 text-sm ${tier.featured ? 'text-blue-200' : 'text-slate'}`}>
                    {tier.period}
                  </span>
                )}
              </div>

              <p className={`mt-4 text-sm ${tier.featured ? 'text-blue-100' : 'text-slate'}`}>{tier.description}</p>

              <ul className="mt-6 flex-grow space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start"
                  >
                    <Check className={`mr-2 h-5 w-5 flex-shrink-0 ${tier.featured ? 'text-cyan' : 'text-blue'}`} />
                    <span className={`text-sm ${tier.featured ? 'text-blue-100' : 'text-slate'}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`mt-8 block rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                  tier.featured ? 'text-navy bg-white hover:bg-blue-50' : 'bg-navy hover:bg-blue text-white'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
