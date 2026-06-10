// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisRiskObjects, thesisCases } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * SOM — Risk Manager
 * Data: risk-object.ts + case.ts
 * Route: /som/risk | Nav Group: SOM
 */
export default function SomRiskPage() {
  const risks = thesisRiskObjects;
  const openRisks = risks.filter((r) => r.treatment_state === 'open');
  const typeBreakdown = risks.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const p0p1Cases = thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1');

  return (
    <PageContainer pretitle="SOM › Risk Manager" title="Risk Manager" headerActions={<span className="badge bg-orange-lt">{openRisks.length} open risks</span>}>
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Total Risk Objects</div><div className="h1 mb-0">{risks.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Open</div><div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{openRisks.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">P0/P1 Cases</div><div className="h1 mb-0" style={{ color: primitiveSignal.warning }}>{p0p1Cases.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Risk Types</div><div className="h1 mb-0">{Object.keys(typeBreakdown).length}</div></div></div></div>
      </div>
      <div className="card mb-3">
        <div className="card-header"><h3 className="card-title">Risk Type Distribution</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Type</th><th>Count</th><th>Open</th></tr></thead>
              <tbody>
                {Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                  <tr key={type}><td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{type}</td><td>{count}</td><td>{risks.filter((r) => r.type === type && r.treatment_state === 'open').length}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="card"><div className="card-body"><p className="text-muted mb-0">Risk Aggregation & Scoring — requires dedicated risk-manager aggregation entity with quantified risk model.</p></div></div>
    </PageContainer>
  );
}
