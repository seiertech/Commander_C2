'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisAssets, thesisRiskObjects } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * SOM — Architecture Manager
 * Data: asset.ts + risk-object.ts (configuration_drift)
 * Route: /som/architecture | Nav Group: SOM
 */
export default function SomArchitecturePage() {
  const configDrift = thesisRiskObjects.filter((r) => r.type === 'configuration_drift');
  const networkPositions = thesisAssets.reduce((acc, a) => { const pos = a.networkPosition || 'unknown'; acc[pos] = (acc[pos] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <PageContainer pretitle="SOM › Architecture Manager" title="Architecture Manager" headerActions={<span className="badge bg-blue-lt">{thesisAssets.length} assets</span>}>
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Config Drift Findings</div><div className="h1 mb-0" style={{ color: primitiveSignal.warning }}>{configDrift.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Internet-Facing</div><div className="h1 mb-0">{networkPositions['internet-facing'] || 0}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Internal</div><div className="h1 mb-0">{networkPositions['internal'] || 0}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">DMZ</div><div className="h1 mb-0">{networkPositions['dmz'] || 0}</div></div></div></div>
      </div>
      <div className="card mb-3">
        <div className="card-header"><h3 className="card-title">Configuration Drift</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Finding</th><th>Affected</th><th>Treatment</th></tr></thead>
              <tbody>
                {configDrift.map((r) => (
                  <tr key={r.id}><td style={{ fontSize: primitiveTypeScale.body }}>{r.justification}</td><td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{r.affectedEntityId}</td><td><span className={`badge ${r.treatmentState === 'open' ? 'bg-red-lt' : 'bg-green-lt'}`}>{r.treatmentState}</span></td></tr>
                ))}
                {configDrift.length === 0 && <tr><td colSpan={3} className="text-muted text-center">No configuration drift in seed data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="card"><div className="card-body"><p className="text-muted mb-0">Architecture Topology — entity not yet built. Requires: architecture-topology entity with dependency graph and trust boundaries.</p></div></div>
    </PageContainer>
  );
}
