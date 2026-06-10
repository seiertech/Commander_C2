/**
 * Platform Intelligence Source — Commander C2 Canonical Entity
 *
 * Source: Platform Intelligence and IOC Distribution spec (Phase 1 data-layer)
 * Authority: Requirements 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 20.1, 20.2, 20.3
 * Build unit: Platform Intelligence and IOC Distribution
 *
 * A platform-owned feed source definition (e.g. CISA KEV feed, NVD CVE feed,
 * commercial IOC feed). Managed by the Admin_Tenant.
 *
 * Ownership model:
 * - Source-owned (immutable): name, vendor, sourceType, connectorClass, feedReference,
 *   licenceStatus, sourceMetadataExtra
 * - Commander-owned (mutable): refreshCadenceMinutes, lastSuccessfulSync,
 *   nextScheduledSync, failureState, sourceFreshness, catalogueVersionHash, healthState
 */

import type { CommonFields } from './common';
import type { PlatformIntelligenceSourceType, SourceFreshnessState } from './intelligence-common';
import { PLATFORM_INTELLIGENCE_SOURCE_TYPES } from './intelligence-common';

// ─── Failure State ───────────────────────────────────────────────────────────

/** Feed sync failure state (Req 2.3) */
export interface FeedFailureState {
  /** When the failure occurred */
  failedAt: string;
  /** Error classification */
  errorClass: string;
  /** Consecutive failure count (monotonic) */
  consecutiveFailures: number;
}

// ─── Platform Intelligence Source Entity ─────────────────────────────────────

export interface PlatformIntelligenceSource extends CommonFields {
  // ─── Source-owned fields (immutable after write) ─────────────────────────

  /** Source name — required (Req 1.4) */
  name: string;
  /** Feed vendor/origin */
  vendor: string;
  /** Source type — required, known constant (Req 1.3/1.4) */
  sourceType: PlatformIntelligenceSourceType;
  /** Fixed to class D — Threat Intelligence (Req 1.1, Spec #61) */
  connectorClass: 'D';
  /** Feed URL/reference (no live fetch in Phase 1) */
  feedReference: string;
  /** Licence/use status */
  licenceStatus: string;
  /** Additional source metadata */
  sourceMetadataExtra: Record<string, unknown>;

  // ─── Commander-owned fields (mutable) ────────────────────────────────────

  /** Schedule cadence in minutes (Req 2.1) */
  refreshCadenceMinutes: number;
  /** Last successful sync timestamp (Req 2.2) */
  lastSuccessfulSync: string | null;
  /** Next scheduled sync timestamp (Req 2.2) */
  nextScheduledSync: string | null;
  /** Failure state (Req 2.3) */
  failureState: FeedFailureState | null;
  /** Computed freshness state (Req 2.4) */
  sourceFreshness: SourceFreshnessState;
  /** Catalogue version marker */
  catalogueVersionHash: string;
  /** Derived health state */
  healthState: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PlatformIntelligenceSourceValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Platform_Intelligence_Source entity for structural correctness.
 * Checks: required fields, sourceType membership, connectorClass = 'D'.
 * Req 1.4.
 */
export function validatePlatformIntelligenceSource(
  source: PlatformIntelligenceSource,
): PlatformIntelligenceSourceValidation {
  const errors: string[] = [];

  if (!source.name || source.name.trim() === '') {
    errors.push('name: required, must be a non-empty string');
  }

  if (!source.sourceType || !PLATFORM_INTELLIGENCE_SOURCE_TYPES.includes(source.sourceType)) {
    errors.push(
      `sourceType: must be one of: ${PLATFORM_INTELLIGENCE_SOURCE_TYPES.join(', ')}`,
    );
  }

  if (source.connectorClass !== 'D') {
    errors.push('connectorClass: must be "D" (Threat Intelligence)');
  }

  if (!source.tenant || !source.tenant.tenantId || source.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }

  if (!source.id || source.id.trim() === '') {
    errors.push('id: required');
  }

  return { valid: errors.length === 0, errors };
}
