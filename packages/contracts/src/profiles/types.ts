/**
 * Domain Profile Interface Contract — Commander C2 CMEP-1.0
 *
 * Defines the DomainProfile interface that each case domain (vulnerability,
 * identity, exposure, etc.) implements to provide domain-specific behaviour
 * to the type-agnostic case kernel.
 *
 * Each domain profile provides:
 * - Signal resolution (priority signal computation)
 * - SLA modifiers (domain-specific SLA adjustments)
 * - Validation profile (what validation types apply)
 * - Closure gates (domain-specific closure prerequisites)
 * - Reopening triggers (domain-specific reopen conditions)
 */

// ─── Signal Resolution ───────────────────────────────────────────────────────

/** A named priority signal with its raw score (0–100) */
export interface PrioritySignalScore {
  /** Signal name (e.g. 'severity', 'exploitability', 'blastRadius') */
  name: string;
  /** Raw score 0–100 */
  score: number;
  /** Human-readable rationale for the score */
  rationale: string;
}

/** Result of signal resolution — weighted composite score with breakdown */
export interface SignalResolutionResult {
  /** Weighted composite score (0–100) */
  compositeScore: number;
  /** Individual signal scores */
  signals: PrioritySignalScore[];
  /** Weights used (signal name → weight) */
  weightsApplied: Record<string, number>;
}

/** Signal resolver function signature */
export type SignalResolver<TContext = unknown> = (
  context: TContext,
  weights: Record<string, number>,
) => SignalResolutionResult;

// ─── SLA Modifiers ───────────────────────────────────────────────────────────

/** A single SLA modifier with its multiplier and reason */
export interface SlaModifier {
  /** Modifier name */
  name: string;
  /** Multiplier (< 1 = faster SLA, > 1 = slower SLA) */
  multiplier: number;
  /** Whether this modifier is active for the current context */
  active: boolean;
  /** Human-readable reason */
  reason: string;
}

/** SLA modifier function signature */
export type SlaModifierResolver<TContext = unknown> = (
  context: TContext,
) => SlaModifier[];

// ─── Validation Profile ──────────────────────────────────────────────────────

/** A validation type that applies to a domain */
export interface ValidationTypeDefinition {
  /** Validation type identifier */
  type: string;
  /** Human-readable description */
  description: string;
  /** Whether this validation is mandatory for closure */
  mandatory: boolean;
  /** Estimated duration in hours */
  estimatedDurationHours: number;
}

/** Validation profile function signature */
export type ValidationProfileResolver<TContext = unknown> = (
  context: TContext,
) => ValidationTypeDefinition[];

// ─── Closure Gates ───────────────────────────────────────────────────────────

/** A domain-specific closure gate */
export interface ClosureGate {
  /** Gate identifier */
  gateId: string;
  /** Human-readable description */
  description: string;
  /** Whether the gate is currently satisfied */
  satisfied: boolean;
  /** Reason for current satisfaction state */
  reason: string;
}

/** Closure gate evaluator function signature */
export type ClosureGateEvaluator<TContext = unknown> = (
  context: TContext,
) => ClosureGate[];

// ─── Reopening Triggers ──────────────────────────────────────────────────────

/** A domain-specific reopening trigger */
export interface ReopeningTrigger {
  /** Trigger identifier */
  triggerId: string;
  /** Human-readable description */
  description: string;
  /** Whether the trigger is currently firing */
  fired: boolean;
  /** Reason for current state */
  reason: string;
}

/** Reopening trigger evaluator function signature */
export type ReopeningTriggerEvaluator<TContext = unknown> = (
  context: TContext,
) => ReopeningTrigger[];

// ─── Domain Profile ──────────────────────────────────────────────────────────

/**
 * DomainProfile — the contract each case domain implements.
 *
 * Type-agnostic kernel engines call domain profiles to obtain
 * domain-specific behaviour without hardcoding domain knowledge.
 */
export interface DomainProfile<TContext = unknown> {
  /** Domain identifier (e.g. 'vulnerability', 'identity', 'exposure') */
  readonly domain: string;
  /** Resolve priority signals for this domain */
  signalResolver: SignalResolver<TContext>;
  /** Compute domain-specific SLA modifiers */
  slaModifiers: SlaModifierResolver<TContext>;
  /** Define validation types for this domain */
  validationProfile: ValidationProfileResolver<TContext>;
  /** Evaluate domain-specific closure gates */
  closureGates: ClosureGateEvaluator<TContext>;
  /** Evaluate domain-specific reopening triggers */
  reopeningTriggers: ReopeningTriggerEvaluator<TContext>;
}
