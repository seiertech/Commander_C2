/**
 * Case Strategy Resolver — Commander C2
 *
 * Orchestrates all 6 strategy resolutions for a case.
 * Reads from Spec 43 strategy surfaces. NO hardcoded values.
 *
 * Source: Spec #32 Strategy Layer Runtime Surface
 */

import type { StrategyPolicy } from '../entities/strategy';
import type { Case } from '../entities/case';
import { resolveSla, type SlaResolution } from './case-sla-calculator';
import { resolveRouting, type RoutingResolution } from './case-router';
import { resolvePriority, type PriorityResolution } from './case-prioritiser';
import { resolveValidationWindow, type ValidationResolution } from './case-validation-evaluator';
import { resolveClosureGates, type ClosureGateResolution } from './case-closure-evaluator';
import { resolveReopeningTriggers, type ReopeningResolution } from './case-reopening-evaluator';

export interface FullStrategyResolution {
  sla: SlaResolution;
  routing: RoutingResolution;
  priority: PriorityResolution;
  validation: ValidationResolution;
  closure_gates: ClosureGateResolution;
  reopening: ReopeningResolution;
}

/**
 * Resolve all 6 strategy surfaces for a given case.
 * Every value comes from strategy layer — zero hardcoded defaults.
 */
export function resolveAllStrategies(
  caseRecord: Pick<Case, 'priority' | 'case_type'>,
  strategies: StrategyPolicy[],
): FullStrategyResolution {
  return {
    sla: resolveSla(caseRecord, strategies),
    routing: resolveRouting(caseRecord, strategies),
    priority: resolvePriority(strategies),
    validation: resolveValidationWindow(strategies),
    closure_gates: resolveClosureGates(strategies),
    reopening: resolveReopeningTriggers(strategies),
  };
}
