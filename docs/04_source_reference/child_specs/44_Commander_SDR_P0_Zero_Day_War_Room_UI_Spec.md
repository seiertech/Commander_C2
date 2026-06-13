> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 44 — Commander SDR P0 Zero-Day War Room UI Specification

## 1. Status
- Version: v1.0
- Pack revision: v2.3
- Depends on: Spec 40 P0 Zero-Day Priority Override, Spec 41 UI Doctrine, Spec 43 Graph/Gauge/Overlay System.

## 2. Purpose
Defines the emergency command user interface for active P0 Zero-Day cases.

The P0 War Room is not a separate lifecycle. It is a UI composition that renders the P0 priority overlay, emergency SLA, routing, validation, communication, Fusion Map context, and senior accountability.

## 3. Entry Conditions
The P0 War Room is available when:
- a case has `priority_class = P0_ZERO_DAY`; or
- a deterministic rule recommends P0 and awaits senior approval; or
- a mission-critical risk cluster contains one or more P0 cases.

## 4. Required Panels

| Panel | Purpose |
|---|---|
| P0 Banner | declares P0, senior owner, applied time, reason |
| SLA Countdown Rail | shows triage, owner acceptance, mitigation, validation, exec update timers |
| Senior Accountability Rail | lists accountable owners and acknowledgement status |
| Emergency Routing Panel | shows teams, owners, escalation path, acceptance state |
| Sub-Action Board | generated emergency sub-actions and blockers |
| Validation Cadence Panel | last validation, next validation, failed validations, evidence freshness |
| Communication Cadence Panel | last update, next update, recipients, templates, external notifier state |
| Fusion Map Slice | affected assets, identities, controls, exposure path, blast radius |
| Mitigation Options Panel | allowed actions, approval requirements, automation boundaries |
| Evidence Chain Panel | source, exploitability, KEV/intel, scanner data, BAS results |
| Downgrade/Removal Panel | authority, reason codes, required evidence |
| Audit Timeline | all P0 decisions, notifications, routing changes, validation changes |

## 5. Interaction Rules
Allowed:
- recommend P0;
- apply P0 if authorised;
- approve P0 if configured;
- remove/downgrade P0 if authorised and evidence-backed;
- request validation refresh;
- request routing review;
- approve governed emergency automation;
- send/update case-bound communications;
- prioritise sub-actions.

Forbidden:
- manual case creation;
- manual lifecycle closure;
- validation bypass;
- evidence bypass;
- deletion of P0 history;
- hiding active P0 from authorised senior views.

## 6. Layout Doctrine
- Intensity Level: Level 3 Emergency Command.
- Tactical dark view allowed.
- Persistent P0 banner required.
- Case detail remains accessible.
- Fusion Map is contextual, not the only operating surface.
- Tables remain available for owners, sub-actions, communications, and evidence.

## 7. Role Views

| Role | View |
|---|---|
| Analyst | can view, recommend, update evidence, work assigned sub-actions |
| Senior Analyst | can recommend, coordinate, request validation/routing review |
| Team Lead | can apply within domain if permitted, accept ownership, manage sub-actions |
| SOC Manager | can apply/remove, assign senior owners, approve emergency cadence |
| CISO / Deputy CISO | can apply/remove across cases, approve residual downgrade |
| Tenant Admin | configures P0 policy, not routine case operations |
| Internal Operator | can view/apply only under support-access and emergency governance |

## 8. Data Requirements
- `case_id`
- `risk_object_id`
- `priority_class`
- `zero_day_profile_id`
- `zero_day_sla_profile_id`
- `zero_day_routing_profile_id`
- `zero_day_communication_profile_id`
- `senior_owner_id`
- `validation_cadence`
- `communication_cadence`
- `sub_action_ids`
- `fusion_slice_id`
- `audit_events`

## 9. Build Acceptance Criteria
- P0 War Room renders only for P0 or P0-recommended cases.
- P0 is visually and textually unmistakable.
- SLA countdown is visible above the fold.
- Senior owner is visible above the fold.
- Routing state is visible above the fold.
- Validation state is visible above the fold.
- Downgrade/removal requires permission, reason, and evidence.
- All P0 actions emit audit events.

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

