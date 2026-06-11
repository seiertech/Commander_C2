'use client';

import dynamic from 'next/dynamic';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal, primitiveData,
} from '../../../../../packages/ui/src/tokens/primitives';
import type { ApexOptions } from 'apexcharts';
import { thesisAssets, thesisConnectors, thesisExposures, thesisSecurityToolIntelligence, thesisCases, thesisBlastRadius, thesisRiskObjects, thesisPostures, thesisStrategies } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Coverage — Overview
 *
 * Standard: NIST CSF 2.0 (Identify, Protect, Detect)
 * Data: thesisAssets (coverage fields), thesisConnectors (active sources),
 *       thesisExposures (gaps), thesisSecurityToolIntelligence (tool effectiveness)
 * Route: /coverage | Nav Group: Coverage | Status: BUILD
 *
 * Shows which assets have EDR, vuln scanning, patch management, backup coverage.
 */

{/* AI-PLACEMENT: AICAP-COV-001 — Commander AI coverage gap identification */}

export default function CoverageOverviewPage() {
  const { mode, tokens } = useMode();

  const totalAssets = thesisAssets.length;
  const withEdr = thesisAssets.filter((a) => a.coverage?.has_edr).length;
  const withVulnScan = thesisAssets.filter((a) => a.coverage?.has_vuln_scan).length;
  const withPatch = thesisAssets.filter((a) => a.coverage?.has_patch_management).length;
  const withBackup = thesisAssets.filter((a) => a.coverage?.has_backup).length;
  const activeConnectors = thesisConnectors.filter((c) => c.state === 'active').length;
  const toolCount = thesisSecurityToolIntelligence.length;
  const exposureCount = thesisExposures.length;

  const coveragePct = (count: number) => totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;

  const chartOpts: ApexOptions = {
    chart: { type: 'radialBar', background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    plotOptions: { radialBar: { hollow: { size: '30%' }, dataLabels: { name: { fontSize: primitiveTypeScale.micro, color: tokens.text.muted }, value: { fontSize: primitiveTypeScale.h4, color: tokens.text.primary, formatter: (v) => `${v}%` } }, track: { background: tokens.border.subtle } } },
    labels: ['EDR', 'Vuln Scan', 'Patch Mgmt', 'Backup'],
    colors: [primitiveData[0], primitiveData[1], primitiveData[2], primitiveData[3]],
    legend: { show: true, position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.caption },
  };

  const chartSeries = [coveragePct(withEdr), coveragePct(withVulnScan), coveragePct(withPatch), coveragePct(withBackup)];

  return (
    <PageContainer pretitle="Coverage" title="Coverage Overview (NIST CSF)">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Assets" value={String(totalAssets)} />
        <KpiCard tokens={tokens} label="Active Connectors" value={`${activeConnectors}/${thesisConnectors.length}`} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Security Tools" value={String(toolCount)} />
        <KpiCard tokens={tokens} label="Open Exposures" value={String(exposureCount)} accent={exposureCount > 0 ? primitiveSignal.warning : undefined} />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        {/* Coverage Radial */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Asset Coverage by Type</h3>
          <Chart type="radialBar" height={300} options={chartOpts} series={chartSeries} />
        </div>

        {/* Coverage Detail KPIs */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Coverage Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: primitiveSpacing[4] }}>
            <CoverageBar tokens={tokens} label="EDR" count={withEdr} total={totalAssets} color={primitiveData[0]} />
            <CoverageBar tokens={tokens} label="Vulnerability Scanning" count={withVulnScan} total={totalAssets} color={primitiveData[1]} />
            <CoverageBar tokens={tokens} label="Patch Management" count={withPatch} total={totalAssets} color={primitiveData[2]} />
            <CoverageBar tokens={tokens} label="Backup" count={withBackup} total={totalAssets} color={primitiveData[3]} />
          </div>
        </div>
      </div>

      {/* Tool Intelligence Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Security Tool Intelligence</h3>
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
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: t.effectiveness_score >= 80 ? primitiveSignal.success : t.effectiveness_score >= 50 ? primitiveSignal.warning : primitiveSignal.critical }}>{t.effectiveness_score}%</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: t.status === 'active' ? primitiveSignal.success : tokens.text.muted }}>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* Cross-Entity Governance Panel — Sweep 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius</h4>
          {thesisBlastRadius.map((b) => (<div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span><span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} → {b.affected_entities.length}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Objects ({thesisRiskObjects.length})</h4>
          {thesisRiskObjects.map((r) => (<div key={r.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{r.type.replace(/_/g, ' ')}</span><span style={{ padding: '1px 6px', color: '#fff', background: r.treatment_state === 'open' ? primitiveSignal.warning : primitiveSignal.success }}>{r.treatment_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Linked Cases</h4>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (<div key={c.case_id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span><span style={{ padding: '1px 6px', color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority} · {c.ooda_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Overview</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function CoverageBar({ tokens, label, count, total, color }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ padding: primitiveSpacing[2] }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: primitiveSpacing[1] }}>
        <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary }}>{label}</span>
        <span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{count}/{total} ({pct}%)</span>
      </div>
      <div style={{ height: 8, background: tokens.border.subtle, borderRadius: 4 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
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
