'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';

const navigation = [
  { name: 'Courses', href: '/courses' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="border-light-gray sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
        >
          <Image
            src="/logo.svg"
            alt="DevMultiplier Academy"
            width={240}
            height={60}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-slate hover:text-navy text-sm font-medium transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <LanguageSelector />
          {status === 'authenticated' && session?.user ? (
            <ProfileDropdown user={session.user} />
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate hover:text-navy text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-navy hover:bg-blue rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          {mobileMenuOpen ? <X className="text-navy h-6 w-6" /> : <Menu className="text-navy h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-6 pb-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-slate hover:text-navy block py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <hr className="my-2 border-gray-200" />
            <div className="flex items-center justify-between py-2">
              <span className="text-slate text-base font-medium">Language</span>
              <LanguageSelector />
            </div>
            <hr className="my-2 border-gray-200" />
            {status === 'authenticated' && session?.user ? (
              <>
                <div className="py-2">
                  <p className="text-sm font-medium text-gray-900">{session.user.name || 'User'}</p>
                  <p className="truncate text-sm text-gray-500">{session.user.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="text-slate hover:text-navy block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ redirectTo: '/login' });
                  }}
                  className="text-slate hover:text-navy block w-full py-2 text-left text-base font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate hover:text-navy block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-navy hover:bg-blue mt-2 block rounded-lg px-4 py-2 text-center text-sm font-semibold text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
