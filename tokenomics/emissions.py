"""Monthly unlock / vesting schedule and sell-pressure stress test for $LBG.

Usage:
    python3 tokenomics/emissions.py

Stress test only: it assumes a share of the tokens reaching wallets each month is sold into the
listing-day pool with NO new buyers and NO extra liquidity. It shows the pressure the ecosystem's
buy-side (games, staking, LP flywheel) has to absorb. It is not a forecast.

Community-reward streams marked `vault` unlock into a multisig vault, not into wallets. The vault
pays out at most `monthly_cap_pct_of_pool` of the pool's LBG per month (health rule), starting at
`distribution_start_month`. Only those payouts count as circulating.
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import model

CONFIG = Path(__file__).with_name("config.json")


def stream_releases(s: dict, horizon: int) -> list[float]:
    """Tokens unlocked by a stream in each month 0..horizon."""
    out = [0.0] * (horizon + 1)
    if s.get("in_pool") or s.get("governance_only"):
        return out
    if "tranches" in s:
        every, n = s["tranche_every_months"], s["tranches"]
        for i in range(n):
            if i * every <= horizon:
                out[i * every] += s["amount"] / n
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
        if cliff + i <= horizon:
            out[cliff + i] += rest / linear
    return out


def validate(cfg: dict) -> None:
    em = cfg["emissions"]
    alloc = cfg["scenarios"][em["scenario"]]["allocation"]
    by_parent = defaultdict(float)
    for s in em["streams"]:
        by_parent[s["parent"]] += s["amount"]
        if "schedule" in s and abs(sum(s["schedule"].values()) - s["amount"]) > 1e-6:
            raise ValueError(f"{s['name']}: schedule sums to {sum(s['schedule'].values()):,} not {s['amount']:,}")
        if not s.get("lock_type") or not s.get("lock_mechanism"):
            raise ValueError(f"{s['name']}: every stream needs lock_type and lock_mechanism")
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
    v = em.get("vault", {})
    vault_cap = pool_tokens * v.get("monthly_cap_pct_of_pool", 1.0)
    vault_start = v.get("distribution_start_month", 0)

    streams = {s["name"]: stream_releases(s, h) for s in em["streams"]}
    vault_names = {s["name"] for s in em["streams"] if s.get("vault")}
    lp_amt = sum(s["amount"] for s in em["streams"] if s.get("in_pool"))
    lp_lock = max((s.get("lock_months", 0) for s in em["streams"] if s.get("in_pool")), default=0)
    reserve_amt = sum(s["amount"] for s in em["streams"] if s.get("governance_only"))
    scheduled_total = sum(s["amount"] for s in em["streams"] if not s.get("in_pool") and not s.get("governance_only"))

    rows, unlocked_cum, circulating, vault_bal = [], 0.0, 0.0, 0.0
    for m in range(h + 1):
        unlocked = {k: vals[m] for k, vals in streams.items() if vals[m]}
        to_wallets = sum(x for k, x in unlocked.items() if k not in vault_names)
        to_vault = sum(x for k, x in unlocked.items() if k in vault_names)
        vault_bal += to_vault
        paid = min(vault_bal, vault_cap) if m >= vault_start else 0.0
        vault_bal -= paid
        unlocked_cum += to_wallets + to_vault
        new_circ = to_wallets + paid
        circulating += new_circ
        if m == 0:
            presale = unlocked.get("presale_buyers", 0)
            sold = presale * em["presale_sell_ratio_at_listing"] + (new_circ - presale) * em["stress_sell_ratio"]
        else:
            sold = new_circ * em["stress_sell_ratio"]
        rows.append({
            "month": m,
            "unlocked": to_wallets + to_vault,
            "vault_paid": paid,
            "new_circulating": new_circ,
            "circulating": circulating,
            "pct_of_supply": circulating / r.circulating,
            "vault_balance": vault_bal,
            "still_vesting": scheduled_total - unlocked_cum,
            "reserve_locked": reserve_amt,
            "lp_in_pool": lp_amt,
            "lp_locked": lp_amt if m < lp_lock else 0.0,
            "stress_sold": sold,
            "stress_price_impact": sell_impact(pool_tokens, sold),
            "buy_sol_to_offset": sol_out(pool_tokens, pool_sol, sold),
            "detail": unlocked,
        })
    return {"pool_tokens": pool_tokens, "pool_sol": pool_sol, "vault_cap": vault_cap, "rows": rows, "streams": streams}


def main() -> None:
    cfg = json.loads(CONFIG.read_text())
    out = schedule(cfg)
    em = cfg["emissions"]
    print(f"Scenario {em['scenario']}. Pool at listing: {out['pool_tokens']:,.0f} LBG + {out['pool_sol']:,.1f} SOL. "
          f"Community vault payout cap: {out['vault_cap']:,.0f} LBG/month.")
    print(f"Stress: {em['presale_sell_ratio_at_listing']:.0%} of presale unlock sells at listing, "
          f"{em['stress_sell_ratio']:.0%} of everything else reaching wallets sells, zero new buyers.")
    print("\nLOCK & VESTING SCHEDULE (per bucket)")
    print(f"  {'Stream':26s} {'Amount':>11} {'Type':>8} {'Per unlock':>11}  Unlock months / mechanism")
    for s in em["streams"]:
        rel = out["streams"][s["name"]]
        months = [m for m, x in enumerate(rel) if x]
        per = f"{s['amount'] / s['tranches']:,.0f}" if "tranches" in s else "-"
        when = ",".join(map(str, months)) if months else "never (in pool / vote only)"
        print(f"  {s['name']:26s} {s['amount']:>11,} {s['lock_type']:>8.8} {per:>11}  [{when}] {s['lock_mechanism']}")
    print("\nMONTHLY SUPPLY STATUS (tokens)")
    print(f"{'Mo':>3} {'Unlocked':>11} {'VaultPaid':>10} {'Circulating':>12} {'%Sup':>6} {'InVault':>11} {'StillLocked':>12} "
          f"{'Reserve':>10} {'LP':>12} {'StressSold':>11} {'Impact':>7} {'BuySOL':>7}")
    for row in out["rows"]:
        lp = f"{row['lp_in_pool']:,.0f}{'*' if row['lp_locked'] else ''}"
        print(f"{row['month']:>3} {row['unlocked']:>11,.0f} {row['vault_paid']:>10,.0f} {row['circulating']:>12,.0f} "
              f"{row['pct_of_supply']:>6.1%} {row['vault_balance']:>11,.0f} {row['still_vesting']:>12,.0f} "
              f"{row['reserve_locked']:>10,.0f} {lp:>12} {row['stress_sold']:>11,.0f} "
              f"{row['stress_price_impact']:>7.1%} {row['buy_sol_to_offset']:>7,.1f}")
    print("  * = LP under time lock. Circulating + InVault + StillLocked + Reserve + LP = 100,000,000 every month.")


if __name__ == "__main__":
    main()
