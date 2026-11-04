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

## 2026-11-04: price ladder and 100x path (dashboard)
- SOL/USD refreshed: $92.77 (Crypto.com, 2026-11-04 12:26 UTC).
- Added `model.net_buy_sol_for_multiple`: net SOL into a constant-product pool to reach a price multiple.
  100x vs presale = ~672 SOL net buying; plus ~99 SOL to absorb year-one unlock stress, ~771 SOL total.
- Timeline is arithmetic, not a forecast: 771 SOL / monthly net buying (50 SOL/mo ≈ 15 months; 100 ≈ 7.7; 150 ≈ 5.1).
- `tokenomics/export_dashboard.py` feeds the private dashboard "LBG Price Ladder" (claude.ai artifact).

## 2026-11-04: 2-week tiered presale (revision of founder's lowbatt_tokenomics_model_2.xlsx)
- Founder request: revised tokenomics for a 2-week presale, uploading model_2.xlsx ($LOWBATT, 1B no burn, 2,000 SOL cap,
  9 tiers at +6%, 5 SOL wallet cap, founder 6+18 vesting).
- **Conflicts resolved toward this session's founder instructions** (CONFIRM): $LBG, 100M after burn, D_founder_v2
  allocation (founder 5M, Tony 2.5M, mkt+dev 10M, community 35%), 20% at launch + 20% every 3 months for all buckets.
- **Adopted from model_2:** verified-waitlist Tier 0, solved tier pricing, LP share of raise, launch >= last tier check,
  staking 50/30/20 emission split and lock multipliers, checklist.
- Terms: 14 days = Tier 0 (days 1-2, 10% of presale tokens) + 6 tiers x 2 days, 5% step; hard cap 100 SOL, soft 50,
  0.05-1 SOL per wallet; 86% of net raise to LP. Tier prices 292,825 -> 218,511 LBG/SOL (avg 250,000);
  launch 208,078 LBG/SOL = 1.05x last tier, 1.20x average. LP 81.7 SOL + 17M LBG; treasury 13.3 SOL.
  Soft cap reached end of day 8 on an even pace (~7.1 SOL/day, ~14 buyers/day at 0.5 SOL).
- Platform: tiers need a tier-capable contract (audit) or platform; PinkSale is single-price (set step to 0%).
- Files: `tokenomics/presale_2wk.py`, `tokenomics/build_workbook.py`, `docs/LBG_tokenomics_2wk_presale.xlsx`
  (618 formulas, recalculated with 0 errors, values cross-checked against the Python model).

## 2026-11-04: founder leaning to Pump.fun launch (no presale)
- Founder: "I could use pump.fun again... I'm not worried about the liquidity pool as much as getting it out there."
- Live site (checked 2026-11-04) already says "Pump.fun launch planned; no token live". Reverted this PR's
  presale wording in `lbgv6/index.html` and README so merging cannot contradict the live site.
- Presale/allocation models (D_founder_v2, presale_2wk) kept for reference; they do not apply on Pump.fun
  (fixed 1B supply, no pre-set allocations). Pending founder confirmation of launch time, creator-reward
  setting and founder buy size.

## 2026-11-04: Pump.fun launch prep (founder request)
- Founder: proceed toward Pump.fun; asked for website, X, Telegram and bot updates with a contract placeholder.
- Site: launch mode driven by `site-config.js` `mint` (validated base58; pump.fun link derived). Prelaunch rendering
  unchanged; live mode tested in Chromium at 1280px and 375px with a dummy address (no errors, no overflow).
- Bot: `bot/honk-commander.js` (drop-in for the lbg-honk-commander Worker): /launch, /contract, /pumpfun, /safety
  driven by `TOKEN_ADDRESS` and optional `LAUNCH_TIME` settings; invalid addresses ignored.
- Posts: `docs/LAUNCH_KIT.md` (X posts all under 280 chars, Telegram posts, create-screen values, first-10-minutes steps).
- Pending from founder: launch time, founder buy size, creator-fee share to community fund.

## 2026-11-04: Pump.fun launch terms (founder decisions)
- Launch: tonight, Nov 4, 6:00 PM (timezone assumed PT, to confirm).
- Creator fees: NO community share (founder). Proposed split Jason 60% / Tony 40% (to confirm).
- Tony: 25,000,000 LBG (2.5%), Streamflow vesting fully released within 6 months: 25% at launch, then 25% on
  Jan 4, Mar 4, May 4, 2027. Funded by Tony's own buy (recommended) or from the founder buy.
- Founder buy recommendation: about 1 SOL, at most about 3% of supply, half locked; size to confirm.
- Consequence: contests, games and airdrops have no automatic funding; prizes come from the team.
  LAUNCH_KIT.md disclosure posts and thread updated so nothing promises a community fee share.

## 2026-11-04: team terms confirmed (founder)
- Creator fees: Jason 75% / Tony 25% (shared to Tony's wallet from the Pump.fun coin page after creation). No community share.
- Token holdings: Jason 5% of supply (50,000,000 LBG), Tony 2.5% (25,000,000 LBG).
- Tony's 25M: fully released within 6 months: 25% at launch, 25% on Jan 4, Mar 4, May 4, 2027 (Streamflow).
- Open: Jason's own unlock schedule; launch timezone (PT assumed); founder buy size.

## 2026-11-04: final team vesting (founder, option A)
- Jason 50,000,000 LBG (5%) and Tony 25,000,000 LBG (2.5%): 25% at launch (Nov 4, 2026), then 25% on Feb 4, May 4,
  Aug 4, 2027. Fully unlocked at 9 months. Locked in Streamflow (not staked; no staking program exists yet).
- Creator fees: Jason 75% / Tony 25%. Disclosure posts updated, including "no team sales during launch week".

## 2026-11-04: FINAL: Pump.fun launch tonight, no burn (founder)
- Launch on Pump.fun tonight 6:00 PM (PT assumed). Supply fixed at 1,000,000,000 LBG; no 900M burn (not possible on Pump.fun).
- Team holdings are bought at creation: Jason 50M (5%) ~1.48 SOL, Tony 25M (2.5%) ~0.80 SOL (estimates from the classic
  curve: 30 SOL / 1.073B virtual reserves, 1.25% fee; the create screen is authoritative).
- Vesting 25% at launch, then Feb 4, May 4, Aug 4, 2027. Creator fees Jason 75% / Tony 25%.
- Optional later: public buy-and-burn from creator fees. No burn claims in launch posts.
- Presale-era models (100M supply, D_founder_v2, presale_2wk) are shelved and do not describe this launch.

## 2026-11-04: founder funds Tony's allocation (internal)
- Tony will not buy his 2.5%. Founder buys 75M LBG (~2.28 SOL est.) at creation and locks 25M in a Streamflow stream
  to Tony's wallet on the agreed schedule (25% at launch, Feb 4, May 4, Aug 4, 2027); optional founder-cancellable.
- Terms, fee split (75/25) and public disclosure posts unchanged per founder instruction.

## 2026-11-04: Flock Drop airdrop + launch marketing strategy (proposal)
- Founder: wants a large airdrop for people who sign up. Proposal (to confirm): 10,000,000 LBG (1%) pool bought in the
  founder's first buy (+~0.33 SOL; first buy ~85M LBG ~2.61 SOL est.), held in a separate disclosed wallet.
  5,000 LBG base for verified sign-ups (first 1,000), quests up to 15,000 per person, Season 1 to Nov 18, single payout
  after bot review. Free; no purchase/holding required. Run on a quest platform (Zealy/Galxe/TaskOn).
- Wording: no profit/"spectacular opportunity"/dollar-value language. Strategy: docs/MARKETING_STRATEGY.md.

## 2026-11-04: The Goose Guess launch game (founder request)
- Guess the Flock Telegram member count at launch (6 PM PT Nov 4); entries close 5 PM PT; reveal 6 PM PT Nov 5.
- Founder asked: must be in the community (adopted) and must hold tokens to win (adapted): holding is a BONUS that
  doubles the prize, not a requirement, so no purchase is necessary to enter or win (avoids lottery/inducement risk).
- Prizes: 2.5M / 1M / 500K LBG; doubled for wallets holding 100,000+ LBG at the Nov 5 5 PM PT snapshot. Max pool 8M LBG,
  bought in the founder's first buy (~0.27 SOL est.), held in a disclosed prize wallet.
- Site: new #goose-guess section; Google Form link via site-config `guessForm` (Google Forms only; Telegram fallback);
  auto-closes at `guessCloses`. Tested 1280/375px, no errors. Kit: docs/GOOSE_GUESS.md.

## 2026-11-04: Goose Guess revised (founder)
- One winner only: grand prize 5,000,000 LBG (~0.17 SOL in first buy; first buy total ~90M LBG ~2.78 SOL est.).
  Winner crowned "The First Honker" and featured at the top of the homepage for a week (site-config `honker`).
- Eligibility: Flock Telegram member + any LBG holding in the entered wallet at the Nov 5 5 PM PT snapshot.
  Holder bonus and 2nd/3rd prizes removed. Kept a written no-purchase entry route in the fine print as a legal
  safety valve (founder can remove on counsel's advice).

## 2026-11-04: website fixes + walking goose (founder request)
- Fixed: hero goose image stretched (1024x1024 shown 538x1041) via img height:auto + aspect-ratio; now 520x520.
- Fixed: [hidden] boxes (Honker spotlight, pre-launch contract box) were visible because component CSS overrode the
  hidden attribute; added [hidden]{display:none!important}.
- Added lbgv6/goose.js: a goose that walks the bottom of the page, honks, steals letters (max 3, always returned,
  never from contract/safety/fine print), crashes into cards with feathers, naps, zoomies. Click = honk (+ sound
  only after a click). On/off toggle remembered per visitor; off in the Telegram mini-app; still under reduced motion.
  Tested 1366px and 375px: letters restored, no errors, toggle persists.

## 2026-11-04: browser caching fix
- Founder saw an old site after uploading; verified live site already had goose.js, Goose Guess and image fix
  (browser cache). Added ?v= version tags to CSS/JS in index.html and `Cache-Control: no-cache` in _headers so
  future uploads (incl. tonight's contract address in site-config.js) show immediately.

## 2026-11-04: goose brand + games (founder)
- Goose redesigned as the brand mascot: tired eyes with bags, tuft, battery chest, coffee mug; coffee breaks, yawns,
  naps, zoomies, crashes, letter theft.
- Annoy the Goose: clicks raise anger (annoyed -> mad -> RAGE: chases cursor, steals letters, calms with coffee);
  score + best saved per visitor; tap to copy a share post.
- Hide & seek quiz: goose hides on a card; finding him opens a question about $LBG/community/safety.
  Right: +10 Honk Points (streak bonus). Wrong: -3 points and streak. Founder asked for losing real tokens on wrong
  answers ("like a bet"): NOT built, since staking tokens on outcomes is gambling; points have no token value.
- Real micro-airdrops and AI-generated questions need a server (answer checking, wallets, anti-bot, API key):
  proposed as phase 2 after launch (points feed the weekly Flock Drop).
- Letters now fly off-screen fading out and fade back into place (no more dead stops).
- Tested: hide, quiz right/wrong scoring, rage, letter return; no errors.

## 2026-11-04: trivia live-ready; deploy mix-up found
- Live site was still running the first goose version: the last uploads did not reach production (same zip name
  each time, likely an older copy uploaded). Zips now get unique names (LBG-site-v5-trivia.zip).
- Trivia: 40 questions (coin, safety, community, goose, slang); "Play Goose Trivia" button on the site (#goose-trivia)
  and as a corner chip, starts the hunt immediately; first automatic hide after 12-20s. Tested 1366/375px.
- Micro-airdrops for trivia: founder will provide later (needs server-side answer checking + wallets).

## 2026-11-04: mascot named Gooferson (founder)
- The tired cartoon goose is officially **Gooferson**. Brand portrait: lbgv6/assets/gooferson.svg + 1024px PNG.
- Site: goose introduces himself as Gooferson; hide-and-seek and quiz copy use his name; new trivia question
  "What is the goose's name?" (41 questions). Package: LBG-site-v6-gooferson.zip.
