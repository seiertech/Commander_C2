'use client';

import { thesisRules } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useState } from 'react';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Platform — Rule Engine
 *
 * Data: RuleDefinition from seed-platform
 * Route: /platform/rules | Nav Group: Platform | Status: BUILD
 * Shows all registered detection, drift, correlation, and suppression rules.
 */

{/* AI-PLACEMENT: AICAP-PLATFORM-001 — Commander AI rule tuning recommendation */}

export default function PlatformRulesPage() {
  const { tokens } = useMode();
  const [filter, setFilter] = useState<string>('all');

  const ruleTypes = Array.from(new Set(thesisRules.map((r) => r.ruleType)));
  const filtered = filter === 'all' ? thesisRules : thesisRules.filter((r) => r.ruleType === filter);

  const activeRules = thesisRules.filter((r) => r.status === 'active').length;
  const totalTriggers = thesisRules.reduce((acc, r) => acc + r.triggerCount, 0);
  const customRules = thesisRules.filter((r) => r.origin === 'tenant-custom').length;

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return primitiveSignal.success;
      case 'draft': return primitiveSignal.info;
      case 'disabled': return primitiveSignal.neutral;
      case 'deprecated': return primitiveSignal.warning;
      default: return primitiveSignal.neutral;
    }
  };

  return (
    <PageContainer pretitle="Platform › Rule Engine" title="Rule Engine">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Rules" value={String(thesisRules.length)} />
        <KpiCard tokens={tokens} label="Active" value={String(activeRules)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Total Triggers" value={String(totalTriggers)} />
        <KpiCard tokens={tokens} label="Custom Rules" value={String(customRules)} />
      </section>

      {/* Filter */}
      <div style={{ marginBottom: componentTokens.gridGap }}>
        <label style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Type Filter</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ marginLeft: primitiveSpacing[2], height: componentTokens.inputHeight, padding: `0 ${primitiveSpacing[2]}`, background: tokens.surface.secondary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}`, borderRadius: 0, fontSize: primitiveTypeScale.caption }}>
          <option value="all">All</option>
          {ruleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Rule Definitions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Name', 'Type', 'Status', 'Domain', 'Severity', 'Origin', 'Triggers', 'Version'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{r.name}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.ruleType}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: statusColor(r.status) }}>{r.status}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.domain}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: r.severity >= 4 ? primitiveSignal.critical : r.severity >= 3 ? primitiveSignal.warning : tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{r.severity}/5</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{r.origin}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{r.triggerCount}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>{r.version}</td>
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
