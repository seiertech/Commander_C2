/**
 * Observable Entity — Commander C2 Canonical Model
 *
 * Source: COIM v1.0 §4.5; 03_REUSABLE_OBJECT_CATALOGUE.md §2.5
 * Authority: DEC-coim-ocsf-source-classification-architecture (DECISIONS.md)
 * Build unit: COIM-D (Observable Entity)
 * Resolves: ARCH-DEBT-041 (observable entity absence)
 *
 * Observable is a typed indicator (IP, domain, hash, URL, email, certificate,
 * process, file) extracted from findings. Enables threat-intelligence correlation,
 * cross-case matching, and indicator-based search.
 *
 * Ownership model:
 * - Source-owned (immutable after write): observableType, value, firstSeen, lastSeen
 * - Commander-owned (mutable): reputation (enrichment-derived)
 * - Bindings: many-to-many with Risk Objects (deduplication)
 *
 * Storage model:
 * - Separate table with many-to-many binding (deduplication)
 * - Bounded JSONB overflow on Risk Object (max 50, via ObservableRef in coim.ts)
 * - Search indexes for indicator-based search
 *
 * OCSF influence: observable.json object informs structure; type_id enum informs
 * type taxonomy. OCSF is NOT Commander authority.
 */

import type { CommonFields } from './common';
import type { ObservableType } from './coim';

// Re-export ObservableType from coim.ts (single source of truth for the enum)
export type { ObservableType } from './coim';

// ─── Observable Type Constants ───────────────────────────────────────────────

/**
 * All observable types as a constant array.
 * OCSF influence: observable.json type_id enum.
 */
export const OBSERVABLE_TYPES: ObservableType[] = [
  'ip',
  'domain',
  'hash',
  'url',
  'email',
  'certificate',
  'process',
  'file',
];

// ─── Observable Entity ───────────────────────────────────────────────────────

/**
 * Observable — a first-class typed indicator entity for threat-intelligence
 * correlation, cross-case matching, and indicator-based search.
 *
 * Deduplicated: the same observable value+type combination is stored once and
 * bound to multiple Risk Objects via the many-to-many binding table.
 */
export interface Observable extends CommonFields {
  entity_type: 'observable';

  // ─── Source-owned fields (immutable after write) ─────────────────────────

  /** Observable type classification (ip/domain/hash/url/email/certificate/process/file) */
  observable_type: ObservableType;

  /** Observable value (the indicator itself — IP address, domain name, hash, etc.) */
  value: string;

  /** First observation timestamp (source-provided, immutable) */
  firstSeen: string;

  /** Last observation timestamp (updated on re-observation) */
  lastSeen: string;

  // ─── Commander-owned fields (mutable) ────────────────────────────────────

  /** Reputation score (0-100). Enrichment-derived; Commander-owned. Optional. */
  reputation?: number;
}

// ─── Observable-to-Risk-Object Binding ───────────────────────────────────────

/**
 * Many-to-many binding between Observable and Risk Object.
 * Enables deduplication: one observable can be referenced by many risk objects.
 */
export interface ObservableRiskObjectBinding {
  /** Observable entity ID */
  observableId: string;
  /** Risk Object entity ID */
  risk_object_id: string;
  /** When this binding was created */
  bound_at: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Result of an observable structural validation. */
export interface ObservableValidation {
  valid: boolean;
  errors: string[];
}

/** Maximum reputation score */
export const MAX_REPUTATION = 100;

/** Minimum reputation score */
export const MIN_REPUTATION = 0;

/**
 * Validate an Observable entity for structural correctness.
 * Does NOT validate business rules (deduplication, binding existence).
 * Additive validation — no engine-logic dependency.
 */
export function validateObservable(observable: Observable): ObservableValidation {
  const errors: string[] = [];

  // observableType must be a known type
  if (!OBSERVABLE_TYPES.includes(observable.observable_type)) {
    errors.push(
      `observable_type: unknown type "${observable.observable_type}". Must be one of: ${OBSERVABLE_TYPES.join(', ')}`,
    );
  }

  // value must be a non-empty string
  if (!observable.value || observable.value.trim() === '') {
    errors.push('value: required, must be a non-empty indicator string');
  }

  // firstSeen must be a non-empty string (ISO 8601)
  if (!observable.firstSeen || observable.firstSeen.trim() === '') {
    errors.push('firstSeen: required, must be a non-empty ISO 8601 timestamp');
  }

  // lastSeen must be a non-empty string (ISO 8601)
  if (!observable.lastSeen || observable.lastSeen.trim() === '') {
    errors.push('lastSeen: required, must be a non-empty ISO 8601 timestamp');
  }

  // lastSeen must be >= firstSeen
  if (observable.firstSeen && observable.lastSeen) {
    const firstDate = new Date(observable.firstSeen).getTime();
    const lastDate = new Date(observable.lastSeen).getTime();
    if (!isNaN(firstDate) && !isNaN(lastDate) && lastDate < firstDate) {
      errors.push('lastSeen: must be equal to or after firstSeen');
    }
  }

  // reputation, if present, must be 0-100
  if (observable.reputation !== undefined) {
    if (observable.reputation < MIN_REPUTATION || observable.reputation > MAX_REPUTATION) {
      errors.push(
        `reputation: must be between ${MIN_REPUTATION} and ${MAX_REPUTATION}, got ${observable.reputation}`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
