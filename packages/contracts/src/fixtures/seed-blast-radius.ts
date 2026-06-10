/**
 * Seed Blast Radius — Commander C2 Test Fixtures
 *
 * Synthetic blast-radius computations for rule-change simulation testing.
 * Source: Spec #34 Drift and Rule Engine
 *
 * 3 records originating from a rule, an asset and an identity. Synthetic values
 * only — affected-entity references mirror the seed findings/scores.
 */

import type { BlastRadius } from '../entities/blast-radius-engine';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const BLAST_SOURCE = { ...SEED_SOURCE, source_system: 'commander-blast-radius' };

export const seedBlastRadius: BlastRadius[] = [
  {
    id: seedId('blast-radius', 1),
    entity_type: 'blast-radius',
    tenant: SEED_TENANT,
    created_at: '2026-02-06T10:00:00.000Z',
    updated_at: '2026-02-06T10:00:00.000Z',
    source: BLAST_SOURCE,
    computationId: 'blast-0001',
    originEntityRef: 'rule-drift-mfa-001',
    originEntityType: 'rule',
    affected_entities: [
      { entity_ref: 'identity-svc-prod-01', entity_type: 'identity', impact_score: 60, distance: 1, relationship: 'rule-matches-identity' },
      { entity_ref: 'identity-break-glass-05', entity_type: 'identity', impact_score: 15, distance: 1, relationship: 'rule-matches-identity' },
      { entity_ref: 'find-0001', entity_type: 'finding', impact_score: 9, distance: 2, relationship: 'rule-emits-finding' },
    ],
    total_impact_score: 84,
    depth: 2,
    computed_at: '2026-02-06T10:00:00.000Z',
  },
  {
    id: seedId('blast-radius', 2),
    entity_type: 'blast-radius',
    tenant: SEED_TENANT,
    created_at: '2026-02-06T10:05:00.000Z',
    updated_at: '2026-02-06T10:05:00.000Z',
    source: BLAST_SOURCE,
    computationId: 'blast-0002',
    originEntityRef: 'asset-s3-logs-02',
    originEntityType: 'asset',
    affected_entities: [
      { entity_ref: 'exposure-s3-public-02', entity_type: 'exposure', impact_score: 40, distance: 1, relationship: 'asset-has-exposure' },
      { entity_ref: 'control-block-public-access', entity_type: 'control', impact_score: 18, distance: 1, relationship: 'asset-governed-by-control' },
    ],
    total_impact_score: 58,
    depth: 1,
    computed_at: '2026-02-06T10:05:00.000Z',
  },
  {
    id: seedId('blast-radius', 3),
    entity_type: 'blast-radius',
    tenant: SEED_TENANT,
    created_at: '2026-02-06T10:10:00.000Z',
    updated_at: '2026-02-06T10:10:00.000Z',
    source: BLAST_SOURCE,
    computationId: 'blast-0003',
    originEntityRef: 'identity-svc-prod-01',
    originEntityType: 'identity',
    affected_entities: [
      { entity_ref: 'asset-payments-api-07', entity_type: 'asset', impact_score: 45, distance: 1, relationship: 'identity-accesses-asset' },
      { entity_ref: 'mission-protect-payments', entity_type: 'mission', impact_score: 30, distance: 2, relationship: 'asset-bound-to-mission' },
      { entity_ref: 'control-mfa-enforce', entity_type: 'control', impact_score: 12, distance: 1, relationship: 'identity-governed-by-control' },
    ],
    total_impact_score: 87,
    depth: 2,
    computed_at: '2026-02-06T10:10:00.000Z',
  },
];
