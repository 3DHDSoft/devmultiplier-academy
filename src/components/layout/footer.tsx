import Link from 'next/link';

const footerLinks = {
  courses: [
    { name: 'DDD to CQRS with AI', href: '/courses/ddd-to-cqrs' },
    { name: 'DDD to Database Schema', href: '/courses/ddd-to-database' },
    { name: 'Database Optimization', href: '/courses/database-optimization' },
    { name: 'Data-Driven REST APIs', href: '/courses/data-driven-api' },
    { name: 'AI-Assisted UI Design', href: '/courses/ai-ui-design' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-light-gray bg-off-white border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="flex items-center"
            >
              <span className="text-navy text-xl font-bold">D</span>
              <span className="text-blue text-xl font-light">×</span>
              <span className="text-navy ml-2 text-lg font-semibold">DevMultiplier</span>
            </Link>
            <p className="text-slate mt-4 text-sm">
              Transform your development skills with expert-led courses designed for the AI age.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-navy text-sm font-semibold tracking-wider uppercase">Courses</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate hover:text-navy text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-navy text-sm font-semibold tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate hover:text-navy text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-navy text-sm font-semibold tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate hover:text-navy text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-light-gray mt-12 border-t pt-8">
          <p className="text-slate text-center text-sm">
            © {new Date().getFullYear()} DevMultiplier Academy. A 3D HD Soft, LLC company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
