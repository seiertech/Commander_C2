/**
 * IOC Relationship — Commander SDR Canonical Entity (Stateful, Typed)
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 18.3
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * A stateful, typed relationship between an IOC and another entity
 * (CVE, advisory, campaign, malware, actor, case, risk object, action).
 * CVE binding is OPTIONAL — IOCs exist independently (Req 7.4, 18.3).
 *
 * Ownership model:
 * - Source-owned (immutable): iocId, relatedEntityId, relatedEntityType,
 *   establishedAt, evidenceRef
 * - Commander-owned (mutable): relationshipState, confidence, lastUpdatedAt, stateHistory
 */

import type { CommonFields } from './common';
import type { IocRelationshipState, RelationshipStateTransition } from './intelligence-common';
import { IOC_RELATIONSHIP_STATES } from './intelligence-common';

// ─── IOC Relationship Entity ─────────────────────────────────────────────────

export interface IocRelationship extends CommonFields {
  /** IOC entity ID — non-empty (Req 7.1/7.5) */
  iocId: string;
  /** Related entity ID — non-empty (Req 7.1/7.5) */
  relatedEntityId: string;
  /** Related entity type (CVE, advisory, campaign, malware, actor, case, risk_object, action) */
  relatedEntityType: string;
  /** Relationship state (Req 7.2/7.5) */
  relationshipState: IocRelationshipState;
  /** Confidence 0–100 (Req 7.1/7.5) */
  confidence: number;
  /** When this relationship was established */
  establishedAt: string;
  /** When this relationship was last updated */
  lastUpdatedAt: string;
  /** Evidence reference */
  evidenceRef: string;
  /** State history — appended on every state change (Req 7.3) */
  stateHistory: RelationshipStateTransition[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface IocRelationshipValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an IOC_Relationship for structural correctness.
 * Checks: state membership, non-empty ids, confidence 0–100 (Req 7.5).
 */
export function validateIocRelationship(
  relationship: IocRelationship,
): IocRelationshipValidation {
  const errors: string[] = [];

  if (!relationship.iocId || relationship.iocId.trim() === '') {
    errors.push('iocId: required, must be a non-empty string');
  }

  if (!relationship.relatedEntityId || relationship.relatedEntityId.trim() === '') {
    errors.push('relatedEntityId: required, must be a non-empty string');
  }

  if (
    !relationship.relationshipState ||
    !IOC_RELATIONSHIP_STATES.includes(relationship.relationshipState)
  ) {
    errors.push(
      `relationshipState: must be one of: ${IOC_RELATIONSHIP_STATES.join(', ')}`,
    );
  }

  if (relationship.confidence < 0 || relationship.confidence > 100) {
    errors.push(`confidence: must be 0–100, got ${relationship.confidence}`);
  }

  if (!Array.isArray(relationship.stateHistory)) {
    errors.push('stateHistory: must be an array');
  }

  if (!relationship.id || relationship.id.trim() === '') {
    errors.push('id: required');
  }

  if (!relationship.tenant || !relationship.tenant.tenantId || relationship.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
