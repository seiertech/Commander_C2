/**
 * KEV/EPSS Priority Signal Engine — Commander C2
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 4.2, 18.4
 *
 * Pure function that computes an intelligence priority signal from vulnerability
 * metadata (CISA KEV status, KEV due date, EPSS score/percentile, CVSS score).
 *
 * CRITICAL INVARIANT: This engine NEVER creates tenant risk alone (Req 4.2, 18.4).
 * It produces a signal consumed by case priority/routing — not a risk-creation path.
 *
 * Deterministic, pure, no I/O.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export interface PrioritySignal {
  /** Additive priority boost (0–100) for downstream case priority/routing */
  priorityBoost: number;
  /** Urgency level derived from intelligence signals */
  urgencyLevel: UrgencyLevel;
  /** Factors contributing to this signal (human-readable) */
  factors: string[];
  /** KEV due date pressure (days remaining, null if not KEV or no due date) */
  kevDueDatePressure: number | null;
}

export interface VulnerabilitySignalInput {
  /** CISA KEV status — whether this CVE is on the KEV list */
  cisaKevStatus: boolean;
  /** KEV due date (ISO 8601 string or null) */
  kevDueDate: string | null;
  /** EPSS score (0–1 probability, null if unavailable) */
  epss_score: number | null;
  /** EPSS percentile (0–100, null if unavailable) */
  epssPercentile: number | null;
  /** CVSS numeric score (0–10) */
  cvss_score: number;
}

export interface TenantEvaluationContext {
  /** Whether the tenant has confirmed exposure */
  hasConfirmedExposure?: boolean;
  /** Whether the tenant has matching assets */
  hasMatchingAssets?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** KEV presence adds a significant priority boost */
const KEV_BOOST = 35;

/** EPSS percentile > 90th adds a moderate boost */
const EPSS_HIGH_PERCENTILE_BOOST = 20;

/** EPSS percentile > 70th adds a smaller boost */
const EPSS_MODERATE_PERCENTILE_BOOST = 10;

/** KEV due date within 7 days adds urgency */
const KEV_DUE_IMMINENT_DAYS = 7;
const KEV_DUE_IMMINENT_BOOST = 15;

/** KEV due date within 14 days adds moderate urgency */
const KEV_DUE_APPROACHING_DAYS = 14;
const KEV_DUE_APPROACHING_BOOST = 8;

/** KEV overdue adds maximum due-date pressure */
const KEV_OVERDUE_BOOST = 20;

/** CVSS >= 9.0 adds informational context boost */
const CVSS_CRITICAL_BOOST = 5;

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Computes an intelligence priority signal from vulnerability metadata.
 *
 * NEVER creates tenant risk alone (Req 4.2, 18.4). This is a signal consumed
 * by case priority/routing, not a risk-creation path.
 *
 * @param vulnRecord - Vulnerability intelligence fields (KEV, EPSS, CVSS)
 * @param tenantEvaluation - Optional tenant context (does NOT create risk without confirmed exposure)
 * @param now - Optional current time for testing determinism (defaults to new Date())
 * @returns PrioritySignal with boost, urgency, factors and due date pressure
 */
export function computeIntelligencePrioritySignal(
  vulnRecord: VulnerabilitySignalInput,
  tenantEvaluation?: TenantEvaluationContext,
  now?: Date,
): PrioritySignal {
  const currentTime = now ?? new Date();
  let priorityBoost = 0;
  const factors: string[] = [];
  let kevDueDatePressure: number | null = null;

  // ─── KEV Status ────────────────────────────────────────────────────────────
  if (vulnRecord.cisaKevStatus) {
    priorityBoost += KEV_BOOST;
    factors.push(`CISA KEV listed (+${KEV_BOOST} boost)`);

    // KEV due date pressure
    if (vulnRecord.kevDueDate) {
      const dueDate = new Date(vulnRecord.kevDueDate);
      const daysRemaining = Math.ceil((dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
      kevDueDatePressure = daysRemaining;

      if (daysRemaining <= 0) {
        // Overdue
        priorityBoost += KEV_OVERDUE_BOOST;
        factors.push(`KEV due date OVERDUE by ${Math.abs(daysRemaining)} day(s) (+${KEV_OVERDUE_BOOST} boost)`);
      } else if (daysRemaining <= KEV_DUE_IMMINENT_DAYS) {
        // Imminent
        priorityBoost += KEV_DUE_IMMINENT_BOOST;
        factors.push(`KEV due date imminent: ${daysRemaining} day(s) remaining (+${KEV_DUE_IMMINENT_BOOST} boost)`);
      } else if (daysRemaining <= KEV_DUE_APPROACHING_DAYS) {
        // Approaching
        priorityBoost += KEV_DUE_APPROACHING_BOOST;
        factors.push(`KEV due date approaching: ${daysRemaining} day(s) remaining (+${KEV_DUE_APPROACHING_BOOST} boost)`);
      } else {
        factors.push(`KEV due date: ${daysRemaining} day(s) remaining (no additional boost)`);
      }
    }
  }

  // ─── EPSS Score/Percentile ─────────────────────────────────────────────────
  if (vulnRecord.epssPercentile !== null && vulnRecord.epssPercentile !== undefined) {
    if (vulnRecord.epssPercentile > 90) {
      priorityBoost += EPSS_HIGH_PERCENTILE_BOOST;
      factors.push(`EPSS percentile ${vulnRecord.epssPercentile} > 90th (+${EPSS_HIGH_PERCENTILE_BOOST} boost)`);
    } else if (vulnRecord.epssPercentile > 70) {
      priorityBoost += EPSS_MODERATE_PERCENTILE_BOOST;
      factors.push(`EPSS percentile ${vulnRecord.epssPercentile} > 70th (+${EPSS_MODERATE_PERCENTILE_BOOST} boost)`);
    } else {
      factors.push(`EPSS percentile ${vulnRecord.epssPercentile} (informational — no boost)`);
    }
  }

  // ─── CVSS (informational context only) ─────────────────────────────────────
  if (vulnRecord.cvss_score >= 9.0) {
    priorityBoost += CVSS_CRITICAL_BOOST;
    factors.push(`CVSS ${vulnRecord.cvss_score} >= 9.0 — critical severity context (+${CVSS_CRITICAL_BOOST} informational boost)`);
  } else if (vulnRecord.cvss_score >= 7.0) {
    factors.push(`CVSS ${vulnRecord.cvss_score} — high severity context (informational, no boost)`);
  } else {
    factors.push(`CVSS ${vulnRecord.cvss_score} — informational context only`);
  }

  // ─── Clamp to 0–100 ───────────────────────────────────────────────────────
  priorityBoost = Math.max(0, Math.min(100, priorityBoost));

  // ─── Urgency Level Derivation ──────────────────────────────────────────────
  const urgencyLevel = deriveUrgencyLevel(priorityBoost, kevDueDatePressure, vulnRecord);

  return {
    priorityBoost,
    urgencyLevel,
    factors,
    kevDueDatePressure,
  };
}

// ─── Urgency Level Derivation ────────────────────────────────────────────────

function deriveUrgencyLevel(
  boost: number,
  kevDueDatePressure: number | null,
  vulnRecord: VulnerabilitySignalInput,
): UrgencyLevel {
  // Critical: KEV + overdue or imminent
  if (vulnRecord.cisaKevStatus && kevDueDatePressure !== null && kevDueDatePressure <= KEV_DUE_IMMINENT_DAYS) {
    return 'critical';
  }

  // High: KEV with approaching due date or high EPSS + high CVSS
  if (boost >= 50) {
    return 'high';
  }

  // Medium: moderate boost signals
  if (boost >= 30) {
    return 'medium';
  }

  // Low: some signal present
  if (boost >= 10) {
    return 'low';
  }

  // Informational: no significant intelligence signal
  return 'informational';
}
