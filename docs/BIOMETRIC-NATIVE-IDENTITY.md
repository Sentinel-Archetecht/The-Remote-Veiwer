# Biometric Native Digital Identity

**Status:** Design intent (2026-09-09)  
**Scope:** Biometric (passkey / FIDO2) authentication for every Remote Viewer and for The Remote Viewer NETWORK, integrated with open-source native digital identity, while preserving local-first doctrine and a federal compliance posture.

**Authority:** Aligns with `docs/REALITY.md`, `docs/locked/03-Destroy-Equals-Restart.md`, `docs/locked/01-Identity-Layer.md`, and `docs/IDENTITY.md`. Does not claim implementation beyond what is already LIVE or PROVEN.

---

## 1. Goals

- Biometric / passkey authentication for **all** authentication surfaces (individual Viewer and NETWORK).
- Integration with **open-source native digital identity** (WebAuthn / FIDO2, optional Verifiable Credentials / DIDs).
- Maintain **U.S. federal compliance posture** (primarily NIST SP 800-63-4 and companion volumes).
- Preserve TRV invariants:
  - Local-first
  - Zero-custody packs
  - Optical air-gap
  - Device-held keys
  - **Destroy = Restart**
  - No company recovery of age keys or primary identity material

---

## 2. Layered Authentication Model

| Surface | Requirement | Mechanism | Target Assurance |
|---------|-------------|-----------|------------------|
| Local vault / age keys / optical air-gap | Biometric (required) | Platform authenticator (Face ID / fingerprint / Windows Hello) or FIDO2 key via WebAuthn | AAL2–AAL3 |
| Viewer Hub account | Biometric primary | WebAuthn passkey; existing Better Auth factors as secondary | AAL2+ |
| Mobile / Expo client (parked) | Biometric gate on Ed25519 vault | Native biometric + SecureStore / Keychain | AAL2–AAL3 |
| On-chain governance / entitlement | Passkey or scoped session key | SIMD-0075 secp256r1 + smart-wallet authority | High |
| NETWORK admin / authority changes | Fresh biometric / passkey challenge | Root passkey; no long-lived high-privilege sessions | AAL3-equivalent |

---

## 3. Open-Source Native Digital Identity Components

| Layer | Recommended Component | Role |
|-------|-----------------------|------|
| Platform biometric | `expo-local-authentication` / platform WebAuthn / `react-native-passkey` | User Verification (UV) gate |
| Secure storage | `expo-secure-store` / Keychain / StrongBox | Biometric-protected Ed25519 / age-key material |
| Passkey / WebAuthn | Hanko or self-hosted ZITADEL (+ platform bridges) | Phishing-resistant primary authenticator |
| NETWORK identity fabric | Self-hosted ZITADEL (preferred) or Keycloak / Ory | Multi-tenant identity; enforce passkey enrollment |
| On-chain authority | LazorKit-style or custom + SIMD-0075 | Passkey-bound governance |
| Optional VC / DID | Procivis One Open Source or Multipaz-style SDK | Selective disclosure (user-controlled) |

Local Ed25519 identity remains the sovereign root. A WebAuthn / passkey public key may be bound as an additional authority; it never replaces age-key or Ed25519 material.

---

## 4. Federal Compliance Posture (NIST SP 800-63-4)

- **Baseline:** AAL2 (phishing-resistant multi-factor or single-factor cryptographic authenticator with UV).
- **Elevated / network-critical:** AAL3-equivalent (hardware cryptographic authenticator + UV + fresh challenge).
- Prefer FIDO2 / WebAuthn authenticators. FIPS 140-3 validated hardware keys (e.g. YubiKey FIPS series) provide the clearest path for higher assurance.
- Platform authenticators (Secure Enclave / StrongBox) are acceptable for AAL2 when UV is required.
- Identity proofing remains at the current age + OFAC level. Any future elevation follows SP 800-63A-4.
- Federation (if ever used) follows SP 800-63C-4.
- **No recovery oracle** is required by federal guidance and is explicitly rejected by TRV doctrine.

---

## 5. Network-Wide Controls

- Mandatory enrollment of at least one phishing-resistant authenticator (passkey or FIDO2 key) for every Viewer and every network operator.
- Short-lived, tightly scoped session keys for routine actions; root passkey required for authority changes and high-value movements.
- Continuous monitoring of authentication events (UV failures, new authenticator registration, high-privilege actions).
- Supply-chain and dependency controls on all identity components.
- Optical air-gap path remains independent of the network identity fabric.

---

## 6. Threat Model Summary (Biometric + Native Identity Layer)

**Highest-value assets:** age keys, optical-air-gap material, Ed25519 vault, device-bound passkeys.

**Accepted residual risk (by design):**  
Complete loss of all registered devices and biometrics → permanent loss of age keys and local vault material. This is intentional under “Destroy = Restart” and is compatible with the absence of a central recovery service.

**Primary mitigations:**
- Device-bound (preferably non-synced) credentials for highest-value material.
- `userVerification: required` on all high-assurance WebAuthn ceremonies.
- Strict deep-link / redirect allow-listing.
- Conservative session-key limits and short expiries.
- Clear intent display + simulation before every biometric prompt that can move value or change authority.
- Self-hosted identity fabric with passkey-only admin access.

---

## 7. Implementation Roadmap (Parallel Tracks)

1. **Local biometric gate** (highest priority)  
   Strengthen Citizen lock and Ed25519 / age-key vault with required UV on mobile and desktop.

2. **Hub passkey primary**  
   Make WebAuthn the preferred (later required) factor for Viewer Hub login.

3. **Identity fabric for the NETWORK**  
   Deploy self-hosted ZITADEL (or equivalent) and enforce passkey enrollment.

4. **On-chain binding**  
   When `trv_governance` advances, register passkey authorities via SIMD-0075.

5. **Compliance documentation** (ongoing)  
   Map every flow to NIST SP 800-63-4 AAL/IAL statements; prepare evidence packages.

Tracks 1, 2, and 5 can start immediately and run concurrently. Track 3 depends on hosting capacity. Track 4 is gated by governance readiness but can be designed in parallel.

---

## 8. Technical Notes

- **SIMD-0075** (secp256r1 precompile) is activated on mainnet / testnet / devnet and is supported by both Agave and Firedancer. It enables native on-chain verification of WebAuthn / passkey signatures.
- WebAuthn Level 3 is a W3C Recommendation (August 2026). FIDO2 = WebAuthn + CTAP.
- Prefer device-bound passkeys for local high-value material; platform-synced passkeys may be used for lower-privilege Hub sessions if desired.

---

## 9. Relationship to Existing Docs

- Does not override `docs/REALITY.md` or any locked doctrine in `docs/locked/`.
- Extends the identity and security posture described in `docs/IDENTITY.md`, `docs/locked/01-Identity-Layer.md`, `docs/locked/03-Destroy-Equals-Restart.md`, and `docs/locked/06-Identity-Technical-Stack.md`.
- Solana governance remains scaffold until proven otherwise.

---

*This document records design intent only. Implementation status is governed solely by `docs/REALITY.md` and `STATUS.md`.*
