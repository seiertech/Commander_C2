> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #71 — Pre-Warned/Protected/Novel Classification Specification

**Document ID:** `71_Pre_Warned_Protected_Novel_Classification_Spec.md`
**Spec:** 71
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Foundational Classification
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `57_Security_Command_and_Control_Doctrine_Spec.md`
- `59_Intelligence_Layer_Architecture_Spec.md`
- `60_Internal_and_External_Attack_Surface_Framework_Spec.md`
- `62_Verdict_Semantics_Specification.md`

## 1. Status

Binding architectural classification. Defines the three-way classification (pre-warned / protected / novel) applied to every external attack landing on the estate, including the engine that produces classifications, the audit-grade record-keeping, and the integration with case routing, priority engine, and Operating Pictures.

## 2. Classification Statement

Commander classifies every external attack landing on the estate against its prior knowledge of the affected entity. The classification is one of three values:

- **Pre-warned** — Commander had flagged the entity as exposed (drift, control gap, coverage deficit) before the attack occurred. The attack landing was foreseeable; the foresight is auditable.
- **Protected** — Commander considered the entity fully protected (no drift, no control gap, no coverage deficit) at attack open time. The attack landed despite Commander's posture assessment indicating protection.
- **Novel** — Classification too ambiguous to determine yet (early-stage SOC case, entity resolution still resolving, posture data stale).

The three-way classification is unique to Commander. No other security platform produces this classification because no other platform integrates SOC case telemetry with continuous posture state in real time.

The classification is one of the five structural capabilities of Security Command and Control per Spec #57 Section 6.3.

## 3. The Classification Engine

When a SOC case is bound to Commander via Class A connector intake, the Pre-Warned Classification Engine executes:

### 3.1 Entity Resolution Phase

For each entity referenced in the SOC case (affected user, affected device, affected resource), the engine:

- Looks up the entity in Commander's canonical entity model
- Resolves to canonical entity ID or determines unresolved
- If unresolved → fires Inverse Discovery (Spec #72) and pauses classification pending resolution
- If resolved → proceeds to posture assessment

### 3.2 Posture Assessment Phase

For each resolved entity, the engine retrieves Commander's posture state as of the SOC case open timestamp:

- **Drift findings** — were any active Drift cases bound to the entity at case open time?
- **Coverage gaps** — were any active Coverage cases bound to the entity?
- **Exposure findings** — were any active Exposure cases bound to the entity?
- **Control state** — were any known control weaknesses on the entity?

The look-back window respects retention policy. Where posture data is unavailable at the case open timestamp, the classification engine notes the data gap and may fall to "novel" depending on configuration.

### 3.3 Classification Decision Phase

Based on the posture assessment:

- **Any active drift / coverage gap / exposure / known control weakness on the entity at case open time** → **PRE-WARNED**. The drift item that constituted the warning is bound to the External Attack Correlation case.
- **No active warning items on the entity, posture data current** → **PROTECTED**. The case is flagged for higher-priority investigation (novel TTP possible, sophisticated adversary, internal compromise).
- **Posture data stale or unresolved entity** → **NOVEL**. The case carries the classification "novel" until posture data refreshes and the classification can be revisited.

### 3.4 Audit Record

Every classification produces an immutable audit record:

- Case ID (Commander's External Attack Correlation case ID + SOC platform case ID)
- Entity ID(s) classified
- Classification result
- Posture state captured at case open time (drift findings, coverage state, exposure state)
- Engine version
- Classification timestamp
- Subsequent reclassification events (if posture data refreshes and reclassification occurs)

The audit record is the basis for the "what Commander knew when" evidence used in audit narrative and compliance reporting.

## 4. Confidence and Reclassification

The classification has an associated confidence value:

- **High confidence** — entity fully resolved, posture data current and complete
- **Medium confidence** — entity resolved, posture data current but with gaps
- **Low confidence** — entity partially resolved or posture data stale

When new posture data arrives or new SOC case detail emerges, classification may be revisited:

- **Pre-warned → confirmed pre-warned** — additional drift items identified, classification strengthens
- **Novel → pre-warned** — posture data refresh reveals prior drift item, classification firms up
- **Protected → pre-warned** — late-arriving signal reveals prior drift Commander had missed (this is itself a signal — Inverse Discovery applies)
- **Pre-warned → protected** — the apparent drift item is invalidated (rare; usually false positive in original drift detection)

All reclassifications are audit-logged with rationale.

## 5. Defence-Worked Annotation

In addition to the three-way classification, External Attack Correlation cases may carry a **Defence Worked** annotation when verdict-layer correlation indicates that Commander-relevant defence prevented or contained the attack:

- Verdict fired on the entity within the attack window → verdict-layer defence engaged
- Pre-warned drift item had a compensating control or in-progress remediation that may have limited blast radius

The Defence Worked annotation does not change the three-way classification (the entity may still have been pre-warned even if defence subsequently worked). It is an overlay observation that informs the Operating Picture rendering (green ring overlay per Spec #65 Section 3.3).

## 6. Priority Integration

Pre-Warned Classification feeds the priority engine (Spec #28 v2.6 + Spec #74 Context-Aware Drift Prioritisation):

- **Pre-warned attacks**: the drift item that constituted the warning is auto-elevated to P1 priority (or higher if already P0). The drift case is bound to the External Attack Correlation case as a parent case.
- **Protected attacks**: the External Attack Correlation case is auto-elevated to P1 priority, with the highest priority tier reserved for protected attacks involving identity compromise or mission-critical assets.
- **Novel attacks**: the case carries the priority determined by SOC severity, awaiting reclassification.

The priority elevation flows through the Decide phase of the OODA loop (Spec #58).

## 7. Operating Picture Rendering

Pre-Warned Classification drives the visual conventions on the External Operating Picture (Spec #65 Section 3.3):

- Amber ring → pre-warned
- Blue ring → protected
- Grey ring → novel
- Green ring overlay → defence worked

Visual conventions are consistent and accessible (high contrast against the tactical canvas; alternative pattern markers available where colour accessibility configuration is enabled).

## 8. Audit and Reporting Use

The Pre-Warned Classification record is one of the most consequential audit artefacts Commander produces. It is used in:

- **Board reporting** — *"This quarter, X% of attacks landed on assets we had pre-warned. Y% landed on assets we considered protected — these are our true unknowns."*
- **Regulatory reporting** — evidence that the security function had visibility of the conditions that enabled an attack
- **Insurance claims** — evidence of due diligence in posture management before an attack
- **Litigation** — defensible record of what the security function knew and when
- **Investment decisions** — pre-warned distribution by domain identifies underfunded remediation areas

The classification language ("pre-warned") is deliberately chosen for audit and reporting clarity. Alternatives like "exposed" or "vulnerable" are operational language; "pre-warned" emphasises the temporal foresight aspect that makes the classification valuable.

## 9. Sensitivity Considerations

The Pre-Warned classification surfaces uncomfortable truth: assets the security function knew were exposed and didn't remediate before attack. This is intentional. The value of the classification is precisely that it surfaces this gap.

However, the classification is sensitive in some contexts:

- Regulatory contexts where pre-warned status could be construed as negligence (jurisdiction-specific)
- Internal political contexts where teams responsible for the unmedicated drift may resist the classification
- Audit contexts where pre-warned counts inform external attestation

Tenant configuration allows:
- Disabling the pre-warned classification language while keeping the underlying classification engine (renders as "drift-correlated" without the temporal framing)
- Configurable visibility — pre-warned classification may be CISO-only in some tenant configurations
- Audit trail of all access to pre-warned classification reports

System default is full classification language enabled for all roles with External COP access.

## 10. Configurability

Per Spec #55 v2.6:

- Posture look-back window (default at case open time; configurable)
- Drift item significance threshold (only Drift cases above this severity contribute to pre-warned classification)
- Coverage gap significance threshold
- Classification language (full / softened / disabled)
- Reclassification policy (auto-reclassify on new posture data / manual reclassification only)
- Confidence threshold for high/medium/low buckets

## 11. Build Readiness

Pre-Warned Classification Engine is build-ready when:

- Engine fires on every External Attack Correlation case
- Entity resolution operates per Section 3.1
- Posture assessment operates per Section 3.2
- Classification decision operates per Section 3.3
- Audit record produced per Section 3.4
- Confidence and reclassification operate per Section 4
- Defence Worked annotation operates per Section 5
- Priority integration per Section 6 fires correctly
- Operating Picture rendering per Section 7 displays correctly
- Configurability exposed via Tenant Admin

## 12. Audit Events

- `PRE_WARNED_CLASSIFICATION_COMPUTED` — every classification event
- `PRE_WARNED_RECLASSIFICATION` — when classification changes
- `PRE_WARNED_ENTITY_RESOLUTION_FAILED` — triggers Inverse Discovery
- `PRE_WARNED_AUDIT_RECORD_GENERATED` — when audit record is created
- `PRE_WARNED_REPORT_ACCESSED` — when classification-based reports are accessed

## 13. Relationship to Other v2.6 Specifications

- **Spec #57 (Security C2 Doctrine)** — Pre-Warned Classification is one of the five structural capabilities
- **Spec #58 (Security OODA Loop)** — classification fires in Orient phase
- **Spec #59 (Intelligence Layer)** — cross-stream correlation joining External Attack with Posture
- **Spec #60 (Attack Surface Framework)** — applies to external attack surface
- **Spec #62 (Verdict Semantics)** — verdict layer informs Defence Worked annotation
- **Spec #65 (External Operating Picture)** — visual rendering
- **Spec #72 (Inverse Discovery Loop)** — fires on entity resolution failure
- **Spec #28 v2.6 (Strategic and Tactical Priority Framework)** — priority elevation
- **Spec #74 (Context-Aware Drift Prioritisation)** — feeds drift priority
- **Spec #08 v2.6 (Case Management)** — External Attack Correlation case type

## 14. Versioning

v1.0 — initial specification.
