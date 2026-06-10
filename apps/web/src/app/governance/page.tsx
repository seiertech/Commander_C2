'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisControlFrameworks, thesisControlEvaluations } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Governance — Adherence Overview (Thesis §15 — Risk, Control & Adherence Layer)
 *
 * Use Case: UC-CTRL-001 — View Control Framework Adherence
 * Use Case: UC-GOV-001 — View Governance Decisions
 * Entities: Control_Reference, Control_State, Adherence_Assertion (L10)
 * Standards: NIST CSF, ISO 27001, COBIT
 *
 * Data: control-framework.ts + seed-control-frameworks
 * Route: /governance | Nav Group: Governance
 */

export default function GovernancePage() {
  const frameworks = thesisControlFrameworks;
  const evaluations = thesisControlEvaluations;
  const activeFrameworks = frameworks.filter((f) => f.active);

  return (
    <PageContainer pretitle="Assurance & Audit › Governance" title="Governance & Adherence" headerActions={<span className="badge bg-blue-lt">{activeFrameworks.length} active frameworks</span>}>
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Frameworks</div><div className="h1 mb-0">{frameworks.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Active</div><div className="h1 mb-0">{activeFrameworks.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Evaluations</div><div className="h1 mb-0">{evaluations.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Avg Mapping</div><div className="h1 mb-0">{frameworks.length > 0 ? Math.round(frameworks.reduce((s, f) => s + f.mappingCompleteness, 0) / frameworks.length) : 0}%</div></div></div></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Framework Adherence Status</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Framework</th><th>Category</th><th>Controls</th><th>Mapping</th><th>Licence</th><th>Status</th></tr></thead>
              <tbody>
                {frameworks.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{f.frameworkName}</td>
                    <td><span className={`badge ${f.category === 'regulatory' ? 'bg-purple-lt' : 'bg-blue-lt'}`}>{f.category}</span></td>
                    <td>{f.totalControls}</td>
                    <td>{f.mappingCompleteness}%</td>
                    <td><span className={`badge ${f.licenceStatus === 'open' ? 'bg-green-lt' : 'bg-orange-lt'}`}>{f.licenceStatus}</span></td>
                    <td><span className={`badge ${f.active ? 'bg-green-lt' : 'bg-red-lt'}`}>{f.active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* AI-PLACEMENT: AICAP-009 — Map evidence to control requirements for audit-ready adherence reports */}
    </PageContainer>
  );
}
