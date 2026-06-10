/**
 * Adaptive SLA Engine — Unit Tests
 * CMEP-1.0: Case Management Excellence
 */

import { describe, it, expect } from 'vitest';
import { computeAdaptiveSla, DEFAULT_ADAPTIVE_SLA_CONFIG } from '../../packages/rules/adaptive-sla';
import type { AdaptiveSlaInput, ActiveSlaModifier } from '../../packages/rules/adaptive-sla';

describe('Adaptive SLA Engine', () => {
  describe('modifier composition', () => {
    it('composes multiple active modifiers multiplicatively', () => {
      const input: AdaptiveSlaInput = {
        baseSlaHours: 24,
        surfaceModifier: 0.8,
        domainModifiers: [
          { name: 'exploit-active', multiplier: 0.5, active: true },
          { name: 'kev-listed', multiplier: 0.6, active: true },
        ],
      };

      const result = computeAdaptiveSla(input);
      // 24 * 0.8 * 0.5 * 0.6 = 5.76
      expect(result.computedSlaHours).toBeCloseTo(5.76, 1);
      expect(result.effectiveMultiplier).toBeCloseTo(0.24, 2);
      expect(result.activeModifiers).toHaveLength(3); // surface + 2 domain
    });

    it('ignores inactive modifiers', () => {
      const input: AdaptiveSlaInput = {
        baseSlaHours: 48,
        surfaceModifier: 1.0,
        domainModifiers: [
          { name: 'active-one', multiplier: 0.5, active: true },
          { name: 'inactive-one', multiplier: 2.0, active: false },
        ],
      };

      const result = computeAdaptiveSla(input);
      // 48 * 1.0 * 0.5 = 24 (inactive modifier ignored)
      expect(result.computedSlaHours).toBeCloseTo(24, 1);
      expect(result.activeModifiers).toHaveLength(1);
    });

    it('surface modifier alone works correctly', () => {
      const input: AdaptiveSlaInput = {
        baseSlaHours: 100,
        surfaceModifier: 0.5,
        domainModifiers: [],
      };

      const result = computeAdaptiveSla(input);
      expect(result.computedSlaHours).toBeCloseTo(50, 1);
    });
  });

  describe('cap enforcement', () => {
    it('applies maximum multiplier cap', () => {
      const input: AdaptiveSlaInput = {
        baseSlaHours: 10,
        surfaceModifier: 2.0,
        domainModifiers: [
          { name: 'relaxed', multiplier: 2.0, active: true },
          { name: 'also-relaxed', multiplier: 2.0, active: true },
        ],
      };

      const result = computeAdaptiveSla(input, { minimumSlaHours: 1, maxMultiplier: 3.0 });
      // Without cap: 10 * 2.0 * 2.0 * 2.0 = 80
      // With cap: 10 * 3.0 = 30
      expect(result.computedSlaHours).toBeCloseTo(30, 1);
      expect(result.capApplied).toBe(true);
      expect(result.effectiveMultiplier).toBe(3.0);
    });

    it('applies minimum floor', () => {
      const input: AdaptiveSlaInput = {
        baseSlaHours: 2,
        surfaceModifier: 0.1,
        domainModifiers: [
          { name: 'urgent', multiplier: 0.1, active: true },
        ],
      };

      const result = computeAdaptiveSla(input, { minimumSlaHours: 1, maxMultiplier: 3.0 });
      // 2 * 0.1 * 0.1 = 0.02 → clamped to floor 1
      expect(result.computedSlaHours).toBe(1);
      expect(result.floorApplied).toBe(true);
    });

    it('no cap or floor needed for normal values', () => {
      const input: AdaptiveSlaInput = {
        baseSlaHours: 24,
        surfaceModifier: 1.0,
        domainModifiers: [
          { name: 'moderate', multiplier: 0.8, active: true },
        ],
      };

      const result = computeAdaptiveSla(input);
      expect(result.computedSlaHours).toBeCloseTo(19.2, 1);
      expect(result.floorApplied).toBe(false);
      expect(result.capApplied).toBe(false);
    });
  });
});
