'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import { useUserAvatar } from '@/contexts/UserAvatarContext';

interface ProfileDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Simple MD5 implementation for Gravatar
function md5(str: string): string {
  function rotateLeft(n: number, s: number): number {
    return (n << s) | (n >>> (32 - s));
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, q), addUnsigned(x, t)), s), b);
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function convertToWordArray(str: string): number[] {
    const wordArray: number[] = [];
    const strLen = str.length;
    for (let i = 0; i < strLen; i++) {
      wordArray[i >> 2] |= (str.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    }
    return wordArray;
  }

  function wordToHex(n: number): string {
    let hex = '';
    for (let i = 0; i < 4; i++) {
      hex += ((n >> (i * 8 + 4)) & 0xf).toString(16) + ((n >> (i * 8)) & 0xf).toString(16);
    }
    return hex;
  }

  const x = convertToWordArray(str);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  x[str.length >> 2] |= 0x80 << ((str.length % 4) * 8);
  x[(((str.length + 8) >> 6) << 4) + 14] = str.length * 8;

  for (let i = 0; i < x.length; i += 16) {
    const oldA = a,
      oldB = b,
      oldC = c,
      oldD = d;

    a = md5ff(a, b, c, d, x[i + 0], 7, 0xd76aa478);
    d = md5ff(d, a, b, c, x[i + 1], 12, 0xe8c7b756);
    c = md5ff(c, d, a, b, x[i + 2], 17, 0x242070db);
    b = md5ff(b, c, d, a, x[i + 3], 22, 0xc1bdceee);
    a = md5ff(a, b, c, d, x[i + 4], 7, 0xf57c0faf);
    d = md5ff(d, a, b, c, x[i + 5], 12, 0x4787c62a);
    c = md5ff(c, d, a, b, x[i + 6], 17, 0xa8304613);
    b = md5ff(b, c, d, a, x[i + 7], 22, 0xfd469501);
    a = md5ff(a, b, c, d, x[i + 8], 7, 0x698098d8);
    d = md5ff(d, a, b, c, x[i + 9], 12, 0x8b44f7af);
    c = md5ff(c, d, a, b, x[i + 10], 17, 0xffff5bb1);
    b = md5ff(b, c, d, a, x[i + 11], 22, 0x895cd7be);
    a = md5ff(a, b, c, d, x[i + 12], 7, 0x6b901122);
    d = md5ff(d, a, b, c, x[i + 13], 12, 0xfd987193);
    c = md5ff(c, d, a, b, x[i + 14], 17, 0xa679438e);
    b = md5ff(b, c, d, a, x[i + 15], 22, 0x49b40821);

    a = md5gg(a, b, c, d, x[i + 1], 5, 0xf61e2562);
    d = md5gg(d, a, b, c, x[i + 6], 9, 0xc040b340);
    c = md5gg(c, d, a, b, x[i + 11], 14, 0x265e5a51);
    b = md5gg(b, c, d, a, x[i + 0], 20, 0xe9b6c7aa);
    a = md5gg(a, b, c, d, x[i + 5], 5, 0xd62f105d);
    d = md5gg(d, a, b, c, x[i + 10], 9, 0x02441453);
    c = md5gg(c, d, a, b, x[i + 15], 14, 0xd8a1e681);
    b = md5gg(b, c, d, a, x[i + 4], 20, 0xe7d3fbc8);
    a = md5gg(a, b, c, d, x[i + 9], 5, 0x21e1cde6);
    d = md5gg(d, a, b, c, x[i + 14], 9, 0xc33707d6);
    c = md5gg(c, d, a, b, x[i + 3], 14, 0xf4d50d87);
    b = md5gg(b, c, d, a, x[i + 8], 20, 0x455a14ed);
    a = md5gg(a, b, c, d, x[i + 13], 5, 0xa9e3e905);
    d = md5gg(d, a, b, c, x[i + 2], 9, 0xfcefa3f8);
    c = md5gg(c, d, a, b, x[i + 7], 14, 0x676f02d9);
    b = md5gg(b, c, d, a, x[i + 12], 20, 0x8d2a4c8a);

    a = md5hh(a, b, c, d, x[i + 5], 4, 0xfffa3942);
    d = md5hh(d, a, b, c, x[i + 8], 11, 0x8771f681);
    c = md5hh(c, d, a, b, x[i + 11], 16, 0x6d9d6122);
    b = md5hh(b, c, d, a, x[i + 14], 23, 0xfde5380c);
    a = md5hh(a, b, c, d, x[i + 1], 4, 0xa4beea44);
    d = md5hh(d, a, b, c, x[i + 4], 11, 0x4bdecfa9);
    c = md5hh(c, d, a, b, x[i + 7], 16, 0xf6bb4b60);
    b = md5hh(b, c, d, a, x[i + 10], 23, 0xbebfbc70);
    a = md5hh(a, b, c, d, x[i + 13], 4, 0x289b7ec6);
    d = md5hh(d, a, b, c, x[i + 0], 11, 0xeaa127fa);
    c = md5hh(c, d, a, b, x[i + 3], 16, 0xd4ef3085);
    b = md5hh(b, c, d, a, x[i + 6], 23, 0x04881d05);
    a = md5hh(a, b, c, d, x[i + 9], 4, 0xd9d4d039);
    d = md5hh(d, a, b, c, x[i + 12], 11, 0xe6db99e5);
    c = md5hh(c, d, a, b, x[i + 15], 16, 0x1fa27cf8);
    b = md5hh(b, c, d, a, x[i + 2], 23, 0xc4ac5665);

    a = md5ii(a, b, c, d, x[i + 0], 6, 0xf4292244);
    d = md5ii(d, a, b, c, x[i + 7], 10, 0x432aff97);
    c = md5ii(c, d, a, b, x[i + 14], 15, 0xab9423a7);
    b = md5ii(b, c, d, a, x[i + 5], 21, 0xfc93a039);
    a = md5ii(a, b, c, d, x[i + 12], 6, 0x655b59c3);
    d = md5ii(d, a, b, c, x[i + 3], 10, 0x8f0ccc92);
    c = md5ii(c, d, a, b, x[i + 10], 15, 0xffeff47d);
    b = md5ii(b, c, d, a, x[i + 1], 21, 0x85845dd1);
    a = md5ii(a, b, c, d, x[i + 8], 6, 0x6fa87e4f);
    d = md5ii(d, a, b, c, x[i + 15], 10, 0xfe2ce6e0);
    c = md5ii(c, d, a, b, x[i + 6], 15, 0xa3014314);
    b = md5ii(b, c, d, a, x[i + 13], 21, 0x4e0811a1);
    a = md5ii(a, b, c, d, x[i + 4], 6, 0xf7537e82);
    d = md5ii(d, a, b, c, x[i + 11], 10, 0xbd3af235);
    c = md5ii(c, d, a, b, x[i + 2], 15, 0x2ad7d2bb);
    b = md5ii(b, c, d, a, x[i + 9], 21, 0xeb86d391);

    a = addUnsigned(a, oldA);
    b = addUnsigned(b, oldB);
    c = addUnsigned(c, oldC);
    d = addUnsigned(d, oldD);
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

// Generate Gravatar URL from email
function getGravatarUrl(email: string): string {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = md5(trimmedEmail);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { avatarUrl: contextAvatarUrl, userName: contextUserName } = useUserAvatar();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get display name - prioritize context (for real-time updates), then session
  const displayName = contextUserName || user.name;

  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get avatar URL - prioritize context (for real-time updates), then session, then Gravatar
  const avatarUrl = contextAvatarUrl || user.image || (user.email ? getGravatarUrl(user.email) : null);

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-navy hover:bg-blue focus:ring-navy flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- User-provided avatar URL, not part of app bundle
          <img
            src={avatarUrl}
            alt={user.name || 'Profile'}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitials()}</span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* User Info */}
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-medium text-gray-900">{displayName || 'User'}</p>
            <p className="truncate text-sm text-gray-500">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              Edit Profile
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ redirectTo: '/login' });
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
