> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 29. Universal Risk Object and Case Binding Specification

## Status
MANDATORY. BUILD-BLOCKING.

## Purpose
Defines the canonical risk object and the rule that every actionable risk is already case-bound.

## Doctrine
- No manual case creation.
- No unbound actionable risk objects.
- No optional case promotion for active findings.
- Every risk object binds to a case, existing case, approved suppression, accepted residual-risk record, or allocation-error object.

## Risk Object Types
- identity
- architecture
- vulnerability
- exposure
- control
- drift
- tool_health
- coverage
- blast_radius
- asset
- communication
- trust_boundary
- BAS
- SIEM_SOAR
- shared_responsibility
- security_debt
- exception

## Binding Outcomes
| Outcome | Meaning | Allowed? |
|---|---|---|
| `bound_new_case` | New case created by system. | Yes |
| `linked_existing_case` | Object linked to existing case. | Yes |
| `suppressed_approved` | Suppressed by approved policy. | Yes |
| `residual_risk_accepted` | Bound to residual-risk record. | Yes |
| `allocation_error` | Binding failed; system creates allocation-error case. | Yes |
| `unbound` | Actionable object without case. | No |

## Acceptance Criteria
- Ingestion tests fail if actionable risk objects remain unbound.
- UI tests fail if users can create freeform cases.
- API tests fail if direct case creation endpoint bypasses risk-object binding.


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


---

# v2.6 Extension — Universal Risk Object Addendum

**Extension version:** v2.6.0
**Extension date:** May 2026
**Extension scope:** Extends the `risk_object_type` enumeration with v2.6 case type bindings. All existing Universal Risk Object doctrine above this section remains in force unchanged.

## V2.6-1. New Risk Object Type Enumeration Values

The `risk_object_type` enum is extended with the following values for v2.6:

| Enum Value | Case Type | Binding Source |
|---|---|---|
| `external_attack_correlation` | External Attack Correlation (case type 8) | SOC case ingested via Class A connector, correlated to Commander entity |
| `verdict_pattern` | Verdict Pattern (case type 9) | Verdict pattern detection on identity (per Spec #62, Spec #75) |
| `coverage_blindspot` | Inverse Discovery (case type 10) | External signal references unknown entity (per Spec #72) |
| `policy_effectiveness` | Policy Effectiveness (case type 11) | Policy verdict pattern anomaly (per Spec #62) |
| `ooda_phase_degradation` | OODA Tempo Degradation (case type 12) | Internal Commander phase health below threshold (per Spec #58) |

The pre-v2.6 enumeration values (`drift`, `vulnerability`, `identity`, `exposure`, `coverage`, `tool_health`, `threat_intel_match`) remain valid and unchanged.

## V2.6-2. Binding Source Specifications

Each new risk object type has a specific binding source contract:

### external_attack_correlation

**Bound when:** SOC case (Class A signal) references one or more Commander entities (assets, identities, applications).
**Binding payload:** `socCaseId`, `socPlatform`, `socSeverity`, `commanderEntityRefs[]`, `correlationConfidence`, `preWarnedClassification` (per Spec #71), `relatedDriftItems[]`.
**Authority resolution:** SOC case identity remains in SOC platform. Commander's correlation record is parallel and independent.

### verdict_pattern

**Bound when:** Behavioural pattern detection (per Spec #75) generates a pattern requiring attention.
**Binding payload:** `identityRef`, `patternType` (peer-deviation/temporal/geographic/policy-concentration), `patternConfidence`, `verdictWindow` (start, end), `verdictCount`, `verdictSources[]`.
**Authority resolution:** Identity authority per existing identity model; pattern detection authority is Commander's behavioural intelligence engine.

### coverage_blindspot

**Bound when:** External signal (SOC case, verdict, threat intel) references entity not in Commander's inventory.
**Binding payload:** `referenceSource` (signal type and ID), `referenceText`, `attemptedMatches[]`, `rootCauseClassification` (discovery_gap / staleness / shadow_it / naming_mismatch), `proposedEntityProfile`.
**Authority resolution:** No existing entity to bind to; the case is the placeholder until entity onboarding completes.

### policy_effectiveness

**Bound when:** Policy exhibits effectiveness anomaly (override rate, zero-fire, drift between intended and actual).
**Binding payload:** `policyRef`, `policyOwner`, `anomalyType` (override_rate / zero_fire / drift), `anomalyDetails`, `verdictWindow`, `recommendedAction`.
**Authority resolution:** Policy authority is the source platform (CA, DLP, Intune); Commander's policy effectiveness assessment is observational.

### ooda_phase_degradation

**Bound when:** Phase health score drops below baseline for sustained window.
**Binding payload:** `phaseName` (observe/orient/decide/act), `currentHealthScore`, `baselineHealthScore`, `primaryDriverMetric`, `degradationDuration`, `recommendedActions[]`.
**Authority resolution:** Commander's internal operational state; no external authority involved.

## V2.6-3. Cross-Binding Rules

A single underlying issue may bind to multiple risk objects across types. For example:

- A drift item becomes a Drift case (risk_object_type: drift).
- An external attack lands on the asset affected by the drift, generating an External Attack Correlation case (risk_object_type: external_attack_correlation).
- The two cases are cross-linked but remain separate cases with separate lifecycles.

Cross-binding is captured via the existing `relatedRiskObjects[]` field on each case. The relationship type (`predecessor_of`, `correlated_with`, `caused_by`) is captured to enable navigation between related cases.

## V2.6-4. Risk Object Authority for New Types

| Risk Object Type | Authority Domain | Notes |
|---|---|---|
| external_attack_correlation | Class A connector (SOC platform) for incident facts; Commander engines for correlation and classification | Commander does NOT have authority on incident response decisions — that stays with the SOC |
| verdict_pattern | Identity model (existing) for identity; Commander behavioural engine for pattern | Commander surfaces patterns but does NOT determine intent |
| coverage_blindspot | Commander discovery / inventory engines | Authority is internal to Commander's inventory model |
| policy_effectiveness | Source platform for policy state; Commander verdict semantics engine for effectiveness assessment | Policy modification authority remains with source platform |
| ooda_phase_degradation | Commander operational engines | Authority is internal |

## V2.6-5. Audit Events

New audit events for risk object binding:

- `RISK_OBJECT_EXTERNAL_ATTACK_CORRELATION_BOUND`
- `RISK_OBJECT_VERDICT_PATTERN_BOUND`
- `RISK_OBJECT_COVERAGE_BLINDSPOT_BOUND`
- `RISK_OBJECT_POLICY_EFFECTIVENESS_BOUND`
- `RISK_OBJECT_OODA_PHASE_DEGRADATION_BOUND`
- `RISK_OBJECT_CROSS_BINDING_CREATED`

