'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  locale: string;
  timezone: string;
}

// Simple MD5 implementation for Gravatar
function md5(str: string): string {
  // Simple MD5-like hash for Gravatar URLs
  // Using a basic implementation since we can't install packages
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
    const oldA = a, oldB = b, oldC = c, oldD = d;

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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    locale: 'en',
    timezone: 'UTC',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();

            // Detect browser timezone if not set
            let detectedTimezone = data.timezone;
            if (!detectedTimezone || detectedTimezone === 'UTC') {
              try {
                detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                console.log('Detected timezone:', detectedTimezone);
              } catch (error) {
                console.error('Error detecting timezone:', error);
                detectedTimezone = 'UTC';
              }
            }

            // Generate Gravatar URL if no avatar is set
            const defaultAvatar = data.email ? getGravatarUrl(data.email) : '';

            setFormData({
              name: data.name || '',
              email: data.email || '',
              bio: data.bio || '',
              avatar: data.avatar || defaultAvatar,
              locale: data.locale || 'en',
              timezone: detectedTimezone,
            });
          } else {
            setError('Failed to load profile data');
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
          setError('An error occurred while loading your profile');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          avatar: formData.avatar || undefined,
          locale: formData.locale,
          timezone: formData.timezone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-1 text-sm text-gray-600">Update your personal information and preferences</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">
            <p className="text-sm font-medium">Profile updated successfully!</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-white p-6 shadow"
        >
          <div className="space-y-4">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                maxLength={500}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                placeholder="Tell us about yourself..."
              />
              <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/500 characters</p>
            </div>

            {/* Avatar URL with Preview */}
            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700"
              >
                Avatar URL
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="url"
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="block flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  placeholder="https://example.com/avatar.jpg"
                />
                {formData.avatar && (
                  <img
                    src={formData.avatar}
                    alt="Avatar preview"
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>

            {/* Language and Timezone Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="locale"
                  className="block text-sm font-medium text-gray-700"
                >
                  Language
                </label>
                <select
                  id="locale"
                  name="locale"
                  value={formData.locale}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Timezone
                </label>
<select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  <option value="UTC">UTC - Coordinated Universal Time</option>

                  <optgroup label="US & Canada">
                    <option value="America/New_York">EST/EDT - Eastern Time</option>
                    <option value="America/Detroit">EST/EDT - Detroit</option>
                    <option value="America/Kentucky/Louisville">EST/EDT - Louisville</option>
                    <option value="America/Indiana/Indianapolis">EST/EDT - Indianapolis</option>
                    <option value="America/Chicago">CST/CDT - Central Time</option>
                    <option value="America/Menominee">CST/CDT - Menominee</option>
                    <option value="America/North_Dakota/Center">CST/CDT - North Dakota</option>
                    <option value="America/Denver">MST/MDT - Mountain Time</option>
                    <option value="America/Boise">MST/MDT - Boise</option>
                    <option value="America/Phoenix">MST - Phoenix (no DST)</option>
                    <option value="America/Los_Angeles">PST/PDT - Pacific Time</option>
                    <option value="America/Anchorage">AKST/AKDT - Alaska</option>
                    <option value="Pacific/Honolulu">HST - Hawaii (no DST)</option>
                    <option value="America/Toronto">EST/EDT - Toronto</option>
                    <option value="America/Vancouver">PST/PDT - Vancouver</option>
                    <option value="America/Edmonton">MST/MDT - Edmonton</option>
                    <option value="America/Winnipeg">CST/CDT - Winnipeg</option>
                    <option value="America/Halifax">AST/ADT - Halifax</option>
                    <option value="America/St_Johns">NST/NDT - Newfoundland</option>
                  </optgroup>

                  <optgroup label="Mexico, Central & South America">
                    <option value="America/Mexico_City">CST/CDT - Mexico City</option>
                    <option value="America/Cancun">EST - Cancún</option>
                    <option value="America/Tijuana">PST/PDT - Tijuana</option>
                    <option value="America/Guatemala">CST - Guatemala</option>
                    <option value="America/Costa_Rica">CST - Costa Rica</option>
                    <option value="America/Panama">EST - Panama</option>
                    <option value="America/Bogota">COT - Bogotá</option>
                    <option value="America/Lima">PET - Lima</option>
                    <option value="America/Santiago">CLT/CLST - Santiago</option>
                    <option value="America/Caracas">VET - Caracas</option>
                    <option value="America/La_Paz">BOT - La Paz</option>
                    <option value="America/Sao_Paulo">BRT/BRST - São Paulo</option>
                    <option value="America/Manaus">AMT - Manaus</option>
                    <option value="America/Argentina/Buenos_Aires">ART - Buenos Aires</option>
                    <option value="America/Montevideo">UYT - Montevideo</option>
                  </optgroup>

                  <optgroup label="Europe & UK">
                    <option value="Europe/London">GMT/BST - London</option>
                    <option value="Europe/Dublin">GMT/IST - Dublin</option>
                    <option value="Europe/Lisbon">WET/WEST - Lisbon</option>
                    <option value="Europe/Paris">CET/CEST - Paris</option>
                    <option value="Europe/Berlin">CET/CEST - Berlin</option>
                    <option value="Europe/Rome">CET/CEST - Rome</option>
                    <option value="Europe/Madrid">CET/CEST - Madrid</option>
                    <option value="Europe/Amsterdam">CET/CEST - Amsterdam</option>
                    <option value="Europe/Brussels">CET/CEST - Brussels</option>
                    <option value="Europe/Vienna">CET/CEST - Vienna</option>
                    <option value="Europe/Zurich">CET/CEST - Zurich</option>
                    <option value="Europe/Prague">CET/CEST - Prague</option>
                    <option value="Europe/Warsaw">CET/CEST - Warsaw</option>
                    <option value="Europe/Budapest">CET/CEST - Budapest</option>
                    <option value="Europe/Stockholm">CET/CEST - Stockholm</option>
                    <option value="Europe/Copenhagen">CET/CEST - Copenhagen</option>
                    <option value="Europe/Oslo">CET/CEST - Oslo</option>
                    <option value="Europe/Athens">EET/EEST - Athens</option>
                    <option value="Europe/Helsinki">EET/EEST - Helsinki</option>
                    <option value="Europe/Istanbul">TRT - Istanbul</option>
                    <option value="Europe/Moscow">MSK - Moscow</option>
                    <option value="Europe/Kiev">EET/EEST - Kyiv</option>
                    <option value="Europe/Bucharest">EET/EEST - Bucharest</option>
                  </optgroup>

                  <optgroup label="Asia">
                    <option value="Asia/Dubai">GST - Dubai</option>
                    <option value="Asia/Qatar">AST - Qatar</option>
                    <option value="Asia/Riyadh">AST - Riyadh</option>
                    <option value="Asia/Tehran">IRST - Tehran</option>
                    <option value="Asia/Kabul">AFT - Kabul</option>
                    <option value="Asia/Karachi">PKT - Karachi</option>
                    <option value="Asia/Kolkata">IST - India</option>
                    <option value="Asia/Kathmandu">NPT - Kathmandu</option>
                    <option value="Asia/Dhaka">BST - Dhaka</option>
                    <option value="Asia/Yangon">MMT - Yangon</option>
                    <option value="Asia/Bangkok">ICT - Bangkok</option>
                    <option value="Asia/Jakarta">WIB - Jakarta</option>
                    <option value="Asia/Singapore">SGT - Singapore</option>
                    <option value="Asia/Kuala_Lumpur">MYT - Kuala Lumpur</option>
                    <option value="Asia/Manila">PHT - Manila</option>
                    <option value="Asia/Hong_Kong">HKT - Hong Kong</option>
                    <option value="Asia/Shanghai">CST - Shanghai/Beijing</option>
                    <option value="Asia/Taipei">CST - Taipei</option>
                    <option value="Asia/Tokyo">JST - Tokyo</option>
                    <option value="Asia/Seoul">KST - Seoul</option>
                    <option value="Asia/Pyongyang">KST - Pyongyang</option>
                    <option value="Asia/Ulaanbaatar">ULAT - Ulaanbaatar</option>
                    <option value="Asia/Vladivostok">VLAT - Vladivostok</option>
                  </optgroup>

                  <optgroup label="Australia & Pacific">
                    <option value="Australia/Perth">AWST - Perth</option>
                    <option value="Australia/Darwin">ACST - Darwin (no DST)</option>
                    <option value="Australia/Adelaide">ACST/ACDT - Adelaide</option>
                    <option value="Australia/Brisbane">AEST - Brisbane (no DST)</option>
                    <option value="Australia/Sydney">AEST/AEDT - Sydney</option>
                    <option value="Australia/Melbourne">AEST/AEDT - Melbourne</option>
                    <option value="Australia/Hobart">AEST/AEDT - Hobart</option>
                    <option value="Pacific/Auckland">NZST/NZDT - Auckland</option>
                    <option value="Pacific/Fiji">FJT - Fiji</option>
                    <option value="Pacific/Guam">ChST - Guam</option>
                    <option value="Pacific/Port_Moresby">PGT - Port Moresby</option>
                  </optgroup>

                  <optgroup label="Africa & Middle East">
                    <option value="Africa/Cairo">EET - Cairo</option>
                    <option value="Africa/Johannesburg">SAST - Johannesburg</option>
                    <option value="Africa/Lagos">WAT - Lagos</option>
                    <option value="Africa/Nairobi">EAT - Nairobi</option>
                    <option value="Africa/Casablanca">WET - Casablanca</option>
                    <option value="Africa/Algiers">CET - Algiers</option>
                    <option value="Africa/Tripoli">EET - Tripoli</option>
                    <option value="Africa/Addis_Ababa">EAT - Addis Ababa</option>
                    <option value="Asia/Jerusalem">IST - Jerusalem</option>
                    <option value="Asia/Beirut">EET/EEST - Beirut</option>
                    <option value="Asia/Baghdad">AST - Baghdad</option>
                  </optgroup>

                  <optgroup label="Atlantic & Other">
                    <option value="Atlantic/Azores">AZOT/AZOST - Azores</option>
                    <option value="Atlantic/Cape_Verde">CVT - Cape Verde</option>
                    <option value="Atlantic/Reykjavik">GMT - Reykjavik</option>
                    <option value="Atlantic/Bermuda">AST/ADT - Bermuda</option>
                    <option value="Pacific/Samoa">SST - Samoa</option>
                    <option value="Pacific/Tahiti">TAHT - Tahiti</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-navy px-5 py-2 text-sm font-medium text-white transition hover:bg-blue disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
