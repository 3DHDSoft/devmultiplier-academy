import { Metadata } from 'next';
import Link from 'next/link';
import { FAQAccordion, type FAQItem } from '@/components/ui/faq-accordion';

export const metadata: Metadata = {
  title: 'FAQ | DevMultiplier Academy',
  description:
    'Frequently asked questions about DevMultiplier Academy courses, subscriptions, accounts, and learning experience.',
};

// General platform FAQ
const generalFAQs: FAQItem[] = [
  {
    question: 'What is DevMultiplier Academy?',
    answer:
      'DevMultiplier Academy is an online learning platform focused on helping experienced developers master modern architecture patterns and AI-assisted development practices. Our courses are designed for CTOs, senior developers, and independent consultants who need practical, production-ready knowledge.',
  },
  {
    question: 'Who are the courses designed for?',
    answer:
      "Our courses are designed for experienced developers (3+ years) who want to level up their architecture skills and learn to effectively leverage AI tools. Whether you're a CTO, tech lead, senior developer, or consultant, our content focuses on practical knowledge you can apply immediately.",
  },
  {
    question: 'What makes DevMultiplier Academy different from other platforms?',
    answer:
      "We focus exclusively on architecture patterns and AI-assisted development for experienced developers. Our courses aren't about learning to code—they're about learning to design systems that scale, optimize for performance, and leverage AI tools as force multipliers. Content is continuously updated as the AI landscape evolves.",
  },
];

// Account & Access FAQ
const accountFAQs: FAQItem[] = [
  {
    question: 'How do I create an account?',
    answer:
      'Click "Sign Up" in the top navigation and register with your email address, or sign in with GitHub, Google, Microsoft, or LinkedIn. After verifying your email, you\'ll have access to your dashboard.',
  },
  {
    question: 'Can I access courses on multiple devices?',
    answer:
      'Yes! Your account works on any device with a web browser. Your progress is synced automatically, so you can start a lesson on your laptop and continue on your tablet.',
  },
  {
    question: 'How do I reset my password?',
    answer:
      'Click "Forgot Password" on the login page and enter your email address. We\'ll send you a secure link to reset your password. The link expires after 1 hour for security.',
  },
  {
    question: 'Can I change my email address?',
    answer:
      "Yes, you can update your email address from your Profile settings. You'll need to verify the new email address before the change takes effect.",
  },
];

// Courses & Learning FAQ
const learningFAQs: FAQItem[] = [
  {
    question: 'How are courses structured?',
    answer:
      'Each course is divided into modules, and each module contains multiple lessons. Lessons include written content, code examples, diagrams, and exercises. You can track your progress and pick up where you left off.',
  },
  {
    question: 'Can I download course materials?',
    answer:
      'Course content is available online only to ensure you always have access to the latest updates. Code examples can be copied directly from the lessons.',
  },
  {
    question: 'How long do I have access to a course?',
    answer:
      'Once you purchase a course, you have lifetime access to that course content, including all future updates. Learn at your own pace without worrying about expiration.',
  },
  {
    question: 'Do courses include hands-on exercises?',
    answer:
      'Yes! Each lesson includes practical exercises and real-world examples. Many lessons also include code snippets you can use in your own projects.',
  },
  {
    question: 'Are there prerequisites for the courses?',
    answer:
      'Most courses assume 3+ years of professional development experience. Specific prerequisites are listed on each course page. Our content focuses on architecture and design patterns, not basic programming concepts.',
  },
];

// Billing & Payments FAQ
const billingFAQs: FAQItem[] = [
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. We also support Apple Pay and Google Pay where available.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with a course, contact us within 30 days of purchase for a full refund—no questions asked.",
  },
  {
    question: 'Are there any discounts available?',
    answer:
      'We occasionally offer promotional discounts. Sign up for our newsletter to be notified of special offers. We also offer team pricing for organizations purchasing multiple seats.',
  },
  {
    question: 'Do you offer team or enterprise pricing?',
    answer:
      'Yes! Contact us at support@devmultiplier.com for team pricing on 5+ seats. Enterprise plans include additional features like progress tracking dashboards and dedicated support.',
  },
];

// Technical & Support FAQ
const supportFAQs: FAQItem[] = [
  {
    question: 'What browsers are supported?',
    answer:
      'We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome or Firefox with JavaScript enabled.',
  },
  {
    question: 'How do I report a bug or issue?',
    answer:
      'You can report issues through our contact form or email support@devmultiplier.com. Please include details about your browser, device, and steps to reproduce the issue.',
  },
  {
    question: 'How can I contact support?',
    answer: 'Email us at support@devmultiplier.com. We aim to respond to all inquiries within 24-48 business hours.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white py-12 sm:py-16 dark:bg-[#0d1117]">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-[#1f2328] sm:text-5xl dark:text-[#e6edf3]">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-[#656d76] dark:text-[#848d97]">
            Find answers to common questions about DevMultiplier Academy. Can&apos;t find what you&apos;re looking for?{' '}
            <Link
              href="/contact"
              className="text-[#0969da] hover:underline dark:text-[#4493f8]"
            >
              Contact us
            </Link>
            .
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {/* General */}
          <section>
            <h2 className="mb-6 text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">General</h2>
            <FAQAccordion items={generalFAQs} />
          </section>

          {/* Account & Access */}
          <section>
            <h2 className="mb-6 text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Account & Access</h2>
            <FAQAccordion items={accountFAQs} />
          </section>

          {/* Courses & Learning */}
          <section>
            <h2 className="mb-6 text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Courses & Learning</h2>
            <FAQAccordion items={learningFAQs} />
          </section>

          {/* Billing & Payments */}
          <section>
            <h2 className="mb-6 text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Billing & Payments</h2>
            <FAQAccordion items={billingFAQs} />
          </section>

          {/* Technical & Support */}
          <section>
            <h2 className="mb-6 text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Technical & Support</h2>
            <FAQAccordion items={supportFAQs} />
          </section>
        </div>

        {/* Still have questions */}
        <div className="mt-16 rounded-lg border border-[#d1d9e0] bg-[#f6f8fa] p-8 text-center dark:border-[#30363d] dark:bg-[#161b22]">
          <h2 className="text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Still have questions?</h2>
          <p className="mt-2 text-[#656d76] dark:text-[#848d97]">
            We&apos;re here to help. Reach out to our support team.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-md bg-[#1f883d] px-6 py-2 font-medium text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
