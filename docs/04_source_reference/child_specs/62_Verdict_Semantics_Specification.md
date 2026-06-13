> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #62 — Verdict Semantics Specification

**Document ID:** `62_Verdict_Semantics_Specification.md`
**Spec:** 62
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Foundational Architecture
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture
**Phase:** v2.6 — First-class treatment of verdict signal as time-bound claims with confidence, density, disagreement, and trust calibration.

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `61_Universal_Security_Signal_Connector_Contract_Spec.md`
- `00_AUTHORITY_AND_PRECEDENCE_v2_6.md`

**Subordinate to:** Spec #59 (Intelligence Layer Architecture), Spec #61 (Universal Security Signal Connector Contract). Detailed by: Spec #66 (Internal Operating Picture — verdict overlay), Spec #71 (Pre-Warned Classification — verdict modulation), Spec #73 (Silent Defence Reporting — aggregate verdict reporting).

## 1. Status

This is binding architecture. It defines how Commander treats verdict signal — the security decisions made by operational security tools — as a first-class signal type with specific semantic treatment: time-bound claims, confidence-weighted, density-aggregated, disagreement-aware, and trust-calibrated over time.

## 2. Architectural Statement

Every operational security tool produces **verdicts** — decisions about whether a given activity should be blocked, allowed, quarantined, coached, required to authenticate further, or monitored. Antigena Email blocks a phishing attempt. Intune flags a device as non-compliant. Zscaler blocks an outbound connection to a known C2 domain. Conditional Access denies a sign-in from a restricted geography. Defender for Office 365 quarantines a malicious attachment. Purview DLP blocks an outbound file. CrowdStrike prevents a process execution.

Verdicts are detections that resolved at the tool layer. They are continuous, high-volume, and historically siloed within each operational tool. Commander consumes them as Class B Operational Verdict signal (Spec #61) and treats them with specific semantic discipline because verdicts have unusual properties:

- They are **claims, not facts**. A verdict is a tool's assertion at a moment in time, made with imperfect tuning, against imperfect signal. False positives are an operational reality.
- They are **high volume**. A single Defender for Endpoint deployment in a 10,000-endpoint estate can produce hundreds of thousands of verdicts per day. Storage and processing must be designed for the volume.
- They are **diverse in shape**. Different vendors, different disposition vocabularies, different policy reference models, different confidence scoring conventions.
- They are **valuable in aggregate**. The individual verdict may be uncertain; the aggregate pattern across an entity is informative.

This specification defines the semantic treatment that makes verdicts useful as intelligence without overcommitting to any individual verdict as ground truth.

## 3. Verdicts as Time-Bound Claims

Every verdict carries five mandatory dimensions:

**Identity** — what the verdict was about. The affected entity (mailbox, identity, endpoint, file, URL, network destination, application).

**Time** — when the verdict was made. The verdict timestamp from the source platform, normalised to UTC, with the connector pull timestamp recorded separately.

**Disposition** — what happened. The decision the tool took (block, allow, quarantine, coach, require-MFA, require-compliant-device, monitor, alert, audit).

**Policy reference** — what rule fired. The specific policy, rule, or model in the source tool that produced the verdict.

**Source** — which tool produced it. The connector identifier and source platform identifier.

Three optional dimensions where vendor signal supports:

**Confidence** — how confident was the tool. Vendor-provided confidence score where present (e.g. ML-based tools), absent for binary policy-based tools.

**Severity** — how severe was the determination. Vendor-provided severity (low, medium, high, critical).

**MITRE mapping** — what technique was identified. ATT&CK technique reference where vendor maps it.

The verdict is treated as a **claim made at a point in time**, not as ground truth. The claim has time-bound validity — a verdict from 30 seconds ago is much stronger evidence than a verdict from 30 days ago. The claim has confidence — high-confidence vendor signal is weighted differently from policy-based binary decisions. The claim is attributable — every claim carries source identification and policy reference.

## 4. The Eight Verdict Disposition Types

To enable cross-vendor normalisation, Commander defines eight canonical disposition types. Every vendor verdict maps to one or more canonical disposition:

**`BLOCK`** — the tool prevented the activity from completing. Antigena rejected an inbound email; Zscaler blocked a URL; CrowdStrike killed a process; DLP prevented a file upload.

**`QUARANTINE`** — the tool isolated the activity but did not destroy it. Defender quarantined an attachment; EDR isolated an endpoint; email security held a message for review.

**`COACH`** — the tool warned the user but allowed the activity. Zscaler displayed a coaching page; web filtering presented a warning interstitial; some email security tools insert advisory banners.

**`REQUIRE_MFA`** — the tool required additional authentication to allow the activity. Conditional Access challenged for MFA; Okta required step-up authentication.

**`REQUIRE_COMPLIANT`** — the tool required device compliance to allow the activity. Conditional Access required a managed device; Defender for Endpoint conditional access integration.

**`MONITOR`** — the tool allowed the activity but flagged it for monitoring. CrowdStrike detection without prevention; SIEM alert generation without case promotion.

**`ALLOW`** — the tool explicitly evaluated and allowed the activity. Distinguishable from "no verdict" because the tool recorded an evaluation decision.

**`AUDIT`** — the tool recorded the activity for audit purposes without taking action. DLP policy in audit mode; identity policies in report-only mode.

Vendor-specific verdicts that don't fit cleanly into the eight types are mapped to the closest canonical disposition with the vendor-specific detail preserved in the normalised verdict object's metadata.

## 5. Verdict Density Aggregation

Individual verdicts are claims of uncertain ground truth. The aggregate pattern across an entity is more reliable signal. Commander computes verdict density at multiple aggregation levels:

**Per-entity density** — verdict count for a specific entity over configurable time windows (last 1h, 24h, 7d, 30d).

**Per-policy density** — verdict count for a specific policy across all affected entities.

**Per-disposition density** — verdict count by canonical disposition type (e.g. BLOCK count versus ALLOW count).

**Per-source density** — verdict count per source tool.

**Cross-axis density** — verdict count along multiple axes (e.g. BLOCK verdicts on email security for specific identity over last 7d).

Density aggregation is computed continuously and stored as denormalised aggregate tables for fast query, with the underlying verdict events stored in tiered storage (recent verdicts in hot tier, older verdicts in summary form in cold tier).

**Density informs:**
- Risk scoring inputs (existing v2.5 summary counter framework extended)
- Behavioural anomaly detection (peer-group comparison)
- Internal Operating Picture overlay intensity
- Silent Defence Reporting aggregate counts

## 6. Verdict Disagreement Detection

When multiple tools produce contradictory verdicts on the same entity at the same time, the disagreement is information. Commander surfaces these disagreements as a meta-signal.

**Disagreement patterns:**

- **Block-Allow disagreement** — Tool A blocks, Tool B allows on the same entity. Possible novel TTP, possible policy mistuning, possible legitimate edge case.
- **Severity disagreement** — Tool A flags critical, Tool B flags low on related events. Suggests differing risk models or differing visibility.
- **Cross-layer disagreement** — email security flags, endpoint allows the resulting download. Suggests layer mistuning or genuine layered defence functioning correctly (defence in depth — sometimes the second layer catches what the first missed, sometimes neither catches anything novel).

**Disagreement processing:**

When disagreement is detected, Commander generates a candidate Policy Effectiveness case (Spec #08 v2.6) if the disagreement persists across multiple events or affects sufficiently many entities. Single-event disagreements are logged but do not generate cases — they are noise. Pattern disagreements generate cases.

Configurable thresholds determine when pattern disagreement crosses into case generation:
- Minimum event count over time window
- Minimum entity count affected
- Disposition delta significance (BLOCK-ALLOW is significant; MONITOR-ALLOW may not be)

## 7. Verdict Trust Calibration

Commander calibrates the trust weight applied to each tool's verdicts over time, based on the correlation between that tool's verdicts and confirmed cases (External Attack Correlation cases, validated Drift cases, confirmed Vulnerability cases).

**Calibration approach:**

- Initial trust weights are vendor-default at deployment (e.g. CrowdStrike verdicts default to weight X, Antigena default to weight Y, based on industry observation and tunable per tenant)
- As the tenant operates, Commander observes:
  - Verdicts that preceded confirmed cases (the verdict was predictive — increase trust weight)
  - Verdicts that did not correlate with any subsequent case or evidence (no signal — no change)
  - Verdicts that were overridden by analyst action and proved correct in retrospect (the verdict was right despite being overridden — increase trust weight)
  - Verdicts that were overridden by analyst action and proved wrong (the verdict was the false positive — decrease trust weight)
- Trust weights adjust gradually with configurable learning rate
- Trust weights are visible to tenant admins and manually overridable

**Trust calibration informs:**

- Verdict contribution to risk scoring (higher trust → higher weight in score)
- Verdict contribution to pre-warned classification confidence (Spec #71)
- Verdict ordering in the Internal Operating Picture (higher trust verdicts surface first)
- Verdict aggregation weighting in Silent Defence Reporting

**Trust calibration constraints:**

- Trust weights cannot drop below a configurable floor (a tool with low trust is still informative; it doesn't become invisible)
- Trust weights cannot rise above a configurable ceiling (no tool achieves ground-truth status — verdicts remain claims)
- Calibration is per-tool and per-disposition (a tool might be high-trust for BLOCK verdicts but lower-trust for QUARANTINE verdicts based on observed patterns)
- Calibration history is audit-logged

## 8. High-Volume Storage and Processing

Verdict volume is the architectural challenge of the verdict layer. A 10,000-endpoint estate with full Class B connector coverage produces:

- Email security: ~5,000-10,000 verdicts per day (inbound mail with disposition)
- Endpoint compliance: ~1,000-5,000 verdicts per day (compliance evaluations)
- Endpoint prevention (EDR): ~50,000-200,000 verdicts per day (ASR rule firings, prevention actions)
- Web filtering: ~100,000-500,000 verdicts per day (URL evaluations with disposition)
- Identity (Conditional Access): ~10,000-50,000 verdicts per day
- DLP: ~1,000-10,000 verdicts per day (policy evaluations)

Total: potentially 200,000-800,000 verdict events per day in a single large estate.

**Storage tiering:**

- **Hot tier (24-72 hours)** — full verdict event detail in queryable form. Used by Internal Operating Picture near-real-time, by individual verdict drill-down, by recent correlation queries.
- **Warm tier (3-30 days)** — verdict event detail in compressed/columnar form. Used by 7-day and 30-day trending, by case investigation queries.
- **Cold tier (30+ days)** — summary aggregations only (density counts per entity per disposition per time window). Used by long-term trending, by board-level reporting.

Storage tier transitions are automatic per tenant retention policy.

**Processing approach:**

- Verdict ingestion processed in streaming pipeline (not batch)
- Density aggregations updated incrementally as verdicts arrive
- Disagreement detection runs in streaming pipeline on per-entity verdict groupings
- Trust calibration runs nightly as batch reconciliation against case outcomes

## 9. Verdict-to-Case Generation Rules

Verdicts do not generate cases individually. Cases are generated from verdict patterns or correlations:

**Verdicts contribute to Verdict Pattern cases (Spec #08 v2.6):**
- Aggregate verdict density on an identity crosses threshold (Spec #75 Internal Risk Investigation Sub-Lifecycle details)
- Peer-group deviation in verdict pattern crosses threshold
- Specific concerning sequences (e.g. impossible travel + DLP block + unusual file access)

**Verdicts contribute to Policy Effectiveness cases (Spec #08 v2.6):**
- Override rate above threshold
- Zero-fire anomaly
- Disagreement pattern across tools

**Verdicts contribute to Pre-Warned Classification on External Attack Correlation cases (Spec #71):**
- Verdict that fired on a pre-warned asset and held (defence worked)
- Verdict that fired but was overridden (defence bent)
- No verdict at all on an attacked asset (blind spot)

**Verdicts contribute to Inverse Discovery cases (Spec #72):**
- Verdict references an entity Commander doesn't know about

**Verdicts do not generate cases for Silent Defence Reporting:**
- Silent Defence Reporting (Spec #73) is dashboard-only, no case generation, per Option A confirmed
- Verdicts feed the aggregate reporting without triggering individual case lifecycle

## 10. Vendor Mapping Layer

Each Class B Operational Verdict connector includes a vendor mapping layer that translates vendor-specific verdict semantics into the canonical model:

**Mapping responsibilities:**
- Vendor disposition → canonical disposition (eight types)
- Vendor severity → canonical severity (low, medium, high, critical)
- Vendor confidence → normalised confidence (0.0-1.0)
- Vendor policy reference → canonical policy identifier
- Vendor entity reference → canonical entity binding

**Vendor mapping is per-connector**, captured in the connector specification under `docs/03_api_specs/<category>/<vendor>_<product>_v<n>.docx` per the v2.5.2 reference-input tree governance.

**Vendor mapping versioning** — when a vendor changes its disposition vocabulary or policy reference model, the connector spec is versioned (per `API_SPEC_INTAKE_RULES.md`) and the mapping layer updated accordingly.

## 11. Configurability

Verdict semantics framework exposes the following configurable parameters per tenant (Spec #55 v2.6):

- Verdict density aggregation windows (1h, 24h, 7d, 30d — configurable)
- Disagreement detection thresholds (minimum event count, entity count, disposition delta)
- Trust calibration learning rate
- Trust weight floors and ceilings per tool
- Manual trust weight overrides per tool
- Per-vendor disposition mapping overrides (where customer disagrees with default mapping)
- Hot/warm/cold storage tier durations

System defaults shipped at build. Baseline configuration profiles (Spec #55) cover verdict semantics configuration for industry segments.

## 12. Audit Events

- `VERDICT_INGESTED` — every verdict event (log-tier audit, high volume)
- `VERDICT_DENSITY_AGGREGATION_UPDATED` — periodic aggregation refresh
- `VERDICT_DISAGREEMENT_DETECTED` — when tool disagreement crosses threshold
- `VERDICT_TRUST_WEIGHT_ADJUSTED` — when trust calibration updates a tool's weight
- `VERDICT_TRUST_WEIGHT_MANUALLY_OVERRIDDEN` — when admin overrides calibration
- `VENDOR_MAPPING_VERSION_UPDATED` — when vendor mapping spec is updated
- `VERDICT_STORAGE_TIER_TRANSITIONED` — when verdicts move from hot to warm or warm to cold

## 13. Acceptance Criteria

Verdict Semantics framework is correctly implemented when:

- Every Class B Operational Verdict connector normalises against the eight canonical dispositions
- Verdict events carry the five mandatory dimensions and the three optional dimensions where available
- Density aggregation operates at multiple axes (entity, policy, disposition, source, cross-axis)
- Disagreement detection identifies pattern disagreements and generates candidate Policy Effectiveness cases
- Trust calibration adjusts weights based on correlation with confirmed cases
- High-volume storage tiering operates within retention policy
- Verdict-to-case generation rules apply correctly (individual verdicts don't generate cases; patterns do)
- Vendor mapping layer translates per connector
- Configurability is exposed via Tenant Admin
- Audit events flow to the audit infrastructure

## 14. Relationship to Other v2.6 Specifications

- **Spec #59 (Intelligence Layer Architecture)** — verdicts feed Internal Behavioural Intelligence stream
- **Spec #61 (Universal Security Signal Connector Contract)** — Class B connectors produce verdicts
- **Spec #66 (Internal Operating Picture)** — primary visual consumer of verdict density
- **Spec #71 (Pre-Warned/Protected/Novel Classification)** — verdict outcomes inform classification (defence worked, defence bent, blind spot)
- **Spec #73 (Silent Defence Reporting)** — aggregate verdict consumer (dashboard-only, no cases)
- **Spec #74 (Context-Aware Drift Prioritisation Matrix)** — verdict context modulates drift priority
- **Spec #75 (Internal Risk Investigation Sub-Lifecycle)** — governance for verdict pattern investigation
- **Spec #08 v2.6 (Case Management Workflow)** — Verdict Pattern and Policy Effectiveness case types

## 15. Versioning and Supersession

This is v1.0 of the Verdict Semantics Specification. The eight-disposition canonical model is structural and is expected to remain stable. Density aggregation, disagreement detection algorithms, and trust calibration approaches may evolve as pilot data informs refinement.

This specification does not supersede any v2.5.2 specification. It introduces a semantic framework that operates on the new Class B Operational Verdict signal class introduced in v2.6.
