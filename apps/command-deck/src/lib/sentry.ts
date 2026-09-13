/**
 * Optional Sentry initialization for the Command Deck.
 *
 * - Does nothing unless VITE_SENTRY_DSN is set.
 * - Safe to import early in the entry point.
 * - Keeps the dependency optional so the app builds without Sentry installed.
 *
 * To activate:
 * 1. npm install @sentry/react
 * 2. Set VITE_SENTRY_DSN in the environment
 * 3. Import this module as early as possible (before React mounts)
 * 4. (Recommended) Add @sentry/vite-plugin for production source maps
 */

import type { ErrorInfo } from "react";

let sentryReady = false;

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn || sentryReady) return;

  // Dynamic import keeps @sentry/react optional at build time
  import("@sentry/react")
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        integrations: [
          Sentry.browserTracingIntegration?.() ?? undefined,
          Sentry.replayIntegration?.() ?? undefined,
        ].filter(Boolean),
        tracesSampleRate: import.meta.env.PROD ? 0.15 : 1.0,
        replaysSessionSampleRate: 0.05,
        replaysOnErrorSampleRate: 1.0,
        sendDefaultPii: false,
      });
      sentryReady = true;
    })
    .catch(() => {
      // Package not installed or failed to load — silent no-op
    });
}

/**
 * Capture an exception if Sentry is available.
 * Safe to call from ErrorBoundary.componentDidCatch.
 */
export function captureException(error: unknown, context?: { extra?: Record<string, unknown> }): void {
  if (!sentryReady) return;
  import("@sentry/react")
    .then((Sentry) => {
      Sentry.captureException(error, context);
    })
    .catch(() => {});
}

/**
 * Helper for ErrorBoundary.componentDidCatch
 */
export function captureReactError(error: Error, errorInfo: ErrorInfo): void {
  captureException(error, {
    extra: { componentStack: errorInfo.componentStack },
  });
}
