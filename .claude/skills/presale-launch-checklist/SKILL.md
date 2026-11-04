---
name: presale-launch-checklist
description: Go/no-go gate for the LowBatteryGoose presale and listing. Use before opening the presale, before finalizing it, and before adding liquidity.
---
# Presale go/no-go

Work through `docs/PRESALE_RUNBOOK.md` phase by phase. For each item, record PASS, FAIL or N/A
with evidence (a tx signature, a screenshot path or command output).

Rules:
- Any FAIL in a "blocking" item means NO-GO. Report it and stop.
- Never execute a mainnet transaction yourself. Prepare the exact command, have
  `launch-security-reviewer` check it, and wait for the user's explicit "approved: <step>".
- Before the presale opens, have `community-comms-reviewer` check all public copy.
- Run the `tokenomics-model` skill so the numbers on the presale page match config.json exactly.
- Log the go/no-go outcome and its timestamp in `docs/DECISION_LOG.md`.
