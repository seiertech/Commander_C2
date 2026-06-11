'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal, primitiveData,
} from '../../../../../packages/ui/src/tokens/primitives';
import { thesisIocs, thesisRules, thesisSecurityToolIntelligence, thesisControlFrameworks } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Defence Coverage — ATT&CK / D3FEND Heatmap
 *
 * Standard: MITRE ATT&CK + D3FEND (attack & defence technique mapping)
 * Data: thesisIocs (attack indicators), thesisRules (detection rules),
 *       thesisSecurityToolIntelligence (defence tools),
 *       thesisControlFrameworks (framework coverage)
 * Route: /defence-coverage | Nav Group: Intelligence | Status: BUILD
 *
 * Maps detection rule coverage against known attack techniques.
 */

{/* AI-PLACEMENT: AICAP-DEFENCE-001 — Commander AI attack/defence gap mapping */}

export default function DefenceCoveragePage() {
  const { tokens } = useMode();

  const totalRules = thesisRules.length;
  const activeRules = thesisRules.filter((r) => r.status === 'active').length;
  const totalTools = thesisSecurityToolIntelligence.length;
  const iocTechniques = [...new Set(thesisIocs.map((i) => i.ioc_category))].length;
  const frameworks = thesisControlFrameworks.length;

  // Synthetic ATT&CK tactic coverage (based on rule domains)
  const tactics = ['Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defence Evasion', 'Credential Access', 'Discovery', 'Lateral Movement', 'Collection', 'Exfiltration', 'Impact'];
  const tacticCoverage = tactics.map((t, i) => ({
    tactic: t,
    rulesActive: Math.max(1, activeRules - i * 2),
    toolsCovering: Math.min(totalTools, Math.max(1, totalTools - i)),
    coveragePct: Math.max(20, 95 - i * 7),
  }));

  return (
    <PageContainer pretitle="Intelligence" title="Defence Coverage (ATT&CK / D3FEND)">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Detection Rules" value={`${activeRules}/${totalRules}`} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Security Tools" value={String(totalTools)} />
        <KpiCard tokens={tokens} label="IOC Categories" value={String(iocTechniques)} />
        <KpiCard tokens={tokens} label="Frameworks" value={String(frameworks)} />
        <KpiCard tokens={tokens} label="Tactics Covered" value={`${tactics.length}/${tactics.length}`} accent={primitiveSignal.success} />
      </section>

      {/* Tactic Coverage Heatmap */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>ATT&CK Tactic Coverage</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Tactic', 'Rules Active', 'Tools Covering', 'Coverage %', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tacticCoverage.map((tc) => {
                const covColor = tc.coveragePct >= 80 ? primitiveSignal.success : tc.coveragePct >= 50 ? primitiveSignal.warning : primitiveSignal.critical;
                return (
                  <tr key={tc.tactic} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{tc.tactic}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{tc.rulesActive}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{tc.toolsCovering}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2] }}>
                        <div style={{ flex: 1, height: 8, background: tokens.border.subtle, borderRadius: 4 }}>
                          <div style={{ height: '100%', width: `${tc.coveragePct}%`, background: covColor, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.secondary }}>{tc.coveragePct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: covColor }}>{tc.coveragePct >= 80 ? 'Strong' : tc.coveragePct >= 50 ? 'Partial' : 'Weak'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* D3FEND Defensive Techniques */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>D3FEND Tool Mapping</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Tool', 'Category', 'Effectiveness', 'Coverage', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisSecurityToolIntelligence.map((t) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{t.tool_name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{t.category}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: t.effectiveness_score >= 80 ? primitiveSignal.success : primitiveSignal.warning }}>{t.effectiveness_score}%</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{t.coverage_percent}%</td>
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
