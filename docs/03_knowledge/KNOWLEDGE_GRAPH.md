# KNOWLEDGE GRAPH — Commander C2

**Purpose:** Master relationship map. Every entity-to-entity reference, entity-to-standard binding, entity-to-page consumption, and entity-to-use-case linkage is recorded here.

**Rule:** If an entity references another entity's ID, that relationship MUST be here. If a page consumes an entity, that MUST be here. Governance runner CHECK-010 validates entity count matches.

---

## 1. Entity → Entity Relationships

### Layer 2: Architecture

| Source Entity | Target Entity | Relationship | Cardinality |
|---|---|---|---|
| Topology_Node | Asset | `references` (asset_id) | N:1 |
| Topology_Edge | Topology_Node | `connects` (source_node_id) | N:1 |
| Topology_Edge | Topology_Node | `connects` (target_node_id) | N:1 |

### Layer 3: Event & Intelligence

| Source Entity | Target Entity | Relationship | Cardinality |
|---|---|---|---|
| Finding_Event | Signal | `interprets` (signal_id) | N:1 |
| Intelligence_Assessment | Signal | `grades` (signal_id) | N:1 |
| Remediation_Event | Case | `reports_outcome_for` (related_case_id) | N:1 |
| Remediation_Event | Remediation_Action | `produced_by` (related_action_id) | N:1 |

### Layer 4: Asset Authority

| Source Entity | Target Entity | Relationship | Cardinality |
|---|---|---|---|
| Software_Instance | Asset | `installed_on` (asset_id) | N:1 |
| Asset_Service_Map | Asset | `maps` (asset_id) | N:1 |
| Asset_Service_Map | Service | `maps` (service_id) | N:1 |

### Layer 5: Classification & Posture

| Source Entity | Target Entity | Relationship | Cardinality |
|---|---|---|---|
| Asset_Classification | Asset | `classifies` (asset_id) | 1:1 |
| Asset_Security_Posture | Asset | `assesses` (asset_id) | N:1 |
| Posture_Dimension | Asset_Security_Posture | `dimension_of` (posture_id) | N:1 |

### Layer 7: Case & Remediation

| Source Entity | Target Entity | Relationship | Cardinality |
|---|---|---|---|
| Case | Signal | `originated_from` (related_signal_id) | N:1 |
| Case | Asset | `affects` (related_asset_id) | N:1 |
| Remediation_Workflow | Case | `executes_for` (case_id) | N:1 |
| Remediation_Action | Remediation_Workflow | `step_in` (workflow_id) | N:1 |

### Layer 8: Capacity & Performance

| Source Entity | Target Entity | Relationship | Cardinality |
|---|---|---|---|
| Case_Assignment_Model | Case | `assigns` (case_id) | 1:1 |

### Layer 9: Mission & Portfolio

| Source Entity | Target Entity | Relationship | Cardinality |
|---|---|---|---|
| Mission_Indicator | Mission | `measures` (mission_id) | N:1 |
| Mission_Case_Link | Mission | `contributes_to` (mission_id) | N:1 |
| Mission_Case_Link | Case | `contributed_by` (case_id) | N:1 |

### Layer 10: Risk, Control & Adherence

| Source Entity | Target Entity | Relationship | Cardinality |
|---|---|---|---|
| Risk_Snapshot | Asset | `assesses_risk_for` (asset_id) | N:1 |
| Risk_Snapshot | Case | `related_to` (case_id) | N:1 |
| Control_State | Asset | `evaluates` (asset_id) | N:1 |
| Control_State | Control_Reference | `instance_of` (control_reference_id) | N:1 |
| Adherence_Assertion | Asset | `attests_for` (asset_id) | N:1 |

---

## 2. Entity → Standard Relationships

| Entity | Governing Standard | standard_marker Value |
|---|---|---|
| Schema_Compliance | Internal (thesis §5) | `Thesis L1` |
| Architecture_Classification | TOGAF + Zachman | `TOGAF/Zachman` |
| Topology_Node | TOGAF | `TOGAF` |
| Topology_Edge | TOGAF | `TOGAF` |
| Signal | OCSF 1.3 | `OCSF 1.3` |
| Finding_Event | OCSF 1.3 | `OCSF 1.3` |
| Remediation_Event | OCSF 1.3 | `OCSF 1.3` |
| Intelligence_Assessment | NATO/Admiralty | `NATO/Admiralty` |
| Asset | ISO/IEC 19770-1:2017 | `ISO/IEC 19770-1:2017` |
| Software_Instance | ISO/IEC 19770-1:2017 | `ISO/IEC 19770-1:2017` |
| Service | ITIL 4 | `ITIL 4` |
| Asset_Service_Map | ISO 19770 + ITIL | `ISO 19770 + ITIL` |
| Asset_Classification | NIST CSF 2.0 | `NIST CSF 2.0` |
| Asset_Security_Posture | NIST CSF 2.0 | `NIST CSF 2.0` |
| Posture_Dimension | NIST CSF 2.0 | `NIST CSF 2.0` |
| Case | ITIL 4 + OODA + CTEM | `ITIL 4 + OODA + CTEM` |
| Remediation_Workflow | ITIL 4 + CTEM | `ITIL 4 + CTEM` |
| Remediation_Action | ITIL 4 + CTEM | `ITIL 4 + CTEM` |
| Action_Template | ITIL 4 | `ITIL 4` |
| Case_Capacity_Model | ITIL 4 | `ITIL 4` |
| Case_Demand_Model | ITIL 4 + Queueing Theory | `ITIL 4 + Queueing Theory` |
| Case_Backlog_State | Queueing Theory + Little's Law | `Queueing Theory + Little's Law` |
| Case_Assignment_Model | ITIL 4 | `ITIL 4` |
| Process_Maturity | CMMI | `CMMI` |
| Governance_Capability | COBIT 2019 | `COBIT 2019` |
| Delivery_Performance | DORA | `DORA` |
| Improvement_Program | DMAIC | `DMAIC` |
| Case_Management_Metric | ITIL 4 | `ITIL 4` |
| Mission | CBP + OKR | `CBP + OKR` |
| Mission_Indicator | CBP + NATO/Admiralty | `CBP + NATO/Admiralty` |
| Mission_Case_Link | CBP | `CBP` |
| Risk_Snapshot | ISO 27005 + ITIL | `ISO 27005 + ITIL` |
| Control_Reference | Framework-specific | Framework-specific |
| Control_State | Framework-specific | Framework-specific |
| Adherence_Assertion | Standard-specific | Standard-specific |

---

## 3. Entity → UI Page Relationships

| Entity | Consumed By Page(s) |
|---|---|
| Architecture_Classification | `/architecture`, `/architecture/drift` |
| Topology_Node | `/architecture`, `/architecture/dependencies`, `/fusion-map`, `/fusion-map/blast-radius` |
| Topology_Edge | `/architecture/dependencies`, `/fusion-map`, `/fusion-map/blast-radius` |
| Signal | `/operating-picture/external`, `/operating-picture/internal` |
| Finding_Event | `/operating-picture/internal`, `/architecture/drift` |
| Intelligence_Assessment | `/operating-picture/external` |
| Remediation_Event | `/cases/[id]` |
| Asset | `/assets`, `/assets/classification`, `/assets/ownership`, `/fusion-map` |
| Software_Instance | `/assets` (detail view) |
| Service | `/assets` (detail view), `/fusion-map/mission` |
| Asset_Service_Map | `/fusion-map/mission` |
| Asset_Classification | `/assets/classification` |
| Asset_Security_Posture | `/posture`, `/som/cloud-security` |
| Posture_Dimension | `/posture` (drill-down) |
| Case | `/cases`, `/cases/[id]`, `/cases/my`, `/cases/analytics`, `/war-room/p0` |
| Remediation_Workflow | `/cases/[id]` |
| Remediation_Action | `/cases/[id]` |
| Case_Capacity_Model | `/team-pulse/workload` |
| Case_Demand_Model | `/team-pulse/workload` |
| Case_Backlog_State | `/cases/analytics`, `/domain-pulse` |
| Case_Assignment_Model | `/cases/my`, `/team-pulse/workload` |
| Case_Management_Metric | `/cases/analytics`, `/team-pulse/sla`, `/ciso` |
| Process_Maturity | `/som/security-operations` |
| Governance_Capability | `/som/security-operations`, `/governance` |
| Delivery_Performance | `/system-pulse/engine` |
| Improvement_Program | `/som/security-operations` |
| Mission | `/mission/overview`, `/mission/objectives`, `/mission/impact`, `/ciso` |
| Mission_Indicator | `/mission/objectives` |
| Mission_Case_Link | `/mission/objectives`, `/cases/[id]` |
| Risk_Snapshot | `/som/risk`, `/mission/impact`, `/ciso` |
| Control_Reference | `/controls`, `/controls/frameworks` |
| Control_State | `/controls`, `/controls/strength` |
| Adherence_Assertion | `/governance/decisions`, `/governance/policies` |

---

## 4. Entity → Use Case Relationships

| Entity | Use Case(s) |
|---|---|
| Architecture_Classification | UC-ARCH-001, UC-ARCH-002 |
| Topology_Node | UC-ARCH-001 |
| Topology_Edge | UC-ARCH-001 |
| Signal | UC-INTEL-001, UC-INTEL-002 |
| Finding_Event | UC-INTEL-002, UC-ARCH-002 |
| Intelligence_Assessment | UC-INTEL-001 |
| Asset | UC-ASSET-001, UC-ASSET-002, UC-ASSET-003 |
| Asset_Classification | UC-ASSET-002 |
| Asset_Security_Posture | UC-POSTURE-001 |
| Posture_Dimension | UC-POSTURE-002 |
| Case | UC-CASE-001, UC-CASE-002, UC-CASE-003, UC-CASE-004 |
| Remediation_Workflow | UC-CASE-002 |
| Remediation_Action | UC-CASE-002 |
| Case_Management_Metric | UC-CASE-003, UC-RPT-002 |
| Case_Capacity_Model | UC-CAP-001, UC-RPT-002 |
| Case_Demand_Model | UC-CAP-001 |
| Case_Backlog_State | UC-CASE-003, UC-CAP-001 |
| Case_Assignment_Model | UC-CASE-004 |
| Process_Maturity | UC-CAP-002 |
| Delivery_Performance | UC-CAP-003 |
| Mission | UC-MISSION-001, UC-MISSION-002, UC-MISSION-003 |
| Mission_Indicator | UC-MISSION-001, UC-MISSION-002 |
| Mission_Case_Link | UC-MISSION-002 |
| Risk_Snapshot | UC-RISK-001, UC-MISSION-003 |
| Control_Reference | UC-CTRL-001 |
| Control_State | UC-CTRL-001 |
| Adherence_Assertion | UC-CTRL-001, UC-GOV-001 |

---

## 5. Entity → Thesis Layer Relationships

| Thesis Layer | Entities |
|---|---|
| L1: Standards Declaration | Schema_Compliance |
| L2: Architecture & Topology | Architecture_Classification, Topology_Node, Topology_Edge |
| L3: Event & Intelligence | Signal, Finding_Event, Remediation_Event, Intelligence_Assessment |
| L4: Asset Authority | Asset, Software_Instance, Service, Asset_Service_Map |
| L5: Classification & Posture | Asset_Classification, Asset_Security_Posture, Posture_Dimension |
| L6: Exposure Overlay (CTEM) | (overlay fields on Case + Asset_Security_Posture) |
| L7: Case & Remediation | Case, Remediation_Workflow, Remediation_Action, Action_Template |
| L8: Capacity/Maturity/Perf | Case_Capacity_Model, Case_Demand_Model, Case_Backlog_State, Case_Assignment_Model, Process_Maturity, Governance_Capability, Delivery_Performance, Improvement_Program, Case_Management_Metric |
| L9: Mission & Portfolio | Mission, Mission_Indicator, Mission_Case_Link |
| L10: Risk/Control/Adherence | Risk_Snapshot, Control_Reference, Control_State, Adherence_Assertion |
| L11: Reporting & Analytics | (views only — no standalone entities) |

---

## Graph Statistics

| Metric | Count |
|---|---|
| Total thesis-governed entities | 35 |
| Total commander extensions | 20 |
| Total entity→entity relationships | 25 |
| Total entity→standard bindings | 35 |
| Total entity→page bindings | 65+ |
| Total entity→use_case bindings | 50+ |
| Standards referenced | 14 |

---

**Last Updated:** 2026-06-10
