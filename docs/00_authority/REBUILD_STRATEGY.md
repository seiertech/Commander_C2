# REBUILD STRATEGY — Commander C2 Thesis Alignment

**Purpose:** Definitive plan to bring Commander C2's data model, data dictionary, use cases, and UI into full thesis conformance. Field-level. Standard-for-standard. No approximations.

**Decision Record:**
- Commander_C2 = canonical home (seiertech/Commander_C2)
- Kiro_Commander_SDR = read-only archive (johanndewinnaar-blip/Kiro_Commander_SDR)
- The thesis is LAW — every entity, every field, every `standard_marker`, every naming convention must be demonstrably present

---

## 1. The Problem

The SDR build was developed against the old product specifications (Spec #05, #46, etc.) over 6 months. It has:
- 91 entity files with SDR-specific naming and field structures
- 38 engines with SDR-specific logic
- 110 UI pages referencing SDR entity shapes
- 82 fixture files with SDR data shapes
- 60+ test files validating SDR structures

The thesis defines a **different data model** with:
- Different entity names (e.g. `Signal` not `Finding`, `Adherence_Assertion` not nothing)
- Different field names (e.g. `ocsf_category` not `classUid`, `source_reliability` not nothing)
- Mandatory `standard_marker` on every entity
- Explicit standards attribution per field
- Entities that don't exist at all in the SDR (Layer 8 entirely missing)

---

## 2. Rebuild Approach: Thesis-Canonical Layer + Migration

### What We Do

1. **Create a thesis-canonical data model** (`packages/contracts/src/thesis/`) — every entity exactly as the thesis defines it, field-for-field
2. **Create a formal Data Dictionary** (`docs/01_data_dictionary/`) — every entity, every field, what standard governs it, what the standard says, what Commander implements
3. **Create adapters** that map existing SDR entities → thesis entities (so existing UI/tests continue to work during migration)
4. **Migrate UI pages** one domain at a time to consume thesis entities directly
5. **Retire SDR entity names** once migration is complete per domain

### What We Keep

- All existing engines (logic is sound, just needs thesis field names)
- All existing UI pages (structure is correct, just needs field/label updates)
- The new C2 governance model (BUILD_BACKLOG, PAGE_SCHEDULE, Standards Evidence Model)
- The adherence terminology fix

### What Changes

- Entity definitions get rewritten to thesis spec (field-for-field)
- Fixtures get rewritten to thesis field names
- Tests get updated to thesis field names
- UI pages get updated to reference thesis entities

---

## 3. Thesis Entity Catalogue — Complete Field-Level Specification

### 3.1 Layer 1: Standards Declaration

#### `Schema_Compliance` (thesis name) → `StandardsDeclaration` (current)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `compliance_id` | string | Internal | `declarationId` | RENAME |
| `standard_name` | string | Internal | `standardName` | ✅ EXISTS |
| `standard_version` | string | Internal | `standardVersion` | ✅ EXISTS |
| `scope` | string | Internal | `scope` | ✅ EXISTS |
| `conformance_level` | enum | Internal | `conformanceLevel` | ✅ EXISTS |
| `declared_by` | string | Internal | `declaredBy` | ✅ EXISTS |
| `declaration_date` | string | Internal | `declarationDate` | ✅ EXISTS |
| `notes` | string | Internal | **MISSING** | ADD |

**Verdict:** Minor rename + 1 field addition. Low effort.

---

### 3.2 Layer 2: Architecture Classification & Topology

#### `Architecture_Classification` (thesis) → `architecture-component.ts` (current — MAJOR REWRITE)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `architecture_id` | string | Internal | Has generic `id` | RENAME |
| `togaf_domain` | enum: business/data/application/technology | TOGAF | **MISSING** | ADD |
| `zachman_aspect` | enum: What/How/Where/Who/When/Why | Zachman | **MISSING** | ADD |
| `zachman_perspective` | enum: Planner/Owner/Designer/Builder/Subcontractor/User | Zachman | **MISSING** | ADD |
| `logical_layer` | string | TOGAF | **MISSING** | ADD |
| `physical_layer` | string | TOGAF | **MISSING** | ADD |
| `service_tier` | string | TOGAF | **MISSING** | ADD |
| `topology_type` | string | Internal | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Near-total rewrite. Current entity is generic; thesis requires explicit TOGAF/Zachman classification.

#### `Topology_Node` (thesis) → `TopologyNode` (current)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `topology_node_id` | string | Internal | `nodeId` | RENAME |
| `asset_id` | string | Internal | `entityRef` | RENAME (semantics differ — thesis ties to asset specifically) |
| `node_type` | string | Internal | `entityType` | RENAME |
| `topology_type` | string | Internal | **MISSING** | ADD |
| `architectural_zone` | string | TOGAF | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Rename fields + add 2 new fields.

#### `Topology_Edge` (thesis) → `TopologyEdge` (current)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `topology_edge_id` | string | Internal | `edgeId` | RENAME |
| `source_node_id` | string | Internal | `sourceNodeId` | RENAME (camelCase→snake_case) |
| `target_node_id` | string | Internal | `targetNodeId` | RENAME |
| `relationship_type` | string | Internal | `relationshipType` | RENAME |
| `topology_type` | string | Internal | **MISSING** | ADD |
| `direction` | string | Internal | `bidirectional` (boolean) | REPLACE with explicit direction field |
| `dependency_strength` | number | Internal | `weight` | RENAME |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Rename + restructure direction field + add 2 new fields.

---

### 3.3 Layer 3: Event & Intelligence

#### `Signal` (thesis) → `Finding` (current — MAJOR REWRITE)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `signal_id` | string | Internal | `id` | RENAME |
| `source_system` | string | Internal | `source.sourceSystem` (nested) | FLATTEN |
| `source_event_id` | string | Internal | **MISSING** | ADD |
| `ocsf_category` | string | OCSF | **MISSING** (has `classUid` number) | ADD explicit OCSF category string |
| `ocsf_class` | string | OCSF | **MISSING** (has `classUid` number) | ADD explicit OCSF class string |
| `signal_type` | string | Internal | **MISSING** | ADD |
| `severity` | number | OCSF | `severityId` | RENAME |
| `time_observed` | string | OCSF | `eventTime` | RENAME |
| `raw_payload` | object/string | Internal | **MISSING** | ADD |
| `normalized_payload` | object | OCSF | **MISSING** | ADD |
| `asset_resolution_status` | string | Internal | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Major rewrite. Current `Finding` is structured around the SDR product spec, not the thesis Signal model.

#### `Finding_Event` (thesis) → partially in `Finding` (current)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `finding_event_id` | string | Internal | Part of `Finding` | EXTRACT to separate entity |
| `signal_id` | string | Internal | **MISSING** (no Signal→Finding link) | ADD |
| `event_family` | string | OCSF | **MISSING** | ADD |
| `title` | string | Internal | In `Finding.title` | EXISTS but in wrong entity |
| `description` | string | Internal | In `Finding.description` | EXISTS but in wrong entity |
| `normalized_severity` | number | OCSF | `Finding.severityId` | MOVE |
| `threat_context` | string | Internal | **MISSING** | ADD |
| `exploitability_hint` | string | Internal | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** New entity. The thesis separates Signal (raw normalised event) from Finding_Event (interpreted meaning).

#### `Remediation_Event` (thesis) → **DOES NOT EXIST**

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `remediation_event_id` | string | Internal | — | CREATE |
| `related_case_id` | string | Internal | — | CREATE |
| `related_action_id` | string | Internal | — | CREATE |
| `outcome` | string | Internal | — | CREATE |
| `result_state` | string | Internal | — | CREATE |
| `execution_time` | string | Internal | — | CREATE |
| `output_summary` | string | Internal | — | CREATE |
| `ocsf_category` | string | OCSF | — | CREATE |
| `ocsf_class` | string | OCSF | — | CREATE |
| `standard_marker` | string | Thesis-wide | — | CREATE |

**Verdict:** Entirely new entity.

#### `Intelligence_Assessment` (thesis) → **DOES NOT EXIST**

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `intelligence_assessment_id` | string | Internal | — | CREATE |
| `signal_id` | string | Internal | — | CREATE |
| `source_reliability` | enum: A/B/C/D/E/F | NATO/Admiralty | — | CREATE |
| `information_credibility` | enum: 1/2/3/4/5/6 | NATO/Admiralty | — | CREATE |
| `combined_rating` | string | NATO/Admiralty | — | CREATE |
| `analytic_note` | string | Internal | — | CREATE |
| `graded_by` | string | Internal | — | CREATE |
| `graded_time` | string | Internal | — | CREATE |
| `standard_marker` | string | Thesis-wide | — | CREATE |

**Verdict:** Entirely new entity. Core thesis gap.

---

### 3.4 Layer 4: Asset Authority

#### `Asset` (thesis) → `Asset` (current — FIELD MISMATCH)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `asset_id` | string | ISO 19770 | `id` | RENAME |
| `asset_name` | string | ISO 19770 | `name` | RENAME |
| `asset_class` | string | ISO 19770 | `classification` (enum, not string) | RESTRUCTURE |
| `asset_subclass` | string | ISO 19770 | **MISSING** | ADD |
| `platform` | string | ISO 19770 | `platform` (object, not string) | FLATTEN |
| `environment` | string | ISO 19770 | `environment` | ✅ EXISTS |
| `location` | string | ISO 19770 | **MISSING** | ADD |
| `owner` | string | ISO 19770 | `owner` | ✅ EXISTS |
| `lifecycle_state` | string | ISO 19770 | `lifecycleState` (optional) | MAKE REQUIRED + RENAME |
| `source_of_truth` | string | ISO 19770 | **MISSING** | ADD |
| `first_seen` | string | ISO 19770 | **MISSING** | ADD |
| `last_seen` | string | ISO 19770 | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Significant restructure. Core entity, many downstream impacts.

#### `Software_Instance` (thesis) → **DOES NOT EXIST**

All fields CREATE. Entirely new entity.

#### `Service` (thesis) → **DOES NOT EXIST**

All fields CREATE. Entirely new entity.

#### `Asset_Service_Map` (thesis) → **DOES NOT EXIST**

All fields CREATE. Entirely new entity.

---

### 3.5 Layer 5: Asset Classification & Security Posture

#### `Asset_Classification` (thesis) → inline fields on `Asset` (current — EXTRACT)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `asset_classification_id` | string | Internal | — | CREATE (separate entity) |
| `asset_id` | string | Internal | — | CREATE |
| `business_service` | string | NIST CSF | **MISSING** | ADD |
| `business_capability` | string | NIST CSF | **MISSING** | ADD |
| `criticality` | number | NIST CSF ID.AM-05 | `Asset.criticality` | MOVE to new entity |
| `data_classification` | string | NIST CSF | `Asset.dataClassification` (optional) | MOVE |
| `exposure_type` | string | CTEM | **MISSING** | ADD |
| `regulatory_scope` | string | Internal | **MISSING** | ADD |
| `mission_impact` | string | Internal | **MISSING** | ADD |
| `risk_weighting` | number | Internal | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Extract from Asset into standalone entity. New entity.

#### `Asset_Security_Posture` (thesis) → `PostureMetricsConfig` + `PostureAccountability` (current — RESTRUCTURE)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `posture_id` | string | Internal | Exists differently | RESTRUCTURE |
| `asset_id` | string | NIST CSF | Not per-asset in current model | ADD |
| `posture_status` | string | NIST CSF | Exists as metric | RENAME |
| `posture_score` | number | NIST CSF | Exists as metric value | RENAME |
| `assessment_time` | string | Internal | Exists | RENAME |
| `patch_status` | string | NIST CSF PR | **MISSING** | ADD |
| `vulnerability_exposure` | string | CTEM | **MISSING** | ADD |
| `monitoring_coverage` | string | NIST CSF DE | **MISSING** | ADD |
| `response_readiness` | string | NIST CSF RS | **MISSING** | ADD |
| `recovery_readiness` | string | NIST CSF RC | **MISSING** | ADD |
| `governance_status` | string | NIST CSF GV | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Major restructure. Current posture model is aggregate-first; thesis is per-asset-first.

#### `Posture_Dimension` (thesis) → **DOES NOT EXIST as separate entity**

All fields CREATE. New entity with per-NIST-function granularity.

---

### 3.6 Layer 6: Exposure Lifecycle Overlay (CTEM)

No standalone entity required — CTEM is an **overlay** applied via `ctem_phase` field on `Case` and `Exposure` entities.

| Field to Add | Entity | Values | Standard |
|---|---|---|---|
| `ctem_phase` | Case | scoping/discovery/prioritization/validation/mobilization | CTEM |
| `ctem_phase` | Exposure | scoping/discovery/prioritization/validation/mobilization | CTEM |

**Verdict:** 2 field additions across existing entities.

---

### 3.7 Layer 7: Case & Remediation Workflow

#### `Case` (thesis) → `Case` (current — FIELD ADDITIONS)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `case_id` | string | Internal | `id` | RENAME |
| `created_time` | string | Internal | `createdAt` | RENAME |
| `case_type` | string | ITIL | `caseType` | ✅ EXISTS |
| `related_signal_id` | string | Internal | **MISSING** (has signal refs elsewhere) | ADD |
| `related_asset_id` | string | Internal | **MISSING** (attached via risk object) | ADD direct ref |
| `related_vulnerability_id` | string | Internal | **MISSING** | ADD |
| `impact_scope` | string | ITIL | **MISSING** | ADD |
| `urgency` | string | ITIL | **MISSING** (priority exists) | ADD |
| `priority_level` | number | ITIL | `priority` (exists differently) | RENAME/ALIGN |
| `status` | string | ITIL | `status` | ✅ EXISTS |
| `itil_stage` | string | ITIL | Mapped via lifecycle states | ADD explicit field |
| `owner_team` | string | ITIL | **MISSING** | ADD |
| `target_resolution_date` | string | ITIL/SLA | Computed by SLA engine | ADD explicit field |
| `ctem_phase` | string | CTEM | **MISSING** | ADD |
| `ooda_state` | string | OODA | Managed by OODA engine but not on entity | ADD explicit field |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** 8+ field additions. Moderate effort.

#### `Remediation_Workflow` (thesis) → **DOES NOT EXIST**

All fields CREATE. New entity wrapping case→actions.

#### `Remediation_Action` (thesis) → `Action` (current — RENAME + ADD FIELDS)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `action_id` | string | Internal | `id` | RENAME |
| `workflow_id` | string | Internal | **MISSING** | ADD (link to Remediation_Workflow) |
| `action_type` | string | ITIL | `actionType` | ✅ EXISTS |
| `action_sequence` | number | Internal | **MISSING** | ADD |
| `execution_type` | string | Internal | **MISSING** | ADD |
| `assigned_to` | string | ITIL | Exists | ✅ EXISTS |
| `action_status` | string | ITIL | `status` | RENAME |
| `action_start_time` | string | Internal | `startedAt` | RENAME |
| `action_finish_time` | string | Internal | `completedAt` | RENAME |
| `validation_result` | string | CTEM | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Rename + add 4 fields.

#### `Action_Template` (thesis) → **DOES NOT EXIST**

All fields CREATE. New entity.

---

### 3.8 Layer 8: Capacity, Maturity, Performance & Improvement — ENTIRELY MISSING

Every entity in this layer is **CREATE from scratch**:

1. `Case_Capacity_Model` — 7 fields
2. `Case_Demand_Model` — 5 fields
3. `Case_Backlog_State` — 6 fields
4. `Case_Assignment_Model` — 6 fields
5. `Process_Maturity` — 7 fields (CMMI)
6. `Governance_Capability` — 6 fields (COBIT)
7. `Delivery_Performance` — 6 fields (DORA)
8. `Improvement_Program` — 7 fields (DMAIC)
9. `Case_Management_Metric` — 8 fields

**Verdict:** 9 new entities. Biggest single work block.

---

### 3.9 Layer 9: Mission & Strategic Portfolio

#### `Mission` (thesis) → `Mission` (current — SIGNIFICANT FIELD MISMATCH)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `mission_id` | string | Internal | `id` | RENAME |
| `mission_name` | string | Internal | `name` | RENAME |
| `capability_domain` | string | CBP | **MISSING** | ADD |
| `derived_from_model` | string | CBP | **MISSING** | ADD |
| `current_state_score` | number | CBP | **MISSING** (KPIs have current) | ADD at mission level |
| `target_state_score` | number | CBP | **MISSING** (KPIs have target) | ADD at mission level |
| `delta_score` | number | CBP | **MISSING** | ADD (computed) |
| `priority_score` | number | Internal | `priority` (1-5 integer) | REPLACE with continuous score |
| `impact_weighting` | number | Internal | **MISSING** | ADD |
| `risk_reduction_value` | number | Internal | **MISSING** | ADD |
| `mission_type` | string | Internal | **MISSING** | ADD |
| `owner` | string | Internal | `owner` | ✅ EXISTS |
| `timeframe` | string | Internal | `targetDate` | RENAME |
| `status` | string | Internal | `status` | ✅ EXISTS |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** 9 new fields, 3 renames. Current mission entity is objectives/KPI-focused; thesis is delta/portfolio-focused.

#### `Mission_Indicator` (thesis) → `MissionKpi` (current — RESTRUCTURE)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `indicator_id` | string | Internal | No ID (inline object) | CREATE as standalone entity |
| `mission_id` | string | Internal | Implicit (parent) | ADD |
| `source_entity` | string | Internal | **MISSING** | ADD |
| `metric_name` | string | Internal | `name` | RENAME |
| `current_value` | number | Internal | `current` | RENAME |
| `target_value` | number | Internal | `target` | RENAME |
| `delta` | number | Internal | **MISSING** (computed) | ADD |
| `confidence` | number | NATO/Admiralty | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Extract from inline to standalone entity. Moderate.

#### `Mission_Case_Link` (thesis) → `MissionBinding` (current — RENAME + ADD)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `mission_id` | string | Internal | `missionId` | ✅ EXISTS |
| `case_id` | string | Internal | `entityId` | RENAME |
| `contribution_weight` | number | Internal | **MISSING** | ADD |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** 2 field additions + 1 rename. Low effort.

---

### 3.10 Layer 10: Risk, Control & Adherence

#### `Risk_Snapshot` (thesis) → **DOES NOT EXIST as time-series**

All fields CREATE. New entity. (Current `RiskObject` + `RiskScore` are point-in-time, not temporal snapshots.)

#### `Control_Reference` (thesis) → `ControlFramework` + `FrameworkControl` (current — PARTIAL MATCH)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `control_reference_id` | string | Internal | Exists across two entities | SIMPLIFY into one |
| `framework_name` | string | Internal | `frameworkName` | ✅ EXISTS |
| `framework_version` | string | Internal | `version` | ✅ EXISTS |
| `category_or_control` | string | Internal | Split into category + control | FLATTEN thesis-style |
| `description` | string | Internal | `description` | ✅ EXISTS |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Current model is MORE detailed than thesis requires. Keep current + add `standard_marker`. Low effort.

#### `Control_State` (thesis) → `ControlEvaluation` (current — RENAME)

| Thesis Field | Type | Standard | Current State | Action |
|---|---|---|---|---|
| `control_state_id` | string | Internal | `id` | RENAME |
| `asset_id` | string | Internal | Via requirement target | ADD direct ref |
| `control_reference_id` | string | Internal | `controlId` | RENAME |
| `effectiveness_state` | string | Internal | `verdict` | RENAME |
| `validation_state` | string | Internal | **MISSING** | ADD |
| `last_verified` | string | Internal | `evaluatedAt` | RENAME |
| `evidence_pointer` | string | Internal | `evidence` | RENAME |
| `standard_marker` | string | Thesis-wide | **MISSING** | ADD |

**Verdict:** Rename + 2 additions. Low effort.

#### `Adherence_Assertion` (thesis) → **DOES NOT EXIST**

All fields CREATE. New entity.

---

### 3.11 Layer 11: Reporting & Analytics

No new entities required. This layer defines **views** over the data model:
- `Executive_Risk_View`
- `Asset_Posture_View`
- `Case_Metrics_View`
- `Remediation_Metrics_View`
- `Intelligence_Confidence_View`
- `Mission_Portfolio_View`

These map to UI pages. Most exist. `Intelligence_Confidence_View` and `Remediation_Metrics_View` need new pages.

---

## 4. The `standard_marker` Field

The thesis mandates `standard_marker` on **every entity**. This is a simple string field that declares which standard governs that entity's structure.

```typescript
/** Which standard governs this entity's structure */
standard_marker: string;
// Examples: "OCSF 1.3", "ISO/IEC 19770-1:2017", "NIST CSF 2.0", "ITIL 4"
```

This must be added to ALL entities — both new and existing.

---

## 5. Naming Convention Decision

### The Question: camelCase vs snake_case

The thesis uses `snake_case` (e.g. `signal_id`, `source_reliability`, `standard_marker`).
The SDR build uses `camelCase` (e.g. `signalId`, `sourceReliability`).

### Recommendation

**Use snake_case for the thesis-canonical entities** to maintain direct traceability to the thesis document. This means:
- Thesis entities in `packages/contracts/src/thesis/` use snake_case
- TypeScript interfaces use snake_case field names
- This creates 1:1 field traceability between thesis text and code

### Alternative (if you prefer camelCase)

Keep camelCase but maintain a formal mapping table in the data dictionary that shows `thesis_field → code_field` for every field. More TypeScript-idiomatic but requires the extra mapping document.

**YOUR DECISION NEEDED:** snake_case (thesis-literal) or camelCase (TS-idiomatic + mapping table)?

---

## 6. Execution Sequence

### Phase A: Foundation (before any entity work)

| # | Task | Output |
|---|---|---|
| A1 | Create `docs/01_data_dictionary/` structure | Directory + README |
| A2 | Create `packages/contracts/src/thesis/` directory | New canonical entity home |
| A3 | Decide naming convention (snake_case vs camelCase) | Decision recorded |
| A4 | Create base types: `ThesisEntity` base interface with `standard_marker` | Base interface |
| A5 | Create enum files for all thesis enumerations | Enums |

### Phase B: Layer-by-layer entity creation (thesis-canonical)

| # | Layer | Entities | Effort |
|---|---|---|---|
| B1 | Layer 1: Standards Declaration | 1 entity (update existing) | Tiny |
| B2 | Layer 2: Architecture | 3 entities (rewrite + 2 updates) | Medium |
| B3 | Layer 3: Event & Intelligence | 4 entities (1 rewrite + 3 new) | Large |
| B4 | Layer 4: Asset Authority | 4 entities (1 rewrite + 3 new) | Medium |
| B5 | Layer 5: Classification & Posture | 3 entities (all new/restructured) | Medium |
| B6 | Layer 6: CTEM Overlay | 0 entities (field additions only) | Tiny |
| B7 | Layer 7: Case & Remediation | 4 entities (1 update + 3 new) | Medium |
| B8 | Layer 8: Capacity/Maturity/Perf | 9 entities (all new) | Large |
| B9 | Layer 9: Mission & Portfolio | 3 entities (1 rewrite + 1 new + 1 update) | Medium |
| B10 | Layer 10: Risk/Control/Adherence | 4 entities (1 new + 3 updates) | Medium |
| B11 | Layer 11: Reporting | 0 entities (view definitions) | Tiny |

### Phase C: Data Dictionary

For each entity created in Phase B, produce:
- Entity definition with all fields
- Per-field standard attribution
- Per-field data type and constraints
- Per-field relationship to thesis text (section + page reference)
- Per-field relationship to governing standard (clause reference where applicable)

### Phase D: Fixtures (thesis-canonical seed data)

Rewrite all fixtures to use thesis field names and shapes.

### Phase E: Adapters + UI Migration

- Create adapter functions: `legacyAsset → thesisAsset`
- Migrate UI pages domain-by-domain
- Update tests domain-by-domain

---

## 7. Total Scope

| Category | Count |
|---|---|
| **New entities to create** | ~18 |
| **Existing entities to rewrite/restructure** | ~8 |
| **Existing entities needing `standard_marker` only** | ~65 |
| **Total field additions across all entities** | ~120+ |
| **Fixture files to rewrite** | ~82 |
| **Test files to update** | ~60 |
| **UI pages to update** | ~110 (labels/fields, not structure) |

---

## 8. What You Need To Decide Before I Execute

1. **Naming convention:** snake_case (thesis-literal) or camelCase (TS-idiomatic)?
2. **Parallel or replace:** Keep old entities alongside thesis entities (Phase B then E), or replace in-place (break things, fix forward)?
3. **Execution order:** Start with Layer 8 (biggest gap, most novel) or Layer 3 (core intelligence gap) or Layer 1→11 sequential?
4. **The "next issue" you mentioned** — what is it? I'll address it before starting execution.

---

**Last Updated:** 2026-06-10
