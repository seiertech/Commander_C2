> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy. See `GUIDANCE_NOTICE.md` for precedence rules.

# Connector Registry & Case Action Workflow Engine — v2.0

**Status:** Design Authority — Pre-Build Specification  
**Version:** 2.0 (supersedes v1.0)  
**Date:** 2026-06-13  
**Owner:** Johann / Commander C2 Architecture  
**Thesis conformance:** Required (snake_case, standard_marker, all applicable governing standards)  
**Standards governing:** OCSF 1.3, ISO 19770, NIST CSF 2.0, CTEM, OODA, TOGAF, Zachman, NATO/Admiralty, ITIL 4, CMMI, COBIT 2019, DORA, DMAIC, CBP  
**Governing specs:** MTS v7.0; Specs #05, #06, #09, #12, #13, #14, #16, #17, #18, #22, #23, #24, #28, #29, #55, #58, #59, #61, #62, #71, #72, #73, #74, #75  
**Build phase:** Phase 1 (local-first, mock data) → Phase 2 (live vendor APIs)

---

## 1. Core Principle: Control State Evaluation

The CRAW Engine's fundamental job is NOT "detect drift." It is:

1. **ENRICH** — every signal updates entity records (even when nothing is wrong)
2. **EVALUATE** — compare current control state against baseline across ALL applicable dimensions
3. **CLASSIFY** — when deviation found, classify the SPECIFIC failure type (drift is just one of 12+)
4. **BIND** — generate a Risk Object of the correct type (per Spec #29)
5. **CASE** — bind Risk Object to a Case (12 types, 12-state lifecycle per Spec #17)
6. **PRIORITISE** — 5-dimension context modulation (per Spec #74) + strategic alignment (per Spec #28)
7. **REMEDIATE** — determine execution path (autopilot / confirm / manual)
8. **VALIDATE** — confirm remediation via next pull
9. **CLOSE or REOPEN** — system-owned lifecycle (per Spec #17)

Most signals most of the time just confirm "still adherent." They enrich records, maintain freshness, keep posture scores healthy. Only when something DEVIATES — or something is MISSING — does the system generate risk objects and cases.

---

## 2. Signal Classification Taxonomy

### 2.1 Seven Signal Categories


| Category | Job | Case Created? | Risk Object? | Examples |
|---|---|---|---|---|
| **1. Inventory** | Populate/maintain estate picture | Never (unless MISSING triggers coverage) | No | Device lists, software inventory, user directories, cloud resources, group membership |
| **2. Configuration/State** | Evaluate control state against baseline | Only when deviation exceeds threshold | Yes (if deviated) | Policy configs, sensor versions, compliance state, access configs, coverage status |
| **3. Vulnerability/Exposure** | Direct exploitable risk | Always | Always | Scanner findings, CVE match, KEV, internet-facing exposure, open ports |
| **4. Detection/Attack (SOC)** | External attack intelligence — correlate only | Always (ext-attack-correlation) | Always | SIEM cases, XDR detections, EDR alerts. SOC BOUNDARY: read only, never write back |
| **5. Verdict (Behavioural)** | What security stack decides daily | Only when PATTERNS emerge | Only on pattern | Email blocks, MFA challenges, DLP blocks, CA verdicts. Individual = enrichment only |
| **6. Threat Intelligence** | External context — estate relevance | Only if RELEVANT to estate | Only if relevant | CVE feeds, KEV, IOC streams, STIX/TAXII, vendor advisories |
| **7. Tool Health / Platform** | Is the security stack itself working? | When degradation affects coverage | Yes | Connector failures, sensor liveness, API quota, OODA phase health |

### 2.2 Category → Connector Class Mapping

| Category | Primary Connector Class | Signal Purposes (Spec #61) |
|---|---|---|
| 1. Inventory | C (Configuration State) | Inventory, Configuration |
| 2. Configuration/State | C (Configuration State) | Configuration, State |
| 3. Vulnerability/Exposure | C + D (Config + Threat Intel) | State, Threat |
| 4. Detection/Attack | A (SOC Telemetry) | Detection, Case |
| 5. Verdict | B (Operational Verdict) | Verdict, Behavioural |
| 6. Threat Intelligence | D (Threat Intelligence) | Threat |
| 7. Tool Health | All (internal) | State |

### 2.3 One Connector, Multiple Categories

A single connector pull can produce ALL categories simultaneously. CrowdStrike Falcon (Class A+B+C) in one cycle:
- Inventory (asset list, software) → Category 1
- State (sensor versions, policy config) → Category 2
- Detections (alerts, incidents) → Category 4
- Verdicts (prevention actions) → Category 5
- Health (sensor liveness) → Category 7

The CRAW Engine classifies each record at ingestion and routes correctly.

---

## 3. Entity Enrichment Matrix

### 3.1 What Every Signal Updates

Every signal that enters Commander enriches one or more canonical entities. This table is EXHAUSTIVE — derived from the Data Dictionary (55 entities, 11 layers) and Knowledge Graph (25 relationships).

| Entity | Fields Updated by Signals | Signal Categories | Standard | Authority Rule |
|---|---|---|---|---|
| **Asset** | asset_name, asset_class, asset_subclass, platform, environment, location, owner, lifecycle_state, source_of_truth, first_seen, last_seen | 1, 2, 3, 7 | ISO 19770 | Primary: Class C. Enrichment: Class A/B. Authority resolution: C>B>A>D |
| **Software_Instance** | software_name, software_version, publisher, install_state, software_type, package_reference | 1, 2 | ISO 19770 | Primary: EDR/MDM connector |
| **Identity** | classification, privilege_level, auth_strength, entitlement_summary, risk_factors, source_system_lineage | 1, 2, 5 | NIST CSF PR.AC | Primary: IdP (Class C). Enrichment: Verdicts (Class B) |
| **Service** | service_name, service_owner, service_tier, business_dependency | 1 | ITIL 4 | Primary: CMDB/cloud connector |
| **Asset_Service_Map** | relationship_type, critical_dependency_flag | 1 | ISO 19770 + ITIL | Primary: topology source |
| **Asset_Classification** | criticality, data_classification, exposure_type, mission_impact, risk_weighting | 1, 2, 3 | NIST CSF 2.0 | Primary: Class C. Derived: exposure scanners |
| **Asset_Security_Posture** | posture_status, posture_score, patch_status, vulnerability_exposure, monitoring_coverage, response_readiness, recovery_readiness, governance_status | 2, 3, 7 | NIST CSF 2.0 | Computed from all sources. Updated on every state signal. |
| **Posture_Dimension** | nist_function (GV/ID/PR/DE/RS/RC), dimension_state, dimension_score, evidence_source | 2, 3, 7 | NIST CSF 2.0 | Per-function granularity. Each signal updates relevant function(s). |
| **Architecture_Classification** | togaf_domain, zachman_aspect, logical_layer, physical_layer | 1, 2 | TOGAF/Zachman | Primary: cloud/architecture connectors |
| **Topology_Node** | node_type, architectural_zone | 1, 2 | TOGAF | Derived from asset relationships |
| **Topology_Edge** | relationship_type, direction, dependency_strength | 1, 2 | TOGAF | Derived from network/dependency data |
| **Control_State** | effectiveness_state, validation_state, last_verified, evidence_pointer | 2, 3, 5 | Framework-specific | Updated when control evidence arrives |
| **Control_Reference** | framework_name, framework_version, category_or_control | 2 | Framework-specific | Enriched by adherence evaluations |
| **Risk_Snapshot** | inherent_risk, current_risk, residual_risk, risk_reason, sla_status | 2, 3, 4, 5, 6 | ISO 27005 + ITIL | NEW record created on every material change (time-series) |
| **Intelligence_Assessment** | source_reliability, information_credibility, combined_rating | 4, 6 | NATO/Admiralty | Graded per signal source |
| **Signal** | (created, not updated) ocsf_category, ocsf_class, signal_type, severity, raw_payload, normalized_payload | ALL | OCSF 1.3 | Every inbound record creates a Signal |
| **Finding_Event** | event_family, title, description, normalized_severity, threat_context | 2, 3, 4, 5, 6 | OCSF 1.3 | Created when Signal is interpreted |
| **Adherence_Assertion** | assertion_status, attested_time | 2 | Standard-specific | Updated when control evaluations change |
| **Mission_Indicator** | current_value, delta | 2, 3, 7 | CBP + NATO/Admiralty | Updated when posture/risk affects missions |
| **Case** | (created when Risk Object binds) case_type, ctem_phase, ooda_state, priority_level | 2, 3, 4, 5, 6, 7 | ITIL 4 + OODA + CTEM | System-created only. Never manual. |

### 3.2 Relationship Enrichment

Per Knowledge Graph, signals also create/update relationships:

| Relationship | Triggered By | Entities Linked |
|---|---|---|
| `installed_on` | New software detected on asset | Software_Instance → Asset |
| `maps` | Asset serves a business service | Asset_Service_Map → Asset + Service |
| `classifies` | Classification data arrives | Asset_Classification → Asset |
| `assesses` | Posture evaluation runs | Asset_Security_Posture → Asset |
| `evaluates` | Control evidence arrives | Control_State → Asset |
| `references` | Topology data arrives | Topology_Node → Asset |
| `connects` | Network relationship found | Topology_Edge → Topology_Node × 2 |
| `originated_from` | Case created from signal | Case → Signal |
| `affects` | Case binds to asset | Case → Asset |
| `assesses_risk_for` | Risk changes | Risk_Snapshot → Asset |
| `interprets` | Signal interpreted as finding | Finding_Event → Signal |
| `grades` | Intelligence graded | Intelligence_Assessment → Signal |

---

## 4. Control State Evaluation — The Core Logic

### 4.1 Ten Control State Dimensions (from NIST CSF 2.0 + COBIT + TOGAF)

| Dimension | What It Measures | NIST Function | Possible States | Deviation = |
|---|---|---|---|---|
| Patch posture | Is this entity patched? | PR.PS | current / behind / critical_behind / unknown | Vulnerability or Drift case |
| Vulnerability exposure | Known exploitable weaknesses? | PR (via CTEM) | none_known / low / medium / high / critical | Vulnerability case |
| Monitoring coverage | Is this entity being watched? | DE.CM | full / partial / minimal / none | Coverage case |
| Response readiness | Can we respond if it's hit? | RS | ready / partial / not_ready | Coverage or Drift case |
| Recovery readiness | Can we recover? | RC | ready / partial / not_ready | Coverage case |
| Governance status | Is it governed? | GV | governed / partial / ungoverned | Drift case |
| Identity posture | Identities properly controlled? | PR.AC | MFA enforced / privilege levels / entitlements | Identity case |
| Configuration adherence | Config matches intended state? | COBIT | adherent / deviated / unknown | Drift case |
| Architecture adherence | Sits where it should? | TOGAF | correct_zone / misplaced / unknown | Architecture case |
| Coverage completeness | Tool coverage map | DE.CM (extended) | Per-tool boolean coverage | Coverage case |

### 4.2 Failure Type Classification

When a deviation is found, it is classified into one of these types:

| Failure Type | What Happened | Risk Object Type | Case Type | CTEM Phase |
|---|---|---|---|---|
| Configuration deviation | Was X, now Y (worse) | drift / configuration_drift | drift | discovery |
| Absence of coverage | Should be covered, isn't | coverage | coverage | discovery |
| Known vulnerability | Exploitable weakness exists | vulnerability / vulnerability_drift | vulnerability | discovery |
| Active exposure | Reachable from untrusted network | exposure / exposure_drift | exposure | discovery |
| Control degradation | Control weakened/missing | control_gap | drift or coverage | discovery |
| Architecture violation | Rule breached (wrong zone) | architecture | drift | discovery |
| Identity risk | Privilege excess, no MFA, stale | identity_risk | identity | discovery |
| Tool failure | Monitoring tool broken | tool_health | tool-health | discovery |
| Discovery gap | External signal refs unknown entity | coverage_blindspot | inverse-discovery | scoping |
| Behavioural pattern | Anomaly across verdicts | verdict_pattern | verdict-pattern | discovery |
| Policy ineffectiveness | Policy not working | policy_effectiveness | policy-effectiveness | discovery |
| Tempo degradation | System itself too slow | ooda_phase_degradation | ooda-tempo | N/A (internal) |

---

## 5. Risk Object Generation & Case Binding (Spec #29)

### 5.1 Universal Risk Object Contract

Every actionable finding MUST produce a Risk Object. No unbound findings. Per Spec #29:

| Field | Requirement |
|---|---|
| risk_object_id | Immutable identifier |
| risk_object_type | One of 22 enum values (see §5.2) |
| domain | Owning domain |
| source_systems[] | Which connectors contributed |
| affected_entities[] | Canonical entity references |
| case_binding_status | bound / linked_existing / suppressed / residual_accepted / allocation_error. NEVER: unbound |
| case_id | Required unless suppressed |
| sub_action_ids[] | When decomposition generates work |
| validation_state | Universal validation state (11 states per Spec #17) |
| routing_state | Universal routing state |
| priority_score | Computed priority (see §6) |
| closure_gate_state | Aggregate closure gate state |
| reopen_trigger_state | Aggregate reopening trigger state |
| mission_impact | Nullable mission impact assessment |
| fusion_map_refs[] | Node and edge references |

### 5.2 All Risk Object Types → Case Types

| Risk Object Type | Case Type Bound | Signal Category Source |
|---|---|---|
| drift | drift (1) | Cat 2 |
| configuration_drift | drift (1) | Cat 2 |
| vulnerability | vulnerability (2) | Cat 3 |
| vulnerability_drift | vulnerability (2) | Cat 3 |
| identity_risk | identity (3) | Cat 2, 5 |
| exposure | exposure (4) | Cat 3 |
| exposure_drift | exposure (4) | Cat 3 |
| coverage | coverage (5) | Cat 2, 7 |
| tool_health | tool-health (6) | Cat 7 |
| threat_intel_match | threat-intelligence-estate-match (7) | Cat 6 |
| external_attack_correlation | external-attack-correlation (8) | Cat 4 |
| verdict_pattern | verdict-pattern (9) | Cat 5 |
| coverage_blindspot | inverse-discovery-coverage-blindspot (10) | Cat 4, 6 |
| policy_effectiveness | policy-effectiveness (11) | Cat 5 |
| ooda_phase_degradation | ooda-tempo-degradation (12) | Cat 7 |
| control_gap | drift or coverage (1/5) | Cat 2 |
| policy_gap | policy-effectiveness (11) | Cat 2, 5 |
| blast_radius | (linked to parent case) | Cat 3, 4 |
| architecture | drift (1) | Cat 2 |
| trust_boundary | drift (1) | Cat 2 |
| security_debt | (linked to oldest unresolved) | System-generated |
| exception | (linked to exception policy) | Governance |

---

## 6. Prioritisation Framework (Spec #28 + Spec #74)

### 6.1 Priority Ladder

P0_ZERO_DAY > P1_CRITICAL > P2_HIGH > P3_MEDIUM > P4_LOW > P5_INFORMATIONAL

### 6.2 Five-Dimension Context Modulation (Spec #74)

Every finding's base severity is modulated by five contextual dimensions:

| Dimension | Question | Boost Factor | Source |
|---|---|---|---|
| Attack context | Has SOC reported attacks on this asset type? | Up to +30% | Cat 4 signals |
| Threat intelligence | Is there active exploitation in the wild? | Up to +40% (KEV = max) | Cat 6 signals |
| Verdict layer | Are verdicts firing on related entities? | Up to +20% | Cat 5 signals |
| Identity exposure | Is a privileged identity connected? | Up to +25% | Identity CHAIN model |
| Strategic priority | Does tenant have a priority covering this domain? | Up to +15% | Spec #28 tactical priorities |

Each dimension includes a DECAY function — boost reduces over time if context doesn't refresh.

### 6.3 P0 Zero-Day Automatic Trigger

KEV match + active exploitation + critical asset + production environment = automatic P0 overlay. P0 immediately drives: emergency SLA, routing escalation, validation cadence, communication cadence, dashboard prominence.

### 6.4 BAU Workload Protection

Strategic/tactical priorities CANNOT starve operational cases. Signals: unassigned critical cases, P1/P2 SLA breaches, aged cases, queue saturation. If BAU protection triggers → reduce priority boost or alert SOM.

---

## 7. CTEM Phase Assignment

Every case carries `ctem_phase` (per thesis Layer 6):

| CTEM Phase | Assigned When | Means |
|---|---|---|
| scoping | Threat intel signals arrive, estate relevance not yet confirmed | Determining what's in scope |
| discovery | Finding identified, entity affected known | Risk discovered |
| prioritization | Risk scored, context modulated, strategic alignment computed | Determining urgency |
| validation | Remediation executed, awaiting confirmation | Checking if fix worked |
| mobilization | Validated remediation deployed at scale | Scaling proven fix |

Case type → default CTEM phase at creation:

| Case Types 1-6 (operational) | Start at: discovery |
| Case Type 7 (threat-intel-match) | Start at: scoping |
| Case Type 8 (ext-attack) | Start at: discovery |
| Case Types 9-11 (pattern/effectiveness) | Start at: discovery |
| Case Type 10 (inverse-discovery) | Start at: scoping |
| Case Type 12 (ooda-tempo) | N/A (internal operational) |

---

## 8. Intelligence Layer Integration (Spec #59)

### 8.1 Four Streams

| Stream | Fed By | Connector Class | Produces |
|---|---|---|---|
| External Threat Intelligence | Threat feeds, CVE, KEV, advisories | D | Threat relevance scores, IOC matches |
| External Attack Intelligence | SOC cases, detections | A | Pre-warned classification, attack correlation |
| Internal Behavioural Intelligence | Verdicts, DLP, CA, MDM | B | Behavioural profiles, pattern cases |
| Posture Intelligence | Config state, Commander engines | C + internal | Posture scores, drift findings |

### 8.2 Six Cross-Stream Correlations

| Correlation | Joins | Output |
|---|---|---|
| Pre-Warned/Protected/Novel (Spec #71) | External Attack + Posture | Classification on every ext-attack case |
| Verdict Disagreement (Spec #62) | Internal Behavioural × Internal Behavioural | Policy Effectiveness case |
| Inverse Discovery (Spec #72) | Any stream + canonical estate | Coverage Blindspot case |
| Behavioural Anomaly | Internal Behavioural + Identity model | Verdict Pattern case |
| Threat Relevance | External Threat + Posture | Score 0-100, filter irrelevant |
| Silent Defence (Spec #73) | Internal Behavioural (aggregate) | Reporting only, no cases |

---

## 9. Commander AI Integration (Spec #13)

AI is ASSISTIVE, not AUTONOMOUS. AI does NOT create cases, close cases, or execute push.

| Pipeline Stage | AI Touchpoint | AI Mode |
|---|---|---|
| Post-normalisation | "Explain what this signal means for the estate" | Estate awareness |
| Post-case-creation | "Summarise this case for the assigned team" | Engineering support |
| Verdict patterns | "Explain this behavioural anomaly" | Architectural advisory |
| Threat relevance | "Assess whether this threat affects our technology" | Threat triage |
| Post-push-intent | "Explain what this remediation will do" | Engineering support |
| Communication | "Draft notification for asset owner" | Communication drafting |

AI grounding rules: only Commander data context packs. No raw secrets. No unvalidated claims. Every invocation creates a Commander Execution Record with audit trail.

BYOM: Customer brings OpenAI/Anthropic key. Seiertech routes via orchestration override table (invisible to tenant). Customer sees "Commander AI."

---

## 10. Governance Model

### 10.1 Two-Tier Authority (unchanged from v1)

**Control Plane (Seiertech):** Defines connectors, event types, workflows, permitted modes, entitlement gating.  
**Tenant Admin (Customer):** Configures credentials, chooses execution mode (within permitted), assigns approval roles.

### 10.2 Connector Mapping Packs (Spec #12 §8)

Each connector adapter includes:

| Component | Purpose |
|---|---|
| Source endpoint | API route being called |
| Source fields | What the vendor returns |
| Canonical target | Which Commander entity + field |
| Transform rule | How to convert |
| Authority class | Primary / Enrichment / Correlation / Validation / Fallback |
| Signal category | Which of 7 categories each record belongs to |
| Failure behaviour | What happens if transform fails |
| Sample payload | Example for testing |
| Contract tests | Automated validation |

---

## 11. Execution Modes (Three Paths)

| Mode | System Does | Human Does | Sub-Action State | Validation |
|---|---|---|---|---|
| **AUTOPILOT** | Execute push | Nothing (audit shows what happened) | PENDING_EXECUTION → VALIDATED | Next pull confirms |
| **HUMAN CONFIRMATION** | Propose in UI | Reviews → approves/rejects | PENDING_APPROVAL → PENDING_EXECUTION | Next pull confirms |
| **ALWAYS MANUAL** | Show instruction | Performs action in target system | EVIDENCE_REQUIRED → IN_PROGRESS | Next pull detects change |

Sub-action lifecycle (14 states per Spec #17): GENERATED → ROUTED → OWNER_NOTIFIED → EVIDENCE_REQUIRED → IN_PROGRESS → PENDING_APPROVAL → PENDING_EXECUTION → PENDING_VALIDATION → VALIDATED → CLOSED_BY_SYSTEM (or FAILED/SUPPRESSED/RESIDUAL/REOPENED)

Closure gates (12 per Spec #17): technical validation + sub-action completion + communication + SIR acknowledgement + SLA + evidence freshness + approval + audit completeness + mission-impact + fusion-map refresh + exception/suppression + external notifier.

---

## 12. Normalisation Depth (Spec #05, #12)

### 12.1 Source Authority Types

| Type | Meaning | Can Overwrite? |
|---|---|---|
| Primary Authority | Authoritative for a data domain | Yes — overwrites all others |
| Enrichment Source | Adds context | No — cannot override Primary |
| Correlation Source | Linking/pattern signals only | No — reference only |
| Validation Source | Confirms post-action state | No — evidence only |
| Fallback Source | Used when Primary unavailable | Yes — flagged as fallback |

### 12.2 Entity Matching

**Asset matching signals:** cloud_resource_id, EDR_host_id, scanner_asset_id, hostname, FQDN, MAC, IP, serial_number, instance_id, tags, ownership, network_relationships

**Identity matching signals:** Entra_object_id, UPN, email, employee_id, service_principal_id, AWS/GCP_ARN, group_membership

**Confidence bands:**
- >= auto_merge_threshold → merge automatically
- review_low <= score < auto_merge → matching review queue
- < review_low → create separate entity

**Immutable barriers:** Server cannot merge with workstation. Human cannot merge with service-account.

**Reversal:** Every merge must store a reversal payload. Every merge is reversible.

---

## 13. System Load & Scheduling (Spec #06, #16)

### 13.1 Five-Tier Ingestion

| Tier | Cadence | Purpose | Examples |
|---|---|---|---|
| 1 | 5-15 min | Critical posture/health | EDR heartbeat, connector health |
| 2 | 1-4 hours | Regular state evaluation | Config drift, identity changes |
| 3 | Daily/maintenance | Heavy inventory | Full asset sync, vuln scan results |
| 4 | Weekly/monthly | Deep analytics | Architecture sweep, maturity assessment |
| 5 | On event | Webhook/event-triggered | Inbound email, IOC push, STIX feed |

### 13.2 Queue Architecture

| Queue | Purpose | Tier |
|---|---|---|
| ingestion.pull | Connector pull execution | 1-5 |
| normalisation.process | Raw → canonical | Immediate |
| evaluation.control_state | Evaluate ALL dimensions | Immediate |
| risk_object.generate | Create risk objects | Immediate |
| case.bind | Bind risk object to case | Immediate |
| prioritisation.compute | 5-dimension context modulation | Immediate |
| intelligence.correlate | Cross-stream correlations | Near-real-time |
| push.intent | Create push action intent | On case action_decomposed |
| push.governance | Dry-run + conflict detection | On intent |
| push.execute | Outbound API call (Phase 2) | On approval |
| push.validate | Check next pull for confirmation | On next pull |
| notification.send | Inform user of pending actions | On intent |
| audit.emit | Audit trail | All stages |

### 13.3 Backpressure & Rate Limiting

Same as v1 — per-tenant caps, per-connector limits, per-provider aggregation, priority queues, backpressure triggers pause Tier 3/4 first.

---

## 14. Self-Measurement (COBIT, CMMI, DORA, DMAIC)

The CRAW Engine measures its OWN operational health:

| Framework | What It Measures About the Engine | Entity |
|---|---|---|
| DORA | Deployment frequency, lead time, change failure rate, time to restore | Delivery_Performance |
| CMMI | Process maturity of ingestion/normalisation/case-binding | Process_Maturity |
| COBIT 2019 | Governance capability, control coverage of the engine itself | Governance_Capability |
| DMAIC | Continuous improvement cycle on engine performance | Improvement_Program |
| OODA | Tempo from signal arrival → case creation → remediation → validation | Case_Management_Metric |
| ITIL 4 | Capacity, demand, backlog, assignment quality | Case_Capacity/Demand/Backlog/Assignment models |

---

## 15. Architecture Intelligence & Tool Intelligence

### 15.1 Architecture Intelligence (Spec #22)

Every topology/config signal feeds the Architecture Intelligence Engine:
- Anti-pattern library (graph-based rules)
- Intended vs actual state comparison
- Architecture finding model with scoring
- Debt integration (unresolved architecture findings → security_debt risk objects)
- Asset rationalisation: duplicate, orphaned, ghost, stale, conflicting, misclassified assets detected

### 15.2 Tool Intelligence (Spec #23)

Every connector health signal feeds the Security Tool Intelligence Engine:
- Tool value scoring: unique data contribution, coverage dependency, automation capability, validation capability, utilisation, health reliability
- Overlap matrix: which tools cover the same assets?
- Removal impact simulation: what happens if we decommission this tool?
- Console utilisation tracking: is the tool being used effectively?

---

## 16. Identity Intelligence (Spec #18)

Every identity-related signal feeds the Unified Identity Architecture:
- Identity graph model (nodes: identities, groups, roles, applications; edges: membership, access, privilege)
- CHAIN computation (3 stages): immediate privilege → group expansion → transitive access
- Identity risk inputs: verdict density, privilege level, auth strength, stale state, blast radius
- Risk score composition: weighted combination of all inputs
- Verdict Pattern case generation: peer-deviation, temporal, geographic, policy-concentration patterns

---

## 17. Connector Lifecycle (Spec #09)

Full state machine:

```
CONTROL PLANE: registered → enabled → entitled
TENANT ADMIN:  configured → authenticated → scheduled
OPERATIONAL:   ingesting → normalising → emitting → health_evaluated
                                                    ├─ healthy
                                                    ├─ degraded → Tool Health case
                                                    ├─ error → Tool Health case
                                                    └─ retired (preserves lineage)
```

Health signals: liveness, freshness, error rate, throughput, authority resolution state, schema drift detection.

---

## 18. Relationship to Existing Code

| Existing Component | CRAW Engine Relationship |
|---|---|
| `normalisation-layer.ts` (5 functions) | Called by orchestrator at stages 3-6 |
| `intelligence-layer.ts` (4 streams + EIP + 6 correlations) | Called at stage 13-14 |
| `push-governance-engine.ts` (simulate + conflict + impact) | Called at stage 17 |
| `ingestion-pipeline.ts` (IOC-specific) | Pattern to generalise for all signal types |
| `correlation-engine.ts` (CVE dedup, temporal clustering, blast-radius) | Called at stage 14 |
| `adherence-enrichment.ts` (CVE/KEV/IOC → ControlEvaluation) | Called at stage 7 |
| `risk-object.ts` entity (RiskObjectType enum, COIM-A classification) | Created at stage 9 |
| `case.ts` (12 types, 12 states) | Created at stage 10 |
| `signal.ts` (OCSF-aligned) | Created at stage 2 |
| `connector.ts` (state machine) | Managed by lifecycle (§17) |
| `asset.ts` (ISO 19770 + COIM-F) | Enriched at stage 5 |
| `identity.ts` (COIM-F augmentation) | Enriched at stage 5 |

---

## 19. Build Sequence

| Phase | Deliverable | Dependencies |
|---|---|---|
| **1a** | CRAW Engine contracts (all §5 entities + enums) | None |
| **1b** | Signal classification + entity enrichment orchestrator | 1a |
| **1c** | Control state evaluation engine (10 dimensions) | 1b |
| **1d** | Risk object generation + case binding | 1c |
| **1e** | Prioritisation (5-dimension context modulation) | 1d |
| **1f** | Execution mode routing + approval surface | 1e |
| **2a** | First live connector adapter (CrowdStrike) | 1b |
| **2b** | First live push adapter | 1f |
| **2c** | Validation loop wired to live pulls | 2a + 2b |
| **3** | Scale to 19+ connectors | 2c proven |

---

## 20. Decision Log

| Decision | Rationale | Date |
|---|---|---|
| Core principle is "control state evaluation" not "drift detection" | Drift is one of 12+ failure types. System must evaluate ALL dimensions. | 2026-06-13 |
| Every signal enriches first, evaluates second | Most signals confirm "still fine" — enrichment is the primary job | 2026-06-13 |
| Seven signal categories with distinct downstream paths | One connector produces multiple categories simultaneously | 2026-06-13 |
| Risk Object MUST bind to case (Spec #29) | No unbound findings. System-owned lifecycle. | 2026-06-13 |
| CTEM phase on every case | Cases progress through exposure management lifecycle | 2026-06-13 |
| 5-dimension context modulation with decay | Priority is dynamic, not static. Context changes priority. | 2026-06-13 |
| AI is assistive at 6 pipeline touchpoints | System-First Doctrine: ~87% system, ~4% AI-only, ~9% AI-enhanced | 2026-06-13 |
| Engine self-measures via DORA/CMMI/COBIT/DMAIC | Governance applies to the engine itself, not just what it governs | 2026-06-13 |
| Connector mapping packs per adapter | Each connector declares how its data maps to canonical model | 2026-06-13 |

---

**Next step:** Build Phase 1a — typed contracts for ConnectorDefinition, ConnectorInstance, EventTypeDefinition, RemediationWorkflowTemplate, TenantWorkflowConfig, and the CRAWOrchestrator interface.
