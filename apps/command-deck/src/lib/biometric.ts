import { b64ToBuf, bufToB64 } from "@/lib/identity";

const CRED_KEY = "trv.webauthn.cred";
const SESSION_KEY = "trv.session.unlock";
const PIN_HASH = "trv.session.pin";

export type GateResult =
  | { ok: true }
  | { ok: false; reason: "cancelled" | "unavailable" | "pin" };

function rpId() {
  return window.location.hostname;
}

function userBytes(id: string) {
  const raw = new TextEncoder().encode(id || "viewer");
  const out = new Uint8Array(16);
  out.set(raw.slice(0, 16));
  return out;
}

export function sessionOpen() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSessionOpen() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* blocked */
  }
}

export function hasEnrolledBiometric() {
  try {
    return Boolean(localStorage.getItem(CRED_KEY));
  } catch {
    return false;
  }
}

export function hasSessionPin() {
  try {
    return Boolean(localStorage.getItem(PIN_HASH));
  } catch {
    return false;
  }
}

export async function canBiometric() {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function enrollBiometric(userId: string, displayName: string): Promise<GateResult> {
  if (!(await canBiometric())) return { ok: false, reason: "unavailable" };
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "The Remote Viewer", id: rpId() },
        user: { id: userBytes(userId), name: displayName || "Viewer", displayName: displayName || "Viewer" },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null;
    if (!cred) return { ok: false, reason: "cancelled" };
    localStorage.setItem(CRED_KEY, bufToB64(new Uint8Array(cred.rawId)));
    markSessionOpen();
    return { ok: true };
  } catch (err) {
    if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "AbortError")) {
      return { ok: false, reason: "cancelled" };
    }
    return { ok: false, reason: "unavailable" };
  }
}

export async function gateVaultUnlock(reason: string): Promise<GateResult> {
  void reason;
  if (!(await canBiometric())) return { ok: false, reason: "unavailable" };
  let stored = "";
  try {
    stored = localStorage.getItem(CRED_KEY) ?? "";
  } catch {
    stored = "";
  }
  if (!stored) return { ok: false, reason: "unavailable" };
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rpId: rpId(),
        allowCredentials: [{ type: "public-key", id: b64ToBuf(stored).buffer as ArrayBuffer }],
        userVerification: "required",
        timeout: 60_000,
      },
    });
    if (!assertion) return { ok: false, reason: "cancelled" };
    markSessionOpen();
    return { ok: true };
  } catch (err) {
    if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "AbortError")) {
      return { ok: false, reason: "cancelled" };
    }
    return { ok: false, reason: "unavailable" };
  }
}

export async function setSessionPin(pin: string) {
  if (!/^\d{6}$/.test(pin)) throw new Error("Six digits.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`trv-session-pin:${pin}`));
  localStorage.setItem(PIN_HASH, bufToB64(new Uint8Array(digest)));
  markSessionOpen();
}

export async function unlockWithPin(pin: string): Promise<GateResult> {
  if (!/^\d{6}$/.test(pin)) return { ok: false, reason: "pin" };
  const stored = localStorage.getItem(PIN_HASH);
  if (!stored) {
    await setSessionPin(pin);
    return { ok: true };
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`trv-session-pin:${pin}`));
  if (bufToB64(new Uint8Array(digest)) !== stored) return { ok: false, reason: "pin" };
  markSessionOpen();
  return { ok: true };
}
