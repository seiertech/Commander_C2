# USE CASE REGISTER — Commander C2

**Purpose:** Behavioural specification for every UI page. Every page has at least one use case. Every use case references its backing entities. Every entity referenced must exist in the DATA_DICTIONARY.

**Rule:** No page exists without a use case entry here. No use case references an entity not in the data dictionary.

---

## How To Read This Register

Each use case entry contains:

| Field | Meaning |
|---|---|
| UC-ID | Unique use case identifier |
| Title | Human-readable name |
| Actor | Who performs this (RBAC role) |
| Trigger | What starts the use case |
| Precondition | What must be true before |
| Main Flow | Numbered steps |
| Postcondition | What is true after success |
| UI Page(s) | Route(s) that serve this use case |
| Entities Consumed | Thesis entities read/written |
| Standards Referenced | Which standards govern this behaviour |
| Layer | Thesis layer (L1-L11) |

---

## Layer 2: Architecture Classification & Topology

### UC-ARCH-001: View Architecture Topology

| Field | Value |
|---|---|
| UC-ID | UC-ARCH-001 |
| Title | View Architecture Topology |
| Actor | Security Architect, CISO |
| Trigger | Navigate to /architecture |
| Precondition | Topology_Node and Topology_Edge records exist |
| Main Flow | 1. System loads topology graph for tenant. 2. Displays nodes (assets) with architectural_zone labels. 3. Displays edges with relationship_type and dependency_strength. 4. User can filter by togaf_domain or topology_type. |
| Postcondition | User sees complete architecture topology |
| UI Page(s) | `/architecture`, `/architecture/dependencies` |
| Entities Consumed | Architecture_Classification, Topology_Node, Topology_Edge |
| Standards Referenced | TOGAF, Zachman |
| Layer | L2 |

### UC-ARCH-002: View Architecture Drift

| Field | Value |
|---|---|
| UC-ID | UC-ARCH-002 |
| Title | View Architecture Drift |
| Actor | Security Architect |
| Trigger | Navigate to /architecture/drift |
| Precondition | Architecture_Classification records exist with drift findings |
| Main Flow | 1. System loads architecture components. 2. Compares current state to baseline. 3. Displays drift indicators by togaf_domain and zachman_aspect. |
| Postcondition | User sees which architecture components have drifted from baseline |
| UI Page(s) | `/architecture/drift` |
| Entities Consumed | Architecture_Classification, Finding_Event |
| Standards Referenced | TOGAF, Zachman |
| Layer | L2 |

---

## Layer 3: Event & Intelligence

### UC-INTEL-001: View Intelligence Confidence Grading

| Field | Value |
|---|---|
| UC-ID | UC-INTEL-001 |
| Title | View Intelligence Confidence Grading |
| Actor | Security Analyst, Intelligence Analyst |
| Trigger | Navigate to intelligence confidence view |
| Precondition | Intelligence_Assessment records exist |
| Main Flow | 1. System loads signals with intelligence assessments. 2. Displays source_reliability (A-F) and information_credibility (1-6). 3. User can filter by combined_rating. 4. Shows distribution of confidence grades across active signals. |
| Postcondition | User sees confidence distribution and can identify low-confidence signals |
| UI Page(s) | `/operating-picture/external` |
| Entities Consumed | Signal, Intelligence_Assessment |
| Standards Referenced | NATO/Admiralty |
| Layer | L3 |

### UC-INTEL-002: View Normalised Signals

| Field | Value |
|---|---|
| UC-ID | UC-INTEL-002 |
| Title | View Normalised Signals |
| Actor | Security Analyst |
| Trigger | Navigate to operating picture |
| Precondition | Signal records exist |
| Main Flow | 1. System loads recent signals. 2. Displays ocsf_category, ocsf_class, severity, time_observed. 3. Shows asset_resolution_status for each signal. 4. User can drill into normalized_payload. |
| Postcondition | User sees stream of normalised events with OCSF classification |
| UI Page(s) | `/operating-picture/internal`, `/operating-picture/external` |
| Entities Consumed | Signal, Finding_Event |
| Standards Referenced | OCSF |
| Layer | L3 |

---

## Layer 4: Asset Authority

### UC-ASSET-001: View Asset Inventory

| Field | Value |
|---|---|
| UC-ID | UC-ASSET-001 |
| Title | View Asset Inventory |
| Actor | Security Analyst, Asset Manager |
| Trigger | Navigate to /assets |
| Precondition | Asset records exist |
| Main Flow | 1. System loads authoritative asset list. 2. Displays asset_name, asset_class, lifecycle_state, environment, owner. 3. User can filter by lifecycle_state, environment, asset_class. 4. User can drill into individual asset detail. |
| Postcondition | User sees full authoritative asset inventory |
| UI Page(s) | `/assets` |
| Entities Consumed | Asset |
| Standards Referenced | ISO/IEC 19770-1:2017 |
| Layer | L4 |

### UC-ASSET-002: View Asset Classification

| Field | Value |
|---|---|
| UC-ID | UC-ASSET-002 |
| Title | View Asset Classification |
| Actor | Security Analyst, Risk Analyst |
| Trigger | Navigate to /assets/classification |
| Precondition | Asset_Classification records exist |
| Main Flow | 1. System loads classifications for all assets. 2. Displays criticality, data_classification, exposure_type, mission_impact. 3. User can sort/filter by criticality or risk_weighting. |
| Postcondition | User sees business-context classification of all assets |
| UI Page(s) | `/assets/classification` |
| Entities Consumed | Asset, Asset_Classification |
| Standards Referenced | NIST CSF 2.0 (ID.AM-05), CTEM |
| Layer | L4/L5 |

### UC-ASSET-003: View Asset Ownership

| Field | Value |
|---|---|
| UC-ID | UC-ASSET-003 |
| Title | View Asset Ownership |
| Actor | Asset Manager, CISO |
| Trigger | Navigate to /assets/ownership |
| Precondition | Asset records with owner field exist |
| Main Flow | 1. System loads assets grouped by owner. 2. Displays ownership distribution. 3. Highlights unowned or disputed assets. |
| Postcondition | User sees ownership distribution and gaps |
| UI Page(s) | `/assets/ownership` |
| Entities Consumed | Asset |
| Standards Referenced | ISO/IEC 19770-1:2017 |
| Layer | L4 |

---

## Layer 5: Asset Classification & Security Posture

### UC-POSTURE-001: View Asset Security Posture

| Field | Value |
|---|---|
| UC-ID | UC-POSTURE-001 |
| Title | View Asset Security Posture |
| Actor | Security Analyst, CISO |
| Trigger | Navigate to /posture |
| Precondition | Asset_Security_Posture records exist |
| Main Flow | 1. System loads posture records per asset. 2. Displays posture_score, posture_status, patch_status, vulnerability_exposure. 3. Shows monitoring_coverage, response_readiness, recovery_readiness, governance_status. 4. User can filter by posture_status or NIST function. |
| Postcondition | User sees per-asset security posture across all NIST CSF dimensions |
| UI Page(s) | `/posture`, `/som/cloud-security` |
| Entities Consumed | Asset_Security_Posture, Posture_Dimension, Asset |
| Standards Referenced | NIST CSF 2.0 |
| Layer | L5 |

### UC-POSTURE-002: View Posture Dimensions (NIST Function Drill-Down)

| Field | Value |
|---|---|
| UC-ID | UC-POSTURE-002 |
| Title | View Posture Dimensions |
| Actor | Security Analyst |
| Trigger | Drill into asset posture detail |
| Precondition | Posture_Dimension records exist for asset |
| Main Flow | 1. System loads posture dimensions for selected asset. 2. Displays per-NIST-function breakdown: GV, ID, PR, DE, RS, RC. 3. Shows dimension_state, dimension_score, evidence_source per function. |
| Postcondition | User sees granular posture breakdown by NIST CSF function |
| UI Page(s) | `/posture` (drill-down) |
| Entities Consumed | Posture_Dimension |
| Standards Referenced | NIST CSF 2.0 |
| Layer | L5 |

---

## Layer 7: Case & Remediation Workflow

### UC-CASE-001: View Case Queue

| Field | Value |
|---|---|
| UC-ID | UC-CASE-001 |
| Title | View Case Queue |
| Actor | Security Analyst, SOM |
| Trigger | Navigate to /cases |
| Precondition | Case records exist |
| Main Flow | 1. System loads open cases. 2. Displays case_type, priority_level, status, itil_stage, ooda_state, ctem_phase. 3. User can filter by status, priority, owner_team. 4. Inline expansion shows case detail (Pattern A — no split screen). |
| Postcondition | User sees prioritised case queue with lifecycle context |
| UI Page(s) | `/cases` |
| Entities Consumed | Case |
| Standards Referenced | ITIL 4, OODA, CTEM |
| Layer | L7 |

### UC-CASE-002: View Case Detail

| Field | Value |
|---|---|
| UC-ID | UC-CASE-002 |
| Title | View Case Detail |
| Actor | Security Analyst |
| Trigger | Navigate to /cases/[id] |
| Precondition | Case record exists |
| Main Flow | 1. System loads full case detail. 2. Displays all case fields including related_signal_id, related_asset_id. 3. Shows Remediation_Workflow with actions. 4. Shows itil_stage progression and ooda_state. 5. Shows ctem_phase context. |
| Postcondition | User sees complete case context with workflow and lifecycle |
| UI Page(s) | `/cases/[id]` |
| Entities Consumed | Case, Remediation_Workflow, Remediation_Action, Signal, Asset |
| Standards Referenced | ITIL 4, OODA, CTEM |
| Layer | L7 |

### UC-CASE-003: View Case Analytics

| Field | Value |
|---|---|
| UC-ID | UC-CASE-003 |
| Title | View Case Analytics |
| Actor | SOM, CISO |
| Trigger | Navigate to /cases/analytics |
| Precondition | Case_Management_Metric records exist |
| Main Flow | 1. System loads case metrics. 2. Displays MTTA, MTTR, throughput, backlog, WIP, SLA adherence. 3. Shows reopen rate, escalation rate, first-touch resolution. 4. User can filter by period, team, case_type. |
| Postcondition | User sees operational case management performance |
| UI Page(s) | `/cases/analytics` |
| Entities Consumed | Case_Management_Metric, Case_Backlog_State |
| Standards Referenced | ITIL 4, Queueing Theory, Little's Law |
| Layer | L7/L8 |

### UC-CASE-004: View My Cases

| Field | Value |
|---|---|
| UC-ID | UC-CASE-004 |
| Title | View My Cases |
| Actor | Security Analyst |
| Trigger | Navigate to /cases/my |
| Precondition | Cases assigned to current user exist |
| Main Flow | 1. System filters cases by current user's assignment. 2. Displays personal queue with priority, status, SLA countdown. |
| Postcondition | User sees their personal workload |
| UI Page(s) | `/cases/my` |
| Entities Consumed | Case, Case_Assignment_Model |
| Standards Referenced | ITIL 4 |
| Layer | L7 |

---

## Layer 8: Capacity, Maturity, Performance & Improvement

### UC-CAP-001: View Team Capacity

| Field | Value |
|---|---|
| UC-ID | UC-CAP-001 |
| Title | View Team Capacity |
| Actor | SOM, CISO |
| Trigger | Navigate to /team-pulse/workload |
| Precondition | Case_Capacity_Model records exist |
| Main Flow | 1. System loads capacity models per team. 2. Displays resource_count, avg_case_handling_rate, total_capacity_per_week. 3. Overlays demand (Case_Demand_Model) against capacity. 4. Highlights teams where demand exceeds capacity. |
| Postcondition | User sees capacity vs demand per team |
| UI Page(s) | `/team-pulse/workload` |
| Entities Consumed | Case_Capacity_Model, Case_Demand_Model, Case_Backlog_State |
| Standards Referenced | ITIL 4, Queueing Theory, Little's Law |
| Layer | L8 |

### UC-CAP-002: View Process Maturity

| Field | Value |
|---|---|
| UC-ID | UC-CAP-002 |
| Title | View Process Maturity |
| Actor | CISO, SOM |
| Trigger | Navigate to /som/security-operations |
| Precondition | Process_Maturity records exist |
| Main Flow | 1. System loads maturity assessments. 2. Displays process_name, maturity_level (1-5), assessment_date. 3. Shows improvement_plan where defined. 4. User can compare across processes. |
| Postcondition | User sees CMMI maturity landscape |
| UI Page(s) | `/som/security-operations` |
| Entities Consumed | Process_Maturity |
| Standards Referenced | CMMI |
| Layer | L8 |

### UC-CAP-003: View Delivery Performance (DORA)

| Field | Value |
|---|---|
| UC-ID | UC-CAP-003 |
| Title | View Delivery Performance |
| Actor | SOM, CISO |
| Trigger | Navigate to /system-pulse/engine |
| Precondition | Delivery_Performance records exist |
| Main Flow | 1. System loads DORA metrics. 2. Displays deployment_frequency, lead_time, change_failure_rate, time_to_restore. 3. Shows trends over measurement_period. |
| Postcondition | User sees operational delivery performance metrics |
| UI Page(s) | `/system-pulse/engine` |
| Entities Consumed | Delivery_Performance |
| Standards Referenced | DORA |
| Layer | L8 |

---

## Layer 9: Mission & Strategic Portfolio

### UC-MISSION-001: View Mission Portfolio

| Field | Value |
|---|---|
| UC-ID | UC-MISSION-001 |
| Title | View Mission Portfolio |
| Actor | CISO, SOM |
| Trigger | Navigate to /mission/overview |
| Precondition | Mission records exist |
| Main Flow | 1. System loads active missions. 2. Displays mission_name, capability_domain, delta_score, priority_score, status. 3. Shows current_state_score vs target_state_score visually. 4. User can sort by delta_score or risk_reduction_value. |
| Postcondition | User sees strategic mission portfolio with delta scoring |
| UI Page(s) | `/mission/overview` |
| Entities Consumed | Mission, Mission_Indicator |
| Standards Referenced | CBP, OKR |
| Layer | L9 |

### UC-MISSION-002: View Mission Objectives

| Field | Value |
|---|---|
| UC-ID | UC-MISSION-002 |
| Title | View Mission Objectives |
| Actor | CISO |
| Trigger | Navigate to /mission/objectives |
| Precondition | Mission_Indicator records exist |
| Main Flow | 1. System loads indicators for selected mission. 2. Displays metric_name, current_value, target_value, delta per indicator. 3. Shows confidence grade (1-6) per indicator. 4. Shows linked cases via Mission_Case_Link. |
| Postcondition | User sees measurable progress toward mission objectives |
| UI Page(s) | `/mission/objectives` |
| Entities Consumed | Mission, Mission_Indicator, Mission_Case_Link, Case |
| Standards Referenced | CBP, OKR, NATO/Admiralty |
| Layer | L9 |

### UC-MISSION-003: View Mission Impact

| Field | Value |
|---|---|
| UC-ID | UC-MISSION-003 |
| Title | View Mission Impact |
| Actor | CISO |
| Trigger | Navigate to /mission/impact |
| Precondition | Mission records with risk_reduction_value exist |
| Main Flow | 1. System loads missions with impact data. 2. Displays risk_reduction_value, impact_weighting per mission. 3. Shows aggregate risk reduction across portfolio. |
| Postcondition | User sees strategic risk reduction impact of mission portfolio |
| UI Page(s) | `/mission/impact` |
| Entities Consumed | Mission, Risk_Snapshot |
| Standards Referenced | CBP, ISO 27005 |
| Layer | L9/L10 |

---

## Layer 10: Risk, Control & Adherence

### UC-RISK-001: View Risk Posture

| Field | Value |
|---|---|
| UC-ID | UC-RISK-001 |
| Title | View Risk Posture |
| Actor | CISO, Risk Analyst |
| Trigger | Navigate to /som/risk |
| Precondition | Risk_Snapshot records exist |
| Main Flow | 1. System loads latest risk snapshots. 2. Displays inherent_risk, current_risk, residual_risk per asset. 3. Shows sla_status and risk_reason. 4. User can filter by risk band. |
| Postcondition | User sees current risk landscape |
| UI Page(s) | `/som/risk` |
| Entities Consumed | Risk_Snapshot, Asset |
| Standards Referenced | ISO 27005, ITIL |
| Layer | L10 |

### UC-CTRL-001: View Control Framework Adherence

| Field | Value |
|---|---|
| UC-ID | UC-CTRL-001 |
| Title | View Control Framework Adherence |
| Actor | Risk/Adherence/Audit |
| Trigger | Navigate to /controls |
| Precondition | Control_Reference and Control_State records exist |
| Main Flow | 1. System loads control references by framework. 2. Displays effectiveness_state, validation_state, last_verified per control. 3. Shows aggregate adherence percentage per framework. 4. User can drill into individual control evidence. |
| Postcondition | User sees control effectiveness across frameworks |
| UI Page(s) | `/controls`, `/controls/frameworks` |
| Entities Consumed | Control_Reference, Control_State, Adherence_Assertion |
| Standards Referenced | NIST CSF, ISO 27001, COBIT |
| Layer | L10 |

### UC-GOV-001: View Governance Decisions

| Field | Value |
|---|---|
| UC-ID | UC-GOV-001 |
| Title | View Governance Decisions |
| Actor | CISO, Risk/Adherence/Audit |
| Trigger | Navigate to /governance/decisions |
| Precondition | Adherence_Assertion records exist |
| Main Flow | 1. System loads adherence assertions. 2. Displays assertion_status, attested_by, attested_time per standard. 3. User can filter by standard_name or assertion_status. |
| Postcondition | User sees formal adherence attestation history |
| UI Page(s) | `/governance/decisions`, `/governance/policies` |
| Entities Consumed | Adherence_Assertion, Control_Reference |
| Standards Referenced | ISO 27001, COBIT |
| Layer | L10 |

---

## Layer 11: Reporting & Analytics

### UC-RPT-001: View Executive Risk Report (CISO Pack)

| Field | Value |
|---|---|
| UC-ID | UC-RPT-001 |
| Title | View Executive Risk Report |
| Actor | CISO |
| Trigger | Navigate to /ciso or /reporting/ciso-pack |
| Precondition | Mission, Risk_Snapshot, Case_Management_Metric, Asset_Security_Posture records exist |
| Main Flow | 1. System aggregates: mission deltas, risk posture, case metrics, posture trends. 2. Displays executive dashboard with high-level KPIs. 3. Shows overdue strategic work, top-risk assets, portfolio progress. |
| Postcondition | CISO sees strategic operational state in one view |
| UI Page(s) | `/ciso`, `/reporting/ciso-pack` |
| Entities Consumed | Mission, Risk_Snapshot, Case_Management_Metric, Asset_Security_Posture |
| Standards Referenced | NIST CSF, CBP, ISO 27005 |
| Layer | L11 |

### UC-RPT-002: View SLA & Team Performance

| Field | Value |
|---|---|
| UC-ID | UC-RPT-002 |
| Title | View SLA & Team Performance |
| Actor | SOM |
| Trigger | Navigate to /team-pulse/sla |
| Precondition | Case_Management_Metric records exist |
| Main Flow | 1. System loads SLA adherence metrics. 2. Displays per-team SLA hit rate, escalation rate. 3. Shows capacity utilisation overlay. |
| Postcondition | SOM sees operational team performance |
| UI Page(s) | `/team-pulse/sla`, `/team-pulse/escalation` |
| Entities Consumed | Case_Management_Metric, Case_Capacity_Model |
| Standards Referenced | ITIL 4 |
| Layer | L11 |

---

## Commander Platform Extensions (Use Cases)

### UC-TENANT-001: Configure Tenant Settings

| Field | Value |
|---|---|
| UC-ID | UC-TENANT-001 |
| Title | Configure Tenant Settings |
| Actor | Tenant Admin |
| Trigger | Navigate to /tenant-admin |
| Precondition | User has Tenant Admin role |
| Main Flow | 1. System loads tenant configuration. 2. Displays branding, feature toggles, connector status, user list, RBAC roles. 3. Admin can modify settings. |
| Postcondition | Tenant configuration updated |
| UI Page(s) | `/tenant-admin` |
| Entities Consumed | Tenant_Config, RBAC_Policy, Connector, Feature_Registry |
| Standards Referenced | Commander Platform |
| Layer | Platform |

### UC-TENANT-002: Manage Users & RBAC

| Field | Value |
|---|---|
| UC-ID | UC-TENANT-002 |
| Title | Manage Users & RBAC |
| Actor | Tenant Admin |
| Trigger | Navigate to /settings/users-rbac |
| Precondition | User has Tenant Admin role |
| Main Flow | 1. System loads user list and role assignments. 2. Admin can invite users, assign roles, modify permissions. 3. System enforces RBAC_Policy constraints. |
| Postcondition | User roles and permissions updated |
| UI Page(s) | `/settings/users-rbac` |
| Entities Consumed | RBAC_Policy, Auth_Session |
| Standards Referenced | Commander Platform |
| Layer | Platform |

### UC-CONN-001: Manage Connectors

| Field | Value |
|---|---|
| UC-ID | UC-CONN-001 |
| Title | Manage Connectors |
| Actor | Tenant Admin, Platform Admin |
| Trigger | Navigate to /settings/connectors or /platform/connectors |
| Precondition | User has appropriate admin role |
| Main Flow | 1. System loads connector list with status. 2. Admin can enable/disable connectors. 3. Shows health, last_pull, signal count per connector. |
| Postcondition | Connector configuration updated |
| UI Page(s) | `/settings/connectors`, `/platform/connectors`, `/tool-health/connectors` |
| Entities Consumed | Connector |
| Standards Referenced | Commander Platform |
| Layer | Platform |

### UC-WAR-001: View P0 War Room

| Field | Value |
|---|---|
| UC-ID | UC-WAR-001 |
| Title | View P0 War Room |
| Actor | SOM, Security Analyst, CISO |
| Trigger | Navigate to /war-room/p0 |
| Precondition | War_Room record in active status exists |
| Main Flow | 1. System loads active war room. 2. Displays members, communication cadence, subscriptions. 3. Shows linked P0 case with timeline. 4. AI orientation state visible. |
| Postcondition | User sees active P0 coordination context |
| UI Page(s) | `/war-room/p0` |
| Entities Consumed | War_Room, Case |
| Standards Referenced | Commander Platform |
| Layer | Platform |

---

## Register Statistics

| Metric | Count |
|---|---|
| Total use cases | 22 |
| Thesis-governed use cases | 18 |
| Platform extension use cases | 4 |
| Thesis layers covered | L2, L3, L4, L5, L7, L8, L9, L10, L11 |
| Pages covered | 35+ |

**Note:** Additional use cases will be added as UI pages are updated during the per-layer UI pass. This register grows with each layer completion.

---

**Last Updated:** 2026-06-10
