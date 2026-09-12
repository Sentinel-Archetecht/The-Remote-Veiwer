# The Remote Viewer (TRV)

**New here or not technical?** → Start with **[START_HERE.md](START_HERE.md)**  
It is written for complete beginners (college freshman level).

**Status authority:** [`docs/REALITY.md`](docs/REALITY.md).  
**Working branch:** [`TheRemoteViewer`](https://github.com/Sentinel-Architech/The-Remote-Viewer/tree/TheRemoteViewer)

**Brand:** The Remote Viewer is the product. Its security service runs behind it.

**Historical note:** Unrelated to Technical Remote Viewing / PSI TECH / Ed Dames methodology.  
This project is a local-first software system for digital sovereignty **plus** a hosted Viewer Hub.

**Solo-built · local-first node · zero-custody packs · optical air-gap · live Viewer Hub**

---

## Live Viewer Hub (hosted DApp)

**This is the product Remote Viewers use today. It is not a scaffold.**

| | |
|--|--|
| **Live** | [the-remote-viewer.grok.me](https://the-remote-viewer.grok.me) |
| **Source** | [`apps/hub`](apps/hub) |
| **Status** | **LIVE** as of 2026-08-20 |

Shipped on the hub:

- Sign-in (Google / X / email)
- Age + OFAC gate
- **First win** — intercept on Command, then claim TRV. Briefing is optional after that.
- Daily Watch — Viewers intercept hostile packets to defend the network, then claim TRV
- Dedicated profile vault (`/hub/profile`) — portrait, identity extras, finances, docs, live icon
- Public Viewer card (`/v/$handle`)
- Command, OS, live, people, make, rails, Citizen lock (on-device hash)
- **OS jack-in** — 3D neuron flight on Defend / OS. Scan, name, pulse. Catalog writes OS memory. A landed pulse counts as daily watch.
- **Sovereign node runtime** — `/hub/node`: local Ed25519 identity, nonce attestation, button-press orchestrator, SHA-256 zkML receipt. Desktop twin is `desktop/src/runtime`.
- **Hybrid post-quantum wallet** — on-device identity supports classical Ed25519 **plus** multiple NIST post-quantum algorithms. See below.

`apps/web` is the **old Vite scaffold**. Do not treat it as the product UI.

The hub is a **hosted** Viewer surface (Better Auth + Postgres). It does **not** replace the local-first optical / Path B node, and it is **not** company recovery of age keys. Destroy = Restart still holds on the local path.

### Hybrid Post-Quantum Wallet

The on-device Viewer wallet (`apps/hub/src/lib/trv/wallet-client.ts`) is **hybrid**:

| Layer | Algorithm | Purpose |
|-------|-----------|---------|
| Classical | Ed25519 | Solana compatibility, existing vaults, Web Crypto |
| Primary PQ | **ML-DSA-65** (NIST FIPS 204) | Quantum-resistant signatures (default) |
| Optional compact PQ | **Falcon-512** | Much smaller signatures (~653 B) |
| Conservative option | SLH-DSA (SPHINCS+) | Hash-based only (large signatures) |

- All key pairs are **deterministically derived** from the same 32-byte seed.
- New wallets are created as `hybrid` by default (Ed25519 + ML-DSA-65 + Falcon-512).
- Existing Ed25519 / hash-v1 vaults remain fully functional and can be upgraded with `upgradeVaultToHybrid()`.
- `signHelmProof()` produces dual/triple signatures on hybrid vaults.
- Seed never leaves the browser; it is stored encrypted under a PIN-derived AES-GCM key in IndexedDB.
- Implementation uses the audited pure-JS library `@noble/post-quantum`.

Full algorithm comparison and recommendations: [`docs/PQC-ALGORITHMS.md`](docs/PQC-ALGORITHMS.md)

#### On-device benchmark results (Termux, 2026-09-11)

| Algorithm | Public Key | Signature | Sign (ms) | Verify (ms) |
|-----------|------------|-----------|-----------|-------------|
| ML-DSA-44 | 1,312 B | 2,420 B | 11.8 | 3.3 |
| **ML-DSA-65** | 1,952 B | 3,309 B | 22.2 | 4.4 |
| ML-DSA-87 | 2,592 B | 4,627 B | 20.2 | 6.6 |
| **Falcon-512** | 897 B | **653 B** | 10.2 | **1.5** |
| Falcon-1024 | 1,793 B | 1,267 B | 13.8 | 2.9 |
| SLH-DSA-SHA2-128s | **32 B** | 7,856 B | 11,009 | 13.0 |
| SLH-DSA-SHA2-192s | 48 B | 16,224 B | 19,729 | 17.0 |

KEMs (for future encrypted channels):

| Algorithm | Public Key | Ciphertext |
|-----------|------------|------------|
| ML-KEM-768 | 1,184 B | 1,088 B |
| ML-KEM-1024 | 1,568 B | 1,568 B |

#### Verification steps (Termux or desktop)

```bash
cd apps/hub
npm install

# Hybrid correctness tests
node --test scripts/wallet-hybrid.test.mjs

# Size + performance benchmark
node scripts/pqc-benchmark.mjs
```

Expected: all hybrid tests pass (`pass 6`). Benchmark prints the tables above.

---

## Track A — Solana governance (SCAFFOLD)

On-chain entitlement, nodes, open voting, VALUE splits — **not mainnet, not audited.**

| Item | Location |
|------|----------|
| Program | `solana/programs/trv_governance` |
| Instruction index | [`solana/PROGRAM.md`](solana/PROGRAM.md) |
| Toolchain | Anchor **0.30.1** · Solana **1.18.x** · Rust **1.79** · CI only |
| Pixel | Client/reader — **no** Anchor SBF build |
| VALUE splits | Digital **80/10/10** · NFT primary **80/10/10** · secondary **5%** creator |
| Pool governance | [`docs/POOL-GOVERNANCE.md`](docs/POOL-GOVERNANCE.md) |
| Payments → sub | [`docs/PAYMENTS.md`](docs/PAYMENTS.md) |
| Authority keys | [`docs/AUTHORITY.md`](docs/AUTHORITY.md) |
| Identity recovery | [`docs/IDENTITY.md`](docs/IDENTITY.md) |
| Safety (locked) | [`docs/locked/SAFETY.md`](docs/locked/SAFETY.md) |

```bash
# Build host / CI only — not Termux
cd solana && npm install && anchor build && anchor test
```

---

## Path B (Independent Completion)

| Path | Count | Notes |
|------|------:|-------|
| **Path A** — Personal invitation | **1** | Originator |
| **Path B** — Independent completion | **0** | Verified finishers only |
| **Total Founding Sovereign Viewers** | **1** | |

Path B Independent Completion is open to any builder who completes the published checklist on a machine they control and submits offline attestation.  
Recognition is currently originator-verified.  
**Packs remain paid per item.** No free catalog items.

**Builder guide:** [`docs/public/PATH-B-BUILDER.md`](docs/public/PATH-B-BUILDER.md)  
**Reproduce:** [`docs/REPRODUCE.md`](docs/REPRODUCE.md)  
**Threat model:** [`docs/security/threat-model.md`](docs/security/threat-model.md)

---

## Buy packs (public)

**USDC on Solana · age-encrypted TRVL delivery · zero platform custody**

| Pack | Price | Memo |
|------|------:|------|
| **TRV Posture Lite** | 11 USDC | `TRV-Posture-Lite` |
| **TRV Posture Pack** | 25 USDC | `TRV-Posture-Pack` |
| ZK Membership Skill | Manual / XMR | `SENTINEL-ZK-01` |

**Sales address:** `HKGFrp9Sn9m1DDKDm3F6gfWGbLThmhfRWxg5rR8Kugfv`

- **In-repo:** [`digital-vending/buy.html`](digital-vending/buy.html)
- Protocol: [`digital-vending/PROTOCOL.md`](digital-vending/PROTOCOL.md) · [`docs/public/BUY.md`](docs/public/BUY.md)

### After you pay

1. Create an age identity on **your** device (`age-keygen`). Keep the secret.
2. Send the seller only: your **`age1…` public key** + **tx signature**.
3. Receive a `.trvl` file → decrypt locally.

---

## Local node (GrapheneOS + Termux / desktop)

Not a cloud AI product. Not a live DePIN network. Not an always-on oracle.

**Truth file:** [`docs/REALITY.md`](docs/REALITY.md) — PROVEN means ran on a real device under user control.

The desktop crate now includes the **unified sovereign node runtime** (sled identity by default; ollama-rs and tract-onnx behind features). Hub viewers use `/hub/node`. Docs: [`docs/SOVEREIGN-NODE-RUNTIME.md`](docs/SOVEREIGN-NODE-RUNTIME.md) · [`desktop/RUNTIME.md`](desktop/RUNTIME.md).

```bash
git clone -b TheRemoteViewer https://github.com/Sentinel-Architech/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
bash scripts/chat.sh
```

---

## Status snapshot

Prefer [`docs/REALITY.md`](docs/REALITY.md) and [`STATUS.md`](STATUS.md) over any chat claim.

| Capability | Notes |
|------------|-------|
| **Viewer Hub DApp** | **LIVE** — [`apps/hub`](apps/hub) · briefing · daily watch · OS jack-in · `/hub/node` sovereign runtime · profile vault |
| **Hybrid post-quantum wallet** | **LIVE** (source) — Ed25519 + ML-DSA-65 + optional Falcon-512 · dual/triple signatures · verified on-device with benchmarks |
| Optical air-gap | PROVEN (see REALITY) |
| Digital vending Path B | PROVEN |
| Solana `trv_governance` | **SCAFFOLD** — CI build gate |
| Mobile Expo client | PARKED on Graphene |
| EVM parallel | Learning; 9/9 on Pixel Anvil |

---

## 60-second paths

### Viewer Hub

```bash
cd apps/hub
npm install
npm run dev
# http://127.0.0.1:8080/
```

Hosted: [the-remote-viewer.grok.me](https://the-remote-viewer.grok.me)

### Path B

```bash
bash modules/path-b-recognition/collect-proof.sh
bash modules/path-b-recognition/make-attestation.sh
bash modules/path-b-recognition/install-founding.sh /path/to/founding-member-*.json
```

### Phone (Termux)

```bash
pkg update && pkg install git python age -y
git clone -b TheRemoteViewer https://github.com/Sentinel-Architech/The-Remote-Viewer.git
cd The-Remote-Viewer
bash modules/defense/integrity-pulse.sh
```

### Operator UI (local)

```bash
bash apps/ui/serve-ui.sh
# http://127.0.0.1:8765/
```

---

## What this is not

- No company-held key recovery. Lose the age secret → start over (intentional).
- No required cloud login for the **local-first node / optical path**.
- The **hosted Viewer Hub** does use accounts. That is a separate surface, documented in [`apps/hub`](apps/hub).
- No public hosted EI endpoint — local models stay on **your** device.
- No free packs via Path B.
- Keys, GGUFs, personal notes on the local path stay on **your** device.
- Solana governance is **not** live. Saying the hub is live is not saying the chain is live.

## License

**Source-available. Not MIT. Not OSI open source.**

See [LICENSE](LICENSE).

- **Humans** may copy, run, study, modify, and share forks under the same license **without a fee**.
- **Corporations and other for-profit companies** need a written commercial grant before they copy or use it.
- Third-party libraries keep the licenses in [CREDITS.md](CREDITS.md).
