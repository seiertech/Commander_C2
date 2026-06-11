/**
 * Simulation Result Entity — Commander C2 Canonical Model
 *
 * Source: Spec #36 Rule/Model/Decision Governance Surface
 *
 * A SimulationResult records the outcome of simulating a rule or policy change
 * before live promotion. It captures blast radius, conflict detection, and
 * approval status.
 *
 * Domain: D-04 (Drift & Rule Engine)
 * Use Cases: UC-176 (simulate rule change blast radius)
 * Route: /platform/rules/simulation
 */

import type { CommonFields } from './common';

// ─── Simulation Status ───────────────────────────────────────────────────────

export const SIMULATION_STATUSES = ['completed', 'failed'] as const;
export type SimulationStatus = typeof SIMULATION_STATUSES[number];

// ─── Simulation Scope ────────────────────────────────────────────────────────

export const SIMULATION_SCOPES = ['tenant', 'role', 'asset_group'] as const;
export type SimulationScope = typeof SIMULATION_SCOPES[number];

// ─── Simulation Conflict ─────────────────────────────────────────────────────

export interface SimulationConflict {
  /** Entity affected by the conflict */
  entity_ref: string;
  /** Type of conflict */
  conflictType: string;
  /** Human-readable description */
  description: string;
}

// ─── Simulation Result Entity ────────────────────────────────────────────────

export interface SimulationResult extends CommonFields {
  entity_type: 'simulation-result';
  /** Unique simulation identifier */
  simulation_id: string;
  /** Rule being simulated */
  rule_ref: string;
  /** Policy being simulated (optional) */
  policy_ref?: string;
  /** When the simulation ran */
  simulatedAt: string;
  /** Who triggered the simulation */
  simulatedBy: string;
  /** Scope of the simulation */
  scope: SimulationScope;
  /** Number of entities impacted */
  impactedEntities: number;
  /** How many entities would trigger */
  wouldTrigger: number;
  /** How many would be suppressed */
  wouldSuppress: number;
  /** Blast radius score (0–100) */
  blast_radius: number;
  /** Detected conflicts */
  conflicts: SimulationConflict[];
  /** Simulation outcome status */
  status: SimulationStatus;
  /** Whether approved for live deployment */
  approvedForLive: boolean;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface SimulationResultValidation {
  valid: boolean;
  errors: string[];
}

export function validateSimulationResult(result: SimulationResult): SimulationResultValidation {
  const errors: string[] = [];

  if (!result.id || result.id.trim() === '') errors.push('id: required');
  if (!result.tenant || !result.tenant.tenant_id) errors.push('tenant.tenant_id: required');
  if (!result.simulation_id || result.simulation_id.trim() === '') errors.push('simulation_id: required');
  if (!result.rule_ref || result.rule_ref.trim() === '') errors.push('rule_ref: required');
  if (!result.simulatedAt || result.simulatedAt.trim() === '') errors.push('simulatedAt: required');
  if (!result.simulatedBy || result.simulatedBy.trim() === '') errors.push('simulatedBy: required');
  if (!SIMULATION_SCOPES.includes(result.scope)) {
    errors.push(`scope: must be one of: ${SIMULATION_SCOPES.join(', ')}`);
  }
  if (typeof result.impactedEntities !== 'number' || result.impactedEntities < 0) errors.push('impactedEntities: must be non-negative');
  if (typeof result.blast_radius !== 'number' || result.blast_radius < 0 || result.blast_radius > 100) {
    errors.push('blast_radius: must be 0–100');
  }
  if (!Array.isArray(result.conflicts)) errors.push('conflicts: must be an array');
  if (!SIMULATION_STATUSES.includes(result.status)) {
    errors.push(`status: must be one of: ${SIMULATION_STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
