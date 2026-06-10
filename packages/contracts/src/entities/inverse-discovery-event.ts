/**
 * Inverse Discovery Event Entity — Commander C2 Canonical Model
 *
 * Source: Spec #40 Inverse Discovery Loop
 *
 * An InverseDiscoveryEvent is recorded whenever the normalisation layer
 * encounters a lookup failure: a signal references an entity (asset, identity,
 * component) that cannot be resolved against the known estate. The event
 * tracks secondary resolution attempts, root-cause classification, and
 * whether a blindspot case or onboarding workflow was triggered.
 *
 * Domain: D-10 (Coverage / Tool Health)
 * Use Cases: UC-181 (detect lookup failure), UC-182 (secondary resolution),
 *            UC-183 (generate blindspot case), UC-184 (classify root cause),
 *            UC-185 (trigger entity onboarding)
 * Route: /coverage/blindspots
 */

import type { CommonFields } from './common';

// ─── Lookup Entity Type ──────────────────────────────────────────────────────

export const LOOKUP_ENTITY_TYPES = ['asset', 'identity', 'component'] as const;
export type LookupEntityType = typeof LOOKUP_ENTITY_TYPES[number];

// ─── Lookup Result ───────────────────────────────────────────────────────────

export const LOOKUP_RESULTS = ['resolved', 'unresolved', 'partial'] as const;
export type LookupResult = typeof LOOKUP_RESULTS[number];

// ─── Root Cause ──────────────────────────────────────────────────────────────

export const ROOT_CAUSES = [
  'discovery_gap',
  'staleness',
  'shadow_it',
  'naming_mismatch',
  'decommissioned',
] as const;
export type RootCause = typeof ROOT_CAUSES[number];

// ─── Inverse Discovery Event Entity ─────────────────────────────────────────

export interface InverseDiscoveryEvent extends CommonFields {
  entityType: 'inverse-discovery-event';
  /** Unique event identifier */
  eventId: string;
  /** Connector that produced the signal */
  connectorRef: string;
  /** Signal that triggered the lookup */
  signalRef: string;
  /** Kind of entity being looked up */
  lookupEntityType: LookupEntityType;
  /** Lookup key (hostname, username, component id, etc.) */
  lookupKey: string;
  /** Primary lookup result */
  lookupResult: LookupResult;
  /** Whether secondary resolution was attempted */
  secondaryAttempted: boolean;
  /** Secondary resolution result (null if not attempted) */
  secondaryResult?: LookupResult;
  /** Classified root cause (null if resolved) */
  rootCause: RootCause | null;
  /** Case generated from this failure (null if not generated) */
  caseGeneratedRef?: string;
  /** Whether entity onboarding was triggered */
  onboardingTriggered: boolean;
  /** When the lookup failure was detected */
  detectedAt: string;
  /** When the event was resolved (if resolved) */
  resolvedAt?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface InverseDiscoveryEventValidation {
  valid: boolean;
  errors: string[];
}

export function validateInverseDiscoveryEvent(event: InverseDiscoveryEvent): InverseDiscoveryEventValidation {
  const errors: string[] = [];

  if (!event.id || event.id.trim() === '') errors.push('id: required');
  if (!event.tenant || !event.tenant.tenantId) errors.push('tenant.tenantId: required');
  if (!event.eventId || event.eventId.trim() === '') errors.push('eventId: required');
  if (!event.connectorRef || event.connectorRef.trim() === '') errors.push('connectorRef: required');
  if (!event.signalRef || event.signalRef.trim() === '') errors.push('signalRef: required');
  if (!LOOKUP_ENTITY_TYPES.includes(event.lookupEntityType)) {
    errors.push(`lookupEntityType: must be one of: ${LOOKUP_ENTITY_TYPES.join(', ')}`);
  }
  if (!event.lookupKey || event.lookupKey.trim() === '') errors.push('lookupKey: required');
  if (!LOOKUP_RESULTS.includes(event.lookupResult)) {
    errors.push(`lookupResult: must be one of: ${LOOKUP_RESULTS.join(', ')}`);
  }
  if (event.secondaryResult !== undefined && !LOOKUP_RESULTS.includes(event.secondaryResult)) {
    errors.push(`secondaryResult: must be one of: ${LOOKUP_RESULTS.join(', ')}`);
  }
  if (event.rootCause !== null && !ROOT_CAUSES.includes(event.rootCause)) {
    errors.push(`rootCause: must be one of: ${ROOT_CAUSES.join(', ')}`);
  }
  if (!event.detectedAt || event.detectedAt.trim() === '') errors.push('detectedAt: required');

  return { valid: errors.length === 0, errors };
}
