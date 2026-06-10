/**
 * Pulse Entities — Commander C2 Canonical Model
 *
 * Source: Spec #08 Case Management (workload), Spec #30 Validation/Closure (blockers),
 *         Spec #17 Closed-Loop Control Architecture (queue health)
 *
 * Three pulse domains:
 * - Team Pulse: analyst workload, SLA pressure, escalation queues
 * - Domain Pulse: domain health, failed validation, closure blockers
 * - System Pulse: engine health, queue backlog, data freshness
 *
 * These are computed aggregation snapshots, refreshed periodically.
 * They consume data from cases, connectors, risk-objects, and strategy policies.
 */

import type { CommonFields } from './common';

// ─── Pulse Domain ────────────────────────────────────────────────────────────

export type PulseDomain = 'team' | 'domain' | 'system';

export const PULSE_DOMAINS: PulseDomain[] = ['team', 'domain', 'system'];

// ─── Team Pulse ──────────────────────────────────────────────────────────────

export type WorkloadBand = 'green' | 'amber' | 'red';

export interface TeamPulseEntry extends CommonFields {
  entityType: 'team-pulse';
  /** Analyst or team identifier */
  teamOrAnalyst: string;
  /** Whether this is a team-level or individual-level entry */
  level: 'team' | 'individual';
  /** Total open cases assigned */
  openCases: number;
  /** Cases at P0/P1 priority */
  highPriorityCases: number;
  /** Cases breaching SLA */
  slaBreachedCases: number;
  /** Workload band (green < 10, amber 10-15, red > 15) */
  workloadBand: WorkloadBand;
  /** Hours since last case closure */
  hoursSinceLastClosure: number;
  /** Escalation queue depth */
  escalationQueueDepth: number;
  /** Snapshot timestamp */
  snapshotAt: string;
}

// ─── Domain Pulse ────────────────────────────────────────────────────────────

export type DomainHealth = 'healthy' | 'degraded' | 'critical';

export interface DomainPulseEntry extends CommonFields {
  entityType: 'domain-pulse';
  /** Security domain name */
  domain: string;
  /** Overall domain health */
  health: DomainHealth;
  /** Cases pending validation */
  pendingValidation: number;
  /** Cases with failed validation */
  failedValidation: number;
  /** Cases blocked on closure gates */
  closureBlockers: number;
  /** Active risk objects in this domain */
  activeRiskObjects: number;
  /** Mean time to resolution (hours) */
  meanResolutionHours: number;
  /** Snapshot timestamp */
  snapshotAt: string;
}

// ─── System Pulse ────────────────────────────────────────────────────────────

export type EngineHealth = 'operational' | 'degraded' | 'offline';

export interface SystemPulseEntry extends CommonFields {
  entityType: 'system-pulse';
  /** Engine or subsystem name */
  subsystem: string;
  /** Health status */
  health: EngineHealth;
  /** Queue backlog depth (items waiting) */
  queueBacklog: number;
  /** Data freshness — hours since last successful ingestion */
  dataFreshnessHours: number;
  /** Processing rate (items/hour) */
  processingRate: number;
  /** Error rate (%) */
  errorRate: number;
  /** Snapshot timestamp */
  snapshotAt: string;
}
