/**
 * Tenant IOC Match — Commander SDR Canonical Entity
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 12.1, 12.2, 12.3
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * A confirmed or potential match between a platform IOC and a tenant
 * observable, asset or telemetry record. References existing Observable
 * entity (COIM-D) by ID, preserving dedup model (Req 12.2).
 */

import type { CommonFields } from './common';
import type { IocMatchType } from './intelligence-common';
import { IOC_MATCH_TYPES } from './intelligence-common';

// ─── Tenant IOC Match Entity ─────────────────────────────────────────────────

export interface TenantIocMatch extends CommonFields {
  /** Customer tenant ID — present (Req 12.3) */
  tenantId: string;
  /** IOC entity ID — non-empty, cross-plane reference (Req 12.1/12.3) */
  iocId: string;
  /** Reference to existing Observable COIM-D — preserving dedup (Req 12.1/12.2) */
  matchedObservableId: string;
  /** Match type classification (Req 12.1/12.3) */
  matchType: IocMatchType;
  /** Match confidence 0–100 (Req 12.1/12.3) */
  matchConfidence: number;
  /** When the match was identified */
  matchedAt: string;
  /** Match source identifier */
  matchSource: string;
  /** Evidence references */
  evidenceReferences: string[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface TenantIocMatchValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Tenant_IOC_Match for structural correctness.
 * Checks: iocId/matchedObservableId non-empty, matchType known,
 * matchConfidence 0–100, tenantId present (Req 12.3).
 */
export function validateTenantIocMatch(
  match: TenantIocMatch,
): TenantIocMatchValidation {
  const errors: string[] = [];

  if (!match.tenantId || match.tenantId.trim() === '') {
    errors.push('tenantId: required');
  }

  if (!match.iocId || match.iocId.trim() === '') {
    errors.push('iocId: required, must reference an Indicator_Of_Compromise');
  }

  if (!match.matchedObservableId || match.matchedObservableId.trim() === '') {
    errors.push('matchedObservableId: required, must reference an existing Observable');
  }

  if (!match.matchType || !IOC_MATCH_TYPES.includes(match.matchType)) {
    errors.push(`matchType: must be one of: ${IOC_MATCH_TYPES.join(', ')}`);
  }

  if (match.matchConfidence < 0 || match.matchConfidence > 100) {
    errors.push(`matchConfidence: must be 0–100, got ${match.matchConfidence}`);
  }

  if (!match.id || match.id.trim() === '') {
    errors.push('id: required');
  }

  if (!match.tenant || !match.tenant.tenantId || match.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
