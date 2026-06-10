'use client';

import { thesisVulnerabilityIntelligence } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Vulnerability Management — Patch Intelligence
 *
 * Data: VulnerabilityIntelligenceRecord from seed-vulnerability-intelligence
 * Route: /vulnerabilities/patches | Nav Group: Vulnerability Management | Status: BUILD
 * Shows patch priority based on CVSS, EPSS and KEV status.
 */

{/* AI-PLACEMENT: AICAP-VULN-002 — Commander AI patch prioritisation recommendation */}

export default function VulnerabilitiesPatchesPage() {
  const { tokens } = useMode();

  const published = thesisVulnerabilityIntelligence.filter((v) => v.cve_state === 'published');
  const withEpss = published.filter((v) => v.epss_score !== null);
  const highEpss = withEpss.filter((v) => (v.epss_score ?? 0) >= 0.7);
  const patchUrgent = published.filter((v) => v.cisa_kev_status || (v.epss_score ?? 0) >= 0.7 || v.cvss_score >= 9);

  return (
    <PageContainer pretitle="Vulnerabilities › Patch Intelligence" title="Patch Priority">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Published CVEs" value={String(published.length)} />
        <KpiCard tokens={tokens} label="High EPSS (≥70%)" value={String(highEpss.length)} accent={highEpss.length > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Urgent Patch" value={String(patchUrgent.length)} accent={patchUrgent.length > 0 ? primitiveSignal.critical : undefined} />
        <KpiCard tokens={tokens} label="EPSS Coverage" value={`${withEpss.length}/${published.length}`} />
      </section>

      {/* Priority table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Patch Priority Queue</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['CVE ID', 'CVSS', 'EPSS', 'KEV', 'Priority', 'Products', 'Published'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...published].sort((a, b) => (b.epss_score ?? 0) - (a.epss_score ?? 0)).map((v) => {
                const priority = v.cisa_kev_status || (v.epss_score ?? 0) >= 0.7 || v.cvss_score >= 9 ? 'URGENT' : v.cvss_score >= 7 ? 'HIGH' : 'NORMAL';
                const prColor = priority === 'URGENT' ? primitiveSignal.critical : priority === 'HIGH' ? primitiveSignal.warning : primitiveSignal.success;
                return (
                  <tr key={v.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold, fontFamily: primitiveFonts.mono }}>{v.cveId}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{v.cvss_score}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{v.epss_score !== null ? `${(v.epss_score * 100).toFixed(0)}%` : '—'}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{v.cisa_kev_status ? <span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: primitiveSignal.critical }}>KEV</span> : '—'}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: prColor }}>{priority}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontSize: primitiveTypeScale.micro }}>{v.affected_products.join(', ') || '—'}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(v.publishedAt).toLocaleDateString()}</td>
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
