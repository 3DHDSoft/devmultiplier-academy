import { prisma } from './prisma';
import { getClientIP, getUserAgent, getGeoLocationFromIP, getGeoLocationFromCloudflare } from './ip-utils';
import { parseUserAgent, getDeviceDisplayName } from './user-agent-parser';
import crypto from 'crypto';

/**
 * Create or update a session tracking record
 * This supplements NextAuth's JWT sessions with additional tracking
 */
export async function trackSession(userId: string): Promise<string> {
  try {
    // Get client information
    const ipAddress = await getClientIP();
    const userAgent = await getUserAgent();
    const { device, browser, os } = parseUserAgent(userAgent);

    // Get geolocation
    let geoLocation = await getGeoLocationFromCloudflare();
    if (!geoLocation.country && ipAddress) {
      geoLocation = await getGeoLocationFromIP(ipAddress);
    }

    // Generate a session token (this is our tracking token, separate from NextAuth JWT)
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Create session record with 30 day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const session = await prisma.sessions.create({
      data: {
        sessionToken,
        userId,
        expires: expiresAt,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        device: getDeviceDisplayName(device, browser, os),
        browser,
        os,
        country: geoLocation.country,
        city: geoLocation.city,
        region: geoLocation.region,
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
        updatedAt: new Date(),
      },
    });

    console.log(`Session tracked for user ${userId}: ${session.id}`);
    return session.id;
  } catch (error) {
    console.error('Error tracking session:', error);
    throw error;
  }
}

/**
 * Update session's last activity time
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await prisma.sessions.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string) {
  try {
    const sessions = await prisma.sessions.findMany({
      where: {
        userId,
        expires: {
          gt: new Date(), // Only get non-expired sessions
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        device: true,
        browser: true,
        os: true,
        ipAddress: true,
        country: true,
        city: true,
        region: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sessions;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
}

/**
 * Terminate a specific session
 */
export async function terminateSession(userId: string, sessionId: string): Promise<boolean> {
  try {
    // Verify the session belongs to the user before deleting
    const session = await prisma.sessions.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      console.error('Session not found or does not belong to user');
      return false;
    }

    await prisma.sessions.delete({
      where: { id: sessionId },
    });

    console.log(`Session ${sessionId} terminated for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error terminating session:', error);
    return false;
  }
}

/**
 * Terminate all sessions except the current one
 */
export async function terminateAllOtherSessions(userId: string, currentSessionId?: string): Promise<number> {
  try {
    const result = await prisma.sessions.deleteMany({
      where: {
        userId,
        ...(currentSessionId && { id: { not: currentSessionId } }),
      },
    });

    console.log(`Terminated ${result.count} sessions for user ${userId}`);
    return result.count;
  } catch (error) {
    console.error('Error terminating sessions:', error);
    return 0;
  }
}

/**
 * Clean up expired sessions (can be run as a cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.sessions.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    console.log(`Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
}
