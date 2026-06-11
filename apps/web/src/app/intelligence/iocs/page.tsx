'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisIocs, thesisSignals } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Intelligence — IOC Lifecycle
 *
 * Standard: STIX (Structured Threat Information Expression)
 * Data: thesisIocs (indicator lifecycle), thesisSignals (linked detections)
 * Route: /intelligence/iocs | Nav Group: Intelligence | Status: BUILD
 *
 * Shows IOC categories, TLP markings, confidence levels, active/expired status.
 */

{/* AI-PLACEMENT: AICAP-IOC-001 — Commander AI IOC correlation and enrichment */}

export default function IntelligenceIocsPage() {
  const { tokens } = useMode();

  const totalIocs = thesisIocs.length;
  const activeIocs = thesisIocs.filter((i) => i.active).length;
  const highConfidence = thesisIocs.filter((i) => i.confidence >= 80).length;
  const criticalSeverity = thesisIocs.filter((i) => i.severity >= 4).length;

  // Category distribution
  const categoryMap: Record<string, number> = {};
  thesisIocs.forEach((i) => { categoryMap[i.ioc_category] = (categoryMap[i.ioc_category] || 0) + 1; });
  const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <PageContainer pretitle="Intelligence › IOCs" title="IOC Lifecycle (STIX)">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total IOCs" value={String(totalIocs)} />
        <KpiCard tokens={tokens} label="Active" value={String(activeIocs)} accent={activeIocs > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="High Confidence" value={String(highConfidence)} />
        <KpiCard tokens={tokens} label="Critical Severity" value={String(criticalSeverity)} accent={criticalSeverity > 0 ? primitiveSignal.critical : undefined} />
      </section>

      {/* Category Breakdown */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>IOC Categories (Top 10)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: primitiveSpacing[3] }}>
          {topCategories.map(([cat, count]) => (
            <div key={cat} style={{ padding: primitiveSpacing[3], background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}` }}>
              <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{cat.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: primitiveTypeScale.h4, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* IOC Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Indicator Register</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Category', 'Value', 'Confidence', 'Severity', 'TLP', 'Active', 'First Seen'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisIocs.slice(0, 20).map((ioc) => (
                <tr key={ioc.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{ioc.ioc_category.replace(/_/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ioc.value}>{ioc.value}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{ioc.confidence}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: ioc.severity >= 4 ? primitiveSignal.critical : ioc.severity >= 3 ? primitiveSignal.warning : primitiveSignal.neutral }}>{ioc.severity}/5</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>{ioc.tlpMarking}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{ioc.active ? <span style={{ color: primitiveSignal.success }}>●</span> : <span style={{ color: tokens.text.muted }}>○</span>}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(ioc.first_seen_at).toLocaleDateString()}</td>
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
