'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisIdentities, thesisRiskObjects } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Identity & Access — Access Drift
 *
 * Source: Thesis (Identity Intelligence Surface)
 * Data: identity.ts + risk-object.ts (identity_risk type)
 * Route: /identity/drift | Nav Group: Identity & Access
 *
 * Displays: identities with identity_risk risk objects, drift indicators, risk factors.
 */

export default function IdentityDriftPage() {
  const { tokens } = useMode();

  const identityRiskObjects = thesisRiskObjects.filter((r) => r.type === 'identity_risk');
  const affectedIdentityIds = new Set(
    identityRiskObjects.flatMap((r) => [r.affectedEntityId, ...(r.affectedEntities || [])])
  );
  const driftedIdentities = thesisIdentities.filter((i) => affectedIdentityIds.has(i.id));
  const sorted = [...driftedIdentities].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <PageContainer
      pretitle="Identity & Asset Intelligence › Identity › Access Drift"
      title="Access Drift"
      headerActions={<span className="badge bg-orange-lt">{identityRiskObjects.length} identity risk findings</span>}
    >
      {/* KPI Tiles */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Identity Risk Objects</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.warning }}>{identityRiskObjects.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Affected Identities</div>
              <div className="h1 mb-0">{driftedIdentities.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Open (Untreated)</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>
                {identityRiskObjects.filter((r) => r.treatmentState === 'open').length}
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Mitigated</div>
              <div className="h1 mb-0" style={{ color: '#2fb344' }}>
                {identityRiskObjects.filter((r) => r.treatmentState === 'mitigated').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Objects Table */}
      <div className="card mb-3">
        <div className="card-header"><h3 className="card-title">Identity Risk Findings</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Risk Object</th>
                  <th>Affected Entity</th>
                  <th>Treatment</th>
                  <th>Justification</th>
                </tr>
              </thead>
              <tbody>
                {identityRiskObjects.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{r.type}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{r.affectedEntityId}</td>
                    <td>
                      <span className={`badge ${r.treatmentState === 'open' ? 'bg-red-lt' : r.treatmentState === 'mitigated' ? 'bg-green-lt' : 'bg-secondary'}`}>
                        {r.treatmentState}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{r.justification}</td>
                  </tr>
                ))}
                {identityRiskObjects.length === 0 && (
                  <tr><td colSpan={4} className="text-muted text-center">No identity risk findings in seed data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Affected Identities */}
      {sorted.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">Affected Identities</h3></div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead>
                  <tr><th>Identity</th><th>Privilege</th><th>Status</th><th className="text-end">Risk</th></tr>
                </thead>
                <tbody>
                  {sorted.map((i) => (
                    <tr key={i.id}>
                      <td><a href={`/identity?id=${i.id}`} style={{ color: tokens.action.primary }}>{i.displayName}</a></td>
                      <td><span className="badge bg-orange-lt">{i.privilegeLevel ?? 'standard'}</span></td>
                      <td><span className={`badge ${i.status === 'active' ? 'bg-green-lt' : 'bg-red-lt'}`}>{i.status}</span></td>
                      <td className="text-end" style={{ color: i.riskScore >= 60 ? primitiveSignal.critical : tokens.text.muted }}>{i.riskScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Placement */}
      {/* AI-PLACEMENT: AICAP-004 — Explain identity drift patterns and recommend remediation */}
    </PageContainer>
  );
}
