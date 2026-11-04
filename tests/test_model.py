import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tokenomics"))
import model  # noqa: E402

CFG = json.loads((ROOT / "tokenomics" / "config.json").read_text())


class TestModel(unittest.TestCase):
    def test_allocations_sum_to_circulating(self):
        for name in CFG["scenarios"]:
            r = model.evaluate(name, CFG)
            self.assertEqual(sum(r.allocation.values()), 100_000_000)

    def test_recommended_lp_is_self_funded(self):
        r = model.evaluate("B_recommended", CFG)
        self.assertEqual(r.lp_sol_shortfall, 0)
        self.assertAlmostEqual(r.lp_sol_required, 75)
        self.assertAlmostEqual(r.treasury_sol, 25)
        self.assertAlmostEqual(r.presale_price_sol, 0.000004)
        self.assertAlmostEqual(r.max_wallet_tokens, 250_000)

    def test_as_given_has_lp_shortfall(self):
        r = model.evaluate("A_as_given", CFG)
        self.assertAlmostEqual(r.lp_sol_shortfall, 80)

    def test_listing_above_presale(self):
        for name in CFG["scenarios"]:
            r = model.evaluate(name, CFG)
            self.assertGreater(r.listing_price_sol, r.presale_price_sol)

    def test_bad_allocation_rejected(self):
        bad = copy.deepcopy(CFG)
        bad["scenarios"]["B_recommended"]["allocation"]["founder"] += 1
        with self.assertRaises(ValueError):
            model.evaluate("B_recommended", bad)

    def test_soft_cap_above_hard_cap_rejected(self):
        bad = copy.deepcopy(CFG)
        bad["scenarios"]["B_recommended"]["soft_cap_sol"] = 101
        with self.assertRaises(ValueError):
            model.evaluate("B_recommended", bad)

    def test_listing_below_presale_rejected(self):
        bad = copy.deepcopy(CFG)
        bad["defaults"]["listing_premium"] = 0.9
        with self.assertRaises(ValueError):
            model.evaluate("B_recommended", bad)

    def test_insider_share_recommended_at_most_35pct(self):
        r = model.evaluate("B_recommended", CFG)
        self.assertLessEqual(r.insider_pct, 0.35)


if __name__ == "__main__":
    unittest.main()
