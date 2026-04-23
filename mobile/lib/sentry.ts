import * as Sentry from '@sentry/react-native';

// =============================================
// Sentry — crash & error reporting
// =============================================
// Init is a no-op when EXPO_PUBLIC_SENTRY_DSN is not set, so local
// development and demo mode never report. Wrap the root component
// with `wrap()` (see app/_layout.tsx) to enable touch/navigation
// breadcrumbs and JS error capture.

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
const ENV = process.env.APP_ENV ?? 'development';

let initialized = false;

export function initSentry(): void {
  if (initialized || !DSN) return;
  Sentry.init({
    dsn: DSN,
    environment: ENV,
    // Release tracking — set via app version, not git sha (works without CI)
    release: undefined,
    // Performance: keep low default; tune up later when data volume warrants
    tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,
    // PII off by default — never send user emails / IPs unless we explicitly opt in
    sendDefaultPii: false,
    // Filter out noisy errors that aren't actionable
    ignoreErrors: [
      // Network blips
      'Network request failed',
      'Aborted',
      // Cancellations from user actions
      'Canceled',
    ],
  });
  initialized = true;
}

/**
 * HOC to wrap the root layout. Adds touch/navigation breadcrumbs
 * automatically. Safe to call when Sentry is not configured.
 */
export const wrap = Sentry.wrap;

/** Manually capture an unexpected error with optional context. */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!DSN) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

/** Tag the current scope with the authenticated user (no PII by default). */
export function setSentryUser(userId: string | null, role?: string | null): void {
  if (!DSN) return;
  if (!userId) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({ id: userId, ...(role ? { role } : {}) });
}
