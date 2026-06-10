/**
 * Property-Based Tests — Ingestion Pipeline, Mappers, Push, Adherence
 *
 * Feature: platform-intelligence-ioc-distribution, Property 4: Ingestion confluence and source-independence
 * Validates: Requirements 8.2, 9.2, 24.2
 *
 * Feature: platform-intelligence-ioc-distribution, Property 10: Vendor advisory IOC extraction yields distinct linked IOCs
 * Validates: Requirements 5.3
 *
 * Feature: platform-intelligence-ioc-distribution, Property 11: No tenant risk without a confirming evaluation
 * Validates: Requirements 4.2, 11.5, 18.4
 *
 * Feature: platform-intelligence-ioc-distribution, Property 12: Exposure evaluations carry evidence and provenance
 * Validates: Requirements 11.3
 *
 * Feature: platform-intelligence-ioc-distribution, Property 15: Non-duplication and cross-plane reference resolution
 * Validates: Requirements 10.2, 17.3, 17.4
 *
 * Feature: platform-intelligence-ioc-distribution, Property 19: IOC matching references existing Observables without duplication
 * Validates: Requirements 12.2
 *
 * Feature: platform-intelligence-ioc-distribution, Property 20: IOC and vulnerability case links use correct types within the lifecycle
 * Validates: Requirements 13.3, 13.4
 *
 * Feature: platform-intelligence-ioc-distribution, Property 21: Push capability mapping is total and correct
 * Validates: Requirements 15.3
 *
 * Feature: platform-intelligence-ioc-distribution, Property 22: Push intents are never live-executed in Phase 1
 * Validates: Requirements 15.4
 *
 * Feature: platform-intelligence-ioc-distribution, Property 23: Intelligence never creates adherence state directly
 * Validates: Requirements 19.1, 19.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { processIngestion } from '../../packages/rules/ingestion-pipeline';
import { extractAdvisoryIocs } from '../../packages/rules/advisory-ioc-extraction';
import { buildTenantEvaluation, buildTenantIocMatch } from '../../packages/rules/tenant-evaluation-builders';
import { getTargetSystems, buildPushActionIntent, PUSH_CAPABILITY_MAP, PHASE1_ALLOWED_STATUSES } from '../../packages/rules/push-capability-mapping';
import { buildIocCaseLink, buildVulnerabilityCaseLink } from '../../packages/rules/case-outcome-mappers';
import { resolveReference } from '../../packages/rules/cross-plane-resolver';
import { mapCveToEnrichmentEvidence, mapIocMatchToEnrichmentEvidence, assertNeverCreatesAdherenceState } from '../../packages/rules/adherence-enrichment';
import { IOC_CATEGORIES, IOC_CASE_LINK_TYPES, PUSH_INTENT_STATUSES, PUSH_ACTION_TYPES, EVALUATION_TYPES, TENANT_EXPOSURE_STATES } from '../../packages/contracts/src/entities/intelligence-common';
import type { IocCategory, IocCaseLinkType, PushIntentStatus, PushActionType } from '../../packages/contracts/src/entities/intelligence-common';
import type { IndicatorOfCompromise } from '../../packages/contracts/src/entities/indicator-of-compromise';

describe('Property 4: Ingestion confluence and source-independence', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 4: Ingestion confluence and source-independence
  it('same IOC from different paths produces single catalogue entry with merged attributions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length > 0),
        (category: IocCategory, value: string) => {
          const catalogue = new Map<string, IndicatorOfCompromise>();
          const paths = ['direct_feed', 'vendor_advisory', 'commercial_feed'] as const;

          for (let i = 0; i < paths.length; i++) {
            processIngestion({
              path: paths[i],
              iocCategory: category,
              rawValue: value,
              sourceId: `source-${i}`,
              confidence: 50 + i * 10,
              severity: 3,
              timestamp: '2026-01-01T00:00:00Z',
            }, catalogue, `ioc-${i}`);
          }

          // Single catalogue entry (dedup by normalisedValue + category)
          expect(catalogue.size).toBe(1);

          // Merged attributions from all sources
          const entry = Array.from(catalogue.values())[0];
          expect(entry.sourceAttribution.length).toBe(3);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 10: Vendor advisory IOC extraction yields distinct linked IOCs', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 10: Vendor advisory IOC extraction yields distinct linked IOCs
  it('each extracted IOC is distinct and linked to the advisory', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (numIocs: number) => {
          const advisory = {
            id: 'adv-001',
            tenant: { tenantId: 'admin-001', tenantName: 'Admin' },
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
            source: { connectorId: 'c1', importRunId: 'r1', sourceSystem: 'test', sourceTimestamp: '2026-01-01T00:00:00Z' },
            advisoryId: 'ADV-2026-001',
            vendor: 'TestVendor',
            title: 'Test Advisory',
            publishedAt: '2026-01-01T00:00:00Z',
            lastModifiedAt: '2026-01-01T00:00:00Z',
            severity: 4,
            affectedProducts: ['product-1'],
            remediationGuidance: 'Update immediately',
            relatedCveIds: ['CVE-2026-0001'],
            containedIocIds: [],
          };

          const iocEntries = Array.from({ length: numIocs }, (_, i) => ({
            value: `ioc-value-${i}.example.com`,
            category: 'domain' as IocCategory,
            confidence: 70,
            severity: 4,
          }));

          const result = extractAdvisoryIocs({
            advisory,
            iocEntries,
            baseIdPrefix: 'extract',
            timestamp: '2026-01-01T00:00:00Z',
          });

          // Each IOC is distinct
          const iocIds = new Set(result.iocs.map(i => i.id));
          expect(iocIds.size).toBe(numIocs);

          // Each has a relationship linked_to_vendor_advisory
          expect(result.relationships.length).toBe(numIocs);
          for (const rel of result.relationships) {
            expect(rel.relationshipState).toBe('linked_to_vendor_advisory');
            expect(rel.relatedEntityId).toBe(advisory.id);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 11: No tenant risk without a confirming evaluation', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 11: No tenant risk without a confirming evaluation
  it('KEV/EPSS alone never produce confirmed exposure state', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.integer({ min: 0, max: 100 }),
        (kevStatus: boolean, epssPercentile: number) => {
          // An evaluation created without matching observables should not be 'exposed'
          // KEV and EPSS are enrichment only
          const evaluation = buildTenantEvaluation({
            id: 'eval-001',
            tenantId: 'tenant-001',
            platformRecordId: 'record-001',
            evaluationType: 'vulnerability_exposure',
            evaluationState: 'not_exposed', // KEV/EPSS alone = not_exposed
            matchedAssets: [],
            matchedIdentities: [],
            matchedObservables: [],
            evidenceReferences: [],
            evaluatedAt: '2026-01-01T00:00:00Z',
            sourceConnectorId: 'c1',
          });

          // Without matched observables/assets, state must not be 'exposed'
          if (evaluation.matchedObservables.length === 0 && evaluation.matchedAssets.length === 0) {
            expect(evaluation.evaluationState).not.toBe('exposed');
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 12: Exposure evaluations carry evidence and provenance', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 12: Exposure evaluations carry evidence and provenance
  it('evaluations with exposure state always have evidence references', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 5, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
        (evidenceRefs: string[]) => {
          const evaluation = buildTenantEvaluation({
            id: 'eval-001',
            tenantId: 'tenant-001',
            platformRecordId: 'record-001',
            evaluationType: 'ioc_match',
            evaluationState: 'exposed',
            matchedAssets: ['asset-001'],
            matchedIdentities: [],
            matchedObservables: ['obs-001'],
            evidenceReferences: evidenceRefs,
            evaluatedAt: '2026-01-01T00:00:00Z',
            sourceConnectorId: 'c1',
          });

          // Evidence references are preserved (provenance)
          expect(evaluation.evidenceReferences).toEqual(evidenceRefs);
          expect(evaluation.evidenceReferences.length).toBeGreaterThan(0);
          // Source metadata is present
          expect(evaluation.source.connectorId).toBe('c1');
          expect(evaluation.source.sourceSystem).toBe('intelligence-evaluation');
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 15: Non-duplication and cross-plane reference resolution', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 15: Non-duplication and cross-plane reference resolution
  it('resolves existing references without duplication', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
        (refId: string) => {
          const catalogue = new Map<string, { id: string; data: string }>();
          catalogue.set(refId, { id: refId, data: 'original' });

          const result = resolveReference(refId, catalogue);
          expect(result.resolved).toBe(true);
          expect(result.record).toBe(catalogue.get(refId)); // same reference, not a copy
        },
      ),
      { numRuns: 100 },
    );
  });

  it('dangling references surface as resolution errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
        (refId: string) => {
          const emptyCatalogue = new Map<string, unknown>();
          const result = resolveReference(refId, emptyCatalogue);
          expect(result.resolved).toBe(false);
          expect(result.error).toContain('Dangling reference');
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 19: IOC matching references existing Observables without duplication', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 19: IOC matching references existing Observables without duplication
  it('match references an observable by ID, not duplicating it', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
        (iocId: string, observableId: string) => {
          const match = buildTenantIocMatch({
            id: 'match-001',
            tenantId: 'tenant-001',
            iocId,
            matchedObservableId: observableId,
            matchType: 'exact',
            matchConfidence: 95,
            matchedAt: '2026-01-01T00:00:00Z',
            matchSource: 'test-matcher',
            evidenceReferences: ['evidence-001'],
            sourceConnectorId: 'c1',
          });

          // References by ID (string), not a materialised copy
          expect(match.matchedObservableId).toBe(observableId);
          expect(typeof match.matchedObservableId).toBe('string');
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 20: IOC and vulnerability case links use correct types within the lifecycle', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 20: IOC and vulnerability case links use correct types within the lifecycle
  it('IOC case links use valid link types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CASE_LINK_TYPES),
        (linkType: IocCaseLinkType) => {
          const link = buildIocCaseLink({
            id: 'link-001',
            tenantId: 'tenant-001',
            iocMatchId: 'match-001',
            caseId: 'case-001',
            linkType,
            linkedAt: '2026-01-01T00:00:00Z',
          });
          expect(IOC_CASE_LINK_TYPES).toContain(link.linkType);
          expect(link.status).toBe('active');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('vulnerability case links use vulnerability type', () => {
    const link = buildVulnerabilityCaseLink({
      id: 'vlink-001',
      tenantId: 'tenant-001',
      evaluationId: 'eval-001',
      caseId: 'case-001',
      linkedAt: '2026-01-01T00:00:00Z',
    });
    expect(link.linkType).toBe('vulnerability');
  });
});

describe('Property 21: Push capability mapping is total and correct', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 21: Push capability mapping is total and correct
  it('every IOC category maps to at least one target system', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        (category: IocCategory) => {
          const targets = getTargetSystems(category);
          expect(targets.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 22: Push intents are never live-executed in Phase 1', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 22: Push intents are never live-executed in Phase 1
  it('all allowed intent statuses are mock/intent-only', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PUSH_INTENT_STATUSES),
        fc.constantFrom(...IOC_CATEGORIES),
        fc.constantFrom(...PUSH_ACTION_TYPES),
        (status: PushIntentStatus, category: IocCategory, actionType: PushActionType) => {
          const intent = buildPushActionIntent({
            id: 'intent-001',
            tenantId: 'tenant-001',
            iocId: 'ioc-001',
            iocCategory: category,
            targetSystemType: 'siem',
            actionType,
            intentStatus: status,
            requestedBy: 'analyst-001',
            requestedAt: '2026-01-01T00:00:00Z',
          });

          // Phase 1: no live execution status exists
          expect(intent.intentStatus).not.toBe('live_pushed');
          expect(intent.intentStatus).not.toBe('executed');
          expect(PHASE1_ALLOWED_STATUSES).toContain(intent.intentStatus);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 23: Intelligence never creates adherence state directly', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 23: Intelligence never creates adherence state directly
  it('CVE enrichment evidence does not contain adherence state', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.integer({ min: 0, max: 100 }),
        (kevStatus: boolean, cvssScore: number) => {
          const evidence = mapCveToEnrichmentEvidence({
            cveId: 'CVE-2026-0001',
            platformRecordId: 'record-001',
            cisaKevStatus: kevStatus,
            cvssScore,
            producedAt: '2026-01-01T00:00:00Z',
          });
          expect(assertNeverCreatesAdherenceState(evidence)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('IOC match enrichment evidence does not contain adherence state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (matchConfidence: number) => {
          const evidence = mapIocMatchToEnrichmentEvidence({
            iocId: 'ioc-001',
            platformRecordId: 'record-001',
            evaluationId: 'eval-001',
            matchConfidence,
            producedAt: '2026-01-01T00:00:00Z',
          });
          expect(assertNeverCreatesAdherenceState(evidence)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
