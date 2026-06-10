/**
 * Threat Hunt Record — Commander C2 Canonical Entity
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 14.1, 14.2, 14.3, 14.4
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * An IOC-triggered threat hunt with status lifecycle.
 * match_found/escalated emit case-link/enrichment bindings consumed by
 * the existing lifecycle (no bypass).
 */

import type { CommonFields } from './common';
import type { ThreatHuntStatus } from './intelligence-common';
import { THREAT_HUNT_STATUSES } from './intelligence-common';

// ─── Threat Hunt Record Entity ───────────────────────────────────────────────

export interface ThreatHuntRecord extends CommonFields {
  /** Customer tenant ID */
  tenantId: string;
  /** IOC that triggered the hunt */
  triggeringIocId: string;
  /** Match that triggered the hunt */
  triggeringMatchId: string;
  /** Hunt type classification */
  huntType: string;
  /** Hunt scope */
  huntScope: string;
  /** Status lifecycle (Req 14.1) */
  status: ThreatHuntStatus;
  /** Assigned analyst */
  assignedTo: string;
  /** When proposed */
  proposedAt: string;
  /** When started (null if not started) */
  startedAt: string | null;
  /** When completed (null if not completed) */
  completedAt: string | null;
  /** Findings reference */
  findingsRef: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ThreatHuntRecordValidation {
  valid: boolean;
  errors: string[];
}

export function validateThreatHuntRecord(record: ThreatHuntRecord): ThreatHuntRecordValidation {
  const errors: string[] = [];

  if (!record.tenantId || record.tenantId.trim() === '') {
    errors.push('tenantId: required');
  }

  if (!record.triggeringIocId || record.triggeringIocId.trim() === '') {
    errors.push('triggeringIocId: required');
  }

  if (!record.triggeringMatchId || record.triggeringMatchId.trim() === '') {
    errors.push('triggeringMatchId: required');
  }

  if (!record.status || !THREAT_HUNT_STATUSES.includes(record.status)) {
    errors.push(`status: must be one of: ${THREAT_HUNT_STATUSES.join(', ')}`);
  }

  if (!record.id || record.id.trim() === '') {
    errors.push('id: required');
  }

  if (!record.tenant || !record.tenant.tenantId || record.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  return { valid: errors.length === 0, errors };
}
