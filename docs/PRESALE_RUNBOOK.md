# $LBG presale runbook (go/no-go)

> **ARCHIVED — NOT FOR CURRENT LAUNCH.** The current founder plan is Pump.fun with no presale and no planned 900M genesis burn. This file is retained as historical research only.


Every on-chain step requires the founder's explicit written approval. Rehearse it on devnet first.
Items marked **[B]** are blocking: if one isn't done, the result is NO-GO.

## Phase 0: decisions (before anything is announced)
- [ ] **[B]** Presale allocation confirmed (5M as given, or 25M as recommended)
- [ ] **[B]** Presale platform approved (recommended: PinkSale Solana; see `docs/PLATFORM_DECISION.md`). No SOL sent to a personal wallet
- [ ] **[B]** Hard cap, soft cap, per-wallet min/max and price in LBG per SOL, all from `tokenomics/model.py`
- [ ] **[B]** Refund rule if the soft cap is missed, and an end time
- [ ] **[B]** Legal review of the presale terms (governance + presale = securities risk)
- [ ] Eligibility/jurisdiction restrictions decided

## Phase 1: token setup (devnet, then mainnet)
- [ ] **[B]** Mint 1,000,000,000 LBG, burn 900,000,000, record both tx signatures
- [ ] **[B]** Revoke mint authority, then revoke freeze authority, and verify with `spl-token display <MINT>`
- [ ] Metadata (name, symbol, image, links) final; update-authority decision documented
- [ ] **[B]** Squads multisig (≥2 of 3) for treasury, community, reserve
- [ ] **[B]** Founder/team buckets in on-chain vesting (Streamflow or equivalent) with schedules published

## Phase 2: presale open
- [ ] **[B]** `community-comms-reviewer` PASS on the website, X and TG copy (no "100x", no profit promises)
- [ ] **[B]** Presale page numbers match config.json exactly; SOL/USD refreshed (under 1 hour old)
- [ ] Official mint address and presale URL published at the same time on site, X and TG
- [ ] Anti-scam pin: "We will never DM you. Only use the link on lowbatterygoose.pages.dev"

## Phase 3: close and listing
- [ ] Final raise recorded; unsold presale tokens burned (tx)
- [ ] **[B]** LP created at the listing price (1.25x presale); LP tokens burned or locked (tx)
- [ ] Presale tokens claimable; claim tested with a small wallet first
- [ ] Post-launch report: raise, LP, burns, vesting links, wallet list → `docs/DECISION_LOG.md`

## Abort triggers
Soft cap missed → refunds. Contract/platform anomaly → pause. Leaked key → stop everything and rotate.
