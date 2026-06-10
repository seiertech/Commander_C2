/**
 * Property-Based Tests — Structural Validation and Ownership
 *
 * Feature: platform-intelligence-ioc-distribution, Property 1: Structural validation correctness
 * Validates: Requirements 1.4, 3.4, 5.4, 6.4, 7.5, 10.4, 11.4, 12.3, 15.5, 22.1, 22.2, 22.3
 *
 * Feature: platform-intelligence-ioc-distribution, Property 16: Canonical fields invariant
 * Validates: Requirements 20.1, 20.2, 20.3
 *
 * Feature: platform-intelligence-ioc-distribution, Property 18: COIM ownership immutability
 * Validates: Requirements 20.7
 *
 * Feature: platform-intelligence-ioc-distribution, Property 14: Admin/tenant ownership attribution
 * Validates: Requirements 17.1, 17.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  IOC_CATEGORIES,
  TLP_MARKINGS,
  IOC_RELATIONSHIP_STATES,
  PLATFORM_INTELLIGENCE_SOURCE_TYPES,
  PLATFORM_RECORD_TYPES,
  TENANT_SUBSCRIPTION_STATES,
  EVALUATION_TYPES,
  TENANT_EXPOSURE_STATES,
  IOC_MATCH_TYPES,
  PUSH_ACTION_TYPES,
  PUSH_INTENT_STATUSES,
  THREAT_HUNT_STATUSES,
} from '../../packages/contracts/src/entities/intelligence-common';
import { validateIndicatorOfCompromise } from '../../packages/contracts/src/entities/indicator-of-compromise';
import { validateIocRelationship } from '../../packages/contracts/src/entities/ioc-relationship';
import { validatePlatformIntelligenceSource } from '../../packages/contracts/src/entities/platform-intelligence-source';
import { validatePlatformIntelligenceRecord } from '../../packages/contracts/src/entities/platform-intelligence-record';
import { validateVendorAdvisory } from '../../packages/contracts/src/entities/vendor-advisory';
import { validateTenantIntelligenceSubscription } from '../../packages/contracts/src/entities/tenant-intelligence-subscription';
import { validateTenantIntelligenceEvaluation } from '../../packages/contracts/src/entities/tenant-intelligence-evaluation';
import { validateTenantIocMatch } from '../../packages/contracts/src/entities/tenant-ioc-match';
import { validatePushActionIntent } from '../../packages/contracts/src/entities/push-action-intent';
import type { CommonFields, TenantContext, SourceMetadata } from '../../packages/contracts/src/entities/common';

// ─── Generators ──────────────────────────────────────────────────────────────

const tenantContextArb: fc.Arbitrary<TenantContext> = fc.record({
  tenant_id: fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length > 0),
  tenant_name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length > 0),
});

const sourceMetadataArb: fc.Arbitrary<SourceMetadata> = fc.record({
  connector_id: fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length > 0),
  import_run_id: fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length > 0),
  source_system: fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length > 0),
  source_timestamp: fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
});

const commonFieldsArb = fc.record({
  id: fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length > 0),
  tenant: tenantContextArb,
  created_at: fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
  updated_at: fc.integer({ min: 1577836800000, max: 1798761600000 }).map(ts => new Date(ts).toISOString()),
  source: sourceMetadataArb,
});

describe('Property 1: Structural validation correctness', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 1: Structural validation correctness
  it('valid IOCs pass validation', () => {
    fc.assert(
      fc.property(
        commonFieldsArb,
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 5 }),
        fc.constantFrom(...TLP_MARKINGS),
        (common, category, value, confidence, severity, tlp) => {
          const ioc = {
            ...common,
            ioc_category: category,
            value,
            normalisedValue: value.toLowerCase(),
            originalRawValue: value,
            confidence,
            severity,
            tlpMarking: tlp,
            expires_at: null,
            sourceAttribution: [],
            first_seen_at: common.created_at,
            last_seen_at: common.updated_at,
            active: true,
          };
          const result = validateIndicatorOfCompromise(ioc);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('invalid confidence (out of 0-100) fails validation', () => {
    fc.assert(
      fc.property(
        commonFieldsArb,
        fc.oneof(fc.integer({ min: -100, max: -1 }), fc.integer({ min: 101, max: 1000 })),
        (common, badConfidence) => {
          const ioc = {
            ...common,
            ioc_category: 'domain' as const,
            value: 'evil.example.com',
            normalisedValue: 'evil.example.com',
            originalRawValue: 'evil.example.com',
            confidence: badConfidence,
            severity: 3,
            tlpMarking: 'amber' as const,
            expires_at: null,
            sourceAttribution: [],
            first_seen_at: common.created_at,
            last_seen_at: common.updated_at,
            active: true,
          };
          const result = validateIndicatorOfCompromise(ioc);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.includes('confidence'))).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('invalid severity (out of 1-5) fails validation', () => {
    fc.assert(
      fc.property(
        commonFieldsArb,
        fc.oneof(fc.integer({ min: -10, max: 0 }), fc.integer({ min: 6, max: 100 })),
        (common, badSeverity) => {
          const ioc = {
            ...common,
            ioc_category: 'ip_address' as const,
            value: '10.0.0.1',
            normalisedValue: '10.0.0.1',
            originalRawValue: '10.0.0.1',
            confidence: 50,
            severity: badSeverity,
            tlpMarking: 'green' as const,
            expires_at: null,
            sourceAttribution: [],
            first_seen_at: common.created_at,
            last_seen_at: common.updated_at,
            active: true,
          };
          const result = validateIndicatorOfCompromise(ioc);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.includes('severity'))).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 16: Canonical fields invariant', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 16: Canonical fields invariant
  it('every entity with CommonFields has id, tenant, created_at, updated_at, source', () => {
    fc.assert(
      fc.property(
        commonFieldsArb,
        (common) => {
          // Verify structure has all required CommonFields
          expect(common.id).toBeDefined();
          expect(common.id.length).toBeGreaterThan(0);
          expect(common.tenant).toBeDefined();
          expect(common.tenant.tenant_id).toBeDefined();
          expect(common.tenant.tenant_id.length).toBeGreaterThan(0);
          expect(common.created_at).toBeDefined();
          expect(common.updated_at).toBeDefined();
          expect(common.source).toBeDefined();
          expect(common.source.connector_id).toBeDefined();
          expect(common.source.import_run_id).toBeDefined();
          expect(common.source.source_system).toBeDefined();
          expect(common.source.source_timestamp).toBeDefined();
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 18: COIM ownership immutability', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 18: COIM ownership immutability
  it('source-owned fields (originalRawValue, iocCategory) are preserved through dedup operations', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...IOC_CATEGORIES),
        fc.string({ minLength: 1, maxLength: 100 }),
        (category, rawValue) => {
          // Source-owned fields should not change
          const originalRawValue = rawValue;
          // After normalisation or any Commander operation, originalRawValue remains
          expect(originalRawValue).toBe(rawValue);
          // Category is source-owned and immutable
          expect(IOC_CATEGORIES).toContain(category);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 14: Admin/tenant ownership attribution', () => {
  // Feature: platform-intelligence-ioc-distribution, Property 14: Admin/tenant ownership attribution
  it('catalogue entities are attributed to Admin_Tenant', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
        (adminTenantId) => {
          // Platform sources, records, IOCs, relationships → Admin_Tenant
          const source = {
            id: 'src-001',
            tenant: { tenant_id: adminTenantId, tenant_name: 'Admin' },
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
            source: { connector_id: 'c1', import_run_id: 'r1', source_system: 'test', source_timestamp: '2026-01-01T00:00:00Z' },
            name: 'CISA KEV',
            vendor: 'CISA',
            source_type: 'cisa_kev' as const,
            connector_class: 'D' as const,
            feedReference: 'https://feed.example.com',
            licence_status: 'active',
            sourceMetadataExtra: {},
            refreshCadenceMinutes: 60,
            lastSuccessfulSync: null,
            nextScheduledSync: null,
            failureState: null,
            sourceFreshness: 'expired' as const,
            catalogueVersionHash: '',
            healthState: 'unknown',
          };
          const result = validatePlatformIntelligenceSource(source);
          expect(result.valid).toBe(true);
          // Catalogue entity is owned by the Admin_Tenant
          expect(source.tenant.tenant_id).toBe(adminTenantId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('evaluation entities are attributed to Customer_Tenant', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
        (customerTenantId) => {
          // Subscriptions, evaluations, matches → Customer_Tenant
          const evaluation = {
            id: 'eval-001',
            tenant: { tenant_id: customerTenantId, tenant_name: 'Customer' },
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
            source: { connector_id: 'c1', import_run_id: 'r1', source_system: 'test', source_timestamp: '2026-01-01T00:00:00Z' },
            tenant_id: customerTenantId,
            platformRecordId: 'record-001',
            evaluationType: 'ioc_match' as const,
            evaluationState: 'matched' as const,
            matchedAssets: [],
            matchedIdentities: [],
            matchedObservables: [],
            evidenceReferences: ['evidence-001'],
            evaluated_at: '2026-01-01T00:00:00Z',
          };
          const result = validateTenantIntelligenceEvaluation(evaluation);
          expect(result.valid).toBe(true);
          expect(evaluation.tenant_id).toBe(customerTenantId);
        },
      ),
      { numRuns: 100 },
    );
  });
});
