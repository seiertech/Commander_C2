> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #60 — Internal and External Attack Surface Framework Specification

**Document ID:** `60_Internal_and_External_Attack_Surface_Framework_Spec.md`
**Spec:** 60
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Foundational Framework
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture
**Phase:** v2.6 — Conceptual framework distinguishing external attack surface from internal attack surface, driving dual operating pictures and dual response models.

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `58_Security_OODA_Loop_Specification.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `00_AUTHORITY_AND_PRECEDENCE_v2_6.md`

**Subordinate specifications affected:** Spec #65 (External Operating Picture), Spec #66 (Internal Operating Picture), Spec #71 (Pre-Warned Classification), Spec #75 (Internal Risk Investigation Sub-Lifecycle), Spec #08 v2.6 (Case Management — case types differ by surface), Spec #31 v2.6 (Routing — routing rules differ by surface).

## 1. Status

This is binding doctrine. It defines the dual attack surface model that v2.6 introduces: external attack surface (where external threat actors operate) and internal attack surface (where internal actors operate). The framework drives the dual operating pictures, the case type differentiation, the routing model differentiation, and the boundary discipline between Commander and the customer's insider risk programme.

## 2. Doctrine Statement

Commander recognises **two distinct attack surfaces** in every estate. Both surfaces are real. Both are continuously under pressure. Both require dedicated intelligence and dedicated operational response. No existing security platform integrates both surfaces under unified command — operational tools see slices of one or the other, but Commander integrates the full picture across both.

The dual surface model is one of the five structural capabilities of Security Command and Control (per Spec #57 Section 6.4). It is also one of the architectural reasons no competitor can replicate Commander's category position without rebuilding their architecture — every major security platform was designed for one surface or the other, not both.

## 3. The External Attack Surface

**Definition:** Everything external to the estate that can be touched by external threat actors. The surface includes:

- Internet-facing services (web applications, APIs, public-facing infrastructure)
- Exposed network ports and protocols
- Public DNS and email infrastructure
- Partner integrations and B2B API gateways
- Cloud-provider-exposed services
- Federated identity boundaries (external identity providers, social login)
- OAuth consent boundaries (third-party applications granted access)
- Supply chain dependencies (software, hardware, service dependencies)
- Third-party-hosted services accessible to the customer's users

**Threat actors:** External adversaries operating from outside the estate. Nation-state actors, cybercriminal groups, hacktivists, opportunistic attackers, automated botnets, supply chain attackers, and authorised third parties acting outside their authority.

**Attack patterns observed:** Phishing campaigns, vulnerability exploitation, credential stuffing, lateral movement from initial compromise, exfiltration after compromise, supply chain attacks, third-party compromise.

**Detection layer:** Primarily the SOC stack — SIEM, EDR, NDR, email security from the perspective of inbound external threats, incident response platforms. When external threat actors operate, the SOC stack detects and responds.

**Commander's data sources:** External Attack Intelligence stream (Spec #59) sourced from Class A SOC Telemetry Connectors (Spec #61). Commander consumes case and detection signal from SOC platforms read-only.

## 4. The Internal Attack Surface

**Definition:** Everything internal to the estate that can be acted on by internal actors. The surface includes:

- Files, documents, and data accessible to internal users
- Applications and services internal users can interact with
- Identities and their access privileges
- Configurations users can modify (where authorised or otherwise)
- Devices users operate (and may misuse)
- Network resources users access (and may misuse)
- SaaS applications users authenticate to
- Email channels users send through

**Threat actors:** Internal actors operating within the estate. Three categories:

- **Malicious internal actors** — insiders with intent to harm the organisation (data theft, sabotage, espionage on behalf of external parties)
- **Negligent internal actors** — insiders whose convenience-driven, security-policy-ignorant, or lazy practices create risk (downloading from unapproved sources, installing unauthorised software, sharing credentials, bypassing controls)
- **Compromised internal actors** — insiders whose credentials or devices have been taken over by external actors, who are now operating internally on behalf of the external attacker (often indistinguishable from malicious insiders without forensic investigation)

**Activity patterns observed:** Policy violations, abnormal access patterns, anomalous data movement, geographic anomalies (impossible travel), behavioural divergence from peers, attempts to bypass security controls, unauthorised software installations, unauthorised SaaS application use.

**Detection layer:** The operational verdict layer — email security verdicts on internal users' outbound mail, DLP verdicts on internal file movement, web filtering verdicts on internal browsing, conditional access verdicts on internal authentication attempts, MDM verdicts on internal device behaviour, endpoint compliance verdicts on what internal users are running. When internal actors operate, the operational verdict layer fires.

**Commander's data sources:** Internal Behavioural Intelligence stream (Spec #59) sourced from Class B Operational Verdict Connectors (Spec #61). Commander consumes verdict signal from operational tools.

## 5. Why the Distinction Matters

The two surfaces require different security thinking, different response patterns, different ownership models, and different governance frameworks:

### 5.1 Different Thinking

External attack defence is about *raising the cost of attack*. The defensive posture aims to make external attack expensive enough that the attacker fails, gives up, or chooses a softer target. Defence in depth, segmentation, hardening, patching, monitoring — all are defensive thinking against an adversary who chooses to attack.

Internal actor defence is about *preserving organisational trust and detecting violation*. The defensive posture assumes that internal actors are trusted by default and that violations of trust require detection and intervention. Policy enforcement, behavioural monitoring, access reviews, separation of duties — all are governance thinking applied to a population presumed cooperative.

A SIEM is built for external threat detection. An insider risk platform is built for internal actor detection. The two have fundamentally different tuning, fundamentally different signal-to-noise expectations, fundamentally different response patterns. Commander integrates both without conflating them.

### 5.2 Different Response Patterns

**External response is engineering work.** When an external attack lands, the closed loop drives:
- Remediation of the drift that allowed the attack
- Restoration of degraded controls
- Detection specification dispatch to the SOC engineering team for ongoing monitoring
- Architectural improvements to prevent recurrence
- Audit trail of what Commander knew when the attack landed

The work routes to security architecture, push operations, SOAR engineering, platform teams. The response is technical.

**Internal response is investigation work.** When an internal verdict pattern crosses a threshold, the closed loop drives:
- Surfacing of the pattern (not the determination of intent)
- Classification of the pattern by sub-type
- Routing to the customer's Internal Risk function
- Tracking of investigation outcome
- Maintenance of audit trail

The work routes to identity analysts, the customer-configured insider risk programme, potentially HR and Legal. The response is investigative, often delicate, often subject to employment law constraints.

### 5.3 Different Ownership

External attack response is owned by the customer's security operations function — SOC, security engineering, security architecture. The chain of command is well-established and technical.

Internal actor investigation is owned by a different function — increasingly a dedicated Insider Risk team, but historically a mix of SOC, HR, Legal, Compliance, and Investigations. The chain of command is less established and crosses organisational boundaries.

Commander surfaces both, but routes them to different organisational owners. Spec #31 v2.6 (Routing Model) defines the routing rules; Spec #75 (Internal Risk Investigation Sub-Lifecycle) defines the boundary discipline for internal investigations.

### 5.4 Different Governance

External attack data is operational security data. It carries standard security data governance — retention per policy, RBAC, audit trail.

Internal Behavioural Intelligence data carries additional governance because it relates to identifiable user activity. Jurisdiction-specific employee monitoring law applies (GDPR Article 88, German Works Council provisions, French employee monitoring requirements, US state-level employee surveillance laws). Configurable thresholds, RBAC restrictions, audit-of-access, and tenant-level disable options are all required (Spec #59 Section 8 governance summary; Spec #75 detail).

## 6. The Two Operating Pictures

Commander provides two paired operational surfaces:

### 6.1 External Operating Picture (Spec #65)

The battlefield view of external attack activity against the estate. Composition:

- Estate posture as the base map (estate zones with asset density, drift indicators, coverage state)
- Attacks landing as foreground overlay (crosshair markers on affected entities)
- Attack chains crossing zones (when SOC cases indicate multi-stage attacks)
- Pre-warned and protected classification (amber rings vs blue rings — Spec #71)
- Control weakness correlation to active cases (which exploited controls drove which attacks)
- Case Response Board (recent SOC cases with severity, status, assignee — "Commander observes · SOC owns" attribution)
- Detection layer verdict density (where the stack is firing across zones)

Primary personas: CISO, SOM, Security Architect, Security Analyst.

### 6.2 Internal Operating Picture (Spec #66)

The parallel surface showing internal actor behavioural patterns. Composition:

- Same estate base map (consistent navigation)
- Verdict density overlay (heat zones showing where operational verdicts are firing)
- Behavioural anomaly highlighting (identities whose verdict patterns are diverging from peers)
- Identity Risk Pattern visualisation (which identities are exhibiting concerning behaviour patterns)
- Policy effectiveness indicators (policies with high override rates or anomalous fire rates)
- Geographic anomaly markers (impossible travel, restricted geography access attempts)
- Policy Effectiveness Direction Board (Spec #70 — policies needing review)

Primary personas: CISO, SOM with Internal Risk authority, Security Analyst, Identity/Access Specialist with Internal Risk authority.

### 6.3 Visual Distinction

The two pictures share visual conventions where appropriate (the same estate decomposition, the same drill paths into Identity and Asset Intelligence Surfaces) and differ visually where required.

**External Operating Picture visual language:**
- Crosshair-and-ring conventions for attack overlay
- Red emphasis for active attack activity
- Amber rings for pre-warned classification
- Blue rings for protected classification
- Attack chain lines crossing zones
- SOC case feed with state machine indicators

**Internal Operating Picture visual language:**
- Heat density conventions for verdict aggregation
- Amber-through-violet gradient for verdict intensity (deliberately different from external red)
- Behavioural divergence markers (peer-deviation visualisation)
- Geographic markers for location anomalies
- Policy effectiveness indicators

The visual distinction is deliberate. The CISO toggling between the two surfaces knows immediately which surface they're looking at. The two pictures are complementary but visually distinct.

The full visual language is specified in Spec #41 v2.6 (Military Intelligence UI Doctrine — Operating Picture conventions) and the surface specifications (Spec #65, Spec #66).

## 7. Case Type Differentiation by Surface

The case taxonomy (Spec #08 v2.6) differentiates by attack surface:

**External attack surface cases:**
- **Drift case** (existing) — external posture finding
- **Vulnerability case** (existing) — CVE-driven finding
- **Exposure case** (existing) — internet-facing exposure
- **Coverage case** (existing) — control coverage gap
- **External Attack Correlation case** (new in v2.6) — SOC case bound to Commander entities with pre-warned classification

**Internal attack surface cases:**
- **Verdict Pattern case** (new in v2.6) — internal behavioural pattern crossing threshold

**Cross-surface cases:**
- **Identity case** (existing) — technical identity findings (privilege drift, access drift, stale account)
- **Tool Health case** (existing) — connector or tool issue affecting either surface
- **Threat Intelligence Estate Match case** (existing) — external intel matching estate
- **Inverse Discovery (Coverage Blindspot) case** (new in v2.6) — entity reference Commander didn't know about, from either surface
- **Policy Effectiveness case** (new in v2.6) — policy issue affecting either surface
- **OODA Tempo Degradation case** (new in v2.6) — Commander's own operational health, affecting both surfaces

The case type a finding resolves to is determined by:

- Where the signal came from (which intelligence stream)
- What the finding is about (asset condition vs identity behaviour vs policy state)
- Who owns the response (technical remediation vs investigation)

## 8. Routing Differentiation by Surface

The routing model (Spec #31 v2.6) routes cases differently by surface:

**External attack surface routing:**
- External Attack Correlation cases → Security Analyst, Security Architect
- Drift, Vulnerability, Exposure, Coverage cases → existing v2.5.2 routing per domain owner

**Internal attack surface routing:**
- Verdict Pattern cases → Internal Risk role (new in v2.6)
- Internal Risk role escalates to customer-configured insider risk programme

**Cross-surface routing:**
- Identity cases → Identity/Access Specialist (existing)
- Tool Health cases → Platform Engineering (existing)
- Policy Effectiveness cases → Policy Owner role (new in v2.6 — sub-routed by policy domain)
- Inverse Discovery cases → Platform Owner or Security Architecture depending on root cause
- OODA Tempo Degradation cases → SOM or appropriate phase owner

## 9. The Dual OODA Response Model

The Security OODA Loop (Spec #58) runs across both attack surfaces simultaneously. The Observe phase consumes signal from both surfaces. The Orient phase produces classifications relevant to both surfaces. The Decide phase generates remediation appropriate to each surface. The Act phase executes through appropriate channels.

The dual response model means:

- A single OODA cycle may produce both an External Attack Correlation case (remediation work) and a Verdict Pattern case (investigation work) when an attack correlates to internal actor activity (e.g. external phishing succeeded against a user who also has elevated DLP verdict pattern — both surfaces fired)
- Commander surfaces both outputs through their respective Operating Pictures and case types
- The customer's organisation responds through different functions (security engineering for External Attack Correlation, Internal Risk for Verdict Pattern)
- Commander tracks both responses through the closed-loop lifecycle with separate validation and closure gates

## 10. The Boundary with the SOC (External Surface)

For the external attack surface, Commander's boundary with the SOC is binding:

- Commander never triages SOC cases
- Commander never runs incident response
- Commander never executes against SOC platforms
- Commander provides estate context (pre-warned classification, correlated drift) via the External Attack Correlation case type
- Commander generates detection specifications outbound to the SOC engineering team

The full SOC boundary is specified in Master Proposition v5.0 Section 25 and reinforced in Spec #57 (Security C2 Doctrine) Section 5.

## 11. The Boundary with Insider Risk Programmes (Internal Surface)

For the internal attack surface, Commander's boundary with insider risk programmes is binding:

- Commander surfaces behavioural patterns, does not investigate
- Commander does not determine intent
- Commander does not initiate disciplinary or legal action
- Commander holds intelligence-grade evidence, not investigation-grade evidence
- The customer's Internal Risk function owns the investigation

The full Insider Risk boundary is specified in Master Proposition v5.0 Section 26 and in Spec #75 (Internal Risk Investigation Sub-Lifecycle).

## 12. Asset Auto-Positioning Across Surfaces

Every asset, identity, application, and service in the canonical estate model has implicit positioning relative to the two attack surfaces:

- **External-facing entities** — internet-facing services, exposed APIs, public DNS, B2B integrations. These are primarily on the external attack surface.
- **Internal-only entities** — internal applications, internal data stores, internal devices, internal identities. These are primarily on the internal attack surface.
- **Boundary entities** — federation gateways, OAuth consent boundaries, partner integrations. These straddle both surfaces.

The positioning is auto-detected from connector signal where possible (e.g. a service marked as internet-facing in a CSPM connector, a network device exposed to the internet per firewall configuration) and enriched by the architect during onboarding for ambiguous cases.

The positioning feeds the Operating Pictures (entities are visible on the appropriate Picture for their primary surface) and the priority engine (attacks on external-facing entities carry different urgency than activity on internal-only entities).

## 13. Configurability

The Internal and External Attack Surface Framework exposes the following configurable parameters per tenant (Spec #55 v2.6):

- Asset auto-positioning rules (which connector signals indicate external-facing vs internal-only)
- Manual override of auto-positioning for specific entities
- Surface-specific RBAC scopes (who sees External Operating Picture vs Internal Operating Picture)
- Surface-specific case visibility (particularly for Verdict Pattern cases on the internal surface)
- Cross-surface correlation enable/disable

System defaults are shipped. Baseline configuration profiles (Spec #55) cover surface configuration for industry segments.

## 14. Audit Events

- `ATTACK_SURFACE_POSITIONING_COMPUTED` — when entity surface positioning is determined or updated
- `EXTERNAL_OPERATING_PICTURE_ACCESSED` — when External Operating Picture is queried
- `INTERNAL_OPERATING_PICTURE_ACCESSED` — when Internal Operating Picture is queried (specifically audited for governance)
- `CROSS_SURFACE_CORRELATION_GENERATED` — when an event correlates across both surfaces (rare but significant)
- `SURFACE_CONFIGURATION_CHANGED` — when surface-related tenant configuration is modified

## 15. Acceptance Criteria

The Internal and External Attack Surface Framework is correctly implemented when:

- Both Operating Pictures (External and Internal) are functional and visually distinct
- Case types are correctly differentiated by surface in Spec #08 v2.6 implementation
- Routing model differentiates by surface in Spec #31 v2.6 implementation
- Asset auto-positioning operates from connector signal with override capability
- RBAC restricts Internal Operating Picture access to authorised personas
- The dual OODA response model operates (both surfaces consumed by Observe, classified in Orient, decided in Decide, acted on in Act)
- The SOC boundary holds (no incident triage, no incident response)
- The Insider Risk boundary holds (no investigation, no intent determination, no disciplinary action)
- Configurability is exposed via Tenant Admin with system defaults shipped
- Audit events flow to the audit infrastructure

## 16. Relationship to Other v2.6 Specifications

- **Spec #57 (Security Command and Control Doctrine)** — dual attack surface is one of the five structural capabilities of Security C2
- **Spec #58 (Security OODA Loop)** — OODA runs across both surfaces
- **Spec #59 (Intelligence Layer Architecture)** — defines the four streams that feed both surfaces
- **Spec #61 (Universal Security Signal Connector Contract)** — Class A connectors feed External; Class B connectors feed Internal
- **Spec #65 (External Operating Picture)** — the external surface
- **Spec #66 (Internal Operating Picture)** — the internal surface
- **Spec #71 (Pre-Warned/Protected/Novel Classification)** — classification on the external surface
- **Spec #75 (Internal Risk Investigation Sub-Lifecycle)** — governance on the internal surface
- **Spec #08 v2.6 (Case Management)** — surface-differentiated case taxonomy
- **Spec #31 v2.6 (Routing Model)** — surface-differentiated routing
- **Spec #41 v2.6 (Military Intelligence UI Doctrine)** — visual language for both surfaces

## 17. Versioning and Supersession

This is v1.0 of the Internal and External Attack Surface Framework. The dual surface model is structural and is expected to remain stable across baseline increments. Surface definitions, threat actor categorisation, and routing rules may evolve as pilot data informs refinement.

This specification does not supersede any v2.5.2 specification. It introduces a conceptual framework that drives the differentiation of new v2.6 surfaces (Operating Pictures), new v2.6 case types, and new v2.6 routing rules without altering the existing v2.5.2 case lifecycle, routing model, or surface conventions.
