/**
 * Case Strategy Binding — Commander C2
 *
 * Source: Spec #32 Strategy Layer Runtime Surface, Spec #08 Case Management
 * Defines how cases consume strategy layer policies. NO hardcoded values.
 *
 * Each case binds to strategy policies for:
 * - Routing (owner/team determination)
 * - SLA (target resolution hours)
 * - Prioritisation weight (priority calculation)
 * - Closure gate (closure requirements)
 * - Reopening trigger (reopening conditions)
 * - Validation window (validation freshness)
 */

import type { StrategySurfaceType } from './strategy';

/** A reference to a strategy policy binding */
export interface StrategyPolicyRef {
  /** Strategy surface type — from Spec #32 canonical types */
  surface_type: StrategySurfaceType;
  /** Policy ID reference */
  policy_id: string;
  /** Policy version applied */
  policy_version: string;
  /** When this binding was evaluated */
  evaluated_at: string;
}

/**
 * CaseStrategyBinding — links a case to its governing strategy policies.
 * All values are derived from strategy layer; none are hardcoded.
 */
export interface CaseStrategyBinding {
  /** Case ID this binding applies to */
  case_id: string;
  /** Routing strategy — determines owner/team */
  routingStrategy: StrategyPolicyRef;
  /** SLA strategy — determines SLA target hours */
  slaStrategy: StrategyPolicyRef;
  /** Prioritisation weight strategy — determines priority calculation */
  prioritisationWeightStrategy: StrategyPolicyRef;
  /** Closure gate strategy — determines closure gates */
  closureGateStrategy: StrategyPolicyRef;
  /** Reopening trigger strategy — determines reopening triggers */
  reopeningTriggerStrategy: StrategyPolicyRef;
  /** Validation window strategy — determines validation freshness */
  validationWindowStrategy: StrategyPolicyRef;
}

/**
 * The six strategy surfaces consumed by case management.
 * These must reference StrategySurfaceType values from strategy.ts.
 */
export const CASE_STRATEGY_SURFACES: StrategySurfaceType[] = [
  'routing',
  'sla',
  'prioritisation-weight',
  'closure-gate',
  'reopening-trigger',
  'validation-window',
];
