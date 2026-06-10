/**
 * Strategy Runtime Engine — Commander C2 (Spec 43)
 * Source: Spec #32 Strategy Layer Runtime Surface
 * Consumes: strategy.ts, case-strategy-binding.ts
 * Use Cases: UC-145, UC-147
 */

import type { StrategyPolicy, StrategySurfaceType, RuntimeBindingTrigger, RuntimeBindingEvent } from '../entities/strategy';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PolicyChangeResult {
  success: boolean;
  policy_id: string;
  surface_type: StrategySurfaceType;
  previousVersion: string | null;
  newVersion: string;
  triggeredBindings: RuntimeBindingEvent[];
}

export interface BlockingGateResult {
  passed: boolean;
  featureId: string;
  missingStrategyCoverage: StrategySurfaceType[];
  reason: string;
}

export interface DependencyEvaluation {
  entity_id: string;
  requiredSurfaces: StrategySurfaceType[];
  coveredSurfaces: StrategySurfaceType[];
  gaps: StrategySurfaceType[];
  compliant: boolean;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Apply a policy change — activates a new policy version for a strategy surface.
 * Returns the result including which runtime bindings were triggered.
 */
export function applyPolicyChange(
  policy: StrategyPolicy,
  previousPolicy: StrategyPolicy | null
): PolicyChangeResult {
  const triggeredBindings: RuntimeBindingEvent[] = [];

  // Determine which runtime bindings this surface type triggers
  const surfaceBindingMap: Partial<Record<StrategySurfaceType, RuntimeBindingEvent[]>> = {
    'sla': ['priority-recalculation'],
    'routing': ['route-recalculation'],
    'prioritisation-weight': ['priority-recalculation'],
    'validation-window': ['validation-recalculation'],
    'closure-gate': ['closure-gate-recalculation'],
    'reopening-trigger': ['reopening-evaluation'],
    'posture': ['fusion-map-refresh'],
    'mission-objective': ['fusion-map-refresh'],
  };

  const bindings = surfaceBindingMap[policy.surface_type];
  if (bindings) {
    triggeredBindings.push(...bindings);
  }

  return {
    success: policy.status === 'approved' || policy.status === 'active',
    policy_id: policy.id,
    surface_type: policy.surface_type,
    previousVersion: previousPolicy?.policy_version ?? null,
    newVersion: policy.policy_version,
    triggeredBindings,
  };
}

/**
 * Fire a runtime binding trigger — notifies downstream consumers of a strategy change.
 */
export function fireRuntimeBindingTrigger(
  event: RuntimeBindingEvent,
  sourceSurface: StrategySurfaceType,
  policy_id: string,
  affectedScope: string[]
): RuntimeBindingTrigger {
  return {
    event,
    sourceSurface,
    policy_id,
    affectedScope,
    triggeredAt: new Date().toISOString(),
    auditEventRef: `audit-${policy_id}-${event}-${Date.now()}`,
  };
}

/**
 * Evaluate whether an entity has full strategy coverage for its required surfaces.
 */
export function evaluateStrategyDependency(
  entity_id: string,
  requiredSurfaces: StrategySurfaceType[],
  activePolicies: StrategyPolicy[]
): DependencyEvaluation {
  const activeSurfaces = new Set(
    activePolicies
      .filter((p) => p.status === 'active')
      .map((p) => p.surface_type)
  );

  const coveredSurfaces = requiredSurfaces.filter((s) => activeSurfaces.has(s));
  const gaps = requiredSurfaces.filter((s) => !activeSurfaces.has(s));

  return {
    entity_id,
    requiredSurfaces,
    coveredSurfaces,
    gaps,
    compliant: gaps.length === 0,
  };
}

/**
 * Enforce the build-blocking gate — ensures no strategy-dependent feature ships
 * without full strategy coverage.
 */
export function enforceBlockingGate(
  featureId: string,
  requiredSurfaces: StrategySurfaceType[],
  activePolicies: StrategyPolicy[]
): BlockingGateResult {
  const evaluation = evaluateStrategyDependency(featureId, requiredSurfaces, activePolicies);

  return {
    passed: evaluation.compliant,
    featureId,
    missingStrategyCoverage: evaluation.gaps,
    reason: evaluation.compliant
      ? `Feature ${featureId} has full strategy coverage.`
      : `Feature ${featureId} missing strategy coverage for: ${evaluation.gaps.join(', ')}.`,
  };
}
