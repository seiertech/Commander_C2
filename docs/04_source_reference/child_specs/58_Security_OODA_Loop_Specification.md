> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #58 — Security OODA Loop Specification

**Document ID:** `58_Security_OODA_Loop_Specification.md`
**Spec:** 58
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Foundational Doctrine
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture
**Phase:** v2.6 — Operational tempo framework specifying the closed loop at programme level.

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `00_AUTHORITY_AND_PRECEDENCE_v2_6.md`

**Subordinate specifications affected:** Spec #67 (OODA Dashboard Family), Spec #28 (Strategic and Tactical Priority Framework — extended), Spec #08 (Case Management Workflow — OODA Tempo Degradation case type), Spec #59 (Intelligence Layer Architecture — feeds Observe phase).

## 1. Status

This is binding doctrine. It defines the Security OODA Loop as Commander's primary operational tempo framework, the four phases of the loop, the boundary between programme-level OODA (Commander) and incident-level OODA (the SOC), the tempo measurement methodology, and the integration with Commander's case lifecycle and intelligence layer.

## 2. Doctrine Statement

Commander runs a continuous **Security OODA Loop** at the security programme level. The loop is the operational tempo of the security function — Observe, Orient, Decide, Act — running continuously across the entire estate, system-driven, with phase health metrics and tempo measurement as Commander's primary operational metric alongside posture score and coverage score.

The OODA loop has two altitudes in security operations:

- **Incident-level OODA** operates per-incident, real-time, human-driven. It is the SOC's job and lives in the SOC's tooling. Commander does not operate at this altitude.
- **Programme-level OODA** operates continuously across the estate, system-driven, at the security function level. It is Commander's job and lives in Commander.

The two altitudes are complementary. The SOC's incident OODA handles active threats in real time. Commander's programme OODA handles the security function as a whole — connector freshness, drift detection tempo, decision throughput, execution latency, validation completion. Neither replaces the other.

## 3. The Four Phases

The OODA loop comprises four phases. Each phase has a specific function, a defined set of engines in Commander, a phase health metric, and a set of phase-specific dashboard surfaces.

### 3.1 Observe

**Function:** Signal intake and freshness. The Observe phase answers: *how well is Commander seeing the estate right now?*

**Engines consumed:**
- Class A SOC Telemetry connectors (case and detection signal)
- Class B Operational Verdict connectors (verdict signal)
- Class C Configuration State connectors (posture and configuration signal)
- Class D Threat Intelligence connectors (external threat intelligence)
- Inverse Discovery Loop (coverage gaps from external signal)

**Phase health metrics:**
- Connector freshness per class — last-pull timestamp, expected cadence, freshness drift
- Signal volume by purpose and class — trended over time
- Coverage completeness — fraction of estate observable
- Blind spots and gaps — entities the security stack saw that Commander didn't know about
- Aggregate Observe phase health score (0-100, configurable thresholds)

**Drill paths:**
- Per-class breakdown → per-connector breakdown → per-domain breakdown → individual entity gaps
- Trending over time (last 1h / 24h / 7d / 30d)
- Root cause analysis for freshness degradation (rate limiting, API changes, auth failures, network issues)

**Phase degradation cases:** When the Observe phase health score drops below configurable threshold, an OODA Tempo Degradation case (Spec #08 v2.6) is generated with phase context. Routes to platform team or SOM depending on root cause.

### 3.2 Orient

**Function:** Turning raw signal into understanding. The Orient phase answers: *what does the signal mean in the context of this estate?*

**Engines consumed:**
- Drift detection engine (~240 models across 13 domains)
- Risk scoring engine
- Blast radius engine
- Pre-warned classification engine (Spec #71)
- Architecture intelligence engine
- Identity chain computation
- Threat relevance scoring (estate matching against threat intelligence)
- Entity resolution and authority resolution

**Phase health metrics:**
- Drift detection tempo — findings generated per time window, trended
- Risk model freshness — fraction of entities with current risk scores
- Architecture intelligence status — anti-patterns identified, trust boundaries detected, design incongruences
- Classification distribution — pre-warned versus protected versus novel cases over time
- Blast radius computation tempo
- Aggregate Orient phase health score

**Drill paths:**
- Per-domain breakdown → individual findings → root finding analysis
- Classification trend → specific cases driving the trend
- Stale risk score list → entity-level drill-down
- Architecture findings → dependency map view

**Phase degradation cases:** Orient queue saturation or model freshness drift below threshold generates OODA Tempo Degradation case routed to security architecture or platform team.

### 3.3 Decide

**Function:** Generating remediation, prioritisation, and routing decisions. The Decide phase answers: *given what we understand, what should be done?*

**Engines consumed:**
- Remediation generation engine (push payloads, detection specifications, compensating control proposals, manual recommendations)
- Routing engine (Spec #31)
- Priority boost engine (Spec #28)
- Context-Aware Drift Prioritisation Matrix (Spec #74)
- Tactical objective auto-promotion engine
- Approval orchestration

**Phase health metrics:**
- Decision throughput — decisions made per time window by decision type
- Decision queue depth — findings awaiting decomposition, sub-actions awaiting routing, routings awaiting approval
- Approval cycle time — time from decision generated to decision approved, by approval authority
- Routing accuracy — fraction of routings challenged or rerouted versus accepted
- Auto-promotion activity — drift findings auto-promoted to tactical objectives
- Aggregate Decide phase health score

**Drill paths:**
- Decision type breakdown → queue depth per type
- Approval authority breakdown → cycle time per authority
- Routing breakdown → team workload and acceptance rates
- Specific cases stuck in Decide phase

**Phase degradation cases:** Queue saturation, approval cycle time above threshold, or routing accuracy below threshold generates OODA Tempo Degradation case routed to SOM.

### 3.4 Act

**Function:** Executing decisions and validating outcomes. The Act phase answers: *was what was decided actually done?*

**Engines consumed:**
- Push execution engine (Spec #14, Spec #20)
- SOAR dispatch interface
- ITSM record creation
- Detection specification handoff (Spec #15)
- Compensating control deployment tracking
- Validation engine (Spec #30)
- Manual remediation tracking

**Phase health metrics:**
- Execution throughput — push actions executed, ITSM dispatches, specifications delivered, controls deployed
- Execution latency — time from decision approved to action executed, by execution method
- Execution success rate — fraction of pushes succeeded versus rolled back, dispatches acknowledged, specifications deployed
- Validation pending count — actions executed but not yet validated
- Failed actions — pushes rolled back, dispatches refused, specifications rejected, manual remediations abandoned
- Aggregate Act phase health score

**Drill paths:**
- Execution method breakdown → latency per method
- Owner team breakdown → success rate and latency per team
- Failed actions list → root cause analysis
- Specific cases stuck in Act phase

**Phase degradation cases:** Execution success rate below threshold, latency above threshold, or failed action count above threshold generates OODA Tempo Degradation case routed to push operations, platform team, or SOM.

## 4. The OODA Tempo Metric

**OODA tempo** is Commander's primary operational metric. It measures the average time for a finding to traverse the full OODA cycle: from Observe (signal arrival) through Orient (drift detected, classified, prioritised) through Decide (remediation generated, routed, approved) through Act (executed and validated).

**Healthy tempo ranges (configurable per tenant, system defaults shipped):**

- Hours-to-days: healthy estate, low backlog, fast remediation
- Days-to-weeks: degraded estate, growing backlog, slower remediation
- Weeks-to-never: failing estate, dysfunctional response, immediate intervention required

**Tempo measurement:**

- Per-finding tempo measured from `DETECTED` state to `CLOSED_BY_SYSTEM` state (per the closed-loop lifecycle)
- Per-case-type tempo computed as average across cases of that type
- Per-domain tempo computed as average across cases in that domain
- Per-team tempo computed as average across cases owned by that team
- Estate-wide tempo computed as weighted average across all active cases

**Tempo trends:**

- Improving — tempo decreasing over time (faster cycles)
- Stable — tempo within range (consistent)
- Degrading — tempo increasing over time (slower cycles)
- Failing — tempo exceeding maximum threshold (intervention required)

**Bottleneck identification:**

Commander continuously identifies which OODA phase is the bottleneck — the phase where findings spend disproportionate time. The Command Tempo Dashboard surfaces the current bottleneck with phase-specific context:

- Bottleneck in Observe → signal blindness, connector issues, coverage degradation
- Bottleneck in Orient → drift detection slowdown, model freshness drift, risk computation queue
- Bottleneck in Decide → routing queue, approval delays, decomposition backlog
- Bottleneck in Act → execution failures, owner non-response, validation delays

## 5. The Boundary with Incident-Level OODA

Commander runs programme-level OODA. The SOC runs incident-level OODA. The boundary is binding doctrine.

**Programme-level OODA (Commander):**
- Continuous, system-driven, across the entire estate
- Cycles measured in hours-to-days for healthy operation
- Findings traverse case lifecycle (no manual creation, system-owned closure)
- Phase health metrics surface at executive level (Command Tempo Dashboard)
- Outputs: remediation, detection specifications, routing decisions, tactical objectives

**Incident-level OODA (the SOC):**
- Per-incident, real-time, human-driven
- Cycles measured in minutes-to-hours for active response
- Incidents managed in SOC tooling (SIEM, XDR, SOAR)
- SOC analysts and incident commanders drive the loop
- Outputs: containment, eradication, recovery, incident closure

Commander never:
- Triages individual SOC incidents
- Runs incident-level OODA
- Replaces SOC tooling
- Owns active threat response

Commander does:
- Consume SOC case and detection signal read-only via Class A connectors
- Provide estate context for SOC cases via External Attack Correlation case type
- Generate detection specifications outbound to SIEM/SOAR teams
- Run programme-level OODA above the SOC's incident-level OODA

## 6. The OODA Dashboard Surfaces

The Security OODA Loop is surfaced through five dashboard surfaces specified in Spec #67 (OODA Dashboard Family):

- **Observe Phase Dashboard** — signal intake, connector freshness, coverage completeness, blind spots
- **Orient Phase Dashboard** — drift detection tempo, risk model freshness, classification distribution
- **Decide Phase Dashboard** — decision throughput, queue depth, approval cycle time, routing accuracy
- **Act Phase Dashboard** — execution throughput, latency, success rate, validation pending
- **Command Tempo Dashboard** — unified view of all four phases with tempo metric, bottleneck identification, OODA loop count, strategic and tactical priority alignment

The Command Tempo Dashboard is the CISO's primary executive surface alongside the Operating Pictures (Specs #65, #66).

## 7. Reporting Cadences

OODA metrics drive four reporting cadences specified in Spec #67:

**Hourly tactical refresh** for the SOM and operations centre. Real-time view of OODA phase health, current bottleneck, queue depth, freshness state. Used on the operations floor.

**Daily executive summary** for the CISO. Twenty-four-hour OODA tempo, phase trends, top three bottlenecks, top three improvements, count of OODA loops completed and OODA loops opened. Used in daily stand-up content.

**Weekly programme review** for security leadership team. Seven-day OODA trends, strategic priority progress as rollups of contributing OODA loops, team performance via Operational Passport metrics, exception and suppression activity. Used in leadership team meeting content.

**Monthly board report** for board-level governance. Thirty-day OODA tempo, comparative trend (this month vs last month vs same month last year), strategic objective progress, evidence of the security function operating, audit-grade narrative of what changed and why. Used in board deck content.

All four cadences report against the same OODA phase model, same tempo metric, same drill paths. The CISO presenting the monthly board report uses the same vocabulary the SOM uses on the operations floor.

## 8. Integration with Strategic and Tactical Priority Framework

The Strategic and Tactical Priority Framework (Spec #28) integrates with OODA tempo:

- **Strategic priorities** are CISO-level objectives with target metrics. Progress is the rollup of OODA loops contributing to those objectives. Strategic priorities at risk surface on the Command Tempo Dashboard.
- **Tactical priorities** are SOM-level campaigns decomposed from strategic. Progress is the count of OODA loops aligned to the tactical priority that have completed validation.
- **Priority boost** flows through the Decide phase. Cases aligned to active strategic/tactical priorities rise in the queue within their priority band.

OODA tempo is therefore both an operational metric (how fast is the security function running?) and a strategic metric (is the security function delivering against priorities?). Both readings come from the same data substrate.

## 9. Integration with the Intelligence Layer

The four OODA phases consume from the Intelligence Layer (Spec #59) at appropriate points:

- **Observe** consumes from all four intelligence streams (External Threat, External Attack, Internal Behavioural, Posture)
- **Orient** processes the streams into understanding, generating the Posture Intelligence stream output as a feedback loop
- **Decide** consumes the integrated Estate Intelligence Picture for decision generation
- **Act** produces validated state changes that feed back into Observe as fresh signal

The OODA loop closes when Act phase validation feeds back into Observe, completing the cycle. The Intelligence Layer is the substrate the loop runs on.

## 10. OODA Tempo Degradation Case Type

When OODA phase health degrades, Commander treats its own operational health as case-bound work. The OODA Tempo Degradation case type (Spec #08 v2.6 case taxonomy) formalises this:

**Triggers:**
- Phase health score below configurable threshold for sustained period
- Bottleneck persisting in the same phase for sustained period
- Tempo exceeding configurable maximum for case type

**Lifecycle:**
- Open when threshold crossed → triage classifies root cause → routes to appropriate owner (platform team, SOM, push operations, etc.) → sub-actions generated → execution → validation that phase health recovered → closure

**Routing:**
- Observe degradation → platform team (connector issues), security operations (signal volume)
- Orient degradation → security architecture (model issues), platform team (compute capacity)
- Decide degradation → SOM (routing/approval capacity), security architecture (decision logic)
- Act degradation → push operations, platform team, owner teams

This is meta-OODA: Commander watches its own tempo and runs the OODA loop on itself when degradation occurs. The closed loop closes at the meta-level.

## 11. Configurability

All OODA thresholds and parameters are configurable per tenant via the Tenant Admin surface, governed by the Tenant Configuration Registry (Spec #55 v2.6):

- Phase health score thresholds (Observe, Orient, Decide, Act)
- Tempo maximum thresholds per case type and domain
- Bottleneck detection window (how long must a phase be the bottleneck before degradation case fires)
- Phase health computation weights (which sub-metrics contribute to phase health and at what weight)
- Reporting cadence frequencies and recipients

System defaults are shipped at build, validated against pilot data, documented with rationale. Baseline configuration profiles (Spec #55) cover OODA configuration for industry segments.

## 12. Audit Events

- `OODA_PHASE_HEALTH_COMPUTED` — periodic computation of phase health scores
- `OODA_TEMPO_COMPUTED` — periodic computation of tempo across case types, domains, teams
- `OODA_BOTTLENECK_IDENTIFIED` — when a new bottleneck phase is detected
- `OODA_BOTTLENECK_RESOLVED` — when a bottleneck phase recovers
- `OODA_TEMPO_DEGRADATION_CASE_GENERATED` — when degradation case fires
- `OODA_TEMPO_DEGRADATION_CASE_CLOSED` — when degradation case closes with phase recovered
- `OODA_REPORTING_CADENCE_EXECUTED` — when hourly/daily/weekly/monthly report is generated

## 13. Acceptance Criteria

The Security OODA Loop is correctly implemented when:

- All four phases are observable on the OODA Dashboard Family (Spec #67)
- Phase health scores are computed continuously per tenant
- OODA tempo is measurable per case type, domain, team, and estate-wide
- Bottleneck identification surfaces the slowest phase in real time
- OODA Tempo Degradation cases generate when thresholds cross
- Four reporting cadences operate against the same data substrate
- The boundary with incident-level OODA is enforced (no SOC incident triage, no incident response workflow)
- Configuration is exposed via Tenant Admin with system defaults shipped
- Audit events flow to the audit infrastructure

## 14. Relationship to Other v2.6 Specifications

- **Spec #57 (Security Command and Control Doctrine)** — establishes the category context within which OODA operates
- **Spec #59 (Intelligence Layer Architecture)** — provides the four intelligence streams that feed Observe
- **Spec #61 (Universal Security Signal Connector Contract)** — provides the connector framework that supplies signal to Observe
- **Spec #62 (Verdict Semantics)** — defines how verdict signal is treated within the Observe phase
- **Spec #67 (OODA Dashboard Family)** — surfaces OODA at the user interface layer
- **Spec #08 (Case Management Workflow) v2.6** — includes OODA Tempo Degradation as a case type
- **Spec #28 (Strategic and Tactical Priority Framework) v2.6** — integrates with OODA tempo as strategic measurement
- **Spec #55 (Baseline Configuration Framework) v2.6** — includes OODA configuration parameters with defaults

## 15. Versioning and Supersession

This is v1.0 of the Security OODA Loop Specification. The doctrine is foundational and is expected to remain stable across baseline increments. Phase definitions are structurally fixed; metric definitions and thresholds may evolve as pilot data informs tuning.

This specification does not supersede any v2.5.2 specification. The OODA framing extends the existing closed-loop doctrine without replacing it — the SDR closed loop (Detect, Analyse, Control, Validate, Adjust) maps cleanly to the four OODA phases (Detect feeds Observe, Analyse is Orient, Control is Decide, Validate closes Act, Adjust is the feedback into the next Observe cycle).
