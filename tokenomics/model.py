"""Presale / listing / target-price model for the LowBatteryGoose token.

Usage:
    python3 tokenomics/model.py                 # uses tokenomics/config.json
    python3 tokenomics/model.py --sol-usd 95.10 # override SOL price (display only)

Pure arithmetic, no network calls, no keys. Every figure is reproducible from config.json.
"""
from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

CONFIG = Path(__file__).with_name("config.json")


@dataclass
class Result:
    name: str
    circulating: int
    presale_tokens: int
    presale_price_sol: float
    listing_price_sol: float
    hard_cap_sol: float
    soft_cap_sol: float
    min_buy_sol: float
    platform_fee_sol: float
    net_raise_sol: float
    max_buy_sol: float
    lp_tokens: int
    lp_sol_required: float
    lp_sol_from_presale: float
    lp_sol_shortfall: float
    treasury_sol: float
    insider_pct: float
    max_wallet_tokens: float
    min_wallets_to_fill: float
    allocation: dict


def evaluate(name: str, cfg: dict) -> Result:
    scen = cfg["scenarios"][name]
    alloc = scen["allocation"]
    tok = cfg["token"]
    circ = tok["minted_total"] - tok["burned_at_genesis"]
    total = sum(alloc.values())
    if total != circ:
        raise ValueError(f"{name}: allocation sums to {total:,}, expected {circ:,}")
    if any(v < 0 for v in alloc.values()):
        raise ValueError(f"{name}: negative allocation")

    p = {**cfg["defaults"], **{k: v for k, v in scen.items() if k != "allocation"}}
    if not 0 < p["soft_cap_sol"] <= p["hard_cap_sol"]:
        raise ValueError(f"{name}: need 0 < soft cap <= hard cap")
    if p["max_buy_sol_per_wallet"] < p["min_buy_sol"]:
        raise ValueError(f"{name}: per-wallet max below min buy")
    if p["listing_premium"] < 1:
        raise ValueError(f"{name}: listing below presale price")
    presale_tokens = alloc["presale"]
    price = p["hard_cap_sol"] / presale_tokens
    listing = price * p["listing_premium"]
    lp_tokens = alloc["liquidity_pool"]
    lp_sol_req = lp_tokens * listing
    fee = cfg.get("platform", {}).get("fee_pct_of_raise", 0.0)
    net_raise = p["hard_cap_sol"] * (1 - fee)
    lp_from_presale = min(lp_sol_req, net_raise)
    shortfall = max(0.0, lp_sol_req - net_raise)
    treasury = max(0.0, net_raise - lp_sol_req)
    insiders = sum(alloc.get(b, 0) for b in scen.get("insider_buckets", cfg["insider_buckets"])) / circ
    return Result(
        name=name,
        circulating=circ,
        presale_tokens=presale_tokens,
        presale_price_sol=price,
        listing_price_sol=listing,
        hard_cap_sol=p["hard_cap_sol"],
        soft_cap_sol=p["soft_cap_sol"],
        min_buy_sol=p["min_buy_sol"],
        platform_fee_sol=p["hard_cap_sol"] - net_raise,
        net_raise_sol=net_raise,
        max_buy_sol=p["max_buy_sol_per_wallet"],
        lp_tokens=lp_tokens,
        lp_sol_required=lp_sol_req,
        lp_sol_from_presale=lp_from_presale,
        lp_sol_shortfall=shortfall,
        treasury_sol=treasury,
        insider_pct=insiders,
        max_wallet_tokens=p["max_buy_sol_per_wallet"] / price,
        min_wallets_to_fill=p["hard_cap_sol"] / p["max_buy_sol_per_wallet"],
        allocation=alloc,
    )


def pinksale_form(r: Result) -> dict:
    """Values to enter in PinkSale's Solana 'Create Presale' form, plus constraint checks.

    Assumes PinkSale's Liquidity % applies to the raise AFTER its fee (VERIFY in the form:
    it displays the total tokens required before you sign).
    """
    max_pct = int((r.lp_tokens * r.listing_price_sol) / r.net_raise_sol * 100) if r.net_raise_sol else 0
    liq_pct = min(100, max_pct)  # floor, so LP never needs more tokens than allocated
    lp_sol = r.net_raise_sol * liq_pct / 100
    lp_tokens_used = lp_sol / r.listing_price_sol
    issues = []
    if r.soft_cap_sol < 0.25 * r.hard_cap_sol:
        issues.append("PinkSale requires soft cap >= 25% of hard cap")
    if liq_pct < 25:
        issues.append("PinkSale requires liquidity >= 25%")
    if r.lp_sol_shortfall > 0:
        issues.append(f"LP needs {r.lp_sol_shortfall:,.1f} SOL more than the net raise; PinkSale caps liquidity at 100%")
    return {
        "presale_rate_tokens_per_sol": round(1 / r.presale_price_sol),
        "listing_rate_tokens_per_sol": round(1 / r.listing_price_sol),
        "soft_cap_sol": r.soft_cap_sol,
        "hard_cap_sol": r.hard_cap_sol,
        "min_buy_sol": r.min_buy_sol,
        "max_buy_sol": r.max_buy_sol,
        "liquidity_pct": liq_pct,
        "lp_sol_at_hard_cap": lp_sol,
        "lp_tokens_used": lp_tokens_used,
        "lp_tokens_unused_to_burn": r.lp_tokens - lp_tokens_used,
        "tokens_to_deposit_approx": r.presale_tokens + lp_tokens_used,
        "treasury_sol_at_hard_cap": r.net_raise_sol - lp_sol,
        "unsold_tokens": "burn",
        "issues": issues,
    }


def report(r: Result, sol_usd: float, multiples: list[int]) -> str:
    usd = lambda sol: sol * sol_usd  # noqa: E731
    out = [f"=== Scenario {r.name} (SOL/USD {sol_usd}) ==="]
    out.append(f"Circulating supply         {r.circulating:,}")
    out.append(f"Presale tokens             {r.presale_tokens:,}")
    out.append(f"Presale price              {r.presale_price_sol:.9f} SOL  (${usd(r.presale_price_sol):.7f})  = {1/r.presale_price_sol:,.0f} tokens/SOL")
    out.append(f"Presale FDV                ${usd(r.presale_price_sol)*r.circulating:,.0f}")
    out.append(f"Listing price              {r.listing_price_sol:.9f} SOL  (${usd(r.listing_price_sol):.7f})  = {1/r.listing_price_sol:,.0f} tokens/SOL")
    out.append(f"Listing FDV                ${usd(r.listing_price_sol)*r.circulating:,.0f}")
    out.append(f"Hard cap / soft cap        {r.hard_cap_sol:,.0f} / {r.soft_cap_sol:,.0f} SOL  (${usd(r.hard_cap_sol):,.0f} / ${usd(r.soft_cap_sol):,.0f})")
    out.append(f"Per-wallet max             {r.max_buy_sol} SOL -> {r.max_wallet_tokens:,.0f} tokens ({r.max_wallet_tokens/r.circulating:.3%} of supply)")
    out.append(f"Wallets needed to fill     >= {r.min_wallets_to_fill:,.0f}")
    out.append(f"LP: {r.lp_tokens:,} tokens + {r.lp_sol_required:,.0f} SOL (${usd(r.lp_sol_required):,.0f})")
    out.append(f"  funded by presale        {r.lp_sol_from_presale:,.0f} SOL")
    out.append(f"  SHORTFALL team must add  {r.lp_sol_shortfall:,.0f} SOL (${usd(r.lp_sol_shortfall):,.0f})")
    out.append(f"Platform fee               {r.platform_fee_sol:,.1f} SOL -> net raise {r.net_raise_sol:,.1f} SOL")
    out.append(f"Treasury after LP          {r.treasury_sol:,.1f} SOL (${usd(r.treasury_sol):,.0f})")
    out.append(f"Insider share (team+fdr)   {r.insider_pct:.1%}")
    out.append("Bucket values at listing price:")
    for k, v in r.allocation.items():
        out.append(f"  {k:28s} {v:>12,}  ${usd(v*r.listing_price_sol):>12,.0f}")
    f = pinksale_form(r)
    out.append("PinkSale form values:")
    for k, v in f.items():
        out.append(f"  {k:30s} {v:,.2f}" if isinstance(v, float) else f"  {k:30s} {v}")
    out.append("Price targets vs presale price (FDV = fully diluted, 100M supply):")
    for m in multiples:
        px = r.presale_price_sol * m
        out.append(f"  {m:>4}x  {px:.9f} SOL  ${usd(px):.7f}  FDV ${usd(px)*r.circulating:,.0f}")
    return "\n".join(out)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", type=Path, default=CONFIG)
    ap.add_argument("--sol-usd", type=float)
    a = ap.parse_args()
    cfg = json.loads(a.config.read_text())
    sol_usd = a.sol_usd or cfg["sol_usd"]["price"]
    for name in cfg["scenarios"]:
        print(report(evaluate(name, cfg), sol_usd, cfg["target_multiples"]))
        print()


if __name__ == "__main__":
    main()
