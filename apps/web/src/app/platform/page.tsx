// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors, thesisControlFrameworks, thesisVulnerabilityIntelligence, thesisRules, thesisModels, thesisAutomationRules, thesisFeatureRegistry } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Platform — Overview
 * Data: Aggregate of connectors, frameworks, vulnerability intelligence, platform entities
 * Route: /platform | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-PLAT-006 — Commander AI platform health summary */}

export default function PlatformOverviewPage() {
  const { tokens } = useMode();
  const activeConnectors = thesisConnectors.filter((c) => c.state === 'active').length;
  const activeFrameworks = thesisControlFrameworks.filter((f) => f.active).length;
  const kevCount = thesisVulnerabilityIntelligence.filter((v) => v.cisa_kev_status).length;
  const activeRules = thesisRules.filter((r) => r.status === 'active').length;

  return (
    <PageContainer pretitle="Platform" title="Platform Overview">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Connectors Active" value={`${active_connectors}/${thesisConnectors.length}`} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Frameworks" value={String(activeFrameworks)} />
        <Kpi tokens={tokens} label="KEV Advisories" value={String(kevCount)} accent={kevCount > 0 ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="Detection Rules" value={String(activeRules)} />
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Engine Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: primitiveSpacing[3] }}>
            <Stat tokens={tokens} label="Rules" value={thesisRules.length} sub={`${activeRules} active`} />
            <Stat tokens={tokens} label="Models" value={thesisModels.length} sub={`${thesisModels.filter((m) => m.status === 'active').length} active`} />
            <Stat tokens={tokens} label="Automations" value={thesisAutomationRules.length} sub={`${thesisAutomationRules.filter((a) => a.status === 'active').length} active`} />
            <Stat tokens={tokens} label="Features" value={thesisFeatureRegistry.length} sub={`${thesisFeatureRegistry.filter((f) => f.state === 'enabled').length} enabled`} />
          </div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Data Sources</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Connector', 'State', 'Tier'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
              <tbody>{thesisConnectors.map((c) => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{c.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: c.state === 'active' ? primitiveSignal.success : c.state === 'error' ? primitiveSignal.critical : primitiveSignal.neutral }}>{c.state}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{c.tier}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}

function Stat({ tokens, label, value, sub }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: number; sub: string }) {
  return (<div style={{ textAlign: 'center', padding: primitiveSpacing[2] }}><span style={{ display: 'block', fontSize: primitiveTypeScale.h3, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{value}</span><span style={{ display: 'block', fontSize: primitiveTypeScale.caption, color: tokens.text.secondary }}>{label}</span><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{sub}</span></div>);
}
