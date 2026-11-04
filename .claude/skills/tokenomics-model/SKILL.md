---
name: tokenomics-model
description: Refresh and report LowBatteryGoose presale and listing numbers. Use when asked for current presale price, caps, LP size, bucket values, or price-target scenarios, or after any change to tokenomics/config.json.
---
# Refresh the tokenomics numbers

1. Fetch a fresh SOL/USD price from an approved source (Crypto.com `SOL_USD` ticker via the
   Crypto_com MCP). Record the value and its timestamp. If it's older than 1 hour, say so.
2. Run `python3 tokenomics/model.py --sol-usd <price>`.
3. Run `python3 -m unittest discover tests`. If anything fails, stop and report the failure.
4. Report per scenario: presale price (SOL and tokens/SOL), listing price, hard and soft cap,
   per-wallet max, LP SOL plus any shortfall, treasury, insider %, and the target-multiple FDVs.
5. If `config.json` changed, update `docs/TOKENOMICS.md` from the model output and append an entry
   to `docs/DECISION_LOG.md`.

Presale terms are fixed in SOL. A SOL/USD move changes the USD display only, never the terms.
