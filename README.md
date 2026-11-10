# Low Battery Goose

Low Battery Goose is a static community website and free mini-game built around the idea of running on 1% and still showing up. The site includes a battery-check meme maker, 1% Honk Bingo, a community challenge, project updates, and links to the official community channels.

**Live site:** [lowbatterygoose.pages.dev](https://lowbatterygoose.pages.dev/)

## Project Status

**$LBG is live on Solana.** It launched on Pump.fun on November 10, 2026 (UTC) and trades on the Pump.fun bonding curve.

- Official contract (mint): `9g7waf9sid91WiTAp4HXaA8iiPWacWyJiqty9Z4Kpump`
- Coin page: [pump.fun/coin/9g7waf9sid91WiTAp4HXaA8iiPWacWyJiqty9Z4Kpump](https://pump.fun/coin/9g7waf9sid91WiTAp4HXaA8iiPWacWyJiqty9Z4Kpump)
- Explorer: [Solscan](https://solscan.io/token/9g7waf9sid91WiTAp4HXaA8iiPWacWyJiqty9Z4Kpump)

Copycat tokens reuse the name and ticker, so check the full address against the one shown on the live site. Nobody from the project will DM you first, ask for a seed phrase, or ask you to send funds. Meme coins are speculative and can lose all value; nothing here is financial advice or a promise of returns.

The public website and games are free to use and do not require a wallet. Game selections and battery-check content stay in the browser unless a visitor chooses to share or save them; game scores are not automatically submitted. The separate Flock member portal at /flock uses email/password plus authenticator-app two-factor authentication and requires Cloudflare Pages Functions and Supabase configuration. Its classroom areas are placeholders for the community to define.

## Features

- Responsive landing page with project information, challenge rules, and official links.
- Battery check-in with a live preview and downloadable PNG meme card.
- 1% Honk Bingo with local game state, copyable results, and a downloadable Certified Honker badge.
- Telegram Mini App support, with browser use available as well.
- A protected Flock member portal at `/flock/`, with email/password sign-in, TOTP authenticator verification, and community-defined classroom placeholders.
- Security and permissions headers in the Cloudflare Pages `_headers` file.

## Run Locally

The site has no build step or package dependencies. Serve `lbgv6/` as the web root so its pages, assets, and `_headers` file are available together:

```sh
python3 -m http.server 8000 --directory lbgv6
```

Then open [http://localhost:8000](http://localhost:8000). The main page is `/`; the standalone arcade is `/honk-arcade-v6.html`.

## Deploy

Deploy `lbgv6/` as the static site root. For Cloudflare Pages, use `lbgv6` as the project root directory and leave the build command empty. The `_headers` file is written in Cloudflare Pages format.

The Flock portal also uses Cloudflare Pages Functions. The simple Python static server above previews public pages only; it does not execute the protected portal middleware or authentication endpoints. Configure the Supabase and Cloudflare environment variables before testing member sign-in. See [Flock Portal Setup](docs/FLOCK_PORTAL_SETUP.md).

Public channel URLs and the official mint are configured in [`lbgv6/site-config.js`](lbgv6/site-config.js). A valid `mint` value switches the whole site to live mode (banner, contract box, how-to steps, facts). Change it only for an address that has been verified on-chain.

## Project Layout

- `lbgv6/index.html` — main website and embedded Honk Bingo board.
- `lbgv6/honk-arcade-v6.html` — standalone, self-contained arcade game.
- `lbgv6/honk-bingo.html` — alternate Honk Bingo page with the site's shared styles.
- `lbgv6/script.js` — battery check-in, meme export, and channel-link rendering.
- `lbgv6/honk-game.js` — Telegram integration and the shared Bingo game behavior.
- `lbgv6/styles.css`, `lbgv6/honk-miniapp.css` — website and Mini App styles.
- `lbgv6/site-config.js` — public channel and site URLs.
- `lbgv6/flock/` — private member login and community portal pages.
- `lbgv6/functions/` — Cloudflare Pages Functions for portal sessions and route protection.
- `lbgv6/assets/` — goose artwork and social preview graphics.
- `lbgv6/_headers` — Cloudflare Pages response headers and Content Security Policy.
## Tokenomics and launch planning (internal)

- `docs/TOKENOMICS.md`: current Pump.fun launch tokenomics and verification checklist.
- `docs/WALLET_REGISTER.md`: public wallet and vesting disclosure register. Never add private keys or seed phrases.
- `tokenomics/config.json` and `tokenomics/model.py`: legacy presale research only; not applicable to the current Pump.fun plan.
- `docs/ECOSYSTEM_PLAN.md` and `docs/PRESALE_RUNBOOK.md`: archived presale research; do not use as launch instructions.
- `docs/DECISION_LOG.md` and `docs/AUDIT.md`: decision history and repository audit.
- `CLAUDE.md` and `.claude/`: rules, agents and skills for AI assistants
- Tests: `python3 -m unittest discover tests`

These are internal planning documents, not public offers. Nothing here is financial advice or a promise of returns.
