/**
 * Vulnerability SSVC Evaluator — Unit Tests
 * CMEP-1.0: Case Management Excellence
 */

import { describe, it, expect } from 'vitest';
import { evaluateSSVC } from '../../packages/contracts/src/profiles/vulnerability/vuln-ssvc-evaluator';
import type { SSVCInput, SSVCConfiguration } from '../../packages/contracts/src/profiles/vulnerability/vuln-ssvc-evaluator';

describe('Vulnerability SSVC Evaluator', () => {
  describe('decision points', () => {
    it('active exploitation + automatable → Act', () => {
      const input: SSVCInput = { exploitation: 'active', automatable: 'yes', technicalImpact: 'partial', missionImpact: 'low' };
      const result = evaluateSSVC(input);
      expect(result.outcome).toBe('act');
      expect(result.overrideApplied).toBe(false);
    });

    it('active exploitation + total impact → Act', () => {
      const input: SSVCInput = { exploitation: 'active', automatable: 'no', technicalImpact: 'total', missionImpact: 'low' };
      const result = evaluateSSVC(input);
      expect(result.outcome).toBe('act');
    });

    it('active exploitation + high mission impact → Act', () => {
      const input: SSVCInput = { exploitation: 'active', automatable: 'no', technicalImpact: 'partial', missionImpact: 'high' };
      const result = evaluateSSVC(input);
      expect(result.outcome).toBe('act');
    });

    it('active exploitation + partial/low → Attend', () => {
      const input: SSVCInput = { exploitation: 'active', automatable: 'no', technicalImpact: 'partial', missionImpact: 'low' };
      const result = evaluateSSVC(input);
      expect(result.outcome).toBe('attend');
    });

    it('poc + automatable + total → Attend', () => {
      const input: SSVCInput = { exploitation: 'poc', automatable: 'yes', technicalImpact: 'total', missionImpact: 'low' };
      const result = evaluateSSVC(input);
      expect(result.outcome).toBe('attend');
    });

    it('poc + high mission impact → Attend', () => {
      const input: SSVCInput = { exploitation: 'poc', automatable: 'no', technicalImpact: 'partial', missionImpact: 'high' };
      const result = evaluateSSVC(input);
      expect(result.outcome).toBe('attend');
    });

    it('poc + partial + low → Track*', () => {
      const input: SSVCInput = { exploitation: 'poc', automatable: 'no', technicalImpact: 'partial', missionImpact: 'low' };
      const result = evaluateSSVC(input);
      expect(result.outcome).toBe('track*');
    });

    it('none + partial + low → Track', () => {
      const input: SSVCInput = { exploitation: 'none', automatable: 'no', technicalImpact: 'partial', missionImpact: 'low' };
      const result = evaluateSSVC(input);
      expect(result.outcome).toBe('track');
    });

    it('none + total + high → Track*', () => {
      const input: SSVCInput = { exploitation: 'none', automatable: 'no', technicalImpact: 'total', missionImpact: 'high' };
      const result = evaluateSSVC(input);
      expect(result.outcome).toBe('track*');
    });
  });

  describe('outcome mapping', () => {
    it('all outcomes are one of track, track*, attend, act', () => {
      const validOutcomes = ['track', 'track*', 'attend', 'act'];
      const exploitations: Array<'none' | 'poc' | 'active'> = ['none', 'poc', 'active'];
      const automatables: Array<'no' | 'yes'> = ['no', 'yes'];
      const impacts: Array<'partial' | 'total'> = ['partial', 'total'];
      const missions: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

      for (const exploitation of exploitations) {
        for (const automatable of automatables) {
          for (const technicalImpact of impacts) {
            for (const missionImpact of missions) {
              const result = evaluateSSVC({ exploitation, automatable, technicalImpact, missionImpact });
              expect(validOutcomes).toContain(result.outcome);
            }
          }
        }
      }
    });
  });

  describe('overrides', () => {
    it('applies matching override rule', () => {
      const config: SSVCConfiguration = {
        overrides: [
          { exploitation: 'active', automatable: 'yes', outcome: 'act' },
        ],
      };

      const input: SSVCInput = { exploitation: 'active', automatable: 'yes', technicalImpact: 'partial', missionImpact: 'low' };
      const result = evaluateSSVC(input, config);
      expect(result.outcome).toBe('act');
      expect(result.overrideApplied).toBe(true);
    });

    it('falls through when no override matches', () => {
      const config: SSVCConfiguration = {
        overrides: [
          { exploitation: 'active', automatable: 'yes', outcome: 'act' },
        ],
      };

      const input: SSVCInput = { exploitation: 'none', automatable: 'no', technicalImpact: 'partial', missionImpact: 'low' };
      const result = evaluateSSVC(input, config);
      expect(result.outcome).toBe('track');
      expect(result.overrideApplied).toBe(false);
    });
  });
});
