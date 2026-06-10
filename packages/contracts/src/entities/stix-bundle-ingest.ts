/**
 * STIX Bundle Ingest — Commander C2 Canonical Entity
 *
 * Communications Excellence Phase 1 data-layer.
 * Represents an ingested STIX bundle record and its processing lifecycle.
 *
 * Constraints:
 * - No live STIX/TAXII feed consumption (Phase 1)
 * - All processing modelled as status progression
 */

import type { CommonFields } from './common';

// ─── STIX Bundle Ingest Types ────────────────────────────────────────────────

export const STIX_OBJECT_TYPES = [
  'indicator',
  'attack-pattern',
  'malware',
  'campaign',
  'threat-actor',
  'tool',
  'vulnerability',
] as const;
export type StixObjectType = typeof STIX_OBJECT_TYPES[number];

export const STIX_INGEST_STATUSES = [
  'received',
  'parsing',
  'mapped',
  'evaluated',
  'complete',
] as const;
export type StixIngestStatus = typeof STIX_INGEST_STATUSES[number];

// ─── STIX Bundle Ingest Entity ───────────────────────────────────────────────

export interface StixBundleIngest extends CommonFields {
  /** Ingest record identifier */
  ingestId: string;
  /** Tenant scope */
  tenantId: string;
  /** Reference to inbound email submission that contained this bundle */
  sourceEmailId: string;
  /** STIX bundle version (e.g. "2.1") */
  bundleVersion: string;
  /** Count of objects parsed from the bundle */
  objectsParsed: number;
  /** Types of STIX objects found */
  objectTypes: StixObjectType[];
  /** Observable IDs that were mapped from this bundle */
  mappedObservableIds: string[];
  /** IOC IDs that were mapped from this bundle */
  mappedIocIds: string[];
  /** Relevance score (0-100) — computed from estate matching */
  relevanceScore: number;
  /** Whether a case was created from this ingest */
  caseCreated: boolean;
  /** Case ID if a case was created */
  caseId: string | null;
  /** When the bundle was ingested */
  ingestedAt: string;
  /** Current processing status */
  status: StixIngestStatus;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface StixBundleIngestValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a StixBundleIngest for structural correctness.
 */
export function validateStixBundleIngest(
  ingest: StixBundleIngest,
): StixBundleIngestValidation {
  const errors: string[] = [];

  if (!ingest.id || ingest.id.trim() === '') {
    errors.push('id: required');
  }
  if (!ingest.tenant || !ingest.tenant.tenantId || ingest.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!ingest.ingestId || ingest.ingestId.trim() === '') {
    errors.push('ingestId: required');
  }
  if (!ingest.tenantId || ingest.tenantId.trim() === '') {
    errors.push('tenantId: required');
  }
  if (!ingest.sourceEmailId || ingest.sourceEmailId.trim() === '') {
    errors.push('sourceEmailId: required');
  }
  if (!ingest.bundleVersion || ingest.bundleVersion.trim() === '') {
    errors.push('bundleVersion: required');
  }
  if (typeof ingest.objectsParsed !== 'number' || ingest.objectsParsed < 0) {
    errors.push('objectsParsed: must be a non-negative number');
  }
  if (!Array.isArray(ingest.objectTypes)) {
    errors.push('objectTypes: must be an array');
  } else {
    for (const ot of ingest.objectTypes) {
      if (!STIX_OBJECT_TYPES.includes(ot)) {
        errors.push(`objectTypes: '${ot}' is not a known STIX object type`);
      }
    }
  }
  if (typeof ingest.relevanceScore !== 'number' || ingest.relevanceScore < 0 || ingest.relevanceScore > 100) {
    errors.push('relevanceScore: must be 0-100');
  }
  if (!ingest.ingestedAt || ingest.ingestedAt.trim() === '') {
    errors.push('ingestedAt: required');
  }
  if (!ingest.status || !STIX_INGEST_STATUSES.includes(ingest.status)) {
    errors.push(`status: must be one of: ${STIX_INGEST_STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
