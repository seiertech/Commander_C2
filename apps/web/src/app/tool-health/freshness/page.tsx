'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal, primitiveSpacing, primitiveLetterSpacing, primitiveFontWeight } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors, thesisSystemPulse, thesisCases, thesisBlastRadius, thesisRiskObjects, thesisExposures, thesisPostures, thesisStrategies, thesisActions, thesisIdentities } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { useMode } from '@/context/mode-context';

/**
 * Tool Health — Source Freshness
 *
 * Data: connector.ts (lastRunAt) + seed-connectors
 * Route: /tool-health/freshness | Nav Group: Tool Health
 */

export default function ToolHealthFreshnessPage() {
  const { mode, tokens } = useMode();
  const systempulseCount = thesisSystemPulse?.length ?? 0;

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
