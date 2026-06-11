'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal, primitiveData,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisPostureAccountability, thesisPostures, thesisAssets, thesisPostureMetrics } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Posture — Accountability
 *
 * Standard: NIST CSF 2.0 + Commander Dual-Model Posture (DEC-spec39)
 * Data: thesisPostureAccountability, thesisPostures, thesisAssets, thesisPostureMetrics
 * Route: /posture/accountability | Nav Group: Mission & Strategy | Status: BUILD
 *
 * Temporal accountability: PRE_WARNED vs NOVEL vs PROTECTED classification.
 * Shows ownership, overdue tracking, and posture score distribution.
 */

{/* AI-PLACEMENT: AICAP-POSTURE-001 — Commander AI posture accountability guidance */}

export default function PostureAccountabilityPage() {
  const { tokens } = useMode();

  const preWarned = thesisPostureAccountability.filter((p) => p.classification === 'PRE_WARNED').length;
  const novel = thesisPostureAccountability.filter((p) => p.classification === 'NOVEL').length;
  const protected_ = thesisPostureAccountability.filter((p) => p.classification === 'PROTECTED').length;
  const totalAccountability = thesisPostureAccountability.length;

  const avgPostureScore = thesisPostures.length > 0
    ? Math.round(thesisPostures.reduce((a, p) => a + p.posture_score, 0) / thesisPostures.length)
    : 0;
  const healthyPostures = thesisPostures.filter((p) => p.posture_status === 'healthy').length;
  const degradedPostures = thesisPostures.filter((p) => p.posture_status === 'degraded').length;
  const criticalPostures = thesisPostures.filter((p) => p.posture_status === 'critical').length;

  return (
    <PageContainer pretitle="Posture › Accountability" title="Posture Accountability (NIST CSF 2.0)">
      {/* Accountability Classification */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Entities" value={String(totalAccountability)} />
        <KpiCard tokens={tokens} label="PRE_WARNED" value={String(preWarned)} accent={preWarned > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="NOVEL" value={String(novel)} accent={novel > 0 ? primitiveSignal.info : undefined} />
        <KpiCard tokens={tokens} label="PROTECTED" value={String(protected_)} accent={primitiveSignal.success} />
      </section>

      {/* Posture Health */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Avg Posture Score" value={`${avgPostureScore}/100`} accent={avgPostureScore < 50 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Healthy" value={String(healthyPostures)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Degraded" value={String(degradedPostures)} accent={degradedPostures > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Critical" value={String(criticalPostures)} accent={criticalPostures > 0 ? primitiveSignal.critical : undefined} />
      </section>

      {/* Accountability Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Accountability Register</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Entity Ref', 'Type', 'Classification', 'Previous', 'Classified By', 'Reason'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisPostureAccountability.map((p) => {
                const classColor = p.classification === 'PRE_WARNED' ? primitiveSignal.warning : p.classification === 'NOVEL' ? primitiveSignal.info : primitiveSignal.success;
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{p.entity_ref.slice(0, 16)}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{p.accountableEntityType}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: classColor }}>{p.classification}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{p.previousClassification ?? '—'}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{p.classified_by}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.reason}>{p.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Posture Score Detail */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Asset Posture Scores</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Asset', 'Status', 'Score', 'Patch', 'Vuln Exposure', 'Monitoring', 'Recovery'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisPostures.map((p) => {
                const sc = p.posture_status === 'healthy' ? primitiveSignal.success : p.posture_status === 'degraded' ? primitiveSignal.warning : primitiveSignal.critical;
                return (
                  <tr key={p.posture_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{p.asset_id.slice(0, 12)}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: sc }}>{p.posture_status}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold }}>{p.posture_score}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{p.patch_status}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: p.vulnerability_exposure === 'high' ? primitiveSignal.critical : tokens.text.secondary }}>{p.vulnerability_exposure}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{p.monitoring_coverage}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: p.recovery_readiness === 'not_ready' ? primitiveSignal.warning : tokens.text.secondary }}>{p.recovery_readiness}</td>
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
