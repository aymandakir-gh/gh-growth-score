import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Required for instrumentation.ts (Sentry server-side init) in Next.js 14
    instrumentationHook: true,
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
  automaticVercelMonitors: false,
  widenClientFileUpload: false,
});
