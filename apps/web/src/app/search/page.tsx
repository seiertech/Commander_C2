'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/page-container';
import { seedSearchConfigs } from '../../../../../packages/contracts/src/fixtures/seed-search-config';
import { planQuery } from '../../../../../packages/contracts/src/engines/universal-search-engine';
import type { SearchResult } from '../../../../../packages/contracts/src/engines/universal-search-engine';
import { primitiveTypeScale } from '../../../../../packages/ui/src/tokens/primitives';

/**
 * Universal Search — Commander SDR (Spec 42)
 *
 * Source: Spec #42 Universal Search
 * Data: search-index-config.ts, seed-search-config.ts, universal-search-engine.ts
 * Use Cases: UC-154 (search across governed entities)
 * Route: /search | Nav Group: Platform
 *
 * Provides universal search input, results grouped by entity type,
 * canonical drill-through links. RBAC-filtered, tenant-scoped, audit-logged.
 */

/** Mock search results for demonstration — in production backed by search infrastructure */
const MOCK_RESULTS: SearchResult[] = [
  { entityType: 'case', entityId: 'case-001', title: 'Suspicious lateral movement detected', snippet: 'Case created from drift detection engine — lateral movement between subnet A and subnet B...', relevanceScore: 0.95, route: '/cases/case-001', tenantId: 'tenant-seiertech-01', lastUpdated: '2025-01-15T10:00:00Z' },
  { entityType: 'asset', entityId: 'asset-003', title: 'SRV-PROD-DB-01', snippet: 'Production database server — PostgreSQL 15.2, criticality 5, EDR coverage active...', relevanceScore: 0.88, route: '/assets', tenantId: 'tenant-seiertech-01', lastUpdated: '2025-01-14T18:00:00Z' },
  { entityType: 'identity', entityId: 'identity-002', title: 'svc-backup-admin', snippet: 'Service account — elevated privileges, last accessed 2 hours ago, risk factor: dormant privilege...', relevanceScore: 0.82, route: '/identity', tenantId: 'tenant-seiertech-01', lastUpdated: '2025-01-15T08:00:00Z' },
  { entityType: 'vulnerability-intelligence-record', entityId: 'vuln-001', title: 'CVE-2024-3094 (XZ Utils)', snippet: 'Critical supply chain compromise — CVSS 10.0, KEV listed, affects liblzma 5.6.0/5.6.1...', relevanceScore: 0.79, route: '/vulnerabilities', tenantId: 'tenant-seiertech-01', lastUpdated: '2025-01-13T12:00:00Z' },
  { entityType: 'strategy-policy', entityId: 'strat-001', title: 'Prioritisation Weight Policy v2.1', snippet: 'Active strategy policy — governs case priority calculation weights across all case types...', relevanceScore: 0.71, route: '/strategy/centre', tenantId: 'tenant-seiertech-01', lastUpdated: '2025-01-12T09:00:00Z' },
  { entityType: 'connector', entityId: 'conn-001', title: 'CrowdStrike Falcon (Mock)', snippet: 'Class A SOC Telemetry connector — state: active, tier: mock, last run 4h ago...', relevanceScore: 0.65, route: '/tool-health/connectors', tenantId: 'tenant-seiertech-01', lastUpdated: '2025-01-15T06:00:00Z' },
];

const ENTITY_TYPE_LABELS: Record<string, string> = {
  'case': 'Cases',
  'risk-object': 'Risk Objects',
  'asset': 'Assets',
  'identity': 'Identities',
  'vulnerability-intelligence-record': 'Vulnerabilities',
  'indicator-of-compromise': 'IOCs',
  'connector': 'Connectors',
  'strategy-policy': 'Strategy Policies',
  'control-framework': 'Control Frameworks',
  'architecture-component': 'Architecture',
  'direction-board': 'Direction Boards',
  'audit-event': 'Audit Events',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const config = seedSearchConfigs[0];

  const handleSearch = () => {
    if (query.trim().length < 2) {
      setResults([]);
      setHasSearched(true);
      return;
    }

    // Plan the query for RBAC/audit awareness
    const plan = planQuery({ query, tenantId: 'tenant-seiertech-01', userRole: 'SOM' });

    // In Phase 1 we use mock results filtered by query relevance
    const filtered = MOCK_RESULTS.filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.snippet.toLowerCase().includes(query.toLowerCase()) ||
        r.entityType.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
    setHasSearched(true);

    // If audit required, log (in production this calls auditSensitiveSearch)
    if (plan.auditRequired) {
      // eslint-disable-next-line no-console
      console.log('[AUDIT] Sensitive search query:', query, 'fields:', plan.sensitiveFieldsAccessed);
    }
  };

  // Group results by entity type
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.entityType]) acc[r.entityType] = [];
    acc[r.entityType].push(r);
    return acc;
  }, {});

  return (
    <PageContainer
      pretitle="Platform"
      title="Universal Search"
      headerActions={
        <span className="badge bg-blue-lt">
          {config.entityTypes.length} entity types indexed
        </span>
      }
    >
      {/* Search Input */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search across all governed entities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                aria-label="Search query"
              />
            </div>
            <div className="col-auto">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSearch}
                disabled={query.trim().length < 2}
              >
                Search
              </button>
            </div>
          </div>
          <div className="text-muted mt-2" style={{ fontSize: primitiveTypeScale.caption }}>
            Tenant-scoped • RBAC-filtered • Audit-logged for sensitive queries
          </div>
        </div>
      </div>

      {/* Results */}
      {hasSearched && results.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-4">
            <div className="text-muted">
              {query.trim().length < 2
                ? 'Enter at least 2 characters to search.'
                : `No results found for "${query}".`}
            </div>
          </div>
        </div>
      )}

      {Object.entries(groupedResults).map(([entityType, items]) => (
        <div className="card mb-3" key={entityType}>
          <div className="card-header">
            <h3 className="card-title">
              {ENTITY_TYPE_LABELS[entityType] ?? entityType}
              <span className="badge bg-secondary ms-2">{items.length}</span>
            </h3>
          </div>
          <div className="card-body p-0">
            <div className="list-group list-group-flush">
              {items.map((r) => (
                <a
                  key={r.entityId}
                  href={r.route}
                  className="list-group-item list-group-item-action"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>
                        {r.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                        {r.snippet}
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-azure-lt">{Math.round(r.relevanceScore * 100)}%</span>
                      <div className="text-muted mt-1" style={{ fontSize: primitiveTypeScale.caption }}>
                        {new Date(r.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Index Configuration Summary */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title">Index Configuration</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <dl className="row mb-0">
                <dt className="col-5">Index ID</dt>
                <dd className="col-7 text-muted">{config.indexId}</dd>
                <dt className="col-5">Tenant Scoped</dt>
                <dd className="col-7">{config.tenantScoped ? <span className="badge bg-green-lt">Yes</span> : <span className="badge bg-red-lt">No</span>}</dd>
                <dt className="col-5">RBAC Filtered</dt>
                <dd className="col-7">{config.rbacFiltered ? <span className="badge bg-green-lt">Yes</span> : <span className="badge bg-red-lt">No</span>}</dd>
                <dt className="col-5">Audit Enabled</dt>
                <dd className="col-7">{config.auditEnabled ? <span className="badge bg-green-lt">Yes</span> : <span className="badge bg-red-lt">No</span>}</dd>
              </dl>
            </div>
            <div className="col-md-6">
              <dl className="row mb-0">
                <dt className="col-5">Entity Types</dt>
                <dd className="col-7 text-muted">{config.entityTypes.length} types</dd>
                <dt className="col-5">Sensitive Fields</dt>
                <dd className="col-7 text-muted">{config.sensitiveFields.length} fields</dd>
                <dt className="col-5">Last Reindexed</dt>
                <dd className="col-7 text-muted">{new Date(config.lastReindexedAt).toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* AI-PLACEMENT: AICAP — Search intent disambiguation */}
      {/* AI-PLACEMENT: AICAP — Search results enrichment with context */}
    </PageContainer>
  );
}
