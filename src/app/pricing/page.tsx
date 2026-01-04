import { Metadata } from 'next';
import { Pricing } from '@/components/sections/pricing';
import { CTA } from '@/components/sections/cta';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing | DevMultiplier Academy',
  description:
    'Flexible pricing options for individuals and teams. Individual courses, complete bundles, and team subscriptions available.',
};

export default function PricingPage() {
  return (
    <>
      <div className="bg-white pt-24 sm:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-navy text-4xl font-bold tracking-tight sm:text-5xl">Simple, Transparent Pricing</h1>
            <p className="text-slate mt-4 text-lg">
              Choose the plan that fits your learning goals. All plans include lifetime access to purchased content with
              free updates.
            </p>
          </div>
        </div>
      </div>
      <Pricing />

      {/* FAQ */}
      <section className="bg-off-white py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-navy text-2xl font-bold">Frequently Asked Questions</h2>
          <dl className="mt-8 space-y-8">
            <div>
              <dt className="text-navy font-semibold">{"What's"} included in lifetime access?</dt>
              <dd className="text-slate mt-2">
                Once you purchase a course or bundle, you have permanent access to all current content plus any future
                updates to that course. No recurring fees.
              </dd>
            </div>
            <div>
              <dt className="text-navy font-semibold">Can I upgrade from individual courses to the bundle?</dt>
              <dd className="text-slate mt-2">
                Yes! Contact us and {"we'll"} apply the amount {"you've"} already paid toward the bundle price.
              </dd>
            </div>
            <div>
              <dt className="text-navy font-semibold">Do you offer refunds?</dt>
              <dd className="text-slate mt-2">
                Yes, we offer a 30-day money-back guarantee on all purchases. If {"you're"} not satisfied, contact us
                for a full refund.
              </dd>
            </div>
            <div>
              <dt className="text-navy font-semibold">How does team pricing work?</dt>
              <dd className="text-slate mt-2">
                Team subscriptions are billed per seat per month. You get access to all courses, a team dashboard, and
                priority support. Contact us for volume discounts on larger teams.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <CTA />
    </>
  );
}
