# ErrorBoundary — Usage Guide

**Added:** 2026-09-12  
**File:** `apps/command-deck/src/components/ErrorBoundary.tsx`

## Purpose

Isolates *runtime* JavaScript errors in a subtree so one failing panel or canvas does not take down the entire Command Deck.

**Important:** Error Boundaries do **not** catch build-time or parse-time errors (including the recent “Adjacent JSX elements must be wrapped” Vite/oxc failure). Those must be fixed in source before React mounts.

## Basic usage

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

<ErrorBoundary
  fallbackTitle="Field unavailable"
  fallbackMessage="The live field could not render. Reset or reload the watch."
>
  <PlaygroundCanvas />
</ErrorBoundary>
```

## Recommended placement (highest value first)

1. Around `<PlaygroundCanvas />` (inside Suspense / FieldGate) — protects the WebGL / physics surface.
2. Around each major panel (`VaultPanel`, `RepairPanel`, `AffairsPanel`, `SpecialistPanel`, `FriendsPanel`, `ShopPanel`, `BoardDashboard`, etc.).
3. Around `<Toolbar />` and `<PhysicsLegend />` if desired.
4. Optional outermost boundary at the root of the Command Deck as a last-resort catch.

## Props

| Prop              | Type       | Description                                      |
|-------------------|------------|--------------------------------------------------|
| `children`        | ReactNode  | Required. The subtree to protect.                |
| `fallbackTitle`   | string     | Optional heading shown on error.                 |
| `fallbackMessage` | string     | Optional explanatory text.                       |
| `onReset`         | () => void | Optional callback when the user clicks Reset.    |
| `className`       | string     | Optional extra classes on the fallback container.|

## Next steps when builds are available again

- Import and wrap the high-value subtrees listed above.
- Optionally wire `onReset` to clear relevant store state.
- Replace the `console.error` in `componentDidCatch` with your preferred telemetry.
