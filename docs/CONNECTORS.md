# Connectors, plugins and tooling for $LBG

## Already available to Claude in this workspace
| Connector | Use | Notes |
|---|---|---|
| GitHub | This repo, PRs, reviews | Working |
| Crypto.com market data | SOL/USD price for the model | Read-only, approved price source |
| Google Drive | Launch kit ZIPs from the ChatGPT session | Read files before reuse |
| Firecrawl | Docs and research (Metaplex, Squads, Streamflow) | Read-only |
| Context7 | Library docs (Solana web3.js, Anchor, Metaplex) | Read-only |
| Slack / Notion / Linear / Asana | Team ops | Currently failing to connect (proxy 403); retry from claude.ai settings |

## Recommended to add
| Need | Option | Why |
|---|---|---|
| On-chain reads | Solana RPC (Helius/QuickNode) via an MCP server | Verify supply, authorities, LP lock and holders. Key stays in local `.env`, never in the repo |
| Holder/rug scanning | RugCheck, Bubblemaps (manual) | Check what buyers will see before launch |
| Telegram | Existing bot (Cloudflare Worker) | `/contract` command returns the verified mint only |

## Rules
- API keys and RPC URLs with keys go in local `.env` only (gitignored, and denied to Claude in `.claude/settings.json`).
- Market data used for decisions must record source and timestamp.
- No connector is permitted to sign or send transactions.
