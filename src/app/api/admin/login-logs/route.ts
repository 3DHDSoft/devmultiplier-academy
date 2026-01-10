import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-middleware';
import { prisma } from '@/lib/prisma';
import { withErrorHandling } from '@/lib/api-handler';
import { apiLogger } from '@/lib/logger';

export const GET = withErrorHandling(
  async () => {
    // Check if user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Return error response if not admin

    apiLogger.info('Fetching login logs');

    // Get last 100 login attempts
    const logs = await prisma.login_logs.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        users: {
          select: {
            name: true,
            status: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      totalLogins: logs.length,
      successfulLogins: logs.filter((log) => log.success).length,
      failedLogins: logs.filter((log) => !log.success).length,
      uniqueUsers: new Set(logs.map((log) => log.userId)).size,
    };

    return NextResponse.json({
      logs,
      stats,
      total: logs.length,
    });
  },
  { route: '/api/admin/login-logs' }
);
