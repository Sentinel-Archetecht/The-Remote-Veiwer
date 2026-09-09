# Biometric Native Digital Identity — Beyond Scaffold Upgrades

**Status:** Executable upgrade plan (2026-09-09)  
**Parent:** [`docs/BIOMETRIC-NATIVE-IDENTITY.md`](BIOMETRIC-NATIVE-IDENTITY.md)  
**Authority:** `docs/REALITY.md` and `STATUS.md` remain the sole sources of LIVE / PROVEN claims. This document does not promote any surface.

Goal: take every currently scaffolded or hash-only surface related to biometric authentication and native digital identity and define the concrete next steps that move it beyond scaffold.

---

## Current State (from REALITY / STATUS)

| Surface | Current State | Target after upgrades |
|---------|---------------|-----------------------|
| Citizen lock | LIVE (on-device hash) | LIVE (biometric UV required) |
| Native Ed25519 wallet | LIVE (PIN vault) | LIVE (biometric-gated vault) |
| Viewer Hub auth | LIVE (Better Auth) | LIVE (WebAuthn passkey primary) |
| Mobile Expo client | PARKED / SCAFFOLD | Beyond scaffold (biometric unlock path) |
| NETWORK identity fabric | None / ad-hoc | Beyond scaffold (self-hosted passkey IAM) |
| Solana `trv_governance` | SCAFFOLD | Beyond scaffold (passkey authority design + binding) |
| Compliance mapping | Absent | Beyond scaffold (NIST SP 800-63-4 statements) |

---

## Upgrade 1 — Local Biometric Gate (Citizen Lock + Ed25519 Vault)

**Current:** On-device hash unlock.  
**Target:** Required User Verification (UV) via platform biometric before any release of Ed25519 or age-key material.

### Concrete steps
1. Add platform biometric check (`expo-local-authentication` on mobile; WebAuthn / OS biometric on desktop) as the primary gate.
2. Store the Ed25519 seed / private key (and age-key material) in platform secure storage with biometric access control flags.
3. Keep existing PIN / hash path strictly as fallback when biometrics are unavailable or explicitly disabled by the user.
4. On successful UV, release a short-lived in-memory signer only. Never persist unlocked state across process death.
5. Wire the same gate into the optical air-gap / Path B entry points so sensitive local operations inherit the biometric requirement.
6. Preserve “Destroy = Restart”: biometric success is still required to reach the destroy confirmation; after confirmation all local material is zeroed with no recovery path.

**Done when:** A physical device can unlock the existing Ed25519 vault only after successful biometric presentation, and the unlock is lost on process restart.

---

## Upgrade 2 — Viewer Hub Passkey Primary

**Current:** Better Auth (email / Google / X) + age + OFAC gate.  
**Target:** WebAuthn passkey as preferred (later required) factor for Hub login.

### Concrete steps
1. Integrate WebAuthn registration and assertion into the existing Better Auth flow (or a thin wrapper around it).
2. On first successful login, prompt the user to enroll a passkey.
3. Make passkey the preferred factor; retain existing factors as secondary during transition.
4. Enforce `userVerification: "required"` for high-assurance Hub actions.
5. Record authenticator AAGUID / credential ID only; never store biometric templates.
6. Document the AAL2 mapping for the Hub login surface.

**Done when:** A user can log into the live Hub using a passkey, and the enrollment prompt is live on the production Hub.

---

## Upgrade 3 — Mobile Expo Client (Parked → Beyond Scaffold)

**Current:** `apps/mobile` is PARKED / SCAFFOLD.  
**Target:** Functional biometric unlock path for the local Ed25519 vault and optical air-gap flows.

### Concrete steps
1. Un-park a minimal Expo (or bare RN) surface that can:
   - Request biometric permission
   - Perform UV
   - Unlock the local vault via SecureStore / Keychain
2. Re-use the same biometric gate defined in Upgrade 1.
3. Expose only the local sovereign path first (no requirement for full Hub feature parity).
4. Keep deep-link / Portal handling ready for later LazorKit or custom passkey flows, but do not block on them.
5. Document the device matrix (iOS / Android) and any GrapheneOS / hardened-device notes.

**Done when:** On a real device the parked mobile path can unlock the local vault with biometrics and the unlock is process-scoped.

---

## Upgrade 4 — NETWORK Identity Fabric

**Current:** No dedicated self-hosted identity fabric.  
**Target:** Self-hosted open-source IAM that enforces phishing-resistant authenticators for all Viewers and operators.

### Concrete steps
1. Deploy self-hosted ZITADEL (preferred) or Keycloak / Ory in a TRV-controlled environment.
2. Configure multi-tenancy so each Viewer organization is isolated.
3. Enforce mandatory passkey (or FIDO2 hardware key) enrollment for every account that can act on the NETWORK.
4. Restrict admin / operator roles to passkey-only (no password fallback for elevated roles).
5. Wire authentication event logging and basic alerting (new authenticator, UV failure spikes, high-privilege actions).
6. Keep the fabric completely separate from local age-key and optical-air-gap material.

**Done when:** A new Viewer or operator cannot obtain NETWORK privileges without enrolling a phishing-resistant authenticator, and the fabric is under TRV operational control.

---

## Upgrade 5 — On-Chain Binding (trv_governance Scaffold → Design + Binding Ready)

**Current:** `trv_governance` is SCAFFOLD; Ed25519 keys in Hub are chain-ready but not mainnet.  
**Target:** Passkey authority design and binding path ready for the moment Track A advances.

### Concrete steps
1. Define the authority hierarchy:
   - Root / owner = device-bound passkey (secp256r1)
   - Session keys = short-lived Ed25519 with strict on-chain limits
2. Map TRV actions to signers (daily watch / claim → session key; authority change / large VALUE → fresh passkey).
3. Specify how the passkey public key is registered on governance accounts once the program is live.
4. Confirm SIMD-0075 usage and Firedancer + Agave support (already verified).
5. Keep all on-chain work gated behind the existing Track A build-host requirement; do not claim mainnet.

**Done when:** The authority model, session-key limits, and registration flow are written and reviewed, ready for implementation the moment the governance program leaves scaffold.

---

## Upgrade 6 — Compliance Mapping (Beyond Scaffold Documentation)

**Current:** No formal NIST SP 800-63-4 mapping.  
**Target:** Written AAL / IAL statements for every authentication surface.

### Concrete steps
1. Produce a one-page mapping of each surface (local vault, Hub login, NETWORK admin, on-chain) to the corresponding AAL target.
2. Record authenticator types and UV requirements.
3. Explicitly document the accepted residual risk of total device + biometric loss (Destroy = Restart).
4. Keep the mapping under `docs/` and reference it from SECURITY.md / IDENTITY docs.

**Done when:** A reviewer can open a single document and see the AAL statement for every live or in-progress authentication surface.

---

## Parallel Execution Order

| Priority | Upgrade | Can start now? | Dependencies |
|----------|---------|----------------|--------------|
| 1 | Local biometric gate | Yes | None |
| 2 | Hub passkey primary | Yes | Better Auth surface |
| 3 | Mobile Expo beyond scaffold | Yes | Upgrade 1 patterns |
| 4 | NETWORK identity fabric | Yes (ops capacity) | Hosting |
| 5 | On-chain binding design | Yes (design only) | Track A for implementation |
| 6 | Compliance mapping | Yes | Parallel with all |

---

## Explicit Non-Goals (Still Scaffold or Out of Scope)

- Company recovery of age keys or primary local material.
- Promoting Solana `trv_governance` to LIVE / mainnet without a build host and REALITY update.
- Replacing the optical air-gap with any network identity service.
- Claiming AAL3 or federal authorization without independent assessment.

---

## Promotion Rule

No surface listed above becomes LIVE or PROVEN until it has been executed under operator control on a real device (or is a hosted surface that is actually running) and `docs/REALITY.md` / `STATUS.md` have been updated accordingly. This document only defines the upgrades that take the work beyond scaffold.

---

*Parent design: [`BIOMETRIC-NATIVE-IDENTITY.md`](BIOMETRIC-NATIVE-IDENTITY.md)*
