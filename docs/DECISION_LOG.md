# Decision and assumption log

## 2026-11-04: initial audit and tokenomics model (Claude Code)
**Audit:** The repo held only a README with a title (1 commit). No code, contracts, mint or site in git.
The site, artwork and social kit exist in Google Drive (from a prior ChatGPT session) and aren't yet in this repo.

**Inputs (from founder):** 1B minted, 900M burned, 100M circulating, mint authority revoked.
Buckets: LP 20M, staking/airdrops/community 20M, dev/marketing/team 25M, founder 25M, reserve 5M.
Presale start: 2026-11-05. Goal: 100x community upside.

**Context (from the founder's shared ChatGPT chat):** $LBG, Solana, ~900-member Telegram.
Earlier plan was Pump.fun, then switched to a presale (Metaplex Genesis suggested). Flock Council governance proposed.

**Assumptions (UNCONFIRMED):**
- A1: Presale bucket = 5M (the remainder of 100M − 95M listed).
- A2: SOL/USD $93.85 (Crypto.com, 2026-11-04 11:36 UTC). Terms denominated in SOL.
- A3: Listing at 1.25x the presale price; 75% of the raise to LP.
- A4: Realistic raise for the community size is 50–100 SOL.

**Findings:**
- F1: As-given allocation needs the team to add ~4x the raise in SOL to list above presale price.
- F2: Insiders at 50% will be flagged by scanners.
- F3: The 900M burn has no effect on price; all valuations use 100M.

**Recommendation:** Scenario B: presale 25M at 250,000 LBG/SOL, 100 SOL hard cap / 50 soft, 1 SOL max per wallet,
LP 15M + 75 SOL locked, founder 15M and team 20M vested. **Awaiting founder decision.**

**Open risks:** No presale contract, mint or multisig exists yet with ~24h to the start. No legal review.

## 2026-11-04: repo audit after founder push (`main` b5a3811)
Merged main (site `lbgv6/` + creator kit) into the working branch. Full findings in `docs/AUDIT.md`.
- CRITICAL: Public site/kit say "Pump.fun launch"; the founder plan is a presale with a burn + allocations. Founder must choose.
- CRITICAL: No on-chain infra exists for a presale on 2026-11-05.
- Site, CSP and secret scan: clean.

## 2026-11-04: launch method = PRESALE (founder decision)
- **Decided (founder):** $LBG launches via a community presale, not Pump.fun. Expect many revisions.
- **Platform research:** see `docs/PLATFORM_DECISION.md`. Recommended PinkSale Solana presale. **Awaiting approval.**
- Model now includes PinkSale's 5% fee: treasury at hard cap ≈ 20.9 SOL; PinkSale liquidity 78%.
- Site copy (`lbgv6/index.html`) and README: "Pump.fun" changed to "community presale planned, details TBA". No numbers published.
- Still open: allocation choice (A vs B), hard cap, presale date, legal review, creator kit FAQ update.

## 2026-11-04: ecosystem plan v1 (scenario C_ecosystem)
- Founder goals: games, challenges, community voting, LBG contest rewards/airdrops, community growth incentives,
  all value flowing in LBG with liquidity growing over time. Roles: Jason Spear (founder), Tony (community lead/partner).
- Added `tokenomics/emissions.py`: per-bucket lock/vesting mechanism, monthly circulating vs vesting vs reserve vs LP,
  and a sell-pressure stress test (+8 tests).
- Finding: with B, presale tokens (25M) vs pool (14.8M) give a ~58% stress drop at listing. C fixes part of this with
  LP 17M (89% of net raise), presale vesting 50/25/25, slower team vesting (3+18 mo), and airdrops moved to month 3+.
- C allocation: presale 25M, LP 17M, community 20M, dev/marketing/team 18M, founder 15M, reserve 5M. Insiders 33%.
- Treasury at hard cap drops to ~10.5 SOL (deliberate: raise goes into liquidity).
- Plan: `docs/ECOSYSTEM_PLAN.md`. **Awaiting founder approval.** Unverified: PinkSale Solana contributor vesting.

## 2026-11-04: founder revision, scenario D_founder_v2 (plan of record pending sign-off)
- **Founder instruction:** founder (Jason Spear) 5M total; community lead (Tony) 2.5M total; marketing + development ~10M
  (5M + 5M); allocate the rest appropriately. All locked tokens are always vested. Founder unlocks 1M at launch, +1M every
  3 months; Tony 500k at launch, +500k every 3 months; community and all holders on the same 20%-per-quarter cadence.
- **Interpretation (CONFIRM):** "$5 million" etc. read as TOKENS, not dollars. "All token holders" read as every bucket,
  including presale buyers (20% at listing + 20% per 90 days).
- **Allocation:** presale 25M, LP 17M, community rewards 35M (contests 12M, staking 8M, airdrops 7M, Flock Builders 5M,
  Council grants 3M), marketing 5M, development 5M, founder 5M, Tony 2.5M, reserve 5.5M. Insiders 17.5%.
- Community tokens unlock into a multisig vault; payouts capped at 4% of pool LBG/month (~676k).
- **Stress finding:** step unlocks put everyone on the same public day: −38% stress on months 3/6/9/12 (≈ 18 SOL buy needed).
  Gradual release over each quarter gives about −18%/month (≈ 7.9 SOL). Offered as an option.
- Model: tranche schedules + vault support in `emissions.py`; tests updated (20 passing).
