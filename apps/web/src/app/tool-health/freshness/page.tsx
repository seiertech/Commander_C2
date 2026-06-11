'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors, thesisSystemPulse, thesisCases, thesisBlastRadius, thesisRiskObjects, thesisExposures, thesisPostures } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Tool Health — Source Freshness
 *
 * Data: connector.ts (lastRunAt) + seed-connectors
 * Route: /tool-health/freshness | Nav Group: Tool Health
 */

export default function ToolHealthFreshnessPage() {
  const now = new Date('2026-01-18T12:00:00.000Z').getTime();
  const sorted = [...thesisConnectors].sort((a, b) => {
    const aTime = a.last_run_at ? new Date(a.last_run_at).getTime() : 0;
    const bTime = b.last_run_at ? new Date(b.last_run_at).getTime() : 0;
    return aTime - bTime; // oldest first (least fresh)
  });

  return (
    <PageContainer pretitle="Tool Health › Source Freshness" title="Source Freshness" headerActions={<span className="badge bg-blue-lt">{thesisConnectors.length} sources</span>}>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Freshness by Last Run</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Connector</th><th>Last Run</th><th>Age (hours)</th><th>Freshness</th></tr></thead>
              <tbody>
                {sorted.map((c) => {
                  const lastRun = c.last_run_at ? new Date(c.last_run_at).getTime() : 0;
                  const ageHours = lastRun ? Math.round((now - lastRun) / (1000 * 60 * 60)) : 999;
                  const freshness = ageHours <= 4 ? 'Fresh' : ageHours <= 24 ? 'Acceptable' : 'Stale';
                  const color = ageHours <= 4 ? '#2fb344' : ageHours <= 24 ? primitiveSignal.warning : primitiveSignal.critical;
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{c.name}</td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.last_run_at ? new Date(c.last_run_at).toLocaleString() : 'Never'}</td>
                      <td style={{ color }}>{ageHours}h</td>
                      <td><span className={`badge ${freshness === 'Fresh' ? 'bg-green-lt' : freshness === 'Acceptable' ? 'bg-yellow-lt' : 'bg-red-lt'}`}>{freshness}</span></td>
                    </tr>
                  );
                })}
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
