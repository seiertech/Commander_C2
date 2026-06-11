'use client';

import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { thesisVulnerabilityIntelligence, thesisRiskScores, thesisCases, thesisAssets, thesisBlastRadius, thesisExposures, thesisPostures, thesisStrategies, thesisMissions, thesisConnectors } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Vulnerability Management — KEV & Critical
 *
 * Data: VulnerabilityIntelligenceRecord from seed-vulnerability-intelligence
 * Route: /vulnerabilities/kev | Nav Group: Vulnerability Management | Status: BUILD
 * Shows CISA Known Exploited Vulnerabilities and critical-rated CVEs.
 */

{/* AI-PLACEMENT: AICAP-VULN-001 — Commander AI KEV prioritisation recommendation */}

export default function VulnerabilitiesKevPage() {
  const { mode, tokens } = useMode();

  const kevEntries = thesisVulnerabilityIntelligence.filter((v) => v.cisa_kev_status);
  const criticalEntries = thesisVulnerabilityIntelligence.filter((v) => v.severity >= 4);
  const overdue = kevEntries.filter((v) => v.kevDueDate && new Date(v.kevDueDate) < new Date('2026-01-18'));
  const avgEpss = kevEntries.length > 0 ? (kevEntries.reduce((acc, v) => acc + (v.epss_score ?? 0), 0) / kevEntries.length * 100).toFixed(0) : '0';

  return (
    <PageContainer pretitle="Vulnerabilities › KEV & Critical" title="Known Exploited Vulnerabilities">
      {/* KPI strip */}
      {/* Cross-Entity Relationship Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Blast Radius Impact</h4>
          {thesisBlastRadius.slice(0,3).map((b) => (
            <div key={b.id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,14)}</span>
              <span style={{ color: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} pts → {b.affected_entities.length} entities</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Related Cases</h4>
          {thesisCases.filter((c) => c.priority === 'P0' || c.priority === 'P1').slice(0,5).map((c) => (
            <div key={c.case_id} style={{ padding: '4px 0', borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between', fontSize: primitiveTypeScale.micro }}>
              <span style={{ fontFamily: primitiveFonts.mono, color: tokens.text.primary }}>{c.case_id.slice(0,12)}</span>
              <span style={{ padding: '1px 6px', color: '#fff', background: c.priority === 'P0' ? primitiveSignal.critical : primitiveSignal.warning }}>{c.priority} · {c.ooda_state}</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Status</h4>
          <div style={{ display: 'flex', gap: primitiveSpacing[3] }}>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.success }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'healthy').length} healthy</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.warning }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'degraded').length} degraded</span>
            <span style={{ fontSize: primitiveTypeScale.micro }}><span style={{ color: primitiveSignal.critical }}>●</span> {thesisPostures.filter((p) => p.posture_status === 'critical').length} critical</span>
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
