'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { seedVulnerabilityIntelligence } from '../../../../../packages/contracts/src/fixtures/seed-vulnerability-intelligence';
import { primitiveTypeScale, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';

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
  const vulns = seedVulnerabilityIntelligence;
  const sorted = [...vulns].sort((a, b) => b.cvssScore - a.cvssScore);

  const kevCount = vulns.filter((v) => v.cisaKevStatus).length;
  const criticalCount = vulns.filter((v) => v.severity >= 4).length;
  const avgCvss = vulns.length > 0 ? (vulns.reduce((sum, v) => sum + v.cvssScore, 0) / vulns.length).toFixed(1) : '0';

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
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{v.cveId}</td>
                    <td>
                      <span className={`badge ${v.cvssScore >= 9 ? 'bg-red' : v.cvssScore >= 7 ? 'bg-orange' : v.cvssScore >= 4 ? 'bg-yellow' : 'bg-secondary'}`}>
                        {v.cvssScore.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <SeverityIndicator severity={v.severity} />
                    </td>
                    <td>
                      {v.cisaKevStatus ? (
                        <span className="badge bg-red-lt">KEV</span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>—</span>
                      )}
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                      {v.epssScore !== null ? `${(v.epssScore * 100).toFixed(0)}%` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${v.cveState === 'published' ? 'bg-green-lt' : 'bg-secondary'}`}>
                        {v.cveState}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                      {v.affectedProducts.length > 0 ? v.affectedProducts.join(', ') : '—'}
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                      {new Date(v.publishedAt).toLocaleDateString()}
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
