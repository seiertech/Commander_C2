'use client';

import { PageContainer } from '@/components/page-container';
import { primitiveTypeScale } from '../../../../../../packages/ui/src/tokens/primitives';

import { thesisTenantConfigs, thesisRbacPolicies, thesisConnectors, thesisRules, thesisFeatureRegistry, thesisAssets, thesisCases, thesisStrategies, thesisMissions, thesisPostures } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
/**
 * Tenant Admin — Commander AI Configuration
 *
 * Data: commander-ai-core engine
 * Route: /settings/commander-ai | Boundary: tenant-admin
 *
 * Tenant-facing view of Commander AI configuration.
 * Phase 1: Read-only. No model provider management (that's Control Plane scope).
 */

const MODES = [
  { id: 'estate', label: 'Estate Awareness', description: 'Explain asset, coverage, case and posture context' },
  { id: 'engineering', label: 'Engineering Support', description: 'Interpret rules, connectors, mappings and remediation' },
  { id: 'architectural', label: 'Architectural Advisory', description: 'Explain drift, trust boundaries and design weakness' },
  { id: 'threat', label: 'Threat Triage', description: 'Summarise CVEs, advisories, IOCs and estate relevance' },
  { id: 'communication', label: 'Communication Drafting', description: 'Draft governed emails and SIR summaries from case context' },
];

export default function SettingsCommanderAiPage() {
  return (
    <PageContainer pretitle="Settings › Commander AI" title="Commander AI Configuration">
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title">Commander AI Status</h3>
          <button className="btn btn-sm" disabled>Edit — Phase 1 Read-Only</button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Pipeline</div>
              <div><span className="badge bg-green-lt">Grounding Active</span></div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Model Provider</div>
              <div style={{ fontSize: primitiveTypeScale.body }}>Platform-managed (not tenant-configurable)</div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">Token Budget</div>
              <div style={{ fontSize: primitiveTypeScale.body }}>Unlimited (Phase 1 — no live inference)</div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="subheader">RAG</div>
              <div><span className="badge bg-secondary">Dormant</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header"><h3 className="card-title">Available Modes</h3></div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead><tr><th>Mode</th><th>Description</th><th>Status</th></tr></thead>
              <tbody>
                {MODES.map((mode) => (
                  <tr key={mode.id}>
                    <td style={{ fontWeight: 600, fontSize: primitiveTypeScale.body }}>{mode.label}</td>
                    <td className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>{mode.description}</td>
                    <td><span className="badge bg-green-lt">Available</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>
        Commander AI model provider configuration is managed by the platform (Commercial Control Plane).
        Tenants consume Commander AI capabilities but do not configure providers, model selection, or infrastructure.
      </div>
    
      {/* Configuration Context — Sweep 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Tenant Configs</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisTenantConfigs.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>RBAC Policies</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisRbacPolicies.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Connectors</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisConnectors.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Rules</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisRules.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Assets</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisAssets.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Cases</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisCases.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Strategies</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisStrategies.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Missions</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisMissions.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Postures</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisPostures.length}</span></div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Features</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: tokens.text.primary }}>{thesisFeatureRegistry.length}</span></div>
      </div>
    </PageContainer>
  );
}
