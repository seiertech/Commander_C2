'use client';

import { thesisAutomationRules } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Platform — Automation
 *
 * Data: AutomationRule from seed-platform
 * Route: /platform/automation | Nav Group: Platform | Status: BUILD
 * Shows automation rules, triggers, execution counts and approval requirements.
 */

{/* AI-PLACEMENT: AICAP-PLATFORM-003 — Commander AI automation impact prediction */}

export default function PlatformAutomationPage() {
  const { tokens } = useMode();

  const activeRules = thesisAutomationRules.filter((r) => r.status === 'active').length;
  const totalExecutions = thesisAutomationRules.reduce((acc, r) => acc + r.executionCount, 0);
  const requiresApproval = thesisAutomationRules.filter((r) => r.requiresApproval).length;

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return primitiveSignal.success;
      case 'paused': return primitiveSignal.warning;
      case 'draft': return primitiveSignal.info;
      case 'disabled': return primitiveSignal.neutral;
      default: return primitiveSignal.neutral;
    }
  };

  return (
    <PageContainer pretitle="Platform › Automation" title="Automation Rules">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Rules" value={String(thesisAutomationRules.length)} />
        <KpiCard tokens={tokens} label="Active" value={String(activeRules)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Total Executions" value={String(totalExecutions)} />
        <KpiCard tokens={tokens} label="Requires Approval" value={String(requiresApproval)} accent={requiresApproval > 0 ? primitiveSignal.warning : undefined} />
      </section>

      {/* Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Automation Rule Definitions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Name', 'Trigger', 'Action', 'Status', 'Executions', 'Last Run', 'Approval'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisAutomationRules.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{r.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.trigger.replace(/-/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.action.replace(/-/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: statusColor(r.status) }}>{r.status}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{r.executionCount}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{r.lastExecutedAt ? new Date(r.lastExecutedAt).toLocaleString() : '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{r.requiresApproval ? <span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: primitiveSignal.warning }}>required</span> : <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>auto</span>}</td>
                </tr>
              ))}
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
