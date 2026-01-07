'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, MoreVertical } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  locale: string;
  timezone: string;
  dashboardAppearance: string;
  notifyOnCourseUpdates: boolean;
  notifyOnNewCourses: boolean;
  notifyOnCompletionReminders: boolean;
  notifyOnAchievements: boolean;
  notifyOnMessages: boolean;
  emailDigestFrequency: string;
  createdAt: string;
}

interface Session {
  id: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  createdAt: string;
  updatedAt: string | null;
}

type TabType = 'settings' | 'notifications';

// Simple MD5 implementation for Gravatar (same as before)
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

function getGravatarUrl(email: string): string {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = md5(trimmedEmail);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Email change state
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailChangePassword, setEmailChangePassword] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);

  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    bio: '',
    avatar: '',
    locale: 'en',
    timezone: 'UTC',
    dashboardAppearance: 'light',
    notifyOnCourseUpdates: true,
    notifyOnNewCourses: true,
    notifyOnCompletionReminders: true,
    notifyOnAchievements: true,
    notifyOnMessages: true,
    emailDigestFrequency: 'weekly',
    createdAt: '',
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

            let detectedTimezone = data.timezone;
            if (!detectedTimezone || detectedTimezone === 'UTC') {
              try {
                detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              } catch (error) {
                console.error('Error detecting timezone:', error);
                detectedTimezone = 'UTC';
              }
            }

            const defaultAvatar = data.email ? getGravatarUrl(data.email) : '';

            setFormData({
              id: data.id || '',
              name: data.name || '',
              email: data.email || '',
              bio: data.bio || '',
              avatar: data.avatar || defaultAvatar,
              locale: data.locale || 'en',
              timezone: detectedTimezone,
              dashboardAppearance: data.dashboardAppearance || 'light',
              notifyOnCourseUpdates: data.notifyOnCourseUpdates ?? true,
              notifyOnNewCourses: data.notifyOnNewCourses ?? true,
              notifyOnCompletionReminders: data.notifyOnCompletionReminders ?? true,
              notifyOnAchievements: data.notifyOnAchievements ?? true,
              notifyOnMessages: data.notifyOnMessages ?? true,
              emailDigestFrequency: data.emailDigestFrequency || 'weekly',
              createdAt: data.createdAt || '',
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

  // Fetch active sessions when tab changes to settings
  useEffect(() => {
    const fetchSessions = async () => {
      if (activeTab === 'settings' && formData.id) {
        setLoadingSessions(true);
        try {
          const response = await fetch('/api/user/sessions');
          if (!response.ok) {
            throw new Error('Failed to fetch sessions');
          }
          const data = await response.json();
          setSessions(data.sessions || []);
        } catch (err) {
          console.error('Error fetching sessions:', err);
          setSessions([]);
        } finally {
          setLoadingSessions(false);
        }
      }
    };

    fetchSessions();
  }, [activeTab, formData.id, formData.email]);

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
          dashboardAppearance: formData.dashboardAppearance,
          notifyOnCourseUpdates: formData.notifyOnCourseUpdates,
          notifyOnNewCourses: formData.notifyOnNewCourses,
          notifyOnCompletionReminders: formData.notifyOnCompletionReminders,
          notifyOnAchievements: formData.notifyOnAchievements,
          notifyOnMessages: formData.notifyOnMessages,
          emailDigestFrequency: formData.emailDigestFrequency,
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Sign out and redirect
      await signOut({ redirect: false });
      router.push('/login?deleted=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsDeleting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this session?')) {
      return;
    }

    try {
      const response = await fetch('/api/user/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to terminate session');
      }

      // Refresh sessions list
      const sessionsResponse = await fetch('/api/user/sessions');
      if (sessionsResponse.ok) {
        const data = await sessionsResponse.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Error terminating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to terminate session');
    }
  };

  const handleEmailChange = async () => {
    setError(null);
    setEmailChangeSuccess(false);
    setIsChangingEmail(true);

    try {
      const response = await fetch('/api/user/email/request-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail,
          password: emailChangePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request email change');
      }

      setEmailChangeSuccess(true);
      setTimeout(() => {
        setShowEmailChangeModal(false);
        setNewEmail('');
        setEmailChangePassword('');
        setEmailChangeSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request email change');
    } finally {
      setIsChangingEmail(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">{formData.email}</h1>
          <h2 className="text-3xl font-bold text-gray-900">Profile</h2>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`border-b-2 pb-3 text-sm font-medium transition ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`border-b-2 pb-3 text-sm font-medium transition ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Notifications
            </button>
          </nav>
        </div>

        {/* Messages */}
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Settings Section */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Settings</h3>

              <div className="space-y-4">
                {/* Email (Verified) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="block flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                    />
                    <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-800">
                      Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowEmailChangeModal(true)}
                      className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      Update email
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <select
                    id="locale"
                    name="locale"
                    value={formData.locale}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="pt">Portuguese</option>
                    <option value="hi">Hindi</option>
                    <option value="zh">Chinese</option>
                    <option value="de">German</option>
                    <option value="hu">Hungarian</option>
                  </select>
                </div>

                {/* Dashboard Appearance */}
                <div>
                  <label htmlFor="dashboardAppearance" className="block text-sm font-medium text-gray-700">
                    Dashboard appearance
                  </label>
                  <select
                    id="dashboardAppearance"
                    name="dashboardAppearance"
                    value={formData.dashboardAppearance}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delete Profile Section */}
            <div className="rounded-lg border-2 border-red-200 bg-white p-6 shadow">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Delete your profile</h3>
              <p className="mb-4 text-sm text-gray-600">
                Permanently delete the user {formData.email}
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete User
              </button>
            </div>

            {/* Active Sessions */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Active sessions</h3>

              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200 text-xs text-gray-500">
                      <tr>
                        <th className="pb-3 font-medium">Device</th>
                        <th className="pb-3 font-medium">Location</th>
                        <th className="pb-3 font-medium">Created</th>
                        <th className="pb-3 font-medium">Updated</th>
                        <th className="pb-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No active sessions found
                          </td>
                        </tr>
                      ) : (
                        sessions.map((sess, index) => {
                          const browserDisplay = sess.browser || 'Unknown Browser';
                          const location = [sess.city, sess.region, sess.country]
                            .filter(Boolean)
                            .join(', ') || 'Unknown Location';

                          return (
                            <tr key={sess.id} className="border-b border-gray-100 last:border-0">
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <span>{browserDisplay} ({sess.os || 'Unknown OS'})</span>
                                  {index === 0 && (
                                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                      Current
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 text-gray-600">{location}</td>
                              <td className="py-4 text-gray-600">
                                {formatDate(sess.createdAt)}
                              </td>
                              <td className="py-4 text-gray-600">
                                {sess.updatedAt ? formatDate(sess.updatedAt) : 'N/A'}
                              </td>
                              <td className="py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleTerminateSession(sess.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Terminate session"
                                >
                                  <MoreVertical className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
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
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Email Notifications</h3>

              <div className="space-y-4">
                {/* Course Updates */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="notifyOnCourseUpdates"
                    name="notifyOnCourseUpdates"
                    checked={formData.notifyOnCourseUpdates}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="notifyOnCourseUpdates" className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      Course updates
                    </span>
                    <span className="block text-sm text-gray-500">
                      Get notified when courses you're enrolled in are updated
                    </span>
                  </label>
                </div>

                {/* New Courses */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="notifyOnNewCourses"
                    name="notifyOnNewCourses"
                    checked={formData.notifyOnNewCourses}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="notifyOnNewCourses" className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      New courses
                    </span>
                    <span className="block text-sm text-gray-500">
                      Be the first to know when new courses are available
                    </span>
                  </label>
                </div>

                {/* Completion Reminders */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="notifyOnCompletionReminders"
                    name="notifyOnCompletionReminders"
                    checked={formData.notifyOnCompletionReminders}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="notifyOnCompletionReminders" className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      Completion reminders
                    </span>
                    <span className="block text-sm text-gray-500">
                      Gentle reminders to help you complete your courses
                    </span>
                  </label>
                </div>

                {/* Achievements */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="notifyOnAchievements"
                    name="notifyOnAchievements"
                    checked={formData.notifyOnAchievements}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="notifyOnAchievements" className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      Achievements and milestones
                    </span>
                    <span className="block text-sm text-gray-500">
                      Celebrate your learning progress with achievement notifications
                    </span>
                  </label>
                </div>

                {/* Messages */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="notifyOnMessages"
                    name="notifyOnMessages"
                    checked={formData.notifyOnMessages}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="notifyOnMessages" className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      Messages and replies
                    </span>
                    <span className="block text-sm text-gray-500">
                      Get notified when instructors or students message you
                    </span>
                  </label>
                </div>

                {/* Email Digest Frequency */}
                <div className="pt-4">
                  <label htmlFor="emailDigestFrequency" className="block text-sm font-medium text-gray-900">
                    Email digest frequency
                  </label>
                  <select
                    id="emailDigestFrequency"
                    name="emailDigestFrequency"
                    value={formData.emailDigestFrequency}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="none">Never</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Receive a summary of your activity and updates
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
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
        )}

        {/* Email Change Modal */}
        {showEmailChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Update Email Address</h3>

              {emailChangeSuccess ? (
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-green-800">
                    Verification email sent! Please check your new email inbox and click the verification link to complete the change.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 rounded-lg bg-blue-50 p-3">
                    <p className="text-sm text-blue-800">
                      A verification link will be sent to your new email address. You'll need to click it to complete the change.
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Current Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      value={emailChangePassword}
                      onChange={(e) => setEmailChangePassword(e.target.value)}
                      placeholder="Enter your password to confirm"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleEmailChange}
                      disabled={isChangingEmail || !newEmail || !emailChangePassword}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isChangingEmail ? 'Sending...' : 'Send Verification Email'}
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailChangeModal(false);
                        setNewEmail('');
                        setEmailChangePassword('');
                        setError(null);
                      }}
                      disabled={isChangingEmail}
                      className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Delete Account</h3>

              <div className="mb-4 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All your data, including course progress and enrollments, will be permanently deleted.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="Enter your password"
                  />
                </div>

                <div>
                  <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700">
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="DELETE"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteConfirmation('');
                    setError(null);
                  }}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
