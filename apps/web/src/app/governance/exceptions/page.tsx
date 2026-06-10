'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { seedControlEvaluations } from '../../../../../../packages/contracts/src/fixtures/seed-control-frameworks';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Governance — Exceptions
 * Data: ControlEvaluation where exceptionState !== 'none'
 * Route: /governance/exceptions | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-GOV-002 — Commander AI exception risk assessment */}

export default function GovernanceExceptionsPage() {
  const { tokens } = useMode();
  const exceptions = seedControlEvaluations.filter((e) => e.exceptionState !== 'none');
  const acceptedRisk = exceptions.filter((e) => e.exceptionState === 'accepted_risk').length;
  const allEvals = seedControlEvaluations.length;

  return (
    <PageContainer pretitle="Governance › Exceptions" title="Exceptions">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Total Exceptions" value={String(exceptions.length)} accent={exceptions.length > 0 ? primitiveSignal.warning : undefined} />
        <Kpi tokens={tokens} label="Accepted Risk" value={String(acceptedRisk)} />
        <Kpi tokens={tokens} label="Total Evaluations" value={String(allEvals)} />
        <Kpi tokens={tokens} label="Exception Rate" value={allEvals > 0 ? `${Math.round((exceptions.length / allEvals) * 100)}%` : '0%'} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Exception Register</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Framework', 'Control', 'Entity', 'Verdict', 'Exception State', 'Confidence', 'Next Review'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{exceptions.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: primitiveSpacing[4], textAlign: 'center', color: tokens.text.muted }}>No exceptions recorded.</td></tr>
            ) : exceptions.map((e) => (
              <tr key={e.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{e.frameworkId}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono }}>{e.controlId}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{e.evaluatedEntityId}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: primitiveSignal.critical }}>NON-ADHERENT</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: primitiveSignal.warning }}>{(e.exceptionState ?? 'unknown').replace(/_/g, ' ')}</span></td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{e.confidence}%</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{e.nextEvaluationDue ? new Date(e.nextEvaluationDue).toLocaleDateString() : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
