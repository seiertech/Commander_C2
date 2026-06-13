> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# 46 — Canonical Terminology and Object Glossary

## Status
ACTIVE BASELINE SPECIFICATION.

## Purpose
Prevents ambiguity across product, engineering, UI, case, routing, lifecycle, and control-plane documents.

## Canonical Terms

| Term | Definition |
|---|---|
| Risk Object | Canonical actionable risk record emitted by connectors, rules, communications, validation engines, or derived correlation. |
| Case | System-owned remediation container bound to one or more risk objects. |
| Sub-Action | System-generated child work item required to resolve, mitigate, validate, communicate, or govern a case. |
| Status | Lifecycle state owned by the system lifecycle engine. |
| Priority | Work-ordering and urgency signal. Priority does not equal lifecycle state. |
| Severity | Technical seriousness of a condition before contextual prioritisation. |
| P0 Zero-Day | Highest emergency priority overlay. Not a case status. |
| Validation | Evidence-based confirmation of presence, remediation, mitigation, exposure, or control state. |
| Closure | System transition after all mandatory closure gates pass. |
| Reopening | System transition triggered by configured reopening rules. |
| Exposure | Reachability or exploitability context increasing likelihood or impact. |
| Vulnerability | Weakness or CVE-style flaw that may require remediation or mitigation. |
| Drift | Deviation from expected security architecture, configuration, coverage, control, or policy baseline. |
| Control Failure | Missing, weak, degraded, misconfigured, bypassed, or ineffective security control. |
| Coverage Gap | Missing telemetry, protection, scanner, identity, asset, or control coverage. |
| Security Debt | Unresolved remediation obligation tracked over time. |
| Residual Risk | Accepted remaining risk after mitigation, exception, or business decision. |
| Commander SDR Operational App | Main customer-facing operational product. |
| Tenant Admin Surface | Customer tenant configuration surface inside the SDR product. |
| Commander Internal Control Plane | Internal Seiertech/operator app for customer, tenant, licence, entitlement, module, support, and deployment controls. |
| Fusion Map | Multi-domain graph joining assets, identities, vulnerabilities, controls, exposures, drift, cases, sub-actions, teams, and mission objects. |

---

# v2.6 Extension — Terminology Glossary Addendum

**Extension version:** v2.6.0
**Extension date:** May 2026
**Extension scope:** Extends the canonical terminology and object glossary with v2.6 vocabulary. All existing glossary entries above this section remain in force unchanged.

## V2.6-1. New Glossary Terms

The following terms are added to the canonical glossary in v2.6:

### Architecture and Doctrine Terms

**Security Command and Control (Security C2)** — The category Commander occupies. The platform layer that integrates intelligence, defence, engineering, and active response into a unified operational framework above the customer's security stack, runs a continuous OODA loop at the security programme level, and produces auditable evidence of the security function operating against the actual estate. Defined in Spec #57.

**Security Drift Response (SDR)** — The patented operational discipline Commander runs within the Security C2 category. The closed-loop control system (detect, analyse, control, validate, adjust) against security posture drift. SDR is the operational discipline name; it is not the category and not the platform brand. Defined in Spec #57 Section 3.

**Commander** — The platform brand. The SaaS product customers deploy, configure, and operate. Commander runs SDR (the operational discipline) and occupies Security C2 (the category position).

**Security OODA Loop** — The programme-level OODA loop (Observe, Orient, Decide, Act) that Commander runs continuously. Distinct from the SOC's incident-level OODA loop. Defined in Spec #58.

**OODA Tempo** — The average time for a finding to traverse the full OODA cycle: from Observe (signal arrival) through Orient (drift detected, classified, prioritised) through Decide (remediation generated, routed, approved) through Act (executed and validated). Commander's primary operational metric alongside posture score and coverage score.

**Phase Health** — A composite score per OODA phase indicating how well the phase is performing relative to its baseline. Each phase has a phase health score continuously computed.

**Bottleneck** — The OODA phase with the lowest health score relative to baseline at a given time. Commander continuously identifies the bottleneck and surfaces it on the Command Tempo Dashboard.

**Intelligence Layer** — The architectural construct that integrates four streams of intelligence (External Threat, External Attack, Internal Behavioural, Posture) into a unified Estate Intelligence Picture. Defined in Spec #59.

**Estate Intelligence Picture** — The unified integration surface above the four intelligence streams. Consumed by all v2.6 surfaces.

### Attack Surface Terms

**External Attack Surface** — Everything in the estate that the outside world can touch (internet-facing services, exposed APIs, public DNS, email channels, partner integrations). External threat actors operate against this surface.

**Internal Attack Surface** — Everything internal to the estate that internal actors can act on (files, applications, data, identities, configurations, devices). Internal threat actors (malicious, negligent, or compromised) operate against this surface.

**External Threat Actor** — Adversaries outside the estate boundary.

**Internal Threat Actor** — Internal users — employees, contractors, partners with internal access — categorised as malicious, negligent, or compromised.

**External Operating Picture (External COP)** — The battlefield view of external attack activity against the estate. Estate posture as base map, attacks landing as foreground. Defined in Spec #65.

**Internal Operating Picture** — The parallel surface showing internal actor behavioural patterns. Defined in Spec #66.

### Classification Terms

**Pre-Warned** — Classification applied to an external attack landing on an asset Commander had flagged as exposed (drift, control gap, coverage deficit) before the attack occurred. Defined in Spec #71.

**Protected** — Classification applied to an external attack landing on an asset Commander considered fully protected. These warrant immediate investigation as potential novel TTPs, sophisticated adversaries, or insider compromise.

**Novel** — Classification applied when the signal is too new or too ambiguous to classify as Pre-Warned or Protected.

### Verdict Terms

**Verdict** — A time-bound claim from an operational security tool about an entity's security state at a moment in time. Examples: "this email is malicious," "this device is compliant," "this sign-in is risky." Defined in Spec #62.

**Operational Verdict Connector (Class B)** — Connector class that consumes verdict signal from operational security tools. Defined in Spec #61.

**Verdict Density** — Aggregate measure of verdict volume per entity per time window.

**Verdict Disagreement** — Detection of conflicting verdicts from different tools on the same entity within overlapping time windows.

**Trust Calibration** — Per-tool weighting of verdict reliability based on subsequent correlation with attack activity or remediation outcomes.

**Silent Defence** — The aggregate intelligence picture of what the security stack does every day — every verdict, every block, every quarantine, every override — across the entire stack. Reported in Silent Defence Reporting (Spec #73).

### Connector Terms

**Class A — SOC Telemetry Connector** — Connector class that consumes case and detection signal from SIEM, XDR, EDR, NDR platforms. Read-only.

**Class B — Operational Verdict Connector** — See "Operational Verdict Connector" above.

**Class C — Configuration State Connector** — Connector class that consumes intended state of controls, assets, identities, policies. The existing v2.5 connector universe extended.

**Class D — Threat Intelligence Connector** — Connector class that consumes external threat intelligence (CVE feeds, IOC streams, vendor advisories).

**Multi-Class Connector** — A single connector declaring against multiple connector classes. Example: Microsoft Defender for Endpoint is Class A (incident signal), Class B (prevention verdicts), and Class C (policy configuration).

**Conformance Tier** — Per-class declaration of connector readiness: Certified, Full, Baseline, Planned.

### Case Terms (v2.6 additions)

**External Attack Correlation case** — Case type 8. Commander's parallel record when a SOC case binds to Commander entities.

**Verdict Pattern case** — Case type 9. Generated when internal behavioural intelligence flags a pattern warranting attention.

**Inverse Discovery (Coverage Blindspot) case** — Case type 10. Generated when external signal references an entity Commander doesn't know about.

**Policy Effectiveness case** — Case type 11. Generated when a policy exhibits an effectiveness anomaly.

**OODA Tempo Degradation case** — Case type 12. Generated when Commander's own OODA phase health drops below threshold.

### Surface Terms

**Identity Intelligence Surface** — Dedicated per-identity intelligence picture. Defined in Spec #68.

**Asset Intelligence Surface** — Dedicated per-asset intelligence picture. Defined in Spec #69.

**Direction Board** — Two-column surface showing current state and direction of travel. Control Weakness Direction Board and Policy Effectiveness Direction Board defined in Spec #70.

**OODA Dashboard Family** — Five dashboards: four phase dashboards (Observe, Orient, Decide, Act) plus Command Tempo Dashboard. Defined in Spec #67.

**Command Tempo Dashboard** — The unified surface showing OODA tempo, phase health, and current bottleneck.

### Persona Terms (v2.6 additions)

**Security Analyst** — Cross-domain investigator. Persona 10 of 11. Detail in Master Proposition v5.0 Section 22.

**Risk Analyst** — Operational risk specialist. Persona 11 of 11.

**Internal Risk Lead / Internal Risk Analyst** — Customer-side roles that receive Verdict Pattern case routing per Spec #75.

**Policy Owner** — Role assigned per-policy, receives Policy Effectiveness case routing.

### Authority Terms

**Internal Risk authority** — Fifth authority overlay (joining Administrative, Investigation, Approval, Reporting). Required for access to Verdict Pattern cases, Internal Operating Picture identity-level detail, and Behavioural Intelligence sections.

### Discovery Terms

**Inverse Discovery Loop** — Mechanism that uses external signal to test Commander's inventory completeness. When external signal references an entity Commander doesn't know about, the lookup failure becomes a Coverage Blindspot case. Defined in Spec #72.

