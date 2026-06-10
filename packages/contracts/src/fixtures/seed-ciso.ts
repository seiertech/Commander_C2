/**
 * Seed CISO Summary — Commander C2 Test Fixtures
 *
 * Single pre-computed CISO executive summary with realistic aggregate numbers.
 * Source: Master Technical Specification §Executive Surface
 */

import type { CisoSummary } from '../entities/ciso-summary';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const CISO_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-executive-engine' };

export const seedCisoSummary: CisoSummary = {
  id: seedId('ciso', 1),
  entityType: 'ciso-summary',
  tenant: SEED_TENANT,
  createdAt: '2026-01-18T06:00:00.000Z',
  updatedAt: '2026-01-18T06:00:00.000Z',
  source: CISO_SOURCE,
  generatedAt: '2026-01-18T06:00:00.000Z',
  posture: {
    overall: 72,
    byDomain: {
      vulnerability: 65,
      identity: 82,
      coverage: 88,
      configuration: 58,
      endpoint: 79,
      network: 74,
    },
  },
  riskSummary: {
    totalRiskObjects: 23,
    openCount: 15,
    critical: 3,
    high: 5,
    medium: 4,
    low: 3,
  },
  exposureSummary: {
    externalSurfaceCount: 3,
    internalSurfaceCount: 2,
    totalGaps: 7,
  },
  debtSummary: {
    totalItems: 12,
    criticalAge: 45,
    avgResolutionDays: 18,
  },
  controlSummary: {
    frameworksActive: 3,
    avgAdherence: 81,
    nonAdherentCount: 8,
  },
  caseSummary: {
    totalOpen: 24,
    p0Count: 1,
    avgAge: 6.5,
    slaBreachCount: 2,
  },
  strategicBlockers: [
    'Configuration domain health critical — 3 closure blockers pending',
    'Cloud CSPM coverage at 80% — below 90% target',
    'Service account credential rotation overdue (Identity domain)',
  ],
  trend: 'stable',
};
