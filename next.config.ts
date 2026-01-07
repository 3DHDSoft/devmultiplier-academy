import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable OpenTelemetry instrumentation
  experimental: {
    instrumentationHook: true,
  },
  async redirects() {
    return [
      {
        source: '/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/terms-of-service',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
