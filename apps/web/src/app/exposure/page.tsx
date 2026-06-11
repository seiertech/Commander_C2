'use client';

import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisExposures, thesisExposureEngine, thesisAssets, thesisRiskObjects, thesisBlastRadius, thesisCases, thesisConnectors, thesisPostures, thesisStrategies, thesisMissions } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Exposure Management — Attack Surface
 * Data: Exposure from seed-exposures
 * Route: /exposure | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-EXPOSURE-001 — Commander AI attack surface risk correlation */}

export default function ExposurePage() {
  const { mode, tokens } = useMode();
  const external = thesisExposures.filter((e) => e.surface_type === 'external_attack_surface').length;
  const internal = thesisExposures.filter((e) => e.surface_type === 'internal_attack_surface').length;
  const open = thesisExposures.filter((e) => e.status === 'open').length;
  const totalGaps = thesisExposures.reduce((a, e) => a + e.coverage_gaps.length, 0);

  return (
    <PageContainer pretitle="Exposure Management" title="Attack Surface">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="External" value={String(external)} accent={primitiveSignal.warning} />
        <Kpi tokens={tokens} label="Internal" value={String(internal)} />
        <Kpi tokens={tokens} label="Open" value={String(open)} accent={open > 0 ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="Coverage Gaps" value={String(totalGaps)} accent={totalGaps > 0 ? primitiveSignal.warning : undefined} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Exposure Register</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Surface', 'Category', 'Severity', 'Status', 'Blast Zone', 'Vector', 'Gaps'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisExposures.map((e) => (
              <tr key={e.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, border: `1px solid ${e.surface_type === 'external_attack_surface' ? primitiveSignal.warning : tokens.border.subtle}`, color: e.surface_type === 'external_attack_surface' ? primitiveSignal.warning : tokens.text.muted }}>{e.surface_type === 'external_attack_surface' ? 'EXT' : 'INT'}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{e.category}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: e.severity <= 2 ? primitiveSignal.critical : tokens.text.secondary }}>{e.severity}/5</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: e.status === 'open' ? primitiveSignal.critical : e.status === 'monitoring' ? primitiveSignal.warning : primitiveSignal.success }}>{e.status}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>{e.blast_zone}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.exposure_vector}>{e.exposure_vector}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{e.coverage_gaps.length}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    

      {/* Cross-Entity: Exposure → Blast Radius */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginTop: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Blast Radius Impact ({thesisBlastRadius.length} computations)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Origin Entity', 'Type', 'Impact Score', 'Affected Count', 'Depth'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisBlastRadius.map((b) => (
              <tr key={b.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.primary }}>{b.originEntityRef}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{b.originEntityType}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{b.affected_entities.length}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{b.depth}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Cross-Entity: Linked Cases + Posture */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Related Cases ({thesisCases.filter((c) => c.ctem_phase === 'mobilization').length} in mobilisation)</h3>
          {thesisCases.filter((c) => c.ctem_phase === 'mobilization').slice(0, 5).map((c) => (
            <div key={c.case_id} style={{ padding: primitiveSpacing[2], borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span>
              <span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority}</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Exposure-Linked Posture ({thesisPostures.filter((p) => p.posture_status !== 'healthy').length} degraded/critical)</h3>
          {thesisPostures.filter((p) => p.posture_status !== 'healthy').map((p) => (
            <div key={p.posture_id} style={{ padding: primitiveSpacing[2], borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.primary }}>{p.asset_id.slice(0,12)}</span>
              <span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: p.posture_status === 'critical' ? primitiveSignal.critical : primitiveSignal.warning }}>{p.posture_status} ({p.posture_score})</span>
            </div>
          ))}
        </div>
      </div>
    
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

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
