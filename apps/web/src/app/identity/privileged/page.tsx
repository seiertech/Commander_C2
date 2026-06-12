'use client';

import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal, primitiveSpacing, primitiveLetterSpacing, primitiveFontWeight } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisIdentities, thesisIdentityIntelligence, thesisRiskScores, thesisCases, thesisRiskObjects, thesisPostures, thesisExposures, thesisStrategies, thesisConnectors, thesisBlastRadius, thesisAssets, thesisMissions, thesisActions, thesisEvents, thesisSignals, thesisIocs } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';

/**
 * Identity & Access — Privileged Access
 *
 * Source: Thesis (Identity Intelligence Surface)
 * Data: identity.ts (privilegeLevel field) + seed-identities
 * Route: /identity/privileged | Nav Group: Identity & Access
 *
 * Displays: privileged identities filtered by privilegeLevel, risk scores, auth strength.
 */

export default function PrivilegedAccessPage() {
  const { mode, tokens } = useMode();
  const identityintelligenceCount = thesisIdentityIntelligence?.length ?? 0;

  const privileged = thesisIdentities.filter(
    (i) => i.privilege_level === 'privileged' || i.privilege_level === 'super-privileged'
  );
  const elevated = thesisIdentities.filter((i) => i.privilege_level === 'elevated');
  const allPriv = [...privileged, ...elevated].sort((a, b) => b.risk_score - a.risk_score);

  const superPrivCount = thesisIdentities.filter((i) => i.privilege_level === 'super-privileged').length;
  const privCount = thesisIdentities.filter((i) => i.privilege_level === 'privileged').length;
  const elevCount = elevated.length;
  const highRiskPriv = allPriv.filter((i) => i.risk_score >= 60).length;

  return (
    <PageContainer
      pretitle="Identity & Asset Intelligence › Identity › Privileged Access"
      title="Privileged Access"
      headerActions={<span className="badge bg-purple-lt">{allPriv.length} privileged identities</span>}
    >
      {/* KPI Tiles */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Super-Privileged</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{superPrivCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Privileged</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.warning }}>{privCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Elevated</div>
              <div className="h1 mb-0">{elevCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">High-Risk Privileged</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{highRiskPriv}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Privileged Identity Inventory</h3>
          <div className="card-actions text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
            Sorted by risk score (highest first)
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Privilege Level</th>
                  <th>Auth Strength</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th className="text-end">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {allPriv.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <a href={`/identity?id=${i.id}`} style={{ color: tokens.action.primary, fontSize: primitiveTypeScale.body }}>
                        {i.display_name}
                      </a>
                      <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{i.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${i.privilege_level === 'super-privileged' ? 'bg-red-lt' : i.privilege_level === 'privileged' ? 'bg-orange-lt' : 'bg-yellow-lt'}`}>
                        {i.privilege_level}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${i.authenticationStrength === 'phishing-resistant-mfa' ? 'bg-green-lt' : i.authenticationStrength === 'mfa-enabled' ? 'bg-blue-lt' : 'bg-red-lt'}`}>
                        {i.authenticationStrength ?? 'unknown'}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{i.department}</td>
                    <td>
                      <span className={`badge ${i.status === 'active' ? 'bg-green-lt' : i.status === 'suspended' ? 'bg-orange-lt' : 'bg-red-lt'}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="text-end" style={{ color: i.risk_score >= 60 ? primitiveSignal.critical : i.risk_score >= 40 ? primitiveSignal.warning : tokens.text.muted }}>
                      {i.risk_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Placement */}
      {/* AI-PLACEMENT: AICAP-004 — Explain identity risk factors for privileged accounts */}
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{identityintelligenceCount} Identity Intelligence</span>
        </div>
      </section>
    
      {/* Engine Correlation Chart — Sweep 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Distribution</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Open', 'Mitigated', 'Closed'], colors: [primitiveSignal.warning, primitiveSignal.success, primitiveSignal.neutral], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisRiskObjects.filter((r) => r.treatment_state === 'open').length, thesisRiskObjects.filter((r) => r.treatment_state === 'mitigated').length, thesisRiskObjects.filter((r) => r.treatment_state !== 'open' && r.treatment_state !== 'mitigated').length]} />
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Health</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Healthy', 'Degraded', 'Critical'], colors: [primitiveSignal.success, primitiveSignal.warning, primitiveSignal.critical], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisPostures.filter((p) => p.posture_status === 'healthy').length, thesisPostures.filter((p) => p.posture_status === 'degraded').length, thesisPostures.filter((p) => p.posture_status === 'critical').length]} />
        </div>
      </div>
    </PageContainer>
  );
}
