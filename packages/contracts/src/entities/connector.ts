/**
 * Connector Entity — Commander C2 Canonical Model
 *
 * Source: Spec #05 §6.4.4 Connector, Spec #61 Universal Security Signal Connector Contract
 * v1.3 Requirement 5: Connector fixture completeness
 * v1.3 Requirement 14: Signal connector class fixture (A/B/C/D only)
 */

import type { CommonFields, ConnectorClass } from './common';

export interface Connector extends CommonFields {
  entityType: 'connector';
  /** Connector display name */
  name: string;
  /** Connector class(es) per Spec #61 — A/B/C/D only */
  classes: ConnectorClass[];
  /** Source type (vendor platform name) */
  sourceType: string;
  /** Connector tier */
  tier: 'core' | 'extended' | 'community';
  /** Current state */
  state: ConnectorState;
  /** Last successful run */
  lastRunAt: string | null;
  /** Last run status */
  lastRunStatus: 'success' | 'partial' | 'failed' | 'never-run';
  /** Mapping pack version (v1.3 Req 9) */
  mappingPackVersion: string;
}

export type ConnectorState =
  | 'active'
  | 'paused'
  | 'error'
  | 'pending-approval'
  | 'decommissioned';

/** Conformance tier per Spec #61 §4.1 — tracks connector maturity per class */
export type ConformanceTier = 'certified' | 'full' | 'baseline' | 'planned';

/** All conformance tiers as a constant array */
export const CONFORMANCE_TIERS: ConformanceTier[] = [
  'certified',
  'full',
  'baseline',
  'planned',
];

/** Conformance tier labels */
export const CONFORMANCE_TIER_LABELS: Record<ConformanceTier, string> = {
  certified: 'Certified',
  full: 'Full',
  baseline: 'Baseline',
  planned: 'Planned',
};

/** Per-class conformance record — tracks tier per connector class */
export interface ClassConformance {
  class: ConnectorClass;
  tier: ConformanceTier;
  certifiedAt: string | null;
  lastAssessedAt: string;
}

/** Signal purpose resolution — maps a pull operation to its resolved purposes */
export interface SignalPurposeResolution {
  connectorId: string;
  pullRunId: string;
  resolvedPurposes: import('./common').SignalPurpose[];
  resolvedAt: string;
}

/** Pull operation result */
export interface PullResult {
  connectorId: string;
  runId: string;
  status: 'success' | 'partial' | 'failed';
  recordsIngested: number;
  signalPurposes: import('./common').SignalPurpose[];
  startedAt: string;
  completedAt: string;
  errorDetail: string | null;
}
