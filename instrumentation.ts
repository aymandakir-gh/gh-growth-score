// Next.js 14 instrumentation hook — loaded server-side before the app starts.
// Requires experimental.instrumentationHook: true in next.config.mjs (Next < 14.3).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
