'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisPushGovernance, thesisRules } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Governance — Push Governance Console
 *
 * Standard: Commander Push Governance (dry-run until approved)
 * Data: thesisPushGovernance (governed push audit log), thesisRules (rule refs)
 * Route: /governance/push-governance | Nav Group: Governance & Adherence | Status: BUILD
 *
 * Shows governed push simulation runs, their status, impact assessment.
 */

{/* AI-PLACEMENT: AICAP-PUSHGOV-001 — Commander AI push impact prediction */}

export default function GovernancePushGovernancePage() {
  const { tokens } = useMode();

  const totalRuns = thesisPushGovernance.length;
  const completedRuns = thesisPushGovernance.filter((r) => r.status === 'completed').length;
  const pendingRuns = thesisPushGovernance.filter((r) => r.status === 'pending').length;
  const failedRuns = thesisPushGovernance.filter((r) => r.status === 'failed').length;

  return (
    <PageContainer pretitle="Governance › Push Governance" title="Push Governance Console">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Runs" value={String(totalRuns)} />
        <KpiCard tokens={tokens} label="Completed" value={String(completedRuns)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Pending" value={String(pendingRuns)} accent={pendingRuns > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Failed" value={String(failedRuns)} accent={failedRuns > 0 ? primitiveSignal.critical : undefined} />
      </section>

      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Push Governance Runs</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Run ID', 'Rule', 'Status', 'Mode', 'Entities Affected', 'Started', 'Completed'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisPushGovernance.map((r) => {
                const statusColor = r.status === 'completed' ? primitiveSignal.success : r.status === 'pending' ? primitiveSignal.warning : primitiveSignal.critical;
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{r.runId}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontSize: primitiveTypeScale.micro }}>{r.rule_ref}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: statusColor }}>{r.status}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{r.executionMode}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{r.affectedEntityCount}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{r.completed_at ? new Date(r.completed_at).toLocaleString() : '—'}</td>
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
