> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 36 — Commander Internal Control Plane Application Architecture Specification

## 1. Purpose
Define the separate internal Commander application used by the Seiertech / Commander operating team to manage customers, tenants, licences, entitlements, deployment rings, trials, demo tenants, dogfood tenants, support access, internal operator controls, and commercial/platform governance.

## 2. Authority
This document is authoritative for the internal Commander Control Plane application boundary.

## 3. Application Boundary
The Commander Internal Control Plane is separate from:

- Commander SDR Operational Application
- Commander SDR Tenant Admin Surface

It is wired into the shared Commander platform runtime through explicit contracts only.

## 4. Primary Users
- Seiertech platform administrators
- Commercial operations users
- Customer success operators
- Support leads
- Deployment/release managers
- Security governance owners
- Internal product administrators

## 5. Core Responsibilities
- Customer register
- Tenant register
- Instance register
- Licence allocation
- Entitlement manifests
- Module allocation
- Feature availability
- Trial lifecycle
- Demo tenant lifecycle
- Dogfood tenant lifecycle
- Deployment ring membership
- Usage aggregation
- Billing evidence export
- Support access governance
- Self-hosted licence artefacts
- Emergency disable / feature kill switch
- Operator audit
- Internal control-plane health

## 6. Prohibited Responsibilities
The internal Control Plane must not be used for:

- customer analyst case handling
- customer remediation workflow execution
- customer risk prioritisation decisions
- customer case closure/reopening
- customer Fusion Map investigation
- customer evidence submission

Those activities remain in the SDR Operational Application.

## 7. Application Modules

### 7.1 Home / Operator Command
- customer health summary
- entitlement exceptions
- expiring trials
- licence breaches
- deployment ring status
- support access requests
- emergency controls requiring review

### 7.2 Customer Register
- customer legal entity
- commercial owner
- contract status
- support tier
- data residency class
- deployment model
- linked tenants

### 7.3 Tenant Register
- tenant ID
- customer ID
- tenant state
- region
- environment
- enabled products
- linked instances
- tenant admin contacts

### 7.4 Instance Register
- instance ID
- tenant ID
- deployment type
- version
- runtime health
- release ring
- data plane region
- control-plane sync state

### 7.5 Licence Allocation
- licence plan
- seat allocation
- module allocation
- expiry date
- renewal state
- overage rules
- grace period
- suspension rules

### 7.6 Entitlement Manifest Management
- product entitlements
- module entitlements
- feature entitlements
- connector entitlements
- AI entitlement class
- automation entitlement class
- Fusion Map entitlement class
- reporting entitlement class

### 7.7 Feature and Module Control
- enable/disable module
- enable/disable feature
- staged rollout
- customer allowlist
- customer blocklist
- entitlement dependency validation

### 7.8 Deployment Ring Management
- internal
- dogfood
- demo
- beta
- early access
- production
- restricted production
- self-hosted release channel

### 7.9 Trial and Demo Management
- trial creation
- trial expiry
- trial extension
- trial conversion
- demo tenant reset
- seed data selection
- demo mode flag

### 7.10 Support Access Control
- support access request
- approval authority
- time-bound access
- tenant-scoped access
- break-glass access
- support session audit
- revocation

### 7.11 Self-Hosted Licence Control
- licence file generation
- signed entitlement manifest
- expiry period
- offline grace period
- deployment fingerprint
- revocation list
- support bundle export

### 7.12 Operator Audit
- all entitlement changes
- licence changes
- feature flag changes
- support access grants
- emergency control use
- deployment ring changes
- manifest generation

## 8. Data Objects
- Customer
- Tenant
- Instance
- Licence
- LicencePlan
- EntitlementManifest
- FeatureFlag
- ModuleAllocation
- DeploymentRing
- TrialState
- DemoTenantState
- DogfoodTenantState
- SupportAccessGrant
- OperatorUser
- OperatorRole
- OperatorAuditEvent
- SelfHostedLicenceArtefact
- EmergencyControlEvent

## 9. Mandatory Security Controls
- separate internal app authentication context
- strong operator RBAC
- MFA required
- privileged action approval
- immutable audit log
- least privilege support access
- tenant boundary enforcement
- break-glass review
- export governance

## 10. Build Acceptance Criteria
- Internal Control Plane has a dedicated shell.
- Licence allocation is not performed in the SDR Operational Shell.
- Entitlement manifests are authored only in the internal Control Plane.
- Tenant Admin can read entitlement state but cannot exceed granted entitlement.
- Every operator action is audited.
- Support access is time-bound and tenant-scoped.
- Deployment ring changes are visible and auditable.

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



## v2.2 Commander Internal Control Plane Update — P0 Entitlement and Operations

The internal control plane must expose tenant-level P0 feature availability, deployment-ring enablement, entitlement gating where commercial packaging requires it, emergency support visibility, P0 kill switch, and cross-tenant P0 telemetry without exposing sensitive customer data unless authorised.

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
