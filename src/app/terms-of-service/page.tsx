import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | DevMultiplier Academy',
  description: 'Terms of Service for DevMultiplier Academy - Read our terms and conditions for using our educational platform and services.',
};

export default function TermsOfServicePage() {
  return (
    <main className="bg-gray-50 py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-navy mb-4 text-4xl font-bold">Terms of Service</h1>
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
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">1. Agreement to Terms</h2>
            <p className="mt-4">
              Welcome to DevMultiplier Academy, a division of 3D HD Soft, LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website{' '}
              <Link href="https://www.DevMultiplier.com" className="text-blue hover:underline">
                www.DevMultiplier.com
              </Link>{' '}
              (&quot;Website&quot;) and all related services, courses, content, and products (collectively, the &quot;Services&quot;).
            </p>
            <p className="mt-4">By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our Services.</p>
            <div className="border-blue bg-blue/5 my-6 rounded-lg border-l-4 p-4">
              <strong>Important:</strong> Please read these Terms carefully before using our Services. These Terms contain important information about your legal rights, remedies, and obligations.
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">2. Description of Services</h2>
            <p className="mt-4">DevMultiplier Academy provides online educational courses and resources focused on software development, including but not limited to:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Domain-Driven Design (DDD) and CQRS with AI</li>
              <li>DDD to Database Schema design</li>
              <li>AI-Assisted Database Optimization</li>
              <li>Data-Driven REST API Development</li>
              <li>AI-Assisted UI Design and Implementation</li>
            </ul>
            <p className="mt-4">Our Services are designed for professional developers, CTOs, and senior technical professionals seeking to enhance their skills in modern software development practices.</p>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">3. Account Registration</h2>

            <h3 className="text-navy mt-6 text-xl font-medium">3.1 Account Creation</h3>
            <p className="mt-2">To access certain features of our Services, you must create an account. When creating an account, you agree to:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">3.2 Account Requirements</h3>
            <p className="mt-2">You must be at least 18 years old to create an account. By creating an account, you represent that you are at least 18 years of age and have the legal capacity to enter into these Terms.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">3.3 Account Termination</h3>
            <p className="mt-2">We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion.</p>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">4. Course Enrollment and Access</h2>

            <h3 className="text-navy mt-6 text-xl font-medium">4.1 Course Purchases</h3>
            <p className="mt-2">When you purchase a course or subscription, you receive a limited, non-exclusive, non-transferable license to access and view the course content for your personal, non-commercial use.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">4.2 Lifetime Access</h3>
            <p className="mt-2">Individual course purchases include lifetime access to the purchased content, subject to the continued operation of our platform. &quot;Lifetime&quot; refers to the lifetime of the course on our platform.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">4.3 Subscription Plans</h3>
            <p className="mt-2">Subscription plans provide access to specified content for the duration of your subscription. Access terminates when your subscription ends unless you renew.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">4.4 Team Licenses</h3>
            <p className="mt-2">Team licenses are for the specified number of seats only. Each team member must have their own account. Sharing of login credentials is prohibited.</p>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">5. Payment Terms</h2>

            <h3 className="text-navy mt-6 text-xl font-medium">5.1 Pricing</h3>
            <p className="mt-2">All prices are displayed in US dollars unless otherwise specified. We reserve the right to change prices at any time without notice, though price changes will not affect existing purchases.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">5.2 Payment Processing</h3>
            <p className="mt-2">Payments are processed through secure third-party payment processors. By making a purchase, you agree to their terms of service.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">5.3 Taxes</h3>
            <p className="mt-2">Prices may not include applicable taxes. You are responsible for paying all taxes associated with your purchases.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">5.4 Subscription Billing</h3>
            <p className="mt-2">Subscriptions are billed automatically at the beginning of each billing period. You authorize us to charge your payment method for recurring fees until you cancel.</p>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">6. Refund Policy</h2>

            <h3 className="text-navy mt-6 text-xl font-medium">6.1 Individual Courses</h3>
            <p className="mt-2">We offer a 30-day money-back guarantee for individual course purchases. If you are not satisfied with a course, you may request a full refund within 30 days of purchase.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">6.2 Bundles</h3>
            <p className="mt-2">Course bundles are eligible for a full refund within 30 days of purchase, provided you have not completed more than 25% of the total bundle content.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">6.3 Subscriptions</h3>
            <p className="mt-2">Subscription payments are non-refundable. You may cancel your subscription at any time, and access will continue until the end of your current billing period.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">6.4 Refund Process</h3>
            <p className="mt-2">
              To request a refund, contact us at{' '}
              <Link href="mailto:support@devmultiplier.com" className="text-blue hover:underline">
                support@devmultiplier.com
              </Link>
              . Refunds are processed within 5-10 business days.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">7. Intellectual Property Rights</h2>

            <h3 className="text-navy mt-6 text-xl font-medium">7.1 Our Content</h3>
            <p className="mt-2">All course content, materials, text, graphics, videos, code examples, and other materials on our Services are owned by or licensed to DevMultiplier Academy and are protected by copyright, trademark, and other intellectual property laws.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">7.2 License Grant</h3>
            <p className="mt-2">Upon purchase, we grant you a limited, non-exclusive, non-transferable license to access and use the course content for personal educational purposes only.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">7.3 Restrictions</h3>
            <p className="mt-2">You may not:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Copy, reproduce, or distribute course content</li>
              <li>Share your account credentials with others</li>
              <li>Use content for commercial purposes without permission</li>
              <li>Create derivative works from our content</li>
              <li>Remove any copyright or proprietary notices</li>
              <li>Record, screenshot, or capture course videos</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">7.4 Code Examples</h3>
            <p className="mt-2">Code examples provided in courses may be used in your personal and commercial projects, subject to any specific license terms indicated in the course materials.</p>
          </section>

          {/* Section 8 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">8. User Conduct</h2>
            <p className="mt-4">You agree not to:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Use our Services for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of our Services</li>
              <li>Upload malicious code or content</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Impersonate any person or entity</li>
              <li>Use automated systems to access our Services</li>
              <li>Resell or redistribute our content</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">9. Third-Party Services and AI Tools</h2>

            <h3 className="text-navy mt-6 text-xl font-medium">9.1 Third-Party Integrations</h3>
            <p className="mt-2">Our courses may reference or integrate with third-party tools and services, including:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>GitHub and version control systems</li>
              <li>AI coding assistants (GitHub Copilot, Claude, etc.)</li>
              <li>Database systems and cloud services</li>
              <li>Development frameworks and libraries</li>
            </ul>

            <h3 className="text-navy mt-6 text-xl font-medium">9.2 Third-Party Terms</h3>
            <p className="mt-2">Your use of third-party services is governed by their respective terms of service and privacy policies. We are not responsible for third-party services.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">9.3 AI-Generated Content</h3>
            <p className="mt-2">Some course materials may include examples of AI-generated content. You are responsible for verifying and validating any AI-generated code or content before use in production systems.</p>
          </section>

          {/* Section 10 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">10. Disclaimer of Warranties</h2>
            <p className="mt-4">OUR SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>IMPLIED WARRANTIES OF MERCHANTABILITY</li>
              <li>FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>NON-INFRINGEMENT</li>
              <li>ACCURACY OR COMPLETENESS OF CONTENT</li>
            </ul>
            <p className="mt-4">We do not warrant that:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Our Services will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>Our Services are free of viruses or harmful components</li>
              <li>The results obtained from using our Services will be accurate or reliable</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">11. Limitation of Liability</h2>
            <p className="mt-4">TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEVMULTIPLIER ACADEMY AND 3D HD SOFT, LLC SHALL NOT BE LIABLE FOR:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>ANY LOSS OF PROFITS, DATA, USE, OR GOODWILL</li>
              <li>ANY DAMAGES RESULTING FROM YOUR USE OF OUR SERVICES</li>
              <li>ANY DAMAGES EXCEEDING THE AMOUNT PAID BY YOU FOR THE SERVICES</li>
            </ul>
            <p className="mt-4">Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above limitations may not apply to you.</p>
          </section>

          {/* Section 12 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">12. Indemnification</h2>
            <p className="mt-4">You agree to indemnify, defend, and hold harmless DevMultiplier Academy, 3D HD Soft, LLC, and their officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or related to:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Your use of our Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Any content you submit or share through our Services</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">13. Governing Law and Dispute Resolution</h2>

            <h3 className="text-navy mt-6 text-xl font-medium">13.1 Governing Law</h3>
            <p className="mt-2">These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">13.2 Dispute Resolution</h3>
            <p className="mt-2">Any dispute arising from these Terms shall first be attempted to be resolved through informal negotiation. If unsuccessful, disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">13.3 Class Action Waiver</h3>
            <p className="mt-2">You agree to resolve any disputes on an individual basis and waive any right to participate in a class action lawsuit or class-wide arbitration.</p>
          </section>

          {/* Section 14 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">14. Changes to Terms</h2>
            <p className="mt-4">We reserve the right to modify these Terms at any time. We will notify you of any material changes by:</p>
            <ul className="mt-2 list-disc pl-6">
              <li>Posting the updated Terms on our website</li>
              <li>Updating the &quot;Last Updated&quot; date</li>
              <li>Sending you an email notification</li>
            </ul>
            <p className="mt-4">Your continued use of our Services after such changes constitutes acceptance of the new Terms.</p>
          </section>

          {/* Section 15 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">15. General Provisions</h2>

            <h3 className="text-navy mt-6 text-xl font-medium">15.1 Entire Agreement</h3>
            <p className="mt-2">These Terms, together with our Privacy Policy, constitute the entire agreement between you and DevMultiplier Academy regarding our Services.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">15.2 Severability</h3>
            <p className="mt-2">If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">15.3 Waiver</h3>
            <p className="mt-2">Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">15.4 Assignment</h3>
            <p className="mt-2">You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.</p>

            <h3 className="text-navy mt-6 text-xl font-medium">15.5 Force Majeure</h3>
            <p className="mt-2">We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control.</p>
          </section>

          {/* Section 16 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">16. Contact Information</h2>
            <p className="mt-4">If you have any questions about these Terms, please contact us:</p>

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
                <Link href="mailto:legal@devmultiplier.com" className="text-blue hover:underline">
                  legal@devmultiplier.com
                </Link>
              </p>
              <p className="mb-4">
                <strong>Support:</strong>{' '}
                <Link href="mailto:support@devmultiplier.com" className="text-blue hover:underline">
                  support@devmultiplier.com
                </Link>
              </p>
            </div>
          </section>

          {/* Section 17 */}
          <section className="mb-10">
            <h2 className="text-navy border-b-2 border-gray-200 pb-2 text-2xl font-semibold">17. Acknowledgment</h2>
            <p className="mt-4">By using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, you must not use our Services.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
