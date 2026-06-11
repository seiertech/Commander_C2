'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { STREAM_LABELS, CLASS_TO_STREAM } from '../../../../../../packages/contracts/src/engines/intelligence-layer';
import { thesisAssets, thesisIdentities, thesisCases, thesisRiskObjects, thesisConnectors, thesisBlastRadius, thesisExposures, thesisPostures, thesisStrategies, thesisMissions, thesisRiskScores } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Internal Operating Picture — Thesis Layer
 *
 * Source: Thesis Internal Operating Picture, #60 Internal/External Attack Surface Framework;
 *         RBAC per DEC-sec-c2-internal-cop-rbac (Option C).
 *
 * SCOPE (Thesis):
 *   1. Internal attack surface inventory (internal_attack_surface assets/identities)
 *   2. Internal Behavioural Intelligence stream visualisation (Class B connectors) — AGGREGATE tier
 *   3. Internal attack surface case queue (cases with surface_attribution: internal_attack_surface)
 *   4. Internal attack surface risk objects
 *   5. Verdict pattern visualisation (Class B) — per-identity detail IR-overlay gated
 *   6. Drill paths to cases, assets, identities, verdict patterns
 *
 * RBAC (DEC-sec-c2-internal-cop-rbac, Option C):
 *   - AGGREGATE TIER (this surface's default `aggregate_only` view: inventory, aggregate stream
 *     health, case queue, risk objects, Policy Effectiveness aggregate) renders to base personas
 *     via route RBAC (CISO, SOM, Security Analyst, Identity/Access Specialist, Security Architect,
 *     Risk Analyst, Risk/Adherence/Audit). Route RBAC is backend-authoritative; frontend is
 *     presentation only (Thesis; Thesis.
 *   - PER-IDENTITY TIER (Identity Risk Pattern Visualisation, Geographic Anomaly Markers,
 *     per-identity verdict detail) is gated by the INTERNAL RISK AUTHORITY OVERLAY. AGGREGATE-ONLY
 *     is the DEFAULT: the per-identity tier renders as an access-gated placeholder. No per-identity
 *     behavioural data is fabricated (none exists until Class B ingestion — not built here).
 *   - Audit-of-access, hard tenant isolation, and jurisdiction-aware controls are mandatory and
 *     backend-authoritative. This surface renders the gate honestly; it does not implement its own
 *     auth runtime (none exists yet — held for the auth/entitlement scoped pass).
 *
 * Doctrinal constraints: consumes canonical seed fixtures only; surface attribution preserved
 * (internal-only view, Assertion 10); SOC read-only; no manual case creation; no fabricated
 * behavioural/verdict data (ai-grounding doctrine).
 *
 * Boundary: Operational App. Status: BUILD.
 */

const INTERNAL = 'internal_attack_surface';

/**
 * Whether the current viewer holds the Internal Risk authority overlay.
 * No auth runtime exists yet (held for the auth/entitlement scoped pass), so this is always
 * false here — the per-identity tier renders aggregate-only by default per
 * DEC-sec-c2-internal-cop-rbac. Backend enforcement is authoritative when the runtime lands.
 */
const VIEWER_HAS_INTERNAL_RISK_AUTHORITY = false as boolean;

export default function InternalOperatingPicturePage() {
  const { mode, tokens } = useMode();

  // ── 1. Internal attack surface inventory ──
  const internalAssets = thesisAssets.filter((a) => a.surface_attribution === INTERNAL);
  const internalIdentities = thesisIdentities.filter((i) => i.surface_attribution === INTERNAL);

  // ── 2. Internal Behavioural Intelligence stream — Class B connectors feed this stream (aggregate) ──
  const internalBehaviouralConnectors = thesisConnectors.filter((c) =>
    c.classes.some((cls) => CLASS_TO_STREAM[cls] === 'internal_behavioural'),
  );

  // ── 3. Internal attack surface case queue ──
  const internalCases = thesisCases
    .filter((c) => c.surface_attribution === INTERNAL)
    .sort((a, b) => {
      const order: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
    });

  // ── 4. Internal attack surface risk objects ──
  const internalEntityIds = new Set<string>([
    ...internalAssets.map((a) => a.asset_id),
    ...internalIdentities.map((i) => i.id),
    ...internalCases.map((c) => c.case_id),
  ]);
  const internalRiskObjects = thesisRiskObjects.filter((r) =>
    r.affected_entities?.some((id) => internalEntityIds.has(id)) || internalEntityIds.has(r.affected_entity_id),
  );

  const priorityBadge = (p: string) =>
    p === 'P0' ? 'bg-red' : p === 'P1' ? 'bg-orange' : p === 'P2' ? 'bg-yellow' : 'bg-secondary';

  return (
    <PageContainer
      pretitle="Operating Pictures › Internal"
      title="Internal Operating Picture"
      headerActions={
        <span className="badge bg-purple-lt">Internal Attack Surface · aggregate-only</span>
      }
    >
      {/* ── Internal attack surface inventory ── */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card"><div className="card-body">
            <div className="subheader mb-1">Internal Assets</div>
            <div className="h1 mb-0">{internalAssets.length}</div>
          </div></div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card"><div className="card-body">
            <div className="subheader mb-1">Internal Identities</div>
            <div className="h1 mb-0">{internalIdentities.length}</div>
          </div></div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card"><div className="card-body">
            <div className="subheader mb-1">Internal Cases</div>
            <div className="h1 mb-0">{internalCases.length}</div>
          </div></div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card"><div className="card-body">
            <div className="subheader mb-1">Internal Risk Objects</div>
            <div className="h1 mb-0">{internalRiskObjects.length}</div>
          </div></div>
        </div>
      </div>

      <div className="row row-deck row-cards mb-3">
        {/* Internal attack surface inventory — internal assets */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Internal Attack Surface Inventory</h3></div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <thead>
                    <tr><th>Asset</th><th>Classification</th><th>Environment</th><th className="text-end">Criticality</th></tr>
                  </thead>
                  <tbody>
                    {internalAssets.map((a) => (
                      <tr key={a.asset_id}>
                        <td><a href={`/assets?id=${a.asset_id}`} style={{ fontSize: primitiveTypeScale.body, color: tokens.action.primary }}>{a.asset_name}</a></td>
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

        {/* Internal Behavioural Intelligence stream — AGGREGATE health only */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{STREAM_LABELS.internal_behavioural}</h3>
              <div className="card-actions"><span className="badge bg-blue-lt">Aggregate</span></div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <thead>
                    <tr><th>Source (Class B)</th><th>State</th><th className="text-end">Last run</th></tr>
                  </thead>
                  <tbody>
                    {internalBehaviouralConnectors.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontSize: primitiveTypeScale.body }}>{c.name}</td>
                        <td>
                          <span className="status-dot me-2" style={{ display: 'inline-block', background: c.state === 'active' ? primitiveSignal.success : c.state === 'error' ? primitiveSignal.critical : primitiveSignal.neutral }} />
                          <span style={{ fontSize: primitiveTypeScale.caption }}>{c.state}</span>
                        </td>
                        <td className="text-end text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.last_run_status}</td>
                      </tr>
                    ))}
                    {internalBehaviouralConnectors.length === 0 && (
                      <tr><td colSpan={3} className="text-muted text-center" style={{ fontSize: primitiveTypeScale.caption }}>No Internal Behavioural stream sources active</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Verdict Density Overlay / Identity Risk Pattern — IR-OVERLAY GATED (aggregate-only default) ── */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="card" data-section="verdict-density-overlay">
            <div className="card-header">
              <h3 className="card-title">Verdict Density &amp; Identity Risk Pattern</h3>
              <div className="card-actions"><span className="badge bg-purple-lt">Internal Risk authority required</span></div>
            </div>
            <div className="card-body">
              {VIEWER_HAS_INTERNAL_RISK_AUTHORITY ? (
                <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.body }}>
                  Per-identity verdict density, Identity Risk Pattern Visualisation and Geographic Anomaly Markers bind
                  here once Class B (Internal Behavioural) ingestion is active. Access is audit-logged.
                </p>
              ) : (
                <div role="note" style={{ borderLeft: `3px solid ${primitiveSignal.warning}`, paddingLeft: '12px' }}>
                  <p className="mb-1" style={{ fontSize: primitiveTypeScale.body }}>
                    Per-identity verdict density, Identity Risk Pattern Visualisation and Geographic Anomaly Markers are
                    gated by the <strong>Internal Risk authority overlay</strong> and are not shown in the aggregate-only
                    default view.
                  </p>
                  <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.caption }}>
                    Unlocking the per-identity tier requires an Internal Risk authority grant (per-investigation, persistent,
                    or scoped) and is recorded via audit-of-access. Enforcement is backend-authoritative; tenant isolation
                    and jurisdiction-aware controls apply (DEC-sec-c2-internal-cop-rbac). No behavioural data is fabricated.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Internal case queue + internal risk objects ── */}
      <div className="row row-deck row-cards mb-3">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Internal Attack Surface Case Queue</h3>
              <div className="card-actions"><a href="/cases" className="btn btn-sm">All cases</a></div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <tbody>
                    {internalCases.map((c) => (
                      <tr key={c.case_id}>
                        <td style={{ width: '48px' }}><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                        <td><a href={`/cases/${c.case_id}`} style={{ fontSize: primitiveTypeScale.body, color: tokens.action.primary }}>{c.title}</a></td>
                        <td className="text-muted text-end" style={{ fontSize: primitiveTypeScale.caption, whiteSpace: 'nowrap' }}>{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Internal Risk Objects</h3></div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <tbody>
                    {internalRiskObjects.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontSize: primitiveTypeScale.body }}>{r.type}</td>
                        <td className="text-muted text-end" style={{ fontSize: primitiveTypeScale.caption }}>{r.treatment_state}</td>
                      </tr>
                    ))}
                    {internalRiskObjects.length === 0 && (
                      <tr><td colSpan={2} className="text-muted text-center" style={{ fontSize: primitiveTypeScale.caption }}>No internal risk objects</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drill paths ── */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Drill Paths</h3></div>
            <div className="card-body d-flex flex-wrap gap-3">
              <a href="/cases" className="btn">Cases</a>
              <a href="/assets" className="btn">Assets</a>
              <a href="/identity" className="btn">Identities</a>
              <a href="/operating-picture/external" className="btn">External Operating Picture</a>
            </div>
          </div>
        </div>
      </div>
    
      {/* Cross-Entity Relationship Panel — Sweep 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius</h4>
          {thesisBlastRadius.map((b) => (<div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span><span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} → {b.affected_entities.length}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>High Priority Cases</h4>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (<div key={c.case_id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span><span style={{ padding: '1px 6px', color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority} · {c.ooda_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Summary</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
          <div style={{ marginTop: primitiveSpacing[2], fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Avg score: {Math.round(thesisPostures.reduce((a,p) => a + p.posture_score, 0) / Math.max(thesisPostures.length, 1))}/100</div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Exposures ({thesisExposures.length})</h4>
          {thesisExposures.slice(0,4).map((e) => (<div key={e.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{e.exposure_type ?? e.surface ?? 'exposure'}</span><span style={{ color: e.severity === 'critical' ? primitiveSignal.critical : primitiveSignal.warning }}>{e.severity ?? 'medium'}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Connector Health</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisConnectors.filter((c) => c.state === 'active').length} active</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisConnectors.filter((c) => c.state === 'error').length} error</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.neutral }}>●</span> {thesisConnectors.filter((c) => c.state !== 'active' && c.state !== 'error').length} other</span>
          </div>
        </div>
      </div>
    
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
