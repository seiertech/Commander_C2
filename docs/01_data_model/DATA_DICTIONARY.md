# DATA DICTIONARY — Commander C2

**Purpose:** Field-level specification of every entity in the system. This IS the schema authority. No entity exists in code that isn't here. No field exists in code that isn't here.

**Naming convention:** snake_case (thesis-literal, 1:1 traceable to thesis text)
**Base requirement:** Every entity carries `standard_marker: string`

---

## How To Read This Dictionary

Each entity entry contains:

| Column | Meaning |
|---|---|
| Field | The snake_case field name as it appears in TypeScript |
| Type | TypeScript type |
| Required | Yes / No |
| Standard | Which standard governs this field (or "Internal" for Commander extensions) |
| Clause | Standard clause/section reference where applicable |
| Description | What the field means |
| Constraints | Enums, ranges, format requirements |

---

## Layer 1: Standards Declaration

### Schema_Compliance

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| compliance_id | string | Yes | Internal | — | Unique declaration identifier | UUID |
| standard_name | string | Yes | Internal | — | Name of the governing standard | Non-empty |
| standard_version | string | Yes | Internal | — | Version of the standard | Semver or year |
| scope | string | Yes | Internal | — | What aspect of Commander this standard governs | Non-empty |
| conformance_level | string | Yes | Internal | — | How strictly Commander adheres | `strict` / `aligned` / `derived` / `partial` |
| declared_by | string | Yes | Internal | — | Who made this declaration | Non-empty |
| declaration_date | string | Yes | Internal | — | When declared | ISO 8601 date |
| notes | string | No | Internal | — | Additional context | Free text |
| standard_marker | string | Yes | Thesis-wide | §5 | Which standard governs this entity | Non-empty |

---

## Layer 2: Architecture Classification & Topology

### Architecture_Classification

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| architecture_id | string | Yes | Internal | — | Unique identifier | UUID |
| togaf_domain | string | Yes | TOGAF | §4 ADM | Architecture domain | `business` / `data` / `application` / `technology` |
| zachman_aspect | string | Yes | Zachman | Row 1-6 | What aspect is being described | `what` / `how` / `where` / `who` / `when` / `why` |
| zachman_perspective | string | Yes | Zachman | Col 1-6 | From whose perspective | `planner` / `owner` / `designer` / `builder` / `subcontractor` / `user` |
| logical_layer | string | Yes | TOGAF | §4 ADM | Logical architecture layer | Non-empty |
| physical_layer | string | Yes | TOGAF | §4 ADM | Physical architecture layer | Non-empty |
| service_tier | string | Yes | TOGAF | §4 ADM | Service tier classification | Non-empty |
| topology_type | string | Yes | Internal | — | Type of topology this classifies | Non-empty |
| standard_marker | string | Yes | Thesis-wide | §6 | Governing standard | `TOGAF/Zachman` |

### Topology_Node

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| topology_node_id | string | Yes | Internal | — | Unique node identifier | UUID |
| asset_id | string | Yes | ISO 19770 | §7.4 | Reference to canonical asset | FK to Asset |
| node_type | string | Yes | Internal | — | Type of node | Non-empty |
| topology_type | string | Yes | Internal | — | Topology this node belongs to | Non-empty |
| architectural_zone | string | Yes | TOGAF | §4 ADM | Architecture zone placement | Non-empty |
| standard_marker | string | Yes | Thesis-wide | §6 | Governing standard | `TOGAF` |

### Topology_Edge

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| topology_edge_id | string | Yes | Internal | — | Unique edge identifier | UUID |
| source_node_id | string | Yes | Internal | — | Source node | FK to Topology_Node |
| target_node_id | string | Yes | Internal | — | Target node | FK to Topology_Node |
| relationship_type | string | Yes | Internal | — | Type of relationship | Non-empty |
| topology_type | string | Yes | Internal | — | Topology this edge belongs to | Non-empty |
| direction | string | Yes | Internal | — | Direction of relationship | `unidirectional` / `bidirectional` |
| dependency_strength | number | Yes | Internal | — | Strength of dependency | 0.0 - 1.0 |
| standard_marker | string | Yes | Thesis-wide | §6 | Governing standard | `TOGAF` |

---

## Layer 3: Event & Intelligence

### Signal

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| signal_id | string | Yes | Internal | — | Unique signal identifier | UUID |
| source_system | string | Yes | OCSF | metadata.product | System that produced the signal | Non-empty |
| source_event_id | string | Yes | OCSF | metadata.uid | Original event ID from source | Non-empty |
| ocsf_category | string | Yes | OCSF | category_uid | OCSF event category | OCSF category enum |
| ocsf_class | string | Yes | OCSF | class_uid | OCSF event class | OCSF class enum |
| signal_type | string | Yes | Internal | — | Commander signal classification | Non-empty |
| severity | number | Yes | OCSF | severity_id | Normalised severity (0-6) | 0-6 integer |
| time_observed | string | Yes | OCSF | time | When the event occurred | ISO 8601 |
| raw_payload | string | Yes | Internal | — | Original event payload | JSON string |
| normalized_payload | string | Yes | OCSF | — | OCSF-normalised payload | JSON string |
| asset_resolution_status | string | Yes | Internal | — | Whether signal resolved to a canonical asset | `resolved` / `unresolved` / `partial` |
| standard_marker | string | Yes | Thesis-wide | §7 | Governing standard | `OCSF 1.3` |

### Finding_Event

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| finding_event_id | string | Yes | Internal | — | Unique finding identifier | UUID |
| signal_id | string | Yes | Internal | — | Parent signal | FK to Signal |
| event_family | string | Yes | OCSF | category_name | OCSF event family/category name | Non-empty |
| title | string | Yes | Internal | — | Human-readable finding title | Non-empty |
| description | string | Yes | Internal | — | Finding description | Non-empty |
| normalized_severity | number | Yes | OCSF | severity_id | Normalised severity (0-6) | 0-6 integer |
| threat_context | string | No | Internal | — | Threat intelligence context | Free text |
| exploitability_hint | string | No | Internal | — | Exploitability indicator | Free text |
| standard_marker | string | Yes | Thesis-wide | §7 | Governing standard | `OCSF 1.3` |

### Remediation_Event

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| remediation_event_id | string | Yes | Internal | — | Unique identifier | UUID |
| related_case_id | string | Yes | Internal | — | Case this remediation belongs to | FK to Case |
| related_action_id | string | Yes | Internal | — | Action that produced this event | FK to Remediation_Action |
| outcome | string | Yes | Internal | — | Remediation outcome | `success` / `partial` / `failed` / `deferred` |
| result_state | string | Yes | Internal | — | Post-remediation state | Non-empty |
| execution_time | string | Yes | Internal | — | When remediation executed | ISO 8601 |
| output_summary | string | Yes | Internal | — | Summary of what happened | Non-empty |
| ocsf_category | string | Yes | OCSF | category_uid | OCSF remediation category | OCSF category enum |
| ocsf_class | string | Yes | OCSF | class_uid | OCSF remediation class | OCSF class enum |
| standard_marker | string | Yes | Thesis-wide | §7 | Governing standard | `OCSF 1.3` |

### Intelligence_Assessment

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| intelligence_assessment_id | string | Yes | Internal | — | Unique identifier | UUID |
| signal_id | string | Yes | Internal | — | Signal being graded | FK to Signal |
| source_reliability | string | Yes | NATO/Admiralty | — | Source reliability grade | `A` / `B` / `C` / `D` / `E` / `F` |
| information_credibility | number | Yes | NATO/Admiralty | — | Information credibility grade | 1-6 integer |
| combined_rating | string | Yes | NATO/Admiralty | — | Combined rating (e.g. "B2") | Letter + Number |
| analytic_note | string | No | Internal | — | Analyst notes on grading rationale | Free text |
| graded_by | string | Yes | Internal | — | Who performed the grading | Non-empty |
| graded_time | string | Yes | Internal | — | When grading was performed | ISO 8601 |
| standard_marker | string | Yes | Thesis-wide | §7 | Governing standard | `NATO/Admiralty` |

---

## Layer 4: Asset Authority

### Asset

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| asset_id | string | Yes | ISO 19770 | §7.4 | Unique asset identifier | UUID |
| asset_name | string | Yes | ISO 19770 | §7.4 | Asset display name | Non-empty |
| asset_class | string | Yes | ISO 19770 | §7.4 | Primary asset classification | Non-empty |
| asset_subclass | string | Yes | ISO 19770 | §7.4 | Secondary classification | Non-empty |
| platform | string | Yes | ISO 19770 | §7.4 | Platform/OS | Non-empty |
| environment | string | Yes | ISO 19770 | §7.4 | Deployment environment | `production` / `staging` / `development` / `disaster_recovery` |
| location | string | Yes | ISO 19770 | §7.4 | Physical or logical location | Non-empty |
| owner | string | Yes | ISO 19770 | §7.4 | Asset owner | Non-empty |
| lifecycle_state | string | Yes | ISO 19770 | §8 | Current lifecycle state | `planned` / `acquired` / `deployed` / `maintained` / `retired` / `disposed` |
| source_of_truth | string | Yes | ISO 19770 | §7.4 | Authoritative source system | Non-empty |
| first_seen | string | Yes | ISO 19770 | §8 | When first observed | ISO 8601 |
| last_seen | string | Yes | ISO 19770 | §8 | When last observed | ISO 8601 |
| standard_marker | string | Yes | Thesis-wide | §8 | Governing standard | `ISO/IEC 19770-1:2017` |

### Software_Instance

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| software_id | string | Yes | ISO 19770 | §7.4 | Unique software instance ID | UUID |
| asset_id | string | Yes | ISO 19770 | §7.4 | Host asset | FK to Asset |
| software_name | string | Yes | ISO 19770 | §7.4 | Software product name | Non-empty |
| software_version | string | Yes | ISO 19770 | §7.4 | Installed version | Non-empty |
| publisher | string | Yes | ISO 19770 | §7.4 | Software publisher | Non-empty |
| install_state | string | Yes | ISO 19770 | §8 | Installation state | `installed` / `pending` / `removed` |
| software_type | string | Yes | ISO 19770 | §7.4 | Type classification | `os` / `application` / `agent` / `library` / `firmware` |
| package_reference | string | No | ISO 19770 | §7.4 | Package/CPE reference | CPE string or package ID |
| standard_marker | string | Yes | Thesis-wide | §8 | Governing standard | `ISO/IEC 19770-1:2017` |

### Service

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| service_id | string | Yes | ITIL | §Service Design | Unique service identifier | UUID |
| service_name | string | Yes | ITIL | §Service Design | Service name | Non-empty |
| service_owner | string | Yes | ITIL | §Service Design | Service owner | Non-empty |
| service_tier | string | Yes | ITIL | §Service Design | Service tier | `tier_0` / `tier_1` / `tier_2` / `tier_3` |
| business_dependency | string | Yes | ITIL | §Service Design | Business process dependency | Non-empty |
| standard_marker | string | Yes | Thesis-wide | §8 | Governing standard | `ITIL 4` |

### Asset_Service_Map

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| asset_service_map_id | string | Yes | Internal | — | Unique mapping ID | UUID |
| asset_id | string | Yes | ISO 19770 | §7.4 | Asset in the relationship | FK to Asset |
| service_id | string | Yes | ITIL | §Service Design | Service in the relationship | FK to Service |
| relationship_type | string | Yes | Internal | — | How asset relates to service | `hosts` / `supports` / `consumes` / `depends_on` |
| critical_dependency_flag | boolean | Yes | Internal | — | Whether this is a critical dependency | true / false |
| standard_marker | string | Yes | Thesis-wide | §8 | Governing standard | `ISO 19770 + ITIL` |

---

## Layer 5: Asset Classification & Security Posture

### Asset_Classification

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| asset_classification_id | string | Yes | Internal | — | Unique classification ID | UUID |
| asset_id | string | Yes | ISO 19770 | §7.4 | Asset being classified | FK to Asset |
| business_service | string | Yes | NIST CSF | ID.AM | Business service this asset supports | Non-empty |
| business_capability | string | Yes | NIST CSF | ID.AM | Business capability | Non-empty |
| criticality | number | Yes | NIST CSF | ID.AM-05 | Business criticality | 1-5 integer |
| data_classification | string | Yes | NIST CSF | PR.DS | Data classification level | `public` / `internal` / `confidential` / `restricted` |
| exposure_type | string | Yes | CTEM | §Scoping | Exposure classification | `external` / `internal` / `hybrid` |
| regulatory_scope | string | No | Internal | — | Regulatory frameworks applicable | Free text |
| mission_impact | string | Yes | CBP | — | Impact on missions if compromised | `critical` / `high` / `medium` / `low` |
| risk_weighting | number | Yes | Internal | — | Risk weighting factor | 0.0 - 10.0 |
| standard_marker | string | Yes | Thesis-wide | §9 | Governing standard | `NIST CSF 2.0` |

### Asset_Security_Posture

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| posture_id | string | Yes | Internal | — | Unique posture record ID | UUID |
| asset_id | string | Yes | ISO 19770 | §7.4 | Asset being assessed | FK to Asset |
| posture_status | string | Yes | NIST CSF | — | Overall posture status | `healthy` / `degraded` / `critical` / `unknown` |
| posture_score | number | Yes | NIST CSF | — | Aggregate posture score | 0-100 |
| assessment_time | string | Yes | Internal | — | When assessed | ISO 8601 |
| patch_status | string | Yes | NIST CSF | PR.PS | Patch posture | `current` / `behind` / `critical_behind` / `unknown` |
| vulnerability_exposure | string | Yes | CTEM | §Discovery | Vulnerability exposure state | `none_known` / `low` / `medium` / `high` / `critical` |
| monitoring_coverage | string | Yes | NIST CSF | DE.CM | Detection coverage | `full` / `partial` / `minimal` / `none` |
| response_readiness | string | Yes | NIST CSF | RS | Response readiness | `ready` / `partial` / `not_ready` |
| recovery_readiness | string | Yes | NIST CSF | RC | Recovery readiness | `ready` / `partial` / `not_ready` |
| governance_status | string | Yes | NIST CSF | GV | Governance posture | `governed` / `partial` / `ungoverned` |
| standard_marker | string | Yes | Thesis-wide | §9 | Governing standard | `NIST CSF 2.0` |

### Posture_Dimension

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| posture_dimension_id | string | Yes | Internal | — | Unique dimension ID | UUID |
| posture_id | string | Yes | Internal | — | Parent posture record | FK to Asset_Security_Posture |
| nist_function | string | Yes | NIST CSF | §Functions | NIST CSF function | `GV` / `ID` / `PR` / `DE` / `RS` / `RC` |
| nist_category | string | Yes | NIST CSF | §Categories | NIST CSF category | NIST category ID (e.g. ID.AM, PR.PS) |
| dimension_name | string | Yes | NIST CSF | — | Human-readable dimension name | Non-empty |
| dimension_state | string | Yes | Internal | — | Current state | `optimal` / `adequate` / `degraded` / `failed` / `unknown` |
| dimension_score | number | Yes | Internal | — | Dimension score | 0-100 |
| evidence_source | string | Yes | Internal | — | What provides evidence for this dimension | Non-empty |
| standard_marker | string | Yes | Thesis-wide | §9 | Governing standard | `NIST CSF 2.0` |

---

## Layer 6: Exposure Lifecycle Overlay (CTEM)

No standalone entities. CTEM is applied via `ctem_phase` field on Case and exposure-related entities.

| Field | Added To | Values | Standard |
|---|---|---|---|
| ctem_phase | Case, Asset_Security_Posture | `scoping` / `discovery` / `prioritization` / `validation` / `mobilization` | CTEM |

---

## Layer 7: Case & Remediation Workflow

### Case

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| case_id | string | Yes | Internal | — | Unique case identifier | UUID |
| created_time | string | Yes | Internal | — | When case was created | ISO 8601 |
| case_type | string | Yes | ITIL | §Incident Mgmt | Case classification | Non-empty |
| related_signal_id | string | No | Internal | — | Originating signal | FK to Signal |
| related_asset_id | string | No | Internal | — | Primary affected asset | FK to Asset |
| related_vulnerability_id | string | No | Internal | — | Related vulnerability | FK or CVE reference |
| impact_scope | string | Yes | ITIL | §Incident Mgmt | Scope of impact | `single_asset` / `service` / `business_unit` / `organisation` |
| urgency | string | Yes | ITIL | §Incident Mgmt | Urgency assessment | `critical` / `high` / `medium` / `low` |
| priority_level | number | Yes | ITIL | §Incident Mgmt | Computed priority | 1-5 integer |
| status | string | Yes | ITIL | §Incident Mgmt | Current case status | Non-empty |
| itil_stage | string | Yes | ITIL | §Incident Mgmt | ITIL lifecycle stage | `identified` / `logged` / `categorized` / `prioritized` / `assigned` / `resolved` / `closed` |
| owner_team | string | Yes | ITIL | §Incident Mgmt | Owning team | Non-empty |
| target_resolution_date | string | Yes | ITIL | §SLA | SLA target date | ISO 8601 |
| ctem_phase | string | Yes | CTEM | §5-stage | CTEM lifecycle phase | `scoping` / `discovery` / `prioritization` / `validation` / `mobilization` |
| ooda_state | string | Yes | OODA | — | OODA decision state | `observe` / `orient` / `decide` / `act` |
| standard_marker | string | Yes | Thesis-wide | §11 | Governing standard | `ITIL 4 + OODA + CTEM` |

### Remediation_Workflow

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| workflow_id | string | Yes | Internal | — | Unique workflow ID | UUID |
| case_id | string | Yes | Internal | — | Parent case | FK to Case |
| workflow_type | string | Yes | ITIL | §Incident Mgmt | Workflow classification | Non-empty |
| workflow_status | string | Yes | ITIL | §Incident Mgmt | Current status | `pending` / `in_progress` / `completed` / `failed` / `cancelled` |
| assigned_team | string | Yes | ITIL | §Incident Mgmt | Team executing | Non-empty |
| validation_status | string | Yes | CTEM | §Validation | Whether remediation validated | `not_started` / `in_progress` / `passed` / `failed` |
| mobilization_status | string | Yes | CTEM | §Mobilization | Mobilization state | `not_started` / `in_progress` / `completed` |
| standard_marker | string | Yes | Thesis-wide | §11 | Governing standard | `ITIL 4 + CTEM` |

### Remediation_Action

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| action_id | string | Yes | Internal | — | Unique action ID | UUID |
| workflow_id | string | Yes | Internal | — | Parent workflow | FK to Remediation_Workflow |
| action_type | string | Yes | ITIL | §Incident Mgmt | Type of action | Non-empty |
| action_sequence | number | Yes | Internal | — | Execution order | Positive integer |
| execution_type | string | Yes | Internal | — | How executed | `manual` / `automated` / `hybrid` |
| assigned_to | string | Yes | ITIL | §Incident Mgmt | Who executes | Non-empty |
| action_status | string | Yes | ITIL | §Incident Mgmt | Current status | `pending` / `in_progress` / `completed` / `failed` / `skipped` |
| action_start_time | string | No | Internal | — | When started | ISO 8601 |
| action_finish_time | string | No | Internal | — | When finished | ISO 8601 |
| validation_result | string | No | CTEM | §Validation | Validation outcome | `passed` / `failed` / `not_tested` |
| standard_marker | string | Yes | Thesis-wide | §11 | Governing standard | `ITIL 4 + CTEM` |

### Action_Template

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| action_template_id | string | Yes | Internal | — | Unique template ID | UUID |
| template_name | string | Yes | Internal | — | Template name | Non-empty |
| applicable_case_type | string | Yes | ITIL | §Incident Mgmt | What case types this applies to | Non-empty |
| action_definition | string | Yes | Internal | — | What the action does | Non-empty |
| default_sequence | number | Yes | Internal | — | Default sequence position | Positive integer |
| standard_marker | string | Yes | Thesis-wide | §11 | Governing standard | `ITIL 4` |

---

## Layer 8: Capacity, Maturity, Performance & Improvement

### Case_Capacity_Model

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| team_id | string | Yes | ITIL | §Capacity Mgmt | Team identifier | UUID |
| skill_level | string | Yes | ITIL | §Capacity Mgmt | Team skill tier | `L1` / `L2` / `L3` / `L4` |
| resource_count | number | Yes | ITIL | §Capacity Mgmt | Number of resources | Positive integer |
| avg_hours_per_week | number | Yes | ITIL | §Capacity Mgmt | Average hours per resource | Positive number |
| avg_case_handling_rate | number | Yes | ITIL | §Capacity Mgmt | Cases per resource per week | Positive number |
| total_capacity_per_week | number | Yes | ITIL | §Capacity Mgmt | Total team capacity | Computed: resource_count * avg_case_handling_rate |
| standard_marker | string | Yes | Thesis-wide | §12 | Governing standard | `ITIL 4` |

### Case_Demand_Model

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| case_type | string | Yes | ITIL | §Capacity Mgmt | Case type being modelled | Non-empty |
| arrival_rate | number | Yes | Queueing Theory | Little's Law | Cases arriving per period | Positive number |
| volatility | number | Yes | Internal | — | Demand volatility factor | 0.0 - 5.0 |
| peak_factor | number | Yes | Internal | — | Peak demand multiplier | >= 1.0 |
| standard_marker | string | Yes | Thesis-wide | §12 | Governing standard | `ITIL 4 + Queueing Theory` |

### Case_Backlog_State

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| total_cases_open | number | Yes | ITIL | §Capacity Mgmt | Total open cases | Non-negative integer |
| new_cases_per_period | number | Yes | Queueing Theory | — | New arrivals per period | Non-negative number |
| closed_cases_per_period | number | Yes | Queueing Theory | — | Closures per period | Non-negative number |
| backlog_growth_rate | number | Yes | Queueing Theory | — | Net growth (arrivals - closures) | Number (can be negative) |
| wip | number | Yes | Queueing Theory | Little's Law | Work in progress | Non-negative integer |
| standard_marker | string | Yes | Thesis-wide | §12 | Governing standard | `Queueing Theory + Little's Law` |

### Case_Assignment_Model

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| case_id | string | Yes | Internal | — | Case being assigned | FK to Case |
| required_capability | string | Yes | ITIL | §Capacity Mgmt | Required skill level | `L1` / `L2` / `L3` / `L4` |
| assigned_capability_level | string | Yes | ITIL | §Capacity Mgmt | Actual assigned level | `L1` / `L2` / `L3` / `L4` |
| skill_match_score | number | Yes | Internal | — | Match quality | 0.0 - 1.0 |
| escalation_path | string | Yes | ITIL | §Incident Mgmt | Escalation route | Non-empty |
| standard_marker | string | Yes | Thesis-wide | §12 | Governing standard | `ITIL 4` |

### Process_Maturity

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| process_id | string | Yes | Internal | — | Process identifier | UUID |
| process_name | string | Yes | CMMI | §Maturity Levels | Process being assessed | Non-empty |
| maturity_level | number | Yes | CMMI | §Maturity Levels | CMMI maturity level | 1-5 integer |
| assessment_scope | string | Yes | CMMI | — | Scope of assessment | Non-empty |
| assessment_date | string | Yes | Internal | — | When assessed | ISO 8601 |
| improvement_plan | string | No | CMMI | — | Improvement actions | Free text |
| standard_marker | string | Yes | Thesis-wide | §12 | Governing standard | `CMMI` |

### Governance_Capability

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| process_id | string | Yes | COBIT | §Process Capability | Process identifier | UUID |
| cobit_capability_level | number | Yes | COBIT | §Process Capability | COBIT capability level | 0-5 integer |
| governance_domain | string | Yes | COBIT | §Governance Objectives | COBIT governance domain | Non-empty |
| control_coverage | number | Yes | COBIT | — | Control coverage percentage | 0-100 |
| performance_measure | string | Yes | COBIT | — | Performance measurement | Non-empty |
| standard_marker | string | Yes | Thesis-wide | §12 | Governing standard | `COBIT 2019` |

### Delivery_Performance

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| entity_id | string | Yes | Internal | — | Entity being measured | UUID |
| deployment_frequency | string | Yes | DORA | — | How often changes deploy | Non-empty |
| lead_time | string | Yes | DORA | — | Commit to production time | Duration string |
| change_failure_rate | number | Yes | DORA | — | Percentage of changes causing failure | 0-100 |
| time_to_restore | string | Yes | DORA | — | Time to restore service | Duration string |
| measurement_period | string | Yes | Internal | — | Period measured | ISO 8601 interval |
| standard_marker | string | Yes | Thesis-wide | §12 | Governing standard | `DORA` |

### Improvement_Program

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| target_process | string | Yes | DMAIC | — | Process being improved | Non-empty |
| dmaic_stage | string | Yes | DMAIC | — | Current DMAIC stage | `define` / `measure` / `analyze` / `improve` / `control` |
| baseline_metric | string | Yes | DMAIC | — | Baseline measurement | Non-empty |
| target_metric | string | Yes | DMAIC | — | Target measurement | Non-empty |
| improvement_actions | string | Yes | DMAIC | — | Planned/executed actions | Non-empty |
| control_state | string | Yes | DMAIC | — | Whether improvement is controlled | `not_started` / `in_progress` / `controlled` / `regressed` |
| standard_marker | string | Yes | Thesis-wide | §12 | Governing standard | `DMAIC` |

### Case_Management_Metric

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| metric_id | string | Yes | Internal | — | Unique metric ID | UUID |
| metric_name | string | Yes | ITIL | §CSI | Metric name | Non-empty |
| metric_scope | string | Yes | ITIL | §CSI | What is being measured | Non-empty |
| measurement_period | string | Yes | Internal | — | Period measured | ISO 8601 interval |
| value | number | Yes | Internal | — | Metric value | Number |
| formula_reference | string | Yes | Internal | — | How this value is calculated | Non-empty |
| owner | string | Yes | Internal | — | Who owns this metric | Non-empty |
| standard_marker | string | Yes | Thesis-wide | §12 | Governing standard | `ITIL 4` |

---

## Layer 9: Mission & Strategic Portfolio

### Mission

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| mission_id | string | Yes | Internal | — | Unique mission identifier | UUID |
| mission_name | string | Yes | CBP | — | Mission name | Non-empty |
| capability_domain | string | Yes | CBP | — | Capability domain | Non-empty |
| derived_from_model | string | Yes | CBP | — | Which model produced this mission | Non-empty |
| current_state_score | number | Yes | CBP | — | Current state score | 0-100 |
| target_state_score | number | Yes | CBP | — | Target state score | 0-100 |
| delta_score | number | Yes | CBP | — | Gap (target - current) | Number |
| priority_score | number | Yes | Internal | — | Computed priority | 0-100 |
| impact_weighting | number | Yes | Internal | — | Impact weight | 0.0 - 10.0 |
| risk_reduction_value | number | Yes | Internal | — | Estimated risk reduction | 0-100 |
| mission_type | string | Yes | CBP | — | Classification | `posture` / `exposure` / `maturity` / `performance` / `capacity` / `governance` |
| owner | string | Yes | Internal | — | Mission owner | Non-empty |
| timeframe | string | Yes | Internal | — | Target completion | ISO 8601 date or interval |
| status | string | Yes | Internal | — | Current status | `draft` / `active` / `completed` / `archived` |
| standard_marker | string | Yes | Thesis-wide | §14 | Governing standard | `CBP + OKR` |

### Mission_Indicator

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| indicator_id | string | Yes | Internal | — | Unique indicator ID | UUID |
| mission_id | string | Yes | Internal | — | Parent mission | FK to Mission |
| source_entity | string | Yes | Internal | — | Entity providing the metric | Non-empty |
| metric_name | string | Yes | Internal | — | What is being measured | Non-empty |
| current_value | number | Yes | Internal | — | Current measured value | Number |
| target_value | number | Yes | Internal | — | Target value | Number |
| delta | number | Yes | Internal | — | Gap (target - current) | Number |
| confidence | number | Yes | NATO/Admiralty | — | Confidence in measurement | 1-6 integer |
| standard_marker | string | Yes | Thesis-wide | §14 | Governing standard | `CBP + NATO/Admiralty` |

### Mission_Case_Link

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| mission_id | string | Yes | Internal | — | Mission | FK to Mission |
| case_id | string | Yes | Internal | — | Contributing case | FK to Case |
| contribution_weight | number | Yes | Internal | — | How much this case contributes | 0.0 - 1.0 |
| standard_marker | string | Yes | Thesis-wide | §14 | Governing standard | `CBP` |

---

## Layer 10: Risk, Control & Adherence

### Risk_Snapshot

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| risk_snapshot_id | string | Yes | Internal | — | Unique snapshot ID | UUID |
| asset_id | string | Yes | ISO 19770 | §7.4 | Asset or system being assessed | FK to Asset |
| case_id | string | No | Internal | — | Related case if applicable | FK to Case |
| snapshot_time | string | Yes | Internal | — | When snapshot taken | ISO 8601 |
| inherent_risk | number | Yes | ISO 27005 | §Risk Assessment | Risk before controls | 0-100 |
| current_risk | number | Yes | ISO 27005 | §Risk Assessment | Current risk with controls | 0-100 |
| residual_risk | number | Yes | ISO 27005 | §Risk Assessment | Residual risk after treatment | 0-100 |
| risk_reason | string | Yes | Internal | — | Why risk is at this level | Non-empty |
| sla_status | string | Yes | ITIL | §SLA | SLA adherence status | `within_sla` / `at_risk` / `breached` |
| standard_marker | string | Yes | Thesis-wide | §15 | Governing standard | `ISO 27005 + ITIL` |

### Control_Reference

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| control_reference_id | string | Yes | Internal | — | Unique reference ID | UUID |
| framework_name | string | Yes | Internal | — | Framework name | Non-empty |
| framework_version | string | Yes | Internal | — | Framework version | Non-empty |
| category_or_control | string | Yes | Internal | — | Category or control identifier | Non-empty |
| description | string | Yes | Internal | — | Control description | Non-empty |
| standard_marker | string | Yes | Thesis-wide | §15 | Governing standard | Framework-specific |

### Control_State

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| control_state_id | string | Yes | Internal | — | Unique state ID | UUID |
| asset_id | string | Yes | ISO 19770 | §7.4 | Asset being evaluated | FK to Asset |
| control_reference_id | string | Yes | Internal | — | Which control | FK to Control_Reference |
| effectiveness_state | string | Yes | Internal | — | Control effectiveness | `effective` / `partially_effective` / `ineffective` / `not_assessed` |
| validation_state | string | Yes | Internal | — | Validation status | `validated` / `not_validated` / `expired` |
| last_verified | string | Yes | Internal | — | When last verified | ISO 8601 |
| evidence_pointer | string | Yes | Internal | — | Where evidence lives | Non-empty |
| standard_marker | string | Yes | Thesis-wide | §15 | Governing standard | Framework-specific |

### Adherence_Assertion

| Field | Type | Required | Standard | Clause | Description | Constraints |
|---|---|---|---|---|---|---|
| adherence_assertion_id | string | Yes | Internal | — | Unique assertion ID | UUID |
| asset_id | string | Yes | ISO 19770 | §7.4 | Asset being attested | FK to Asset |
| standard_name | string | Yes | Internal | — | Standard being asserted against | Non-empty |
| assertion_scope | string | Yes | Internal | — | What aspect is being asserted | Non-empty |
| assertion_status | string | Yes | Internal | — | Assertion status | `compliant` / `non_compliant` / `partial` / `not_assessed` |
| attested_by | string | Yes | Internal | — | Who attested | Non-empty |
| attested_time | string | Yes | Internal | — | When attested | ISO 8601 |
| standard_marker | string | Yes | Thesis-wide | §15 | Governing standard | Standard-specific |

---

## Layer 11: Reporting & Analytics

No entity definitions. This layer defines **views** over the data model:

- **Executive_Risk_View** — missions, posture, high-risk assets, residual risk
- **Asset_Posture_View** — per-asset posture, classification, related cases
- **Case_Metrics_View** — MTTA, MTTR, SLA, backlog, WIP, throughput
- **Remediation_Metrics_View** — action completion, validation success, cycle time
- **Intelligence_Confidence_View** — Admiralty grading distribution, action vs confidence
- **Mission_Portfolio_View** — current vs target, delta by mission, risk reduction

---

## Commander Platform Extensions (PRESERVE — not thesis-governed)

These entities are Commander platform infrastructure. They carry `standard_marker: 'commander_platform'`.

- Tenant_Config
- RBAC_Policy
- Connector
- Entitlement_Manifest
- Licence
- Feature_Registry
- Communication_Playbook
- Playbook_Execution
- War_Room
- Direction_Board
- Strategy_Policy
- Tenant_Intelligence_Subscription
- Push_Action_Intent
- Governed_Compose
- Notification
- Auth_Session
- Break_Glass_Request
- Customer
- Deployment
- Support_Operation

---

**Last Updated:** 2026-06-10
**Entity Count:** 35 thesis-governed + 20 commander extensions = 55 total
**Standard Coverage:** 14 standards (ISO 19770, OCSF, NIST CSF, CTEM, OODA, TOGAF, Zachman, NATO/Admiralty, ITIL, CMMI, COBIT, DORA, DMAIC, CBP)
