# $LBG tokenomics and presale numbers

> Generated from `tokenomics/config.json` via `python3 tokenomics/model.py`.
> SOL/USD = $93.85 (Crypto.com, 2026-11-04 11:36 UTC). **Refresh this on presale morning.**
> Internal planning only. Nothing here is a price forecast or a promise to buyers.

## Supply
| | Tokens |
|---|---|
| Minted | 1,000,000,000 |
| Burned at genesis | 900,000,000 |
| **Circulating / max supply** | **100,000,000** (mint and freeze authority revoked) |

The 900M burn has no economic effect on price. Price and market cap are calculated on the 100M
that exist. That's why every figure below uses 100M. Publish the burn tx so buyers can verify it.

## Finding 1: the allocation as given doesn't add up to a working presale
The listed buckets total 20 + 20 + 25 + 25 + 5 = **95M**, so the presale can only be the remaining **5M (5%)**.
That creates two problems:

1. **The presale can't fund the LP.** The LP holds 20M tokens, 4x the presale tokens. To list
   above the presale price, the LP needs about 5x the SOL the presale raises. The team would have
   to add 80 SOL of its own at a 20 SOL raise. If the team only adds the presale SOL, the listing
   price lands about 75% *below* what presale buyers paid, and they're instantly underwater.
2. **Insiders hold 50%** (founder 25% + team 25%). On-chain scanners (RugCheck, Bubblemaps, etc.)
   flag this immediately. It undermines the "we're not a rug" message the presale is meant to send.

## Recommended allocation (Scenario B)
| Bucket | Tokens | % | Vesting / lock (recommended) |
|---|---|---|---|
| Presale | 25,000,000 | 25% | 100% at listing (or 50% at listing + 50% after 30 days) |
| Liquidity pool | 15,000,000 | 15% | LP tokens burned or locked 12 months |
| Staking / airdrops / community | 20,000,000 | 20% | Multisig, emitted over 12–24 months |
| Dev / marketing / team | 20,000,000 | 20% | 3-month cliff, then 12-month linear |
| Founder | 15,000,000 | 15% | 6-month cliff, then 12-month linear |
| Reserve | 5,000,000 | 5% | Multisig, Flock Council visibility |
| **Total** | **100,000,000** | 100% | Insiders 35% |

## Presale terms (Scenario B, recommended)
| Item | Value |
|---|---|
| Presale price | **250,000 LBG per SOL** (0.000004 SOL ≈ $0.000375 per LBG) |
| Hard cap / soft cap | **100 SOL / 50 SOL** (refunds if soft cap is missed) |
| Per-wallet min / max | **0.05 SOL / 1 SOL** (max = 250,000 LBG = 0.25% of supply) |
| Wallets needed to fill | 100 minimum (≈ 200 at 0.5 SOL average, about 22% of a 900-member TG) |
| Listing price | **200,000 LBG per SOL** (presale buyers start +25%) |
| LP at listing | 15M LBG + 75 SOL (75% of the raise, LP locked/burned) |
| Treasury | 25 SOL (multisig) |
| Presale FDV → listing FDV | ≈ $37.5k → ≈ $46.9k |

If the presale ends between the soft and hard caps: keep the same price, put 75% of the SOL in
the LP, and burn the unsold presale tokens plus the proportional unused LP tokens. That keeps
the listing price at 1.25x.

**Smaller fallback (B_conservative):** 50 SOL hard cap, 0.5 SOL max per wallet, 500,000 LBG per SOL.

## What 100x means
| Multiple vs presale | Price / LBG | Market cap (FDV) needed |
|---|---|---|
| 10x | $0.00375 | $375k |
| 25x | $0.00939 | $939k |
| 50x | $0.01877 | $1.88M |
| **100x** | **$0.03754** | **$3.75M** |

The starting valuation is the main lever. Starting small (about $37.5k FDV) means 100x needs a $3.75M
market cap. Starting at $750k would need $75M. That's why this plan sizes the raise to the
community you have rather than a big number.

No allocation design produces a 100x. Demand does: sustained buyers, volume, listings and
community growth. Most meme coins never reach 10x. Treat 100x as a stretch target for internal
planning, **never as public messaging**. Saying it publicly creates legal exposure for a
governance token sold in a presale.

## Bucket values at listing (B)
Presale $11.7k · LP $7.0k · Community $9.4k · Team $9.4k · Founder $7.0k · Reserve $2.3k.
At 100x the founder bucket would be worth ≈ $563k on paper. Realizable value depends on liquidity.
A 75 SOL LP can't absorb large sells, which is why vesting matters for everyone.
