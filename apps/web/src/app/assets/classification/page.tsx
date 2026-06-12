'use client';

import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSpacing, primitiveLetterSpacing, primitiveFontWeight, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisAssets, thesisRiskScores, thesisBlastRadius, thesisCases, thesisPostures, thesisExposures, thesisStrategies, thesisConnectors, thesisRiskObjects, thesisMissions, thesisActions, thesisIdentities, thesisEvents, thesisSignals, thesisIocs } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';

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
  const { mode, tokens } = useMode();

  // Group by asset classification
  const classMap = new Map<string, typeof thesisAssets>();
  thesisAssets.forEach((a) => {
    const list = classMap.get(a.asset_class) || [];
    list.push(a);
    classMap.set(a.asset_class, list);
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
                  const ext = assets.filter((a) => a.surface_attribution === 'external_attack_surface').length;
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
                  <tr key={a.asset_id}>
                    <td><a href={`/assets?id=${a.asset_id}`} style={{ color: tokens.action.primary, fontSize: primitiveTypeScale.body }}>{a.asset_name}</a></td>
                    <td><span className="badge bg-secondary">{a.asset_class}</span></td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{a.assetDataClassification ?? 'unclassified'}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{a.environment}</td>
                    <td>
                      <span className={`badge ${a.surface_attribution === 'external_attack_surface' ? 'bg-azure-lt' : 'bg-purple-lt'}`}>
                        {a.surface_attribution === 'external_attack_surface' ? 'External' : 'Internal'}
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
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{riskscoresCount} Risk Scores</span>
        </div>
      </section>
    
      {/* Engine Correlation Chart — Sweep 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Distribution</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Open', 'Mitigated', 'Closed'], colors: [primitiveSignal.warning, primitiveSignal.success, primitiveSignal.neutral], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisRiskObjects.filter((r) => r.treatment_state === 'open').length, thesisRiskObjects.filter((r) => r.treatment_state === 'mitigated').length, thesisRiskObjects.filter((r) => r.treatment_state !== 'open' && r.treatment_state !== 'mitigated').length]} />
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Health</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Healthy', 'Degraded', 'Critical'], colors: [primitiveSignal.success, primitiveSignal.warning, primitiveSignal.critical], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisPostures.filter((p) => p.posture_status === 'healthy').length, thesisPostures.filter((p) => p.posture_status === 'degraded').length, thesisPostures.filter((p) => p.posture_status === 'critical').length]} />
        </div>
      </div>
    </PageContainer>
  );
}
