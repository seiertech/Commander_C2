'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisIocs, thesisSignals, thesisIntelligenceAssessments, thesisCases } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Intelligence — Threat Hunt Operations
 *
 * Standard: MITRE ATT&CK (Threat-Informed Defence)
 * Data: thesisIocs, thesisSignals, thesisIntelligenceAssessments, thesisCases
 * Route: /intelligence/threat-hunts | Nav Group: Intelligence | Status: BUILD
 *
 * Hunt hypothesis tracking, IOC sweep results, signal correlation.
 */

{/* AI-PLACEMENT: AICAP-HUNT-001 — Commander AI threat hunt hypothesis generation */}

export default function IntelligenceThreatHuntsPage() {
  const { tokens } = useMode();

  const totalIocs = thesisIocs.length;
  const activeIocs = thesisIocs.filter((i) => i.active).length;
  const assessments = thesisIntelligenceAssessments.length;
  const highReliability = thesisIntelligenceAssessments.filter((a) => a.source_reliability === 'A' || a.source_reliability === 'B').length;
  const signalCount = thesisSignals.length;
  const linkedCases = thesisCases.filter((c) => c.ooda_state === 'observe' || c.ooda_state === 'orient').length;

  return (
    <PageContainer pretitle="Intelligence › Threat Hunts" title="Threat Hunt Operations (MITRE ATT&CK)">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="IOC Corpus" value={String(totalIocs)} />
        <KpiCard tokens={tokens} label="Active IOCs" value={String(activeIocs)} accent={activeIocs > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Assessments" value={String(assessments)} />
        <KpiCard tokens={tokens} label="High Reliability" value={String(highReliability)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Signals" value={String(signalCount)} />
        <KpiCard tokens={tokens} label="Cases (Observe/Orient)" value={String(linkedCases)} />
      </section>

      {/* Intelligence Assessments */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Intelligence Assessments (NATO/Admiralty)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Assessment ID', 'Signal', 'Source Reliability', 'Info Credibility', 'Combined', 'Graded By'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisIntelligenceAssessments.map((a) => {
                const relColor = a.source_reliability === 'A' ? primitiveSignal.success : a.source_reliability === 'B' ? primitiveSignal.success : a.source_reliability === 'C' ? primitiveSignal.warning : primitiveSignal.neutral;
                return (
                  <tr key={a.intelligence_assessment_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{a.intelligence_assessment_id}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{a.signal_id}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: relColor }}>{a.source_reliability}</span></td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{a.information_credibility}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontWeight: primitiveFontWeight.bold, fontFamily: primitiveFonts.mono }}>{a.combined_rating}</td>
                    <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{a.graded_by}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-confidence IOCs for hunting */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Hunt Indicators (High Confidence)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Category', 'Value', 'Confidence', 'Severity', 'Active'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisIocs.filter((i) => i.confidence >= 70).slice(0, 10).map((ioc) => (
                <tr key={ioc.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{ioc.ioc_category.replace(/_/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ioc.value}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{ioc.confidence}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{ioc.severity}/5</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{ioc.active ? <span style={{ color: primitiveSignal.success }}>●</span> : <span style={{ color: tokens.text.muted }}>○</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
