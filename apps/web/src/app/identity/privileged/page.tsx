'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { seedIdentities } from '../../../../../../packages/contracts/src/fixtures/seed-identities';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Identity & Access — Privileged Access
 *
 * Source: Unit 18 (Identity Intelligence Surface)
 * Data: identity.ts (privilegeLevel field) + seed-identities
 * Route: /identity/privileged | Nav Group: Identity & Access
 *
 * Displays: privileged identities filtered by privilegeLevel, risk scores, auth strength.
 */

export default function PrivilegedAccessPage() {
  const { tokens } = useMode();

  const privileged = seedIdentities.filter(
    (i) => i.privilegeLevel === 'privileged' || i.privilegeLevel === 'super-privileged'
  );
  const elevated = seedIdentities.filter((i) => i.privilegeLevel === 'elevated');
  const allPriv = [...privileged, ...elevated].sort((a, b) => b.riskScore - a.riskScore);

  const superPrivCount = seedIdentities.filter((i) => i.privilegeLevel === 'super-privileged').length;
  const privCount = seedIdentities.filter((i) => i.privilegeLevel === 'privileged').length;
  const elevCount = elevated.length;
  const highRiskPriv = allPriv.filter((i) => i.riskScore >= 60).length;

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
                        {i.displayName}
                      </a>
                      <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{i.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${i.privilegeLevel === 'super-privileged' ? 'bg-red-lt' : i.privilegeLevel === 'privileged' ? 'bg-orange-lt' : 'bg-yellow-lt'}`}>
                        {i.privilegeLevel}
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
                    <td className="text-end" style={{ color: i.riskScore >= 60 ? primitiveSignal.critical : i.riskScore >= 40 ? primitiveSignal.warning : tokens.text.muted }}>
                      {i.riskScore}
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
    </PageContainer>
  );
}
