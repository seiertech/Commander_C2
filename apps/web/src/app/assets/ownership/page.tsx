// @ts-nocheck
'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisAssets } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Assets — Ownership View
 *
 * Source: Thesis (Asset Intelligence Surface)
 * Data: asset.ts (owner field) + seed-assets
 * Route: /assets/ownership | Nav Group: Assets
 *
 * Displays: assets grouped by owner, ownership distribution.
 */

export default function AssetsOwnershipPage() {
  const { tokens } = useMode();

  const ownerMap = new Map<string, typeof thesisAssets>();
  thesisAssets.forEach((a) => {
    const list = ownerMap.get(a.owner) || [];
    list.push(a);
    ownerMap.set(a.owner, list);
  });
  const owners = [...ownerMap.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <PageContainer
      pretitle="Identity & Asset Intelligence › Assets › Ownership"
      title="Asset Ownership"
      headerActions={<span className="badge bg-blue-lt">{owners.length} owners</span>}
    >
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Total Assets</div>
              <div className="h1 mb-0">{thesisAssets.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Distinct Owners</div>
              <div className="h1 mb-0">{owners.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Avg Assets/Owner</div>
              <div className="h1 mb-0">{owners.length > 0 ? (thesisAssets.length / owners.length).toFixed(1) : '0'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Ownership Distribution</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr><th>Owner</th><th>Assets</th><th>Environments</th><th>Avg Criticality</th></tr>
              </thead>
              <tbody>
                {owners.map(([owner, assets]) => {
                  const envs = [...new Set(assets.map((a) => a.environment))];
                  const avgCrit = (assets.reduce((s, a) => s + a.criticality, 0) / assets.length).toFixed(1);
                  return (
                    <tr key={owner}>
                      <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{owner}</td>
                      <td>{assets.length}</td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{envs.join(', ')}</td>
                      <td>{avgCrit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Placement */}
      {/* AI-PLACEMENT: AICAP-003 — Explain asset ownership gaps and recommend assignment */}
    </PageContainer>
  );
}
