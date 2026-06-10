'use client';

import { useRouter } from 'next/navigation';
import { useMode } from '@/context/mode-context';
import {
  primitiveFonts, primitiveTypeScale, primitiveLetterSpacing,
  primitiveSpacing, primitiveFontWeight, primitivePriority, primitiveHud,
} from '../../../../packages/ui/src/tokens/primitives';
import type { Case } from '../../../../packages/contracts/src/entities/case';
import {
  slaState, riskScore, riskBand, momentum, nextBestAction, ageLabel,
  type Momentum,
} from '../app/cases/case-metrics';

/**
 * CaseCard — Commander SDR (DS-1.0)
 *
 * Dense flow-board card. Surfaces only REAL Case fields (priority, SLA, owner,
 * surface, age) plus clearly-labelled DERIVED helpers (Risk Score, Momentum,
 * Next Best Action) from case-metrics.ts. No fabricated integration state.
 *
 * Honours workspace mode by default; pass `hud` to force the Mission/HUD
 * palette (used on the always-dark Case Handling board).
 */

type Tokens = ReturnType<typeof useMode>['tokens'];

/** Mission/HUD palette shaped like the slice of semantic tokens the card uses. */
const HUD_TOKENS = {
  surface: { primary: primitiveHud.bg1, secondary: primitiveHud.bg2, elevated: primitiveHud.bg3 },
  text: { primary: primitiveHud.text0, secondary: primitiveHud.text1, muted: primitiveHud.text2 },
  border: { default: primitiveHud.line2, subtle: primitiveHud.line },
  status: { critical: '#ff5a4d', warning: '#ffb43d', success: '#34c66a', info: '#5aa9ff', neutral: primitiveHud.text2 },
} as const;

function titleCase(s: string): string {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

const MOMENTUM_GLYPH: Record<Momentum, { glyph: string; label: string }> = {
  advancing: { glyph: '▲', label: 'Advancing' },
  steady: { glyph: '▶', label: 'Steady' },
  stalling: { glyph: '▼', label: 'Stalling' },
};

export function CaseCard({ caseRecord, now, hud }: { caseRecord: Case; now: number; hud?: boolean }) {
  const { tokens: modeTokens } = useMode();
  const tokens = (hud ? HUD_TOKENS : modeTokens) as Tokens;
  const router = useRouter();
  const c = caseRecord;
  const pr = primitivePriority[c.priority.toLowerCase() as keyof typeof primitivePriority];
  const sla = slaState(c, now);
  const risk = riskScore(c, now);
  const band = riskBand(risk);
  const mom = momentum(c, now);
  const nba = nextBestAction(c, now);

  const tone = (t: 'critical' | 'warning' | 'success') => t === 'critical' ? tokens.status.critical : t === 'warning' ? tokens.status.warning : tokens.status.success;
  const momColor = mom === 'advancing' ? tokens.status.success : mom === 'stalling' ? tokens.status.critical : tokens.text.muted;

  return (
    <div
      onClick={() => router.push(`/cases/${c.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/cases/${c.id}`); }}
      style={{
        cursor: 'pointer', background: tokens.surface.elevated,
        border: `1px solid ${tokens.border.subtle}`, borderLeft: `3px solid ${pr.color}`,
        padding: primitiveSpacing[3], display: 'flex', flexDirection: 'column', gap: primitiveSpacing[2],
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = tokens.border.default)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = tokens.border.subtle)}
    >
      {/* Row 1: priority + ref + derived risk score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: primitiveSpacing[2] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[1], minWidth: 0 }}>
          <span style={{ color: pr.color, fontWeight: primitiveFontWeight.bold, fontSize: primitiveTypeScale.caption }} aria-hidden>{pr.shape}</span>
          <span style={{ color: pr.color, fontWeight: primitiveFontWeight.semibold, fontSize: primitiveTypeScale.micro }}>{pr.label}</span>
          <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.caseRef}</span>
        </div>
        <span title={`Derived Risk Score ${risk}/100 — not a Spec 08 contract`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.bold, color: tone(band) }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: tone(band), display: 'inline-block' }} />{risk}<span style={{ fontFamily: primitiveFonts.body, fontWeight: primitiveFontWeight.normal, color: tokens.text.muted }}>ⓓ</span>
        </span>
      </div>

      {/* Row 2: title */}
      <span style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.primary, fontWeight: primitiveFontWeight.medium, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={c.title}>{c.title}</span>

      {/* Row 3: SLA progress (REAL) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>SLA</span>
          <span style={{ fontSize: primitiveTypeScale.micro, color: tone(sla.tone), fontWeight: primitiveFontWeight.medium }}>{sla.label}</span>
        </div>
        <div style={{ height: 4, background: tokens.border.subtle, width: '100%' }}>
          <div style={{ height: '100%', width: `${sla.pct}%`, background: tone(sla.tone) }} />
        </div>
      </div>

      {/* Row 4: meta — type + owner (REAL) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: primitiveSpacing[2] }}>
        <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titleCase(c.caseType)}</span>
        <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.secondary, whiteSpace: 'nowrap' }}>{c.owner}</span>
      </div>

      {/* Row 5: derived momentum + real surface + real age */}
      <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2], flexWrap: 'wrap', paddingTop: primitiveSpacing[1], borderTop: `1px solid ${tokens.border.subtle}` }}>
        <span title={`Momentum (derived): ${MOMENTUM_GLYPH[mom].label}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: primitiveTypeScale.micro, color: momColor }}>{MOMENTUM_GLYPH[mom].glyph} {MOMENTUM_GLYPH[mom].label} <span style={{ color: tokens.text.muted }}>ⓓ</span></span>
        <span title="Attack surface" style={{ fontSize: primitiveTypeScale.micro, color: c.surfaceAttribution === 'external_attack_surface' ? tokens.status.info : tokens.text.muted, marginLeft: 'auto' }}>{c.surfaceAttribution === 'external_attack_surface' ? 'EXT' : 'INT'}</span>
        <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.muted }}>{ageLabel(c, now)}</span>
      </div>

      {/* Row 6: Next Best Action chip (DERIVED) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[1], background: tokens.surface.primary, border: `1px dashed ${tokens.border.default}`, padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}` }}>
        <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, whiteSpace: 'nowrap' }}>Next ⓓ</span>
        <span style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nba}</span>
      </div>
    </div>
  );
}
