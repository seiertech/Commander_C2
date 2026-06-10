'use client';

import { thesisReports } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Reporting — CISO Pack
 *
 * Data: Report entity from seed-reports (ciso-pack type)
 * Route: /reporting/ciso-pack | Nav Group: Reporting | Status: BUILD
 * Executive-level CISO briefing pack with latest generated artefact.
 */

{/* AI-PLACEMENT: AICAP-REPORT-003 — Commander AI CISO briefing narrative generation */}

export default function ReportingCisoPackPage() {
  const { tokens } = useMode();

  const cisoReports = thesisReports.filter((r) => r.report_type === 'ciso-pack' || r.audience.includes('CISO'));
  const latestCisoPack = thesisReports.find((r) => r.report_type === 'ciso-pack' && r.status === 'completed');

  return (
    <PageContainer pretitle="Reporting › CISO Pack" title="CISO Briefing Pack">
      {/* Latest pack status */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, marginBottom: primitiveSpacing[2] }}>Latest CISO Pack</span>
          {latestCisoPack ? (
            <>
              <h4 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: 0 }}>{latestCisoPack.title}</h4>
              <p style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, margin: `${primitiveSpacing[2]} 0` }}>{latestCisoPack.description}</p>
              <div style={{ display: 'flex', gap: primitiveSpacing[3], fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>
                <span>Period: {new Date(latestCisoPack.periodStart).toLocaleDateString()} – {new Date(latestCisoPack.periodEnd).toLocaleDateString()}</span>
                <span>Generated: {latestCisoPack.last_generated_at ? new Date(latestCisoPack.last_generated_at).toLocaleString() : '—'}</span>
              </div>
              <div style={{ marginTop: primitiveSpacing[3] }}>
                <span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: primitiveSignal.success }}>completed</span>
                <span style={{ marginLeft: primitiveSpacing[2], padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: primitiveSignal.info }}>{latestCisoPack.format}</span>
              </div>
            </>
          ) : (
            <p style={{ color: tokens.text.muted }}>No completed CISO pack available.</p>
          )}
        </div>

        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, marginBottom: primitiveSpacing[2] }}>Pack Schedule</span>
          <div style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary }}>
            <p style={{ margin: `0 0 ${primitiveSpacing[2]}` }}>Cadence: <strong style={{ color: tokens.text.primary }}>{latestCisoPack?.cadence ?? 'weekly'}</strong></p>
            <p style={{ margin: `0 0 ${primitiveSpacing[2]}` }}>Next: <span style={{ fontFamily: primitiveFonts.mono }}>{latestCisoPack?.nextScheduledAt ? new Date(latestCisoPack.nextScheduledAt).toLocaleString() : '—'}</span></p>
            <p style={{ margin: 0 }}>Audience: <span>{latestCisoPack?.audience.join(', ') ?? 'CISO'}</span></p>
          </div>
        </div>
      </section>

      {/* All CISO-relevant reports */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>CISO-Audience Reports</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Title', 'Type', 'Cadence', 'Status', 'Format', 'Period'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cisoReports.map((r) => {
                const statusBg = r.status === 'completed' ? primitiveSignal.success : r.status === 'failed' ? primitiveSignal.critical : primitiveSignal.warning;
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{r.title}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.report_type.replace(/-/g, ' ')}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.cadence}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: statusBg }}>{r.status}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, textTransform: 'uppercase' }}>{r.format}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}</td>
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
