/**
 * Suppression Engine — Commander C2 (Spec 34)
 *
 * Source: Spec #34 Drift and Rule Engine
 *
 * Deduplicates and suppresses findings (UC-170). Doctrine:
 *   - Identical dedupeKeys collapse to a single active finding — the engine
 *     never creates a second active finding for the same observation.
 *   - Suppression records a reason and is reversible (status only).
 *
 * Pure functions over Finding records — no I/O.
 */

import type { Finding } from '../entities/finding';

/** Statuses considered "active" for dedupe purposes. */
const ACTIVE_STATUSES: Finding['status'][] = ['new', 'acknowledged'];

// ─── checkDedupeKey ──────────────────────────────────────────────────────────

/**
 * Return true when an active finding with the same dedupeKey already exists in
 * the provided set (excluding the candidate itself by id).
 */
export function checkDedupeKey(candidate: Finding, existing: Finding[]): boolean {
  return existing.some(
    (f) =>
      f.id !== candidate.id &&
      f.tenantId === candidate.tenantId &&
      f.dedupeKey === candidate.dedupeKey &&
      ACTIVE_STATUSES.includes(f.status),
  );
}

// ─── deduplicateFinding ──────────────────────────────────────────────────────

export interface DedupeResult {
  /** Whether the candidate duplicates an existing active finding */
  isDuplicate: boolean;
  /** The canonical finding to keep (existing one if duplicate, else candidate) */
  finding: Finding;
  /** Id of the active finding the candidate was merged into (null if new) */
  mergedInto: string | null;
}

/**
 * Collapse a candidate finding against existing active findings sharing its
 * dedupeKey. If a duplicate exists, the candidate is merged into it (the
 * existing finding is kept and its updatedAt advanced); otherwise the candidate
 * is returned unchanged as a new finding.
 */
export function deduplicateFinding(candidate: Finding, existing: Finding[]): DedupeResult {
  const match = existing.find(
    (f) =>
      f.id !== candidate.id &&
      f.tenantId === candidate.tenantId &&
      f.dedupeKey === candidate.dedupeKey &&
      ACTIVE_STATUSES.includes(f.status),
  );

  if (!match) {
    return { isDuplicate: false, finding: candidate, mergedInto: null };
  }

  // Keep the existing finding; advance its updatedAt to the later timestamp and
  // raise severity/confidence to the stronger of the two observations.
  const merged: Finding = {
    ...match,
    severity: Math.max(match.severity, candidate.severity),
    confidence: Math.max(match.confidence, candidate.confidence),
    updatedAt: candidate.detectedAt > match.updatedAt ? candidate.detectedAt : match.updatedAt,
  };

  return { isDuplicate: true, finding: merged, mergedInto: match.id };
}

// ─── suppressByRule ──────────────────────────────────────────────────────────

export interface SuppressionRule {
  /** Match findings whose dedupeKey contains this substring */
  matchDedupeKey?: string;
  /** Match findings emitted by this rule reference */
  matchRuleRef?: string;
  /** Match findings affecting this entity reference */
  matchAffectedEntityRef?: string;
  /** Reason recorded on suppressed findings */
  reason: string;
}

/**
 * Apply suppression rules to a finding. Returns a suppressed copy (status
 * 'suppressed' with a recorded reason) when any rule matches; otherwise returns
 * the finding unchanged. Already-resolved/false-positive findings are left as is.
 */
export function suppressByRule(finding: Finding, rules: SuppressionRule[]): Finding {
  if (finding.status === 'resolved' || finding.status === 'false_positive' || finding.status === 'suppressed') {
    return finding;
  }

  const matched = rules.find((r) => {
    const keyMatch = r.matchDedupeKey ? finding.dedupeKey.includes(r.matchDedupeKey) : false;
    const ruleMatch = r.matchRuleRef ? finding.ruleRef === r.matchRuleRef : false;
    const entityMatch = r.matchAffectedEntityRef ? finding.affectedEntityRef === r.matchAffectedEntityRef : false;
    return keyMatch || ruleMatch || entityMatch;
  });

  if (!matched) {
    return finding;
  }

  return {
    ...finding,
    status: 'suppressed',
    suppressionReason: matched.reason,
    updatedAt: finding.detectedAt,
  };
}
