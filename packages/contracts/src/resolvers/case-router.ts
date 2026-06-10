/**
 * Case Router — Commander C2
 *
 * Consumes Routing Strategy from Spec 43 to determine case assignment.
 * NEVER hardcodes routing rules. Returns 'unresolved' if strategy data is missing.
 *
 * Source: Spec #32 §Strategy Surfaces (Routing Strategy)
 * Doctrinal constraint: Strategy-layer consumption (constraint #9)
 * Doctrinal constraint: Closed-loop case model — no manual override (constraint #1)
 */

import type { StrategyPolicy } from '../entities/strategy';
import type { Case, CaseTypeExtended } from '../entities/case';

export interface RoutingResolution {
  status: 'resolved' | 'unresolved';
  team: string | null;
  escalation_path: string[] | null;
  source_policy: { id: string; version: string } | null;
  reason: string;
}

/**
 * Resolve routing for a case by reading from the Routing Strategy policy.
 * Maps case type to team affinity defined in strategy configuration.
 */
export function resolveRouting(
  caseRecord: Pick<Case, 'caseType'>,
  strategies: StrategyPolicy[],
): RoutingResolution {
  const routingPolicy = strategies.find(
    (s) => s.surface_type === 'routing' && s.status === 'active',
  );

  if (!routingPolicy) {
    return { status: 'unresolved', team: null, escalation_path: null, source_policy: null, reason: 'No active routing strategy policy found' };
  }

  const config = routingPolicy.configuration as {
    teamAffinity?: Record<string, string>;
    escalation_path?: string[];
  };

  if (!config.teamAffinity) {
    return { status: 'unresolved', team: null, escalation_path: null, source_policy: { id: routingPolicy.id, version: routingPolicy.policy_version }, reason: 'Routing strategy has no teamAffinity configured' };
  }

  const team = config.teamAffinity[caseRecord.case_type as string] ?? null;
  const escalationPath = config.escalation_path ?? null;

  if (!team) {
    return { status: 'unresolved', team: null, escalation_path, source_policy: { id: routingPolicy.id, version: routingPolicy.policy_version }, reason: `No team affinity found for case type "${caseRecord.case_type}"` };
  }

  return {
    status: 'resolved',
    team,
    escalation_path,
    source_policy: { id: routingPolicy.id, version: routingPolicy.policy_version },
    reason: `Routed to "${team}" via team affinity for case type "${caseRecord.case_type}"`,
  };
}
