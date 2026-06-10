/**
 * Strategy Layer Runtime Surface — Commander SDR Canonical Model
 *
 * Source: Spec #32 Strategy Layer Runtime Surface Specification
 * v1.3.1 lineage closure: 24 EARS requirements
 * CMEP-1.0: Extended from 13 to 17 surfaces
 * WRCEP-1.0: Extended to 19 surfaces
 *
 * Nineteen named strategy surfaces:
 * 1. SLA Strategy
 * 2. Threshold Strategy
 * 3. Automation Boundary Strategy
 * 4. Routing Strategy
 * 5. Posture Strategy
 * 6. Mission Objective Strategy
 * 7. Operational Tempo Strategy
 * 8. Domain-Specific Strategy
 * 9. Prioritisation Weight Strategy
 * 10. Validation Window Strategy
 * 11. Closure Gate Strategy
 * 12. Reopening Trigger Strategy
 * 13. Evidence Sufficiency Strategy (Phase E1 precursor)
 * 14. SLA Modifier Strategy (CMEP-1.0)
 * 15. Correlation Policy Strategy (CMEP-1.0)
 * 16. Effectiveness Targets Strategy (CMEP-1.0)
 * 17. SSVC Decision Tree Strategy (CMEP-1.0)
 * 18. Communication Playbook Strategy (Communications Excellence)
 * 19. War Room Cadence Strategy (WRCEP-1.0)
 */

import type { CommonFields } from './common';

/**
 * Twenty named strategy surface types per Spec #32 + Phase E1 + CMEP-1.0 + Communications Excellence + WRCEP-1.0 + Journey Intelligence (JI-1.0)
 *
 * 20. Journey Intelligence Formula (JI-1.0)
 */
export type StrategySurfaceType =
  | 'sla'
  | 'threshold'
  | 'automation-boundary'
  | 'routing'
  | 'posture'
  | 'mission-objective'
  | 'operational-tempo'
  | 'domain-specific'
  | 'prioritisation-weight'
  | 'validation-window'
  | 'closure-gate'
  | 'reopening-trigger'
  | 'evidence-sufficiency'
  | 'sla-modifier'
  | 'correlation-policy'
  | 'effectiveness-targets'
  | 'ssvc-decision-tree'
  | 'communication-playbook'
  | 'war-room-cadence'
  | 'journey-intelligence-formula';

/** All twenty strategy surface types as a constant array */
export const STRATEGY_SURFACE_TYPES: StrategySurfaceType[] = [
  'sla',
  'threshold',
  'automation-boundary',
  'routing',
  'posture',
  'mission-objective',
  'operational-tempo',
  'domain-specific',
  'prioritisation-weight',
  'validation-window',
  'closure-gate',
  'reopening-trigger',
  'evidence-sufficiency',
  'sla-modifier',
  'correlation-policy',
  'effectiveness-targets',
  'ssvc-decision-tree',
  'communication-playbook',
  'war-room-cadence',
  'journey-intelligence-formula',
];

/** Strategy surface labels for UI display */
export const STRATEGY_SURFACE_LABELS: Record<StrategySurfaceType, string> = {
  'sla': 'SLA Strategy',
  'threshold': 'Threshold Strategy',
  'automation-boundary': 'Automation Boundary Strategy',
  'routing': 'Routing Strategy',
  'posture': 'Posture Strategy',
  'mission-objective': 'Mission Objective Strategy',
  'operational-tempo': 'Operational Tempo Strategy',
  'domain-specific': 'Domain-Specific Strategy',
  'prioritisation-weight': 'Prioritisation Weight Strategy',
  'validation-window': 'Validation Window Strategy',
  'closure-gate': 'Closure Gate Strategy',
  'reopening-trigger': 'Reopening Trigger Strategy',
  'evidence-sufficiency': 'Evidence Sufficiency Strategy',
  'sla-modifier': 'SLA Modifier Strategy',
  'correlation-policy': 'Correlation Policy Strategy',
  'effectiveness-targets': 'Effectiveness Targets Strategy',
  'ssvc-decision-tree': 'SSVC Decision Tree Strategy',
  'communication-playbook': 'Communication Playbook Strategy',
  'war-room-cadence': 'War Room Cadence Strategy',
  'journey-intelligence-formula': 'Journey Intelligence Formula',
};

/** Strategy policy status */
export type StrategyPolicyStatus =
  | 'draft'
  | 'pending-approval'
  | 'approved'
  | 'active'
  | 'superseded'
  | 'rejected';

/** Strategy policy — a versioned configuration for a strategy surface */
export interface StrategyPolicy extends CommonFields {
  entityType: 'strategy-policy';
  /** Which strategy surface this policy belongs to */
  surfaceType: StrategySurfaceType;
  /** Policy version (semantic) */
  policyVersion: string;
  /** Current status */
  status: StrategyPolicyStatus;
  /** Policy configuration (JSON — shape varies by surface type) */
  configuration: Record<string, unknown>;
  /** Who proposed this policy */
  proposedBy: string;
  /** When it was proposed */
  proposedAt: string;
  /** Approval metadata (null if not yet approved) */
  approval: StrategyApproval | null;
  /** Effective from (null if not yet active) */
  effectiveFrom: string | null;
  /** Effective until (null if still active) */
  effectiveUntil: string | null;
  /** Simulation result reference (null if not simulated) */
  simulationRef: string | null;
}

/** Approval record for a strategy policy */
export interface StrategyApproval {
  approvedBy: string;
  approvedAt: string;
  condition: string;
  rationale: string;
}

/** Runtime binding event types per Spec #32 §Runtime Binding */
export type RuntimeBindingEvent =
  | 'priority-recalculation'
  | 'route-recalculation'
  | 'validation-recalculation'
  | 'closure-gate-recalculation'
  | 'reopening-evaluation'
  | 'fusion-map-refresh';

/** All six runtime binding events */
export const RUNTIME_BINDING_EVENTS: RuntimeBindingEvent[] = [
  'priority-recalculation',
  'route-recalculation',
  'validation-recalculation',
  'closure-gate-recalculation',
  'reopening-evaluation',
  'fusion-map-refresh',
];

/** Runtime binding trigger — emitted when a strategy change is applied */
export interface RuntimeBindingTrigger {
  /** Which binding event to trigger */
  event: RuntimeBindingEvent;
  /** Which strategy surface caused the trigger */
  sourceSurface: StrategySurfaceType;
  /** Policy ID that was applied */
  policyId: string;
  /** Affected entity scope (e.g., case IDs, risk object IDs) */
  affectedScope: string[];
  /** Timestamp of trigger */
  triggeredAt: string;
  /** Audit event reference */
  auditEventRef: string;
}

/** Strategy Centre UI surface types per Spec #32 §Required UI */
export type StrategyCentreView =
  | 'configuration'
  | 'simulation'
  | 'approval-workflow'
  | 'audit-history'
  | 'effective-policy-preview';

/** All five Strategy Centre UI views */
export const STRATEGY_CENTRE_VIEWS: StrategyCentreView[] = [
  'configuration',
  'simulation',
  'approval-workflow',
  'audit-history',
  'effective-policy-preview',
];

/** Strategy Centre view labels */
export const STRATEGY_CENTRE_VIEW_LABELS: Record<StrategyCentreView, string> = {
  'configuration': 'Configuration',
  'simulation': 'Simulation',
  'approval-workflow': 'Approval Workflow',
  'audit-history': 'Audit History',
  'effective-policy-preview': 'Effective-Policy Preview',
};
