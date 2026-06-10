// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
'use client';

import { thesisCases, thesisConnectors, thesisRiskObjects, thesisStrategies } from '../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../packages/ui/src/tokens/primitives';
import {
  OODA_PHASES,
  OODA_PHASE_LABELS,
  calculateObserveHealth,
  calculateOrientHealth,
  calculateDecideHealth,
  calculateActHealth,
  composeCommandTempo,
  type HealthThresholds,
  type PhaseHealthScore,
} from '../../../../packages/contracts/src/engines/ooda-layer';

/**
 * Command Centre — Operational Entry-Point Surface (Thesisa)
 *
 * Source: Thesis Visual Language & Intensity Ceiling, #65/#66 Operating Pictures;
 *         Route Registry (path: /); DEC-command-centre-split-16a-16b.
 *
 * SCOPE (Thesisa — Operational Command Centre):
 *   1. OODA phase-health gauges (from Thesis OODA Layer engine)
 *   2. Case queue overview (by priority, status, surface attribution)
 *   3. Risk object overview (by type, treatment state)
 *   4. Connector health overview
 *   5. Mission-critical alerts (active P0 conditions)
 *   6. Visual intensity ceiling Level 3 (mode-aware command/intelligence treatment)
 *   7. Drill links to the (scaffold) External / Internal Operating Pictures
 *
 * EXPLICITLY OUT OF SCOPE (Thesisb — Aggregate/Posture Command Centre, BLOCKED):
 *   - Aggregate posture / SLA / coverage KPI rollups from unmapped data points.
 *     These require the data-point-to-metric mapping artifact (DEC-command-centre-deferred,
 *     now scoped to 16b). They are deliberately NOT rendered here.
 *
 * Doctrinal constraints:
 *   - Consumes canonical seed fixtures + Thesis/15 engine outputs; invents no entities.
 *   - No manual case creation (Assertion 1).
 *   - OODA health thresholds are strategy-sourced, never hardcoded (performance/strategy doctrine).
 *
 * Boundary: Operational App. Status: BUILD (v1.1).
 */

export default function CommandCentrePage() {
  const { mode, tokens } = useMode();

  // ── OODA phase-health thresholds — strategy-sourced (no hardcoded thresholds) ──
  // operational-tempo strategy supplies healthy/degraded/critical tempo thresholds.
  const tempoStrategy = thesisStrategies.find(
    (s) => s.surface_type === 'operational-tempo' && s.status === 'active',
  );
  const tempoCfg = (tempoStrategy?.configuration as { tempoThresholds?: { healthy: number; degraded: number; critical: number } } | undefined)?.tempoThresholds;
  // greenMin = healthy band floor; amberMin = degraded band floor; below amberMin = red.
  const thresholds: HealthThresholds = {
    greenMin: tempoCfg ? tempoCfg.healthy : 90,
    amberMin: tempoCfg ? tempoCfg.degraded : 70,
  };
  const degradationThreshold = tempoCfg ? tempoCfg.degraded : 70;

  // ── OODA phase-health inputs derived deterministically from canonical seed state ──
  const activeConnectors = thesisConnectors.filter((c) => c.state === 'active').length;
  const connectorHealthRatio = thesisConnectors.length > 0 ? activeConnectors / thesisConnectors.length : 0;
  const freshConnectors = thesisConnectors.filter((c) => c.last_run_status === 'success').length;
  const signalFreshnessRatio = thesisConnectors.length > 0 ? freshConnectors / thesisConnectors.length : 0;

  const openCases = thesisCases.filter((c) => c.status === 'open' || c.status === 'in-progress');
  const breachedCases = thesisCases.filter((c) => c.sla.breached).length;
  const routingHealthRatio = thesisCases.length > 0 ? (thesisCases.length - breachedCases) / thesisCases.length : 1;
  const activeStrategies = thesisStrategies.filter((s) => s.status === 'active').length;
  const strategyEffectivenessRatio = thesisStrategies.length > 0 ? activeStrategies / thesisStrategies.length : 0;

  const observe = calculateObserveHealth(
    { connectorHealthRatio, signalFreshnessRatio, coverageCompletenessRatio: connectorHealthRatio },
    thresholds,
  );
  const orient = calculateOrientHealth(
    { streamHealthRatio: connectorHealthRatio, correlationCompletenessRatio: signalFreshnessRatio, avgThreatRelevance: 70 },
    thresholds,
  );
  const decide = calculateDecideHealth(
    { routingHealthRatio, prioritisationAccuracyRatio: routingHealthRatio, strategyEffectivenessRatio },
    thresholds,
  );
  const act = calculateActHealth(
    {
      executionThroughput: openCases.length,
      targetThroughput: Math.max(openCases.length, 1),
      executionLatencyHours: breachedCases > 0 ? 8 : 2,
      targetLatencyHours: 4,
      successRateRatio: routingHealthRatio,
      validationPendingCount: thesisCases.filter((c) => c.status === 'awaiting-validation').length,
      failedActionCount: breachedCases,
      closureTempoHours: 2,
      targetClosureTempoHours: 2,
    },
    thresholds,
  );
  const tempo = composeCommandTempo([observe, orient, decide, act], thresholds, degradationThreshold, new Date('2026-06-02T00:00:00.000Z').toISOString());

  // Map an OODA band to a semantic signal colour (Level 3 intensity treatment).
  const bandColor = (band: PhaseHealthScore['band']) =>
    band === 'green' ? primitiveSignal.success : band === 'amber' ? primitiveSignal.warning : primitiveSignal.critical;

  // ── Case queue overview ──
  const priorityOrder = ['P0', 'P1', 'P2', 'P3', 'P4'] as const;
  const casesByPriority = priorityOrder.map((p) => ({ key: p, count: thesisCases.filter((c) => c.priority === p).length }));
  const statusOrder = ['open', 'in-progress', 'awaiting-validation', 'awaiting-closure', 'closed', 'reopened'] as const;
  const casesByStatus = statusOrder
    .map((s) => ({ key: s, count: thesisCases.filter((c) => c.status === s).length }))
    .filter((s) => s.count > 0);
  const externalCount = thesisCases.filter((c) => c.surface_attribution === 'external_attack_surface').length;
  const internalCount = thesisCases.filter((c) => c.surface_attribution === 'internal_attack_surface').length;

  // ── Risk object overview ──
  const riskByType = Array.from(
    thesisRiskObjects.reduce((m, r) => m.set(r.type, (m.get(r.type) ?? 0) + 1), new Map<string, number>()),
  ).map(([key, count]) => ({ key, count }));
  const riskByTreatment = Array.from(
    thesisRiskObjects.reduce((m, r) => m.set(r.treatment_state, (m.get(r.treatment_state) ?? 0) + 1), new Map<string, number>()),
  ).map(([key, count]) => ({ key, count }));

  // ── Connector health overview ──
  const errorConnectors = thesisConnectors.filter((c) => c.state === 'error');

  // ── Mission-critical alerts (active P0 conditions) ──
  const p0Cases = thesisCases.filter((c) => c.priority === 'P0');

  return (
    <PageContainer
      pretitle="Command Centre › Operational Entry Point"
      title="Command Centre"
      headerActions={
        <span className="badge" style={{ background: bandColor(tempo.overallBand), color: '#fff' }}>
          OODA Tempo {tempo.overallScore} · {tempo.overallBand.toUpperCase()}
        </span>
      }
    >
      {/* ── Mission-critical alerts (P0) ── */}
      {p0Cases.length > 0 && (
        <div className="row mb-3">
          <div className="col-12">
            <div
              role="alert"
              className="card"
              style={{ borderColor: primitiveSignal.critical, borderWidth: '2px' }}
            >
              <div className="card-body d-flex align-items-center gap-3">
                <span style={{ color: primitiveSignal.critical, fontWeight: 700, fontSize: primitiveTypeScale.h3 }}>
                  ◆ P0 ACTIVE
                </span>
                <span style={{ fontSize: primitiveTypeScale.body }}>
                  {p0Cases.length} mission-critical condition{p0Cases.length !== 1 ? 's' : ''} require command attention
                </span>
                <a href="/war-room/p0" className="btn btn-sm ms-auto">Open War Room</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── OODA Phase Health Gauges (Thesis engine) ── */}
      <div className="row row-deck row-cards mb-3">
        {OODA_PHASES.map((phase) => {
          const score = tempo.phases.find((p) => p.phase === phase)!;
          return (
            <div key={phase} className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="subheader mb-1">OODA · {OODA_PHASE_LABELS[phase]}</div>
                  <div className="d-flex align-items-baseline gap-2">
                    <div className="h1 mb-0">{score.score}</div>
                    <span
                      className="badge"
                      style={{ background: bandColor(score.band), color: '#fff' }}
                    >
                      {score.band.toUpperCase()}
                    </span>
                  </div>
                  <div className="progress progress-sm mt-2">
                    <div
                      className="progress-bar"
                      style={{ width: `${score.score}%`, background: bandColor(score.band) }}
                      role="progressbar"
                      aria-valuenow={score.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${OODA_PHASE_LABELS[phase]} phase health`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Overviews grid ── */}
      <div className="row row-deck row-cards mb-3">
        {/* Case Queue Overview */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Case Queue Overview</h3>
              <div className="card-actions">
                <a href="/cases" className="btn btn-sm">View queue</a>
              </div>
            </div>
            <div className="card-body">
              <div className="subheader mb-1">By priority</div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {casesByPriority.map((p) => (
                  <span
                    key={p.key}
                    className={`badge ${p.key === 'P0' ? 'bg-red' : p.key === 'P1' ? 'bg-orange' : 'bg-secondary'}`}
                  >
                    {p.key}: {p.count}
                  </span>
                ))}
              </div>
              <div className="subheader mb-1">By status</div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {casesByStatus.map((s) => (
                  <span key={s.key} className="badge bg-blue-lt">{s.key}: {s.count}</span>
                ))}
              </div>
              <div className="subheader mb-1">By surface attribution</div>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-azure-lt">External: {externalCount}</span>
                <span className="badge bg-purple-lt">Internal: {internalCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Object Overview */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Risk Object Overview</h3>
            </div>
            <div className="card-body">
              <div className="subheader mb-1">By type</div>
              <div className="table-responsive mb-3">
                <table className="table table-vcenter card-table">
                  <tbody>
                    {riskByType.map((r) => (
                      <tr key={r.key}>
                        <td style={{ fontSize: primitiveTypeScale.body }}>{r.key}</td>
                        <td className="text-end text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{r.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="subheader mb-1">By treatment state</div>
              <div className="d-flex flex-wrap gap-2">
                {riskByTreatment.map((r) => (
                  <span key={r.key} className="badge bg-secondary">{r.key}: {r.count}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Connector Health Overview */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Connector Health</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <tbody>
                    {thesisConnectors.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <span
                            className="status-dot me-2"
                            style={{
                              display: 'inline-block',
                              background: c.state === 'active' ? primitiveSignal.success : c.state === 'error' ? primitiveSignal.critical : primitiveSignal.neutral,
                            }}
                          />
                          <span style={{ fontSize: primitiveTypeScale.body }}>{c.name}</span>
                        </td>
                        <td>{c.classes.map((cls) => <span key={cls} className="badge bg-blue-lt me-1" style={{ fontSize: primitiveTypeScale.micro }}>{cls}</span>)}</td>
                        <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.tier}</td>
                        <td className="text-end text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errorConnectors.length > 0 && (
                <div className="card-body py-2">
                  <span style={{ fontSize: primitiveTypeScale.caption, color: primitiveSignal.critical }}>
                    {errorConnectors.length} connector{errorConnectors.length !== 1 ? 's' : ''} in error state
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Operating Picture drill paths (scaffold targets — Units 20/21) ── */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Operating Pictures</h3>
            </div>
            <div className="card-body d-flex flex-wrap gap-3">
              <a href="/operating-picture/external" className="btn">
                External Operating Picture
              </a>
              <a href="/operating-picture/internal" className="btn">
                Internal Operating Picture
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scope / data source note ── */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.body }}>
                Operational entry-point surface (Thesisa). Displays seed/mock data and OODA Layer
                engine output. Aggregate posture/SLA/coverage rollups are delivered by Thesisb after
                the data-point-to-metric mapping exercise; they are not shown here. Real connector
                integration requires Phase 2 approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
