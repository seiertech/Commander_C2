/**
 * Seed Search Config — Commander C2 (Spec 42)
 * 1 config record covering all searchable entity types
 */

import type { SearchIndexConfig } from '../entities/search-index-config';

export const seedSearchConfigs: SearchIndexConfig[] = [
  {
    id: 'search-config-001',
    entity_type: 'search-index-config',
    indexId: 'idx-commander-universal',
    entity_types: [
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
      tenant_id: 'tenant-001',
      tenant_name: 'Seiertech Demo',
    },
    source: {
      connector_id: 'system',
      import_run_id: 'init-001',
      source_system: 'commander-platform',
      source_timestamp: '2025-01-01T00:00:00Z',
    },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T06:00:00Z',
  },
];
