'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal, primitiveData,
} from '../../../../../packages/ui/src/tokens/primitives';
import { thesisSystemPulse, thesisTeamPulse, thesisCases, thesisConnectors } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Operational Maturity — DORA + CMMI
 *
 * Standard: DORA (DevOps Research and Assessment) + CMMI (Capability Maturity Model)
 * Data: thesisSystemPulse (system metrics), thesisTeamPulse (team velocity),
 *       thesisCases (throughput), thesisConnectors (deployment frequency)
 * Route: /operational-maturity | Nav Group: SOM | Status: BUILD
 *
 * DORA 4 key metrics + CMMI maturity level assessment.
 */

{/* AI-PLACEMENT: AICAP-MATURITY-001 — Commander AI maturity improvement recommendation */}

export default function OperationalMaturityPage() {
  const { tokens } = useMode();

  // DORA metrics (synthetic from available data)
  const deploymentFrequency = thesisConnectors.filter((c) => c.state === 'active').length; // proxy
  const leadTimeForChanges = Math.round(thesisSystemPulse.reduce((a, s) => a + s.data_freshness_hours, 0) / Math.max(thesisSystemPulse.length, 1)); // proxy hours
  const changeFailureRate = thesisSystemPulse.filter((s) => s.error_rate > 3).length;
  const mttr = Math.round(thesisTeamPulse.reduce((a, t) => a + t.hours_since_last_closure, 0) / Math.max(thesisTeamPulse.length, 1));
  
  const resolvedCases = thesisCases.filter((c) => c.itil_stage === 'resolved' || c.itil_stage === 'closed').length;
  const totalCases = thesisCases.length;
  const throughputRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;

  // CMMI levels (synthetic assessment)
  const cmmiDomains = [
    { domain: 'Incident Response', level: 4, target: 5, evidence: 'OODA loop + ITIL lifecycle' },
    { domain: 'Vulnerability Management', level: 3, target: 4, evidence: 'SSVC + CTEM integration' },
    { domain: 'Identity Governance', level: 3, target: 4, evidence: 'Dual posture model active' },
    { domain: 'Platform Operations', level: 4, target: 5, evidence: 'Automated connectors + rule engine' },
    { domain: 'Risk Management', level: 3, target: 4, evidence: 'ISO 27005 register in place' },
    { domain: 'Governance & Adherence', level: 3, target: 5, evidence: 'Standards declarations + evidence' },
  ];

  const avgMaturity = (cmmiDomains.reduce((a, d) => a + d.level, 0) / cmmiDomains.length).toFixed(1);

  return (
    <PageContainer pretitle="SOM" title="Operational Maturity (DORA + CMMI)">
      {/* DORA 4 Key Metrics */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <MetricCard tokens={tokens} label="Deployment Frequency" value={`${deploymentFrequency} active`} sub="Active connectors/pipelines" accent={primitiveData[0]} />
        <MetricCard tokens={tokens} label="Lead Time for Changes" value={`${leadTimeForChanges}h`} sub="Avg data freshness" accent={primitiveData[1]} />
        <MetricCard tokens={tokens} label="Change Failure Rate" value={`${changeFailureRate} subsystems`} sub="Error rate > 3%" accent={changeFailureRate > 0 ? primitiveSignal.warning : primitiveData[2]} />
        <MetricCard tokens={tokens} label="MTTR" value={`${mttr}h`} sub="Mean time to resolution" accent={mttr > 8 ? primitiveSignal.warning : primitiveData[3]} />
      </section>

      {/* Throughput */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Case Throughput" value={`${throughputRate}%`} accent={throughputRate > 60 ? primitiveSignal.success : primitiveSignal.warning} />
        <KpiCard tokens={tokens} label="Avg CMMI Level" value={avgMaturity} accent={Number(avgMaturity) >= 4 ? primitiveSignal.success : primitiveSignal.warning} />
        <KpiCard tokens={tokens} label="Domains Assessed" value={String(cmmiDomains.length)} />
      </section>

      {/* CMMI Maturity Matrix */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>CMMI Maturity Assessment</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Domain', 'Current Level', 'Target', 'Gap', 'Evidence', 'Progress'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cmmiDomains.map((d) => {
                const pct = Math.round((d.level / d.target) * 100);
                const barColor = pct >= 80 ? primitiveSignal.success : pct >= 60 ? primitiveSignal.warning : primitiveSignal.critical;
                return (
                  <tr key={d.domain} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{d.domain}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold }}>{d.level}/5</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{d.target}/5</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: d.target - d.level > 0 ? primitiveSignal.warning : primitiveSignal.success, fontFamily: primitiveFonts.mono }}>-{d.target - d.level}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro }}>{d.evidence}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2] }}>
                        <div style={{ flex: 1, height: 8, background: tokens.border.subtle, borderRadius: 4 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{pct}%</span>
                      </div>
                    </td>
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

function MetricCard({ tokens, label, value, sub, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, borderTop: `3px solid ${accent}` }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{value}</span>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{sub}</span>
    </div>
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
