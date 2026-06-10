'use client';

import { PageContainer } from '@/components/page-container';
import { CONNECTOR_CLASS_LABELS } from '../../../../../../packages/contracts/src/entities/common';
import { primitiveTypeScale } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Tenant Admin — Connectors & Data Sources
 *
 * Data: connector.ts + seed-connectors
 * Route: /settings/connectors | Boundary: tenant-admin
 * Configuration surface: read-only display of connector state. Edit deferred to Phase 2.
 */

export default function SettingsConnectorsPage() {
  return (
    <PageContainer pretitle="Settings › Connectors & Data Sources" title="Connector Configuration">
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title">Registered Connectors</h3>
          <button className="btn btn-sm" disabled title="Not available in Phase 1">Edit — Phase 1 Read-Only</button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Connector</th><th>Classes</th><th>State</th><th>Tier</th><th>Last Run</th></tr></thead>
              <tbody>
                {thesisConnectors.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{c.name}</td>
                    <td>{c.classes.map((cls) => <span key={cls} className="badge bg-blue-lt me-1">{cls} — {CONNECTOR_CLASS_LABELS[cls]}</span>)}</td>
                    <td><span className={`badge ${c.state === 'active' ? 'bg-green-lt' : c.state === 'error' ? 'bg-red-lt' : 'bg-secondary'}`}>{c.state}</span></td>
                    <td><span className="badge bg-secondary">{c.tier}</span></td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.lastRunAt ? new Date(c.lastRunAt).toLocaleString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
        Connector management (add, remove, pause, credential rotation) is not available in Phase 1. Configuration is read-only.
      </div>
    </PageContainer>
  );
}
