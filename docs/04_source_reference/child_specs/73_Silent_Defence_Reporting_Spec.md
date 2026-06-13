> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #73 — Silent Defence Reporting Specification

**Document ID:** `73_Silent_Defence_Reporting_Spec.md`
**Spec:** 73
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Reporting Capability
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `62_Verdict_Semantics_Specification.md`

## 1. Status

Binding reporting capability specification. Defines Silent Defence Reporting as the aggregate intelligence picture of what the security stack does every day, without generating cases.

## 2. Capability Statement

The security stack performs vast amounts of defensive work that never reaches the SOC, never generates incidents, never produces visible deliverables. Antigena blocks phishing attempts. Defender quarantines malicious attachments. Zscaler blocks connections to C2 infrastructure. Conditional Access denies suspicious sign-ins. DLP enforces outbound policy decisions. Intune flags devices for compliance drift and many self-remediate. None of this becomes a SOC case. None of it wakes an analyst. All of it is evidence that the security stack is operating as designed.

**Silent Defence Reporting** is the aggregate intelligence picture of this work — the story of how defence is performing, not just where it failed. It is one of the five structural capabilities of Security Command and Control per Spec #57 Section 6.5.

**This is Option A architecture** — reporting and dashboard only. Silent Defence does not generate cases. Verdict-level events that warrant case investigation are handled by other case types (Verdict Pattern, Policy Effectiveness, External Attack Correlation) per the case generation rules in Spec #62 Section 9.

## 3. Reporting Composition

Silent Defence Reporting renders the aggregate verdict data from the Internal Behavioural Intelligence stream (Spec #59) plus relevant External Attack Intelligence stream (the prevented attacks that didn't progress to SOC cases) into:

### 3.1 Daily Silent Defence Summary

Auto-generated daily summary showing:

- Total prevention actions across the security stack (block + quarantine totals)
- Per-tool breakdown (Antigena, Defender, Zscaler, Conditional Access, DLP, etc.)
- Per-disposition breakdown (BLOCK / QUARANTINE / COACH / REQUIRE_MFA / etc.)
- Top categories of prevented activity (phishing, malware, C2, policy violation, DLP, geographic anomaly)
- Comparison vs daily baseline (today vs 7-day average)
- Notable spikes or drops in volume
- "Defence stories" — narratively significant prevention events (e.g. "Antigena blocked 47 emails targeting the finance team this morning, all from same campaign")

### 3.2 Weekly Silent Defence Report

Weekly summary intended for the SOC Operations Manager and CISO:

- 7-day totals per category
- Trend analysis (improving / stable / degrading defence volume per category)
- Coverage observations (which security domains are most active)
- Cost avoidance estimate (if N phishing attempts were blocked, the implied SOC investigation hours avoided)
- Top categories of prevented activity for the week
- Notable narrative events

### 3.3 Monthly Board-Grade Silent Defence Report

Monthly summary suitable for board reporting:

- 30-day aggregate totals
- Year-over-year trend
- Cost avoidance estimate (analyst hours, potential incident response cost)
- Narrative of defensive posture ("The security stack prevented X phishing attempts, blocked Y malware delivery attempts, denied Z policy violations this month")
- Defence layer effectiveness (which layers of defence in depth are contributing most)
- Audit-grade evidence of security function operating

### 3.4 Silent Defence Dashboard

Interactive dashboard accessible to:
- CISO (full)
- SOM (full)
- Risk/Compliance/Audit User (read for evidence purposes)
- Security Analyst (full for hunting context)

Composition:
- Headline metrics (today / this week / this month total prevented)
- Real-time prevention activity stream (subtle, ambient — not alarming)
- Per-tool contribution breakdown
- Per-category breakdown
- Trend charts (7d / 30d / 90d / 1y)
- Defence narrative panel (auto-generated stories)

## 4. The Defence Story Narrative

A key feature of Silent Defence Reporting is auto-generated narrative. Raw verdict counts are valuable but don't tell stories. Commander generates narrative descriptions from the verdict data:

**Examples:**
- "Antigena Email blocked 1,247 phishing attempts this week, up 18% from last week. The most common campaign targeted finance department mailboxes with invoice-themed lures."
- "Defender for Endpoint prevented 89 malicious attachment executions this month. None progressed to SOC investigation because the stack contained them."
- "Zscaler blocked 3,400 connections to known C2 infrastructure this quarter, including 47 attempts to recently-observed Cobalt Strike beacon servers."
- "Conditional Access denied 78 sign-in attempts from blocked geographies, with the largest concentration coming from a 24-hour spike against the marketing team accounts."
- "Intune flagged 47 devices for compliance drift this week and 41 self-remediated. The remaining 6 required Helpdesk intervention and were resolved within SLA."

The narrative is composed by templated language plus values from the verdict aggregates, with optional Commander AI elaboration (per Spec #34 Commander AI integration) where the customer has enabled AI-generated reporting.

## 5. Cost Avoidance Estimation

Silent Defence Reporting includes an estimated cost avoidance metric:

- **Per-prevention cost avoidance assumption** — configurable per prevention category (phishing-blocked assumed cost-avoided = X analyst-hours of investigation; malware-blocked assumed cost-avoided = Y analyst-hours plus avoided incident response; etc.)
- **Aggregate cost avoidance** — total analyst-hours theoretically avoided this period
- **Financial translation** — multiply by tenant-configured analyst cost rate
- **Comparative framing** — cost avoidance vs Commander licence cost (ROI framing)

Default cost avoidance assumptions are conservative and ship at build. Tenant configuration adjusts to local cost models. The metric is presented as estimate, not as absolute claim — auditing practice norms apply.

## 6. Operating Picture Integration

Silent Defence Reporting integrates with the Internal Operating Picture (Spec #66):

- Verdict density overlay on Internal COP is sourced from the same Internal Behavioural Intelligence data substrate
- Silent Defence dashboard accessible from Internal COP via "View aggregate" link
- Operating Picture shows current state; Silent Defence shows aggregate volume and trend

## 7. No Case Generation

Per the Option A architectural decision, Silent Defence Reporting **does not generate cases**. The reporting layer is purely visualisation and narrative.

Cases that arise from verdict patterns are generated by other capabilities:

- Persistent verdict patterns crossing thresholds → **Verdict Pattern case** (Spec #08 v2.6, governance per Spec #75)
- Policy verdict patterns showing dysfunction → **Policy Effectiveness case** (Spec #70 Direction Boards)
- Verdicts that fail to fire on attacks Commander knows about → **External Attack Correlation case** with Defence Worked annotation (Spec #71)
- Verdicts referencing unknown entities → **Coverage Blindspot case** (Spec #72)

Silent Defence Reporting is the dashboard layer beneath these case-generating capabilities. The same data substrate, presented differently for different purposes.

## 8. Configurability

Per Spec #55 v2.6:

- Daily/weekly/monthly cadence enable/disable
- Report recipients
- Cost avoidance assumptions per prevention category
- Tenant analyst cost rate (for financial translation)
- Narrative generation enable/disable
- Commander AI elaboration enable/disable (where AI licensed)
- Per-tool inclusion/exclusion (e.g. exclude tools too noisy to be meaningful in narrative)
- Board report template configuration

System defaults shipped at build.

## 9. Build Readiness

Silent Defence Reporting is build-ready when:

- Daily / weekly / monthly cadence reports generate automatically
- Silent Defence Dashboard renders with real-time data
- Defence Story narrative composition operates
- Cost avoidance estimation operates per configuration
- Integration with Internal Operating Picture functional
- RBAC enforced
- No case generation occurs from this reporting layer

## 10. Audit Events

- `SILENT_DEFENCE_REPORT_GENERATED` — when cadence report fires
- `SILENT_DEFENCE_REPORT_ACCESSED` — when report viewed
- `SILENT_DEFENCE_DASHBOARD_ACCESSED` — when dashboard accessed
- `SILENT_DEFENCE_EXPORT` — when report exported (PDF, presentation, etc.)
- `SILENT_DEFENCE_NARRATIVE_GENERATED` — when narrative composition fires

## 11. Relationship to Other v2.6 Specifications

- **Spec #57 (Security C2 Doctrine)** — Silent Defence Reporting is one of the five structural capabilities
- **Spec #59 (Intelligence Layer)** — consumer of Internal Behavioural Intelligence stream (aggregate, not individual events)
- **Spec #62 (Verdict Semantics)** — verdict aggregation and density treatment
- **Spec #66 (Internal Operating Picture)** — companion surface
- **Spec #67 (OODA Dashboard Family)** — Silent Defence metrics may surface in Act Phase Dashboard
- **Spec #41 v2.6 (UI Doctrine)** — visual language compliance

## 12. Versioning

v1.0 — initial specification. Option A architecture (reporting only, no case generation) confirmed for v2.6 baseline. Future versions may revisit Option B (case generation from notable Silent Defence patterns) based on customer feedback and operational learning.
