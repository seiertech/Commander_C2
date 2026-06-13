> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 47 — Application Route and Navigation Register

## Status
ACTIVE BASELINE SPECIFICATION.

## Purpose
Defines route ownership, shell assignment, and navigation boundaries across the three Commander application surfaces.

## Commander SDR Operational Application
Shell: `docs/06_ui_build_reference/commander-sdr-shell-v11-admin-navigation.html` (active per Spec #48 v2.5.1; the older `commander-sdr-shell-v10-p0-zero-day.html` is archive/reference only and not build-authoritative)

Required primary routes:
- `/command-centre`
- `/cases`
- `/cases/:case_id`
- `/vulnerabilities`
- `/exposure`
- `/identity`
- `/architecture`
- `/assets`
- `/fusion-map`
- `/p0-zero-day`
- `/validation`
- `/routing`
- `/communications`
- `/governance`
- `/tool-health`
- `/reporting`
- `/ciso-dashboard`

## Commander SDR Tenant Admin Surface
Shell: SDR Operational App shell frame with admin-specific page navigation.

Required routes:
- `/settings/tenant`
- `/settings/users-rbac`
- `/settings/connectors`
- `/settings/features`
- `/settings/sla`
- `/settings/routing`
- `/settings/validation`
- `/settings/closure-reopening`
- `/settings/p0-zero-day`
- `/settings/automation-boundaries`
- `/settings/commander-ai`
- `/settings/audit-export`

## Commander Internal Control Plane Application
Shell: `docs/06_ui_build_reference/commander-commercial-control-plane-shell-v3-admin-navigation.html` (active per Spec #48 v2.5.1; the older `commander-control-plane-shell-v2-p0-zero-day.html` is archive/reference only and not build-authoritative)

Required routes:
- `/customers`
- `/tenants`
- `/instances`
- `/licences`
- `/entitlements`
- `/modules`
- `/feature-flags`
- `/deployment-rings`
- `/trials-demo-dogfood`
- `/support-access`
- `/self-hosted-licence-files`
- `/emergency-controls`
- `/operator-audit`

## Navigation Rule
No route may expose manual case creation, manual closure, manual reopening, or manual lifecycle progression.

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

# v2.5.1 Addendum — Active Shell Reference Correction and Operational Console Route Registration

## Status
Active baseline authority for Commander SDR v2.5.1. Governed by Spec #56.

## Active Shell References — Confirmed
- Operational App: `docs/06_ui_build_reference/commander-sdr-shell-v11-admin-navigation.html`.
- Commander Commercial Control Plane: `docs/06_ui_build_reference/commander-commercial-control-plane-shell-v3-admin-navigation.html`.
- The Tenant Admin surface continues to use the Operational App shell frame with admin-specific page navigation.

Older shell file names previously cited in the body of this register (`commander-sdr-shell-v10-p0-zero-day.html`, `commander-control-plane-shell-v2-p0-zero-day.html`) are archive/reference only.

## Operational Console Route Registration
Per Spec #35 v2.5.1 supersession, the ten Required Consoles are registered as sub-routes of their owning domains. They shall be built irrespective of HTML shell drawing.

| Console | Owning Domain | Registered Route |
|---|---|---|
| Prioritisation Console | Cases | `/cases/prioritisation` |
| Routing Console | Routing | `/routing/console` |
| Validation Console | Validation | `/validation/console` |
| Closure Gate Console | Validation | `/validation/closure-gates` |
| Reopening Queue | Validation | `/validation/reopening-queue` |
| Automation Boundary Console | Platform | `/platform/automation/boundaries` |
| Communication Centre | Communications | `/communications/centre` |
| External Notifier Console | Communications | `/communications/external-notifiers` |
| SIR Console | Cases | `/cases/sir-console` |
| Fusion Map Layer Control | Fusion Map | `/fusion-map/layers` |

## Build Rule
Every console route shall be implemented by the build pack that owns its parent domain (BP-08 / BP-09 / BP-10 / BP-ADMIN-06 / BP-CCP-04 as applicable per the Next Stage Approach Pack). Console presence shall not be removed on the basis that the console is not drawn in the active HTML shell sidebar.

## Tenant Admin Route Re-Confirmation
The full Tenant Admin route prefix set per Spec #54 (`/admin/overview`, `/admin/baseline/*`, `/admin/access/*`, `/admin/connectors/*`, `/admin/strategy/*`, `/admin/rules/*`, `/admin/models/*`, `/admin/ai/*`, `/admin/automation/*`, `/admin/communications/*`, `/admin/exceptions/*`, `/admin/audit/*`, `/admin/features/*`) shall be built irrespective of HTML shell drawing.

## Platform Route Re-Confirmation
The full Platform menu per Spec #54 (Platform Overview, System Pulse, Connectors & Data Sources, Data Quality, Rule Engine, Model Management, Commander AI, Automation, Feature Availability, Environment, Notifications & Integrations, Audit & Logs, Platform Administration) shall be built irrespective of HTML shell drawing.

## Commercial Control Plane Route Re-Confirmation
The full Commercial Control Plane menu per Spec #54 and Spec #49 shall be built irrespective of HTML shell drawing.

## Where This Conflicts With Older Wording
Where this addendum conflicts with anything earlier in this register or with the v2.5 addendum, v2.5.1 wins.

---

# v2.6 Extension — Route Register Addendum

**Extension version:** v2.6.0
**Extension date:** May 2026
**Extension scope:** Adds new application routes for v2.6 surfaces. All existing route register entries above this section remain in force unchanged.

## V2.6-1. New Routes for v2.6 Surfaces

The following routes are added to the application route register in v2.6:

### OODA Dashboard Family routes

| Route | Surface | RBAC | Workspace |
|---|---|---|---|
| `/ooda/command-tempo` | Command Tempo Dashboard | SOM, CISO, Risk Analyst, Compliance/Audit (RO) | Executive Posture, Drift Operations |
| `/ooda/observe` | Observe Phase Dashboard | SOA, SOM, CISO, Risk Analyst, Compliance/Audit (RO) | Drift Operations |
| `/ooda/orient` | Orient Phase Dashboard | SOA, SOM, CISO, Risk Analyst, Compliance/Audit (RO) | Drift Operations |
| `/ooda/decide` | Decide Phase Dashboard | SOA, SOM, CISO, Risk Analyst, Compliance/Audit (RO) | Drift Operations |
| `/ooda/act` | Act Phase Dashboard | SOA, SOM, CISO, Risk Analyst, Compliance/Audit (RO) | Drift Operations |
| `/ooda/tempo/case-type/:caseType` | Per-case-type tempo drill-down | Inherits from parent dashboard | Drift Operations |
| `/ooda/tempo/priority/:priority` | Per-priority tempo drill-down | Inherits from parent dashboard | Drift Operations |
| `/ooda/bottleneck/history` | Bottleneck history view | SOM, CISO | Executive Posture |

### Operating Picture routes

| Route | Surface | RBAC | Workspace |
|---|---|---|---|
| `/operating-picture/external` | External Operating Picture | SOA, SOM, Security Analyst, Security Architect, CISO, Risk Analyst, Compliance/Audit (RO) | Executive Posture, Drift Operations |
| `/operating-picture/internal` | Internal Operating Picture | SOM (IR auth), Security Analyst (IR auth), CISO, Risk Analyst, Customer Internal Risk roles | Executive Posture, Drift Operations |
| `/operating-picture/external/case/:caseId` | External Operating Picture with case foregrounded | Inherits | — |
| `/operating-picture/internal/identity/:identityId` | Internal Operating Picture with identity foregrounded (requires IR auth) | Restricted | — |

### Entity Intelligence Surface routes

| Route | Surface | RBAC | Workspace |
|---|---|---|---|
| `/intelligence/identity/:identityId` | Identity Intelligence Surface | All identity-visibility roles | Identity & Asset Intelligence |
| `/intelligence/identity/:identityId/behavioural` | Behavioural Intelligence section | Internal Risk authority required | Identity & Asset Intelligence |
| `/intelligence/asset/:assetId` | Asset Intelligence Surface | All asset-visibility roles | Identity & Asset Intelligence |

### Direction Board routes

| Route | Surface | RBAC | Workspace |
|---|---|---|---|
| `/direction-boards/control-weakness` | Control Weakness Direction Board | SOA, SOM, Security Architect, Security Analyst, CISO | Drift Operations, Control & Architecture |
| `/direction-boards/policy-effectiveness` | Policy Effectiveness Direction Board | Security Architect, Security Analyst, Policy Owner, CISO | Control & Architecture, Drift Operations |

### Silent Defence routes

| Route | Surface | RBAC | Workspace |
|---|---|---|---|
| `/silent-defence/report` | Silent Defence Reporting (current) | All roles (RO) | Executive Posture, Assurance & Audit |
| `/silent-defence/historical` | Silent Defence historical trend | All roles (RO) | Executive Posture, Assurance & Audit |
| `/silent-defence/by-tool/:toolId` | Silent Defence per-tool drill-down | All roles (RO) | Executive Posture, Assurance & Audit |

### Pre-Warned Classification routes

| Route | Surface | RBAC | Workspace |
|---|---|---|---|
| `/classification/pre-warned` | Pre-Warned classification dashboard | SOA, SOM, Security Analyst, CISO | Drift Operations |
| `/classification/distribution` | Pre-warned/Protected/Novel distribution | SOA, SOM, CISO | Drift Operations |

### Inverse Discovery routes

| Route | Surface | RBAC | Workspace |
|---|---|---|---|
| `/inverse-discovery/blindspots` | Coverage Blindspot case queue | Platform Engineering, Security Architect | Drift Operations |
| `/inverse-discovery/trends` | Inverse Discovery trends | Platform Engineering, CISO | Drift Operations, Executive Posture |

### Verdict Pattern routes (RBAC restricted)

| Route | Surface | RBAC | Workspace |
|---|---|---|---|
| `/verdict-pattern/cases` | Verdict Pattern case queue | Internal Risk authority | Drift Operations |
| `/verdict-pattern/case/:caseId` | Verdict Pattern case detail | Internal Risk authority | Drift Operations |
| `/verdict-pattern/aggregate` | Aggregate verdict pattern view | All roles (aggregate-only without IR auth) | Drift Operations |

### Policy Effectiveness routes

| Route | Surface | RBAC | Workspace |
|---|---|---|---|
| `/policy-effectiveness/cases` | Policy Effectiveness case queue | Policy Owner, Security Architect | Control & Architecture |
| `/policy-effectiveness/policies` | Policy effectiveness register | Policy Owner, Security Architect, CISO | Control & Architecture |

## V2.6-2. Navigation Hierarchy Updates

The top-level navigation hierarchy is extended in v2.6 to surface the new categories. Within each workspace, the navigation adds entries for the v2.6 surfaces appropriate to that workspace.

Detailed navigation tree updates are reflected in the UI build references and consumed by build packs in the conformance lifecycle. Surfaces are toggleable per persona configuration (Spec #55 v2.6).

## V2.6-3. Route Authority

All new routes inherit the existing route authority model. RBAC is enforced at the route level (not just at the data level) so unauthorised users cannot navigate to the route at all.

Internal Risk authority routes are flagged with elevated audit capture — every navigation to these routes is logged per Spec #75.

