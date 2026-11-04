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
