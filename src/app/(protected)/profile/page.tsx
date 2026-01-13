'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Loader2, MoreVertical, Camera } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserAvatar } from '@/contexts/UserAvatarContext';

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

function getGravatarUrl(email: string): string {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = md5(trimmedEmail);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { setAvatarUrl, setUserName } = useUserAvatar();
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);

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

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

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
  }, [session?.user]); // Only re-fetch if user changes

  // Fetch active sessions when tab changes to settings
  useEffect(() => {
    const fetchSessions = async () => {
      if (activeTab === 'settings' && session?.user?.id) {
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
  }, [activeTab, session?.user?.id]); // Only depend on activeTab and user ID

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

      // Update theme immediately if dashboard appearance changed
      if (formData.dashboardAppearance) {
        setTheme(formData.dashboardAppearance as 'light' | 'dark' | 'system');
      }

      // Update name in context for immediate header update
      setUserName(formData.name || null);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      // Update avatar in form data and context (for header to update immediately)
      setFormData((prev) => ({ ...prev, avatar: data.avatarUrl }));
      setAvatarUrl(data.avatarUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setAvatarError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true);
    setAvatarError(null);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove avatar');
      }

      // Update avatar in form data and context
      setFormData((prev) => ({ ...prev, avatar: '' }));
      setAvatarUrl(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Avatar removal error:', err);
      setAvatarError(err instanceof Error ? err.message : 'Failed to remove avatar');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const openTerminateModal = (sessionId: string) => {
    setSessionToTerminate(sessionId);
    setShowTerminateModal(true);
  };

  const closeTerminateModal = () => {
    setShowTerminateModal(false);
    setSessionToTerminate(null);
  };

  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingSessionId(sessionId);
    setError(null);

    try {
      const response = await fetch('/api/user/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to terminate session');
      }

      // Show success message briefly
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);

      // Refresh sessions list
      const sessionsResponse = await fetch('/api/user/sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions || []);
      }
    } catch (err) {
      console.error('Error terminating session:', err);
      setError(err instanceof Error ? err.message : 'Failed to terminate session');
      setTimeout(() => setError(null), 5000);
    } finally {
      setTerminatingSessionId(null);
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
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0969da] dark:text-[#4493f8]" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117]">
      <main className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="mb-1 text-2xl font-bold text-[#1f2328] dark:text-[#e6edf3]">{formData.email}</h1>
          <h2 className="text-3xl font-bold text-[#1f2328] dark:text-[#e6edf3]">Profile</h2>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 border-b border-[#d1d9e0] dark:border-[#30363d]">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab('settings')}
              className={`border-b-2 pb-2 text-sm font-medium transition ${
                activeTab === 'settings'
                  ? 'border-[#0969da] dark:border-[#4493f8] text-[#0969da] dark:text-[#4493f8]'
                  : 'border-transparent text-[#656d76] dark:text-[#848d97] hover:border-[#d1d9e0] dark:hover:border-[#30363d] hover:text-[#1f2328] dark:hover:text-[#e6edf3]'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`border-b-2 pb-2 text-sm font-medium transition ${
                activeTab === 'notifications'
                  ? 'border-[#0969da] dark:border-[#4493f8] text-[#0969da] dark:text-[#4493f8]'
                  : 'border-transparent text-[#656d76] dark:text-[#848d97] hover:border-[#d1d9e0] dark:hover:border-[#30363d] hover:text-[#1f2328] dark:hover:text-[#e6edf3]'
              }`}
            >
              Notifications
            </button>
          </nav>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-3 rounded-md bg-[#ffebe9] dark:bg-[#490202] border border-[#ff818266] dark:border-[#f8514966] p-2.5 text-[#d1242f] dark:text-[#f85149]">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-3 rounded-md bg-[#dafbe1] dark:bg-[#2ea04326] border border-[#1f883d66] dark:border-[#3fb95066] p-2.5 text-[#1a7f37] dark:text-[#3fb950]">
            <p className="text-sm font-medium">Profile updated successfully!</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Profile Photo Section */}
            <div className="rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow">
              <h3 className="mb-3 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">Profile Photo</h3>

              <div className="flex items-center gap-4">
                {/* Avatar Display */}
                <div className="relative">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#d1d9e0] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#21262d]">
                    {formData.avatar ? (
                      <Image
                        src={formData.avatar}
                        alt="Profile avatar"
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[#656d76] dark:text-[#848d97]">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : formData.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-1.5 text-sm font-medium text-[#1f2328] dark:text-[#e6edf3] transition hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
                    >
                      <Camera className="h-4 w-4" />
                      Upload photo
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar || isRemovingAvatar}
                        className="text-sm text-[#d1242f] dark:text-[#f85149] hover:underline disabled:opacity-50"
                      >
                        {isRemovingAvatar ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-[#656d76] dark:text-[#848d97]">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                  {avatarError && (
                    <p className="mt-1 text-xs text-[#d1242f] dark:text-[#f85149]">{avatarError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow">
              <h3 className="mb-3 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">Settings</h3>

              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="block w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  />
                </div>

                {/* Email (Verified) */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                  >
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="block flex-1 rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#656d76] dark:text-[#848d97]"
                    />
                    <span className="rounded bg-[#dafbe1] dark:bg-[#2ea04326] px-2 py-0.5 text-xs text-[#1a7f37] dark:text-[#3fb950]">Verified</span>
                    <button
                      type="button"
                      onClick={() => setShowEmailChangeModal(true)}
                      className="rounded-md border border-[#0969da] dark:border-[#4493f8] px-2.5 py-1 text-xs font-medium text-[#0969da] dark:text-[#4493f8] transition hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                    >
                      Update email
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label
                    htmlFor="locale"
                    className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                  >
                    Language
                  </label>
                  <select
                    id="locale"
                    name="locale"
                    value={formData.locale}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#1f2328] dark:text-[#e6edf3] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
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

                {/* Time Zone */}
                <div>
                  <label
                    htmlFor="timezone"
                    className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                  >
                    Time Zone
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#1f2328] dark:text-[#e6edf3] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  >
                    <optgroup label="Americas">
                      <option value="Pacific/Honolulu">Honolulu - Hawaii (GMT-10)</option>
                      <option value="America/Anchorage">Anchorage - Alaska (GMT-9)</option>
                      <option value="America/Los_Angeles">Los Angeles - Pacific (GMT-8)</option>
                      <option value="America/Vancouver">Vancouver - Pacific (GMT-8)</option>
                      <option value="America/Denver">Denver - Mountain (GMT-7)</option>
                      <option value="America/Chicago">Chicago - Central (GMT-6)</option>
                      <option value="America/Mexico_City">Mexico City - Central (GMT-6)</option>
                      <option value="America/New_York">New York - Eastern (GMT-5)</option>
                      <option value="America/Toronto">Toronto - Eastern (GMT-5)</option>
                      <option value="America/Bogota">Bogota - Colombia (GMT-5)</option>
                      <option value="America/Lima">Lima - Peru (GMT-5)</option>
                      <option value="America/Buenos_Aires">Buenos Aires - Argentina (GMT-3)</option>
                      <option value="America/Sao_Paulo">Sao Paulo - Brazil (GMT-3)</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="Europe/London">London - GMT (GMT+0)</option>
                      <option value="Europe/Dublin">Dublin - Ireland (GMT+0)</option>
                      <option value="Europe/Paris">Paris - Central European (GMT+1)</option>
                      <option value="Europe/Berlin">Berlin - Central European (GMT+1)</option>
                      <option value="Europe/Madrid">Madrid - Central European (GMT+1)</option>
                      <option value="Europe/Rome">Rome - Central European (GMT+1)</option>
                      <option value="Europe/Amsterdam">Amsterdam - Central European (GMT+1)</option>
                      <option value="Europe/Brussels">Brussels - Central European (GMT+1)</option>
                      <option value="Europe/Vienna">Vienna - Central European (GMT+1)</option>
                      <option value="Europe/Stockholm">Stockholm - Central European (GMT+1)</option>
                      <option value="Europe/Oslo">Oslo - Central European (GMT+1)</option>
                      <option value="Europe/Copenhagen">Copenhagen - Central European (GMT+1)</option>
                      <option value="Europe/Zurich">Zurich - Central European (GMT+1)</option>
                      <option value="Europe/Prague">Prague - Central European (GMT+1)</option>
                      <option value="Europe/Warsaw">Warsaw - Central European (GMT+1)</option>
                      <option value="Europe/Budapest">Budapest - Central European (GMT+1)</option>
                      <option value="Europe/Helsinki">Helsinki - Eastern European (GMT+2)</option>
                      <option value="Europe/Athens">Athens - Eastern European (GMT+2)</option>
                      <option value="Europe/Bucharest">Bucharest - Eastern European (GMT+2)</option>
                      <option value="Europe/Istanbul">Istanbul - Turkey (GMT+3)</option>
                      <option value="Europe/Moscow">Moscow - Russia (GMT+3)</option>
                    </optgroup>
                    <optgroup label="Africa & Middle East">
                      <option value="Africa/Lagos">Lagos - Nigeria (GMT+1)</option>
                      <option value="Africa/Cairo">Cairo - Egypt (GMT+2)</option>
                      <option value="Africa/Johannesburg">Johannesburg - South Africa (GMT+2)</option>
                      <option value="Africa/Nairobi">Nairobi - East Africa (GMT+3)</option>
                      <option value="Asia/Dubai">Dubai - Gulf (GMT+4)</option>
                    </optgroup>
                    <optgroup label="Asia">
                      <option value="Asia/Kolkata">Mumbai/Delhi - India (GMT+5:30)</option>
                      <option value="Asia/Bangkok">Bangkok - Indochina (GMT+7)</option>
                      <option value="Asia/Jakarta">Jakarta - Indonesia (GMT+7)</option>
                      <option value="Asia/Singapore">Singapore (GMT+8)</option>
                      <option value="Asia/Kuala_Lumpur">Kuala Lumpur - Malaysia (GMT+8)</option>
                      <option value="Asia/Hong_Kong">Hong Kong (GMT+8)</option>
                      <option value="Asia/Shanghai">Shanghai - China (GMT+8)</option>
                      <option value="Asia/Taipei">Taipei - Taiwan (GMT+8)</option>
                      <option value="Asia/Manila">Manila - Philippines (GMT+8)</option>
                      <option value="Asia/Seoul">Seoul - Korea (GMT+9)</option>
                      <option value="Asia/Tokyo">Tokyo - Japan (GMT+9)</option>
                    </optgroup>
                    <optgroup label="Pacific & Australia">
                      <option value="Australia/Perth">Perth - Western Australia (GMT+8)</option>
                      <option value="Australia/Brisbane">Brisbane - Queensland (GMT+10)</option>
                      <option value="Australia/Sydney">Sydney - Eastern Australia (GMT+11)</option>
                      <option value="Australia/Melbourne">Melbourne - Eastern Australia (GMT+11)</option>
                      <option value="Pacific/Fiji">Fiji (GMT+12)</option>
                      <option value="Pacific/Auckland">Auckland - New Zealand (GMT+13)</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="UTC">UTC - Coordinated Universal Time (GMT+0)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Dashboard Appearance */}
                <div>
                  <label
                    htmlFor="dashboardAppearance"
                    className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                  >
                    Dashboard appearance
                  </label>
                  <select
                    id="dashboardAppearance"
                    name="dashboardAppearance"
                    value={formData.dashboardAppearance}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#1f2328] dark:text-[#e6edf3] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us a little about yourself..."
                    className="block w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-md bg-[#1f883d] dark:bg-[#238636] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-4 py-1.5 text-sm font-medium text-[#1f2328] dark:text-[#e6edf3] transition hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
              >
                Cancel
              </button>
            </div>

            {/* Active Sessions */}
            <div className="rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow">
              <h3 className="mb-3 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">Active sessions</h3>

              {loadingSessions ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[#0969da] dark:text-[#4493f8]" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#d1d9e0] dark:border-[#30363d] text-xs text-[#656d76] dark:text-[#848d97]">
                      <tr>
                        <th className="pb-2 font-semibold">Device</th>
                        <th className="pb-2 font-semibold">Location</th>
                        <th className="pb-2 font-semibold">Login Count</th>
                        <th className="pb-2 font-semibold">First Login</th>
                        <th className="pb-2 font-semibold">Last Activity</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-4 text-center text-sm text-[#656d76] dark:text-[#848d97]"
                          >
                            No active sessions found
                          </td>
                        </tr>
                      ) : (
                        (() => {
                          // Aggregate sessions by device and location
                          const aggregatedMap = new Map<
                            string,
                            {
                              deviceDisplay: string;
                              location: string;
                              sessions: Session[];
                              firstCreated: string;
                              lastUpdated: string;
                              hasCurrentSession: boolean;
                            }
                          >();

                          sessions.forEach((sess) => {
                            const browserDisplay = sess.browser || 'Unknown Browser';
                            const osDisplay = sess.os || 'Unknown OS';
                            const deviceDisplay = `${browserDisplay} (${osDisplay})`;
                            const location =
                              [sess.city, sess.region, sess.country].filter(Boolean).join(', ') || 'Unknown Location';
                            const key = `${deviceDisplay}|${location}`;
                            const isCurrentSession = session?.user?.sessionId === sess.id;

                            if (!aggregatedMap.has(key)) {
                              aggregatedMap.set(key, {
                                deviceDisplay,
                                location,
                                sessions: [],
                                firstCreated: sess.createdAt,
                                lastUpdated: sess.updatedAt || sess.createdAt,
                                hasCurrentSession: isCurrentSession,
                              });
                            }

                            const group = aggregatedMap.get(key)!;
                            group.sessions.push(sess);

                            // Update first created (earliest)
                            if (new Date(sess.createdAt) < new Date(group.firstCreated)) {
                              group.firstCreated = sess.createdAt;
                            }

                            // Update last updated (most recent)
                            const sessUpdated = sess.updatedAt || sess.createdAt;
                            if (new Date(sessUpdated) > new Date(group.lastUpdated)) {
                              group.lastUpdated = sessUpdated;
                            }

                            // Mark if any session in group is current
                            if (isCurrentSession) {
                              group.hasCurrentSession = true;
                            }
                          });

                          return Array.from(aggregatedMap.entries()).map(([key, group]) => {
                            const isTerminating = group.sessions.some((s) => terminatingSessionId === s.id);

                            return (
                              <tr
                                key={key}
                                className="border-b border-[#d1d9e0] dark:border-[#30363d] last:border-0"
                              >
                                <td className="py-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm text-[#1f2328] dark:text-[#e6edf3]">{group.deviceDisplay}</span>
                                    {group.hasCurrentSession && (
                                      <span className="rounded bg-[#ddf4ff] dark:bg-[#388bfd26] px-1.5 py-0.5 text-xs text-[#0969da] dark:text-[#4493f8]">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 text-sm text-[#656d76] dark:text-[#848d97]">{group.location}</td>
                                <td className="py-2 text-sm font-semibold text-[#1f2328] dark:text-[#e6edf3]">{group.sessions.length}</td>
                                <td className="py-2 text-sm text-[#656d76] dark:text-[#848d97]">{formatDate(group.firstCreated)}</td>
                                <td className="py-2 text-sm text-[#656d76] dark:text-[#848d97]">{formatDate(group.lastUpdated)}</td>
                                <td className="py-2 text-right">
                                  {group.hasCurrentSession ? (
                                    <span className="text-xs text-[#656d76] dark:text-[#848d97]">Current session</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Open modal to confirm termination of all sessions in this group
                                        const sessionIds = group.sessions.map((s) => s.id).join(',');
                                        openTerminateModal(sessionIds);
                                      }}
                                      disabled={isTerminating}
                                      className="text-[#d1242f] dark:text-[#f85149] hover:text-[#a40e26] dark:hover:text-[#ff7b72] disabled:opacity-50"
                                      title="Terminate all sessions"
                                    >
                                      {isTerminating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreVertical className="h-4 w-4" />
                                      )}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })()
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Danger Zone - Delete Profile Section */}
            <div className="rounded-lg border-2 border-[#ff818266] dark:border-[#f8514966] bg-white dark:bg-[#161b22] p-4 shadow">
              <h3 className="mb-2 text-lg font-bold text-[#d1242f] dark:text-[#f85149]">Danger Zone</h3>
              <h4 className="mb-1 text-base font-semibold text-[#1f2328] dark:text-[#e6edf3]">Delete your profile</h4>
              <p className="mb-3 text-sm text-[#656d76] dark:text-[#848d97]">Permanently delete the user {formData.email}</p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-md border border-[#d1242f] dark:border-[#f85149] px-3 py-1.5 text-sm font-medium text-[#d1242f] dark:text-[#f85149] transition hover:bg-[#ffebe9] dark:hover:bg-[#490202]"
              >
                Delete User
              </button>
            </div>
          </form>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow">
              <h3 className="mb-3 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">Email Notifications</h3>

              <div className="space-y-2.5">
                {/* Course Updates */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="notifyOnCourseUpdates"
                    name="notifyOnCourseUpdates"
                    checked={formData.notifyOnCourseUpdates}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-[#d1d9e0] dark:border-[#30363d] text-[#0969da] dark:text-[#4493f8] focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  />
                  <label
                    htmlFor="notifyOnCourseUpdates"
                    className="flex-1"
                  >
                    <span className="block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">Course updates</span>
                    <span className="block text-sm text-[#656d76] dark:text-[#848d97]">
                      Get notified when courses you&apos;re enrolled in are updated
                    </span>
                  </label>
                </div>

                {/* New Courses */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="notifyOnNewCourses"
                    name="notifyOnNewCourses"
                    checked={formData.notifyOnNewCourses}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-[#d1d9e0] dark:border-[#30363d] text-[#0969da] dark:text-[#4493f8] focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  />
                  <label
                    htmlFor="notifyOnNewCourses"
                    className="flex-1"
                  >
                    <span className="block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">New courses</span>
                    <span className="block text-sm text-[#656d76] dark:text-[#848d97]">
                      Be the first to know when new courses are available
                    </span>
                  </label>
                </div>

                {/* Completion Reminders */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="notifyOnCompletionReminders"
                    name="notifyOnCompletionReminders"
                    checked={formData.notifyOnCompletionReminders}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-[#d1d9e0] dark:border-[#30363d] text-[#0969da] dark:text-[#4493f8] focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  />
                  <label
                    htmlFor="notifyOnCompletionReminders"
                    className="flex-1"
                  >
                    <span className="block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">Completion reminders</span>
                    <span className="block text-sm text-[#656d76] dark:text-[#848d97]">
                      Gentle reminders to help you complete your courses
                    </span>
                  </label>
                </div>

                {/* Achievements */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="notifyOnAchievements"
                    name="notifyOnAchievements"
                    checked={formData.notifyOnAchievements}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-[#d1d9e0] dark:border-[#30363d] text-[#0969da] dark:text-[#4493f8] focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  />
                  <label
                    htmlFor="notifyOnAchievements"
                    className="flex-1"
                  >
                    <span className="block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">Achievements and milestones</span>
                    <span className="block text-sm text-[#656d76] dark:text-[#848d97]">
                      Celebrate your learning progress with achievement notifications
                    </span>
                  </label>
                </div>

                {/* Messages */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="notifyOnMessages"
                    name="notifyOnMessages"
                    checked={formData.notifyOnMessages}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-[#d1d9e0] dark:border-[#30363d] text-[#0969da] dark:text-[#4493f8] focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  />
                  <label
                    htmlFor="notifyOnMessages"
                    className="flex-1"
                  >
                    <span className="block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">Messages and replies</span>
                    <span className="block text-sm text-[#656d76] dark:text-[#848d97]">
                      Get notified when instructors or students message you
                    </span>
                  </label>
                </div>

                {/* Email Digest Frequency */}
                <div className="pt-2">
                  <label
                    htmlFor="emailDigestFrequency"
                    className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                  >
                    Email digest frequency
                  </label>
                  <select
                    id="emailDigestFrequency"
                    name="emailDigestFrequency"
                    value={formData.emailDigestFrequency}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2.5 py-1.5 text-sm text-[#1f2328] dark:text-[#e6edf3] outline-none focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#4493f8]"
                  >
                    <option value="none">Never</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p className="mt-1 text-sm text-[#656d76] dark:text-[#848d97]">Receive a summary of your activity and updates</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-md bg-[#1f883d] dark:bg-[#238636] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="rounded-md border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-4 py-1.5 text-sm font-medium text-[#1f2328] dark:text-[#e6edf3] transition hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Email Change Modal */}
        {showEmailChangeModal && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
            <div className="w-full max-w-md rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">Update Email Address</h3>

              {emailChangeSuccess ? (
                <div className="rounded-lg bg-[#dafbe1] dark:bg-[#2ea04326] border border-[#1f883d66] dark:border-[#3fb95066] p-4">
                  <p className="text-[#1a7f37] dark:text-[#3fb950]">
                    Verification email sent! Please check your new email inbox and click the verification link to
                    complete the change.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 rounded-lg bg-[#ddf4ff] dark:bg-[#388bfd26] border border-[#54aeff66] dark:border-[#4493f866] p-3">
                    <p className="text-sm text-[#0969da] dark:text-[#4493f8]">
                      A verification link will be sent to your new email address. You&apos;ll need to click it to
                      complete the change.
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">Current Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] px-3 py-2 text-[#656d76] dark:text-[#848d97]"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">New Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      className="w-full rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-2 text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-2 focus:ring-[#0969da]/20 dark:focus:ring-[#4493f8]/20 focus:outline-none"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">Password</label>
                    <input
                      type="password"
                      value={emailChangePassword}
                      onChange={(e) => setEmailChangePassword(e.target.value)}
                      placeholder="Enter your password to confirm"
                      className="w-full rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-2 text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] focus:border-[#0969da] dark:focus:border-[#4493f8] focus:ring-2 focus:ring-[#0969da]/20 dark:focus:ring-[#4493f8]/20 focus:outline-none"
                    />
                  </div>

                  {error && (
                    <div className="mb-4 rounded-lg bg-[#ffebe9] dark:bg-[#490202] border border-[#ff818266] dark:border-[#f8514966] p-3">
                      <p className="text-sm text-[#d1242f] dark:text-[#f85149]">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleEmailChange}
                      disabled={isChangingEmail || !newEmail || !emailChangePassword}
                      className="flex-1 rounded-lg bg-[#1f883d] dark:bg-[#238636] px-4 py-2 font-medium text-white transition hover:bg-[#1a7f37] dark:hover:bg-[#2ea043] disabled:opacity-50"
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
                      className="rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-4 py-2 font-medium text-[#1f2328] dark:text-[#e6edf3] transition hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Terminate Session Confirmation Modal */}
        {showTerminateModal && sessionToTerminate && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
            <div className="w-full max-w-md rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">Terminate Session</h3>

              <div className="mb-4 rounded-lg bg-[#fff8c5] dark:bg-[#bb800926] border border-[#d4a72c66] dark:border-[#bb800966] p-3">
                <p className="text-sm text-[#9a6700] dark:text-[#d29922]">
                  <strong>Warning:</strong> This will log out the device(s) associated with this session. You may need to sign in again on those devices.
                </p>
              </div>

              <p className="mb-6 text-sm text-[#656d76] dark:text-[#848d97]">
                Are you sure you want to terminate {sessionToTerminate.includes(',') ? 'these sessions' : 'this session'}?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    const sessionIds = sessionToTerminate.split(',');
                    closeTerminateModal();
                    for (const sessionId of sessionIds) {
                      await handleTerminateSession(sessionId);
                    }
                  }}
                  disabled={terminatingSessionId !== null}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#d1242f] dark:bg-[#da3633] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#a40e26] dark:hover:bg-[#f85149] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {terminatingSessionId !== null && <Loader2 className="h-4 w-4 animate-spin" />}
                  {terminatingSessionId !== null ? 'Terminating...' : 'Terminate'}
                </button>
                <button
                  onClick={closeTerminateModal}
                  disabled={terminatingSessionId !== null}
                  className="flex-1 rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-4 py-2 text-sm font-medium text-[#1f2328] dark:text-[#e6edf3] transition hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
            <div className="w-full max-w-md rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-[#1f2328] dark:text-[#e6edf3]">Delete Account</h3>

              <div className="mb-4 rounded-lg bg-[#ffebe9] dark:bg-[#490202] border border-[#ff818266] dark:border-[#f8514966] p-3">
                <p className="text-sm text-[#d1242f] dark:text-[#f85149]">
                  <strong>Warning:</strong> This action cannot be undone. All your data, including course progress and
                  enrollments, will be permanently deleted.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="deletePassword"
                    className="block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-2 text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] outline-none focus:border-[#d1242f] dark:focus:border-[#f85149] focus:ring-1 focus:ring-[#d1242f] dark:focus:ring-[#f85149]"
                    placeholder="Enter your password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="deleteConfirmation"
                    className="block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                  >
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3 py-2 text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#484f58] outline-none focus:border-[#d1242f] dark:focus:border-[#f85149] focus:ring-1 focus:ring-[#d1242f] dark:focus:ring-[#f85149]"
                    placeholder="DELETE"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#d1242f] dark:bg-[#da3633] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#a40e26] dark:hover:bg-[#f85149] disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="flex-1 rounded-lg border border-[#d1d9e0] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-4 py-2 text-sm font-medium text-[#1f2328] dark:text-[#e6edf3] transition hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] disabled:cursor-not-allowed disabled:opacity-50"
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
