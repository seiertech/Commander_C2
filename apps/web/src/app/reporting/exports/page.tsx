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
 * Reporting — Exports
 *
 * Data: Report entity from seed-reports
 * Route: /reporting/exports | Nav Group: Reporting | Status: BUILD
 * Shows completed reports available for export/download.
 */

{/* AI-PLACEMENT: AICAP-REPORT-002 — Commander AI export format recommendation */}

export default function ReportingExportsPage() {
  const { tokens } = useMode();

  const completedReports = thesisReports.filter((r) => r.status === 'completed');
  const formats = Array.from(new Set(thesisReports.map((r) => r.format)));

  return (
    <PageContainer pretitle="Reporting › Exports" title="Report Exports">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Available Exports" value={String(completedReports.length)} />
        <KpiCard tokens={tokens} label="Formats" value={formats.join(', ').toUpperCase()} />
        <KpiCard tokens={tokens} label="Total Reports" value={String(thesisReports.length)} />
      </section>

      {/* Exports table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Completed Reports — Export Ready</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Title', 'Type', 'Format', 'Period', 'Generated', 'Audience'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completedReports.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: primitiveSpacing[4], textAlign: 'center', color: tokens.text.muted }}>No completed reports available for export.</td></tr>
              ) : (
                completedReports.map((r) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{r.title}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.reportType.replace(/-/g, ' ')}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: primitiveSignal.info }}>{r.format}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{r.lastGeneratedAt ? new Date(r.lastGeneratedAt).toLocaleString() : '—'}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.audience.join(', ')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: primitiveSpacing[3], fontSize: primitiveTypeScale.caption, color: tokens.text.muted }}>
          Export download is not available in Phase 1. This surface is read-only.
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
