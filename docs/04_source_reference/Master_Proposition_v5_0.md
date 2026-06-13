> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.

# v2.6 Baseline Authority Notice

This document is active under Commander SDR Baseline v2.6. It is governed by `00_AUTHORITY_AND_PRECEDENCE_v2_6.md`. It supersedes `Commander_SDR_Master_Proposition_v4_7.md` in full. Any historical wording that conflicts with closed-loop lifecycle doctrine, P0 priority-overlay doctrine, application-boundary doctrine, active shell authority, no-manual-case-lifecycle doctrine, Shell Reference vs Build Authority doctrine (Spec #56), Security Command and Control doctrine (Spec #57), Security OODA Loop doctrine (Spec #58), Intelligence Layer Architecture (Spec #59), or Internal and External Attack Surface Framework (Spec #60) is invalid.

---

**Commander SDR**

Security Drift Response — Security Command and Control Platform

Master Proposition & Product Feature Reference

Version 5.0  |  May 2026  |  Authoritative

**CONFIDENTIAL**

# Document Purpose and Authority

This document is the single authoritative Master Proposition for Commander SDR. It defines the product vision, value proposition, category claim, capability model, commercial model, user model, use-case schedule, detection model library, and delivery roadmap.

It describes what SDR is, what it does, who it serves, why it matters, and how it is commercially structured. It does not describe how the system is implemented at a technical level — that detail belongs in the SDR Master Technical Specification (v7.0).

**Supersedes:** Master Proposition v4.7 in full, and all earlier versions back through v2.1, plus the Strategic & Technical Master Proposition v2.7 and the SDR Executive Summary v7 proposition sections. The SDR Patent document is referenced but not replaced.

**Material changes from v4.7 to v5.0:**

1. Introduces **Security Command and Control** as the explicit category claim Commander occupies. SDR remains the patented operational discipline Commander runs within that category.
2. Introduces the **Security OODA Loop** as Commander's operational tempo framework, with four phases (Observe, Orient, Decide, Act) and an explicit boundary between programme-level OODA (Commander) and incident-level OODA (the SOC).
3. Introduces the **Intelligence Layer** with four streams (external threat intelligence, external attack intelligence, internal behavioural intelligence, posture intelligence).
4. Introduces the **dual attack surface model** distinguishing external attack surface (where external threat actors operate) from internal attack surface (where internal actors operate).
5. Introduces the **four-class connector architecture** (SOC Telemetry, Operational Verdict, Configuration State, Threat Intelligence) with multi-class declaration.
6. Introduces **verdict semantics** as a first-class signal treatment, recognising that every operational security tool produces verdicts that constitute detections resolved at the tool layer.
7. Introduces **pre-warned, protected, and novel** as a classification taxonomy for external attack outcomes against estate posture state.
8. Introduces **silent defence reporting** as the aggregate intelligence picture of what the security stack does every day.
9. Introduces the **External Operating Picture** and **Internal Operating Picture** as paired command surfaces, alongside the existing Fusion Map.
10. Introduces **Identity Intelligence** and **Asset Intelligence** as dedicated entity-centric intelligence surfaces.
11. Introduces the **Security Analyst** and **Risk Analyst** personas, raising the total persona count to eleven.
12. Introduces new case types: **External Attack Correlation**, **Verdict Pattern**, **Inverse Discovery (Coverage Blindspot)**, **Policy Effectiveness**, and **OODA Tempo Degradation**.
13. Introduces the **inverse discovery loop** that uses external signal to test Commander's own inventory completeness.
14. Introduces the **context-aware drift prioritisation matrix** that weights drift severity by attack context.
15. Reaffirms and formalises the boundary between Commander and the SOC, between Commander and insider risk investigation functions, and between Commander and Threat Intelligence Platforms.
16. Reaffirms that SDR remains the patented operational discipline. Commander is the platform. Security Command and Control is the category. All three layers are coherent and complementary.

## Document Index

| Ref | Section | Focus |
|-----|---------|-------|
| **1** | **The SDR Paradigm** | The problem (security drift), what SDR is, closed-loop control system, Commander's category position |
| **2** | **Commander as Security Command and Control** | Category claim, relationship with existing categories, position above the security stack |
| **3** | **The Security OODA Loop** | Operational tempo framework, four phases, programme-level vs incident-level, boundary with the SOC |
| **4** | **The Intelligence Layer** | Four intelligence streams, unified Estate Intelligence Picture, stream governance |
| **5** | **External and Internal Attack Surfaces** | Two threat surfaces, two operating pictures, dual response model |
| **6** | **SDR as a Complete CTEM Platform** | Five CTEM stages mapped to SDR capabilities, position relative to CTEM frameworks |
| **7** | **Core Proposition** | What SDR tells security teams — the value statement |
| **8** | **Primary Benefits** | Prevention-first posture, architecture intelligence, Commander AI, push, coordinated push, security tool rationalisation, cross-cloud risk correlation, third-party visibility, analyst operational passport, BYOM AI model, coverage scoring, **wide signal aperture (new)**, **pre-warned classification (new)**, **silent defence (new)**, **OODA tempo (new)**, commercial model summary |
| **9** | **System Architecture** | Seven-layer model, ephemeral asset classification, attack surface auto-positioning, extensible asset cartography, **four-class connector architecture (new)**, **Intelligence Layer architecture (new)** |
| **10** | **Security Tooling & Platform Health** | Platform health signals, detection, classification, routing, **verdict semantics integration (new)** |
| **11** | **Security Coverage Control Model** | Coverage stacks, weighting, scoring, Fully Covered metric, tag-driven composable requirements |
| **12** | **API & Connector Management** | Connector lifecycle, five-tier ingestion, normalisation, authority resolution, canonical entity model, universal search, **four connector classes (new)**, **multi-class declaration (new)** |
| **13** | **Case Management & Remediation Lifecycle** | Full case lifecycle, original six case types, **five new v2.6 case types**, SLA, approval, ITSM, Commander Reviews, priority model (P0–P4), case notes and metrics, push automation savings, workload management, case collaboration, user grades, push action governance, manual remediation, SIR, batch case processing, case communication, Command Bridge, Operations Channel Broadcast, Case Phase Model, Continuous Case Revalidation, Case Risk Score and Next Best Action, Case Pulse and SOM Operating Modes, Team Intelligence and Performance Dashboard, Resolution Durability Score, Business Impact Translation, Case Trajectory, Case Resonance and Conflict Gate, Case Association and Pattern Engine, Commander Thematic Intelligence, Platform Institutional Memory |
| **14** | **Compliance & Posture Intelligence** | Four-layer compliance model, baseline templates, posture scoring, evidence pack model, regulatory calendar |
| **15** | **Detection Model Library & Rule Builder** | ~240 models across 13 domains, 14 CHAIN rules, rule builder, model lifecycle, model dependency and correlation, Endpoint & SaaS Policy Drift sub-domain |
| **16** | **SIEM & SOAR Rule Generation** | Detection specification generation, handoff, retirement, **bidirectional flow (new)** |
| **17** | **Identity Intelligence Model** | Three-stage CHAIN model, risk scoring, group intelligence, user investigation profile, high-risk watchlist, **Identity Intelligence Surface (new)** |
| **18** | **Commander AI** | Four modes, grounding, BYOM architecture, prompt template IP, admin dashboard, health monitoring, output validation, tiered intelligence model, token transparency |
| **19** | **Additional Functional Capability Areas** | Asset registry, vulnerability management, blast radius, attack path likelihood engine, threat intelligence, security debt, refresh planner, behavioural intelligence, Endpoint & SaaS Policy Drift, **Asset Intelligence Surface (new)**, **inverse discovery (new)** |
| **20** | **Commercial Model and Licensing** | Licensing tiers, entitlement categories, self-hosted option, SaaS delivery model, update/notification model, trial conversion & ROI evidence |
| **21** | **Platform Administration & Governance** | Connector dashboard, RBAC, audit trail, multi-tenant SSO, tenant onboarding, security tool intelligence, console utilisation tracking, **configuration governance for v2.6 parameters (new)** |
| **22** | **Target Users and Persona Model** | Eleven personas (nine existing plus **Security Analyst** and **Risk Analyst**), four authority overlays |
| **23** | **Use-Case Schedule** | Per-persona use cases mapped to capabilities |
| **24** | **Workspace Model** | Six workspaces, persona mapping, domain security dashboards, strategic & tactical priority framework, **OODA dashboards (new)**, **Operating Pictures (new)**, **Direction Boards (new)** |
| **25** | **Commander's Boundary with the SOC** | Explicit doctrinal boundary, what Commander does, what Commander does not do, why the altitude matters |
| **26** | **Commander's Boundary with Insider Risk Programmes** | Surface and route, do not investigate, customer-owned investigation processes |
| **27** | **Delivery Roadmap** | Phases 0–4, key deliverables per phase, v2.6 release sequence |
| **28** | **Document Family** | Document suite status and relationships |

# 1. The SDR Paradigm

## 1.1 The Problem: Security Drift

Enterprise environments span cloud platforms, on-premises infrastructure, SaaS applications, identity systems, and software development pipelines. This complexity results in continuous divergence between intended and actual security posture. This divergence is security drift.

**Security drift is defined as:** any deviation between a defined or intended security state and the actual configuration, behaviour, or control posture of systems, assets, identities, or environments.

Traditional security technologies operate reactively. They detect events but do not systematically eliminate exposure conditions, quantify the cost of unresolved architectural weaknesses, or map the connected access footprint of identities across system boundaries. They also do not see the complete picture of what the security stack is doing every day, do not distinguish between attacks that landed on pre-warned assets versus attacks that landed on previously clean assets, and do not run a continuous operational tempo from estate posture to verified remediation.

## 1.2 What Commander SDR Is

**Commander SDR** is the Security Command and Control platform for the modern enterprise. It runs continuous **Security Drift Response** — the patented operational discipline of detecting, analysing, and remediating security posture drift across hybrid estates — within a unified command and control framework that integrates intelligence, defence, engineering, and response above the existing security stack.

Three layers, coherent and complementary:

- **Security Command and Control** is the category Commander occupies. The hierarchical position above operational security tools that integrates intelligence, defence, engineering, and response.
- **Security Drift Response (SDR)** is the patented operational discipline Commander runs within that category. The closed-loop detect-analyse-control-validate-adjust cycle against security posture drift.
- **Commander** is the platform brand that delivers both — the SaaS foundational security control layer that customers deploy, configure, and operate against their estate.

Commander SDR is a SaaS foundational security control layer that:

- Continuously detects, analyses, and remediates security posture drift across hybrid estates
- Maintains a unified asset and exposure model spanning the entire estate
- Maintains a security architecture rulebook with deterministic correlation-based drift detection
- Runs a closed-loop control lifecycle for every finding
- Ingests four streams of intelligence (external threat, external attack, internal behavioural, posture)
- Provides operational pictures for both the external attack surface and the internal attack surface
- Operates a continuous Security OODA Loop at the security programme level
- Generates audit-grade evidence at every step

Commander provides **Security Architecture Intelligence**: identifying systemic design flaws, structural weaknesses, and architectural anti-patterns. It serves as the measurement engine for the estate and as a complete Continuous Threat Exposure Management (CTEM) platform, while occupying a category position above CTEM.

## 1.3 The Closed-Loop Control System

The SDR closed loop is the patented operational discipline at the heart of Commander. Every finding flows through five stages:

| **Stage** | **Function** |
| --- | --- |
| Detection | Continuous identification of deviations (drift) from the architectural baseline across all ingested domains. |
| Analysis | Architecture-aware correlation to determine blast radius, exploitability, systemic risk, and identity exposure. |
| Control | Generation of exact remediation payloads, policy adjustments, detection logic, or compensating control recommendations. |
| Validation | Empirical confirmation of control effectiveness via integrated validation sources and post-remediation revalidation. |
| Adjustment | Automated refinement of detection models, architectural baselines, risk scores, and posture metrics. |

Every finding becomes a case. Every case has an owner, an SLA, an approval chain, ITSM records, a verification loop, and a full trail of travel from detection to closure and reconciliation.

The closed loop is bound to the **Security OODA Loop** that runs at the programme level (Section 3). The five SDR stages map to the four OODA phases: Detection feeds Observe, Analysis is Orient, Control is Decide, Validation closes the Act phase, and Adjustment is the loop's feedback into the next Observe cycle.

## 1.4 Commander's Category Position

Commander occupies the category of **Security Command and Control** — a category positioned above the existing operational security tools (SIEM, EDR, NDR, email security, web filtering, DLP, identity policy, MDM, posture management, exposure management, CAASM, CTEM) that integrates all of them under a unified operational framework.

This is not a marketing positioning. It is a structural property of the architecture. Commander:

- Consumes from operational tools but does not replicate them
- Sits above the SOC; does not run incident response
- Sits above posture management; does not replicate posture scoring
- Sits above SIEM; does not run log aggregation or event correlation
- Sits above GRC; does not replicate compliance attestation workflows
- Sits above Threat Intelligence Platforms; does not replicate threat enrichment

What Commander does that no other category does:

- Integrates the four intelligence streams into a unified Estate Intelligence Picture
- Runs the Security OODA Loop at the programme level
- Provides operating pictures for both external and internal attack surfaces
- Classifies attack outcomes against estate posture state (pre-warned, protected, novel)
- Surfaces what the entire security stack is doing every day (silent defence)
- Drives a closed loop from estate posture to verified remediation with audit-grade evidence

The category claim is detailed in Spec #57 (Security Command and Control Doctrine).

# 2. Commander as Security Command and Control

## 2.1 The Category Claim

Commander occupies **Security Command and Control (Security C2)** as its category position. This category is genuinely new in the security market — no existing analyst quadrant or category definition captures what Security C2 is, because no platform before Commander has structurally occupied the altitude that defines it.

Security C2 is defined as: **the platform layer that integrates intelligence, defence, engineering, and active response into a unified operational framework above the customer's security stack, runs a continuous OODA loop at the security programme level, and produces auditable evidence of the security function operating against the actual estate.**

The phrase "Security Command and Control" is borrowed from military doctrine, where Command and Control (C2) refers to the function that integrates intelligence (what's happening), forces (what we have), engagement (what's being done), and tempo (how fast we're operating) into coherent direction. Applied to security, the analogy is exact:

- **Intelligence** is the four-stream Intelligence Layer (external threat, external attack, internal behavioural, posture).
- **Forces** are the security stack — the configured controls, deployed sensors, policy enforcement, detection rules.
- **Engagement** is what the SOC does when something needs active response, and what the engineering teams do when remediation is required.
- **Tempo** is the Security OODA Loop running continuously across the estate.

Commander is the platform that occupies the C2 position. The security stack remains the customer's existing tools. The SOC remains the customer's existing function. Commander does not replace any of them; it commands all of them.

## 2.2 Relationship to Existing Security Categories

Commander's position relative to the existing categories is hierarchical, not competitive.

| Category | Function | Relationship to Commander |
|---|---|---|
| SIEM / SOC platforms | Aggregate logs, correlate events, manage incidents | Commander consumes case and detection signal (Class A connectors). Commander does not run incident workflow. |
| EDR / XDR | Endpoint detection and response | Commander consumes detection and verdict signal. Commander does not run endpoint response. |
| Email security | Block, quarantine, flag malicious mail | Commander consumes verdict signal (Class B connectors). Commander does not run mail flow. |
| Web filtering | Block, allow, coach web traffic | Commander consumes verdict signal. Commander does not run web filtering. |
| DLP | Prevent data egress | Commander consumes verdict signal. Commander does not run DLP enforcement. |
| Identity policy (CA, MFA) | Authenticate and authorise | Commander consumes verdict signal and configuration state. Commander does not run identity enforcement. |
| MDM / Endpoint compliance | Enforce device baselines | Commander consumes verdict signal and configuration state. Commander does not run device management. |
| Posture management (CSPM, CIEM, SSPM) | Identify posture issues in specific domains | Commander consumes posture signal, integrates across domains, drives remediation. Commander provides a complete posture picture across all domains. |
| Exposure management / CAASM | Surface attack surface and exposures | Commander consumes exposure signal, correlates with attack activity, drives prioritisation. Commander provides exposure intelligence as one of four streams. |
| CTEM frameworks | Define a five-stage exposure management process | Commander is CTEM-native across all five stages, while occupying a category above CTEM. |
| GRC platforms | Compliance, risk, audit, attestation | Commander provides operational evidence that feeds GRC processes. Commander does not run compliance workflows. |
| Threat Intelligence Platforms (TIP) | Aggregate, enrich, disseminate threat intelligence | Commander consumes from TIPs (Class D connectors). Commander does not replicate TIP functionality. |
| Insider Risk Management | Detect insider threats | Commander surfaces behavioural patterns as intelligence; the customer's insider risk programme owns investigation. |

Commander's altitude is what differentiates it. Every category below Commander does one job well. Commander integrates all of them into a unified operational picture and drives a continuous closed loop above them.

## 2.3 What Security C2 Does That Other Categories Cannot

Five capabilities are structurally unique to Security C2 as Commander implements it:

1. **Integration of all four intelligence streams.** External threat intelligence, external attack intelligence, internal behavioural intelligence, and posture intelligence — joined to the same canonical estate model, governed under the same case lifecycle, surfaced through the same intelligence layer. No other platform consumes from all four streams.

2. **Programme-level OODA tempo.** The OODA loop as a continuous operational rhythm across the entire security function, with phase health metrics, tempo measurement, and bottleneck identification. SOC platforms run OODA at the incident level; Commander runs OODA at the programme level.

3. **Pre-warned, protected, novel classification.** Every external attack landing on the estate is classified against Commander's prior knowledge of the affected entity. The classification is auditable and forms the basis for closed-loop feedback into priority and remediation.

4. **Dual operating pictures.** External Operating Picture for external attack activity, Internal Operating Picture for internal actor activity. Two surfaces, two threat models, one estate, one Commander.

5. **Silent defence reporting.** The aggregate picture of what the security stack does every day — every verdict, every block, every quarantine, every override — across the entire stack. The story of how defence is performing, not just where it failed.

These five capabilities are what make Security C2 a distinct category and Commander the first credible occupant of it.

# 3. The Security OODA Loop

## 3.1 OODA at the Programme Level

The **OODA loop** — Observe, Orient, Decide, Act — was developed by John Boyd as a model of decision tempo in air combat. It has since been adopted across military doctrine, operational research, and increasingly within security operations.

Most security applications of OODA operate at the **incident level**: the SOC analyst observes an alert, orients on what it means, decides on a response, acts on the threat. That OODA loop is per-incident, real-time, and human-driven. It is the SOC's job.

Commander runs OODA at a different altitude. The **programme-level OODA loop** observes the entire estate's signal across four intelligence streams, orients on what the signal means for posture and tempo, decides on remediation and prioritisation across thousands of findings, and acts through engineering changes, policy retuning, push execution, and detection specification dispatch. This OODA loop runs continuously, system-driven, across the entire security programme.

The two OODA loops are complementary. The SOC's incident-level OODA handles active threats in real time. Commander's programme-level OODA handles the security function as a whole. Neither replaces the other.

## 3.2 The Four Phases

Each OODA phase has a specific function and a defined set of engines in Commander.

### Observe

The Observe phase is the signal intake layer. It answers: *how well is Commander seeing the estate right now?*

Observe consumes from the four connector classes (SOC Telemetry, Operational Verdict, Configuration State, Threat Intelligence) feeding the four intelligence streams. Observe phase health is measured by connector freshness across all classes, signal volume by purpose and class, coverage completeness across the estate, blind spots and gaps surfaced by inverse discovery, and the aggregate Observe phase health score.

### Orient

The Orient phase turns raw signal into understanding. It answers: *what does the signal mean in the context of this estate?*

Orient runs the drift detection engine, the risk scoring engine, the blast radius engine, the pre-warned classification engine, the architecture intelligence engine, the identity chain engine, and the threat relevance engine. Orient phase health is measured by drift detection tempo, risk model freshness, architecture intelligence status, classification distribution (pre-warned vs protected vs novel), blast radius tempo, and the aggregate Orient phase health score.

### Decide

The Decide phase generates remediation, prioritisation, and routing decisions. It answers: *given what we understand, what should be done?*

Decide runs the remediation generation engine, the routing engine, the priority boost engine, the tactical objective auto-promotion engine, and the approval orchestration. Decide phase health is measured by decision throughput, decision queue depth, approval cycle time, routing accuracy, auto-promotion activity, and the aggregate Decide phase health score.

### Act

The Act phase executes decisions and validates outcomes. It answers: *was what was decided actually done?*

Act runs the push execution engine, the SOAR dispatch interface, the ITSM record creation, the detection specification handoff, the compensating control deployment tracking, and the validation engine. Act phase health is measured by execution throughput, execution latency, execution success rate, validation pending count, failed actions count, and the aggregate Act phase health score.

The Act phase completes the loop — validated action results feed back into Observe as fresh signal, the next Orient cycle includes the new estate state, and the loop continues.

## 3.3 OODA Tempo as Commander's Primary Operational Metric

**OODA tempo** is the average time for a finding to traverse the full OODA cycle: from Observe (signal arrival) through Orient (drift detected, classified, prioritised) through Decide (remediation generated, routed, approved) through Act (executed and validated). It is Commander's primary operational metric alongside posture score and coverage score.

A healthy estate has OODA tempo measured in hours-to-days. A degraded estate has OODA tempo measured in weeks-to-never. Commander surfaces tempo continuously, identifies which phase is the current bottleneck, and routes OODA Tempo Degradation cases when phase health drops below configurable thresholds.

OODA tempo is reported across four cadences:

- **Hourly tactical refresh** for the SOM and operations centre
- **Daily executive summary** for the CISO
- **Weekly programme review** for security leadership
- **Monthly board report** for board-level governance

Every cadence reports against the same OODA phase model, the same tempo metric, and the same drill paths. The CISO presenting upward uses the same vocabulary the SOM uses on the operations floor. Reporting becomes coherent across the organisational hierarchy because every level looks at the same model at different levels of detail.

The Security OODA Loop is fully specified in Spec #58 (Security OODA Loop Specification). The dashboard surfaces are specified in Spec #67 (OODA Dashboard Family Specification).

## 3.4 The SOC Boundary in OODA Terms

Commander runs programme-level OODA. The SOC runs incident-level OODA. The boundary is explicit and binding:

- Commander observes signal across the estate. The SOC observes individual incidents.
- Commander orients on posture, drift, blast radius, and intelligence layer correlation. The SOC orients on incident scope, attack technique, and immediate threat.
- Commander decides on remediation, prioritisation, and tactical objective promotion. The SOC decides on containment, eradication, and recovery actions.
- Commander acts through engineering changes, push execution, and detection specification dispatch to the SOC. The SOC acts through active response, isolation, blocking, and incident closure.

Commander does not triage individual SOC cases. Commander does not run incident response. Commander does not contain active threats. Commander provides estate context for SOC cases (the pre-warned classification, the correlated drift) but never owns SOC case workflow. The SOC remains the customer's existing function with its existing tooling, unchanged.

The full SOC boundary is specified in Section 25.

# 4. The Intelligence Layer

## 4.1 Four Streams of Intelligence

Commander's **Intelligence Layer** is the architectural construct that integrates four distinct streams of intelligence about the estate and its threat environment.

**External Threat Intelligence** is intelligence about *what's happening out there*. It comes from OSINT feeds, CVE databases, vendor advisories, KEV updates, IOC streams, threat actor attribution, dark web monitoring (where licensed), and partner intelligence sharing. External threat intelligence tells Commander what external adversaries are doing globally and which of that activity is relevant to the estate.

**External Attack Intelligence** is intelligence about *what external adversaries are doing to this estate specifically*. It comes from SOC platforms (SIEM, XDR, EDR, NDR) via Class A connectors. External attack intelligence tells Commander what's being attempted, what's been detected, what cases are being investigated by the SOC, and what attacks have landed on the estate.

**Internal Behavioural Intelligence** is intelligence about *what internal actors are doing*. It comes from the operational verdict stream — email security verdicts, web filtering verdicts, DLP verdicts, conditional access verdicts, MDM compliance verdicts, endpoint compliance verdicts — via Class B connectors. Internal behavioural intelligence tells Commander what users are attempting, what policies are firing, where internal risk is concentrating, and which behavioural patterns warrant attention.

**Posture Intelligence** is intelligence about *the state of the estate itself*. It comes from Commander's own engines operating over configuration state, drift detection, control coverage, architectural anti-patterns, identity risk, and blast radius. Posture intelligence tells Commander where the estate is strong, where it is weak, and where intended state diverges from actual state.

Four streams. All flowing through normalisation. All bound to the canonical entity model. All governed by case-binding rules. All surfaced through the unified intelligence layer.

## 4.2 The Estate Intelligence Picture

Above the four streams sits the unified **Estate Intelligence Picture** — the integration surface that joins all four into a single intelligence assessment of the estate at any moment in time.

The Estate Intelligence Picture is consumed by:

- The CISO's executive surfaces (Command Tempo Dashboard, Operating Pictures, Risk Trajectory views)
- The SOM's operational surfaces (case queues, routing decisions, tactical priority dashboards)
- The Security Analyst's investigation surfaces (Identity Intelligence, Asset Intelligence, threat hunting)
- The Risk Analyst's risk modelling surfaces (security debt, identity risk concentration, asset risk trajectories)
- The Security Architect's design surfaces (control gaps, blast radius analysis, architecture intelligence)

Every dashboard, every report, every drill-down ultimately consumes from the same Estate Intelligence Picture. This is what makes Commander's surfaces coherent across personas — the same intelligence substrate, surfaced differently per role and per workspace.

## 4.3 Stream Governance

Each intelligence stream has its own governance discipline:

- **External Threat Intelligence**: ingested from licensed and OSINT sources, filtered for estate relevance, retained per source-specific data agreements.
- **External Attack Intelligence**: ingested from SOC platforms read-only, retained per customer's SOC data retention policy, never written back to the SOC.
- **Internal Behavioural Intelligence**: ingested from operational tools, retained per data protection requirements, governed by the Verdict Pattern case visibility model (Section 26), subject to jurisdiction-specific employee monitoring regulations.
- **Posture Intelligence**: generated internally by Commander's engines, retained per the tenant's configured data retention, exposed per RBAC.

Internal Behavioural Intelligence carries the strictest governance because it relates to identifiable user activity. Spec #75 (Internal Risk Investigation Sub-Lifecycle) details the access controls, evidence handling, and customer-owned investigation boundaries that apply to this stream.

The Intelligence Layer architecture is fully specified in Spec #59 (Intelligence Layer Architecture Specification).

# 5. External and Internal Attack Surfaces

## 5.1 The Two Surfaces

Commander recognises **two distinct attack surfaces** in every estate:

**The External Attack Surface** is everything the outside world can touch. Internet-facing services, exposed APIs, public DNS, email channels, partner integrations, public-facing applications, attack paths that originate beyond the estate boundary. External threat actors operate against this surface. The detection layer that watches this surface is primarily the SOC stack — SIEM, EDR, NDR, email security, threat intelligence, incident response.

**The Internal Attack Surface** is everything internal to the estate that internal actors can act on. Files, applications, data, identities, configurations, devices, services. Internal threat actors — whether malicious, negligent, or compromised — operate against this surface. The detection layer that watches this surface is primarily the operational verdict stream — email security verdicts on internal users' mail, DLP verdicts on internal file movement, web filtering verdicts on internal browsing, conditional access verdicts on internal authentication, MDM verdicts on internal devices.

Both surfaces are real. Both are continuously under pressure. Both require dedicated intelligence and dedicated operational response. No existing security platform integrates both surfaces under unified command — operational tools see slices of one or the other, but Commander integrates the full picture across both.

## 5.2 Two Operating Pictures

Commander provides two paired operational surfaces:

**The External Operating Picture** is the battlefield view of external attack activity against the estate. Estate posture as the base map, attacks landing as foreground, attack chains crossing zones, pre-warned and protected classifications, control weakness correlation to active cases. Specified in Spec #65 (External Operating Picture Surface Specification).

**The Internal Operating Picture** is the parallel surface showing internal actor behavioural patterns. Same estate base map, different overlay — identities firing verdicts, departments with elevated DLP activity, geographic anomalies, devices with policy drift correlated to user behaviour, identities whose verdict pattern is diverging from peers. Specified in Spec #66 (Internal Operating Picture Surface Specification).

The two pictures share visual conventions where appropriate (the same estate decomposition, the same drill paths into Identity and Asset Intelligence) and differ visually where required (the External Picture uses crosshair-and-ring conventions for attack overlay; the Internal Picture uses heat density and behavioural pattern conventions). The CISO toggles between them or views them side by side. The full picture of the estate's threat landscape requires both.

## 5.3 Dual Response Model

External and internal attack surfaces drive different response patterns through the OODA loop.

**External response** is engineering work. When an external attack lands on a pre-warned asset, the closed loop drives drift remediation, control restoration, detection specification dispatch, and the audit trail of what Commander knew when. The work routes to security architecture, push operations, SOAR engineering, and platform teams.

**Internal response** is investigation work. When an internal verdict pattern crosses a threshold, the closed loop drives surfacing of the pattern, classification of the case, and routing to the customer's Internal Risk function. The work routes to identity analysts and the customer-configured insider risk investigation programme. Commander surfaces the trigger; the customer owns the investigation.

Both response streams run in parallel through the same OODA loop, with the same case lifecycle, the same closure gates, and the same audit-grade evidence. What differs is the routing, the owner role, the governance model, and the boundary between Commander and the human-owned investigation process.

The dual attack surface framework is fully specified in Spec #60 (Internal and External Attack Surface Framework Specification).

# 6. SDR as a Complete CTEM Platform

Continuous Threat Exposure Management (CTEM) is the dominant analyst framework for modern exposure management. SDR delivers every CTEM stage as a native, integrated capability — not as a bolted-on workflow or a marketing overlay. The five CTEM stages map directly to SDR's architecture, and SDR's operation occupies a category position above the CTEM framework itself.

| **CTEM Stage** | **SDR Capability** | **What SDR Delivers** |
| --- | --- | --- |
| Stage 1: Scoping | Asset Registry, Ownership Hierarchy, Connector Coverage, Coverage Control Model, Compliance & Standards Module | Complete enterprise scoping: every asset, identity, relationship, and dependency mapped and owned. Coverage control scoring per asset against required control stack. Coverage gaps identified as drift. Scope defined at estate, business unit, application, technology, or any organisational layer. Compliance frameworks mapped to live estate scope. Source authority classification per domain per connector. |
| Stage 2: Discovery | Data Ingestion Framework, Drift Detection Engine, Identity Intelligence, API & Connector Management, Platform Health Monitoring, **Four-Class Connector Architecture (v2.6)**, **Inverse Discovery Loop (v2.6)** | Continuous discovery across all connected platforms via API-native connectors. Approximately 240 built-in detection models across 13 domains. Identity access chain computation across system boundaries. Vulnerability, configuration, policy state, and verdict signal ingestion from every connected tool. Canonical entity model aggregating data from all sources. Platform health monitoring ensuring tools are operational. Inverse discovery loop testing inventory completeness against external signal. Universal search across every entity. |
| Stage 3: Prioritisation | Risk Scoring, Blast Radius, Attack Path Likelihood, Commander AI Assessment, Security Debt Register, **Context-Aware Drift Prioritisation Matrix (v2.6)**, **Pre-Warned Classification (v2.6)** | Every finding prioritised by: blast radius, attack path likelihood, exploitability, identity exposure, business context, coverage score, threat intelligence relevance, and attack context modulation. Pre-warned versus protected versus novel classification feeds priority decisions. Commander AI provides plain-language prioritisation rationale. |
| Stage 4: Validation | Exposure Validation (BAS Integration), SIEM & SOAR Rule Generation, Connected Access Chain Revalidation | Empirical exploitability confirmation via breach and attack simulation. Controls bypass detection. Post-remediation revalidation confirming blast radius reduction. Where remediation cannot be initiated, Commander generates detection and response rules for SIEM and SOAR platforms to provide interim validated monitoring coverage. |
| Stage 5: Mobilisation | Case Management, ITSM Integration, Push Capability, Compensating Controls, Remediation Dispatch | Full case lifecycle from finding to verified closure. Exact remediation payloads generated. Push to source systems where enabled. ITSM two-record dispatch where manual remediation required. Compensating and manual controls recommended where direct remediation is not possible. Rollback capability on every pushed action. Verified closure — cases cannot close without evidence. |

SDR is not a CTEM-adjacent tool. It is a CTEM-native platform. Every stage is continuously operational, not periodically exercised. Commander operates *above* the CTEM framework — running CTEM as one of several disciplines within the broader Security Command and Control category.

# 7. Core Proposition

Continuously align intended security posture with actual operational state by converting live exposure, threat intelligence, attack signal, and verdict streams into prioritised, auditable, and reversible controls and detections — telling security teams:

- What is wrong and how severe it is
- What it costs to fix (capex, opex, and engineering effort)
- Who owns it across business, technical, and functional dimensions
- Whether the estate is becoming more or less governable over time
- What active threats are relevant to their specific estate
- Whether identified exposures are actually exploitable
- Which identities represent the highest access risk across all connected systems
- What the recommended remediation is and whether Commander can resolve it automatically
- What compensating or manual controls should be applied where direct remediation is not possible
- What detection and response rules should be deployed to SIEM and SOAR to cover exposure gaps
- What the computed attack path likelihood is — the probability that an exposure can actually be exploited given every control in the path
- What the coverage control score is for every affected asset — which controls are present, which are missing, and how that compares to the required stack
- How to find any asset, identity, vulnerability, or case instantly via universal search across the entire estate
- **Which attacks landed on assets Commander had pre-warned versus which landed on assets considered protected** — and what the implications are for posture, priority, and audit
- **What the entire security stack is doing every day** — every block, every quarantine, every coach, every flag, aggregated and trended
- **Where internal actor activity is concentrating** — which identities, which departments, which patterns warrant attention from the customer's insider risk function
- **What the current OODA tempo is across the security programme** — Observe phase health, Orient phase health, Decide phase health, Act phase health, and the bottleneck of the moment

SDR maintains its own persistent model to define asset and ownership cartography across the entire estate. It connects multiple environments, handles complex group structures and multi-tenant architectures, and maintains posture visibility aligned to compliance frameworks at every organisational layer. Technical debt is visible at all layers. Intelligence is integrated across four streams. Two attack surfaces are visible simultaneously. The OODA loop runs continuously.

# 8. Primary Benefits

### Prevention-First Posture

Reduce attack surface by closing exposure conditions before they generate alerts. SDR eliminates the root cause of drift rather than responding to its symptoms.

### Architecture Intelligence

Surface systemic design flaws, quantify security debt in financial and engineering terms, and drive strategic remediation and investment decisions.

### Operational Efficiency

A single prioritised case queue with blast-radius context, exact remediation payloads, full ownership resolution, pre-populated ITSM records, compensating control recommendations, and a clear Commander-resolvable vs human-effort split.

### Quantified Operational Savings

SDR tracks and quantifies time saved across every automated operation — not just push actions. Every Commander auto-summary, every cross-system correlation, every auto-created ITSM ticket, every post-remediation validation, every evidence pack assembly, every trust boundary auto-detection represents analyst time that SDR saved. Each savings event is recorded with a configurable manual-equivalent time estimate, aggregated per case, per team, per domain, and per estate. The CISO dashboard shows the headline: "SDR saved 1,247 analyst hours this quarter." The ROI report converts savings to financial value at the tenant's configured analyst cost rate and compares it to licence cost — net ROI in one number. This is the metric that closes trial conversions, justifies renewals, and supports board-level investment cases.

### Wide Signal Aperture (v2.6)

Commander ingests security signal from API, webhook, and email channels across four distinct connector classes: SOC Telemetry (Sentinel, Google SecOps, Splunk ES, CrowdStrike Falcon, Defender for Endpoint, Rapid7 InsightIDR, Darktrace), Operational Verdict (email security, endpoint compliance, web filtering, identity policy, DLP), Configuration State (the existing v2.5 connector universe), and Threat Intelligence. No security signal source is excluded by integration friction. New platforms are added by conforming to Commander's connector contract — no product release required.

### Pre-Warned Classification (v2.6)

Every external attack landing on the estate is classified against Commander's prior knowledge of the affected entity. **Pre-warned** attacks landed on assets Commander had flagged as exposed (drift, control gap, coverage deficit) before the attack occurred — these carry an audit-grade record of what Commander knew when, and drive immediate priority elevation of the correlated drift. **Protected** attacks landed on assets Commander considered fully protected — these warrant immediate investigation as potential novel TTPs, sophisticated adversaries, or insider compromise. **Novel** indicates the signal is too new or too ambiguous to classify yet. This three-way classification is unique to Commander and no other security platform produces it.

### Silent Defence Reporting (v2.6)

The aggregate picture of what the security stack does every day, every week, every month. Antigena blocked 1,247 phishing attempts. Defender quarantined 89 malicious attachments. Zscaler blocked 3,400 connections to known C2 infrastructure. Conditional Access denied 78 sign-ins from blocked geographies. DLP enforced 12 outbound policy decisions. Intune flagged 47 devices for compliance drift and 41 self-remediated. None of these became SOC cases. None of these woke an analyst. All of them are evidence of the security stack performing as designed. Silent defence reporting is the story no SOC platform can tell because no SOC platform sees the resolved-at-tool-layer events.

### OODA Tempo as Primary Operational Metric (v2.6)

Commander's Security OODA Loop runs continuously at the security programme level. The OODA tempo metric — the average time for a finding to traverse Observe → Orient → Decide → Act → validated closure — is Commander's primary operational measure alongside posture score and coverage score. Tempo is reported across four cadences (hourly tactical, daily executive, weekly programme, monthly board) and is drillable to phase-specific health metrics, bottleneck identification, and root cause analysis. The CISO presents OODA tempo upward; the SOM operates against it daily.

### Estate-Relevant Threat Intelligence

Ingest threat feeds, CVEs, advisories, and IOCs — filtered and scored against the actual estate before a human sees them. Analysts receive pre-contextualised, estate-relevant cases.

### Exposure Validation

Empirical exploitability confirmation via BAS integration. Priority adjustment based on real-world exploitability, not theoretical severity.

### Identity Intelligence

The only platform where a single identity's full access footprint across all connected systems is visible simultaneously, joined to behavioural intelligence from the verdict stream, joined to case history across the SOC and Commander, joined to risk trajectory over time. Access path risk scoring, connected chain mapping, security group health monitoring, and the Identity Intelligence Surface that surfaces all of it in one entity-centric view (v2.6).

### Detection Model Library & Custom Rule Builder

Approximately 240 built-in models across 13 domains. Full custom rule and model builder. Commander-generated rules. Every case traceable to a model execution.

### SIEM & SOAR Rule Generation (bidirectional, v2.6)

When remediation cannot be initiated, Commander generates tailored detection and response rules for deployment to SIEM and SOAR platforms, ensuring exposure is covered by monitoring even before it is resolved. From v2.6, the flow is explicitly bidirectional: Commander generates detection specifications *for* SIEM/SOAR teams to deploy, *and* consumes case and detection signal *from* SIEM/SOAR platforms for the External Operating Picture and pre-warned classification. Both directions are read-only with respect to SOC operations.

### Commander AI

Real-time security engineering, architectural, tooling, and threat triage resource. Always-on, grounded in estate data, transparent about its boundaries.

### Push as a Controlled Capability

All write operations premium-gated, admin-toggled, analyst-approved, and fully reversible. Multi-system coordinated push with rollback.

### Cross-System Coordinated Push

When a remediation or IOC response requires simultaneous action across multiple target systems, SDR executes coordinated push groups — a set of push actions deployed together, monitored together, and rolled back together if any member fails. This is not sequential manual execution across consoles. It is a single-approval, simultaneously-executed, automatically-reversible operation that would otherwise require an analyst to log into multiple vendor consoles, make changes in sequence, and manually track each one. No competitor offers coordinated multi-system push with automated group rollback.

### Security Tool Rationalisation & Cost Intelligence

SDR quantifies the operational value of every connected security tool — not just whether it provides data, but how much unique data it provides, which detection rules depend exclusively on it, which push actions it enables, and how much analyst time it saves through automation. The overlap detection matrix shows where the organisation is paying twice for the same intelligence. Tool removal impact simulation answers "what happens if I remove this tool?" with quantified impact on detection coverage, compliance posture, push capability, and manual effort. Console utilisation tracking shows how many analysts now work through SDR instead of the tool's native console — directly informing licence seat decisions. This transforms security tooling from an opaque cost centre into a measured, rationalised portfolio with quantified value per tool.

### Cross-Cloud Risk Correlation

SDR correlates security findings across cloud boundaries — AWS, Azure, GCP, and on-premises — in a single case view. A service principal in Entra ID that holds a standing Contributor role on an Azure subscription AND has been granted AdministratorAccess in AWS IAM is a single cross-cloud privilege escalation path, not two unrelated findings. SDR's identity intelligence, access chain computation, and blast radius engine operate across every connected system simultaneously, surfacing cross-system attack paths that no single-cloud tool can see.

### Third-Party Visibility & Trust Boundary Intelligence

SDR models the points where your security control ends and a third party's begins. Most security platforms only show what you can scan — SDR also shows where you can't see. Every third-party connection — vendor VPNs, partner API integrations, hosted services, SaaS data feeds, cloud shared responsibility boundaries — is tracked as a trust boundary with explicit monitoring status. SDR auto-detects trust boundaries from firewall configurations, identity federations, OAuth consent grants, and cloud network peerings. The architect enriches them with business context. Unmonitored boundaries are flagged as blind spots. The coverage model adjusts automatically.

### Analyst Operational Passport & Career Intelligence

SDR is the first security platform where analyst performance is measured by verified operational data, not self-reported experience or multiple-choice exams. Every case worked, every domain touched, every push executed, every escalation handled builds a verifiable professional profile. Analysts earn specialism designations across security domains at three tiers (Practitioner, Specialist, Expert) based on sustained operational performance. Achievements mark verified milestones backed by auditable case data. The operational passport belongs to the analyst at platform level and persists if the analyst changes employer. From v2.6, the passport extends to recognise specialism in the new domains: Security Analyst (cross-domain investigation), Risk Analyst (operational risk modelling), and continued evolution in the existing nine domains.

### Structured Case Lifecycle

Every finding becomes a case with owner, SLA, approval chain, two ITSM records, verification loop, compensating control tracking, and full trail of travel. From v2.6, the case taxonomy extends with five new case types: External Attack Correlation, Verdict Pattern, Inverse Discovery (Coverage Blindspot), Policy Effectiveness, and OODA Tempo Degradation.

### Compliance as an Operational Metric

Continuous compliance framework mapping from individual tool configuration checks through baseline conditions through framework controls through posture score. Compliance is measured in real time, not quarterly.

### Strategic Planning

Security debt quantification across six debt types (vulnerability, coverage, architecture, identity, platform, compliance) with capex, opex, and engineering effort estimation per item. Security Refresh and Recast Planner for forward-looking asset replacement and architecture redesign programmes with planning horizons (immediate, tactical, strategic). Investment case support showing risk reduction per pound invested and Commander-resolvable vs manual effort split.

# 9. System Architecture

The Commander SDR architecture is organised in seven layers, with v2.6 adding the Intelligence Layer as a load-bearing integration point above the existing engines.

| Layer | Function |
|---|---|
| Connector Layer | Four-class connector architecture (SOC Telemetry, Operational Verdict, Configuration State, Threat Intelligence). Multi-class declaration. Read-only by default for external signal. Push capability gated and authorised separately. |
| Normalisation Layer | Canonical entity model. Authority resolution. Entity matching. Verdict semantics processing. Inverse discovery routing. |
| Engine Layer | Drift detection (~240 models). Identity intelligence. Architecture intelligence. Blast radius. Attack path likelihood. Risk scoring. Behavioural anomaly detection. Pre-warned classification. |
| **Intelligence Layer (v2.6)** | **Four-stream integration. Estate Intelligence Picture. Identity Intelligence Surface. Asset Intelligence Surface. Cross-stream correlation.** |
| Case Layer | Universal Risk Object binding. Closed-loop case lifecycle. Routing. Validation. Closure gates. Reopening triggers. Case taxonomy with v2.6 extensions. |
| OODA Layer (v2.6) | Programme-level OODA tempo. Phase health metrics. Phase dashboards. Command Tempo Dashboard. Bottleneck identification. OODA Tempo Degradation case generation. |
| Surface Layer | Workspaces, dashboards, Operating Pictures (External and Internal), Entity Intelligence Surfaces, Direction Boards, Reporting cadences. Military intelligence UI doctrine. Three application boundaries (Operational App, Tenant Admin, Commercial Control Plane). |

### Ephemeral Asset Classification

SDR distinguishes between persistent assets (servers, workstations, primary identities) and ephemeral assets (containers, short-lived cloud functions, transient compute) and applies appropriate lifecycle, scoring, and coverage logic per class.

### Attack Surface Auto-Positioning

SDR automatically positions assets, identities, applications, and services against the External Attack Surface and Internal Attack Surface based on connector signal, exposure data, and architectural context. The dual attack surface model (Section 5) flows through every relevant engine and surface.

### Extensible Asset Cartography

The canonical entity model is extensible — new asset types, new identity types, new relationship types can be added without doctrinal change. The v2.6 release extends cartography for verdict-emitting entities (policy objects, verdict events) and intelligence stream artefacts.

# 10. Security Tooling & Platform Health

Commander maintains continuous health monitoring of every connected tool. Health signals are organised into:

| Signal Class | Question Answered | Example | Owner |
|---|---|---|---|
| Connector Health | Is the integration working? | API rate limited. OAuth token expired. Webhook silent. | Platform Engineering |
| Platform Health | Is the tool itself working? | Tenable scan engine crashed. CrowdStrike cloud degraded. SIEM pipeline stalled. | Platform Engineering / Security Tooling Admin |
| Configuration Health | Is the tool configured correctly? | Detection rules silenced. Policies in audit-only mode. | Detection Engineering / Security Architecture |
| Verdict Stream Health (v2.6) | Are verdicts flowing as expected? | Antigena verdict volume dropped 80% — connector issue or policy change? | Platform Engineering / Security Operations |

Verdict stream health joins the existing health monitoring as a v2.6 extension. Where the verdict stream from a tool unexpectedly dries up or surges, Commander generates a Tool Health case for investigation.

The verdict semantics framework (Spec #62) treats every verdict as a time-bound claim, supports density aggregation, identifies disagreement between tools on the same entity, and calibrates trust weights per tool over time. Verdicts feed risk scoring as weighted claims rather than as ground truth, recognising that false positives are an operational reality of the verdict stream.

# 11. Security Coverage Control Model

The Coverage Control Model defines, per asset and per identity, the controls that should be present based on the asset's role, environment, sensitivity, and operational model.

Coverage scoring produces three outputs per entity:

- **Coverage Score** — percentage of required controls present and active.
- **Fully Covered Metric** — boolean: is every required control present and operating?
- **Gap List** — explicit enumeration of missing controls with severity.

The Coverage Control Model integrates with the v2.6 Intelligence Layer:

- Coverage gaps feed Posture Intelligence stream
- Coverage gaps drive priority elevation when correlated with active attack signal (Pre-Warned classification)
- Coverage gaps surface in the Control Weakness Direction Board (Spec #70)
- Coverage gaps that the SOC discovers (via Inverse Discovery — Class A signal references entity Commander didn't know required certain coverage) generate Coverage Blindspot cases

Tag-driven composable requirements allow customers to define coverage stacks per environment, business unit, application criticality, or compliance scope without writing custom code.

# 12. API & Connector Management

## 12.1 The Four Connector Classes (v2.6)

Commander's v2.6 architecture organises connectors into four classes by signal purpose:

**Class A — SOC Telemetry Connector.** Consumes case and detection signal from SIEM, XDR, EDR, and NDR platforms. Read-only with respect to SOC operations. Examples: Microsoft Sentinel, Google SecOps (Chronicle), Splunk Enterprise Security, CrowdStrike Falcon, Microsoft Defender for Endpoint, Rapid7 InsightIDR, Darktrace. Tier 2 (named in schedule): Palo Alto XSIAM, IBM QRadar, SentinelOne, Elastic Security, Vectra AI, ExtraHop Reveal(x).

**Class B — Operational Verdict Connector.** Consumes verdict signal from operational security tools that produce real-time security decisions. Email security verdicts (Antigena Email, Defender for Office 365, Mimecast, Proofpoint), endpoint compliance verdicts (Intune, Jamf, Workspace ONE, CrowdStrike prevention, Defender for Endpoint prevention), web filtering verdicts (Zscaler, Netskope, Palo Alto, Cisco Umbrella, Darktrace network), identity policy verdicts (Conditional Access, Okta policies, Defender for Identity, CrowdStrike Falcon Identity Protection), DLP enforcement verdicts (Purview, Symantec, Forcepoint, Code42).

**Class C — Configuration State Connector.** The existing v2.5 connector universe extended. Consumes intended state of controls, assets, identities, and policies. Drives the drift detection engine.

**Class D — Threat Intelligence Connector.** Consumes external threat intelligence — CVE feeds, IOC streams, vendor advisories, KEV updates, threat actor attribution. Drives threat relevance scoring against estate.

## 12.2 Multi-Class Declaration

A single connector may declare against multiple connector classes. Microsoft Defender for Endpoint, for example, is a Class A connector (incident and detection signal), a Class B connector (prevention verdicts), and a Class C connector (policy configuration). The connector is named once, implemented once, and declares against multiple class contracts with separate conformance tiers per class.

Multi-class declaration is what allows Commander to consume the full signal universe from each connected tool without proliferating connectors. The pattern is specified in Spec #61 (Universal Security Signal Connector Contract).

## 12.3 Connector Conformance Tiers

Every connector entry declares a conformance tier per class:

- **Certified** — built, tested against vendor sandbox, conformance test suite running continuously.
- **Full** — built, tested against customer data in pilot.
- **Baseline** — built against vendor documentation, customer-specific tuning expected.
- **Planned** — named in schedule, not yet built.

The conformance tier is visible in `docs/03_api_specs/INDEX.md` and informs customer expectations during deployment planning.

## 12.4 Connector Schedules

The named platforms per connector class are catalogued in `docs/03_api_specs/INDEX.md`, with vendor API specification documents in `docs/03_api_specs/<category>/`. The reference-input tree is governed by `API_SPEC_INTAKE_RULES.md` and sits outside the binding precedence chain per the v2.5.2 increment.

## 12.5 Five-Tier Ingestion

Existing v2.5 ingestion tiers carry forward, with Tier 1 (real-time / event-triggered) extended to include high-volume verdict signal handling per Spec #62 (Verdict Semantics).

## 12.6 Normalisation and Authority Resolution

Existing v2.5 normalisation framework carries forward, extended with verdict-shape object handling and the four signal-purpose taxonomy. Authority resolution rules apply per stream — Posture Intelligence has Primary Authority per domain; External Attack Intelligence is sourced read-only from SOC platforms; Internal Behavioural Intelligence aggregates verdict claims with trust calibration; External Threat Intelligence is enriched per source.

## 12.7 Canonical Entity Model

Extends with verdict-emitting entities (policies, verdict events) and intelligence stream artefacts.

## 12.8 Universal Search

Extends across the v2.6 surfaces — Operating Pictures, Identity Intelligence Surface, Asset Intelligence Surface, OODA dashboards, Direction Boards.

# 13. Case Management & Remediation Lifecycle

Case management is the operational spine of SDR. Every detection, every finding, every remediation action, every validation, and every closure flows through the case management system.

## 13.1 The v2.6 Case Taxonomy

The case taxonomy extends from the v2.5 set with five new case types. The full taxonomy is:

**v2.5 case types (unchanged in v2.6):**

1. Drift case
2. Vulnerability case
3. Identity case (technical identity findings)
4. Exposure case
5. Coverage case
6. Tool Health case
7. Threat Intelligence Estate Match case

**v2.6 new case types:**

8. **External Attack Correlation case** — Commander's parallel record when a SOC case binds to Commander entities. Tracks pre-warned classification, control weakness correlation, and any drift item exposed by the attack. Routes to Commander analyst, not to the SOC. The SOC case in their own system remains the authority on response.

9. **Verdict Pattern case** — Generated when internal behavioural intelligence flags a pattern warranting attention. Verdict count anomalies, behavioural divergence from peers, geographic or temporal clustering, policy-firing concentration. Routes to the customer-configured Internal Risk function. Commander surfaces; the customer investigates.

10. **Inverse Discovery (Coverage Blindspot) case** — Generated when external signal references an entity Commander doesn't know about. Root cause classified (discovery gap, staleness, shadow IT, naming mismatch). Routes to platform or architecture teams for entity onboarding and connector tuning.

11. **Policy Effectiveness case** — Generated when a security policy exhibits a pattern suggesting it isn't working as intended (override rate above threshold, zero-fire anomaly, drift between intended and actual enforcement). Routes to policy owner for retuning, replacement, or formal acceptance.

12. **OODA Tempo Degradation case** — Generated when Commander's own OODA phase health drops below configurable threshold. Routes to SOM or platform team depending on which phase degraded. Restores Commander's operational tempo.

The case taxonomy is fully specified in Spec #08 (Case Management Workflow) v2.6.

## 13.2 Case Lifecycle (carried forward from v2.5)

The closed-loop case lifecycle applies to every case type:

`DETECTED` → `BOUND` → `ROUTED` → `PRIORITISED` → `ACTION_DECOMPOSED` → `IN_PROGRESS` → `PENDING_VALIDATION` → `VALIDATION_RUNNING` → `VALIDATED_*` → `PENDING_CLOSURE_GATES` → `CLOSED_BY_SYSTEM` → `REOPENED_BY_SYSTEM` (when triggered).

No manual case creation. No manual lifecycle progression. No manual closure. Closure is system-owned and gate-driven. Reopening is system-owned and trigger-driven.

## 13.3 Universal Risk Object Contract

Every domain emits or links to a canonical `RiskObject`. The v2.6 release extends the `risk_object_type` enum to include: `external_attack_correlation`, `verdict_pattern`, `coverage_blindspot`, `policy_effectiveness`, `ooda_phase_degradation`.

Universal Risk Object specification is in Spec #29 (Universal Risk Object and Case Binding) v2.6.

## 13.4 Priority Model

The priority model extends from P0–P4 with context-aware drift prioritisation (Spec #74):

- **P0 (Zero-Day)** — emergency priority overlay. Unchanged from v2.5.
- **P1 (Critical)** — critical findings, attack-correlated findings, pre-warned breached assets.
- **P2 (High)** — significant findings, adjacent-zone attack correlation, drift on attacked zones.
- **P3 (Medium)** — standard findings, drift with no active attack correlation.
- **P4 (Low)** — informational findings, low-severity drift, deferred remediation.

The context-aware drift prioritisation matrix modulates priority based on attack context, with decay function and kill switch states detailed in Spec #74.

## 13.5 Existing v2.5 Case Management Capabilities

All existing v2.5 case management capabilities carry forward unchanged: Commander Reviews, push automation savings, workload management, case collaboration (contributor, sub-case, case swarm), user grades, push action governance (referral, impact assessment, rollback, dismissal codes), manual remediation, Security Incident Referral (SIR), batch case processing, case communication (Teams Phase 1, Slack Phase 2, on-demand transcript import), Command Bridge, Operations Channel Broadcast, Case Phase Model (Phase A/Phase B, auto-reroute, retain flag), Continuous Case Revalidation (AUTO-RESOLVED), Case Risk Score (CRS) and Next Best Action, Case Pulse and SOM Operating Modes (MDR/Manual/Hybrid), Team Intelligence and Performance Dashboard, Resolution Durability Score, Business Impact Translation, Case Trajectory, Case Resonance and Conflict Gate, Case Association and Pattern Engine, Commander Thematic Intelligence, Platform Institutional Memory.

# 14. Compliance & Posture Intelligence

Existing v2.5 compliance framework carries forward unchanged. The v2.6 release extends compliance evidence generation to include OODA tempo evidence, intelligence layer evidence, and silent defence reporting as auditable compliance artefacts.

Four-layer compliance model: tool configuration checks → baseline conditions → framework controls → posture score. Pre-built framework mappings for CIS Controls v7/v8, NIST CSF, ISO 27001, SOC 2, PCI-DSS, DORA, NIS2, Cyber Essentials. Custom framework mappings supported.

Evidence pack model: continuously assembled, framework-aligned, audit-export-ready. v2.6 adds OODA tempo trending and Silent Defence reporting as evidence categories.

Regulatory calendar: tracks regulatory deadlines, audit cycles, and attestation dates per tenant. Unchanged from v2.5.

# 15. Detection Model Library & Rule Builder

Approximately 240 built-in detection models across 13 domains, 14 CHAIN rules, full custom rule and model builder, Commander-generated rules. Every case traceable to a model execution. Model dependency and correlation. Endpoint & SaaS Policy Drift sub-domain.

The v2.6 release does not alter the detection model library structure. It extends model output handling to feed the four intelligence streams appropriately:

- Posture-domain model output → Posture Intelligence stream
- Cross-stream correlation → Pre-Warned classification engine
- Architecture intelligence model output → Architecture intelligence within Posture Intelligence stream
- Identity intelligence model output → Identity Intelligence Surface

# 16. SIEM & SOAR Rule Generation

When SDR identifies an exposure that cannot be remediated immediately — whether because of change control constraints, vendor dependencies, business process requirements, or technical limitations — the exposure must not be left unmonitored. SDR addresses this through automated SIEM and SOAR rule generation.

## 16.1 Bidirectional Flow (v2.6)

From v2.6, the SIEM/SOAR rule generation flow is explicitly bidirectional:

**Outbound flow (Commander → SIEM/SOAR teams):** Commander generates platform-agnostic detection specifications. The specifications are dispatched to the SIEM/SOAR engineering team via ITSM remediation dispatch or case management handoff. The SIEM/SOAR team reviews, translates to their platform, tests, and deploys. SDR does not deploy rules directly to SIEM/SOAR platforms.

**Inbound flow (SIEM/SOAR platforms → Commander):** Commander consumes case and detection signal from SIEM/SOAR platforms via Class A connectors. The signal feeds the External Operating Picture, the External Attack Intelligence stream, and the pre-warned classification engine. This is read-only with respect to SOC operations.

Both directions are read-only with respect to SOC operations. Commander never executes against SOC platforms. Commander generates specifications outbound and reads case/detection signal inbound — both protect the SOC's authority over its own operations.

## 16.2 Detection Specification Lifecycle

1. **Exposure Identified.** Commander identifies an exposure that requires monitoring coverage.
2. **Remediation Path Assessed.** Commander determines whether direct remediation is feasible. If not, detection specification is generated as compensating monitoring.
3. **Detection Specification Generated.** Platform-agnostic specification with detection logic, required data sources, recommended response actions, false positive considerations, MITRE ATT&CK mapping.
4. **Reviewed by Analyst/Detection Engineer.** SIEM/SOAR team reviews specification.
5. **Specification Dispatched to SIEM/SOAR Team.** Via ITSM remediation dispatch.
6. **Implementation Reference Captured.** SIEM/SOAR team confirms deployment.
7. **Coverage Validated.** Commander observes inbound signal confirming the rule fires.
8. **Retirement on Remediation.** When root-cause exposure is remediated, Commander flags rule for retirement.

# 17. Identity Intelligence Model

The Identity Intelligence Model is unchanged in core but significantly extended at the surface layer in v2.6.

## 17.1 Core Model (carried forward from v2.5)

Three-stage CHAIN model for identity risk computation. Risk scoring composite of privilege level, entitlement gaps, standing access, MFA/PIM enforcement, dormancy, group health, threat intelligence relevance, and incident history. Group intelligence — group memberships analysed for security health, redundancy, and risk concentration. User investigation profile — per-identity investigation surface with access chain visualisation. High-risk watchlist — continuously computed ranked list of highest-risk identities.

## 17.2 Identity Intelligence Surface (v2.6)

The Identity Intelligence Surface is the dedicated per-identity intelligence picture introduced in v2.6. For any identity, the surface presents:

- **Identity overview** — role, department, lifecycle status, access risk score.
- **Access intelligence** — full entitlement footprint, computed access chains, privileged access, standing admin, group memberships.
- **Behavioural intelligence** — verdict history across all operational tools, policy firing patterns, peer comparison, anomaly indicators.
- **Threat intelligence** — external threats targeting this identity, internal threats from this identity.
- **Case history** — SOC cases involving this identity (via External Attack Correlation), Commander cases (Identity, Verdict Pattern, etc.).
- **Risk trajectory** — risk score evolution over time, driving events.

The Identity Intelligence Surface is the user surface for the customer's identity analysts, insider risk function, and security investigators when concentrated intelligence on a single identity is required. Specified in Spec #68 (Identity Intelligence Surface Specification).

# 18. Commander AI

Existing v2.5 Commander AI architecture carries forward. Four modes (Estate Mode, Engineering Mode, Triage Mode, Reporting Mode). BYOM architecture. Prompt template IP. Admin dashboard. Health monitoring. Output validation. Tiered intelligence model (three levels). Token transparency.

The v2.6 release extends Commander AI grounding rules to include the four intelligence streams as grounded sources, the OODA tempo metrics as grounded operational state, and the Operating Pictures as visual reasoning surfaces where Commander AI can produce contextual analysis.

Commander AI does not autonomously trigger Verdict Pattern cases or Internal Risk surfacing — these remain deterministic rule-driven outputs to preserve audit clarity. Commander AI may provide rationale, narrative, and recommendation on existing cases but does not mutate lifecycle state.

# 19. Additional Functional Capability Areas

Existing v2.5 capabilities carry forward: Asset registry, Vulnerability management, Blast radius, Attack path likelihood engine, Threat intelligence, Security debt register, Refresh planner, Behavioural intelligence, Endpoint & SaaS Policy Drift (guardrails model, SaaS register, batch triage).

## 19.1 Asset Intelligence Surface (v2.6)

The Asset Intelligence Surface parallels the Identity Intelligence Surface for assets. For any asset (device, server, workload, container, application), the surface presents:

- **Asset overview** — type, owner, role, lifecycle status, criticality.
- **Configuration state** — current configuration against intended baseline, drift items, control coverage.
- **Verdict history** — every prevention action, compliance flag, URL block, endpoint detection, network anomaly involving this asset.
- **Behavioural pattern** — relative to peers in the same role or environment.
- **Case history** — Commander cases and correlated SOC cases.
- **Vulnerability state** — current CVEs, patch status, exploitability.
- **Identity exposure** — which identities have touched this asset and with what privilege.

Specified in Spec #69 (Asset Intelligence Surface Specification).

## 19.2 Inverse Discovery Loop (v2.6)

The Inverse Discovery Loop uses external signal to test Commander's own inventory completeness. When external signal (a SOC case, a verdict event, a threat intel hit) references an entity Commander doesn't know about, the lookup failure is itself a finding. Commander generates a Coverage Blindspot case with auto-classified root cause (discovery gap, staleness, shadow IT, naming mismatch) and routes to the appropriate platform or architecture team for entity onboarding.

The Inverse Discovery Loop is what makes Commander's inventory get more honest the longer it runs. Specified in Spec #72 (Inverse Discovery Loop Specification).

# 20. Commercial Model and Licensing

Existing v2.5 commercial model carries forward. Three licensing tiers (Essentials, Professional, Enterprise) with capability boundaries per tier. Self-hosted option for sovereign tenancy requirements. SaaS delivery as primary model. Update and notification model. Trial conversion and ROI evidence.

The v2.6 release introduces capability adjustments:

- **Wide Signal Aperture (four-class connector architecture)** — Essentials includes Configuration State and limited Threat Intelligence; Professional adds SOC Telemetry; Enterprise adds full Operational Verdict and unlimited Threat Intelligence.
- **OODA Dashboard Family** — Professional includes basic OODA phase views; Enterprise includes full Command Tempo Dashboard, four-cadence reporting, and OODA-driven evidence pack generation.
- **Operating Pictures** — External Operating Picture available from Professional; Internal Operating Picture is Enterprise-tier.
- **Identity and Asset Intelligence Surfaces** — Enrichment level scales by tier; Enterprise provides full surfaces with full intelligence stream integration.
- **Internal Risk Investigation Sub-Lifecycle** — Enterprise-only capability with required Internal Risk role configuration.

Detailed entitlement matrix in the Master Technical Specification v7.0 and Commercial Control Plane configuration.

# 21. Platform Administration & Governance

Existing v2.5 administration framework carries forward: Connector dashboard, RBAC, Audit trail, Multi-tenant SSO, Tenant onboarding, Security tool intelligence, Console utilisation tracking.

## 21.1 Configuration Governance for v2.6 Parameters

The v2.6 release introduces a substantial set of configurable parameters across:

- Verdict pattern thresholds (peer-deviation, temporal windows, geographic clustering)
- Verdict trust calibration weights
- Pre-warned classification confidence thresholds
- Inverse discovery filter thresholds
- OODA phase health thresholds
- Policy effectiveness thresholds
- Context-aware drift priority weights and decay parameters
- Internal Operating Picture sensitivity
- Identity Intelligence Surface enrichment configuration

All v2.6 parameters carry system defaults at build, are tenant-customisable via the Tenant Admin surface, are versioned and audited per the existing Tenant Configuration Registry, and are governed by the Commercial Control Plane's baseline profile authority. Detailed in Spec #55 (Baseline Configuration Framework Model and Defaults) v2.6.

# 22. Target Users and Persona Model

The persona model extends from nine to eleven personas in v2.6.

**v2.5 personas (unchanged):**

1. Security Operations Analyst (SOA)
2. Security Operations Manager (SOM)
3. Vulnerability Analyst
4. Security Architect
5. Identity/Access Specialist
6. Risk/Compliance/Audit User
7. M&A/Transformation Analyst
8. CISO
9. Control Owner

**v2.6 new personas:**

10. **Security Analyst.** Cross-domain investigator. Operates the Intelligence Layer, the Operating Pictures, Identity Intelligence Surface, and Verdict Pattern cases. Sits between Security Operations Analyst (case queue triage) and Security Architect (control design). Primary workspace: Drift Operations with extensive Intelligence Layer access. The Security Analyst role consumes the four intelligence streams to hunt, investigate, and surface patterns rather than respond to individual triage items.

11. **Risk Analyst.** Operational risk specialist. Quantifies, models, and reasons about risk as a continuous metric. Consumes the Security Debt Register, Identity Intelligence Surface for risk concentration, Asset Intelligence Surface for asset risk trajectories, and OODA Tempo metrics for operational risk. Reports to enterprise risk management. Distinct from Risk/Compliance/Audit User (which focuses on evidence and attestation); Risk Analyst focuses on operational risk modelling. Primary workspace: Executive Posture with cross-workspace access.

Both new personas have full persona definition in Spec #17 (Target Users and Persona Model) v2.6.

## 22.1 Persona Authority Overlays

Existing four authority overlays carry forward: Administrative authority, Investigation authority, Approval authority, Reporting authority. The v2.6 release adds **Internal Risk authority** as a fifth authority overlay applied to roles with access to Verdict Pattern cases and the Internal Operating Picture's identity-level detail.

# 23. Use-Case Schedule

Use cases per persona are catalogued in Spec #18 (Use-Case Schedule) v2.6, which extends from v2.5 with use cases for the two new personas and the v2.6 surfaces (Operating Pictures, OODA dashboards, Direction Boards, Intelligence Surfaces).

# 24. Workspace Model

The UI is organised around workspaces (jobs-to-be-done), not job titles. Users access workspaces relevant to their persona, authority, and scope.

| **Workspace** | **Purpose** | **Primary Personas** |
| --- | --- | --- |
| Executive Posture | Enterprise risk, trend, posture, governance, compliance alignment | CISO, Risk/Compliance, Risk Analyst |
| Drift Operations | Case queues, triage, operational oversight, escalation, SLA management | SOA, SOM, Security Analyst, Vulnerability Analyst |
| Control & Architecture | Control logic, architecture analysis, exception review, rule/model building | Security Architect, Control Owner |
| Identity & Asset Intelligence | Identity, asset, relationship, ownership analysis | Identity/Access Specialist, Security Architect, Security Analyst |
| Assurance & Audit | Evidence, compliance mapping, exceptions, governance, proof | Risk/Compliance/Audit User |
| Transformation & M&A | Integration, comparative posture, inherited risk, change-programme | M&A/Transformation Analyst |

## 24.1 v2.6 Surface Additions to the Workspace Model

The v2.6 release adds the following surfaces, distributed across workspaces per persona access:

- **External Operating Picture** — Executive Posture, Drift Operations
- **Internal Operating Picture** — Executive Posture (CISO), Drift Operations (Security Analyst, SOM with Internal Risk authority)
- **OODA Dashboard Family** (four phase dashboards + Command Tempo) — Executive Posture (CISO), Drift Operations (SOM)
- **Identity Intelligence Surface** — Identity & Asset Intelligence, Drift Operations (Security Analyst)
- **Asset Intelligence Surface** — Identity & Asset Intelligence, Drift Operations
- **Control Weakness Direction Board** — Drift Operations, Control & Architecture
- **Policy Effectiveness Direction Board** — Control & Architecture, Drift Operations (Security Analyst)
- **Silent Defence Reporting** — Executive Posture, Assurance & Audit

## 24.2 Strategic & Tactical Priority Framework (carried forward and extended)

The Strategic and Tactical Priority Framework specified in Spec #28 carries forward from v2.5 with v2.6 extensions for verdict context modulation, attack-correlated tactical objective auto-promotion, and internal versus external response stream alignment.

CISO sets strategic priorities. SOM sets tactical priorities decomposed from strategic. Commander auto-aligns cases. Priority boost flows. BAU workload protection. Trajectory alerting. Resolution feeds progress. Loop closes.

# 25. Commander's Boundary with the SOC

This section is binding doctrine.

## 25.1 What Commander Does Not Do

Commander does not:

- Triage individual SOC cases
- Run incident response workflow
- Contain active threats
- Execute against SOC platforms (no write operations to Sentinel, SecOps, Splunk, etc.)
- Run incident-level OODA
- Replace any SOC function

The SOC remains the customer's existing function with its existing tooling, unchanged.

## 25.2 What Commander Does in Relation to the SOC

Commander:

- Consumes case and detection signal from SOC platforms via Class A connectors (read-only)
- Generates detection specifications outbound to SIEM/SOAR engineering teams via ITSM dispatch
- Provides estate context for SOC cases (External Attack Correlation case type)
- Surfaces pre-warned classification on attacks landing on the estate
- Runs the programme-level OODA loop above the SOC's incident-level OODA
- Drives remediation of drift exposed by attacks the SOC handles

## 25.3 The Operational Implications

For the CISO: Commander does not replace your SOC. Your SOC continues operating exactly as it does today. Commander gives you the command picture above the SOC — the integration of SOC activity with estate posture, the pre-warned classification, the OODA tempo, the silent defence story.

For the SOC: Commander does not change your workflow. You continue to operate cases in your existing platform. Commander reads from your platform but does not write to it. The detection specifications Commander generates come to you as ITSM tickets that your engineering team owns.

For procurement: Commander is an additive purchase, not a replacement purchase. No existing SOC tooling needs to be retired or replaced. The deployment is parallel, not in-line.

# 26. Commander's Boundary with Insider Risk Programmes

This section is binding doctrine and complements Section 25.

## 26.1 The Verdict Pattern Case Boundary

The Verdict Pattern case type (introduced in v2.6) surfaces internal behavioural patterns that warrant attention. The case routes to the customer-configured Internal Risk function for investigation.

Commander does not:

- Conduct insider risk investigations
- Make determinations of intent
- Initiate disciplinary or legal action
- Hold investigation-grade evidence (Commander holds intelligence-grade evidence)
- Run forensic workflow on identified patterns

Commander:

- Surfaces verdict patterns crossing configurable thresholds
- Classifies the patterns by sub-type
- Routes the case to the customer-owned Internal Risk function
- Tracks the outcome (investigation concluded, disposition recorded)
- Maintains the audit trail

## 26.2 The Customer-Owned Investigation Process

The customer's Internal Risk function — whether organisationally located in the SOC, HR, Legal, Compliance, or a dedicated Insider Risk team — owns:

- The forensic investigation itself
- The HR engagement
- The legal review
- Any disciplinary action
- Any law enforcement referral
- The investigation outcome and disposition

Commander provides intelligence triggers. The customer provides investigation and adjudication.

## 26.3 Jurisdictional Governance

Internal Behavioural Intelligence is subject to jurisdiction-specific regulation, particularly in employee monitoring frameworks (GDPR Article 88, German Works Council provisions, French employee monitoring requirements, US state-level employee surveillance laws). Commander provides:

- Configurable verdict pattern thresholds to align with local employee monitoring norms
- RBAC controls restricting visibility of Verdict Pattern cases
- Audit trail of who accessed verdict pattern data
- Tenant-level configuration to disable Internal Behavioural Intelligence ingestion if required

Customers deploying Commander in jurisdictions with strict employee monitoring frameworks should configure thresholds, RBAC, and disable conditions per local counsel guidance. Commander provides the controls; customers configure them per their legal context.

The full Internal Risk Investigation Sub-Lifecycle is specified in Spec #75.

# 27. Delivery Roadmap

| **Phase** | **Name** | **Key Deliverables** |
| --- | --- | --- |
| 0 | Foundation | Connector framework, canonical entity model, normalisation, drift detection core, case management spine, Commander AI estate mode, basic dashboards. |
| 1 | Core Loop | Full ~240-model library. Custom Rule Builder. Case management full lifecycle. Cognitive Case Handling Engine (CCHE). Vulnerability classification and Vulnerability Case Tracker. Threat intelligence. Identity Intelligence Component 1. Compensating controls framework. Compliance & Standards Module (core frameworks). Coverage Control Model (core). Source authority classification. Canonical entity model. Universal search. Commander AI estate mode. SIEM/SOAR detection specification generation (core). Platform health monitoring. Trust boundary auto-detection. Case Communication (Teams). Command Bridge and Operations Channel. Admin alert queue. Red Button referral sub-case model. Tenant configuration registry (basic). 5+ connectors. First sellable product. |
| 2 | Scale & Automation | 10–20 connectors incl. PAM and cloud IAM. Identity Components 2 & 3. Stage 3 sweep. Event-triggered pull. EDR management. Blast radius with identity layer and attack path likelihood engine. BAS integration. IOC lifecycle with coordinated push groups. Identity push actions. Playbook library. Change control. Security debt with cost estimation. Exception management. Model Builder with test-to-live staging. Full SIEM/SOAR detection specification generation. Design incongruence detection. Full RBAC. Domain Security Dashboards. Strategic & Tactical Priority Framework with case alignment, priority boost, and BAU protection. Slack communication adapter. Full tenant configuration registry. |
| 3 | **v2.6 — Security Command and Control** | **Security C2 doctrine. Security OODA Loop. Intelligence Layer (four streams). External and Internal Operating Pictures. Identity Intelligence Surface. Asset Intelligence Surface. OODA Dashboard Family. Control Weakness and Policy Effectiveness Direction Boards. Silent Defence Reporting. Pre-Warned/Protected/Novel Classification. Inverse Discovery Loop. Context-Aware Drift Prioritisation. Four-Class Connector Architecture with multi-class declaration. Verdict Semantics. Six SOC Telemetry connectors (Sentinel, Defender for Endpoint, Google SecOps, Splunk ES, CrowdStrike Falcon extended, Rapid7 InsightIDR, Darktrace extended). Six new case types. Security Analyst and Risk Analyst personas. Internal Risk Investigation Sub-Lifecycle. SOC and Insider Risk boundaries formalised. Master Proposition v5.0. Master Technical Specification v7.0.** |
| 4 | Scale and Category Consolidation | Tier 2 SOC connectors (XSIAM, QRadar, SentinelOne, Elastic Security, Vectra AI, ExtraHop). Full Operational Verdict connector schedule (20+ platforms). Cross-tenant institutional memory at scale. International expansion. Sovereign tenancy options. Federated deployments. Continued category establishment as Security C2 reaches analyst recognition. |

# 28. Document Family

The Commander SDR document family at v2.6 baseline:

**Master documents:**

- Master Proposition v5.0 (this document)
- Master Technical Specification v7.0
- SDR Control Plane Specification v1.1
- SDR Specification Schedule and Folder Structure v1.9 (revised for v2.6)

**Authority documents:**

- Authority and Precedence v2.6
- Specification Register v2.6
- Current Baseline Manifest v2.6
- Release Notes v2.6

**Child specifications (75 specs at v2.6):**

- Specs #01 through #56 (v2.5.2 baseline, carried forward)
- Spec #57 — Security Command and Control Doctrine (new)
- Spec #58 — Security OODA Loop Specification (new)
- Spec #59 — Intelligence Layer Architecture (new)
- Spec #60 — Internal and External Attack Surface Framework (new)
- Spec #61 — Universal Security Signal Connector Contract (new)
- Spec #62 — Verdict Semantics Specification (new)
- Spec #63–64 — (reserved — connector schedules implemented via `docs/03_api_specs/INDEX.md` updates)
- Spec #65 — External Operating Picture Surface (new)
- Spec #66 — Internal Operating Picture Surface (new)
- Spec #67 — OODA Dashboard Family (new)
- Spec #68 — Identity Intelligence Surface (new)
- Spec #69 — Asset Intelligence Surface (new)
- Spec #70 — Direction Boards (new)
- Spec #71 — Pre-Warned/Protected/Novel Classification (new)
- Spec #72 — Inverse Discovery Loop (new)
- Spec #73 — Silent Defence Reporting (new)
- Spec #74 — Context-Aware Drift Prioritisation Matrix (new)
- Spec #75 — Internal Risk Investigation Sub-Lifecycle (new)

**Reference inputs (outside binding precedence chain):**

- `docs/03_api_specs/` tree with vendor API specifications
- `API_SPEC_INTAKE_RULES.md` governance
- `INDEX.md` catalogue (updated in v2.6 with new SOC Telemetry and Operational Verdict entries)

**Feature registry:**

- SDR Feature Registry FR001 v1.0 (updated for v2.6)

**Reference HTML shells:**

- `commander-sdr-shell-v11-admin-navigation.html`
- `commander-commercial-control-plane-shell-v3-admin-navigation.html`

The Next Stage Approach Pack increments to v1.6 to bind to v2.6 baseline.
