'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useState } from 'react';
import { PageContainer } from '@/components/page-container';
import { STRATEGY_SURFACE_LABELS, STRATEGY_SURFACE_TYPES } from '../../../../../../packages/contracts/src/entities/strategy';
import type { StrategySurfaceType } from '../../../../../../packages/contracts/src/entities/strategy';
import { simulatePolicyChange } from '../../../../../../packages/contracts/src/engines/strategy-simulation-engine';
import { primitiveTypeScale, primitiveSignal, primitiveHud } from '../../../../../../packages/ui/src/tokens/primitives';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { thesisStrategies, thesisBlastRadius, thesisCases, thesisRiskObjects, thesisExposures, thesisPostures, thesisConnectors, thesisRiskScores, thesisActions, thesisIdentities, thesisMissions } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Policy Simulation — Strategy Simulation Surface (Spec 43)
 *
 * Source: Thesis Strategy Layer Runtime Surface
 * Data: strategy.ts, seed-strategies, strategy-simulation-engine.ts
 * Use Cases: UC-141
 * Route: /strategy/simulation | Nav Group: Strategy
 *
 * Shows simulation input (select surface, preview), blast radius summary,
 * conflict warnings, and risk assessment.
 */

export default function PolicySimulationPage() {
  const [selectedSurface, setSelectedSurface] = useState<StrategySurfaceType>('sla');

  // Simulate a policy change for the selected surface using existing active policy
  const activePolicy = thesisStrategies.find(
    (p) => p.surface_type === selectedSurface && p.status === 'active'
  );

  // Create a "proposed" policy for simulation (bump version)
  const proposedPolicy = activePolicy
    ? {
        ...activePolicy,
        id: `sim-proposed-${activePolicy.id}`,
        policy_version: activePolicy.policy_version.replace(/(\d+)$/, (m) => String(Number(m) + 1)),
        status: 'pending-approval' as const,
      }
    : null;

  const simulation = proposedPolicy
    ? simulatePolicyChange(proposedPolicy, thesisStrategies, 120)
    : null;

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-lt';
      case 'high': return 'bg-orange-lt';
      case 'medium': return 'bg-yellow-lt';
      case 'low': return 'bg-green-lt';
      default: return 'bg-secondary';
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'blocking': return 'bg-red-lt';
      case 'warning': return 'bg-yellow-lt';
      case 'info': return 'bg-azure-lt';
      default: return 'bg-secondary';
    }
  };

  return (
    <PageContainer
      pretitle="Strategy › Simulation"
      title="Policy Simulation"
      headerActions={
        simulation ? (
          <span className={`badge ${riskColor(simulation.risk_assessment.overallRisk)}`}>
            Risk: {simulation.risk_assessment.overallRisk.toUpperCase()}
          </span>
        ) : null
      }
    >
      {/* Surface Selection */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Simulation Input</h3>
        </div>
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-6">
              <label className="form-label">Strategy Surface</label>
              <select
                className="form-select"
                value={selectedSurface}
                onChange={(e) => setSelectedSurface(e.target.value as StrategySurfaceType)}
              >
                {STRATEGY_SURFACE_TYPES.map((s) => (
                  <option key={s} value={s}>{STRATEGY_SURFACE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Current Version</label>
              <div className="form-control-plaintext">
                {activePolicy?.policy_version ?? '—'}
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Proposed Version</label>
              <div className="form-control-plaintext">
                {proposedPolicy?.policy_version ?? '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {simulation && (
        <>
          {/* Blast Radius Summary */}
          <div className="row row-deck row-cards mb-3">
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="subheader">Scope</div>
                  <div className="h3 mb-0">{simulation.blast_radius.scope}</div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="subheader">Affected Entities</div>
                  <div className="h1 mb-0">{simulation.blast_radius.affected_entity_count}</div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="subheader">Affected Cases</div>
                  <div className="h1 mb-0">{simulation.blast_radius.affectedCaseCount}</div>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="subheader">Binding Events</div>
                  <div className="h3 mb-0">{simulation.blast_radius.affectedBindingEvents.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Conflicts */}
          {simulation.conflicts.length > 0 && (
            <div className="card mb-3">
              <div className="card-header">
                <h3 className="card-title">Conflict Warnings</h3>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead>
                      <tr>
                        <th>Severity</th>
                        <th>Conflicting Policy</th>
                        <th>Surface</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulation.conflicts.map((c, i) => (
                        <tr key={i}>
                          <td><span className={`badge ${severityColor(c.severity)}`}>{c.severity}</span></td>
                          <td style={{ fontSize: primitiveTypeScale.body }}>{c.conflictingPolicyId.slice(0, 16)}…</td>
                          <td>{STRATEGY_SURFACE_LABELS[c.conflictingSurface]}</td>
                          <td>{c.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Effective State Delta */}
          <div className="card mb-3">
            <div className="card-header">
              <h3 className="card-title">Effective State Preview</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h4 className="subheader">Config Keys Changed</h4>
                  {simulation.effectiveState.delta.length > 0 ? (
                    <ul className="list-unstyled">
                      {simulation.effectiveState.delta.map((key) => (
                        <li key={key}><code>{key}</code></li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-secondary">No configuration changes detected.</p>
                  )}
                </div>
                <div className="col-md-6">
                  <h4 className="subheader">Risk Assessment</h4>
                  <p>
                    <span className={`badge ${riskColor(simulation.risk_assessment.overallRisk)} me-2`}>
                      {simulation.risk_assessment.overallRisk.toUpperCase()}
                    </span>
                    {simulation.risk_assessment.recommendation}
                  </p>
                  {simulation.risk_assessment.factors.length > 0 && (
                    <ul>
                      {simulation.risk_assessment.factors.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* AI-PLACEMENT: AICAP — Simulation impact narrative generation */}
      {/* AI-PLACEMENT: AICAP — Automated rollback recommendation */}
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{blastradiusCount} Blast Radius</span>
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
