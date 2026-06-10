# COMMANDER UI/UX/USABILITY ASSESSMENT FRAMEWORK (CUUF-1.0)

**Version:** CUUF-1.0
**Status:** Authoritative. Assessment framework for post-build usability review.
**Date:** 2026-06-10
**Authority chain:** Subordinate to AUTHORITY_MODEL.md (Tier 5). Peer to UIAA-3.0.
**Scope:** Desktop only (per DS-1.0). All operational, investigation, command, and strategy surfaces.
**Run cadence:** After each build phase completion (not before — requires DDC ≥40% to be meaningful).

---

## Relationship to UIAA-THESIS-AUDIT

| | UIAA-THESIS-AUDIT | CUUF-1.0 (this document) |
|---|---|---|
| **Asks** | "Does the page CONSUME the data it should?" | "Does the page SERVE the user correctly?" |
| **Perspective** | Data-out (model → UI) | User-in (user → UI → decision) |
| **Measures** | Coverage, completeness, conformity | Usability, cognition, workflow, patterns |
| **Finds** | Missing imports, unused engines, empty surfaces | Wrong workspace type, high cognitive load, broken OODA flow |
| **Output** | Build backlog (what to ADD) | Rework backlog (what to CHANGE) |
| **Prerequisite** | None | UIAA-THESIS-AUDIT DDC ≥40% for assessed page |

**Execution sequence:**
```
DATA MODEL CHANGES → UIAA-THESIS-AUDIT → BUILD → CUUF-1.0 → REWORK → RE-RUN BOTH
```

---

## Assessment Objective

Determine whether a page:

1. Supports the intended use case
2. Supports OODA
3. Minimises cognitive load
4. Supports operational decision making
5. Uses the correct Commander page pattern
6. Exposes required data relationships
7. Provides sufficient context
8. Supports rapid orientation and action

---

## Inputs Required (per page)

Before scoring, gather:

| Input | Source |
|-------|--------|
| Surface Classification | UIAA-THESIS-AUDIT Appendix A |
| Use Cases mapped | USE_CASE_REGISTER.md |
| Entities consumed | audit-data.json (thesis imports) |
| Relationships documented | KNOWLEDGE_GRAPH.md |
| AICAP markers | Embedded in page source |
| DDC score | UIAA-THESIS-AUDIT scored data |
| Thesis enriched fields available | thesis-adapters.ts |

---

## DOMAIN 1 — PURPOSE FIT

### Question

Does the page actually support the operational purpose it exists for?

### Review

Assess:
- Use Cases linked to page (from USE_CASE_REGISTER)
- User personas (from RBAC role mapping)
- Expected outcomes (from use case postconditions)
- Operational workflow (from thesis lifecycle model)

### Thesis Adaptation

Cross-reference the page's **Surface Classification** (Command/Intelligence/Investigation/Decision/Execution/Governance/Strategy):
- Command surfaces → must enable tempo awareness
- Intelligence surfaces → must enable pattern recognition
- Investigation surfaces → must enable root-cause drill
- Decision surfaces → must present choice with evidence
- Execution surfaces → must enable action initiation
- Governance surfaces → must provide audit-ready evidence

### Score

| Score | Meaning |
|-------|---------|
| 1 | Page does not support purpose |
| 2 | Marginally supports purpose |
| 3 | Partially supports purpose |
| 4 | Mostly supports purpose |
| 5 | Fully supports purpose |

### Evidence Required

- Page route
- Use case mapping (UC-XXX references)
- Data rendered vs data available (from DDC)
- Workflow support (can user COMPLETE the use case?)

---

## DOMAIN 2 — OODA ALIGNMENT

### Observe

Can users detect relevant information?

- Is the information the user needs VISIBLE without scrolling?
- Are anomalies highlighted (signal priority, severity colour)?
- Is freshness indicated (when was this data last updated)?

### Orient

Can users understand meaning?

- Is context provided (why is this important)?
- Are relationships visible (what else is affected)?
- Is confidence shown (how reliable is this data)?
- Does the page show `itil_stage`, `ooda_state`, `ctem_phase` where applicable?

### Decide

Can users determine action?

- Are options clear?
- Is evidence sufficient to justify a decision?
- Are consequences visible (blast radius, impact scope)?
- Is `routingRationale` visible (WHY was this routed here)?

### Act

Can users execute action?

- Are actions accessible (not buried behind navigation)?
- Are actions governed (strategy-sourced, not ad-hoc)?
- Is confirmation of action visible?
- Does the page emit OODA telemetry (thesis requirement)?

### Scoring

| Stage | Score | Total possible |
|-------|-------|---------------|
| Observe | 1-5 | 5 |
| Orient | 1-5 | 5 |
| Decide | 1-5 | 5 |
| Act | 1-5 | 5 |
| **TOTAL** | | **20** |

### Failure Conditions (Immediate Fail)

Page immediately fails OODA if it:
- Shows information but supports no decision
- Supports decisions but lacks context
- Requires navigation to understand impact
- Has no path from observation to action

---

## DOMAIN 3 — CONTEXT RETENTION

This is where split screen enters.

### Assessment

Can users maintain context while investigating?

### Context Loss (score negatively)

User navigates AWAY to understand:
- Related asset (must leave page → /assets?id=X)
- Related identity (must leave page → /identity?id=X)
- Related vulnerability (must leave page)
- Related risk object (must leave page)
- Related case (must leave page)

Each navigation-away = context loss event.

### Context Preservation (score positively)

User remains anchored:
- Inline expansion (Pattern A — per hard rule #3)
- Panel/drawer showing related entity
- Tooltip with entity summary
- Visible cross-reference without navigation

### Thesis Adaptation

Reference the KNOWLEDGE_GRAPH relationships. For each relationship documented as relevant to this page, assess: can the user SEE the related entity without leaving?

### Questions (10-second test)

Can user answer within 10 seconds:
1. What am I looking at?
2. Why is it important?
3. What is affected?
4. What should I do?

### Score

| Score | Meaning |
|-------|---------|
| 1 | Full context loss on every drill |
| 2 | Frequent navigation required |
| 3 | Some inline context, some navigation |
| 4 | Mostly inline, rare navigation |
| 5 | Full context retained — no navigation required |

---

## DOMAIN 4 — COGNITIVE LOAD

### Review

Count:
- Clicks to complete primary use case
- Page transitions required
- Modal chains
- Navigation depth (how deep from nav root?)
- Information that must be REMEMBERED across transitions

### Cognitive Friction Score

| Band | Transitions | Meaning |
|------|------------|---------|
| Low | 0-2 | Single page or 1 drill |
| Medium | 3-5 | Acceptable for investigation |
| High | 6+ | Redesign required |

### Failure Condition

User must **remember information from a previous page** to make sense of current page. This is always a fail — Commander should carry context forward.

### Thesis Adaptation

Pages with high DDC scores (many data sources) should NOT increase cognitive load — they should use progressive disclosure:
- Level 1: KPI strip (headline numbers)
- Level 2: Summary table/cards
- Level 3: Expandable detail
- Level 4: Raw data (on demand)

---

## DOMAIN 5 — DATA RELATIONSHIP VISIBILITY

Commander is relationship-driven. The KNOWLEDGE_GRAPH documents 50+ entity→entity relationships.

### Review Against

- `docs/03_knowledge/KNOWLEDGE_GRAPH.md` — documented relationships
- `packages/contracts/src/entities/` — typed references between entities
- `audit-data.json` — what each page imports

### Evaluate

Can user see (without navigating away):
- Related assets?
- Related identities?
- Related risks/risk objects?
- Related cases?
- Related actions/remediation?
- Source provenance (which connector, which system)?
- Standard marker (which standard governs this entity)?

### Score

| Score | Meaning |
|-------|---------|
| 1 | Single entity, no relationships shown |
| 2 | 1-2 relationships shown |
| 3 | Core relationships visible |
| 4 | Most relationships visible, some require drill |
| 5 | All documented relationships visible on page |

### Thesis-Specific Requirements

Every page showing Cases MUST show (per thesis entity model):
- `related_entities` (assets affected)
- `case_type` + `itil_stage` + `ooda_state` + `ctem_phase`
- `routingRationale` (WHY here)
- `standard_marker` (ITIL 4 + OODA + CTEM)

Every page showing Assets MUST show:
- `source_of_truth` (provenance)
- `asset_class` + `lifecycle_state`
- Coverage state (has_edr, has_vuln_scan, etc.)
- Related cases, identities, risk objects

---

## DOMAIN 6 — WORKSPACE SUITABILITY

Determine whether page type is correct for its Surface Classification.

### Workspace Types

| Workspace Type | Applies To | Characteristics |
|---------------|-----------|-----------------|
| **Traditional** | Settings, Admin, Config | Forms, toggles, simple tables |
| **Browse Workspace** | Inventory, Registry, Catalogue | Filterable table, bulk actions |
| **Investigation Workspace** | Case, Asset, Identity, Vulnerability, Threat, Exposure | **Split-screen REQUIRED**, queue + detail |
| **Command Workspace** | War Room, Incident, Major Event | Real-time, multi-panel, high density |
| **Strategic Workspace** | Mission, Strategy, Programme | Portfolio view, delta scoring, trend |

### Thesis Mapping (Surface → Workspace)

| Surface Classification | Expected Workspace |
|----------------------|-------------------|
| Command | Command Workspace |
| Intelligence | Browse or Investigation |
| Investigation | Investigation Workspace (SPLIT SCREEN) |
| Decision | Strategic Workspace |
| Execution | Browse or Command |
| Governance | Browse Workspace |
| Strategy | Strategic Workspace |
| Configuration | Traditional |
| Control Plane | Traditional or Browse |

### Failure

Wrong workspace type assigned.

**Critical Example:** Case handling page (`/cases`) implemented as simple table (Browse) when it should be Investigation Workspace with split-screen (queue left, detail right).

---

## DOMAIN 7 — SPLIT SCREEN ASSESSMENT

**Required for ALL Investigation surfaces** (per hard rule #3: "inline expansion only, Pattern A").

### Orientation Options

| Type | When to use |
|------|------------|
| Horizontal | Queue left, detail right (case handling, asset list) |
| Vertical | Summary top, detail bottom (timeline + content) |
| Hybrid | Three-panel (queue / detail / activity) |

### Assessment Criteria

| Criterion | Evaluate |
|-----------|----------|
| Orientation | Horizontal / Vertical / Hybrid — which is correct? |
| Ratio | Current vs recommended (e.g., 25/75, 30/70, 20/55/25) |
| Independent Scrolling | Queue scroll, workspace scroll, activity scroll — all independent? |
| Sticky Context | Is header/identity sticky while content scrolls? |
| Resizing | Can user adjust panel ratio? |
| Focus Mode | Can user maximise one panel? |
| Compare Mode | Can user view two entities side-by-side? |

### Thesis Adaptation

For pages with high DDC scores (10+ data imports), assess whether the split-screen model can accommodate all data without cognitive overload. Consider:
- Tab panels within the detail pane
- Progressive disclosure within each panel
- Collapsible sections

---

## DOMAIN 8 — INFORMATION ARCHITECTURE

### Information Hierarchy

Most important information visible first?

Thesis rule: **KPIs → Pipeline → Detail → Raw**

| Level | What | Example |
|-------|------|---------|
| 1 | KPI Strip | Open: 12, P0: 2, SLA Breached: 1 |
| 2 | Pipeline/Flow | 7-stage lifecycle visual |
| 3 | Table/Cards | Filterable case list |
| 4 | Detail | Expandable case row |
| 5 | Raw | JSON, audit trail |

### Progressive Disclosure

Evaluate:
- Summary → Context → Detail → Raw Data path exists?
- Or does page dump everything at once?

### Action Placement

Are actions close to decisions?
- Action buttons within the context where the decision is made?
- Or must user scroll/navigate to find the action?

---

## DOMAIN 9 — VISUAL COMMUNICATION

### Typography

Assess:
- Hierarchy (H1 → H4 used correctly?)
- Readability (body text legible at operational distance?)
- Density (too much text in one block?)
- Scanability (can user scan and find what matters?)

### Colour

Assess:
- Semantic usage (red = critical, amber = warning, green = healthy?)
- Consistent with `primitiveSignal` tokens?
- Accessibility (sufficient contrast?)

### Visual Density

- Too sparse? (single table with whitespace — wastes screen real estate)
- Too dense? (information overload, no breathing room)

### Table Design

Is a table the right component? Or should it become:
- Cards (when each item has rich metadata)
- Graph/network (for relationships)
- Timeline (for temporal data)
- Split workspace (for investigation)
- Pipeline/flow (for lifecycle)
- Heatmap (for coverage/distribution)
- Sankey (for flow volume)

---

## DOMAIN 10 — ANALYTICS & VISUALISATION

Every chart must justify itself.

### Evaluate

For each chart on the page:
- **Question answered:** What decision does this chart support?
- **Data source:** Which thesis export feeds it?
- **Chart type suitability:** Is this the right visualisation?

### Chart Type Suitability Guide

| Purpose | Chart Type |
|---------|-----------|
| Trend over time | Line/Area |
| Distribution | Bar/Histogram |
| Flow/Pipeline | Sankey/Pipeline strip |
| Relationship | Network graph |
| Timeline | Gantt/Timeline |
| Impact/Blast | Radial/Tree |
| Coverage | Heatmap |
| Comparison | Grouped bar |
| Proportion | Donut (sparingly) |

### Failure

- Decorative chart (pretty but supports no decision)
- No operational value (chart that could be a number)
- Wrong chart type for the data

### Thesis Adaptation

Charts should map to thesis-derived metrics:
- `thesisPostureMetrics` → posture radar
- `thesisRiskScores` → risk heatmap
- Case `ooda_state` → OODA loop gauge
- Case `ctem_phase` → CTEM pipeline strip
- Mission `delta_score` → delta bar chart

---

## DOMAIN 11 — HUMAN FACTORS

Most important domain. Everything else is structural; this is experiential.

### Assess

| Metric | Question | Target |
|--------|----------|--------|
| **Time To Orientation** | How long before user understands: Situation, Impact, Priority, Next Action? | < 5 seconds |
| **Time To Decision** | How long before user can decide? | < 30 seconds |
| **Time To Action** | How long before action can begin? | < 3 clicks |
| **Cognitive Burden** | How much must user hold in working memory? | LOW |

### Estimated Cognitive Burden

| Level | Meaning | Threshold |
|-------|---------|-----------|
| LOW | User can act immediately | ≤2 items to remember |
| MEDIUM | User needs brief orientation | 3-5 items |
| HIGH | User needs significant study | 6+ items / requires external reference |

### Thesis-Specific Human Factors

- Does the page show `standard_marker`? (User should always know WHICH STANDARD governs what they're seeing)
- Does the page show confidence? (Admiralty grade, source reliability)
- Does the page show freshness? (When was this last updated? Is it stale?)
- Does the page show provenance? (Which connector/system produced this data?)

---

## OUTPUT FORMAT

For every page assessed:

```
═══════════════════════════════════════════════════════
PAGE: [route]
SURFACE: [Command | Intelligence | Investigation | Decision | Execution | Governance | Strategy | Configuration]
DDC SCORE: [from UIAA-THESIS-AUDIT — prerequisite ≥40%]
═══════════════════════════════════════════════════════

DOMAIN 1 — PURPOSE FIT
  Use Cases: [UC-XXX, UC-YYY]
  Score: X/5
  Evidence: [what works / what doesn't]

DOMAIN 2 — OODA ALIGNMENT
  Observe: X/5
  Orient:  X/5
  Decide:  X/5
  Act:     X/5
  Total:   X/20
  Failure conditions: [any immediate fails?]

DOMAIN 3 — CONTEXT RETENTION
  Score: X/5
  Context loss events: [list navigations required]
  10-second test: [PASS/FAIL per question]

DOMAIN 4 — COGNITIVE LOAD
  Clicks to complete UC: [count]
  Page transitions: [count]
  Friction band: [LOW / MEDIUM / HIGH]
  Memory requirement: [PASS/FAIL]

DOMAIN 5 — DATA RELATIONSHIP VISIBILITY
  Score: X/5
  Relationships visible: [count] / [count documented]
  Missing relationships: [list]

DOMAIN 6 — WORKSPACE SUITABILITY
  Current workspace type: [type]
  Recommended workspace type: [type]
  Assessment: [CORRECT / WRONG — requires redesign]

DOMAIN 7 — SPLIT SCREEN ASSESSMENT (Investigation surfaces only)
  Required: [YES/NO]
  Orientation: [Horizontal / Vertical / Hybrid]
  Recommended ratio: [X/Y or X/Y/Z]
  Independent scrolling: [YES/NO]
  Sticky context: [YES/NO]
  Resize behaviour: [YES/NO]
  Focus mode: [YES/NO]
  Compare mode: [YES/NO]

DOMAIN 8 — INFORMATION ARCHITECTURE
  Hierarchy correct: [YES / PARTIAL / NO]
  Progressive disclosure: [YES / PARTIAL / NO]
  Action proximity: [GOOD / POOR]

DOMAIN 9 — VISUAL COMMUNICATION
  Typography: [X/5]
  Colour semantics: [X/5]
  Density: [sparse / appropriate / dense / overloaded]
  Component suitability: [table correct? or should be X]

DOMAIN 10 — ANALYTICS & VISUALISATION
  Charts present: [count]
  Charts justified: [count]
  Charts decorative: [count — each is a finding]
  Missing visualisations: [what should exist]

DOMAIN 11 — HUMAN FACTORS
  Time to orientation: [seconds estimate]
  Time to decision: [seconds estimate]
  Time to action: [clicks]
  Cognitive burden: [LOW / MEDIUM / HIGH]

═══════════════════════════════════════════════════════
COMPOSITE SCORE: [sum of all domains, weighted]
PRIORITY: [CRITICAL / HIGH / MEDIUM / LOW]
═══════════════════════════════════════════════════════

FINDINGS (by severity):

CRITICAL:
  • [finding]

HIGH:
  • [finding]

MEDIUM:
  • [finding]

LOW:
  • [finding]

RECOMMENDATIONS:
  1. [action]
  2. [action]
  3. [action]
```

---

## Scoring Weights

| Domain | Weight | Rationale |
|--------|--------|-----------|
| D1 — Purpose Fit | 10% | Foundation — if purpose is wrong, nothing else matters |
| D2 — OODA Alignment | 15% | Commander's operational model |
| D3 — Context Retention | 12% | Critical for investigation efficiency |
| D4 — Cognitive Load | 10% | Directly impacts analyst speed |
| D5 — Relationships | 12% | Commander is relationship-driven (thesis core) |
| D6 — Workspace Suitability | 8% | Structural correctness |
| D7 — Split Screen | 8% | Required for investigation (hard rule) |
| D8 — Information Architecture | 8% | Progressive disclosure quality |
| D9 — Visual Communication | 7% | Operational readability |
| D10 — Analytics | 5% | Decision support quality |
| D11 — Human Factors | 5% | Experiential quality |
| **TOTAL** | **100%** | |

### Weight Adjustments by Surface Type

| Domain | Command | Intelligence | Investigation | Decision | Execution | Governance |
|--------|:-------:|:------------:|:-------------:|:--------:|:---------:|:----------:|
| D2 (OODA) | +3% | +2% | standard | +2% | +2% | standard |
| D3 (Context) | standard | standard | **+5%** | standard | standard | standard |
| D5 (Relationships) | +2% | +3% | **+3%** | standard | standard | standard |
| D7 (Split Screen) | -4% | standard | **+5%** | -4% | -4% | -4% |
| D11 (Human) | +2% | standard | standard | +2% | standard | standard |

---

## Composite Score Bands

| Band | Score | Meaning |
|------|-------|---------|
| A | 85-100% | Reference quality — no rework |
| B | 70-84% | Good — minor enhancements |
| C | 55-69% | Acceptable — scheduled improvement |
| D | 40-54% | Below standard — prioritised rework |
| F | 0-39% | Failing — immediate rework required |

---

## Assessment Triggers

Run CUUF-1.0 when:

| Trigger | Action |
|---------|--------|
| Phase A build complete (7 HIGH pages) | Assess all 7 new pages |
| Phase B enrichment complete (47 pages) | Assess enriched pages (sample 10) |
| DDC average crosses 40% | Full estate CUUF assessment |
| User feedback indicates usability issue | Targeted single-page assessment |
| Major UI pattern change (split-screen added) | Re-assess all Investigation surfaces |
| New workspace type introduced | Assess all pages of that type |

---

## Appendix A — Workspace Type Quick Reference

### Investigation Workspace (REQUIRED for: /cases, /assets, /identity, /vulnerabilities)

```
┌─────────────────────────────────────────────────────────────┐
│  [KPI Strip]                                                 │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                            │
│   Queue Panel    │         Detail Panel                       │
│   (filterable    │         (selected entity)                  │
│    sortable      │                                            │
│    scrollable)   │         - Summary                          │
│                  │         - Context                           │
│   [25-30% width] │         - Actions                          │
│                  │         - Related entities                  │
│                  │         - Timeline                          │
│                  │                                            │
│                  │         [70-75% width]                      │
├──────────────────┴──────────────────────────────────────────┤
│  [Activity Feed / Live Events]                               │
└─────────────────────────────────────────────────────────────┘
```

### Command Workspace (REQUIRED for: /, /war-room/p0, /som/ciso)

```
┌─────────────────────────────────────────────────────────────┐
│  [KPI Strip — headline metrics]                              │
├─────────────────────────────────────────────────────────────┤
│  [Hero Visual — OODA tempo / CTEM pipeline / Posture radar]  │
├──────────────────┬────────────────────┬─────────────────────┤
│  Panel 1         │  Panel 2           │  Panel 3             │
│  (priority       │  (situational      │  (activity           │
│   queue)         │   context)         │   feed)              │
└──────────────────┴────────────────────┴─────────────────────┘
```

### Strategic Workspace (REQUIRED for: /mission/*, /strategy/*, /posture)

```
┌─────────────────────────────────────────────────────────────┐
│  [Portfolio KPIs — delta scores, progress, risk reduction]   │
├─────────────────────────────────────────────────────────────┤
│  [Portfolio Table — sortable by delta, priority, impact]     │
├─────────────────────────────────────────────────────────────┤
│  [Trend / Trajectory — time-series showing improvement]      │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix B — Common Failure Patterns

| Pattern | Domain | Fix |
|---------|--------|-----|
| "Table of everything" | D6, D8 | Convert to workspace pattern |
| "Navigate to understand" | D3, D4 | Add inline expansion / panel |
| "Data without decision" | D2 | Add action proximity |
| "Pretty chart, no purpose" | D10 | Remove or replace with decision-supporting viz |
| "High density, no hierarchy" | D8, D9 | Add progressive disclosure |
| "Single entity, no relationships" | D5 | Add related entity panels |
| "Settings page for operational data" | D6 | Convert to investigation/command workspace |

---

## Appendix C — Cross-Reference to UIAA-3.0 Dimensions

| CUUF Domain | UIAA-3.0 Dimension | Relationship |
|-------------|-------------------|--------------|
| D1 — Purpose Fit | UCR (Use Case Realisation) | CUUF assesses from user perspective; UIAA from data perspective |
| D2 — OODA | OODU (OODA Usability + Telemetry) | Same concept, different depth |
| D3 — Context | CU (Cognitive Usability) | CUUF focuses on split-screen; UIAA on cognitive ceiling |
| D4 — Cognitive Load | CU (Cognitive Usability) | Overlapping — CUUF is more practical |
| D5 — Relationships | CDRR (Cross-Domain Relationships) | Same concept |
| D6 — Workspace | DSC (Design System Conformity) | CUUF adds workspace classification |
| D7 — Split Screen | — | CUUF-specific (not in UIAA) |
| D8 — IA | CU (progressive disclosure sub-criterion) | Overlapping |
| D9 — Visual | DSC (Design System) + VIM (Visual Intensity) | CUUF is simpler |
| D10 — Analytics | DSQ (Decision Support Quality) | CUUF focuses on charts; UIAA on decision capability |
| D11 — Human Factors | SAQ (Situational Awareness Quality) | Same concept from different angle |

---

**Last Updated:** 2026-06-10
**Next scheduled use:** After Phase A build completion (7 HIGH priority new pages)
