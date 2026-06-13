> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #4 — Frontend Architecture Specification

**Product:** Commander SDR  
**Document version:** v1.0  
**Status:** Approved Baseline — Build Package Derivation Ready  
**Date:** May 2026  
**Specification priority:** 6 of 6 priority child specs  
**Governing baseline:** Master Proposition v4.7; Master Technical Specification v6.7; Schedule v1.8  
**Build phase:** Phase 0 foundation  
**Runtime policy:** Next.js 15+ / React / TypeScript.

---

## 1. Purpose

This specification governs the Commander SDR frontend architecture. It defines the Next.js application structure, routing model, workspace shell, state management, API client pattern, component boundaries, performance standards, accessibility requirements and Phase 0 UI skeleton.

This is not the full UI/UX design system or dashboard composition spec. Those are governed later by Specs 11a and 11b. This document defines how the frontend is built.

## 2. Scope

### 2.1 In scope

- Next.js project structure.
- Workspace routing model.
- Authentication/session integration.
- API client and data fetching.
- Component organisation.
- Error/loading/empty states.
- Permission-aware rendering.
- Case queue and case detail shell.
- Asset list shell.
- Admin setup shell compatibility.
- Communication panel placeholders for Spec 26a.
- Performance and accessibility engineering rules.

### 2.2 Out of scope

- Final visual design tokens and brand system. Governed by Spec 11a.
- Full dashboard composition. Governed by Spec 11b.
- Full email/SIR UI implementation. Governed by Spec 26a and later UI specs.
- Frontend business logic that belongs in backend services.

## 3. Frontend principles

| Principle | Requirement |
|---|---|
| Fast and operational | Analysts must see priority, SLA, risk and next action quickly. |
| Workspace-based | UI organised around operational workspaces, not raw database entities. |
| Permission-aware | UI hides/disables unauthorised actions but backend remains authoritative. |
| Contract-driven | API usage generated/typed from shared contracts where practical. |
| Minimal client state | Server state via TanStack Query; local UI state via lightweight store. |
| Accessible | Keyboard and screen-reader support required for core workflows. |
| Scalable tables | Large lists use pagination/virtualisation. |

## 4. Application structure

```text
apps/web/src/
  app/
    (auth)/
    (workspaces)/
      command-centre/
      cases/
      assets/
      connectors/
      admin/
    api/                     # Next.js route handlers only where required
  components/
    layout/
    navigation/
    cases/
    assets/
    connectors/
    admin/
    communications/          # UI placeholders until Spec 26a/UI specs implement full detail
    shared/
  lib/
    api-client/
    auth/
    permissions/
    query/
    telemetry/
  stores/
  hooks/
  styles/
```

## 5. Routing model

Phase 0 routes:

```text
/login
/cases
/cases/[caseId]
/assets
/assets/[assetId]
/connectors
/connectors/[connectorId]
/admin
/admin/connectors
/admin/communication-setup     # shell only if needed; full functionality governed by Spec 26a
```

Phase 1+ routes may include:

```text
/command-centre
/vulnerability
/architecture
/identity
/ciso
/som
/admin/communication-mailboxes
/admin/communication-approval-chains
/admin/sir
```

## 6. Layout shell

The shell must support:

- persistent left navigation;
- top workspace navigation where appropriate;
- tenant/workspace context display;
- user/session menu;
- command/action buttons;
- notification/health indicators;
- responsive collapse behaviour;
- multi-monitor usability.

The UI must not force excessive navigation for analysts working cases.

## 7. State management

| State type | Tool/pattern |
|---|---|
| Server state | TanStack Query. |
| Forms | React Hook Form + Zod where appropriate. |
| Local UI state | Zustand or component state. |
| Auth/session | Auth.js/NextAuth session integration. |
| URL filters | Query parameters for shareable views. |

Server state must not be duplicated in global client stores unless there is a clear performance reason.

## 8. API client pattern

- All API calls go through a typed client under `lib/api-client`.
- API client must attach request correlation where applicable.
- API errors must map to standard UI error states.
- No component should hand-build fetch URLs repeatedly.
- Cursor pagination is supported consistently.

## 9. Permission-aware UI

The frontend must support:

```text
canView(resource)
canCreate(action)
canUpdate(resource)
canApprove(action)
canAdminister(area)
```

UI permissions are not security controls. Backend enforcement remains mandatory.

For communication/SIR:

- SIR button may be visible in all case panels once implemented.
- Button state reflects permission/configuration: enabled, approval required, disabled with reason.
- Email send from parent case/sub-case/swarm must show approval route before send/submit.

## 10. Phase 0 core screens

### 10.1 Case queue

Must show:

```text
case ID
title
case type
severity
priority
status
owner/queue
SLA state
age
last updated
```

Required behaviours:

- sort by severity/priority/SLA;
- filter by case type/status/owner;
- open case detail;
- empty/loading/error states.

### 10.2 Case detail

Must show:

```text
case header
status and priority
affected entities
trail of travel
actions
approval state
SLA panel
basic notes/context
```

Action buttons:

```text
triage
start investigation
propose action
approve/reject action
close where permitted
```

Placeholders should reserve space for future:

```text
communication timeline
sub-case/action communication
SIR hand-off button
inbound allocation queue
case swarm workstreams
```

### 10.3 Asset list/detail

Must show canonical asset basics:

```text
asset name/type
criticality
environment
attack surface position
coverage status
connector/source
last seen
```

### 10.4 Connector/admin shell

Must show:

```text
connector status
last sync
health
credential/scope validation state
manual sync action
```

## 11. Communication and SIR UI compatibility

Although full implementation is governed by Spec 26a, the frontend architecture must be compatible with:

- parent case email action;
- sub-case/action email action;
- case swarm workstream email action;
- SIR from parent case/sub-case/action/swarm;
- communication approval chain preview;
- inbound unallocated email queue;
- communication admin setup;
- mailbox health indicators;
- metadata-first body handling.

The routing/component model must not force all communications to be parent-case only.

## 12. Component standards

- Components should be small and domain-oriented.
- Shared UI components belong in `packages/ui` only after reuse is clear.
- Domain components live under `components/<domain>`.
- Components must expose loading, empty, error and disabled states.
- Modals/drawers used for actions must be keyboard accessible.
- Tables must support pagination and virtualisation for large data.

## 13. Forms and validation

- Forms use shared Zod schemas where the backend contract exists.
- Client validation improves UX; server validation is authoritative.
- Required fields and validation messages must be clear.
- Dangerous actions require confirmation and reason where governed.

## 14. Error handling UX

Standard error states:

```text
validation error
authorisation error
not found
conflict/stale version
external dependency degraded
network/server error
```

Case/action workflows must preserve user-entered data on recoverable errors.

## 15. Performance requirements

- Initial workspace shell should load quickly on broadband enterprise networks.
- Avoid loading full case history lists unnecessarily.
- Use streaming/lazy loading for heavy panels.
- Virtualise long tables/timelines.
- Cache server state with appropriate invalidation after mutations.
- Avoid client-side joins of large data sets.

## 16. Accessibility requirements

Core workflows must support:

- keyboard navigation;
- visible focus states;
- semantic headings;
- accessible labels for buttons and form fields;
- screen-reader friendly status changes where practical;
- colour not used as the only signal;
- modal focus trap and escape behaviour.

## 17. Testing requirements

| Test | Requirement |
|---|---|
| Component tests | Core tables, panels, forms and action buttons. |
| Route tests | Protected routes require auth; unauthorised workspace hidden/blocked. |
| API mock tests | UI handles success/loading/error/empty states. |
| Permission tests | Buttons visible/disabled according to permissions. |
| Accessibility tests | Automated checks plus manual review for key flows. |
| E2E smoke | Login → case queue → case detail → transition action. |
| Responsive tests | Desktop and tablet minimum. |

## 18. Acceptance criteria

- Next.js app structure created.
- Authentication flow integrated.
- Workspace shell renders.
- Case queue and case detail shell work against API/mock API.
- Asset list shell works.
- Connector/admin shell works.
- Permission-aware UI pattern implemented.
- Core loading/error/empty states implemented.
- Tests cover core flows.
- Architecture is compatible with future Spec 26a communication UI.

## 19. Human review gates

- Frontend architecture review.
- UX navigation review.
- Accessibility review.
- Performance review.
- Permission/rendering review.
- Spec 11a/11b dependency review before final visual/dashboard implementation.


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

# CHANGE-ARCH-002 Alignment Addendum — Minimum Security Baseline and Safe View Mode

## Minimum security baseline

Commander SDR SHALL implement the following minimum security baseline:

```text
SSO/OIDC-ready authentication
MFA enforced through the tenant identity provider where possible
RBAC at API and UI action level
tenant isolation on every tenant-scoped query
secrets never stored in code or logs
connector credentials stored as references only
encrypted transport
encrypted storage
secure session handling
least-privilege IAM/admin permissions
admin action logging
audit trail for sensitive operations
rate limiting
safe error handling
```

SDR SHALL NOT build a custom MFA engine in the baseline. MFA SHALL be delegated to the tenant identity provider wherever practical.

## Safe View Mode

Commander SDR SHALL provide an administrator-configurable Safe View Mode / Presentation Safe Mode that masks sensitive identifiers in the UI and selected exports.

Baseline Safe View Mode is a masking and sharing-safety layer, not full DLP.

Configurable masking categories SHALL include:

```text
hostnames
IP addresses
usernames
email addresses
owner names
business units
third-party names
evidence details
attachments
IOCs where configured
```

Safe View Mode SHALL support:

```text
admin enablement
user toggle where permitted
forced presentation mode
external export mode
audit event when Safe View Mode is disabled for sensitive views where configured
```


---

# DOCUMENT-SPECIFIC REVISION PATCH — 04_Frontend_Architecture_Spec.md

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
## v2.3 Frontend Architecture Update — UI Doctrine Implementation
Frontend implementation must introduce a tokenised Commander UI system. Pages must declare application surface, intensity level, data dependencies, lifecycle bindings, routing bindings, validation bindings, strategy bindings, P0 behaviour, and Fusion Map behaviour where applicable. Component implementation must prioritise reusable command components, tactical graph components, admin policy editors, and operator-console tables. Shell geometry must remain stable.

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

---

# v2.5 Baseline Alignment Addendum — Admin, Navigation, Visibility and Defaults

This document is governed by `00_AUTHORITY_AND_PRECEDENCE_v2_5_2.md`.

v2.5 adds the following binding baseline rules:

1. Admin/control surfaces are first-class and split across Operational App Platform, Tenant Admin, Commander Commercial Control Plane and Build Pipeline Control.
2. Tenant Admin includes Baseline Configuration, Users & Access, Connectors & Data Sources, Strategy & Operating Model, Rules & Models, AI Configuration, Automation Boundaries, Communications, Exceptions & Suppressions, Audit/Compliance/Exports and Feature Availability.
3. Commander Commercial Control Plane is the internal application for customers, tenants, licences, entitlements, feature flags, baseline profiles, rule/model packs, deployment rings, support access, usage evidence and operator audit.
4. Menus, routes, panels and actions are generated from a registry and are visible in build mode but suppressed at runtime by RBAC, entitlement, feature flag, environment and policy state.
5. Frontend menu suppression is not security. Backend/API enforcement is mandatory.
6. Rule Engine and Model Management surfaces are mandatory and include simulation, versioning, rollback, audit and decision explainability.
7. Mission Control is driven by structured MissionObjective bindings to assets, applications, identities, cloud accounts, data stores, endpoints, tags, business services, dependency graph relationships and rules.
8. Baseline Configuration Profiles are mandatory and cover risk, SLA, routing, validation, closure/reopening, P0, automation, communications, RBAC, AI, rule packs, decision models, control frameworks, compliance mappings, CTEM, MITRE ATT&CK, ISO/NIST/CIS/AWS mappings and reporting defaults.
9. Tenant active configuration is derived from baseline templates and may be customised with audit, approval, versioning and baseline-drift visibility.
10. Shell usability corrections are binding: global search moves before Commander AI, search must not be cramped, sidebar scroll must be visible, and menu expansion must be supported structurally now and dynamically during frontend build.

Where older wording conflicts with this addendum, v2.5 authority wins.
