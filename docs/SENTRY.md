# Sentry Error Tracking — Command Deck

**Added:** 2026-09-12

## Status

Optional, non-breaking instrumentation is in place.

- `apps/command-deck/src/lib/sentry.ts` — safe initializer + capture helpers
- `ErrorBoundary` already calls `captureReactError` when an error is caught

Nothing happens until you install the package and set a DSN.

## Activation steps

1. Install the SDK:
   ```bash
   cd apps/command-deck
   npm install @sentry/react
   ```

2. Set the environment variable (never commit the real value):
   ```
   VITE_SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>
   ```

3. Call the initializer as early as possible (before React mounts), e.g. in the main entry or router bootstrap:
   ```ts
   import { initSentry } from "@/lib/sentry";
   initSentry();
   ```

4. (Recommended for production) Add source-map upload with the Vite plugin:
   ```bash
   npm install --save-dev @sentry/vite-plugin
   ```
   Then add to `vite.config.ts` (after other plugins):
   ```ts
   import { sentryVitePlugin } from "@sentry/vite-plugin";

   // inside defineConfig plugins array (build only)
   sentryVitePlugin({
     org: process.env.SENTRY_ORG,
     project: process.env.SENTRY_PROJECT,
     authToken: process.env.SENTRY_AUTH_TOKEN,
   }),
   ```
   Set `build.sourcemap: "hidden"` when the plugin is active.

## What is already wired

- `ErrorBoundary.componentDidCatch` reports to Sentry when the DSN is present.
- The helper is dynamic-import based, so the app continues to build and run even if `@sentry/react` is not installed.

## Free-tier guidance

- Keep `tracesSampleRate` low in production (0.1–0.2).
- Prefer `replaysOnErrorSampleRate: 1.0` and a very low `replaysSessionSampleRate`.
- One project named `command-deck` or `remote-viewer` is sufficient to start.

## React 19 note

If the project moves to React 19, you can also attach Sentry’s `reactErrorHandler` to `createRoot` options for global coverage. The current ErrorBoundary + capture helper remains valid and recommended for scoped UI recovery.
