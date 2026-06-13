> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #57 — Security Command and Control Doctrine

**Document ID:** `57_Security_Command_and_Control_Doctrine_Spec.md`
**Spec:** 57
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Foundational Doctrine
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture
**Phase:** v2.6 — Foundational doctrine introducing Security Command and Control as Commander's category claim.

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `00_AUTHORITY_AND_PRECEDENCE_v2_6.md`
- `AGENTS.md`

**Subordinate specifications affected:** All v2.6 specifications (#58 through #75) operate under this doctrine. The doctrine flows into UI doctrine (Spec #41), case management (Spec #08), priority framework (Spec #28), intelligence layer (Spec #59), and operating pictures (Specs #65, #66).

## 1. Status

This is binding doctrine. It defines the category position Commander occupies in the security market, the relationship between Commander, SDR, and the platform's three application surfaces, and the structural rules that govern Commander's behaviour at the category level.

This doctrine does not replace any existing specification. It establishes the category framing within which all existing specifications operate.

## 2. Doctrine Statement

Commander occupies the category of **Security Command and Control (Security C2)**. This category position is structural, not declarative. It is enforced by Commander's architecture, by its connector model, by its case lifecycle, by its intelligence layer integration, and by its boundary discipline with operational security tools.

Security C2 is defined as: **the platform layer that integrates intelligence, defence, engineering, and active response into a unified operational framework above the customer's security stack, runs a continuous OODA loop at the security programme level, and produces auditable evidence of the security function operating against the actual estate.**

## 3. The Three Layers — Category, Discipline, Platform

Commander operates at three coherent layers that must be distinguished in all proposition, documentation, and product surfaces:

**Layer 1 — Security Command and Control.** The category Commander occupies. The hierarchical position above operational security tools. The integration of intelligence, defence, engineering, and active response. Security C2 is a category position; it is what Commander *is* in market terms.

**Layer 2 — Security Drift Response (SDR).** The patented operational discipline Commander runs within the Security C2 category. The closed-loop control system that detects, analyses, controls, validates, and adjusts security posture drift. SDR is the operational discipline; it is what Commander *does* in operational terms.

**Layer 3 — Commander.** The platform brand that delivers Security C2 and runs SDR. Commander is the SaaS product customers deploy, configure, and operate. Commander is the platform; it is what customers *buy and use*.

These three layers are coherent. None contradicts the others. None dilutes the others. The proposition, the documentation, and the product surfaces must maintain all three consistently:

- Security C2 is the category — used in market positioning, analyst briefings, competitive framing, and the upper sections of the Master Proposition.
- SDR is the operational discipline — used when describing the closed loop, the case lifecycle, the patent claim, and the operational tempo.
- Commander is the platform — used when referring to the product, the surfaces, the connectors, the user experience, and the commercial model.

## 4. The Hierarchical Position

Commander sits above the customer's existing security stack. The position is hierarchical, not competitive. The categories below Commander remain unchanged — Commander does not replace them, does not compete with them, does not displace them. Commander integrates them.

The categories Commander sits above:

| Category Below | Function | Commander's Relationship |
|---|---|---|
| SIEM / SOC platforms | Aggregate logs, correlate events, manage incidents | Consumes case and detection signal read-only. Does not run incident workflow. |
| EDR / XDR | Endpoint detection and response | Consumes detection and verdict signal. Does not run endpoint response. |
| NDR | Network detection and response | Consumes detection signal. Does not run network response. |
| Email security | Block, quarantine, flag malicious mail | Consumes verdict signal. Does not run mail flow. |
| Web filtering | Block, allow, coach web traffic | Consumes verdict signal. Does not run web filtering. |
| DLP | Prevent data egress | Consumes verdict signal. Does not run DLP enforcement. |
| Identity policy (CA, MFA) | Authenticate and authorise | Consumes verdict signal and configuration state. Does not run identity enforcement. |
| MDM / Endpoint compliance | Enforce device baselines | Consumes verdict signal and configuration state. Does not run device management. |
| Posture management (CSPM, CIEM, SSPM) | Identify posture issues per domain | Consumes posture signal. Integrates across domains. Drives remediation. |
| Exposure management / CAASM | Surface attack surface and exposures | Consumes exposure signal. Correlates with attack activity. Drives prioritisation. |
| CTEM frameworks | Five-stage exposure management process | Native CTEM-stage delivery while occupying a category above CTEM. |
| GRC platforms | Compliance, risk, audit, attestation | Provides operational evidence feeding GRC processes. Does not run compliance workflows. |
| Threat Intelligence Platforms (TIP) | Aggregate, enrich, disseminate threat intelligence | Consumes from TIPs. Does not replicate TIP functionality. |
| Insider Risk Management | Detect insider threats | Surfaces behavioural patterns. Routes to customer-owned insider risk programme. Does not run investigations. |

## 5. The Boundary Discipline

The hierarchical position is meaningful only if the boundaries are held. Commander must never:

- Triage individual SOC cases.
- Run incident response workflow.
- Contain active threats.
- Execute write operations against SOC platforms.
- Replace any SOC function.
- Conduct insider risk investigations.
- Make determinations of malicious intent on internal actor behaviour.
- Initiate disciplinary or legal action.
- Replicate Threat Intelligence Platform functionality.
- Run compliance attestation workflows owned by GRC platforms.
- Run endpoint management owned by MDM platforms.
- Run DLP enforcement, web filtering enforcement, email enforcement, or identity enforcement owned by operational security tools.

Commander's value comes from its altitude. The moment Commander crosses into operational tool territory, the altitude is lost and Commander becomes a feature-list competitor with the categories beneath it. Holding the altitude is doctrinal discipline that flows through all design, build, and commercial decisions.

The full SOC boundary is specified in Section 25 of the Master Proposition v5.0. The Insider Risk boundary is specified in Section 26 of the Master Proposition v5.0 and in Spec #75 (Internal Risk Investigation Sub-Lifecycle).

## 6. The Five Structural Capabilities of Security C2

Security C2 as Commander implements it is defined by five structural capabilities that no other category provides:

### 6.1 Integration of Four Intelligence Streams

External Threat Intelligence, External Attack Intelligence, Internal Behavioural Intelligence, and Posture Intelligence — joined to the same canonical estate model, governed under the same case lifecycle, surfaced through the same Intelligence Layer. No other platform consumes from all four streams.

Detailed in Spec #59 (Intelligence Layer Architecture).

### 6.2 Programme-Level OODA Tempo

The OODA loop as a continuous operational rhythm across the entire security function — not at the incident level (which is the SOC's job) but at the programme level. Phase health metrics, tempo measurement, bottleneck identification, dashboards across four reporting cadences.

Detailed in Spec #58 (Security OODA Loop Specification) and Spec #67 (OODA Dashboard Family).

### 6.3 Pre-Warned, Protected, Novel Classification

Every external attack landing on the estate is classified against Commander's prior knowledge of the affected entity. The three-way classification is auditable and forms the basis for closed-loop feedback into priority and remediation.

Detailed in Spec #71 (Pre-Warned/Protected/Novel Classification).

### 6.4 Dual Operating Pictures

External Operating Picture for external attack activity, Internal Operating Picture for internal actor activity. Two surfaces, two threat models, one estate, one Commander.

Detailed in Spec #60 (Internal and External Attack Surface Framework), Spec #65 (External Operating Picture), Spec #66 (Internal Operating Picture).

### 6.5 Silent Defence Reporting

The aggregate picture of what the security stack does every day — every verdict, every block, every quarantine, every override — across the entire stack. The story of how defence is performing, not just where it failed.

Detailed in Spec #73 (Silent Defence Reporting).

These five capabilities are what make Security C2 a distinct category and Commander the first credible occupant of it.

## 7. The Category Naming Convention

For all proposition, documentation, sales, and marketing material:

- The category name is **Security Command and Control** (formal) or **Security C2** (abbreviated).
- The platform name is **Commander** or **Commander SDR** (when emphasising the SDR operational discipline).
- The operational discipline name is **Security Drift Response (SDR)**.
- The closed loop is the **Security OODA Loop** at the programme level.
- The integration layer is the **Intelligence Layer**.
- The two threat surfaces are the **External Attack Surface** and **Internal Attack Surface**.

The category claim is *"Commander is the Security Command and Control platform for the modern enterprise."* Not *"Commander is a posture management tool"* (which understates the position). Not *"Commander is a SIEM"* (which is false). Not *"Commander is a CTEM platform"* (which is technically true but understates — Commander runs CTEM within the broader C2 category).

## 8. The Position Relative to Analyst Frameworks

Existing analyst frameworks (Gartner, Forrester, IDC) do not yet have a quadrant for Security C2. This is expected. Categories that don't yet exist in analyst frameworks are the most valuable to own — they describe a structural gap in the market vocabulary, and the first credible occupant defines the language analysts eventually adopt.

Commander's position should be articulated in analyst engagements as:

- "We sit above the existing analyst categories you have."
- "We integrate posture management, SOC tooling, CTEM, GRC, and insider risk into a unified operational framework."
- "We don't compete in any single category beneath us — we command all of them."
- "Security C2 doesn't have a quadrant yet because no platform has structurally occupied the position before."

This positioning is defensible because the architecture supports it. Commander's connector model, intelligence layer, OODA loop, and case lifecycle are all structurally above-the-stack, not within-a-category.

## 9. The Boundary with CTEM

Continuous Threat Exposure Management (CTEM) is the dominant analyst framework for modern exposure management. Commander delivers every CTEM stage natively (as documented in Section 6 of the Master Proposition v5.0). Commander is CTEM-native, not CTEM-adjacent.

However, Commander occupies a category position *above* CTEM. CTEM is a five-stage process discipline; Security C2 is an integration framework that runs CTEM as one of several disciplines. The relationship:

- CTEM defines what to do (scope, discover, prioritise, validate, mobilise).
- Security C2 defines how to integrate (intelligence layer, OODA tempo, operating pictures, closed loop).
- Commander runs both — CTEM-native delivery within a Security C2 framework.

When customers ask "is Commander a CTEM platform?" the answer is "Commander delivers every CTEM stage natively, within a broader Security Command and Control framework that also covers operational tempo, intelligence integration, and dual attack surface visibility — things CTEM alone doesn't specify."

## 10. The Boundary with Existing Categories — Test Cases

The following test cases define how the boundary discipline applies in specific situations:

**Test case 1: A customer asks Commander to triage a Sentinel incident.** Commander cannot do this. Triaging Sentinel incidents is the SOC's function. Commander can show the incident on the External Operating Picture with pre-warned classification and correlated drift; Commander can generate a detection specification feeding back to the SIEM/SOAR team; Commander can open an External Attack Correlation case tracking the incident's relationship to estate posture. Commander cannot triage the incident itself.

**Test case 2: A customer asks Commander to remove a user's access because Verdict Pattern case fires.** Commander cannot do this directly. Commander can surface the pattern, route the case to Internal Risk, recommend remediation. The customer's identity team executes the access removal through their normal authority. If Commander has push authority for identity actions (per the existing Push doctrine), the access removal is a controlled push action with approval — but the *investigation and decision* remain customer-owned.

**Test case 3: A customer asks Commander to push a Sentinel detection rule directly.** Commander cannot do this. Commander generates a detection specification (platform-agnostic) and dispatches it via ITSM to the SIEM/SOAR engineering team. The team translates and deploys. Commander does not write to Sentinel.

**Test case 4: A customer asks Commander to replace their TIP.** Commander cannot do this. Commander consumes from TIPs as Class D Threat Intelligence connectors. If a customer has no TIP, Commander provides estate-relevant threat filtering and matching, which is a subset of TIP functionality — not a replacement. The customer should keep their TIP if they have one.

**Test case 5: A customer asks Commander to run their compliance attestation workflow.** Commander cannot do this. Commander provides continuous compliance posture measurement, evidence pack generation, and framework mapping. The attestation workflow itself — the formal sign-off, the auditor engagement, the certification renewal — is owned by GRC platforms and the customer's GRC team.

These test cases are doctrine. They should be referenced when build decisions, sales conversations, or product feature requests test the boundary.

## 11. The Patent Position

The SDR patent covers the closed-loop control system for security drift across heterogeneous estates. The patent is associated with the SDR operational discipline (Layer 2 from Section 3), not with the Security C2 category (Layer 1) or the Commander platform brand (Layer 3).

The v2.6 release does not alter the patent claim. New v2.6 capabilities (Intelligence Layer, OODA loop, Operating Pictures, pre-warned classification, inverse discovery, verdict semantics) are implemented as extensions of the existing SDR architecture and are subordinate to the existing patent. A continuation patent application may be appropriate for specific v2.6 innovations — particularly the multi-class connector contract, the verdict semantics framework, the inverse discovery loop, and the pre-warned/protected/novel classification — and is a separate workstream from this doctrine.

## 12. Operational Implications of Security C2 Position

The Security C2 position has implications across multiple operational dimensions:

**Sales conversations.** Commander does not compete with the customer's existing security stack. Sales engagements should frame Commander as additive — sitting above what the customer already has, integrating it under unified command. Procurement conversations should emphasise that no existing tooling needs to be retired or replaced.

**Pilot framing.** Pilot success criteria should be framed around what Commander uniquely produces — the pre-warned classification, the OODA tempo measurement, the dual operating pictures, the silent defence reporting. Not around feature parity with categories below Commander (which would lose the altitude).

**Demos.** Demos should lead with the integration story (the four intelligence streams, the unified operating picture) rather than feature-by-feature comparisons against posture management or SIEM. The category claim is the demo opener.

**Partnerships.** Partnerships with vendors in the categories beneath Commander (SIEM, EDR, posture, GRC, TIP) are structurally compatible. Commander does not threaten those vendors' positions — it provides them with a customer who is more committed to their tools, because Commander makes their tools more valuable by integrating them.

**Acquisition risk.** Commander's position above the stack makes it a potential acquisition target for any vendor wanting to elevate from a single-category position to a platform position. This is upside for the company and is a strategic consideration outside this specification.

## 13. Acceptance Criteria

The Security C2 doctrine is correctly implemented when:

- The Master Proposition opening sentence claims Security Command and Control as the category.
- All v2.6 specs subordinate to this doctrine reference it consistently.
- Product surfaces use the C2 vocabulary in documentation and labelling where appropriate (the UI doctrine in Spec #41 v2.6 specifies how).
- Sales and marketing material distinguishes Layer 1 (category), Layer 2 (SDR operational discipline), Layer 3 (platform).
- Customer-facing documentation explicitly states the boundary with existing categories.
- Analyst briefings position Commander as a category-defining play in Security C2.
- Build decisions across all v2.6 specs respect the boundary discipline in Section 5.
- The five structural capabilities in Section 6 are visible and demonstrable in the product.

## 14. Audit Events

The following audit events are generated relating to this doctrine:

- `C2_DOCTRINE_PUBLISHED` — when this specification is published or amended.
- `C2_BOUNDARY_TESTED` — when a build decision or product change is evaluated against the boundary discipline.
- `C2_BOUNDARY_VIOLATION_FLAGGED` — when a proposed change is identified as potentially crossing the boundary discipline.
- `C2_BOUNDARY_VIOLATION_RESOLVED` — when a flagged violation is resolved (either by re-scoping the change or by formal doctrine update).

These audit events flow through the existing audit infrastructure per Spec #19 (RBAC Permission Matrix).

## 15. Relationship to Other v2.6 Specifications

- **Spec #58 (Security OODA Loop)** — defines the operational tempo framework within Security C2.
- **Spec #59 (Intelligence Layer Architecture)** — defines the four-stream integration layer that is one of the five structural capabilities of Security C2.
- **Spec #60 (Internal and External Attack Surface Framework)** — defines the dual surface model that is one of the five structural capabilities of Security C2.
- **Spec #61 (Universal Security Signal Connector Contract)** — defines the multi-class connector architecture that supports Security C2's integration claim.
- **Spec #62 (Verdict Semantics)** — defines the treatment of operational tool verdicts that supports the silent defence story.
- **Specs #65-#75** — define the surfaces, classifications, loops, and case types that operationalise Security C2.

## 16. Versioning and Supersession

This is v1.0 of the Security Command and Control Doctrine. Future versions will be issued under the v2.6+ baseline with full version history. The doctrine itself is structural and is expected to remain stable across multiple baseline increments — minor revisions may clarify or extend, but the category position is foundational.

This specification does not supersede any v2.5.2 specification. It introduces a new doctrinal layer that all subordinate specifications operate within.
