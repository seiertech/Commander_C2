'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal, primitiveSpacing, primitiveLetterSpacing, primitiveFontWeight } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisRiskObjects, thesisCases, thesisRiskScores, thesisExposures, thesisBlastRadius, thesisPostures, thesisConnectors, thesisAssets, thesisStrategies, thesisActions, thesisIdentities } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { useMode } from '@/context/mode-context';

/**
 * SOM — Risk Manager
 * Data: risk-object.ts + case.ts
 * Route: /som/risk | Nav Group: SOM
 */
export default function SomRiskPage() {
  const { mode, tokens } = useMode();
  const exposuresCount = thesisExposures?.length ?? 0;
  const riskscoresCount = thesisRiskScores?.length ?? 0;

  const risks = thesisRiskObjects;
  const openRisks = risks.filter((r) => r.treatment_state === 'open');
  const typeBreakdown = risks.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const p0p1Cases = thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1');

  return (
    <PageContainer pretitle="SOM › Risk Manager" title="Risk Manager" headerActions={<span className="badge bg-orange-lt">{openRisks.length} open risks</span>}>
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Total Risk Objects</div><div className="h1 mb-0">{risks.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Open</div><div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{openRisks.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">P0/P1 Cases</div><div className="h1 mb-0" style={{ color: primitiveSignal.warning }}>{p0p1Cases.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Risk Types</div><div className="h1 mb-0">{Object.keys(typeBreakdown).length}</div></div></div></div>
      </div>
      <div className="card mb-3">
        <div className="card-header"><h3 className="card-title">Risk Type Distribution</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Type</th><th>Count</th><th>Open</th></tr></thead>
              <tbody>
                {Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                  <tr key={type}><td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{type}</td><td>{count}</td><td>{risks.filter((r) => r.type === type && r.treatment_state === 'open').length}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="card"><div className="card-body"><p className="text-muted mb-0">Risk Aggregation & Scoring — requires dedicated risk-manager aggregation entity with quantified risk model.</p></div></div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{riskscoresCount} Risk Scores</span>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{exposuresCount} Exposures</span>
        </div>
      </section>
    
      {/* Interactive Chart Section — Sweep 3 */}
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
