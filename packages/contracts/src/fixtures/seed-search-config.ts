/**
 * Seed Search Config — Commander SDR (Spec 42)
 * 1 config record covering all searchable entity types
 */

import type { SearchIndexConfig } from '../entities/search-index-config';

export const seedSearchConfigs: SearchIndexConfig[] = [
  {
    id: 'search-config-001',
    entityType: 'search-index-config',
    indexId: 'idx-commander-universal',
    entityTypes: [
      'case',
      'risk-object',
      'asset',
      'identity',
      'vulnerability-intelligence-record',
      'indicator-of-compromise',
      'connector',
      'strategy-policy',
      'control-framework',
      'architecture-component',
      'direction-board',
      'audit-event',
    ],
    tenantScoped: true,
    rbacFiltered: true,
    sensitiveFields: ['identity.riskFactors', 'case.internalNotes', 'audit-event.payload'],
    auditEnabled: true,
    lastReindexedAt: '2025-01-15T06:00:00Z',
    tenant: {
      tenantId: 'tenant-001',
      tenantName: 'Seiertech Demo',
    },
    source: {
      connectorId: 'system',
      importRunId: 'init-001',
      sourceSystem: 'commander-platform',
      sourceTimestamp: '2025-01-01T00:00:00Z',
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T06:00:00Z',
  },
];
