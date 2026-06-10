/**
 * Seed Blast Radius — Commander SDR Test Fixtures
 *
 * Synthetic blast-radius computations for rule-change simulation testing.
 * Source: Spec #34 Drift and Rule Engine
 *
 * 3 records originating from a rule, an asset and an identity. Synthetic values
 * only — affected-entity references mirror the seed findings/scores.
 */

import type { BlastRadius } from '../entities/blast-radius-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const BLAST_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-blast-radius' };

export const seedBlastRadius: BlastRadius[] = [
  {
    id: seedId('blast-radius', 1),
    entityType: 'blast-radius',
    tenant: SEED_TENANT,
    createdAt: '2026-02-06T10:00:00.000Z',
    updatedAt: '2026-02-06T10:00:00.000Z',
    source: BLAST_SOURCE,
    computationId: 'blast-0001',
    originEntityRef: 'rule-drift-mfa-001',
    originEntityType: 'rule',
    affectedEntities: [
      { entityRef: 'identity-svc-prod-01', entityType: 'identity', impactScore: 60, distance: 1, relationship: 'rule-matches-identity' },
      { entityRef: 'identity-break-glass-05', entityType: 'identity', impactScore: 15, distance: 1, relationship: 'rule-matches-identity' },
      { entityRef: 'find-0001', entityType: 'finding', impactScore: 9, distance: 2, relationship: 'rule-emits-finding' },
    ],
    totalImpactScore: 84,
    depth: 2,
    computedAt: '2026-02-06T10:00:00.000Z',
  },
  {
    id: seedId('blast-radius', 2),
    entityType: 'blast-radius',
    tenant: SEED_TENANT,
    createdAt: '2026-02-06T10:05:00.000Z',
    updatedAt: '2026-02-06T10:05:00.000Z',
    source: BLAST_SOURCE,
    computationId: 'blast-0002',
    originEntityRef: 'asset-s3-logs-02',
    originEntityType: 'asset',
    affectedEntities: [
      { entityRef: 'exposure-s3-public-02', entityType: 'exposure', impactScore: 40, distance: 1, relationship: 'asset-has-exposure' },
      { entityRef: 'control-block-public-access', entityType: 'control', impactScore: 18, distance: 1, relationship: 'asset-governed-by-control' },
    ],
    totalImpactScore: 58,
    depth: 1,
    computedAt: '2026-02-06T10:05:00.000Z',
  },
  {
    id: seedId('blast-radius', 3),
    entityType: 'blast-radius',
    tenant: SEED_TENANT,
    createdAt: '2026-02-06T10:10:00.000Z',
    updatedAt: '2026-02-06T10:10:00.000Z',
    source: BLAST_SOURCE,
    computationId: 'blast-0003',
    originEntityRef: 'identity-svc-prod-01',
    originEntityType: 'identity',
    affectedEntities: [
      { entityRef: 'asset-payments-api-07', entityType: 'asset', impactScore: 45, distance: 1, relationship: 'identity-accesses-asset' },
      { entityRef: 'mission-protect-payments', entityType: 'mission', impactScore: 30, distance: 2, relationship: 'asset-bound-to-mission' },
      { entityRef: 'control-mfa-enforce', entityType: 'control', impactScore: 12, distance: 1, relationship: 'identity-governed-by-control' },
    ],
    totalImpactScore: 87,
    depth: 2,
    computedAt: '2026-02-06T10:10:00.000Z',
  },
];
