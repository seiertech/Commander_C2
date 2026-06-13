> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #70 — Direction Boards Specification (Control Weakness + Policy Effectiveness)

**Document ID:** `70_Direction_Boards_Spec.md`
**Spec:** 70
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Surface Specification
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `62_Verdict_Semantics_Specification.md`
- `65_External_Operating_Picture_Surface_Spec.md`
- `66_Internal_Operating_Picture_Surface_Spec.md`

## 1. Status

Binding surface specification. Defines two Direction Boards — Control Weakness and Policy Effectiveness — that integrate with the Operating Pictures to direct attention at the structural level of security controls and policies.

## 2. Surface Statement

Direction Boards are command-grade panels that surface structural weaknesses (control gaps, policy issues) in a form that drives directional attention rather than per-finding triage. They are paired with the Operating Pictures:

- **Control Weakness Direction Board** — integrated with External Operating Picture (Spec #65). Surfaces which controls are correlated to active external attacks, which controls have known weakness without active exploitation, and the top exposure category needing attention.
- **Policy Effectiveness Direction Board** — integrated with Internal Operating Picture (Spec #66). Surfaces which policies are exhibiting concerning patterns (high override rate, zero-fire anomaly, disagreement pattern), and the top policy needing review.

Both boards generate cases (per Spec #08 v2.6) when patterns cross thresholds.

## 3. Control Weakness Direction Board

### 3.1 Composition

- **Exploited Controls panel** — controls correlated to active External Attack Correlation cases (from Spec #71 Pre-Warned Classification). For each: control identifier, control type, count of associated active attacks, severity, blast radius
- **Unexploited Weaknesses panel** — controls with known weakness (drift, coverage gap, configuration drift) that have not yet been correlated to attack activity. Ordered by severity and exposure
- **Footer summary line** — *"X exploited controls being actively driven. Y unattended weaknesses. Most common unattended category: <category>."*

### 3.2 Data Sources

- Active External Attack Correlation cases with their control correlations
- Coverage Control Model output (Spec #11 v2.5)
- Active Coverage cases and Drift cases involving controls
- Pre-Warned classification engine output (Spec #71)

### 3.3 Interaction

- Click exploited control → opens control detail with case list and remediation recommendations
- Click unattended weakness → opens control detail with case generation context
- Click footer summary → opens full Control Weakness analytics view

### 3.4 Configurability

- Exploitation correlation window (default 30 days)
- Severity threshold for surfacing unexploited weaknesses
- Category aggregation taxonomy (default: identity / network / endpoint / cloud / data / email / web)

## 4. Policy Effectiveness Direction Board

### 4.1 Composition

- **High Override Rate panel** — policies firing but being frequently overridden (suggesting policy mistuning or business process friction)
- **Zero-Fire Anomaly panel** — policies expected to fire that haven't fired in expected window (suggesting misconfiguration or population shift)
- **Disagreement Pattern panel** — policies where multiple tools produce contradictory verdicts on related events
- **Footer summary line** — *"X policies generating override patterns. Y policies anomalously silent. Top policy needing review: <policy>."*

### 4.2 Data Sources

- Internal Behavioural Intelligence stream (Spec #59) verdict density
- Policy reference data from Class B Operational Verdict connectors
- Verdict disagreement detection (Spec #62)
- Override events from operational tools

### 4.3 Interaction

- Click policy in High Override Rate → opens policy detail with override event history, affected user pattern, recommendation
- Click policy in Zero-Fire Anomaly → opens policy detail with expected vs actual fire rate, configuration drift detection
- Click policy in Disagreement Pattern → opens disagreement detail with contradictory verdict timeline
- Click footer summary → opens full Policy Effectiveness analytics view

### 4.4 Configurability

- Override rate threshold (default 15% over rolling 30-day window)
- Zero-fire window (default policy-specific, baseline shipped per policy type)
- Disagreement pattern threshold (minimum events for pattern)

## 5. Case Generation from Direction Boards

Both Direction Boards drive case generation when patterns persist:

**Control Weakness Direction Board:**
- Drift cases generated by existing v2.5 detection engine remain primary
- Direction Board surfaces patterns that may not yet have generated Drift cases (e.g. compounding exposure across multiple related controls)
- Manual escalation from Direction Board generates case-creation request to existing Coverage/Drift case lifecycle (no new case type created by Direction Board)

**Policy Effectiveness Direction Board:**
- Generates Policy Effectiveness cases (Spec #08 v2.6) per the threshold rules in Section 4.4
- Routing: Policy Effectiveness cases route to Policy Owner role (Spec #31 v2.6 — sub-routed by policy domain: email policy → email security team; identity policy → identity team; DLP policy → data protection team; etc.)

## 6. Visual Language

Following Spec #41 v2.6 (UI Doctrine):

- Direction Boards rendered as compact tactical panels (not full dashboards)
- Designed to integrate within Operating Picture surfaces (Spec #65 footer, Spec #66 footer)
- Top-three or top-five surfacing convention (not exhaustive lists — direction, not detail)
- Footer summary line as single-sentence directional statement
- Drill-through to full analytics view for those who need depth

## 7. Build Readiness

Direction Boards are build-ready when:

- Control Weakness Direction Board renders within External COP per Spec #65
- Policy Effectiveness Direction Board renders within Internal COP per Spec #66
- Data sources integrate correctly
- Case generation operates per Section 5
- Routing operates per Spec #31 v2.6
- Visual language conforms to Spec #41 v2.6
- Configurability exposed via Tenant Admin

## 8. RBAC and Persona Access

- **Control Weakness Direction Board** — same access as External COP (Spec #65)
- **Policy Effectiveness Direction Board** — same access as Internal COP (Spec #66) with appropriate Internal Risk authority where identity-specific detail surfaces

## 9. Audit Events

- `DIRECTION_BOARD_ACCESSED` — board access
- `DIRECTION_BOARD_DRILL_DOWN` — drill from board to detail
- `POLICY_EFFECTIVENESS_CASE_GENERATED` — when case fires from board pattern detection
- `CONTROL_WEAKNESS_ESCALATION` — manual escalation initiated

## 10. Relationship to Other v2.6 Specifications

- **Spec #65 (External Operating Picture)** — hosts Control Weakness Direction Board
- **Spec #66 (Internal Operating Picture)** — hosts Policy Effectiveness Direction Board
- **Spec #62 (Verdict Semantics)** — disagreement detection drives Policy Effectiveness Direction Board
- **Spec #08 v2.6 (Case Management)** — Policy Effectiveness case type
- **Spec #31 v2.6 (Routing Model)** — Policy Owner role routing
- **Spec #11 (Coverage Control Model)** — input to Control Weakness Direction Board
- **Spec #71 (Pre-Warned Classification)** — correlation engine for Control Weakness

## 11. Versioning

v1.0 — initial specification.
