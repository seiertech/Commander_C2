'use client';
import { PageContainer } from '@/components/page-container';
import { STRATEGY_SURFACE_LABELS } from '../../../../../../packages/contracts/src/entities/strategy';
import { primitiveTypeScale, primitiveLetterSpacing, primitiveFontWeight, primitiveFonts } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisStrategies, thesisTenantConfigs, thesisRbacPolicies, thesisConnectors, thesisRules, thesisFeatureRegistry, thesisAssets, thesisCases, thesisMissions, thesisPostures } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { useMode } from '@/context/mode-context';

/** Tenant Admin — Closure & Reopening. Data: strategy.ts (closure-gate + reopening-trigger) + seed-strategies */
export default function SettingsClosureReopeningPage() {
  const { mode, tokens } = useMode();
  const closurePolicy = thesisStrategies.find((s) => s.surface_type === 'closure-gate');
  const reopeningPolicy = thesisStrategies.find((s) => s.surface_type === 'reopening-trigger');

  return (
    <PageContainer pretitle="Settings › Closure & Reopening" title="Closure & Reopening Strategy">
      {[closurePolicy, reopeningPolicy].filter(Boolean).map((policy) => (
        <div key={policy!.id} className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title">{STRATEGY_SURFACE_LABELS[policy!.surface_type]}</h3>
            <div className="d-flex gap-2 align-items-center">
              <span className={`badge ${policy!.status === 'active' ? 'bg-green-lt' : 'bg-secondary'}`}>{policy!.status}</span>
              <button className="btn btn-sm" disabled>Edit — Phase 1 Read-Only</button>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-sm-4"><div className="subheader">Version</div><div style={{ fontSize: primitiveTypeScale.body }}>{policy!.policy_version}</div></div>
              <div className="col-sm-4"><div className="subheader">Effective</div><div style={{ fontSize: primitiveTypeScale.caption }}>{policy!.effective_from ? new Date(policy!.effective_from).toLocaleDateString() : '—'}</div></div>
              <div className="col-sm-4"><div className="subheader">Approved By</div><div style={{ fontSize: primitiveTypeScale.caption }}>{policy!.approval?.approved_by ?? '—'}</div></div>
            </div>
            <pre className="text-muted" style={{ fontSize: primitiveTypeScale.caption, maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(policy!.configuration, null, 2)}
            </pre>
          </div>
        </div>
      ))}
      <div className="text-muted" style={{ fontSize: primitiveTypeScale.caption }}>Strategy editing not available in Phase 1.</div>
    
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
