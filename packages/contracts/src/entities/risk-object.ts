/**
 * Risk Object Entity — Commander C2 Canonical Model
 *
 * Source: Spec #29 Universal Risk Object and Case Binding
 * v1.3.1 lineage closure: coverage_blindspot (Spec #72), ooda_phase_degradation (Spec #58)
 *
 * Risk objects are bound to cases and represent discrete risk conditions
 * that require treatment. They are system-created and tenant-scoped.
 */

import type { CommonFields } from './common';
import type { SourceClassification } from './coim';

/**
 * Risk object types per v1.2 and v1.3.1 requirements.
 * - coverage_blindspot: v1.3.1 lineage closure — Spec #72
 * - ooda_phase_degradation: v1.3.1 lineage closure — Spec #58
 */
export type RiskObjectType =
  | 'coverage_blindspot'
  | 'ooda_phase_degradation'
  | 'vulnerability_drift'
  | 'configuration_drift'
  | 'exposure_drift'
  | 'control_gap'
  | 'identity_risk'
  | 'policy_gap';

/** All risk object types as a constant array */
export const RISK_OBJECT_TYPES: RiskObjectType[] = [
  'coverage_blindspot',
  'ooda_phase_degradation',
  'vulnerability_drift',
  'configuration_drift',
  'exposure_drift',
  'control_gap',
  'identity_risk',
  'policy_gap',
];

/** Treatment state for risk objects */
export type TreatmentState = 'open' | 'mitigated' | 'accepted' | 'transferred';

/** Risk Object — a discrete risk condition bound to cases and entities */
export interface RiskObject extends CommonFields {
  entityType: 'risk-object';
  /** Risk object type */
  type: RiskObjectType;
  /** ID of the affected entity (asset, identity, case, etc.) */
  affectedEntityId: string;
  /** Type of the affected entity */
  affectedEntityType: string;
  /** Justification for this risk object's creation */
  justification: string;
  /** Owner responsible for treatment */
  owner: string;
  /** Current treatment state */
  treatmentState: TreatmentState;
  /** Expiry or review trigger condition */
  expiryOrReviewTrigger: string;

  // ─── COIM-A augmentation (additive, optional) ──────────────────────────────
  // Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §4.1, §4.12.
  // Captured at ingestion as IMMUTABLE source provenance. Informs but never
  // governs lifecycle, priority, routing, validation or closure.

  /**
   * Immutable source-classification metadata (what the source reported).
   * Required on Risk Object per COIM v1.0 once populated by normalisation;
   * optional at the type level for additive back-compatibility with records
   * created before COIM-A. Resolves ARCH-DEBT-039.
   */
  sourceClassification?: SourceClassification;

  /**
   * Plural affected entities. Retains singular `affectedEntityId` above for
   * back-compatibility; `affectedEntities[]` is the COIM-aligned form.
   */
  affectedEntities?: string[];

  // ─── Timeline model (COIM-A; resolves ARCH-DEBT-045 Risk Object portion) ───
  /** When the source first detected the finding (source timestamp). */
  firstDetectedAt?: string;
  /** When the source last confirmed the finding (source timestamp). */
  lastConfirmedAt?: string;
  /** When Commander normalisation completed (system timestamp). */
  normalisedAt?: string;
}
