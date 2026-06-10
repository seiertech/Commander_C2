'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisControlRequirements, thesisControlFrameworks } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Governance — Policies & Standards
 * Data: ControlRequirement from seed-control-frameworks
 * Route: /governance/policies | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-GOV-001 — Commander AI policy adherence gap analysis */}

export default function GovernancePoliciesPage() {
  const { tokens } = useMode();
  const total = thesisControlRequirements.length;
  const active = thesisControlRequirements.filter((r) => r.active).length;
  const frameworks = new Set(thesisControlRequirements.map((r) => r.frameworkId)).size;

  return (
    <PageContainer pretitle="Governance › Policies & Standards" title="Policies & Standards">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Requirements" value={String(total)} />
        <Kpi tokens={tokens} label="Active" value={String(active)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Frameworks" value={String(frameworks)} />
        <Kpi tokens={tokens} label="Total Frameworks" value={String(thesisControlFrameworks.length)} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Policy Requirements</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Framework', 'Control', 'Requirement', 'Description', 'Target', 'Active'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisControlRequirements.map((r) => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.frameworkId}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono }}>{r.controlId}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{r.requirementId}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.description}>{r.description}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{r.targetType}</td>
                <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{r.active ? <span style={{ color: primitiveSignal.success }}>●</span> : <span style={{ color: tokens.text.muted }}>○</span>}</td>
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
