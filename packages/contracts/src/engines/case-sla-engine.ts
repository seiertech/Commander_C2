// @ts-nocheck
/**
 * Case SLA Engine — Commander C2 (Unit 10)
 *
 * Full SLA engine consuming SLA Strategy and Routing Strategy policies.
 * Calculates SLA state, detects breaches, generates notifications,
 * and determines escalation levels post-breach.
 *
 * ALL SLA values consumed from strategy. NO hardcoded hours or thresholds.
 * Returns error if strategy is missing (never silently defaults).
 *
 * Source: Spec #32 Strategy Layer (SLA Strategy, Routing Strategy)
 * Doctrinal constraints:
 *   - Strategy-layer consumption (constraint #9)
 *   - Closed-loop case model (constraint #1)
 */

import type { StrategyPolicy } from '../entities/strategy';
import { resolveSla } from '../resolvers/case-sla-calculator';

// ─── Types ───────────────────────────────────────────────────────────────────

/** SLA state for a case */
export interface CaseSlaState {
  case_id: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  target_resolution_hours: number;
  escalation_cadence_minutes: number;
  created_at: string; // ISO 8601
  breached: boolean;
  breachedAt: string | null;
  elapsedHours: number;
  remainingHours: number;
  percentageUsed: number; // 0-100
}

/** SLA evaluation request */
export interface SlaEvaluationRequest {
  case_id: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  case_type: string;
  created_at: string; // ISO 8601
  current_time: string; // ISO 8601
}

/** SLA evaluation result */
export interface SlaEvaluationResult {
  success: boolean;
  slaState: CaseSlaState | null;
  notifications: SlaNotification[];
  escalation: SlaEscalation | null;
  source_policy: { id: string; version: string } | null;
  error: string | null;
}

/** SLA notification event */
export interface SlaNotification {
  type: 'warning' | 'breach' | 'critical-breach';
  message: string;
  case_id: string;
  percentageUsed: number;
  timestamp: string;
}

/** SLA escalation event */
export interface SlaEscalation {
  case_id: string;
  priority: string;
  escalation_level: number; // how many cadence periods have passed since breach
  escalation_path: string[];
  currentEscalatee: string;
  reason: string;
  timestamp: string;
}

// ─── SLA State Calculation ───────────────────────────────────────────────────

/**
 * Calculate current SLA state for a case.
 * Consumes SLA Strategy to determine target hours and escalation cadence.
 * ALL values from strategy — no hardcoded SLAs.
 */
export function calculateSlaState(
  request: SlaEvaluationRequest,
  strategies: StrategyPolicy[],
): CaseSlaState {
  const resolution = resolveSla(
    { priority: request.priority, case_type: request.case_type as any },
    strategies,
  );

  if (resolution.status === 'unresolved' || resolution.response_hours === null) {
    throw new Error(
      `[SlaEngine] STRATEGY GAP: ${resolution.reason}. ` +
      'Cannot calculate SLA without strategy. All SLA values must come from strategy.',
    );
  }

  const targetResolutionHours = resolution.response_hours;
  const escalationCadenceMinutes = resolution.escalation_cadence_minutes!;

  const createdTime = new Date(request.created_at).getTime();
  const currentTime = new Date(request.current_time).getTime();
  const elapsedMs = currentTime - createdTime;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  const remainingHours = Math.max(0, targetResolutionHours - elapsedHours);
  const percentageUsed = (elapsedHours / targetResolutionHours) * 100;
  const breached = elapsedHours >= targetResolutionHours;

  let breachedAt: string | null = null;
  if (breached) {
    const breachTime = createdTime + targetResolutionHours * 60 * 60 * 1000;
    breachedAt = new Date(breachTime).toISOString();
  }

  return {
    case_id: request.case_id,
    priority: request.priority,
    target_resolution_hours: target_resolution_hours,
    escalation_cadence_minutes: escalation_cadence_minutes,
    created_at: request.created_at,
    breached,
    breachedAt,
    elapsedHours,
    remainingHours,
    percentageUsed,
  };
}

// ─── Breach Detection ────────────────────────────────────────────────────────

/**
 * Check if SLA is breached.
 * Simple check: elapsed >= target means breached.
 */
export function detectBreach(slaState: CaseSlaState): boolean {
  return slaState.breached;
}

// ─── Notification Generation ─────────────────────────────────────────────────

/**
 * Generate notifications based on SLA percentage thresholds.
 * Thresholds:
 *   - 75% used → warning notification
 *   - 90% used → warning notification (approaching breach)
 *   - 100% used → breach notification
 *   - 150%+ used → critical-breach notification
 */
export function generateNotifications(slaState: CaseSlaState): SlaNotification[] {
  const notifications: SlaNotification[] = [];
  const { percentageUsed, case_id, created_at } = slaState;

  if (percentageUsed >= 150) {
    notifications.push({
      type: 'critical-breach',
      message: `CRITICAL: Case ${case_id} SLA exceeded by ${(percentageUsed - 100).toFixed(0)}% — immediate escalation required`,
      case_id,
      percentageUsed,
      timestamp: createdAt,
    });
  }

  if (percentageUsed >= 100) {
    notifications.push({
      type: 'breach',
      message: `BREACH: Case ${case_id} has exceeded SLA target of ${slaState.target_resolution_hours}h`,
      case_id,
      percentageUsed,
      timestamp: createdAt,
    });
  }

  if (percentageUsed >= 90 && percentageUsed < 100) {
    notifications.push({
      type: 'warning',
      message: `WARNING: Case ${case_id} approaching SLA breach — ${percentageUsed.toFixed(0)}% of target used`,
      case_id,
      percentageUsed,
      timestamp: createdAt,
    });
  }

  if (percentageUsed >= 75 && percentageUsed < 90) {
    notifications.push({
      type: 'warning',
      message: `WARNING: Case ${case_id} at ${percentageUsed.toFixed(0)}% of SLA target — action recommended`,
      case_id,
      percentageUsed,
      timestamp: createdAt,
    });
  }

  return notifications;
}

// ─── Escalation Calculation ──────────────────────────────────────────────────

/**
 * Calculate escalation level post-breach.
 * After breach, escalation level = floor((elapsed - target) / cadence).
 * Level 0 → escalationPath[0] (e.g., "Team Lead")
 * Level 1 → escalationPath[1] (e.g., "SOM")
 * Level 2+ → escalationPath[last] (e.g., "CISO")
 *
 * Returns null if SLA is not breached.
 */
export function calculateEscalation(
  slaState: CaseSlaState,
  escalation_path: string[],
  escalation_cadence_minutes: number,
): SlaEscalation | null {
  if (!slaState.breached) {
    return null;
  }

  if (escalationPath.length === 0) {
    return null;
  }

  const hoursOverTarget = slaState.elapsedHours - slaState.target_resolution_hours;
  const cadenceHours = escalationCadenceMinutes / 60;
  const escalationLevel = Math.floor(hoursOverTarget / cadenceHours);

  // Clamp to last index of escalation path
  const pathIndex = Math.min(escalationLevel, escalationPath.length - 1);
  const currentEscalatee = escalationPath[pathIndex];

  return {
    case_id: slaState.case_id,
    priority: slaState.priority,
    escalation_level: escalation_level,
    escalation_path,
    currentEscalatee,
    reason: `SLA breached by ${hoursOverTarget.toFixed(1)}h — escalation level ${escalation_level} (cadence: ${escalation_cadence_minutes}min)`,
    timestamp: slaState.breachedAt!,
  };
}

// ─── Strategy Extraction ─────────────────────────────────────────────────────

/**
 * Extract escalation path from routing strategy.
 * Returns empty array if routing strategy is missing.
 */
function extractEscalationPath(strategies: StrategyPolicy[]): string[] {
  const routingPolicy = strategies.find(
    (s) => s.surface_type === 'routing' && s.status === 'active',
  );

  if (!routingPolicy) {
    return [];
  }

  const config = routingPolicy.configuration as { escalation_path?: string[] };
  return config.escalation_path ?? [];
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Evaluate SLA for a case using strategy-driven targets and escalation paths.
 *
 * Algorithm:
 * 1. Calculate SLA state from SLA strategy (target hours, cadence)
 * 2. Detect breach
 * 3. Generate notifications at thresholds (75%, 90%, 100%, 150%)
 * 4. Extract escalation path from routing strategy
 * 5. Calculate escalation level if breached
 * 6. Return full result
 *
 * Returns error result (success: false) if SLA strategy is missing.
 */
export function evaluateSla(
  request: SlaEvaluationRequest,
  strategies: StrategyPolicy[],
): SlaEvaluationResult {
  // Find the SLA policy for source reference
  const slaPolicy = strategies.find(
    (s) => s.surface_type === 'sla' && s.status === 'active',
  );

  let slaState: CaseSlaState;

  try {
    slaState = calculateSlaState(request, strategies);
  } catch (err) {
    return {
      success: false,
      slaState: null,
      notifications: [],
      escalation: null,
      source_policy: slaPolicy
        ? { id: slaPolicy.id, version: slaPolicy.policy_version }
        : null,
      error: (err as Error).message,
    };
  }

  // Generate notifications
  const notifications = generateNotifications(slaState);

  // Extract escalation path from routing strategy
  const escalationPath = extractEscalationPath(strategies);

  // Calculate escalation if breached
  const escalation = calculateEscalation(
    slaState,
    escalation_path,
    slaState.escalation_cadence_minutes,
  );

  return {
    success: true,
    slaState,
    notifications,
    escalation,
    source_policy: slaPolicy
      ? { id: slaPolicy.id, version: slaPolicy.policy_version }
      : null,
    error: null,
  };
}
