> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #19 — Full RBAC Permission Matrix

**Document ID:** `19_Full_RBAC_Permission_Matrix.md`  
**Version:** v1.0  
**Status:** Approved Baseline — Build Package Derivation Ready  
**Date:** May 2026  
**Owner:** Johann / Commander SDR Architecture  
**Phase:** Phase 2 strategic / advanced capability specification  

> **Authority note:** This specification is subordinate to `Commander_SDR_Master_Proposition_v4_7.md`, `Commander_SDR_Master_Technical_Specification_v6_7.md`, `SDR_Specification_Schedule_and_Folder_Structure_v1_8.md`, `AGENTS.md`, and all active Phase 0 / Phase 1 child specifications. Where a conflict exists, the Master Technical Specification wins.

> **Runtime boundary:** TypeScript-first production runtime. Python is support-only under `scripts/python/` or `analytics/`. No real push execution may be introduced into Phase 0. Tenant isolation, auditability, RBAC, least privilege and deterministic execution are mandatory.


---

## 1. Purpose

This specification defines the full RBAC and permission matrix for Commander SDR. It governs role-based access, domain scoping, authority overlays, communication approval routing, SIR permissioning, push approval gates, emergency/break-glass authority, audit visibility and administrative delegation.

The purpose is not to hard-code one organisation's job model. The purpose is to provide a configurable permission architecture that supports different tenants, teams, operating models and regulatory requirements while preserving product safety.

## 2. Scope

### 2.1 In scope

- Platform roles, tenant roles, team roles and case roles.
- Action-level permissions across every major SDR domain.
- Domain scoping: Cloud, Identity, Network, Endpoint, Vulnerability, Architecture, Governance, Tooling, Compliance and Push Operations.
- Case, sub-case, action and swarm permissions.
- Communication mailbox permissions and upward chain-of-command approval routing.
- SIR creation, approval, sending and acknowledgement permissions.
- Push approval, rollback and Red Button permissioning.
- Break-glass access control.
- Admin delegation and configuration ownership.
- Audit event requirements.

### 2.2 Out of scope

- Identity provider configuration detail, which belongs to Platform Security & Hardening.
- UI layout detail, which belongs to UI/UX and Workspace specs.
- Exact human HR grade mapping, which remains tenant configurable.

## 3. Governing Principles

1. **Deny by default.** No user can access data or perform actions unless explicitly granted permission.
2. **Tenant isolation is mandatory.** Every permission evaluation is tenant-scoped.
3. **Domain scoping is first-class.** A user may be powerful in one domain and read-only in another.
4. **Case context matters.** Permissions may differ for parent cases, sub-cases, case actions and swarm workstreams.
5. **Approval is separate from execution.** The person who drafts or proposes an action may not be the person authorised to approve it.
6. **Grade models are templates only.** SDR may provide default templates, but tenants configure the operational model.
7. **Communication authority is configurable.** Email, SIR and broadcast permissions follow tenant-defined permission and approval chain rules.
8. **Every privileged action is audited.** No privileged action may occur without an immutable audit entry.

## 4. RBAC Model

RBAC evaluation uses the following inputs:

```text
allowed = f(
  tenant_id,
  user_id,
  assigned_roles,
  team_membership,
  domain_scope,
  entity_scope,
  case_relationship,
  mailbox_scope,
  recipient_class,
  approval_chain_policy,
  feature_entitlement,
  break_glass_state
)
```

## 5. Role Categories

| Category | Description |
|---|---|
| Platform Operator | Operates the SDR SaaS platform. No tenant data access unless break-glass is explicitly activated. |
| Tenant Administrator | Manages tenant configuration, connectors, RBAC, SSO, mailboxes and policies. |
| Security Operations Manager | Owns operational queue, case governance, assignment, escalation and communication approvals. |
| Domain Lead | Leads a functional domain such as VM, Identity, Architecture, Cloud, Tooling or Governance. |
| Analyst | Investigates and acts on assigned cases within scoped permissions. |
| Remediation Owner | External/non-SDR stakeholder who may receive case communication and provide status. |
| Auditor / Compliance User | Read-only or evidence/export-focused role. |
| Commander AI System Actor | Non-human actor that can draft, summarise and recommend but not approve or execute. |

## 6. Permission Naming Standard

Permissions SHALL use:

```text
domain.resource.action
```

Examples:

```text
case.parent.read
case.subcase.update
case.action.create
email.mailbox.send
email.mailbox.approve_send
sir.referral.create
sir.referral.approve
push.intent.create
push.execution.approve
admin.rbac.update
```

## 7. Core Permission Domains

| Domain | Prefix | Examples |
|---|---|---|
| Case Management | `case.*` | read, create, update, assign, close, reopen |
| Sub-cases / Actions | `case.subcase.*`, `case.action.*` | create, assign, email, raise_sir |
| Email & Communication | `email.*`, `communication.*` | draft, approve, send, link, split, merge |
| SIR | `sir.*` | create, approve, send, acknowledge, close_loop |
| Push | `push.*` | create_intent, approve, execute, rollback |
| Connector Admin | `connector.*` | configure, pause, test, rotate_credential |
| Data Model | `entity.*` | read asset/identity/control/exposure |
| Rule Engine | `rule.*` | create, test, promote, suppress |
| Commander AI | `commander_ai.*` | use, approve_context, manage_provider |
| Audit | `audit.*` | read, export, verify_chain |
| Platform Admin | `admin.*` | tenant, feature, licence, RBAC, mailbox |

## 8. Baseline Role Templates

These are optional default templates only. Tenants may change them.

| Role Template | Typical Access |
|---|---|
| Tenant Admin | Tenant config, connectors, RBAC, SSO, mailboxes, baseline policies. |
| SOM | Cases, assignment, approvals, SIR oversight, operational dashboards, communication governance. |
| VM Lead | VM cases, VM mailbox, VM templates, VM closure gates, VM SIR approval when configured. |
| Architecture Lead | Architecture cases, design-risk approvals, trust-boundary enrichment. |
| Identity Lead | Identity cases, access chain review, identity SIR approval when configured. |
| Analyst | Assigned case/sub-case actions, draft communications, request approvals, create SIR where allowed. |
| Auditor | Read-only evidence, audit export, case history and compliance mappings. |

## 9. Case Relationship Permissions

A user's authority may depend on relationship to the case:

```text
case_owner
subcase_owner
action_owner
case_follower
case_contributor
case_swarm_member
case_swarm_lead
queue_owner
team_lead
mailbox_owner
```

Permissions SHALL be evaluated against the most specific relationship first.

## 10. Communication Permission and Approval Chain Matrix

SDR SHALL provide a configurable matrix controlling:

```text
who can draft
who can submit for approval
who can send without approval
who approves
what conditions trigger additional approval
what happens if the approver is unavailable
```

### 10.1 Approval chain resolution inputs

| Input | Use |
|---|---|
| Originating object | Parent case, sub-case, action, swarm workstream or SIR. |
| Mailbox | VM, Architecture, Identity, Tooling, Governance, SIR or other mailbox. |
| Recipient class | Internal, vendor, regulator, executive, incident team, unknown external. |
| Communication classification | Remediation request, official update, escalation, closure, SIR referral. |
| Case priority/severity | P1/P2 may require additional approval. |
| Evidence/attachment inclusion | May trigger approval. |
| Regulated/compliance scope | May trigger legal/compliance approval. |

### 10.2 Dynamic approver targets

Approval chains SHALL support dynamic targets:

```text
case_owner_team_lead
subcase_owner_team_lead
action_owner_team_lead
case_swarm_lead
mailbox_owner
queue_owner
case_type_owner
SOM
CISO
legal_approver
incident_referral_approver
custom_named_user
```

## 11. SIR Permissioning

SIR can originate from parent case, sub-case, action or swarm workstream. Permissions SHALL separately control:

| Permission | Meaning |
|---|---|
| `sir.referral.create` | User may create a SIR draft. |
| `sir.referral.submit` | User may submit SIR for approval. |
| `sir.referral.approve` | User may approve SIR. |
| `sir.referral.send` | User may send SIR directly when policy permits. |
| `sir.referral.acknowledge` | User may mark SIR as acknowledged. |
| `sir.referral.link_incident_reference` | User may record incident-team reference. |

## 12. Push Permissioning

Push permissions SHALL remain separate from ordinary remediation permissions:

```text
push.intent.create
push.preview.view
push.approval.request
push.approval.approve
push.execution.execute
push.rollback.request
push.rollback.approve
push.red_button.invoke
```

Phase 0 SHALL NOT execute real push. Phase 1+ may execute only where licensed, admin-enabled and approved.

## 13. Break-Glass Permissioning

Break-glass SHALL be:

- time-limited;
- justification-mandatory;
- audited immutably;
- routed to governance case automatically;
- visible to tenant administrators and platform governance.

## 14. Data Scoping Rules

All read permissions SHALL be constrained by:

```text
tenant_id
domain_scope
business_unit_scope
case_assignment_scope
team_scope
feature_entitlement
```

No global tenant data browse permission should be granted to analysts by default.

## 15. Audit Events

Minimum audit events:

```text
RBAC_ROLE_ASSIGNED
RBAC_ROLE_REMOVED
RBAC_POLICY_CHANGED
COMMUNICATION_APPROVAL_REQUESTED
COMMUNICATION_APPROVED
COMMUNICATION_REJECTED
SIR_APPROVED
SIR_SENT
PUSH_APPROVED
PUSH_REJECTED
BREAK_GLASS_STARTED
BREAK_GLASS_ENDED
```

## 16. Acceptance Criteria

- Permissions are deny-by-default.
- No tenant-scoped query can execute without tenant context.
- Communication approval routes are configurable and dynamic.
- SIR permissioning supports parent/sub-case/action/swarm origins.
- Push approval is distinct from push execution.
- Grade templates are optional and not binding logic.
- Every privileged action produces an immutable audit event.

## 17. Test Requirements

- Unit tests for permission evaluation.
- Tenant isolation tests.
- Approval chain resolution tests.
- Communication send/approval tests.
- SIR from sub-case/action tests.
- Break-glass audit tests.
- Negative tests proving unauthorised users cannot escalate authority.


---

# DOCUMENT-SPECIFIC REVISION PATCH — 19_Full_RBAC_Permission_Matrix.md

**Patch date:** 2026-05-13  
**Patch type:** Functional review remediation  
**Authority:** Closed-loop doctrine patch v2.0  

## Required Update Applied

This RBAC matrix is updated to remove direct lifecycle authority and replace it with evidence, approval, challenge, prioritisation, and configuration permissions.

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



## v2.2 RBAC Update — P0 Zero-Day Permissions

Add permissions:

```text
case.priority.zero_day.recommend
case.priority.zero_day.apply
case.priority.zero_day.approve
case.priority.zero_day.remove
case.priority.zero_day.configure
case.priority.zero_day.audit
```

P0 application is restricted to authorised senior roles according to tenant policy. Analysts may recommend P0 but must not self-approve unless explicitly granted.
## v2.3 RBAC UI Doctrine Update
RBAC must govern access to UI intensity and command surfaces. P0 War Room, Fusion Map overlays, policy editors, emergency controls, support access, and internal entitlement screens require explicit permissions. Visual access must not imply action authority. Users may see P0 where authorised while action controls remain permission-bound.

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

---

# v2.6 Extension — RBAC Addendum

**Extension version:** v2.6.0
**Extension date:** May 2026
**Extension scope:** Extends the RBAC permission matrix with v2.6 authority overlays, surface-level scopes, and Internal Risk authority. All existing RBAC doctrine above this section remains in force unchanged.

## V2.6-1. New Authority Overlay — Internal Risk Authority

A fifth authority overlay joins the existing four (Administrative, Investigation, Approval, Reporting):

**Internal Risk authority** — applies to roles with access to:

- Verdict Pattern cases (case type 9 per Spec #08 v2.6)
- The Internal Operating Picture's identity-level detail (Spec #66)
- The Behavioural Intelligence section of the Identity Intelligence Surface (Spec #68)
- The Internal Risk Investigation Sub-Lifecycle artefacts (Spec #75)

Internal Risk authority is NOT automatically granted to any existing role. It requires explicit assignment via the Tenant Admin surface. Without Internal Risk authority, a user sees aggregate behavioural intelligence (counts, distributions) but cannot drill into per-identity verdict patterns or open Verdict Pattern cases.

## V2.6-2. Roles with Internal Risk Authority

By default (configurable per tenant):

- **Customer Internal Risk Lead** (new role for v2.6) — full Internal Risk authority across all identities in scope.
- **Customer Internal Risk Analyst** (new role for v2.6) — Internal Risk authority restricted to assigned cases.
- **Risk Analyst** (new persona for v2.6, see Master Proposition Section 22) — Internal Risk authority for risk modelling purposes (read-only on Verdict Pattern cases).
- **CISO** — Internal Risk authority by default.
- **SOM** — Internal Risk authority by default (configurable off where the customer separates insider risk from security operations organisationally).

Roles WITHOUT Internal Risk authority by default:

- Security Operations Analyst
- Vulnerability Analyst
- Security Architect
- Identity/Access Specialist (sees identity entitlement intelligence but not verdict pattern detail)
- Compliance/Audit User (sees aggregate compliance evidence but not per-identity behavioural patterns)
- M&A/Transformation Analyst
- Control Owner

## V2.6-3. Audit-of-Access for Internal Risk Authority

Every access to Verdict Pattern data — listing cases, opening a case, drilling into per-identity verdict history — generates an audit event:

- `INTERNAL_RISK_DATA_ACCESSED`
- Captures: user, role, identity in question, case ID (if applicable), data scope accessed, timestamp.

The audit trail is reviewable by tenant administrators and is required for compliance with employee monitoring frameworks in regulated jurisdictions.

## V2.6-4. Jurisdictional Configurability

Tenants can configure:

- **Disable Internal Behavioural Intelligence ingestion** — entirely, or per identity scope (e.g., disable for European subsidiaries while enabling for non-European subsidiaries).
- **Restrict Verdict Pattern case visibility to specific roles** — beyond the defaults above.
- **Set retention windows for verdict pattern data** — per local employee monitoring requirements.
- **Require Works Council notification** — flag for the Tenant Admin that Verdict Pattern case generation should pause pending Works Council consultation.

These configurations are per Spec #55 v2.6 and are exposed through the Tenant Admin surface.

## V2.6-5. New Surface-Level RBAC Scopes

The v2.6 release adds RBAC scopes for the new surfaces:

| Surface | Default Roles with Access |
|---|---|
| External Operating Picture | SOA, SOM, Security Analyst, Security Architect, CISO, Risk Analyst, Compliance/Audit (read-only) |
| Internal Operating Picture | SOM (with Internal Risk authority), Security Analyst (with Internal Risk authority), CISO, Risk Analyst, Customer Internal Risk roles |
| OODA Dashboard Family (Observe/Orient/Decide/Act phase dashboards) | SOA, SOM, CISO, Risk Analyst, Compliance/Audit (read-only) |
| Command Tempo Dashboard | SOM, CISO, Risk Analyst, Compliance/Audit (read-only) |
| Identity Intelligence Surface (basic view) | All roles with identity visibility (existing) |
| Identity Intelligence Surface (Behavioural Intelligence section) | Roles with Internal Risk authority |
| Asset Intelligence Surface | All roles with asset visibility (existing) |
| Control Weakness Direction Board | SOA, SOM, Security Architect, Security Analyst, CISO |
| Policy Effectiveness Direction Board | Security Architect, Security Analyst, Policy Owner, CISO |
| Silent Defence Reporting | All roles (read-only by default) |

## V2.6-6. New Roles for v2.6

The v2.6 release introduces three new role definitions:

1. **Security Analyst** — cross-domain investigator. Persona detail in Master Proposition v5.0, Section 22.10.
2. **Risk Analyst** — operational risk specialist. Persona detail in Master Proposition v5.0, Section 22.11.
3. **Policy Owner** — owns specific security policies and is the routing target for Policy Effectiveness cases. Role assigned per-policy via the Tenant Admin surface.

Plus customer-side Internal Risk roles (Internal Risk Lead, Internal Risk Analyst) that are assigned by the customer to designate the recipients of Verdict Pattern case routing.

