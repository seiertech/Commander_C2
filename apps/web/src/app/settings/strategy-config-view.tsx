'use client';

import { PageContainer } from '@/components/page-container';
import { seedStrategies } from '../../../../../packages/contracts/src/fixtures/seed-strategies';
import { primitiveTypeScale } from '../../../../../packages/ui/src/tokens/primitives';
import type { StrategySurfaceType } from '../../../../../packages/contracts/src/entities/strategy';
import { STRATEGY_SURFACE_LABELS } from '../../../../../packages/contracts/src/entities/strategy';

/**
 * Shared Tenant Admin Strategy Configuration View
 *
 * Renders a read-only display of a strategy surface's current policy configuration.
 * Used by all strategy-based tenant admin pages.
 */

interface StrategyConfigViewProps {
  surfaceType: StrategySurfaceType;
  pretitle: string;
  title: string;
}

export function StrategyConfigView({ surfaceType, pretitle, title }: StrategyConfigViewProps) {
  const policy = seedStrategies.find((s) => s.surfaceType === surfaceType);

  if (!policy) {
    return (
      <PageContainer pretitle={pretitle} title={title}>
        <div className="card">
          <div className="card-body">
            <p className="text-muted">No strategy policy configured for surface: {STRATEGY_SURFACE_LABELS[surfaceType] ?? surfaceType}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const config = policy.configuration as Record<string, unknown>;

  return (
    <PageContainer pretitle={pretitle} title={title} headerActions={<span className={`badge ${policy.status === 'active' ? 'bg-green-lt' : 'bg-secondary'}`}>{policy.status}</span>}>
      {/* Policy Metadata */}
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title">Policy Information</h3>
          <button className="btn btn-sm" disabled title="Not available in Phase 1">Edit — Phase 1 Read-Only</button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Surface</div>
              <div style={{ fontSize: primitiveTypeScale.body }}>{STRATEGY_SURFACE_LABELS[surfaceType]}</div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Version</div>
              <div style={{ fontSize: primitiveTypeScale.body }}>{policy.policyVersion}</div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Status</div>
              <div><span className={`badge ${policy.status === 'active' ? 'bg-green-lt' : 'bg-secondary'}`}>{policy.status}</span></div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Effective From</div>
              <div style={{ fontSize: primitiveTypeScale.caption }}>{policy.effectiveFrom ? new Date(policy.effectiveFrom).toLocaleDateString() : '—'}</div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Proposed By</div>
              <div style={{ fontSize: primitiveTypeScale.caption }}>{policy.proposedBy}</div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Approved By</div>
              <div style={{ fontSize: primitiveTypeScale.caption }}>{policy.approval?.approvedBy ?? '—'}</div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Rationale</div>
              <div style={{ fontSize: primitiveTypeScale.caption }}>{policy.approval?.rationale ?? '—'}</div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Simulation</div>
              <div style={{ fontSize: primitiveTypeScale.caption }}>{policy.simulationRef ?? 'None'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Values */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Configuration Values</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Key</th><th>Value</th></tr></thead>
              <tbody>
                {Object.entries(config).map(([key, value]) => (
                  <tr key={key}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{key}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption, maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {typeof value === 'object' ? JSON.stringify(value, null, 2).slice(0, 200) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-3 text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
        Strategy policy editing is not available in Phase 1. All values are baseline defaults from seed configuration.
      </div>
    </PageContainer>
  );
}
