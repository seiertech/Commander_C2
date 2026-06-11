'use client';

import { thesisBlastRadius, thesisCases, thesisRiskObjects, thesisExposures, thesisPostures, thesisConnectors, thesisRiskScores } from '../../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useState } from 'react';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../../packages/ui/src/tokens/primitives';

/**
 * Platform — Rule Simulation (Blast Radius Preview)
 *
 * Source: Thesis Drift and Rule Engine
 * Use Case: UC-171 — Simulate rule change (blast radius)
 * Data: BlastRadius from seed-blast-radius
 * Route: /platform/rules/simulation | Nav Group: Platform | Status: BUILD
 *
 * Display-only preview over canonical blast-radius computations. Lets an SOM
 * see the affected-entity footprint and total impact of a rule change before
 * promoting it.
 */

{/* AI-PLACEMENT: AICAP-PLATFORM-002 — Commander AI blast-radius narrative summary */}

export default function PlatformRuleSimulationPage() {
  const { tokens } = useMode();
  const [selectedId, setSelectedId] = useState<string>(thesisBlastRadius[0]?.id ?? '');

  const selected = thesisBlastRadius.find((b) => b.id === selectedId) ?? thesisBlastRadius[0];
  const maxImpact = Math.max(...thesisBlastRadius.map((b) => b.total_impact_score));
  const totalAffected = thesisBlastRadius.reduce((acc, b) => acc + b.affected_entities.length, 0);

  const impactColor = (score: number) =>
    score >= 80 ? primitiveSignal.critical : score >= 50 ? primitiveSignal.warning : primitiveSignal.info;

  return (
    <PageContainer pretitle="Platform › Rule Engine › Simulation" title="Rule Simulation">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Simulations" value={String(thesisBlastRadius.length)} />
        <KpiCard tokens={tokens} label="Peak Impact" value={`${maxImpact}/100`} accent={impactColor(maxImpact)} />
        <KpiCard tokens={tokens} label="Affected Entities" value={String(totalAffected)} />
      </section>

      {/* Simulation selector */}
      <div style={{ marginBottom: componentTokens.gridGap }}>
        <label style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Origin</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
          style={{ marginLeft: primitiveSpacing[2], height: componentTokens.inputHeight, padding: `0 ${primitiveSpacing[2]}`, background: tokens.surface.secondary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}`, borderRadius: 0, fontSize: primitiveTypeScale.caption }}>
          {thesisBlastRadius.map((b) => (
            <option key={b.id} value={b.id}>{b.originEntityType}: {b.originEntityRef}</option>
          ))}
        </select>
      </div>

      {/* Selected simulation summary */}
      {selected && (
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>
            Blast Radius — {selected.originEntityRef}
          </h3>
          <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap', marginBottom: primitiveSpacing[3] }}>
            <Stat tokens={tokens} label="Total Impact" value={`${selected.total_impact_score}/100`} accent={impactColor(selected.total_impact_score)} />
            <Stat tokens={tokens} label="Depth" value={String(selected.depth)} />
            <Stat tokens={tokens} label="Affected" value={String(selected.affected_entities.length)} />
            <Stat tokens={tokens} label="Computed" value={new Date(selected.computed_at).toLocaleString()} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead>
                <tr>
                  {['Affected Entity', 'Type', 'Relationship', 'Distance', 'Impact'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.affected_entities.map((a) => (
                  <tr key={a.entity_ref} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{a.entity_ref}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{a.entity_type}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{a.relationship}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>{a.distance}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: impactColor(a.impact_score), fontFamily: primitiveFonts.mono }}>{a.impact_score}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    
      {/* Cross-Entity + Engine Panel — Sweep 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Active Risk Objects ({thesisRiskObjects.filter((r) => r.treatment_state === 'open').length} open)</h4>
          {thesisRiskObjects.map((r) => (<div key={r.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{r.type.replace(/_/g, ' ')}</span><span style={{ padding: '1px 6px', color: '#fff', background: r.treatment_state === 'open' ? primitiveSignal.warning : primitiveSignal.success }}>{r.treatment_state}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Impact</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
          <div style={{ marginTop: primitiveSpacing[2], fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Avg: {Math.round(thesisPostures.reduce((a,p) => a + p.posture_score, 0) / Math.max(thesisPostures.length, 1))}/100</div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Exposure Surface ({thesisExposures.length})</h4>
          {thesisExposures.slice(0,4).map((e) => (<div key={e.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{e.exposure_type ?? e.surface ?? 'exposure'}</span><span style={{ color: e.severity === 'critical' ? primitiveSignal.critical : primitiveSignal.warning }}>{e.severity ?? 'medium'}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Data Pipeline</h4>
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

function Stat({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (
    <div>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.caption, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.semibold, color: accent ?? tokens.text.primary }}>{value}</span>
    </div>
  );
}
