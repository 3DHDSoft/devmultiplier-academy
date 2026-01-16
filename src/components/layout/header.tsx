'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { LanguageSelector } from '@/components/ui/language-selector';
import { AppearanceSelector } from '@/components/ui/appearance-selector';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { useUserAvatar } from '@/contexts/UserAvatarContext';

const navigation = [
  { name: 'Courses', href: '/courses' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { userName: contextUserName } = useUserAvatar();

  // Get display name - prioritize context (for real-time updates), then session
  const displayName = contextUserName || session?.user?.name;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d1d9e0] bg-white dark:border-[#30363d] dark:bg-[#161b22]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">D</span>
          <span className="text-xl font-light text-[#0969da] dark:text-[#4493f8]">×</span>
          <span className="ml-2 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">DevMultiplier</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-x-8">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="text-sm font-medium text-[#656d76] transition-colors hover:text-[#1f2328] dark:text-[#848d97] dark:hover:text-[#e6edf3]">
              {item.name}
            </Link>
          ))}
          <LanguageSelector />
          <AppearanceSelector />
          {status === 'authenticated' && session?.user ? (
            <ProfileDropdown user={session.user} />
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-[#656d76] transition-colors hover:text-[#1f2328] dark:text-[#848d97] dark:hover:text-[#e6edf3]">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-[#1f883d] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button type="button" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className="sr-only">Toggle menu</span>
          {mobileMenuOpen ? <X className="h-6 w-6 text-[#1f2328] dark:text-[#e6edf3]" /> : <Menu className="h-6 w-6 text-[#1f2328] dark:text-[#e6edf3]" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="bg-white md:hidden dark:bg-[#161b22]">
          <div className="space-y-1 px-6 pb-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="block py-2 text-base font-medium text-[#656d76] hover:text-[#1f2328] dark:text-[#848d97] dark:hover:text-[#e6edf3]" onClick={() => setMobileMenuOpen(false)}>
                {item.name}
              </Link>
            ))}
            <hr className="my-2 border-[#d1d9e0] dark:border-[#30363d]" />
            <div className="flex items-center justify-between py-2">
              <span className="text-base font-medium text-[#656d76] dark:text-[#848d97]">Language</span>
              <LanguageSelector />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-base font-medium text-[#656d76] dark:text-[#848d97]">Appearance</span>
              <AppearanceSelector />
            </div>
            <hr className="my-2 border-[#d1d9e0] dark:border-[#30363d]" />
            {status === 'authenticated' && session?.user ? (
              <>
                <div className="py-2">
                  <p className="text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">{displayName || 'User'}</p>
                  <p className="truncate text-sm text-[#656d76] dark:text-[#848d97]">{session.user.email}</p>
                </div>
                <Link href="/profile" className="block py-2 text-base font-medium text-[#656d76] hover:text-[#1f2328] dark:text-[#848d97] dark:hover:text-[#e6edf3]" onClick={() => setMobileMenuOpen(false)}>
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ redirectTo: '/login' });
                  }}
                  className="block w-full py-2 text-left text-base font-medium text-[#656d76] hover:text-[#1f2328] dark:text-[#848d97] dark:hover:text-[#e6edf3]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-base font-medium text-[#656d76] hover:text-[#1f2328] dark:text-[#848d97] dark:hover:text-[#e6edf3]" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="mt-2 block rounded-md bg-[#1f883d] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043]" onClick={() => setMobileMenuOpen(false)}>
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
