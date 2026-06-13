> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Commander SDR — Phase 0 Data, Connector, API & Normalisation Implementation Spec

**Document ID:** `05_Data_Connector_Normalisation_Implementation_Spec_v1_2.md`  
**Document version:** v1.5  
**Status:** Approved Baseline — Build Package Derivation Ready  
**Date:** May 2026  
**Owner:** Johann / Commander SDR Architecture  
**Build phase:** Phase 0  
**Runtime policy:** TypeScript-first production runtime; Python support scripts only under `scripts/python/` or `analytics/`.

---

## 0. Document Control

### 0.1 Purpose of This Document

This document is the single active Phase 0 implementation-governing specification for Commander SDR’s data, connector, API, ingestion, normalisation, asset matching, and identity matching build path.

It consolidates the useful and still-relevant implementation detail from five source documents into one build-ready `.md` file so Codex and other AI agents do not need to work from scattered, partly superseded `.docx` files.

### 0.2 Consolidated Source Inputs

The following source inputs are consolidated into this document:

| Source input | Inclusion status in this spec | Notes |
|---|---|---|
| `SDR — API Strategy (v4).docx` | Consolidated | API categories, naming, request/response standards, scheduling, authority model, connector registry, audit/telemetry, identity API behaviour. |
| `SDR_Core_Data_Model_Baseline_v1.docx` | Partially consolidated | Entity and schema detail reconciled to the Master Technical Specification Phase 0 minimum entity scope. Source-model entities not permitted in Phase 0 are treated as future design detail. |
| `SDR_Identity_Matching_Spec_v1.docx` | Consolidated | Signal weights, thresholds, service-account routing, conflict resolution, `match_metadata`, security constraints, implementation sequence. |
| `SDR_Connector_Specification_v1.docx` | Consolidated | Read-only ingestion, credential handling, delta sync, source authority, push gate, audit trail, lifecycle, first activation, connector specifications. |
| `SDR_Asset_Matching_Dedup_Spec_v1.docx` | Consolidated | Asset matching signal weights, thresholds, asset-class routing, deduplication pipeline, conflict handling, ghost/tombstone concepts, `AssetMatchingConfig`. |

### 0.3 Governing Authority

This document is subordinate to:

1. `Commander_SDR_Master_Proposition_v4_3.md`
2. `Commander_SDR_Master_Technical_Specification_v6_3.md`
3. `SDR_Specification_Schedule_and_Folder_Structure_v1_4.md`
4. `Commander_SDR_AI_Build_Playbooks_v1_7.md`
5. `AGENTS.md`

If this document conflicts with the Master Technical Specification, the Master Technical Specification wins.

If a consolidated source document conflicts with the Master Technical Specification or Proposition, the source document is not imported as-is. It is either rewritten to align, deferred, or marked as a non-authoritative source input.

### 0.4 Drift-Control Rule

This document must not introduce new Commander SDR product capability.

It may only define implementation detail for capabilities already present in the Master Proposition and Master Technical Specification.

The relevant product boundary is:

- Commander SDR maintains a unified asset, identity, exposure, and control model.
- Commander SDR ingests data through connectors.
- Commander SDR normalises source data into canonical entities.
- Commander SDR detects security drift deterministically.
- Commander SDR creates findings and cases.
- Commander SDR has push capability, but Phase 0 implements only the approval gate and does not execute real push.

### 0.6 Version Alignment Note

Version v1.2 updates this implementation specification to align with:

- Commander SDR Master Proposition v4.7
- Commander SDR Master Technical Specification v6.7
- SDR Specification Schedule and Folder Structure v1.6
- Commander SDR AI Build Playbooks v1.2

No new implementation scope is introduced by v1.2. The update is a governance and reference-alignment pass following the creation of the v4.3/v6.3 master baselines.

### 0.5 What This Document Replaces for Phase 0

For Phase 0 build purposes, this document replaces the need for separate standalone Phase 0 documents for:

```text
05_Data_Model_and_Schema.md
09_Connector_Architecture.md
Phase 0 subset of 12_SDR_Normalisation_Strategy.md
Asset_Matching_and_Deduplication_Deep_Dive.md
Identity_Matching_Engine_Deep_Dive.md
API_Strategy_Implementation_Notes.md
```

A fuller Phase 1 normalisation strategy may still be written later if deeper multi-connector mapping, conflict resolution, connector expansion, and tenant-specific normalisation governance require it.

---

## 1. Document Index

| Ref | Section | Focus |
|---:|---|---|
| 0 | Document Control | Authority, consolidation, drift-control rules |
| 1 | Document Index | Navigation and quick reference |
| 2 | Purpose and Scope | What this spec governs and excludes |
| 3 | Authority Reconciliation | How source docs were accepted, rewritten, or deferred |
| 4 | Phase 0 Technology Boundary | TypeScript-first runtime and Python limits |
| 5 | Phase 0 Build Modules Governed | P0 modules covered by this spec |
| 6 | Canonical Entity Scope | MTS-aligned 10-entity Phase 0 scope |
| 7 | Database and Schema Requirements | Phase 0 schema and field requirements |
| 8 | API Layer Model | API categories, naming, request/response standards |
| 9 | Connector Registry and Lifecycle | Connector state, onboarding, health and config |
| 10 | Scheduling and Sync Model | Pull tiers, delta sync, event-triggered pull, first activation |
| 11 | Raw Ingestion and Provenance | Raw payload handling, provenance and evidence rules |
| 12 | Normalisation Pipeline | Source-to-canonical transformation and validation |
| 13 | Source Authority and Conflict Resolution | Primary/enrichment/correlation/validation/fallback model |
| 14 | Asset Matching and Deduplication | Asset signal weights, thresholds, routing and review |
| 15 | Identity Matching | Identity signals, thresholds, service-account path and review |
| 16 | Audit and Operational Telemetry | Audit boundary, telemetry and engineering-health signals |
| 17 | Push Boundary | Phase 0 approval gate only; no real write execution |
| 18 | Worker and Job Contracts | BullMQ job types, payloads, retries and isolation |
| 19 | API Contracts Required for Phase 0 | Minimal endpoints required for P0 build |
| 20 | Testing Requirements | Unit, integration, contract, tenant isolation and matching tests |
| 21 | Codex Build Instructions | How AI agents must implement this spec |
| 22 | Acceptance Criteria | Build-ready and exit criteria |
| 23 | Deferred Detail | What is intentionally not implemented in Phase 0 |
| 24 | Source Consolidation Appendix | What was absorbed from each source file |

### 1.1 Quick Reference

| Need | Look here |
|---|---|
| Which source docs were merged? | Section 0.2 and Section 24 |
| Which Phase 0 entities are allowed? | Section 6 |
| Which data model details were reduced? | Section 3 and Section 23 |
| Connector lifecycle rules | Section 9 |
| Pull tiers and scheduling | Section 10 |
| API naming and response format | Section 8 |
| Source authority model | Section 13 |
| Asset matching thresholds | Section 14 |
| Identity matching thresholds | Section 15 |
| Push/no-push boundary | Section 17 |
| What Codex should build | Section 21 |
| How to test it | Section 20 |
| Done criteria | Section 22 |

---

## 2. Purpose and Scope

### 2.1 Purpose

This specification defines the implementation baseline for:

```text
connector setup
→ read-only pull
→ raw payload capture/provenance
→ normalisation
→ source authority resolution
→ asset and identity matching
→ canonical entity write
→ drift rule input
→ finding/case creation support
→ audit and telemetry
```

It exists to give Codex one coherent build document rather than five separate historic documents.

### 2.2 In Scope

- Phase 0 data model baseline aligned to the Master Technical Specification.
- API categories and request/response standards.
- Connector registry and connector lifecycle.
- Read-only ingestion.
- Credential/secrets handling.
- Pull tiering, first activation, delta sync and checkpoints.
- Raw payload capture and provenance.
- Normalisation pipeline.
- Source authority model.
- Asset matching and deduplication.
- Identity matching.
- Matching review queue behaviour.
- Operational telemetry and engineering-health signals.
- Push approval boundary.
- Phase 0 API and worker contracts.
- Testing and acceptance criteria.

### 2.3 Out of Scope

- Real push execution.
- Coordinated push groups.
- Full 100+ connector ecosystem.
- Per-connector API references for every vendor.
- Full Phase 1+ normalisation catalogue.
- Full identity graph / Stage 3 sweep.
- Full RBAC matrix.
- Commander AI implementation.
- SIEM/SOAR rule generation.
- BAS connector implementation.
- Advanced architecture intelligence.
- Trust boundary intelligence.
- Strategic/tactical priority engine.
- Full UI dashboard composition.

---

## 3. Authority Reconciliation

### 3.1 Relevance Filter Applied

Each source document was filtered using this rule:

| Question | Decision |
|---|---|
| Does it change what Commander SDR is? | Do not import here; would require proposition review. |
| Does it change a governing architecture decision? | Do not import blindly; requires MTS review. |
| Does it provide build-level implementation detail for data, API, connector, normalisation or matching? | Import and reconcile into this spec. |
| Does it propose more Phase 0 entities than the MTS allows? | Keep the logic, but defer extra entities. |
| Does it reference older source documents such as Executive Summary v7? | Treat as historical reference and align wording to current proposition/MTS. |

### 3.2 Key Reconciliation Decisions

| Source area | Decision |
|---|---|
| API Strategy v4 | Accepted as implementation detail for API layer, connector layer, scheduling, audit/telemetry and identity API behaviour. References to older Executive Summary v7 are not carried forward as authority. |
| Core Data Model Baseline v1.2 | Accepted as detailed schema source, but Phase 0 implementation is reduced to the 10 entities defined by the MTS Phase 0 build pack. Extra entities remain deferred design detail. |
| Identity Matching Spec v1 | Accepted as the Phase 0 identity matching engine detail, but full Stage 2/3 identity graph behaviour remains deferred unless specifically included in a P0 ticket. |
| Connector Specification v1 | Accepted for connector lifecycle, read-only ingestion, credential handling, delta sync, source authority, push gate, audit and first activation. Older connector priority assumptions are superseded by the current MTS/schedule. |
| Asset Matching & Dedup Spec v1 | Accepted for matching signals, thresholds, immutable asset class barrier, review bands, dedup pipeline, ghost/tombstone logic and `AssetMatchingConfig` semantics. |

### 3.3 Explicit Non-Drift Decisions

This document does not:

- add a new product capability;
- change the Commander SDR roadmap;
- change the runtime topology;
- change the TypeScript-first build decision;
- add real push execution to Phase 0;
- add Phase 1/2 entities into Phase 0;
- convert historic `.docx` files into active governing documents;
- contradict the Master Technical Specification entity scope.

---

## 4. Phase 0 Technology Boundary

Commander SDR Phase 0 production runtime is TypeScript-first.

| Area | Phase 0 rule |
|---|---|
| Backend/API | TypeScript / Fastify |
| Workers | TypeScript / BullMQ |
| Connector runtime | TypeScript |
| Normalisation runtime | TypeScript |
| Rule engine runtime | TypeScript |
| Schema/migrations | PostgreSQL / Drizzle |
| Validation | Zod |
| Support scripts | Python only under `scripts/python/` or `analytics/` |

Python must not be introduced into:

```text
apps/api/
apps/web/
packages/workers/
packages/connectors/
packages/rules/
packages/db/
packages/contracts/
```

unless explicitly approved by the architecture owner.

---

## 5. Phase 0 Build Modules Governed

This document governs the data/API/connector/normalisation content of:

| Module | This spec governs |
|---|---|
| P0-02 Database schema and migration baseline | Phase 0 entity schemas, Drizzle models, migrations and repositories. |
| P0-04 Connector framework skeleton | Connector registry, lifecycle, status, credential references, config, authority map and health. |
| P0-05 First connector spike | First connector implementation using the current agreed connector target from the MTS/schedule. |
| P0-06 Raw ingestion pipeline | Pull execution, raw payload handling, checkpointing and provenance. |
| P0-07 Normalisation baseline | Source-to-canonical conversion, validation, authority resolution, matching. |
| P0-08 Drift rule engine skeleton | Canonical fields made available for rule evaluation. |
| P0-10 Audit trail baseline | Connector state changes, manual syncs, matching decisions and config changes. |
| P0-11 UI shell | Connector status, asset/identity views, review queue minimum UI hooks. |
| P0-12 Push approval gate only | Push intent model and audit boundary, but no real external write execution. |

---

## 6. Canonical Entity Scope

### 6.1 Binding Phase 0 Entity Rule

The Master Technical Specification Phase 0 build pack limits Phase 0 database implementation to the 10 core entities below.

This document must not expand the Phase 0 canonical entity count unless the MTS is amended.

### 6.2 Phase 0 Canonical Entities

| Entity | Purpose |
|---|---|
| `Asset` | Canonical asset record from source systems. |
| `Identity` | Canonical identity record. |
| `Vulnerability` | Classified vulnerability or exposure condition. |
| `Control` | Security control state per asset/identity/control area. |
| `Case` | Case lifecycle and triage. |
| `Action` | Proposed remediation/action record; no real push execution in Phase 0. |
| `AuditEntry` | Tamper-evident audit trail. |
| `Connector` | Connector lifecycle, status, config, authority, credentials reference and checkpoint. |
| `Tag` | Flexible classification of entities. |
| `CoverageRequirement` | Coverage rules and required controls by asset type, tag and environment. |

### 6.3 Source Model Entities Not Implemented as Phase 0 Tables

The source data model includes useful entities that are not implemented as separate Phase 0 tables unless the MTS is amended.

These are treated as deferred or embedded configuration.

| Source entity/detail | Phase 0 treatment |
|---|---|
| `Tenant` | Required conceptually for tenant isolation; implemented according to auth/tenant module design, not expanded here as additional canonical entity. |
| `Stakeholder` / `User` | Required conceptually for actor/owner references; implemented by auth/RBAC module scope, not expanded here. |
| `AssetMatchingConfig` | Implement as config JSON under tenant/platform config or `Connector`/system config until a dedicated config entity is approved. |
| `IdentityMatchingConfig` | Same treatment as matching config JSON until dedicated config entity is approved. |
| `ConnectorRegistry` | Consolidated into Phase 0 `Connector` entity. |
| `OperationalTelemetry` | May be implemented as log/telemetry sink or technical table only if P0-10 approves it; not canonical entity. |
| `PushAuditLog` | Consolidated under `AuditEntry` for Phase 0; no separate table unless P0-10 approves a separate audit store. |
| `Finding` | May be represented as case/source evidence if MTS P0 package excludes it as a distinct entity; if P0-08 explicitly requires it, it must be approved as a technical record, not an extra canonical entity. |
| `RawRecord` | Prefer object storage or technical ingestion table only if P0-06 approves it; not a canonical entity. |
| `ConnectedAccessChain` | Deferred beyond Phase 0 except minimal references in identity matching and future chain computation design. |
| `SecurityGroup`, `ExceptionRecord`, `PostureBaseline`, `ThreatIntelItem`, `IOCRecord`, `EDRRule`, `EDRModel`, `ArchitecturePattern`, `SecurityDebtItem` | Deferred to Phase 1+. |

### 6.4 Canonical Entity Minimum Fields

#### 6.4.1 Common Fields

Every Phase 0 canonical entity shall include:

```text
id / entity-specific_id
tenant_id
created_at
updated_at
created_by or source_actor where applicable
version or updated sequence where applicable
provenance JSONB where source-derived
```

Every tenant-scoped query must filter by `tenant_id`.

#### 6.4.2 Asset

Minimum fields:

```text
asset_id
tenant_id
name
asset_type
status
lifecycle_state
operational_model
cloud_service_model
environment
criticality
external_ids JSONB
tags JSONB or Tag relationship
source_connector_id
first_seen
last_seen
ip_addresses JSONB/text[]
mac_addresses JSONB/text[]
provenance JSONB
match_metadata JSONB
```

Asset type must be populated during normalisation. Unknown or ambiguous type routes to review; it must not continue silently.

#### 6.4.3 Identity

Minimum fields:

```text
identity_id
tenant_id
identity_type
display_name
canonical_email
status
lifecycle_state
external_ids JSONB
source_systems text[]
mfa_enforced
pim_enforced
privileged
privilege_level
risk_score JSONB
risk_tier
flagged_for_review
match_metadata JSONB
first_seen
last_seen
provenance JSONB
```

Identity is a sensitive domain. Reads require identity-domain permission.

#### 6.4.4 Connector

Minimum fields:

```text
connector_id
tenant_id
name
source_system
category
status
credential_ref
authority_config JSONB
pull_tier
checkpoint JSONB
push_enabled
event_triggered_pull_supported
vendor_api_version
deprecation_date
last_successful_pull_at
config JSONB
depends_on uuid[]
mutual_exclusivity_group
implementation_notes
created_at
updated_at
```

#### 6.4.5 AuditEntry

Minimum fields:

```text
entry_id
tenant_id
actor_id
action
entity_type
entity_id
timestamp
previous_hash
current_hash
detail JSONB
request_id
```

Audit entries are append-only.

---

## 7. Database and Schema Requirements

### 7.1 Schema Rules

- Use PostgreSQL.
- Use Drizzle for schema and migrations.
- Store variable provenance, evidence, source IDs and payload fragments in JSONB.
- Use GIN indexes on JSONB fields that are queried.
- Use B-tree indexes on `tenant_id`, `status`, `severity`, `source_system`, `asset_type`, `identity_type`.
- Avoid PostgreSQL ENUM types for early schema; use varchar plus application validation to avoid heavy migrations.
- Use soft-delete / lifecycle states, not hard deletes.

### 7.2 Tenant Isolation Rules

All tables must include `tenant_id` unless formally global/static.

Repository methods must require tenant context.

No repository method may execute without tenant context except migration/seed/system-health code.

### 7.3 Matching Metadata Storage

Asset and identity matching metadata must be persisted with the canonical entity.

Asset metadata must include:

```text
merge_confidence
contributing_signals[]
penalty_signals[]
source_authority_map
merge_reviewed_by
merge_reviewed_at
reversal_payload_ref
absorbed_asset_ids[]
rejection_log[]
last_evaluated_at
evaluation_version
```

Identity metadata must include:

```text
merge_confidence
contributing_signals[]
source_authority_map
merge_reviewed_by
merge_reviewed_at
reversal_payload_ref
rejection_log[]
last_evaluated_at
evaluation_version
```

No merge may complete unless a reversal payload reference exists.

### 7.4 Technical Support Records

Some implementation support records may be needed for jobs, raw payload staging or telemetry. These must be treated as technical records, not canonical product entities.

Permitted only when explicitly introduced by a P0 ticket:

```text
ingestion_run
raw_record_pointer
matching_review_item
job_dead_letter
telemetry_event
```

These records must not expand the product entity model and must not contradict the MTS Phase 0 canonical entity limit.

---

## 8. API Layer Model

### 8.1 API Purpose

The Commander SDR API layer exists to:

- ingest only the data required for drift, exposure, control health, identity risk and connector health;
- normalise source data into SDR canonical entities;
- provide deterministic APIs for drift detection and case creation;
- enforce pull scheduling discipline;
- gate push operations behind plan/toggle/approval;
- record audit and telemetry;
- avoid SIEM-style raw log ingestion.

### 8.2 API Categories

| Category | Type | Phase 0 position |
|---|---|---|
| Ingestion APIs | PULL | In scope. Read-only only. |
| Drift Detection APIs | INTERNAL | In scope for rule engine/finding/case pipeline. |
| Control and Response APIs | PUSH | Approval/intention model only. No real external write execution. |
| Governance and Intelligence APIs | READ/INTERNAL | Minimal support for dashboards and admin views. |

### 8.3 Naming Convention

Use:

```text
<domain>_<action>_<target>
```

Examples:

```text
asset_get_list
asset_get_details
identity_get_list
identity_get_details
identity_get_entitlements
group_get_membership
finding_create
chain_compute_targeted
control_push_payload
validation_record_result
connector_get_status
connector_trigger_sync
```

### 8.4 API Types

| Type | Meaning |
|---|---|
| `PULL` | Read-only; no source-system side effects. |
| `PUSH` | Write/change/execute; premium-gated; approval-gated; no execution in Phase 0. |
| `INTERNAL` | SDR internal service-to-service API. |
| `MIXED` | Avoid unless explicitly justified in a trigger document. |

### 8.5 Request Shape

```json
{
  "inputs": {},
  "context": {
    "tenant_id": "",
    "request_id": "",
    "actor": "",
    "domain": ""
  }
}
```

### 8.6 Response Shape

```json
{
  "status": "success",
  "data": {},
  "message": "",
  "code": "",
  "request_id": ""
}
```

Error responses must be deterministic and must include the same `request_id`.

### 8.7 API Error Rules

- Rate-limit errors must preserve vendor retry-after detail where available.
- Identity-domain errors must not expose permission details that aid privilege escalation.
- Chain computation timeouts must be named errors when chain features are implemented.
- External dependency errors must be wrapped in SDR error codes.
- All errors must be logged with request ID and tenant context.

---

## 9. Connector Registry and Lifecycle

### 9.1 Connector Principles

Every connector must follow these rules:

1. Ingestion is read-only.
2. Credentials are referenced, never stored or logged.
3. All data is normalised before detection/rule evaluation.
4. Authority is declared per domain.
5. Push is disabled by default.
6. Connector workers never execute push in Phase 0.
7. Connector status affects coverage and engineering-health.
8. First activation triggers full sync.
9. Delta sync is default after first activation.
10. Vendor API versions are pinned and explicitly upgraded.

### 9.2 Connector Lifecycle States

```text
configured
→ authenticating
→ healthy
→ degraded
→ paused
→ failed
```

Rules:

- `configured`: credentials/config exist, not activated.
- `authenticating`: token acquisition/connectivity test in progress.
- `healthy`: successful pulls within expected cadence.
- `degraded`: partial errors, rate limiting, deprecation warning, event stream issues.
- `paused`: admin paused, no pulls.
- `failed`: consecutive failures exceeded threshold.

A degraded or failed connector is a coverage gap and must emit an engineering-health signal.

### 9.3 Connector Onboarding Sequence

1. Admin selects connector.
2. Admin provides credentials through approved secrets flow.
3. System stores only credential reference.
4. Admin declares authority map per domain.
5. Admin configures pull tier and maintenance window where applicable.
6. Admin confirms push remains disabled in Phase 0.
7. System validates connectivity.
8. System validates credential scope.
9. System performs first activation full sync.
10. Connector status moves to healthy or degraded/failed.
11. Delta sync starts from checkpoint.

### 9.4 Connector Registry Fields

The Phase 0 `Connector` entity must include at minimum:

```text
connector_id
tenant_id
name
source_system
category
status
credential_ref
authority_config
pull_tier
checkpoint
push_enabled
push_premium_gated
event_triggered_pull_supported
vendor_api_version
deprecation_date
last_successful_pull_at
depends_on
mutual_exclusivity_group
config
implementation_notes
```

### 9.5 Credential Scope Validation

Every connector must validate whether credentials are:

```text
under_scoped
correctly_scoped
over_scoped
unknown
```

Over-scoped credentials must produce an engineering-health signal.

Under-scoped credentials must block connector activation where required APIs cannot be read.

---

## 10. Scheduling and Sync Model

### 10.1 Pull Tiers

| Tier | Purpose | Phase 0 use |
|---|---|---|
| Tier 1 | Critical near-real-time signals | Limited; identity/offboarding/event-like data where available. |
| Tier 2 | Regular drift detection inputs | Main Phase 0 pull tier. |
| Tier 3 | Baseline and inventory | First activation and scheduled full inventory. |
| Tier 4 | Intelligence and enrichment | Generally deferred. |
| Event-triggered | Webhook/event stream pull | Supported by framework only if needed; full scale deferred. |

### 10.2 Scheduling Principles

- Apply stagger and jitter.
- Enforce per-tenant concurrency caps.
- Respect vendor rate-limit headers.
- Use checkpoint-based recovery.
- Use delta sync after initial activation.
- Record manual out-of-window sync with actor, scope and reason.
- Connector failures must not block unrelated tenants or connectors.

### 10.3 First Activation

First activation always performs a full sync, even outside the maintenance window.

It must log:

```text
first_activation: true
actor
connector_id
tenant_id
started_at
completed_at
record_count
outcome
```

### 10.4 Delta Sync

After first activation, all connectors default to delta sync.

Checkpoint minimum:

```json
{
  "last_sync_at": "",
  "cursor": "",
  "page_token": ""
}
```

Full resync is allowed only when:

- first activation;
- checkpoint invalidated;
- admin manual trigger;
- connector recovery from failed state;
- matching re-evaluation on new connector activation.

### 10.5 Partial Sync Handling

If a pull fails mid-execution:

- preserve successfully processed records;
- checkpoint only the last successfully processed batch;
- emit telemetry with `outcome: partial`;
- retry from checkpoint;
- do not roll back successful partial ingestion.

---

## 11. Raw Ingestion and Provenance

### 11.1 Raw Data Principle

Raw source payloads are evidence and debugging material, not detection inputs.

Rules and detection logic operate on canonical SDR entities, not raw source fields.

### 11.2 Raw Payload Storage

Phase 0 may store raw payloads as:

```text
object storage with DB pointer
or
technical raw_record table if approved by P0-06
```

Raw payloads must include:

```text
tenant_id
connector_id
source_system
vendor_api_version
source_endpoint
pull_run_id or request_id
raw_payload_ref
payload_hash
received_at
normalisation_status
normalised_entity_refs
error_detail
```

### 11.3 Provenance Requirements

Every canonical field written from source data must record:

```text
source_connector_id
source_system
source_field
source_value_hash where sensitive
observed_at
authority_type
normalisation_version
```

### 11.4 Sensitive Data Handling

- Do not store secrets in raw payloads.
- Redact tokens, passwords, private keys, session cookies and bearer tokens.
- Avoid logging full identity entitlement payloads.
- Store PII only where required for canonical Identity function.
- Use retention rules for raw payloads.

---

## 12. Normalisation Pipeline

### 12.1 Pipeline Stages

```text
1. Pull source data
2. Validate source response shape
3. Redact sensitive fields
4. Capture raw payload reference
5. Map source fields to canonical model
6. Coerce types
7. Classify entity type
8. Apply authority map
9. Run matching/deduplication
10. Write canonical entity
11. Emit telemetry/audit where required
12. Trigger rule evaluation where applicable
```

### 12.2 Validation

Use Zod schemas for:

- connector job payloads;
- source response adapters;
- normalised DTOs;
- canonical write DTOs;
- API requests/responses.

Invalid records must not silently drop. They must route to error telemetry and, if material, an engineering-health finding/case.

### 12.3 Entity Classification

`asset_type` and `identity_type` must be set during normalisation.

Unknown entity type routes to review and cannot proceed through matching as if known.

### 12.4 Normalisation Output DTOs

Each connector adapter must emit one or more normalised DTOs:

```text
NormalisedAsset
NormalisedIdentity
NormalisedControl
NormalisedVulnerability
NormalisedCoverageSignal
NormalisedTag
```

Each DTO must include:

```text
tenant_id
connector_id
source_system
source_record_id
source_observed_at
canonical_candidate_fields
provenance
```

---

## 13. Source Authority and Conflict Resolution

### 13.1 Authority Types

Use the current authority vocabulary:

| Type | Meaning |
|---|---|
| Primary Authority | Authoritative source for a data domain. |
| Enrichment Source | Adds context; cannot override populated Primary fields. |
| Correlation Source | Provides linking/pattern signals only. |
| Validation Source | Confirms post-action state only. |
| Fallback Source | Used when Primary unavailable; flagged as fallback. |

Historic terms `secondary` and `corroborating` from source documents are mapped as:

| Historic term | Current treatment |
|---|---|
| secondary | Enrichment or Fallback depending on domain. |
| corroborating | Correlation or Validation depending on usage. |

### 13.2 Conflict Resolution Order

When sources conflict:

```text
Primary Authority
→ Fallback Source
→ Enrichment Source
→ Correlation Source
→ Validation Source
```

Validation sources confirm outcomes; they do not generally populate the canonical model.

### 13.3 Same-Tier Conflicts

If two Primary sources disagree:

- do not silently overwrite;
- retain current value until authority is resolved;
- log conflict to telemetry;
- surface review if business/security material.

### 13.4 Manual Override

Analyst or admin override must:

- be audit logged;
- record actor, reason, old value, new value, timestamp;
- prevent silent overwrite on next ingestion unless override is removed.

---

## 14. Asset Matching and Deduplication

### 14.1 Purpose

The asset matching engine determines whether records from different sources represent the same real-world asset.

False positive merge risk is high because it can corrupt vulnerability, blast-radius and risk calculations.

### 14.2 Asset Matching Thresholds

| Score | Decision | Behaviour |
|---:|---|---|
| `>= 75` | Auto-merge | Merge atomically; store match metadata and reversal payload. |
| `50–74` | Review | Create/route to asset review item. Analyst confirms, rejects, reclassifies or defers. |
| `< 50` | New record | Create distinct asset; re-evaluate if future signals arrive. |
| Any score with asset class hard mismatch | Hard block | Never merge. |

### 14.3 Immutable Barrier

`asset_class_mismatch` is immutable.

If asset types differ, the records must not merge regardless of other matching signals.

If one record has unknown asset type, route to classification review.

### 14.4 Signal Weights

| Signal | Default weight | Applies to | Notes |
|---|---:|---|---|
| `cloud_provider_instance_id` | +55 | cloud workload, data repository, API | Strong deterministic signal within provider/account context. |
| `hardware_serial_number` | +50 | endpoint, server, mobile, OT/IoT, network device | Reject placeholder serial values. |
| `connector_native_id` | +50 | all | Strong within same connector/source. |
| `imei` | +45 | mobile | Near-deterministic for mobile device. |
| `mac_address_set` | +40 | endpoint, server, network, IoT | Suppress invalid/virtual MACs. |
| `kubernetes_workload_identity` | +40 | container | workload + namespace + cluster ID. |
| `cloud_account_resource_path` | +35 | cloud, data, API, pipeline | Account + region + resource path. |
| `hostname_fqdn` | +30 | endpoint, server, network | Exact FQDN only. |
| `software_cpe` | +25 | application, pipeline | Exact CPE strong; partial lower. |
| `purdue_level_zone` | +20 | OT/IoT | Also discriminator. |
| `ip_address_set` | +15 | endpoint, server, network, cloud | Corroborating only. |
| `asset_name_similarity` | +10 | all | Never sufficient alone. |
| `environment_tag_match` | +10 | all | Conflict penalty when different. |
| `owner_organisation_match` | +10 | all | Corroborating only. |

### 14.5 Penalties

| Penalty | Adjustment | Rule |
|---|---:|---|
| `asset_class_mismatch` | -100 | Immutable hard block. |
| `environment_tag_conflict` | -30 | Production and staging should not merge. |
| `purdue_level_conflict` | -40 | OT levels differ. |
| `cloud_provider_conflict` | -50 | AWS vs Azure/GCP resource conflict. |
| `mac_address_virtual_flag` | -10 | Locally administered/virtual MAC risk. |
| `known_placeholder_serial` | -40 | Invalidates serial confidence. |

### 14.6 Asset-Class Routes

| Route | Trigger | Signals |
|---|---|---|
| Cloud workload | `cloud-workload`, data repository, API | provider instance ID → resource path → connector ID → env → owner → name |
| Endpoint/server | endpoint/server | connector ID → serial → MAC → FQDN → cloud ID → IP → env → name |
| Container | container | Kubernetes workload identity → connector ID → resource path → name |
| OT/IoT | OT/IoT | serial → Armis/native ID → MAC → Purdue zone → name |
| Mobile | mobile | IMEI → serial → connector ID → MAC → name |
| Network device | network-device | serial → connector ID → MAC → FQDN → IP → name |
| Application/pipeline | application/pipeline | CPE → connector ID → resource path → environment → name |
| Unknown | null/unknown | classification review; no automatic matching |

### 14.7 Deduplication Pipeline

```text
Stage 1 — Inbound classification
Stage 2 — Candidate lookup
Stage 3 — Score and decide
Stage 4 — Persist and reconcile
```

Rules:

- Evaluate hard barriers first.
- Cap candidate set at a configured maximum.
- If multiple candidates exceed auto-merge, merge only highest-confidence candidate and surface others for review.
- On merge, update all references atomically.
- Store absorbed IDs for traceability.
- Do not allow merge without reversal payload.

### 14.8 Asset Matching Config

Until a dedicated config entity is approved, store matching config under tenant/platform configuration.

Defaults:

```text
auto_merge_threshold = 75
review_floor_threshold = 50
name_similarity_threshold = 0.92
ghost_confirmation_threshold = 2
tombstone_retention_days = 2555
environment_conflict_penalty = -30
max_candidate_list_size = 20
re_evaluation_on_new_connector = true
placeholder_serial_list = [
  "To Be Filled By O.E.M.",
  "0",
  "None",
  "System Serial Number"
]
```

### 14.9 Ghost Assets and Tombstones

An asset is a ghost candidate when it is absent from consecutive pulls but was previously active.

Rules:

- Do not immediately delete or decommission.
- Mark as ghost candidate after configured absent threshold.
- Generate engineering-health or review signal.
- Decommission requires explicit lifecycle transition.
- Tombstones remain for retention period.
- Reactivation from decommissioned requires analyst confirmation.

---

## 15. Identity Matching

### 15.1 Purpose

The identity matching engine determines whether identity records from different systems represent the same human, service account, service principal, API key or machine identity.

False positive identity merge risk is high because it can inflate or corrupt access, entitlement and risk scoring.

### 15.2 Identity Matching Thresholds

| Score | Decision | Behaviour |
|---:|---|---|
| `>= 70` | Auto-merge | Merge; store metadata and reversal payload. |
| `40–69` | Review | Surface to analyst/identity approver queue. |
| `< 40` | New record | Create distinct identity. |
| Service account path | Type-aware routing | Match only on exact external IDs. |

### 15.3 Signal Weights

| Signal | Default weight | Tier | Notes |
|---|---:|---|---|
| `hr_employee_id` | +50 | Deterministic | Authoritative when HR connector exists. |
| `canonical_email` | +45 | Deterministic | Normalise lowercase/trim. |
| `external_ids` key-value | +40 | Deterministic | Okta ID, Entra ID, ARN, GitHub username, etc. |
| `email_alias_or_upn_variant` | +25 | Probabilistic | Tenant alias mapping required. |
| `mfa_device_token` | +20 | Probabilistic | Shared token/phone; corroborating. |
| `phone_number_e164` | +20 | Probabilistic | High false positive risk; corroborating. |
| `manager_chain_overlap` | +10 | Corroborating | Never primary. |
| `display_name_similarity` | +10 | Fuzzy | Never sufficient alone. |

### 15.4 Service Account Path

For:

```text
service-account
service-principal
managed-identity
api-key
machine-account
shared-account
```

rules are:

- bypass email signals;
- bypass name similarity;
- bypass manager-chain signals;
- match only on deterministic external IDs;
- if no external ID match, create a new record;
- do not infer a service account merge from display name.

### 15.5 Identity Conflict Resolution

| Conflict | Rule |
|---|---|
| HR vs directory lifecycle | HR wins for offboarding/lifecycle. |
| Two Primary sources disagree | Most recent value may be held but conflict must be logged and surfaced. |
| Different canonical emails | Do not auto-merge. Route to review. |
| Same field, different authority | Primary wins; non-primary retained as evidence/provenance. |
| Merge reversal needed | Restore pre-merge records, recompute risk/chain where applicable, audit/telemetry event. |

### 15.6 Identity Match Metadata

`Identity.match_metadata` must include:

```text
merge_confidence
contributing_signals[]
source_authority_map
merge_reviewed_by
merge_reviewed_at
reversal_payload_ref
rejection_log[]
last_evaluated_at
evaluation_version
```

### 15.7 Identity Matching Config

Defaults:

```text
auto_merge_threshold = 70
review_floor_threshold = 40
name_similarity_threshold = 0.92
service_account_patterns = ["svc-*", "svc_*", "sa-*"]
re_evaluation_on_new_connector = true
reversal_retention_days = 2555
```

### 15.8 Identity Security Constraints

- Matching results must not be cached in shared cache without tenant+identity scope.
- Pre-merge reversal snapshots require elevated identity permission.
- Analyst review items notify identity approver.
- Bulk merge sweeps require change control where threshold exceeded.
- Commander AI must not infer identity matches.
- Matching decisions are deterministic only.

---

## 16. Audit and Operational Telemetry

### 16.1 Audit Boundary

Audit is append-only and tamper-evident.

AuditEntry must record:

```text
actor
tenant_id
action
entity_type
entity_id
timestamp
previous_hash
current_hash
detail
request_id
```

Audited events include:

- connector created/updated/deleted/paused/resumed;
- credential reference changed;
- authority map changed;
- manual sync triggered;
- matching config changed;
- asset/identity merge confirmed/rejected;
- lifecycle override;
- push intent/approval/rejection;
- admin override.

### 16.2 Operational Telemetry

Telemetry records health/behaviour, not compliance-grade audit.

Telemetry events include:

```text
pull-execution
event-triggered-pull
connector-state-transition
rate-limit
scheduler-decision
push-gate-rejection
asset-deduplication
asset-classification-required
ghost-asset-detected
identity-matching-evaluation
identity-merge
normalisation-error
partial-sync
vendor-deprecation-warning
```

### 16.3 Engineering-Health Signals

Engineering-health signals are drift indicators, not incidents.

Examples:

- connector degraded/failed;
- stale checkpoint;
- over-scoped credentials;
- under-scoped credentials;
- rate limit sustained;
- vendor API deprecation;
- normalisation failure spike;
- asset classification required;
- matching review queue growing;
- source authority conflict.

---

## 17. Push Boundary

### 17.1 Phase 0 Rule

No real external push execution is implemented in Phase 0.

Phase 0 may implement:

```text
push intent
push proposal
approval chain
payload preview
rollback placeholder
audit entry
gate rejection
```

Phase 0 must not implement:

```text
external write API calls
identity disable
group membership removal
IAM policy mutation
firewall rule change
IOC deployment
coordinated push group execution
rollback execution
```

### 17.2 Push Gate Rules

Even though real push does not execute in Phase 0, the gate model must be present:

```text
plan tier eligible
tenant push toggle enabled
connector push enabled
action approved
rollback payload prepared
audit entry written
```

If any gate fails, the action remains blocked and an audit/telemetry entry is created.

---

## 18. Worker and Job Contracts

### 18.1 Worker Types

| Worker | Phase 0 responsibility |
|---|---|
| Connector pull worker | Executes connector pull jobs. |
| Normalisation worker | Converts raw/normalised DTOs to canonical entities. |
| Matching worker | May process review/re-evaluation jobs where async. |
| Drift evaluation worker | Consumes canonical state and evaluates initial YAML rules. |
| Audit/telemetry worker | Writes async telemetry if used. |
| Push worker | Approval gate only; no external execution. |

### 18.2 Job Payload Common Fields

Every job payload must include:

```json
{
  "job_id": "",
  "tenant_id": "",
  "request_id": "",
  "actor": "",
  "job_type": "",
  "created_at": "",
  "idempotency_key": "",
  "payload": {}
}
```

### 18.3 Required Job Types

```text
connector.pull
connector.validate_credentials
connector.first_activation
connector.delta_sync
normalisation.process_record
matching.asset_evaluate
matching.identity_evaluate
drift.evaluate_entity
case.create_from_finding
push.evaluate_gate
telemetry.emit
```

### 18.4 Retry and Dead-Letter

- All jobs require retry policy.
- External dependency failures use exponential backoff with jitter.
- Deterministic validation failures do not retry.
- Dead-letter jobs must preserve payload, error, tenant, connector and request ID.
- Dead-letter queues must be visible to admins or engineers.

### 18.5 Tenant Isolation in Workers

Workers must validate `tenant_id` before processing.

A worker must not use connector credentials unless the credential reference belongs to the job tenant.

---

## 19. API Contracts Required for Phase 0

### 19.1 Connector Admin APIs

```text
GET    /api/v1/connectors
POST   /api/v1/connectors
GET    /api/v1/connectors/{connector_id}
PATCH  /api/v1/connectors/{connector_id}
POST   /api/v1/connectors/{connector_id}/validate
POST   /api/v1/connectors/{connector_id}/activate
POST   /api/v1/connectors/{connector_id}/pause
POST   /api/v1/connectors/{connector_id}/resume
POST   /api/v1/connectors/{connector_id}/sync
GET    /api/v1/connectors/{connector_id}/health
```

### 19.2 Asset APIs

```text
GET    /api/v1/assets
GET    /api/v1/assets/{asset_id}
GET    /api/v1/assets/{asset_id}/provenance
GET    /api/v1/assets/{asset_id}/findings
GET    /api/v1/assets/{asset_id}/cases
```

### 19.3 Identity APIs

```text
GET    /api/v1/identities
GET    /api/v1/identities/{identity_id}
GET    /api/v1/identities/{identity_id}/provenance
```

Access requires identity-domain permission.

### 19.4 Matching Review APIs

```text
GET    /api/v1/review/asset-matches
POST   /api/v1/review/asset-matches/{review_id}/confirm
POST   /api/v1/review/asset-matches/{review_id}/reject
POST   /api/v1/review/asset-matches/{review_id}/reclassify

GET    /api/v1/review/identity-matches
POST   /api/v1/review/identity-matches/{review_id}/confirm
POST   /api/v1/review/identity-matches/{review_id}/reject
```

### 19.5 Audit and Telemetry APIs

```text
GET    /api/v1/audit
GET    /api/v1/telemetry/connectors
GET    /api/v1/telemetry/ingestion
```

### 19.6 Push Gate APIs

```text
POST   /api/v1/actions/{action_id}/evaluate-gate
POST   /api/v1/actions/{action_id}/approve
POST   /api/v1/actions/{action_id}/reject
```

No endpoint executes an external push in Phase 0.

---

## 20. Testing Requirements

### 20.1 Unit Tests

Required for:

- connector state transitions;
- API request/response validation;
- authority resolution;
- asset matching signal evaluators;
- identity matching signal evaluators;
- match threshold decisions;
- hard-block conditions;
- service-account routing;
- push gate decisions.

### 20.2 Integration Tests

Required for:

- connector activation;
- first full sync;
- delta sync from checkpoint;
- normalisation to canonical entity;
- asset merge with reversal payload;
- identity merge with reversal payload;
- review queue confirm/reject;
- audit entry append;
- tenant isolation across repository methods.

### 20.3 Contract Tests

Required for:

- connector admin APIs;
- asset APIs;
- identity APIs;
- matching review APIs;
- push gate APIs.

### 20.4 Tenant Isolation Tests

Must prove:

- Tenant A cannot see Tenant B connector.
- Tenant A cannot see Tenant B asset.
- Tenant A cannot see Tenant B identity.
- Worker job for Tenant A cannot access Tenant B credentials.
- Matching candidate lookup is tenant-scoped.

### 20.5 Matching Tests

Asset matching tests:

```text
cloud ID deterministic merge
asset class mismatch hard block
environment conflict penalty
IP-only no auto-merge
MAC virtual penalty
multi-candidate highest-only auto-merge
review band creates review item
rejection prevents resurfacing
reversal payload required
```

Identity matching tests:

```text
HR employee ID deterministic merge
canonical email normalisation
service account external-ID-only path
display name alone no merge
different canonical emails no auto-merge
review band creates review item
HR offboarding wins lifecycle conflict
reversal payload required
```

### 20.6 Security Tests

Required:

- credential values are never logged;
- over-scoped credential signal generated;
- push execution cannot occur;
- identity read requires identity-domain permission;
- audit append-only behaviour;
- raw payload redaction.

---

## 21. Codex Build Instructions

### 21.1 Context to Load

Before implementing any P0 task governed by this spec, Codex must read:

```text
AGENTS.md
README.md
Commander_SDR_Master_Proposition_v4_3.md
Commander_SDR_Master_Technical_Specification_v6_3.md
SDR_Specification_Schedule_and_Folder_Structure_v1_4.md
Commander_SDR_AI_Build_Playbooks_v1_7.md
05_Data_Connector_Normalisation_Implementation_Spec_v1_2.md
```

### 21.2 General Instructions

Codex must:

- implement only the assigned P0 issue;
- preserve the MTS Phase 0 entity boundary;
- use TypeScript for production runtime;
- use Drizzle for schema;
- include tests;
- not introduce Python into runtime;
- not implement real push;
- not expand to Phase 1/2 features;
- explain intended file changes before editing.

### 21.3 Source Docs Rule

Codex must not build directly from the five source `.docx` files.

Those documents are consolidated into this spec.

If a source `.docx` appears to contradict this spec, this spec wins unless the architecture owner amends it.

### 21.4 Scope Control Prompt

Use this if Codex overbuilds:

```text
Stop. You are exceeding Phase 0 scope.

Use 05_Data_Connector_Normalisation_Implementation_Spec_v1_2.md as the active build authority for data, API, connector, ingestion, normalisation, asset matching, and identity matching.

Do not implement Phase 1/2 features.
Do not introduce extra canonical entities beyond the MTS Phase 0 scope.
Do not execute real push.
Retry with only the assigned issue scope.
```

---

## 22. Acceptance Criteria

This spec is satisfied for Phase 0 when:

```text
Connector can be configured.
Credential reference can be stored without raw secret.
Connector can validate scope/connectivity.
First activation full sync can run.
Delta sync checkpoint is stored.
Raw payload evidence/provenance is captured or referenced.
Source records normalise into canonical Asset/Identity/Control/Vulnerability data.
Source authority map is applied.
Asset matching works with thresholds and review band.
Identity matching works with thresholds and service-account route.
Review queue confirm/reject updates canonical state.
Audit records are append-only.
Telemetry records connector and ingestion health.
Push gate can approve/reject/propose but cannot execute external writes.
Initial drift rules can consume canonical data.
Findings/cases can be created from normalised state.
Tenant isolation tests pass.
```

---

## 23. Deferred Detail

The following are intentionally deferred:

| Detail | Deferred to |
|---|---|
| Full normalisation field catalogue per connector | Phase 1 Normalisation Strategy or connector API reference |
| 20+ connector implementations | Phase 1+ connector batches |
| Full identity graph and Stage 3 sweep | Unified Identity Architecture |
| Real push execution | Push Engine Architecture |
| Coordinated push groups | Coordinated Push Group Schema |
| BAS simulation | BAS Connector Integration Contract |
| Full telemetry/observability SLOs | Performance, Scaling & Operational Spec |
| Full RBAC matrix | Full RBAC Permission Matrix |
| Tool intelligence | Security Tool Intelligence Specification |
| Architecture intelligence | Architecture Intelligence Engine |
| Trust boundary model | Trust Boundary & Third-Party Intelligence Spec |
| Shared responsibility profiles | Shared Responsibility Profile & Configuration Governance Spec |

---



### 23A. Closed-Loop Email Phase Boundary

The closed-loop email enhancement introduced in Master Proposition v4.7 and MTS v6.7 is not added to the Phase 0 canonical entity scope governed by this document.

The following entities are Phase 1 child-spec governed by Spec #26a unless the owner explicitly promotes them:

```text
CommunicationMailbox
CaseEmailThread
CaseEmailMessage
CommunicationEvent
EmailTemplate
EmailCorrelationCandidate
```

Phase 0 data, connector, ingestion and normalisation work SHALL NOT implement Microsoft Graph case-email ingestion, mailbox subscription renewal, email send workers, or email lifecycle tables unless the Phase 0 build scope is formally amended.

If Phase 1 work begins, Spec #26a SHALL govern the schema, API contracts, tenant isolation, provenance and audit requirements for email lifecycle data. This document remains the authority for general connector, tenant isolation, provenance and normalisation patterns.

## 24. Source Consolidation Appendix

### 24.1 API Strategy v4 — Absorbed Items

Absorbed:

- API categories: ingestion, drift detection, control/response, governance/intelligence.
- Naming convention.
- Request/response standards.
- Pull tiers.
- Event-triggered pull pattern.
- Connector registry fields.
- Authority classification.
- Audit vs telemetry boundary.
- Identity API considerations.
- Push-gate rules.

Not carried forward as current authority:

- Any reference to older executive summary/product spec versions.
- Any implication that real push executes in Phase 0.
- Any connector priority that conflicts with current MTS/schedule.

### 24.2 Core Data Model Baseline v1.2 — Absorbed Items

Absorbed:

- Entity field patterns.
- Tenant isolation conventions.
- Asset/Identity/Connector/Audit/Case/Action field ideas.
- Matching config defaults.
- JSONB/provenance/indexing conventions.
- No hard-delete principle.
- Risk and lifecycle semantics.

Rewritten/reduced:

- The 38-entity model is not implemented as 38 Phase 0 tables.
- Phase 0 follows the MTS 10 canonical entity limit.
- Additional entities are deferred or represented as embedded JSON/config where necessary.

### 24.3 Identity Matching Spec v1 — Absorbed Items

Absorbed:

- Signal weights.
- Thresholds.
- Review band.
- Service-account routing.
- Conflict handling.
- `match_metadata`.
- Reversal payload requirement.
- Security constraints.
- Implementation order.

Deferred:

- Full chain computation behaviour beyond minimal trigger/reference fields.
- Bulk matching operations requiring mature change control unless explicitly scoped.

### 24.4 Connector Specification v1 — Absorbed Items

Absorbed:

- Read-only ingestion.
- Credentials handling.
- Delta sync.
- Source authority.
- Push disabled by default.
- Audit trail principle.
- Connector lifecycle.
- First activation.
- Rate-limit and scheduling principles.
- Health/degraded/failed coverage signal.

Rewritten:

- Historic authority terms are mapped to current vocabulary.
- Connector priority is governed by MTS/schedule, not the historic tranche list.

### 24.5 Asset Matching & Dedup Spec v1 — Absorbed Items

Absorbed:

- Signal weights.
- Thresholds.
- Immutable asset-class mismatch.
- Penalty signals.
- Asset-class routing.
- Four-stage deduplication pipeline.
- Field-level conflict handling.
- Ghost/tombstone behaviour.
- `AssetMatchingConfig` defaults.

Rewritten:

- Dedicated `AssetMatchingConfig` table is not mandatory in Phase 0 unless approved; config may be embedded until schema expands.
- Any extra review entities are technical records only, not canonical entities.

---

## 25. Final Build Rule

For any Codex or AI implementation task touching data, connector, API, ingestion, normalisation, asset matching, or identity matching:

```text
Use this document as the active implementation authority.
Do not use the five source .docx documents as active authority.
Do not expand Phase 0 beyond the Master Technical Specification.
Do not implement real push.
Do not introduce extra runtime languages.
Do not build outside the assigned issue.
```


---

# Data / Connector / Normalisation Addendum v1.5 — Communication and SIR Entities

## Scope

This addendum records Phase 1 data-model requirements for closed-loop email, communication administration, hierarchical case communication and SIR. These entities are not part of the Phase 0 ten-entity build unless explicitly promoted.

## Required Phase 1 Entities / Technical Records

```text
CommunicationMailbox
CommunicationPlaybook
CommunicationApprovalPolicy
CommunicationApprovalStep
RecipientClassification
EmailDraft
CaseEmailThread
CaseEmailMessage
CommunicationEvent
EmailCorrelationCandidate
SIRReferralRecord
RedactionPolicy
EmailTemplateVersion
MailboxHealthSignal
ThreadLinkageDecision
```

## Linkage Requirements

All communication records SHALL be tenant-scoped and support hierarchical linkage:

```text
tenant_id
parent_case_id
sub_case_id nullable
action_id nullable
case_swarm_id nullable
workstream_id nullable
thread_id nullable
message_id nullable
```

## SIR Referral Record

`SIRReferralRecord` SHALL preserve originating parent case, sub-case/action/workstream context and incident-team acknowledgement state.

## Audit and Provenance

Manual link, unlink, move, split, merge, lock, suppression, approval and SIR actions SHALL be preserved as audit/provenance events. No thread movement shall overwrite original provenance.


---

# Closed Architecture Decisions — Approved Build-Ready Baseline v1.0

The following decisions are now closed for this baseline and SHALL govern all downstream child specifications, implementation tickets, AI-agent work and manual review activity.

| ID | Decision Area | Binding Decision |
|---|---|---|
| CAD-EMAIL-001 | Microsoft Graph permissions | SDR SHALL use least-privilege Microsoft Graph permissions with tenant administrator consent. Approved mailboxes SHALL be explicitly configured. SDR SHALL NOT assume unrestricted tenant-wide mailbox access. Where application permissions are required, access SHALL be constrained to approved mailboxes through Microsoft 365 / Exchange controls and recorded in the tenant audit trail. |
| CAD-EMAIL-002 | Email body storage | SDR SHALL default to metadata-first email storage. Full message body storage SHALL be disabled by default and enabled only through tenant retention/evidence policy, explicit analyst evidence capture, SIR generation, or regulated deployment configuration. SIR bodies generated by SDR SHALL be stored as case evidence and audit material. |
| CAD-EMAIL-003 | Mailbox rollout sequence | The initial closed-loop email implementation SHALL prioritise tenant-approved shared mailboxes as the primary operational mailbox type. Microsoft 365 group mailboxes SHALL follow after shared mailbox support. Individual user mailbox sending SHALL be supported later where required, but SHALL NOT be the baseline operational model. |
| CAD-SIR-001 | SIR acknowledgement | SIR acknowledgement SHALL be supported in Phase 1 through email reply correlation, manual acknowledgement, and optional incident reference capture. Full incident-management platform integration is deferred and SHALL NOT block SIR capability. A SIR creates a governed hand-off; it does not convert the SDR case into an incident record. |
| CAD-VM-001 | VM closure gates | VM communication closure gates SHALL be provided as a configurable policy. The default tenant posture SHALL surface advisory closure checks without hard-blocking closure unless the tenant enables enforcement. For externally notified, KEV, SIR-linked, or risk-accepted vulnerability cases, SDR SHOULD recommend enforced closure gates. |
| CAD-GOV-001 | Communication approval chain | Communication approval SHALL be resolved through the tenant-configured Communication Permission and Approval Chain Matrix. Approval routing SHALL support upward chain-of-command resolution from the originating case, sub-case, action, swarm workstream, mailbox, queue, team, and recipient class. SDR SHALL NOT hard-code grade-based approval rules, although default templates MAY be supplied. |
| CAD-SIR-002 | SIR origination from sub-case/action | Authorised users SHALL be able to raise a Security Incident Report / Referral from a parent case, sub-case, case action, or case swarm workstream. The SIR SHALL preserve linkage to the originating object and SHALL roll up to the parent case timeline, communication record, audit trail, and evidence pack. The generated SIR summary SHALL include both parent case context and originating object context. |

## Baseline Status

There are no remaining open architecture decisions for the closed-loop email, Communication Administration, SIR, sub-case/action communication, or VM mailbox workflow enhancement pack. Implementation-level choices such as exact API field names, UI component layout and test fixture contents remain subordinate specification or build-ticket matters and SHALL NOT reopen the architecture decisions above.


---

# CHANGE-ARCH-002 Alignment Addendum — Domain-Segmented PostgreSQL and Performance Baseline

## Domain schema strategy

Commander SDR SHALL use a single PostgreSQL database in Phase 0/1, logically segmented by domain schemas. Tables SHALL NOT be created casually in the `public` schema unless explicitly approved for infrastructure/meta reasons.

Baseline domain schemas:

```text
core
asset
identity
exposure
control
case_mgmt
communication
connector
normalisation
rule_engine
push
compliance
architecture
tooling
audit
admin
ai
```

## Performance rules

- Every tenant-scoped table SHALL include `tenant_id`.
- Tenant-scoped indexes SHOULD begin with `tenant_id`.
- Cursor pagination SHALL be preferred over offset pagination.
- High-volume tables SHOULD use partitioning or retention-aware storage where appropriate.
- Candidate high-volume tables include audit entries, raw ingestion records, rule execution history, email messages, connector run records, and telemetry.
- Selected JSONB fields MAY use GIN indexes only where query patterns justify them.
- Dashboard workloads SHOULD use cached read models, materialised views, OpenSearch, or precomputed aggregates rather than repeated heavy transactional queries.
- OpenSearch SHALL support broad full-text and cross-entity search; PostgreSQL SHALL remain the system of record.

## Domain repository rule

Backend code SHALL use repository/service boundaries aligned to database domains. AI agents SHALL identify the target domain schema before adding or changing a table.


---

# CHANGE-ARCH-002 Alignment Addendum — Asset Rationalisation & Anomaly Check

## Capability definition

Commander SDR SHALL include Asset Rationalisation & Anomaly Check to identify duplicate, stale, orphaned, conflicting, misclassified, and anomalous asset records across connected sources.

## Baseline checks

The capability SHALL support detection of:

```text
duplicate assets
orphaned assets
ghost/stale assets
missing ownership
missing business-unit mapping
conflicting source records
Tenable/scanner sees asset but EDR does not
EDR sees asset but vulnerability scanner does not
decommissioned asset still active
decommissioned asset still internet-facing
internal asset exposed externally
conflicting OS or version information
duplicate IP reuse
ephemeral asset misclassified as persistent
disabled owner identity assigned to active asset
attack surface intended/actual mismatch
```

## Outputs

Asset rationalisation outputs MAY include:

```text
data-quality findings
asset rationalisation cases
merge/split suggestions
source-authority recommendations
ownership enrichment tasks
architecture anomaly findings
tool coverage anomalies
```

This capability SHALL support asset trust, ownership accuracy, vulnerability applicability, coverage scoring, blast-radius computation, architecture topology integrity, and tool coverage intelligence.


---

# CHANGE-ARCH-002 Explicit Deferral — Connector Data Flush

Connector Data Flush is deferred. This specification SHALL NOT be interpreted as authorising deletion or flushing of connector data unless a later approved change explicitly introduces that governed capability.


---

# DOCUMENT-SPECIFIC REVISION PATCH — 05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md

**Patch date:** 2026-05-13  
**Patch type:** Functional review remediation  
**Authority:** Closed-loop doctrine patch v2.0  

## Required Update Applied

This document is updated to align with Commander SDR closed-loop doctrine and the functional review remediation baseline.

## Mandatory Build Interpretation

- Any previous language in this document that permits manual case creation, manual lifecycle progression, manual closure, manual reopening, optional case promotion for actionable risk, or unbound risk handling is superseded.
- Manual remediation remains permitted only as a remediation execution method, not as a case lifecycle authority.
- Manual evidence, manual acknowledgement, manual approval, and manual challenge are permitted only as audited inputs to deterministic system decisions.
- Every feature in this document SHALL define case binding, sub-action binding, validation state, closure gate, reopening trigger, routing decision, prioritisation impact, strategy dependency, UI surface, and Fusion Map binding before implementation.


---

# REVISION ADDENDUM — CLOSED-LOOP FUNCTIONAL DOCTRINE PATCH v2.0

**Status:** SUPERSEDING ADDENDUM  
**Effective date:** 2026-05-13  
**Applies to:** all Commander SDR functional, technical, UI, case, workflow, routing, strategy, communication, validation, automation, data model, and build artefacts.

## 1. Supersession Rule

Where this document previously permits or implies any of the following, this addendum supersedes that language:

- manual freeform case creation;
- manual lifecycle progression;
- manual case closure;
- manual case reopening;
- unbound findings;
- optional case promotion for risk objects;
- lifecycle decisions owned by analysts rather than deterministic system rules;
- UI controls that mutate lifecycle state directly;
- case assignment modes that prevent deterministic routing from producing an auditable route decision.

Human users may submit evidence, approve governed exceptions, approve high-risk automation, challenge a system decision, request validation refresh, request routing review, prioritise work, annotate records, and confirm business context. Human users do not directly create, close, reopen, or progress lifecycle state.

## 2. Non-Negotiable Closed-Loop Doctrine

Commander SDR SHALL enforce the following doctrine:

1. **No manual case creation.** Cases are generated only from normalised risk objects, communication-ingested risk objects, tool-health objects, exposure objects, drift objects, vulnerability objects, control objects, identity objects, coverage objects, architecture objects, blast-radius objects, or governed residual-risk/debt objects.
2. **Every risk object is case-bound.** No risk object may remain operationally actionable without a parent case or a deterministic case-linking decision.
3. **Prioritisation-only interaction.** Operators may prioritise, annotate, challenge, approve, suppress, or provide evidence. They may not directly mutate lifecycle state.
4. **Automatic routing.** The routing engine SHALL produce the route, owner, team, approval path, escalation path, and rationale for every case and blocking sub-action.
5. **Automatic sub-action generation.** The case engine SHALL generate sub-actions from risk decomposition, remediation options, validation dependencies, communication requirements, ownership boundaries, push requirements, and approval requirements.
6. **Automatic validation.** Technical validation SHALL be system-owned and evidence-driven.
7. **Automatic closure.** Closure SHALL be system-owned and SHALL occur only when all configured closure gates are satisfied.
8. **Automatic reopening.** Reopening SHALL be system-owned and SHALL occur when any configured reopening trigger fires.
9. **Automatic communication binding.** Inbound and outbound case communication SHALL bind to a case, sub-action, risk object, external notification, or allocation queue object.
10. **Audit-first operation.** Every decision SHALL emit a machine-readable rationale and immutable audit event.

## 3. Universal Risk Object Contract

Every domain SHALL emit or link to a canonical `RiskObject` with these minimum fields:

| Field | Requirement |
|---|---|
| `risk_object_id` | Required immutable identifier. |
| `risk_object_type` | Required enum: identity, architecture, vulnerability, exposure, control, drift, tool_health, coverage, blast_radius, asset, communication, trust_boundary, BAS, SIEM_SOAR, shared_responsibility, security_debt, exception. |
| `domain` | Required owning domain. |
| `source_systems[]` | Required source list. |
| `affected_entities[]` | Required canonical entity references. |
| `case_binding_status` | Required enum: bound, linked_to_existing, suppressed_by_policy, pending_allocation_error. |
| `case_id` | Required unless suppressed by approved policy. |
| `sub_action_ids[]` | Required when decomposition generates work. |
| `validation_state` | Required universal validation state. |
| `routing_state` | Required universal routing state. |
| `priority_score` | Required computed priority. |
| `closure_gate_state` | Required aggregate closure gate state. |
| `reopen_trigger_state` | Required aggregate reopening trigger state. |
| `mission_impact` | Required nullable object. |
| `fusion_map_refs[]` | Required node and edge references. |

## 4. Universal Case Lifecycle

The closed-loop case lifecycle SHALL be:

1. `DETECTED`
2. `BOUND`
3. `ROUTED`
4. `PRIORITISED`
5. `ACTION_DECOMPOSED`
6. `IN_PROGRESS`
7. `PENDING_VALIDATION`
8. `VALIDATION_RUNNING`
9. `VALIDATED_FIXED` / `VALIDATED_COMPENSATED` / `VALIDATED_SUPPRESSED` / `VALIDATED_RESIDUAL_ACCEPTED` / `VALIDATION_FAILED` / `VALIDATION_INCONCLUSIVE`
10. `PENDING_CLOSURE_GATES`
11. `CLOSED_BY_SYSTEM`
12. `REOPENED_BY_SYSTEM`

Forbidden lifecycle states or interactions:

- user-created case;
- user-closed case;
- user-reopened case;
- analyst-only lifecycle progression;
- unvalidated closure;
- closure based only on ITSM or email acknowledgement.

## 5. Universal Sub-Action Lifecycle

Every blocking sub-action SHALL use this lifecycle:

1. `GENERATED`
2. `ROUTED`
3. `OWNER_NOTIFIED`
4. `EVIDENCE_REQUIRED`
5. `IN_PROGRESS`
6. `PENDING_APPROVAL` when applicable
7. `PENDING_EXECUTION` when applicable
8. `PENDING_VALIDATION`
9. `VALIDATED`
10. `FAILED_VALIDATION`
11. `SUPPRESSED_APPROVED`
12. `RESIDUAL_ACCEPTED`
13. `CLOSED_BY_SYSTEM`
14. `REOPENED_BY_SYSTEM`

Parent cases SHALL NOT close while a blocking sub-action is unresolved unless an approved exception, approved suppression, or accepted residual-risk record exists.

## 6. Universal Validation Lifecycle

Validation SHALL use these states:

- `NOT_STARTED`
- `EVIDENCE_REQUESTED`
- `EVIDENCE_RECEIVED`
- `VALIDATION_RUNNING`
- `VALIDATED_FIXED`
- `VALIDATED_COMPENSATED`
- `VALIDATED_NOT_FIXED`
- `VALIDATION_INCONCLUSIVE`
- `VALIDATION_BLOCKED`
- `VALIDATION_EXPIRED`
- `REVALIDATION_REQUIRED`

Validation SHALL be triggered by source refresh, connector delta, owner evidence, push execution, BAS result, SIEM/SOAR deployment status, control-state change, scanner refresh, identity graph change, architecture graph change, or communication evidence.

## 7. Universal Closure Gates

A case SHALL close only when all configured gates are satisfied:

- technical validation gate;
- sub-action completion gate;
- communication gate where configured;
- external notifier gate where configured;
- SIR acknowledgement gate where configured;
- SLA/residual phase gate;
- exception/suppression expiry gate;
- evidence freshness gate;
- approval gate;
- audit completeness gate;
- mission-impact gate;
- fusion-map state refresh gate.

Closure SHALL be executed by the system after gate evaluation. User confirmation may be recorded as evidence, not as lifecycle authority.

## 8. Universal Reopening Triggers

A closed case SHALL reopen automatically when any configured trigger fires:

- original risk condition reappears;
- risk object source changes severity or exploitability;
- KEV, CVSS, EPSS, MISP, vendor, BAS, or threat-intel status changes materially;
- validation expires or fails;
- compensating control disappears or degrades;
- affected asset, identity, exposure, or dependency expands;
- blast radius expands;
- mission objective impact increases;
- routing owner rejects or cannot fulfil work;
- communication thread receives material inbound evidence;
- connector freshness drops below threshold;
- tool coverage degrades;
- suppression or exception expires;
- strategy threshold changes and requalifies the case.

## 9. Universal Routing Model

Routing SHALL consider:

- domain;
- risk object type;
- owner of affected asset, identity, application, cloud account, tool, control, or business service;
- business unit;
- tenant and organisation;
- environment;
- severity;
- priority;
- blast radius;
- mission impact;
- operational tempo;
- required skills;
- team affinity;
- workload;
- escalation path;
- approval authority;
- time zone;
- communication ownership;
- shared-responsibility profile;
- automation boundary.

The route decision SHALL be visible in the UI with route rationale and route challenge controls. Route challenge does not directly reroute the case; it requests route recalculation or approval review.

## 10. Strategy Layer Runtime Surfaces

Commander SDR SHALL expose runtime strategy surfaces for:

- SLA strategy;
- thresholds;
- automation boundaries;
- routing;
- posture objectives;
- mission objectives;
- operational tempo;
- domain-specific strategy;
- prioritisation weights;
- validation windows;
- closure gates;
- reopening triggers.

## 11. Fusion Map Binding

Every domain SHALL project into the multi-domain Fusion Map using node, edge, overlay, and case-binding rules. The Fusion Map SHALL include:

- risk overlay;
- drift overlay;
- exposure overlay;
- control overlay;
- coverage overlay;
- blast-radius overlay;
- identity overlay;
- vulnerability overlay;
- architecture overlay;
- tool-health overlay;
- mission overlay;
- validation overlay;
- SLA overlay;
- communication overlay;
- routing overlay.

Every actionable map node SHALL open a bound case, risk object, validation object, sub-action, or communication object. The map SHALL NOT create freeform cases.

## 12. Shell UI Binding

The Shell UI SHALL expose, at minimum:

- Command Centre;
- Case Management;
- Fusion Map;
- Strategy Centre;
- Mission Control;
- System Pulse;
- Team Pulse;
- Domain Pulse;
- Validation Console;
- Routing Console;
- Closure Gates;
- Reopening Queue;
- Communication Centre;
- Automation Boundaries;
- Tool Health;
- Controls;
- Drift;
- Coverage;
- Blast Radius;
- Prioritisation Console.

Any shell frame that lacks these routes is incomplete and SHALL be treated as a visual shell only, not a functional UI authority.


## Universal Domain Lifecycle Matrix

| Domain | Required case lifecycle binding | Required validation | Required reopening | Required routing | Required UI surface | Required Fusion Map layer |
|---|---|---|---|---|---|---|
| Identity | Identity risk, privilege drift, access drift, stale identity, service-account exposure SHALL bind to cases. | Access removed, privilege reduced, identity disabled, conditional access restored, or exception accepted. | Privilege returns, risk score rises, identity graph expands, stale account reappears. | IAM owner, app owner, identity platform owner, SOC/SOM escalation. | Identity Overview, Privileged Access, Risky Identities, Access Drift, Identity Coverage. | Identity nodes, admin edges, privilege edges, blast-radius overlay. |
| Architecture | Architecture drift, anti-pattern, dependency-risk, trust-boundary breach SHALL bind to cases. | Topology confirmed, control restored, design exception approved, dependency risk reduced. | Topology changes, exposure expands, dependency appears, trust boundary changes. | Architecture owner, cloud/platform owner, service owner, SOM. | Architecture Overview, Architecture Drift, Dependency Map, Cloud Posture. | Architecture nodes, dependency edges, trust-boundary overlay. |
| Vulnerability | Scanner findings, external advisories, code/supply-chain findings SHALL bind to cases. | Patch confirmed, mitigation confirmed, compensating control confirmed, not-applicable confirmed. | KEV/intel changes, asset remains vulnerable, patch rollback, new asset affected. | VM owner, asset owner, app owner, patch owner, SOM. | Vulnerability Overview, KEV, Remediation, SLA, Patch Intelligence, Code/Supply Chain. | CVE nodes, asset edges, control compensation overlay. |
| Exposure | External/internal exposure, internet-facing drift, open service risk SHALL bind to cases. | Exposure removed, firewall/WAF/DNS state confirmed, accepted exception. | Exposure reappears, DNS changes, port opens, asset becomes public. | Exposure owner, network owner, cloud owner, app owner. | Exposure & Posture, Attack Surface, Blast Zones. | Exposure overlay, internet boundary, attack path edges. |
| Controls | Missing/degraded control, failed control, weak compensating control SHALL bind to cases. | Control restored or compensating control validated. | Control degrades, coverage drops, configuration changes. | Control owner, platform owner, governance owner. | Control Coverage, Control Validation, Compliance. | Control nodes and protects/lacks_control edges. |
| Drift | Config drift, policy drift, architecture drift, access drift SHALL bind to cases. | Baseline restored, approved exception, accepted residual risk. | Drift recurs, exception expires, baseline changes. | Domain owner plus SOM threshold route. | Drift Console, Architecture Drift, Access Drift. | Drift overlay and baseline deviation edges. |
| Tool Health | Connector failure, telemetry stale, tool degradation, license/coverage failure SHALL bind to cases. | Fresh ingestion restored, connector healthy, telemetry confirmed. | Freshness expires, tool fails again, exclusive coverage disappears. | Platform/tool owner, SOC tooling owner, SOM. | Tool Health, Connectors, Platform. | Tool nodes, monitored_by, covered_by, stale edges. |
| Coverage | EDR/NDR/VM/cloud/identity coverage gaps SHALL bind to cases. | Coverage confirmed, tool state restored, exception accepted. | Asset loses coverage, connector stale, new uncovered asset appears. | Tool owner, asset owner, platform owner. | Coverage Gaps, Scanner Coverage, Identity Coverage. | Coverage overlay and not_covered_by edges. |
| Blast Radius | Blast zone expansion or high-impact path SHALL bind to cases. | Radius reduced, path broken, compensating control confirmed. | Graph expands, critical path reappears, identity privilege increases. | SOM, domain owner, mission owner, architecture owner. | Blast Zones, Mission Control, Fusion Map. | Blast-radius overlay, mission-impact overlay. |

---

# v2.1 APPLICATION BOUNDARY UPDATE — COMMANDER INTERNAL CONTROL PLANE

## Status
Superseding architectural clarification. This section is authoritative where legacy wording treats the Commander control capability as only a module, panel, or configuration page.

## Mandatory Application Boundary
Commander is now defined as a platform with three distinct application surfaces:

1. **Commander SDR Operational Application**
   - Customer-facing and internal operational surface.
   - Used for Command Centre, cases, risk objects, validation state, Fusion Map, communications, dashboards, reporting, and prioritisation-led remediation work.
   - Does not own commercial licence allocation, entitlement manifest authoring, deployment ring assignment, customer onboarding governance, or internal operator controls.

2. **Commander SDR Tenant Admin Surface**
   - Customer tenant administration surface inside the SDR tenant context.
   - Used by authorised customer administrators for users, tenant connectors, tenant-visible features, tenant policy settings, notification channels, and tenant audit/export.
   - May display licence/entitlement state as read-only unless explicitly delegated by the internal Commander Control Plane.

3. **Commander Internal Control Plane Application**
   - Separate internal application used by the Commander/Seiertech operating team.
   - Governs customers, tenants, instances, licences, entitlements, commercial feature allocation, module availability, trial state, demo/dogfood tenants, deployment rings, support access, self-hosted licence artefacts, operator audit, and emergency commercial/platform controls.
   - Controls what the SDR Operational Application and Tenant Admin Surface may expose, but is not used for day-to-day customer case operations.

## Non-Negotiable Rule
The Commander Internal Control Plane is not a customer module. It is a separate internal authority surface wired into the shared platform runtime through controlled entitlement, tenant, feature, deployment, support-access, and audit contracts.

## Runtime Authority
- The Operational Application executes SDR work.
- The Tenant Admin Surface manages customer-tenant administration within delegated boundaries.
- The Internal Control Plane governs commercial/platform authority above tenants.

## Build Consequence
Any implementation work must preserve this boundary. No operational Shell screen may become the authoritative source for licence allocation, commercial entitlement authoring, deployment ring membership, emergency kill switch control, or internal operator impersonation/support access approval.



---

# v2.2 Addendum — P0 Zero-Day Priority Override

This document is updated by the v2.2 P0 Zero-Day Priority doctrine.

Authoritative rule:

- P0 Zero-Day Priority is the highest emergency priority class in Commander SDR.
- P0 is a governed priority overlay, not a case lifecycle status.
- P0 may only be applied to an existing case-bound risk object.
- P0 may be applied automatically by deterministic risk conditions or manually by authorised senior role owners.
- P0 does not permit manual case creation, manual case closure, manual lifecycle bypass, validation bypass, or evidence bypass.
- P0 immediately drives emergency SLA, routing, escalation, validation cadence, communication cadence, dashboard prominence, Fusion Map visibility, sub-action generation, and audit.
- P0 downgrade/removal requires equal-or-higher authority, reason code, evidence reference, and audit capture.
- Where this document contains older priority, SLA, routing, RBAC, dashboard, or lifecycle wording, the v2.2 P0 doctrine supersedes it.

Required implementation reference:

- `docs/02_child_specs/40_P0_Zero_Day_Priority_Override_Spec.md`

---

# v2.3 UI Doctrine Integration Addendum — Commander Military-Intelligence Interface

## Status
- This addendum supersedes any visual or interaction guidance that conflicts with the v2.3 UI doctrine.
- It does not alter closed-loop case doctrine, P0 Zero-Day doctrine, application-boundary doctrine, risk-object binding doctrine, validation doctrine, routing doctrine, or Fusion Map doctrine.
- It preserves existing shell geometry and navigation boundaries unless a later approved shell migration explicitly replaces them.

## Binding UI Doctrine
Commander SDR uses a fixed operational shell with a military-intelligence visual system applied at the content, dashboard, graph, gauge, overlay, map, pulse, case-detail, and control-surface layers.

The shell frame is not to be repeatedly redesigned. Visual evolution is controlled through:
- design tokens;
- typography;
- density rules;
- square component geometry;
- command-grade instrumentation;
- graph/gauge/overlay systems;
- semantic priority and domain colour rules;
- application-specific treatment for the Operational App, Tenant Admin Surface, and Commander Internal Control Plane.

## Application Surface Rule
The doctrine applies differently by surface:

| Surface | Treatment |
|---|---|
| Commander SDR Operational Application | Strongest command/intelligence treatment; risk, case, Fusion Map, pulse, P0, validation, communication, and mission surfaces. |
| Commander SDR Tenant Admin Surface | Controlled administrative treatment; same tokens and square geometry, lower visual intensity, strong form/table usability. |
| Commander Internal Control Plane Application | Secure operator-console treatment; customers, tenants, licences, entitlements, features, deployment rings, support access, emergency controls, and audit. |

## Shell Preservation Rule
Do not change without explicit approval:
- top bar placement;
- left navigation placement;
- product/brand lockup placement;
- Commander AI placement;
- search/user/notification placement;
- sidebar expansion and scroll behaviour;
- core content-canvas contract;
- distinction between Operational App, Tenant Admin Surface, and Commander Internal Control Plane.

## Visual Intensity Model
| Level | Name | Used For | Visual Behaviour |
|---|---|---|---|
| 1 | Operational Standard | normal cases, dashboards, assets, vulnerabilities, identity, architecture, reporting | dense, square, calm, readable, navy/gold/light or controlled dark surfaces |
| 2 | Tactical Analysis | Fusion Map, blast radius, exposure, threat corridor, dependency map, control overlays | dark tactical canvas, overlays, node-link views, heat grids, gauges |
| 3 | Emergency Command | P0 Zero-Day, active exploitation, surge mode, mission-critical risk | maximum contrast, P0 banner, SLA countdown, owner accountability, live pulse, escalation rails |

## Non-Negotiable Usability Guardrail
The interface must remain faster to operate than it is to admire. Visual intensity must never reduce scan speed, evidence traceability, routing clarity, validation clarity, closure-gate clarity, or senior accountability.

## P0 Zero-Day UI Rule
P0 Zero-Day is rendered as an emergency priority overlay, not a lifecycle state. It must appear consistently across:
- case list;
- case detail;
- Command Centre;
- CISO dashboard;
- Fusion Map;
- Team Pulse;
- Domain Pulse;
- Mission Pulse;
- Routing Console;
- Validation Console;
- Communication surfaces;
- Tenant Admin policy pages;
- Commander Internal Control Plane entitlement and emergency-control surfaces where applicable.

## Build Pipeline Rule
No new UI page is build-ready unless it declares:
- surface owner;
- target application;
- intensity level;
- required data objects;
- lifecycle bindings;
- routing bindings;
- validation bindings;
- strategy bindings;
- Fusion Map bindings where applicable;
- P0 behaviour where applicable;
- accessibility and density constraints.

