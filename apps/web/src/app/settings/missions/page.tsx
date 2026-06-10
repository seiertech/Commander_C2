'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisMissions, thesisMissionBindings } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Settings — Mission Configuration
 *
 * Source: Thesis Mission Objective Binding Model
 * Use Cases: UC-162 (create/edit mission with binding rules), UC-163 (bind entities), UC-166 (approve changes)
 * Data: mission.ts + seed-missions, mission-binding.ts + seed-mission-bindings
 * Route: /settings/missions | Boundary: operational
 */
export default function SettingsMissionsPage() {
  return (
    <PageContainer pretitle="Settings › Mission Control" title="Mission Configuration">
      {/* Mission list */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title">Strategic Missions</h3>
          <span className="badge bg-blue-lt">{thesisMissions.length} missions</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Mission</th>
                  <th>Status</th>
                  <th>Criticality</th>
                  <th>Scope</th>
                  <th>Bindings</th>
                  <th>Binding Rules</th>
                  <th>Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {thesisMissions.map((mission) => {
                  const bindings = thesisMissionBindings.filter((b) => b.mission_id === mission.id);
                  return (
                    <tr key={mission.id}>
                      <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{mission.name}</td>
                      <td>
                        <span className={`badge ${mission.status === 'active' ? 'bg-green-lt' : mission.status === 'draft' ? 'bg-secondary' : 'bg-blue-lt'}`}>
                          {mission.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${mission.criticality <= 2 ? 'bg-red-lt' : mission.criticality <= 3 ? 'bg-yellow-lt' : 'bg-secondary'}`}>
                          P{mission.criticality}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{mission.scope}</td>
                      <td>
                        <span className="badge bg-blue-lt">{bindings.length} bound</span>
                      </td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                        {mission.bindingRules.map((r: any) => `${r.rule_type}:${r.pattern}`).join(', ') || 'None'}
                      </td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                        {mission.reviewedBy ? `${mission.reviewedBy} (${new Date(mission.reviewedAt!).toLocaleDateString()})` : 'Pending'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Binding detail */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Entity Bindings</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Binding</th>
                  <th>Mission</th>
                  <th>Entity Type</th>
                  <th>Entity Ref</th>
                  <th>Method</th>
                  <th>Confidence</th>
                  <th>Bound By</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {thesisMissionBindings.map((binding) => (
                  <tr key={binding.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.caption }}>{binding.binding_id}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{binding.mission_id}</td>
                    <td><span className="badge bg-secondary">{binding.boundEntityType}</span></td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{binding.entity_ref}</td>
                    <td><span className="badge bg-blue-lt">{binding.bindingMethod.replace(/_/g, ' ')}</span></td>
                    <td>{binding.confidence}%</td>
                    <td className="text-muted">{binding.bound_by}</td>
                    <td>
                      <span className={`badge ${binding.active ? 'bg-green-lt' : 'bg-red-lt'}`}>
                        {binding.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
        Mission binding management (add/remove/approve) will be fully interactive in a future release. Current display is read-only from seed data.
      </div>
    </PageContainer>
  );
}
