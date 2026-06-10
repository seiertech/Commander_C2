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
  signalRef: string;
  connectorRef: string;
  referencedEntity: { key: string; entityType: LookupEntityType };
}

export interface ExistingEntity {
  key: string;
  entityType: LookupEntityType;
  lastVerifiedAt: string;
  aliases?: string[];
}

export interface LookupResultOutput {
  resolved: boolean;
  partial: boolean;
  matchedEntity: ExistingEntity | null;
  lookupKey: string;
}

export interface CaseRef {
  caseId: string;
  type: 'coverage-blindspot';
  generatedAt: string;
}

export interface OnboardingRef {
  workflowId: string;
  entityType: LookupEntityType;
  lookupKey: string;
  triggeredAt: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Detect whether a signal references an entity not in the known estate.
 */
export function detectLookupFailure(signal: SignalInput, existingEntities: ExistingEntity[]): LookupResultOutput {
  const exact = existingEntities.find(
    (e) => e.entityType === signal.referencedEntity.entityType && e.key === signal.referencedEntity.key,
  );
  if (exact) {
    return { resolved: true, partial: false, matchedEntity: exact, lookupKey: signal.referencedEntity.key };
  }

  const partial = existingEntities.find(
    (e) => e.entityType === signal.referencedEntity.entityType && e.aliases?.includes(signal.referencedEntity.key),
  );
  if (partial) {
    return { resolved: false, partial: true, matchedEntity: partial, lookupKey: signal.referencedEntity.key };
  }

  return { resolved: false, partial: false, matchedEntity: null, lookupKey: signal.referencedEntity.key };
}

/**
 * Classify the root cause of a lookup failure.
 */
export function classifyRootCause(failure: LookupResultOutput, existingEntities: ExistingEntity[]): RootCause {
  if (failure.resolved) return 'discovery_gap'; // shouldn't happen but fallback

  // Check if a stale entity matches by key but is very old
  const staleMatch = existingEntities.find(
    (e) => e.key === failure.lookupKey && new Date(e.lastVerifiedAt).getTime() < Date.now() - 90 * 24 * 3600 * 1000,
  );
  if (staleMatch) return 'staleness';

  // Check if partial match exists (naming mismatch)
  if (failure.partial) return 'naming_mismatch';

  // Check if entity was recently decommissioned (within 30 days)
  const decomMatch = existingEntities.find(
    (e) => e.key.includes(failure.lookupKey.split('.')[0]) && new Date(e.lastVerifiedAt).getTime() < Date.now() - 30 * 24 * 3600 * 1000,
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
    caseId: `case-blindspot-${failure.lookupKey.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
    type: 'coverage-blindspot',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Trigger entity onboarding workflow for an unresolved entity.
 */
export function triggerOnboarding(failure: LookupResultOutput, entityType: LookupEntityType): OnboardingRef {
  return {
    workflowId: `onboard-${failure.lookupKey.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
    entityType,
    lookupKey: failure.lookupKey,
    triggeredAt: new Date().toISOString(),
  };
}
