# Repository Patch Commands — Biometric Gate + Hub Passkey

**Status:** Starter patches added 2026-09-09  
**Parent docs:**  
- [`docs/BIOMETRIC-NATIVE-IDENTITY.md`](BIOMETRIC-NATIVE-IDENTITY.md)  
- [`docs/BIOMETRIC-NATIVE-IDENTITY-UPGRADES.md`](BIOMETRIC-NATIVE-IDENTITY-UPGRADES.md)

These files are **starter implementations only**. They do not change LIVE behavior until you wire them into the existing unlock and auth paths and prove them on a real device.

---

## Files Added

| Path | Purpose |
|------|---------|
| `apps/hub/src/lib/trv/biometric-gate.ts` | Phase 1 — platform UV gate for local vault unlock |
| `apps/hub/src/lib/auth/passkey-notes.ts` | Phase 2 — Better Auth WebAuthn / passkey integration sketch |
| `docs/PATCH-BIOMETRIC-PASSKEY.md` | This command / integration guide |

---

## Phase 1 — Wire the Biometric Gate

1. Locate the existing PIN / hash unlock path for the Ed25519 vault (the code that currently releases private key material after PIN verification).

2. Import and call the gate **before** any decryption or signing:

```ts
import { gateVaultUnlock } from "@/lib/trv/biometric-gate";

const gate = await gateVaultUnlock("Unlock local Ed25519 vault");
if (!gate.ok) {
  // If reason === "unavailable", show the existing PIN / hash UI as explicit fallback.
  // If reason === "cancelled" or "failed", abort.
  return;
}
// Only now load / decrypt the seed into a short-lived in-memory signer.
```

3. Ensure the unlocked signer is discarded on process restart / tab close.

4. Test on a real device. Update `docs/REALITY.md` only after operator-proven success.

---

## Phase 2 — Enable Hub Passkey Primary

1. Confirm the exact plugin API for the installed `better-auth` version:

```bash
cd apps/hub
npm ls better-auth
# Inspect node_modules/better-auth for passkey / webauthn plugin exports
```

2. Add the passkey plugin to the Better Auth configuration (see sketch in `apps/hub/src/lib/auth/passkey-notes.ts`).

3. After first successful login, prompt the user to enroll a passkey with `userVerification: "required"`.

4. Once a passkey is registered, make "Sign in with passkey" the primary button; keep existing factors as secondary.

5. For high-assurance actions inside the Hub, require a fresh passkey assertion.

6. Store only credential ID, public key, AAGUID, signCount, transports.

---

## Git Commands (if applying locally)

```bash
git fetch origin
git checkout TheRemoteViewer
git pull origin TheRemoteViewer

# Files already committed on remote:
#   apps/hub/src/lib/trv/biometric-gate.ts
#   apps/hub/src/lib/auth/passkey-notes.ts
#   docs/PATCH-BIOMETRIC-PASSKEY.md
```

If you need to re-apply or cherry-pick later:

```bash
git show HEAD:apps/hub/src/lib/trv/biometric-gate.ts
git show HEAD:apps/hub/src/lib/auth/passkey-notes.ts
```

---

## Promotion Rule

Nothing becomes LIVE or PROVEN until it has been executed under operator control on a real device (or is a hosted surface that is actually running) and `docs/REALITY.md` / `STATUS.md` have been updated.

---

*Starter patches only. Wire, test, prove, then record.*
