/**
 * Seed Pulse Data — Commander C2 Test Fixtures
 *
 * Synthetic operational pulse snapshots for team, domain, and system health.
 * Source: Spec #08 Case Management, Spec #30 Validation/Closure, Spec #17 Closed-Loop
 */

import type { TeamPulseEntry, DomainPulseEntry, SystemPulseEntry } from '../entities/pulse';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const PULSE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-pulse-engine' };

export const seedTeamPulse: TeamPulseEntry[] = [
  { id: seedId('tp', 1), entityType: 'team-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, teamOrAnalyst: 'Security Operations', level: 'team', openCases: 12, highPriorityCases: 3, slaBreachedCases: 1, workloadBand: 'amber', hoursSinceLastClosure: 4, escalationQueueDepth: 2, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 2), entityType: 'team-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, teamOrAnalyst: 'Platform Engineering', level: 'team', openCases: 5, highPriorityCases: 0, slaBreachedCases: 0, workloadBand: 'green', hoursSinceLastClosure: 2, escalationQueueDepth: 0, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 3), entityType: 'team-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, teamOrAnalyst: 'Identity & Access', level: 'team', openCases: 3, highPriorityCases: 1, slaBreachedCases: 0, workloadBand: 'green', hoursSinceLastClosure: 8, escalationQueueDepth: 1, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 4), entityType: 'team-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, teamOrAnalyst: 'Threat Intelligence', level: 'team', openCases: 4, highPriorityCases: 2, slaBreachedCases: 1, workloadBand: 'amber', hoursSinceLastClosure: 12, escalationQueueDepth: 1, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 5), entityType: 'team-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, teamOrAnalyst: 'Alice Security-Analyst', level: 'individual', openCases: 6, highPriorityCases: 2, slaBreachedCases: 1, workloadBand: 'amber', hoursSinceLastClosure: 6, escalationQueueDepth: 0, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('tp', 6), entityType: 'team-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, teamOrAnalyst: 'Bob Platform-Engineer', level: 'individual', openCases: 3, highPriorityCases: 0, slaBreachedCases: 0, workloadBand: 'green', hoursSinceLastClosure: 1, escalationQueueDepth: 0, snapshotAt: '2026-01-18T06:00:00.000Z' },
];

export const seedDomainPulse: DomainPulseEntry[] = [
  { id: seedId('dp', 1), entityType: 'domain-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Vulnerability', health: 'degraded', pendingValidation: 3, failedValidation: 1, closureBlockers: 2, activeRiskObjects: 5, meanResolutionHours: 72, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('dp', 2), entityType: 'domain-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Identity', health: 'healthy', pendingValidation: 1, failedValidation: 0, closureBlockers: 0, activeRiskObjects: 2, meanResolutionHours: 36, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('dp', 3), entityType: 'domain-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Coverage', health: 'healthy', pendingValidation: 0, failedValidation: 0, closureBlockers: 0, activeRiskObjects: 1, meanResolutionHours: 24, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('dp', 4), entityType: 'domain-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Configuration', health: 'critical', pendingValidation: 5, failedValidation: 2, closureBlockers: 3, activeRiskObjects: 8, meanResolutionHours: 96, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('dp', 5), entityType: 'domain-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, domain: 'Threat Intelligence', health: 'healthy', pendingValidation: 0, failedValidation: 0, closureBlockers: 0, activeRiskObjects: 3, meanResolutionHours: 48, snapshotAt: '2026-01-18T06:00:00.000Z' },
];

export const seedSystemPulse: SystemPulseEntry[] = [
  { id: seedId('sp', 1), entityType: 'system-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Case Lifecycle Engine', health: 'operational', queueBacklog: 0, dataFreshnessHours: 0.5, processingRate: 120, errorRate: 0, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 2), entityType: 'system-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Connector Pull Orchestrator', health: 'operational', queueBacklog: 2, dataFreshnessHours: 1.0, processingRate: 60, errorRate: 2.5, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 3), entityType: 'system-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Normalisation Layer', health: 'operational', queueBacklog: 5, dataFreshnessHours: 0.2, processingRate: 200, errorRate: 0.5, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 4), entityType: 'system-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Intelligence Layer', health: 'degraded', queueBacklog: 15, dataFreshnessHours: 3.0, processingRate: 30, errorRate: 5.0, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 5), entityType: 'system-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'OODA Layer', health: 'operational', queueBacklog: 0, dataFreshnessHours: 1.5, processingRate: 10, errorRate: 0, snapshotAt: '2026-01-18T06:00:00.000Z' },
  { id: seedId('sp', 6), entityType: 'system-pulse', tenant: SEED_TENANT, createdAt: '2026-01-18T06:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: PULSE_SOURCE, subsystem: 'Strategy Engine', health: 'operational', queueBacklog: 0, dataFreshnessHours: 0.1, processingRate: 50, errorRate: 0, snapshotAt: '2026-01-18T06:00:00.000Z' },
];
