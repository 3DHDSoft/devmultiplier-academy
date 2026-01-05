'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, MapPin, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LoginHistoryItem {
  id: string;
  email: string;
  ipAddress: string;
  country?: string;
  city?: string;
  region?: string;
  success: boolean;
  failureReason?: string;
  createdAt: string;
}

export default function SecurityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLoginHistory = async () => {
      if (session?.user) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/user/login-history');
          if (response.ok) {
            const data = await response.json();
            setLoginHistory(data.history || []);
          } else {
            setError('Failed to load login history');
          }
        } catch (err) {
          console.error('Error fetching login history:', err);
          setError('An error occurred while loading your login history');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLoginHistory();
  }, [session]);

  const formatLocation = (item: LoginHistoryItem): string => {
    const parts = [item.city, item.region, item.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown location';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatFullDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Security & Login History</h1>
          </div>
          <p className="text-sm text-gray-600">Monitor your account activity and review recent login attempts</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Login History */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="mt-1 text-sm text-gray-600">Last 20 login attempts on your account</p>
          </div>

          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading login history...</span>
              </div>
            ) : loginHistory.length === 0 ? (
              <div className="py-12 text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-3 text-sm text-gray-600">No login history available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loginHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-4 transition hover:shadow-md ${
                      item.success ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {item.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {item.success ? 'Successful login' : 'Failed login attempt'}
                              </span>
                              {index === 0 && item.success && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  Current session
                                </span>
                              )}
                            </div>
                            {!item.success && item.failureReason && (
                              <p className="text-sm text-red-700">Reason: {item.failureReason}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{formatLocation(item)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">IP:</span>
                            <span className="font-mono text-xs">{item.ipAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span title={formatFullDate(item.createdAt)}>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-6 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">Security Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Review this list regularly to ensure you recognize all login attempts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>If you see unfamiliar activity, change your password immediately</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>You&apos;ll receive email notifications when your account is accessed from a new location</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Multiple failed login attempts will trigger automatic security alerts</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
