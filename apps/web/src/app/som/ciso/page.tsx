// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisCases, thesisAssets, thesisIdentities, thesisRiskObjects } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * SOM — CISO Dashboard
 *
 * Source: Thesis (Team 2, BLOCKED) — rendered from available aggregate data
 * Data: case.ts + risk-object.ts + asset.ts + identity.ts (aggregates)
 * Route: /som/ciso | Nav Group: SOM
 *
 * Management overview: aggregated posture across all domains.
 */

export default function CisoDashboardPage() {
  const cases = thesisCases;
  const p0Cases = cases.filter((c) => c.priority === 'P0');
  const p1Cases = cases.filter((c) => c.priority === 'P1');
  const openCases = cases.filter((c) => c.status !== 'closed_by_system' && c.status !== 'closed');
  const slaBreached = cases.filter((c) => c.sla.breached);
  const openRisks = thesisRiskObjects.filter((r) => r.treatment_state === 'open');
  const highRiskIdentities = thesisIdentities.filter((i) => i.risk_score >= 60);
  const criticalAssets = thesisAssets.filter((a) => a.criticality >= 4);

  return (
    <PageContainer pretitle="SOM › CISO Dashboard" title="CISO Dashboard" headerActions={<span className="badge bg-purple-lt">Executive View</span>}>
      {/* P0 Banner */}
      {p0Cases.length > 0 && (
        <div className="card mb-3" style={{ borderLeft: `4px solid ${primitiveSignal.critical}` }}>
          <div className="card-body d-flex align-items-center gap-3">
            <span style={{ fontSize: '24px', color: primitiveSignal.critical }}>◆</span>
            <div>
              <div style={{ fontWeight: 700, color: primitiveSignal.critical }}>P0 Active: {p0Cases.length} zero-day case(s)</div>
              <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>Immediate executive attention required</div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Tiles */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Open Cases</div><div className="h1 mb-0">{openCases.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">SLA Breached</div><div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{slaBreached.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Open Risk Objects</div><div className="h1 mb-0" style={{ color: primitiveSignal.warning }}>{openRisks.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Critical Assets</div><div className="h1 mb-0">{criticalAssets.length}</div></div></div></div>
      </div>

      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">P0 Cases</div><div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{p0Cases.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">P1 Cases</div><div className="h1 mb-0" style={{ color: primitiveSignal.warning }}>{p1Cases.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">High-Risk Identities</div><div className="h1 mb-0">{highRiskIdentities.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Total Assets</div><div className="h1 mb-0">{thesisAssets.length}</div></div></div></div>
      </div>

      {/* Priority Breakdown */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Case Priority Distribution</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Priority</th><th>Count</th><th>SLA Breached</th></tr></thead>
              <tbody>
                {(['P0', 'P1', 'P2', 'P3', 'P4'] as const).map((p) => {
                  const pCases = cases.filter((c) => c.priority === p);
                  const breached = pCases.filter((c) => c.sla.breached).length;
                  return (
                    <tr key={p}>
                      <td><span className={`badge ${p === 'P0' ? 'bg-red' : p === 'P1' ? 'bg-orange' : p === 'P2' ? 'bg-yellow' : 'bg-secondary'}`}>{p}</span></td>
                      <td>{pCases.length}</td>
                      <td style={{ color: breached > 0 ? primitiveSignal.critical : undefined }}>{breached}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI-PLACEMENT: AICAP-005 — Generate executive risk briefing from aggregated cases, risk objects, assets, identities */}
    </PageContainer>
  );
}
