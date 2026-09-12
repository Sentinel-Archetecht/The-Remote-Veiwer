# Post-Quantum Algorithms for The Remote Viewer

Status: September 2026  
Primary implementation: `@noble/post-quantum` (pure JS, auditable)

## Standardized Algorithms (NIST)

| Algorithm | NIST Name | Type | Security Basis | Status |
|-----------|-----------|------|----------------|--------|
| CRYSTALS-Dilithium | **ML-DSA** (FIPS 204) | Signature | Module-LWE / Module-SIS | Final |
| CRYSTALS-Kyber | **ML-KEM** (FIPS 203) | KEM | Module-LWE | Final |
| SPHINCS+ | **SLH-DSA** (FIPS 205) | Signature | Hash functions only | Final |
| Falcon | **FN-DSA** (FIPS 206) | Signature | NTRU lattices | Draft (expected final ~2026/2027) |
| HQC | — | KEM | Code-based | Selected as backup |

## Size Comparison (approximate bytes)

| Scheme | Public Key | Secret Key | Signature / CT | NIST Level |
|--------|------------|------------|----------------|------------|
| Ed25519 (classical) | 32 | 32 | 64 | — |
| **ML-DSA-44** | 1,312 | 2,560 | 2,420 | 2 |
| **ML-DSA-65** (default) | 1,952 | 4,032 | 3,309 | 3 |
| **ML-DSA-87** | 2,592 | 4,896 | 4,627 | 5 |
| Falcon-512 | ~897 | ~1,281 | ~666 | 1 |
| Falcon-1024 | ~1,793 | ~2,305 | ~1,280 | 5 |
| SLH-DSA-SHA2-128s | 32 | 64 | 7,856 | 1 |
| SLH-DSA-SHA2-128f | 32 | 64 | 17,088 | 1 |
| SLH-DSA-SHA2-192s | 48 | 96 | 16,224 | 3 |
| ML-KEM-768 | 1,184 | 2,400 | 1,088 (CT) | 3 |
| ML-KEM-1024 | 1,568 | 3,168 | 1,568 (CT) | 5 |

## Performance Characteristics (relative)

| Scheme | Keygen | Sign | Verify | Notes |
|--------|--------|------|--------|-------|
| ML-DSA-65 | Fast | Fast | Fast | Best general-purpose balance |
| Falcon-512 | Slower | Medium | **Very fast** | Smallest signatures; more complex implementation |
| SLH-DSA-128s | Medium | Slow | Medium | Conservative; huge signatures |
| ML-KEM-768 | Fast | — | — | For key encapsulation only |

## Recommendations for TRV

1. **Primary signature (default)** — ML-DSA-65  
   NIST’s preferred general-purpose algorithm. Good speed/size trade-off. Already the hybrid default.

2. **Optional compact signature** — Falcon-512 (once FIPS 206 is final or for experimental use)  
   Significantly smaller signatures. Useful if bandwidth or storage becomes a concern.

3. **Conservative / long-term backup** — SLH-DSA (e.g. SHA2-192s)  
   Relies only on hash function security. Use when maximum conservatism is required and large signatures are acceptable.

4. **Key encapsulation** — ML-KEM-768  
   Use for any future encrypted channels, secure messaging, or key exchange features.

## Hybrid Design Principle

The wallet always keeps classical Ed25519 for Solana compatibility and existing vaults.  
Post-quantum algorithms are added in parallel (dual signatures).  
This provides defense-in-depth: the system remains secure even if one family is later broken.

## References

- NIST FIPS 203 / 204 / 205 (final)
- NIST IR 8610 (additional signatures, May 2026)
- `@noble/post-quantum` documentation
