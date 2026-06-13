> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #50 — RBAC, Entitlement and Feature Flag Menu Visibility

## Status
Active baseline authority for Commander SDR v2.5.

## Purpose
Define how Commander SDR shows, hides, disables, scaffolds and blocks menu items, routes, pages, panels and actions across build mode and runtime mode.

## Binding Doctrine
- Menus must not be hardcoded.
- Every menu item must be registered.
- Every route must have visibility metadata.
- Frontend visibility is convenience and usability, not security.
- Backend/API permissions are authoritative and mandatory.
- Build mode shows the full registered product map.
- Runtime mode suppresses by RBAC, entitlement, feature flag, environment and policy state.

## Visibility Inputs
A visibility decision must evaluate:
1. RBAC permissions
2. Tenant entitlement
3. Feature flag
4. Environment availability
5. Operational mode
6. Policy state
7. Surface boundary
8. Build status

## Visibility Decision Rule
```text
can_render =
  user_has_required_permission
  AND tenant_has_required_entitlement
  AND feature_flag_enabled
  AND route_available_in_environment
  AND policy_state_allows
  AND surface_boundary_allows
```

## Build Mode
Build/developer mode shows all registered product surfaces with implementation status.

Allowed status badges:
- LIVE
- SCAFFOLD
- PLACEHOLDER
- PLANNED
- INTERNAL
- DISABLED
- NOT LICENSED
- FEATURE FLAG OFF
- RBAC HIDDEN IN RUNTIME

Build mode is used for:
- page scaffolding
- route completeness checks
- UI build-pack generation
- missing surface detection
- demoing future product shape

Build mode must not be used for tenant production access.

## Runtime Mode
Runtime mode shows only what the current user/tenant/environment may access.

Normal users:
- hide denied items
- hide non-licensed features
- hide internal commercial controls

Tenant Admin users:
- show allowed admin sections
- show unavailable features only in Feature Availability with reason
- show configuration gaps and pending reviews

Commercial Control Plane users:
- show commercial/operator surfaces by internal RBAC only
- never expose customer operational case data unless support access is approved and time-bound

## Menu Item Metadata Schema
```yaml
menu_id: string
label: string
surface: operational_app | tenant_admin | commercial_control_plane | build_pipeline
route: string
parent_menu_id: string | null
status: live | scaffold | placeholder | planned | internal | disabled
build_visible: boolean
runtime_visibility: conditional | always | hidden
required_permissions: string[]
required_entitlements: string[]
required_feature_flags: string[]
allowed_environments: local | dev | staging | prod[]
visibility_if_denied: hide | disabled_with_reason | show_in_feature_availability
placeholder_allowed: boolean
backend_permission_required: string
```

## Route Metadata Schema
```yaml
route_id: string
path: string
app_surface: string
page_component: string
status: string
required_permissions: string[]
required_entitlements: string[]
required_feature_flags: string[]
allowed_environments: string[]
audit_on_access: boolean
backend_permission_required: string
```

## Action Metadata Schema
```yaml
action_id: string
label: string
route_or_panel: string
required_permissions: string[]
requires_reason: boolean
requires_approval: boolean
audit_event: string
backend_permission_required: string
```

## Runtime Examples
- Fusion Map hidden for a tenant without Fusion Map entitlement.
- AI Configuration hidden from analysts and visible to Tenant Admin users with `admin.ai.view`.
- Apply P0 button visible only to users with `case.priority.zero_day.apply` and tenant P0 feature enabled.
- Commercial Control Plane never appears inside a customer tenant runtime session.
- Rule Simulation visible in build mode and staging for authorised admins; hidden in production unless enabled.

## Backend Enforcement Rule
Every API, mutation and sensitive read must enforce the same permission and entitlement requirements server-side. A hidden frontend route does not constitute security.

## Required Build-Pack Fields
Every feature build pack must include:
- menu registration
- route registration
- permissions
- entitlement mapping
- feature flags
- visibility state
- placeholder behaviour
- backend enforcement
- audit events
- unavailable-feature explanation behaviour
