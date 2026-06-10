'use client';

import { PageContainer } from '@/components/page-container';
import { seedConnectors } from '../../../../../../packages/contracts/src/fixtures/seed-connectors';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Tool Health — Source Freshness
 *
 * Data: connector.ts (lastRunAt) + seed-connectors
 * Route: /tool-health/freshness | Nav Group: Tool Health
 */

export default function ToolHealthFreshnessPage() {
  const now = new Date('2026-01-18T12:00:00.000Z').getTime();
  const sorted = [...seedConnectors].sort((a, b) => {
    const aTime = a.lastRunAt ? new Date(a.lastRunAt).getTime() : 0;
    const bTime = b.lastRunAt ? new Date(b.lastRunAt).getTime() : 0;
    return aTime - bTime; // oldest first (least fresh)
  });

  return (
    <PageContainer pretitle="Tool Health › Source Freshness" title="Source Freshness" headerActions={<span className="badge bg-blue-lt">{seedConnectors.length} sources</span>}>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Freshness by Last Run</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Connector</th><th>Last Run</th><th>Age (hours)</th><th>Freshness</th></tr></thead>
              <tbody>
                {sorted.map((c) => {
                  const lastRun = c.lastRunAt ? new Date(c.lastRunAt).getTime() : 0;
                  const ageHours = lastRun ? Math.round((now - lastRun) / (1000 * 60 * 60)) : 999;
                  const freshness = ageHours <= 4 ? 'Fresh' : ageHours <= 24 ? 'Acceptable' : 'Stale';
                  const color = ageHours <= 4 ? '#2fb344' : ageHours <= 24 ? primitiveSignal.warning : primitiveSignal.critical;
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{c.name}</td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.lastRunAt ? new Date(c.lastRunAt).toLocaleString() : 'Never'}</td>
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
    </PageContainer>
  );
}
