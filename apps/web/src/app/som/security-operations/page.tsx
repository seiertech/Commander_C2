'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisCases } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * SOM — Security Operations Manager (Thesis §12 — Capacity/Maturity/Performance)
 *
 * Use Case: UC-CAP-002 — View Process Maturity
 * Entities: Process_Maturity, Governance_Capability, Case_Capacity_Model (L8)
 * Standards: CMMI, COBIT, ITIL 4
 *
 * Management overview: team workload, case distribution, assignment health.
 */

export default function SecurityOperationsPage() {
  const cases = thesisCases;
  const openCases = cases.filter((c) => c.status !== 'closed_by_system' && c.status !== 'closed');

  // Team workload
  const teamMap = new Map<string, typeof cases>();
  cases.forEach((c) => {
    const list = teamMap.get(c.team) || [];
    list.push(c);
    teamMap.set(c.team, list);
  });
  const teams = [...teamMap.entries()].sort((a, b) => b[1].length - a[1].length);

  // Owner workload
  const ownerMap = new Map<string, typeof cases>();
  openCases.forEach((c) => {
    const list = ownerMap.get(c.owner) || [];
    list.push(c);
    ownerMap.set(c.owner, list);
  });
  const owners = [...ownerMap.entries()].sort((a, b) => b[1].length - a[1].length);

  const slaBreached = openCases.filter((c) => c.sla.breached).length;

  return (
    <PageContainer pretitle="SOM › Security Operations" title="Security Operations Manager" headerActions={<span className="badge bg-blue-lt">{openCases.length} open cases</span>}>
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Open Cases</div><div className="h1 mb-0">{openCases.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Teams</div><div className="h1 mb-0">{teams.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">Active Analysts</div><div className="h1 mb-0">{owners.length}</div></div></div></div>
        <div className="col-sm-6 col-lg-3"><div className="card"><div className="card-body"><div className="subheader">SLA Breached</div><div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{slaBreached}</div></div></div></div>
      </div>

      {/* Team Workload */}
      <div className="card mb-3">
        <div className="card-header"><h3 className="card-title">Team Workload</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Team</th><th>Total Cases</th><th>Open</th><th>Breached</th></tr></thead>
              <tbody>
                {teams.map(([team, teamCases]) => {
                  const open = teamCases.filter((c) => c.status !== 'closed_by_system' && c.status !== 'closed').length;
                  const breached = teamCases.filter((c) => c.sla.breached).length;
                  return (
                    <tr key={team}>
                      <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{team}</td>
                      <td>{teamCases.length}</td>
                      <td>{open}</td>
                      <td style={{ color: breached > 0 ? primitiveSignal.critical : undefined }}>{breached}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analyst Workload */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Analyst Assignment</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Analyst</th><th>Open Cases</th><th>Highest Priority</th></tr></thead>
              <tbody>
                {owners.map(([owner, ownerCases]) => {
                  const highest = ownerCases.reduce((h, c) => {
                    const prio = ['P0', 'P1', 'P2', 'P3', 'P4'].indexOf(c.priority);
                    return prio < h ? prio : h;
                  }, 4);
                  const prioLabel = ['P0', 'P1', 'P2', 'P3', 'P4'][highest];
                  return (
                    <tr key={owner}>
                      <td style={{ fontSize: primitiveTypeScale.body }}>{owner}</td>
                      <td>{ownerCases.length}</td>
                      <td><span className={`badge ${highest === 0 ? 'bg-red' : highest === 1 ? 'bg-orange' : 'bg-secondary'}`}>{prioLabel}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
