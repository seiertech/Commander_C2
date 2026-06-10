/**
 * Case Entity — Commander C2 Canonical Model
 *
 * Source: Spec #08 Case Management, Spec #17 Closed-Loop Control Architecture
 * Domain Requirement 3: Cases include lifecycle, owner, SLA, surface attribution, audit
 * COIM-G: COIM aggregate fields (additive optional) — computed from bound Risk Objects
 * Source: COIM v1.0 §6 (Case impact); 02_SOURCE_CLASSIFICATION_MODEL §10.4; Spec #08
 *
 * CRITICAL: Cases are system-owned. No manual creation, manual closure,
 * manual reopening or manual lifecycle progression (Doctrinal Assertion 1).
 */

import type { CommonFields, SurfaceAttribution } from './common';
import type { AttackMapping } from './coim';

export interface Case extends CommonFields {
  entity_type: 'case';
  /** Case reference number */
  case_ref: string;
  /** Case type (supports canonical 12 + legacy aliases for seed data) */
  case_type: CaseTypeExtended;
  /** Case title */
  title: string;
  /** Current lifecycle state — system-owned transitions only */
  status: CaseStatusExtended;
  /** Priority level */
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  /** Assigned owner (via routing engine, not manual) */
  owner: string;
  /** Assigned team */
  team: string;
  /** SLA target */
  sla: {
    target_resolution_hours: number;
    breached: boolean;
  };
  /** Surface attribution */
  surface_attribution: SurfaceAttribution;
  /** Related entity IDs */
  related_entities: string[];
  /** Audit trail reference */
  auditTrailRef: string;
  /** Routing rationale (from routing engine) */
  routingRationale: string;

  // ─── COIM-G: Computed Aggregate Fields (additive optional) ───────────────
  // Source: COIM v1.0 §6 (Case impact); 02_SOURCE_CLASSIFICATION_MODEL §10.4.
  // Computed at case creation/update from bound Risk Objects.
  // Cached on Case for query performance; no governance-logic change.
  // Optional at type level for full backward-compatibility with existing fixtures.

  /**
   * ATT&CK bindings aggregated from bound Risk Objects (COIM-G).
   * Union of all ATT&CK bindings across risk objects bound to this case.
   * Deduplicated by technique ID. Max 50 entries.
   */
  attacks?: AttackMapping[];

  /**
   * Count of distinct affected entities across bound Risk Objects (COIM-G).
   * Enables blast-radius quantification.
   */
  affected_entity_count?: number;

  /**
   * Blast radius score (0-100) — computed from affectedEntityCount,
   * criticality of affected entities, and surface attribution (COIM-G).
   * Commander-computed; informs but does not govern priority.
   */
  blastRadiusScore?: number;

  /**
   * Dwell time in hours from firstDetectedAt of earliest bound Risk Object
   * to case creation timestamp (COIM-G).
   * Resolves ARCH-DEBT-045 (Case dwell time).
   */
  dwellTimeHours?: number;

  /**
   * Confidence aggregate (0-100) — weighted average of sourceConfidence
   * across bound Risk Objects (COIM-G).
   */
  confidenceAggregate?: number;

  /**
   * Finding-class breakdown — count per FindingClass across bound Risk Objects (COIM-G).
   * Example: { vulnerability: 3, detection: 1 }
   */
  findingClassBreakdown?: Record<string, number>;
}

/**
 * Twelve named case types per v1.2 requirements.
 * Source: Master Technical Specification §6.2; Spec #08 v2.6 addendum
 */
export type CaseType =
  | 'drift'
  | 'vulnerability'
  | 'identity'
  | 'exposure'
  | 'coverage'
  | 'tool-health'
  | 'threat-intelligence-estate-match'
  | 'external-attack-correlation'
  | 'verdict-pattern'
  | 'inverse-discovery-coverage-blindspot'
  | 'policy-effectiveness'
  | 'ooda-tempo-degradation';

/** All twelve case types as a constant array */
export const CASE_TYPES: CaseType[] = [
  'drift',
  'vulnerability',
  'identity',
  'exposure',
  'coverage',
  'tool-health',
  'threat-intelligence-estate-match',
  'external-attack-correlation',
  'verdict-pattern',
  'inverse-discovery-coverage-blindspot',
  'policy-effectiveness',
  'ooda-tempo-degradation',
];

/**
 * Legacy case type aliases for backward compatibility with seed data.
 * These map older specific types to the canonical 12.
 */
export type LegacyCaseType =
  | 'vulnerability-drift'
  | 'exposure-drift'
  | 'control-gap'
  | 'configuration-drift'
  | 'coverage-blindspot';

/** Extended case type union including legacy aliases used in seed data */
export type CaseTypeExtended = CaseType | LegacyCaseType;

/**
 * 12-state closed-loop case lifecycle.
 * Source: Spec #08 v2.6, Spec #30 Validation/Closure, Unit 7 rebaseline.
 *
 * Transition graph:
 *   detected → bound → routed → prioritised → action_decomposed → in_progress
 *   → pending_validation → validation_running → validated_pass / validated_fail
 *   validated_pass → pending_closure_gates → closed_by_system → reopened_by_system → in_progress
 *   validated_fail → in_progress (remediation loop)
 *
 * Legacy 6-state aliases retained for seed data backward compatibility.
 */
export type CaseStatus =
  | 'detected'
  | 'bound'
  | 'routed'
  | 'prioritised'
  | 'action_decomposed'
  | 'in_progress'
  | 'pending_validation'
  | 'validation_running'
  | 'validated_pass'
  | 'validated_fail'
  | 'pending_closure_gates'
  | 'closed_by_system'
  | 'reopened_by_system';

/**
 * Legacy 6-state aliases for backward compatibility with existing seed data.
 * These map to the closest 12-state equivalent.
 */
export type LegacyCaseStatus =
  | 'open'
  | 'in-progress'
  | 'awaiting-validation'
  | 'awaiting-closure'
  | 'closed'
  | 'reopened';

/** Extended status union including legacy aliases used in seed data */
export type CaseStatusExtended = CaseStatus | LegacyCaseStatus;

/** Map legacy statuses to their 12-state equivalents */
export const LEGACY_STATUS_MAP: Record<LegacyCaseStatus, CaseStatus> = {
  'open': 'detected',
  'in-progress': 'in_progress',
  'awaiting-validation': 'pending_validation',
  'awaiting-closure': 'pending_closure_gates',
  'closed': 'closed_by_system',
  'reopened': 'reopened_by_system',
};
