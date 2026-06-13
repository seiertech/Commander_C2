> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #69 — Asset Intelligence Surface Specification

**Document ID:** `69_Asset_Intelligence_Surface_Spec.md`
**Spec:** 69
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Surface Specification
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `60_Internal_and_External_Attack_Surface_Framework_Spec.md`
- `62_Verdict_Semantics_Specification.md`
- `68_Identity_Intelligence_Surface_Spec.md`

## 1. Status

Binding surface specification. Defines the Asset Intelligence Surface — the dedicated per-asset intelligence picture parallel to the Identity Intelligence Surface for any asset (device, server, workload, container, application).

## 2. Surface Statement

For any asset in the estate, the Asset Intelligence Surface presents the complete intelligence picture. This is the surface that opens when an asset appears in an active attack case. The surface that opens when the SOM investigates "why is this server appearing in so many cases?" The surface that opens during M&A integration to understand inherited risk on specific assets. The surface that supports retirement decisions, refresh planning, and incident retrospective.

It is a single-asset surface — focused, deep, and comprehensive. Different from list views of many assets, and from the Operating Pictures (aggregate views).

## 3. Surface Composition

The surface is organised into seven sections:

### 3.1 Asset Overview Section

- Asset attributes: name, type, role, lifecycle status, owner, business unit
- Criticality classification (standard / important / critical / mission-critical)
- Environment (production / staging / development / sandbox)
- Cloud/on-premise classification, region, availability zone where applicable
- Persistent vs ephemeral classification (per existing v2.5 doctrine)
- External attack surface positioning (internet-facing / boundary / internal-only) per Spec #60
- Last-seen timestamp from each connected source
- Asset risk score (composite)
- Trust boundary context (which trust boundaries does this asset cross?)
- Quick links to source platforms (Tenable, CrowdStrike, Intune, vendor consoles)

### 3.2 Configuration State Section

- Current configuration vs intended baseline (per asset-type baseline configuration)
- Active drift findings on this asset
- Coverage state (which controls present / which controls missing)
- Recent configuration changes (audit trail of config drift events)
- Connected configuration sources (which Class C connectors observe this asset)

### 3.3 Verdict History Section

- Every prevention action involving this asset
- Compliance verdict history (Intune / Jamf / Workspace ONE / etc.)
- Endpoint detection and prevention verdict history (CrowdStrike / Defender / SentinelOne)
- Web filtering verdicts involving this asset (when asset is the source of web traffic)
- DLP verdicts involving this asset
- Per-disposition breakdown
- Verdict density trended over time

### 3.4 Behavioural Pattern Section

- Asset behavioural risk score (from existing v2.5 summary counters)
- Peer comparison — how this asset's behaviour compares to similar assets (same role, environment)
- Anomaly indicators — unusual process activity, unusual network destinations, unusual user activity on the asset
- Resource utilisation patterns where available

### 3.5 Case History Section

- All Commander cases involving this asset (Drift, Vulnerability, Coverage, Exposure, Tool Health, External Attack Correlation, Inverse Discovery)
- SOC cases involving this asset (via Class A connector, External Attack Correlation type)
- Case timeline — temporal view
- Resolution outcomes and current status

### 3.6 Vulnerability State Section

- Current CVEs identified on this asset (from Tenable, Defender Vuln Mgmt, other vulnerability sources)
- Patch status — applied / pending / not applicable
- Exploitability indicators (KEV match, EPSS score, BAS validation outcomes)
- Attack path likelihood for this asset
- Blast radius for this asset

### 3.7 Identity Exposure Section

- Identities with privileged access to this asset
- Identities with recent activity on this asset
- Privileged access chains terminating on this asset
- Cross-system identity correlation (identities with access here AND elsewhere in concerning combinations)

## 4. Visual Language

Following Spec #41 v2.6 (UI Doctrine):

- Intensity Level 1 (Operational Standard) for routine asset investigation
- Intensity Level 2 (Tactical Analysis) when asset has active cases
- Intensity Level 3 (Emergency Command) when P0 Zero-Day involves the asset
- Sections as collapsible panels
- Drift items rendered with consistent drift visual conventions from v2.5
- Verdict timeline parallel to Identity Intelligence Surface convention
- Vulnerability state with KEV badges and exploitability indicators

## 5. Interaction Model

- **Click identity in Identity Exposure section** → opens Identity Intelligence Surface
- **Click verdict event** → verdict detail
- **Click case** → case detail
- **Click CVE** → vulnerability detail with affected assets, exploit context, remediation path
- **Click attack path** → opens attack path visualisation (existing v2.5 attack path engine)
- **Time scrubber** → asset state at past timestamp
- **Drift remediation initiation** (with Approval authority) — initiate push or ITSM dispatch from this surface

## 6. RBAC and Persona Access

- **Asset overview, configuration, vulnerability state, case history** — accessible to SOC Operations Analyst, SOM, Security Architect, Vulnerability Analyst, Identity/Access Specialist, CISO, Risk Analyst
- **Verdict history detail** — Internal Risk authority required for verdict events involving identifiable user activity (most verdict events on user-operated assets fall under this restriction)
- **Behavioural pattern detail** — Internal Risk authority required where behavioural analysis correlates with specific user behaviour
- **Identity exposure section** — accessible to authorised personas

## 7. Build Readiness

The Asset Intelligence Surface is build-ready when:

- All seven sections render with their composition per Section 3
- Asset overview integrates canonical entity model
- Configuration state integrates existing v2.5 drift detection
- Verdict history consumes Internal Behavioural Intelligence stream
- Behavioural pattern integrates existing v2.5 summary counters
- Case history integrates case management
- Vulnerability state integrates existing v2.5 vulnerability tracking
- Identity exposure integrates existing v2.5 unified identity model
- RBAC enforced per Section 6
- Visual language per Spec #41 v2.6

## 8. Configurability

Per Spec #55 v2.6:

- Per-section enable/disable
- Verdict history window
- Behavioural pattern peer-comparison enable/disable
- Identity exposure detail (full / aggregate-only)

## 9. Audit Events

- `ASSET_INTELLIGENCE_SURFACE_ACCESSED` — surface access with accessor and accessed asset
- `ASSET_VERDICT_HISTORY_ACCESSED` — when verdict-history section is accessed (audit for governance correlation)
- `ASSET_DRILL_FROM_SURFACE` — drill to identity, case, vulnerability, attack path

## 10. Relationship to Other v2.6 Specifications

- **Spec #59 (Intelligence Layer)** — consumer of Posture Intelligence and Internal Behavioural Intelligence streams
- **Spec #62 (Verdict Semantics)** — verdict treatment in verdict history section
- **Spec #65 (External Operating Picture)** — drill-down destination
- **Spec #66 (Internal Operating Picture)** — drill-down destination
- **Spec #68 (Identity Intelligence Surface)** — parallel entity-centric surface, cross-linked
- **Spec #41 v2.6 (UI Doctrine)** — visual language
- **Spec #19 v2.6 (RBAC)** — section-level access controls

## 11. Versioning

v1.0 — initial specification.
