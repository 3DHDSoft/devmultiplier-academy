import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DevMultiplier Academy',
  description: 'Privacy Policy for DevMultiplier Academy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-gray-50 py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-navy mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-slate text-lg">DevMultiplier Academy</p>
          <p className="text-slate text-sm">A division of 3D HD Soft, LLC</p>
        </div>

        {/* Last Updated */}
        <div className="mb-8 rounded-lg bg-gray-100 p-4">
          <p className="text-slate">
            <strong>Last Updated:</strong> December 30, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">
          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">1. Introduction</h2>
            <p className="mt-4">
              Welcome to DevMultiplier Academy, a division of 3D HD Soft, LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website{' '}
              <Link href="https://www.DevMultiplier.com" className="text-blue hover:underline">
                www.DevMultiplier.com
              </Link>{' '}
              and use our educational services.
            </p>
            <div className="border-blue bg-blue/5 my-6 rounded-lg border-l-4 p-4">
              <strong>Our Mission:</strong> Empowering developers to become 10x-100x more productive in the age of AI through comprehensive courses covering Domain-Driven Design, CQRS, database optimization, REST API development, and AI-assisted UI design.
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">2. Information We Collect</h2>

            <h3 className="text-navy mt-6 text-xl font-medium">2.1 Personal Information</h3>
            <p className="mt-2">We may collect personal information that you voluntarily provide to us when you:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Register for an account</li>
              <li>Enroll in our courses</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us for support</li>
              <li>Participate in forums or community discussions</li>
            </ul>
            <p className="mt-4">This information may include:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Professional information (job title, company, experience level)</li>
              <li>Payment and billing information</li>
              <li>Course progress and completion data</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">2.2 Automatically Collected Information</h3>
            <p className="mt-2">When you access our website and platform, we automatically collect certain information, including:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, navigation patterns)</li>
              <li>Course interaction data (videos watched, exercises completed, quiz results)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Log files and analytics data</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">2.3 AI and Learning Analytics</h3>
            <p className="mt-2">To enhance your learning experience and provide personalized recommendations, we collect:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Learning progress and performance metrics</li>
              <li>Code submissions and project work</li>
              <li>Interaction with AI-assisted features</li>
              <li>Feedback and assessment results</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">3. How We Use Your Information</h2>
            <p className="mt-4">We use the collected information for the following purposes:</p>

            <h3 className="text-navy mt-6 text-xl font-medium">3.1 Service Delivery</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Provide access to courses and educational content</li>
              <li>Process course enrollments and payments</li>
              <li>Track your learning progress and issue certificates</li>
              <li>Deliver personalized learning recommendations</li>
              <li>Provide technical support and customer service</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">3.2 Platform Improvement</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Analyze usage patterns to improve course content</li>
              <li>Enhance AI-assisted learning features</li>
              <li>Develop new courses and educational materials</li>
              <li>Optimize platform performance and user experience</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">3.3 Communication</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Send course updates and announcements</li>
              <li>Notify you about new courses and features</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send administrative information and policy updates</li>
              <li>Deliver marketing communications (with your consent)</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">3.4 Legal and Security</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Comply with legal obligations and regulations</li>
              <li>Protect against fraud and unauthorized access</li>
              <li>Enforce our terms of service and policies</li>
              <li>Resolve disputes and troubleshoot problems</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">4. AI and Third-Party Services</h2>
            <p className="mt-4">Our courses and platform integrate with various AI technologies and third-party services to enhance your learning experience:</p>

            <h3 className="text-navy mt-6 text-xl font-medium">4.1 AI Technologies</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>GitHub Copilot for code assistance</li>
              <li>Claude AI for educational support</li>
              <li>Other AI-powered development tools</li>
            </ul>
            <p className="mt-2">When you interact with these AI features, your code submissions and queries may be processed by these third-party AI services in accordance with their respective privacy policies.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">4.2 Educational Platforms</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Learning Management System (LMS) providers</li>
              <li>Video hosting and streaming services</li>
              <li>Code repository and version control systems</li>
              <li>Assessment and quiz platforms</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">4.3 Analytics and Marketing</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Google Analytics for website analytics</li>
              <li>Marketing automation tools</li>
              <li>Email service providers</li>
              <li>Payment processors (Stripe, PayPal, etc.)</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">5. Data Sharing and Disclosure</h2>
            <p className="mt-4">We may share your information in the following circumstances:</p>

            <h3 className="text-navy mt-6 text-xl font-medium">5.1 Service Providers</h3>
            <p className="mt-2">We share data with trusted third-party service providers who assist us in operating our platform, processing payments, hosting content, and providing customer support. These providers are contractually obligated to protect your information.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">5.2 Business Transfers</h3>
            <p className="mt-2">If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">5.3 Legal Requirements</h3>
            <p className="mt-2">We may disclose your information when required by law or to:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Comply with legal processes or government requests</li>
              <li>Enforce our terms and conditions</li>
              <li>Protect our rights, property, or safety</li>
              <li>Prevent fraud or security threats</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">5.4 With Your Consent</h3>
            <p className="mt-2">We may share your information for any other purpose with your explicit consent.</p>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">6. Data Security</h2>
            <p className="mt-4">We implement industry-standard security measures to protect your information:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Encryption of data in transit (SSL/TLS) and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Employee training on data protection practices</li>
              <li>Incident response and breach notification procedures</li>
            </ul>
            <p className="mt-4">However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">7. Your Privacy Rights</h2>
            <p className="mt-4">Depending on your location, you may have the following rights regarding your personal information:</p>

            <h3 className="text-navy mt-6 text-xl font-medium">7.1 Access and Portability</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Request a copy of your personal information</li>
              <li>Receive your data in a portable format</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">7.2 Correction and Update</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Correct inaccurate or incomplete information</li>
              <li>Update your profile and preferences</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">7.3 Deletion</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Request deletion of your personal information</li>
              <li>Close your account and remove associated data</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">7.4 Opt-Out</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Unsubscribe from marketing communications</li>
              <li>Disable cookies and tracking (with limitations)</li>
              <li>Opt out of data processing for certain purposes</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">7.5 Object and Restrict</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>Object to processing of your information</li>
              <li>Restrict how we use your data</li>
            </ul>

            <p className="mt-4">To exercise these rights, please contact us using the information provided below.</p>
          </section>

          {/* Section 8 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">8. Cookies and Tracking Technologies</h2>
            <p className="mt-4">We use cookies and similar tracking technologies to enhance your experience:</p>

            <h3 className="text-navy mt-6 text-xl font-medium">8.1 Types of Cookies</h3>
            <ul className="mt-2 list-disc pl-6">
              <li>
                <strong>Essential Cookies:</strong> Required for platform functionality
              </li>
              <li>
                <strong>Performance Cookies:</strong> Analyze usage and improve performance
              </li>
              <li>
                <strong>Functional Cookies:</strong> Remember your preferences
              </li>
              <li>
                <strong>Marketing Cookies:</strong> Deliver relevant advertisements
              </li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">8.2 Managing Cookies</h3>
            <p className="mt-2">You can control cookies through your browser settings. Note that disabling cookies may affect platform functionality. Most browsers allow you to:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>View and delete cookies</li>
              <li>Block third-party cookies</li>
              <li>Clear cookies when you close your browser</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">9. Children&apos;s Privacy</h2>
            <p className="mt-4">Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately, and we will take steps to delete such information.</p>
          </section>

          {/* Section 10 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">10. International Data Transfers</h2>
            <p className="mt-4">Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. When we transfer your data internationally, we ensure appropriate safeguards are in place, such as:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Standard contractual clauses</li>
              <li>Privacy Shield frameworks (where applicable)</li>
              <li>Adequacy decisions by regulatory authorities</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">11. Data Retention</h2>
            <p className="mt-4">We retain your personal information for as long as necessary to:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Provide our services and support your learning</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain business records and analytics</li>
            </ul>
            <p className="mt-4">After you close your account or upon your request, we will delete or anonymize your information within a reasonable timeframe, except where retention is required by law.</p>
          </section>

          {/* Section 12 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">12. Third-Party Links</h2>
            <p className="mt-4">Our website and courses may contain links to third-party websites, plugins, and applications. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.</p>
          </section>

          {/* Section 13 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">13. California Privacy Rights (CCPA)</h2>
            <p className="mt-4">If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to deletion of personal information</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>
            <p className="mt-4">
              <strong>Note:</strong> We do not sell your personal information.
            </p>
          </section>

          {/* Section 14 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">14. European Privacy Rights (GDPR)</h2>
            <p className="mt-4">If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Rights related to automated decision-making</li>
            </ul>
            <p className="mt-4">Our legal basis for processing includes consent, contract performance, legal obligations, and legitimate interests.</p>
          </section>

          {/* Section 15 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">15. Changes to This Privacy Policy</h2>
            <p className="mt-4">We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Posting the updated policy on our website</li>
              <li>Updating the &quot;Last Updated&quot; date</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
            <p className="mt-4">Your continued use of our services after the effective date constitutes acceptance of the updated Privacy Policy.</p>
          </section>

          {/* Section 16 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">16. Contact Us</h2>
            <p className="mt-4">If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>

            <div className="mt-6 rounded-lg bg-gray-100 p-6">
              <h3 className="text-navy mb-2 text-xl font-semibold">DevMultiplier Academy</h3>
              <p className="text-slate mb-4 text-sm">A division of 3D HD Soft, LLC</p>
              <p className="mb-2">
                <strong>Website:</strong>{' '}
                <Link href="https://www.DevMultiplier.com" className="text-blue hover:underline">
                  www.DevMultiplier.com
                </Link>
              </p>
              <p className="mb-2">
                <strong>Email:</strong>{' '}
                <Link href="mailto:privacy@devmultiplier.com" className="text-blue hover:underline">
                  privacy@devmultiplier.com
                </Link>
              </p>
              <p className="mb-4">
                <strong>Support:</strong>{' '}
                <Link href="mailto:support@devmultiplier.com" className="text-blue hover:underline">
                  support@devmultiplier.com
                </Link>
              </p>
              <p className="text-slate text-sm">We will respond to your inquiry within 30 days of receipt.</p>
            </div>
          </section>

          {/* Section 17 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">17. Acknowledgment</h2>
            <p className="mt-4">By using our website and services, you acknowledge that you have read, understood, and agree to this Privacy Policy. If you do not agree with this policy, please do not use our services.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
