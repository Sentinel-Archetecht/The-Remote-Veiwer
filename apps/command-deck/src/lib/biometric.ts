import { b64ToBuf, bufToB64 } from "@/lib/identity";

const CRED_KEY = "trv.webauthn.cred";
const SESSION_KEY = "trv.session.unlock";
const PIN_HASH = "trv.session.pin";

export type GateResult =
  | { ok: true }
  | { ok: false; reason: "cancelled" | "unavailable" | "pin" };

let memoryUnlock = false;
let memoryPinHash = "";

function rpId() {
  return window.location.hostname;
}

function userBytes(id: string) {
  const raw = new TextEncoder().encode(id || "viewer");
  const out = new Uint8Array(16);
  out.set(raw.slice(0, 16));
  return out;
}

function readStore(key: string) {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeStore(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function sessionOpen() {
  if (memoryUnlock) return true;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSessionOpen() {
  memoryUnlock = true;
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* blocked */
  }
}

export function hasEnrolledBiometric() {
  return Boolean(readStore(CRED_KEY));
}

export function hasSessionPin() {
  return Boolean(memoryPinHash || readStore(PIN_HASH));
}

export async function canBiometric() {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    if (window.self !== window.top) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

async function pinDigest(pin: string) {
  const payload = `trv-session-pin:${pin}`;
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
    return bufToB64(new Uint8Array(digest));
  }
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) h = Math.imul(h ^ payload.charCodeAt(i), 16777619);
  return `fnv:${h >>> 0}`;
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
    writeStore(CRED_KEY, bufToB64(new Uint8Array(cred.rawId)));
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
  const stored = readStore(CRED_KEY);
  if (!stored) return { ok: false, reason: "unavailable" };
  try {
    const id = b64ToBuf(stored);
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rpId: rpId(),
        allowCredentials: [{ type: "public-key", id }],
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
  const hash = await pinDigest(pin);
  memoryPinHash = hash;
  writeStore(PIN_HASH, hash);
  markSessionOpen();
}

export async function unlockWithPin(pin: string): Promise<GateResult> {
  const clean = pin.replace(/\D/g, "").slice(0, 6);
  if (!/^\d{6}$/.test(clean)) return { ok: false, reason: "pin" };
  const stored = memoryPinHash || readStore(PIN_HASH);
  if (!stored) {
    await setSessionPin(clean);
    return { ok: true };
  }
  const hash = await pinDigest(clean);
  if (hash !== stored) return { ok: false, reason: "pin" };
  markSessionOpen();
  return { ok: true };
}
