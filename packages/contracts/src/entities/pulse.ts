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
  entity_type: 'team-pulse';
  /** Analyst or team identifier */
  team_or_analyst: string;
  /** Whether this is a team-level or individual-level entry */
  level: 'team' | 'individual';
  /** Total open cases assigned */
  open_cases: number;
  /** Cases at P0/P1 priority */
  high_priority_cases: number;
  /** Cases breaching SLA */
  sla_breached_cases: number;
  /** Workload band (green < 10, amber 10-15, red > 15) */
  workload_band: WorkloadBand;
  /** Hours since last case closure */
  hours_since_last_closure: number;
  /** Escalation queue depth */
  escalation_queue_depth: number;
  /** Snapshot timestamp */
  snapshot_at: string;
}

// ─── Domain Pulse ────────────────────────────────────────────────────────────

export type DomainHealth = 'healthy' | 'degraded' | 'critical';

export interface DomainPulseEntry extends CommonFields {
  entity_type: 'domain-pulse';
  /** Security domain name */
  domain: string;
  /** Overall domain health */
  health: DomainHealth;
  /** Cases pending validation */
  pending_validation: number;
  /** Cases with failed validation */
  failed_validation: number;
  /** Cases blocked on closure gates */
  closure_blockers: number;
  /** Active risk objects in this domain */
  active_risk_objects: number;
  /** Mean time to resolution (hours) */
  mean_resolution_hours: number;
  /** Snapshot timestamp */
  snapshot_at: string;
}

// ─── System Pulse ────────────────────────────────────────────────────────────

export type EngineHealth = 'operational' | 'degraded' | 'offline';

export interface SystemPulseEntry extends CommonFields {
  entity_type: 'system-pulse';
  /** Engine or subsystem name */
  subsystem: string;
  /** Health status */
  health: EngineHealth;
  /** Queue backlog depth (items waiting) */
  queue_backlog: number;
  /** Data freshness — hours since last successful ingestion */
  data_freshness_hours: number;
  /** Processing rate (items/hour) */
  processing_rate: number;
  /** Error rate (%) */
  error_rate: number;
  /** Snapshot timestamp */
  snapshot_at: string;
}
