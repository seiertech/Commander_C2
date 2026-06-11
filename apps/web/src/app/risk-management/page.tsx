'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../packages/ui/src/tokens/primitives';
import { thesisRiskObjects, thesisRiskScores, thesisAssets, thesisCases, thesisStrategies } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Risk Management — Console
 *
 * Standard: ISO 27005 (Risk Assessment & Treatment)
 * Data: thesisRiskObjects (register), thesisRiskScores (scoring engine),
 *       thesisAssets (affected), thesisCases (linked), thesisStrategies (treatment alignment)
 * Route: /risk-management | Nav Group: Risk Management | Status: BUILD
 *
 * Full risk register with treatment state, linked entities, and scoring.
 */

{/* AI-PLACEMENT: AICAP-RISK-001 — Commander AI risk prioritisation recommendation */}

export default function RiskManagementPage() {
  const { tokens } = useMode();

  const openRisks = thesisRiskObjects.filter((r) => r.treatment_state === 'open').length;
  const mitigatedRisks = thesisRiskObjects.filter((r) => r.treatment_state === 'mitigated' || r.treatment_state === 'closed').length;
  const totalRiskObjects = thesisRiskObjects.length;
  const avgRiskScore = thesisRiskScores.length > 0
    ? Math.round(thesisRiskScores.reduce((a, s) => a + s.risk_score, 0) / thesisRiskScores.length)
    : 0;
  const linkedStrategies = thesisStrategies.length;
  const linkedCases = thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').length;

  return (
    <PageContainer pretitle="Risk Management" title="Risk Register (ISO 27005)">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Risk Objects" value={String(totalRiskObjects)} />
        <KpiCard tokens={tokens} label="Open" value={String(openRisks)} accent={openRisks > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Mitigated/Closed" value={String(mitigatedRisks)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Avg Risk Score" value={String(avgRiskScore)} accent={avgRiskScore > 70 ? primitiveSignal.critical : avgRiskScore > 40 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Linked Strategies" value={String(linkedStrategies)} />
        <KpiCard tokens={tokens} label="High-Priority Cases" value={String(linkedCases)} accent={linkedCases > 0 ? primitiveSignal.warning : undefined} />
      </section>

      {/* Risk Register Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Risk Register</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Type', 'Affected Entity', 'Treatment', 'Owner', 'First Detected', 'Justification'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisRiskObjects.map((r) => {
                const stateColor = r.treatment_state === 'open' ? primitiveSignal.warning : r.treatment_state === 'mitigated' ? primitiveSignal.success : primitiveSignal.neutral;
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{r.type.replace(/_/g, ' ')}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{r.affected_entity_type}:{r.affected_entity_id.slice(0, 12)}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: stateColor }}>{r.treatment_state}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.owner}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(r.first_detected_at).toLocaleDateString()}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.justification}>{r.justification}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Scores */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Risk Scoring Engine Output</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Entity Type', 'Entity Ref', 'Score', 'Top Factor', 'Contribution'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisRiskScores.map((s) => {
                const topFactor = s.factors.sort((a, b) => b.contribution - a.contribution)[0];
                const scoreColor = s.risk_score > 70 ? primitiveSignal.critical : s.risk_score > 40 ? primitiveSignal.warning : primitiveSignal.success;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{s.scoredEntityType}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{s.scoredEntityRef.slice(0, 20)}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: scoreColor }}>{s.risk_score}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{topFactor?.name ?? '—'}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{topFactor?.contribution ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
