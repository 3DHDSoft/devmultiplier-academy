'use client';

import { useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // TODO: Integrate with email service or form handler
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-navy text-4xl font-bold tracking-tight sm:text-5xl">Contact Us</h1>
            <p className="text-slate mt-4 text-lg">
              Have questions about our courses or need help choosing the right plan? {"We're"} here to help.
            </p>
          </div>

          {/* Contact options */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="border-light-gray rounded-xl border p-6">
              <Mail className="text-blue h-8 w-8" />
              <h3 className="text-navy mt-4 font-semibold">Email</h3>
              <p className="text-slate mt-2 text-sm">For general inquiries and support</p>
              <a
                href="mailto:hello@devmultiplier.com"
                className="text-blue mt-4 inline-block hover:underline"
              >
                hello@devmultiplier.com
              </a>
            </div>
            <div className="border-light-gray rounded-xl border p-6">
              <MessageSquare className="text-blue h-8 w-8" />
              <h3 className="text-navy mt-4 font-semibold">Sales</h3>
              <p className="text-slate mt-2 text-sm">For team plans and enterprise inquiries</p>
              <a
                href="mailto:sales@devmultiplier.com"
                className="text-blue mt-4 inline-block hover:underline"
              >
                sales@devmultiplier.com
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div className="mt-12">
            <h2 className="text-navy text-xl font-semibold">Send a Message</h2>

            {status === 'success' ? (
              <div className="mt-6 rounded-lg bg-green-50 p-6 text-green-800">
                Thanks for your message! {"We'll"} get back to you within 24 hours.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="text-navy block text-sm font-medium"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-light-gray text-navy focus:border-blue focus:ring-blue mt-2 block w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="text-navy block text-sm font-medium"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-light-gray text-navy focus:border-blue focus:ring-blue mt-2 block w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="text-navy block text-sm font-medium"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="border-light-gray text-navy focus:border-blue focus:ring-blue mt-2 block w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="text-navy block text-sm font-medium"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="border-light-gray text-navy focus:border-blue focus:ring-blue mt-2 block w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-navy hover:bg-blue w-full rounded-lg px-6 py-3 font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
