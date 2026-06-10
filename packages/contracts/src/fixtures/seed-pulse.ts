/**
 * Seed Pulse Data — Commander C2 Test Fixtures
 *
 * Synthetic operational pulse snapshots for team, domain, and system health.
 * Source: Spec #08 Case Management, Spec #30 Validation/Closure, Spec #17 Closed-Loop
 */

import type { TeamPulseEntry, DomainPulseEntry, SystemPulseEntry } from '../entities/pulse';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const PULSE_SOURCE = { ...SEED_SOURCE, source_system: 'commander-pulse-engine' };

export const seedTeamPulse: TeamPulseEntry[] = [
  { id: seedId('tp', 1), entity_type: 'team-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, team_or_analyst: 'Security Operations', level: 'team', open_cases: 12, high_priority_cases: 3, sla_breached_cases: 1, workload_band: 'amber', hours_since_last_closure: 4, escalation_queue_depth: 2, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 2), entity_type: 'team-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, team_or_analyst: 'Platform Engineering', level: 'team', open_cases: 5, high_priority_cases: 0, sla_breached_cases: 0, workload_band: 'green', hours_since_last_closure: 2, escalation_queue_depth: 0, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 3), entity_type: 'team-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, team_or_analyst: 'Identity & Access', level: 'team', open_cases: 3, high_priority_cases: 1, sla_breached_cases: 0, workload_band: 'green', hours_since_last_closure: 8, escalation_queue_depth: 1, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 4), entity_type: 'team-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, team_or_analyst: 'Threat Intelligence', level: 'team', open_cases: 4, high_priority_cases: 2, sla_breached_cases: 1, workload_band: 'amber', hours_since_last_closure: 12, escalation_queue_depth: 1, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 5), entity_type: 'team-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, team_or_analyst: 'Alice Security-Analyst', level: 'individual', open_cases: 6, high_priority_cases: 2, sla_breached_cases: 1, workload_band: 'amber', hours_since_last_closure: 6, escalation_queue_depth: 0, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 6), entity_type: 'team-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, team_or_analyst: 'Bob Platform-Engineer', level: 'individual', open_cases: 3, high_priority_cases: 0, sla_breached_cases: 0, workload_band: 'green', hours_since_last_closure: 1, escalation_queue_depth: 0, snapshot_at: '2026-01-18T06:00:00.000Z' },
];

export const seedDomainPulse: DomainPulseEntry[] = [
  { id: seedId('dp', 1), entity_type: 'domain-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Vulnerability', health: 'degraded', pending_validation: 3, failed_validation: 1, closure_blockers: 2, active_risk_objects: 5, mean_resolution_hours: 72, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('dp', 2), entity_type: 'domain-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Identity', health: 'healthy', pending_validation: 1, failed_validation: 0, closure_blockers: 0, active_risk_objects: 2, mean_resolution_hours: 36, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('dp', 3), entity_type: 'domain-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Coverage', health: 'healthy', pending_validation: 0, failed_validation: 0, closure_blockers: 0, active_risk_objects: 1, mean_resolution_hours: 24, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('dp', 4), entity_type: 'domain-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Configuration', health: 'critical', pending_validation: 5, failed_validation: 2, closure_blockers: 3, active_risk_objects: 8, mean_resolution_hours: 96, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('dp', 5), entity_type: 'domain-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Threat Intelligence', health: 'healthy', pending_validation: 0, failed_validation: 0, closure_blockers: 0, active_risk_objects: 3, mean_resolution_hours: 48, snapshot_at: '2026-01-18T06:00:00.000Z' },
];

export const seedSystemPulse: SystemPulseEntry[] = [
  { id: seedId('sp', 1), entity_type: 'system-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Case Lifecycle Engine', health: 'operational', queue_backlog: 0, data_freshness_hours: 0.5, processing_rate: 120, error_rate: 0, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 2), entity_type: 'system-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Connector Pull Orchestrator', health: 'operational', queue_backlog: 2, data_freshness_hours: 1.0, processing_rate: 60, error_rate: 2.5, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 3), entity_type: 'system-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Normalisation Layer', health: 'operational', queue_backlog: 5, data_freshness_hours: 0.2, processing_rate: 200, error_rate: 0.5, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 4), entity_type: 'system-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Intelligence Layer', health: 'degraded', queue_backlog: 15, data_freshness_hours: 3.0, processing_rate: 30, error_rate: 5.0, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 5), entity_type: 'system-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'OODA Layer', health: 'operational', queue_backlog: 0, data_freshness_hours: 1.5, processing_rate: 10, error_rate: 0, snapshot_at: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 6), entity_type: 'system-pulse', tenant: SEED_TENANT, created_at: '2026-01-18T06:00:00.000Z', updated_at: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Strategy Engine', health: 'operational', queue_backlog: 0, data_freshness_hours: 0.1, processing_rate: 50, error_rate: 0, snapshot_at: '2026-01-18T06:00:00.000Z' },
];
