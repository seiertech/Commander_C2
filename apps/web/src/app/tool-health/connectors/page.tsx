'use client';

import { PageContainer } from '@/components/page-container';
import { seedConnectors } from '../../../../../../packages/contracts/src/fixtures/seed-connectors';
import { CONNECTOR_CLASS_LABELS } from '../../../../../../packages/contracts/src/entities/common';
import { primitiveTypeScale } from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Tool Health — Connectors Detail
 *
 * Data: connector.ts + seed-connectors
 * Route: /tool-health/connectors | Nav Group: Tool Health
 */

export default function ToolHealthConnectorsPage() {
  return (
    <PageContainer pretitle="Tool Health › Connectors" title="Connector Health" headerActions={<span className="badge bg-blue-lt">{seedConnectors.length} connectors</span>}>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Connector Detail</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Connector</th><th>Classes</th><th>Tier</th><th>State</th><th>Mapping Pack</th><th>Last Run</th></tr></thead>
              <tbody>
                {seedConnectors.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{c.name}</td>
                    <td>{c.classes.map((cls) => <span key={cls} className="badge bg-blue-lt me-1" title={CONNECTOR_CLASS_LABELS[cls]}>{cls}</span>)}</td>
                    <td><span className="badge bg-secondary">{c.tier}</span></td>
                    <td><span className={`badge ${c.state === 'active' ? 'bg-green-lt' : c.state === 'error' ? 'bg-red-lt' : 'bg-secondary'}`}>{c.state}</span></td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.mappingPackVersion}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.lastRunAt ? new Date(c.lastRunAt).toLocaleString() : 'Never'}</td>
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
