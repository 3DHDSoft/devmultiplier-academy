'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { LanguageSelector } from '@/components/ui/language-selector';
import { AppearanceSelector } from '@/components/ui/appearance-selector';
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
    <header className="border-[#d1d9e0] dark:border-[#30363d] sticky top-0 z-50 w-full border-b bg-white dark:bg-[#161b22]">
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
            className="h-10 w-auto dark:brightness-0 dark:invert"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[#656d76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] text-sm font-medium transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <LanguageSelector />
          <AppearanceSelector />
          {status === 'authenticated' && session?.user ? (
            <ProfileDropdown user={session.user} />
          ) : (
            <>
              <Link
                href="/login"
                className="text-[#656d76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[#1f883d] dark:bg-[#238636] hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
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
          {mobileMenuOpen ? <X className="text-[#1f2328] dark:text-[#e6edf3] h-6 w-6" /> : <Menu className="text-[#1f2328] dark:text-[#e6edf3] h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#161b22]">
          <div className="space-y-1 px-6 pb-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[#656d76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] block py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <hr className="my-2 border-[#d1d9e0] dark:border-[#30363d]" />
            <div className="flex items-center justify-between py-2">
              <span className="text-[#656d76] dark:text-[#848d97] text-base font-medium">Language</span>
              <LanguageSelector />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#656d76] dark:text-[#848d97] text-base font-medium">Appearance</span>
              <AppearanceSelector />
            </div>
            <hr className="my-2 border-[#d1d9e0] dark:border-[#30363d]" />
            {status === 'authenticated' && session?.user ? (
              <>
                <div className="py-2">
                  <p className="text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">{session.user.name || 'User'}</p>
                  <p className="truncate text-sm text-[#656d76] dark:text-[#848d97]">{session.user.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="text-[#656d76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ redirectTo: '/login' });
                  }}
                  className="text-[#656d76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] block w-full py-2 text-left text-base font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#656d76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#1f883d] dark:bg-[#238636] hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] mt-2 block rounded-md px-4 py-2 text-center text-sm font-medium text-white"
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
