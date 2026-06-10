// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Connector Layer Foundation Tests — Unit 4
 *
 * Source: Spec #61 Universal Security Signal Connector Contract
 * Tests: connector lifecycle, multi-class declaration, signal purpose routing
 */

import { describe, it, expect } from 'vitest';
import {
  resolveSignalPurposes,
  createSignalPurposeResolution,
  CLASS_TO_SIGNAL_PURPOSES,
  VALID_STATE_TRANSITIONS,
  isValidTransition,
  transitionState,
  canPull,
  executePull,
  assessConformanceTiers,
  validateClassDeclarations,
} from '../../packages/contracts/src/resolvers/connector-pull-orchestrator';
import { seedConnectors } from '../../packages/contracts/src/fixtures/seed-connectors';
import type { Connector } from '../../packages/contracts/src/entities/connector';

describe('Signal Purpose Resolution (Spec #61 §3)', () => {
  it('Class A resolves to case-creation and case-enrichment', () => {
    expect(CLASS_TO_SIGNAL_PURPOSES['A']).toEqual(['case-creation', 'case-enrichment']);
  });

  it('Class B resolves to verdict-pattern and identity-behaviour', () => {
    expect(CLASS_TO_SIGNAL_PURPOSES['B']).toEqual(['verdict-pattern', 'identity-behaviour']);
  });

  it('Class C resolves to drift-evaluation, coverage-assessment, posture-measurement', () => {
    expect(CLASS_TO_SIGNAL_PURPOSES['C']).toEqual(['drift-evaluation', 'coverage-assessment', 'posture-measurement']);
  });

  it('Class D resolves to threat-correlation', () => {
    expect(CLASS_TO_SIGNAL_PURPOSES['D']).toEqual(['threat-correlation']);
  });

  it('all 8 signal purposes are covered across the 4 classes', () => {
    const allPurposes = new Set(Object.values(CLASS_TO_SIGNAL_PURPOSES).flat());
    expect(allPurposes.size).toBe(8);
  });

  it('multi-class connector resolves to union of purposes', () => {
    // Create a mock multi-class connector (A+B+C like Defender for Endpoint per Spec #61 §5)
    const multiClass: Connector = {
      ...seedConnectors[0],
      classes: ['A', 'B', 'C'],
    };
    const purposes = resolveSignalPurposes(multiClass);
    expect(purposes).toContain('case-creation');
    expect(purposes).toContain('case-enrichment');
    expect(purposes).toContain('verdict-pattern');
    expect(purposes).toContain('identity-behaviour');
    expect(purposes).toContain('drift-evaluation');
    expect(purposes).toContain('coverage-assessment');
    expect(purposes).toContain('posture-measurement');
    expect(purposes.length).toBe(7); // 2 + 2 + 3 = 7 unique
  });

  it('single-class connector resolves to its class purposes only', () => {
    const singleClass: Connector = {
      ...seedConnectors[0],
      classes: ['D'],
    };
    const purposes = resolveSignalPurposes(singleClass);
    expect(purposes).toEqual(['threat-correlation']);
  });

  it('createSignalPurposeResolution produces a valid resolution record', () => {
    const resolution = createSignalPurposeResolution(seedConnectors[0], 'run-test-001');
    expect(resolution.connector_id).toBe(seedConnectors[0].id);
    expect(resolution.pullRunId).toBe('run-test-001');
    expect(resolution.resolvedPurposes.length).toBeGreaterThan(0);
    expect(resolution.resolvedAt).toBeTruthy();
  });
});

describe('Connector State Machine (Spec #61 lifecycle)', () => {
  it('pending-approval can transition to active or decommissioned', () => {
    expect(VALID_STATE_TRANSITIONS['pending-approval']).toEqual(['active', 'decommissioned']);
  });

  it('active can transition to paused, error, or decommissioned', () => {
    expect(VALID_STATE_TRANSITIONS['active']).toEqual(['paused', 'error', 'decommissioned']);
  });

  it('decommissioned is terminal (no valid transitions)', () => {
    expect(VALID_STATE_TRANSITIONS['decommissioned']).toEqual([]);
  });

  it('isValidTransition returns true for valid transitions', () => {
    expect(isValidTransition('pending-approval', 'active')).toBe(true);
    expect(isValidTransition('active', 'paused')).toBe(true);
    expect(isValidTransition('error', 'active')).toBe(true);
  });

  it('isValidTransition returns false for invalid transitions', () => {
    expect(isValidTransition('pending-approval', 'paused')).toBe(false);
    expect(isValidTransition('decommissioned', 'active')).toBe(false);
    expect(isValidTransition('paused', 'error')).toBe(false);
  });

  it('transitionState throws on invalid transition', () => {
    const connector: Connector = { ...seedConnectors[0], state: 'decommissioned' };
    expect(() => transitionState(connector, 'active')).toThrow('Invalid connector state transition');
  });

  it('transitionState returns new state on valid transition', () => {
    const connector: Connector = { ...seedConnectors[0], state: 'pending-approval' };
    expect(transitionState(connector, 'active')).toBe('active');
  });
});

describe('Pull Orchestration (Spec #61 read-only)', () => {
  it('canPull returns true only for active connectors', () => {
    expect(canPull({ ...seedConnectors[0], state: 'active' })).toBe(true);
    expect(canPull({ ...seedConnectors[0], state: 'paused' })).toBe(false);
    expect(canPull({ ...seedConnectors[0], state: 'error' })).toBe(false);
    expect(canPull({ ...seedConnectors[0], state: 'pending-approval' })).toBe(false);
    expect(canPull({ ...seedConnectors[0], state: 'decommissioned' })).toBe(false);
  });

  it('executePull succeeds for active connector', () => {
    const connector: Connector = { ...seedConnectors[0], state: 'active' };
    const result = executePull(connector, 'run-001');
    expect(result.status).toBe('success');
    expect(result.connector_id).toBe(connector.id);
    expect(result.runId).toBe('run-001');
    expect(result.signalPurposes.length).toBeGreaterThan(0);
    expect(result.errorDetail).toBeNull();
  });

  it('executePull fails for non-active connector', () => {
    const connector: Connector = { ...seedConnectors[0], state: 'paused' };
    const result = executePull(connector, 'run-002');
    expect(result.status).toBe('failed');
    expect(result.recordsIngested).toBe(0);
    expect(result.signalPurposes).toEqual([]);
    expect(result.errorDetail).toContain('not in \'active\' state');
  });
});

describe('Conformance Tier Assessment (Spec #61 §7)', () => {
  it('assessConformanceTiers returns one record per declared class', () => {
    const connector: Connector = { ...seedConnectors[0], classes: ['A', 'B', 'C'] };
    const tiers = assessConformanceTiers(connector);
    expect(tiers.length).toBe(3);
    expect(tiers[0].class).toBe('A');
    expect(tiers[1].class).toBe('B');
    expect(tiers[2].class).toBe('C');
  });

  it('all tiers start at planned in Phase 1', () => {
    const tiers = assessConformanceTiers(seedConnectors[0]);
    for (const t of tiers) {
      expect(t.tier).toBe('planned');
      expect(t.certifiedAt).toBeNull();
    }
  });
});

describe('Multi-Class Validation (Spec #61 Doctrinal Assertion 11)', () => {
  it('validates A/B/C/D as valid classes', () => {
    const result = validateClassDeclarations(['A', 'B', 'C', 'D']);
    expect(result.valid).toBe(true);
    expect(result.invalid).toEqual([]);
  });

  it('rejects invented classes', () => {
    const result = validateClassDeclarations(['A', 'E', 'X']);
    expect(result.valid).toBe(false);
    expect(result.invalid).toEqual(['E', 'X']);
  });
});
