/**
 * Platform Management Entities — Commander C2 Canonical Model
 *
 * Source: Spec #10 Detection Model Library and Rule Builder,
 *         Spec #51 Rule Model and Decision Governance Surface,
 *         Master Technical Specification §Engine Layer
 *
 * Covers: Rule Engine, Model Management, Automation Rules, Feature Registry state.
 * These are platform-configuration entities managed by operators and tenant admins.
 */

import type { CommonFields } from './common';

// ─── Rule Engine ─────────────────────────────────────────────────────────────

export type RuleStatus = 'active' | 'draft' | 'disabled' | 'deprecated';
export type RuleType = 'detection' | 'drift' | 'correlation' | 'suppression' | 'custom';

export const RULE_STATUSES: RuleStatus[] = ['active', 'draft', 'disabled', 'deprecated'];
export const RULE_TYPES: RuleType[] = ['detection', 'drift', 'correlation', 'suppression', 'custom'];

export interface RuleDefinition extends CommonFields {
  entityType: 'rule-definition';
  /** Rule display name */
  name: string;
  /** Rule type */
  ruleType: RuleType;
  /** Current status */
  status: RuleStatus;
  /** Rule version */
  version: string;
  /** Domain this rule applies to */
  domain: string;
  /** Severity when triggered (1-5) */
  severity: number;
  /** Whether this is a platform-managed or tenant-custom rule */
  origin: 'platform' | 'tenant-custom';
  /** Last triggered timestamp (null if never) */
  lastTriggeredAt: string | null;
  /** Total trigger count */
  triggerCount: number;
  /** Description */
  description: string;
  // ─── Version lifecycle (Spec 34 — promote/rollback governance) ─────────────
  /** Prior version this version superseded (for rollback lineage) */
  previousVersion?: string;
  /** When this version becomes/became effective */
  effectiveDate?: string;
  /** Who approved this version for activation */
  approvedBy?: string;
  /** Reference to the blast-radius simulation that backed activation */
  simulationRef?: string;
  /** Version to roll back to if this version is reverted */
  rollbackTarget?: string;
}

// ─── Model Management ────────────────────────────────────────────────────────

export type ModelStatus = 'active' | 'training' | 'retired' | 'candidate';
export type ModelType = 'detection' | 'anomaly' | 'risk-scoring' | 'classification' | 'correlation';

export const MODEL_STATUSES: ModelStatus[] = ['active', 'training', 'retired', 'candidate'];
export const MODEL_TYPES: ModelType[] = ['detection', 'anomaly', 'risk-scoring', 'classification', 'correlation'];

export interface ModelDefinition extends CommonFields {
  entityType: 'model-definition';
  /** Model display name */
  name: string;
  /** Model type */
  modelType: ModelType;
  /** Current status */
  status: ModelStatus;
  /** Model version */
  version: string;
  /** Domain this model operates in */
  domain: string;
  /** Accuracy/confidence metric (0-100) */
  accuracy: number;
  /** False positive rate (0-100) */
  falsePositiveRate: number;
  /** Last evaluated timestamp */
  lastEvaluatedAt: string;
  /** Description */
  description: string;
}

// ─── Automation Rules ────────────────────────────────────────────────────────

export type AutomationStatus = 'active' | 'paused' | 'draft' | 'disabled';
export type AutomationTrigger = 'case-created' | 'sla-breach' | 'priority-change' | 'validation-fail' | 'connector-error' | 'scheduled';

export const AUTOMATION_STATUSES: AutomationStatus[] = ['active', 'paused', 'draft', 'disabled'];
export const AUTOMATION_TRIGGERS: AutomationTrigger[] = ['case-created', 'sla-breach', 'priority-change', 'validation-fail', 'connector-error', 'scheduled'];

export interface AutomationRule extends CommonFields {
  entityType: 'automation-rule';
  /** Rule name */
  name: string;
  /** Trigger condition */
  trigger: AutomationTrigger;
  /** Current status */
  status: AutomationStatus;
  /** Action to perform */
  action: string;
  /** Times executed */
  executionCount: number;
  /** Last executed timestamp */
  lastExecutedAt: string | null;
  /** Whether approval is required before execution */
  requiresApproval: boolean;
  /** Description */
  description: string;
}

// ─── Feature State (platform view of feature registry state) ─────────────────

export type FeatureState = 'enabled' | 'disabled' | 'entitled' | 'not-entitled' | 'feature-flag-off';

export const FEATURE_STATES: FeatureState[] = ['enabled', 'disabled', 'entitled', 'not-entitled', 'feature-flag-off'];

export interface FeatureRegistryEntry extends CommonFields {
  entityType: 'feature-registry-entry';
  /** Feature flag key */
  featureKey: string;
  /** Display name */
  displayName: string;
  /** Current effective state */
  state: FeatureState;
  /** Module this feature belongs to */
  module: string;
  /** Control scope (who can toggle) */
  controlScope: 'platform' | 'tenant-admin' | 'operator';
  /** Description */
  description: string;
}
