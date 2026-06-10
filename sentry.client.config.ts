import * as Sentry from '@sentry/nextjs';

// Graceful degrade: no-op when NEXT_PUBLIC_SENTRY_DSN is not set
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    debug: false,
  });
}
