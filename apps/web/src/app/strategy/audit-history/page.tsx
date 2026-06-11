'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { PageContainer } from '@/components/page-container';
import { STRATEGY_SURFACE_LABELS } from '../../../../../../packages/contracts/src/entities/strategy';
import { primitiveTypeScale, primitiveHud } from '../../../../../../packages/ui/src/tokens/primitives';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { thesisStrategies, thesisDecisionRecords, thesisCases, thesisBlastRadius, thesisRiskObjects, thesisExposures, thesisPostures, thesisConnectors, thesisActions } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Strategy Audit History — Policy Change Timeline (Spec 43)
 *
 * Source: Thesis Strategy Layer Runtime Surface
 * Data: strategy.ts, seed-strategies, audit-event.ts
 * Use Cases: UC-143
 * Route: /strategy/audit-history | Nav Group: Strategy
 *
 * Shows a timeline/table of policy changes with columns:
 * Date, Surface, Action, Policy Version, Changed By, Approval.
 */

interface AuditEntry {
  date: string;
  surface: string;
  action: string;
  policy_version: string;
  changedBy: string;
  approval: string;
}

export default function StrategyAuditHistoryPage() {
  // Derive audit entries from seed strategy policy data
  const auditEntries: AuditEntry[] = thesisStrategies.map((policy) => ({
    date: policy.updated_at,
    surface: STRATEGY_SURFACE_LABELS[policy.surface_type],
    action: policy.status === 'active' ? 'Activated' : policy.status === 'pending-approval' ? 'Submitted' : 'Created',
    policy_version: policy.policy_version,
    changedBy: policy.proposed_by,
    approval: policy.approval ? `${policy.approval.approved_by} (${policy.approval.condition})` : '—',
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const actionBadge = (action: string) => {
    switch (action) {
      case 'Activated': return <span className="badge bg-green-lt">Activated</span>;
      case 'Submitted': return <span className="badge bg-yellow-lt">Submitted</span>;
      case 'Created': return <span className="badge bg-azure-lt">Created</span>;
      default: return <span className="badge bg-secondary">{action}</span>;
    }
  };

  return (
    <PageContainer
      pretitle="Strategy › Audit"
      title="Strategy Audit History"
      headerActions={<span className="badge bg-blue-lt">{auditEntries.length} events</span>}
    >
      {/* Summary strip */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Total Events</div>
              <div className="h1 mb-0">{auditEntries.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Activations</div>
              <div className="h1 mb-0">{auditEntries.filter((e) => e.action === 'Activated').length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Pending Submissions</div>
              <div className="h1 mb-0">{auditEntries.filter((e) => e.action === 'Submitted').length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Surfaces Touched</div>
              <div className="h1 mb-0">{new Set(auditEntries.map((e) => e.surface)).size}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit History Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Policy Change History</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Surface</th>
                  <th>Action</th>
                  <th>Policy Version</th>
                  <th>Changed By</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {auditEntries.map((entry, i) => (
                  <tr key={i}>
                    <td>{new Date(entry.date).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>
                      {entry.surface}
                    </td>
                    <td>{actionBadge(entry.action)}</td>
                    <td><code>{entry.policy_version}</code></td>
                    <td>{entry.changedBy}</td>
                    <td>
                      {entry.approval !== '—' ? (
                        <span className="badge bg-green-lt">{entry.approval}</span>
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI-PLACEMENT: AICAP — Audit anomaly detection and alerting */}
      {/* AI-PLACEMENT: AICAP — Policy change impact narrative */}
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{decisionrecordsCount} Decision Records</span>
        </div>
      </section>
    
      {/* Interactive Chart Section — Sweep 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Distribution</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Open', 'Mitigated', 'Closed'], colors: [primitiveSignal.warning, primitiveSignal.success, primitiveSignal.neutral], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisRiskObjects.filter((r) => r.treatment_state === 'open').length, thesisRiskObjects.filter((r) => r.treatment_state === 'mitigated').length, thesisRiskObjects.filter((r) => r.treatment_state !== 'open' && r.treatment_state !== 'mitigated').length]} />
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Health</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Healthy', 'Degraded', 'Critical'], colors: [primitiveSignal.success, primitiveSignal.warning, primitiveSignal.critical], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisPostures.filter((p) => p.posture_status === 'healthy').length, thesisPostures.filter((p) => p.posture_status === 'degraded').length, thesisPostures.filter((p) => p.posture_status === 'critical').length]} />
        </div>
      </div>
    </PageContainer>
  );
}
