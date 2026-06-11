'use client';

import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisIocs, thesisSignals, thesisCases, thesisRiskObjects, thesisAssets, thesisBlastRadius, thesisConnectors, thesisExposures, thesisPostures, thesisStrategies } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Intelligence — IOC Lifecycle
 *
 * Standard: STIX (Structured Threat Information Expression)
 * Data: thesisIocs (indicator lifecycle), thesisSignals (linked detections)
 * Route: /intelligence/iocs | Nav Group: Intelligence | Status: BUILD
 *
 * Shows IOC categories, TLP markings, confidence levels, active/expired status.
 */

{/* AI-PLACEMENT: AICAP-IOC-001 — Commander AI IOC correlation and enrichment */}

export default function IntelligenceIocsPage() {
  const { mode, tokens } = useMode();

  const totalIocs = thesisIocs.length;
  const activeIocs = thesisIocs.filter((i) => i.active).length;
  const highConfidence = thesisIocs.filter((i) => i.confidence >= 80).length;
  const criticalSeverity = thesisIocs.filter((i) => i.severity >= 4).length;

  // Category distribution
  const categoryMap: Record<string, number> = {};
  thesisIocs.forEach((i) => { categoryMap[i.ioc_category] = (categoryMap[i.ioc_category] || 0) + 1; });
  const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <PageContainer pretitle="Intelligence › IOCs" title="IOC Lifecycle (STIX)">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total IOCs" value={String(totalIocs)} />
        <KpiCard tokens={tokens} label="Active" value={String(activeIocs)} accent={activeIocs > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="High Confidence" value={String(highConfidence)} />
        <KpiCard tokens={tokens} label="Critical Severity" value={String(criticalSeverity)} accent={criticalSeverity > 0 ? primitiveSignal.critical : undefined} />
      </section>

      {/* Category Breakdown */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>IOC Categories (Top 10)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: primitiveSpacing[3] }}>
          {topCategories.map(([cat, count]) => (
            <div key={cat} style={{ padding: primitiveSpacing[3], background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}` }}>
              <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{cat.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: primitiveTypeScale.h4, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* IOC Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Indicator Register</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Category', 'Value', 'Confidence', 'Severity', 'TLP', 'Active', 'First Seen'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisIocs.slice(0, 20).map((ioc) => (
                <tr key={ioc.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{ioc.ioc_category.replace(/_/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ioc.value}>{ioc.value}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{ioc.confidence}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: ioc.severity >= 4 ? primitiveSignal.critical : ioc.severity >= 3 ? primitiveSignal.warning : primitiveSignal.neutral }}>{ioc.severity}/5</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>{ioc.tlpMarking}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{ioc.active ? <span style={{ color: primitiveSignal.success }}>●</span> : <span style={{ color: tokens.text.muted }}>○</span>}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(ioc.first_seen_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* Cross-Entity Relationship Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius Impact</h4>
          {thesisBlastRadius.slice(0,3).map((b) => (
            <div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span>
              <span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} pts → {b.affected_entities.length} entities</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Objects</h4>
          {thesisRiskObjects.map((r) => (
            <div key={r.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ color: tokens.text.primary }}>{r.type.replace(/_/g, ' ')}</span>
              <span style={{ padding: '1px 6px', color: '#fff', background: r.treatment_state === 'open' ? primitiveSignal.warning : primitiveSignal.success }}>{r.treatment_state}</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Related Cases</h4>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (
            <div key={c.case_id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span>
              <span style={{ padding: '1px 6px', color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority} · {c.ooda_state}</span>
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

function KpiCard({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span>
    </div>
  );
}
