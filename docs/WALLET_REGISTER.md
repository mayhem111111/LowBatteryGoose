# LBG public wallet and authority register

> Public addresses and public transaction links only. Never add private keys, seed phrases, recovery codes, or signing credentials. A blank or pending field is not evidence that a wallet or contract exists.

## Sole named founder / team wallet

| Role | Public address | Status | Verification notes |
|---|---|---|---|
| Jason Speer — founder / development wallet | `B6m4qxf1JX1ViWys4XCAX6YLdFXHKh8Y1BwzKGWD7u7x` | Supplied by founder | Valid-looking Solana base58 public-key format; ownership is founder-declared and has not been independently proven. Confirm whether this is the Pump.fun creator and initial-buy wallet. |

Jason Speer is the sole named founder/team member in the current plan. No other person is listed as a project beneficiary, wallet recipient, vesting beneficiary, or creator-reward recipient.

## Required after token creation

| Role | Public address / identifier | Status | Notes |
|---|---|---|---|
| LBG mint / contract address | `9g7waf9sid91WiTAp4HXaA8iiPWacWyJiqty9Z4Kpump` | Live. Supplied by founder; matched against the Pump.fun coin page, DexScreener and GeckoTerminal on 2026-11-10 | Token name "Low Battery Goose", ticker LBG. Mint, freeze and metadata authority status still to be read on Solscan and recorded here. |
| Pump.fun coin page | https://pump.fun/coin/9g7waf9sid91WiTAp4HXaA8iiPWacWyJiqty9Z4Kpump | Live (bonding curve, not graduated as of 2026-11-10) | Links to the official X, Telegram and website were present on the coin page on 2026-11-10. |
| Jason Streamflow vesting stream | Pending | Not verified | If used, publish token mint, amount, beneficiary, schedule, and non-cancellable status. |
| Actual creator-reward recipient | Pending verification | Not verified | Verify the creator wallet and settings on the coin page; no third-party split is authorized. |

## Treasury and program custody

| Role | Public address / identifier | Status | Recommendation |
|---|---|---|---|
| Community Rewards multisig | Pending | Not supplied / not verified | Create a Squads multisig only when there are community funds to custody. Publish address, signer threshold, and spending policy. |
| Liquidity Management multisig | Not required at initial launch | Optional future setup | Create separately only if the project later controls additional liquidity capital or LP positions. |
| Goose Guess prize wallet or vesting account | Pending | Funding not verified | Publish only after the advertised prize is funded and independently checkable. |
| Flock Drop wallet | Pending | Proposal only | Create only after founder approval, final quest rules, and a live quest URL. |
| Marketing / development treasury | Not required yet | No separate treasury approved | Use only if a real, approved budget is assigned and funded. |
| Reserve wallet | Not required yet | No verified reserve | Do not claim a reserve until it is approved and funded. |

## Governance identifiers

A separate “governance wallet” is not needed simply to publish tokenomics. Governance is a voting process/program, not a bucket of tokens. If a Solana Realms DAO is created later, publish its Realm address, voting configuration, and the treasury/multisig authority it controls. Do not claim governance is operational until voting and execution are live.

## Is another wallet needed?

- **No separate tokenomics wallet.** Tokenomics is the published accounting policy.
- **Community multisig:** recommended for custody of community rewards once funded.
- **Liquidity multisig:** optional, only when the project manages a separate liquidity position or treasury liquidity.
- **Governance:** create a Realm or other voting program only when the DAO is implemented; it can govern a multisig.
- **Prizes / airdrops:** use separately disclosed wallets when a campaign has approved rules and committed funding.

## Founder confirmations still needed

1. Confirm whether Jason's supplied wallet is also the Pump.fun creator wallet and will make the initial buy.
2. Supply the Community Rewards multisig address and signer threshold once created.
3. Confirm whether a separate Liquidity Management multisig will be created later.
4. The mint address is recorded above. Still needed: actual purchase transaction(s), creator settings evidence, and vesting-stream link.

Only public addresses are needed here. Never send a private key or seed phrase.
