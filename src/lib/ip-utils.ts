import { headers } from 'next/headers';
import { recordApiCall } from './metrics';

export interface GeoLocation {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Get client IP address from request headers
 */
export async function getClientIP(): Promise<string | null> {
  const headersList = await headers();

  // Check various headers that might contain the real IP
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const cfConnectingIP = headersList.get('cf-connecting-ip');

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list of IPs
    // The first one is the original client IP
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return null;
}

/**
 * Get user agent from request headers
 */
export async function getUserAgent(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('user-agent');
}

/**
 * Get geolocation data from IP address using ip-api.com (free, no API key required)
 * Rate limit: 45 requests per minute
 */
export async function getGeoLocationFromIP(ip: string): Promise<GeoLocation> {
  const startTime = Date.now();
  let success = false;
  let statusCode: number | undefined;
  let errorType: string | undefined;

  try {
    // Skip geolocation for localhost/private IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'Local',
        city: 'Local',
        region: 'Local',
      };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName,lat,lon`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    statusCode = response.status;

    if (!response.ok) {
      console.error('Failed to fetch geolocation:', response.statusText);
      errorType = `http_${statusCode}`;
      return {};
    }

    const data = await response.json();

    if (data.status !== 'success') {
      console.error('Geolocation API returned error:', data);
      errorType = 'api_error';
      return {};
    }

    success = true;
    return {
      country: data.country,
      city: data.city,
      region: data.regionName,
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    errorType = error instanceof Error ? error.name : 'unknown_error';
    return {};
  } finally {
    // Record API call metrics
    recordApiCall({
      service: 'ip-api.com',
      endpoint: '/json',
      duration: Date.now() - startTime,
      statusCode,
      success,
      error: errorType,
    });
  }
}

/**
 * Alternative: Get geolocation from Cloudflare headers (if using Cloudflare)
 */
export async function getGeoLocationFromCloudflare(): Promise<GeoLocation> {
  const headersList = await headers();

  return {
    country: headersList.get('cf-ipcountry') || undefined,
    city: headersList.get('cf-ipcity') || undefined,
    region: headersList.get('cf-region') || undefined,
    latitude: headersList.get('cf-iplatitude') ? parseFloat(headersList.get('cf-iplatitude')!) : undefined,
    longitude: headersList.get('cf-iplongitude') ? parseFloat(headersList.get('cf-iplongitude')!) : undefined,
  };
}
