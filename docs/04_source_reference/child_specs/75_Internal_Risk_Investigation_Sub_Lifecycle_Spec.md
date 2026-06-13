> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #75 — Internal Risk Investigation Sub-Lifecycle Specification

**Document ID:** `75_Internal_Risk_Investigation_Sub_Lifecycle_Spec.md`
**Spec:** 75
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Governance Specification
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `60_Internal_and_External_Attack_Surface_Framework_Spec.md`
- `62_Verdict_Semantics_Specification.md`
- `66_Internal_Operating_Picture_Surface_Spec.md`
- `68_Identity_Intelligence_Surface_Spec.md`

## 1. Status

Binding governance specification. Defines the sub-lifecycle that applies to Verdict Pattern cases and other internal-attack-surface signals where Commander surfaces patterns and the customer's Internal Risk function owns investigation.

## 2. Governance Statement

Commander operates as the **surface and routing layer** for internal attack surface activity. Commander does not investigate insiders, does not determine intent, does not initiate disciplinary action, does not hold investigation-grade evidence (only intelligence-grade evidence), and does not run forensic workflow.

The customer's Internal Risk function — wherever organisationally located (SOC, HR, Legal, Compliance, dedicated Insider Risk team) — owns:

- The investigation itself
- The HR engagement
- The legal review
- Any disciplinary action
- Any law enforcement referral
- The investigation outcome and disposition

This boundary is binding doctrine. Commander provides intelligence triggers and audit trail. The customer provides investigation and adjudication.

## 3. The Verdict Pattern Case Sub-Lifecycle

When a Verdict Pattern case is generated (per Spec #08 v2.6 case taxonomy), it enters a sub-lifecycle distinct from technical remediation cases:

### 3.1 Surface Phase

The case is surfaced in Commander with:

- **Pattern description** — what verdict pattern crossed threshold (peer-group deviation, geographic anomaly, density spike, specific concerning sequence, etc.)
- **Affected identity reference** — the canonical identity the pattern relates to (with RBAC restrictions on identity-level detail per Spec #66)
- **Pattern severity** — based on configured thresholds
- **Pattern context** — relevant verdict events that contributed to the pattern, with timestamps and dispositions
- **No determination of intent** — the case carries the pattern, not a judgement

### 3.2 Triage Phase

Commander analysts with Internal Risk authority review the pattern:

- **Confirm pattern significance** — is the pattern operationally meaningful or noise?
- **Suppress noise** — patterns determined to be false positives are suppressed with auto-suppression rule generation for similar future patterns
- **Route confirmed patterns** — patterns determined to warrant investigation are routed to the customer's Internal Risk function

### 3.3 Routing Phase

Routing per Spec #31 v2.6 sends the case to the customer-configured Internal Risk function:

- **Default routing** — Internal Risk team / Insider Risk Management lead
- **Sub-routing by pattern type** — geographic anomalies may route differently from DLP-pattern verdicts depending on customer organisational structure
- **Escalation paths** — for patterns involving privileged identities, executive identities, or specific business areas

Commander tracks the routing but does not enter the investigation.

### 3.4 Customer Investigation Phase

The customer's Internal Risk function conducts the investigation. Commander's role during this phase:

- **Maintain audit trail** of investigation handoff and outcome notification
- **Provide intelligence support** when requested — Identity Intelligence Surface access for investigators, additional context queries via Commander AI in investigation mode (where licensed)
- **Preserve evidence** in intelligence-grade form — verdict events relevant to the investigation are preserved per investigation retention policy, separately from standard verdict retention

Commander does not:
- Run the investigation
- Interview anyone
- Make determinations
- Take action against the identity
- Generate disciplinary documentation
- Make recommendations on disposition

### 3.5 Outcome Phase

The customer's Internal Risk function provides outcome disposition back to Commander:

- **No issue identified** — pattern explained, case closed, suppression rule generated for similar patterns from this identity
- **Issue addressed** — investigation found issue, action taken outside Commander, case closed with outcome reference
- **Ongoing concern** — investigation continues; case kept open in Commander for ongoing intelligence tracking
- **Privileged outcome** — outcome details not shared with Commander; case closed with placeholder reference (used when legal privilege or HR confidentiality applies)

The outcome disposition is audit-logged and is used for trust calibration of pattern thresholds going forward.

### 3.6 Closure Phase

Case closes when outcome disposition is received. Closure record includes:

- Pattern that triggered the case
- Internal Risk function that received the routing
- Time from generation to closure
- Outcome category (one of four above)
- Outcome reference (where shared)
- Suppression rule generation (where applicable)

## 4. Identity-Level Access Governance

Access to identity-level detail within the Verdict Pattern case sub-lifecycle requires **Internal Risk authority** (Spec #19 v2.6 RBAC matrix). The authority gates access to:

- Identity Intelligence Surface behavioural section (Spec #68)
- Internal Operating Picture identity-level detail (Spec #66)
- Verdict Pattern case full detail (the pattern is visible without authority; the identity-level detail requires authority)
- Verdict drill-through to individual verdict events
- Evidence pack generation

**Internal Risk authority is granular:**

- May be granted per-investigation (time-bounded access to specific identities for specific cases)
- May be granted persistent (ongoing access for the customer's Internal Risk team)
- May be granted with scope restrictions (e.g. authority for non-executive identities only, with separate authority required for executive identities)

All access under Internal Risk authority is audit-of-access logged with:
- Accessor identity
- Accessed identity
- Access timestamp
- Access purpose (case reference where applicable)
- Specific surface/section accessed

## 5. Jurisdictional Configuration

Internal Behavioural Intelligence is subject to jurisdiction-specific regulation:

- **GDPR Article 88** — Member State conditions for processing of personal data in employment context
- **German Works Council provisions** — co-determination on employee monitoring systems
- **French employee monitoring** — declaration to CNIL, employee notification requirements
- **US state-level surveillance laws** — varying notice and consent requirements per state
- **UK ICO guidance on workplace monitoring**

Tenant configuration must support compliance with applicable jurisdictions:

- **Disable ingestion** of Internal Behavioural Intelligence stream entirely for jurisdictions where monitoring isn't permitted
- **Restrict pattern types** — some pattern types may be permitted while others are not (e.g. geographic anomalies permitted, behavioural divergence not)
- **Threshold configuration** — local norms may require higher thresholds before patterns warrant attention
- **RBAC restriction** — local norms may require specific roles or formal employee representative involvement
- **Audit transparency** — some jurisdictions require employee access to their own monitoring records (Commander does not surface this directly to employees but provides export capability for customers who need to support such access requests)
- **Retention restriction** — some jurisdictions limit retention of behavioural monitoring data

Customers deploying Commander in jurisdictions with strict employee monitoring frameworks should configure thresholds, RBAC, retention, and disable conditions per local counsel guidance. Commander provides the controls; customers configure them per their legal context.

## 6. Evidence Handling

Commander holds **intelligence-grade evidence**, not **investigation-grade evidence**. The distinction:

**Intelligence-grade evidence:**
- Sufficient for pattern identification and surfacing
- Sufficient for routing decisions and prioritisation
- Sufficient for explaining "why does Commander think this warrants attention?"
- NOT sufficient for legal proceedings, HR adjudication, or disciplinary action

**Investigation-grade evidence:**
- Forensically sound chain of custody
- Source platform native export with cryptographic verification
- Held by the customer's Internal Risk function or their forensic provider
- Subject to legal hold processes

When a Verdict Pattern case routes to the customer's Internal Risk function, the case provides intelligence-grade context. If investigation requires forensic-grade evidence, the customer's investigators retrieve it from the original source platforms (the SOC stack, the operational tools) under their own evidence handling procedures.

Commander never represents itself as a source of investigation-grade evidence. Documentation, sales conversations, and customer engagements must maintain this distinction.

## 7. Cross-Boundary Coordination

Verdict Pattern cases sometimes correlate with other case types:

- **External Attack Correlation case** involving the same identity (was the identity also targeted externally? — possible compromise indicator)
- **Identity case** flagging privilege drift on the same identity
- **Coverage case** on a device the identity uses

Commander surfaces cross-boundary correlation but does not collapse the cases. Each case retains its own sub-lifecycle and routing. The Internal Risk investigator may use the correlations as context; the technical remediation cases continue through their normal closed loop.

## 8. Build Readiness

Internal Risk Investigation Sub-Lifecycle is build-ready when:

- Verdict Pattern cases follow the six-phase sub-lifecycle per Section 3
- Identity-level access governance per Section 4 enforced
- Jurisdictional configuration per Section 5 exposed
- Evidence handling per Section 6 documented and respected
- Cross-boundary coordination per Section 7 operational
- All access audit-logged per Section 4
- The boundary (Commander surfaces, customer investigates) is unviolated

## 9. Configurability

Per Spec #55 v2.6:

- Pattern threshold configuration
- Internal Risk authority granularity (per-investigation / persistent / scoped)
- Jurisdictional disable conditions
- Retention configuration per pattern type
- Outcome disposition categories (customer-configurable beyond defaults)
- Cross-boundary correlation enable/disable

## 10. Audit Events

- `VERDICT_PATTERN_CASE_GENERATED`
- `VERDICT_PATTERN_TRIAGE_COMPLETED`
- `VERDICT_PATTERN_ROUTED_TO_INTERNAL_RISK`
- `INTERNAL_RISK_AUTHORITY_INVOKED` — every use of authority for identity-level access
- `VERDICT_PATTERN_OUTCOME_RECORDED`
- `VERDICT_PATTERN_CASE_CLOSED`
- `INTERNAL_RISK_INVESTIGATION_BOUNDARY_VIOLATION_ATTEMPTED` — if any process attempts to cross the boundary (should never occur in production but enforcement is logged)

## 11. Relationship to Other v2.6 Specifications

- **Spec #57 (Security C2 Doctrine)** — boundary discipline doctrine
- **Spec #59 (Intelligence Layer)** — Internal Behavioural Intelligence stream governance
- **Spec #60 (Attack Surface Framework)** — internal attack surface response model
- **Spec #62 (Verdict Semantics)** — verdict pattern generation
- **Spec #66 (Internal Operating Picture)** — surface that requires Internal Risk authority for identity detail
- **Spec #68 (Identity Intelligence Surface)** — surface that requires Internal Risk authority for behavioural section
- **Spec #08 v2.6 (Case Management)** — Verdict Pattern case type
- **Spec #31 v2.6 (Routing Model)** — Internal Risk role routing
- **Spec #19 v2.6 (RBAC)** — Internal Risk authority

## 12. Versioning

v1.0 — initial specification. Governance approach expected to evolve based on customer deployment experience, regulatory development, and operational learning. The boundary discipline (Commander surfaces, customer investigates) is structural and will remain stable across versions.
