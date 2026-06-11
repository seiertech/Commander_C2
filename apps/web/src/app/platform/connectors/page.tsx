'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { CONNECTOR_CLASS_LABELS } from '../../../../../../packages/contracts/src/entities/common';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisConnectors, thesisSystemPulse, thesisCases, thesisBlastRadius, thesisRiskObjects, thesisExposures, thesisPostures, thesisAssets, thesisStrategies, thesisMissions } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Platform — Connectors & Data Sources
 *
 * Source: Thesis (Connector Layer Foundation), Thesis (Mock Connectors)
 * Data: connector.ts + seed-connectors + connector-pull-orchestrator
 * Route: /platform/connectors | Nav Group: Platform
 *
 * Displays: connector inventory, class declarations, state, last run status.
 */

export default function PlatformConnectorsPage() {
  const { mode, tokens } = useMode();
  const connectors = thesisConnectors;

  const activeCount = connectors.filter((c) => c.state === 'active').length;
  const errorCount = connectors.filter((c) => c.state === 'error').length;
  const classBreakdown = { A: 0, B: 0, C: 0, D: 0 };
  connectors.forEach((c) => c.classes.forEach((cls) => { classBreakdown[cls]++; }));

  return (
    <PageContainer
      pretitle="Platform › Connectors & Data Sources"
      title="Connectors"
      headerActions={<span className="badge bg-blue-lt">{connectors.length} connectors</span>}
    >
      {/* KPI Tiles */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Active</div>
              <div className="h1 mb-0" style={{ color: '#2fb344' }}>{activeCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Error</div>
              <div className="h1 mb-0" style={{ color: primitiveSignal.critical }}>{errorCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Class A (SOC)</div>
              <div className="h1 mb-0">{classBreakdown.A}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Class D (Threat Intel)</div>
              <div className="h1 mb-0">{classBreakdown.D}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connector Table */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Connector Inventory</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Connector</th>
                  <th>Classes</th>
                  <th>Source Type</th>
                  <th>Tier</th>
                  <th>State</th>
                  <th>Last Run</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {connectors.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{c.name}</td>
                    <td>
                      {c.classes.map((cls) => (
                        <span key={cls} className="badge bg-blue-lt me-1" title={CONNECTOR_CLASS_LABELS[cls]}>
                          {cls}
                        </span>
                      ))}
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.source_type}</td>
                    <td><span className="badge bg-secondary">{c.tier}</span></td>
                    <td>
                      <span className={`badge ${c.state === 'active' ? 'bg-green-lt' : c.state === 'error' ? 'bg-red-lt' : 'bg-secondary'}`}>
                        {c.state}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
                      {c.last_run_at ? new Date(c.last_run_at).toLocaleString() : 'Never'}
                    </td>
                    <td>
                      <span className={`badge ${c.last_run_status === 'success' ? 'bg-green-lt' : c.last_run_status === 'failed' ? 'bg-red-lt' : 'bg-secondary'}`}>
                        {c.last_run_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{systempulseCount} System Pulse</span>
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
