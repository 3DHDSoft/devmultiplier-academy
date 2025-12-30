"use client";

import { useState } from "react";
import { Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // TODO: Integrate with email service or form handler
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 text-lg text-slate">
              Have questions about our courses or need help choosing the right
              plan? We're here to help.
            </p>
          </div>

          {/* Contact options */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-light-gray p-6">
              <Mail className="h-8 w-8 text-blue" />
              <h3 className="mt-4 font-semibold text-navy">Email</h3>
              <p className="mt-2 text-sm text-slate">
                For general inquiries and support
              </p>
              <a
                href="mailto:hello@devmultiplier.com"
                className="mt-4 inline-block text-blue hover:underline"
              >
                hello@devmultiplier.com
              </a>
            </div>
            <div className="rounded-xl border border-light-gray p-6">
              <MessageSquare className="h-8 w-8 text-blue" />
              <h3 className="mt-4 font-semibold text-navy">Sales</h3>
              <p className="mt-2 text-sm text-slate">
                For team plans and enterprise inquiries
              </p>
              <a
                href="mailto:sales@devmultiplier.com"
                className="mt-4 inline-block text-blue hover:underline"
              >
                sales@devmultiplier.com
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-navy">Send a Message</h2>

            {status === "success" ? (
              <div className="mt-6 rounded-lg bg-green-50 p-6 text-green-800">
                Thanks for your message! We'll get back to you within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-navy"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-2 block w-full rounded-lg border border-light-gray px-4 py-2 text-navy focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-navy"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-2 block w-full rounded-lg border border-light-gray px-4 py-2 text-navy focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-navy"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="mt-2 block w-full rounded-lg border border-light-gray px-4 py-2 text-navy focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-navy"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="mt-2 block w-full rounded-lg border border-light-gray px-4 py-2 text-navy focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-lg bg-navy px-6 py-3 font-semibold text-white transition-colors hover:bg-blue disabled:opacity-50"
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
