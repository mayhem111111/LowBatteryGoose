"""Export the price ladder, holder values, allocation, supply and timeline as JSON for the dashboard.

Usage:
    python3 tokenomics/export_dashboard.py <out_dir>

Every figure comes from config.json via model.py and emissions.py.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import emissions
import model

CONFIG = Path(__file__).with_name("config.json")
MILESTONES = [("Presale", 1.0), ("Launch", None), ("2x", 2), ("5x", 5), ("10x", 10), ("25x", 25), ("50x", 50), ("100x", 100)]
BUY_RATES_SOL_PER_MONTH = [25, 50, 75, 100, 150, 250]
AVG_BUY_SOL = 0.5


def build(cfg: dict) -> dict:
    em = cfg["emissions"]
    scen = em["scenario"]
    r = model.evaluate(scen, cfg)
    sol_usd = cfg["sol_usd"]["price"]
    listing_mult = r.listing_price_sol / r.presale_price_sol

    ladder = []
    for name, m in MILESTONES:
        m = listing_mult if m is None else m
        px = r.presale_price_sol * m
        nb = model.net_buy_sol_for_multiple(r, m)
        ladder.append({
            "milestone": name, "multiple_vs_presale": round(m, 4),
            "price_sol": px, "price_usd": px * sol_usd, "fdv_usd": round(px * sol_usd * r.circulating),
            "net_buy_sol": round(nb, 1), "net_buy_usd": round(nb * sol_usd),
        })

    alloc = cfg["scenarios"][scen]["allocation"]
    per_buyer_max = r.max_buy_sol / r.presale_price_sol
    holders = [
        ("Jason (founder)", alloc["founder"], 0.0),
        ("Tony (community lead)", alloc["community_lead"], 0.0),
        ("Presale buyer, 1 SOL (max)", per_buyer_max, r.max_buy_sol),
        ("Presale buyer, 0.1 SOL", 0.1 / r.presale_price_sol, 0.1),
        ("Marketing", alloc["marketing"], 0.0),
        ("Development", alloc["development"], 0.0),
    ]
    holder_rows = []
    for name, tokens, cost in holders:
        row = {"holder": name, "tokens": round(tokens), "cost_sol": cost, "cost_usd": round(cost * sol_usd, 2),
               "unlocked_at_launch": round(tokens * 0.2)}
        for label, m in [("launch", listing_mult), ("10x", 10), ("100x", 100)]:
            v = tokens * r.presale_price_sol * m
            row[f"value_sol_{label}"] = round(v, 2)
            row[f"value_usd_{label}"] = round(v * sol_usd)
        holder_rows.append(row)

    alloc_rows = [{"bucket": k, "tokens": v, "pct": v / r.circulating} for k, v in alloc.items()]

    sched = emissions.schedule(cfg)
    supply_rows = [{"month": x["month"], "circulating": round(x["circulating"]), "community_vault": round(x["vault_balance"]),
                    "still_locked": round(x["still_vesting"]), "reserve": round(x["reserve_locked"]), "liquidity_pool": round(x["lp_in_pool"]),
                    "stress_buy_sol": round(x["buy_sol_to_offset"], 1)} for x in sched["rows"]]

    unlock_offset_12m = sum(x["buy_sol_to_offset"] for x in sched["rows"][:13])
    need_100x = model.net_buy_sol_for_multiple(r, 100)
    total_12m = need_100x + unlock_offset_12m
    timeline_rows = []
    for rate in BUY_RATES_SOL_PER_MONTH:
        months = total_12m / rate
        timeline_rows.append({"net_buy_sol_per_month": rate, "net_buy_usd_per_month": round(rate * sol_usd),
                              "buyers_per_month_at_avg": math.ceil(rate / AVG_BUY_SOL),
                              "months_to_100x": round(months, 1)})

    summary = [{
        "scenario": scen, "sol_usd": sol_usd, "sol_usd_as_of": cfg["sol_usd"]["as_of"],
        "presale_tokens_per_sol": round(1 / r.presale_price_sol), "launch_tokens_per_sol": round(1 / r.listing_price_sol),
        "presale_price_usd": r.presale_price_sol * sol_usd, "launch_price_usd": r.listing_price_sol * sol_usd,
        "price_100x_usd": r.presale_price_sol * 100 * sol_usd, "fdv_100x_usd": round(r.presale_price_sol * 100 * sol_usd * r.circulating),
        "hard_cap_sol": r.hard_cap_sol, "max_buy_sol": r.max_buy_sol,
        "net_buy_100x_sol": round(need_100x, 1), "unlock_offset_12m_sol": round(unlock_offset_12m, 1),
        "total_buy_12m_sol": round(total_12m, 1), "total_buy_12m_usd": round(total_12m * sol_usd),
        "avg_buy_sol": AVG_BUY_SOL, "pool_sol": round(sched["pool_sol"], 1),
        "presale_price_sol": r.presale_price_sol, "launch_price_sol": r.listing_price_sol,
        "price_100x_sol": r.presale_price_sol * 100, "launch_gain_pct": listing_mult - 1,
        "insider_pct": r.insider_pct, "vault_cap_pct": em["vault"]["monthly_cap_pct_of_pool"],
        "pool_tokens": round(sched["pool_tokens"]), "supply": r.circulating, "burned": cfg["token"]["burned_at_genesis"],
        "unlock_pct": 1 / next(s["tranches"] for s in em["streams"] if "tranches" in s),
        "unlock_every_months": next(s["tranche_every_months"] for s in em["streams"] if "tranches" in s),
    }]
    return {"price_ladder": ladder, "holder_value": holder_rows, "allocation": alloc_rows,
            "supply": supply_rows, "timeline": timeline_rows, "summary": summary}


def main() -> None:
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    for name, rows in build(json.loads(CONFIG.read_text())).items():
        (out / f"{name}.json").write_text(json.dumps(rows, indent=1))
        print(f"wrote {name}.json ({len(rows)} rows)")


if __name__ == "__main__":
    main()
