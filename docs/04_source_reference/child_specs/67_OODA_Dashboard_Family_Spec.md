> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #67 — OODA Dashboard Family Specification

**Document ID:** `67_OODA_Dashboard_Family_Spec.md`
**Spec:** 67
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Surface Specification
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `58_Security_OODA_Loop_Specification.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `41_Commander_SDR_Military_Intelligence_UI_Doctrine_Spec.md` (v2.6 addendum)

## 1. Status

Binding surface specification. Defines the OODA Dashboard Family — four phase dashboards plus the unified Command Tempo Dashboard — that surface Commander's programme-level Security OODA Loop.

## 2. Surface Statement

The OODA Dashboard Family surfaces Commander's operational tempo at the security programme level. Five dashboards comprise the family:

- **Observe Phase Dashboard** — signal intake, connector freshness, coverage completeness, blind spots
- **Orient Phase Dashboard** — drift detection tempo, risk model freshness, classification distribution, anomaly detection
- **Decide Phase Dashboard** — decision throughput, queue depth, approval cycle time, routing accuracy
- **Act Phase Dashboard** — execution throughput, latency, success rate, validation pending
- **Command Tempo Dashboard** — unified view integrating all four phases with tempo metric, bottleneck identification, OODA loop count

The Command Tempo Dashboard is the CISO's primary executive surface alongside the Operating Pictures (Specs #65, #66).

## 3. Observe Phase Dashboard

**Purpose:** Answer *how well is Commander seeing the estate right now?*

**Composition:**

- **Observe phase health score gauge** — 0-100 aggregate score with configurable thresholds (green / amber / red)
- **Connector freshness panel** — per-class breakdown (A SOC Telemetry / B Operational Verdict / C Configuration State / D Threat Intelligence) showing freshness state per connector
- **Signal volume trends** — per-purpose volume (Configuration / State / Verdict / Detection / Case / Inventory / Behavioural / Threat) trended over 1h / 24h / 7d / 30d
- **Coverage completeness panel** — fraction of estate observable, with drill-down to specific gaps
- **Blind spot list** — entities surfaced by Inverse Discovery Loop with root cause classification (discovery gap / staleness / shadow IT / naming mismatch)
- **Stream health panel** — per-stream health (External Threat / External Attack / Internal Behavioural / Posture)

**Drill paths:**
- Per-class → per-connector → per-domain → individual entity
- Per-stream → per-source → freshness detail
- Per-blind-spot → root cause analysis → onboarding routing

**Primary personas:** Platform Engineering, SOM, CISO.

## 4. Orient Phase Dashboard

**Purpose:** Answer *what does the signal mean in the context of this estate?*

**Composition:**

- **Orient phase health score gauge**
- **Drift detection tempo panel** — findings generated per time window per domain, trended
- **Risk model freshness panel** — fraction of entities with current risk scores, list of stale entities
- **Classification distribution panel** — pre-warned / protected / novel cases over time
- **Architecture intelligence panel** — anti-patterns identified, trust boundaries detected, design incongruences
- **Behavioural anomaly panel** — verdict pattern anomalies detected, peer-group deviations
- **Blast radius computation panel** — computation tempo and queue depth

**Drill paths:**
- Per-domain breakdown → individual findings → root finding analysis
- Classification trend → specific cases driving the trend
- Stale risk score list → entity-level drill-down
- Architecture findings → dependency map view (Fusion Map integration)

**Primary personas:** Security Architect, Security Analyst, SOM.

## 5. Decide Phase Dashboard

**Purpose:** Answer *given what we understand, what should be done?*

**Composition:**

- **Decide phase health score gauge**
- **Decision throughput panel** — decisions made per time window by decision type (push payload / detection specification / compensating control / manual recommendation / escalation)
- **Decision queue depth panel** — findings awaiting decomposition, sub-actions awaiting routing, routings awaiting approval
- **Approval cycle time panel** — time from decision generated to approved, by approval authority
- **Routing accuracy panel** — fraction of routings challenged or rerouted versus accepted
- **Auto-promotion activity panel** — drift findings auto-promoted to tactical objectives, attack-correlated tactical objective auto-creation
- **Strategic priority alignment** — fraction of Decide phase capacity going to prioritised work versus BAU

**Drill paths:**
- Decision type → queue depth per type → individual cases
- Approval authority → cycle time per authority → bottleneck identification
- Routing team → workload and acceptance rate → recalibration recommendation

**Primary personas:** SOM, Security Architect, CISO.

## 6. Act Phase Dashboard

**Purpose:** Answer *was what was decided actually done?*

**Composition:**

- **Act phase health score gauge**
- **Execution throughput panel** — push actions, ITSM dispatches, detection specifications, controls deployed, manual remediations completed
- **Execution latency panel** — time from approval to execution, by execution method
- **Execution success rate panel** — fraction of pushes succeeded vs rolled back, dispatches acknowledged, specifications deployed
- **Validation pending panel** — actions executed but not yet validated
- **Failed actions panel** — pushes rolled back, dispatches refused, specifications rejected, manual remediations abandoned
- **Closure tempo panel** — cases reaching `CLOSED_BY_SYSTEM` per time window

**Drill paths:**
- Execution method → latency per method → bottleneck identification
- Owner team → success rate and latency per team
- Failed actions list → root cause analysis → recovery routing

**Primary personas:** SOM, Push Operations, Platform Engineering, CISO.

## 7. Command Tempo Dashboard

**Purpose:** Unified CISO-grade executive view of OODA across all four phases.

**Composition:**

- **Four phase health scores** as four-quadrant view, colour-coded
- **OODA tempo headline metric** — average time for a finding to traverse the full cycle, with trend indicator (improving / stable / degrading / failing)
- **Bottleneck identification panel** — which phase is the current bottleneck with context
- **OODA loop count panel** — concurrent loops in flight, distribution by case type, distribution by domain
- **Strategic priority progress** — rollup of OODA loops contributing to each active strategic priority, with trajectory
- **Tactical priority progress** — rollup per active tactical priority
- **Top three bottlenecks** — current OODA Tempo Degradation cases with severity
- **Top three improvements** — phases recently recovered, tempo improvements achieved

**Drill paths:**
- Click any phase score → opens that phase dashboard
- Click bottleneck → opens OODA Tempo Degradation case
- Click strategic priority → opens Strategic Priority detail (Spec #28)
- Click tempo metric → opens tempo decomposition by case type and domain

**Primary personas:** CISO (primary), SOM, Risk Analyst.

## 8. Four-Cadence Reporting Framework

The OODA Dashboard data substrate feeds four reporting cadences per Spec #58 Section 7:

### 8.1 Hourly Tactical Refresh

- Audience: SOM, operations centre, on-shift Security Analysts
- Format: real-time interactive view (the OODA dashboards themselves)
- Content: current phase health, bottleneck, queue depth, freshness
- Use: operations floor situational awareness

### 8.2 Daily Executive Summary

- Audience: CISO
- Format: auto-generated digest with link to interactive view
- Content: 24-hour OODA tempo, phase trends, top three bottlenecks, top three improvements, count of OODA loops completed and opened
- Use: daily stand-up content, executive awareness

### 8.3 Weekly Programme Review

- Audience: Security leadership team
- Format: structured weekly report with interactive drill-in
- Content: 7-day OODA trends, strategic priority progress as rollups of contributing loops, team performance via Operational Passport metrics, exception/suppression activity
- Use: leadership team meeting content

### 8.4 Monthly Board Report

- Audience: Board, executive leadership
- Format: auto-generated PDF/document with audit-grade narrative
- Content: 30-day OODA tempo, comparative trends (month-over-month, year-over-year), strategic objective progress, evidence of security function operating, narrative of changes and rationale
- Use: board deck content

All four cadences report against the same data model. The CISO presenting the monthly board report uses the same vocabulary the SOM uses on the operations floor.

## 9. Visual Language

Following Spec #41 v2.6 (UI Doctrine):

- Intensity Level 1 (Operational Standard) for normal operations
- Intensity Level 2 (Tactical Analysis) when degradation cases active
- Intensity Level 3 (Emergency Command) when OODA tempo failing
- Square geometry, grid-based composition
- Phase health scores rendered as arc gauges
- Tempo metric rendered prominently with directional trend arrows
- Bottleneck rendered with high contrast on the bottleneck phase
- Strategic priority progress as horizontal bar gauges with trajectory indicators

## 10. RBAC and Persona Access

- **CISO** — full access to all five dashboards, default landing in Executive Posture workspace
- **SOM** — full access in Drift Operations workspace
- **Security Architect** — full access to Orient and Decide dashboards
- **Push Operations** — full access to Act Dashboard
- **Platform Engineering** — full access to Observe Dashboard
- **Risk Analyst** — read access to Command Tempo Dashboard
- **Security Analyst** — full access to Orient Dashboard, read access to others
- **Other personas** — per Spec #19 v2.6 RBAC

## 11. Configurability

Per Spec #55 v2.6:

- Phase health score thresholds (green/amber/red bands)
- Tempo maximum thresholds per case type
- Bottleneck detection window
- Phase health computation weights
- Reporting cadence enable/disable
- Reporting cadence recipients
- Monthly board report template configuration

## 12. Build Readiness

OODA Dashboard Family is build-ready when:

- All five dashboards render with their composition per Sections 3-7
- Phase health scores computed continuously per Spec #58
- OODA tempo measurable across case types, domains, teams, estate-wide
- Bottleneck identification operates
- Strategic and tactical priority rollups integrate with Spec #28
- Four reporting cadences operate against same data substrate
- Drill paths function per dashboard
- RBAC enforced
- Audit events flow

## 13. Audit Events

- `OODA_DASHBOARD_ACCESSED` — surface query with persona and scope
- `OODA_DRILL_DOWN` — drill from dashboard to detail
- `OODA_REPORT_GENERATED` — when scheduled cadence report fires
- `OODA_REPORT_DELIVERED` — when report reaches recipient

## 14. Relationship to Other v2.6 Specifications

- **Spec #58 (Security OODA Loop)** — defines the operational tempo framework
- **Spec #28 v2.6 (Strategic and Tactical Priority Framework)** — priority rollup integration
- **Spec #65 (External Operating Picture)** — Command Tempo Snapshot integration
- **Spec #66 (Internal Operating Picture)** — Command Tempo Snapshot integration
- **Spec #08 v2.6 (Case Management)** — OODA Tempo Degradation case type
- **Spec #41 v2.6 (UI Doctrine)** — visual language compliance

## 15. Versioning

v1.0 — initial specification.
