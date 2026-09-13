# Sandbox JSX Parse Error Note

**Date observed:** 2026-09-12

## Symptom

Vite + oxc transform failure in the live Grok sandbox environment:

```
[plugin:vite:oxc] Transform failed with 1 error:

[PARSE_ERROR] Adjacent JSX elements must be wrapped in an enclosing tag.
src/components/playground/playground.tsx:293:7
```

Additional messages appeared:
- “The watch did not load. Reload. If it still fails, the field is down — not your keys.”
- Failed dynamic import of a route module.

## Root cause

React/JSX requires every `return` that produces multiple top-level elements to be wrapped in a single parent (a real element or a fragment `<>...</>`). The live sandbox session contained a divergent edit that left two or more sibling JSX elements adjacent without a wrapper. The committed code on branch `TheRemoteViewer` does not contain this error.

## Recovery steps

1. In the sandbox editor, locate the `</div>` reported near the error line.
2. Identify the adjacent sibling elements inside the nearest `return`.
3. Wrap them:

```tsx
return (
  <>
    {/* element A */}
    {/* element B */}
  </>
);
```

or a single parent `<div>` / other container.

4. Save. Hot reload should resume once the transform succeeds.

## Status of committed source

The version of `apps/command-deck/src/components/playground/playground.tsx` on `TheRemoteViewer` (as of this note) has properly nested returns and does not exhibit the adjacent-elements error.

If the sandbox continues to show the error after a clean reload, discard the local sandbox changes and re-sync from the branch.
