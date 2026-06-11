'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisVulnerabilityIntelligence, thesisRiskScores, thesisExposures, thesisAssets, thesisBlastRadius, thesisCases, thesisConnectors, thesisPostures } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Vulnerability Management — Overview
 *
 * Source: Platform Intelligence and IOC Distribution (Thesis)
 * Data: vulnerability-intelligence-record.ts + seed-vulnerability-intelligence
 * Route: /vulnerabilities | Nav Group: Vulnerability Management
 *
 * Displays: CVE inventory, CVSS scores, KEV status, EPSS scores, severity breakdown.
 * Phase 1: Renders from seed fixtures. No live connector data.
 */

export default function VulnerabilitiesPage() {
  const { tokens } = useMode();
  const vulns = thesisVulnerabilityIntelligence;
  const sorted = [...vulns].sort((a, b) => b.cvss_score - a.cvss_score);

  const kevCount = vulns.filter((v) => v.cisa_kev_status).length;
  const criticalCount = vulns.filter((v) => v.severity >= 4).length;
  const avgCvss = vulns.length > 0 ? (vulns.reduce((sum, v) => sum + v.cvss_score, 0) / vulns.length).toFixed(1) : '0';

  return (
    <PageContainer
      pretitle="Drift Operations › Vulnerability Management"
      title="Vulnerability Intelligence"
      headerActions={<span className="badge bg-blue-lt">{vulns.length} CVEs tracked</span>}
    >
      {/* KPI Tiles */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Total CVEs</div>
              <div className="h1 mb-0">{vulns.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">CISA KEV</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{kevCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Critical/High (Sev 4-5)</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.warning }}>{criticalCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Avg CVSS</div>
              <div className="h1 mb-0">{avgCvss}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerability Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">CVE Intelligence Feed</h3>
          <div className="card-actions text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
            Sorted by CVSS score (highest first)
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>CVE ID</th>
                  <th>CVSS</th>
                  <th>Severity</th>
                  <th>KEV</th>
                  <th>EPSS</th>
                  <th>State</th>
                  <th>Affected Products</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{v.cve_id}</td>
                    <td>
                      <span className={`badge ${v.cvss_score >= 9 ? 'bg-red' : v.cvss_score >= 7 ? 'bg-orange' : v.cvss_score >= 4 ? 'bg-yellow' : 'bg-secondary'}`}>
                        {v.cvss_score.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <SeverityIndicator severity={v.severity} />
                    </td>
                    <td>
                      {v.cisa_kev_status ? (
                        <span className="badge bg-red-lt">KEV</span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>—</span>
                      )}
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                      {v.epss_score !== null ? `${(v.epss_score * 100).toFixed(0)}%` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${v.cve_state === 'published' ? 'bg-green-lt' : 'bg-secondary'}`}>
                        {v.cve_state}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                      {v.affected_products.length > 0 ? v.affected_products.join(', ') : '—'}
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                      {new Date(v.published_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Placement */}
      {/* AI-PLACEMENT: AICAP-007 — Explain vulnerability context, prioritisation reasoning, and estate exposure for selected CVE */}
    

      {/* Cross-Entity: Vulnerability → Risk Correlation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Blast Radius from Vulns ({thesisBlastRadius.length})</h3>
          {thesisBlastRadius.map((b) => (
            <div key={b.id} style={{ padding: primitiveSpacing[2], borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,20)}</span>
              <span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>Impact: {b.total_impact_score}</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Vuln-Linked Cases ({thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').length} high priority)</h3>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (
            <div key={c.case_id} style={{ padding: primitiveSpacing[2], borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.primary }}>{c.case_id.slice(0,12)} — {c.ooda_state}</span>
              <span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Entity: Asset Posture Impact */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginTop: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Asset Posture (Vulnerability Exposure)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: primitiveSpacing[3] }}>
          <div style={{ padding: primitiveSpacing[3], background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, borderLeft: `3px solid ${primitiveSignal.success}` }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Healthy Posture</span><span style={{ fontSize: primitiveTypeScale.h4, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: primitiveSignal.success }}>{thesisPostures.filter((p) => p.posture_status === 'healthy').length}</span></div>
          <div style={{ padding: primitiveSpacing[3], background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, borderLeft: `3px solid ${primitiveSignal.warning}` }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Degraded</span><span style={{ fontSize: primitiveTypeScale.h4, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: primitiveSignal.warning }}>{thesisPostures.filter((p) => p.posture_status === 'degraded').length}</span></div>
          <div style={{ padding: primitiveSpacing[3], background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, borderLeft: `3px solid ${primitiveSignal.critical}` }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Critical</span><span style={{ fontSize: primitiveTypeScale.h4, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: primitiveSignal.critical }}>{thesisPostures.filter((p) => p.posture_status === 'critical').length}</span></div>
          <div style={{ padding: primitiveSpacing[3], background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, borderLeft: `3px solid ${primitiveSignal.info}` }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Active Connectors</span><span style={{ fontSize: primitiveTypeScale.h4, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisConnectors.filter((c) => c.state === 'active').length}</span></div>
        </div>
      </div>
    </PageContainer>
  );
}

function SeverityIndicator({ severity }: { severity: number }) {
  const shapes: Record<number, { shape: string; color: string; label: string }> = {
    5: { shape: '◆', color: primitiveSignal.critical, label: 'Critical' },
    4: { shape: '▲', color: primitiveSignal.warning, label: 'High' },
    3: { shape: '●', color: '#f59f00', label: 'Medium' },
    2: { shape: '■', color: '#74b816', label: 'Low' },
    1: { shape: '○', color: '#868e96', label: 'Info' },
  };
  const s = shapes[severity] || shapes[1];
  return (
    <span style={{ color: s.color, fontSize: primitiveTypeScale.body }}>
      {s.shape} {s.label}
    </span>
  );
}
