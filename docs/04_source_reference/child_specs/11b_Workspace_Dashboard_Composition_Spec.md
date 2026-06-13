> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #11b — Workspace & Dashboard Composition Specification

**Document ID:** `11b_Workspace_Dashboard_Composition_Spec.md`  
**Spec:** 11b  
**Version:** v1.0  
**Status:** Approved Baseline — Build Package Derivation Ready  
**Date:** May 2026  
**Owner:** Johann / Commander SDR Architecture  
**Phase:** Phase 1 capability / Phase 0-compatible design

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v4_7.md`
- `Commander_SDR_Master_Technical_Specification_v6_7.md`
- `SDR_Specification_Schedule_and_Folder_Structure_v1_8.md`
- `05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md`
- `Spec_08_Case_Management_Workflow_v1_6.md`
- `SOM_Configuration_Panel_Spec_v1_6.md`
- `26a_Closed_Loop_Email_Case_Communication_Lifecycle_Spec_v1_2.md`
- `AGENTS.md`

**Build boundary:** TypeScript-first runtime. Python is support/analytics only. No real push execution in Phase 0. All tenant-scoped data, jobs, APIs, UI routes and audit entries require tenant context.


---

## 0. Purpose

This specification converts the Commander SDR master baseline into build-ready technical guidance for the named capability area. It is subordinate to the Master Proposition and Master Technical Specification and must not introduce unapproved product capability. Where implementation detail is required, this document defines the expected service boundaries, configuration model, data contracts, audit obligations, acceptance criteria and testing rules.

---

## 1. Purpose

This specification defines the composition of Commander SDR workspaces, dashboards, case screens and administration surfaces. Spec #11a defines how UI is built; this document defines what each screen contains and how users move through the product.

## 2. Workspace Model

| Workspace | Primary users | Purpose |
|---|---|---|
| Command Centre | SOM, CISO, analysts | Estate-level posture, risk, case, coverage, VM and architecture overview. |
| Case Management | Analysts, team leads, SOM | Case queues, sub-cases, actions, SLA, communication, SIR and evidence. |
| Vulnerability Management | VM team, asset owners | Vulnerability intake, prioritisation, validation, remediation and closure gates. |
| Architecture | Security architects | Architecture drift, trust boundaries, design incongruence, debt and topology. |
| Identity | Identity specialists | Identity exposures, CHAIN findings, access paths and privilege risk. |
| Governance | Compliance and leadership | Evidence, exceptions, posture, standards and strategic/tactical priorities. |
| Admin | Tenant admins, SOM | Connectors, mailboxes, RBAC, communication governance, templates, tenant config. |
| CISO Dashboard | CISO, executives | Board-level posture, exposure, progress, debt, risk trajectory and operational value. |
| SOM Dashboard | SOM, team leads | Workload, SLA, momentum, team health, assignment and communication bottlenecks. |

## 3. Command Centre Composition

Required panels:

1. Estate posture score and trend.
2. Critical drift findings by domain.
3. Active cases by priority, age and SLA state.
4. VM exposure summary: KEV, critical CVEs, externally exposed assets, closure gate state.
5. Asset coverage: EDR, NDR, VM, identity, logging, ZTA.
6. Tool health: connectors, mailboxes, Graph status, ingestion backlog.
7. Communication risk: stale owner responses, unallocated inbound emails, pending SIR acknowledgements.
8. Architecture drift: external mismatch, trust boundary gaps, design debt.
9. Identity exposure: privileged access paths, high-risk identities, CHAIN triggers.
10. Next best operational actions.

## 4. Case Management Screen

### 4.1 Case Queue

Columns:

```text
case_id, priority, CRS, case_type, title, owner, team, SLA, communication_state,
SIR_state, sub_case_count, last_activity, next_best_action
```

Filters:

```text
priority, case type, owner, team, SLA state, communication state, SIR state,
VM/identity/architecture, stale, awaiting approval, unallocated email present
```

### 4.2 Case Detail

Required sections:

- Sticky case header: title, priority, CRS, SLA, owner, phase, communication state.
- Summary and Commander context.
- Sub-case/action board.
- Timeline: case events, emails, approvals, SIRs, validation, audit entries.
- Communication panel: parent case thread, sub-case threads, swarm threads.
- Evidence pack.
- Approval chain and pending actions.
- ITSM/sync references.
- Closure readiness and gates.

### 4.3 Sub-case / Action Panel

Each sub-case/action must include:

- Owner, status, impact, confidence, dependencies.
- Sub-case-specific SLA/response state.
- Send email action.
- Raise SIR action.
- Evidence and validation controls.
- Roll-up visibility to parent case.

## 5. Vulnerability Management Workspace

Required views:

1. VM Intake Queue: scanner, email, threat intel, vendor, manual.
2. KEV and critical exposure board.
3. Asset-owner remediation tracker.
4. Patch/source validation view.
5. External notifier lifecycle view.
6. Closure gates and communication debt.
7. Exception / risk acceptance / security debt view.

The VM workspace must surface inbound emails that mention CVEs/assets but cannot be auto-linked. Analysts must be able to link to parent case, sub-case, action, create a new case, or dismiss.

## 6. Admin Workspace

Required admin sections:

| Section | Required capabilities |
|---|---|
| Connectors | Configure, test, pause, health, credentials reference. |
| Mailboxes | Shared/group/user mailbox setup, Graph permission health, sync status. |
| Communication Governance | Permission and approval chain matrix, recipient classes, redaction, suppression. |
| SIR Setup | Destination mailbox, template, approval chain, acknowledgement rules. |
| Case Type Routing | Default mailbox, playbook, SLA, closure gate and templates per case type. |
| Templates | Versioned email/SIR templates and usage rules. |
| Manual Allocation | Queue for uncorrelated inbound emails. |
| Tenant Config | Coverage, SLA, SOM, RBAC and operational settings. |

## 7. CISO Dashboard

Must show:

- Posture and exposure trend.
- Open critical risk by domain.
- Security debt and remediation velocity.
- Tool health and control coverage.
- VM critical/KEV exposure.
- Architecture drift and trust boundary blind spots.
- Operational savings and automation contribution.
- SIR volume/status and incident referral confidence.

## 8. SOM Dashboard

Must show:

- Queue load, ageing, SLA breach forecast.
- Analyst/team WCS and momentum.
- Stale communication, pending approvals, unallocated inbound emails.
- SIR acknowledgement backlog.
- Case swarm status.
- Top blockers and next best management actions.

## 9. Screen Governance

Every dashboard panel must have:

```text
data source
calculation rule
refresh cadence
drill-through target
empty state
permission boundary
export policy
```

## Acceptance Criteria

A capability built against this specification is acceptable only when:

1. Tenant isolation is enforced at API, service, repository, worker and UI levels.
2. All state-changing operations create audit entries with actor, tenant, action, target and timestamp.
3. No real push/write execution is introduced into Phase 0 unless explicitly authorised by the architecture owner.
4. All APIs use typed contracts and validation.
5. Error paths are deterministic, surfaced to users where appropriate, and captured in operational telemetry.
6. Tests cover unit behaviour, contract validation, tenant isolation, permission failures, retry/failure paths and audit emission.
7. The implementation does not contradict MTS v6.7, Spec #8, Spec #26a, or the AGENTS guardrails.


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

# DOCUMENT-SPECIFIC REVISION PATCH — 11b_Workspace_Dashboard_Composition_Spec.md

**Patch date:** 2026-05-13  
**Patch type:** Functional review remediation  
**Authority:** Closed-loop doctrine patch v2.0  

## Required Update Applied

This workspace specification is updated to include the Shell UI delta surfaces: Fusion Map, Strategy Centre, Mission Control, pulse views, routing, validation, closure, reopening, and communication consoles.

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
## v2.3 Workspace Composition Update — Pulse, Tactical, and Emergency Surfaces
Dashboard composition must support three intensity levels: Operational Standard, Tactical Analysis, and Emergency Command. Command Centre must include System Pulse, Team Pulse, Domain Pulse, Mission Pulse, P0 strip, validation blockers, routing backlog, communication cadence, Fusion Map summary, and closure-gate summaries. Fusion Map and P0 War Room receive tactical/emergency visual treatments without changing shell geometry.

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
