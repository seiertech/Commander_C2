/**
 * Priority Reassessment Engine — Unit Tests
 * CMEP-1.0: Case Management Excellence
 */

import { describe, it, expect } from 'vitest';
import { evaluateReassessment, scoreToPriority, DEFAULT_PRIORITY_THRESHOLDS } from '../../packages/rules/priority-reassessment';
import type { ReassessmentInput } from '../../packages/rules/priority-reassessment';

describe('Priority Reassessment Engine', () => {
  describe('reprioritisation detection', () => {
    it('detects priority increase (P3 → P1)', () => {
      const input: ReassessmentInput = {
        case_id: 'case-001',
        currentPriority: 'P3',
        currentScore: 45,
        newScore: 85,
        thresholds: DEFAULT_PRIORITY_THRESHOLDS,
      };

      const result = evaluateReassessment(input);
      expect(result.reprioritisationNeeded).toBe(true);
      expect(result.computedPriority).toBe('P1');
      expect(result.scoreDelta).toBe(40);
      expect(result.rationale).toContain('P3 → P1');
    });

    it('detects priority decrease (P0 → P2)', () => {
      const input: ReassessmentInput = {
        case_id: 'case-002',
        currentPriority: 'P0',
        currentScore: 96,
        newScore: 65,
        thresholds: DEFAULT_PRIORITY_THRESHOLDS,
      };

      const result = evaluateReassessment(input);
      expect(result.reprioritisationNeeded).toBe(true);
      expect(result.computedPriority).toBe('P2');
      expect(result.scoreDelta).toBe(-31);
    });
  });

  describe('no-change path', () => {
    it('returns no change when score stays within same band', () => {
      const input: ReassessmentInput = {
        case_id: 'case-003',
        currentPriority: 'P2',
        currentScore: 65,
        newScore: 70,
        thresholds: DEFAULT_PRIORITY_THRESHOLDS,
      };

      const result = evaluateReassessment(input);
      expect(result.reprioritisationNeeded).toBe(false);
      expect(result.computedPriority).toBe('P2');
      expect(result.rationale).toContain('No priority change');
    });

    it('returns no change when score identical', () => {
      const input: ReassessmentInput = {
        case_id: 'case-004',
        currentPriority: 'P1',
        currentScore: 85,
        newScore: 85,
        thresholds: DEFAULT_PRIORITY_THRESHOLDS,
      };

      const result = evaluateReassessment(input);
      expect(result.reprioritisationNeeded).toBe(false);
      expect(result.scoreDelta).toBe(0);
    });
  });

  describe('scoreToPriority', () => {
    it('maps scores to correct priorities', () => {
      expect(scoreToPriority(100, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P0');
      expect(scoreToPriority(95, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P0');
      expect(scoreToPriority(94, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P1');
      expect(scoreToPriority(80, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P1');
      expect(scoreToPriority(79, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P2');
      expect(scoreToPriority(60, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P2');
      expect(scoreToPriority(59, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P3');
      expect(scoreToPriority(40, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P3');
      expect(scoreToPriority(39, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P4');
      expect(scoreToPriority(0, DEFAULT_PRIORITY_THRESHOLDS)).toBe('P4');
    });
  });
});
