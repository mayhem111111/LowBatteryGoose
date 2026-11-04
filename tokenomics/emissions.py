"""Monthly unlock / emission schedule and sell-pressure stress test for $LBG.

Usage:
    python3 tokenomics/emissions.py

Stress test only: it assumes a share of each month's newly released tokens is sold into the
listing-day pool with NO new buyers and NO extra liquidity. Real outcomes depend on demand. It shows
the pressure the ecosystem's buy-side (games, staking, LP flywheel) has to absorb. It is not a forecast.
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import model

CONFIG = Path(__file__).with_name("config.json")


def stream_releases(s: dict, horizon: int) -> list[float]:
    """Tokens released by a stream in each month 0..horizon."""
    out = [0.0] * (horizon + 1)
    if s.get("in_pool") or s.get("governance_only"):
        return out
    if "schedule" in s:
        for m, amt in s["schedule"].items():
            if int(m) <= horizon:
                out[int(m)] += amt
        return out
    tge = s["amount"] * s.get("tge_pct", 0)
    out[0] += tge
    rest = s["amount"] - tge
    cliff, linear = s.get("cliff_months", 0), s.get("linear_months", 0)
    if rest and not linear:
        raise ValueError(f"{s['name']}: remainder {rest:,.0f} has no linear_months")
    for i in range(1, linear + 1):
        m = cliff + i
        if m <= horizon:
            out[m] += rest / linear
    return out


def validate(cfg: dict) -> None:
    em = cfg["emissions"]
    alloc = cfg["scenarios"][em["scenario"]]["allocation"]
    by_parent = defaultdict(float)
    for s in em["streams"]:
        by_parent[s["parent"]] += s["amount"]
        if "schedule" in s and abs(sum(s["schedule"].values()) - s["amount"]) > 1e-6:
            raise ValueError(f"{s['name']}: schedule sums to {sum(s['schedule'].values()):,} not {s['amount']:,}")
    for parent, amt in alloc.items():
        if abs(by_parent.get(parent, 0) - amt) > 1e-6:
            raise ValueError(f"streams for {parent} sum to {by_parent.get(parent, 0):,.0f}, allocation is {amt:,}")
    extra = set(by_parent) - set(alloc)
    if extra:
        raise ValueError(f"streams reference unknown buckets: {extra}")


def sell_impact(pool_tokens: float, sell_tokens: float) -> float:
    """Fractional price change from selling into a constant-product pool (negative = drop)."""
    return (pool_tokens / (pool_tokens + sell_tokens)) ** 2 - 1


def sol_out(pool_tokens: float, pool_sol: float, sell_tokens: float) -> float:
    """SOL removed from a constant-product pool by a sell. Roughly the new buying needed to restore price."""
    return pool_sol * sell_tokens / (pool_tokens + sell_tokens)


def schedule(cfg: dict) -> dict:
    validate(cfg)
    em = cfg["emissions"]
    h = em["horizon_months"]
    r = model.evaluate(em["scenario"], cfg)
    form = model.pinksale_form(r)
    pool_tokens, pool_sol = form["lp_tokens_used"], form["lp_sol_at_hard_cap"]
    rows = []
    streams = {s["name"]: stream_releases(s, h) for s in em["streams"]}
    cumulative = 0.0
    lp_amt = sum(s["amount"] for s in em["streams"] if s.get("in_pool"))
    lp_lock = max((s.get("lock_months", 0) for s in em["streams"] if s.get("in_pool")), default=0)
    reserve_amt = sum(s["amount"] for s in em["streams"] if s.get("governance_only"))
    scheduled_total = sum(s["amount"] for s in em["streams"] if not s.get("in_pool") and not s.get("governance_only"))
    for m in range(h + 1):
        rel = {k: v[m] for k, v in streams.items() if v[m]}
        total = sum(rel.values())
        cumulative += total
        if m == 0:
            presale = rel.get("presale_buyers", 0)
            sold = presale * em["presale_sell_ratio_at_listing"] + (total - presale) * em["stress_sell_ratio"]
        else:
            sold = total * em["stress_sell_ratio"]
        rows.append({
            "month": m,
            "released": total,
            "circulating_outside_pool": cumulative,
            "pct_of_supply": cumulative / r.circulating,
            "still_vesting": scheduled_total - cumulative,
            "reserve_locked": reserve_amt,
            "lp_locked": lp_amt if m < lp_lock else 0.0,
            "lp_in_pool": lp_amt,
            "stress_sold": sold,
            "stress_price_impact": sell_impact(pool_tokens, sold),
            "buy_sol_to_offset": sol_out(pool_tokens, pool_sol, sold),
            "detail": rel,
        })
    return {"pool_tokens": pool_tokens, "pool_sol": pool_sol, "rows": rows, "streams": streams}


def main() -> None:
    cfg = json.loads(CONFIG.read_text())
    out = schedule(cfg)
    em = cfg["emissions"]
    print(f"Pool at listing: {out['pool_tokens']:,.0f} LBG + {out['pool_sol']:,.1f} SOL. Stress: {em['presale_sell_ratio_at_listing']:.0%} of presale "
          f"sells at listing, {em['stress_sell_ratio']:.0%} of every other release sells, zero new buyers.")
    print("\nLOCK & VESTING SCHEDULE (per bucket)")
    print(f"  {'Stream':28s} {'Amount':>12} {'Type':>16}  Mechanism")
    for s in em["streams"]:
        print(f"  {s['name']:28s} {s['amount']:>12,} {s.get('lock_type',''):>16}  {s.get('lock_mechanism','')}")
    print("\nMONTHLY SUPPLY STATUS (tokens)")
    print(f"{'Mo':>3} {'Released':>11} {'Circulating':>12} {'%Sup':>6} {'StillVesting':>13} {'ReserveLock':>12} {'LP(locked)':>11} "
          f"{'StressSold':>11} {'Impact':>7} {'BuySOL':>7}")
    for row in out["rows"]:
        lp = f"{row['lp_in_pool']:,.0f}{'*' if row['lp_locked'] else ''}"
        print(f"{row['month']:>3} {row['released']:>11,.0f} {row['circulating_outside_pool']:>12,.0f} {row['pct_of_supply']:>6.1%} "
              f"{row['still_vesting']:>13,.0f} {row['reserve_locked']:>12,.0f} {lp:>11} "
              f"{row['stress_sold']:>11,.0f} {row['stress_price_impact']:>7.1%} {row['buy_sol_to_offset']:>7,.1f}")
    print("  * = LP tokens under time lock. Circulating + StillVesting + Reserve + LP = 100,000,000 every month.")
    print("\nStream totals released by month 12 / 24:")
    for name, rel in out["streams"].items():
        print(f"  {name:28s} {sum(rel[:13]):>12,.0f} {sum(rel):>12,.0f}")


if __name__ == "__main__":
    main()
