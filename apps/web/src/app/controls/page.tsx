'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal, primitiveSpacing, primitiveLetterSpacing, primitiveFontWeight } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisControlFrameworks, thesisFrameworkControls, thesisControlEvaluations, thesisControlMappings, thesisStandardsDeclarations, thesisCases, thesisBlastRadius, thesisRiskObjects, thesisExposures, thesisPostures, thesisConnectors, thesisStrategies, thesisActions, thesisIdentities } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';

/**
 * Control Coverage — Overview
 *
 * Use Case: UC-CTRL-001. Entities: Control_Reference, Control_State (L10). Standards: NIST CSF, ISO 27001, COBIT
 * Data: control-framework.ts + seed-control-frameworks
 * Route: /controls | Nav Group: Controls
 *
 * Displays: framework inventory, control counts, mapping completeness, licence status.
 */

export default function ControlsPage() {
  const { mode, tokens } = useMode();
  const controlmappingsCount = thesisControlMappings?.length ?? 0;
  const standardsdeclarationsCount = thesisStandardsDeclarations?.length ?? 0;
  const frameworks = thesisControlFrameworks;
  const controls = thesisFrameworkControls;
  const evaluations = thesisControlEvaluations;

  const activeCount = frameworks.filter((f) => f.active).length;
  const totalControls = frameworks.reduce((sum, f) => sum + f.total_controls, 0);
  const avgCompleteness = frameworks.length > 0
    ? Math.round(frameworks.reduce((sum, f) => sum + f.mapping_completeness, 0) / frameworks.length)
    : 0;

  return (
    <PageContainer
      pretitle="Control & Architecture › Controls"
      title="Control Coverage"
      headerActions={<span className="badge bg-blue-lt">{frameworks.length} frameworks</span>}
    >
      {/* KPI Tiles */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Active Frameworks</div>
              <div className="h1 mb-0">{activeCount}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Total Controls</div>
              <div className="h1 mb-0">{totalControls}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Avg Mapping %</div>
              <div className="h1 mb-0">{avgCompleteness}%</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">Evaluations Run</div>
              <div className="h1 mb-0">{evaluations.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Framework Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Framework Inventory</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Version</th>
                  <th>Category</th>
                  <th>Controls</th>
                  <th>Mapping %</th>
                  <th>Licence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {frameworks.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{f.framework_name}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{f.version}</td>
                    <td>
                      <span className={`badge ${f.category === 'regulatory' ? 'bg-purple-lt' : f.category === 'industry' ? 'bg-blue-lt' : 'bg-secondary'}`}>
                        {f.category}
                      </span>
                    </td>
                    <td>{f.total_controls}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress" style={{ width: '60px', height: '6px' }}>
                          <div className="progress-bar bg-primary" style={{ width: `${f.mapping_completeness}%` }} />
                        </div>
                        <span style={{ fontSize: primitiveTypeScale.caption }}>{f.mapping_completeness}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${f.licence_status === 'open' ? 'bg-green-lt' : f.licence_status === 'restricted' ? 'bg-orange-lt' : 'bg-secondary'}`}>
                        {f.licence_status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${f.active ? 'bg-green-lt' : 'bg-red-lt'}`}>
                        {f.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Placement */}
      {/* AI-PLACEMENT: AICAP-009 — Map evidence findings to control requirements and produce audit-ready adherence reports */}
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{controlmappingsCount} Control Mappings</span>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{standardsdeclarationsCount} Standards Declarations</span>
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
