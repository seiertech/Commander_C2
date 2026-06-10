'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal, primitiveFonts, primitiveSpacing, primitiveFontWeight, primitiveLetterSpacing } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisAssets, thesisConnectors, thesisCloudSecurityPosture } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * SOM — Cloud Security Manager
 * Data: asset.ts (cloudProvider field) + connector.ts + cloud-security-posture.ts
 * Route: /som/cloud-security | Nav Group: SOM
 */
export default function SomCloudSecurityPage() {
  const cloudAssets = thesisAssets.filter((a) => a.platform?.cloud_provider);
  const cloudProviders = cloudAssets.reduce((acc, a) => { const p = a.platform!.cloud_provider!; acc[p] = (acc[p] || 0) + 1; return acc; }, {} as Record<string, number>);
  const cloudConnectors = thesisConnectors.filter((c) => c.source_type.includes('aws') || c.source_type.includes('azure') || c.source_type.includes('gcp'));
  const avgAdherence = thesisCloudSecurityPosture.length ? Math.round(thesisCloudSecurityPosture.reduce((s, p) => s + p.adherence_score, 0) / thesisCloudSecurityPosture.length) : 0;
  const totalDrift = thesisCloudSecurityPosture.reduce((s, p) => s + p.driftCount, 0);
  const totalCritical = thesisCloudSecurityPosture.reduce((s, p) => s + p.criticalFindings, 0);

  return (
    <PageContainer pretitle="SOM › Cloud Security" title="Cloud Security Manager" headerActions={<span className="badge bg-blue-lt">{cloudAssets.length} cloud assets</span>}>
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Cloud Assets</div><div className="h1 mb-0">{cloudAssets.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Avg Adherence</div><div className="h1 mb-0" style={{ color: avgAdherence >= 85 ? primitiveSignal.success : avgAdherence >= 70 ? primitiveSignal.warning : primitiveSignal.critical }}>{avgAdherence}%</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Active Drift</div><div className="h1 mb-0" style={{ color: totalDrift > 0 ? primitiveSignal.warning : primitiveSignal.success }}>{totalDrift}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Critical Findings</div><div className="h1 mb-0" style={{ color: totalCritical > 0 ? primitiveSignal.critical : primitiveSignal.success }}>{totalCritical}</div></div></div></div>
      </div>

      {/* Cloud Security Posture per provider (UC-205) */}
      {thesisCloudSecurityPosture.map((posture) => (
        <div key={posture.id} className="card mb-3">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2] }}>
              <span style={{ textTransform: 'uppercase', fontWeight: primitiveFontWeight.bold }}>{posture.cloud_provider}</span>
              <span style={{ fontSize: primitiveTypeScale.micro, color: 'var(--tblr-secondary)', fontFamily: primitiveFonts.mono }}>{posture.accountId} · {posture.region}</span>
            </h3>
            <div className="card-actions">
              <span style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.bold, color: posture.adherence_score >= 85 ? primitiveSignal.success : posture.adherence_score >= 70 ? primitiveSignal.warning : primitiveSignal.critical }}>{posture.adherence_score}% compliant</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap', marginBottom: primitiveSpacing[3] }}>
              <div><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: 'var(--tblr-secondary)', textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Frameworks</span><span style={{ fontSize: primitiveTypeScale.caption }}>{posture.frameworks.join(', ')}</span></div>
              <div><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: 'var(--tblr-secondary)', textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Drift Count</span><span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono }}>{posture.driftCount}</span></div>
              <div><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: 'var(--tblr-secondary)', textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Critical</span><span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, color: posture.criticalFindings > 0 ? primitiveSignal.critical : 'inherit' }}>{posture.criticalFindings}</span></div>
              <div><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: 'var(--tblr-secondary)', textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Last Scan</span><span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono }}>{new Date(posture.lastScanAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span></div>
            </div>
            {posture.driftDetails.length > 0 && (
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <thead><tr><th>Resource</th><th>Rule</th><th>Severity</th><th>Detected</th><th>Description</th></tr></thead>
                  <tbody>
                    {posture.driftDetails.map((d) => (
                      <tr key={d.driftId}>
                        <td style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.caption }}>{d.resource}</td>
                        <td style={{ fontSize: primitiveTypeScale.caption }}>{d.rule}</td>
                        <td><span className={`badge bg-${d.severity === 'critical' ? 'danger' : d.severity === 'high' ? 'warning' : 'secondary'}-lt`}>{d.severity}</span></td>
                        <td style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(d.detectedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                        <td style={{ fontSize: primitiveTypeScale.micro }}>{d.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ))}

      {Object.keys(cloudProviders).length > 0 && (
        <div className="card mb-3">
          <div className="card-header"><h3 className="card-title">Cloud Provider Asset Distribution</h3></div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead><tr><th>Provider</th><th>Assets</th></tr></thead>
                <tbody>
                  {Object.entries(cloudProviders).map(([provider, count]) => (
                    <tr key={provider}><td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{provider}</td><td>{count}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
