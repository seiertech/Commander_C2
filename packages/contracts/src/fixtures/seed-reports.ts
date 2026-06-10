/**
 * Seed Reports — Commander C2 Test Fixtures
 *
 * Synthetic report schedule data.
 * Source: Master Technical Specification §Surface Layer (reporting cadences)
 */

import type { Report } from '../entities/report';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const REPORT_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-reporting-engine' };

export const seedReports: Report[] = [
  { id: seedId('report', 1), entityType: 'report', tenant: SEED_TENANT, createdAt: '2026-01-10T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: REPORT_SOURCE, title: 'Weekly CISO Briefing', reportType: 'ciso-pack', cadence: 'weekly', status: 'completed', audience: ['CISO'], periodStart: '2026-01-11T00:00:00.000Z', periodEnd: '2026-01-18T00:00:00.000Z', lastGeneratedAt: '2026-01-18T05:00:00.000Z', nextScheduledAt: '2026-01-25T05:00:00.000Z', format: 'pdf', description: 'Executive risk summary, priority distribution, SLA adherence, key findings.' },
  { id: seedId('report', 2), entityType: 'report', tenant: SEED_TENANT, createdAt: '2026-01-10T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: REPORT_SOURCE, title: 'Monthly Adherence Pack', reportType: 'adherence-pack', cadence: 'monthly', status: 'scheduled', audience: ['CISO', 'Adherence'], periodStart: '2026-01-01T00:00:00.000Z', periodEnd: '2026-01-31T23:59:59.000Z', lastGeneratedAt: null, nextScheduledAt: '2026-02-01T06:00:00.000Z', format: 'pdf', description: 'Framework adherence status, control evaluation results, exception log.' },
  { id: seedId('report', 3), entityType: 'report', tenant: SEED_TENANT, createdAt: '2026-01-10T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: REPORT_SOURCE, title: 'Daily Posture Snapshot', reportType: 'posture-snapshot', cadence: 'daily', status: 'completed', audience: ['SOM', 'CISO'], periodStart: '2026-01-17T00:00:00.000Z', periodEnd: '2026-01-18T00:00:00.000Z', lastGeneratedAt: '2026-01-18T01:00:00.000Z', nextScheduledAt: '2026-01-19T01:00:00.000Z', format: 'html', description: 'Operational posture metrics: open cases, SLA breach rate, coverage gaps.' },
  { id: seedId('report', 4), entityType: 'report', tenant: SEED_TENANT, createdAt: '2026-01-10T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: REPORT_SOURCE, title: 'Quarterly SLA Report', reportType: 'sla-report', cadence: 'quarterly', status: 'scheduled', audience: ['SOM', 'CISO', 'Tenant Admin'], periodStart: '2026-01-01T00:00:00.000Z', periodEnd: '2026-03-31T23:59:59.000Z', lastGeneratedAt: null, nextScheduledAt: '2026-04-01T06:00:00.000Z', format: 'pdf', description: 'SLA adherence across all case types, team performance, escalation trends.' },
  { id: seedId('report', 5), entityType: 'report', tenant: SEED_TENANT, createdAt: '2026-01-10T00:00:00.000Z', updatedAt: '2026-01-18T06:00:00.000Z', source: REPORT_SOURCE, title: 'Team Performance Export', reportType: 'team-performance', cadence: 'weekly', status: 'completed', audience: ['SOM'], periodStart: '2026-01-11T00:00:00.000Z', periodEnd: '2026-01-18T00:00:00.000Z', lastGeneratedAt: '2026-01-18T04:00:00.000Z', nextScheduledAt: '2026-01-25T04:00:00.000Z', format: 'csv', description: 'Per-analyst case volume, closure rate, mean resolution time.' },
];
