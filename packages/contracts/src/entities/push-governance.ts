/**
 * Push Governance Entity — Commander SDR Canonical Model
 *
 * Source: Master Technical Specification §Push Governance,
 *         Build Pack Discipline §Push governance dry-run
 *
 * Push governance run records model simulated rule enforcement runs —
 * tracking impact counts, conflicts, blocking/allowing/escalation
 * predictions, and approval state before live deployment.
 *
 * Push governance remains dry-run until separately approved.
 *
 * Ownership: All authenticated (read), Governance engine (simulate)
 * Build Unit: Tier 3 batch (phase1-engine-entities)
 * Unlocks: /governance/push-runs, governance simulation surfaces
 */

import type { CommonFields } from './common';

// ─── Push Governance Run Status ──────────────────────────────────────────────

export const PUSH_GOVERNANCE_STATUSES = ['pending', 'completed', 'failed'] as const;
export type PushGovernanceStatus = typeof PUSH_GOVERNANCE_STATUSES[number];

// ─── Target Scope ────────────────────────────────────────────────────────────

export const PUSH_TARGET_SCOPES = ['tenant', 'role', 'asset_group'] as const;
export type PushTargetScope = typeof PUSH_TARGET_SCOPES[number];

// ─── Push Conflict Sub-type ──────────────────────────────────────────────────

export interface PushConflict {
  /** Reference to the conflicting entity */
  entityRef: string;
  /** Type of conflict */
  conflictType: string;
  /** Description of the conflict */
  description: string;
}

// ─── Push Governance Run Entity ──────────────────────────────────────────────

export interface PushGovernanceRun extends CommonFields {
  entityType: 'push-governance-run';
  /** Unique run identifier */
  runId: string;
  /** Reference to the rule being simulated */
  ruleRef: string;
  /** Scope of the simulation target */
  targetScope: PushTargetScope;
  /** When the simulation was performed */
  simulatedAt: string;
  /** Number of entities impacted by the rule */
  impactedEntities: number;
  /** Number of entities that would be blocked */
  wouldBlock: number;
  /** Number of entities that would be allowed */
  wouldAllow: number;
  /** Number of entities that would be escalated */
  wouldEscalate: number;
  /** Detected conflicts during simulation */
  conflicts: PushConflict[];
  /** Current run status */
  status: PushGovernanceStatus;
  /** Whether the run has been approved for live deployment */
  approvedForLive: boolean;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PushGovernanceRunValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a PushGovernanceRun entity for structural correctness.
 */
export function validatePushGovernanceRun(record: PushGovernanceRun): PushGovernanceRunValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') {
    errors.push('id: required');
  }
  if (!record.tenant || !record.tenant.tenantId || record.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!record.runId || record.runId.trim() === '') {
    errors.push('runId: required');
  }
  if (!record.ruleRef || record.ruleRef.trim() === '') {
    errors.push('ruleRef: required');
  }
  if (!record.targetScope || !PUSH_TARGET_SCOPES.includes(record.targetScope)) {
    errors.push(`targetScope: must be one of: ${PUSH_TARGET_SCOPES.join(', ')}`);
  }
  if (!record.simulatedAt || record.simulatedAt.trim() === '') {
    errors.push('simulatedAt: required');
  }
  if (typeof record.impactedEntities !== 'number' || record.impactedEntities < 0) {
    errors.push('impactedEntities: must be a non-negative number');
  }
  if (typeof record.wouldBlock !== 'number' || record.wouldBlock < 0) {
    errors.push('wouldBlock: must be a non-negative number');
  }
  if (typeof record.wouldAllow !== 'number' || record.wouldAllow < 0) {
    errors.push('wouldAllow: must be a non-negative number');
  }
  if (typeof record.wouldEscalate !== 'number' || record.wouldEscalate < 0) {
    errors.push('wouldEscalate: must be a non-negative number');
  }
  if (!Array.isArray(record.conflicts)) {
    errors.push('conflicts: must be an array');
  } else {
    for (const conflict of record.conflicts) {
      if (!conflict.entityRef || conflict.entityRef.trim() === '') {
        errors.push('conflicts[].entityRef: required');
      }
      if (!conflict.conflictType || conflict.conflictType.trim() === '') {
        errors.push('conflicts[].conflictType: required');
      }
      if (!conflict.description || conflict.description.trim() === '') {
        errors.push('conflicts[].description: required');
      }
    }
  }
  if (!record.status || !PUSH_GOVERNANCE_STATUSES.includes(record.status)) {
    errors.push(`status: must be one of: ${PUSH_GOVERNANCE_STATUSES.join(', ')}`);
  }
  if (typeof record.approvedForLive !== 'boolean') {
    errors.push('approvedForLive: must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}
