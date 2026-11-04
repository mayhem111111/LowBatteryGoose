import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tokenomics"))
import presale_2wk  # noqa: E402

CFG = json.loads((ROOT / "tokenomics" / "config.json").read_text())


class TestPresale2Wk(unittest.TestCase):
    def setUp(self):
        self.out = presale_2wk.tiers(CFG)

    def test_raise_equals_hard_cap(self):
        self.assertAlmostEqual(self.out["rows"][-1]["cum_sol"], CFG["presale_2wk"]["hard_cap_sol"])

    def test_tokens_sum_to_presale_allocation(self):
        alloc = CFG["scenarios"][CFG["presale_2wk"]["scenario"]]["allocation"]
        self.assertAlmostEqual(sum(r["tokens"] for r in self.out["rows"]), alloc["presale"])

    def test_covers_fourteen_days(self):
        self.assertEqual(self.out["rows"][0]["first_day"], 1)
        self.assertEqual(self.out["rows"][-1]["last_day"], 14)

    def test_prices_rise_each_tier(self):
        prices = [r["price_sol"] for r in self.out["rows"]]
        self.assertEqual(prices, sorted(prices))

    def test_launch_at_or_above_last_tier(self):
        self.assertGreaterEqual(self.out["launch_over_last_tier"], 1.0)

    def test_lp_share_within_net_raise(self):
        self.assertLessEqual(self.out["lp_sol"], self.out["net_raise_sol"])

    def test_bad_days_rejected(self):
        bad = copy.deepcopy(CFG)
        bad["presale_2wk"]["days_per_tier"] = 3
        with self.assertRaises(ValueError):
            presale_2wk.tiers(bad)


if __name__ == "__main__":
    unittest.main()
