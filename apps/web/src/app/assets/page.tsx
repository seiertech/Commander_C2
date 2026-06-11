'use client';

import { use } from 'react';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { STREAM_LABELS } from '../../../../../packages/contracts/src/engines/intelligence-layer';
import { thesisAssets, thesisCases, thesisIdentities, thesisRiskObjects, thesisPostures, thesisBlastRadius, thesisExposures, thesisConnectors } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Asset Intelligence Surface — Thesis §8 (Asset Authority Layer)
 *
 * Use Case: UC-ASSET-001 — View Asset Inventory
 * Use Case: UC-ASSET-002 — View Asset Classification
 * Use Case: UC-ASSET-003 — View Asset Ownership
 * Entities: Asset (L4), Asset_Classification (L5), Software_Instance (L4)
 * Standards: ISO/IEC 19770-1:2017, NIST CSF 2.0 (ID.AM)
 *
 * Seven-section composition for a selected asset:
 *   1. Asset Overview      2. Configuration State   3. Verdict History
 *   4. Behavioural Pattern 5. Case History          6. Vulnerability State
 *   7. Identity Exposure
 *
 * Selection model: /assets lists assets; /assets?id=<assetId> foregrounds one
 * asset's seven-section composition.
 *
 * Doctrinal constraints:
 *   - Surface attribution preserved on overview.
 *   - No enhanced-governance/RBAC overlay.
 *   - Verdict/Behavioural sections are source-fed; where no data exists
 *     they render "awaiting connector data" (AI-grounding doctrine).
 *
 * Boundary: Operational App. Status: BUILD.
 */

export default function AssetIntelligencePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = use(searchParams);
  const { tokens } = useMode();

  const selected = id ? thesisAssets.find((a) => a.asset_id === id) : undefined;

  // ── Asset list view (no selection) ──
  if (!selected) {
    const sorted = [...thesisAssets].sort((a, b) => b.criticality - a.criticality);
    return (
      <PageContainer
        pretitle="Identity & Asset Intelligence › Assets"
        title="Asset Intelligence"
        headerActions={<span className="badge bg-blue-lt">{thesisAssets.length} assets</span>}
      >
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Asset Inventory</h3>
            <div className="card-actions text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
              Select an asset to open its seven-section intelligence composition
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead>
                  <tr>
                    <th>Asset</th><th>Classification</th><th>Environment</th>
                    <th>Surface</th><th className="text-end">Criticality</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((a) => (
                    <tr key={a.asset_id}>
                      <td>
                        <a href={`/assets?id=${a.asset_id}`} style={{ color: tokens.action.primary, fontSize: primitiveTypeScale.body }}>{a.asset_name}</a>
                      </td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{a.asset_class}</td>
                      <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{a.environment}</td>
                      <td>
                        <span className={`badge ${a.surface_attribution === 'external_attack_surface' ? 'bg-azure-lt' : 'bg-purple-lt'}`}>
                          {a.surface_attribution === 'external_attack_surface' ? 'External' : 'Internal'}
                        </span>
                      </td>
                      <td className="text-end">{a.criticality}</td>
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

  // ── Seven-section composition for the selected asset ──
  const a = selected;

  // 5. Case History — cases referencing this asset
  const caseHistory = thesisCases.filter((c) => c.related_entities.includes(a.asset_id));
  // 6. Vulnerability State — vulnerability-flavoured risk objects affecting this asset
  const vulnRiskObjects = thesisRiskObjects.filter(
    (r) => (r.affected_entities?.includes(a.asset_id) || r.affected_entity_id === a.asset_id) &&
      (r.type === 'vulnerability_drift' || r.type === 'exposure_drift' || r.type === 'configuration_drift'),
  );
  const vulnCases = caseHistory.filter((c) => c.case_type.includes('vulnerability') || c.case_type.includes('exposure'));
  // 7. Identity Exposure — identities with access to this asset
  const exposedIdentities = thesisIdentities.filter((i) => i.associated_assets.includes(a.asset_id));

  return (
    <PageContainer
      pretitle="Identity & Asset Intelligence › Asset"
      title={a.asset_name}
      headerActions={
        <span className={`badge ${a.surface_attribution === 'external_attack_surface' ? 'bg-azure-lt' : 'bg-purple-lt'}`}>
          {a.surface_attribution === 'external_attack_surface' ? 'External Attack Surface' : 'Internal Attack Surface'}
        </span>
      }
    >
      <div className="mb-3">
        <a href="/assets" style={{ fontSize: primitiveTypeScale.caption, color: tokens.action.primary }}>← All assets</a>
      </div>

      {/* 1. Asset Overview */}
      <div className="card mb-3" data-section="asset-overview">
        <div className="card-header"><h3 className="card-title">Asset Overview</h3></div>
        <div className="card-body">
          <div className="row g-3">
            <Field label="Classification" value={a.asset_class} />
            <Field label="Owner" value={a.owner} />
            <Field label="Environment" value={a.environment} />
            <Field label="Criticality" value={String(a.criticality)} />
            <Field label="Surface" value={a.surface_attribution === 'external_attack_surface' ? 'External' : 'Internal'} />
            <Field label="Tags" value={a.tags.join(', ')} />
          </div>
            <Field label="Source of Truth" value={a.source_of_truth} />
            <Field label="Standard" value={a.standard_marker} />
        </div>
      </div>

      {/* 2. Configuration State */}
      <div className="card mb-3" data-section="configuration-state">
        <div className="card-header"><h3 className="card-title">Configuration State</h3></div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            <CoverageBadge label="EDR" on={a.coverage.has_edr} />
            <CoverageBadge label="Vuln Scan" on={a.coverage.has_vuln_scan} />
            <CoverageBadge label="Patch Mgmt" on={a.coverage.has_patch_management} />
            <CoverageBadge label="Backup" on={a.coverage.has_backup} />
          </div>
          <p className="text-muted mb-0 mt-3" style={{ fontSize: primitiveTypeScale.caption }}>
            Network position: {a.network_position ?? 'unknown'} · Lifecycle: {a.lifecycle_state ?? 'unknown'} · Platform: {a.platform?.os ?? 'unknown'}
          </p>
        </div>
      </div>

      {/* 3. Verdict History (Class B operational verdicts) */}
      <div className="card mb-3" data-section="verdict-history">
        <div className="card-header"><h3 className="card-title">Verdict History</h3></div>
        <div className="card-body">
          <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.body }}>
            Operational verdicts (Class B connectors) bind here once verdict ingestion is active. No invented verdicts are shown.
          </p>
        </div>
      </div>

      {/* 4. Behavioural Pattern (Internal Behavioural Intelligence) */}
      <div className="card mb-3" data-section="behavioural-pattern">
        <div className="card-header"><h3 className="card-title">Behavioural Pattern</h3></div>
        <div className="card-body">
          <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.body }}>
            {STREAM_LABELS.internal_behavioural} (EDR/NDR) anomaly counters bind here once behavioural ingestion is active.
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
                  <tr key={c.id}>
                    <td style={{ width: '48px' }}><span className={`badge ${c.priority === 'P0' ? 'bg-red' : c.priority === 'P1' ? 'bg-orange' : 'bg-secondary'}`}>{c.priority}</span></td>
                    <td><a href={`/cases/${c.id}`} style={{ color: tokens.action.primary, fontSize: primitiveTypeScale.body }}>{c.title}</a></td>
                    <td className="text-muted text-end" style={{ fontSize: primitiveTypeScale.caption }}>{c.status}</td>
                  </tr>
                ))}
                {caseHistory.length === 0 && (
                  <tr><td className="text-muted text-center" style={{ fontSize: primitiveTypeScale.caption }}>No cases involving this asset</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Vulnerability State */}
      <div className="card mb-3" data-section="vulnerability-state">
        <div className="card-header"><h3 className="card-title">Vulnerability State</h3></div>
        <div className="card-body">
          {vulnRiskObjects.length === 0 && vulnCases.length === 0 ? (
            <p className="text-muted mb-0" style={{ fontSize: primitiveTypeScale.caption }}>No active vulnerability or drift risk on this asset</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {vulnRiskObjects.map((r) => (
                <div key={r.id} className="d-flex align-items-center gap-2">
                  <span className="status-dot" style={{ display: 'inline-block', background: primitiveSignal.warning }} />
                  <span style={{ fontSize: primitiveTypeScale.body }}>{r.type}</span>
                  <span className="text-muted ms-auto" style={{ fontSize: primitiveTypeScale.caption }}>{r.treatment_state}</span>
                </div>
              ))}
              {vulnCases.map((c) => (
                <a key={c.id} href={`/cases/${c.id}`} style={{ fontSize: primitiveTypeScale.caption, color: tokens.action.primary }}>{c.case_ref} · {c.title}</a>
              ))}
            </div>
          )}
          <div className="mt-3"><a href="/vulnerabilities" className="btn btn-sm">Vulnerability management</a></div>
        </div>
      </div>

      {/* 7. Identity Exposure */}
      <div className="card mb-3" data-section="identity-exposure">
        <div className="card-header"><h3 className="card-title">Identity Exposure</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <tbody>
                {exposedIdentities.map((i) => (
                  <tr key={i.id}>
                    <td><a href={`/identity?id=${i.id}`} style={{ color: tokens.action.primary, fontSize: primitiveTypeScale.body }}>{i.display_name}</a></td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{i.classification}</td>
                    <td className="text-end" style={{ fontSize: primitiveTypeScale.caption, color: i.risk_score >= 50 ? primitiveSignal.critical : tokens.text.muted }}>risk {i.risk_score}</td>
                  </tr>
                ))}
                {exposedIdentities.length === 0 && (
                  <tr><td className="text-muted text-center" style={{ fontSize: primitiveTypeScale.caption }}>No identities with recorded access to this asset</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drill paths */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Drill Paths</h3></div>
        <div className="card-body d-flex flex-wrap gap-3">
          <a href="/cases" className="btn">Cases</a>
          <a href="/identity" className="btn">Identities</a>
          <a href="/vulnerabilities" className="btn">Vulnerabilities</a>
          <a href="/architecture" className="btn">Configuration Drift<span className="badge bg-secondary ms-2">SCAFFOLD</span></a>
        </div>
      </div>
    
      {/* §7.3 ENRICHMENT */}
      <section style={{ marginTop: componentTokens.gridGap, padding: componentTokens.cardPadding, background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}` }}>
        <h4 style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, margin: '0 0 8px' }}>Thesis Data Context</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: primitiveSpacing[2] }}>
        <span style={{ display: 'inline-block', padding: '4px 8px', fontSize: primitiveTypeScale.micro, background: tokens.surface.base, border: `1px solid ${tokens.border.subtle}`, marginRight: primitiveSpacing[2] }}>{posturesCount} Postures</span>
        </div>
      </section>
    </PageContainer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="col-sm-6 col-lg-4">
      <div className="subheader mb-1">{label}</div>
      <div style={{ fontSize: primitiveTypeScale.body }}>{value}</div>
    </div>
  );
}

function CoverageBadge({ label, on }: { label: string; on: boolean }) {
  return (
    <span className={`badge ${on ? 'bg-green-lt' : 'bg-red-lt'}`}>
      {label}: {on ? 'yes' : 'no'}
    </span>
  );
}
