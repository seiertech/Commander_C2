> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #52 — Structured Mission Objective Binding Model

## Status
Active baseline authority for Commander SDR v2.5.

## Purpose
Define how Mission Control is configured, how missions connect to risks/cases/exposures, and how mission impact drives priority, SLA, routing, P0 and Fusion Map overlays.

## Binding Doctrine
- Missions are not free-text dashboard labels.
- Mission name and description may be free text.
- Mission impact must be computed from structured bindings.
- Tenant Admin defines and governs mission objectives.
- Commercial Control Plane enables/licences mission capability; it does not define customer missions.
- Operational App displays Mission Control and mission impact; it does not create missions.

## Mission Objective Object
```yaml
mission_id: string
tenant_id: string
name: string
description: string
owner_user_id: string
owner_team_id: string
criticality: tier_0 | tier_1 | tier_2 | tier_3
status: active | draft | archived | under_review
business_unit: string
environment_scope: string[]
linked_asset_ids: string[]
linked_asset_group_ids: string[]
linked_application_ids: string[]
linked_identity_ids: string[]
linked_cloud_account_ids: string[]
linked_data_store_ids: string[]
linked_external_endpoint_ids: string[]
linked_control_ids: string[]
tag_rules: object[]
matching_rules: object[]
priority_weight: number
sla_profile_id: string
p0_policy_id: string
routing_profile_id: string
review_frequency: string
last_reviewed_at: datetime
created_by: user_id
approved_by: user_id
```

## Binding Methods
Commander SDR supports:
1. manual structured binding
2. tag-based binding
3. business-service binding
4. dependency-graph binding
5. rule-based binding
6. Commander-suggested binding requiring approval

## Mission Impact Calculation
A case becomes mission-impacting when:
```text
Risk Object → affected entity → mission binding → case inherits mission impact
```

Affected entities include:
- assets
- applications
- identities
- cloud accounts
- data stores
- external endpoints
- control objects
- business services
- dependency graph nodes

## Case Detail Mission Impact Panel
Required fields:
- mission impact: yes/no
- affected mission
- binding reason
- impact level
- priority effect
- SLA effect
- P0 effect
- routing effect
- Fusion Map mission path link

## Tenant Admin Mission Configuration
Route:
```text
/admin/strategy/missions
```

Required functions:
- create mission objective
- link objects
- define tag rules
- define matching rules
- approve mission criticality
- review mission drift
- inspect Commander-suggested mission links
- view mission change history

## Fusion Map Integration
Fusion Map must support:
- mission objective nodes
- mission dependency paths
- mission impact overlay
- mission-linked case overlay
- P0 mission impact overlay
- mission blast-radius overlay

## Governance
- Analysts may recommend mission link corrections.
- Tenant Admin/Security Architect may configure mission bindings.
- CISO or authorised mission owner approves Tier 0/Tier 1 mission criticality.
- All mission changes are audited.
