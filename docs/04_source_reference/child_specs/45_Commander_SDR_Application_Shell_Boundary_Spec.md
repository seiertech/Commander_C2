> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 45 — Commander SDR Application Shell Boundary Specification

## 1. Status
- Version: v1.0
- Pack revision: v2.3
- Purpose: Prevents UI drift between the three Commander application surfaces.

## 2. Application Surfaces

| Surface | Purpose | Shell Status |
|---|---|---|
| Commander SDR Operational Application | customer-facing risk, case, validation, Fusion Map, communication, dashboards | fixed operational shell; content evolves |
| Commander SDR Tenant Admin Surface | customer admin configuration for tenant behaviour | settings/admin shell within SDR boundary |
| Commander Internal Control Plane Application | internal Seiertech/operator app for licences, entitlements, customers, deployment, support, emergency controls | separate shell; operator-console treatment |

## 3. Operational Shell Boundary
The Operational App shell owns:
- Command Centre;
- Case Management;
- Vulnerabilities;
- Exposure;
- Identity;
- Architecture;
- Assets;
- Governance;
- Tool Health;
- Fusion Map;
- CISO Dashboard;
- Reporting;
- Commander AI entry point.

It must not become the full tenant/admin/internal control console.

## 4. Tenant Admin Boundary
Tenant Admin owns customer-configurable settings:
- users and roles;
- connectors;
- SLA policy;
- routing policy;
- validation policy;
- communication channels;
- feature activation within entitlement;
- P0 policy configuration;
- Commander AI tenant guardrails;
- audit/export;
- read-only licence state.

Tenant Admin does not allocate commercial licences or global entitlements.

## 5. Commander Internal Control Plane Boundary
Internal Control Plane owns:
- customers;
- tenants;
- licence allocation;
- entitlement manifests;
- commercial modules;
- feature availability;
- deployment rings;
- trial/demo/dogfood tenants;
- support access;
- self-hosted licence artefacts;
- operator audit;
- emergency commercial/platform controls.

It must not be used for routine customer case operations except under governed support access.

## 6. Shared Design Rules
All shells share:
- Commander visual tokens;
- square geometry;
- command-grade density;
- monochrome geometric icon style;
- clear audit and evidence surfacing;
- P0 visual language where relevant.

## 7. Forbidden Crossovers
- Operational shell must not expose licence allocation grids.
- Tenant Admin must not expose internal customer commercial controls.
- Internal Control Plane must not bypass tenant RBAC without support-access audit.
- No shell may introduce manual case creation or manual closure.
- No shell may hide active P0 from authorised senior users.

## 8. Build Acceptance Criteria
- Each new page declares target application surface.
- Each navigation item belongs to exactly one primary surface.
- Cross-surface links require permission and audit where sensitive.
- UI doctrine tokens are reused across surfaces.
- Shell geometry remains stable unless a migration is explicitly approved.

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
