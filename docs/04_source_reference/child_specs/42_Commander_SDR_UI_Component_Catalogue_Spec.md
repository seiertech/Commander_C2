> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 42 — Commander SDR UI Component Catalogue Specification

## 1. Status
- Version: v1.0
- Pack revision: v2.3
- Purpose: Defines reusable UI components for the Commander SDR Operational App, Tenant Admin Surface, and Commander Internal Control Plane.

## 2. Component Rules
- Components must use v2.3 UI doctrine tokens.
- Components must use square geometry unless explicitly excepted.
- Components must expose data provenance where operational decisions are made.
- Components must not create manual case lifecycle authority.
- Components must preserve prioritisation-only interaction doctrine.

## 3. Core Operational Components

| Component | Purpose | Required Bindings |
|---|---|---|
| Command Card | High-density operational summary | domain, priority, validation, routing, case binding |
| Metric Strip | Compact KPI row | source freshness, time window, tenant/org filters |
| Pulse Panel | System/team/domain/mission pulse | pulse score, trend, blockers, P0 count |
| Case Queue Table | Operational case work queue | case, priority, SLA, owner, validation, routing |
| Case Detail Rail | Right-side case context | lifecycle, evidence, sub-actions, communication |
| Priority Override Panel | Displays governed priority overlays | P0/P1/P2 state, authority, reason, audit |
| P0 Zero-Day Panel | Emergency case command block | senior owner, SLA countdown, cadence, routing |
| Validation State Panel | Shows validation state and evidence | validation lifecycle, evidence refs, freshness |
| Closure Gate Panel | Shows closure blockers | sub-actions, validation, communication, exception |
| Routing Rationale Panel | Explains assignment | rule, owner, affinity, fallback, escalation |
| Communication Thread Panel | Case-bound communication | mailbox, thread, recipient, status, cadence |
| Audit Timeline | Decision history | user/system, event, object, timestamp, evidence |

## 4. Tactical Analysis Components

| Component | Purpose | Required Bindings |
|---|---|---|
| Fusion Map Canvas | Multi-domain graph | nodes, edges, overlays, case/risk binding |
| Fusion Node | Graph entity | node type, risk, priority, domain, status |
| Fusion Edge | Graph relationship | edge type, evidence, confidence, timestamp |
| Overlay Toggle Rail | Domain/priority/control overlays | layer state, role visibility |
| Threat Corridor | Attack/exposure path | exposure, identity, control, blast radius |
| Blast Radius Meter | Impact visual | affected nodes, mission, criticality |
| Coverage Heat Grid | Coverage and tool gaps | asset/control/tool freshness |
| Telemetry Stack Bar | Source and connector state | connector, freshness, reliability |
| Arc Meter | Posture/risk strength | score, threshold, trend |

## 5. Admin and Control Components

| Component | Purpose | Surface |
|---|---|---|
| Policy Editor | SLA/routing/validation/automation policy | Tenant Admin / Control Plane |
| Entitlement Allocation Grid | Licences, modules, features | Internal Control Plane |
| Customer Register Table | Customer/tenant summary | Internal Control Plane |
| Deployment Ring Panel | Ring membership and rollout state | Internal Control Plane |
| Feature Flag Matrix | Feature availability | Tenant Admin / Control Plane |
| Connector Control Card | Connector state/configuration | Tenant Admin |
| AI Guardrail Panel | Commander AI policy | Tenant Admin / Control Plane |
| Emergency Control Panel | Kill switches and P0 governance | Control Plane |
| Licence State Banner | Licence/trial/expiry state | Tenant Admin / Control Plane |

## 6. Required Component Metadata
Each reusable component must declare:
- `component_id`
- `surface`
- `roles_allowed`
- `data_dependencies`
- `event_outputs`
- `lifecycle_bindings`
- `routing_bindings`
- `validation_bindings`
- `strategy_bindings`
- `p0_behaviour`
- `audit_events`

## 7. Forbidden Components
- Freeform manual case creation button.
- Manual challenge or evidence system closure button.
- Manual request revalidation or challenge closure button.
- Decorative KPI tiles with no evidence path.
- Unbound chart panels with no source, freshness, or drill-through.
- Visual-only priority state with no text label or audit reason.

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
