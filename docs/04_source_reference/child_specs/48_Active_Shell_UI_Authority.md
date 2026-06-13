> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #48 — Active Shell UI Authority

## Status
Active baseline authority for Commander SDR v2.5.

## Purpose
Define which shell HTML references are build-authoritative.

## Active Shell References
Only these files are active:

1. `docs/06_ui_build_reference/commander-sdr-shell-v11-admin-navigation.html`
2. `docs/06_ui_build_reference/commander-commercial-control-plane-shell-v3-admin-navigation.html`

## Archived / Non-Authoritative Shell References
Earlier shell files are superseded and must not be used for build authority.

## Binding Shell Rules
- Shell geometry remains stable.
- Top navigation remains restrained.
- Global Search appears before Commander AI.
- Search must not be cramped.
- Sidebar must visibly scroll.
- Sidebar must support expandable/collapsible menu groups.
- Build mode may show all registered menu items with status badges.
- Runtime mode suppresses menu items by RBAC, entitlement, feature flag, environment and policy state.
- Commercial Control Plane shell is separate from the customer Operational App shell.

## Implementation Rule
The HTML shells are visual/structural references. The production frontend must implement dynamic menu expansion, route-aware active state, RBAC-filtered menus, visibility metadata and backend permission enforcement during build.

---

# v2.5.1 Scope Narrowing Addendum — Shell Reference vs Build Authority

## Status
Active baseline authority for Commander SDR v2.5.1. Supersedes any pre-v2.5.1 reading that treated the HTML shell as an inventory of features, menus, routes, panels, consoles or admin surfaces.

## Governing Authority
This addendum is governed by Spec #56 — Shell Reference vs Build Authority Doctrine — and by `00_AUTHORITY_AND_PRECEDENCE_v2_5_2.md`.

## Narrowed Binding Scope
The authority of the active HTML shell references is hereby narrowed to:

- top bar placement and geometry;
- sidebar placement, scroll behaviour and expand/collapse structural representation;
- brand and product lockup placement;
- Global Search placement (before Commander AI) and minimum width;
- Commander AI placement;
- notifications, settings and user-control placement;
- content canvas contract;
- application-boundary visual treatment across Operational App, Tenant Admin and Commander Commercial Control Plane;
- visual intensity treatment per spec #41 / #45;
- build-mode badge pattern.

## Items Removed From Shell Authority
The HTML shell references are NOT authoritative for:

- the inventory of menu items;
- the inventory of routes;
- the inventory of consoles;
- the inventory of admin groups or sub-items;
- the inventory of Platform sub-items;
- the inventory of Commercial Control Plane sub-items;
- the inventory of panels, gauges, overlays, dashboards, queues, registers, tables, editors or audit surfaces.

These inventories are owned by the specification set, Spec #47, Spec #49, Spec #54, the route/menu registry (`BP-VIS-00`) and the feature registry (`FR-001`).

## Build Pack Supersedes Shell
A feature or surface specified in any baseline document or approved build pack shall be built, whether or not it is drawn in the HTML shell. The HTML shell carries no veto authority over spec-registered or registry-registered items.

## Where This Conflicts With Older Wording
Where this addendum conflicts with anything earlier in this specification, v2.5.1 wins.
