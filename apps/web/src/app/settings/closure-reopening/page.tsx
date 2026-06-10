'use client';
import { PageContainer } from '@/components/page-container';
import { STRATEGY_SURFACE_LABELS } from '../../../../../../packages/contracts/src/entities/strategy';
import { primitiveTypeScale } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisStrategies } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/** Tenant Admin — Closure & Reopening. Data: strategy.ts (closure-gate + reopening-trigger) + seed-strategies */
export default function SettingsClosureReopeningPage() {
  const closurePolicy = thesisStrategies.find((s) => s.surfaceType === 'closure-gate');
  const reopeningPolicy = thesisStrategies.find((s) => s.surfaceType === 'reopening-trigger');

  return (
    <PageContainer pretitle="Settings › Closure & Reopening" title="Closure & Reopening Strategy">
      {[closurePolicy, reopeningPolicy].filter(Boolean).map((policy) => (
        <div key={policy!.id} className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title">{STRATEGY_SURFACE_LABELS[policy!.surfaceType]}</h3>
            <div className="d-flex gap-2 align-items-center">
              <span className={`badge ${policy!.status === 'active' ? 'bg-green-lt' : 'bg-secondary'}`}>{policy!.status}</span>
              <button className="btn btn-sm" disabled>Edit — Phase 1 Read-Only</button>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-sm-4"><div className="subheader">Version</div><div style={{ fontSize: primitiveTypeScale.body }}>{policy!.policyVersion}</div></div>
              <div className="col-sm-4"><div className="subheader">Effective</div><div style={{ fontSize: primitiveTypeScale.caption }}>{policy!.effectiveFrom ? new Date(policy!.effectiveFrom).toLocaleDateString() : '—'}</div></div>
              <div className="col-sm-4"><div className="subheader">Approved By</div><div style={{ fontSize: primitiveTypeScale.caption }}>{policy!.approval?.approvedBy ?? '—'}</div></div>
            </div>
            <pre className="text-muted" style={{ fontSize: primitiveTypeScale.caption, maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(policy!.configuration, null, 2)}
            </pre>
          </div>
        </div>
      ))}
      <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>Strategy editing not available in Phase 1.</div>
    </PageContainer>
  );
}
