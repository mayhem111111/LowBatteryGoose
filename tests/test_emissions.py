import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tokenomics"))
import emissions  # noqa: E402

CFG = json.loads((ROOT / "tokenomics" / "config.json").read_text())


class TestEmissions(unittest.TestCase):
    def test_streams_match_allocation(self):
        emissions.validate(CFG)

    def test_nothing_unlocked_beyond_allocation(self):
        out = emissions.schedule(CFG)
        unlocked = sum(r["unlocked"] for r in out["rows"])
        alloc = CFG["scenarios"][CFG["emissions"]["scenario"]]["allocation"]
        self.assertAlmostEqual(unlocked, sum(alloc.values()) - alloc["liquidity_pool"] - alloc["reserve"], places=3)

    def test_founder_1m_every_3_months(self):
        rel = emissions.schedule(CFG)["streams"]["founder"]
        self.assertEqual([m for m, x in enumerate(rel) if x], [0, 3, 6, 9, 12])
        self.assertTrue(all(abs(x - 1_000_000) < 1e-6 for x in rel if x))

    def test_community_lead_500k_every_3_months(self):
        rel = emissions.schedule(CFG)["streams"]["community_lead"]
        self.assertEqual([m for m, x in enumerate(rel) if x], [0, 3, 6, 9, 12])
        self.assertTrue(all(abs(x - 500_000) < 1e-6 for x in rel if x))

    def test_every_vesting_bucket_unlocks_20pct_quarterly(self):
        for st in CFG["emissions"]["streams"]:
            if st.get("in_pool") or st.get("governance_only"):
                continue
            rel = emissions.stream_releases(st, 24)
            self.assertEqual([m for m, x in enumerate(rel) if x], [0, 3, 6, 9, 12], st["name"])

    def test_vault_payouts_respect_cap(self):
        out = emissions.schedule(CFG)
        for row in out["rows"]:
            self.assertLessEqual(row["vault_paid"], out["vault_cap"] + 1e-6)

    def test_mismatched_stream_rejected(self):
        bad = copy.deepcopy(CFG)
        bad["emissions"]["streams"][-1]["amount"] += 1
        with self.assertRaises(ValueError):
            emissions.validate(bad)

    def test_supply_conserved_every_month(self):
        out = emissions.schedule(CFG)
        for row in out["rows"]:
            total = (row["circulating"] + row["vault_balance"] + row["still_vesting"]
                     + row["reserve_locked"] + row["lp_in_pool"])
            self.assertAlmostEqual(total, 100_000_000, places=3)

    def test_every_stream_has_lock_mechanism(self):
        for s in CFG["emissions"]["streams"]:
            self.assertTrue(s.get("lock_type") and s.get("lock_mechanism"), s["name"])

    def test_sell_impact_math(self):
        self.assertAlmostEqual(emissions.sell_impact(100, 0), 0)
        self.assertAlmostEqual(emissions.sell_impact(100, 100), -0.75)


if __name__ == "__main__":
    unittest.main()
