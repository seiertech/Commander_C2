'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisSecurityToolIntelligence, thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Platform — Security Tool Intelligence
 *
 * Standard: Commander (per-tool effectiveness metrics)
 * Data: thesisSecurityToolIntelligence, thesisConnectors
 * Route: /platform/tool-intelligence | Nav Group: Platform | Status: BUILD
 *
 * Shows per-tool effectiveness, coverage percentages, detection rates.
 */

{/* AI-PLACEMENT: AICAP-TOOLINTEL-001 — Commander AI tool effectiveness recommendation */}

export default function PlatformToolIntelligencePage() {
  const { tokens } = useMode();

  const totalTools = thesisSecurityToolIntelligence.length;
  const activeTools = thesisSecurityToolIntelligence.filter((t) => t.status === 'active').length;
  const avgEffectiveness = totalTools > 0
    ? Math.round(thesisSecurityToolIntelligence.reduce((a, t) => a + t.effectiveness_score, 0) / totalTools)
    : 0;
  const avgCoverage = totalTools > 0
    ? Math.round(thesisSecurityToolIntelligence.reduce((a, t) => a + t.coverage_percent, 0) / totalTools)
    : 0;

  return (
    <PageContainer pretitle="Platform › Tool Intelligence" title="Security Tool Intelligence">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Tools" value={String(totalTools)} />
        <KpiCard tokens={tokens} label="Active" value={String(activeTools)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Avg Effectiveness" value={`${avgEffectiveness}%`} accent={avgEffectiveness < 70 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Avg Coverage" value={`${avgCoverage}%`} accent={avgCoverage < 70 ? primitiveSignal.warning : undefined} />
      </section>

      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Tool Performance Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Tool', 'Category', 'Coverage', 'Effectiveness', 'Detection Rate', 'FP Rate', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisSecurityToolIntelligence.map((t) => {
                const effColor = t.effectiveness_score >= 80 ? primitiveSignal.success : t.effectiveness_score >= 50 ? primitiveSignal.warning : primitiveSignal.critical;
                return (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{t.tool_name}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{t.category}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{t.coverage_percent}%</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: effColor }}>{t.effectiveness_score}%</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{t.detection_rate}%</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: t.false_positive_rate > 10 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{t.false_positive_rate}%</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: t.status === 'active' ? primitiveSignal.success : tokens.text.muted }}>{t.status}</td>
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
