import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-middleware';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Check if user is admin
  const adminCheck = await requireAdmin();
  if (adminCheck) return adminCheck; // Return error response if not admin

  try {
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
  } catch (error) {
    console.error('Error fetching login logs:', error);
    return NextResponse.json({ error: 'Failed to fetch login logs' }, { status: 500 });
  }
}
