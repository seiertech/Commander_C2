> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #54 — Pre-Build UI Navigation and Route Baseline v2.5

## Status
Active pre-build navigation authority.

## Purpose
Define the final menu and route structure before build-pack generation.

## Operational App Top Navigation
Top navigation remains restrained:
- Command Centre
- Cases
- Fusion Map
- Vulnerabilities
- Identity
- Architecture
- CISO Dashboard

## Operational App Sidebar
- Case Management
- Mission Control
- Fusion Map
- Vulnerability Management
- Exposure Management
- Identity & Access
- Architecture
- Assets
- Controls
- Coverage
- Tool Health
- Team Pulse
- Domain Pulse
- System Pulse
- Platform
- Governance
- Reporting
- Tenant Admin (build mode/admin-only runtime)

## Platform Menu
- Platform Overview
- System Pulse
- Connectors & Data Sources
- Data Quality
- Rule Engine
- Model Management
- Commander AI
- Automation
- Feature Availability
- Environment
- Notifications & Integrations
- Audit & Logs
- Platform Administration

## Tenant Admin Menu
- Overview
- Baseline Configuration
- Users & Access
- Connectors & Data Sources
- Strategy & Operating Model
- Rules & Models
- AI Configuration
- Automation Boundaries
- Communications
- Exceptions & Suppressions
- Audit, Compliance & Exports
- Feature Availability

## Commercial Control Plane Menu
- Command Overview
- Customers
- Tenants
- Licences & Entitlements
- Product & Feature Control
- AI & Model Control
- Rule & Policy Packs
- Baseline Profile Management
- Deployment & Release
- Support Operations
- Billing / Usage Evidence
- Operator Audit

## Route Prefixes
Operational App:
- `/command-centre`
- `/cases`
- `/fusion-map`
- `/vulnerabilities`
- `/exposure`
- `/identity`
- `/architecture`
- `/assets`
- `/controls`
- `/coverage`
- `/tool-health`
- `/mission-control`
- `/team-pulse`
- `/domain-pulse`
- `/system-pulse`
- `/platform/*`
- `/governance/*`
- `/reporting/*`

Tenant Admin:
- `/admin/overview`
- `/admin/baseline/*`
- `/admin/access/*`
- `/admin/connectors/*`
- `/admin/strategy/*`
- `/admin/rules/*`
- `/admin/models/*`
- `/admin/ai/*`
- `/admin/automation/*`
- `/admin/communications/*`
- `/admin/exceptions/*`
- `/admin/audit/*`
- `/admin/features/*`

Commercial Control Plane:
- `/commercial/overview`
- `/commercial/customers/*`
- `/commercial/tenants/*`
- `/commercial/licences/*`
- `/commercial/features/*`
- `/commercial/ai-models/*`
- `/commercial/rule-policy-packs/*`
- `/commercial/baselines/*`
- `/commercial/deployment/*`
- `/commercial/support/*`
- `/commercial/billing-usage/*`
- `/commercial/audit/*`

## Build Mode Rule
All registered routes and menu items are visible in build/developer mode with status badges.

## Runtime Rule
Routes and menu items are suppressed by RBAC, entitlement, feature flag, environment and policy state.

## Build-Pack Requirement
Every build pack must declare route/menu registration and visibility metadata before implementation.

---

# v2.5.1 Addendum — Operational Console Route Registration

## Status
Active baseline authority for Commander SDR v2.5.1. Governed by Spec #56 and `00_AUTHORITY_AND_PRECEDENCE_v2_5_2.md`.

## Purpose
Place the ten Required Consoles from Spec #35 onto the binding route register, removing any ambiguity caused by their absence from the HTML shell sidebar drawing.

## Registered Console Sub-Routes

### Cases domain (`/cases/*`)
- `/cases/prioritisation` — Prioritisation Console
- `/cases/sir-console` — SIR Console

### Routing domain (`/routing/*`)
- `/routing/console` — Routing Console

### Validation domain (`/validation/*`)
- `/validation/console` — Validation Console
- `/validation/closure-gates` — Closure Gate Console
- `/validation/reopening-queue` — Reopening Queue

### Platform domain (`/platform/automation/*`)
- `/platform/automation/boundaries` — Automation Boundary Console

### Communications domain (`/communications/*`)
- `/communications/centre` — Communication Centre
- `/communications/external-notifiers` — External Notifier Console

### Fusion Map domain (`/fusion-map/*`)
- `/fusion-map/layers` — Fusion Map Layer Control

## Build Mode Visibility
All console routes shall be visible in build/developer mode with a status badge of `SCAFFOLD`, `BUILD` or `STUB` per Spec #56 until backed by their owning build pack.

## Runtime Visibility
Console routes shall be suppressed at runtime by RBAC, entitlement, feature flag, environment and policy state per Spec #50.

## Build Pack Ownership
| Console | Build Pack Owner |
|---|---|
| Prioritisation Console | BP-08 Command Centre / BP-09 Case Queue and Detail |
| SIR Console | BP-09 Case Queue and Detail |
| Routing Console | BP-06 Routing Engine |
| Validation Console | BP-07 Validation, Closure and Reopening |
| Closure Gate Console | BP-07 Validation, Closure and Reopening |
| Reopening Queue | BP-07 Validation, Closure and Reopening |
| Automation Boundary Console | BP-ADMIN-06 Automation Boundaries |
| Communication Centre | BP-ADMIN-07 Communications, Exceptions and Audit |
| External Notifier Console | BP-ADMIN-07 Communications, Exceptions and Audit |
| Fusion Map Layer Control | BP-10 Fusion Map MVP |

## Build Pack Rule Re-Statement
No build pack may decline to register or implement any of the above consoles on the grounds that the console is not drawn in the active HTML shell. The shell HTML is illustrative; this register is binding.

## Where This Conflicts With Older Wording
Where this addendum conflicts with anything earlier in this specification, v2.5.1 wins.
