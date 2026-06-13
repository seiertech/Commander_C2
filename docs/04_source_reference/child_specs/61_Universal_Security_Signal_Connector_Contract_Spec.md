> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #61 — Universal Security Signal Connector Contract Specification

**Document ID:** `61_Universal_Security_Signal_Connector_Contract_Spec.md`
**Spec:** 61
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Foundational Connector Architecture
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture
**Phase:** v2.6 — Four-class connector architecture with multi-class declaration, eight signal purposes, conformance tier system.

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `58_Security_OODA_Loop_Specification.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `60_Internal_and_External_Attack_Surface_Framework_Spec.md`
- `62_Verdict_Semantics_Specification.md`
- `00_AUTHORITY_AND_PRECEDENCE_v2_6.md`

**Subordinate to:** Spec #05 (Data Connector Normalisation Implementation), Spec #09 (Connector Architecture), Spec #12 (SDR Normalisation Strategy), Spec #23 (Security Tool Intelligence), Spec #24 (Connector API Reference Framework). This spec extends those v2.5.2 specs with the four-class architecture and multi-class declaration.

**Reference inputs governed by:** `docs/03_api_specs/API_SPEC_INTAKE_RULES.md`, catalogued in `docs/03_api_specs/INDEX.md`.

## 1. Status

This is binding architecture. It defines the four-class connector model that v2.6 introduces, the multi-class declaration pattern that allows a single connector to fulfil multiple class contracts, the eight signal purposes that every connector pulled signal resolves to, the conformance tier system per class, and the integration with the Intelligence Layer (Spec #59) and Verdict Semantics framework (Spec #62).

## 2. Architectural Statement

Commander's v2.6 connector architecture is organised into **four connector classes** by signal purpose. A connector belongs to one or more classes based on what it produces. Each class has its own contract, its own conformance tier system, its own engineering team responsibility, and its own integration with the Intelligence Layer.

The four-class model replaces no v2.5.2 connector capability — it organises existing connectors and new v2.6 connectors under a unified taxonomy. Existing v2.5.2 connectors continue to operate; they are now classified per the four-class model and may declare against additional classes as their capabilities are extended (notably CrowdStrike Falcon and Microsoft Sentinel extending into Class A case-level pull, and Darktrace extending into Class B Antigena verdict pull).

## 3. The Eight Signal Purposes

Every piece of data Commander pulls from any source resolves into one or more of eight signal purposes. The eight purposes are exhaustive — every connector signal flows into one of these purposes for downstream processing.

### 3.1 Configuration Signal

**Definition:** The intended state of a control, asset, identity, or policy as the source system records it.

**Examples:**
- Intune device policy configurations
- IAM role assignments and permission grants
- Firewall rule sets
- Conditional access policy definitions
- MFA enforcement settings per identity
- EDR sensor configurations
- DLP policy rules

**Downstream destination:** Drift detection engine. Commander compares configuration signal against architectural baseline to compute drift findings.

### 3.2 State Signal

**Definition:** The actual operational state of something at a point in time.

**Examples:**
- Asset last-seen timestamp
- Sensor health status
- Last patch date
- Current licence status
- User account active/disabled state
- Connector freshness
- Service availability

**Downstream destination:** Platform-health and coverage engines.

### 3.3 Verdict Signal

**Definition:** A security decision a tool made about a thing — block, allow, quarantine, coach, require-MFA, require-compliant, monitor, alert.

**Examples:**
- Antigena Email blocking decisions
- Intune compliance verdicts
- Zscaler URL block decisions
- Conditional Access denial decisions
- DLP enforcement decisions
- EDR prevention actions

**Downstream destination:** Internal Behavioural Intelligence stream (Spec #59), External Operating Picture overlay (Spec #65), Internal Operating Picture overlay (Spec #66), Pre-Warned classification (Spec #71), Silent Defence Reporting (Spec #73). Verdict semantics framework specified in Spec #62 governs treatment.

### 3.4 Detection Signal

**Definition:** An asserted security event that has not yet been resolved — something the tool noticed and flagged for attention but did not act on (or acted on inconclusively).

**Examples:**
- EDR detections (when not promoted to incidents)
- NDR model breaches
- SIEM alerts before they become cases
- Anomalous sign-in flags
- Behavioural alerts from any tool

**Downstream destination:** External Attack Intelligence stream (Spec #59), priority engine attack-context input (Spec #74).

### 3.5 Case Signal

**Definition:** A managed investigation workflow — a thing the SOC owns, with a state machine, an assignee, a severity, a status, a disposition over time.

**Examples:**
- SIEM incidents (Sentinel, Splunk ES, QRadar)
- SOC platform cases (Google SecOps, XSIAM)
- XDR investigations (CrowdStrike Falcon, Defender XDR, SentinelOne)
- MDR service tickets

**Downstream destination:** External Attack Intelligence stream (Spec #59), External Operating Picture (Spec #65), External Attack Correlation case type (Spec #08 v2.6).

### 3.6 Inventory Signal

**Definition:** The existence of an entity.

**Examples:**
- Asset discovery results
- Identity directory entries
- Application catalogues
- Network device inventories
- Cloud resource lists

**Downstream destination:** Canonical entity model. Drives entity onboarding and the matching engine.

### 3.7 Behavioural Signal

**Definition:** Aggregate behavioural summaries about an entity — risk scores, anomaly counts, dormancy flags, privilege escalation patterns. Tool-computed risk indicators.

**Examples:**
- Per-identity risk scores from identity platforms
- Per-asset behavioural risk from EDR
- Anomaly counters from NDR
- Sign-in risk scores from Entra ID Protection
- User and Entity Behavioural Analytics (UEBA) outputs

**Downstream destination:** Risk scoring engine (existing v2.5 summary counter framework, extended for v2.6). Aggregates as inputs to Identity Intelligence Surface (Spec #68) and Asset Intelligence Surface (Spec #69).

### 3.8 Threat Signal

**Definition:** External intelligence about threats relevant to the estate.

**Examples:**
- CVE feeds and KEV updates
- IOC streams
- Vendor advisories
- Threat actor attribution
- OSINT and partner intelligence

**Downstream destination:** External Threat Intelligence stream (Spec #59). Estate-matching engine joins threat signals to canonical entities.

## 4. The Four Connector Classes

The eight signal purposes are organised into four connector classes based on what kind of platform produces them and what kind of engineering work the connector requires.

### 4.1 Class A — SOC Telemetry Connector

**Signal purposes consumed:** Case Signal, Detection Signal.

**Platforms in class:**
- SIEM platforms (Microsoft Sentinel, Splunk Enterprise Security, IBM QRadar)
- SOC platforms (Google SecOps/Chronicle, Palo Alto XSIAM)
- XDR platforms (CrowdStrike Falcon, Microsoft Defender XDR, SentinelOne, Elastic Security, Rapid7 InsightIDR)
- NDR platforms with case/detection workflow (Darktrace, Vectra AI, ExtraHop Reveal(x))

**Connector contract requirements:**
- Authentication: OAuth2 preferred, API key acceptable, token-based for legacy platforms
- Polling cadence: configurable per platform (default 30-60 seconds for real-time, 5-15 minutes for batch)
- Webhook support: where vendor-supported, preferred for real-time
- Rate limit handling: exponential backoff, queue management, freshness monitoring
- Entity extraction: vendor-specific payload parsing, entity reference extraction, canonical entity binding
- Normalisation: vendor cases/detections normalised to canonical case-signal and detection-signal shape
- Read-only enforcement: no write operations to source platform under any circumstance
- Audit trail: every pull operation logged with timestamp, status, payload size, rate-limit state

**Conformance tiers (per platform):**
- **Certified**: built, tested against vendor sandbox, conformance test suite running continuously, deployment validated in pilot
- **Full**: built, tested against customer data in pilot, vendor-specific tuning completed
- **Baseline**: built against vendor documentation, customer-specific tuning expected on deployment
- **Planned**: named in `docs/03_api_specs/INDEX.md`, not yet built

**v2.6 named platforms:** Microsoft Sentinel (Certified extension), Microsoft Defender for Endpoint (Certified — also Class B and Class C), Google SecOps/Chronicle (Certified), Splunk Enterprise Security (Full), CrowdStrike Falcon (Certified extension — also Class B and Class C), Rapid7 InsightIDR (Full), Darktrace extended (Full — also Class B).

**v2.6 Tier 2 named in schedule:** Palo Alto XSIAM, IBM QRadar, SentinelOne Singularity, Elastic Security, Vectra AI, ExtraHop Reveal(x).

### 4.2 Class B — Operational Verdict Connector

**Signal purposes consumed:** Verdict Signal (primary), Behavioural Signal (where vendor produces summary risk indicators).

**Platforms in class organised by sub-category:**

**Email security verdict platforms:**
- Darktrace Antigena Email
- Microsoft Defender for Office 365
- Mimecast
- Proofpoint
- Abnormal Security

**Endpoint compliance verdict platforms:**
- Microsoft Intune (compliance verdicts)
- Jamf Pro (compliance verdicts)
- VMware Workspace ONE (compliance verdicts)
- CrowdStrike Falcon prevention actions
- Microsoft Defender for Endpoint prevention actions

**Web and network verdict platforms:**
- Zscaler ZIA (Internet Access)
- Netskope
- Palo Alto Prisma Access / URL filtering
- Cisco Umbrella
- Darktrace network model breaches and Antigena Network actions

**Identity verdict platforms:**
- Microsoft Entra Conditional Access
- Okta authentication policies
- Microsoft Defender for Identity
- CrowdStrike Falcon Identity Protection

**Data protection verdict platforms:**
- Microsoft Purview DLP
- Symantec / Broadcom DLP
- Forcepoint DLP
- Code42 / Incydr (insider data movement verdicts)

**Connector contract requirements:**
- Authentication and polling cadence per Class A general pattern
- High-volume handling: verdict volume from a single tool can exceed hundreds of thousands per day in large estates
- Verdict semantics processing per Spec #62 (claims-not-facts, density aggregation, disagreement detection, trust calibration)
- Storage tiering: recent verdicts in hot storage for near-real-time correlation, older verdicts in summary form for trending
- Entity binding: verdict events bound to the affected identity, asset, file, or service per canonical model
- Policy reference: every verdict carries reference to the policy that fired
- Disposition tracking: verdict outcome (block, allow, quarantine, etc.) preserved through normalisation

**Conformance tiers:** Same four-tier system as Class A.

**v2.6 named platforms (initial set):** Darktrace Antigena Email (Certified), Microsoft Defender for Office 365 (Full), Microsoft Intune (Certified — extension), Zscaler ZIA (Full), Microsoft Entra Conditional Access (Full), Microsoft Purview DLP (Full), CrowdStrike Falcon prevention actions (Certified — same connector as Class A), Microsoft Defender for Endpoint prevention actions (Certified — same connector as Class A).

**v2.6 Tier 2 named in schedule:** Mimecast, Proofpoint, Jamf Pro, VMware Workspace ONE, Netskope, Palo Alto Prisma Access, Cisco Umbrella, Okta authentication policies, Microsoft Defender for Identity, Symantec/Broadcom DLP, Forcepoint DLP, Code42/Incydr.

### 4.3 Class C — Configuration State Connector

**Signal purposes consumed:** Configuration Signal (primary), State Signal, Inventory Signal.

**Definition:** The existing v2.5 connector universe extended. Class C connectors provide the intended state, actual operational state, and entity inventory data that drives drift detection, posture intelligence, and the canonical entity model.

**Platforms in class:** All v2.5.2 connectors continue as Class C connectors. The v2.5.2 connectors are:
- Identity: Microsoft Entra ID, Okta (multiple), Microsoft Graph Reports & Audit
- Collaboration: Microsoft Graph Core, Microsoft Graph Collaboration
- Endpoint Management: Microsoft Intune, CrowdStrike Falcon
- Security Tools: Microsoft Graph Security, Darktrace
- Vulnerability & Exposure: Tenable One, Tenable.io, Armis
- Network Security: Palo Alto Unified, Zscaler ZIA, Zscaler ZPA
- Cloud Infrastructure: AWS General, AWS Route 53

All v2.5.2 connector contracts continue to apply. The Class C classification adds taxonomy clarity without changing any v2.5.2 contract requirement.

**Connector contract requirements:** Per existing v2.5.2 Specs #05, #09, #12, #23, #24. No changes in v2.6.

### 4.4 Class D — Threat Intelligence Connector

**Signal purposes consumed:** Threat Signal.

**Platforms in class:**
- Commercial Threat Intelligence Platforms (Recorded Future, Anomali, ThreatConnect, where customer subscribes)
- OSINT feeds (MISP, vendor RSS, NVD)
- KEV feed (CISA Known Exploited Vulnerabilities)
- Vendor advisory feeds
- ISAC/ISAO sharing channels (where customer is member)
- Dark web monitoring services (where customer is subscribed)

**Connector contract requirements:**
- Authentication per platform requirements
- Pull cadence per source — KEV updates daily; commercial TIPs typically every 15-60 minutes; OSINT varies
- Estate-matching: incoming threat signals matched against canonical entity model
- Confidence handling: TIP-provided confidence scores preserved in canonical threat record
- Source attribution: every threat signal carries source identification
- Licensing compliance: respect source-specific redistribution rules

**Conformance tiers:** Same four-tier system.

**v2.6 named platforms:** KEV feed (Certified), generic OSINT/MISP (Full), commercial TIPs treated as Tier 2 named in schedule pending customer subscriptions.

## 5. Multi-Class Declaration

A single connector may declare against multiple connector classes. This is the architectural pattern that allows Commander to consume the full signal universe from each connected tool without proliferating connectors.

**Canonical example — Microsoft Defender for Endpoint:**

The Defender for Endpoint connector declares against:
- **Class A** — pulls incident-level and detection-level signal via Defender XDR API
- **Class B** — pulls prevention action verdicts (quarantine, isolation, block) via the same API
- **Class C** — pulls policy configuration state (ASR rules, EDR baselines, exclusion lists) via Microsoft Graph

One connector, three class declarations, three downstream pipelines. Engineering builds the connector once, conformance-tests against each class contract separately, and the connector schedule entry shows the conformance tier per class.

**Other multi-class examples:**

| Connector | Class A | Class B | Class C | Class D |
|---|---|---|---|---|
| Microsoft Sentinel | Certified (incident + detection) | — | Full (analytics rule config) | — |
| Microsoft Defender for Endpoint | Certified | Certified | Full | — |
| CrowdStrike Falcon | Certified | Certified | Full (policy config) | — |
| Darktrace | Full (model breach) | Full (Antigena Email + Network) | — | — |
| Microsoft Intune | — | Certified (compliance verdicts) | Certified (device policy) | — |
| Zscaler ZIA | — | Full (verdicts) | Full (URL categories, SSL inspection) | — |
| Microsoft Entra ID | — | Full (Conditional Access verdicts) | Certified (CA policy, MFA enforcement) | — |

**Multi-class declaration contract requirements:**

- Single connector implementation; multiple class outputs
- Separate conformance tiering per class
- Separate downstream pipelines per class (Class A → External Attack Intelligence stream; Class B → Internal Behavioural Intelligence stream; Class C → drift detection; Class D → External Threat Intelligence stream)
- Engineering team responsible for the connector handles all class declarations
- Connector registration in `docs/03_api_specs/INDEX.md` shows all declared classes with conformance tier per class

## 6. Connector Registration in `docs/03_api_specs/INDEX.md`

The v2.5.2 baseline introduced the `docs/03_api_specs/` reference-input tree governed by `API_SPEC_INTAKE_RULES.md` and catalogued in `INDEX.md`. The v2.6 release extends `INDEX.md` to capture the four-class declaration model:

**Each connector entry in `INDEX.md` includes:**

- Vendor name
- Module / product name
- Reference document file path (vendor API specification in `docs/03_api_specs/<category>/`)
- Class declarations (one or more of A, B, C, D)
- Conformance tier per class (Certified, Full, Baseline, Planned)
- Owning build pack
- Governing child specs
- Last review date

**New v2.6 category folders in `docs/03_api_specs/`:**

- `soc_telemetry/` — Class A platforms not already in v2.5.2 categories (e.g. Google SecOps, Splunk Enterprise Security, Rapid7 InsightIDR)
- `operational_verdict/` — Class B platforms where the verdict layer is the primary signal class (where Class C is the primary, the connector stays in its existing category like `endpoint_management/`)

The full updated `INDEX.md` is part of the v2.6 release.

## 7. Connector Conformance Test Suite

Every connector must have a conformance test suite that validates the connector against its declared class contracts. The test suite is a v2.6 architectural requirement that extends the existing v2.5 connector testing framework.

**Conformance test categories:**

- **Authentication test** — connector successfully authenticates against vendor API with configured credentials
- **Pull test** — connector successfully retrieves data for each declared signal purpose
- **Normalisation test** — pulled data normalises to canonical shape correctly
- **Entity binding test** — entity references in pulled data resolve to canonical entities
- **Rate limit test** — connector handles rate limiting per vendor specification without data loss
- **Error handling test** — connector handles API errors, network failures, malformed responses gracefully
- **Read-only enforcement test** — connector cannot perform write operations on source platform (especially for Class A SOC Telemetry)
- **Audit trail test** — every operation produces correct audit events

**Test cadence:**

- **Certified tier connectors** — conformance test suite runs continuously against vendor sandbox APIs (where available) and against customer data in production
- **Full tier connectors** — conformance test suite runs in pilot environments
- **Baseline tier connectors** — conformance test suite runs at deployment
- **Planned tier connectors** — test suite specified but not yet executed

## 8. Connector Failure Modes and Handling

The four-class architecture introduces additional failure modes that must be handled:

**Class A SOC Telemetry failure modes:**
- Vendor API rate limit exceeded → exponential backoff with freshness monitoring
- Vendor API deprecation → version-pinning with deprecation alerts
- SOC platform downtime → graceful degradation, freshness alerts, no signal loss

**Class B Operational Verdict failure modes:**
- Verdict volume surge (10x normal) → temporary storage scaling, density aggregation prioritisation
- Verdict volume drop (>80% reduction) → Tool Health case generated, possible connector issue or platform configuration change
- Verdict semantics confusion (vendor changed disposition values) → normalisation rules updated via versioned spec

**Class C Configuration State failure modes:**
- Per existing v2.5 connector framework

**Class D Threat Intelligence failure modes:**
- Feed source unavailable → graceful degradation, multiple feed redundancy where licensed
- Feed signal noise → estate-matching engine filters; configurable noise thresholds

All connector failures generate Tool Health cases via the existing Spec #08 case lifecycle, routed to platform engineering per Spec #31 v2.6 routing.

## 9. Read-Only Enforcement for External Signal

Class A and Class B connectors are read-only with respect to source platforms by default. This is binding doctrine:

- Commander never closes a SOC case in the SOC platform
- Commander never modifies a verdict in an operational tool
- Commander never writes to SIEM, XDR, EDR detection rules directly
- Commander never overrides DLP, Conditional Access, or any other policy enforcement
- Commander never deletes or hides data in source platforms

The read-only enforcement is implemented at the connector contract layer — Class A and Class B connectors are technically incapable of write operations under normal configuration.

**Exception path:** Push capability (Spec #14) operates separately from the read-only Class A/B connector flow. Push connectors are explicitly authorised, gated by approval, and reversible. Push capability is a separate architectural concept from signal ingestion. A connector may be both a Class A signal consumer and a push destination, but the push capability requires separate connector configuration, separate RBAC, and separate audit trail.

## 10. Connector Schedule and `INDEX.md` Integration

The named platforms per class are catalogued in `docs/03_api_specs/INDEX.md`. The v2.6 release updates `INDEX.md` to reflect the four-class model and the new v2.6 connectors.

**Initial v2.6 `INDEX.md` updates include:**

- New `soc_telemetry/` category with entries for Google SecOps, Splunk ES, Rapid7 InsightIDR, Microsoft Defender XDR
- New `operational_verdict/` category for platforms where verdicts are primary
- Class declaration column added per entry
- Conformance tier per class column added per entry
- Existing entries updated with their Class C declaration explicit, and Class A/B/D declarations added where applicable (e.g. CrowdStrike Falcon entry updated with A+B+C declarations)

The full updated `INDEX.md` is part of the v2.6 release.

The reference-input tree remains outside the binding precedence chain per v2.5.2 doctrine. The connector contract specified in this binding spec governs what connectors must do; the schedule of named platforms in `INDEX.md` governs which connectors exist at any baseline.

## 11. Configurability

The connector contract framework exposes the following configurable parameters per tenant (Spec #55 v2.6):

- Per-connector pull cadence (within vendor rate limit constraints)
- Per-connector enable/disable
- Per-class enable/disable (e.g. tenant may disable Class B Operational Verdict if jurisdiction requires)
- Per-connector RBAC scope
- Per-connector audit verbosity
- Verdict density aggregation windows (Spec #62 integration)
- Verdict trust calibration learning rate (Spec #62 integration)

System defaults shipped at build. Baseline configuration profiles (Spec #55) cover connector configuration for industry segments.

## 12. Audit Events

- `CONNECTOR_REGISTERED` — when a connector is registered for a tenant
- `CONNECTOR_CLASS_DECLARED` — when a connector declares against a class (one event per class declaration)
- `CONNECTOR_CONFORMANCE_TEST_EXECUTED` — every test suite execution with outcome
- `CONNECTOR_PULL_EXECUTED` — every pull operation (high volume, log-tier audit)
- `CONNECTOR_FAILURE` — every failure with classification
- `CONNECTOR_READ_ONLY_VIOLATION_BLOCKED` — if a connector ever attempts a write operation (should never occur in production but enforcement is logged)
- `CONNECTOR_CONFIGURATION_CHANGED` — when tenant configuration affects a connector

## 13. Acceptance Criteria

The Universal Security Signal Connector Contract is correctly implemented when:

- All connectors declare against one or more of the four classes
- Multi-class declaration is supported (single connector, multiple class outputs)
- Conformance tiers are tracked per class per connector
- Conformance test suite operates per the requirements in Section 7
- Read-only enforcement is in place for Class A and Class B
- The eight signal purposes are recognised by the normalisation layer
- Each signal purpose routes to its correct downstream destination
- `docs/03_api_specs/INDEX.md` accurately reflects connector class declarations and conformance tiers
- Configurability is exposed via Tenant Admin
- Audit events flow to the audit infrastructure

## 14. Relationship to Other v2.6 Specifications

- **Spec #57 (Security Command and Control Doctrine)** — connector architecture supports the integration claim of Security C2
- **Spec #58 (Security OODA Loop)** — connectors feed the Observe phase
- **Spec #59 (Intelligence Layer Architecture)** — connector classes map to intelligence streams (A → External Attack; B → Internal Behavioural; C → Posture; D → External Threat)
- **Spec #60 (Internal and External Attack Surface Framework)** — Class A signals feed the external surface; Class B signals feed the internal surface
- **Spec #62 (Verdict Semantics)** — defines the treatment of Class B Verdict Signal
- **Spec #65 (External Operating Picture)** — primary consumer of Class A signal output
- **Spec #66 (Internal Operating Picture)** — primary consumer of Class B signal output
- **Spec #71 (Pre-Warned Classification)** — depends on Class A and Class C signal joining
- **Spec #72 (Inverse Discovery Loop)** — fires when any class signal references an unknown entity
- **Specs #05, #09, #12, #23, #24 (v2.5.2 connector specs)** — extended by this spec without conflict

## 15. Versioning and Supersession

This is v1.0 of the Universal Security Signal Connector Contract. The four-class model is structural and is expected to remain stable across baseline increments. Class definitions, signal purposes, and conformance criteria may evolve as new platforms and signal types emerge.

This specification extends but does not replace v2.5.2 connector specifications. All v2.5.2 connectors continue to operate with their existing contracts; v2.6 adds the class taxonomy and the multi-class declaration pattern as additive architecture.
