'use client';

import { thesisVulnerabilityIntelligence, thesisRiskScores } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Vulnerability Management — KEV & Critical
 *
 * Data: VulnerabilityIntelligenceRecord from seed-vulnerability-intelligence
 * Route: /vulnerabilities/kev | Nav Group: Vulnerability Management | Status: BUILD
 * Shows CISA Known Exploited Vulnerabilities and critical-rated CVEs.
 */

{/* AI-PLACEMENT: AICAP-VULN-001 — Commander AI KEV prioritisation recommendation */}

export default function VulnerabilitiesKevPage() {
  const { tokens } = useMode();

  const kevEntries = thesisVulnerabilityIntelligence.filter((v) => v.cisa_kev_status);
  const criticalEntries = thesisVulnerabilityIntelligence.filter((v) => v.severity >= 4);
  const overdue = kevEntries.filter((v) => v.kevDueDate && new Date(v.kevDueDate) < new Date('2026-01-18'));
  const avgEpss = kevEntries.length > 0 ? (kevEntries.reduce((acc, v) => acc + (v.epss_score ?? 0), 0) / kevEntries.length * 100).toFixed(0) : '0';

  return (
    <PageContainer pretitle="Vulnerabilities › KEV & Critical" title="Known Exploited Vulnerabilities">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="KEV Entries" value={String(kevEntries.length)} accent={primitiveSignal.critical} />
        <KpiCard tokens={tokens} label="Critical (Sev 4-5)" value={String(criticalEntries.length)} accent={primitiveSignal.warning} />
        <KpiCard tokens={tokens} label="Overdue" value={String(overdue.length)} accent={overdue.length > 0 ? primitiveSignal.critical : undefined} />
        <KpiCard tokens={tokens} label="Avg EPSS" value={`${avgEpss}%`} />
      </section>

      {/* KEV table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>KEV & Critical CVE Register</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['CVE ID', 'CVSS', 'Severity', 'EPSS', 'KEV', 'Due Date', 'Products', 'State'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisVulnerabilityIntelligence.filter((v) => v.cisa_kev_status || v.severity >= 4).map((v) => (
                <tr key={v.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold, fontFamily: primitiveFonts.mono }}>{v.cve_id}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: v.cvss_score >= 9 ? primitiveSignal.critical : v.cvss_score >= 7 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{v.cvss_score}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{v.severity}/5</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{v.epss_score !== null ? `${(v.epss_score * 100).toFixed(0)}%` : '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{v.cisa_kev_status ? <span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: primitiveSignal.critical }}>KEV</span> : '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{v.kevDueDate ? new Date(v.kevDueDate).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontSize: primitiveTypeScale.micro }}>{v.affected_products.length > 0 ? v.affected_products.join(', ') : '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{v.cve_state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{riskscoresCount} Risk Scores</span>
        </div>
      </section>
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
