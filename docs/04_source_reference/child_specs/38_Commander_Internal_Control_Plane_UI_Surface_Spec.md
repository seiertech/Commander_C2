> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 38 — Commander Internal Control Plane UI Surface Specification

## 1. Purpose
Define the dedicated UI shell and screens for the internal Commander Control Plane used by the Seiertech / Commander team.

## 2. Shell Identity
Application name: **Commander Control Plane**

Recommended route:
- `control.commandersdr.com`

Alternative route:
- `admin.commandersdr.com`

## 3. Navigation Model

### 3.1 Top Navigation
- Operator Command
- Customers
- Tenants
- Licences
- Entitlements
- Deployments
- Support Access
- Audit

### 3.2 Sidebar Navigation

#### Operator Command
- Control Plane Home
- Exception Queue
- Expiring Trials
- Licence Breaches
- Ring Health
- Support Requests

#### Customers
- Customer Register
- Customer Detail
- Commercial Status
- Contract Notes
- Support Tier

#### Tenants
- Tenant Register
- Tenant Detail
- Tenant State
- Tenant Admin Contacts
- Linked Instances
- Tenant Suspension

#### Licences
- Licence Register
- Plan Assignment
- Seat Allocation
- Asset Allocation
- Connector Allocation
- Expiry and Renewal
- Grace Periods

#### Entitlements
- Entitlement Manifest Editor
- Module Allocation
- Feature Flags
- Connector Entitlements
- AI Entitlements
- Automation Entitlements
- Fusion Map Entitlements
- Reporting Entitlements

#### Deployments
- Instance Register
- Deployment Rings
- Version State
- Release Channels
- Self-Hosted Artefacts
- Dogfood Tenants
- Demo Tenants

#### Support Access
- Access Requests
- Active Grants
- Break-Glass Requests
- Session Audit
- Revocation Queue

#### Audit
- Operator Audit Log
- Entitlement Change Log
- Licence Change Log
- Support Access Log
- Emergency Control Log
- Export Log

#### Administration
- Operator Users
- Operator Roles
- Approval Policies
- Emergency Controls
- System Settings

## 4. Required Screens

### 4.1 Operator Command Home
Panels:
- total customers
- active tenants
- suspended tenants
- expiring licences
- trial conversions due
- entitlement exceptions
- failed syncs
- support access active
- emergency controls used
- release ring health

### 4.2 Customer Register
Columns:
- customer
- customer ID
- status
- support tier
- active tenants
- licence plan
- renewal state
- commercial owner

### 4.3 Tenant Detail
Panels:
- tenant state
- entitlement summary
- licence summary
- linked instances
- tenant admins
- enabled modules
- feature flags
- sync health
- audit trail

### 4.4 Licence Allocation
Controls:
- assign plan
- set expiry
- set seat limit
- set asset limit
- set connector limit
- set grace period
- suspend/reactivate
- require approval for downgrade

### 4.5 Entitlement Manifest Editor
Controls:
- enable module
- disable module
- enable feature
- disable feature
- connector entitlement
- AI entitlement
- automation entitlement
- Fusion Map entitlement
- reporting entitlement
- publish manifest
- preview tenant impact

### 4.6 Deployment Ring Manager
Controls:
- assign ring
- promote tenant
- demote tenant
- pin version
- unpin version
- mark dogfood
- mark demo
- mark beta
- publish rollout note

### 4.7 Support Access
Controls:
- request access
- approve access
- revoke access
- extend access
- break-glass access
- view support session audit

### 4.8 Audit Log
Filters:
- operator
- tenant
- customer
- action type
- date range
- severity
- approval state

## 5. Visual Requirements
- Brutalist enterprise UI.
- Navy/gold Seiertech style retained.
- Separate visual identity from SDR Operational Shell.
- Strong warning treatment for destructive commercial/platform actions.
- Square alignment and deterministic layout.
- No Disney icons.
- Dense administrative tables supported.
- Clear approval banners.

## 6. Prohibited UI Actions
The internal Control Plane UI must not include:
- customer case triage
- customer remediation case closure
- customer Fusion Map investigation as an analyst surface
- customer evidence submission
- customer remediation sub-action execution

## 7. Acceptance Criteria
- Dedicated shell exists.
- Licence allocation screen exists.
- Entitlement manifest editor exists.
- Tenant/customer/instance registers exist.
- Support access workflow exists.
- Operator audit is visible.
- No customer case workflow is presented as an internal Control Plane workflow.

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
## v2.3 Internal Control Plane UI Doctrine Update
The internal Commander Control Plane uses secure operator-console styling. It shares Commander tokens and square geometry but avoids unnecessary tactical overload. Core views are customer register, tenant register, licence allocation, entitlement manifests, feature flags, deployment rings, support access, emergency controls, and operator audit. P0 visibility is limited to emergency support and platform-level oversight.

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
