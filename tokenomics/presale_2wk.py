"""Two-week tiered presale: tier prices, launch price, LP and daily pace.

Usage:
    python3 tokenomics/presale_2wk.py

Tier 0 (verified waitlist) is priced one step below Tier 1. Tier 1's price is solved so the
whole presale raises exactly the hard cap. Launch price = SOL sent to LP / LP tokens.
"""
from __future__ import annotations

import json
from pathlib import Path

CONFIG = Path(__file__).with_name("config.json")


def tiers(cfg: dict) -> dict:
    p = cfg["presale_2wk"]
    alloc = cfg["scenarios"][p["scenario"]]["allocation"]
    presale, lp_tokens = alloc["presale"], alloc["liquidity_pool"]
    n, step = p["tiers"], p["price_step"]
    if p["tier0_days"] + n * p["days_per_tier"] != p["duration_days"]:
        raise ValueError("tier days do not add up to duration_days")
    if not 0 < p["soft_cap_sol"] <= p["hard_cap_sol"]:
        raise ValueError("need 0 < soft cap <= hard cap")
    shares = [p["tier0_share"]] + [(1 - p["tier0_share"]) / n] * n
    weights = [(1 + step) ** (t - 1) for t in range(n + 1)]  # tier 0 -> (1+step)^-1
    tokens = [presale * s for s in shares]
    p1 = p["hard_cap_sol"] / sum(tk * w for tk, w in zip(tokens, weights))
    rows, cum_sol, day = [], 0.0, 1
    for t in range(n + 1):
        days = p["tier0_days"] if t == 0 else p["days_per_tier"]
        price = p1 * weights[t]
        sol = tokens[t] * price
        cum_sol += sol
        rows.append({"tier": t, "first_day": day, "last_day": day + days - 1, "share": shares[t], "tokens": tokens[t],
                     "price_sol": price, "tokens_per_sol": 1 / price, "sol_raised": sol, "cum_sol": cum_sol})
        day += days
    fee = p["hard_cap_sol"] * p["platform_fee_pct"]
    net = p["hard_cap_sol"] - fee
    lp_sol = net * p["lp_share_of_net_raise"]
    launch = lp_sol / lp_tokens
    last = rows[-1]["price_sol"]
    supply = cfg["token"]["minted_total"] - cfg["token"]["burned_at_genesis"]
    return {
        "rows": rows, "tier1_price_sol": p1, "last_tier_price_sol": last, "avg_price_sol": p["hard_cap_sol"] / presale,
        "platform_fee_sol": fee, "net_raise_sol": net, "lp_sol": lp_sol, "treasury_sol": net - lp_sol,
        "launch_price_sol": launch, "launch_over_last_tier": launch / last, "launch_over_tier1": launch / p1,
        "launch_over_avg": launch / (p["hard_cap_sol"] / presale), "launch_fdv_sol": launch * supply,
        "sol_per_day": p["hard_cap_sol"] / p["duration_days"], "buyers_per_day": p["hard_cap_sol"] / p["duration_days"] / p["avg_buy_sol"],
        "min_wallets": p["hard_cap_sol"] / p["max_buy_sol_per_wallet"],
    }


def main() -> None:
    cfg = json.loads(CONFIG.read_text())
    out = tiers(cfg)
    usd = cfg["sol_usd"]["price"]
    print(f"{'Tier':>4} {'Days':>7} {'Tokens':>12} {'Price SOL':>12} {'LBG/SOL':>9} {'Price USD':>11} {'SOL':>7} {'Cum SOL':>8}")
    for r in out["rows"]:
        print(f"{r['tier']:>4} {r['first_day']:>3}-{r['last_day']:<3} {r['tokens']:>12,.0f} {r['price_sol']:>12.9f} {r['tokens_per_sol']:>9,.0f} "
              f"${r['price_sol']*usd:>10.7f} {r['sol_raised']:>7.2f} {r['cum_sol']:>8.2f}")
    for k in ("tier1_price_sol", "last_tier_price_sol", "avg_price_sol", "launch_price_sol"):
        print(f"{k:24s} {out[k]:.9f} SOL (${out[k]*usd:.7f}, {1/out[k]:,.0f} LBG/SOL)")
    for k in ("platform_fee_sol", "net_raise_sol", "lp_sol", "treasury_sol", "sol_per_day", "buyers_per_day", "min_wallets"):
        print(f"{k:24s} {out[k]:,.2f}")
    for k in ("launch_over_last_tier", "launch_over_tier1", "launch_over_avg"):
        print(f"{k:24s} {out[k]:.3f}x")
    print(f"{'launch_fdv_usd':24s} ${out['launch_fdv_sol']*usd:,.0f}")


if __name__ == "__main__":
    main()
