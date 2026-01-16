'use client';

import { useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';

interface FieldErrors {
  name?: string[];
  email?: string[];
  subject?: string[];
  message?: string[];
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFieldErrors({});
    setGeneralError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.details) {
          setFieldErrors(data.details);
        } else {
          setGeneralError(data.error || 'Failed to send message');
        }
        setStatus('error');
        return;
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setGeneralError('Failed to send message. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-navy text-4xl font-bold tracking-tight sm:text-5xl">Contact Us</h1>
            <p className="text-slate mt-4 text-lg">Have questions about our courses or need help choosing the right plan? {"We're"} here to help.</p>
          </div>

          {/* Contact options */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="border-light-gray rounded-xl border p-6">
              <Mail className="text-blue h-8 w-8" />
              <h3 className="text-navy mt-4 font-semibold">Email</h3>
              <p className="text-slate mt-2 text-sm">For general inquiries and support</p>
              <a href="mailto:hello@devmultiplier.com" className="text-blue mt-4 inline-block hover:underline">
                hello@devmultiplier.com
              </a>
            </div>
            <div className="border-light-gray rounded-xl border p-6">
              <MessageSquare className="text-blue h-8 w-8" />
              <h3 className="text-navy mt-4 font-semibold">Sales</h3>
              <p className="text-slate mt-2 text-sm">For team plans and enterprise inquiries</p>
              <a href="mailto:sales@devmultiplier.com" className="text-blue mt-4 inline-block hover:underline">
                sales@devmultiplier.com
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div className="mt-12">
            <h2 className="text-navy text-xl font-semibold">Send a Message</h2>

            {status === 'success' ? (
              <div className="mt-6 rounded-lg bg-green-50 p-6 text-green-800">Thanks for your message! {"We'll"} get back to you within 24 hours.</div>
            ) : (
              <>
                {generalError && <div className="mt-6 rounded-lg bg-red-50 p-6 text-red-800">{generalError}</div>}
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="text-navy block text-sm font-medium">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                        className={`mt-2 block w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none ${fieldErrors.name ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-light-gray text-navy focus:border-blue focus:ring-blue'}`}
                      />
                      {fieldErrors.name && (
                        <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
                          {fieldErrors.name[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="text-navy block text-sm font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                        className={`mt-2 block w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none ${fieldErrors.email ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-light-gray text-navy focus:border-blue focus:ring-blue'}`}
                      />
                      {fieldErrors.email && (
                        <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
                          {fieldErrors.email[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="text-navy block text-sm font-medium">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      aria-invalid={!!fieldErrors.subject}
                      aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
                      className={`mt-2 block w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none ${fieldErrors.subject ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-light-gray text-navy focus:border-blue focus:ring-blue'}`}
                    />
                    {fieldErrors.subject && (
                      <p id="subject-error" role="alert" className="mt-1 text-sm text-red-600">
                        {fieldErrors.subject[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="text-navy block text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      aria-invalid={!!fieldErrors.message}
                      aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                      className={`mt-2 block w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none ${fieldErrors.message ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-light-gray text-navy focus:border-blue focus:ring-blue'}`}
                    />
                    {fieldErrors.message && (
                      <p id="message-error" role="alert" className="mt-1 text-sm text-red-600">
                        {fieldErrors.message[0]}
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={status === 'loading'} className="bg-navy hover:bg-blue w-full rounded-lg px-6 py-3 font-semibold text-white transition-colors disabled:opacity-50">
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
