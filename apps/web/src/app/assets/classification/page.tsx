'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisAssets } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Assets — Classification View
 *
 * Source: Thesis (Asset Intelligence Surface)
 * Data: asset.ts (classification, assetDataClassification) + seed-assets
 * Route: /assets/classification | Nav Group: Assets
 *
 * Displays: assets grouped by classification type and data classification.
 */

export default function AssetsClassificationPage() {
  const { tokens } = useMode();

  // Group by asset classification
  const classMap = new Map<string, typeof thesisAssets>();
  thesisAssets.forEach((a) => {
    const list = classMap.get(a.classification) || [];
    list.push(a);
    classMap.set(a.classification, list);
  });
  const classifications = [...classMap.entries()].sort((a, b) => b[1].length - a[1].length);

  // Group by data classification
  const dataClassMap = new Map<string, number>();
  thesisAssets.forEach((a) => {
    const dc = a.assetDataClassification || 'unclassified';
    dataClassMap.set(dc, (dataClassMap.get(dc) || 0) + 1);
  });

  return (
    <PageContainer
      pretitle="Identity & Asset Intelligence › Assets › Classification"
      title="Asset Classification"
      headerActions={<span className="badge bg-blue-lt">{classifications.length} types</span>}
    >
      {/* Data Classification Summary */}
      <div className="row row-deck row-cards mb-3">
        {[...dataClassMap.entries()].map(([dc, count]) => (
          <div key={dc} className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="subheader">{dc}</div>
                <div className="h1 mb-0">{count}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Classification Table */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Asset Type Distribution</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr><th>Classification</th><th>Count</th><th>Surface Split</th><th>Avg Criticality</th></tr>
              </thead>
              <tbody>
                {classifications.map(([cls, assets]) => {
                  const ext = assets.filter((a) => a.surfaceAttribution === 'external_attack_surface').length;
                  const int_ = assets.length - ext;
                  const avgCrit = (assets.reduce((s, a) => s + a.criticality, 0) / assets.length).toFixed(1);
                  return (
                    <tr key={cls}>
                      <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{cls}</td>
                      <td>{assets.length}</td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                        <span className="badge bg-azure-lt me-1">Ext {ext}</span>
                        <span className="badge bg-purple-lt">Int {int_}</span>
                      </td>
                      <td>{avgCrit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Asset List */}
      <div className="card mt-3">
        <div className="card-header"><h3 className="card-title">All Assets by Classification</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr><th>Name</th><th>Type</th><th>Data Class</th><th>Environment</th><th>Surface</th><th className="text-end">Criticality</th></tr>
              </thead>
              <tbody>
                {thesisAssets.map((a) => (
                  <tr key={a.id}>
                    <td><a href={`/assets?id=${a.id}`} style={{ color: tokens.action.primary, fontSize: primitiveTypeScale.body }}>{a.name}</a></td>
                    <td><span className="badge bg-secondary">{a.classification}</span></td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{a.assetDataClassification ?? 'unclassified'}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{a.environment}</td>
                    <td>
                      <span className={`badge ${a.surfaceAttribution === 'external_attack_surface' ? 'bg-azure-lt' : 'bg-purple-lt'}`}>
                        {a.surfaceAttribution === 'external_attack_surface' ? 'External' : 'Internal'}
                      </span>
                    </td>
                    <td className="text-end">{a.criticality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Placement */}
      {/* AI-PLACEMENT: AICAP-003 — Explain asset classification gaps and data handling risk */}
    </PageContainer>
  );
}
