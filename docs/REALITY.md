# Reality — authority for PROVEN / LIVE claims

**Updated 2026-09-04.**  
**Rule:** PROVEN = ran under operator control on a real device. Scripts in git alone are not PROVEN.  
**LIVE** = a hosted product surface that is running now. LIVE is not PROVEN-on-device, and it is not mainnet.

**Promotion:** [PROVEN-NEEDED.md](PROVEN-NEEDED.md) · **Protocol:** [PROTOCOL.md](PROTOCOL.md)

---

## LIVE (hosted Viewer Hub)

| Surface | Status | Notes |
|---------|--------|--------|
| Viewer Hub DApp | **LIVE** | [`apps/hub`](../apps/hub) · [the-remote-viewer.grok.me](https://the-remote-viewer.grok.me) |
| Viewer briefing | **OPTIONAL** | 12 stations after first watch; `viewer_profiles.tutorial_at` when sealed |
| Daily Watch | **LIVE** | Defend / Mesh / Honeypot → claim TRV |
| SENTINEL OS jack-in | **IN SOURCE** | 3D neuron flight on `/hub/neuron` and `/hub/os`. [`docs/SENTINEL-OS-JACK.md`](SENTINEL-OS-JACK.md). LIVE after grok.me republish. |
| Profile vault | **LIVE** | `/hub/profile` · public card `/v/$handle` · live icon |
| Age + OFAC gate | **LIVE** | Before Command |
| Citizen lock | **LIVE (hash)** | On-device hash. Not hardware Keystore |
| Skill audit | **LIVE** | `/hub/audit` · doctrine + edge + live helm · par 70 |
| Native wallet | **LIVE (Ed25519)** | PIN vault on-device. Pubkey = base58(Ed25519). Hash-v1 unlock still works. **Not mainnet.** |
| Stripe on-ramp | **LIVE (keyed)** | Checkout when `STRIPE_SECRET_KEY` is set; otherwise preview rail. Stripe is never identity. |

This hub uses accounts (Better Auth + Postgres). That does not make it a recovery service for age keys.
