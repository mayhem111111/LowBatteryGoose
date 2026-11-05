# $LBG tokenomics — current Pump.fun launch plan

> **Plan of record:** Solana / Pump.fun launch, no presale, and no planned 900,000,000-token genesis burn.
> **Important:** This is the current project plan, not proof of blockchain state. Values marked as planned or intended must be verified after the coin is created. This document is not an offer, price forecast, or promise of returns.

## 1. Launch structure

| Item | Current plan | Evidence required |
|---|---|---|
| Token | Low Battery Goose ($LBG) | Confirm name and ticker on the official coin page and Solscan |
| Network | Solana | Verify mint |
| Launch | Pump.fun | Official coin page after creation |
| Planned initial supply | 1,000,000,000 LBG | Verify actual mint supply |
| Presale | None | No presale sale or presale allocation under this plan |
| Genesis burn | None planned | Do not claim a burn without a confirmed burn transaction |
| Planned post-launch supply | 1,000,000,000 LBG before any separately verified later burns | Verify on-chain |
| Mint/freeze authority | Not yet verified | Read actual authority status on-chain; never infer revocation from a config file |

The old presale model based on a 900M genesis burn and 100M remaining supply is shelved. Pump.fun's launch curve distributes the token; this plan does not create separate presale, LP, staking, marketing, development, or reserve token allocations at mint time.

## 2. Team holdings — intended purchases, not mint allocations

The founder's latest recorded instructions target the following team positions, funded through the launch purchase. These amounts are not pre-allocated balances; actual quantities must be evidenced by transaction signatures and wallet balances.

| Beneficiary | Intended tokens | Share of planned 1B supply | Status |
|---|---:|---:|---|
| Jason Speer — founder | 50,000,000 LBG | 5.0% | Target; purchase and wallet balance require verification |
| Tony — community lead | 25,000,000 LBG | 2.5% | Target funded by founder per recorded instruction; recipient and transfer/stream require verification |
| **Combined target** | **75,000,000 LBG** | **7.5%** | Not an on-chain allocation |

Recorded intended vesting for each position: 25% at launch, then 25% on February 4, May 4, and August 4, 2027. The recorded plan specifies Streamflow vesting and non-cancellable streams. Do not describe tokens as locked until each stream exists and its mint, amount, beneficiary, schedule, and cancellation settings are publicly verifiable.

At the target amounts, each 25% tranche is 12,500,000 LBG for Jason and 6,250,000 LBG for Tony. Adjust all figures to match actual transactions and deployed streams.

## 3. Creator rewards

The founder's intended creator-reward split is Jason 75% / Tony 25%, with no community-fee share. This is an intended setting, not a verified configuration. After coin creation, inspect the official Pump.fun coin page and verify the recipients and split before publicly claiming that it is active.

## 4. Community programs

Community initiatives do not automatically receive supply at mint. Any prize or reward must be purchased/acquired, funded, and disclosed separately. Avoid double-counting the same tokens across team holdings, prize pools, and reward programs.

| Program | Internal plan | Publication rule |
|---|---|---|
| Goose Guess | Website displays a 5,000,000 LBG grand prize | Confirm final rules and prove prize funding in a disclosed wallet/account before calling it funded or available |
| Flock Drop | Marketing plan proposes a 10,000,000 LBG pool | Proposal only until approved by founder, quest system and rules are live, and wallet is funded |
| Future contests, games, airdrops | Possible future community activity | Announce only with a published budget, eligibility, source wallet, and funded balance |

The Flock Drop, prize wallet, and any additional community allocations must be budgeted against actual purchased holdings. They are not included in the 75M team target and must not be represented as funded by it unless the purchase receipt and remaining balance demonstrate that.

## 5. Liquidity and trading

- Initial trading is expected to take place through Pump.fun's bonding-curve launch mechanism.
- No fixed presale price, listing premium, hard cap, soft cap, or presale raise target applies.
- Do not claim project-owned liquidity is locked, burned, or controlled by a multisig unless a pool/LP position actually exists and custody/lock evidence is available.
- A separate Liquidity Management multisig is optional and only useful if the project later manages additional liquidity capital or LP positions.

## 6. Supply, authorities, and burn claims

Do not make any of these claims until verified from Solana data:
- 900M tokens burned;
- 100M total or maximum supply;
- mint or freeze authority revoked;
- metadata update authority renounced;
- liquidity locked or LP tokens burned;
- team or community balances locked in vesting;
- staking or governance operational.

A later buy-and-burn may be considered as a separate, approved transaction, with the exact burn amount and transaction signature published. It is not part of the initial launch plan.

## 7. Wallet register and treasury separation

See [WALLET_REGISTER.md](WALLET_REGISTER.md) for the public address register. The founder wallet supplied by the founder is listed there as founder/development wallet; its role in the Pump.fun creator account and initial buy still needs confirmation.

A separate “tokenomics wallet” is not required. Tokenomics is the accounting policy, not a custody role.

Recommended separation:
1. Founder / creator / initial-buy wallet.
2. Tony beneficiary and creator-reward recipient wallet.
3. Community Rewards multisig, when funded.
4. Optional Liquidity Management multisig, only if project-managed liquidity assets later exist.
5. Separate prize or airdrop wallet only when a program has approved rules and committed funding.

Governance is not another wallet by itself. If a Realm or other governance program is implemented, publish its program/Realm address and explain what treasury authority it controls. Do not claim governance is operational until voting and execution are live.

## 8. Launch verification checklist

- [ ] Create the coin and copy the mint from the official Pump.fun page.
- [ ] Verify name, ticker, token supply, token program, authorities, and creator on Solscan.
- [ ] Verify founder purchase transactions and public wallet balances.
- [ ] Verify Tony's beneficiary address and any transfer/vesting stream.
- [ ] Confirm the creator-reward split on the coin page.
- [ ] Create and verify Streamflow streams before claiming tokens are locked.
- [ ] Create and verify the Community Rewards multisig before describing it as funded.
- [ ] Prove the Goose Guess and Flock Drop prize/reward funds before announcing them as available.
- [ ] Update site, bot, X, and Telegram with the same verified mint and links.

Historical PinkSale/presale models, presale pricing, the 900M burn scenario, and 100M post-burn supply remain only as historical research and do not describe this launch.
