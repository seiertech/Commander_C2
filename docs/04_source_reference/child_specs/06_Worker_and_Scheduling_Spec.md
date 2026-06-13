> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #6 — Worker and Scheduling Specification

**Product:** Commander SDR  
**Document version:** v1.0  
**Status:** Approved Baseline — Build Package Derivation Ready  
**Date:** May 2026  
**Specification priority:** 4 of 6 priority child specs  
**Governing baseline:** Master Proposition v4.7; Master Technical Specification v6.7; Schedule v1.8  
**Build phase:** Phase 0 foundation  
**Runtime policy:** TypeScript / Node.js / BullMQ.

---

## 1. Purpose

This specification governs the Commander SDR worker and scheduling architecture. It defines queue structure, job contracts, worker base behaviour, scheduling tiers, retries, dead-letter handling, idempotency, tenant isolation, observability and Phase 0 worker acceptance criteria.

Workers are the execution backbone for connector pulls, normalisation, drift evaluation, notifications, validation and later closed-loop email/SIR processing. They must be deterministic, observable and tenant-safe.

## 2. Scope

### 2.1 In scope

- BullMQ queue naming and configuration.
- Worker base class requirements.
- Job payload standards.
- Tenant context validation.
- Idempotency model.
- Retry/backoff strategy.
- Dead-letter queues.
- Scheduling model and cadence tiers.
- Worker metrics and logging.
- Phase 0 job types.
- Phase 1-ready boundaries for email/SIR workers.

### 2.2 Out of scope

- Business logic inside drift rules, connectors or email processing.
- Detailed Graph API handling, governed by Spec 26a and API-24 later.
- Real push execution.
- Full Commander AI worker implementation.

## 3. Worker principles

| Principle | Requirement |
|---|---|
| Tenant-safe | Every job includes and validates `tenant_id`. |
| Idempotent | Retrying a job must not create duplicate side effects. |
| Observable | Every job emits structured logs and metrics. |
| Retry-aware | External dependency failures retry with backoff. |
| Dead-lettered | Exhausted jobs move to a reviewable queue. |
| Contract-validated | Job payloads are Zod-validated before execution. |
| No real push in Phase 0 | No worker may call external write APIs in Phase 0. |

## 4. Queue topology

### 4.1 Phase 0 queues

```text
ingestion.pull
normalisation.process
evaluation.drift
case.create_or_update
notification.send
audit.verify
maintenance.housekeeping
```

### 4.2 Phase 1-ready queues

These queues may be declared as contracts but must not execute Phase 1 capability unless explicitly promoted:

```text
email.send
email.ingest.webhook
email.ingest.delta
email.correlate
email.parse
email.acknowledge
email.reminder
email.escalate
email.subscription.renew
sir.send
sir.acknowledgement.check
validation.requery
commander.ai.grounding
push.execute          # Disabled until Phase 1 push execution is authorised
```

## 5. Standard job payload

Every job must include:

```json
{
  "job_id": "job_...",
  "tenant_id": "tenant_...",
  "job_type": "evaluation.drift",
  "idempotency_key": "...",
  "correlation_id": "...",
  "requested_by": "user_or_system_id",
  "created_at": "2026-05-05T12:00:00Z",
  "payload_version": "1.0",
  "payload": {}
}
```

Jobs without `tenant_id` must be rejected and audited as invalid system events.

## 6. Worker base class

All workers must implement a common base behaviour:

```text
load job
validate payload schema
validate tenant context
check idempotency key
start structured job log
execute handler
write success/failure result
emit metrics
write audit event where required
handle retry/dead-letter outcome
```

## 7. Idempotency

Idempotency keys must be deterministic for repeatable work.

Examples:

| Job | Idempotency key |
|---|---|
| Connector pull | `tenant_id:connector_id:domain:checkpoint` |
| Normalisation record | `tenant_id:raw_record_id:normalisation_version` |
| Rule evaluation | `tenant_id:rule_id:evaluation_window` |
| Case creation | `tenant_id:finding_id:case-generation` |
| Email send | `tenant_id:case_id:draft_id:approved_version` |
| SIR send | `tenant_id:sir_id:approved_version` |

A repeated job must either return the prior result or safely no-op.

## 8. Retry and backoff

| Error type | Retry? | Strategy |
|---|---:|---|
| Validation error | No | Dead-letter immediately. |
| Missing tenant context | No | Reject and audit. |
| External API 429 | Yes | Exponential backoff with jitter, respect `Retry-After`. |
| External API 5xx | Yes | Exponential backoff. |
| DB transient error | Yes | Short backoff. |
| Auth/permission failure | Limited | Retry once after token refresh; then health case/manual review. |
| Deterministic rule error | No | Rule-health event, not infinite retry. |
| Email correlation ambiguity | No | Manual allocation queue, not retry loop. |

Default retry count: 3. Critical platform jobs may define higher counts with architecture approval.

## 9. Dead-letter handling

Each queue has a dead-letter equivalent. Dead-lettered jobs must retain:

```text
original payload
error family
error message
attempt count
first failure time
last failure time
tenant_id
correlation_id
operator action required
```

Dead-letter events for connector, email, SIR, audit or tenant-boundary jobs must be visible to platform operations/admin health views.

## 10. Scheduling tiers

| Tier | Purpose | Example cadence |
|---|---|---|
| Tier 1 | Critical posture / health | 5–15 minutes |
| Tier 2 | Regular drift | 1–4 hours |
| Tier 3 | Heavy inventory/enrichment | Daily / maintenance window |
| Tier 4 | Deep analytics / sweep | Weekly/monthly |
| Tier 5 | Event/webhook-triggered | On event |

The scheduler must enqueue jobs; it must not execute connector/rule logic inline.

## 11. Phase 0 job contracts

### 11.1 `ingestion.pull`

Purpose: execute read-only connector pull.

Payload:

```json
{
  "connector_id": "conn_...",
  "domain": "assets",
  "sync_type": "full|delta|manual",
  "checkpoint": {}
}
```

### 11.2 `normalisation.process`

Purpose: transform raw records to canonical entities.

Payload:

```json
{
  "raw_record_batch_id": "raw_batch_...",
  "connector_id": "conn_...",
  "normalisation_version": "1.0"
}
```

### 11.3 `evaluation.drift`

Purpose: run rule evaluation against canonical state.

Payload:

```json
{
  "rule_ids": ["rule_edr_missing"],
  "scope": {
    "entity_type": "asset",
    "entity_ids": []
  },
  "evaluation_window": "2026-05-05T12:00:00Z/PT1H"
}
```

### 11.4 `case.create_or_update`

Purpose: convert finding into case or enrich existing case.

Payload:

```json
{
  "finding_id": "finding_...",
  "dedupe_key": "..."
}
```

### 11.5 `notification.send`

Purpose: send basic notification to configured non-email closed-loop channels.

Payload:

```json
{
  "notification_type": "case_created|sla_warning",
  "case_id": "case_...",
  "channel": "configured_channel_id"
}
```

## 12. Email/SIR worker compatibility

Spec 26a governs full closed-loop email and SIR execution. This worker spec reserves the pattern:

```text
email jobs must include parent_case_id
email jobs may include sub_case_id/action_id/swarm_id
sir jobs must include originating object and parent case
uncorrelated inbound emails must route to manual allocation queue
```

No email body may be logged. Email jobs must follow metadata-first storage policy.

## 13. Concurrency and rate limiting

Workers must support:

```text
per-queue concurrency
per-tenant concurrency cap
per-connector rate limit
per-provider rate limit
priority queues for critical health/SLA jobs
backpressure when downstream systems degrade
```

No tenant may starve all workers. Per-tenant fairness is required.

## 14. Observability

Required metrics:

```text
worker_job_started_total
worker_job_completed_total
worker_job_failed_total
worker_job_duration_ms
worker_job_retry_total
worker_job_deadletter_total
queue_depth
queue_oldest_job_age_seconds
queue_processing_rate
job_idempotency_hit_total
worker_tenant_rejection_total
```

Logs must include `tenant_id`, `job_id`, `correlation_id`, queue name and worker role.

## 15. Audit requirements

Audit entries are required for:

- manual job triggers;
- connector sync started/completed/failed;
- rule evaluation failures that affect coverage;
- case creation from findings;
- push approval jobs, even though no execution occurs;
- email/SIR jobs once Phase 1 is enabled;
- dead-letter events requiring manual action.

## 16. Worker security

- Workers run with least-privilege task roles.
- Ingestion workers may read connector secrets for their tenant/connector only.
- Evaluation workers do not need connector secrets.
- Notification/email workers may access communication secrets only where authorised.
- Push executor remains disabled/no-op in Phase 0.
- Worker logs must not contain secrets, raw email bodies or sensitive evidence payloads.

## 17. Tests required

| Test | Requirement |
|---|---|
| Happy path | Enqueue job; worker processes successfully. |
| Retry | Transient failure retries and succeeds. |
| Dead-letter | Exhausted failure moves to dead-letter. |
| Idempotency | Duplicate job does not duplicate side effect. |
| Tenant context | Missing tenant rejected; wrong tenant cannot access data. |
| Rate limit | Provider 429 respected. |
| No-push | Push queue cannot execute external target call. |
| Metrics | Queue depth and job status metrics emitted. |

## 18. Acceptance criteria

- BullMQ queues configured.
- Worker base class implemented.
- Job payload schemas validated.
- Tenant context enforced.
- Retries/dead-letter handling works.
- Queue metrics visible.
- Phase 0 queues process expected jobs.
- Email/SIR worker boundaries are compatible with Spec 26a but not prematurely implemented.

## 19. Human review gates

- Queue topology review.
- Retry/dead-letter strategy review.
- Tenant isolation review.
- Worker IAM/secrets review.
- No-push boundary review.
- Spec 26a compatibility review.


---

# CHANGE-ARCH-002 Alignment Addendum — Build Stack, Local/Cloud Boundary and Terraform

## Binding stack decision

Commander SDR SHALL use the following open-source-first TypeScript SaaS baseline:

| Layer | Baseline technology |
|---|---|
| Frontend | React / Next.js / TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend API | Node.js / TypeScript / Fastify |
| ORM / migrations | Drizzle ORM |
| Database | PostgreSQL |
| Queue / jobs | Redis + BullMQ |
| Search | OpenSearch |
| Cache | Redis |
| Infrastructure as Code | Terraform |
| Local runtime | Docker Compose + pnpm/npm scripts |
| Initial cloud runtime | AWS ECS Fargate |
| CI/CD | GitHub Actions |
| Secrets | AWS Secrets Manager initially |
| Observability | OpenTelemetry + Grafana/Loki/Prometheus-compatible stack |

## Local build boundary

Local development SHALL use Docker Compose and npm/pnpm scripts. Local development SHALL not require Terraform, AWS credentials, or cloud resources.

Required local contract:

```text
pnpm install
pnpm docker:up
pnpm db:migrate
pnpm dev
```

The local stack SHALL include the application, API, workers, PostgreSQL, Redis, and OpenSearch where required.

## Cloud infrastructure boundary

Terraform SHALL be authoritative for cloud infrastructure only. Terraform SHALL provision networking, ECS/Fargate, RDS PostgreSQL, Redis/ElastiCache, OpenSearch, Secrets Manager, IAM, S3, logs/monitoring, environment resources, and supporting cloud infrastructure.

Terraform SHALL NOT own application code, database migration content, tenant configuration, runtime feature flags, case workflows, email templates, or business configuration.


---

# CHANGE-ARCH-002 Alignment Addendum — Worker Domain and Local/Cloud Job Contract

Worker job payloads SHALL include tenant context and domain context. Local workers SHALL run using Docker Compose services and pnpm/npm scripts. Cloud workers SHALL run on the Terraform-provisioned AWS runtime. The job contract SHALL remain the same across local and cloud environments.


---

# DOCUMENT-SPECIFIC REVISION PATCH — 06_Worker_and_Scheduling_Spec.md

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

