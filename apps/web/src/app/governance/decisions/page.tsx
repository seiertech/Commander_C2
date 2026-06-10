'use client';

import { thesisDecisionRecords } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useState } from 'react';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { renderRationale } from '../../../../../../packages/contracts/src/engines/decision-explainability-engine';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Governance — Decision Records
 *
 * Source: Thesis Rule/Model/Decision Governance Surface
 * Use Case: UC-175 — Explain any system decision with full rationale
 * Route: /governance/decisions | Nav Group: Governance | Status: BUILD
 */

export default function GovernanceDecisionsPage() {
  const { tokens } = useMode();
  const [filter, setFilter] = useState<string>('all');

  const types = Array.from(new Set(thesisDecisionRecords.map((d) => d.decisionType)));
  const filtered = filter === 'all' ? thesisDecisionRecords : thesisDecisionRecords.filter((d) => d.decisionType === filter);

  const confidenceColor = (c: number) =>
    c >= 80 ? primitiveSignal.success : c >= 50 ? primitiveSignal.warning : primitiveSignal.critical;

  return (
    <PageContainer pretitle="Governance › Decision Explainability" title="Decision Records">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Decisions" value={String(thesisDecisionRecords.length)} />
        <KpiCard tokens={tokens} label="Overridden" value={String(thesisDecisionRecords.filter((d) => d.overridden).length)} accent={primitiveSignal.warning} />
        <KpiCard tokens={tokens} label="Avg Confidence" value={`${Math.round(thesisDecisionRecords.reduce((a, d) => a + d.confidence, 0) / thesisDecisionRecords.length)}%`} />
        <KpiCard tokens={tokens} label="Types" value={String(types.length)} />
      </section>

      {/* Filter */}
      <div style={{ marginBottom: componentTokens.gridGap }}>
        <label style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Decision Type</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ marginLeft: primitiveSpacing[2], height: componentTokens.inputHeight, padding: `0 ${primitiveSpacing[2]}`, background: tokens.surface.secondary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}`, borderRadius: 0, fontSize: primitiveTypeScale.caption }}>
          <option value="all">All</option>
          {types.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Decision cards */}
      <div style={{ display: 'grid', gap: componentTokens.gridGap }}>
        {filtered.map((d) => {
          const explanation = renderRationale(d);
          return (
            <div key={d.id} style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: primitiveSpacing[2] }}>
                <div>
                  <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{d.decisionType.replace(/_/g, ' ')}</span>
                  <h4 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `${primitiveSpacing[1]} 0 0` }}>{d.outputAction}</h4>
                </div>
                <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: confidenceColor(d.confidence) }}>{d.confidence}%</span>
              </div>
              <p style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, margin: `0 0 ${primitiveSpacing[2]}` }}>{explanation.summary}</p>
              <div style={{ display: 'flex', gap: primitiveSpacing[4], flexWrap: 'wrap', fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>
                <span>Case: {d.caseRef}</span>
                {d.ruleRef && <span>Rule: {d.ruleRef}</span>}
                {d.engineRef && <span>Engine: {d.engineRef}</span>}
                <span>By: {d.decidedBy}</span>
                <span>{new Date(d.decidedAt).toLocaleString()}</span>
                {d.overridden && <span style={{ color: primitiveSignal.warning }}>⚠ OVERRIDDEN</span>}
              </div>
              {explanation.factors.length > 0 && (
                <div style={{ marginTop: primitiveSpacing[2], borderTop: `1px solid ${tokens.border.subtle}`, paddingTop: primitiveSpacing[2] }}>
                  <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Factors & Inputs</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: primitiveSpacing[2], marginTop: primitiveSpacing[1] }}>
                    {explanation.factors.map((f) => (
                      <div key={f.name} style={{ fontSize: primitiveTypeScale.micro, fontFamily: primitiveFonts.mono, color: tokens.text.secondary }}>
                        {f.name}={f.value} <span style={{ color: tokens.text.muted }}>({f.contribution})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
