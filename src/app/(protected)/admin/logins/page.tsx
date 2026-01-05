'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, MapPin, Clock, CheckCircle, XCircle, Loader2, AlertTriangle, User, Search } from 'lucide-react';

interface LoginLogItem {
  id: string;
  userId: string;
  email: string;
  ipAddress: string;
  userAgent?: string;
  country?: string;
  city?: string;
  region?: string;
  success: boolean;
  failureReason?: string;
  createdAt: string;
  user: {
    name?: string;
    status: string;
  };
}

interface StatsData {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
}

export default function AdminLoginsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLoginLogs = async () => {
      if (session?.user) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/admin/login-logs');
          if (response.status === 403) {
            setError('Access denied. Admin privileges required.');
            return;
          }
          if (response.ok) {
            const data = await response.json();
            setLoginLogs(data.logs || []);
            setStats(data.stats || null);
          } else {
            setError('Failed to load login logs');
          }
        } catch (err) {
          console.error('Error fetching login logs:', err);
          setError('An error occurred while loading login logs');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLoginLogs();
  }, [session]);

  const formatLocation = (item: LoginLogItem): string => {
    const parts = [item.city, item.region, item.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const filteredLogs = loginLogs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'success' && log.success) ||
      (filterStatus === 'failed' && !log.success);

    return matchesSearch && matchesFilter;
  });

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Login Monitor</h1>
          </div>
          <p className="text-sm text-gray-600">Monitor all login attempts across the platform</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow">
              <div className="text-sm font-medium text-gray-600">Total Logins</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalLogins}</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <div className="text-sm font-medium text-gray-600">Successful</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{stats.successfulLogins}</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <div className="text-sm font-medium text-gray-600">Failed</div>
              <div className="mt-2 text-3xl font-bold text-red-600">{stats.failedLogins}</div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <div className="text-sm font-medium text-gray-600">Unique Users</div>
              <div className="mt-2 text-3xl font-bold text-blue-600">{stats.uniqueUsers}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, name, or IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('success')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filterStatus === 'success' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setFilterStatus('failed')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filterStatus === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>

        {/* Login Logs Table */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Login Attempts ({filteredLogs.length})</h2>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading login logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-12 text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-3 text-sm text-gray-600">
                  {searchTerm || filterStatus !== 'all' ? 'No logs match your filters' : 'No login logs available'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Date/Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`hover:bg-gray-50 ${!log.success ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.success ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Success</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Failed</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.user.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{log.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {formatLocation(log)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-gray-600">{log.ipAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {!log.success && log.failureReason && (
                          <div className="text-xs text-red-700">{log.failureReason}</div>
                        )}
                        {log.userAgent && (
                          <div
                            className="text-xs text-gray-500"
                            title={log.userAgent}
                          >
                            {log.userAgent.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
