# Presale platform decision

Status: **RECOMMENDATION. Awaiting founder approval.** Researched 2026-11-04 from each platform's official docs.

## Requirements (from the $LBG plan)
1. Fixed presale price (everyone pays the same)
2. Per-wallet min/max buy
3. Soft cap, with automatic refunds if it's missed
4. Raise goes into the liquidity pool automatically (not into a founder wallet)
5. LP lock
6. Works with an **existing** token (we mint 1B, burn 900M and revoke authorities *before* the sale)
7. No-code, so the founder can run it without a developer on day one

## Comparison
| | **PinkSale (Solana presale)** | Metaplex Genesis | Meteora Presale Vault | Pump.fun |
|---|---|---|---|---|
| Fixed price | ✅ Presale rate | ✅ Presale mode | ✅ Fixed-price mode | ❌ Bonding curve |
| Per-wallet min/max | ✅ Required fields | ✅ `minimumDepositAmount` / `depositLimit` | ✅ | ❌ |
| Soft cap + refunds | ✅ (soft cap ≥ 25% of hard) | Launch Pool only (price not fixed) | ✅ | ❌ |
| Auto LP from raise | ✅ Raydium, 25–100% of raise | Launch Pool → Raydium | Separate step (Meteora pool) | Auto on graduation |
| LP lock | ✅ Set in days | Launch Pool: 1 yr, quarterly unlocks | Configurable | Platform-held |
| Existing token | ✅ Paste token address | ❌ Genesis creates the mint | ✅ | ❌ Creates the mint |
| No-code UI | ✅ | Partial (SDK-centric docs) | ❌ SDK/config (meteora-invent) | ✅ |
| Fee | 5% of SOL raised | 5% on creator withdraw | Configurable | Trading fees |
| Vesting for team | Separate tool (PinkLock / Streamflow) | Out of scope for presale | ✅ Built in | ❌ |

## Recommendation: PinkSale Solana presale
It's the only option that meets all seven requirements without writing code, and it maps 1:1 onto our
model (`python3 tokenomics/model.py` prints the exact form values).

| PinkSale field | Value (Scenario B) |
|---|---|
| Presale rate | 250,000 LBG per SOL |
| Listing rate | 200,000 LBG per SOL |
| Soft cap / hard cap | 50 / 100 SOL |
| Min / max buy | 0.05 / 1 SOL |
| Refund type (unsold tokens) | **Burn** |
| Router | Raydium AMM V4 |
| Liquidity % | 78% (≈ 74.1 SOL + 14.82M LBG at hard cap) |
| Liquidity lockup | 365 days |
| Tokens to deposit | ≈ 39.8M LBG (**confirm the exact figure the form shows before signing**) |
| Treasury at hard cap | ≈ 20.9 SOL after 5% fee and LP |

Vesting for founder/team: Streamflow (well-established on Solana) or PinkLock, whichever we verify
supports SPL vesting with a public link. Treasury, community and reserve sit on a Squads multisig.

## Caveats (verify before signing)
- PinkSale's Solana docs were last updated about a year ago. Rely on what the live form shows.
- It's unconfirmed whether "Liquidity %" applies before or after the 5% fee. The form's "tokens required" figure settles it.
- Core parameters (rates, caps, times) **can't be changed after creation**. A mistake means cancelling and
  recreating from a *new wallet*.
- PinkSale optionally offers paid KYC/audit badges. They build trust but aren't a substitute for the
  launch-security review.
- Rehearse the whole flow on devnet if PinkSale supports it; otherwise do a tiny test sale first.

## Alternatives to keep in mind
- **Metaplex Genesis Launch Pool**: the fairest price discovery, with refunds and a 1-year LP lock, but no fixed
  price, and it mints the token itself (so the 1B → 100M burn story goes away).
- **Meteora Presale Vault**: the most flexible (built-in vesting, pro-rata mode), but needs a developer.
