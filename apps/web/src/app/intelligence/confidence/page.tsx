'use client';

import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal, primitiveData,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisIntelligenceAssessments, thesisSignals, thesisCases, thesisRiskScores, thesisAssets, thesisRiskObjects, thesisConnectors, thesisExposures, thesisPostures, thesisStrategies, thesisMissions, thesisBlastRadius, thesisActions, thesisIdentities, thesisEvents, thesisIocs } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Intelligence — Confidence Console
 *
 * Standard: NATO/Admiralty Code (Source Reliability + Information Credibility)
 * Data: thesisIntelligenceAssessments, thesisSignals
 * Route: /intelligence/confidence | Nav Group: Intelligence | Status: BUILD
 *
 * Full Admiralty grading matrix: A-F reliability × 1-6 credibility.
 * Shows combined ratings, distribution, and linked signals.
 */

{/* AI-PLACEMENT: AICAP-CONFIDENCE-001 — Commander AI confidence-weighted prioritisation */}

export default function IntelligenceConfidencePage() {
  const { mode, tokens } = useMode();

  const totalAssessments = thesisIntelligenceAssessments.length;
  const highReliability = thesisIntelligenceAssessments.filter((a) => a.source_reliability === 'A' || a.source_reliability === 'B').length;
  const highCredibility = thesisIntelligenceAssessments.filter((a) => a.information_credibility <= 2).length;
  const systemGraded = thesisIntelligenceAssessments.filter((a) => a.graded_by === 'system').length;

  // Reliability distribution
  const reliabilityDist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  thesisIntelligenceAssessments.forEach((a) => { if (reliabilityDist[a.source_reliability] !== undefined) reliabilityDist[a.source_reliability]++; });

  return (
    <PageContainer pretitle="Intelligence › Confidence" title="Confidence Console (NATO/Admiralty)">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Assessments" value={String(totalAssessments)} />
        <KpiCard tokens={tokens} label="High Reliability (A/B)" value={String(highReliability)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="High Credibility (1-2)" value={String(highCredibility)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="System Graded" value={String(systemGraded)} />
      </section>

      {/* Reliability Distribution */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Source Reliability Distribution</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: primitiveSpacing[3] }}>
          {Object.entries(reliabilityDist).map(([grade, count], i) => {
            const color = grade <= 'B' ? primitiveSignal.success : grade <= 'D' ? primitiveSignal.warning : primitiveSignal.critical;
            return (
              <div key={grade} style={{ textAlign: 'center', padding: primitiveSpacing[3], background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, borderTop: `3px solid ${color}` }}>
                <span style={{ display: 'block', fontSize: primitiveTypeScale.h3, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{grade}</span>
                <span style={{ display: 'block', fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, color }}>{count}</span>
                <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{grade === 'A' ? 'Reliable' : grade === 'B' ? 'Usually Reliable' : grade === 'C' ? 'Fairly Reliable' : grade === 'D' ? 'Not Usually Reliable' : grade === 'E' ? 'Unreliable' : 'Cannot Be Judged'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assessment Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Intelligence Assessments</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['ID', 'Signal', 'Reliability', 'Credibility', 'Combined', 'Graded By', 'Time'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisIntelligenceAssessments.map((a) => {
                const relColor = a.source_reliability <= 'B' ? primitiveSignal.success : a.source_reliability <= 'D' ? primitiveSignal.warning : primitiveSignal.critical;
                return (
                  <tr key={a.intelligence_assessment_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{a.intelligence_assessment_id}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{a.signal_id}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: relColor }}>{a.source_reliability}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{a.information_credibility}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontWeight: primitiveFontWeight.bold, fontFamily: primitiveFonts.mono }}>{a.combined_rating}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{a.graded_by}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(a.graded_time).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* Cross-Entity Relationship Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
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
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Scores</h4>
          {thesisRiskScores.slice(0,4).map((s) => (
            <div key={s.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{s.scoredEntityRef.slice(0,16)}</span>
              <span style={{ padding: '1px 6px', color: '#fff', background: s.risk_score > 70 ? primitiveSignal.critical : s.risk_score > 40 ? primitiveSignal.warning : primitiveSignal.success }}>{s.risk_score}</span>
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
