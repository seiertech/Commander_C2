/**
 * Inverse Discovery Engine — Commander C2 (Spec 40)
 *
 * Source: Spec #40 Inverse Discovery Loop
 *
 * Detects normalisation lookup failures, classifies root causes, generates
 * coverage blindspot cases, and triggers entity onboarding workflows.
 *
 * Pure functions — no I/O.
 *
 * Domain: D-10 (Coverage / Tool Health)
 * Use Cases: UC-181 (detect lookup failure), UC-183 (generate blindspot case),
 *            UC-184 (classify root cause), UC-185 (trigger onboarding)
 */

import type { RootCause, LookupEntityType } from '../entities/inverse-discovery-event';

// ─── Input/Output Types ──────────────────────────────────────────────────────

export interface SignalInput {
  signal_ref: string;
  connectorRef: string;
  referenced_entity: { key: string; entity_type: LookupEntityType };
}

export interface ExistingEntity {
  key: string;
  entity_type: LookupEntityType;
  lastVerifiedAt: string;
  aliases?: string[];
}

export interface LookupResultOutput {
  resolved: boolean;
  partial: boolean;
  matchedEntity: ExistingEntity | null;
  lookup_key: string;
}

export interface CaseRef {
  case_id: string;
  type: 'coverage-blindspot';
  generated_at: string;
}

export interface OnboardingRef {
  workflowId: string;
  entity_type: LookupEntityType;
  lookup_key: string;
  triggeredAt: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Detect whether a signal references an entity not in the known estate.
 */
export function detectLookupFailure(signal: SignalInput, existingEntities: ExistingEntity[]): LookupResultOutput {
  const exact = existingEntities.find(
    (e) => e.entity_type === signal.referenced_entity.entity_type && e.key === signal.referenced_entity.key,
  );
  if (exact) {
    return { resolved: true, partial: false, matchedEntity: exact, lookup_key: signal.referenced_entity.key };
  }

  const partial = existingEntities.find(
    (e) => e.entity_type === signal.referenced_entity.entity_type && e.aliases?.includes(signal.referenced_entity.key),
  );
  if (partial) {
    return { resolved: false, partial: true, matchedEntity: partial, lookup_key: signal.referenced_entity.key };
  }

  return { resolved: false, partial: false, matchedEntity: null, lookup_key: signal.referenced_entity.key };
}

/**
 * Classify the root cause of a lookup failure.
 */
export function classifyRootCause(failure: LookupResultOutput, existingEntities: ExistingEntity[]): RootCause {
  if (failure.resolved) return 'discovery_gap'; // shouldn't happen but fallback

  // Check if a stale entity matches by key but is very old
  const staleMatch = existingEntities.find(
    (e) => e.key === failure.lookup_key && new Date(e.lastVerifiedAt).getTime() < Date.now() - 90 * 24 * 3600 * 1000,
  );
  if (staleMatch) return 'staleness';

  // Check if partial match exists (naming mismatch)
  if (failure.partial) return 'naming_mismatch';

  // Check if entity was recently decommissioned (within 30 days)
  const decomMatch = existingEntities.find(
    (e) => e.key.includes(failure.lookup_key.split('.')[0]) && new Date(e.lastVerifiedAt).getTime() < Date.now() - 30 * 24 * 3600 * 1000,
  );
  if (decomMatch) return 'decommissioned';

  // Default: likely shadow IT
  return 'shadow_it';
}

/**
 * Generate a coverage blindspot case from an unresolved lookup failure.
 */
export function generateBlindspotCase(failure: LookupResultOutput): CaseRef {
  return {
    case_id: `case-blindspot-${failure.lookup_key.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
    type: 'coverage-blindspot',
    generated_at: new Date().toISOString(),
  };
}

/**
 * Trigger entity onboarding workflow for an unresolved entity.
 */
export function triggerOnboarding(failure: LookupResultOutput, entity_type: LookupEntityType): OnboardingRef {
  return {
    workflowId: `onboard-${failure.lookup_key.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
    entity_type,
    lookup_key: failure.lookup_key,
    triggeredAt: new Date().toISOString(),
  };
}
