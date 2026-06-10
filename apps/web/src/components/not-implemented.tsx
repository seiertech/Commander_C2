'use client';

import { useMode } from '@/context/mode-context';
import {
  primitiveFonts, primitiveTypeScale, primitiveLetterSpacing, primitiveSpacing, primitiveFontWeight,
} from '../../../../packages/ui/src/tokens/primitives';

/**
 * NotImplemented — Commander C2
 *
 * Honest placeholder for capabilities that have NO backing entity or fixture
 * yet. Renders a labelled, greyed, dashed-border card stating what the surface
 * is and what it requires. Never fabricates data.
 *
 * Standing rule for these pages: if a capability has no contract + seed data,
 * it is shown here as a placeholder, not invented.
 */

export function NotImplemented({
  title, requires, hud,
}: { title: string; requires: string; hud?: { panel: string; text: string; textMuted: string; line: string } }) {
  const { tokens } = useMode();
  const bg = hud ? hud.panel : tokens.surface.primary;
  const border = hud ? hud.line : tokens.border.default;
  const text = hud ? hud.text : tokens.text.secondary;
  const muted = hud ? hud.textMuted : tokens.text.muted;

  return (
    <div style={{
      border: `1px dashed ${border}`, background: bg, padding: primitiveSpacing[4],
      display: 'flex', flexDirection: 'column', gap: primitiveSpacing[1],
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: primitiveSpacing[2] }}>
        <span style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: text, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{title}</span>
        <span style={{ fontSize: primitiveTypeScale.micro, color: muted, border: `1px solid ${border}`, padding: '0 6px', textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Not Yet Implemented</span>
      </div>
      <span style={{ fontSize: primitiveTypeScale.micro, color: muted, fontFamily: primitiveFonts.body }}>Requires: {requires}</span>
    </div>
  );
}
