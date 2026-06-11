'use client';

import { PageContainer } from '@/components/page-container';
import { STRATEGY_SURFACE_LABELS } from '../../../../../../packages/contracts/src/entities/strategy';
import type { StrategySurfaceType } from '../../../../../../packages/contracts/src/entities/strategy';
import { primitiveTypeScale, primitiveHud } from '../../../../../../packages/ui/src/tokens/primitives';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { thesisStrategies, thesisMissions, thesisRiskObjects, thesisCases, thesisBlastRadius, thesisExposures, thesisPostures, thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Strategy Centre — Unified Configuration Surface (Spec 43)
 *
 * Source: Thesis Strategy Layer Runtime Surface
 * Data: strategy.ts, seed-strategies
 * Use Cases: UC-140, UC-142, UC-144, UC-146
 * Route: /strategy/centre | Nav Group: Strategy
 *
 * Shows all 19 strategy surface types, their active policies, status, version.
 */

export default function StrategyCentrePage() {
  const policies = thesisStrategies;
  const activePolicies = policies.filter((p) => p.status === 'active');
  const pendingApproval = policies.filter((p) => p.status === 'pending-approval');
  const surfacesCovered = new Set(activePolicies.map((p) => p.surface_type)).size;

  // Build a lookup: surface → active policy
  const surfacePolicyMap = new Map<StrategySurfaceType, typeof policies[number]>();
  for (const p of activePolicies) {
    surfacePolicyMap.set(p.surface_type, p);
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="badge bg-green-lt">Active</span>;
      case 'pending-approval': return <span className="badge bg-yellow-lt">Pending</span>;
      case 'draft': return <span className="badge bg-azure-lt">Draft</span>;
      case 'superseded': return <span className="badge bg-secondary">Superseded</span>;
      case 'rejected': return <span className="badge bg-red-lt">Rejected</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <PageContainer
      pretitle="Strategy"
      title="Strategy Centre"
      headerActions={<span className="badge bg-blue-lt">{surfacesCovered}/19 surfaces covered</span>}
    >
      {/* KPI Strip */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Active Policies</div>
              <div className="h1 mb-0">{activePolicies.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Pending Approval</div>
              <div className="h1 mb-0">{pendingApproval.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Surfaces Covered</div>
              <div className="h1 mb-0">{surfacesCovered} / 19</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Simulation Running</div>
              <div className="h1 mb-0">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Surfaces Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Strategy Surfaces</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Surface Type</th>
                  <th>Active Policy</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(STRATEGY_SURFACE_LABELS) as StrategySurfaceType[]).map((surface) => {
                  const policy = surfacePolicyMap.get(surface);
                  return (
                    <tr key={surface}>
                      <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>
                        {STRATEGY_SURFACE_LABELS[surface]}
                      </td>
                      <td>
                        {policy ? (
                          <span className="text-truncate" style={{ maxWidth: 160 }}>
                            {policy.id.slice(0, 12)}…
                          </span>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </td>
                      <td>{policy?.policy_version ?? '—'}</td>
                      <td>{policy ? statusBadge(policy.status) : <span className="badge bg-secondary">No policy</span>}</td>
                      <td>{policy ? new Date(policy.updated_at).toLocaleDateString() : '—'}</td>
                      <td>
                        {policy?.approval ? (
                          <span className="badge bg-green-lt" title={`${policy.approval.approved_at ? new Date(policy.approval.approved_at).toLocaleDateString() : ''} — ${policy.approval.rationale ?? ''}`}>{policy.approval.approved_by}</span>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI-PLACEMENT: AICAP — Strategy policy recommendation engine */}
      {/* AI-PLACEMENT: AICAP — Strategy conflict resolution advisor */}
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{missionsCount} Missions</span>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{riskobjectsCount} Risk Objects</span>
        </div>
      </section>
    </PageContainer>
  );
}
