import Link from "next/link";

const footerLinks = {
  courses: [
    { name: "DDD to CQRS with AI", href: "/courses/ddd-to-cqrs" },
    { name: "DDD to Database Schema", href: "/courses/ddd-to-database" },
    { name: "Database Optimization", href: "/courses/database-optimization" },
    { name: "Data-Driven REST APIs", href: "/courses/data-driven-api" },
    { name: "AI-Assisted UI Design", href: "/courses/ai-ui-design" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-light-gray bg-off-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-navy">D</span>
              <span className="text-xl font-light text-blue">×</span>
              <span className="ml-2 text-lg font-semibold text-navy">
                DevMultiplier
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate">
              Transform your development skills with expert-led courses designed
              for the AI age.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">
              Courses
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate transition-colors hover:text-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate transition-colors hover:text-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate transition-colors hover:text-navy"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-light-gray pt-8">
          <p className="text-center text-sm text-slate">
            © {new Date().getFullYear()} DevMultiplier Academy. A 3D HD Soft,
            LLC company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
