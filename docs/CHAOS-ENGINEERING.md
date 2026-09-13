# Chaos Engineering — Command Deck

**Added:** 2026-09-12

Chaos engineering is the practice of deliberately injecting controlled failures to uncover weaknesses before they appear in production. The goal is confidence, not destruction.

## Principles We Follow

1. Define steady-state behavior with measurable metrics *before* any failure.
2. Inject one realistic failure at a time.
3. Keep the blast radius small and expand only after success.
4. Observe recovery (or graceful degradation) against the hypothesis.
5. Automate once the manual experiments prove valuable.

## First Concrete Experiment — Command Deck

### Experiment Name
`CD-01: HUB / Watch Load Under Network Degradation`

### Hypothesis
When network latency of 800–1200 ms or intermittent 15 % packet loss is introduced between the Command Deck and the Viewer Hub (or any critical API), the deck will:
- remain usable (no full-page crash),
- show explicit loading / degraded-state UI within 2 seconds,
- recover cleanly once the network returns to normal,
- report the error via the existing ErrorBoundary + optional Sentry path if a hard failure occurs.

### Steady-State Metrics (baseline before chaos)
- Watch / briefing load succeeds in < 1.5 s under normal conditions.
- No unhandled exceptions in console or Sentry.
- Canvas and panels remain interactive.
- HUB pair / live status continues to update.

### Failure Injection (controlled)
- Use browser DevTools Network throttling (Slow 3G or custom 1000 ms latency + 15 % loss), **or**
- MSW / Playwright route handlers that delay or fail selected Hub endpoints, **or**
- Feature-flagged client-side delay wrapper around critical fetch calls (internal builds only).

### Success Criteria
- ErrorBoundary (if triggered) shows the fallback UI and allows reset.
- No complete white-screen or unrecoverable state.
- User can retry or navigate away cleanly after the fault is removed.
- Any captured exception appears in Sentry (when DSN is configured) with useful component stack.

### Blast Radius
- Internal / staging sessions only.
- Prefer feature-flag or query-param gating so normal users are never affected.
- Stop condition: any unhandled crash that escapes the ErrorBoundary or total loss of the main shell.

### Observation Tools Already in Place
- `ErrorBoundary` (runtime isolation + optional Sentry reporting)
- Optional Sentry (`docs/SENTRY.md`)
- Browser console + Network panel
- Existing pulse / live metrics in the deck

### How to Run (manual first)
1. Establish baseline metrics on a healthy session.
2. Enable the chosen fault injection method.
3. Exercise watch load, panel open/close, and HUB status.
4. Record whether the hypothesis held.
5. Remove the fault and confirm clean recovery.
6. Document results and any code improvements needed.

## Next Experiments (suggested order)
1. Offline / optical-air-gap style disconnection.
2. Malformed or unexpected API payloads.
3. Canvas / WebGL context loss or heavy main-thread pressure.
4. Rapid panel switching + state thrash.
5. Auth token expiry mid-session.

## Relationship to Existing Work
- Error Boundaries provide the containment layer.
- Sentry (when activated) provides the observation layer.
- Chaos experiments deliberately exercise both.

Start small, measure, improve, then automate.
