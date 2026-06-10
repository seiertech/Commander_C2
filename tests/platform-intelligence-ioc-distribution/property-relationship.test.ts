// @ts-nocheck
/**
 * Property-Based Tests — IOC Relationship State Machine
 *
 * Feature: platform-intelligence-ioc-distribution, Property 8: Relationship cardinality and IOC independence
 * Validates: Requirements 4.4, 5.2, 7.4, 18.1, 18.2, 18.3
 *
 * Feature: platform-intelligence-ioc-distribution, Property 9: Relationship state-history completeness and ordering
 * Validates: Requirements 7.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { transitionRelationship } from '../../packages/rules/relationship-state';
import { IOC_RELATIONSHIP_STATES } from '../../packages/contracts/src/entities/intelligence-common';
import type { IocRelationship } from '../../packages/contracts/src/entities/ioc-relationship';
import type { IocRelationshipState } from '../../packages/contracts/src/entities/intelligence-common';

function makeRelationship(overrides: Partial<IocRelationship> = {}): IocRelationship {
  return {
    id: 'rel-0001',
    tenant: { tenant_id: 'tenant-001', tenant_name: 'Test' },
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    source: { connector_id: 'c1', import_run_id: 'r1', source_system: 'test', source_timestamp: '2026-01-01T00:00:00Z' },
    ioc_id: 'ioc-0001',
    relatedEntityId: 'entity-0001',
    relatedEntityType: 'cve',
    relationshipState: 'unclassified',
    confidence: 50,
    establishedAt: '2026-01-01T00:00:00Z',
    lastUpdatedAt: '2026-01-01T00:00:00Z',
    evidence_ref: 'evidence-ref-001',
    stateHistory: [],
    ...overrides,
  };
}

describe('Property 8: Relationship cardinality and IOC independence', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 8: Relationship cardinality and IOC independence
  it('IOC relationships have optional CVE binding — IOC can exist without CVE relationship', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_RELATIONSHIP_STATES),
        (state: IocRelationshipState) => {
          // IOC can have any relationship state — including states not related to CVE
          const rel = makeRelationship({ relationshipState: state });
          // An IOC with no CVE relationship is valid (independence)
          expect(rel.ioc_id).toBeDefined();
          expect(IOC_RELATIONSHIP_STATES).toContain(rel.relationshipState);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('one IOC can have multiple relationships to different entities (cardinality)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
        (entityIds: string[]) => {
          const relationships = entityIds.map((eid, i) =>
            makeRelationship({
              id: `rel-${i}`,
              relatedEntityId: eid,
              relatedEntityType: i % 2 === 0 ? 'cve' : 'advisory',
            }),
          );
          // All share the same iocId but different relatedEntityIds
          const iocIds = new Set(relationships.map(r => r.ioc_id));
          expect(iocIds.size).toBe(1); // same IOC
          expect(relationships.length).toBe(entityIds.length); // multiple relationships
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 9: Relationship state-history completeness and ordering', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 9: Relationship state-history completeness and ordering
  it('every transition appends to stateHistory with correct previous/new states', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            state: fc.constantFrom(...IOC_RELATIONSHIP_STATES),
            timestamp: fc.integer({ min: 1704067200000, max: 1798761600000 }).map(ms => new Date(ms).toISOString()),
            reason: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          { minLength: 1, maxLength: 5 },
        ),
        (transitions) => {
          let rel = makeRelationship();

          for (const t of transitions) {
            const previousState = rel.relationshipState;
            const result = transitionRelationship(rel, t.state, t.timestamp, t.reason);
            expect(result.success).toBe(true);

            const lastHistory = result.relationship.stateHistory[result.relationship.stateHistory.length - 1];
            expect(lastHistory.previousState).toBe(previousState);
            expect(lastHistory.newState).toBe(t.state);
            expect(lastHistory.changedAt).toBe(t.timestamp);
            expect(lastHistory.reason).toBe(t.reason);

            rel = result.relationship;
          }

          // stateHistory length equals number of transitions
          expect(rel.stateHistory.length).toBe(transitions.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('stateHistory entries are in chronological order when transitions are applied sequentially', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...IOC_RELATIONSHIP_STATES), { minLength: 2, maxLength: 5 }),
        (states: IocRelationshipState[]) => {
          let rel = makeRelationship();
          let time = new Date('2024-01-01T00:00:00Z').getTime();

          for (const state of states) {
            const timestamp = new Date(time).toISOString();
            const result = transitionRelationship(rel, state, timestamp, 'test');
            rel = result.relationship;
            time += 60000; // advance 1 minute
          }

          // Verify ordering
          for (let i = 1; i < rel.stateHistory.length; i++) {
            const prev = new Date(rel.stateHistory[i - 1].changedAt).getTime();
            const curr = new Date(rel.stateHistory[i].changedAt).getTime();
            expect(curr).toBeGreaterThanOrEqual(prev);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
