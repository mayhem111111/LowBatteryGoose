# Low Battery Goose ($LBG): presale and ecosystem tokenomics plan

> **SUPERSEDED — HISTORICAL PRESALE MODEL.** This plan describes a PinkSale presale and 100M post-burn supply. Those assumptions do not apply to the current Pump.fun launch. Use [docs/TOKENOMICS.md](TOKENOMICS.md) as the plan of record.


> Internal planning document, v2 (2026-11-04, founder revision). Expect revisions.
> Every number comes from `tokenomics/config.json` (scenario **D_founder_v2**) via
> `python3 tokenomics/model.py` and `python3 tokenomics/emissions.py`. SOL/USD $93.85 (Crypto.com, 2026-11-04 11:36 UTC).
> Nothing here is a promise of returns. Don't copy targets or "everyone makes money" language into public posts.

**Roles:** Jason Spear, founder (product, treasury signer, final launch approval). Tony, community lead and partner
(community growth, contests, Flock Builders program, moderation).

---

## 1. The design goal in one line
**More reasons to *use* $LBG than reasons to *sell* it.** The price only holds when buying and using the token
keeps pace with what gets released. The plan therefore does three things:
1. **Release slowly.** Every bucket except the presale is locked or vesting, and community rewards are ceilings, not obligations.
2. **Recycle what's spent.** LBG used in games and challenges flows back to rewards, gets burned, or deepens liquidity.
3. **Grow real buyers.** The community, games and contests are the demand side. Tony's growth targets are measured in that.

A healthy ecosystem *can* reward everyone, but nobody can guarantee it. The stress test in section 5 shows what has to
go right.

---

## 2. Supply and allocation (D_founder_v2, founder revision 2026-11-04)
1,000,000,000 minted, then 900,000,000 burned, leaving **100,000,000 max supply**. Mint and freeze authority are revoked.

| Bucket | Tokens | % | Purpose |
|---|---|---|---|
| Presale | 25,000,000 | 25% | Community presale on PinkSale |
| Liquidity pool | 17,000,000 | 17% | Raydium pool, funded by the presale (≈ 16.91M used, rest burned) |
| **Community rewards** | **35,000,000** | **35%** | Contests and games 12M · staking 8M · airdrops 7M · Flock Builders 5M · Flock Council grants 3M |
| Marketing | 5,000,000 | 5% | Marketing multisig |
| Development | 5,000,000 | 5% | Development multisig |
| Founder (Jason Spear) | 5,000,000 | 5% | |
| Community lead (Tony) | 2,500,000 | 2.5% | |
| Reserve | 5,500,000 | 5.5% | Emergencies and listings, released only by governance vote |
| **Total** | **100,000,000** | | Insiders (founder + Tony + marketing + dev) **17.5%** |

Why the freed tokens went to the community: a 35% community share with 17.5% insiders is a strong
"built for the flock" signal, and it funds games, contests, airdrops and growth rewards for 4+ years at the health cap.

---

## 3. Locked and vesting tokens: everyone on the same schedule
**Rule:** every bucket unlocks **20% at launch, then 20% every 3 months** (months 0, 3, 6, 9, 12). Until a
tranche unlocks, it sits in a vesting contract or multisig. Nothing is ever held loose.

| Bucket | Total | Per unlock | Unlock months | Enforced by |
|---|---|---|---|---|
| Presale buyers | 25,000,000 | 5,000,000 (20%) | 0, 3, 6, 9, 12 | PinkSale contributor vesting: first release 20%, 20% per 90-day cycle (*verify on Solana form*) |
| Founder (Jason) | 5,000,000 | **1,000,000** | 0, 3, 6, 9, 12 | Streamflow, non-cancellable |
| Community lead (Tony) | 2,500,000 | **500,000** | 0, 3, 6, 9, 12 | Streamflow, non-cancellable |
| Marketing | 5,000,000 | 1,000,000 | 0, 3, 6, 9, 12 | Streamflow → Marketing multisig |
| Development | 5,000,000 | 1,000,000 | 0, 3, 6, 9, 12 | Streamflow → Development multisig |
| Contests and games | 12,000,000 | 2,400,000 | 0, 3, 6, 9, 12 | Unlocks into the Community Rewards multisig (vault) |
| Staking | 8,000,000 | 1,600,000 | 0, 3, 6, 9, 12 | Vault |
| Airdrops | 7,000,000 | 1,400,000 | 0, 3, 6, 9, 12 | Vault |
| Flock Builders | 5,000,000 | 1,000,000 | 0, 3, 6, 9, 12 | Vault |
| Flock Council grants | 3,000,000 | 600,000 | 0, 3, 6, 9, 12 | Vault |
| Liquidity pool | 17,000,000 | n/a | never withdrawn | PinkSale LP lock 365 days, then vote to burn LP tokens |
| Reserve | 5,500,000 | n/a | only by vote | Squads + 12-month time lock |

**The community vault vs circulating supply:** community tokens unlock *into the vault*, not into anyone's wallet.
The vault pays out at most **4% of the pool's LBG per month (≈ 676,400 LBG)**. Only payouts count as circulating.

**Supply status** (from `emissions.py`):

| Month | Circulating (wallets) | In community vault | Still locked/vesting | Reserve | In LP |
|---|---|---|---|---|---|
| 0 (listing) | 8.50M (8.5%) | 7.00M | 62.0M | 5.5M | 17M (locked) |
| 3 | 19.03M (19.0%) | 11.97M | 46.5M | 5.5M | 17M (locked) |
| 6 | 29.56M (29.6%) | 16.94M | 31.0M | 5.5M | 17M (locked) |
| 12 | 50.62M (50.6%) | 26.88M | 0 | 5.5M | 17M |
| 24 | 58.73M (58.7%) | 18.77M | 0 | 5.5M | 17M |

At the cap, the community vault keeps funding rewards into year 4–5. As the pool deepens through the Liquidity
Flywheel, the 4% cap rises with it.

All vesting contracts and multisig addresses are published on the website's Trust & Transparency section on listing day.

---

## 4. Presale plan (PinkSale, Solana)
| Field | Value |
|---|---|
| Presale rate | **250,000 LBG per SOL** (0.000004 SOL ≈ $0.000375) |
| Listing rate | **200,000 LBG per SOL** (presale buyers start +25%) |
| Soft / hard cap | **50 / 100 SOL** (refunds if the soft cap is missed) |
| Min / max per wallet | **0.05 / 1 SOL** (max = 250,000 LBG = 0.25% of supply) |
| Contributor vesting | **20% at listing, then 20% every 90 days** (same as everyone) |
| Liquidity | **89%** of net raise ≈ **84.5 SOL + 16.91M LBG**, locked 365 days |
| Unsold tokens | Burn |
| Platform fee | 5% of SOL raised |
| Treasury at hard cap | ≈ **10.5 SOL** (Squads multisig) |
| Tokens to deposit | ≈ 41.91M LBG (confirm against the form) |
| Presale FDV → listing FDV | ≈ $37.5k → ≈ $46.9k |

**Rounds**
1. **Flock round (whitelist, 24h):** active members only. Criteria: in the Telegram group ≥ 7 days, played Honk Bingo or
   entered a challenge, one wallet per person. Same price and cap.
2. **Public round (48h)** for whoever is left, same terms.
3. **Finalize, then list on Raydium,** and publish the mint, pool, LP lock and every vesting link at the same moment on every channel.

A 12-month vesting period for presale buyers is longer than most meme coin presales. Say it clearly on the presale page,
or some buyers will feel misled. The trade-off is much less dumping. If PinkSale on Solana can't do 90-day cycles,
the fallback is the Meteora Presale Vault.

---

## 5. Stress test: what the ecosystem must absorb
Worst case assumed: 30% of the presale unlock sells at listing, 50% of everything else reaching wallets sells, and **zero new buyers**.

| When | New tokens in wallets | Stress sold | Price impact if no buyers | **New buying needed to offset** |
|---|---|---|---|---|
| Listing (month 0) | 8.50M | 3.25M | −30% | **≈ 13.6 SOL** |
| **Unlock days** (months 3, 6, 9, 12) | 9.18M | 4.59M | **−38%** | **≈ 18.0 SOL** |
| Every other month | 0.68M (vault payouts) | 0.34M | −4% | ≈ 1.7 SOL |
| After month 12 | 0.68M/month | 0.34M | −4% | ≈ 1.7 SOL/month |

**Takeaways**
- **Unlock days are the pressure points.** Everyone (presale, founder, Tony, marketing, dev) unlocks on the same
  day, and the date is public. Plan a big game launch, contest or partnership for each unlock week, so new buyers arrive the
  same week tokens do.
- **Option to smooth it (same totals, same 12 months):** release each 20% gradually over its 3 months (Streamflow
  supports this). The stress becomes about −18%/month with ≈ 7.9 SOL/month of buying needed, instead of −38% spikes. Per
  quarter it's about the same pressure (≈ 21–24 SOL), but there are no predictable dump days for traders to front-run.
  **Recommended for the presale and team buckets. Founder decision.**
- After month 12, pressure falls to ≈ 1.7 SOL/month. Community growth easily covers that.
- Real outcomes depend on demand. This is a stress test, not a forecast.

---

## 6. The Honk Economy: how LBG flows
```
           ┌────────────── Community Rewards vault (multisig) ──────────────┐
           │  contests · games · airdrops · Flock Builders · staking         │
           ▼                                                                  │
   Members earn LBG ──► spend LBG in the ecosystem ──► LBG collected ─────────┤
                         (game boosts, cosmetic badges,      │                │
                          Honk Arcade skins, merch,          ├─ 40% recycled back to Rewards vault
                          proposal deposits, event tickets)  ├─ 30% burned (supply shrinks)
                                                             └─ 30% Liquidity Flywheel:
                                                                paired with treasury SOL, added to
                                                                the Raydium pool, LP tokens burned
```
- **Recycling first:** every LBG recycled is one less LBG the vault has to release, so net emissions fall as usage grows.
- **Liquidity Flywheel:** this is the "always going into the liquidity pool" mechanism. LP added this way is burned (permanent), so the
  pool deepens over time and every future sell moves the price less.
- **Spend items are utility or cosmetic, never a chance at a prize.** See the guardrails in section 10.

---

## 7. Rewards programs
### 7a. Contests and games (12M)
- Weekly challenges (Golden Honk style), Honk Bingo seasons, meme battles and community-voted themes.
- **Free to enter** for any prize-bearing contest. Prizes are judged on skill or creativity, not random draws.
- The prize table is set monthly by the Flock Council within the vault's 4%-of-pool cap (shared by all community programs). Unspent budget stays in the vault.
- Payouts are public: a winners list plus the tx signature.

### 7b. Airdrops (7M; first drop at month 3, then quarterly)
- Snapshot-based rewards for **participation**: contest entries, game play, governance votes, staking duration.
- Holding size alone never qualifies (that discourages whales and copy-wallet farming).
- Anti-sybil: Telegram account age, one verified wallet per member, a manual review list.

### 7c. Flock Builders, the community growth program (5M)
Run by Tony. Rewards **bringing in active members**, not purchases.
- Earn points when someone you invite: joins and stays 7 days, plays Honk Bingo, enters a contest, or votes.
- **Never** reward someone for an invitee's buy amount. That turns it into a pyramid-style scheme and adds legal risk.
- Points convert to LBG monthly. Per-person cap is 50,000 LBG/month, and payouts vest over 30 days.
- Top builders also get non-token gifts: merch, custom goose art, roles, an Honorary Goose title, a Council nomination.

### 7d. Staking: the Nest (8M)
- No fixed APY promised. The monthly staking budget (set within the vault cap) is shared pro-rata among stakers.
- Lock tiers: 30 days (1×), 90 days (1.5×), 180 days (2×). Longer locks also earn **more voting weight** and contest perks.
- Tool: Streamflow staking pools, or another audited Solana staking program (verify before launch).

---

### 7e. Flock Council grants (3M)
- Small grants for community-proposed projects: new mini-games, art, translations, events. Approved by Council vote, paid in milestones.

---

## 8. Governance: the Flock
- **Flock Council:** 5 elected members, 90-day terms (the proposal already announced). It runs the monthly reward
  budget, picks games and challenges, and moderates.
- **Holder votes** on Realms (Solana SPL Governance): staked LBG = voting weight. These cover new games, contest themes,
  Rewards vault budget changes, reserve releases and the LP-burn decision at month 12.
- **Off-limits to votes:** private keys, the founder's and team's personal vesting, and legal and safety decisions.
- A small LBG proposal deposit (refunded if the proposal reaches quorum) prevents spam and is another sink.

---

## 9. Health rules (circuit breakers)
1. **Monthly community vault payouts ≤ 4% of the LBG in the pool** at the start of the month (~676k at
   listing), unless the Council votes otherwise and publishes why.
2. **If the price stays below the listing price for 14 days,** pause airdrops and Flock Builders payouts (contests continue
   with non-token prizes) until it recovers or the Council votes.
3. **Insider sell policy (founder, Tony, marketing, dev):** sell at most 25% of tokens unlocked that month. Announce 48h ahead in the
   announcements channel. Prefer OTC to community buyers. No selling during a payout week.
4. **Publish a monthly transparency report:** releases, recycled, burned, LP added, wallet balances.
5. **Re-run `emissions.py` each month** with actual data. If "new buying needed" exceeds real net buying for two months, cut the next
   month's ceilings by half.

---

## 10. Legal and safety guardrails (get counsel before the presale)
- **Presale + governance token + team-built value = securities risk.** Never market profit, "100x" or price targets. Our
  public language is utility, community, games and governance.
- **Contests with prizes:** keep a free way to enter. Paid entry plus a prize plus chance can make it an illegal lottery or gambling.
- **Referral rewards:** reward activity, never recruitment-linked purchases, to avoid pyramid/MLM characteristics.
- **Eligibility:** geo-restrictions where required; presale terms and risk disclosure on the presale page.
- Nobody on the team ever DMs first, asks for seed phrases, or posts a contract address outside official channels.

---

## 11. Launch roadmap
| Phase | When | What |
|---|---|---|
| 0. Decide | Now | Approve D_founder_v2, unlock style, PinkSale, caps and date; legal review starts |
| 1. Build trust | Before presale | Mint, burn 900M, revoke authorities, Squads multisigs, Streamflow vesting (20% now + 20% per quarter) for every bucket, all links on the Trust page |
| 2. Presale | Day 0–3 | Flock whitelist round, then public round |
| 3. Listing | Day 3 | Finalize, Raydium pool, LP lock 365d, publish everything |
| 4. Stabilize | Months 0–2 | Small capped contest payouts, Honk Arcade seasons, first Council election, no airdrops |
| 5. Grow | Months 3–12 | Airdrops start, staking (the Nest) live, Flock Builders, LBG sinks in games, monthly reports |
| 6. Mature | Month 12+ | Vote on burning LP tokens; reserve decisions; new games by vote |

## 12. Open decisions
1. Approve **D_founder_v2** as the plan of record.
2. Unlock style: **step** (20% on the day, as specified) or **gradual** (20% released smoothly over each 3 months)? Recommended: gradual for presale and team buckets.
3. Confirm PinkSale Solana supports 90-day contributor vesting cycles. If not, use Meteora Presale Vault.
4. Presale date (devnet or tiny-sale rehearsal first) and legal review.
5. Recycling split for spent LBG (proposed 40 / 30 / 30).
