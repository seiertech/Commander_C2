/**
 * Case Strategy Resolvers — Commander C2
 *
 * Phase B: Strategy consumption logic.
 * Phase D4: Assignment & Routing Engine.
 * Each resolver reads from Spec 43 strategy surfaces.
 * NO hardcoded values. Unresolved states are typed and explicit.
 */

export { resolveSla, type SlaResolution } from './case-sla-calculator';
export { resolveRouting, type RoutingResolution } from './case-router';
export { resolvePriority, type PriorityResolution } from './case-prioritiser';
export { resolveValidationWindow, type ValidationResolution } from './case-validation-evaluator';
export { resolveClosureGates, type ClosureGateResolution } from './case-closure-evaluator';
export { resolveReopeningTriggers, type ReopeningResolution } from './case-reopening-evaluator';
export { resolveAllStrategies, type FullStrategyResolution } from './case-strategy-resolver';
export {
  computeCaseAggregation,
  type CaseAggregation,
  MAX_CASE_ATTACK_BINDINGS,
  MAX_BLAST_RADIUS_SCORE,
} from './case-aggregation-resolver';
export { evaluateValidationWindow, type ValidationWindowState } from './validation-window-enforcer';
export { evaluateClosureGates, type GateEvaluationInput, type ClosureGateResult } from './closure-gate-enforcer';
export { evaluateReopeningTriggers, type ReopeningConditions, type ReopeningTriggerResult } from './reopening-trigger-enforcer';

// Phase D4: Assignment & Routing Engine
export {
  assignCase,
  reassignCase,
  isEscalationTimeoutExceeded,
  extractRoutingConfig,
  hasCapacity,
  loadFactor,
  matchesSpecialism,
  filterBySpecialism,
  passesAntiHoarding,
  assignmentScore,
  type AssignmentResult,
  type AssignmentAuditEvent,
  type ReassignmentRequest,
  type ReassignmentReason,
  type WorkloadSnapshot,
  type AnalystProfile,
  type AnalystRank,
  type RoutingStrategyConfig,
} from './assignment-engine';


