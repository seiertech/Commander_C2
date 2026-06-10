'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Tool Health — Overview
 *
 * Source: Thesis (Team 2, BLOCKED) — rendered from available connector data
 * Data: connector.ts (state, lastRunStatus) + seed-connectors
 * Route: /tool-health | Nav Group: Tool Health
 */

export default function ToolHealthPage() {
  const connectors = thesisConnectors;
  const active = connectors.filter((c) => c.state === 'active').length;
  const errored = connectors.filter((c) => c.state === 'error').length;
  const healthy = connectors.filter((c) => c.lastRunStatus === 'success').length;

  return (
    <PageContainer pretitle="Tool Health" title="Tool Health Overview" headerActions={<span className="badge bg-blue-lt">{connectors.length} sources</span>}>
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Active</div><div className="h1 mb-0" style={{ color: '#2fb344' }}>{active}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Error</div><div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{errored}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Last Run OK</div><div className="h1 mb-0">{healthy}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Total Connectors</div><div className="h1 mb-0">{connectors.length}</div></div></div></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Source Health Summary</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Connector</th><th>Classes</th><th>Source Type</th><th>Tier</th><th>State</th><th>Last Run</th><th>Status</th></tr></thead>
              <tbody>
                {connectors.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{c.name}</td>
                    <td>{c.classes.map((cls) => <span key={cls} className="badge bg-blue-lt me-1">{cls}</span>)}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.sourceType}</td>
                    <td><span className="badge bg-secondary">{c.tier}</span></td>
                    <td><span className={`badge ${c.state === 'active' ? 'bg-green-lt' : c.state === 'error' ? 'bg-red-lt' : 'bg-secondary'}`}>{c.state}</span></td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.lastRunAt ? new Date(c.lastRunAt).toLocaleString() : 'Never'}</td>
                    <td><span className={`badge ${c.lastRunStatus === 'success' ? 'bg-green-lt' : c.lastRunStatus === 'failed' ? 'bg-red-lt' : 'bg-secondary'}`}>{c.lastRunStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
