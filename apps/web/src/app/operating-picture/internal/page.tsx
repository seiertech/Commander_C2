'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { seedAssets } from '../../../../../../packages/contracts/src/fixtures/seed-assets';
import { seedIdentities } from '../../../../../../packages/contracts/src/fixtures/seed-identities';
import { seedCases } from '../../../../../../packages/contracts/src/fixtures/seed-cases';
import { seedRiskObjects } from '../../../../../../packages/contracts/src/fixtures/seed-risk-objects';
import { seedConnectors } from '../../../../../../packages/contracts/src/fixtures/seed-connectors';
import { primitiveTypeScale, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { STREAM_LABELS, CLASS_TO_STREAM } from '../../../../../../packages/contracts/src/engines/intelligence-layer';

/**
 * Internal Operating Picture — Unit 21 (Surface Layer)
 *
 * Source: Spec #66 Internal Operating Picture, #60 Internal/External Attack Surface Framework;
 *         RBAC per DEC-sec-c2-internal-cop-rbac (Option C).
 *
 * SCOPE (Unit 21):
 *   1. Internal attack surface inventory (internal_attack_surface assets/identities)
 *   2. Internal Behavioural Intelligence stream visualisation (Class B connectors) — AGGREGATE tier
 *   3. Internal attack surface case queue (cases with surfaceAttribution: internal_attack_surface)
 *   4. Internal attack surface risk objects
 *   5. Verdict pattern visualisation (Class B) — per-identity detail IR-overlay gated
 *   6. Drill paths to cases, assets, identities, verdict patterns
 *
 * RBAC (DEC-sec-c2-internal-cop-rbac, Option C):
 *   - AGGREGATE TIER (this surface's default `aggregate_only` view: inventory, aggregate stream
 *     health, case queue, risk objects, Policy Effectiveness aggregate) renders to base personas
 *     via route RBAC (CISO, SOM, Security Analyst, Identity/Access Specialist, Security Architect,
 *     Risk Analyst, Risk/Adherence/Audit). Route RBAC is backend-authoritative; frontend is
 *     presentation only (Spec #50 §Backend Enforcement Rule; Spec #56 §8).
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
  const { tokens } = useMode();

  // ── 1. Internal attack surface inventory ──
  const internalAssets = seedAssets.filter((a) => a.surfaceAttribution === INTERNAL);
  const internalIdentities = seedIdentities.filter((i) => i.surfaceAttribution === INTERNAL);

  // ── 2. Internal Behavioural Intelligence stream — Class B connectors feed this stream (aggregate) ──
  const internalBehaviouralConnectors = seedConnectors.filter((c) =>
    c.classes.some((cls) => CLASS_TO_STREAM[cls] === 'internal_behavioural'),
  );

  // ── 3. Internal attack surface case queue ──
  const internalCases = seedCases
    .filter((c) => c.surfaceAttribution === INTERNAL)
    .sort((a, b) => {
      const order: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
    });

  // ── 4. Internal attack surface risk objects ──
  const internalEntityIds = new Set<string>([
    ...internalAssets.map((a) => a.id),
    ...internalIdentities.map((i) => i.id),
    ...internalCases.map((c) => c.id),
  ]);
  const internalRiskObjects = seedRiskObjects.filter((r) =>
    r.affectedEntities?.some((id) => internalEntityIds.has(id)) || internalEntityIds.has(r.affectedEntityId),
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
                      <tr key={a.id}>
                        <td><a href={`/assets?id=${a.id}`} style={{ fontSize: primitiveTypeScale.body, color: tokens.action.primary }}>{a.name}</a></td>
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
                        <td className="text-end text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{c.lastRunStatus}</td>
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
                      <tr key={c.id}>
                        <td style={{ width: '48px' }}><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                        <td><a href={`/cases/${c.id}`} style={{ fontSize: primitiveTypeScale.body, color: tokens.action.primary }}>{c.title}</a></td>
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
                        <td className="text-muted text-end" style={{ fontSize: primitiveTypeScale.caption }}>{r.treatmentState}</td>
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
    </PageContainer>
  );
}
