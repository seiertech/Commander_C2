'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisRiskObjects, thesisDecisionRecords, thesisStrategies, thesisActions, thesisBlastRadius, thesisExposures, thesisPostures, thesisConnectors, thesisCases } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Risk Management — Treatment Plans
 *
 * Standard: ISO 27005 §9 (Risk Treatment)
 * Data: thesisRiskObjects, thesisDecisionRecords, thesisStrategies, thesisActions
 * Route: /risk-management/treatment | Nav Group: Risk Management | Status: BUILD
 *
 * Treatment options: Accept, Mitigate, Transfer, Avoid.
 * Links risk objects → decisions → strategies → actions.
 */

{/* AI-PLACEMENT: AICAP-RISK-002 — Commander AI risk treatment recommendation */}

export default function RiskTreatmentPage() {
  const { tokens } = useMode();

  const openRisks = thesisRiskObjects.filter((r) => r.treatment_state === 'open');
  const mitigated = thesisRiskObjects.filter((r) => r.treatment_state === 'mitigated').length;
  const accepted = thesisRiskObjects.filter((r) => r.treatment_state === 'accepted').length;
  const totalDecisions = thesisDecisionRecords.length;
  const activeActions = thesisActions.filter((a) => a.status === 'in_progress' || a.status === 'pending').length;
  const completedActions = thesisActions.filter((a) => a.status === 'completed').length;

  return (
    <PageContainer pretitle="Risk Management › Treatment" title="Risk Treatment Plans (ISO 27005)">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Open Risks" value={String(openRisks.length)} accent={openRisks.length > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Mitigated" value={String(mitigated)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Accepted" value={String(accepted)} />
        <KpiCard tokens={tokens} label="Decisions Made" value={String(totalDecisions)} />
        <KpiCard tokens={tokens} label="Actions Active" value={String(activeActions)} accent={activeActions > 0 ? primitiveSignal.info : undefined} />
        <KpiCard tokens={tokens} label="Actions Completed" value={String(completedActions)} accent={primitiveSignal.success} />
      </section>

      {/* Treatment Pipeline */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Open Risks Requiring Treatment</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Risk Type', 'Affected Entity', 'Owner', 'Review Trigger', 'Detected'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {openRisks.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{r.type.replace(/_/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{r.affected_entity_type}:{r.affected_entity_id.slice(0, 12)}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.owner}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.expiry_or_review_trigger}>{r.expiry_or_review_trigger}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(r.first_detected_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {openRisks.length === 0 && (
                <tr><td colSpan={5} style={{ padding: primitiveSpacing[4], textAlign: 'center', color: tokens.text.muted }}>No open risks requiring treatment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Records */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Decision Records</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Decision Type', 'Entity', 'Outcome', 'Decided By', 'Rationale'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisDecisionRecords.map((d) => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{d.decisionType.replace(/_/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{d.entityRef.slice(0, 18)}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: d.outcome === 'approved' ? primitiveSignal.success : d.outcome === 'rejected' ? primitiveSignal.critical : primitiveSignal.neutral }}>{d.outcome}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{d.decidedBy}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.rationale}>{d.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy Alignment */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Strategy Alignment</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Strategy', 'Type', 'Status', 'Priority'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisStrategies.map((s) => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{s.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{s.strategy_type ?? '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: s.status === 'active' ? primitiveSignal.success : primitiveSignal.neutral }}>{s.status}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{s.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* Cross-Entity Governance Panel — Sweep 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius</h4>
          {thesisBlastRadius.map((b) => (<div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span><span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} → {b.affected_entities.length}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Linked Cases</h4>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (<div key={c.case_id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span><span style={{ padding: '1px 6px', color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority} · {c.ooda_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Overview</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Exposures ({thesisExposures.length})</h4>
          {thesisExposures.slice(0,3).map((e) => (<div key={e.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{e.exposure_type ?? e.surface ?? 'exposure'}</span><span style={{ color: e.severity === 'critical' ? primitiveSignal.critical : primitiveSignal.warning }}>{e.severity ?? 'medium'}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Data Sources</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisConnectors.filter((c) => c.state === 'active').length} active</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisConnectors.filter((c) => c.state === 'error').length} error</span>
          </div>
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
