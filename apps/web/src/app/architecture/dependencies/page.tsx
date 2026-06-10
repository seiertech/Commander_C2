'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisArchitectureComponents } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Architecture — Dependencies
 * Data: ArchitectureComponent dependencies from seed-architecture
 * Route: /architecture/dependencies | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-ARCH-003 — Commander AI dependency risk chain analysis */}

export default function ArchitectureDependenciesPage() {
  const { tokens } = useMode();
  const withDeps = thesisArchitectureComponents.filter((c) => c.dependencies.length > 0);
  const totalDeps = thesisArchitectureComponents.reduce((a, c) => a + c.dependencies.length, 0);
  const criticalWithDeps = withDeps.filter((c) => c.criticality <= 2).length;

  return (
    <PageContainer pretitle="Architecture › Dependencies" title="Dependency Map">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Components" value={String(thesisArchitectureComponents.length)} />
        <Kpi tokens={tokens} label="With Dependencies" value={String(withDeps.length)} />
        <Kpi tokens={tokens} label="Total Links" value={String(totalDeps)} />
        <Kpi tokens={tokens} label="Critical w/ Deps" value={String(criticalWithDeps)} accent={criticalWithDeps > 0 ? primitiveSignal.warning : undefined} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Dependency Links</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Component', 'Type', 'Depends On', 'Criticality', 'Status'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisArchitectureComponents.map((c) => {
              const depNames = c.dependencies.map((d) => thesisArchitectureComponents.find((x) => x.id === d)?.name ?? d).join(', ');
              const sc = c.status === 'healthy' ? primitiveSignal.success : c.status === 'degraded' ? primitiveSignal.warning : primitiveSignal.critical;
              return (
                <tr key={c.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{c.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{c.componentType.replace(/_/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontSize: primitiveTypeScale.micro }}>{depNames || '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{c.criticality}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: sc }}>{c.status}</span></td>
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
