# Security Policy

## Project Purpose

This repository contains The Remote Viewer — a local-first, zero-custody, optical air-gap system and related scaffolds. Design prioritizes user-held keys and no centralized backdoors. The security service that protects the Viewer Hub runs behind the product and is not the public name.

## Supported Versions

| Version / Branch | Supported |
|------------------|-----------|
| TheRemoteViewer | Yes (active) |
| Other | Limited (research) |

## Reporting a Vulnerability

**Do not open public issues for active key/fund risk.**

1. Open a **private GitHub Security Advisory** on this repository, **or**
2. Contact the maintainer through an encrypted channel.

Include: description, reproduce steps, affected component, impact. **Never send seed phrases or private keys.**

Acknowledgment target: 72 hours. High-severity mitigation plan target: 14 days.

## Scope

**In scope:**
- Cryptographic tooling (age, optical air-gap, key handling)
- Hydra / defense modules
- `solana/programs/trv_governance` and related scripts
- Edge / local model handling that touches private data
- Integrity of safety **reporting** pipelines (when implemented)

**Out of scope:**
- Social engineering of individual Viewers
- Physical attacks on personal hardware
- Already-disclosed third-party dependency issues
- Theoretical attacks with no practical path

## CSAM / child exploitation

**Not a bug-bounty category.** Use in-product **Integrity report** when live, NCMEC CyberTipline (US), and law enforcement. See `docs/locked/SAFETY.md`.

## Principles

- No expectation of centralized trust for Viewer vaults
- Repo logging ≠ visibility into encrypted runtime state of private deployments
- Coordinated disclosure preferred before public write-ups

## Contact

Private GitHub Security Advisories or maintainer encrypted channels listed with the project.

## Federal / open-source cyber baselines (glass — not LIVE authorization)

House **defend-only** posture. Tracking public baselines; **not** a DoD ATO, FedRAMP, or CISA certification claim.

| Source | Use |
|--------|-----|
| [DoD CIO OSS memo](https://dodcio.defense.gov/Portals/0/Documents/Library/SoftwareDev-OpenSource.pdf) | Component security, integrity, timely vuln remediation |
| [DoD Enterprise DevSecOps Fundamentals](https://dodcio.defense.gov/Portals/0/Documents/Library/DoD%20Enterprise%20DevSecOps%20Fundamentals%20v2.5.pdf) | SAST/SCA gates in CI; two-person integrity where practical |
| [CISA Secure by Design](https://www.cisa.gov/securebydesign) | Secure defaults, memory-safe roadmaps, responsible OSS |
| [OpenSSF OSPS Baseline](https://baseline.openssf.org/) | Practical OSS control checklist by maturity |

Repo controls: secret scanning + push protection, Dependabot security updates, CodeQL, vulnerability alerts, private advisory reporting, branch protection on `TheRemoteViewer` (required `build-solana`, no force-push). Hydra (Department of War) owns defend framing; Integrity blocks LIVE invent.

Tracking: issue **Security sync (glass)**.
