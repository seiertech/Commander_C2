'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisArchitectureComponents } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Architecture — Drift
 * Data: ArchitectureComponent driftState from seed-architecture
 * Route: /architecture/drift | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-ARCH-002 — Commander AI drift remediation recommendation */}

export default function ArchitectureDriftPage() {
  const { tokens } = useMode();
  const drifted = thesisArchitectureComponents.filter((c) => c.driftState !== 'compliant');
  const major = drifted.filter((c) => c.driftState === 'major_drift').length;
  const minor = drifted.filter((c) => c.driftState === 'minor_drift').length;
  const compliant = thesisArchitectureComponents.filter((c) => c.driftState === 'compliant').length;

  return (
    <PageContainer pretitle="Architecture › Drift" title="Architecture Drift">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Compliant" value={String(compliant)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Minor Drift" value={String(minor)} accent={minor > 0 ? primitiveSignal.warning : undefined} />
        <Kpi tokens={tokens} label="Major Drift" value={String(major)} accent={major > 0 ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="Total" value={String(thesisArchitectureComponents.length)} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Drift State</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Component', 'Drift State', 'Baseline', 'Current', 'Last Scanned', 'Criticality'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisArchitectureComponents.map((c) => {
              const dc = c.driftState === 'compliant' ? primitiveSignal.success : c.driftState === 'minor_drift' ? primitiveSignal.warning : primitiveSignal.critical;
              return (
                <tr key={c.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{c.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: dc }}>{c.driftState.replace(/_/g, ' ')}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{c.baselineVersion}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: c.baselineVersion !== c.currentVersion ? primitiveSignal.warning : tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{c.currentVersion}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(c.lastScannedAt).toLocaleString()}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{c.criticality}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
