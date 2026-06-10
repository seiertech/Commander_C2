/**
 * Seed IOC Relationships — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5, 7.1, 7.2
 *
 * 8 relationships covering all IOC_RELATIONSHIP_STATES (linked_to_cve through unclassified).
 * Synthetic .example domains, (Mock) markers. No real secrets/credentials.
 */

import type { IocRelationship } from '../entities/ioc-relationship';
import type { IocRelationshipState } from '../entities/intelligence-common';
import { IOC_RELATIONSHIP_STATES } from '../entities/intelligence-common';
import { seedId, SEED_SOURCE } from './seed-tenant';

const ADMIN_TENANT = { tenantId: 'admin-tenant-001', tenantName: 'Commander Admin (Mock)' };

const RELATIONSHIP_FIXTURES: Array<{
  state: IocRelationshipState;
  iocIdx: number;
  relatedType: string;
  relatedId: string;
}> = [
  { state: 'linked_to_cve', iocIdx: 1, relatedType: 'cve', relatedId: 'CVE-2026-0001' },
  { state: 'not_linked_to_cve', iocIdx: 2, relatedType: 'cve', relatedId: 'CVE-2026-9999' },
  { state: 'suspected_cve_link', iocIdx: 3, relatedType: 'cve', relatedId: 'CVE-2026-1100' },
  { state: 'linked_to_vendor_advisory', iocIdx: 5, relatedType: 'advisory', relatedId: seedId('vadv', 1) },
  { state: 'linked_to_campaign', iocIdx: 7, relatedType: 'campaign', relatedId: 'campaign-mock-001' },
  { state: 'linked_to_malware', iocIdx: 8, relatedType: 'malware', relatedId: 'malware-mock-emotet' },
  { state: 'linked_to_actor', iocIdx: 4, relatedType: 'actor', relatedId: 'actor-mock-apt28' },
  { state: 'unclassified', iocIdx: 6, relatedType: 'unknown', relatedId: 'unknown-entity-mock-001' },
];

export const seedIocRelationships: IocRelationship[] = RELATIONSHIP_FIXTURES.map(
  (fixture, index) => ({
    id: seedId('iocrel', index + 1),
    tenant: ADMIN_TENANT,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    iocId: seedId('ioc', fixture.iocIdx),
    relatedEntityId: fixture.relatedId,
    relatedEntityType: fixture.relatedType,
    relationshipState: fixture.state,
    confidence: 60 + (index * 5),
    establishedAt: '2026-01-12T00:00:00.000Z',
    lastUpdatedAt: '2026-01-15T09:00:00.000Z',
    evidenceRef: `evidence-ref-mock-${index + 1}`,
    stateHistory: [
      {
        previousState: 'unclassified' as IocRelationshipState,
        newState: fixture.state,
        changedAt: '2026-01-12T00:00:00.000Z',
        reason: `Initial classification (Mock) — set to ${fixture.state}`,
      },
    ],
  }),
);
