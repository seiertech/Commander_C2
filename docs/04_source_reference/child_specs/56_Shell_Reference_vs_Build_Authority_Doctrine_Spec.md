> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #56 — Shell Reference vs Build Authority Doctrine

## Status
Active baseline authority for Commander SDR v2.5.1. BUILD-BLOCKING for any build pack, agent, or implementation activity that touches navigation, menus, routes, panels, consoles, admin surfaces, or feature presence.

## Purpose
Resolve, definitively, the relationship between the active HTML shell references and the binding specification set. The HTML shells are layout and usability references. The specifications, route/menu registry, feature registry and build packs are the authoritative source of feature, route, menu, panel and console presence.

This doctrine is introduced in v2.5.1 to prevent the HTML shell from becoming a silent ceiling on operational scope.

## Governing Documents
- `00_AUTHORITY_AND_PRECEDENCE_v2_5_2.md`
- Spec #35 — Shell UI Functional Surface (informational for consoles after v2.5.1).
- Spec #47 — Application Route and Navigation Register.
- Spec #48 — Active Shell UI Authority (narrowed in v2.5.1).
- Spec #49 — Admin Control Surface Information Architecture.
- Spec #50 — RBAC / Entitlement / Feature Flag Menu Visibility.
- Spec #53 — Shell UI Usability Correction.
- Spec #54 — Pre-Build UI Navigation and Route Baseline v2.5.
- `SDR_Feature_Registry_FR001_v1_0.md`.
- All `BP-*` build pack streams as listed in the Next Stage Approach Pack.

## Binding Doctrine

### 1. The HTML Shell is Reference, Not Inventory
The active HTML shell references —
- `docs/06_ui_build_reference/commander-sdr-shell-v11-admin-navigation.html`
- `docs/06_ui_build_reference/commander-commercial-control-plane-shell-v3-admin-navigation.html`
— are visual and structural references only. They demonstrate frame, geometry, usability and application boundary. They are not an authoritative inventory of features, menu items, routes, panels, consoles or admin surfaces.

### 2. The Shell IS Authoritative For
- Top bar placement and geometry.
- Sidebar placement, scroll behaviour and expand/collapse structural representation.
- Brand and product lockup placement.
- Global Search placement (before Commander AI) and minimum width.
- Commander AI placement.
- Notifications, settings and user-control placement.
- Content canvas contract.
- Application-boundary visual treatment across Operational App, Tenant Admin and Commander Commercial Control Plane.
- Visual intensity levels (Operational Standard / Tactical Analysis / Emergency Command).
- Build-mode badge pattern (`SCAFFOLD`, `PLANNED`, `BUILD`, `ADMIN`, `NEW`).

### 3. The Shell is NOT Authoritative For
- Which menu items exist.
- Which routes exist.
- Which consoles exist (Prioritisation, Routing, Validation, Closure Gate, Reopening, Automation Boundary, Communication Centre, External Notifier, SIR, Fusion Map Layer Control and any future consoles).
- Which admin groups exist.
- Which Platform sub-items exist.
- Which Commercial Control Plane sub-items exist.
- Which features, panels, gauges, overlays, dashboards, queues, registers, tables, editors or audit surfaces exist.

### 4. Build Pack Supersedes Shell
A feature, menu item, route, console, panel or admin surface specified in any of the following supersedes the HTML shell and **shall be built**, whether or not it is drawn in the HTML shell reference:

- Master Technical Specification.
- Master Proposition.
- Any child spec #01 through #56.
- Spec #47 Application Route and Navigation Register.
- Spec #54 Pre-Build UI Navigation and Route Baseline.
- Spec #49 Admin Control Surface Information Architecture.
- `SDR_Feature_Registry_FR001_v1_0.md`.
- SOM Configuration Panel Specification.
- Tenant Admin Panel Specification (TAP-001).
- Any approved build pack (`BP-*`).

### 5. Registry-Driven Runtime
Runtime menus, routes, panels and admin surfaces shall be rendered from:
- The route/menu registry (delivered by `BP-VIS-00 Route/Menu Registry Schema`).
- The feature registry (`SDR_Feature_Registry_FR001_v1_0.md`).
- RBAC, entitlement, feature flag, environment and policy state.

The HTML shell references shall not be parsed, scraped or copied to derive menu, route, panel or console inventory. Any agent or build process that does so violates this doctrine.

### 6. Build-Mode Visibility
In build/developer mode, the runtime renderer shall display all registered routes and menu items with status badges (`SCAFFOLD`, `PLANNED`, `BUILD`, `STUB`, `NEW`). This is the mechanism by which spec-registered-but-not-yet-built surfaces become visible during construction without requiring the HTML shell to be redrawn.

### 7. Runtime Suppression
In runtime mode, menu items, routes and panels shall be suppressed by RBAC, entitlement, feature flag, environment and policy state, per Spec #50.

### 8. Frontend Visibility Is Not Security
Frontend menu suppression is presentation. Backend/API permission enforcement is mandatory and is the authoritative gate.

## Build Pack Rule
No build pack may decline to implement a specified feature, menu item, route, console or admin surface on the grounds that it is "not in the shell HTML". The shell HTML carries no veto authority over spec-registered or registry-registered items.

## Agent Rule
Agents shall:
- Treat the HTML shells as layout/geometry/usability reference.
- Treat the route/menu registry, feature registry and specification set as the inventory authority.
- Not generate hardcoded menus from the HTML shells.
- Not interpret the absence of an item in the HTML shell as evidence that the item is not required.

## Tenant Admin Scope Clarification
The full Tenant Admin menu tree defined in Spec #49 (Overview, Baseline Configuration, Users & Access, Connectors & Data Sources, Strategy & Operating Model, Rules & Models, AI Configuration, Automation Boundaries, Communications, Exceptions & Suppressions, Audit/Compliance/Exports, Feature Availability) shall be built, whether or not every group is drawn in `commander-sdr-shell-v11-admin-navigation.html`. The shell drawing of six admin groups is illustrative; the binding inventory is Spec #49 plus Spec #54.

## Platform Menu Scope Clarification
The full Platform menu defined in Spec #54 (Platform Overview, System Pulse, Connectors & Data Sources, Data Quality, Rule Engine, Model Management, Commander AI, Automation, Feature Availability, Environment, Notifications & Integrations, Audit & Logs, Platform Administration) shall be built, whether or not every item is drawn in the HTML shell. The shell drawing of nine Platform items is illustrative; the binding inventory is Spec #54.

## Operational Console Scope Clarification
The Operational Consoles enumerated in Spec #35 (Prioritisation Console, Routing Console, Validation Console, Closure Gate Console, Reopening Queue, Automation Boundary Console, Communication Centre, External Notifier Console, SIR Console, Fusion Map Layer Control) shall be built as registered sub-routes per Spec #54 v2.5.1 amendments, whether or not they are drawn in the HTML shell sidebar.

## Commercial Control Plane Scope Clarification
The full Commercial Control Plane menu defined in Spec #54 and Spec #49 shall be built, whether or not every item is drawn in `commander-commercial-control-plane-shell-v3-admin-navigation.html`. The shell drawing is illustrative; the binding inventory is the spec set.

## Precedence Statement
Where this doctrine and any pre-v2.5.1 wording conflict, this doctrine wins. Where this doctrine and the HTML shell drawing conflict, this doctrine wins. Where this doctrine and any agent assumption conflict, this doctrine wins.

## Forbidden Behaviours
- Treating an HTML shell as a feature checklist.
- Removing a spec-registered or registry-registered item because it is not drawn in the HTML.
- Adding a feature that is not in the spec set, route/menu registry or feature registry to the HTML shell and treating that drawing as authorisation.
- Redesigning shell geometry to "make room" for items that are already specified — items are registered, not drawn.

## Acceptance
v2.5.1 build-pack generation, agent execution and implementation activity shall comply with this doctrine. Any build pack that requires shell redrawing to justify scope is rejected.
