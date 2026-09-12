/**
 * Biometric User Verification gate for local Ed25519 / age-key material.
 *
 * Phase 1 starter — wire this in front of any code that currently unlocks
 * the PIN / hash vault. Does not claim LIVE until proven on a real device
 * and recorded in docs/REALITY.md.
 *
 * Rules:
 * - Prefer platform biometric / WebAuthn UV.
 * - PIN / hash remains only as explicit fallback.
 * - Never store biometric templates.
 * - Unlocked signer must be process-scoped (discarded on restart).
 */

export type UnlockResult =
  | { ok: true; method: "biometric" | "fallback" }
  | { ok: false; reason: "unavailable" | "cancelled" | "failed" | "unsupported" };

export type BiometricGateOptions = {
  /** Human-readable reason shown to the user */
  reason: string;
  /** When true, do not offer PIN/hash fallback */
  requireBiometric?: boolean;
  /** Existing credential IDs for WebAuthn allowCredentials (if already registered) */
  allowCredentialIds?: BufferSource[];
};

/**
 * Attempt platform User Verification before releasing local key material.
 */
export async function requireUserVerification(
  options: BiometricGateOptions
): Promise<UnlockResult> {
  const { reason, requireBiometric = false, allowCredentialIds } = options;

  // 1. WebAuthn UV when available (desktop / modern browsers / installed PWA)
  if (typeof window !== "undefined" && window.PublicKeyCredential) {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60_000,
        userVerification: "required",
        // rpId should match the production origin when deployed
        // rpId: "the-remote-viewer.grok.me",
      };

      if (allowCredentialIds && allowCredentialIds.length > 0) {
        publicKey.allowCredentials = allowCredentialIds.map((id) => ({
          type: "public-key",
          id,
        }));
      }

      const assertion = await navigator.credentials.get({ publicKey });
      if (assertion) {
        return { ok: true, method: "biometric" };
      }
    } catch (err) {
      // NotAllowedError = user cancelled; other errors = unavailable / failed
      const name = err instanceof Error ? err.name : "";
      if (name === "NotAllowedError") {
        return { ok: false, reason: "cancelled" };
      }
      // fall through
    }
  }

  // 2. No biometric path available
  if (requireBiometric) {
    return { ok: false, reason: "unavailable" };
  }

  // 3. Caller may now offer the existing PIN / hash fallback UI.
  // This function does not itself accept a PIN; it only signals that
  // biometric UV could not be completed and fallback is permitted.
  return { ok: false, reason: "unavailable" };
}

/**
 * Helper: call before any release of Ed25519 private key material.
 * Example integration:
 *
 *   const gate = await requireUserVerification({ reason: "Unlock local vault" });
 *   if (!gate.ok) {
 *     // show existing PIN / hash UI if gate.reason === "unavailable"
 *     // or abort if requireBiometric was true
 *     return;
 *   }
 *   // only now decrypt / load the seed into a short-lived signer
 */
export async function gateVaultUnlock(reason = "Unlock local Ed25519 vault") {
  return requireUserVerification({ reason });
}
