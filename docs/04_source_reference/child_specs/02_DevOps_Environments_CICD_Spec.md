> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #2 — DevOps / Environments / CI-CD Specification

**Product:** Commander SDR  
**Document version:** v1.0  
**Status:** Approved Baseline — Build Package Derivation Ready  
**Date:** May 2026  
**Specification priority:** 1 of 6 priority child specs  
**Governing baseline:** Master Proposition v4.7; Master Technical Specification v6.7; Schedule v1.8  
**Build phase:** Phase 0 foundation  
**Runtime policy:** TypeScript-first production runtime; Terraform for infrastructure; Python support-only under `scripts/python/` or `analytics/`.

---

## 1. Purpose

This specification governs the DevOps, environment, infrastructure-as-code and CI/CD model for Commander SDR. It defines how the Phase 0 platform is built, deployed, tested, promoted, monitored and recovered.

This spec is required before meaningful code generation because every AI or human implementation task must know the target environment, repository structure, deployment pattern, secrets model, test gates and release process.

## 2. Authority and scope

### 2.1 This specification governs

- Local, development, test, staging and production environment definitions.
- Terraform module structure and infrastructure naming.
- AWS bootstrap deployment model.
- Docker image build standards.
- GitHub Actions workflow structure.
- Promotion from development to staging and production.
- Environment variable and secret reference handling.
- Monitoring, logging, alerting and health checks.
- Cost-control guardrails.
- Deployment rollback and break-fix runbooks.
- Infrastructure acceptance criteria for Phase 0.

### 2.2 Out of scope

- Application business logic.
- Database table definitions, except infrastructure provisioning for PostgreSQL.
- RBAC policy content, except deployment enforcement requirements.
- Full self-hosted customer deployment. Self-hosted deployment is deferred.
- Multi-region active-active deployment. Deferred.
- Real push execution infrastructure. Phase 0 may deploy push gate services only; it must not enable external write execution.

## 3. Governing architecture decisions

| Decision | Binding position |
|---|---|
| Cloud bootstrap | AWS-first bootstrap using low-cost managed services. |
| Container runtime | ECS Fargate for Phase 0/1 unless explicitly changed. |
| Infrastructure as Code | Terraform only. Manual console setup is not a source of truth. |
| CI/CD | GitHub Actions. |
| Runtime packaging | Docker multi-stage builds. |
| Core application runtime | TypeScript / Node.js 22+. |
| Frontend | Next.js / React / TypeScript. |
| Database | PostgreSQL 16+. |
| Queue/cache | Redis 7+ / BullMQ. |
| Search | OpenSearch. May be disabled in local dev using an adapter stub. |
| Secrets | AWS Secrets Manager or local `.env` for development only. |
| Observability | OpenTelemetry-compatible structured logs and metrics; Grafana/Loki/Prometheus-compatible targets. |
| Phase 0 push | Approval only. No target-system write execution. |

## 4. Environment model

| Environment | Purpose | Data allowed | Deployment trigger | Notes |
|---|---|---|---|---|
| Local | Developer and AI-agent implementation | Synthetic only | Manual | Docker Compose allowed for dependencies. |
| Development | Shared engineering validation | Synthetic only | Push to dev branch / manual | Low-cost non-production infra. |
| Test / QA | Integration and regression testing | Synthetic or sanitised test data | PR workflow / scheduled | Runs contract, tenant-isolation and integration tests. |
| Staging | Production-like release rehearsal | Synthetic or approved anonymised data | Merge to release branch | Must mirror production topology where practical. |
| Production | Live tenant operation | Tenant security data | Manual release approval | Full security, monitoring and backup controls. |

No production credentials or tenant security data may be used in local or development environments.

## 5. Repository structure

The expected repository structure is:

```text
apps/
  api/                 # Fastify backend/control plane
  web/                 # Next.js frontend
packages/
  contracts/           # Shared DTOs, Zod schemas, API contracts
  db/                  # Drizzle schemas, migrations, repository helpers
  connectors/          # Connector interfaces and connector implementations
  rules/               # Drift/rule schemas and built-in rule packs
  workers/             # BullMQ workers and schedulers
  shared/              # Shared utilities, logging, errors, tenant context
  ui/                  # Reusable UI components where extracted
infra/
  terraform/           # Terraform modules and environment stacks
  docker/              # Docker support files
  github-actions/      # Reusable workflow snippets if required
scripts/
  python/              # Support scripts only, not runtime
analytics/             # Experiments and notebooks only
```

## 6. Terraform architecture

### 6.1 Terraform layout

```text
infra/terraform/
  modules/
    network/
    ecs-service/
    rds-postgres/
    redis/
    opensearch/
    secrets/
    observability/
    iam/
  environments/
    dev/
    test/
    staging/
    prod/
```

### 6.2 Required modules

| Module | Responsibility |
|---|---|
| `network` | VPC, subnets, routing, security groups, NAT strategy if required. |
| `ecs-service` | ECS cluster, services, task definitions, autoscaling, load balancer integration. |
| `rds-postgres` | PostgreSQL instance, subnet group, parameter group, backups, encryption. |
| `redis` | Redis/ElastiCache for BullMQ and session/cache use. |
| `opensearch` | Search domain/serverless collection where enabled. |
| `secrets` | Secret placeholders and IAM access policy binding. |
| `observability` | Log groups, metrics, dashboards, alerts. |
| `iam` | Service roles, task roles, least-privilege policies. |

### 6.3 Terraform standards

- Every resource name must include environment and service prefix.
- All tenant data stores must be encrypted at rest.
- Security groups must deny inbound by default.
- Public access to databases, Redis and OpenSearch is forbidden.
- Terraform state must be remote, locked and encrypted for shared environments.
- Terraform variables must not contain secret values.
- Terraform outputs must not expose secret values.

## 7. Docker build model

Each application image must use a multi-stage build:

1. dependency install;
2. type-check and lint;
3. unit test where practical;
4. production build;
5. minimal runtime image.

Required images:

```text
commander-sdr-api
commander-sdr-web
commander-sdr-worker-ingestion
commander-sdr-worker-evaluation
commander-sdr-worker-notification
commander-sdr-worker-email   # Phase 1-ready image boundary; not required to execute Phase 1 scope in Phase 0
```

The worker image may initially share the same Dockerfile and select worker role through environment variable `SDR_WORKER_ROLE`.

## 8. Git branching and release model

| Branch | Purpose |
|---|---|
| `main` | Protected baseline. No direct commits. |
| `develop` | Integration branch for approved Phase 0 changes. |
| `rebuild/commander-sdr-baseline` | Baseline rebuild branch where applicable. |
| `feature/p0-xx-*` | Feature task branches. |
| `docs/*` | Documentation-only updates. |
| `release/*` | Release candidate staging branch. |
| `hotfix/*` | Production fix branch. |

All changes must go through PR review. AI agents must not commit directly to `main`.

## 9. GitHub Actions workflows

### 9.1 Required workflows

| Workflow | Trigger | Required jobs |
|---|---|---|
| `pr-checks.yml` | Pull request | install, lint, typecheck, unit tests, contract tests, secret scan. |
| `integration-tests.yml` | PR label / scheduled | docker compose dependencies, integration tests, tenant-isolation tests. |
| `build-images.yml` | Merge to develop/release | build and push Docker images. |
| `terraform-plan.yml` | Infrastructure PR | Terraform fmt, validate, plan. |
| `deploy-staging.yml` | Release branch/manual | Terraform apply staging, deploy services, smoke tests. |
| `deploy-prod.yml` | Manual approval only | Deploy production, smoke tests, rollback checkpoint. |

### 9.2 Required gates

A PR may not merge unless:

- lint passes;
- TypeScript type-check passes;
- unit tests pass;
- contract tests pass for touched packages;
- tenant isolation tests pass where tenant-scoped services are touched;
- secret scanning passes;
- migration tests pass where schema is touched;
- human review gate is completed for security, infrastructure or data-boundary changes.

## 10. Environment variables and secrets

### 10.1 Principles

- Secret values must never be committed.
- Application code must consume secret references, not literal values.
- Local `.env` is permitted only for local development and must use mock credentials.
- Connector credentials must be stored per tenant and per connector.
- Graph/email credentials must be scoped to approved mailboxes and governed by Platform Security and Spec 26a.

### 10.2 Standard variable groups

```text
SDR_ENV
SDR_SERVICE_NAME
SDR_LOG_LEVEL
SDR_DATABASE_URL
SDR_REDIS_URL
SDR_OPENSEARCH_ENDPOINT
SDR_AUTH_PROVIDER
SDR_AUTH_SECRET_REF
SDR_AWS_REGION
SDR_SECRETS_PREFIX
SDR_FEATURE_FLAGS
SDR_OTEL_EXPORTER_ENDPOINT
```

## 11. Deployment topology

### 11.1 Phase 0 services

| Service | Process type | Minimum count | Notes |
|---|---:|---:|---|
| Web | ECS service | 1 staging / 2 prod | Next.js frontend. |
| API | ECS service | 1 staging / 2 prod | Fastify backend. |
| Ingestion worker | ECS service | 1 | Connector pulls. |
| Evaluation worker | ECS service | 1 | Drift/rule evaluation. |
| Notification worker | ECS service | 1 | Basic notification dispatch. |
| Scheduler | ECS service / worker role | 1 | Enqueues scheduled jobs. |

Push executor may exist as an isolated service definition, but no real external execution capability may be implemented in Phase 0.

## 12. Database migration process

- Migrations are generated under `packages/db/migrations`.
- PR checks must run migration up/down tests.
- Staging deploy applies migrations before service deployment.
- Production deploy requires manual approval before migration.
- Destructive migrations require architecture owner approval.
- Audit tables must be append-only and must not be modified by normal migration rollback without explicit governance approval.

## 13. Observability and health checks

### 13.1 Health endpoints

| Endpoint | Purpose |
|---|---|
| `/health/live` | Process is alive. |
| `/health/ready` | Dependencies reachable and service ready. |
| `/health/dependencies` | DB, Redis, OpenSearch, queues, secrets access. |

### 13.2 Required metrics

```text
api_request_count
api_request_latency_ms
api_error_count
worker_job_count
worker_job_duration_ms
worker_job_failure_count
queue_depth
queue_oldest_job_age_seconds
db_connection_count
db_query_latency_ms
audit_write_failure_count
connector_health_state
email_mailbox_health_state   # Phase 1/Spec 26a integration metric
```

### 13.3 Logging

All production logs must be structured JSON and include:

```text
timestamp
level
service
request_id / job_id
tenant_id where applicable
actor_id where applicable
message
context
```

Secrets, tokens, credentials, email bodies, raw evidence payloads and sensitive entity details must not be logged.

## 14. Cost control

- Dev/test services should support scheduled shutdown.
- OpenSearch may be optional or stubbed locally until search features require it.
- Worker concurrency must be capped per environment.
- Terraform plans must show cost-affecting resource additions for human review.
- Staging and production must be tagged for cost allocation.

## 15. Phase 0 acceptance criteria

- `terraform apply` succeeds for staging.
- Application containers start and respond to health checks.
- PostgreSQL, Redis and OpenSearch are reachable from the application network.
- GitHub Actions PR pipeline completes end-to-end.
- Secrets are resolved through approved secret references.
- Structured logs and basic metrics appear in the observability platform.
- Queue worker smoke test enqueues and processes a job.
- Tenant isolation smoke test passes in deployed environment.

## 16. Tests required

| Test | Requirement |
|---|---|
| Terraform idempotency | Apply twice; second apply has no unexpected changes. |
| Container smoke | Start image and call `/health/live`. |
| Dependency smoke | API confirms DB/Redis/Search readiness. |
| CI pipeline | PR checks pass from clean checkout. |
| Secret scan | No committed secrets. |
| Deployment smoke | Staging deploy completes and case/API shell responds. |
| Rollback rehearsal | Previous image can be redeployed. |

## 17. Human review gates

- Infrastructure security review.
- IAM and secrets review.
- Cost estimation review.
- Data residency and backup review before production.
- Audit storage review.
- AI-agent workflow review before Codex is allowed to create infra PRs.

## 18. AI agent instructions

AI agents must:

- work only on the assigned P0 issue;
- explain intended file changes before modifying code;
- avoid real push execution;
- avoid introducing Python runtime services;
- preserve tenant isolation;
- add or update tests with each infrastructure/code change;
- not alter Terraform production settings without explicit human instruction.

## 19. Open items for human review

| Item | Recommendation |
|---|---|
| ECS vs EKS timing | ECS Fargate for Phase 0/1; revisit in Phase 2. |
| OpenSearch bootstrap | Optional in local/dev; enabled in staging where search APIs are built. |
| Production region | Select based on first tenant/data residency requirement. |
| Observability vendor | Grafana/Loki/Prometheus-compatible; exact hosting can be decided by cost. |


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

# DOCUMENT-SPECIFIC REVISION PATCH — 02_DevOps_Environments_CICD_Spec.md

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

