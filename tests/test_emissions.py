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

    def test_nothing_released_beyond_allocation(self):
        out = emissions.schedule(CFG)
        released = sum(r["released"] for r in out["rows"])
        alloc = CFG["scenarios"][CFG["emissions"]["scenario"]]["allocation"]
        self.assertLessEqual(released, sum(alloc.values()) - alloc["liquidity_pool"] - alloc["reserve"] + 1e-6)

    def test_founder_locked_six_months(self):
        out = emissions.schedule(CFG)
        self.assertEqual(sum(out["streams"]["founder"][:7]), 0)

    def test_team_locked_three_months(self):
        out = emissions.schedule(CFG)
        self.assertEqual(sum(out["streams"]["development"][:4]), 0)
        self.assertEqual(sum(out["streams"]["team_community_lead"][:4]), 0)

    def test_mismatched_stream_rejected(self):
        bad = copy.deepcopy(CFG)
        bad["emissions"]["streams"][-1]["amount"] += 1
        with self.assertRaises(ValueError):
            emissions.validate(bad)

    def test_supply_conserved_every_month(self):
        out = emissions.schedule(CFG)
        for row in out["rows"]:
            total = row["circulating_outside_pool"] + row["still_vesting"] + row["reserve_locked"] + row["lp_in_pool"]
            self.assertAlmostEqual(total, 100_000_000, places=3)

    def test_every_stream_has_lock_mechanism(self):
        for s in CFG["emissions"]["streams"]:
            self.assertTrue(s.get("lock_type") and s.get("lock_mechanism"), s["name"])

    def test_sell_impact_math(self):
        self.assertAlmostEqual(emissions.sell_impact(100, 0), 0)
        self.assertAlmostEqual(emissions.sell_impact(100, 100), -0.75)


if __name__ == "__main__":
    unittest.main()
