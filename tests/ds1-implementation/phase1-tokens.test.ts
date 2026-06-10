import { describe, it, expect } from 'vitest';
import {
  primitiveSpacing,
  primitiveRadii,
  primitiveBrand,
  primitiveNeutral,
  primitiveHud,
  primitiveSignal,
  primitiveData,
  primitiveGlow,
  primitiveMotion,
  primitiveFonts,
  primitiveTypeScale,
  primitiveLetterSpacing,
  primitiveLineHeight,
  primitivePriority,
  primitiveOoda,
  primitiveConnectorClass,
} from '../../packages/ui/src/tokens/primitives';
import { getSemanticTokens, standardTokens, missionTokens } from '../../packages/ui/src/tokens/semantic';
import { componentTokens } from '../../packages/ui/src/tokens/components';

/**
 * DS-1.0 Implementation Phase 1 — Token Validation Tests
 *
 * Verifies every pinned value from DESIGN_SYSTEM.md §2-§4.
 */

describe('Primitive Tokens — §2.1 Spacing (8px grid)', () => {
  it('has 9 spacing values on 8px grid', () => {
    expect(primitiveSpacing[0]).toBe('0px');
    expect(primitiveSpacing[1]).toBe('4px');
    expect(primitiveSpacing[2]).toBe('8px');
    expect(primitiveSpacing[3]).toBe('12px');
    expect(primitiveSpacing[4]).toBe('16px');
    expect(primitiveSpacing[5]).toBe('24px');
    expect(primitiveSpacing[6]).toBe('32px');
    expect(primitiveSpacing[7]).toBe('48px');
    expect(primitiveSpacing[8]).toBe('64px');
  });
});

describe('Primitive Tokens — §2.2 Radius', () => {
  it('sm=0px, md=2px, lg=2px, full=9999px', () => {
    expect(primitiveRadii.sm).toBe('0px');
    expect(primitiveRadii.md).toBe('2px');
    expect(primitiveRadii.lg).toBe('2px');
    expect(primitiveRadii.full).toBe('9999px');
  });
});

describe('Primitive Tokens — §2.3 Brand anchors', () => {
  it('navy=#061936, navy2=#071f43, gold=#ffd21f, cream=#f4f1eb', () => {
    expect(primitiveBrand.navy).toBe('#061936');
    expect(primitiveBrand.navy2).toBe('#071f43');
    expect(primitiveBrand.gold).toBe('#ffd21f');
    expect(primitiveBrand.cream).toBe('#f4f1eb');
  });
});

describe('Primitive Tokens — §2.4 Neutral ramp (Standard)', () => {
  it('has 11 neutral values', () => {
    expect(primitiveNeutral[0]).toBe('#ffffff');
    expect(primitiveNeutral[50]).toBe('#f2f5f9');
    expect(primitiveNeutral[900]).toBe('#0e1d32');
  });
});

describe('Primitive Tokens — §2.5 HUD ramp (Mission)', () => {
  it('has correct HUD values', () => {
    expect(primitiveHud.bg0).toBe('#050b16');
    expect(primitiveHud.bg1).toBe('#08111f');
    expect(primitiveHud.bg2).toBe('#0c1828');
    expect(primitiveHud.bg3).toBe('#122236');
    expect(primitiveHud.text0).toBe('#e8f0fb');
  });
});

describe('Primitive Tokens — §2.6 Signal colours', () => {
  it('critical=#d92d20, warning=#e8a317, success=#1a7a3f, info=#2563aa, neutral=#68758b', () => {
    expect(primitiveSignal.critical).toBe('#d92d20');
    expect(primitiveSignal.warning).toBe('#e8a317');
    expect(primitiveSignal.success).toBe('#1a7a3f');
    expect(primitiveSignal.info).toBe('#2563aa');
    expect(primitiveSignal.neutral).toBe('#68758b');
  });
});

describe('Primitive Tokens — §2.7 Data palette', () => {
  it('has 8 colours', () => {
    expect(Object.keys(primitiveData).length).toBe(8);
    expect(primitiveData[1]).toBe('#2563aa');
    expect(primitiveData[8]).toBe('#8a8f98');
  });
});

describe('Primitive Tokens — §2.8 Glow', () => {
  it('radius=8px, intensity=0.35', () => {
    expect(primitiveGlow.radius).toBe('8px');
    expect(primitiveGlow.intensity).toBe('0.35');
  });
});

describe('Primitive Tokens — §2.9 Motion', () => {
  it('micro=100ms, standard=180ms, complex=250ms', () => {
    expect(primitiveMotion.micro).toBe('100ms');
    expect(primitiveMotion.standard).toBe('180ms');
    expect(primitiveMotion.complex).toBe('250ms');
    expect(primitiveMotion.easeDefault).toBe('ease-out');
  });
});

describe('Primitive Tokens — §2.10 Fonts', () => {
  it('single-font Inter system: display, body, and mono all resolve to Inter', () => {
    expect(primitiveFonts.display).toContain('Inter');
    expect(primitiveFonts.body).toContain('Inter');
    expect(primitiveFonts.mono).toContain('Inter');
  });
});

describe('Primitive Tokens — §2.11 Type scale', () => {
  it('body=14px, h1=24px, h2=20px, h3=16px', () => {
    expect(primitiveTypeScale.body).toBe('14px');
    expect(primitiveTypeScale.h1).toBe('24px');
    expect(primitiveTypeScale.h2).toBe('20px');
    expect(primitiveTypeScale.h3).toBe('16px');
    expect(primitiveTypeScale.micro).toBe('11px');
  });
});

describe('Primitive Tokens — §14 Priority', () => {
  it('P0 has critical colour + diamond shape', () => {
    expect(primitivePriority.p0.color).toBe('#d92d20');
    expect(primitivePriority.p0.shape).toBe('◆');
  });
  it('all 5 priorities have distinct shapes', () => {
    const shapes = Object.values(primitivePriority).map(p => p.shape);
    expect(new Set(shapes).size).toBe(5);
  });
});

describe('Semantic Tokens — §3 Mode overrides', () => {
  it('Standard mode: surface-primary = neutral-50', () => {
    expect(standardTokens.surface.primary).toBe('#f2f5f9');
  });
  it('Mission mode: surface-primary = hud-bg-1', () => {
    expect(missionTokens.surface.primary).toBe('#08111f');
  });
  it('Standard mode: text-primary = neutral-900', () => {
    expect(standardTokens.text.primary).toBe('#0e1d32');
  });
  it('Mission mode: text-primary = hud-text-0', () => {
    expect(missionTokens.text.primary).toBe('#e8f0fb');
  });
  it('action-primary is gold in both modes', () => {
    expect(standardTokens.action.primary).toBe('#ffd21f');
    expect(missionTokens.action.primary).toBe('#ffd21f');
  });
});

describe('Component Tokens — §4 Pinned dimensions', () => {
  it('topbar=56px', () => expect(componentTokens.topbarHeight).toBe('56px'));
  it('sidebar=264px', () => expect(componentTokens.sidebarWidth).toBe('264px'));
  it('sidebar-rail=72px', () => expect(componentTokens.sidebarRail).toBe('72px'));
  it('card-padding=16px', () => expect(componentTokens.cardPadding).toBe('16px'));
  it('card-radius=2px', () => expect(componentTokens.cardRadius).toBe('2px'));
  it('grid-gap=16px', () => expect(componentTokens.gridGap).toBe('16px'));
  it('content-padding=24px', () => expect(componentTokens.contentPadding).toBe('24px'));
  it('table-row=36px', () => expect(componentTokens.tableRowHeight).toBe('36px'));
  it('button=32px', () => expect(componentTokens.buttonHeight).toBe('32px'));
  it('input=34px', () => expect(componentTokens.inputHeight).toBe('34px'));
  it('search=440px', () => expect(componentTokens.searchWidth).toBe('440px'));
  it('avatar=32px', () => expect(componentTokens.avatarSize).toBe('32px'));
});
