# Connector Registry & Case Action Workflow Engine (CRAW Engine)

**Status:** Design Authority — Pre-Build Specification  
**Version:** 1.0  
**Date:** 2026-06-13  
**Owner:** Johann / Commander C2 Architecture  
**Thesis conformance:** Required (snake_case, standard_marker, all applicable governing standards)  
**Governing specs:** MTS v7.0 §2, §3, §12, §13; Spec #05, #06, #09, #14, #16, #24, #55, #61, #62; Control Plane Spec v1.1  
**Build phase:** Phase 1 foundation (local-first, mock data) → Phase 2 (live vendor APIs)

---

## 1. Purpose

The Connector Registry & Case Action Workflow Engine is the orchestration backbone of Commander C2. It governs:

1. **What data enters the system** — which APIs are called, how often, what they produce
2. **What the data means** — which event types are derived, what findings are generated
3. **What happens about it** — which remediation actions exist, who decides, how validation works

It is NOT a static register. It is an **engine** that actively:
- Schedules and dispatches connector pulls per cadence tier
- Routes signals through normalisation → intelligence → case creation
- Determines available remediation actions per finding type
- Enforces execution mode (autopilot / human confirmation / always manual)
- Validates remediation outcomes via subsequent pulls
- Emits audit, metrics, and health signals throughout

---

## 2. Governance Model

### 2.1 Two-Tier Authority

```
COMMERCIAL CONTROL PLANE (Seiertech-owned)
├── Defines available connectors (API contracts, endpoints, auth methods)
├── Defines event type catalogue (what findings are possible)
├── Defines workflow templates (what remediation actions exist)
├── Sets permitted execution modes per workflow
├── Gates availability by entitlement tier
├── Versions and updates connector packs
└── Enables/disables per tenant

        │ enabled per tenant
        ▼

TENANT ADMIN (Customer-owned)
├── Views available connectors and configures credentials
├── Views available workflows per event type
├── Chooses execution mode per workflow (within permitted bounds):
│   ├── AUTOPILOT — system executes, no human gate
│   ├── HUMAN CONFIRMATION — system proposes, human approves/rejects
│   └── ALWAYS MANUAL — system informs, human does it themselves
├── Overrides at use-case level
├── Assigns approval roles (which RBAC role approves)
└── Views full audit trail of all actions
```

### 2.2 Precedence Rules

1. Control Plane sets what is AVAILABLE and what modes are PERMITTED
2. Tenant Admin sets what is ACTIVE and which mode is CHOSEN (within permitted bounds)
3. System-First Doctrine (SFD-1.0) governs: system detects, system proposes, human confirms or overrides
4. No manual case creation — only the CRAW Engine creates cases from findings
5. "Adherence" not "compliance" in all labels and outputs

### 2.3 Thesis Conformance

| Requirement | How CRAW Conforms |
|---|---|
| `standard_marker` on all entities | Every CRAW entity carries `standard_marker` |
| snake_case field naming | All fields thesis-literal |
| Spec #55 configuration governance | Control plane ships defaults, tenant customises, versioned + audited |
| Spec #61 connector classes A/B/C/D only | Registry enforces — no fifth class permitted |
| Spec #62 verdict semantics | Verdict signals preserve full disposition semantics |
| Spec #14 push governance | Push actions premium-gated, approval-required, reversible |
| MTS §12.2 outbound integration | Push via ITSM record, detection spec via dispatch, approval gates |
| Control Plane Spec v1.1 | Seiertech manages cross-tenant, customer sees their slice |
| SOC boundary | Read-only from SOC (Class A). Never write to SOC platforms |

---

## 3. Architecture Overview

### 3.1 End-to-End Signal Flow

```
[PULL]                                              [PUSH / MANUAL]
  │                                                       ▲
  ▼                                                       │
┌─────────┐    ┌──────────┐    ┌──────────────┐    ┌─────────────┐
│CONNECTOR│───▶│ SIGNAL   │───▶│NORMALISATION │───▶│INTELLIGENCE │
│ ADAPTER │    │CREATION  │    │   LAYER      │    │   LAYER     │
└─────────┘    └──────────┘    └──────────────┘    └──────┬──────┘
                                                          │
                                                          ▼
┌──────────────┐    ┌──────────────┐    ┌─────────────────────────┐
│  VALIDATION  │◀───│    CASE      │◀───│     ENGINE LAYER        │
│  (next pull) │    │  CREATION    │    │ (drift, coverage, risk) │
└──────┬───────┘    └──────┬───────┘    └─────────────────────────┘
       │                   │
       │                   ▼
       │            ┌──────────────────┐
       └───────────▶│ CASE ACTION      │
                    │ WORKFLOW ENGINE   │
                    │                  │
                    │ ┌──────────────┐ │
                    │ │ PATH A: AUTO │ │──▶ Push fires → validate → close
                    │ ├──────────────┤ │
                    │ │ PATH B: CONF │ │──▶ UI approval → push → validate → close
                    │ ├──────────────┤ │
                    │ │ PATH C: MAN  │ │──▶ Instruction shown → user acts → next pull validates → close
                    │ └──────────────┘ │
                    └──────────────────┘
```

### 3.2 The Three Registers

#### Part 1: Source API Register

Defines what the system pulls, from where, and what it produces.

| Field | Type | Description |
|---|---|---|
| connector_definition_id | string | Unique identifier (control plane scope) |
| vendor | string | Vendor name (CrowdStrike, Tenable, Microsoft, etc.) |
| product | string | Product name (Falcon, Tenable.io, Entra ID, etc.) |
| class_declaration | ConnectorClass[] | A, B, C, D or multi-class |
| signal_purposes | SignalPurpose[] | Which of 8 purposes this connector produces |
| endpoints | EndpointDefinition[] | API routes, methods, response schemas |
| auth_method | AuthMethod | oauth2, api_key, bearer_token, certificate |
| entity_types_produced | EntityType[] | asset, identity, vulnerability, signal, etc. |
| ingestion_tier | IngestionTier | 1-5 (5min to event-triggered) |
| default_cadence | string | Cron expression or interval |
| entitlement_tier | EntitlementTier | Which licence tier includes this connector |
| conformance_tier | ConformanceTier | certified, full, baseline, planned |
| standard_marker | string | Governing standard reference |

#### Part 2: Event Type Register

Defines what findings the system can produce from ingested data.

| Field | Type | Description |
|---|---|---|
| event_type_id | string | Unique identifier (e.g. EVT-COV-001) |
| event_description | string | Human-readable description |
| triggering_condition | string | What data state produces this finding |
| source_connector_ids | string[] | Which connectors contribute to detecting this |
| case_type | CaseType | Which of 12 case types this maps to |
| severity_heuristic | SeverityHeuristic | How priority is assigned |
| affected_entity_types | EntityType[] | What entities are impacted |
| intelligence_stream | IntelligenceStream | Which of 4 streams this finding relates to |
| standard_marker | string | Governing standard reference |

#### Part 3: Remediation Action Matrix

Defines what can be done about each finding, and who decides.

| Field | Type | Description |
|---|---|---|
| remediation_action_id | string | Unique identifier |
| event_type_id | string | Links to Event Type Register |
| action_description | string | Human-readable ("Add asset to scan range") |
| target_system | string | Which system the action targets |
| target_connector_id | string | Which connector executes the push (or null for manual) |
| permitted_execution_modes | ExecutionMode[] | Which modes control plane allows |
| default_execution_mode | ExecutionMode | System default (tenant can override within permitted) |
| push_api_required | boolean | Whether this needs an outbound adapter |
| validation_method | string | How Commander confirms the action worked |
| validation_connector_id | string | Which connector's next pull validates |
| reversible | boolean | Can this action be undone? |
| approval_role | string | Which RBAC role approves (if confirm mode) |
| risk_severity | number | 1-5 impact rating |
| standard_marker | string | Governing standard reference |

---

## 4. System Load & Scheduling

### 4.1 Five-Tier Ingestion Model

Per Master Proposition §12.5 and Spec #06:

| Tier | Purpose | Cadence | Example Connectors |
|---|---|---|---|
| 1 | Critical posture / health | 5-15 minutes | EDR heartbeat, connector health, critical drift |
| 2 | Regular drift | 1-4 hours | Configuration state, identity changes, policy state |
| 3 | Heavy inventory / enrichment | Daily / maintenance window | Full asset inventory, vulnerability scan results |
| 4 | Deep analytics / sweep | Weekly / monthly | Architecture analysis, maturity assessment |
| 5 | Event / webhook-triggered | On event | Inbound email, IOC submission, STIX feed push |

### 4.2 Queue Architecture

Per Spec #06 (Worker & Scheduling):

```
ingestion.pull              — connector pull execution
normalisation.process       — raw → canonical transformation
evaluation.drift            — rule evaluation against canonical state
case.create_or_update       — finding → case binding
push.intent                 — push action intent creation
push.governance             — dry-run simulation + conflict detection
push.execute                — actual outbound API call (Phase 2)
push.validate               — validation check after push
notification.send           — inform user of pending actions
audit.verify                — audit trail emission
maintenance.housekeeping    — cleanup, metric aggregation
```

### 4.3 Concurrency & Rate Limiting

| Constraint | Enforcement |
|---|---|
| Per-tenant concurrency cap | No single tenant starves the platform |
| Per-connector rate limit | Respect vendor API limits (429 handling) |
| Per-provider rate limit | Aggregate across all tenants calling same vendor |
| Priority queues | Critical health/SLA jobs get priority |
| Backpressure | When downstream degrades, reduce upstream load |

### 4.4 Backpressure Triggers

When system load exceeds capacity:

1. Queue depth exceeds threshold → pause low-priority Tier 3/4 jobs
2. External API rate limited → exponential backoff with jitter, respect `Retry-After`
3. Database latency high → reduce connector concurrency
4. Downstream engine overloaded → extend polling cadence temporarily
5. Manual allocation queue ageing → surface engineering health case
6. Platform operator alert → runbook activation

### 4.5 Capacity Planning Dimensions

Per Spec #16:

| Dimension | Scaling Factor |
|---|---|
| Tenants | Linear scaling of isolated workloads |
| Connectors per tenant | Multiplier on ingestion workers |
| Assets/entities per tenant | Storage + query performance |
| Rule evaluations per hour | Engine worker scaling |
| Signals per day | Queue throughput + storage |
| Cases/sub-actions | Case engine + notification load |
| Push actions per day | Outbound API call volume |
| Retention settings | Storage growth rate |

### 4.6 SLO Targets

| Operation | Target |
|---|---|
| Connector pull dispatch | < 60s from scheduled trigger to queued job |
| Signal normalisation | < 30s from raw to canonical |
| Entity match + authority resolution | < 5s per signal |
| Case creation (when warranted) | < 10s from finding to case-detected state |
| Push intent creation | < 5s from case action decomposition |
| Push governance (dry-run) | < 15s simulation |
| Validation check | Within next scheduled pull cycle |
| UI visibility of pending actions | < 30s from intent creation |

---

## 5. Connector Lifecycle

Per Spec #09 and MTS §13.2:

```
[CONTROL PLANE]           [TENANT ADMIN]              [OPERATIONAL]
     │                         │                           │
     ▼                         ▼                           ▼
1. REGISTERED             4. CONFIGURED                6. INGESTING
   (defined in CP)           (credentials added)          (pulling data)
     │                         │                           │
     ▼                         ▼                           ▼
2. ENABLED                5. AUTHENTICATED             7. NORMALISING
   (available to tenant)     (auth verified)              (transforming)
     │                         │                           │
     ▼                         ▼                           ▼
3. ENTITLED               ─────┘                       8. EMITTING
   (licence tier check)                                   (canonical objects)
                                                           │
                                                           ▼
                                                       9. HEALTH EVALUATED
                                                           │
                                                      ┌────┴────┐
                                                      ▼         ▼
                                                  HEALTHY    DEGRADED
                                                              │
                                                         ┌────┴────┐
                                                         ▼         ▼
                                                      ERROR    RETIRED
```

### Health Signals Emitted

Every connector continuously emits:
- Liveness (is it responding?)
- Freshness (when was last successful pull?)
- Error rate (what % of pulls fail?)
- Throughput (records per pull)
- Authority resolution state (any conflicts unresolved?)

Health degradation → Tool Health case created automatically.

---

## 6. Execution Mode Decision Matrix

### 6.1 Three Paths

| Mode | System Does | Human Does | Validation |
|---|---|---|---|
| **AUTOPILOT** | Detects + executes push | Nothing (audit trail shows what happened) | System validates on next pull |
| **HUMAN CONFIRMATION** | Detects + proposes action in UI | Reviews, approves or rejects | If approved → system pushes → validates |
| **ALWAYS MANUAL** | Detects + shows instruction | Performs action in target system directly | System detects the change on next pull |

### 6.2 Mode Determination

```
Control Plane defines:     PERMITTED modes per workflow
Tenant Admin chooses:      ACTIVE mode per workflow (within permitted)
Use case overrides:        Tenant can set per use-case-category
System override:           Critical risk may force CONFIRM regardless
```

### 6.3 Example Use Cases

| Use Case | Permitted Modes | Default | Typical Tenant Choice |
|---|---|---|---|
| Add asset to vulnerability scan range | auto, confirm, manual | confirm | confirm or autopilot |
| Block IOC in EDR | confirm, manual | confirm | confirm |
| Update asset owner in Commander | auto, confirm, manual | auto | auto |
| Disable compromised identity | confirm, manual | confirm | manual (high risk) |
| Generate detection rule for SIEM | manual | manual | manual (dispatch via ITSM) |
| Update firewall rule | confirm, manual | confirm | confirm |
| Patch deployment trigger | manual | manual | manual (never autopilot) |
| Revoke excessive privilege | confirm, manual | confirm | confirm |

### 6.4 Approval Metric

Time spent in HUMAN CONFIRMATION state feeds directly into:
- **OODA tempo** — measures the Decide→Act gap
- **Approval blocker metric** — surfaces on leaderboard
- **SLA clock** — approval time counts against case SLA

This creates natural pressure to either approve quickly or move appropriate workflows to autopilot.

---

## 7. Validation Loop

### 7.1 How Validation Works

Regardless of execution path (auto, confirm, or manual), validation is the same:

1. Case reaches `PENDING_VALIDATION` state
2. System waits for the **next pull from the relevant connector**
3. On next pull, system checks: did the estate state change as expected?
4. If yes → `VALIDATED_PASS` → closure gates → `CLOSED_BY_SYSTEM`
5. If no → `VALIDATION_FAILED` → case reopens, escalates

### 7.2 Validation Timeout

If validation doesn't occur within a configurable window:
- Validation state → `VALIDATION_EXPIRED`
- Case remains open
- Escalation triggers fire
- Health case may be generated (if connector pull isn't arriving)

### 7.3 Continuous Revalidation

Per closed-loop doctrine: even after closure, reopening triggers monitor for regression. If the remediated state reverts (e.g. asset removed from scan range again), the case reopens automatically.

---

## 8. Data Model (Entity Contracts)

### 8.1 Connector Definition (Control Plane)

```typescript
interface ConnectorDefinition {
  connector_definition_id: string;
  vendor: string;
  product: string;
  class_declaration: ConnectorClass[];
  signal_purposes: SignalPurpose[];
  endpoints: EndpointDefinition[];
  auth_method: AuthMethod;
  entity_types_produced: EntityType[];
  ingestion_tier: IngestionTier;
  default_cadence: string;
  entitlement_tier: EntitlementTier;
  conformance_tier: ConformanceTier;
  permitted_execution_modes: ExecutionMode[];
  created_at: string;
  updated_at: string;
  standard_marker: string;
}
```

### 8.2 Connector Instance (Tenant-scoped)

```typescript
interface ConnectorInstance {
  connector_instance_id: string;
  tenant_id: string;
  connector_definition_id: string;
  state: ConnectorState;
  credentials_ref: string; // reference to secrets manager
  cadence_override: string | null;
  last_pull_at: string | null;
  last_pull_status: PullStatus;
  health_score: number; // 0-100
  records_ingested_total: number;
  created_at: string;
  updated_at: string;
  standard_marker: string;
}
```

### 8.3 Event Type Definition (Control Plane)

```typescript
interface EventTypeDefinition {
  event_type_id: string;
  event_description: string;
  triggering_condition: TriggeringCondition;
  source_connector_definition_ids: string[];
  case_type: CaseType;
  severity_heuristic: SeverityHeuristic;
  affected_entity_types: EntityType[];
  intelligence_stream: IntelligenceStream;
  standard_marker: string;
}
```

### 8.4 Remediation Workflow Template (Control Plane)

```typescript
interface RemediationWorkflowTemplate {
  remediation_action_id: string;
  event_type_id: string;
  action_description: string;
  target_system: string;
  target_connector_definition_id: string | null;
  permitted_execution_modes: ExecutionMode[];
  default_execution_mode: ExecutionMode;
  push_api_required: boolean;
  validation_method: ValidationMethod;
  validation_connector_definition_id: string | null;
  reversible: boolean;
  risk_severity: number; // 1-5
  approval_role: string;
  standard_marker: string;
}
```

### 8.5 Tenant Workflow Configuration (Tenant-scoped)

```typescript
interface TenantWorkflowConfig {
  tenant_id: string;
  remediation_action_id: string;
  chosen_execution_mode: ExecutionMode;
  approval_role_override: string | null;
  enabled: boolean;
  configured_by: string;
  configured_at: string;
  standard_marker: string;
}
```

### 8.6 Enumerations

```typescript
type ExecutionMode = 'autopilot' | 'human_confirmation' | 'always_manual';

type IngestionTier = 1 | 2 | 3 | 4 | 5;

type AuthMethod = 'oauth2' | 'api_key' | 'bearer_token' | 'certificate' | 'saml';

type PullStatus = 'success' | 'partial' | 'failed' | 'never_run';

type ValidationMethod = 'next_pull_confirms' | 'explicit_evidence' | 'api_callback' | 'manual_attestation';

type EntitlementTier = 'essential' | 'professional' | 'enterprise';
```

---

## 9. Business Case

### 9.1 Why This Engine First

The CRAW Engine is the **single dependency** for everything that follows:
- Cannot build connector adapters without the registry telling us what to build
- Cannot route findings without the event type register telling us what they mean
- Cannot offer remediation without the workflow matrix telling us what's possible
- Cannot measure OODA tempo without the pipeline being instrumented
- Cannot demonstrate value without the closed loop actually closing

### 9.2 What It Unlocks

| Capability Unlocked | Dependency on CRAW Engine |
|---|---|
| Live connector ingestion | Source API Register defines the adapter contract |
| Automated case creation | Event Type Register maps findings to cases |
| Push remediation | Remediation Action Matrix defines targets + modes |
| Tenant self-service | Tenant Workflow Config enables admin control |
| OODA tempo measurement | Pipeline instrumentation from pull to close |
| Coverage scoring | Connector health + entity matching = coverage picture |
| Commercial entitlement | Connector gating by licence tier |
| Audit trail | Every stage emits structured audit events |
| Tool health monitoring | Connector lifecycle health signals |
| Platform scaling | Queue architecture + cadence tiers enable load management |

### 9.3 Build Sequence

| Phase | Deliverable | Live APIs? |
|---|---|---|
| **Phase 1a** | CRAW Engine contracts + types + registry structure | No — mock data |
| **Phase 1b** | Ingestion orchestrator (signal → normalise → intelligence → case) | No — mock connectors |
| **Phase 1c** | Case Action Workflow (execution mode routing + approval surface) | No — intent only |
| **Phase 2a** | First live connector adapter (CrowdStrike or Tenable) | Yes — read only |
| **Phase 2b** | First live push adapter (e.g. add asset to scan range) | Yes — write |
| **Phase 2c** | Validation loop wired to live pulls | Yes — closed loop |
| **Phase 3** | Scale to 19 connectors, full remediation matrix | Yes — production |

### 9.4 Risk Register

| Risk | Mitigation |
|---|---|
| Vendor API rate limits | Per-connector + per-provider rate limiting, backpressure |
| Vendor API changes | Mapping pack versioning, connector conformance testing |
| Push action causes damage | Dry-run governance, conflict detection, reversibility, approval gates |
| Tenant overloads platform | Per-tenant concurrency caps, fairness scheduling |
| Validation never confirms | Timeout + escalation + health case generation |
| Credential compromise | Secrets Manager, least-privilege, rotation, audit |

---

## 10. Relationship to Existing Code

### 10.1 What Already Exists (packages/contracts/)

| Component | File | CRAW Relationship |
|---|---|---|
| Connector entity + state machine | `entities/connector.ts` | Becomes `ConnectorInstance` shape |
| Signal entity (OCSF) | `entities/signal.ts` | Output of signal creation stage |
| Normalisation layer (5 functions) | `engines/normalisation-layer.ts` | Called by CRAW orchestrator |
| Intelligence layer (4 streams + EIP) | `engines/intelligence-layer.ts` | Called by CRAW orchestrator |
| Push Action Intent | `entities/push-action-intent.ts` | Created by CRAW remediation path |
| Push Governance Engine | `engines/push-governance-engine.ts` | Called before push execution |
| Case entity (12 types, 12 states) | `entities/case.ts` | Created by CRAW when finding warrants |
| Remediation Event | `entities/remediation-event.ts` | Closes the loop after push |
| Ingestion Pipeline (IOC-specific) | `rules/ingestion-pipeline.ts` | Pattern to generalise for all signal types |
| Mock Connectors | `connectors/src/` | Test harness for Phase 1 |

### 10.2 What Needs Building

| Component | Package | Purpose |
|---|---|---|
| `ConnectorDefinition` entity | contracts/entities | Control plane connector registry |
| `ConnectorInstance` entity | contracts/entities | Tenant-scoped connector config |
| `EventTypeDefinition` entity | contracts/entities | Finding catalogue |
| `RemediationWorkflowTemplate` entity | contracts/entities | Action matrix |
| `TenantWorkflowConfig` entity | contracts/entities | Tenant execution mode choices |
| `CRAWOrchestrator` engine | contracts/engines | The pipeline glue |
| Connector adapter interface | connectors/src | Base class for vendor adapters |
| First adapter (CrowdStrike) | connectors/src | Phase 2 — live API calls |
| Approval workflow surface | apps/web | UI for human confirmation |
| Control plane registry UI | apps/web (control plane) | Seiertech manages connectors |

---

## 11. Standards Traceability

| CRAW Component | Governing Standard | standard_marker Value |
|---|---|---|
| ConnectorDefinition | Spec #61 (Universal Connector Contract) | `Spec #61` |
| ConnectorInstance | Spec #09 (Connector Architecture) | `Spec #09` |
| EventTypeDefinition | OCSF 1.3 + Internal | `OCSF 1.3` |
| RemediationWorkflowTemplate | ITIL 4 + Spec #14 | `ITIL 4 + Spec #14` |
| TenantWorkflowConfig | Spec #55 (Configuration Governance) | `Spec #55` |
| Signal creation | OCSF 1.3 | `OCSF 1.3` |
| Case creation | ITIL 4 + OODA + CTEM | `ITIL 4 + OODA + CTEM` |
| Push governance | Spec #14 (Push Engine) | `Spec #14` |
| Scheduling | Spec #06 (Worker & Scheduling) | `Spec #06` |
| Performance | Spec #16 (Performance & Scaling) | `Spec #16` |

---

## 12. Decision Log

| Decision | Rationale | Date |
|---|---|---|
| Name: "Connector Registry & Case Action Workflow Engine" | Captures both sides (pull + push) and signals it's active logic not passive data | 2026-06-13 |
| Control Plane owns definitions, Tenant Admin owns configuration | Separation of platform authority from customer authority per Control Plane Spec v1.1 | 2026-06-13 |
| Three execution modes (autopilot / confirm / manual) | Covers the full spectrum from zero-touch to fully manual per customer risk appetite | 2026-06-13 |
| Validation via next pull (not push acknowledgement) | System-owned validation regardless of execution path; doesn't depend on target system callback | 2026-06-13 |
| Build Phase 1 with mock data | Local-first development per tech steering; no live APIs until architecture proven | 2026-06-13 |
| Use-case-level override for execution mode | Granularity between "all workflows same mode" and "per-individual-action" — use case is the right abstraction | 2026-06-13 |

---

**Next step:** Build Phase 1a — the typed contracts for all entities defined in Section 8, seeded with initial event types and workflows covering the CrowdStrike + Tenable coverage gap scenario.
