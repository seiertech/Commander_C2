> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec 40 — P0 Zero-Day Priority Override Specification

Version: v1.0  
Status: Authoritative addendum  
Applies to: Commander SDR Operational Application, Commander SDR Tenant Admin, Commander Internal Control Plane, Case Engine, Prioritisation Model, Routing Model, SLA Model, Communication Layer, Fusion Map, RBAC, Audit

---

## 1. Purpose

P0 Zero-Day Priority is the highest emergency priority class in Commander SDR.

It is a governed priority overlay applied to an existing case-bound risk object when the risk requires immediate operational focus, emergency routing, accelerated SLA, senior ownership, increased validation cadence, forced dashboard prominence, and executive-visible audit.

P0 Zero-Day Priority is not a case status.

P0 Zero-Day Priority must not create a freeform case, close a case, reopen a case, bypass validation, bypass evidence, or bypass closure gates.

---

## 2. Doctrine

The doctrine is deterministic:

1. P0 Zero-Day Priority is a priority overlay, not a lifecycle state.
2. P0 may only be applied to an existing case-bound risk object.
3. P0 may be applied automatically by deterministic rule conditions.
4. P0 may be applied manually only by authorised senior role owners.
5. P0 may be recommended by lower roles but not self-approved unless RBAC permits.
6. P0 immediately overrides queue ordering, SLA profile, routing profile, communication cadence, validation cadence, dashboard prominence, and Fusion Map visibility.
7. P0 does not allow manual case creation.
8. P0 does not allow manual case closure.
9. P0 does not allow manual case reopening outside governed trigger logic.
10. P0 does not mark remediation complete.
11. P0 downgrade or removal requires equal-or-higher authority, reason code, audit capture, and validation/evidence context.
12. P0 must feel operationally expensive to apply.

---

## 3. Priority Model

The canonical priority classes are:

```text
P0_ZERO_DAY
P1_CRITICAL
P2_HIGH
P3_MEDIUM
P4_LOW
P5_INFORMATIONAL
```

P0 ranks above all existing priorities.

P0 must be treated as `drop_everything_now` for operational queue ordering.

---

## 4. Relationship to Severity and Status

Priority, severity, and lifecycle status are separate fields.

| Field | Example |
|---|---|
| Case lifecycle status | OPEN / ROUTED / PENDING_VALIDATION / CLOSED |
| Severity | CRITICAL |
| Priority | P0_ZERO_DAY |
| SLA profile | ZERO_DAY_EMERGENCY |
| Routing mode | DROP_EVERYTHING |
| Operational tempo | SURGE |

P0 does not replace lifecycle state.

---

## 5. Manual Application Authority

The following RBAC permissions are required:

```text
case.priority.zero_day.recommend
case.priority.zero_day.apply
case.priority.zero_day.approve
case.priority.zero_day.remove
case.priority.zero_day.configure
case.priority.zero_day.audit
```

Recommended role mapping:

| Role | Authority |
|---|---|
| Analyst | Recommend only |
| Senior Analyst | Recommend and escalate |
| Team Lead | Apply within owned domain if tenant policy permits |
| SOC Manager | Apply across operational cases |
| CISO / Deputy CISO | Apply across all cases |
| Security Architect | Apply for architecture, control, exposure, and mission-impact risks |
| Platform Admin | Apply for platform, connector, tool-health, and coverage risks |
| Tenant Admin | Configure P0 policy and eligible roles |
| Commander Internal Operator | Apply only under support-access / emergency-access policy, with customer-authorised audit trail |

---

## 6. Approval Modes

Tenant Admin must support the following modes:

| Mode | Behaviour |
|---|---|
| Direct Senior Override | Authorised senior role applies P0 immediately |
| Approval Required | User recommendation creates an approval task |
| Auto-Apply by Rule | Deterministic rules apply P0 without manual approval |
| Hybrid | System recommends P0; senior role confirms |

Default mode for enterprise tenants: `Approval Required`.

Default mode for military/intelligence tenants: configurable; may be `Direct Senior Override` or `Auto-Apply by Rule`.

---

## 7. Automatic Trigger Conditions

P0 may be auto-applied or recommended when one or more configured conditions are met:

1. confirmed active exploitation;
2. CISA KEV match on internet-facing asset;
3. exploit available and asset is externally exposed;
4. ransomware campaign mapped to affected vulnerability/control weakness;
5. mission-critical asset affected;
6. privileged identity compromise path exists;
7. affected asset lacks EDR, NDR, scanner, or logging coverage;
8. blast radius exceeds configured threshold;
9. exploit chain connects identity + exposure + vulnerable asset;
10. BAS confirms exploitable path;
11. cloud control failure exposes sensitive workload;
12. public-facing production system vulnerable to remote code execution;
13. emergency vendor advisory received;
14. exploitability severity rises after case creation;
15. existing case becomes time-critical due to new intelligence;
16. tenant-defined mission objective enters surge mode.

---

## 8. SLA Behaviour

P0 immediately replaces the active SLA profile with `ZERO_DAY_EMERGENCY`, unless a stricter tenant-specific profile exists.

Recommended baseline:

| SLA Area | P0 Behaviour |
|---|---|
| Triage acknowledgement | Immediate / <= 15 minutes |
| Owner assignment | Immediate / <= 15 minutes |
| First stakeholder notification | <= 30 minutes |
| Remediation plan | <= 1 hour |
| Mitigation action | <= 4 hours where feasible |
| Validation cadence | every 1–2 hours |
| Executive update | every 2–4 hours or tenant-defined |
| Downgrade review | required before removal |
| Closure | only through governed validation and closure gates |

---

## 9. Routing Behaviour

When P0 is applied, the routing engine must recalculate immediately.

Required routing effects:

1. pin case above all non-P0 work;
2. route to senior owner;
3. route to domain team owner;
4. route to remediation owner;
5. route to validation owner;
6. route to communication owner;
7. add executive watcher where configured;
8. generate emergency swarm when multiple teams are required;
9. escalate if owner acceptance is not recorded within P0 SLA;
10. recalculate routing if blast radius, mission impact, domain, or asset ownership changes.

---

## 10. Sub-Action Generation

P0 must generate or accelerate sub-actions.

Required sub-actions:

1. confirm affected assets;
2. confirm exploitability;
3. identify owner;
4. assess compensating controls;
5. apply mitigation;
6. validate mitigation;
7. communicate to stakeholders;
8. update senior leadership;
9. monitor for recurrence;
10. confirm closure gates.

Optional sub-actions:

1. push IOC blocks;
2. create SIEM/SOAR detection;
3. request emergency scan;
4. request BAS validation;
5. isolate asset if permitted;
6. disable exposed service if permitted;
7. apply firewall/WAF rule;
8. revoke risky identity access;
9. raise emergency change-control request.

---

## 11. Communication Behaviour

P0 must trigger communication bindings.

Required communications:

1. senior owner notification;
2. assigned team notification;
3. remediation owner notification;
4. validation owner notification;
5. communication owner notification;
6. watcher notification;
7. executive notification where configured;
8. external notifier update where relevant;
9. stakeholder/customer update where configured.

P0 communication templates:

1. P0 declared;
2. P0 owner assigned;
3. P0 mitigation underway;
4. P0 validation failed;
5. P0 validation passed;
6. P0 downgraded;
7. P0 closure confirmed;
8. P0 reopened / re-escalated.

---

## 12. Validation Behaviour

P0 changes validation cadence and visibility.

It does not bypass validation.

Validation requirements:

1. validation cadence must increase;
2. stale evidence threshold must reduce;
3. failed validation must preserve P0 unless downgrade criteria are met;
4. successful validation may trigger downgrade recommendation or closure gate evaluation;
5. validation result must be visible on case detail, Command Centre, Team Pulse, Domain Pulse, CISO Dashboard, and Fusion Map.

---

## 13. Downgrade and Removal

P0 may be downgraded or removed only when one or more conditions are met:

1. validation confirms risk is not present;
2. exploitability is disproven;
3. affected asset is out of scope;
4. compensating control fully mitigates immediate exposure;
5. asset is decommissioned;
6. false positive is approved;
7. residual risk is accepted by authorised senior owner;
8. system conditions fall below configured P0 threshold;
9. duplicate is merged into a parent P0 case;
10. intelligence changes reduce urgency.

Removal requires:

1. permission `case.priority.zero_day.remove`;
2. equal-or-higher authority than applicant or rule policy;
3. reason code;
4. evidence reference;
5. audit event;
6. communication event where configured.

---

## 14. Data Model

Add to Case:

```text
priority_class: enum
priority_override_active: boolean
priority_override_type: enum
priority_override_reason: string
priority_override_applied_by: user_id
priority_override_applied_at: datetime
priority_override_expires_at: datetime optional
zero_day_profile_id: string
zero_day_sla_profile_id: string
zero_day_routing_profile_id: string
zero_day_communication_profile_id: string
zero_day_downgrade_required_by: datetime optional
```

Add object:

```text
ZeroDayPriorityEvent:
- event_id
- case_id
- risk_object_id
- event_type
- applied_by
- applied_by_role
- applied_at
- trigger_source
- reason_code
- justification
- evidence_refs
- previous_priority
- new_priority
- sla_profile_before
- sla_profile_after
- routing_profile_before
- routing_profile_after
- notifications_sent
- sub_actions_generated
- approval_chain
- audit_hash
```

---

## 15. API Requirements

Required API surface:

```text
POST /cases/{case_id}/priority/zero-day/recommend
POST /cases/{case_id}/priority/zero-day/apply
POST /cases/{case_id}/priority/zero-day/remove
POST /cases/{case_id}/priority/zero-day/approve
GET  /cases/zero-day
GET  /cases/{case_id}/priority-history
GET  /zero-day/policy
PUT  /zero-day/policy
GET  /zero-day/audit
```

These endpoints must not directly create, close, or request revalidation or challenge closures.

---

## 16. UI Requirements

Operational App:

1. P0 badge in case list;
2. P0 pinned queue section;
3. P0 panel in case detail;
4. P0 reason/evidence trail;
5. P0 SLA countdown;
6. P0 routing chain;
7. P0 communication cadence;
8. P0 validation status;
9. P0 downgrade control for authorised users;
10. P0 overlay in Fusion Map;
11. P0 active cases panel in Command Centre;
12. P0 section in CISO Dashboard;
13. P0 filter and toggle across case and map views.

Tenant Admin:

1. P0 policy configuration;
2. approval mode;
3. role authority;
4. trigger thresholds;
5. SLA profile;
6. routing profile;
7. communication profile;
8. validation profile;
9. audit retention;
10. emergency swarm rules.

Commander Internal Control Plane:

1. tenant-level P0 capability flag;
2. P0 licence/entitlement gating if commercial model requires it;
3. P0 feature availability by deployment ring;
4. P0 emergency support access visibility;
5. cross-tenant P0 telemetry roll-up without customer-sensitive details unless authorised;
6. P0 feature kill switch;
7. P0 audit export for support/governance.

---

## 17. Fusion Map Requirements

Fusion Map must support:

1. P0 node badge;
2. P0 case node pinning;
3. P0 affected asset overlay;
4. P0 blast-radius overlay;
5. P0 identity-path overlay;
6. P0 exposed-service overlay;
7. P0 control-failure overlay;
8. P0 validation state overlay;
9. P0 routing owner overlay;
10. P0 sub-action overlay;
11. P0 communication state overlay.

Interaction rule:

Clicking a P0 node must open the bound case or risk object. It must not create a new case.

---

## 18. Audit Requirements

Every P0 event must audit:

1. actor;
2. role;
3. tenant;
4. case;
5. risk object;
6. trigger source;
7. reason code;
8. justification;
9. evidence reference;
10. previous priority;
11. new priority;
12. SLA change;
13. routing change;
14. sub-actions generated;
15. communications sent;
16. approvals;
17. downgrade/removal reason;
18. validation evidence;
19. closure result;
20. audit hash.

---

## 19. Feature Registry Entry

Feature ID:

```text
FR-ZD-001 — P0 Zero-Day Priority Override
```

Description:

Allows authorised senior role owners or deterministic rules to apply a governed P0 Zero-Day priority overlay to existing case-bound risks, triggering emergency SLA, routing, validation cadence, communication cadence, dashboard prominence, Fusion Map visibility, sub-action generation, and audit controls.

Dependencies:

1. Case Engine;
2. Prioritisation Model;
3. Routing Model;
4. SLA Strategy;
5. RBAC;
6. Communication Layer;
7. Validation Engine;
8. Fusion Map;
9. Command Centre;
10. CISO Dashboard;
11. Tenant Admin;
12. Commander Internal Control Plane;
13. Audit Log.

---

## 20. Acceptance Criteria

1. P0 appears above all other priority classes.
2. P0 can be applied only to case-bound risks.
3. P0 cannot create a freeform case.
4. P0 cannot close a case.
5. P0 cannot bypass validation.
6. P0 changes SLA immediately.
7. P0 changes routing immediately.
8. P0 generates required sub-actions.
9. P0 triggers communications.
10. P0 appears on Command Centre, Case Management, CISO Dashboard, Team Pulse, Domain Pulse, and Fusion Map.
11. P0 downgrade requires authority, reason, evidence, and audit.
12. P0 policy is configurable through Tenant Admin.
13. P0 entitlement/availability is visible through Commander Internal Control Plane.
14. P0 events are fully auditable.
## v2.3 P0 UI Update
P0 Zero-Day now has a dedicated War Room UI specification. P0 must render as an emergency priority overlay with persistent banner, SLA countdown, senior owner, routing state, validation cadence, communication cadence, generated sub-actions, Fusion Map slice, downgrade controls, and audit timeline. P0 is not a lifecycle status.

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
