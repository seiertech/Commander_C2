'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors, thesisSystemPulse, thesisStandardsDeclarations } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Platform — Data Provenance
 *
 * Standard: Commander (data trustworthiness and lineage)
 * Data: thesisConnectors (source systems), thesisSystemPulse (freshness),
 *       thesisStandardsDeclarations (schema adherence)
 * Route: /platform/provenance | Nav Group: Platform | Status: BUILD
 *
 * Shows data source provenance: where data comes from, freshness,
 * transformation chain, and schema adherence status.
 */

{/* AI-PLACEMENT: AICAP-PROVENANCE-001 — Commander AI data trust assessment */}

export default function PlatformProvenancePage() {
  const { tokens } = useMode();

  const totalSources = thesisConnectors.length;
  const activeSources = thesisConnectors.filter((c) => c.state === 'active').length;
  const freshSubsystems = thesisSystemPulse.filter((s) => s.data_freshness_hours <= 1).length;
  const staleSubsystems = thesisSystemPulse.filter((s) => s.data_freshness_hours > 2).length;
  const schemaAdherent = thesisStandardsDeclarations.filter((s) => s.conformance_level === 'strict').length;

  return (
    <PageContainer pretitle="Platform › Provenance" title="Data Provenance & Trust">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Data Sources" value={String(totalSources)} />
        <KpiCard tokens={tokens} label="Active" value={String(activeSources)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Fresh (<1h)" value={String(freshSubsystems)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Stale (>2h)" value={String(staleSubsystems)} accent={staleSubsystems > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Schema Strict" value={String(schemaAdherent)} />
      </section>

      {/* Source Provenance */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Source Provenance Chain</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Source', 'State', 'Tier', 'Trust Level', 'Last Sync'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisConnectors.map((c) => {
                const trust = c.state === 'active' ? 'verified' : c.state === 'error' ? 'degraded' : 'unknown';
                const trustColor = trust === 'verified' ? primitiveSignal.success : trust === 'degraded' ? primitiveSignal.critical : primitiveSignal.neutral;
                return (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{c.name}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: c.state === 'active' ? primitiveSignal.success : c.state === 'error' ? primitiveSignal.critical : primitiveSignal.neutral }}>{c.state}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{c.tier}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: trustColor }}>{trust}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{c.last_sync_at ? new Date(c.last_sync_at).toLocaleString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Freshness */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Subsystem Data Freshness</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Subsystem', 'Health', 'Freshness', 'Processing Rate', 'Error Rate'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisSystemPulse.map((s) => {
                const hc = s.health === 'operational' || s.health === 'healthy' ? primitiveSignal.success : s.health === 'degraded' ? primitiveSignal.warning : primitiveSignal.critical;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{s.subsystem}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: hc }}>{s.health}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: s.data_freshness_hours > 2 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.data_freshness_hours}h</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{s.processing_rate}/hr</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: s.error_rate > 3 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.error_rate}%</td>
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
