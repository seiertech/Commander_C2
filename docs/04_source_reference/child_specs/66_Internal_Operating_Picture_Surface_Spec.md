> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #66 — Internal Operating Picture Surface Specification

**Document ID:** `66_Internal_Operating_Picture_Surface_Spec.md`
**Spec:** 66
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Surface Specification
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `60_Internal_and_External_Attack_Surface_Framework_Spec.md`
- `62_Verdict_Semantics_Specification.md`
- `75_Internal_Risk_Investigation_Sub_Lifecycle_Spec.md`
- `41_Commander_SDR_Military_Intelligence_UI_Doctrine_Spec.md` (v2.6 addendum)

## 1. Status

This is a binding surface specification. It defines the Internal Operating Picture as the command surface for internal actor activity against the internal attack surface, paired with the External Operating Picture (Spec #65).

## 2. Surface Statement

The Internal Operating Picture (Internal COP) is Commander's command-grade dashboard for internal actor behavioural patterns. It is the paired surface to the External Operating Picture (Spec #65) — same estate, different threat surface, different intelligence stream, different visual language.

The Internal COP composes the Internal Behavioural Intelligence stream (Spec #59) plus identity and policy state into a behavioural picture that answers the CISO's question: *"What are my internal actors doing across the security stack right now, where is behaviour diverging from baseline, and where do my Internal Risk team's eyes need to go?"*

The Internal COP carries enhanced governance because it relates to identifiable user activity. RBAC restrictions, audit-of-access, and jurisdictional configurability apply (per Spec #59 Section 8 and Spec #75).

## 3. Surface Composition

The Internal COP is composed of six principal regions:

### 3.1 Estate Map Base Layer

Same six-zone estate decomposition as External COP (Identity, Cloud, SaaS, Endpoint, Server, Network). Custom zone configurations supported per tenant. Consistent navigation between External and Internal COPs.

### 3.2 Verdict Density Overlay

The primary overlay on the Internal COP renders verdict density per zone:

- **Heat density gradient** — zones with higher verdict activity rendered with greater visual intensity (amber-through-violet gradient — deliberately different from External COP's red emphasis)
- **Per-disposition decomposition** — within each zone, breakdown of BLOCK / QUARANTINE / COACH / REQUIRE_MFA / REQUIRE_COMPLIANT / MONITOR / ALLOW / AUDIT verdict counts
- **Per-source breakdown** — which operational tools contributed verdicts to the zone's density
- **Temporal trend** — verdict density change over configurable window (hour-over-hour, day-over-day, week-over-week)

### 3.3 Identity Risk Pattern Visualisation

Identities exhibiting concerning verdict patterns are surfaced as named markers on the map:

- **Identity markers** — placed in their primary zone (Identity Zone for service accounts; Endpoint Zone for users primarily operating endpoints; etc.)
- **Pattern indicators** — visual differentiation for identities with elevated verdict density, peer-group divergence, geographic anomaly, or specific concerning sequences
- **Pre-warned identity ring** — analogous to External COP's pre-warned ring; an identity whose verdict pattern Commander had previously flagged as concerning and is now exhibiting further concerning verdicts carries an amber ring

Per Spec #75 governance, identity-level detail in the Internal COP requires Internal Risk authority on the user's RBAC. Default view shows aggregate density without identity-level detail.

### 3.4 Geographic Anomaly Markers

Specific geographic patterns surface as markers:

- **Impossible travel markers** — identities authenticating from geographically separated locations within timeframes that suggest impossibility
- **Restricted geography markers** — identities attempting authentication from restricted geographies
- **Unusual access pattern markers** — access from geography unusual for the identity's normal pattern

### 3.5 Policy Effectiveness Direction Board

A panel below the map displays the Policy Effectiveness Direction Board (Spec #70):

- **Policies with high override rate** — policies firing frequently but being overridden, suggesting policy mistuning or business process friction
- **Policies with zero-fire anomaly** — policies that haven't fired when they should, suggesting policy misconfiguration or population shift
- **Policies with disagreement pattern** — policies where multiple tools produce contradictory verdicts on related events
- **Recommendation footer** — top policy needing review, with case generated for retuning consideration

### 3.6 Command Tempo Snapshot (Internal Tempo)

Header strip with OODA tempo metrics filtered for the internal attack surface — Verdict Pattern case throughput, Internal Risk case routing tempo, internal-surface validation throughput.

## 4. Visual Language

Following Spec #41 v2.6 (UI Doctrine), the Internal COP uses **deliberately different visual conventions from External COP** so toggling between the two surfaces is immediately legible:

**Internal COP visual identity:**
- Amber-through-violet density gradient for verdict overlay (distinct from External COP red)
- Behavioural divergence markers as concentric ring patterns (peer-deviation visualisation)
- Geographic markers as directional arrows on world-map mini-overlay
- Policy effectiveness as bar-gauge indicators
- Intensity Level 1 (Operational Standard) during normal operations
- Intensity Level 2 (Tactical Analysis) when concerning patterns concentrate
- Square geometry, grid-based composition (consistent with External COP)

The deliberate visual distinction ensures the CISO toggling between External and Internal COPs knows immediately which surface they're looking at. External is red — attacks landing. Internal is amber-violet — behaviour concentrating.

## 5. Interaction Model

The Internal COP supports the following interactions (with RBAC governance):

- **Click on identity marker (with Internal Risk authority)** → opens Identity Intelligence Surface (Spec #68) with behavioural intelligence section primary
- **Click on identity marker (without Internal Risk authority)** → opens limited drill-down with aggregate behavioural indicators, identity-level detail redacted
- **Click on zone** → drills into zone-specific verdict density detail with per-policy breakdown
- **Click on policy in Policy Effectiveness Direction Board** → opens policy detail with verdict history, override events, recommendation context
- **Click on geographic anomaly marker** → opens anomaly detail with authentication event timeline
- **Click on Command Tempo Snapshot** → opens full Command Tempo Dashboard filtered to internal surface
- **Toggle overlay layers** — verdict disposition decomposition, geographic anomaly overlay, behavioural divergence markers
- **Time scrubber** — visualise verdict pattern evolution within retention window
- **Verdict drill-through** (with Internal Risk authority) — from density aggregate to individual verdict events

All identity-detail interactions are audit-logged per Spec #75 governance.

## 6. Governance and Sensitivity

The Internal COP carries enhanced governance because it relates to identifiable user activity:

**RBAC restrictions (Spec #19 v2.6):**
- Aggregate-only view available to broader audience (CISO, SOM, Security Analyst with appropriate scope)
- Identity-level detail restricted to Internal Risk authority role
- Geographic anomaly detail restricted to Internal Risk authority role
- Individual verdict drill-through restricted to Internal Risk authority role

**Audit-of-access (Spec #75):**
- Every access to identity-level detail is audit-logged with timestamp, accessor identity, accessed identity, access reason (where required)
- Audit-of-access is queryable by tenant admin
- Audit-of-access is retained per tenant audit retention policy

**Jurisdictional configurability:**
- Tenants may disable the Internal COP entirely for jurisdictions where employee monitoring is regulated
- Tenants may restrict the Internal COP to aggregate-only view (no identity-level detail)
- Tenants may configure verdict density thresholds to align with local employee monitoring norms

**Default conservatism:**
- Default Internal COP configuration shows aggregate density without identity-level detail
- Identity-level detail requires explicit configuration enablement plus Internal Risk RBAC

## 7. RBAC and Persona Access

The Internal COP is accessible to:

- **CISO** — aggregate view, with Internal Risk authority granted by tenant configuration for identity-level detail
- **SOM with Internal Risk authority** — full access in Drift Operations workspace
- **Security Analyst with Internal Risk authority** — full access for hunting and investigation
- **Identity/Access Specialist with Internal Risk authority** — full access for identity governance work
- **Risk Analyst** — aggregate access for risk modelling
- **Internal Risk role (new in v2.6)** — full access, primary persona for this surface
- **Other personas** — no access by default; per Spec #19 v2.6 RBAC matrix

Default workspace placement: Executive Posture (CISO with authority), Drift Operations (Security Analyst, SOM with authority).

## 8. Build Readiness

The Internal COP is build-ready when:

- Estate map base layer renders consistently with External COP (same zones)
- Verdict density overlay consumes from Internal Behavioural Intelligence stream (Spec #59)
- Identity Risk Pattern visualisation operates per RBAC governance
- Geographic anomaly markers render from cross-stream correlation
- Policy Effectiveness Direction Board renders per Spec #70
- Command Tempo Snapshot integrates with Spec #67
- Visual language is distinct from External COP (amber-violet vs red)
- All interactions per Section 5 operate with RBAC enforcement
- Audit-of-access per Section 6 logs every identity-level interaction
- Default configuration is conservative (aggregate-only)
- Tenant configuration allows enable/disable per jurisdiction

## 9. Configurability

Tenant-configurable parameters (Spec #55 v2.6):

- Surface enable/disable (per jurisdiction requirements)
- Identity-level detail enable/disable
- Custom zone definitions (shared with External COP)
- Verdict density thresholds (when does density become visually prominent)
- Geographic anomaly sensitivity
- Pattern divergence sensitivity (peer-deviation thresholds)
- Audit-of-access verbosity

System defaults shipped at build, with conservative defaults per the governance principle.

## 10. Audit Events

- `INTERNAL_OPERATING_PICTURE_ACCESSED` — surface query with persona and scope
- `INTERNAL_COP_IDENTITY_LEVEL_ACCESSED` — drill into identity-level detail (audit-of-access)
- `INTERNAL_COP_DRILL_DOWN` — drill to entity, case, policy, or zone
- `INTERNAL_COP_VERDICT_DRILL_THROUGH` — drill from density to individual verdict
- `INTERNAL_COP_DISABLED_BY_TENANT` — when tenant disables the surface

## 11. Relationship to Other v2.6 Specifications

- **Spec #57 (Security C2 Doctrine)** — Internal COP is paired with External COP as the dual Operating Pictures structural capability
- **Spec #59 (Intelligence Layer)** — primary consumer of Internal Behavioural Intelligence stream
- **Spec #60 (Attack Surface Framework)** — Internal COP is the internal attack surface visualisation
- **Spec #62 (Verdict Semantics)** — verdict density and disposition treatment
- **Spec #65 (External Operating Picture)** — paired surface
- **Spec #68 (Identity Intelligence Surface)** — drill-down destination for identity-level detail
- **Spec #70 (Direction Boards)** — Policy Effectiveness Direction Board integration
- **Spec #75 (Internal Risk Investigation Sub-Lifecycle)** — governance and access controls
- **Spec #41 v2.6 (UI Doctrine)** — visual language compliance
- **Spec #19 v2.6 (RBAC Permission Matrix)** — Internal Risk authority role

## 12. Versioning

v1.0 — initial specification under v2.6 baseline. Governance approach expected to evolve as pilot data informs refinement, particularly regarding default settings, RBAC granularity, and jurisdictional configuration patterns.
