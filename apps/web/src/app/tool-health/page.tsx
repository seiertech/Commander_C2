'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors, thesisSystemPulse } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

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
  const healthy = connectors.filter((c) => c.last_run_status === 'success').length;

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
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.source_type}</td>
                    <td><span className="badge bg-secondary">{c.tier}</span></td>
                    <td><span className={`badge ${c.state === 'active' ? 'bg-green-lt' : c.state === 'error' ? 'bg-red-lt' : 'bg-secondary'}`}>{c.state}</span></td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.last_run_at ? new Date(c.last_run_at).toLocaleString() : 'Never'}</td>
                    <td><span className={`badge ${c.last_run_status === 'success' ? 'bg-green-lt' : c.last_run_status === 'failed' ? 'bg-red-lt' : 'bg-secondary'}`}>{c.last_run_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{systempulseCount} System Pulse</span>
        </div>
      </section>
    </PageContainer>
  );
}
