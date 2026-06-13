> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #74 — Context-Aware Drift Prioritisation Matrix Specification

**Document ID:** `74_Context_Aware_Drift_Prioritisation_Matrix_Spec.md`
**Spec:** 74
**Version:** v1.0
**Status:** Approved Baseline — v2.6 Prioritisation Architecture
**Date:** May 2026
**Owner:** Johann / Commander SDR Architecture

**Authority baseline:**
- `Commander_SDR_Master_Proposition_v5_0.md`
- `28_Strategic_and_Tactical_Priority_Framework_Spec.md` (v2.6 addendum)
- `59_Intelligence_Layer_Architecture_Spec.md`
- `71_Pre_Warned_Protected_Novel_Classification_Spec.md`

## 1. Status

Binding prioritisation architecture. Defines the Context-Aware Drift Prioritisation Matrix that modulates drift case priority based on attack context, threat intelligence relevance, and verdict layer activity.

## 2. Architectural Statement

The existing v2.5 priority model (P0/P1/P2/P3/P4) places findings on a fixed severity-based scale. The v2.6 Intelligence Layer (Spec #59) adds new context that should modulate this priority:

- A drift item on an asset currently under external attack is more urgent than the same drift item on an asset with no attack activity
- A drift item that involves a control with known KEV-listed exploit is more urgent than the same drift item without active exploit
- A drift item on an asset where the verdict layer is firing concerning patterns is more urgent than the same drift item on an unremarkable asset

The Context-Aware Drift Prioritisation Matrix integrates these context signals into priority computation, while preserving the existing v2.5 priority scale and existing v2.5 priority discipline.

## 3. The Matrix

For each Drift case, the priority engine computes a **context modulation score** based on five dimensions:

### 3.1 Attack Context Dimension

- **Direct attack**: an active External Attack Correlation case is bound to the same entity as the Drift case → modulation +2 priority bands
- **Adjacent attack**: an active External Attack Correlation case is bound to an entity in the same blast radius zone as the Drift case → modulation +1 priority band
- **Recent attack**: an External Attack Correlation case was resolved in the past 30 days for the same or adjacent entity → modulation +0.5 priority band
- **No attack context**: no modulation

### 3.2 Threat Intelligence Dimension

- **KEV match**: the drift item involves a CVE or control on the CISA KEV list → modulation +1 priority band
- **Active campaign match**: External Threat Intelligence stream indicates active campaigns exploiting this drift type → modulation +0.5 priority band
- **No threat match**: no modulation

### 3.3 Verdict Layer Dimension

- **Defence bent**: the entity has verdict layer activity showing recent overrides, low-confidence allowances, or verdict disagreement → modulation +0.5 priority band
- **Defence engaged**: the entity has active verdict layer prevention actions → no modulation (defence is working, not the urgent case)
- **No verdict context**: no modulation

### 3.4 Identity Exposure Dimension

- **Privileged identity affected**: the drift item involves an entity that grants access to or from privileged identities → modulation +0.5 priority band
- **Critical asset affected**: the drift item involves a mission-critical or critical-tier asset → modulation +0.5 priority band

### 3.5 Strategic Priority Dimension

- **Aligned to active strategic priority**: the drift case aligns to an active CISO strategic priority → modulation per Spec #28 priority boost
- **Aligned to active tactical priority**: the drift case aligns to an active tactical objective → modulation per Spec #28 priority boost

## 4. Modulation Application

The context modulation score is applied to the base severity-derived priority:

- Base priority computed from drift severity + blast radius + exploitability (per existing v2.5 model)
- Context modulation score summed across the five dimensions
- Final priority = base priority + context modulation (clamped to P0-P4 range)
- P0 is reserved for explicit Zero-Day overlay per existing v2.5 doctrine; context modulation cannot create P0 — it can only modulate P1 through P4

## 5. Decay Function

Context-driven priority elevation is time-bound. The modulation decays as context becomes stale:

- **Attack context** decays linearly over the attack case lifecycle. While the attack case is active, full modulation applies. After case closure, modulation decays over 30 days to zero.
- **Threat intelligence context** decays as the threat intelligence ages. KEV match persists while the CVE remains on KEV list. Campaign match decays over campaign-specific timeframes.
- **Verdict layer context** decays based on verdict recency. Defence-bent indicators from 30+ days ago carry less modulation than fresh indicators.
- **Identity exposure and strategic priority dimensions** do not decay — they reflect current state and are recomputed continuously.

Decay functions are configurable per dimension.

## 6. Kill Switch States

The context-aware modulation can be disabled per dimension or globally:

- **Per-dimension kill switch** — disable one or more dimensions if customer determines the modulation isn't valuable for their context
- **Global kill switch** — revert to base v2.5 priority computation entirely
- **Audit-only mode** — compute modulation but don't apply to case priority (visible in case detail for analyst awareness, not used by routing or queue ordering)

Kill switch states are tenant-configurable per Spec #55 v2.6.

## 7. Auto-Promotion to Tactical Priority

When context modulation elevates a Drift case above a configurable threshold, the case is candidate for **auto-promotion to tactical priority** (per Spec #28 v2.6):

- A drift case whose context-modulated priority reaches P1 AND has active attack context AND has high identity exposure → candidate auto-promotion
- Auto-promotion creates a tactical objective if one doesn't exist for this drift pattern, or aligns the case to an existing tactical objective
- Auto-promotion is reversible; cases can be de-promoted if context changes or if SOM determines the promotion was overreactive

Auto-promotion thresholds and behaviour are tenant-configurable.

## 8. Audit and Transparency

Every priority computation is auditable:

- Base priority and its components
- Each dimension's modulation contribution
- Final priority after modulation
- Active decay state
- Kill switch state at computation time

The audit trail allows operators to understand why a specific case carries its priority. Cases with surprising priority show explanation on hover or in detail view.

## 9. Configurability

Per Spec #55 v2.6:

- Dimension weights (how much each dimension contributes to modulation)
- Decay function parameters per dimension
- Auto-promotion thresholds
- Kill switch states (per-dimension and global)
- Audit-only mode toggle
- Modulation explanation visibility in UI

System defaults shipped at build, validated against pilot data.

## 10. Build Readiness

Context-Aware Drift Prioritisation Matrix is build-ready when:

- Five dimensions compute correctly from their respective data sources
- Modulation application correctly adjusts base priority
- Decay functions operate per Section 5
- Kill switch states function per Section 6
- Auto-promotion candidates fire per Section 7
- Audit trail captures full computation per Section 8
- Configurability exposed via Tenant Admin
- Integration with Spec #28 priority framework operational

## 11. Audit Events

- `DRIFT_PRIORITY_MODULATED` — when modulation applied
- `DRIFT_PRIORITY_AUTO_PROMOTED` — when auto-promotion to tactical fires
- `DRIFT_PRIORITY_DE_PROMOTED` — when promotion reversed
- `DRIFT_PRIORITY_DIMENSION_KILLED` — when kill switch state changes
- `DRIFT_PRIORITY_AUDIT_MODE_TOGGLED` — when audit-only mode changes

## 12. Relationship to Other v2.6 Specifications

- **Spec #28 v2.6 (Strategic and Tactical Priority Framework)** — parent priority framework
- **Spec #59 (Intelligence Layer)** — provides context signals
- **Spec #62 (Verdict Semantics)** — provides verdict layer context
- **Spec #71 (Pre-Warned/Protected/Novel Classification)** — provides attack context
- **Spec #08 v2.6 (Case Management)** — Drift case priority application
- **Spec #55 v2.6 (Baseline Configuration)** — modulation parameters

## 13. Versioning

v1.0 — initial specification.
