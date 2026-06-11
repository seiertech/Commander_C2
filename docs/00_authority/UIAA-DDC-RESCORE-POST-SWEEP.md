# UIAA DDC Re-Score — Post-Sweep Results

**Date:** 2026-06-10
**Trigger:** UIAA-THESIS-AUDIT §10 — Phase completion (all phases A/B/C/D)
**Methodology:** §1.2 DDC Scoring Formula
**Branch:** `conveyor/uiaa-thesis-audit-sweep`

---

## Executive Summary

| Metric | BEFORE | AFTER | Delta | Assessment |
|--------|--------|-------|-------|-----------|
| Total pages | 106 | **128** | +22 | 22 new pages built |
| Average DDC score | 12% | **24%** | +12pp | **100% improvement** |
| Pages scoring >60% DDC | 2 | **7** | +5 | 3.5× reference quality |
| Pages scoring >40% DDC | 7 | **18** | +11 | 2.6× enriched estate |
| Pages 0-20% (critical) | 92 (87%) | **70 (55%)** | -22 | 32pp reduction |
| Thesis exports consumed | 53/74 (72%) | **74/74 (100%)** | +21 | Full consumption |
| AICAP markers | 78 | **92** | +14 | 14 new markers |
| AICAP ready (3+ imports) | 2 (3%) | **41 (45%)** | +39 | 15× readiness |
| Nav groups | 19 | **18** | -1 | Streamlined |
| New standards surfaced | 0 | **11** | +11 | ISO 27005, CTEM, SSVC, DORA, D3FEND, STIX, NATO/Admiralty, OCSF, CMMI, OODA, Little's Law |

---

## DDC Band Distribution

| Band | Before | After | Delta |
|------|--------|-------|-------|
| 81-100% (strong) | 1 (1%) | 3 (2%) | +2 |
| 61-80% (good) | 1 (1%) | 4 (3%) | +3 |
| 41-60% (fair) | 5 (5%) | 11 (9%) | +6 |
| 21-40% (poor) | 7 (7%) | 40 (31%) | +33 |
| 0-20% (critical) | 92 (87%) | 70 (55%) | -22 |

**Key shift:** 22 pages migrated UP from "critical" band. 33 pages migrated UP into "poor" band (they were previously at 0-10%).

---

## Surface Type Averages (Post-Sweep)

| Surface | Avg DDC | Pages | Assessment |
|---------|---------|-------|-----------|
| Execution | 34% | 20 | Strongest (cases, platform) |
| Strategy | 32% | 8 | Good (mission, posture, risk) |
| Governance | 31% | 9 | Good (controls, reporting, coverage) |
| Command | 27% | 20 | Improved (pulse pages enriched) |
| Decision | 24% | 10 | Fair (governance, strategy) |
| Intelligence | 21% | 30 | Largest estate — more enrichment needed |
| Configuration | 19% | 18 | Expected (admin pages) |
| Control Plane | 14% | 13 | Expected (internal operator) |

---

## Work Completed in This Sweep

| Phase | Description | Quantity | Commits |
|-------|-------------|----------|---------|
| §7.1 | AICAP single-import unblocks | 8 pages | 1 |
| §6 | Nav restructure | 18 groups | 1 |
| §7.2 (A) | HIGH priority new pages | 7 pages | 3 |
| §7.4 (C) | MEDIUM priority new pages | 11 pages | 4 |
| §7.3 (B) | Page enrichments | 59 pages | 3 |
| §7.5 (D) | LOW priority new pages | 4 pages | 1 |
| §7 (DDC) | Re-score | 1 report | 1 |
| **Total** | | **128 pages touched** | **14 commits** |

---

## AICAP Readiness Projection (Updated)

| Phase | Ready AICaps | Cumulative |
|-------|-------------|-----------|
| Before sweep | 2 | 2 |
| After Wave 1 (8 imports) | +8 | 10 |
| After Wave 2 (enrichment) | +19 | 29 |
| After new pages (22) | +12 | **41** |
| Remaining (need UI build) | +51 | 92 |

---

## Remaining Gap

- 70 pages still in "critical" band (0-20%) — predominantly configuration/settings pages and control-plane pages which are expected to be thin
- Intelligence surface (30 pages, avg 21%) is the largest enrichment opportunity
- Next re-run trigger: after 10+ additional page enrichments or engine integration

---

## Next Actions

1. Continue enrichment of Intelligence surface pages (21% → 40% target)
2. Connect engine outputs to pages (thesisExposureEngine, thesisVulnerabilityEngine)
3. Define AICAP grounding specs for the 51 remaining unmapped markers
4. Re-run when DDC average crosses 40% (recalibrate bands per §10)

---

**Scoring Script:** `scripts/ddc-score.mjs`
**Last Updated:** 2026-06-10
