# Low Battery Goose

Low Battery Goose is a static community website and free mini-game built around the idea of running on 1% and still showing up. The site includes a battery-check meme maker, 1% Honk Bingo, a community challenge, project updates, and links to the official community channels.

**Live site:** [lowbatterygoose.pages.dev](https://lowbatterygoose.pages.dev/)

## Project Status

This is a prelaunch community project. A Solana token launch on Pump.fun has been planned, but **no official token has been deployed or verified, and trading is not live**. The proposed ticker is `$LBG`; it is not a token address or proof of an official token. Do not send funds or share wallet credentials with anyone claiming otherwise.

The website and games are free to use and do not require a wallet. Game selections and battery-check content stay in the browser unless a visitor chooses to share or save them. There is no backend or automatic score submission.

## Features

- Responsive landing page with project information, challenge rules, and official links.
- Battery check-in with a live preview and downloadable PNG meme card.
- 1% Honk Bingo with local game state, copyable results, and a downloadable Certified Honker badge.
- Telegram Mini App support, with browser use available as well.
- Security and permissions headers in the Cloudflare Pages `_headers` file.

## Run Locally

The site has no build step or package dependencies. Serve `lbgv6/` as the web root so its pages, assets, and `_headers` file are available together:

```sh
python3 -m http.server 8000 --directory lbgv6
```

Then open [http://localhost:8000](http://localhost:8000). The main page is `/`; the standalone arcade is `/honk-arcade-v6.html`.

## Deploy

Deploy `lbgv6/` as the static site root. For Cloudflare Pages, use `lbgv6` as the project root directory and leave the build command empty. The `_headers` file is written in Cloudflare Pages format.

Public channel URLs are configured in [`lbgv6/site-config.js`](lbgv6/site-config.js). Keep the mint and Pump.fun values unset until an official launch is verified; the page intentionally avoids presenting an unverified token link.

## Project Layout

- `lbgv6/index.html` — main website and embedded Honk Bingo board.
- `lbgv6/honk-arcade-v6.html` — standalone, self-contained arcade game.
- `lbgv6/honk-bingo.html` — alternate Honk Bingo page with the site's shared styles.
- `lbgv6/script.js` — battery check-in, meme export, and channel-link rendering.
- `lbgv6/honk-game.js` — Telegram integration and the shared Bingo game behavior.
- `lbgv6/styles.css`, `lbgv6/honk-miniapp.css` — website and Mini App styles.
- `lbgv6/site-config.js` — public channel and site URLs.
- `lbgv6/assets/` — goose artwork and social preview graphics.
- `lbgv6/_headers` — Cloudflare Pages response headers.
## Tokenomics and launch planning (internal)

- `tokenomics/`: supply/allocation config and presale calculator (`python3 tokenomics/model.py`)
- `docs/TOKENOMICS.md`, `docs/PRESALE_RUNBOOK.md`, `docs/DECISION_LOG.md`, `docs/AUDIT.md`
- `CLAUDE.md` and `.claude/`: rules, agents and skills for AI assistants
- Tests: `python3 -m unittest discover tests`

These are internal planning documents, not public offers. Nothing here is financial advice or a promise of returns.
