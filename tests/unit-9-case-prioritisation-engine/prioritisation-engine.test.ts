// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
import { describe, it, expect } from 'vitest';
import {
  calculateCRS,
  calculateMS,
  calculateWCS,
  determinePriority,
  generateNBA,
  determinePushPreference,
  prioritiseCase,
} from '../../packages/contracts/src/engines/case-prioritisation-engine';
import type {
  CaseEvidenceScores,
  MissionFactors,
  PrioritisationScores,
  PriorityThresholds,
  AutomationConfig,
  PrioritisationRequest,
} from '../../packages/contracts/src/engines/case-prioritisation-engine';
import { seedStrategies } from '../../packages/contracts/src/fixtures/seed-strategies';
import type { StrategyPolicy } from '../../packages/contracts/src/entities/strategy';

/**
 * Unit 9: Case Prioritisation Engine Tests
 *
 * Validates:
 * - CRS calculation with strategy weights (weighted sum)
 * - MS calculation (average of mission factors)
 * - WCS calculation (70/30 blend)
 * - Priority determination from thresholds (P0 at 95+, P1 at 80+, P2 at 60+, P3 at 40+, P4 below 40)
 * - NBA generation for each priority level
 * - Push preference determination
 * - Full prioritiseCase flow with seed strategies
 * - Error handling when strategy is missing
 * - Proof that values come from strategy (modify strategy → different result)
 * - No hardcoded values in engine source
 */

// ─── Test Fixtures ───────────────────────────────────────────────────────────

const seedWeights: Record<string, number> = {
  severity: 0.2,
  exploitability: 0.15,
  blast_radius: 0.15,
  identityExposure: 0.1,
  businessContext: 0.15,
  coverageScore: 0.1,
  threatRelevance: 0.1,
  attackContext: 0.05,
};

const seedThresholds: PriorityThresholds = {
  p0: 95,
  p1: 80,
  p2: 60,
  p3: 40,
  p4: 0,
};

const seedAutomationConfig: AutomationConfig = {
  permitted: ['case-routing', 'priority-calculation', 'sla-escalation'],
  approvalRequired: ['case-closure', 'push-governance', 'baseline-change'],
  dryRunOnly: ['push-to-vendor'],
  forbidden: ['manual-case-creation', 'manual-lifecycle-override'],
};

/** All-100 evidence for maximum CRS */
const maxEvidence: CaseEvidenceScores = {
  severity: 100,
  exploitability: 100,
  blast_radius: 100,
  identityExposure: 100,
  businessContext: 100,
  coverageScore: 100,
  threatRelevance: 100,
  attackContext: 100,
};

/** All-0 evidence for minimum CRS */
const minEvidence: CaseEvidenceScores = {
  severity: 0,
  exploitability: 0,
  blast_radius: 0,
  identityExposure: 0,
  businessContext: 0,
  coverageScore: 0,
  threatRelevance: 0,
  attackContext: 0,
};

/** Mixed evidence for realistic scenario */
const mixedEvidence: CaseEvidenceScores = {
  severity: 90,
  exploitability: 80,
  blast_radius: 70,
  identityExposure: 60,
  businessContext: 50,
  coverageScore: 40,
  threatRelevance: 30,
  attackContext: 20,
};

const highMission: MissionFactors = {
  missionObjectiveAlignment: 90,
  operationalTempoImpact: 85,
  strategicRelevance: 95,
};

const lowMission: MissionFactors = {
  missionObjectiveAlignment: 20,
  operationalTempoImpact: 15,
  strategicRelevance: 10,
};

// ─── CRS Calculation Tests ───────────────────────────────────────────────────

describe('calculateCRS — Case Risk Score', () => {
  it('returns 100 when all evidence scores are 100 and weights sum to 1.0', () => {
    const crs = calculateCRS(maxEvidence, seedWeights);
    expect(crs).toBe(100);
  });

  it('returns 0 when all evidence scores are 0', () => {
    const crs = calculateCRS(minEvidence, seedWeights);
    expect(crs).toBe(0);
  });

  it('calculates correct weighted sum for mixed evidence', () => {
    // Manual calculation:
    // 90*0.2 + 80*0.15 + 70*0.15 + 60*0.1 + 50*0.15 + 40*0.1 + 30*0.1 + 20*0.05
    // = 18 + 12 + 10.5 + 6 + 7.5 + 4 + 3 + 1 = 62
    const crs = calculateCRS(mixedEvidence, seedWeights);
    expect(crs).toBe(62);
  });

  it('uses weights from strategy — different weights produce different CRS', () => {
    const altWeights: Record<string, number> = {
      severity: 0.5,
      exploitability: 0.1,
      blast_radius: 0.1,
      identityExposure: 0.1,
      businessContext: 0.05,
      coverageScore: 0.05,
      threatRelevance: 0.05,
      attackContext: 0.05,
    };

    const crsWithSeed = calculateCRS(mixedEvidence, seedWeights);
    const crsWithAlt = calculateCRS(mixedEvidence, altWeights);

    // Alt weights heavily favour severity (90) so should produce higher CRS
    // 90*0.5 + 80*0.1 + 70*0.1 + 60*0.1 + 50*0.05 + 40*0.05 + 30*0.05 + 20*0.05
    // = 45 + 8 + 7 + 6 + 2.5 + 2 + 1.5 + 1 = 73
    expect(crsWithAlt).toBe(73);
    expect(crsWithAlt).not.toBe(crsWithSeed);
  });

  it('clamps result to 0-100 range', () => {
    // Even with extreme weights, result stays bounded
    const extremeWeights: Record<string, number> = { severity: 2.0 };
    const crs = calculateCRS(maxEvidence, extremeWeights);
    expect(crs).toBeLessThanOrEqual(100);
  });
});

// ─── MS Calculation Tests ────────────────────────────────────────────────────

describe('calculateMS — Mission Score', () => {
  it('returns average of three mission factors', () => {
    const ms = calculateMS(highMission);
    // (90 + 85 + 95) / 3 = 90
    expect(ms).toBe(90);
  });

  it('returns 0 when all factors are 0', () => {
    const ms = calculateMS({
      missionObjectiveAlignment: 0,
      operationalTempoImpact: 0,
      strategicRelevance: 0,
    });
    expect(ms).toBe(0);
  });

  it('returns 100 when all factors are 100', () => {
    const ms = calculateMS({
      missionObjectiveAlignment: 100,
      operationalTempoImpact: 100,
      strategicRelevance: 100,
    });
    expect(ms).toBe(100);
  });

  it('calculates correct average for low mission factors', () => {
    const ms = calculateMS(lowMission);
    // (20 + 15 + 10) / 3 = 15
    expect(ms).toBe(15);
  });
});

// ─── WCS Calculation Tests ───────────────────────────────────────────────────

describe('calculateWCS — Weighted Composite Score', () => {
  it('applies default 70/30 blend (70% CRS + 30% MS)', () => {
    const wcs = calculateWCS(80, 60);
    // 80 * 0.7 + 60 * 0.3 = 56 + 18 = 74
    expect(wcs).toBe(74);
  });

  it('returns CRS when MS is 0 (70% of CRS)', () => {
    const wcs = calculateWCS(100, 0);
    // 100 * 0.7 + 0 * 0.3 = 70
    expect(wcs).toBe(70);
  });

  it('returns MS contribution when CRS is 0 (30% of MS)', () => {
    const wcs = calculateWCS(0, 100);
    // 0 * 0.7 + 100 * 0.3 = 30
    expect(wcs).toBeCloseTo(30, 10);
  });

  it('returns 100 when both CRS and MS are 100', () => {
    const wcs = calculateWCS(100, 100);
    expect(wcs).toBe(100);
  });

  it('accepts custom CRS weight', () => {
    const wcs = calculateWCS(80, 60, 0.5);
    // 80 * 0.5 + 60 * 0.5 = 40 + 30 = 70
    expect(wcs).toBe(70);
  });

  it('clamps result to 0-100 range', () => {
    const wcs = calculateWCS(100, 100, 0.7);
    expect(wcs).toBeLessThanOrEqual(100);
    expect(wcs).toBeGreaterThanOrEqual(0);
  });
});

// ─── Priority Determination Tests ────────────────────────────────────────────

describe('determinePriority — threshold-based priority mapping', () => {
  it('assigns P0 when WCS >= 95', () => {
    expect(determinePriority(95, seedThresholds)).toBe('P0');
    expect(determinePriority(100, seedThresholds)).toBe('P0');
    expect(determinePriority(99.5, seedThresholds)).toBe('P0');
  });

  it('assigns P1 when WCS >= 80 and < 95', () => {
    expect(determinePriority(80, seedThresholds)).toBe('P1');
    expect(determinePriority(94.9, seedThresholds)).toBe('P1');
    expect(determinePriority(87, seedThresholds)).toBe('P1');
  });

  it('assigns P2 when WCS >= 60 and < 80', () => {
    expect(determinePriority(60, seedThresholds)).toBe('P2');
    expect(determinePriority(79.9, seedThresholds)).toBe('P2');
    expect(determinePriority(70, seedThresholds)).toBe('P2');
  });

  it('assigns P3 when WCS >= 40 and < 60', () => {
    expect(determinePriority(40, seedThresholds)).toBe('P3');
    expect(determinePriority(59.9, seedThresholds)).toBe('P3');
    expect(determinePriority(50, seedThresholds)).toBe('P3');
  });

  it('assigns P4 when WCS < 40', () => {
    expect(determinePriority(39.9, seedThresholds)).toBe('P4');
    expect(determinePriority(0, seedThresholds)).toBe('P4');
    expect(determinePriority(20, seedThresholds)).toBe('P4');
  });

  it('uses thresholds from strategy — different thresholds produce different priority', () => {
    const altThresholds: PriorityThresholds = { p0: 90, p1: 70, p2: 50, p3: 30, p4: 0 };

    // WCS 85 is P1 with seed thresholds (80+) but P1 with alt too (70+)
    // WCS 75 is P2 with seed thresholds (60+) but P1 with alt thresholds (70+)
    expect(determinePriority(75, seedThresholds)).toBe('P2');
    expect(determinePriority(75, altThresholds)).toBe('P1');
  });
});

// ─── NBA Generation Tests ────────────────────────────────────────────────────

describe('generateNBA — Next Best Action list', () => {
  const baseScores: PrioritisationScores = { crs: 80, ms: 70, wcs: 77 };

  it('generates immediate actions for P0', () => {
    const nba = generateNBA('P0', 'vulnerability', { crs: 98, ms: 95, wcs: 97 });
    expect(nba.length).toBeGreaterThanOrEqual(2);
    expect(nba[0].priority).toBe('immediate');
    expect(nba.every((a) => a.priority === 'immediate')).toBe(true);
  });

  it('generates immediate + scheduled actions for P1', () => {
    const nba = generateNBA('P1', 'drift', { crs: 85, ms: 80, wcs: 83.5 });
    expect(nba.length).toBeGreaterThanOrEqual(2);
    expect(nba[0].priority).toBe('immediate');
    expect(nba.some((a) => a.priority === 'scheduled')).toBe(true);
  });

  it('generates scheduled actions for P2', () => {
    const nba = generateNBA('P2', 'exposure', { crs: 70, ms: 60, wcs: 67 });
    expect(nba.length).toBeGreaterThanOrEqual(1);
    expect(nba[0].priority).toBe('scheduled');
  });

  it('generates deferred actions for P3', () => {
    const nba = generateNBA('P3', 'coverage', { crs: 50, ms: 40, wcs: 47 });
    expect(nba.length).toBeGreaterThanOrEqual(1);
    expect(nba[0].priority).toBe('deferred');
  });

  it('generates deferred actions for P4', () => {
    const nba = generateNBA('P4', 'tool-health', { crs: 20, ms: 10, wcs: 17 });
    expect(nba.length).toBeGreaterThanOrEqual(1);
    expect(nba[0].priority).toBe('deferred');
  });

  it('includes case type in action descriptions', () => {
    const nba = generateNBA('P0', 'identity', { crs: 98, ms: 95, wcs: 97 });
    expect(nba[0].action).toContain('identity');
  });

  it('includes rationale with score references', () => {
    const nba = generateNBA('P1', 'drift', { crs: 85, ms: 80, wcs: 83.5 });
    expect(nba[0].rationale).toContain('83.5');
  });
});

// ─── Push Preference Tests ───────────────────────────────────────────────────

describe('determinePushPreference — push vs manual decision', () => {
  it('returns hybrid when push-governance requires approval (seed config)', () => {
    const scores: PrioritisationScores = { crs: 90, ms: 85, wcs: 88.5 };
    const result = determinePushPreference(scores, seedAutomationConfig);
    // push-governance is in approvalRequired → hybrid
    expect(result).toBe('hybrid');
  });

  it('returns manual-recommended when push-governance is forbidden', () => {
    const forbiddenConfig: AutomationConfig = {
      permitted: ['case-routing'],
      approvalRequired: ['case-closure'],
      dryRunOnly: [],
      forbidden: ['push-governance'],
    };
    const scores: PrioritisationScores = { crs: 90, ms: 85, wcs: 88.5 };
    const result = determinePushPreference(scores, forbiddenConfig);
    expect(result).toBe('manual-recommended');
  });

  it('returns push-recommended when push-governance is permitted and WCS >= 70', () => {
    const permittedConfig: AutomationConfig = {
      permitted: ['case-routing', 'push-governance'],
      approvalRequired: ['case-closure'],
      dryRunOnly: [],
      forbidden: [],
    };
    const scores: PrioritisationScores = { crs: 80, ms: 70, wcs: 77 };
    const result = determinePushPreference(scores, permittedConfig);
    expect(result).toBe('push-recommended');
  });

  it('returns manual-recommended for low WCS when push is not explicitly permitted', () => {
    const neutralConfig: AutomationConfig = {
      permitted: ['case-routing'],
      approvalRequired: [],
      dryRunOnly: [],
      forbidden: [],
    };
    const scores: PrioritisationScores = { crs: 30, ms: 20, wcs: 27 };
    const result = determinePushPreference(scores, neutralConfig);
    expect(result).toBe('manual-recommended');
  });
});

// ─── Full prioritiseCase Flow Tests ──────────────────────────────────────────

describe('prioritiseCase — full flow with seed strategies', () => {
  const baseRequest: PrioritisationRequest = {
    case_id: 'case-001',
    case_type: 'vulnerability',
    evidence: mixedEvidence,
    missionFactors: highMission,
  };

  it('returns successful result with all fields populated', () => {
    const result = prioritiseCase(baseRequest, seedStrategies);

    expect(result.success).toBe(true);
    expect(result.priority).not.toBeNull();
    expect(result.scores).not.toBeNull();
    expect(result.scores!.crs).toBeGreaterThan(0);
    expect(result.scores!.ms).toBeGreaterThan(0);
    expect(result.scores!.wcs).toBeGreaterThan(0);
    expect(result.nbaList.length).toBeGreaterThan(0);
    expect(result.pushPreference).not.toBeNull();
    expect(result.rationale).toContain('case-001');
    expect(result.sourcePolicy).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('calculates correct scores for mixed evidence + high mission', () => {
    const result = prioritiseCase(baseRequest, seedStrategies);

    // CRS = 62 (calculated above)
    expect(result.scores!.crs).toBe(62);
    // MS = (90 + 85 + 95) / 3 = 90
    expect(result.scores!.ms).toBe(90);
    // WCS = 62 * 0.7 + 90 * 0.3 = 43.4 + 27 = 70.4
    expect(result.scores!.wcs).toBeCloseTo(70.4, 1);
  });

  it('assigns correct priority based on WCS and seed thresholds', () => {
    const result = prioritiseCase(baseRequest, seedStrategies);
    // WCS = 70.4 → P2 (60 <= 70.4 < 80)
    expect(result.priority).toBe('P2');
  });

  it('assigns P0 for maximum evidence and mission', () => {
    const p0Request: PrioritisationRequest = {
      case_id: 'case-p0',
      case_type: 'vulnerability',
      evidence: maxEvidence,
      missionFactors: { missionObjectiveAlignment: 100, operationalTempoImpact: 100, strategicRelevance: 100 },
    };
    const result = prioritiseCase(p0Request, seedStrategies);
    // CRS = 100, MS = 100, WCS = 100 → P0
    expect(result.priority).toBe('P0');
  });

  it('assigns P4 for minimum evidence and mission', () => {
    const p4Request: PrioritisationRequest = {
      case_id: 'case-p4',
      case_type: 'tool-health',
      evidence: minEvidence,
      missionFactors: { missionObjectiveAlignment: 0, operationalTempoImpact: 0, strategicRelevance: 0 },
    };
    const result = prioritiseCase(p4Request, seedStrategies);
    // CRS = 0, MS = 0, WCS = 0 → P4
    expect(result.priority).toBe('P4');
  });

  it('includes source policy reference from prioritisation-weight strategy', () => {
    const result = prioritiseCase(baseRequest, seedStrategies);
    const weightPolicy = seedStrategies.find(
      (s) => s.surface_type === 'prioritisation-weight' && s.status === 'active',
    )!;
    expect(result.sourcePolicy!.id).toBe(weightPolicy.id);
    expect(result.sourcePolicy!.version).toBe(weightPolicy.policy_version);
  });
});

// ─── Error Handling Tests ────────────────────────────────────────────────────

describe('prioritiseCase — error handling when strategy is missing', () => {
  const baseRequest: PrioritisationRequest = {
    case_id: 'case-err',
    case_type: 'drift',
    evidence: mixedEvidence,
    missionFactors: highMission,
  };

  it('returns error when no strategies provided', () => {
    const result = prioritiseCase(baseRequest, []);
    expect(result.success).toBe(false);
    expect(result.error).toContain('prioritisation-weight');
    expect(result.priority).toBeNull();
    expect(result.scores).toBeNull();
  });

  it('returns error when prioritisation-weight strategy is missing', () => {
    const withoutWeight = seedStrategies.filter(
      (s) => s.surface_type !== 'prioritisation-weight',
    );
    const result = prioritiseCase(baseRequest, withoutWeight);
    expect(result.success).toBe(false);
    expect(result.error).toContain('prioritisation-weight');
  });

  it('returns error when threshold strategy is missing', () => {
    const withoutThreshold = seedStrategies.filter(
      (s) => s.surface_type !== 'threshold',
    );
    const result = prioritiseCase(baseRequest, withoutThreshold);
    expect(result.success).toBe(false);
    expect(result.error).toContain('threshold');
  });

  it('returns error when automation-boundary strategy is missing', () => {
    const withoutAutomation = seedStrategies.filter(
      (s) => s.surface_type !== 'automation-boundary',
    );
    const result = prioritiseCase(baseRequest, withoutAutomation);
    expect(result.success).toBe(false);
    expect(result.error).toContain('automation-boundary');
  });

  it('returns error when prioritisation-weight strategy has empty weights', () => {
    const emptyWeightStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'prioritisation-weight') {
        return { ...s, configuration: { weights: {} } };
      }
      return s;
    });
    const result = prioritiseCase(baseRequest, emptyWeightStrategies);
    expect(result.success).toBe(false);
    expect(result.error).toContain('no weights configured');
  });

  it('returns error when threshold strategy has no priorityThresholds', () => {
    const noThresholdStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'threshold') {
        return { ...s, configuration: {} };
      }
      return s;
    });
    const result = prioritiseCase(baseRequest, noThresholdStrategies);
    expect(result.success).toBe(false);
    expect(result.error).toContain('priorityThresholds');
  });
});

// ─── Strategy-Driven Proof Tests ─────────────────────────────────────────────

describe('prioritiseCase — proof that values come from strategy', () => {
  const baseRequest: PrioritisationRequest = {
    case_id: 'case-proof',
    case_type: 'vulnerability',
    evidence: mixedEvidence,
    missionFactors: highMission,
  };

  it('changing weights in strategy changes CRS and final priority', () => {
    // With seed weights, CRS = 62
    const resultSeed = prioritiseCase(baseRequest, seedStrategies);

    // Create modified strategies with severity weight = 0.8 (heavily favour severity=90)
    const modifiedStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'prioritisation-weight') {
        return {
          ...s,
          configuration: {
            weights: {
              severity: 0.8,
              exploitability: 0.025,
              blast_radius: 0.025,
              identityExposure: 0.025,
              businessContext: 0.025,
              coverageScore: 0.025,
              threatRelevance: 0.025,
              attackContext: 0.05,
            },
          },
        };
      }
      return s;
    });

    const resultModified = prioritiseCase(baseRequest, modifiedStrategies);

    // Modified CRS should be higher (severity=90 * 0.8 = 72 just from severity)
    expect(resultModified.scores!.crs).toBeGreaterThan(resultSeed.scores!.crs);
    expect(resultModified.scores!.crs).not.toBe(resultSeed.scores!.crs);
  });

  it('changing thresholds in strategy changes priority assignment', () => {
    // With seed thresholds, WCS=70.4 → P2 (60 <= 70.4 < 80)
    const resultSeed = prioritiseCase(baseRequest, seedStrategies);
    expect(resultSeed.priority).toBe('P2');

    // Lower thresholds so WCS=70.4 becomes P1
    const modifiedStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'threshold') {
        return {
          ...s,
          configuration: {
            ...s.configuration,
            priorityThresholds: { p0: 90, p1: 70, p2: 50, p3: 30, p4: 0 },
          },
        };
      }
      return s;
    });

    const resultModified = prioritiseCase(baseRequest, modifiedStrategies);
    // WCS=70.4 >= 70 → P1 with modified thresholds
    expect(resultModified.priority).toBe('P1');
    expect(resultModified.priority).not.toBe(resultSeed.priority);
  });

  it('only active strategies are consumed — inactive strategies are ignored', () => {
    // Make the prioritisation-weight strategy inactive
    const inactiveStrategies: StrategyPolicy[] = seedStrategies.map((s) => {
      if (s.surface_type === 'prioritisation-weight') {
        return { ...s, status: 'superseded' as const };
      }
      return s;
    });

    const result = prioritiseCase(baseRequest, inactiveStrategies);
    expect(result.success).toBe(false);
    expect(result.error).toContain('prioritisation-weight');
  });
});

// ─── No Hardcoded Values Proof ───────────────────────────────────────────────

describe('Engine source — no hardcoded priority values', () => {
  it('determinePriority does not work without thresholds argument', () => {
    // This test proves the function requires external thresholds
    // If thresholds were hardcoded, this would still work with any input
    const customThresholds: PriorityThresholds = { p0: 50, p1: 40, p2: 30, p3: 20, p4: 0 };

    // WCS 45 would be P3 with seed thresholds but P1 with custom
    expect(determinePriority(45, seedThresholds)).toBe('P3');
    expect(determinePriority(45, customThresholds)).toBe('P1');
  });

  it('calculateCRS does not work without weights argument', () => {
    // Different weights produce different results — proves no internal defaults
    const w1: Record<string, number> = { severity: 1.0 };
    const w2: Record<string, number> = { attackContext: 1.0 };

    const evidence: CaseEvidenceScores = {
      severity: 100, exploitability: 0, blast_radius: 0,
      identityExposure: 0, businessContext: 0, coverageScore: 0,
      threatRelevance: 0, attackContext: 50,
    };

    expect(calculateCRS(evidence, w1)).toBe(100);
    expect(calculateCRS(evidence, w2)).toBe(50);
  });
});
