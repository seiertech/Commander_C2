# Thesis Gap Analysis — Commander C2

**Purpose:** Map the 11-layer thesis against what the SDR build already delivers, identify gaps, and define the remediation path.

**Decision:** Commander_C2 = canonical home. SDR = read-only archive.

---

## Executive Summary

The SDR build covers **~70% of the thesis by entity count** but has structural gaps in Layers 2, 3, 7, 8, and 10. The existing code is **retainable** — no rebuild required. The work is additive: missing entities, missing fields on existing entities, and UI pages that need updating to reflect thesis terminology.

---

## Layer-by-Layer Assessment

### Layer 1: Standards Declaration ✅ COMPLETE
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| `Schema_Compliance` (declarations) | `StandardsDeclaration` entity + validation | ✅ Done (13 fixtures) |
| Field-level conformance proof | `StandardsFieldMapping` entity + validation | ✅ Done (16 initial mappings) |
| Version transition tracking | `StandardsVersionHistory` entity + validation | ✅ Done |

**Work remaining:** Expand field mappings to cover all governed entities (~200 more mappings over time). Not blocking.

---

### Layer 2: Architecture Classification & Topology ⚠️ PARTIAL
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| `Architecture_Classification` (TOGAF domain, Zachman aspect/perspective) | `architecture-component.ts` exists but lacks Zachman/TOGAF explicit fields | **ADD** TOGAF domain, Zachman aspect, Zachman perspective fields |
| `Topology_Node` | `TopologyNode` interface ✅ exists | Minor: add `architectural_zone`, `standard_marker` |
| `Topology_Edge` | `TopologyEdge` interface ✅ exists | Minor: add `direction`, `dependency_strength` (has `weight` + `bidirectional`) |
| Blast radius | `BlastRadiusResult` ✅ exists | ✅ Done |

**Work remaining:** Augment `architecture-component.ts` with TOGAF/Zachman classification fields. ~1 commit.

---

### Layer 3: Event & Intelligence ⚠️ PARTIAL (KEY GAP)
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| `Signal` (OCSF-aligned raw event) | `Finding` entity + OCSF normalisation layer + `coim.ts` | ✅ Semantically covered (different naming) |
| `Finding_Event` | `Finding` entity with severity, threat context | ✅ Covered |
| `Remediation_Event` | Actions have outcome fields; no standalone remediation event entity | **ADD** `Remediation_Event` or extend Action entity |
| `Intelligence_Assessment` (Admiralty A-F / 1-6) | **MISSING** — no Admiralty grading anywhere | **ADD** new entity with source reliability (A-F), information credibility (1-6) |

**Work remaining:** Create `intelligence-assessment.ts` entity with Admiralty/NATO grading. Critical thesis gap. ~1 commit.

---

### Layer 4: Asset Authority ✅ STRONG
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| `Asset` | ✅ Full entity with lifecycle, classification, criticality, platform, environment, owner | ✅ Done |
| `Software_Instance` | **MISSING** as distinct entity | **ADD** — new entity |
| `Service` | Implied in topology/mission but no standalone entity | **ADD** — new entity |
| `Asset_Service_Map` | **MISSING** | **ADD** — new entity |

**Work remaining:** 3 new entities. These are additive. ~1 commit.

---

### Layer 5: Asset Classification & Security Posture ✅ STRONG
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| `Asset_Classification` | Asset entity has `classification`, `criticality`, `coverage` inline | Structural: inline vs separate entity — **KEEP as-is** (semantic equivalent) |
| `Asset_Security_Posture` | `PostureMetricsConfig` + `PostureAccountability` | ✅ Covered |
| `Posture_Dimension` (per NIST function) | `PostureMetricDomain` enum includes NIST functions | Minor: add explicit per-asset per-function `Posture_Dimension` if needed |
| NIST CSF posture schedule | GV/ID/PR/DE/RS/RC modelled in `POSTURE_METRIC_DOMAINS` | ✅ Done |

**Work remaining:** Consider adding `Posture_Dimension` as a denormalised view entity. Not blocking.

---

### Layer 6: Exposure Lifecycle (CTEM) ⚠️ PARTIAL
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| CTEM 5-stage lifecycle on entities | `Exposure` entity exists, `ExposureEngine` exists | Missing: explicit `ctemStage` field on exposure/case entities |
| Scoping → Discovery → Prioritization → Validation → Mobilization | Logic exists in engines but not as entity-level state | **ADD** `ctemStage` enum field to `Exposure` and/or `Case` |

**Work remaining:** Add `ctemStage` enum + field to relevant entities. ~1 commit.

---

### Layer 7: Case & Remediation (ITIL + OODA) ✅ VERY STRONG
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| `Case` with ITIL stages + OODA state | ✅ 12-state lifecycle, OODA layer, SLA engine | ✅ Done |
| `Remediation_Workflow` | Implied via case lifecycle + actions | Could add explicit wrapper entity |
| `Remediation_Action` | `Action` + `SubAction` entities ✅ | ✅ Done |
| `Action_Template` | **MISSING** | **ADD** — new entity for reusable action definitions |
| ITIL lifecycle stages | ✅ Fully modelled | ✅ Done |
| OODA states | ✅ `ooda-layer.ts` engine | ✅ Done |

**Work remaining:** Add `ActionTemplate` entity. ~1 commit.

---

### Layer 8: Capacity, Maturity, Performance & Improvement ❌ MAJOR GAP
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| `Case_Capacity_Model` | **MISSING** | **ADD** |
| `Case_Demand_Model` | **MISSING** | **ADD** |
| `Case_Backlog_State` | **MISSING** (metrics exist but not as entity) | **ADD** |
| `Case_Assignment_Model` | Assignment engine exists but no entity | **ADD** or extend |
| `Process_Maturity` (CMMI) | **MISSING** | **ADD** |
| `Governance_Capability` (COBIT) | **MISSING** | **ADD** |
| `Delivery_Performance` (DORA) | **MISSING** | **ADD** |
| `Improvement_Program` (DMAIC) | **MISSING** | **ADD** |
| `Case_Management_Metric` (KPI object) | Metrics in pulse/posture but no dedicated KPI entity | **ADD** |
| Little's Law / queueing dynamics | Logic doesn't exist yet | **ADD** to capacity engine |

**Work remaining:** 8-9 new entities + 1 engine. This is the biggest gap. ~3-4 commits.

---

### Layer 9: Mission & Strategic Portfolio ✅ STRONG
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| `Mission` | ✅ Full entity with status, priority, objectives, KPIs, binding rules | ✅ Done |
| `Mission_Indicator` | `MissionKpi` exists inline; no standalone indicator entity | **ADD** if needed as separate entity with delta scoring |
| `Mission_Case_Link` | `MissionBinding` entity ✅ exists | ✅ Done |
| Direction boards / strategy | `DirectionBoard`, `Strategy`, `StrategyPolicy` ✅ | ✅ Done |

**Work remaining:** Consider extracting `Mission_Indicator` from inline KPIs. Minor.

---

### Layer 10: Risk, Control & Adherence ⚠️ PARTIAL
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| `Risk_Snapshot` (time-series) | `RiskObject` + `RiskScore` exist but not as time-series snapshots | **ADD** `RiskSnapshot` entity with temporal tracking |
| `Control_Reference` | `ControlFramework` + `FrameworkControl` ✅ | ✅ Done |
| `Control_State` | `ControlEvaluation` ✅ exists | ✅ Done |
| `Adherence_Assertion` | **MISSING** | **ADD** — attestation entity |

**Work remaining:** 2 new entities. ~1 commit.

---

### Layer 11: Reporting & Analytics ✅ STRONG
| Thesis Requirement | SDR/C2 State | Gap |
|---|---|---|
| Executive_Risk_View | `/ciso`, `/reporting/ciso-pack` pages exist | ✅ Done |
| Asset_Posture_View | `/posture`, `/som/cloud-security` pages exist | ✅ Done |
| Case_Metrics_View | `/cases/analytics`, pulse pages exist | ✅ Done |
| Remediation_Metrics_View | Implied in case analytics | Minor: may need dedicated page |
| Intelligence_Confidence_View | **MISSING** (no Admiralty grading yet) | Depends on Layer 3 gap |
| Mission_Portfolio_View | `/mission/*` pages exist | ✅ Done |

**Work remaining:** Intelligence_Confidence_View depends on Layer 3 entity. 1 new UI page.

---

## What We Keep (No Changes Needed)

1. **All 110 UI pages** — routing, shell, sidebar, components
2. **All 38 engines** — normalisation, OODA, SLA, lifecycle, strategy, etc.
3. **All 82 fixture files** — seed data for local-first development
4. **All test suites** — ~60+ test files
5. **All rules** — correlation, dedup, enrichment, war-room, etc.
6. **Database schema** — Drizzle migrations
7. **Design system** — tokens, primitives, components
8. **Connectors package** — mock connector system
9. **New governance model** — BUILD_BACKLOG, debt-register, PAGE_SCHEDULE, Standards Evidence Model

---

## Recovery Work Queue (Ordered)

| # | Work Item | Thesis Layer | Effort | Blocking? |
|---|---|---|---|---|
| 1 | Create `IntelligenceAssessment` entity (Admiralty A-F / 1-6) | L3 | Small | Yes — core thesis gap |
| 2 | Create `SoftwareInstance`, `Service`, `AssetServiceMap` entities | L4 | Small | No |
| 3 | Add `ctemStage` enum to `Exposure` + `Case` entities | L6 | Tiny | No |
| 4 | Create `ActionTemplate` entity | L7 | Small | No |
| 5 | Create Layer 8 entities: `CaseCapacityModel`, `CaseDemandModel`, `CaseBacklogState`, `CaseAssignmentModel`, `ProcessMaturity`, `GovernanceCapability`, `DeliveryPerformance`, `ImprovementProgram`, `CaseManagementMetric` | L8 | Medium | Yes — biggest gap |
| 6 | Create `RiskSnapshot` entity (temporal) | L10 | Small | No |
| 7 | Create `AdherenceAssertion` entity | L10 | Small | No |
| 8 | Augment `architecture-component.ts` with TOGAF/Zachman fields | L2 | Tiny | No |
| 9 | Create `IntelligenceConfidenceView` UI page | L11 | Small | Depends on #1 |
| 10 | UI audit: update page headers/labels for thesis terminology | All | Medium | No |

**Estimated total:** ~10-12 commits of additive work. No destructive changes.

---

## UI Updates Needed

The UI pages were built for the SDR product spec, not the thesis. Key terminology updates:

- Page headers should reference thesis layer names where appropriate
- Posture pages should show NIST CSF function mapping explicitly
- Mission pages should show delta scoring
- No page needs rebuilding — only label/content updates

---

## Decision Required

**The recovery is manageable.** The SDR build is ~70% thesis-complete. The gaps are additive (new entities, new fields, new pages). Nothing needs to be torn down.

**Recommended approach:**
1. Work through the Recovery Work Queue items 1-10 in order
2. Commit every item
3. Push continuously
4. Update BUILD_BACKLOG as each item completes

**Last Updated:** 2026-06-10
