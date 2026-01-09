import { prisma } from './prisma';
import { getClientIP, getUserAgent, getGeoLocationFromIP, getGeoLocationFromCloudflare } from './ip-utils';
import { sendNewLocationAlert, sendFailedLoginAlert } from './email-service';
import { withSpan, addSpanAttributes, addSpanEvent } from './tracer';
import { recordLoginAttempt, recordDbQuery, newLocationLoginCounter, suspiciousLoginCounter } from './metrics';

export interface LoginLogData {
  userId: string;
  email: string;
  success: boolean;
  failureReason?: string;
  userName?: string | null;
}

/**
 * Log a login attempt with IP address and geolocation
 * Also handles security notifications for new locations and failed attempts
 */
export async function logLogin(data: LoginLogData): Promise<void> {
  return withSpan(
    'login.log',
    async (_span) => {
      try {
        // Add span attributes
        addSpanAttributes({
          'login.user.id': data.userId,
          'login.user.email': data.email,
          'login.success': data.success,
        });

        if (data.failureReason) {
          addSpanAttributes({ 'login.failure_reason': data.failureReason });
        }

        // Get client information
        const ipAddress = await getClientIP();
        const userAgent = await getUserAgent();

        addSpanEvent('client_info_retrieved', {
          'client.ip': ipAddress || 'unknown',
          'client.user_agent': userAgent || 'unknown',
        });

        // Try to get geolocation from Cloudflare headers first (faster)
        let geoLocation = await getGeoLocationFromCloudflare();

        // If Cloudflare headers are not available, use IP geolocation API
        if (!geoLocation.country && ipAddress) {
          addSpanEvent('fallback_to_ip_geolocation');
          geoLocation = await getGeoLocationFromIP(ipAddress);
        }

        addSpanAttributes({
          'geo.country': geoLocation.country || 'unknown',
          'geo.city': geoLocation.city || 'unknown',
          'geo.region': geoLocation.region || 'unknown',
        });

        // Create login log entry
        const dbStartTime = Date.now();
        const loginLog = await prisma.login_logs.create({
          data: {
            userId: data.userId,
            email: data.email,
            ipAddress: ipAddress || 'Unknown',
            userAgent: userAgent || undefined,
            country: geoLocation.country,
            city: geoLocation.city,
            region: geoLocation.region,
            latitude: geoLocation.latitude,
            longitude: geoLocation.longitude,
            success: data.success,
            failureReason: data.failureReason,
          },
        });

        // Record database query metrics
        recordDbQuery({
          operation: 'create',
          table: 'loginLog',
          duration: Date.now() - dbStartTime,
          success: true,
        });

        addSpanEvent('login_log_created', {
          'log.id': loginLog.id,
        });

        console.log(
          `Login logged for user ${data.email} from ${ipAddress || 'Unknown'} (${geoLocation.city}, ${geoLocation.country})`
        );

        // Record login attempt metrics
        recordLoginAttempt({
          success: data.success,
          userId: data.userId !== 'unknown' ? data.userId : undefined,
          email: data.email,
          failureReason: data.failureReason,
          country: geoLocation.country || undefined,
          city: geoLocation.city || undefined,
        });

        // Handle security notifications (only for real users, not 'unknown')
        if (data.userId !== 'unknown') {
          // Check for successful login from new location
          if (data.success) {
            await checkAndNotifyNewLocation(
              data.userId,
              data.email,
              data.userName,
              geoLocation,
              ipAddress,
              loginLog.createdAt
            );
          }

          // Check for failed login attempts
          if (!data.success) {
            await checkAndNotifyFailedAttempts(data.email, data.userName, geoLocation, ipAddress, loginLog.createdAt);
          }
        }
      } catch (error) {
        // Don't throw error - logging should not break the login flow
        console.error('Error logging login:', error);
      }
    },
    {
      'service.operation': 'login_logging',
    }
  );
}

/**
 * Check if this is a new location and send notification
 */
async function checkAndNotifyNewLocation(
  userId: string,
  email: string,
  userName: string | null | undefined,
  geoLocation: { city?: string; region?: string; country?: string },
  ipAddress: string | null,
  timestamp: Date
): Promise<void> {
  return withSpan(
    'login.check_new_location',
    async (_span) => {
      try {
        addSpanAttributes({
          'check.user_id': userId,
          'check.location.city': geoLocation.city || 'unknown',
          'check.location.country': geoLocation.country || 'unknown',
        });

        // Get previous successful logins from this location (city + country)
        const previousLogins = await prisma.login_logs.count({
          where: {
            userId,
            success: true,
            city: geoLocation.city,
            country: geoLocation.country,
            createdAt: {
              lt: timestamp, // Only check logins before this one
            },
          },
        });

        addSpanAttributes({
          'check.previous_logins_count': previousLogins,
          'check.is_new_location': previousLogins === 0,
        });

        // If no previous logins from this location, send notification
        if (previousLogins === 0 && geoLocation.country) {
          addSpanEvent('new_location_detected', {
            'notification.email': email,
            'notification.location': `${geoLocation.city}, ${geoLocation.country}`,
          });

          // Record new location login metric
          newLocationLoginCounter.add(1, {
            'user.id': userId,
            'geo.country': geoLocation.country,
            'geo.city': geoLocation.city || 'unknown',
          });

          await sendNewLocationAlert(
            email,
            userName || null,
            {
              city: geoLocation.city,
              region: geoLocation.region,
              country: geoLocation.country,
              ipAddress: ipAddress || undefined,
            },
            timestamp
          );

          addSpanEvent('new_location_email_sent');
        }
      } catch (error) {
        console.error('Error checking new location:', error);
      }
    },
    {
      'service.operation': 'new_location_check',
    }
  );
}

/**
 * Check for multiple failed attempts and send notification
 */
async function checkAndNotifyFailedAttempts(
  email: string,
  userName: string | null | undefined,
  geoLocation: { city?: string; region?: string; country?: string },
  ipAddress: string | null,
  timestamp: Date
): Promise<void> {
  return withSpan(
    'login.check_failed_attempts',
    async (_span) => {
      try {
        addSpanAttributes({
          'check.email': email,
          'check.location.city': geoLocation.city || 'unknown',
          'check.location.country': geoLocation.country || 'unknown',
        });

        // Check failed attempts in the last 15 minutes
        const fifteenMinutesAgo = new Date(timestamp.getTime() - 15 * 60 * 1000);

        const recentFailedAttempts = await prisma.login_logs.count({
          where: {
            email,
            success: false,
            createdAt: {
              gte: fifteenMinutesAgo,
              lte: timestamp,
            },
          },
        });

        addSpanAttributes({
          'check.failed_attempts_count': recentFailedAttempts,
          'check.time_window_minutes': 15,
        });

        // Send alert if 3 or more failed attempts in 15 minutes
        const FAILED_ATTEMPT_THRESHOLD = 3;
        if (recentFailedAttempts >= FAILED_ATTEMPT_THRESHOLD) {
          addSpanEvent('failed_attempts_threshold_reached', {
            threshold: FAILED_ATTEMPT_THRESHOLD,
            actual_count: recentFailedAttempts,
          });

          // Record suspicious login metric
          suspiciousLoginCounter.add(1, {
            'user.email': email,
            'failed.attempts': recentFailedAttempts,
            'geo.country': geoLocation.country || 'unknown',
            'geo.city': geoLocation.city || 'unknown',
          });

          // Only send alert on the 3rd, 6th, 9th attempt, etc. to avoid spam
          if (recentFailedAttempts % FAILED_ATTEMPT_THRESHOLD === 0) {
            addSpanEvent('sending_failed_attempts_alert', {
              'alert.email': email,
              'alert.attempts': recentFailedAttempts,
            });

            await sendFailedLoginAlert(
              email,
              userName || null,
              recentFailedAttempts,
              {
                city: geoLocation.city,
                region: geoLocation.region,
                country: geoLocation.country,
                ipAddress: ipAddress || undefined,
              },
              timestamp
            );

            addSpanEvent('failed_attempts_email_sent');
          } else {
            addSpanEvent('skipped_alert_to_avoid_spam', {
              modulo_result: recentFailedAttempts % FAILED_ATTEMPT_THRESHOLD,
            });
          }
        }
      } catch (error) {
        console.error('Error checking failed attempts:', error);
      }
    },
    {
      'service.operation': 'failed_attempts_check',
    }
  );
}

/**
 * Get recent login history for a user
 */
export async function getLoginHistory(userId: string, limit = 10) {
  return prisma.login_logs.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      email: true,
      ipAddress: true,
      country: true,
      city: true,
      region: true,
      success: true,
      failureReason: true,
      createdAt: true,
    },
  });
}

/**
 * Get failed login attempts for a user
 */
export async function getFailedLoginAttempts(email: string, sinceDate: Date) {
  return prisma.login_logs.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: sinceDate,
      },
    },
  });
}
