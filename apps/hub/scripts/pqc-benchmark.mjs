/**
 * Simple size + smoke-performance benchmark for PQC algorithms used by TRV.
 * Run: node scripts/pqc-benchmark.mjs
 */
import { ml_dsa44, ml_dsa65, ml_dsa87 } from "@noble/post-quantum/ml-dsa.js";
import { falcon512, falcon1024 } from "@noble/post-quantum/falcon.js";
import { slh_dsa_sha2_128s, slh_dsa_sha2_192s } from "@noble/post-quantum/slh-dsa.js";
import { ml_kem768, ml_kem1024 } from "@noble/post-quantum/ml-kem.js";
import { randomBytes } from "@noble/post-quantum/utils.js";

const msg = new TextEncoder().encode("TRV-HELM|1|benchmark|" + new Date().toISOString());

function time(fn, rounds = 10) {
  const start = performance.now();
  for (let i = 0; i < rounds; i++) fn();
  return (performance.now() - start) / rounds;
}

function benchSig(name, alg, seedLen = 32) {
  const seed = randomBytes(seedLen);
  const keys = alg.keygen(seed);
  const sig = alg.sign(msg, keys.secretKey);
  const ok = alg.verify(sig, msg, keys.publicKey);
  if (!ok) throw new Error(`${name} verify failed`);

  const signMs = time(() => alg.sign(msg, keys.secretKey));
  const verifyMs = time(() => alg.verify(sig, msg, keys.publicKey));

  return {
    name,
    pk: keys.publicKey.length,
    sk: keys.secretKey.length,
    sig: sig.length,
    signMs: +signMs.toFixed(2),
    verifyMs: +verifyMs.toFixed(2),
  };
}

function benchKem(name, alg) {
  // ML-KEM keygen accepts optional seed; we let the library generate
  const keys = alg.keygen();
  const { cipherText, sharedSecret } = alg.encapsulate(keys.publicKey);
  const ss2 = alg.decapsulate(cipherText, keys.secretKey);
  if (sharedSecret.length !== ss2.length) throw new Error(`${name} KEM mismatch`);

  return {
    name,
    pk: keys.publicKey.length,
    sk: keys.secretKey.length,
    ct: cipherText.length,
    ss: sharedSecret.length,
  };
}

console.log("=== Signature algorithms ===");
const sigs = [
  benchSig("ML-DSA-44", ml_dsa44, 32),
  benchSig("ML-DSA-65", ml_dsa65, 32),
  benchSig("ML-DSA-87", ml_dsa87, 32),
  benchSig("Falcon-512", falcon512, 48),
  benchSig("Falcon-1024", falcon1024, 48),
  // SLH-DSA keygen does not take a short seed the same way; let library handle randomness
  (() => {
    const keys = slh_dsa_sha2_128s.keygen();
    const sig = slh_dsa_sha2_128s.sign(msg, keys.secretKey);
    const ok = slh_dsa_sha2_128s.verify(sig, msg, keys.publicKey);
    if (!ok) throw new Error("SLH-DSA-SHA2-128s verify failed");
    const signMs = time(() => slh_dsa_sha2_128s.sign(msg, keys.secretKey), 3);
    const verifyMs = time(() => slh_dsa_sha2_128s.verify(sig, msg, keys.publicKey), 5);
    return {
      name: "SLH-DSA-SHA2-128s",
      pk: keys.publicKey.length,
      sk: keys.secretKey.length,
      sig: sig.length,
      signMs: +signMs.toFixed(2),
      verifyMs: +verifyMs.toFixed(2),
    };
  })(),
  (() => {
    const keys = slh_dsa_sha2_192s.keygen();
    const sig = slh_dsa_sha2_192s.sign(msg, keys.secretKey);
    const ok = slh_dsa_sha2_192s.verify(sig, msg, keys.publicKey);
    if (!ok) throw new Error("SLH-DSA-SHA2-192s verify failed");
    const signMs = time(() => slh_dsa_sha2_192s.sign(msg, keys.secretKey), 2);
    const verifyMs = time(() => slh_dsa_sha2_192s.verify(sig, msg, keys.publicKey), 3);
    return {
      name: "SLH-DSA-SHA2-192s",
      pk: keys.publicKey.length,
      sk: keys.secretKey.length,
      sig: sig.length,
      signMs: +signMs.toFixed(2),
      verifyMs: +verifyMs.toFixed(2),
    };
  })(),
];

console.table(sigs);

console.log("\n=== KEMs ===");
const kems = [
  benchKem("ML-KEM-768", ml_kem768),
  benchKem("ML-KEM-1024", ml_kem1024),
];
console.table(kems);

console.log("\nDone. Lower ms is better. Sizes in bytes.");
