'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisCisoSummary, thesisMissions, thesisPostureMetrics, thesisRiskObjects, thesisCases } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * CISO Dashboard — Executive Posture Summary
 * Data: CisoSummary from seed-ciso
 * Route: /ciso | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-CISO-001 — Commander AI executive briefing generation */}

export default function CisoDashboardPage() {
  const { tokens } = useMode();
  const s = thesisCisoSummary;
  const postureColor = s.posture.overall >= 80 ? primitiveSignal.success : s.posture.overall >= 60 ? primitiveSignal.warning : primitiveSignal.critical;
  const trendLabel = s.trend === 'improving' ? '↑ Improving' : s.trend === 'degrading' ? '↓ Degrading' : '→ Stable';

  return (
    <PageContainer pretitle="Executive" title="CISO Dashboard">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Posture Score" value={`${s.posture.overall}%`} accent={postureColor} />
        <Kpi tokens={tokens} label="Open Cases" value={String(s.case_summary.totalOpen)} accent={s.case_summary.p0Count > 0 ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="Risk Objects" value={String(s.risk_summary.open_count)} accent={s.risk_summary.critical > 0 ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="Trend" value={trendLabel} />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Card tokens={tokens} title="Risk Summary">
          <Row tokens={tokens} label="Critical" value={String(s.risk_summary.critical)} accent={primitiveSignal.critical} />
          <Row tokens={tokens} label="High" value={String(s.risk_summary.high)} accent={primitiveSignal.warning} />
          <Row tokens={tokens} label="Medium" value={String(s.risk_summary.medium)} />
          <Row tokens={tokens} label="Low" value={String(s.risk_summary.low)} />
        </Card>
        <Card tokens={tokens} title="Exposure">
          <Row tokens={tokens} label="External Surface" value={String(s.exposureSummary.externalSurfaceCount)} />
          <Row tokens={tokens} label="Internal Surface" value={String(s.exposureSummary.internalSurfaceCount)} />
          <Row tokens={tokens} label="Coverage Gaps" value={String(s.exposureSummary.totalGaps)} accent={primitiveSignal.warning} />
        </Card>
        <Card tokens={tokens} title="Controls">
          <Row tokens={tokens} label="Frameworks Active" value={String(s.controlSummary.frameworksActive)} />
          <Row tokens={tokens} label="Avg Adherence" value={`${s.controlSummary.avgAdherence}%`} />
          <Row tokens={tokens} label="Non-Adherent" value={String(s.controlSummary.nonAdherentCount)} accent={s.controlSummary.nonAdherentCount > 0 ? primitiveSignal.warning : undefined} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Card tokens={tokens} title="Cases">
          <Row tokens={tokens} label="Total Open" value={String(s.case_summary.totalOpen)} />
          <Row tokens={tokens} label="P0 (Critical)" value={String(s.case_summary.p0Count)} accent={s.case_summary.p0Count > 0 ? primitiveSignal.critical : undefined} />
          <Row tokens={tokens} label="Avg Age" value={`${s.case_summary.avgAge}d`} />
          <Row tokens={tokens} label="SLA Breach" value={String(s.case_summary.slaBreachCount)} accent={s.case_summary.slaBreachCount > 0 ? primitiveSignal.critical : undefined} />
        </Card>
        <Card tokens={tokens} title="Debt">
          <Row tokens={tokens} label="Total Items" value={String(s.debtSummary.totalItems)} />
          <Row tokens={tokens} label="Critical Age" value={`${s.debtSummary.criticalAge}d`} accent={primitiveSignal.warning} />
          <Row tokens={tokens} label="Avg Resolution" value={`${s.debtSummary.avgResolutionDays}d`} />
        </Card>
      </div>

      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Posture by Domain</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: primitiveSpacing[3] }}>
          {Object.entries(s.posture.byDomain).map(([domain, score]) => {
            const color = score >= 80 ? primitiveSignal.success : score >= 60 ? primitiveSignal.warning : primitiveSignal.critical;
            return (
              <div key={domain} style={{ textAlign: 'center', padding: primitiveSpacing[2], border: `1px solid ${tokens.border.subtle}` }}>
                <span style={{ display: 'block', fontSize: primitiveTypeScale.h3, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color }}>{score}%</span>
                <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'capitalize' }}>{domain}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Strategic Blockers</h3>
        <ul style={{ margin: 0, padding: `0 0 0 ${primitiveSpacing[4]}`, fontSize: primitiveTypeScale.caption, color: tokens.text.secondary }}>
          {s.strategicBlockers.map((b, i) => <li key={i} style={{ marginBottom: primitiveSpacing[2] }}>{b}</li>)}
        </ul>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{missionsCount} Missions</span>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{posturemetricsCount} Posture Metrics</span>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{riskobjectsCount} Risk Objects</span>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{casesCount} Cases</span>
        </div>
      </section>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}

function Card({ tokens, title, children }: { tokens: ReturnType<typeof useMode>['tokens']; title: string; children: React.ReactNode }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>{title}</h3>{children}</div>);
}

function Row({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ display: 'flex', justifyContent: 'space-between', padding: `${primitiveSpacing[1]} 0`, borderBottom: `1px solid ${tokens.border.subtle}` }}><span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary }}>{label}</span><span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.semibold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
