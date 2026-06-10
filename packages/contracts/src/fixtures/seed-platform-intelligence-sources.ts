// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Seed Platform Intelligence Sources — Deterministic Fixtures
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 20.4, 21.6, 26.5
 *
 * Synthetic .example domains and (Mock) markers. No real secrets/credentials.
 * Covers all 8 source types.
 */

import type { PlatformIntelligenceSource } from '../entities/platform-intelligence-source';
import { PLATFORM_INTELLIGENCE_SOURCE_TYPES } from '../entities/intelligence-common';
import { seedId, SEED_SOURCE } from './seed-tenant';

const ADMIN_TENANT = { tenant_id: 'admin-tenant-001', tenant_name: 'Commander Admin (Mock)' };

export const seedPlatformIntelligenceSources: PlatformIntelligenceSource[] = PLATFORM_INTELLIGENCE_SOURCE_TYPES.map(
  (sourceType, index) => ({
    id: seedId('pis', index + 1),
    tenant: ADMIN_TENANT,
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-01-15T09:00:00.000Z',
    source: SEED_SOURCE,
    name: `${sourceType.replace(/_/g, ' ')} (Mock)`,
    vendor: `mock-vendor-${index + 1}.example.com`,
    source_type,
    connector_class: 'D' as const,
    feedReference: `https://feed-${source_type}.example.com/api/v1`,
    licence_status: 'active',
    sourceMetadataExtra: { mock: true },
    refreshCadenceMinutes: 60 * (index + 1),
    lastSuccessfulSync: '2026-01-15T08:00:00.000Z',
    nextScheduledSync: '2026-01-15T09:00:00.000Z',
    failureState: null,
    sourceFreshness: 'fresh' as const,
    catalogueVersionHash: `v1.0.${index}`,
    healthState: 'healthy',
  }),
);
