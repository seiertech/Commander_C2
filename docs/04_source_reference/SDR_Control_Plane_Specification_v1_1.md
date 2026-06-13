> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# v2.4 Baseline Authority Notice

This document is active under Commander SDR Baseline v2.4. It is governed by `00_AUTHORITY_AND_PRECEDENCE_v2_4.md`. Any historical wording that conflicts with closed-loop lifecycle doctrine, P0 priority-overlay doctrine, application-boundary doctrine, active shell authority, or no-manual-case-lifecycle doctrine is invalid.

---

# SDR Control Plane Specification

**Document ID:** CP-01  
**Document version:** v1.1  
**Status:** Active Companion Specification  
**Date:** May 2026  
**Authority:** Companion to Commander SDR Master Proposition v4.7 and Commander SDR Master Technical Specification v6.8  
**Location:** `docs/00_master/SDR_Control_Plane_Specification_v1_1.md`

**Related documents:**
- `docs/feature_registry/SDR_Feature_Registry_FR001_v1_0.md`
- `docs/02_child_specs/TAP_Tenant_Admin_Panel_Spec_v1_0.md`
- `docs/00_master/SDR_Control_Plane_Spec_Amendment_v1_1.md`
- `docs/00_master/SDR_Specification_Schedule_and_Folder_Structure_v1_9.md`
- `AGENTS.md`

---

## 0. Document Control

### 0.1 Purpose

This specification defines the **SDR Commercial Control Plane**: the internal commercial governance service that manages entitlement manifests, feature availability, licence state, deployment ring membership, usage aggregation, dogfood/demo handling, trial lifecycle, and self-hosted licence support across Commander SDR deployments.

The Control Plane is a commercial and operational governance layer. It is not the customer-facing application. It is not the tenant admin panel. It is not the platform operator console inside a tenant instance. It is not the CI/CD deployment engine.

### 0.2 Authority Boundary

This specification is subordinate to:

1. `Commander_SDR_Master_Proposition_v4_7.md`
2. `Commander_SDR_Master_Technical_Specification_v6_8.md`
3. `SDR_Specification_Schedule_and_Folder_Structure_v1_9.md`
4. `AGENTS.md`

This specification governs:

- commercial entitlements;
- feature registry integration;
- feature effective state computation;
- entitlement manifest generation;
- deployment ring membership metadata;
- usage and trial state;
- dogfood and demo handling;
- self-hosted licence-file architecture;
- relationship between Control Plane, platform application, operator console and tenant admin panel.

This specification does **not** authorise Phase 0 real push execution, autonomous Commander AI, uncontrolled feature rollout, or any code-deployment mechanism.

### 0.3 Changelog

| Version | Date | Change |
|---|---|---|
| v1.1 | May 2026 | Feature Registry integration added. Operator console feature management views added. Demo scenario configuration extended. Code update boundary explicitly stated. Critical clarification added — Control Plane does not facilitate code deployments. |

---

## 1. Document Index

| Ref | Section | Focus |
|---:|---|---|
| 0 | Document Control | Purpose, authority, changelog |
| 1 | Document Index | Navigation |
| 2 | Architectural Position | What the Control Plane is and is not |
| 3 | Relationship to Commander SDR Platform | How SDR instances register and consume manifests |
| 4 | Relationship to Operator Console | Difference between instance operator console and Control Plane |
| 5 | Relationship to Tenant Admin Panel | How tenant-admin controls are bounded by entitlements |
| 6 | Core Domain Model | Tenants, instances, features, licences, manifests, rings |
| 7 | Feature Registry Integration | FR-001 as source of truth |
| 8 | Entitlement Manifest | Manifest contents, signing, expiry, refresh |
| 9 | Effective Feature State Computation | Deterministic feature activation logic |
| 10 | Dogfood and Demo Special Handling | Dogfood, demo and trial control |
| 11 | Usage Metering and Commercial Reporting | Usage aggregation and commercial evidence |
| 12 | Self-Hosted Licence Model | Connected and offline licence modes |
| 13 | Feature Registry Integration — Detailed Amendment | Amendment-aligned FeatureFlagConfig and manifest model |
| 14 | Feature Management in the Operator Console | Operator feature management views |
| 15 | Relationship to Code Updates — Explicit Boundary | CI/CD boundary |
| 16 | Control Plane APIs | Required API surface |
| 17 | Security, Audit and Tenant Isolation | Security requirements |
| 18 | Implementation Phasing | What is Phase 1 vs later |
| 19 | Acceptance Criteria | Completion criteria |

---

## 2. Architectural Position

### 2.1 What the Control Plane Is

The SDR Commercial Control Plane is a standalone internal application operated by the Commander SDR team. It governs commercial, licence and feature-control state across SDR deployments.

It is the source of truth for:

- tenant entitlement state;
- commercial module activation;
- feature flag activation by tenant, module, ring and phase;
- deployment ring membership;
- dogfood/demo/trial state;
- licence state for connected and future self-hosted deployments;
- usage aggregation for commercial reporting;
- feature availability state delivered to SDR instances through signed entitlement manifests.

### 2.2 What the Control Plane is NOT

The Control Plane does not deploy code. It does not build Docker images. It does not trigger deployments. It does not push updates to customer instances. Code updates are entirely the responsibility of the GitHub Actions CI/CD pipeline.

The Control Plane's relationship to the deployment pipeline is limited to two things: (1) the pipeline queries the Control Plane API to determine ring membership before deploying to each ring, and (2) the pipeline reports deployment status back to the Control Plane after each ring completes, so the Control Plane can maintain accurate version state per tenant.

The Control Plane manages: who is entitled to what, which feature flags are active for which tenants, which ring each tenant is in, usage metering data, trial lifecycles, and licence file generation for self-hosted tenants.

The GitHub Actions pipeline manages: building Docker images, running CI, deploying to AWS ECS, running database migrations, and health checking each environment.

These are separate systems. Neither controls the other directly. They share state through the Control Plane API and GitHub webhooks.

### 2.3 Deployment Relationship

The Control Plane is not deployed into customer instances.

Each SDR instance registers with the Control Plane and periodically retrieves a signed entitlement manifest. The instance enforces the manifest locally.

For connected SaaS deployments, the instance periodically refreshes the manifest.

For future self-hosted or air-gapped deployments, the instance may consume a signed offline licence file through the same LicenceService abstraction.

---

## 3. Relationship to Commander SDR Platform

### 3.1 SDR Instance Registration

Each SDR instance registers with the Control Plane using an instance identity.

```typescript
type SDRInstanceRegistration = {
  instance_id: string
  deployment_model: 'saas' | 'dogfood' | 'demo' | 'self_hosted_connected' | 'self_hosted_airgapped'
  environment: 'dev' | 'test' | 'staging' | 'production' | 'demo'
  region: string
  platform_version: string
  tenant_count: number
  registered_at: string
  last_seen_at: string
}
```

### 3.2 Manifest Pull

Each SDR instance pulls entitlement manifests from the Control Plane.

The platform application must not make feature decisions from local hardcoded configuration where a manifest value exists.

Local defaults may be used only for development, test harnesses, manifest-unavailable fallback within defined TTL, or air-gapped licence file mode.

### 3.3 Local Enforcement

The SDR platform application enforces feature state at the backend API and service layer, not only in the UI.

UI hiding is not security.

---

## 4. Relationship to Operator Console

The platform operator console described in the Master Technical Specification remains the operator view inside an SDR instance.

The Control Plane governs commercial state across instances. The relationship is:

| Surface | Scope | Purpose |
|---|---|---|
| SDR Platform Application | Tenant/customer facing | Security drift operations, cases, dashboards, remediation workflows |
| Tenant Admin Panel | Tenant-scoped settings | Customer admin configuration within entitled boundaries |
| Instance Operator Console | Instance-scoped operator support | Tenant onboarding/support/admin within an SDR instance |
| Commercial Control Plane | Cross-instance internal commercial governance | Entitlements, feature registry, ring state, usage and licences |

---

## 5. Relationship to Tenant Admin Panel

The Tenant Admin Panel lives in the customer-facing application at `/settings/*`. It is available only to users with appropriate tenant admin RBAC roles.

The Tenant Admin Panel is bounded by the entitlement manifest from the Control Plane.

A tenant admin may configure only features that are commercially entitled, phase-available, visible to the tenant, tenant-admin configurable according to FR-001, and not locked by the operator.

Feature states visible in the Tenant Admin Panel must be derived from the manifest and the Feature Registry. Tenant admins must not be able to activate features outside their commercial entitlement.

The Tenant Admin Panel is governed by `TAP_Tenant_Admin_Panel_Spec_v1_0.md`.

---

## 6. Core Domain Model

```typescript
type CommercialTenant = {
  tenant_id: string
  tenant_name: string
  commercial_status: 'trial' | 'active' | 'suspended' | 'expired' | 'demo' | 'dogfood'
  deployment_model: 'saas' | 'self_hosted_connected' | 'self_hosted_airgapped'
  current_plan: string
  entitlement_profile_id: string
  ring_id: string
  created_at: string
  updated_at: string
}

type EntitlementProfile = {
  entitlement_profile_id: string
  tenant_id: string
  entitlements: Record<string, boolean>
  limits: Record<string, number | string | boolean>
  trial_modules: Record<string, {
    active: boolean
    expires_at: string | null
  }>
  effective_from: string
  effective_until: string | null
  updated_by: string
  updated_at: string
}

type DeploymentRing = {
  ring_id: 'ring_0' | 'ring_1' | 'ring_2' | 'ring_3' | 'ring_4'
  name: string
  description: string
  tenant_refs: string[]
  default_monitoring_window_hours: number
  progression_policy: 'automatic_after_green_window' | 'automatic_after_closure_gates_satisfied'  # manual lifecycle progression is prohibited; manual evidence remains permitted
  created_at: string
  updated_at: string
}
```

---

## 7. Feature Registry Integration

FR-001 is the authoritative source of feature flag keys, commercial gates, control scope, default state and phase availability.

No feature flag key may be used in the Control Plane, entitlement manifest, SDR platform application, tenant admin panel, operator console, tests or fixtures unless it is registered in `SDR_Feature_Registry_FR001_v1_0.md`.

Adding a new feature requires:

1. adding the feature to FR-001;
2. assigning commercial gate;
3. assigning control scope;
4. assigning phase;
5. updating manifest schema if a new module/gate is introduced;
6. adding platform enforcement;
7. adding operator and/or tenant admin controls where relevant;
8. adding tests.

---

## 8. Entitlement Manifest

The entitlement manifest is the signed package of commercial and feature state consumed by an SDR instance.

```typescript
type EntitlementManifest = {
  manifest_id: string
  tenant_id: string
  instance_id: string
  issued_at: string
  expires_at: string
  manifest_version: string

  commercial_status: 'trial' | 'active' | 'suspended' | 'expired' | 'demo' | 'dogfood'
  deployment_model: 'saas' | 'self_hosted_connected' | 'self_hosted_airgapped'
  plan: string

  entitlements: Record<string, boolean>
  limits: Record<string, number | string | boolean>

  feature_states: Record<string, {
    active: boolean
    scope: 'operator_controlled' | 'tenant_configurable' | 'locked' | 'hidden'
    reason: string
  }>

  ring: {
    ring_id: string
    ring_name: string
  }

  signature: string
}
```

The manifest must be signed by the Control Plane and verified by the SDR instance before acceptance.

---

## 9. Effective Feature State Computation

```typescript
type FeatureState = {
  active: boolean
  reason:
    | 'not_entitled'
    | 'not_yet_available'
    | 'operator_active'
    | 'operator_inactive'
    | 'operator_not_enabled'
    | 'tenant_configurable'
  visible:
    | 'locked'
    | 'hidden'
    | 'operator_controlled'
    | 'locked_by_operator'
    | 'configurable'
}
```

```typescript
function computeEffectiveState(
  tenantId: string,
  flagKey: string,
  manifest: EntitlementManifest,
  flagConfig: FeatureFlagConfig,
  currentPlatformPhase: 0 | 1 | 2 | 3
): FeatureState {
  const commercialGate = flagConfig.commercial_gate

  if (!manifest.entitlements[commercialGate]) {
    return { active: false, reason: 'not_entitled', visible: 'locked' }
  }

  if (flagConfig.phase > currentPlatformPhase) {
    return { active: false, reason: 'not_yet_available', visible: 'hidden' }
  }

  if (flagConfig.control_scope === 'operator-only') {
    const enabled = flagConfig.scope === 'global'
      ? flagConfig.global_enabled
      : flagConfig.tenant_states[tenantId]?.operator_enabled ?? flagConfig.default_state

    return {
      active: enabled,
      reason: enabled ? 'operator_active' : 'operator_inactive',
      visible: 'operator_controlled'
    }
  }

  if (flagConfig.control_scope === 'operator-sets-tenant-configures') {
    const operatorEnabled = flagConfig.tenant_states[tenantId]?.operator_enabled ?? false

    if (!operatorEnabled) {
      return { active: false, reason: 'operator_not_enabled', visible: 'locked_by_operator' }
    }

    const tenantEnabled = flagConfig.tenant_states[tenantId]?.tenant_enabled ?? flagConfig.default_state

    return {
      active: tenantEnabled,
      reason: 'tenant_configurable',
      visible: 'configurable'
    }
  }

  const tenantEnabled = flagConfig.tenant_states[tenantId]?.tenant_enabled ?? flagConfig.default_state

  return {
    active: tenantEnabled,
    reason: 'tenant_configurable',
    visible: 'configurable'
  }
}
```

---

## 10. Dogfood and Demo Special Handling

### 10.1 Dogfood Tenants

Dogfood tenants are internal SDR team tenants used for early validation.

Dogfood tenants may receive feature flags earlier than production tenants, but all feature flags must still exist in FR-001 and all activation must be audited.

### 10.2 Demo Tenants

Demo tenants are sales and investor-facing controlled environments.

Demo tenants may use scenario profiles to reset data and feature state.

Demo tenants must never contain real customer data.

### 10.3 Demo Sales Scenario Configuration — Extended

```typescript
type DemoScenario = {
  scenario_id: string
  name: string
  description: string
  enabled_features: string[]
  disabled_features: string[]
  seeded_data_pack_ref: string
  reset_script_ref: string
  default_ring: 'ring_0' | 'ring_1'
  expires_at: string | null
}
```

Example scripts:

```bash
pnpm demo:reset --scenario executive-ciso
pnpm demo:reset --scenario analyst-case-flow
pnpm demo:reset --scenario control-plane-feature-rollout
```

Demo reset scripts must not run against production customer tenants.

### 10.4 Trials

Trial state must be recorded by module and expiry date.

Expired trials must revert to locked state unless converted.

Trial conversion reporting should include usage, automation savings where available, feature adoption, case count, and user activity.

---

## 11. Usage Metering and Commercial Reporting

The platform may report aggregated usage events to the Control Plane.

Usage event examples:

```text
active_users_count
case_count
connector_count
feature_usage_count
push_proposal_count
push_execution_count where enabled in future
commander_ai_execution_count
automation_savings_hours
audit_export_count
```

Usage events must not include asset names, identity names, case evidence, raw payloads, tenant secrets or confidential remediation details.

---

## 12. Self-Hosted Licence Model

Connected self-hosted deployments may retrieve signed manifests from the Control Plane.

Air-gapped deployments use an offline signed licence file generated by the Control Plane and imported into the SDR instance.

The SDR platform must use a LicenceService abstraction that can accept either a Control Plane entitlement manifest or offline signed licence file.

---

## 13. Feature Registry Integration — Detailed Amendment

### 13.1 The Feature Registry as Source of Truth

The Feature Registry (Document FR-001: SDR Feature Registry) is the authoritative list of all discrete feature controls in Commander SDR. The Control Plane references this registry for all feature flag management operations. The operator console is built against this registry. The entitlement manifest is structured around the commercial modules defined in this registry.

No feature flag key may be used in the Control Plane, in the entitlement manifest, or in the SDR platform application unless it is registered in FR-001.

### 13.2 Feature Flag Data Model — Extended

```typescript
type FeatureFlagConfig = {
  flag_key: string
  display_name: string
  module: string
  commercial_gate: string
  control_scope: 'operator-only' | 'tenant-admin' | 'operator-sets-tenant-configures'
  default_state: boolean
  phase: 0 | 1 | 2 | 3
  description: string

  scope: 'global' | 'per_tenant'
  global_enabled: boolean

  tenant_states: Record<string, {
    operator_enabled: boolean
    tenant_enabled: boolean
    effective: boolean
    configured_at: string
    configured_by: string
  }>

  ring_enabled: Record<string, boolean>

  created_at: string
  updated_at: string
  updated_by: string

  deprecated: boolean
  deprecated_at: string | null
  replacement_flag_key: string | null
  removal_planned_at: string | null
}
```

### 13.3 Manifest Generation — Extended

The entitlement manifest includes the computed effective feature flag state for every feature in the registry. No second API call is needed for feature flag lookup.

---

## 14. Feature Management in the Operator Console

The operator console must provide feature management views aligned to FR-001:

1. Global Feature Registry View
2. Per-Tenant Feature State View
3. Ring Feature Rollout View
4. Bulk Feature Management View

Operator controls must distinguish between:

- global feature state;
- per-tenant feature override;
- operator-only features;
- tenant-admin configurable features;
- operator-sets-tenant-configures features;
- not-entitled features;
- phase-hidden features.

The tenant admin panel must not be able to toggle operator-only features.

---

## 15. Relationship to Code Updates — Explicit Boundary

### 15.1 Control Plane Does Not Deploy Code

The Control Plane does not deploy code, build images, execute migrations, or push updates.

### 15.2 GitHub Actions Owns Deployment

GitHub Actions / CI-CD owns:

- building Docker images;
- running tests;
- deploying application services;
- running migrations;
- health checks;
- deployment reporting.

### 15.3 Shared CI/CD State

The CI/CD pipeline may query the Control Plane for ring membership and report deployment completion status back to the Control Plane.

Example:

```yaml
name: Deploy Ring

on:
  workflow_dispatch:
    inputs:
      ring:
        required: true
        type: string

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Query Control Plane for ring members
        run: |
          curl -H "Authorization: Bearer $CONTROL_PLANE_TOKEN" \
            "$CONTROL_PLANE_URL/api/control-plane/v1/rings/${{ inputs.ring }}"

      - name: Deploy application
        run: |
          echo "Deploy through the normal CI/CD deployment pipeline"

      - name: Report deployment status
        run: |
          curl -X POST -H "Authorization: Bearer $CONTROL_PLANE_TOKEN" \
            "$CONTROL_PLANE_URL/api/control-plane/v1/deployments/status"
```

---

## 16. Control Plane APIs

```text
POST /api/control-plane/v1/instances/register
POST /api/control-plane/v1/instances/heartbeat
GET  /api/control-plane/v1/instances/{instance_id}/status

GET  /api/control-plane/v1/tenants/{tenant_id}/manifest
POST /api/control-plane/v1/tenants/{tenant_id}/manifest/refresh

GET  /api/control-plane/v1/features
GET  /api/control-plane/v1/features/{flag_key}
PATCH /api/control-plane/v1/features/{flag_key}/tenant-state
PATCH /api/control-plane/v1/features/{flag_key}/ring-state

GET  /api/control-plane/v1/tenants/{tenant_id}/entitlements
PATCH /api/control-plane/v1/tenants/{tenant_id}/entitlements
POST /api/control-plane/v1/tenants/{tenant_id}/trials
POST /api/control-plane/v1/tenants/{tenant_id}/suspend
POST /api/control-plane/v1/tenants/{tenant_id}/reactivate

GET  /api/control-plane/v1/rings
PATCH /api/control-plane/v1/rings/{ring_id}/tenants
POST /api/control-plane/v1/rings/{ring_id}/progression

POST /api/control-plane/v1/usage/events
GET  /api/control-plane/v1/tenants/{tenant_id}/usage

POST /api/control-plane/v1/tenants/{tenant_id}/licence-files
GET  /api/control-plane/v1/tenants/{tenant_id}/licence-files/{licence_id}
```

---

## 17. Security, Audit and Tenant Isolation

The Control Plane is internal only.

Access requires operator identity, operator RBAC, MFA and audit logging.

Audit is required for:

- entitlement changes;
- feature activation/deactivation;
- tenant state changes;
- ring assignment changes;
- trial start/extension/expiry;
- demo reset;
- dogfood enablement;
- manifest generation;
- offline licence generation;
- operator access;
- failed signature validation;
- API errors affecting commercial state.

The Control Plane must not store customer connector secrets.

Manifest and licence signing keys must be protected and rotatable.

---

## 18. Implementation Phasing

| Capability | Phase |
|---|---|
| Feature Registry document registration | Immediate |
| Tenant Admin Panel specification registration | Immediate |
| Control Plane specification | Immediate documentation baseline |
| LicenceService abstraction | Phase 1 foundation |
| Connected entitlement manifest | Phase 1 |
| Feature effective state enforcement | Phase 1 |
| Tenant-admin settings based on manifest | Phase 1 |
| Deployment ring metadata | Phase 1 |
| CI/CD ring query/status reporting | Phase 1/2 |
| Usage metering for commercial reporting | Phase 1/2 |
| Demo/dogfood scenario management | Phase 1/2 |
| Offline licence file generation | Phase 3 |
| Air-gapped self-hosted support | Phase 3 |

---

## 19. Acceptance Criteria

This specification is complete when:

```text
Control Plane purpose and non-purpose are explicit.
Control Plane does not deploy code.
FR-001 is the authoritative feature registry.
TAP-001 is the tenant admin settings authority.
Control Plane, operator console and tenant admin panel are separated.
Entitlement manifest schema is defined.
Effective feature state computation is deterministic.
Deployment ring model is defined.
Dogfood/demo/trial handling is defined.
Usage metering boundaries are defined.
Self-hosted licence model is defined.
API contracts are listed.
Security/audit/tenant-isolation requirements are defined.
Phase boundaries are clear.
```


---

# DOCUMENT-SPECIFIC REVISION PATCH — SDR_Control_Plane_Specification_v1_1.md

**Patch date:** 2026-05-13  
**Patch type:** Functional review remediation  
**Authority:** Closed-loop doctrine patch v2.0  

## Required Update Applied

This control-plane specification is updated to remove manual lifecycle authority and to bind progression, validation, closure, reopening, routing, and strategy to deterministic control-plane objects.

## Mandatory Build Interpretation

- Any previous language in this document that permits manual case creation, manual lifecycle progression, manual closure, manual reopening, optional case promotion for actionable risk, or unbound risk handling is superseded.
- Manual remediation remains permitted only as a remediation execution method, not as a case lifecycle authority.
- Manual evidence, manual acknowledgement, manual approval, and manual challenge are permitted only as audited inputs to deterministic system decisions.
- Every feature in this document SHALL define case binding, sub-action binding, validation state, closure gate, reopening trigger, routing decision, prioritisation impact, strategy dependency, UI surface, and Fusion Map binding before implementation.


---

# REVISION ADDENDUM — CLOSED-LOOP FUNCTIONAL DOCTRINE PATCH v2.0

**Status:** SUPERSEDING ADDENDUM  
**Effective date:** 2026-05-13  
**Applies to:** all Commander SDR functional, technical, UI, case, workflow, routing, strategy, communication, validation, automation, data model, and build artefacts.

## 1. Supersession Rule

Where this document previously permits or implies any of the following, this addendum supersedes that language:

- manual freeform case creation;
- manual lifecycle progression;
- manual case closure;
- manual case reopening;
- unbound findings;
- optional case promotion for risk objects;
- lifecycle decisions owned by analysts rather than deterministic system rules;
- UI controls that mutate lifecycle state directly;
- case assignment modes that prevent deterministic routing from producing an auditable route decision.

Human users may submit evidence, approve governed exceptions, approve high-risk automation, challenge a system decision, request validation refresh, request routing review, prioritise work, annotate records, and confirm business context. Human users do not directly create, close, reopen, or progress lifecycle state.

## 2. Non-Negotiable Closed-Loop Doctrine

Commander SDR SHALL enforce the following doctrine:

1. **No manual case creation.** Cases are generated only from normalised risk objects, communication-ingested risk objects, tool-health objects, exposure objects, drift objects, vulnerability objects, control objects, identity objects, coverage objects, architecture objects, blast-radius objects, or governed residual-risk/debt objects.
2. **Every risk object is case-bound.** No risk object may remain operationally actionable without a parent case or a deterministic case-linking decision.
3. **Prioritisation-only interaction.** Operators may prioritise, annotate, challenge, approve, suppress, or provide evidence. They may not directly mutate lifecycle state.
4. **Automatic routing.** The routing engine SHALL produce the route, owner, team, approval path, escalation path, and rationale for every case and blocking sub-action.
5. **Automatic sub-action generation.** The case engine SHALL generate sub-actions from risk decomposition, remediation options, validation dependencies, communication requirements, ownership boundaries, push requirements, and approval requirements.
6. **Automatic validation.** Technical validation SHALL be system-owned and evidence-driven.
7. **Automatic closure.** Closure SHALL be system-owned and SHALL occur only when all configured closure gates are satisfied.
8. **Automatic reopening.** Reopening SHALL be system-owned and SHALL occur when any configured reopening trigger fires.
9. **Automatic communication binding.** Inbound and outbound case communication SHALL bind to a case, sub-action, risk object, external notification, or allocation queue object.
10. **Audit-first operation.** Every decision SHALL emit a machine-readable rationale and immutable audit event.

## 3. Universal Risk Object Contract

Every domain SHALL emit or link to a canonical `RiskObject` with these minimum fields:

| Field | Requirement |
|---|---|
| `risk_object_id` | Required immutable identifier. |
| `risk_object_type` | Required enum: identity, architecture, vulnerability, exposure, control, drift, tool_health, coverage, blast_radius, asset, communication, trust_boundary, BAS, SIEM_SOAR, shared_responsibility, security_debt, exception. |
| `domain` | Required owning domain. |
| `source_systems[]` | Required source list. |
| `affected_entities[]` | Required canonical entity references. |
| `case_binding_status` | Required enum: bound, linked_to_existing, suppressed_by_policy, pending_allocation_error. |
| `case_id` | Required unless suppressed by approved policy. |
| `sub_action_ids[]` | Required when decomposition generates work. |
| `validation_state` | Required universal validation state. |
| `routing_state` | Required universal routing state. |
| `priority_score` | Required computed priority. |
| `closure_gate_state` | Required aggregate closure gate state. |
| `reopen_trigger_state` | Required aggregate reopening trigger state. |
| `mission_impact` | Required nullable object. |
| `fusion_map_refs[]` | Required node and edge references. |

## 4. Universal Case Lifecycle

The closed-loop case lifecycle SHALL be:

1. `DETECTED`
2. `BOUND`
3. `ROUTED`
4. `PRIORITISED`
5. `ACTION_DECOMPOSED`
6. `IN_PROGRESS`
7. `PENDING_VALIDATION`
8. `VALIDATION_RUNNING`
9. `VALIDATED_FIXED` / `VALIDATED_COMPENSATED` / `VALIDATED_SUPPRESSED` / `VALIDATED_RESIDUAL_ACCEPTED` / `VALIDATION_FAILED` / `VALIDATION_INCONCLUSIVE`
10. `PENDING_CLOSURE_GATES`
11. `CLOSED_BY_SYSTEM`
12. `REOPENED_BY_SYSTEM`

Forbidden lifecycle states or interactions:

- user-created case;
- user-closed case;
- user-reopened case;
- analyst-only lifecycle progression;
- unvalidated closure;
- closure based only on ITSM or email acknowledgement.

## 5. Universal Sub-Action Lifecycle

Every blocking sub-action SHALL use this lifecycle:

1. `GENERATED`
2. `ROUTED`
3. `OWNER_NOTIFIED`
4. `EVIDENCE_REQUIRED`
5. `IN_PROGRESS`
6. `PENDING_APPROVAL` when applicable
7. `PENDING_EXECUTION` when applicable
8. `PENDING_VALIDATION`
9. `VALIDATED`
10. `FAILED_VALIDATION`
11. `SUPPRESSED_APPROVED`
12. `RESIDUAL_ACCEPTED`
13. `CLOSED_BY_SYSTEM`
14. `REOPENED_BY_SYSTEM`

Parent cases SHALL NOT close while a blocking sub-action is unresolved unless an approved exception, approved suppression, or accepted residual-risk record exists.

## 6. Universal Validation Lifecycle

Validation SHALL use these states:

- `NOT_STARTED`
- `EVIDENCE_REQUESTED`
- `EVIDENCE_RECEIVED`
- `VALIDATION_RUNNING`
- `VALIDATED_FIXED`
- `VALIDATED_COMPENSATED`
- `VALIDATED_NOT_FIXED`
- `VALIDATION_INCONCLUSIVE`
- `VALIDATION_BLOCKED`
- `VALIDATION_EXPIRED`
- `REVALIDATION_REQUIRED`

Validation SHALL be triggered by source refresh, connector delta, owner evidence, push execution, BAS result, SIEM/SOAR deployment status, control-state change, scanner refresh, identity graph change, architecture graph change, or communication evidence.

## 7. Universal Closure Gates

A case SHALL close only when all configured gates are satisfied:

- technical validation gate;
- sub-action completion gate;
- communication gate where configured;
- external notifier gate where configured;
- SIR acknowledgement gate where configured;
- SLA/residual phase gate;
- exception/suppression expiry gate;
- evidence freshness gate;
- approval gate;
- audit completeness gate;
- mission-impact gate;
- fusion-map state refresh gate.

Closure SHALL be executed by the system after gate evaluation. User confirmation may be recorded as evidence, not as lifecycle authority.

## 8. Universal Reopening Triggers

A closed case SHALL reopen automatically when any configured trigger fires:

- original risk condition reappears;
- risk object source changes severity or exploitability;
- KEV, CVSS, EPSS, MISP, vendor, BAS, or threat-intel status changes materially;
- validation expires or fails;
- compensating control disappears or degrades;
- affected asset, identity, exposure, or dependency expands;
- blast radius expands;
- mission objective impact increases;
- routing owner rejects or cannot fulfil work;
- communication thread receives material inbound evidence;
- connector freshness drops below threshold;
- tool coverage degrades;
- suppression or exception expires;
- strategy threshold changes and requalifies the case.

## 9. Universal Routing Model

Routing SHALL consider:

- domain;
- risk object type;
- owner of affected asset, identity, application, cloud account, tool, control, or business service;
- business unit;
- tenant and organisation;
- environment;
- severity;
- priority;
- blast radius;
- mission impact;
- operational tempo;
- required skills;
- team affinity;
- workload;
- escalation path;
- approval authority;
- time zone;
- communication ownership;
- shared-responsibility profile;
- automation boundary.

The route decision SHALL be visible in the UI with route rationale and route challenge controls. Route challenge does not directly reroute the case; it requests route recalculation or approval review.

## 10. Strategy Layer Runtime Surfaces

Commander SDR SHALL expose runtime strategy surfaces for:

- SLA strategy;
- thresholds;
- automation boundaries;
- routing;
- posture objectives;
- mission objectives;
- operational tempo;
- domain-specific strategy;
- prioritisation weights;
- validation windows;
- closure gates;
- reopening triggers.

## 11. Fusion Map Binding

Every domain SHALL project into the multi-domain Fusion Map using node, edge, overlay, and case-binding rules. The Fusion Map SHALL include:

- risk overlay;
- drift overlay;
- exposure overlay;
- control overlay;
- coverage overlay;
- blast-radius overlay;
- identity overlay;
- vulnerability overlay;
- architecture overlay;
- tool-health overlay;
- mission overlay;
- validation overlay;
- SLA overlay;
- communication overlay;
- routing overlay.

Every actionable map node SHALL open a bound case, risk object, validation object, sub-action, or communication object. The map SHALL NOT create freeform cases.

## 12. Shell UI Binding

The Shell UI SHALL expose, at minimum:

- Command Centre;
- Case Management;
- Fusion Map;
- Strategy Centre;
- Mission Control;
- System Pulse;
- Team Pulse;
- Domain Pulse;
- Validation Console;
- Routing Console;
- Closure Gates;
- Reopening Queue;
- Communication Centre;
- Automation Boundaries;
- Tool Health;
- Controls;
- Drift;
- Coverage;
- Blast Radius;
- Prioritisation Console.

Any shell frame that lacks these routes is incomplete and SHALL be treated as a visual shell only, not a functional UI authority.


## Universal Domain Lifecycle Matrix

| Domain | Required case lifecycle binding | Required validation | Required reopening | Required routing | Required UI surface | Required Fusion Map layer |
|---|---|---|---|---|---|---|
| Identity | Identity risk, privilege drift, access drift, stale identity, service-account exposure SHALL bind to cases. | Access removed, privilege reduced, identity disabled, conditional access restored, or exception accepted. | Privilege returns, risk score rises, identity graph expands, stale account reappears. | IAM owner, app owner, identity platform owner, SOC/SOM escalation. | Identity Overview, Privileged Access, Risky Identities, Access Drift, Identity Coverage. | Identity nodes, admin edges, privilege edges, blast-radius overlay. |
| Architecture | Architecture drift, anti-pattern, dependency-risk, trust-boundary breach SHALL bind to cases. | Topology confirmed, control restored, design exception approved, dependency risk reduced. | Topology changes, exposure expands, dependency appears, trust boundary changes. | Architecture owner, cloud/platform owner, service owner, SOM. | Architecture Overview, Architecture Drift, Dependency Map, Cloud Posture. | Architecture nodes, dependency edges, trust-boundary overlay. |
| Vulnerability | Scanner findings, external advisories, code/supply-chain findings SHALL bind to cases. | Patch confirmed, mitigation confirmed, compensating control confirmed, not-applicable confirmed. | KEV/intel changes, asset remains vulnerable, patch rollback, new asset affected. | VM owner, asset owner, app owner, patch owner, SOM. | Vulnerability Overview, KEV, Remediation, SLA, Patch Intelligence, Code/Supply Chain. | CVE nodes, asset edges, control compensation overlay. |
| Exposure | External/internal exposure, internet-facing drift, open service risk SHALL bind to cases. | Exposure removed, firewall/WAF/DNS state confirmed, accepted exception. | Exposure reappears, DNS changes, port opens, asset becomes public. | Exposure owner, network owner, cloud owner, app owner. | Exposure & Posture, Attack Surface, Blast Zones. | Exposure overlay, internet boundary, attack path edges. |
| Controls | Missing/degraded control, failed control, weak compensating control SHALL bind to cases. | Control restored or compensating control validated. | Control degrades, coverage drops, configuration changes. | Control owner, platform owner, governance owner. | Control Coverage, Control Validation, Compliance. | Control nodes and protects/lacks_control edges. |
| Drift | Config drift, policy drift, architecture drift, access drift SHALL bind to cases. | Baseline restored, approved exception, accepted residual risk. | Drift recurs, exception expires, baseline changes. | Domain owner plus SOM threshold route. | Drift Console, Architecture Drift, Access Drift. | Drift overlay and baseline deviation edges. |
| Tool Health | Connector failure, telemetry stale, tool degradation, license/coverage failure SHALL bind to cases. | Fresh ingestion restored, connector healthy, telemetry confirmed. | Freshness expires, tool fails again, exclusive coverage disappears. | Platform/tool owner, SOC tooling owner, SOM. | Tool Health, Connectors, Platform. | Tool nodes, monitored_by, covered_by, stale edges. |
| Coverage | EDR/NDR/VM/cloud/identity coverage gaps SHALL bind to cases. | Coverage confirmed, tool state restored, exception accepted. | Asset loses coverage, connector stale, new uncovered asset appears. | Tool owner, asset owner, platform owner. | Coverage Gaps, Scanner Coverage, Identity Coverage. | Coverage overlay and not_covered_by edges. |
| Blast Radius | Blast zone expansion or high-impact path SHALL bind to cases. | Radius reduced, path broken, compensating control confirmed. | Graph expands, critical path reappears, identity privilege increases. | SOM, domain owner, mission owner, architecture owner. | Blast Zones, Mission Control, Fusion Map. | Blast-radius overlay, mission-impact overlay. |

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
## v2.3 Control Plane UI Update
The Commander Internal Control Plane adopts secure operator-console styling, not the full tactical Operational App treatment. It must support customer, tenant, licence, entitlement, feature, deployment ring, support access, emergency control, and operator audit workflows using the shared UI doctrine tokens and square geometry. P0 visibility appears only where it affects entitlements, emergency controls, support access, or operator oversight.

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
