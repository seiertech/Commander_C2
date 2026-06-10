# UIAA THESIS AUDIT — Commander C2

**Version:** AUDIT-1.0
**Date:** 2026-06-10
**Authority:** Subordinate to UIAA-3.0. References DATA_DICTIONARY, KNOWLEDGE_GRAPH, USE_CASE_REGISTER.
**Purpose:** Quantitative gap analysis of UI estate against thesis data model. Repeatable methodology.
**Re-run cadence:** After every build phase completion or 10+ page additions.

---

## 0. Executive Summary

| Metric | Value | Assessment |
|--------|-------|-----------|
| Total pages | 106 | — |
| Average DDC score | **12%** | CRITICAL — 87% of pages are thin |
| Pages scoring >60% DDC | 2 | Only cases/[id] and cases/my are rich |
| Thesis data exports consumed | 56/74 (76%) | 21 exports have NO page surface |
| AICAP markers | 78 on 73 pages | — |
| AICAP ready to activate | **2** (3%) | 97% lack grounding data |
| New pages demanded by data | **22** | 7 HIGH, 11 MEDIUM, 4 LOW |
| Existing pages needing enrichment | **47** | Average needs 3-4 more data imports |
| Nav groups needing restructure | 19 → 18 | 5 renames, 2 new, 4 merged |
| Standards with no dedicated surface | **11** | ISO 27005, CTEM, SSVC, DORA, D3FEND, STIX, NATO/Admiralty, OCSF, CMMI, OODA, Little's Law |
| Engines with no UI surface | **14** | Decision-explainability, inverse-discovery, push-governance, etc. |

---

## 1. Methodology (Repeatable)

### 1.1 How to re-run this audit

```bash
# Step 1: Gather page data
node --input-type=module -e "..." > audit-data.json

# Step 2: Classify by Surface Type
node --input-type=module -e "..." > audit-classified.json

# Step 3: Score DDC
node --input-type=module -e "..." > audit-scored.json

# Step 4: Compute AICAP readiness
# Step 5: Identify new page opportunities
# Step 6: Propose nav restructure
```

Scripts are embedded in the repository at the commit that produced this audit. Re-run after each build phase.

### 1.2 DDC Scoring Formula

```
DDC = (entity_coverage × 0.30) + (depth × 0.25) + (engine_estimate × 0.25) + (relationship_estimate × 0.20)

Where:
  entity_coverage = entities_consumed / entities_applicable_for_surface_type
  depth = data_sources_imported / applicable_entities (capped at 100%)
  engine_estimate = min(100, (imports / applicable_engines) × 50)
  relationship_estimate = imports >= 3 ? min(100, (imports - 2) × 20) : 0
```

### 1.3 Surface Classification Rules

| Surface Type | Definition | OODA Stage | C2 Role |
|-------------|-----------|-----------|---------|
| Command | Programme-level awareness, tempo | All (hub) | Command + Coordination |
| Intelligence | Multi-source correlation, pattern recognition | Observe + Orient | Communication |
| Investigation | Drill-into-detail, evidence, root-cause | Orient + Decide | Control (information) |
| Decision | Decision presentation, approval, strategy | Decide | Command + Control |
| Execution | Action initiation, remediation, push | Act | Control + Coordination |
| Governance | Adherence, audit, reporting, accountability | All (measurement) | Outcome Measurement |
| Strategy | Planning, mission, policy, simulation | Decide | Command |
| Configuration | Settings, admin, baseline | N/A | N/A |
| Control Plane | Internal operator console | N/A | N/A |

---

## 2. DDC Score Distribution

### 2.1 Overall

| Band | Pages | % | Assessment |
|------|-------|---|-----------|
| 0-20% (critical) | 92 | 87% | Single-table views, no cross-referencing |
| 21-40% (poor) | 7 | 7% | Some enrichment, limited relationships |
| 41-60% (fair) | 5 | 5% | Multi-source, some engine outputs |
| 61-80% (good) | 1 | 1% | Strong cross-referencing |
| 81-100% (strong) | 1 | 1% | Reference quality |

### 2.2 By Surface Type

| Surface | Avg DDC | Min | Max | Pages | Priority |
|---------|---------|-----|-----|-------|----------|
| Configuration | 7% | 0% | 35% | 17 | LOW (admin) |
| Intelligence | 9% | 0% | 55% | 22 | **HIGH** |
| Strategy | 9% | 9% | 9% | 4 | **HIGH** |
| Decision | 9% | 5% | 16% | 8 | **HIGH** |
| Command | 11% | 6% | 34% | 19 | **HIGH** |
| Control Plane | 14% | 0% | 55% | 13 | MEDIUM |
| Governance | 14% | 7% | 33% | 7 | **HIGH** |
| Execution | 22% | 0% | 68% | 13 | MEDIUM |
| Investigation | 44% | 20% | 84% | 3 | Reference |

### 2.3 Reference Quality Pages (DDC > 50%)

| Page | DDC | Surface | Data Sources |
|------|-----|---------|-------------|
| /cases/[id] | 84% | Investigation | 13 imports — case detail composition |
| /cases/my | 68% | Execution | 10 imports — personal queue with artefacts |
| /platform | 60% | Execution | 7 imports — platform overview |
| /control-plane | 55% | Control Plane | 4 imports — command overview |
| /operating-picture/external | 55% | Intelligence | 8 imports — signal + assessment |

---

## 3. Unconsumed Thesis Data (21 exports, 28% of total)

These data sources exist in `thesis-adapters.ts` but NO page renders them:

| Export | Layer | Concept | Impact |
|--------|-------|---------|--------|
| thesisPostures | L5 | Asset security posture scores (NIST CSF) | HIGH — posture page should consume |
| thesisPostureAccountability | L5 | Posture ownership + overdue tracking | HIGH — needs new page |
| thesisRiskScores | L5 | Computed risk priority scores | HIGH — vuln/risk pages need this |
| thesisFindings | L3 | Detection findings from rules | MEDIUM — rule/platform pages |
| thesisCaseStrategyBindings | L7/L10 | Case→strategy linking | MEDIUM — case detail should show |
| thesisCommunicationPlaybooks | L7 | Playbook library | MEDIUM — needs new page |
| thesisCommunicationThreads | L7 | Case communication threads | MEDIUM — case detail should show |
| thesisControlMappings | L10 | Cross-framework control mappings | MEDIUM — controls pages |
| thesisDirectionBoards | L10 | Strategic direction signals | LOW — needs new page |
| thesisSimulationResults | L10 | Strategy simulation outputs | MEDIUM — strategy pages |
| thesisStandardsDeclarations | L1 | Standards evidence proofs | HIGH — governance pages |
| thesisArchitectureIntelligence | L4 | Architecture risk analysis | MEDIUM — architecture pages |
| thesisSecurityToolIntelligence | L2 | Per-tool effectiveness metrics | MEDIUM — needs new page |
| thesisDriftDetection | L4 | Configuration drift findings | MEDIUM — architecture/drift |
| thesisIdentityIntelligence | L6 | Identity behaviour analysis | MEDIUM — identity pages |
| thesisEventIntelligence | L3 | Signal enrichment data | MEDIUM — needs new page |
| thesisExposureEngine | L5 | Exposure computation outputs | HIGH — exposure pages |
| thesisVulnerabilityEngine | L5 | Vulnerability correlation | MEDIUM — vuln pages |
| thesisPushGovernance | L11 | Governed push audit log | MEDIUM — needs new page |
| thesisAssetAuthority | L4 | Asset authority model | LOW — asset detail |
| thesisTopologyEdges | L2 | Architecture dependency edges | LOW — fusion-map |

---

## 4. AICAP Readiness Assessment

### 4.1 Summary

| Status | Count | % | Meaning |
|--------|-------|---|---------|
| 🟢 Ready (80%+) | 2 | 3% | Data on page, AI can ground immediately |
| 🟡 Partial (1-79%) | 41 | 56% | Need 1-3 more imports to enable grounding |
| 🔴 Blocked (0%) | 7 | 10% | Zero grounding data — page is empty |
| ⚪ Unmapped | 23 | 31% | Generic markers, needs-mapping not defined |

### 4.2 Quick Wins (AICaps needing only 1 more import)

| AICAP | Page | Missing Import | Effort |
|-------|------|---------------|--------|
| AICAP-PLAT-006 | /platform | thesisSystemPulse | 1 line |
| AICAP-ARCH-003 | /architecture/dependencies | thesisBlastRadius | 1 line |
| AICAP-ARCH-002 | /architecture/drift | thesisDriftDetection | 1 line |
| AICAP-PLATFORM-002 | /platform/models | thesisBlastRadius | 1 line |
| AICAP-PULSE-009 | /system-pulse/freshness | thesisConnectors | 1 line |
| AICAP-PULSE-008 | /system-pulse/queues | thesisTeamPulse | 1 line |
| AICAP-FUSION-003 | /fusion-map/mission | thesisAssets | 1 line |
| AICAP-VULN-003 | /vulnerabilities/supply-chain | thesisAssets | 1 line |

These 8 AICaps can be unblocked with a single import addition each.

### 4.3 Blocked AICaps (need page content built first)

| AICAP | Page | Needs |
|-------|------|-------|
| AICAP-001 | /commander-ai | Page is completely empty — needs full rebuild |
| AICAP-ARCH-001 | /architecture | Needs thesisArchitectureIntelligence + topology |
| AICAP-FUSION-004 | /fusion-map/p0 | Needs thesisCases, thesisBlastRadius, thesisWarRooms |
| AICAP-GOV-001 | /governance/policies | Needs thesisControlEvaluations + standards + push |
| AICAP-PLATFORM-005 | /platform/data-quality | Needs thesisFindings + connectors + tool intel |
| AICAP-PLATFORM-003 | /platform/rules/validation | Page is empty — needs full build |
| AICAP-REPORT-003 | /reporting/ciso-pack | Needs thesisCisoSummary + missions + cases |

---

## 5. New Page Opportunities (22 identified)

### 5.1 HIGH Priority (7 pages)

| ID | Route | Standard | Title | Data |
|----|-------|----------|-------|------|
| NP-001 | /risk-management | ISO 27005 | Risk Management Console | thesisRiskObjects, thesisRiskScores, thesisAssets, thesisCases, thesisStrategies |
| NP-002 | /risk-management/treatment | ISO 27005 | Risk Treatment Plans | thesisRiskObjects, thesisDecisionRecords, thesisStrategies, thesisActions |
| NP-003 | /exposure/ctem | CTEM | CTEM Exposure Lifecycle | thesisExposures, thesisExposureEngine, thesisCases, thesisAssets, thesisRiskObjects |
| NP-004 | /cases/tempo | OODA | OODA Command Tempo | thesisCases, thesisEvents, thesisActions, thesisTeamPulse |
| NP-011 | /posture/accountability | NIST CSF 2.0 | Posture Accountability | thesisPostureAccountability, thesisPostures, thesisAssets, thesisPostureMetrics |
| NP-018 | /governance/adherence-evidence | ISO 27001 | Adherence Evidence Trail | thesisStandardsDeclarations, thesisControlEvaluations, thesisControlMappings, thesisEvidence |
| NP-019 | /coverage | NIST CSF 2.0 | Coverage Overview | thesisAssets, thesisConnectors, thesisExposures, thesisSecurityToolIntelligence |

### 5.2 MEDIUM Priority (11 pages)

| ID | Route | Standard | Title |
|----|-------|----------|-------|
| NP-005 | /vulnerabilities/ssvc | SSVC | SSVC Decision Flow |
| NP-006 | /intelligence/signals | OCSF 1.3 | Signal Pipeline |
| NP-007 | /intelligence/iocs | STIX | IOC Lifecycle |
| NP-008 | /intelligence/threat-hunts | MITRE ATT&CK | Threat Hunt Operations |
| NP-010 | /governance/push-governance | Commander | Push Governance Console |
| NP-012 | /cases/playbooks | ITIL 4 | Communication Playbooks |
| NP-014 | /platform/tool-intelligence | Commander | Security Tool Intelligence |
| NP-015 | /architecture/inverse-discovery | Commander | Inverse Discovery |
| NP-017 | /defence-coverage | D3FEND | Attack & Defence Coverage |
| NP-020 | /coverage/scanners | NIST CSF | Scanner Coverage |
| NP-021 | /coverage/telemetry | OCSF | Telemetry Coverage |

### 5.3 LOW Priority (4 pages)

| ID | Route | Standard | Title |
|----|-------|----------|-------|
| NP-009 | /intelligence/confidence | NATO/Admiralty | Confidence Console |
| NP-013 | /strategy/direction-boards | CBP | Direction Boards |
| NP-016 | /operational-maturity | DORA + CMMI | Maturity Console |
| NP-022 | /platform/provenance | Commander | Data Provenance |

---

## 6. Navigation Restructure

### 6.1 Summary of Changes

| Change Type | Count |
|-------------|-------|
| Groups renamed | 5 |
| New groups | 2 (Intelligence, Risk Management) |
| Groups merged | 4 → 1 (Pulse surfaces + Tool Health → Operational Health) |
| Net group count | 19 → 18 |
| Pages to build | 22 |
| Pages to enrich | 47 |
| Pages unchanged | 14 |

### 6.2 Renames

| Current Name | Proposed Name | Rationale |
|-------------|--------------|-----------|
| Exposure Management | **Exposure & CTEM** | CTEM lifecycle is the thesis concept; exposure is the data |
| Mission Control | **Mission & Strategy** | Strategy surfaces (simulation, direction boards, posture) belong here |
| Governance | **Governance & Adherence** | "Adherence" is thesis terminology (not "compliance") |
| Controls | **Controls & Frameworks** | Framework mapping is the primary activity |
| Team/Domain/System Pulse + Tool Health | **Operational Health** | Single coherent group for all health/pulse surfaces |

### 6.3 New Groups

| Group | Surface | Items | Rationale |
|-------|---------|-------|-----------|
| **Intelligence** | Intelligence | 7 | IOC, signals, threat hunts, confidence, ATT&CK/D3FEND — all homeless today |
| **Risk Management** | Strategy | 3 | ISO 27005 is embedded in data model; needs first-class surface |

### 6.4 Proposed 18-Group Structure

1. Command Centre (3 items)
2. Case Management (5 items)
3. **Intelligence** (7 items) ← NEW
4. **Risk Management** (3 items) ← NEW
5. Vulnerability Management (5 items)
6. Exposure & CTEM (4 items) ← RENAMED
7. Identity & Access (3 items)
8. Architecture (4 items)
9. Assets (3 items)
10. Mission & Strategy (8 items) ← RENAMED
11. Governance & Adherence (6 items) ← RENAMED
12. Controls & Frameworks (3 items) ← RENAMED
13. Coverage (3 items)
14. Operational Health (12 items) ← MERGED
15. Platform (8 items)
16. Reporting (3 items)
17. Security Operations Management (5 items)
18. Fusion Map (4 items)

---

## 7. Prioritised Build Backlog

### 7.1 Immediate (unblock AICAP + raise DDC)

**8 single-import additions** that unblock AICAP grounding:

| Page | Add Import | Unblocks |
|------|-----------|----------|
| /platform | thesisSystemPulse | AICAP-PLAT-006 |
| /architecture/dependencies | thesisBlastRadius | AICAP-ARCH-003 |
| /architecture/drift | thesisDriftDetection | AICAP-ARCH-002 |
| /platform/models | thesisBlastRadius | AICAP-PLATFORM-002 |
| /system-pulse/freshness | thesisConnectors | AICAP-PULSE-009 |
| /system-pulse/queues | thesisTeamPulse | AICAP-PULSE-008 |
| /fusion-map/mission | thesisAssets | AICAP-FUSION-003 |
| /vulnerabilities/supply-chain | thesisAssets | AICAP-VULN-003 |

### 7.2 Phase A: HIGH Priority New Pages (7 pages)

Build order (data-readiness first):

1. `/cases/tempo` — OODA tempo (data 100% available, thesis centrepiece)
2. `/exposure/ctem` — CTEM pipeline (data available, thesis §10)
3. `/risk-management` — ISO 27005 register (5 data sources ready)
4. `/risk-management/treatment` — Treatment plans
5. `/coverage` — Coverage overview (route exists, just needs page)
6. `/posture/accountability` — Posture ownership
7. `/governance/adherence-evidence` — Proof chain

### 7.3 Phase B: Enrich Existing (47 pages)

Prioritised by DDC improvement potential:

**Tier 1 (add 2-3 imports, DDC jumps 20%+):**
- /ciso — add thesisMissions, thesisPostureMetrics, thesisRiskObjects, thesisCases
- /cases/analytics — add thesisRiskScores, thesisCaseStrategyBindings
- /exposure — add thesisExposureEngine, thesisAssets, thesisRiskObjects
- /vulnerabilities — add thesisRiskScores, thesisExposures, thesisAssets
- /governance — add thesisStandardsDeclarations, thesisControlEvaluations
- /identity — add thesisIdentityIntelligence
- /mission/objectives — add thesisMissionBindings, thesisCases
- /mission/impact — add thesisRiskObjects, thesisPostureMetrics

**Tier 2 (add 1-2 imports, DDC jumps 10-15%):**
- All Pulse pages (9) — add thesisCases to each
- /architecture — add thesisArchitectureIntelligence, thesisTopology
- /controls — add thesisControlMappings, thesisStandardsDeclarations
- /platform/rules — add thesisFindings, thesisRiskScores
- /reporting — add thesisCases, thesisMissions
- /reporting/ciso-pack — add thesisCisoSummary, thesisMissions

### 7.4 Phase C: MEDIUM Priority New Pages (11 pages)

Build order:
1. `/intelligence/signals` — OCSF signal pipeline
2. `/intelligence/iocs` — IOC lifecycle
3. `/vulnerabilities/ssvc` — SSVC decision flow
4. `/cases/playbooks` — Communication playbooks
5. `/governance/push-governance` — Push audit
6. `/platform/tool-intelligence` — Tool effectiveness
7. `/architecture/inverse-discovery` — Blind spots
8. `/intelligence/threat-hunts` — Hunt operations
9. `/coverage/scanners` — Scanner deployment
10. `/coverage/telemetry` — Telemetry map
11. `/defence-coverage` — ATT&CK/D3FEND heatmap

### 7.5 Phase D: LOW Priority + Polish (4 pages)

1. `/intelligence/confidence` — Admiralty console
2. `/strategy/direction-boards` — Strategic direction
3. `/operational-maturity` — DORA + CMMI
4. `/platform/provenance` — Data trust

---

## 8. AICAP Activation Roadmap

### 8.1 Wave 1: Unblock with imports (8 AICaps → ready immediately)

See §7.1 — single import additions.

### 8.2 Wave 2: Activate with page enrichment (41 AICaps → ready after Phase B)

Once pages receive their additional data imports per Phase B, these AICaps will have grounding corpus coverage. Commander AI can then:
- Orient users on cross-referenced data
- Correlate entities visible on the page
- Recommend actions based on available context

### 8.3 Wave 3: Activate with new pages (20 new AICaps)

New pages (Phase A/C/D) each introduce 1-2 new AICAP opportunities:
- AICAP-RISK-001/002 on risk management pages
- AICAP-CTEM-001 on CTEM lifecycle
- AICAP-TEMPO-001 on OODA tempo
- AICAP-SIGNAL-001 on signal pipeline
- AICAP-IOC-001 on IOC lifecycle
- etc.

### 8.4 Total AICAP projection

| Phase | Ready AICaps | Cumulative |
|-------|-------------|-----------|
| Current state | 2 | 2 |
| After Wave 1 (imports) | +8 | 10 |
| After Wave 2 (enrichment) | +41 | 51 |
| After Wave 3 (new pages) | +20 | 71 |
| After new markers defined | +27 | **98** |

---

## 9. Standards Surface Coverage (Current vs Proposed)

| Standard | Current Surface | Proposed Surface | Gap Type |
|----------|----------------|-----------------|----------|
| ISO 27005 | som/risk (thin KPIs) | /risk-management (full register) | **NEW PAGE** |
| CTEM | Field on case detail | /exposure/ctem (5-phase pipeline) | **NEW PAGE** |
| SSVC | None | /vulnerabilities/ssvc (decision flow) | **NEW PAGE** |
| OODA | Field on case detail | /cases/tempo (loop visualisation) | **NEW PAGE** |
| DORA | system-pulse (partial) | /operational-maturity (full metrics) | **NEW PAGE** |
| D3FEND | None | /defence-coverage (technique map) | **NEW PAGE** |
| MITRE ATT&CK | COIM field on risk objects | /defence-coverage + /intelligence/threat-hunts | **NEW PAGES** |
| NATO/Admiralty | 1 column on external op pic | /intelligence/confidence (full console) | **NEW PAGE** |
| STIX | None | /intelligence/iocs (bundle lifecycle) | **NEW PAGE** |
| OCSF 1.3 | Implicit in signals | /intelligence/signals (class distribution) | **NEW PAGE** |
| CMMI | Mentioned in SOM | /operational-maturity (maturity levels) | **NEW PAGE** |
| Little's Law | Mentioned in analytics | Case analytics enrichment | **ENRICH** |
| ISO/IEC 19770 | Asset detail | Already surfaced | ✅ |
| NIST CSF 2.0 | Posture page | Already surfaced + expand to coverage | PARTIAL |
| ITIL 4 | Case lifecycle (ITIL/OODA columns) | Already surfaced | ✅ |
| TOGAF/Zachman | Architecture page | Already surfaced | ✅ |
| ISO 27001 | governance/policies | /governance/adherence-evidence expands | **NEW PAGE** |
| COBIT | Mentioned | /governance/adherence-evidence | **NEW PAGE** |

---

## 10. Repeatable Audit Triggers

Re-run this audit when:

| Trigger | Action |
|---------|--------|
| 10+ new pages built | Full re-run, recalculate DDC distribution |
| New thesis entities added to adapters | Re-check unconsumed list |
| New AICAP markers placed | Re-check readiness mapping |
| Nav restructure implemented | Validate classification alignment |
| Engine added/removed | Re-check engine surface coverage |
| Phase completion (A/B/C/D) | Re-run, compare to baseline |
| DDC average crosses 40% | Recalibrate scoring bands |

---

## Appendix A: Page Classification Register (106 pages)

### Command (19 pages)
`/`, `/ciso`, `/domain-pulse`, `/domain-pulse/closure-blockers`, `/domain-pulse/failed-validation`, `/som/architecture`, `/som/ciso`, `/som/cloud-security`, `/som/risk`, `/som/security-operations`, `/system-pulse/engine`, `/system-pulse/freshness`, `/system-pulse/queues`, `/team-pulse/escalation`, `/team-pulse/sla`, `/team-pulse/workload`, `/tool-health`, `/tool-health/connectors`, `/tool-health/freshness`

### Intelligence (22 pages)
`/architecture`, `/architecture/dependencies`, `/architecture/drift`, `/assets/classification`, `/assets/ownership`, `/commander-ai`, `/exposure`, `/exposure/blast-zones`, `/exposure/coverage-gaps`, `/fusion-map`, `/fusion-map/blast-radius`, `/fusion-map/mission`, `/fusion-map/p0`, `/identity/drift`, `/identity/privileged`, `/operating-picture/external`, `/operating-picture/internal`, `/search`, `/vulnerabilities`, `/vulnerabilities/kev`, `/vulnerabilities/patches`, `/vulnerabilities/supply-chain`

### Execution (13 pages)
`/cases`, `/cases/analytics`, `/cases/my`, `/platform`, `/platform/automation`, `/platform/connectors`, `/platform/data-quality`, `/platform/features`, `/platform/models`, `/platform/models/lifecycle`, `/platform/rules`, `/platform/rules/validation`, `/war-room/p0`

### Configuration (17 pages)
`/settings/*` (14), `/tenant-admin`

### Control Plane (13 pages)
`/control-plane/*`

### Decision (8 pages)
`/governance`, `/governance/decisions`, `/governance/exceptions`, `/governance/policies`, `/platform/rules/simulation`, `/strategy/audit-history`, `/strategy/centre`, `/strategy/simulation`

### Governance (7 pages)
`/controls`, `/controls/frameworks`, `/controls/strength`, `/platform/audit`, `/reporting`, `/reporting/ciso-pack`, `/reporting/exports`

### Strategy (4 pages)
`/mission/impact`, `/mission/objectives`, `/mission/overview`, `/posture`

### Investigation (3 pages)
`/assets`, `/cases/[id]`, `/identity`

---

## Appendix B: Thesis Data Surface Map

Total thesis-adapters exports: **74**
Consumed by at least 1 page: **53** (72%)
Unconsumed: **21** (28%)

---

**Last Updated:** 2026-06-10
**Next Scheduled Re-run:** After Phase A completion (7 HIGH priority pages built)
