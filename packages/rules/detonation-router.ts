/**
 * Detonation Verdict Router — Commander C2
 *
 * Communications Excellence Phase 1.
 * Pure function for routing detonation verdicts to outcomes.
 *
 * Logic:
 * - clean → proceed_normal
 * - malicious → create_risk_object (type: detection finding class) + case type: threat-intelligence-estate-match
 * - suspicious → analyst_review
 *
 * Constraints:
 * - SOC read-only boundary: verdicts consumed, not produced
 * - No live Graph API (Phase 1)
 * - Deterministic: same verdict always produces same route
 */

import type { DetonationVerdict } from '../contracts/src/entities/detonation-verdict';
import type { CaseType } from '../contracts/src/entities/case';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DetonationRoute = 'proceed_normal' | 'create_risk_object' | 'analyst_review';

export interface DetonationRoutingResult {
  /** The route determined for this verdict */
  route: DetonationRoute;
  /** Risk object finding class (only for create_risk_object route) */
  riskObjectType?: string;
  /** Case type to create (only for create_risk_object route) */
  case_type?: CaseType;
  /** Reasoning for the routing decision */
  reason: string;
}

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Route a detonation verdict to the appropriate outcome.
 * Total and deterministic: every valid verdict produces exactly one route.
 *
 * @param verdict - The detonation verdict to route
 * @returns DetonationRoutingResult with route, optional risk object/case type, and reason
 */
export function routeDetonationVerdict(verdict: DetonationVerdict): DetonationRoutingResult {
  switch (verdict.overallVerdict) {
    case 'clean':
      return {
        route: 'proceed_normal',
        reason: 'Email detonation verdict is clean — no action required. Proceed with normal processing.',
      };

    case 'malicious':
      return {
        route: 'create_risk_object',
        riskObjectType: 'detection',
        case_type: 'threat-intelligence-estate-match',
        reason: `Malicious verdict from ${verdict.detonationSource}. Creating risk object (detection finding class) and threat-intelligence-estate-match case. ${summariseChecks(verdict)}`,
      };

    case 'suspicious':
      return {
        route: 'analyst_review',
        reason: `Suspicious verdict from ${verdict.detonationSource} — routing to analyst review queue for manual triage. ${summariseChecks(verdict)}`,
      };

    default:
      // Defensive fallback — should never reach here with valid data
      return {
        route: 'analyst_review',
        reason: `Unknown verdict '${verdict.overallVerdict}' — routing to analyst review as precaution.`,
      };
  }
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function summariseChecks(verdict: DetonationVerdict): string {
  if (!verdict.checks || verdict.checks.length === 0) return '';
  const failedChecks = verdict.checks.filter((c) => c.result === 'fail' || c.result === 'suspicious');
  if (failedChecks.length === 0) return '';
  return `Failed/suspicious checks: ${failedChecks.map((c) => `${c.checkType}(${c.result})`).join(', ')}.`;
}
