/**
 * Seed Connectors — Commander C2 Test Fixtures
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
    entity_type: 'connector',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-connector-framework' },
    name: 'CrowdStrike Falcon (Mock)',
    classes: ['A', 'B'],
    source_type: 'crowdstrike-falcon',
    tier: 'core',
    state: 'active',
    last_run_at: '2026-01-15T09:00:00.000Z',
    last_run_status: 'success',
    mapping_pack_version: '1.0.0',
  },
  {
    id: seedId('connector', 2),
    entity_type: 'connector',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-connector-framework' },
    name: 'Microsoft Entra ID (Mock)',
    classes: ['C'],
    source_type: 'microsoft-entra-id',
    tier: 'core',
    state: 'active',
    last_run_at: '2026-01-15T08:30:00.000Z',
    last_run_status: 'success',
    mapping_pack_version: '1.0.0',
  },
  {
    id: seedId('connector', 3),
    entity_type: 'connector',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-14T12:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-connector-framework' },
    name: 'Recorded Future (Mock)',
    classes: ['D'],
    source_type: 'recorded-future',
    tier: 'extended',
    state: 'active',
    last_run_at: '2026-01-14T12:00:00.000Z',
    last_run_status: 'success',
    mapping_pack_version: '0.9.0',
  },
  {
    id: seedId('connector', 4),
    entity_type: 'connector',
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-13T00:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-connector-framework' },
    name: 'AWS Config (Mock)',
    classes: ['C'],
    source_type: 'aws-config',
    tier: 'core',
    state: 'error',
    last_run_at: '2026-01-13T00:00:00.000Z',
    last_run_status: 'failed',
    mapping_pack_version: '1.0.0',
  },
];
