/**
 * Seed STIX Bundle Ingests — Deterministic Fixtures
 *
 * Feature: communications-excellence
 * 2 parsed STIX ingest records. Synthetic data.
 * No live STIX/TAXII feeds.
 */

import type { StixBundleIngest } from '../entities/stix-bundle-ingest';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

export const seedStixBundleIngests: StixBundleIngest[] = [
  {
    id: seedId('stixingest', 1),
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T06:00:00.000Z',
    updatedAt: '2026-01-16T06:05:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-stix-parser (Mock)' },
    ingestId: seedId('stixingest', 1),
    tenantId: SEED_TENANT.tenantId,
    sourceEmailId: seedId('email', 5),
    bundleVersion: '2.1',
    objectsParsed: 8,
    objectTypes: ['indicator', 'attack-pattern', 'malware'],
    mappedObservableIds: [seedId('obs', 201), seedId('obs', 202), seedId('obs', 203)],
    mappedIocIds: [seedId('ioc', 50), seedId('ioc', 51)],
    relevanceScore: 78,
    caseCreated: true,
    caseId: seedId('case', 15),
    ingestedAt: '2026-01-16T06:00:00.000Z',
    status: 'complete',
  },
  {
    id: seedId('stixingest', 2),
    tenant: SEED_TENANT,
    createdAt: '2026-01-16T07:00:00.000Z',
    updatedAt: '2026-01-16T07:03:00.000Z',
    source: { ...SEED_SOURCE, sourceSystem: 'commander-stix-parser (Mock)' },
    ingestId: seedId('stixingest', 2),
    tenantId: SEED_TENANT.tenantId,
    sourceEmailId: seedId('email', 6),
    bundleVersion: '2.1',
    objectsParsed: 3,
    objectTypes: ['indicator', 'campaign'],
    mappedObservableIds: [seedId('obs', 204)],
    mappedIocIds: [seedId('ioc', 52)],
    relevanceScore: 35,
    caseCreated: false,
    caseId: null,
    ingestedAt: '2026-01-16T07:00:00.000Z',
    status: 'evaluated',
  },
];
