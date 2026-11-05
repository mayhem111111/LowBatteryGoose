# LBG public wallet and authority register

> Public addresses and public transaction links only. Never add private keys, seed phrases, recovery codes, or signing credentials. A blank or pending field is not evidence that a wallet or contract exists.

## Verified project disclosures supplied by the founder

| Role | Public address | Status | Verification notes |
|---|---|---|---|
| Jason Speer — founder / development wallet | `B6m4qxf1JX1ViWys4XCAX6YLdFXHKh8Y1BwzKGWD7u7x` | Supplied by founder | Valid-looking Solana base58 public key format; ownership is founder-declared and has not been independently proven. Confirm this is the wallet used for the Pump.fun creator account and initial buy before describing it as such. |

## Required after token creation

| Role | Public address / identifier | Status | Notes |
|---|---|---|---|
| LBG mint / contract address | Pending | Not created / not verified | Copy from the official Pump.fun coin page, then verify the mint and metadata on Solscan. |
| Pump.fun coin page | Pending | Not created | Publish only after the coin exists. |
| Tony beneficiary / creator-reward recipient wallet | Pending | Awaiting community lead | Confirm whether this is the same wallet receiving Tony's 25% creator-reward share and the beneficiary of any vesting stream. |
| Jason Streamflow vesting stream | Pending | Not verified | If used, publish amount, beneficiary, schedule, mint, and non-cancellable status. |
| Tony Streamflow vesting stream | Pending | Not verified | If used, publish amount, beneficiary, schedule, mint, and non-cancellable status. |
| Actual creator-reward split | Jason 75% / Tony 25% intended | Not verified | Confirm on the Pump.fun coin page after creation; do not treat the intended split as already active. |

## Treasury and program custody

| Role | Public address / identifier | Status | Recommendation |
|---|---|---|---|
| Community Rewards multisig | Pending | Not supplied / not verified | Create a Squads multisig only when there are community funds to custody. Publish the address, signer threshold, and policy. |
| Liquidity Management multisig | Not required at initial launch | Optional future setup | Create separately only if the project later controls additional liquidity capital or LP positions. Do not mix with the community rewards vault. |
| Goose Guess prize wallet or vesting account | Pending | Funding not verified | Publish only after the advertised prize is funded and independently checkable. |
| Flock Drop wallet | Pending | Proposal only | Create only after founder approval, final quest rules, and a live quest URL. |
| Marketing / development treasury | Not required yet | No verified allocation | Use only if an actual budget is approved and funded. |
| Reserve wallet | Not required yet | No verified reserve | Do not claim a reserve until it is approved and funded. |

## Governance identifiers

A separate “governance wallet” is not needed simply to publish tokenomics. Governance is a voting process/program, not a bucket of tokens. If a Solana Realms DAO is actually created later, publish the Realm address, voting configuration, and the treasury/multisig authority it controls. Do not claim governance is operational before that exists.

## Is another wallet needed?

- **No separate tokenomics wallet.** Tokenomics is the published accounting policy.
- **Community multisig:** recommended for custody of community rewards once funded.
- **Liquidity multisig:** optional, only when the project actually manages a separate liquidity position or treasury liquidity.
- **Governance:** create a Realm or other voting program only when the DAO is implemented; it can govern a multisig rather than requiring a separate wallet just for governance.
- **Prizes / airdrops:** use a separately disclosed wallet when the campaign has been approved and funded, so balances and payouts are auditable.

## Founder confirmations still needed

1. Confirm whether the supplied Jason wallet is also the Pump.fun creator wallet and the wallet that will make the initial buy.
2. Supply Tony's public beneficiary / creator-reward wallet when ready.
3. Supply the Community Rewards multisig public address and threshold once it exists.
4. Confirm whether a separate Liquidity Management multisig will be created later.
5. After launch, provide the mint address, creator-reward settings evidence, purchase transaction(s), and vesting-stream links.

Only public addresses are needed here. Never send a private key or seed phrase.
