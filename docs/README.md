# Low Battery Goose — Official Project Documents

## Source of truth

The Markdown files in this directory are the canonical source for public project facts and policy:

- [White Paper](WHITEPAPER.md)
- [Tokenomics](TOKENOMICS.md)
- [Roadmap](ROADMAP.md)
- [Public Wallet Register](WALLET_REGISTER.md)
- [Governance Board Charter](BOARD_GOVERNANCE_CHARTER.md)
- [Governance Roles & Application Guide](GOVERNANCE_ROLES.md)

The Markdown publication copies under `lbgv6/documents/` must match these canonical files exactly. A regression test enforces this. Website HTML pages are styled publication renditions, not independent authorities; update them in the same pull request and verify that their material claims match the canonical Markdown. The public document index must list each document exactly once.

## Publication and verification standard

Distinguish confirmed facts from plans, proposals, targets, and aspirations. Verify any mint address, wallet address, balance, transaction signature, signer configuration, deployment status, or operational claim before describing it as live or confirmed.

The project policy requires at least two independent authorized signatures for every project-controlled asset release. A written policy does not prove a multisignature wallet is configured. Publish the wallet, signer set, threshold, and evidence only after independently verifying them.

## Security and privacy

Never commit API tokens, Supabase service-role keys, session secrets, private keys, seed phrases, recovery codes, applicant data, or production credentials. Store runtime secrets in Cloudflare Pages environment variables/secrets. Limit the Airtable token to the application base and only the permissions required for record creation.

Governance intake remains disabled until the Airtable credential has been rotated and verified, and an effective rate-limiting control is in place. Pages Function honeypot and validation are supplementary controls, not a substitute for edge rate limiting. Do not use process-local in-memory counters as production rate limiting on edge workers.

## Legacy material

Historical planning documents and prior tokenomics or reward proposals are not current policy unless explicitly reviewed, dated, and linked from the canonical documents. Archive or label superseded material rather than silently presenting it as current.
