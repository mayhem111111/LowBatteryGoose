# LowBatteryGoose: rules for Claude and AI agents

LowBatteryGoose is a Solana SPL token that serves as both a meme coin and a governance token.
This repo holds the tokenomics model, the launch runbooks and (later) on-chain programs and the site.

## Hard rules (never break these)
1. **No live on-chain or money-moving action without explicit written approval in the current task.**
   That covers minting, burning, transfers, LP creation/removal, presale contract deploys,
   authority changes and airdrops. Prepare the command, show it, then stop and wait.
2. **Never read, print, log or commit secrets.** That includes keypairs (`*.json` wallets, `id.json`),
   seed phrases, `.env*` files and RPC/API keys. They live only in local secure config, outside git.
3. **Every number comes from `tokenomics/config.json` via `tokenomics/model.py`.** Don't hand-edit
   figures in docs. Change config, rerun the model, paste the output.
4. **Quote prices in SOL. USD is display-only.** Record the SOL/USD source and timestamp, and treat a
   price older than 1 hour as stale before any launch decision.
5. **No price promises in public copy.** Never write "100x", "guaranteed" or "profit" claims in
   marketing, the site or socials. Targets in `docs/` are internal planning scenarios, not promises.
6. **Stop and ask** when data is missing, stale or conflicting, or when an allocation doesn't sum to
   100,000,000.
7. Log every decision, assumption and parameter change in `docs/DECISION_LOG.md`.

## Layout
```
tokenomics/   config.json (source of truth) + model.py (presale) + emissions.py (locks, vesting, stress test)
tests/        python3 -m unittest discover tests
docs/         ECOSYSTEM_PLAN.md, TOKENOMICS.md, PLATFORM_DECISION.md, PRESALE_RUNBOOK.md, CONNECTORS.md, DECISION_LOG.md, AUDIT.md
.claude/      agents/, skills/, settings.json (permissions)
programs/     (future) Anchor/SPL programs: staking, governance
lbgv6/        live static site (Cloudflare Pages root): index, Honk Bingo, arcade, _headers CSP
```

## Website rules
- `lbgv6/` deploys as-is to lowbatterygoose.pages.dev. Treat edits as public statements.
- Editing the inline `<script>` in `honk-arcade-v6.html` requires regenerating its sha256 in `lbgv6/_headers`.
- Never set `mint`/`pumpFun` in `site-config.js` until the address is verified on-chain and approved.
- Public facts (launch venue, presale, supply) must match `tokenomics/config.json` and `docs/DECISION_LOG.md`.

## Commands
- Run the model: `python3 tokenomics/model.py [--sol-usd <price>]`
- Locks, vesting and stress test: `python3 tokenomics/emissions.py`
- 2-week tiered presale: `python3 tokenomics/presale_2wk.py`; workbook: `python3 tokenomics/build_workbook.py docs/LBG_tokenomics_2wk_presale.xlsx` (then recalc)
- Tests: `python3 -m unittest discover tests`

## Agents and skills
- `tokenomics-analyst`: changes to supply, allocation, price, caps or vesting
- `launch-security-reviewer`: anything touching mint/freeze authority, LP, presale contracts or wallets
- `community-comms-reviewer`: public copy, checked for price promises and securities-risk language
- Skill `tokenomics-model`: rerun and refresh the numbers
- Skill `presale-launch-checklist`: go/no-go gate before and during the presale
