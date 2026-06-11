/**
 * Identity Intelligence Engine Entity — Commander C2 Canonical Model
 *
 * Source: Spec #59 Intelligence Layer Architecture §Internal Behavioural Stream,
 *         Master Technical Specification §Identity Intelligence
 *
 * Identity intelligence records model behavioural signals detected against
 * identities in the security estate. Each record tracks signal type,
 * risk score, baseline vs observed behaviour, and recommended actions.
 *
 * Ownership: All authenticated (read), System (detect)
 * Build Unit: Tier 3 batch (phase1-engine-entities)
 * Unlocks: /identity-intelligence, engine intelligence surfaces
 */

import type { CommonFields } from './common';

// ─── Signal Types ────────────────────────────────────────────────────────────

export const IDENTITY_SIGNAL_TYPES = [
  'access_anomaly',
  'privilege_escalation',
  'dormant_account',
  'mfa_gap',
  'impossible_travel',
  'credential_exposure',
] as const;
export type IdentitySignalType = typeof IDENTITY_SIGNAL_TYPES[number];

// ─── Identity Intelligence Entity ────────────────────────────────────────────

export interface IdentityIntelligence extends CommonFields {
  entity_type: 'identity-intelligence';
  /** Engine instance that produced this signal */
  engine_id: string;
  /** Reference to the identity under observation */
  identityRef: string;
  /** Category of identity signal */
  signalType: IdentitySignalType;
  /** Computed risk score (0-100) */
  risk_score: number;
  /** Confidence in the detection (0-1) */
  confidence: number;
  /** When the signal was detected */
  detected_at: string;
  /** Contextual key-value pairs for the signal */
  context: Record<string, string>;
  /** Description of expected baseline behaviour */
  baselineBehaviour: string;
  /** Description of the observed anomalous behaviour */
  observedBehaviour: string;
  /** Recommended action (null if none) */
  recommendedAction: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface IdentityIntelligenceValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an IdentityIntelligence entity for structural correctness.
 */
export function validateIdentityIntelligence(record: IdentityIntelligence): IdentityIntelligenceValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') {
    errors.push('id: required');
  }
  if (!record.tenant || !record.tenant.tenant_id || record.tenant.tenant_id.trim() === '') {
    errors.push('tenant.tenant_id: required');
  }
  if (!record.engine_id || record.engine_id.trim() === '') {
    errors.push('engine_id: required');
  }
  if (!record.identityRef || record.identityRef.trim() === '') {
    errors.push('identityRef: required');
  }
  if (!record.signalType || !IDENTITY_SIGNAL_TYPES.includes(record.signalType)) {
    errors.push(`signalType: must be one of: ${IDENTITY_SIGNAL_TYPES.join(', ')}`);
  }
  if (typeof record.risk_score !== 'number' || record.risk_score < 0 || record.risk_score > 100) {
    errors.push('risk_score: must be 0-100');
  }
  if (typeof record.confidence !== 'number' || record.confidence < 0 || record.confidence > 1) {
    errors.push('confidence: must be 0-1');
  }
  if (!record.detected_at || record.detected_at.trim() === '') {
    errors.push('detected_at: required');
  }
  if (!record.context || typeof record.context !== 'object') {
    errors.push('context: must be a Record<string,string>');
  }
  if (!record.baselineBehaviour || record.baselineBehaviour.trim() === '') {
    errors.push('baselineBehaviour: required');
  }
  if (!record.observedBehaviour || record.observedBehaviour.trim() === '') {
    errors.push('observedBehaviour: required');
  }

  return { valid: errors.length === 0, errors };
}
