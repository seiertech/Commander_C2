/**
 * Fixture Conformance Tests
 *
 * Feature: platform-intelligence-ioc-distribution
 * Task: 16.5 — Assert every fixture passes its validateX and carries CommonFields
 * Requirements: 20.1, 20.2, 20.3, 20.5, 21.6
 */

import { describe, it, expect } from 'vitest';
import { seedPlatformIntelligenceSources } from '../../packages/contracts/src/fixtures/seed-platform-intelligence-sources';
import { seedIocs } from '../../packages/contracts/src/fixtures/seed-iocs';
import { validatePlatformIntelligenceSource } from '../../packages/contracts/src/entities/platform-intelligence-source';
import { validateIndicatorOfCompromise } from '../../packages/contracts/src/entities/indicator-of-compromise';
import { IOC_CATEGORIES, PLATFORM_INTELLIGENCE_SOURCE_TYPES } from '../../packages/contracts/src/entities/intelligence-common';

describe('Fixture conformance — Platform Intelligence Sources', () => {
  it('all source fixtures pass validation', () => {
    for (const source of seedPlatformIntelligenceSources) {
      const result = validatePlatformIntelligenceSource(source);
      expect(result.valid, `Source ${source.id}: ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('all source fixtures have CommonFields', () => {
    for (const source of seedPlatformIntelligenceSources) {
      expect(source.id).toBeDefined();
      expect(source.tenant).toBeDefined();
      expect(source.tenant.tenant_id).toBeDefined();
      expect(source.created_at).toBeDefined();
      expect(source.updated_at).toBeDefined();
      expect(source.source).toBeDefined();
    }
  });

  it('all 8 source types are covered', () => {
    const types = seedPlatformIntelligenceSources.map(s => s.source_type);
    for (const st of PLATFORM_INTELLIGENCE_SOURCE_TYPES) {
      expect(types).toContain(st);
    }
  });

  it('all source fixtures use deterministic seedId', () => {
    for (const source of seedPlatformIntelligenceSources) {
      expect(source.id).toMatch(/^pis-\d{4}$/);
    }
  });
});

describe('Fixture conformance — Indicators of Compromise', () => {
  it('all IOC fixtures pass validation', () => {
    for (const ioc of seedIocs) {
      const result = validateIndicatorOfCompromise(ioc);
      expect(result.valid, `IOC ${ioc.id} (${ioc.ioc_category}): ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('all IOC fixtures have CommonFields + TenantContext + SourceMetadata', () => {
    for (const ioc of seedIocs) {
      expect(ioc.id).toBeDefined();
      expect(ioc.tenant).toBeDefined();
      expect(ioc.tenant.tenant_id).toBeDefined();
      expect(ioc.tenant.tenant_name).toBeDefined();
      expect(ioc.created_at).toBeDefined();
      expect(ioc.updated_at).toBeDefined();
      expect(ioc.source).toBeDefined();
      expect(ioc.source.connector_id).toBeDefined();
      expect(ioc.source.import_run_id).toBeDefined();
      expect(ioc.source.source_system).toBeDefined();
      expect(ioc.source.source_timestamp).toBeDefined();
    }
  });

  it('all 26 IOC categories are covered', () => {
    const categories = seedIocs.map(i => i.ioc_category);
    for (const cat of IOC_CATEGORIES) {
      expect(categories).toContain(cat);
    }
  });

  it('all IOC fixtures use deterministic seedId', () => {
    for (const ioc of seedIocs) {
      expect(ioc.id).toMatch(/^ioc-\d{4}$/);
    }
  });
});
