> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #59 — Intelligence Layer Architecture Specification

**Document ID:** `59_Intelligence_Layer_Architecture_Spec.md`
**Spec:** 59
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Foundational Architecture
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture
**Phase:** v2.6 — Architectural construct integrating four intelligence streams into a unified Estate Intelligence Picture.

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `58_Security_OODA_Loop_Specification.md`
- `00_AUTHORITY_AND_PRECEDENCE_v2_6.md`

**Subordinate specifications affected:** Spec #61 (Connector Contract), Spec #62 (Verdict Semantics), Spec #65 (External Operating Picture), Spec #66 (Internal Operating Picture), Spec #68 (Identity Intelligence Surface), Spec #69 (Asset Intelligence Surface), Spec #71 (Pre-Warned Classification), Spec #72 (Inverse Discovery), Spec #73 (Silent Defence Reporting), Spec #75 (Internal Risk Investigation Sub-Lifecycle).

## 1. Status

This is binding architecture. It defines the Intelligence Layer as a load-bearing architectural construct in Commander v2.6, the four intelligence streams it integrates, the unified Estate Intelligence Picture it produces, the stream-level governance that applies, and the integration points with the OODA loop and case engine.

## 2. Architectural Statement

Commander operates an **Intelligence Layer** that integrates four distinct streams of intelligence about the estate and its threat environment. The Intelligence Layer is what makes Commander a *command and control* platform rather than a posture tool. Command and control platforms run on intelligence; the Intelligence Layer is Commander's G2 — the military analogue of the intelligence function within command operations.

The Intelligence Layer sits between the connector classes (which produce raw signal) and the surface layer (which consumes integrated intelligence). It is not a database. It is not a storage layer. It is the architectural locus where signal becomes understanding, where streams are normalised against the canonical estate model, where cross-stream correlation produces classifications, and where the Estate Intelligence Picture is composed.

## 3. The Four Streams

### 3.1 External Threat Intelligence

**Definition:** Intelligence about what's happening in the threat environment globally. Adversary activity, vulnerability disclosures, indicator-of-compromise feeds, advisory bulletins, attribution data.

**Sources:**
- OSINT feeds (open-source intelligence)
- CVE databases (NVD, vendor advisories)
- KEV (Known Exploited Vulnerabilities) updates
- IOC streams (commercial and OSINT)
- Threat actor attribution feeds
- Dark web monitoring (where licensed)
- Partner intelligence sharing (ISACs, ISAOs)
- Vendor threat intelligence services

**Connector class:** Class D — Threat Intelligence Connector (Spec #61).

**Stream output to Intelligence Layer:**
- Threat signals filtered for estate relevance (estate matching engine)
- Threat actor profiles relevant to the customer's industry, geography, technology stack
- CVE-to-estate matching with affected entity lists
- IOC-to-estate matching with affected entity lists
- KEV alerts on currently-exploited vulnerabilities in the estate

**Governance:**
- Ingested per source-specific data agreements
- Retention per source licensing terms
- Estate-matching results stored per tenant data retention policy
- No raw threat intelligence redistributed outside the customer's tenancy

### 3.2 External Attack Intelligence

**Definition:** Intelligence about what external adversaries are doing to this specific estate. Active attack activity observed by the customer's SOC stack, attempted attacks blocked by the SOC stack, attack campaigns affecting the estate.

**Sources:**
- SIEM platforms (Microsoft Sentinel, Splunk Enterprise Security, IBM QRadar)
- SOC platforms (Google SecOps/Chronicle, Palo Alto XSIAM)
- XDR platforms (CrowdStrike Falcon, Microsoft Defender XDR, SentinelOne, Elastic Security)
- NDR platforms (Darktrace, Vectra AI, ExtraHop Reveal(x))
- Other case/detection-producing platforms via Class A connector

**Connector class:** Class A — SOC Telemetry Connector (Spec #61).

**Stream output to Intelligence Layer:**
- Case signal — investigation workflows from SOC platforms with entities, status, severity, assignee, timestamps, MITRE mapping
- Detection signal — unresolved detections that haven't been promoted to cases (e.g. CrowdStrike detections not yet in incidents)
- Affected entity bindings — Commander entities referenced in SOC cases and detections
- Attack timeline data — temporal sequence of detections and case activity
- Attack pattern correlation — cases or detections that appear related (same actor, same TTP, same campaign)

**Governance:**
- Ingested read-only with respect to SOC operations
- No write operations to SOC platforms (Commander never triages, closes, or modifies SOC cases)
- Retention per customer's SOC data retention policy
- SOC platform remains the authority on case/detection content; Commander stores correlation metadata only
- The "Commander observes · SOC owns" attribution flows through all derived intelligence

### 3.3 Internal Behavioural Intelligence

**Definition:** Intelligence about what internal actors are doing. Policy verdicts fired by operational security tools in response to internal actor activity. Behavioural patterns across identities, devices, and policy categories.

**Sources:**
- Email security verdict platforms (Darktrace Antigena Email, Defender for Office 365, Mimecast, Proofpoint)
- Endpoint compliance verdict platforms (Intune, Jamf, Workspace ONE)
- Endpoint prevention verdict platforms (CrowdStrike, Defender for Endpoint, SentinelOne)
- Web filtering verdict platforms (Zscaler, Netskope, Palo Alto Prisma, Cisco Umbrella, Darktrace network)
- Identity policy verdict platforms (Entra Conditional Access, Okta policies, Defender for Identity, CrowdStrike Falcon Identity Protection)
- DLP enforcement verdict platforms (Microsoft Purview, Symantec, Forcepoint, Code42 Incydr)

**Connector class:** Class B — Operational Verdict Connector (Spec #61).

**Stream output to Intelligence Layer:**
- Verdict events — individual policy verdicts with disposition (block, allow, quarantine, coach, require-MFA, require-compliant, monitor)
- Verdict density aggregations — per identity, per asset, per policy, per time window
- Verdict disagreement detection — when multiple tools produce contradictory verdicts on the same entity
- Verdict trust calibration — per-tool trust weights tuned over time based on correlation with confirmed cases
- Behavioural anomaly detection — divergence of an identity's verdict pattern from peer-group baseline
- Policy effectiveness signals — override rates, fire rates, zero-fire anomalies

**Governance:**
- Subject to jurisdiction-specific regulation on employee monitoring (GDPR Article 88, German Works Council provisions, French employee monitoring requirements, US state-level employee surveillance laws)
- Configurable verdict pattern thresholds to align with local employee monitoring norms
- RBAC restrictions on Verdict Pattern case visibility (Spec #19 v2.6)
- Audit trail of who accessed verdict pattern data
- Tenant-level configuration to disable Internal Behavioural Intelligence ingestion if required by local law
- Detailed sub-lifecycle governance in Spec #75 (Internal Risk Investigation Sub-Lifecycle)

### 3.4 Posture Intelligence

**Definition:** Intelligence about the state of the estate itself. The output of Commander's own engines operating over configuration state, detecting drift, computing risk, analysing architecture, mapping access chains.

**Sources:**
- Drift detection engine output (~240 models across 13 domains)
- Risk scoring engine output
- Blast radius engine output
- Architecture intelligence engine output
- Identity chain computation output
- Coverage Control Model output
- BAS-derived exposure validation results

**Connector class:** Class C — Configuration State Connector (Spec #61) provides the input data; the engines produce the intelligence stream output.

**Stream output to Intelligence Layer:**
- Drift findings with severity, scope, root cause analysis
- Risk scores per entity (asset, identity)
- Blast radius computations per finding
- Architectural anti-patterns and design incongruences
- Identity access chains with privilege escalation paths
- Coverage gaps with severity and required-control specification
- Trust boundary identification
- Exposure validation outcomes from BAS

**Governance:**
- Generated internally by Commander; no external data agreements
- Retention per tenant's configured data retention policy
- Exposed per RBAC permissions
- Closed-loop case lifecycle applies (Spec #08)

## 4. Stream Normalisation and the Canonical Estate Model

All four streams flow through normalisation against the canonical estate model. The canonical model is the single source of truth for entities — assets, identities, applications, cloud accounts, services, data stores, network devices, business units, organisational entities. Every stream output binds to canonical entities; cross-stream correlation depends on consistent entity resolution.

**Normalisation pattern per stream:**

- **External Threat Intelligence:** threat signals bound to canonical entities via estate matching (CVE → affected assets, IOC → affected identities or networks, advisory → affected technology). Where the match is ambiguous, a `pending_resolution` state captures the uncertainty.
- **External Attack Intelligence:** SOC case/detection signals bound to canonical entities via entity extraction from SOC payload + canonical lookup. Where the entity referenced doesn't exist in Commander's model, the Inverse Discovery Loop (Spec #72) fires.
- **Internal Behavioural Intelligence:** verdict events bound to canonical entities (the identity the verdict was about, the asset involved, the policy that fired). Verdict density aggregations grouped by canonical entity references.
- **Posture Intelligence:** generated directly against canonical entities by Commander's engines, so binding is intrinsic.

The canonical model is specified in the existing v2.5.2 specifications (Spec #18 Unified Identity Architecture, Spec #22 Architecture Intelligence Engine, Spec #29 Universal Risk Object and Case Binding). The Intelligence Layer is a consumer of the canonical model, not an authority over it.

## 5. The Estate Intelligence Picture

Above the four streams sits the unified **Estate Intelligence Picture (EIP)** — the integration surface that joins all four streams into a single intelligence assessment of the estate at any moment in time.

The EIP is consumed by:

- **CISO executive surfaces** — Command Tempo Dashboard (Spec #67), External Operating Picture (Spec #65), Internal Operating Picture (Spec #66), Risk Trajectory views
- **SOM operational surfaces** — case queues, routing decisions, tactical priority dashboards
- **Security Analyst investigation surfaces** — Identity Intelligence Surface (Spec #68), Asset Intelligence Surface (Spec #69), threat hunting workflows
- **Risk Analyst risk modelling surfaces** — security debt views, identity risk concentration, asset risk trajectories
- **Security Architect design surfaces** — control gap analysis, blast radius visualisation, architecture intelligence views

Every dashboard, every report, every drill-down ultimately consumes from the same EIP. This is what makes Commander's surfaces coherent across personas — the same intelligence substrate, surfaced differently per role and per workspace.

The EIP is not a single dashboard. It is an architectural layer accessed by all the surfaces above it. The surfaces compose specific views from the EIP appropriate to their persona and purpose.

## 6. Cross-Stream Correlation

The Intelligence Layer produces several distinct cross-stream correlations that no individual stream contains:

### 6.1 Pre-Warned Classification

Joins External Attack Intelligence with Posture Intelligence. When a SOC case binds to a Commander entity, the Pre-Warned classification engine (Spec #71) looks up Commander's prior knowledge of that entity:

- Was there active drift on the entity at case open time? (pre-warned)
- Was there a known control gap or coverage deficit at case open time? (pre-warned)
- Was the entity considered fully protected at case open time? (protected)
- Is the classification too ambiguous to determine yet? (novel)

This three-way classification feeds the priority engine (Spec #28 v2.6), the External Operating Picture (Spec #65), and the audit trail. It is one of the structural capabilities of Security C2 (per Spec #57 Section 6.3).

### 6.2 Verdict Disagreement Detection

Joins multiple Internal Behavioural Intelligence sources. When multiple tools produce contradictory verdicts on the same entity at the same time, the disagreement is information:

- Tool A blocks, Tool B allows — investigate which is correct
- Email security flags, endpoint allows — possible novel TTP or policy mistuning
- DLP blocks, web filter allows — policy alignment issue

Disagreement detection generates Policy Effectiveness cases (Spec #08 v2.6) when patterns of disagreement emerge across an organisational scope.

### 6.3 Inverse Discovery

Joins External Attack Intelligence or Internal Behavioural Intelligence with the canonical estate model. When external signal references an entity Commander doesn't know about, the lookup failure is itself a finding (Spec #72). Inverse Discovery cases route to platform or architecture teams for entity onboarding.

### 6.4 Behavioural Anomaly Detection

Joins Internal Behavioural Intelligence with the identity model. An identity's verdict pattern across operational tools is compared against peer-group baseline (peers in the same role, department, location). Significant divergence generates Verdict Pattern cases (Spec #08 v2.6) routed to Internal Risk.

### 6.5 Threat Relevance Scoring

Joins External Threat Intelligence with Posture Intelligence. Threat actor profiles, CVE feeds, and KEV updates are scored against the estate's actual technology stack, exposure state, and existing drift. Estate-relevant threats elevate priority; estate-irrelevant threats are filtered out without bothering analysts.

### 6.6 Silent Defence Aggregation

Joins all Internal Behavioural Intelligence sources without correlation to specific findings. The aggregate picture of what the security stack did today — every block, every quarantine, every coach, every override. Surfaced via Silent Defence Reporting (Spec #73) without generating cases.

## 7. Integration with the OODA Loop

The Intelligence Layer is the substrate the Security OODA Loop runs on:

- **Observe** consumes from all four intelligence streams (signal intake)
- **Orient** processes streams into cross-stream correlations (drift detection, classification, anomaly detection, relevance scoring) — Posture Intelligence stream output is generated here
- **Decide** consumes the integrated Estate Intelligence Picture for decision generation (remediation, prioritisation, routing)
- **Act** produces validated state changes that feed back into the streams as fresh signal

The four phases and the four streams are orthogonal axes. Each OODA phase touches all four streams; each stream flows through all four phases over time.

## 8. Stream-Level Governance

Each intelligence stream has its own governance discipline, summarised here and detailed in subordinate specifications:

| Stream | Governance | Primary Concern |
|---|---|---|
| External Threat Intelligence | Source licensing, retention per agreement, estate-matching stored per tenant policy | Licensing compliance, data redistribution |
| External Attack Intelligence | Read-only from SOC, retention per SOC policy, no write-back | SOC authority preservation |
| Internal Behavioural Intelligence | Jurisdiction-specific employee monitoring law, RBAC, audit, tenant-level disable option | Employment law, data protection, employee privacy |
| Posture Intelligence | Tenant data retention, RBAC, closed-loop case lifecycle | Standard tenant data governance |

Internal Behavioural Intelligence carries the strictest governance because it relates to identifiable user activity. Customers deploying Commander in jurisdictions with strict employee monitoring frameworks should configure thresholds, RBAC, and disable conditions per local counsel guidance. Spec #75 (Internal Risk Investigation Sub-Lifecycle) details the access controls, evidence handling, and customer-owned investigation boundaries that apply.

## 9. The Identity and Asset Intelligence Surfaces

Two entity-centric surfaces consume from the Intelligence Layer to produce per-entity intelligence pictures:

**Identity Intelligence Surface (Spec #68):** For any identity, presents the unified intelligence picture — overview, access intelligence, behavioural intelligence (from Internal Behavioural Intelligence stream), threat intelligence (relevant external threats), case history (External Attack Correlation, Identity cases, Verdict Pattern cases), risk trajectory.

**Asset Intelligence Surface (Spec #69):** For any asset, presents the parallel picture — overview, configuration state (Posture Intelligence stream), verdict history (Internal Behavioural Intelligence stream), behavioural pattern, case history, vulnerability state, identity exposure.

Both surfaces are direct consumers of the Estate Intelligence Picture, filtered to the specific entity.

## 10. Stream Health Monitoring

Each intelligence stream has health monitoring integrated with the Observe phase of the OODA loop (Spec #58):

- **Stream freshness** — when was the most recent signal received per stream?
- **Stream volume** — is signal volume within expected range, or unusually low/high?
- **Stream coverage** — what fraction of the expected estate is producing signal?
- **Stream quality** — entity resolution success rate, classification confidence, correlation accuracy

Stream health degradation generates OODA Tempo Degradation cases routed to platform team or appropriate owner.

## 11. Verdict Semantics Integration

Internal Behavioural Intelligence depends heavily on the verdict semantics framework specified in Spec #62. Key integration points:

- Verdicts are treated as time-bound claims with confidence, not as ground truth
- Verdict density per entity is computed over configurable time windows
- Verdict disagreement across tools is surfaced as a meta-signal
- Verdict trust calibration tunes per-tool weights over time
- High-volume verdict storage is partitioned and tiered per Spec #62

The Intelligence Layer consumes the normalised verdict semantics output; the storage and computational mechanics are specified in Spec #62.

## 12. Inverse Discovery Loop

The Inverse Discovery Loop (Spec #72) is a special closed loop running on top of the Intelligence Layer. When any stream (External Attack, Internal Behavioural, External Threat — Posture Intelligence is generated internally so doesn't trigger inverse discovery) references an entity Commander doesn't know about:

1. Lookup against canonical entity model fails
2. Coverage Blindspot case is generated with root cause auto-classified (discovery gap, staleness, shadow IT, naming mismatch)
3. Case routes to platform or architecture team for entity onboarding
4. Inverse Discovery metric on the Observe phase dashboard updates

Inverse Discovery is what makes Commander's inventory get more honest the longer it runs. It is the dual of Pre-Warned classification: where Pre-Warned says "we knew, attack landed", Inverse Discovery says "we didn't know, external signal told us we should have."

## 13. Configurability

The Intelligence Layer exposes the following configurable parameters per tenant (Spec #55 v2.6):

- Per-stream ingestion enable/disable
- Stream-specific thresholds (volume floors, freshness windows, quality minimums)
- Cross-stream correlation enable/disable per correlation type
- Verdict density aggregation windows
- Behavioural anomaly detection sensitivity (peer-group definitions, deviation thresholds)
- Pre-warned classification confidence thresholds
- Stream-level RBAC scopes (who can access which stream)

System defaults are shipped at build. Baseline configuration profiles (Spec #55) cover Intelligence Layer configuration for industry segments.

## 14. Audit Events

- `INTELLIGENCE_STREAM_HEALTH_COMPUTED` — periodic stream health computation
- `CROSS_STREAM_CORRELATION_GENERATED` — when a cross-stream correlation produces an output (pre-warned, disagreement, anomaly, etc.)
- `ESTATE_INTELLIGENCE_PICTURE_QUERIED` — when a surface queries the EIP (with persona, scope, query intent)
- `INTERNAL_BEHAVIOURAL_INTELLIGENCE_ACCESSED` — specifically for the governance-sensitive stream, with audit trail of who accessed what
- `INVERSE_DISCOVERY_TRIGGERED` — when external signal references an unknown entity
- `VERDICT_DISAGREEMENT_DETECTED` — when multiple tools disagree on the same entity
- `STREAM_DISABLED_BY_CONFIGURATION` — when a tenant disables an intelligence stream

## 15. Acceptance Criteria

The Intelligence Layer is correctly implemented when:

- All four streams ingest signal from their respective connector classes
- All streams normalise against the canonical estate model
- The Estate Intelligence Picture is queryable by all consuming surfaces
- Cross-stream correlations operate per their respective specifications (Spec #71 Pre-Warned, Spec #72 Inverse Discovery, etc.)
- Stream health monitoring integrates with OODA Observe phase
- Stream-level governance is enforced (particularly Internal Behavioural Intelligence)
- Configurability is exposed via Tenant Admin
- Audit events flow to the audit infrastructure
- The architectural layering is preserved (connectors below, EIP above, surfaces consume from EIP)

## 16. Relationship to Other v2.6 Specifications

- **Spec #57 (Security Command and Control Doctrine)** — Intelligence Layer is one of the five structural capabilities defining Security C2
- **Spec #58 (Security OODA Loop)** — Intelligence Layer is the substrate the loop runs on
- **Spec #60 (Internal and External Attack Surface Framework)** — distinguishes which streams feed which attack surface
- **Spec #61 (Universal Security Signal Connector Contract)** — defines the four connector classes feeding the four streams
- **Spec #62 (Verdict Semantics)** — defines the treatment of verdict signal within Internal Behavioural Intelligence
- **Specs #65, #66 (Operating Pictures)** — primary consumers of the Estate Intelligence Picture
- **Specs #68, #69 (Identity/Asset Intelligence Surfaces)** — entity-centric consumers of the EIP
- **Spec #71 (Pre-Warned Classification)** — cross-stream correlation joining External Attack with Posture
- **Spec #72 (Inverse Discovery Loop)** — closed loop on stream lookup failures
- **Spec #73 (Silent Defence Reporting)** — aggregate consumer of Internal Behavioural Intelligence
- **Spec #75 (Internal Risk Investigation Sub-Lifecycle)** — detailed governance for Internal Behavioural Intelligence

## 17. Versioning and Supersession

This is v1.0 of the Intelligence Layer Architecture. The four-stream model is structural and is expected to remain stable across baseline increments. Stream definitions, correlation specifications, and governance rules may evolve as pilot data informs refinement.

This specification does not supersede any v2.5.2 specification. It introduces an architectural layer that integrates existing v2.5.2 engines (drift detection, risk scoring, blast radius, architecture intelligence) with the new v2.6 signal sources (SOC telemetry, operational verdicts) under a unified intelligence framework.
