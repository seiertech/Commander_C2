'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisStandardsDeclarations, thesisControlEvaluations, thesisControlMappings, thesisEvidence, thesisCases, thesisBlastRadius, thesisRiskObjects, thesisExposures, thesisPostures, thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Governance — Adherence Evidence Trail
 *
 * Standard: ISO 27001 (Information Security Management)
 * Data: thesisStandardsDeclarations (L1 proof), thesisControlEvaluations (L10),
 *       thesisControlMappings (cross-framework), thesisEvidence (L7 artefacts)
 * Route: /governance/adherence-evidence | Nav Group: Governance & Adherence | Status: BUILD
 *
 * Proof chain: standard → control → evaluation → evidence artefact.
 * NOTE: "adherence" not "compliance" per thesis convention.
 */

{/* AI-PLACEMENT: AICAP-GOV-002 — Commander AI adherence gap analysis */}

export default function GovernanceAdherenceEvidencePage() {
  const { tokens } = useMode();

  const totalStandards = thesisStandardsDeclarations.length;
  const strictStandards = thesisStandardsDeclarations.filter((s) => s.conformance_level === 'strict').length;
  const totalEvaluations = thesisControlEvaluations.length;
  const passingEvaluations = thesisControlEvaluations.filter((e) => e.evaluation_result === 'pass' || e.evaluation_result === 'compliant').length;
  const totalMappings = thesisControlMappings.length;
  const totalEvidence = thesisEvidence.length;

  return (
    <PageContainer pretitle="Governance › Adherence Evidence" title="Adherence Evidence Trail (ISO 27001)">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Standards Declared" value={String(totalStandards)} />
        <KpiCard tokens={tokens} label="Strict Adherence" value={String(strictStandards)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Control Evaluations" value={String(totalEvaluations)} />
        <KpiCard tokens={tokens} label="Passing" value={String(passingEvaluations)} accent={passingEvaluations === totalEvaluations ? primitiveSignal.success : primitiveSignal.warning} />
        <KpiCard tokens={tokens} label="Cross-Mappings" value={String(totalMappings)} />
        <KpiCard tokens={tokens} label="Evidence Artefacts" value={String(totalEvidence)} />
      </section>

      {/* Standards Declarations */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Standards Declarations (L1)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Standard', 'Version', 'Scope', 'Conformance', 'Declared By'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisStandardsDeclarations.map((s) => (
                <tr key={s.compliance_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{s.standard_name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{s.standard_version}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.scope}>{s.scope}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: s.conformance_level === 'strict' ? primitiveSignal.success : primitiveSignal.neutral }}>{s.conformance_level}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{s.declared_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Control Evaluations */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Control Evaluations (L10)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Control', 'Result', 'Score', 'Evaluator', 'Date'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisControlEvaluations.map((e) => {
                const resultColor = e.evaluation_result === 'pass' || e.evaluation_result === 'compliant' ? primitiveSignal.success : e.evaluation_result === 'fail' ? primitiveSignal.critical : primitiveSignal.warning;
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{e.control_ref}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: resultColor }}>{e.evaluation_result}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{e.score ?? '—'}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{e.evaluated_by}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(e.evaluated_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Artefacts */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Evidence Artefacts (L7)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Type', 'Description', 'Case Ref', 'Content Ref', 'Created'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisEvidence.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{ev.evidence_type}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ev.description}>{ev.description}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{ev.case_ref?.slice(0, 12) ?? '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{ev.contentRef?.slice(0, 30) ?? '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(ev.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* Cross-Entity Governance Panel — Sweep 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius</h4>
          {thesisBlastRadius.map((b) => (<div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span><span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} → {b.affected_entities.length}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Objects ({thesisRiskObjects.length})</h4>
          {thesisRiskObjects.map((r) => (<div key={r.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{r.type.replace(/_/g, ' ')}</span><span style={{ padding: '1px 6px', color: '#fff', background: r.treatment_state === 'open' ? primitiveSignal.warning : primitiveSignal.success }}>{r.treatment_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Linked Cases</h4>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (<div key={c.case_id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span><span style={{ padding: '1px 6px', color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority} · {c.ooda_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Overview</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Exposures ({thesisExposures.length})</h4>
          {thesisExposures.slice(0,3).map((e) => (<div key={e.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{e.exposure_type ?? e.surface ?? 'exposure'}</span><span style={{ color: e.severity === 'critical' ? primitiveSignal.critical : primitiveSignal.warning }}>{e.severity ?? 'medium'}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Data Sources</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisConnectors.filter((c) => c.state === 'active').length} active</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisConnectors.filter((c) => c.state === 'error').length} error</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function KpiCard({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span>
    </div>
  );
}
