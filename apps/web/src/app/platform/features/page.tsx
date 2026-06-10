'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { seedFeatureRegistry } from '../../../../../../packages/contracts/src/fixtures/seed-platform';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Platform — Feature Availability
 *
 * Data: FeatureRegistryEntry from seed-platform
 * Route: /platform/features | Nav Group: Platform | Status: BUILD
 * Shows feature flags, entitlement states, and module control scopes.
 */

{/* AI-PLACEMENT: AICAP-PLATFORM-004 — Commander AI feature impact assessment */}

export default function PlatformFeaturesPage() {
  const { tokens } = useMode();

  const enabledFeatures = seedFeatureRegistry.filter((f) => f.state === 'enabled').length;
  const disabledFeatures = seedFeatureRegistry.filter((f) => f.state === 'disabled').length;
  const entitledFeatures = seedFeatureRegistry.filter((f) => f.state === 'entitled').length;

  const stateColor = (state: string) => {
    switch (state) {
      case 'enabled': return primitiveSignal.success;
      case 'disabled': return primitiveSignal.neutral;
      case 'entitled': return primitiveSignal.info;
      case 'not-entitled': return primitiveSignal.warning;
      case 'feature-flag-off': return primitiveSignal.neutral;
      default: return primitiveSignal.neutral;
    }
  };

  return (
    <PageContainer pretitle="Platform › Features" title="Feature Availability">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Total Features" value={String(seedFeatureRegistry.length)} />
        <KpiCard tokens={tokens} label="Enabled" value={String(enabledFeatures)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Disabled" value={String(disabledFeatures)} />
        <KpiCard tokens={tokens} label="Entitled" value={String(entitledFeatures)} accent={primitiveSignal.info} />
      </section>

      {/* Table */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Feature Registry</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Display Name', 'Feature Key', 'State', 'Module', 'Control Scope', 'Description'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seedFeatureRegistry.map((f) => (
                <tr key={f.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold }}>{f.displayName}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{f.featureKey}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}><span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: stateColor(f.state) }}>{f.state}</span></td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{f.module}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{f.controlScope}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.description}>{f.description}</td>
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
