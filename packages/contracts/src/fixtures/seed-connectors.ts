/**
 * Seed Connectors — Commander SDR Test Fixtures
 *
 * Synthetic connector data conforming to canonical entity shape.
 * Source: Spec #05 §6.4.4 Connector, Spec #61 Universal Security Signal Connector Contract
 * v1.3 Requirement 5: Connector fixture completeness
 * v1.3 Requirement 14: Only classes A/B/C/D permitted
 */

import type { Connector } from '../entities/connector';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

export const seedConnectors: Connector[] = [
  {
    id: seedId('connector', 1),
    entityType: 'connector',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-connector-framework' },
    name: 'CrowdStrike Falcon (Mock)',
    classes: ['A', 'B'],
    sourceType: 'crowdstrike-falcon',
    tier: 'core',
    state: 'active',
    lastRunAt: '2026-01-15T09:00:00.000Z',
    lastRunStatus: 'success',
    mappingPackVersion: '1.0.0',
  },
  {
    id: seedId('connector', 2),
    entityType: 'connector',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-connector-framework' },
    name: 'Microsoft Entra ID (Mock)',
    classes: ['C'],
    sourceType: 'microsoft-entra-id',
    tier: 'core',
    state: 'active',
    lastRunAt: '2026-01-15T08:30:00.000Z',
    lastRunStatus: 'success',
    mappingPackVersion: '1.0.0',
  },
  {
    id: seedId('connector', 3),
    entityType: 'connector',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-14T12:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-connector-framework' },
    name: 'Recorded Future (Mock)',
    classes: ['D'],
    sourceType: 'recorded-future',
    tier: 'extended',
    state: 'active',
    lastRunAt: '2026-01-14T12:00:00.000Z',
    lastRunStatus: 'success',
    mappingPackVersion: '0.9.0',
  },
  {
    id: seedId('connector', 4),
    entityType: 'connector',
    tenant: SEED_TENANT,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-13T00:00:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-connector-framework' },
    name: 'AWS Config (Mock)',
    classes: ['C'],
    sourceType: 'aws-config',
    tier: 'core',
    state: 'error',
    lastRunAt: '2026-01-13T00:00:00.000Z',
    lastRunStatus: 'failed',
    mappingPackVersion: '1.0.0',
  },
];
