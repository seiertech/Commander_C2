'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisVulnerabilityIntelligence, thesisRiskScores, thesisAssets, thesisCases, thesisBlastRadius, thesisExposures, thesisPostures, thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Vulnerability Management — SSVC Decision Flow
 *
 * Standard: SSVC (Stakeholder-Specific Vulnerability Categorisation)
 * Data: thesisVulnerabilityIntelligence, thesisRiskScores, thesisAssets
 * Route: /vulnerabilities/ssvc | Nav Group: Vulnerability Management | Status: BUILD
 *
 * SSVC decision tree: Exploitation → Automatable → Technical Impact → Mission Prevalence → Decision
 */

{/* AI-PLACEMENT: AICAP-SSVC-001 — Commander AI SSVC decision recommendation */}

export default function VulnerabilitiesSsvcPage() {
  const { tokens } = useMode();

  const totalVulns = thesisVulnerabilityIntelligence.length;
  const withKev = thesisVulnerabilityIntelligence.filter((v) => v.cisa_kev_status).length;
  const highEpss = thesisVulnerabilityIntelligence.filter((v) => v.epss_score !== null && v.epss_score > 0.5).length;
  const criticalCvss = thesisVulnerabilityIntelligence.filter((v) => v.cvss_score >= 9.0).length;
  const totalAssets = thesisAssets.length;

  // SSVC decision mapping (synthetic based on EPSS + KEV + CVSS)
  const ssvcDecisions = thesisVulnerabilityIntelligence.map((v) => {
    const exploitation = v.cisa_kev_status ? 'active' : (v.epss_score ?? 0) > 0.5 ? 'poc' : 'none';
    const automatable = (v.epss_score ?? 0) > 0.7 ? 'yes' : 'no';
    const techImpact = v.cvss_score >= 9.0 ? 'total' : v.cvss_score >= 7.0 ? 'partial' : 'minimal';
    let decision: string;
    if (exploitation === 'active') decision = 'Act';
    else if (exploitation === 'poc' && automatable === 'yes') decision = 'Act';
    else if (techImpact === 'total') decision = 'Attend';
    else if (exploitation === 'poc') decision = 'Attend';
    else decision = 'Track';
    return { ...v, exploitation, automatable, techImpact, decision };
  });

  const actCount = ssvcDecisions.filter((d) => d.decision === 'Act').length;
  const attendCount = ssvcDecisions.filter((d) => d.decision === 'Attend').length;
  const trackCount = ssvcDecisions.filter((d) => d.decision === 'Track').length;

  return (
    <PageContainer pretitle="Vulnerabilities › SSVC" title="SSVC Decision Flow">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total CVEs" value={String(totalVulns)} />
        <KpiCard tokens={tokens} label="KEV Listed" value={String(withKev)} accent={withKev > 0 ? primitiveSignal.critical : undefined} />
        <KpiCard tokens={tokens} label="High EPSS" value={String(highEpss)} accent={highEpss > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Act" value={String(actCount)} accent={primitiveSignal.critical} />
        <KpiCard tokens={tokens} label="Attend" value={String(attendCount)} accent={primitiveSignal.warning} />
        <KpiCard tokens={tokens} label="Track" value={String(trackCount)} accent={primitiveSignal.success} />
      </section>

      {/* SSVC Decision Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>SSVC Decision Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['CVE', 'CVSS', 'EPSS', 'Exploitation', 'Automatable', 'Tech Impact', 'Decision'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ssvcDecisions.map((d) => {
                const decColor = d.decision === 'Act' ? primitiveSignal.critical : d.decision === 'Attend' ? primitiveSignal.warning : primitiveSignal.success;
                return (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold, fontFamily: primitiveFonts.mono }}>{d.cve_id}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{d.cvss_score}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{d.epss_score !== null ? `${(d.epss_score * 100).toFixed(0)}%` : '—'}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: d.exploitation === 'active' ? primitiveSignal.critical : d.exploitation === 'poc' ? primitiveSignal.warning : primitiveSignal.neutral }}>{d.exploitation}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: d.automatable === 'yes' ? primitiveSignal.warning : tokens.text.muted }}>{d.automatable}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{d.techImpact}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.bold, color: '#fff', background: decColor }}>{d.decision}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* Cross-Entity Relationship Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius Impact</h4>
          {thesisBlastRadius.slice(0,3).map((b) => (
            <div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span>
              <span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} pts → {b.affected_entities.length} entities</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Related Cases</h4>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (
            <div key={c.case_id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span>
              <span style={{ padding: '1px 6px', color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority} · {c.ooda_state}</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Status</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3] }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
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
