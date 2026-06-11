'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal, primitiveData,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisSignals, thesisEventIntelligence, thesisConnectors, thesisRiskScores, thesisCases, thesisAssets, thesisBlastRadius } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Intelligence — Signal Pipeline
 *
 * Standard: OCSF 1.3 (Open Cybersecurity Schema Framework)
 * Data: thesisSignals (L3 normalised), thesisEventIntelligence (enriched),
 *       thesisConnectors (source pipeline)
 * Route: /intelligence/signals | Nav Group: Intelligence | Status: BUILD
 *
 * Shows OCSF class distribution, signal volume, severity breakdown.
 */

{/* AI-PLACEMENT: AICAP-SIGNAL-001 — Commander AI signal triage prioritisation */}

export default function IntelligenceSignalsPage() {
  const { tokens } = useMode();

  const totalSignals = thesisSignals.length;
  const criticalSignals = thesisSignals.filter((s) => s.severity >= 4).length;
  const enrichedSignals = thesisEventIntelligence.length;
  const activeSourcePipelines = thesisConnectors.filter((c) => c.state === 'active').length;

  // OCSF class distribution
  const classDistribution: Record<string, number> = {};
  thesisSignals.forEach((s) => { classDistribution[s.ocsf_class] = (classDistribution[s.ocsf_class] || 0) + 1; });

  return (
    <PageContainer pretitle="Intelligence › Signals" title="Signal Pipeline (OCSF 1.3)">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Signals" value={String(totalSignals)} />
        <KpiCard tokens={tokens} label="Critical (4+)" value={String(criticalSignals)} accent={criticalSignals > 0 ? primitiveSignal.critical : undefined} />
        <KpiCard tokens={tokens} label="Enriched Signals" value={String(enrichedSignals)} />
        <KpiCard tokens={tokens} label="Active Pipelines" value={String(activeSourcePipelines)} accent={primitiveSignal.success} />
      </section>

      {/* OCSF Class Distribution */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>OCSF Class Distribution</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: primitiveSpacing[3] }}>
          {Object.entries(classDistribution).map(([cls, count], i) => (
            <div key={cls} style={{ padding: primitiveSpacing[3], background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, borderLeft: `3px solid ${primitiveData[i % primitiveData.length]}` }}>
              <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{cls}</span>
              <span style={{ fontSize: primitiveTypeScale.h4, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Recent Signals</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Signal ID', 'Source', 'OCSF Class', 'Type', 'Severity', 'Observed'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisSignals.map((s) => {
                const sevColor = s.severity >= 4 ? primitiveSignal.critical : s.severity >= 3 ? primitiveSignal.warning : primitiveSignal.neutral;
                return (
                  <tr key={s.signal_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{s.signal_id}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{s.source_system}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{s.ocsf_class}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{s.signal_type}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: sevColor }}>{s.severity}/5</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(s.time_observed).toLocaleString()}</td>
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
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius Impact</h4>
          {thesisBlastRadius.slice(0,3).map((b) => (
            <div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span>
              <span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} pts → {b.affected_entities.length} entities</span>
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
