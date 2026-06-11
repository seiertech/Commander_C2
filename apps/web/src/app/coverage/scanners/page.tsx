'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors, thesisSecurityToolIntelligence, thesisAssets } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Coverage — Scanner Coverage
 *
 * Standard: NIST CSF (Identify — Asset Management)
 * Data: thesisConnectors (scanner sources), thesisSecurityToolIntelligence,
 *       thesisAssets (coverage booleans)
 * Route: /coverage/scanners | Nav Group: Coverage | Status: BUILD
 *
 * Shows which scanners are deployed, their coverage, freshness.
 */

{/* AI-PLACEMENT: AICAP-SCANNER-001 — Commander AI scanner gap recommendation */}

export default function CoverageScannersPage() {
  const { tokens } = useMode();

  const scannerConnectors = thesisConnectors.filter((c) => c.tier === 'scanner' || c.category === 'vulnerability_scanner');
  const activeConnectors = thesisConnectors.filter((c) => c.state === 'active').length;
  const vulnScanCoverage = thesisAssets.filter((a) => a.coverage?.has_vuln_scan).length;
  const totalAssets = thesisAssets.length;
  const scannerTools = thesisSecurityToolIntelligence.filter((t) => t.category === 'vulnerability_scanner' || t.category === 'scanner');

  return (
    <PageContainer pretitle="Coverage › Scanners" title="Scanner Coverage (NIST CSF)">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Active Connectors" value={`${activeConnectors}/${thesisConnectors.length}`} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Vuln Scan Coverage" value={`${vulnScanCoverage}/${totalAssets}`} accent={vulnScanCoverage < totalAssets ? primitiveSignal.warning : primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Scanner Tools" value={String(scannerTools.length || thesisSecurityToolIntelligence.length)} />
        <KpiCard tokens={tokens} label="Uncovered Assets" value={String(totalAssets - vulnScanCoverage)} accent={totalAssets - vulnScanCoverage > 0 ? primitiveSignal.critical : undefined} />
      </section>

      {/* Connector Pipeline */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Scanner Connectors</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Connector', 'State', 'Tier', 'Last Sync'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisConnectors.map((c) => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{c.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: c.state === 'active' ? primitiveSignal.success : c.state === 'error' ? primitiveSignal.critical : primitiveSignal.neutral }}>{c.state}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{c.tier}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{c.last_sync_at ? new Date(c.last_sync_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tool Intelligence */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Scanner Tool Effectiveness</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Tool', 'Category', 'Coverage', 'Effectiveness', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisSecurityToolIntelligence.map((t) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{t.tool_name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{t.category}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{t.coverage_percent}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: t.effectiveness_score >= 80 ? primitiveSignal.success : primitiveSignal.warning }}>{t.effectiveness_score}%</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: t.status === 'active' ? primitiveSignal.success : tokens.text.muted }}>{t.status}</td>
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
