// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { thesisSignals, thesisIntelligenceAssessments, thesisAssets, thesisIdentities, thesisCases, thesisRiskObjects, thesisConnectors, thesisAttackClassificationAudits } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { STREAM_LABELS, CLASS_TO_STREAM } from '../../../../../../packages/contracts/src/engines/intelligence-layer';

/**
 * External Operating Picture — Thesis §7 (Event & Intelligence Layer)
 *
 * Use Case: UC-INTEL-001 — View Intelligence Confidence Grading
 * Use Case: UC-INTEL-002 — View Normalised Signals
 * Entities: Signal, Intelligence_Assessment, Finding_Event (L3)
 * Standards: OCSF 1.3, NATO/Admiralty
 *
 * NEW in thesis: Intelligence confidence grading section showing
 * source_reliability (A-F) and information_credibility (1-6) per signal.
 */

const EXTERNAL = 'external_attack_surface';

export default function ExternalOperatingPicturePage() {
  const { tokens } = useMode();

  // ── 1. External attack surface inventory ──
  const externalAssets = thesisAssets.filter((a) => a.surface_attribution === EXTERNAL);
  const externalIdentities = thesisIdentities.filter((i) => i.surface_attribution === EXTERNAL);

  // ── 2. External Attack Intelligence stream — Class A connectors feed this stream ──
  const externalAttackConnectors = thesisConnectors.filter((c) =>
    c.classes.some((cls) => CLASS_TO_STREAM[cls] === 'external_attack'),
  );

  // ── 3. External attack surface case queue ──
  const externalCases = thesisCases
    .filter((c) => c.surface_attribution === EXTERNAL)
    .sort((a, b) => {
      const order: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
    });

  // ── 4. External attack surface risk objects (risk objects on external-attributed entities) ──
  const externalEntityIds = new Set<string>([
    ...externalAssets.map((a) => a.id),
    ...externalIdentities.map((i) => i.id),
    ...externalCases.map((c) => c.id),
  ]);
  const externalRiskObjects = thesisRiskObjects.filter((r) =>
    r.affected_entities?.some((id) => externalEntityIds.has(id)) || externalEntityIds.has(r.affected_entity_id),
  );

  const priorityBadge = (p: string) =>
    p === 'P0' ? 'bg-red' : p === 'P1' ? 'bg-orange' : p === 'P2' ? 'bg-yellow' : 'bg-secondary';

  return (
    <PageContainer
      pretitle="Operating Pictures › External"
      title="External Operating Picture"
      headerActions={
        <span className="badge" style={{ background: primitiveSignal.warning, color: '#fff' }}>
          External Attack Surface
        </span>
      }
    >
      {/* ── External Attack Surface Inventory ── */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card"><div className="card-body">
            <div className="subheader mb-1">External Assets</div>
            <div className="h1 mb-0">{externalAssets.length}</div>
          </div></div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card"><div className="card-body">
            <div className="subheader mb-1">External Identities</div>
            <div className="h1 mb-0">{externalIdentities.length}</div>
          </div></div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card"><div className="card-body">
            <div className="subheader mb-1">External Cases</div>
            <div className="h1 mb-0">{externalCases.length}</div>
          </div></div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card"><div className="card-body">
            <div className="subheader mb-1">External Risk Objects</div>
            <div className="h1 mb-0">{externalRiskObjects.length}</div>
          </div></div>
        </div>
      </div>

      <div className="row row-deck row-cards mb-3">
        {/* External attack surface inventory — internet-facing assets */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">External Attack Surface Inventory</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Classification</th>
                      <th>Environment</th>
                      <th className="text-end">Criticality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {externalAssets.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <a href={`/assets?id=${a.id}`} style={{ fontSize: primitiveTypeScale.body, color: tokens.action.primary }}>{a.name}</a>
                        </td>
                        <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{a.classification}</td>
                        <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{a.environment}</td>
                        <td className="text-end">{a.criticality}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* External Attack Intelligence stream visualisation */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{STREAM_LABELS.external_attack}</h3>
              <div className="card-actions">
                <a href="/commander-ai" className="btn btn-sm">Threat intel</a>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <thead>
                    <tr>
                      <th>Source (Class A)</th>
                      <th>State</th>
                      <th className="text-end">Last run</th>
                    </tr>
                  </thead>
                  <tbody>
                    {externalAttackConnectors.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontSize: primitiveTypeScale.body }}>{c.name}</td>
                        <td>
                          <span
                            className="status-dot me-2"
                            style={{ display: 'inline-block', background: c.state === 'active' ? primitiveSignal.success : c.state === 'error' ? primitiveSignal.critical : primitiveSignal.neutral }}
                          />
                          <span style={{ fontSize: primitiveTypeScale.caption }}>{c.state}</span>
                        </td>
                        <td className="text-end text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.last_run_status}</td>
                      </tr>
                    ))}
                    {externalAttackConnectors.length === 0 && (
                      <tr><td colSpan={3} className="text-muted text-center" style={{ fontSize: primitiveTypeScale.caption }}>No External Attack stream sources active</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── External attack surface case queue ── */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">External Attack Surface Case Queue</h3>
              <div className="card-actions">
                <a href="/cases" className="btn btn-sm">All cases</a>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <tbody>
                    {externalCases.map((c) => (
                      <tr key={c.id}>
                        <td style={{ width: '48px' }}>
                          <span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span>
                        </td>
                        <td>
                          <a href={`/cases/${c.id}`} style={{ fontSize: primitiveTypeScale.body, color: tokens.action.primary }}>{c.title}</a>
                        </td>
                        <td className="text-muted text-end" style={{ fontSize: primitiveTypeScale.caption, whiteSpace: 'nowrap' }}>{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* External attack surface risk objects */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">External Risk Objects</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <tbody>
                    {externalRiskObjects.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontSize: primitiveTypeScale.body }}>{r.type}</td>
                        <td className="text-muted text-end" style={{ fontSize: primitiveTypeScale.caption }}>{r.treatment_state}</td>
                      </tr>
                    ))}
                    {externalRiskObjects.length === 0 && (
                      <tr><td colSpan={2} className="text-muted text-center" style={{ fontSize: primitiveTypeScale.caption }}>No external risk objects</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Attack Classification Overlay (Spec #71) ── */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Attack Classification (Pre-Warned / Protected / Novel)</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <thead>
                    <tr>
                      <th>Entity</th>
                      <th>Type</th>
                      <th>Classification</th>
                      <th>Priority Impact</th>
                      <th>Posture</th>
                      <th>Classified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thesisAttackClassificationAudits.map((a) => {
                      const classColor = a.classification === 'PRE_WARNED' ? primitiveSignal.warning : a.classification === 'PROTECTED' ? primitiveSignal.info : primitiveSignal.neutral;
                      return (
                        <tr key={a.id}>
                          <td style={{ fontSize: primitiveTypeScale.body }}>{a.entity_ref}</td>
                          <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{a.entityType_target}</td>
                          <td><span className="badge" style={{ background: classColor, color: '#fff' }}>{a.classification}</span></td>
                          <td style={{ fontSize: primitiveTypeScale.caption, color: a.priority_impact > 0 ? primitiveSignal.critical : primitiveSignal.success }}>{a.priority_impact > 0 ? '+' : ''}{a.priority_impact}</td>
                          <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>drift:{a.posture_snapshot.drift_state} cov:{a.posture_snapshot.coverage_percent}%</td>
                          <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{new Date(a.classifiedAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                    {thesisAttackClassificationAudits.length === 0 && (
                      <tr><td colSpan={6} className="text-muted text-center" style={{ fontSize: primitiveTypeScale.caption }}>No classifications recorded</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Intelligence Confidence Grading (Thesis §7 — NATO/Admiralty) ── */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Intelligence Confidence Grading (NATO/Admiralty)</h3>
              <div className="card-actions">
                <span className="badge bg-blue-lt">Source Reliability A-F | Information Credibility 1-6</span>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <thead>
                    <tr>
                      <th>Signal</th>
                      <th>Source</th>
                      <th>Reliability</th>
                      <th>Credibility</th>
                      <th>Combined</th>
                      <th>Graded By</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thesisIntelligenceAssessments.map((ia) => {
                      const signal = thesisSignals.find((s) => s.signal_id === ia.signal_id);
                      const relColor = ia.source_reliability <= 'B' ? primitiveSignal.success : ia.source_reliability <= 'D' ? primitiveSignal.warning : primitiveSignal.critical;
                      const credColor = ia.information_credibility <= 2 ? primitiveSignal.success : ia.information_credibility <= 4 ? primitiveSignal.warning : primitiveSignal.critical;
                      return (
                        <tr key={ia.intelligence_assessment_id}>
                          <td style={{ fontSize: primitiveTypeScale.caption }}>{signal?.ocsf_class ?? ia.signal_id}</td>
                          <td style={{ fontSize: primitiveTypeScale.caption }}>{signal?.source_system ?? 'unknown'}</td>
                          <td><span className="badge" style={{ background: relColor, color: '#fff' }}>{ia.source_reliability}</span></td>
                          <td><span className="badge" style={{ background: credColor, color: '#fff' }}>{ia.information_credibility}</span></td>
                          <td style={{ fontWeight: 600 }}>{ia.combined_rating}</td>
                          <td style={{ fontSize: primitiveTypeScale.caption }} className="text-muted">{ia.graded_by}</td>
                          <td style={{ fontSize: primitiveTypeScale.caption }} className="text-muted">{new Date(ia.graded_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drill paths + scope note ── */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Drill Paths</h3></div>
            <div className="card-body d-flex flex-wrap gap-3">
              <a href="/cases" className="btn">Cases</a>
              <a href="/assets" className="btn">Assets</a>
              <a href="/identity" className="btn">Identities</a>
              <a href="/operating-picture/internal" className="btn">Internal Operating Picture</a>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
