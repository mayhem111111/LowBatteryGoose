# Low Battery Goose ($LBG): presale and ecosystem tokenomics plan

> Internal planning document, v1 (2026-11-04). Expect revisions.
> Every number comes from `tokenomics/config.json` (scenario **C_ecosystem**) via
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

## 2. Supply and allocation (C_ecosystem)
1,000,000,000 minted, then 900,000,000 burned, leaving **100,000,000 max supply**. Mint and freeze authority are revoked, so nobody can ever mint more.

| Bucket | Tokens | % | Purpose |
|---|---|---|---|
| Presale | 25,000,000 | 25% | Community presale on PinkSale |
| Liquidity pool | 17,000,000 | 17% | Raydium pool, funded by the presale (≈ 16.91M used, rest burned) |
| Community rewards | 20,000,000 | 20% | Contests and games 8M, staking 5M, airdrops 4M, Flock Builders 3M |
| Dev / marketing / team | 18,000,000 | 18% | Marketing 6M, development 6M, community lead (Tony) 6M |
| Founder | 15,000,000 | 15% | Jason Spear |
| Reserve | 5,000,000 | 5% | Emergencies and listings, released only by governance vote |
| **Total** | **100,000,000** | | Insiders (team + founder) **33%** |

Changes vs scenario B: LP 15M→17M (a deeper pool), marketing 8M→6M. Why: the stress test showed the pool was too
thin relative to presale tokens.

---

## 3. Locked and vesting tokens
| Bucket | Amount | Unlocks | Lock type | Enforced by |
|---|---|---|---|---|
| Presale buyers | 25,000,000 | 50% at listing, 25% month 1, 25% month 2 | Vesting | PinkSale contributor vesting (*verify on Solana form*; fallback: Meteora Presale Vault) |
| Liquidity pool | 17,000,000 | Never withdrawn. LP locked 12 months, then burn the LP tokens by vote | LP lock | PinkSale liquidity lockup (365 days) |
| Contests and games | 8,000,000 | Ceiling 333,333/month for 24 months | Multisig budget | Squads multisig "Community Rewards" |
| Staking rewards | 5,000,000 | 208,333/month for 24 months | Streamed | Streamflow stream into the staking pool |
| Airdrops | 4,000,000 | 500,000 in months 3, 4, 6, 8, 10, 12, 15, 18 | Multisig budget | Squads multisig |
| Flock Builders (referrals) | 3,000,000 | Ceiling 125,000/month; each payout vests 30 days | Multisig budget | Squads + Streamflow |
| Marketing | 6,000,000 | 750,000 at listing, then 24-month linear | Vesting | Streamflow → Marketing multisig |
| Development | 6,000,000 | **3-month cliff**, then 18-month linear (333,333/mo) | Vesting | Streamflow |
| Community lead (Tony) | 6,000,000 | **3-month cliff**, then 18-month linear (333,333/mo) | Vesting | Streamflow |
| Founder (Jason) | 15,000,000 | **6-month cliff**, then 18-month linear (833,333/mo) | Vesting, non-cancellable | Streamflow |
| Reserve | 5,000,000 | 12-month time lock, then only by Flock vote | Time lock | Squads + Streamflow |

**Supply status over time** (from `emissions.py`; circulating = tokens released to wallets, outside the pool):

| Month | Circulating | Still vesting | Reserve locked | In LP |
|---|---|---|---|---|
| 0 (listing) | 13.25M (13.2%) | 64.75M | 5M | 17M (locked) |
| 3 | 28.91M (28.9%) | 49.09M | 5M | 17M (locked) |
| 6 | 34.56M (34.6%) | 43.44M | 5M | 17M (locked) |
| 12 | 50.38M (50.4%) | 27.63M | 5M | 17M |
| 24 | 78.00M (78.0%) | 0 | 5M | 17M |

All vesting contracts and multisig addresses get published on the website's Trust & Transparency section on listing day.

---

## 4. Presale plan (PinkSale, Solana)
| Field | Value |
|---|---|
| Presale rate | **250,000 LBG per SOL** (0.000004 SOL ≈ $0.000375) |
| Listing rate | **200,000 LBG per SOL** (presale buyers start +25%) |
| Soft / hard cap | **50 / 100 SOL** (refunds if the soft cap is missed) |
| Min / max per wallet | **0.05 / 1 SOL** (max = 250,000 LBG = 0.25% of supply) |
| Contributor vesting | 50% at listing, 25% after ~30 days, 25% after ~60 days |
| Liquidity | **89%** of net raise ≈ **84.5 SOL + 16.91M LBG**, locked 365 days |
| Unsold tokens | Burn |
| Platform fee | 5% of SOL raised |
| Treasury at hard cap | ≈ **10.5 SOL** (Squads multisig) |
| Tokens to deposit | ≈ 41.91M LBG (confirm against the form) |
| Presale FDV → listing FDV | ≈ $37.5k → ≈ $46.9k |

**Rounds**
1. **Flock round (whitelist, 24h):** active members only. Criteria: in the Telegram group ≥ 7 days, played Honk Bingo or
   entered a challenge, one wallet per person. Same price and cap as public. Rewards the people already here.
2. **Public round (48h)** for whoever is left, same terms.
3. **Finalize, then list on Raydium,** and publish the mint, pool, LP lock and vesting links at the same moment on every channel.

The treasury is small (≈ 10.5 SOL ≈ $1k). Development in year one is funded by the founder and team, not by the presale.
That's deliberate: the raise goes into liquidity.

---

## 5. Stress test: what the ecosystem must absorb
Worst case assumed: 30% of presale tokens sell at listing, 50% of every later release sells, and **zero new buyers**.

| Month | Released | Stress sold | Price impact if no buyers | **New buying needed to offset** |
|---|---|---|---|---|
| 0 | 13.25M | 4.13M | −35% | **≈ 16.6 SOL** |
| 1–2 | 7.14M/mo | 3.57M/mo | −32%/mo | **≈ 14.7 SOL/mo** |
| 3–6 | 1.4–2.1M/mo | 0.7–1.0M/mo | −8 to −11% | ≈ 3.3–4.8 SOL/mo |
| 7–21 | 2.4–2.9M/mo | 1.2–1.4M/mo | −13 to −15% | ≈ 5.6–6.6 SOL/mo |

**Takeaways**
- **Listing week and months 1–2 are the danger zone.** That's when the presale unlocks. No airdrops are scheduled then, and
  contests should pay out in recognition, art and roles rather than tokens until month 3.
- After month 3 the ecosystem needs roughly **4–7 SOL of net new buying per month** (≈ $400–650) to hold the price flat, even if half of all
  releases get sold. That's achievable with ~50–100 new active holders a month. It becomes Tony's growth KPI.
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
### 7a. Contests and games (8M, ceiling 333k/month)
- Weekly challenges (Golden Honk style), Honk Bingo seasons, meme battles and community-voted themes.
- **Free to enter** for any prize-bearing contest. Prizes are judged on skill or creativity, not random draws.
- The prize table is set monthly by the Flock Council within the ceiling. Unspent budget rolls forward.
- Payouts are public: a winners list plus the tx signature.

### 7b. Airdrops (4M, eight drops of 500k from month 3)
- Snapshot-based rewards for **participation**: contest entries, game play, governance votes, staking duration.
- Holding size alone never qualifies (that discourages whales and copy-wallet farming).
- Anti-sybil: Telegram account age, one verified wallet per member, a manual review list.

### 7c. Flock Builders, the community growth program (3M, ceiling 125k/month)
Run by Tony. Rewards **bringing in active members**, not purchases.
- Earn points when someone you invite: joins and stays 7 days, plays Honk Bingo, enters a contest, or votes.
- **Never** reward someone for an invitee's buy amount. That turns it into a pyramid-style scheme and adds legal risk.
- Points convert to LBG monthly. Per-person cap is 50,000 LBG/month, and payouts vest over 30 days.
- Top builders also get non-token gifts: merch, custom goose art, roles, an Honorary Goose title, a Council nomination.

### 7d. Staking: the Nest (5M over 24 months)
- No fixed APY promised. Each month's 208,333 LBG is shared pro-rata among stakers.
- Lock tiers: 30 days (1×), 90 days (1.5×), 180 days (2×). Longer locks also earn **more voting weight** and contest perks.
- Tool: Streamflow staking pools, or another audited Solana staking program (verify before launch).

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
1. **Monthly community release ≤ its ceiling AND ≤ 4% of the LBG in the pool** at the start of the month (~676k at
   listing), unless the Council votes otherwise and publishes why.
2. **If the price stays below the listing price for 14 days,** pause airdrops and Flock Builders payouts (contests continue
   with non-token prizes) until it recovers or the Council votes.
3. **Insider sell policy (founder and team):** sell at most 25% of tokens unlocked that month. Announce 48h ahead in the
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
| 0. Decide | Now | Approve C_ecosystem, PinkSale, caps and date; legal review starts |
| 1. Build trust | Before presale | Mint, burn 900M, revoke authorities, Squads multisigs, Streamflow vesting for all buckets, all links on the Trust page |
| 2. Presale | Day 0–3 | Flock whitelist round, then public round |
| 3. Listing | Day 3 | Finalize, Raydium pool, LP lock 365d, publish everything |
| 4. Stabilize | Months 0–2 | Non-token prizes, Honk Arcade seasons, first Council election, no airdrops |
| 5. Grow | Months 3–12 | Airdrops start, staking (the Nest) live, Flock Builders, LBG sinks in games, monthly reports |
| 6. Mature | Month 12+ | Vote on burning LP tokens; reserve decisions; new games by vote |

## 12. Open decisions
1. Approve scenario **C_ecosystem** (vs B).
2. Confirm PinkSale Solana supports contributor vesting. If not: launch without it (higher listing risk) or use Meteora.
3. Presale date (devnet or tiny-sale rehearsal first).
4. Founder/team vesting lengths (proposed: founder 6+18 months, team 3+18 months).
5. Recycling split for spent LBG (proposed 40 / 30 / 30).
