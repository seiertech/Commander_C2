import { describe, it, expect } from 'vitest';
import { getCompassStyles, getCardinal } from '../../packages/ui/src/components/strategic-compass';
import { getPipelineStyles, LIFECYCLE_STAGES } from '../../packages/ui/src/components/lifecycle-pipeline';
import { getRightRailStyles } from '../../packages/ui/src/components/right-rail';
import { primitiveBrand, primitiveFonts, primitiveGlow } from '../../packages/ui/src/tokens/primitives';
import { componentTokens } from '../../packages/ui/src/tokens/components';

/**
 * DS-1.0 Phase 2c — Signature Component Tests
 *
 * Validates:
 * - Strategic Heading Compass (bespoke Mission instrument)
 * - Closed-loop Lifecycle Pipeline (7 stages, gold active ring)
 * - Right-rail insight/action column
 * - All use three-layer tokens, support both modes
 */

describe('Strategic Heading Compass', () => {
  it('Standard mode: no glow', () => {
    const styles = getCompassStyles('standard');
    expect(styles.container.boxShadow).toBe('none');
  });

  it('Mission mode: has gold glow', () => {
    const styles = getCompassStyles('mission');
    expect(styles.container.boxShadow).toContain(primitiveGlow.radius);
  });

  it('heading text uses Inter font (single-font system)', () => {
    const styles = getCompassStyles('standard');
    expect(styles.headingText.fontFamily).toContain('Inter');
  });

  it('cardinal text uses gold colour', () => {
    const styles = getCompassStyles('standard');
    expect(styles.cardinalText.color).toBe(primitiveBrand.gold);
  });

  it('needle uses gold colour', () => {
    const styles = getCompassStyles('standard');
    expect(styles.needle.background).toBe(primitiveBrand.gold);
  });

  it('getCardinal returns correct directions', () => {
    expect(getCardinal(0)).toBe('N');
    expect(getCardinal(90)).toBe('E');
    expect(getCardinal(180)).toBe('S');
    expect(getCardinal(270)).toBe('W');
    expect(getCardinal(45)).toBe('NE');
    expect(getCardinal(135)).toBe('SE');
  });
});

describe('Closed-Loop Lifecycle Pipeline', () => {
  it('defines exactly 7 lifecycle stages', () => {
    expect(LIFECYCLE_STAGES.length).toBe(7);
  });

  it('stages are: New, Triage, Investigating, Awaiting Feedback, Actioning, Validation, Closure', () => {
    expect(LIFECYCLE_STAGES[0]).toBe('New');
    expect(LIFECYCLE_STAGES[1]).toBe('Triage');
    expect(LIFECYCLE_STAGES[2]).toBe('Investigating');
    expect(LIFECYCLE_STAGES[3]).toBe('Awaiting Feedback');
    expect(LIFECYCLE_STAGES[4]).toBe('Actioning');
    expect(LIFECYCLE_STAGES[5]).toBe('Validation');
    expect(LIFECYCLE_STAGES[6]).toBe('Closure');
  });

  it('active stage has gold border', () => {
    const styles = getPipelineStyles('standard');
    expect(styles.stageActive.border).toContain(primitiveBrand.gold);
  });

  it('active stage has glow in Mission mode', () => {
    const styles = getPipelineStyles('mission');
    expect(styles.stageActive.boxShadow).toContain('rgba(255,210,31');
  });

  it('stage count uses Inter font in Mission mode (single-font system)', () => {
    const styles = getPipelineStyles('mission');
    expect(styles.stageCount.fontFamily).toContain('Inter');
  });

  it('stage label is uppercase with 0.06em tracking', () => {
    const styles = getPipelineStyles('standard');
    expect(styles.stageLabel.textTransform).toBe('uppercase');
    expect(styles.stageLabel.letterSpacing).toBe('0.06em');
  });

  it('no manual lifecycle stages exist (Doctrinal Assertion 1)', () => {
    for (const stage of LIFECYCLE_STAGES) {
      expect(stage.toLowerCase()).not.toContain('manual');
    }
  });
});

describe('Right-Rail Insight/Action Column', () => {
  it('container width is 320px', () => {
    const styles = getRightRailStyles('standard');
    expect(styles.container.width).toBe('320px');
  });

  it('uses content padding from component tokens', () => {
    const styles = getRightRailStyles('standard');
    expect(styles.container.padding).toBe(componentTokens.contentPadding);
  });

  it('section title is uppercase with 0.06em tracking', () => {
    const styles = getRightRailStyles('standard');
    expect(styles.sectionTitle.textTransform).toBe('uppercase');
    expect(styles.sectionTitle.letterSpacing).toBe('0.06em');
  });

  it('Mission mode: different background', () => {
    const standard = getRightRailStyles('standard');
    const mission = getRightRailStyles('mission');
    expect(standard.container.background).not.toBe(mission.container.background);
  });
});
