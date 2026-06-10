'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../../packages/ui/src/tokens/primitives';
import { thesisArchitectureComponents, thesisDriftDetection } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Architecture — Drift
 * Data: ArchitectureComponent driftState from seed-architecture
 * Route: /architecture/drift | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-ARCH-002 — Commander AI drift remediation recommendation */}

export default function ArchitectureDriftPage() {
  const { tokens } = useMode();
  const drifted = thesisArchitectureComponents.filter((c) => c.drift_state !== 'compliant');
  const major = drifted.filter((c) => c.drift_state === 'major_drift').length;
  const minor = drifted.filter((c) => c.drift_state === 'minor_drift').length;
  const compliant = thesisArchitectureComponents.filter((c) => c.drift_state === 'compliant').length;
  const driftDetectionCount = thesisDriftDetection.length;
  const driftCritical = thesisDriftDetection.filter((d) => d.driftSeverity >= 7).length;

  return (
    <PageContainer pretitle="Architecture › Drift" title="Architecture Drift">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Compliant" value={String(compliant)} accent={primitiveSignal.success} />
        <Kpi tokens={tokens} label="Minor Drift" value={String(minor)} accent={minor > 0 ? primitiveSignal.warning : undefined} />
        <Kpi tokens={tokens} label="Major Drift" value={String(major)} accent={major > 0 ? primitiveSignal.critical : undefined} />
        <Kpi tokens={tokens} label="Total" value={String(thesisArchitectureComponents.length)} />
        <Kpi tokens={tokens} label="Drift Detections" value={String(driftDetectionCount)} />
        <Kpi tokens={tokens} label="Critical Drifts" value={String(driftCritical)} accent={driftCritical > 0 ? primitiveSignal.critical : undefined} />
      </section>
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Drift State</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Component', 'Drift State', 'Baseline', 'Current', 'Last Scanned', 'Criticality'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisArchitectureComponents.map((c) => {
              const dc = c.drift_state === 'compliant' ? primitiveSignal.success : c.drift_state === 'minor_drift' ? primitiveSignal.warning : primitiveSignal.critical;
              return (
                <tr key={c.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{c.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, color: '#fff', background: dc }}>{c.drift_state.replace(/_/g, ' ')}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{c.baseline_version}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: c.baseline_version !== c.current_version ? primitiveSignal.warning : tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{c.current_version}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(c.last_scanned_at ?? '').toLocaleString()}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{c.criticality}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>

      {/* Drift Detection Findings — thesisDriftDetection (AICAP-ARCH-002 grounding) */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginTop: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Drift Detection Findings</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead><tr>{['Finding', 'Drift Type', 'Severity', 'Status', 'Current State', 'Detected At'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
            <tbody>{thesisDriftDetection.map((d) => {
              const sc = d.driftSeverity >= 7 ? primitiveSignal.critical : d.driftSeverity >= 5 ? primitiveSignal.warning : primitiveSignal.neutral;
              return (
                <tr key={d.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{d.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{d.driftType}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, color: '#fff', background: sc }}>{d.driftSeverity}/10</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: d.status === 'open' ? primitiveSignal.warning : primitiveSignal.success }}>{d.status}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontSize: primitiveTypeScale.micro, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.current_state}>{d.current_state}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(d.detected_at).toLocaleString()}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
