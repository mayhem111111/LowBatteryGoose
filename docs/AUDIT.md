# Repository audit: 2026-11-04

Scope: `main` @ `b5a3811` (website + creator kit), merged with `claude/youthful-mayer-5f046c`
(tokenomics model + AI tooling). Method: full read of every source file, extraction of the creator
kit ZIP, secret scan, CSP hash verification, headless-browser smoke test (1280px and 375px).

## Summary
| Area | Status |
|---|---|
| Website (`lbgv6/`) | **Healthy.** Works on desktop and mobile, no JS errors, no horizontal overflow |
| Security headers / CSP | **Good.** Inline script hash matches; `connect-src 'none'`; no wallet code |
| Secrets | **None found** in git history, site or kit |
| Public copy | **Careful and compliant today** ("no token live", "no returns promised") |
| Token / on-chain code | **Absent.** No mint, presale contract, vesting, staking or governance code |
| Tests / CI | Model tests only (8 passing). No site tests, no CI workflow |
| **Plan consistency** | **CRITICAL CONFLICT.** See C1 |

## Critical
**C1. [Site + README FIXED 2026-11-04; creator kit FAQ still open] The public site, README and creator kit say "Pump.fun launch". The founder's current plan is a presale
with a 900M burn and fixed allocations. These can't both be true.**
- Pump.fun mints a fixed 1B supply sold on a bonding curve. It has no presale, no team/founder/staking
  allocations and no burn-to-100M. The allocation in `tokenomics/config.json` is impossible on Pump.fun.
- Where it appears: `lbgv6/index.html` (hero eyebrow, facts grid "PLANNED LAUNCH: Pump.fun", risk note,
  footer, meta description), `README.md`, the kit's `START_HERE.md` and `Community_FAQ.md`.
- If the presale opens while the site says "Pump.fun, no token, no purchase", buyers get contradictory
  official information, and scammers exploit exactly that kind of gap.
- **Action:** the founder picks one path. Then the site's facts section, README and kit FAQ get
  updated in one change, and `community-comms-reviewer` checks it, *before* any presale link is shared.

**C2. No on-chain infrastructure exists for a presale "tomorrow".** There's no mint, no presale contract or
platform config, no multisig, no vesting, no LP plan in code, and no devnet rehearsal.
See `docs/PRESALE_RUNBOOK.md`. Every Phase 0–1 blocking item is open.

## High
**H1. Golden Honk prize conflict.** The site rules say "No cash … cryptocurrency … or token allocation is
promised". The founder's later plan (ChatGPT chat) offers $100 paid in $LBG. Paying tokens would breach
the published rules for the Nov 3–10 round. Keep round 1 as published, and write new rules for any token prize.

**H2. Governance claims vs reality.** The token is described as "governance", and the Flock Council
proposal says participation doesn't require tokens. There is no on-chain or off-chain voting
mechanism (e.g. Realms/Snapshot). Define what holding $LBG actually governs before marketing it as
a governance token.

## Medium
- **M1.** `Low_Battery_Goose_Creator_Kit.zip` (2.8 MB binary) is committed at the repo root. Binaries bloat
  history and can't be diffed. If the repo is public, the contributor docs are public too. Suggest
  extracting it to `creator-kit/` (text reviewable) or keeping it in Drive only.
- **M2.** Duplicate Bingo logic: `honk-arcade-v6.html` (inline) and `honk-game.js`. Fixes must be made
  twice. Any edit to the inline script also needs the CSP hash in `_headers` regenerated, or the arcade breaks.
- **M3.** No CI. Add a GitHub Action running `python3 -m unittest` plus an HTML link/CSP check.

## Low
- `site-config.js` `mint`/`pumpFun` are null (correct for now). When set, publish at the same time across all channels.
- The kit references "V7 of Honk Bingo", but the repo has v6.
- No LICENSE file (artwork rights unstated).

## What's good
- Strong anti-scam messaging, a strict CSP, no wallet connection, no analytics or trackers.
- Social links validated against an allow-list of domains before rendering.
- Kit includes a publish-safety checklist and contributor permission boundaries. That's well done.
