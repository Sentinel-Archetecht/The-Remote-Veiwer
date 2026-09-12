/**
 * Hybrid wallet tests – classical Ed25519 + ML-DSA-65.
 * Run with: node --test scripts/wallet-hybrid.test.mjs
 *
 * Requires @noble/post-quantum (installed via package.json).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";

const ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const PKCS8_HEAD = Uint8Array.from([
  0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

function b58(bytes) {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      const x = digits[i] * 256 + carry;
      digits[i] = x % 58;
      carry = Math.floor(x / 58);
    }
    while (carry) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return "1".repeat(zeros) + digits.reverse().map((d) => ALPHA[d]).join("");
}

function b64urlToBytes(s) {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function seedToPkcs8(seed) {
  const out = new Uint8Array(48);
  out.set(PKCS8_HEAD);
  out.set(seed, 16);
  return out;
}

async function ed25519PubRaw(seed) {
  const priv = await crypto.subtle.importKey("pkcs8", seedToPkcs8(seed), { name: "Ed25519" }, true, ["sign"]);
  const jwk = await crypto.subtle.exportKey("jwk", priv);
  return b64urlToBytes(jwk.x);
}

// ---------------------------------------------------------------------------
// Classical Ed25519 (regression)
// ---------------------------------------------------------------------------

test("Ed25519 pubkey is 32 bytes and deterministic", async () => {
  const seed = Uint8Array.from({ length: 32 }, (_, i) => i + 1);
  const a = await ed25519PubRaw(seed);
  const b = await ed25519PubRaw(seed);
  assert.equal(a.length, 32);
  assert.deepEqual([...a], [...b]);
});

test("Ed25519 sign + verify", async () => {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const pub = await ed25519PubRaw(seed);
  const priv = await crypto.subtle.importKey("pkcs8", seedToPkcs8(seed), { name: "Ed25519" }, false, ["sign"]);
  const msg = new TextEncoder().encode("TRV-HELM|1|test");
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, priv, msg));
  assert.equal(sig.length, 64);
  const key = await crypto.subtle.importKey("raw", pub, { name: "Ed25519" }, false, ["verify"]);
  assert.equal(await crypto.subtle.verify({ name: "Ed25519" }, key, sig, msg), true);
});

// ---------------------------------------------------------------------------
// Post-quantum ML-DSA-65
// ---------------------------------------------------------------------------

test("ML-DSA-65 keygen is deterministic from 32-byte seed", () => {
  const seed = Uint8Array.from({ length: 32 }, (_, i) => (i * 13) % 256);
  const a = ml_dsa65.keygen(seed);
  const b = ml_dsa65.keygen(seed);
  assert.deepEqual([...a.publicKey], [...b.publicKey]);
  assert.deepEqual([...a.secretKey], [...b.secretKey]);
  // Public key size for ML-DSA-65 is 1952 bytes
  assert.equal(a.publicKey.length, 1952);
});

test("ML-DSA-65 sign + verify", () => {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const { publicKey, secretKey } = ml_dsa65.keygen(seed);
  const msg = new TextEncoder().encode("TRV-HELM|1|hybrid-test");
  const sig = ml_dsa65.sign(msg, secretKey);
  assert.ok(sig.length > 2000); // ML-DSA-65 signatures are ~3309 bytes
  assert.equal(ml_dsa65.verify(sig, msg, publicKey), true);

  // Tampered message must fail
  const bad = new TextEncoder().encode("TRV-HELM|1|tampered");
  assert.equal(ml_dsa65.verify(sig, bad, publicKey), false);
});

test("Hybrid: same seed yields independent classical + PQ keys", async () => {
  const seed = Uint8Array.from({ length: 32 }, (_, i) => 42 + i);
  const edPub = await ed25519PubRaw(seed);
  const { publicKey: pqPub } = ml_dsa65.keygen(seed);

  assert.equal(edPub.length, 32);
  assert.equal(pqPub.length, 1952);
  // Keys must be different
  assert.notDeepEqual([...edPub], [...pqPub.slice(0, 32)]);
});

test("Hybrid dual signature round-trip", async () => {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const msg = new TextEncoder().encode(`TRV-HELM|1|${b58(await ed25519PubRaw(seed))}|test`);

  // Classical
  const edPub = await ed25519PubRaw(seed);
  const edPriv = await crypto.subtle.importKey("pkcs8", seedToPkcs8(seed), { name: "Ed25519" }, false, ["sign"]);
  const edSig = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, edPriv, msg));
  const edKey = await crypto.subtle.importKey("raw", edPub, { name: "Ed25519" }, false, ["verify"]);
  assert.equal(await crypto.subtle.verify({ name: "Ed25519" }, edKey, edSig, msg), true);

  // Post-quantum
  const { publicKey: pqPub, secretKey } = ml_dsa65.keygen(seed);
  const pqSig = ml_dsa65.sign(msg, secretKey);
  assert.equal(ml_dsa65.verify(pqSig, msg, pqPub), true);
});
