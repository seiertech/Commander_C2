'use client';

import { use } from 'react';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { thesisIdentities, thesisAssets, thesisCases, thesisIdentityIntelligence } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Identity Intelligence Surface — Thesis Layer
 *
 * Source: Thesis Identity Intelligence Surface; RBAC per DEC-sec-c2-internal-cop-rbac (Option C).
 *
 * SCOPE (Thesis) — six-section per-identity composition:
 *   1. Identity Overview      2. Access Intelligence   3. Behavioural Intelligence (IR-overlay gated)
 *   4. Threat Intelligence    5. Case History          6. Risk Trajectory
 * List → detail (/identity?id=<id>) selection; drill paths to cases, assets, threat intel.
 *
 * RBAC (DEC-sec-c2-internal-cop-rbac):
 *   - AGGREGATE TIER (this surface's overview/access/threat-external/case-history/risk-trajectory)
 *     renders to base personas: Identity/Access Specialist, Security Architect, Security Analyst,
 *     CISO, SOM (route RBAC enforced at the registry/backend layer — frontend is presentation only).
 *   - PER-IDENTITY BEHAVIOURAL TIER (§3.3 Behavioural Intelligence, internal-threat detail) is gated
 *     by the INTERNAL RISK AUTHORITY OVERLAY. AGGREGATE-ONLY is the DEFAULT: the behavioural tier is
 *     rendered as an access-gated placeholder until (a) an Internal Risk authority grant is present
 *     AND (b) Class B (Internal Behavioural) ingestion exists. No per-identity behavioural data is
 *     fabricated (ai-grounding / no-estate-fact-invention doctrine).
 *   - Audit-of-access, hard tenant isolation and jurisdiction-aware enforcement are mandatory and are
 *     enforced at the API/backend layer (Thesis; Thesis. This
 *     surface does not implement its own auth runtime (none exists yet — held for the auth/entitlement
 *     scoped pass); it renders the gate honestly rather than faking enforcement.
 *
 * Doctrinal constraints: consumes canonical seed fixtures only; surface attribution preserved;
 * SOC read-only; no manual case creation.
 *
 * Boundary: Operational App. Status: BUILD.
 */

/**
 * Whether the current viewer holds the Internal Risk authority overlay.
 * No auth runtime exists yet (held for the auth/entitlement scoped pass), so this is
 * always false here — the per-identity behavioural tier renders aggregate-only by default
 * per DEC-sec-c2-internal-cop-rbac. Backend enforcement is authoritative when the runtime lands.
 */
const VIEWER_HAS_INTERNAL_RISK_AUTHORITY = false as boolean;

export default function IdentityIntelligencePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = use(searchParams);
  const { tokens } = useMode();

  const selected = id ? thesisIdentities.find((i) => i.id === id) : undefined;

  // ── List view ──
  if (!selected) {
    const sorted = [...thesisIdentities].sort((a, b) => b.risk_score - a.risk_score);
    return (
      <PageContainer
        pretitle="Identity & Asset Intelligence › Identities"
        title="Identity Intelligence"
        headerActions={<span className="badge bg-blue-lt">{thesisIdentities.length} identities</span>}
      >
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Identity Inventory</h3>
            <div className="card-actions text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
              Aggregate tier · select an identity for its six-section intelligence composition
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead>
                  <tr><th>Identity</th><th>Classification</th><th>Department</th><th>Status</th><th className="text-end">Risk</th></tr>
                </thead>
                <tbody>
                  {sorted.map((i) => (
                    <tr key={i.id}>
                      <td><a href={`/identity?id=${i.id}`} style={{ color: tokens.action.primary, fontSize: primitiveTypeScale.body }}>{i.display_name}</a></td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{i.classification}</td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{i.department}</td>
                      <td>
                        <span className={`badge ${i.status === 'active' ? 'bg-green-lt' : i.status === 'suspended' ? 'bg-orange-lt' : 'bg-secondary'}`}>{i.status}</span>
                      </td>
                      <td className="text-end" style={{ color: i.risk_score >= 50 ? primitiveSignal.critical : tokens.text.muted }}>{i.risk_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const i = selected;
  const caseHistory = thesisCases.filter((c) => c.related_entities.includes(i.id));
  const relatedAssets = thesisAssets.filter((a) => i.associated_assets.includes(a.asset_id));

  return (
    <PageContainer
      pretitle="Identity & Asset Intelligence › Identity"
      title={i.display_name}
      headerActions={
        <span className={`badge ${i.surface_attribution === 'external_attack_surface' ? 'bg-azure-lt' : 'bg-purple-lt'}`}>
          {i.surface_attribution === 'external_attack_surface' ? 'External Attack Surface' : 'Internal Attack Surface'}
        </span>
      }
    >
      <div className="mb-3">
        <a href="/identity" style={{ fontSize: primitiveTypeScale.caption, color: tokens.action.primary }}>← All identities</a>
      </div>

      {/* 1. Identity Overview */}
      <div className="card mb-3" data-section="identity-overview">
        <div className="card-header"><h3 className="card-title">Identity Overview</h3></div>
        <div className="card-body">
          <div className="row g-3">
            <Field label="Classification" value={i.classification} />
            <Field label="Role" value={i.role} />
            <Field label="Department" value={i.department} />
            <Field label="Status" value={i.status} />
            <Field label="Privilege" value={i.privilege_level ?? 'unknown'} />
            <Field label="Auth Strength" value={i.authenticationStrength ?? 'unknown'} />
            <Field label="Last Authenticated" value={i.lastAuthenticatedAt ? new Date(i.lastAuthenticatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'unknown'} />
            <Field label="Surface" value={i.surface_attribution === 'external_attack_surface' ? 'External' : 'Internal'} />
            <Field label="Risk Score" value={String(i.risk_score)} alert={i.risk_score >= 50} />
          </div>
        </div>
      </div>

      {/* 2. Access Intelligence */}
      <div className="card mb-3" data-section="access-intelligence">
        <div className="card-header"><h3 className="card-title">Access Intelligence</h3></div>
        <div className="card-body">
          {i.entitlementSummary ? (
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge bg-secondary">Entitlements: {i.entitlementSummary.totalEntitlements}</span>
              <span className="badge bg-orange-lt">Privileged: {i.entitlementSummary.privilegedEntitlements}</span>
              <span className="badge bg-yellow-lt">Stale: {i.entitlementSummary.staleEntitlements}</span>
              {i.entitlementSummary.hasAdminAccess && <span className="badge bg-red-lt">Admin access</span>}
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>Entitlement summary not yet computed for this identity.</p>
          )}
          <div className="subheader mb-1">Associated assets</div>
          {relatedAssets.length > 0 ? (
            <div className="d-flex flex-column gap-1">
              {relatedAssets.map((a) => (
                <a key={a.asset_id} href={`/assets?id=${a.asset_id}`} style={{ fontSize: primitiveTypeScale.body, color: tokens.action.primary }}>{a.asset_name}</a>
              ))}
            </div>
          ) : (
            <span className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>No associated assets recorded</span>
          )}
        </div>
      </div>

      {/* 3. Behavioural Intelligence — INTERNAL RISK OVERLAY GATED (aggregate-only default) */}
      <div className="card mb-3" data-section="behavioural-intelligence">
        <div className="card-header">
          <h3 className="card-title">Behavioural Intelligence</h3>
          <div className="card-actions">
            <span className="badge bg-purple-lt">Internal Risk authority required</span>
          </div>
        </div>
        <div className="card-body">
          {VIEWER_HAS_INTERNAL_RISK_AUTHORITY ? (
            <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.body }}>
              Per-identity behavioural detail binds here once Class B (Internal Behavioural) ingestion is active.
              Access is audit-logged.
            </p>
          ) : (
            <div role="note" style={{ borderLeft: `3px solid ${primitiveSignal.warning}`, paddingLeft: '12px' }}>
              <p className="mb-1" style={{ fontSize: primitiveTypeScale.body }}>
                Behavioural Intelligence (verdict history, anomaly indicators, per-disposition breakdown) is gated by the
                <strong> Internal Risk authority overlay</strong> and is not shown in the aggregate-only default view.
              </p>
              <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.caption }}>
                Unlocking the per-identity behavioural tier requires an Internal Risk authority grant (per-investigation,
                persistent, or scoped) and is recorded via audit-of-access. Enforcement is backend-authoritative
                (DEC-sec-c2-internal-cop-rbac). No behavioural data is fabricated.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Threat Intelligence — external aggregate shown; internal-threat detail IR-gated */}
      <div className="card mb-3" data-section="threat-intelligence">
        <div className="card-header"><h3 className="card-title">Threat Intelligence</h3></div>
        <div className="card-body">
          <p className="mb-1" style={{ fontSize: primitiveTypeScale.body }}>
            External threat context (campaign exposure, breach-database matches, identity-relevant CVEs) binds here from
            the External Threat stream.
          </p>
          <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.caption }}>
            Internal-threat detail for this identity is gated by the Internal Risk authority overlay (aggregate-only default).
          </p>
        </div>
      </div>

      {/* 5. Case History */}
      <div className="card mb-3" data-section="case-history">
        <div className="card-header"><h3 className="card-title">Case History</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <tbody>
                {caseHistory.map((c) => (
                  <tr key={c.case_id}>
                    <td style={{ width: '48px' }}><span className={`badge ${c.priority === 'P0' ? 'bg-red' : c.priority === 'P1' ? 'bg-orange' : 'bg-secondary'}`}>{c.priority}</span></td>
                    <td><a href={`/cases/${c.case_id}`} style={{ color: tokens.action.primary, fontSize: primitiveTypeScale.body }}>{c.title}</a></td>
                    <td className="text-muted text-end" style={{ fontSize: primitiveTypeScale.caption }}>{c.status}</td>
                  </tr>
                ))}
                {caseHistory.length === 0 && (
                  <tr><td className="text-muted text-center" style={{ fontSize: primitiveTypeScale.caption }}>No cases involving this identity</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Risk Trajectory */}
      <div className="card mb-3" data-section="risk-trajectory">
        <div className="card-header"><h3 className="card-title">Risk Trajectory</h3></div>
        <div className="card-body">
          <div className="d-flex align-items-baseline gap-2 mb-2">
            <span className="h1 mb-0" style={{ color: i.risk_score >= 50 ? primitiveSignal.critical : tokens.text.primary }}>{i.risk_score}</span>
            <span className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>composite risk score (0–100)</span>
          </div>
          {i.riskFactors && i.riskFactors.length > 0 ? (
            <div className="d-flex flex-column gap-1">
              {i.riskFactors.map((f, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2">
                  <span className="badge bg-orange-lt">{f.type}</span>
                  <span style={{ fontSize: primitiveTypeScale.caption }}>{f.description}</span>
                  <span className="text-muted ms-auto" style={{ fontSize: primitiveTypeScale.micro }}>+{f.contribution}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.caption }}>
              Risk-factor breakdown and trajectory chart bind here as risk-factor data is computed.
            </p>
          )}
        </div>
      </div>

      {/* Drill paths */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Drill Paths</h3></div>
        <div className="card-body d-flex flex-wrap gap-3">
          <a href="/cases" className="btn">Cases</a>
          <a href="/assets" className="btn">Assets</a>
          <a href="/operating-picture/internal" className="btn">Internal Operating Picture</a>
        </div>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{identityintelligenceCount} Identity Intelligence</span>
        </div>
      </section>
    </PageContainer>
  );
}

function Field({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  const { tokens } = useMode();
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="subheader mb-1">{label}</div>
      <div style={{ fontSize: primitiveTypeScale.body, color: alert ? primitiveSignal.critical : tokens.text.primary }}>{value}</div>
    </div>
  );
}
