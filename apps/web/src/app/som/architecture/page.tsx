'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisAssets, thesisRiskObjects, thesisArchitectureIntelligence, thesisCases, thesisBlastRadius, thesisExposures, thesisPostures, thesisConnectors, thesisStrategies, thesisMissions, thesisActions } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * SOM — Architecture Manager
 * Data: asset.ts + risk-object.ts (configuration_drift)
 * Route: /som/architecture | Nav Group: SOM
 */
export default function SomArchitecturePage() {
  const configDrift = thesisRiskObjects.filter((r) => r.type === 'configuration_drift');
  const networkPositions = thesisAssets.reduce((acc, a) => { const pos = a.network_position || 'unknown'; acc[pos] = (acc[pos] || 0) + 1; return acc; }, {} as Record<string, number>);

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
                  <tr key={r.id}><td style={{ fontSize: primitiveTypeScale.body }}>{r.justification}</td><td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{r.affected_entity_id}</td><td><span className={`badge ${r.treatment_state === 'open' ? 'bg-red-lt' : 'bg-green-lt'}`}>{r.treatment_state}</span></td></tr>
                ))}
                {configDrift.length === 0 && <tr><td colSpan={3} className="text-muted text-center">No configuration drift in seed data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="card"><div className="card-body"><p className="text-muted mb-0">Architecture Topology — entity not yet built. Requires: architecture-topology entity with dependency graph and trust boundaries.</p></div></div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{architectureintelligenceCount} Architecture Intelligence</span>
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
