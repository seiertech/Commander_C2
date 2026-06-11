'use client';

import dynamic from 'next/dynamic';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal, primitiveData,
} from '../../../../../../packages/ui/src/tokens/primitives';
import type { ApexOptions } from 'apexcharts';
import { thesisTeamPulse, thesisCases, thesisRiskObjects, thesisBlastRadius, thesisExposures, thesisPostures, thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Team Pulse — Escalation Queue
 *
 * Data: TeamPulseEntry from seed-pulse
 * Route: /team-pulse/escalation | Nav Group: Team Pulse | Status: BUILD
 * Shows escalation queue depth and time-since-closure per team.
 */

{/* AI-PLACEMENT: AICAP-PULSE-003 — Commander AI escalation routing recommendation */}

export default function TeamPulseEscalationPage() {
  const { mode, tokens } = useMode();

  const teams = thesisTeamPulse.filter((e) => e.level === 'team');
  const totalEscalationDepth = teams.reduce((acc, t) => acc + t.escalation_queue_depth, 0);
  const teamsWithEscalations = teams.filter((t) => t.escalation_queue_depth > 0).length;
  const avgHoursSinceClosure = teams.length > 0 ? Math.round(teams.reduce((acc, t) => acc + t.hours_since_last_closure, 0) / teams.length) : 0;

  const chartOpts: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: primitiveFonts.body },
    theme: { mode: mode === 'mission' ? 'dark' : 'light' },
    colors: [primitiveData[5], primitiveData[2]],
    plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 0 } },
    xaxis: { categories: teams.map((t) => t.team_or_analyst), labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    yaxis: { labels: { style: { colors: tokens.text.muted, fontSize: primitiveTypeScale.micro } } },
    grid: { borderColor: tokens.border.subtle, strokeDashArray: 3 },
    legend: { labels: { colors: tokens.text.secondary }, fontSize: primitiveTypeScale.caption },
    dataLabels: { enabled: false },
    tooltip: { theme: mode === 'mission' ? 'dark' : 'light' },
  };

  const chartSeries = [
    { name: 'Escalation Queue', data: teams.map((t) => t.escalation_queue_depth) },
    { name: 'Hrs Since Closure', data: teams.map((t) => t.hours_since_last_closure) },
  ];

  return (
    <PageContainer pretitle="Team Pulse › Escalation" title="Escalation Queue">
      {/* KPI strip */}
      {/* Cross-Entity Relationship Panel — Sweep 2 */}
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
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Summary</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
          </div>
          <div style={{ marginTop: primitiveSpacing[2], fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>Avg score: {Math.round(thesisPostures.reduce((a,p) => a + p.posture_score, 0) / Math.max(thesisPostures.length, 1))}/100</div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Exposures ({thesisExposures.length})</h4>
          {thesisExposures.slice(0,4).map((e) => (<div key={e.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}><span style={{ color: tokens.text.primary }}>{e.exposure_type ?? e.surface ?? 'exposure'}</span><span style={{ color: e.severity === 'critical' ? primitiveSignal.critical : primitiveSignal.warning }}>{e.severity ?? 'medium'}</span></div>))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Connector Health</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisConnectors.filter((c) => c.state === 'active').length} active</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisConnectors.filter((c) => c.state === 'error').length} error</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.neutral }}>●</span> {thesisConnectors.filter((c) => c.state !== 'active' && c.state !== 'error').length} other</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
