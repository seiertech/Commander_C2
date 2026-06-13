> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #68 — Identity Intelligence Surface Specification

**Document ID:** `68_Identity_Intelligence_Surface_Spec.md`
**Spec:** 68
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Surface Specification
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `60_Internal_and_External_Attack_Surface_Framework_Spec.md`
- `62_Verdict_Semantics_Specification.md`
- `75_Internal_Risk_Investigation_Sub_Lifecycle_Spec.md`
- `18_Unified_Identity_Architecture.md`

## 1. Status

Binding surface specification. Defines the Identity Intelligence Surface as the dedicated per-identity intelligence picture that integrates access, behavioural, threat, case, and risk trajectory data for a single identity.

## 2. Surface Statement

For any identity in the estate, the Identity Intelligence Surface presents the complete intelligence picture in one entity-centric view. This is the surface the CISO opens when HR reports a concerning employee. The surface the identity team opens when an executive's account shows anomalous activity. The surface the Internal Risk team opens during investigation. The surface that supports leaver offboarding intelligence review.

It is a single-identity surface — focused, deep, comprehensive. Different from list-based identity views (which present many identities) and from the Internal Operating Picture (which presents aggregate patterns). The Identity Intelligence Surface is the answer to "tell me everything about this person."

## 3. Surface Composition

The surface is organised into six sections, each summarised with drill-down to detail:

### 3.1 Identity Overview Section

- Identity attributes: name, UPN, email, account status, lifecycle stage (joiner/active/mover/leaver), department, manager, location, employment type (employee/contractor/service/external)
- Primary identity provider (Entra ID, Okta) with sync state
- MFA enforcement state
- Privileged access flag (standing admin? PIM-eligible?)
- Last sign-in timestamp
- Account creation date
- Risk score (composite from existing v2.5 model)
- Quick links to source platforms (Entra, Okta, AD, HR system)

### 3.2 Access Intelligence Section

- **Full entitlement footprint** — every role, group membership, permission, license, and access grant across every connected system
- **Computed access chains** — hop-by-hop paths from this identity to terminal resources (with privilege escalation paths highlighted)
- **Privileged access summary** — standing admin roles, PIM-eligible roles, vault access, just-in-time access patterns
- **Group memberships** — direct and inherited, with security implications per group
- **Cross-system correlation** — when this identity has elevated access in multiple systems, the cross-system risk picture
- **Identity chain CHAIN computation** — Stage 1/2/3 results from existing v2.5 model

### 3.3 Behavioural Intelligence Section

*Access restricted by Internal Risk authority per Spec #75.*

- **Verdict history timeline** — chronological view of operational tool verdicts involving this identity
- **Per-disposition breakdown** — count of BLOCK / QUARANTINE / COACH / REQUIRE_MFA / REQUIRE_COMPLIANT / MONITOR / ALLOW / AUDIT verdicts
- **Per-source verdict density** — how many verdicts from each operational tool
- **Policy firing pattern** — which policies most commonly fire against this identity
- **Peer comparison** — how this identity's verdict pattern compares to peers (same role, department, location)
- **Anomaly indicators** — specific patterns Commander flagged (impossible travel, unusual download volume, restricted geography, etc.)
- **Trust calibration context** — which tools are most predictive for verdicts against this identity

### 3.4 Threat Intelligence Section

- **External threats targeting this identity** — phishing campaigns targeting their role/department/email, credential exposure on breach databases (where licensed), threat actor focus on similar identities
- **Internal threats from this identity** (with Internal Risk authority) — DLP patterns, exfiltration indicators, behavioural divergence flagging
- **Identity-relevant CVEs** — vulnerabilities affecting devices or applications this identity uses

### 3.5 Case History Section

- **SOC cases involving this identity** — via External Attack Correlation (Commander's parallel record of SOC cases binding to the identity)
- **Commander cases** — Identity cases (privilege drift, access drift, stale account), Verdict Pattern cases (with Internal Risk authority), Vulnerability cases tied to identity-owned devices
- **Case timeline** — temporal view of all cases involving the identity
- **Resolution outcomes** — disposition of resolved cases, current status of open cases

### 3.6 Risk Trajectory Section

- **Risk score evolution** — chart of identity risk score over time (90 days, 1 year, lifetime)
- **Driving events** — annotations on the chart for events that drove score changes (privilege grant, group addition, verdict spike, case resolution)
- **Trajectory analysis** — improving / stable / degrading / volatile
- **Projection** — based on recent trajectory, projected risk in 30/60/90 days

## 4. Visual Language

Following Spec #41 v2.6 (UI Doctrine):

- Intensity Level 1 (Operational Standard) for routine identity investigation
- Intensity Level 2 (Tactical Analysis) when active Verdict Pattern case or active External Attack Correlation case involves the identity
- Intensity Level 3 (Emergency Command) when P0 Zero-Day involves the identity
- Sections rendered as collapsible panels for focused work
- Risk trajectory rendered as line chart with annotation markers
- Access chains rendered as small node-link graphs (consistent with Fusion Map conventions)
- Verdict timeline rendered as dense temporal chart with disposition colour-coding

## 5. Interaction Model

- **Click access chain node** → opens the bound asset, application, or service in Asset Intelligence Surface
- **Click verdict event** → opens verdict detail with policy reference, source platform link
- **Click case** → opens case detail
- **Click threat indicator** → opens threat intelligence detail
- **Time scrubber** → view identity state at past timestamp (within retention window)
- **Cross-tenant institutional memory** (with appropriate authority) — anonymised pattern comparison against equivalent identities across tenants (where Cross-Tenant Institutional Memory engine licensed)
- **Add to watchlist** — explicit elevation of identity for ongoing monitoring (with audit)
- **Generate evidence pack** — export structured evidence for HR/Legal engagement (Internal Risk authority required)

## 6. RBAC and Persona Access

- **Aggregate view** (overview, access intelligence, threat intelligence, case history non-sensitive elements) — accessible to Identity/Access Specialist, Security Architect, Security Analyst, CISO, SOM
- **Behavioural intelligence section** — Internal Risk authority required
- **Internal threat detail** — Internal Risk authority required
- **Verdict Pattern case detail** — Internal Risk authority required
- **Evidence pack generation** — Internal Risk authority plus Investigation authority required
- **Cross-tenant comparison** — Tenant Admin authorisation required (where feature enabled)

Audit-of-access logs every access to behavioural intelligence section and internal threat detail (per Spec #75).

## 7. Build Readiness

The Identity Intelligence Surface is build-ready when:

- All six sections render with their composition per Section 3
- Identity overview integrates existing v2.5 unified identity model (Spec #18)
- Access intelligence integrates existing v2.5 CHAIN model
- Behavioural intelligence consumes Internal Behavioural Intelligence stream (Spec #59) with verdict semantics (Spec #62)
- Threat intelligence integrates External Threat Intelligence stream (Spec #59)
- Case history integrates case management (Spec #08)
- Risk trajectory operates from existing risk scoring engine
- RBAC enforced per Section 6
- Audit-of-access logs identity-level access per Spec #75

## 8. Configurability

Per Spec #55 v2.6:

- Risk trajectory chart window (default 90d)
- Verdict timeline density (events per pixel-bin)
- Peer comparison enable/disable
- Cross-tenant institutional memory enable/disable (where licensed)
- Behavioural intelligence section enable/disable per jurisdiction
- Evidence pack template configuration

## 9. Audit Events

- `IDENTITY_INTELLIGENCE_SURFACE_ACCESSED` — surface access with accessor, accessed identity, accessing persona
- `IDENTITY_BEHAVIOURAL_SECTION_ACCESSED` — specifically audited access to sensitive section
- `IDENTITY_EVIDENCE_PACK_GENERATED` — when evidence pack export occurs
- `IDENTITY_ADDED_TO_WATCHLIST` — explicit elevation
- `IDENTITY_CROSS_TENANT_COMPARISON_REQUESTED` — when cross-tenant feature used

## 10. Relationship to Other v2.6 Specifications

- **Spec #59 (Intelligence Layer)** — primary consumer of Internal Behavioural Intelligence stream for the behavioural section
- **Spec #62 (Verdict Semantics)** — verdict treatment in behavioural section
- **Spec #66 (Internal Operating Picture)** — drill-down destination from Internal COP
- **Spec #75 (Internal Risk Investigation Sub-Lifecycle)** — governance and access controls
- **Spec #18 (Unified Identity Architecture)** — underlying identity model
- **Spec #19 v2.6 (RBAC)** — Internal Risk authority role
- **Spec #08 v2.6 (Case Management)** — case history integration
- **Spec #41 v2.6 (UI Doctrine)** — visual language

## 11. Versioning

v1.0 — initial specification.
