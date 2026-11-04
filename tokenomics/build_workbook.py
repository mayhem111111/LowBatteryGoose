"""Build the 2-week presale tokenomics workbook (live formulas) from config.json.

Usage:
    python3 tokenomics/build_workbook.py <out.xlsx>

Layout and styling follow lowbatt_tokenomics_model_2.xlsx (Inputs, Allocation, Presale Tiers,
Vesting, Staking, Checklist) so the founder can compare side by side. Inputs are the only
hardcoded numbers; every other figure is a formula.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

CONFIG = Path(__file__).with_name("config.json")

ARIAL = "Arial"
F_TITLE = Font(name=ARIAL, size=14, bold=True)
F_NOTE = Font(name=ARIAL, size=10, italic=True)
F_HEAD = Font(name=ARIAL, size=10, bold=True, color="FFFFFFFF")
F_BODY = Font(name=ARIAL, size=10)
F_BOLD = Font(name=ARIAL, size=10, bold=True)
F_INPUT = Font(name=ARIAL, size=10, color="FF0000FF")
F_LINK = Font(name=ARIAL, size=10, color="FF008000")
FILL_HEAD = PatternFill("solid", fgColor="FF1F3864")
FILL_YELLOW = PatternFill("solid", fgColor="FFFFFF00")
NUM = "#,##0;\\(#,##0\\);\\-"
NUM2 = "#,##0.00;\\(#,##0.00\\);\\-"
PCT = "0.0%;\\(0.0%\\);\\-"
SOL9 = "0.000000000"
USD7 = "$0.0000000"
USD0 = "$#,##0;\\($#,##0\\);\\-"
MULT = "0.000\"x\""

BUCKETS = [
    # key, label, parent allocation key or None, share override, vest kind, notes
    ("presale", "Presale", "presale", None, "vest", "Tiered over 14 days. Same vesting as everyone (founder instruction)."),
    ("liquidity_pool", "Liquidity pool", "liquidity_pool", None, "lp", "Paired with SOL at launch; LP tokens locked 365 days, then burn by vote."),
    ("contests_and_games", "Community: contests and games", "community_rewards", 12_000_000, "vest", "Unlocks into the Community Rewards multisig; payouts capped at 4% of pool LBG per month."),
    ("staking_rewards", "Community: staking rewards", "community_rewards", 8_000_000, "vest", "Floating rate, never a promised APY. See Staking sheet."),
    ("airdrops", "Community: airdrops", "community_rewards", 7_000_000, "vest", "Participation-based, verified members only."),
    ("flock_builders", "Community: Flock Builders", "community_rewards", 5_000_000, "vest", "Rewards active referrals, never purchases. Payouts vest 30 days."),
    ("council_grants", "Community: Flock Council grants", "community_rewards", 3_000_000, "vest", "Milestone grants approved by Council vote."),
    ("marketing", "Marketing", "marketing", None, "vest", "Marketing multisig, public spend reports."),
    ("development", "Development", "development", None, "vest", "Development multisig."),
    ("founder", "Founder (Jason Spear)", "founder", None, "vest", "1,000,000 at launch, then 1,000,000 every 3 months. Non-cancellable Streamflow."),
    ("community_lead", "Community lead (Tony)", "community_lead", None, "vest", "500,000 at launch, then 500,000 every 3 months. Non-cancellable Streamflow."),
    ("reserve", "Reserve (governance)", "reserve", None, "none", "12-month time lock, then released only by passed Flock proposals."),
]


def style_header(ws, row, ncols):
    for c in range(1, ncols + 1):
        cell = ws.cell(row, c)
        cell.font, cell.fill = F_HEAD, FILL_HEAD
        cell.alignment = Alignment(wrap_text=True, vertical="center")


def put(ws, ref, value, font=F_BODY, fmt=None, fill=None, comment=None):
    cell = ws[ref]
    cell.value = value
    cell.font = font
    if fmt:
        cell.number_format = fmt
    if fill:
        cell.fill = fill
    if comment:
        cell.comment = Comment(comment, "Claude")
    return cell


def widths(ws, spec):
    for col, w in spec.items():
        ws.column_dimensions[col].width = w


def build(cfg: dict) -> Workbook:
    p = cfg["presale_2wk"]
    alloc = cfg["scenarios"][p["scenario"]]["allocation"]
    tok = cfg["token"]
    sol = cfg["sol_usd"]
    supply = tok["minted_total"] - tok["burned_at_genesis"]
    wb = Workbook()

    # ---------------- Inputs ----------------
    ws = wb.active
    ws.title = "Inputs"
    put(ws, "A1", "$LBG Tokenomics Model - 2-Week Presale - Inputs", F_TITLE)
    put(ws, "A2", "Blue = editable input. Yellow = decision to confirm. Black = formula. Green = link to another sheet. Built from tokenomics/config.json (scenario D_founder_v2).", F_NOTE)
    for i, h in enumerate(["Input", "Value", "Note"], 1):
        ws.cell(3, i, h)
    style_header(ws, 3, 3)
    inputs = [
        (4, "Minted supply (tokens)", tok["minted_total"], NUM, False, "1B minted at genesis (founder plan)."),
        (5, "Burned at genesis (tokens)", tok["burned_at_genesis"], NUM, False, "900M burned before the presale; publish the burn tx."),
        (6, "Max supply after burn (tokens)", "=B4-B5", NUM, None, "Formula. Mint and freeze authority revoked, so this can never grow."),
        (7, "Presale hard cap (SOL)", p["hard_cap_sol"], NUM2, True, "Sized to a ~900-member community. Your model_2 used 2,000 SOL. Confirm."),
        (8, "Presale soft cap (SOL)", p["soft_cap_sol"], NUM2, False, "Below this after 14 days, every contributor is refunded."),
        (9, "SOL price (USD)", sol["price"], NUM2, True, f"Display only. {sol['source']}, {sol['as_of']}. Refresh on presale morning."),
        (10, "Presale duration (days)", p["duration_days"], NUM, False, "Two weeks."),
        (11, "Tier 0 (verified waitlist) days", p["tier0_days"], NUM, False, "Days 1-2: Flock members only, one step below Tier 1."),
        (12, "Public tiers (rows on Presale Tiers)", p["tiers"], NUM, False, "Layout has 6 public tier rows; change rows too if you change this."),
        (13, "Days per public tier", p["days_per_tier"], NUM, False, "Each public tier runs 2 days."),
        (14, "Tier 0 share of presale tokens", p["tier0_share"], PCT, False, "Rest split evenly across public tiers."),
        (15, "Price step per tier", p["price_step"], PCT, True, "Each tier 5% above the previous (model_2 used 6%). 0% = one fixed price."),
        (16, "Platform fee (% of SOL raised)", p["platform_fee_pct"], PCT, False, "PinkSale-style 5%; set to your platform's fee."),
        (17, "Share of net SOL sent to LP", p["lp_share_of_net_raise"], PCT, True, "Sets the launch price. Keep launch >= last tier (check on Presale Tiers)."),
        (18, "Min buy per wallet (SOL)", p["min_buy_sol"], NUM2, False, ""),
        (19, "Max buy per wallet, whole presale (SOL)", p["max_buy_sol_per_wallet"], NUM2, True, "Anti-whale cap. model_2 used 5 SOL."),
        (20, "Average buy for pacing (SOL)", p["avg_buy_sol"], NUM2, False, "Planning assumption for buyers-per-day targets."),
        (21, "Vesting: unlocked at launch (TGE)", p["vesting"]["tge_pct"], PCT, True, "Founder instruction: 20% at launch, applied to every bucket incl. presale. Confirm for presale buyers."),
        (22, "Vesting: unlocked per step", p["vesting"]["step_pct"], PCT, False, ""),
        (23, "Vesting: step every (months)", p["vesting"]["every_months"], NUM, False, ""),
        (24, "Staking emissions - Year 1 share", p["staking_emission_split"][0], PCT, False, "Share of the staking bucket emitted in year 1 (model_2: 50/30/20)."),
        (25, "Staking emissions - Year 2 share", p["staking_emission_split"][1], PCT, False, ""),
        (26, "Staking emissions - Year 3 share", p["staking_emission_split"][2], PCT, False, ""),
    ]
    for row, label, val, fmt, yellow, note in inputs:
        put(ws, f"A{row}", label)
        is_formula = isinstance(val, str) and val.startswith("=")
        put(ws, f"B{row}", val, F_BODY if is_formula else F_INPUT, fmt, FILL_YELLOW if yellow else None)
        put(ws, f"C{row}", note)
    put(ws, "A27", "Check: tier days add up to duration (must be 0)", F_BOLD)
    put(ws, "B27", "=B11+B12*B13-B10", F_BODY, NUM)
    put(ws, "C27", '=IF(B27=0,"OK","MISMATCH - fix tier days")', F_BOLD)
    put(ws, "A28", "Check: staking split sums to 100% (must be 0)", F_BOLD)
    put(ws, "B28", "=ROUND(B24+B25+B26-1,6)", F_BODY, PCT)
    put(ws, "C28", '=IF(B28=0,"OK","MISMATCH - fix staking split")', F_BOLD)
    put(ws, "A29", "Check: soft cap at least 25% of hard cap", F_BOLD)
    put(ws, "B29", "=IF(B7>0,B8/B7,0)", F_BODY, PCT)
    put(ws, "C29", '=IF(AND(B8>0,B8<=B7,B29>=0.25),"OK","CHECK soft cap")', F_BOLD)
    widths(ws, {"A": 46, "B": 20, "C": 90})

    # ---------------- Allocation ----------------
    wa = wb.create_sheet("Allocation")
    put(wa, "A1", "Allocation, Unlock and Vesting Parameters", F_TITLE)
    put(wa, "A2", "Edit blue cells. Unlocked fraction at month m = MIN(1, TGE % + step % x INT(m / step months)). Community buckets unlock into the Community Rewards multisig, not into wallets.", F_NOTE)
    heads = ["Bucket", "% of supply", "Tokens", "TGE unlock %", "TGE tokens", "Unlock per step %", "Step every (months)", "Vesting summary", "Notes"]
    for i, h in enumerate(heads, 1):
        wa.cell(4, i, h)
    style_header(wa, 4, len(heads))
    first = 5
    for i, (key, label, parent, override, kind, note) in enumerate(BUCKETS):
        r = first + i
        amount = override if override is not None else alloc[parent]
        put(wa, f"A{r}", label)
        put(wa, f"B{r}", amount / supply, F_INPUT, PCT)
        put(wa, f"C{r}", f"=B{r}*Inputs!$B$6", F_BODY, NUM)
        if kind == "vest":
            put(wa, f"D{r}", "=Inputs!$B$21", F_LINK, PCT)
            put(wa, f"F{r}", "=Inputs!$B$22", F_LINK, PCT)
            put(wa, f"G{r}", "=Inputs!$B$23", F_LINK, NUM)
            put(wa, f"H{r}", f'=TEXT(D{r},"0%")&" at launch, then "&TEXT(F{r},"0%")&" every "&G{r}&" months"')
        elif kind == "lp":
            put(wa, f"D{r}", 1, F_INPUT, PCT)
            put(wa, f"F{r}", 0, F_INPUT, PCT)
            put(wa, f"G{r}", 0, F_INPUT, NUM)
            put(wa, f"H{r}", "100% into the pool at launch")
        else:
            put(wa, f"D{r}", 0, F_INPUT, PCT)
            put(wa, f"F{r}", 0, F_INPUT, PCT)
            put(wa, f"G{r}", 0, F_INPUT, NUM)
            put(wa, f"H{r}", "Locked; released only by governance vote")
        put(wa, f"E{r}", f"=C{r}*D{r}", F_BODY, NUM)
        put(wa, f"I{r}", note)
    last = first + len(BUCKETS) - 1
    tot = last + 1
    put(wa, f"A{tot}", "Total", F_BOLD)
    put(wa, f"B{tot}", f"=SUM(B{first}:B{last})", F_BOLD, PCT)
    put(wa, f"C{tot}", f"=SUM(C{first}:C{last})", F_BOLD, NUM)
    put(wa, f"E{tot}", f"=SUM(E{first}:E{last})", F_BOLD, NUM)
    put(wa, f"F{tot}", f'=IF(ROUND(B{tot},6)=1,"OK: 100%","ERROR: not 100%")', F_BOLD)
    put(wa, f"A{tot+1}", "Insiders (founder, community lead, marketing, development)")
    put(wa, f"B{tot+1}", f"=B{first+7}+B{first+8}+B{first+9}+B{first+10}", F_BODY, PCT)
    put(wa, f"A{tot+2}", "Community rewards (all five community rows)")
    put(wa, f"B{tot+2}", f"=SUM(B{first+2}:B{first+6})", F_BODY, PCT)
    widths(wa, {"A": 34, "B": 12, "C": 16, "D": 13, "E": 16, "F": 16, "G": 14, "H": 46, "I": 80})
    rows_alloc = {b[0]: first + i for i, b in enumerate(BUCKETS)}

    # ---------------- Presale Tiers ----------------
    wt = wb.create_sheet("Presale Tiers")
    put(wt, "A1", "2-Week Presale Tier Schedule (Tier 1 price solved so total raised = hard cap)", F_TITLE)
    put(wt, "A2", "Tier 0 = verified waitlist (Flock members), one step below Tier 1. Each public tier runs for its days or until its tokens sell out, whichever comes first.", F_NOTE)
    heads = ["Tier", "First day", "Last day", "Share of presale tokens", "Tokens", "Price weight", "Price (SOL)", "LBG per SOL", "Price (USD)", "SOL raised", "Cumulative SOL", "Cumulative tokens", "Price vs Tier 1"]
    for i, h in enumerate(heads, 1):
        wt.cell(4, i, h)
    style_header(wt, 4, len(heads))
    n = p["tiers"]
    t0, tl = 5, 5 + n
    pres = f"Allocation!$C${rows_alloc['presale']}"
    for k in range(n + 1):
        r = t0 + k
        put(wt, f"A{r}", k, F_BODY, NUM)
        if k == 0:
            put(wt, f"B{r}", 1, F_BODY, NUM)
            put(wt, f"C{r}", f"=B{r}+Inputs!$B$11-1", F_BODY, NUM)
            put(wt, f"D{r}", "=Inputs!$B$14", F_LINK, PCT)
        else:
            put(wt, f"B{r}", f"=C{r-1}+1", F_BODY, NUM)
            put(wt, f"C{r}", f"=B{r}+Inputs!$B$13-1", F_BODY, NUM)
            put(wt, f"D{r}", "=(1-Inputs!$B$14)/Inputs!$B$12", F_BODY, PCT)
        put(wt, f"E{r}", f"=D{r}*{pres}", F_BODY, NUM)
        put(wt, f"F{r}", f"=E{r}*(1+Inputs!$B$15)^(A{r}-1)", F_BODY, NUM)
        put(wt, f"G{r}", f"=$B${tl+4}*(1+Inputs!$B$15)^(A{r}-1)", F_BODY, SOL9)
        put(wt, f"H{r}", f"=IF(G{r}>0,1/G{r},0)", F_BODY, NUM)
        put(wt, f"I{r}", f"=G{r}*Inputs!$B$9", F_BODY, USD7)
        put(wt, f"J{r}", f"=E{r}*G{r}", F_BODY, NUM2)
        put(wt, f"K{r}", f"=SUM($J${t0}:J{r})", F_BODY, NUM2)
        put(wt, f"L{r}", f"=SUM($E${t0}:E{r})", F_BODY, NUM)
        put(wt, f"M{r}", f"=G{r}/$G${t0+1}", F_BODY, MULT)
    tt = tl + 1
    put(wt, f"A{tt}", "Total", F_BOLD)
    put(wt, f"D{tt}", f"=SUM(D{t0}:D{tl})", F_BOLD, PCT)
    put(wt, f"E{tt}", f"=SUM(E{t0}:E{tl})", F_BOLD, NUM)
    put(wt, f"F{tt}", f"=SUM(F{t0}:F{tl})", F_BOLD, NUM)
    put(wt, f"J{tt}", f"=SUM(J{t0}:J{tl})", F_BOLD, NUM2)
    put(wt, f"K{tt}", f'=IF(ROUND(J{tt}-Inputs!B7,6)=0,"OK: raise = hard cap","CHECK")', F_BOLD)
    put(wt, f"L{tt}", f'=IF(COUNT(A{t0+1}:A{tl})=Inputs!B12,"OK: tier rows match","CHECK tier rows")', F_BOLD)
    s = tl + 3
    put(wt, f"A{s}", "Launch summary", F_BOLD)
    lp_row = rows_alloc["liquidity_pool"]
    summary = [
        ("Solved Tier 1 price (SOL)", f"=Inputs!B7/F{tt}", SOL9),                                    # s+1
        ("Tier 0 price (SOL)", f"=G{t0}", SOL9),                                                       # s+2
        ("Final tier price (SOL)", f"=G{tl}", SOL9),                                                   # s+3
        ("Average presale price (SOL)", f"=Inputs!B7/{pres}", SOL9),                                   # s+4
        ("SOL raised at hard cap", f"=J{tt}", NUM2),                                                   # s+5
        ("Platform fee (SOL)", f"=B{s+5}*Inputs!B16", NUM2),                                           # s+6
        ("Net SOL after fee", f"=B{s+5}-B{s+6}", NUM2),                                                # s+7
        ("SOL sent to LP", f"=B{s+7}*Inputs!B17", NUM2),                                               # s+8
        ("SOL to treasury multisig (audit, legal, ops)", f"=B{s+7}-B{s+8}", NUM2),                     # s+9
        ("LP tokens", f"=Allocation!C{lp_row}", NUM),                                                  # s+10
        ("Launch price (SOL)", f"=IF(B{s+10}>0,B{s+8}/B{s+10},0)", SOL9),                              # s+11
        ("Launch LBG per SOL", f"=IF(B{s+11}>0,1/B{s+11},0)", NUM),                                    # s+12
        ("Launch price (USD)", f"=B{s+11}*Inputs!B9", USD7),                                           # s+13
        ("Launch / final tier price", f"=IF(B{s+3}>0,B{s+11}/B{s+3},0)", MULT),                        # s+14
        ("Launch vs last tier check", f'=IF(B{s+14}>=1,"OK: launch at or above last tier","WARNING: launch below last tier - raise LP share or flatten the step")', None),  # s+15
        ("Launch / Tier 1 price", f"=IF(B{s+1}>0,B{s+11}/B{s+1},0)", MULT),                            # s+16
        ("Launch / average presale price", f"=IF(B{s+4}>0,B{s+11}/B{s+4},0)", MULT),                   # s+17
        ("Launch FDV (USD)", f"=B{s+11}*Inputs!B6*Inputs!B9", USD0),                                   # s+18
        ("Unlocked to wallets at launch (tokens)", "=Vesting!P5", NUM),                                # s+19
        ("Launch market cap, wallets only (USD)", f"=B{s+19}*B{s+13}", USD0),                          # s+20
        ("Max tokens per wallet at Tier 0 price", f"=IF(G{t0}>0,Inputs!B19/G{t0},0)", NUM),            # s+21
        ("Max wallet as % of supply", f"=B{s+21}/Inputs!B6", "0.00%"),                                 # s+22
        ("Minimum wallets to fill hard cap", f"=IF(Inputs!B19>0,Inputs!B7/Inputs!B19,0)", NUM),        # s+23
        ("Target SOL per day (even pace)", f"=Inputs!B7/Inputs!B10", NUM2),                            # s+24
        ("Target buyers per day at average buy", f"=IF(Inputs!B20>0,B{s+24}/Inputs!B20,0)", NUM2),     # s+25
        ("Soft cap reached at end of day (if tiers sell out on schedule)", f"=INDEX(C{t0}:C{tl},MIN(COUNTIF(K{t0}:K{tl},\"<\"&Inputs!B8)+1,ROWS(C{t0}:C{tl})))", NUM),  # s+26
    ]
    for i, (label, f, fmt) in enumerate(summary, 1):
        put(wt, f"A{s+i}", label)
        put(wt, f"B{s+i}", f, F_BOLD if fmt is None else F_BODY, fmt)
    put(wt, f"A{s+len(summary)+2}", "Tiered pricing needs a presale contract or platform that supports price tiers (PinkSale presales use one fixed rate). With a 0% step on Inputs, this sheet becomes a single-price presale.", F_NOTE)
    widths(wt, {"A": 52, "B": 20, "C": 10, "D": 14, "E": 14, "F": 14, "G": 14, "H": 12, "I": 13, "J": 12, "K": 14, "L": 16, "M": 12})
    wt.freeze_panes = "B5"

    # ---------------- Vesting ----------------
    wv = wb.create_sheet("Vesting")
    put(wv, "A1", "Cumulative Unlock Schedule by Month (tokens)", F_TITLE)
    put(wv, "A2", "Month 0 = launch. Community columns are tokens unlocked into the Community Rewards multisig (paid out under the 4%-of-pool monthly cap), not tokens in wallets.", F_NOTE)
    cols = ["Month"] + [b[1] for b in BUCKETS] + ["Total unlocked", "% of supply", "Unlocked to wallets (excl. LP and community vault)"]
    for i, h in enumerate(cols, 1):
        wv.cell(4, i, h)
    style_header(wv, 4, len(cols))
    for m in range(25):
        r = 5 + m
        put(wv, f"A{r}", m, F_BODY, NUM)
        for j, b in enumerate(BUCKETS):
            ar = rows_alloc[b[0]]
            col = get_column_letter(2 + j)
            f = (f"=Allocation!$C${ar}*MIN(1,Allocation!$D${ar}+Allocation!$F${ar}"
                 f"*IF(Allocation!$G${ar}>0,INT($A{r}/Allocation!$G${ar}),0))")
            put(wv, f"{col}{r}", f, F_BODY, NUM)
        lastb = get_column_letter(1 + len(BUCKETS))
        tcol, pcol, wcol = (get_column_letter(2 + len(BUCKETS) + k) for k in range(3))
        put(wv, f"{tcol}{r}", f"=SUM(B{r}:{lastb}{r})", F_BOLD, NUM)
        put(wv, f"{pcol}{r}", f"={tcol}{r}/Inputs!$B$6", F_BOLD, PCT)
        put(wv, f"{wcol}{r}", f"={tcol}{r}-C{r}-SUM(D{r}:H{r})", F_BODY, NUM)
    widths(wv, {"A": 8, **{get_column_letter(c): 15 for c in range(2, 2 + len(BUCKETS) + 3)}})
    wv.freeze_panes = "B5"
    assert wcol == "P", wcol  # referenced from Presale Tiers

    # ---------------- Staking ----------------
    wsk = wb.create_sheet("Staking")
    st = f"Allocation!$C${rows_alloc['staking_rewards']}"
    put(wsk, "A1", "Staking, Governance Weight and Reward-Rate Scenarios", F_TITLE)
    put(wsk, "A3", "Lock multipliers (same multiplier applies to rewards and vote weight)", F_BOLD)
    for i, h in enumerate(["Lock (months)", "Multiplier", "Example staked tokens", "Vote weight"], 1):
        wsk.cell(4, i, h)
    style_header(wsk, 4, 4)
    for i, (months, mult) in enumerate(p["staking_lock_multipliers"]):
        r = 5 + i
        put(wsk, f"A{r}", months, F_INPUT, NUM)
        put(wsk, f"B{r}", mult, F_INPUT, "0.0\"x\"")
        put(wsk, f"C{r}", 100_000, F_INPUT, NUM)
        put(wsk, f"D{r}", f"=C{r}*B{r}", F_BODY, NUM)
    put(wsk, "A10", "Emission schedule (from the staking bucket)", F_BOLD)
    for i, h in enumerate(["Year", "Tokens emitted", "Per month", "% of staking bucket"], 1):
        wsk.cell(11, i, h)
    style_header(wsk, 11, 4)
    for i in range(3):
        r = 12 + i
        put(wsk, f"A{r}", str(i + 1))
        put(wsk, f"B{r}", f"={st}*Inputs!B{24+i}", F_BODY, NUM)
        put(wsk, f"C{r}", f"=B{r}/12", F_BODY, NUM)
        put(wsk, f"D{r}", f"=IF({st}>0,B{r}/{st},0)", F_BODY, PCT)
    put(wsk, "A15", "Total", F_BOLD)
    put(wsk, "B15", "=SUM(B12:B14)", F_BOLD, NUM)
    put(wsk, "A18", "Reward-rate scenarios (token-denominated, before lock multipliers, floating, NOT a promised APY)", F_BOLD)
    for i, h in enumerate(["Total tokens staked", "% of supply", "Year 1 rate", "Year 2 rate", "Year 3 rate"], 1):
        wsk.cell(19, i, h)
    style_header(wsk, 19, 5)
    for i, staked in enumerate([5_000_000, 10_000_000, 20_000_000, 30_000_000]):
        r = 20 + i
        put(wsk, f"A{r}", staked, F_INPUT, NUM)
        put(wsk, f"B{r}", f"=A{r}/Inputs!$B$6", F_BODY, PCT)
        for j, col in enumerate("CDE"):
            put(wsk, f"{col}{r}", f"=IF($A{r}>0,$B${12+j}/$A{r},0)", F_BODY, PCT)
    put(wsk, "A25", "Rate = that year's emissions / total tokens staked. More stakers means a lower rate automatically; never advertise a fixed APY.", F_NOTE)
    widths(wsk, {"A": 24, "B": 18, "C": 22, "D": 18, "E": 16})

    # ---------------- 2-Week Plan ----------------
    wp = wb.create_sheet("2-Week Plan")
    put(wp, "A1", "Two-Week Presale Calendar", F_TITLE)
    put(wp, "A2", "Day numbers and targets link to Presale Tiers; actions are the plan. Listing follows finalization.", F_NOTE)
    for i, h in enumerate(["Phase", "Days", "Price (SOL)", "Cumulative SOL target", "Who runs it", "Actions"], 1):
        wp.cell(4, i, h)
    style_header(wp, 4, 6)
    plan = [
        ("Prep (before day 1)", "T-7 to T-1", None, None, "Jason", "Mint 1B, burn 900M, revoke mint and freeze, set up Squads multisigs and Streamflow vesting, publish every address. Legal review of presale terms. Open the verified waitlist."),
        ("Tier 0: verified waitlist", 0, None, None, "Tony", "Flock members only (7+ days in Telegram, played Honk Bingo or entered a challenge, one wallet each). Daily AMA."),
        ("Tier 1", 1, None, None, "Tony", "Public opens. Pin the presale page, terms, vesting and risk notice. No price talk."),
        ("Tier 2", 2, None, None, "Tony", "Honk Bingo season 1 launch; meme contest (free entry)."),
        ("Tier 3", 3, None, None, "Jason", "Midpoint update: raise so far, wallets, soft cap status. Publish treasury multisig."),
        ("Tier 4", 4, None, None, "Tony", "Flock Builders referral points go live (activity-based, never purchase-based)."),
        ("Tier 5", 5, None, None, "Jason", "Second AMA; publish listing-day checklist and LP lock plan."),
        ("Tier 6 (final)", 6, None, None, "Both", "Final 48h reminders on official channels only. Anti-scam pin: no DMs, one official link."),
        ("Finalize and list", "Day 15", None, None, "Jason", "Finalize: soft cap met -> add LP, lock 365 days, burn unsold tokens, enable 20% claims. Missed -> refunds. Publish mint, pool, lock and vesting links at the same moment."),
    ]
    for i, (phase, tier, _, _, who, act) in enumerate(plan):
        r = 5 + i
        put(wp, f"A{r}", phase)
        if isinstance(tier, int):
            tr = t0 + tier
            put(wp, f"B{r}", f"=\"Day \"&'Presale Tiers'!B{tr}&\"-\"&'Presale Tiers'!C{tr}", F_LINK)
            put(wp, f"C{r}", f"='Presale Tiers'!G{tr}", F_LINK, SOL9)
            put(wp, f"D{r}", f"='Presale Tiers'!K{tr}", F_LINK, NUM2)
        else:
            put(wp, f"B{r}", tier)
        put(wp, f"E{r}", who)
        c = put(wp, f"F{r}", act)
        c.alignment = Alignment(wrap_text=True, vertical="top")
    widths(wp, {"A": 26, "B": 12, "C": 14, "D": 20, "E": 12, "F": 100})

    # ---------------- Changes ----------------
    wc = wb.create_sheet("Changes vs model_2")
    put(wc, "A1", "What changed from lowbatt_tokenomics_model_2.xlsx, and why", F_TITLE)
    for i, h in enumerate(["Item", "model_2 (your file)", "This revision", "Why"], 1):
        wc.cell(3, i, h)
    style_header(wc, 3, 4)
    changes = [
        ("Ticker and supply", "$LOWBATT, 1B, no burn", "$LBG, 1B minted, 900M burned, 100M max", "Matches the website, socials and the founder's burn plan. Percentages work the same either way."),
        ("Founder", "5%, 6-month cliff + 18-month linear", "5% (5M), 20% at launch then 20% every 3 months", "Founder instruction in this session."),
        ("Community lead (Tony)", "Not included", "2.5% (2.5M), same schedule", "Founder instruction."),
        ("Marketing + development", "Marketing 10%, developer 5%", "5% + 5%", "Founder instruction: about 10% combined."),
        ("Community", "Staking 30% + airdrop 5%", "35%: contests 12%, staking 8%, airdrops 7%, Flock Builders 5%, Council grants 3%", "Funds games, contests and growth rewards for years; insiders drop to 17.5%."),
        ("DAO treasury / reserve", "Treasury 10% + CEX/MM reserve 5%", "Reserve 5.5% (vote only)", "Freed tokens went to the community bucket."),
        ("Presale size", "20% of supply, 2,000 SOL hard cap", "25%, 100 SOL hard cap (yellow input)", "2,000 SOL would need about 2 SOL from every one of ~900 members. Raise it on Inputs if the waitlist supports more."),
        ("Presale length and tiers", "Tier 0 + 8 tiers, 6% step", "14 days: Tier 0 (2 days) + 6 tiers of 2 days, 5% step", "Two-week window requested; a gentler step is fairer to week-2 buyers."),
        ("Wallet cap", "5 SOL", "1 SOL for the whole presale", "With a 100 SOL cap, 5 SOL lets 20 wallets take it all."),
        ("LP", "10% of supply, 65% of SOL", "17% of supply, 86% of net SOL", "Deeper pool; launch stays above the last tier."),
        ("Presale vesting", "25% at launch, rest over 3 months", "20% at launch, 20% every 3 months", "Founder instruction for all holders. Long for a meme presale: confirm and disclose clearly."),
    ]
    for i, row in enumerate(changes):
        for j, v in enumerate(row):
            c = wc.cell(4 + i, 1 + j, v)
            c.font = F_BODY
            c.alignment = Alignment(wrap_text=True, vertical="top")
    put(wc, f"A{5+len(changes)}", "Decisions to confirm", F_BOLD)
    decisions = [
        "Hard cap: 100 SOL (this file) or larger? Each extra SOL at the same token count raises every price.",
        "Tiered pricing needs a tier-capable presale contract (audit it) or platform; otherwise set the step to 0% and use PinkSale's single price.",
        "Presale buyers on 20% every 3 months, or a shorter schedule for buyers only?",
        "Refresh the SOL price on presale morning; terms are fixed in SOL.",
    ]
    for i, d in enumerate(decisions):
        put(wc, f"A{6+len(changes)+i}", f"{i+1}. {d}")
    widths(wc, {"A": 26, "B": 34, "C": 48, "D": 70})

    # ---------------- Checklist ----------------
    wk = wb.create_sheet("Checklist")
    put(wk, "A1", "Transparency, Security and Risk Checklist", F_TITLE)
    for i, h in enumerate(["Category", "Item", "Status"], 1):
        wk.cell(3, i, h)
    style_header(wk, 3, 3)
    items = [
        ("Token", "Mint 1B, burn 900M, publish both transactions"),
        ("Token", "Revoke mint authority before presale"),
        ("Token", "Revoke freeze authority before presale"),
        ("Vesting", "Put all vesting on-chain (Streamflow or similar) and publish addresses"),
        ("Liquidity", "Lock LP tokens 365 days and publish proof"),
        ("Treasury", "Hold treasury, marketing, community and reserve in Squads multisigs (2-of-3 or more)"),
        ("Security", "Independent audit of any custom tiered presale and staking contracts"),
        ("Presale", "Soft cap with automatic refund if not met"),
        ("Presale", "Per-wallet cap plus wallet-age / anti-sybil checks on Tier 0 waitlist"),
        ("Presale", "Confirm platform supports tiers and the 20%-every-3-months buyer vesting"),
        ("Transparency", "Public dashboard: circulating supply, unlock calendar, treasury spend"),
        ("Legal", "Counsel on securities treatment of a presale with staking and governance; decide geofencing (incl. US)"),
        ("Messaging", "No price targets or \"100x\" claims anywhere in marketing"),
        ("Messaging", "No fixed or guaranteed APY claims"),
    ]
    for i, (cat, item) in enumerate(items):
        r = 4 + i
        put(wk, f"A{r}", cat)
        put(wk, f"B{r}", item)
        put(wk, f"C{r}", "To do", F_INPUT)
    put(wk, f"A{6+len(items)}", "This model is a planning tool, not financial or legal advice. Most meme tokens lose value regardless of tokenomics.", F_NOTE)
    widths(wk, {"A": 16, "B": 100, "C": 12})
    return wb


def main() -> None:
    out = Path(sys.argv[1])
    build(json.loads(CONFIG.read_text())).save(out)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
