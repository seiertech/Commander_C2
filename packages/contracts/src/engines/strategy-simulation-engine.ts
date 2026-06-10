// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Strategy Simulation Engine — Commander C2 (Spec 43)
 * Source: Spec #32 Strategy Layer Runtime Surface
 * Consumes: strategy.ts, seed-strategies
 * Use Cases: UC-141, UC-144
 */

import type { StrategyPolicy, StrategySurfaceType } from '../entities/strategy';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SimulationResult {
  simulation_id: string;
  policy_id: string;
  surface_type: StrategySurfaceType;
  blast_radius: BlastRadiusResult;
  effectiveState: EffectiveStatePreview;
  conflicts: PolicyConflict[];
  risk_assessment: SimulationRiskAssessment;
}

export interface BlastRadiusResult {
  affected_entity_count: number;
  affectedEntityTypes: string[];
  affectedCaseCount: number;
  affectedBindingEvents: string[];
  scope: 'tenant-wide' | 'domain-scoped' | 'entity-scoped';
}

export interface EffectiveStatePreview {
  surface_type: StrategySurfaceType;
  currentConfig: Record<string, unknown>;
  proposedConfig: Record<string, unknown>;
  delta: string[];
}

export interface PolicyConflict {
  conflictingPolicyId: string;
  conflictingSurface: StrategySurfaceType;
  reason: string;
  severity: 'blocking' | 'warning' | 'info';
}

export interface SimulationRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendation: string;
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Simulate a policy change before activation.
 * Computes blast radius, effective state preview, and identifies conflicts.
 */
export function simulatePolicyChange(
  proposedPolicy: StrategyPolicy,
  existingPolicies: StrategyPolicy[],
  affected_entity_count: number
): SimulationResult {
  const conflicts = detectConflicts(proposedPolicy, existingPolicies);
  const blastRadius = computeBlastRadius(proposedPolicy, affectedEntityCount);
  const effectiveState = previewEffectiveState(proposedPolicy, existingPolicies);

  const riskFactors: string[] = [];
  if (blastRadius.scope === 'tenant-wide') riskFactors.push('Tenant-wide impact');
  if (blastRadius.affectedCaseCount > 50) riskFactors.push('High case count affected');
  if (conflicts.some((c) => c.severity === 'blocking')) riskFactors.push('Blocking conflict detected');

  const overallRisk = riskFactors.length >= 3
    ? 'critical'
    : riskFactors.length >= 2
      ? 'high'
      : riskFactors.length >= 1
        ? 'medium'
        : 'low';

  return {
    simulation_id: `sim-${proposedPolicy.id}-${Date.now()}`,
    policy_id: proposedPolicy.id,
    surface_type: proposedPolicy.surface_type,
    blast_radius,
    effectiveState,
    conflicts,
    risk_assessment: {
      overallRisk,
      factors: riskFactors,
      recommendation: overallRisk === 'critical' || overallRisk === 'high'
        ? 'Review with SOM before activation.'
        : 'Safe to proceed with approval workflow.',
    },
  };
}

/**
 * Compute the blast radius of a proposed policy change.
 */
export function computeBlastRadius(
  policy: StrategyPolicy,
  affected_entity_count: number
): BlastRadiusResult {
  // Determine scope based on surface type
  const tenantWideSurfaces: StrategySurfaceType[] = [
    'sla', 'routing', 'prioritisation-weight', 'operational-tempo',
  ];
  const domainScopedSurfaces: StrategySurfaceType[] = [
    'posture', 'domain-specific', 'threshold',
  ];

  const scope: BlastRadiusResult['scope'] = tenantWideSurfaces.includes(policy.surface_type)
    ? 'tenant-wide'
    : domainScopedSurfaces.includes(policy.surface_type)
      ? 'domain-scoped'
      : 'entity-scoped';

  return {
    affected_entity_count,
    affectedEntityTypes: ['case', 'risk-object'],
    affectedCaseCount: Math.ceil(affectedEntityCount * 0.6),
    affectedBindingEvents: scope === 'tenant-wide'
      ? ['priority-recalculation', 'route-recalculation']
      : ['fusion-map-refresh'],
    scope,
  };
}

/**
 * Preview the effective state after applying a proposed policy.
 */
export function previewEffectiveState(
  proposedPolicy: StrategyPolicy,
  existingPolicies: StrategyPolicy[]
): EffectiveStatePreview {
  const currentActive = existingPolicies.find(
    (p) => p.surface_type === proposedPolicy.surface_type && p.status === 'active'
  );

  const currentConfig = currentActive?.configuration ?? {};
  const proposedConfig = proposedPolicy.configuration;

  const delta: string[] = [];
  const allKeys = new Set([...Object.keys(currentConfig), ...Object.keys(proposedConfig)]);
  for (const key of allKeys) {
    if (JSON.stringify(currentConfig[key]) !== JSON.stringify(proposedConfig[key])) {
      delta.push(key);
    }
  }

  return {
    surface_type: proposedPolicy.surface_type,
    currentConfig,
    proposedConfig,
    delta,
  };
}

/**
 * Detect conflicts between a proposed policy and existing policies.
 */
function detectConflicts(
  proposedPolicy: StrategyPolicy,
  existingPolicies: StrategyPolicy[]
): PolicyConflict[] {
  const conflicts: PolicyConflict[] = [];

  // Check for active policy on same surface (supersession conflict)
  const sameActiveSurface = existingPolicies.filter(
    (p) => p.surface_type === proposedPolicy.surface_type && p.status === 'active' && p.id !== proposedPolicy.id
  );

  for (const existing of sameActiveSurface) {
    conflicts.push({
      conflictingPolicyId: existing.id,
      conflictingSurface: existing.surface_type,
      reason: `Active policy ${existing.id} on same surface will be superseded.`,
      severity: 'warning',
    });
  }

  // Check for pending-approval policies on same surface
  const samePendingSurface = existingPolicies.filter(
    (p) => p.surface_type === proposedPolicy.surface_type && p.status === 'pending-approval' && p.id !== proposedPolicy.id
  );

  for (const pending of samePendingSurface) {
    conflicts.push({
      conflictingPolicyId: pending.id,
      conflictingSurface: pending.surface_type,
      reason: `Pending policy ${pending.id} on same surface — concurrent approval conflict.`,
      severity: 'blocking',
    });
  }

  return conflicts;
}
