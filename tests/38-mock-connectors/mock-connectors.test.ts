import { describe, it, expect } from 'vitest';
import {
  MOCK_CLASS_A_CONNECTORS,
  MOCK_CLASS_B_CONNECTORS,
  MOCK_CLASS_C_CONNECTORS,
  MOCK_CLASS_D_CONNECTORS,
  ALL_MOCK_CONNECTORS,
  mockConnectorsForClass,
  ALL_SIGNAL_PURPOSES,
  generateMockSignals,
  generateMockSignalsForConnectors,
  coveredPurposes,
  pauseMockConnector,
  resumeMockConnector,
  faultMockConnector,
  recoverMockConnector,
  canMockTransition,
} from '../../packages/connectors/src/index';

/**
 * Unit 38 — Mock Connectors
 *
 * Source: Spec #61 Universal Security Signal Connector Contract.
 *
 * Validates:
 *  1. Mock connectors for all four classes (A/B/C/D)
 *  2. Deterministic, repeatable mock signal generation
 *  3. All eight signal purposes covered
 *  4. Mock connector state machine (active/paused/error)
 *  5. Only A/B/C/D classes (Doctrinal Assertion 11)
 */

// ─── 1. Four classes present ──────────────────────────────────────────────────

describe('Unit 38 — Mock connectors for all four classes', () => {
  it('has Class A (SOC Telemetry) connectors', () => {
    expect(MOCK_CLASS_A_CONNECTORS.length).toBeGreaterThan(0);
    expect(MOCK_CLASS_A_CONNECTORS.every((c) => c.classes.includes('A'))).toBe(true);
  });
  it('has Class B (Operational Verdict) connectors', () => {
    expect(MOCK_CLASS_B_CONNECTORS.length).toBeGreaterThan(0);
    expect(MOCK_CLASS_B_CONNECTORS.every((c) => c.classes.includes('B'))).toBe(true);
  });
  it('has Class C (Configuration State) connectors', () => {
    expect(MOCK_CLASS_C_CONNECTORS.length).toBeGreaterThan(0);
    expect(MOCK_CLASS_C_CONNECTORS.every((c) => c.classes.includes('C'))).toBe(true);
  });
  it('has Class D (Threat Intelligence) connectors', () => {
    expect(MOCK_CLASS_D_CONNECTORS.length).toBeGreaterThan(0);
    expect(MOCK_CLASS_D_CONNECTORS.every((c) => c.classes.includes('D'))).toBe(true);
  });

  it('only declares A/B/C/D classes (Assertion 11 — no invented classes)', () => {
    const valid = new Set(['A', 'B', 'C', 'D']);
    for (const c of ALL_MOCK_CONNECTORS) {
      for (const cls of c.classes) expect(valid.has(cls)).toBe(true);
    }
  });

  it('mockConnectorsForClass returns connectors declaring the class', () => {
    for (const cls of ['A', 'B', 'C', 'D'] as const) {
      const list = mockConnectorsForClass(cls);
      expect(list.length).toBeGreaterThan(0);
      expect(list.every((c) => c.classes.includes(cls))).toBe(true);
    }
  });

  it('every mock connector has deterministic id, tenant scope and mapping pack version', () => {
    for (const c of ALL_MOCK_CONNECTORS) {
      expect(c.id).toMatch(/^mock-connector-\d{4}$/);
      expect(c.tenant.tenant_id).toBeTruthy();
      expect(c.mapping_pack_version).toBeTruthy();
    }
  });
});

// ─── 2. Deterministic signal generation ──────────────────────────────────────

describe('Unit 38 — Deterministic mock signal generation', () => {
  it('produces identical output across repeated runs (repeatable)', () => {
    const c = MOCK_CLASS_C_CONNECTORS[0];
    const a = generateMockSignals(c, 'run-X');
    const b = generateMockSignals(c, 'run-X');
    expect(a).toEqual(b);
  });

  it('emits one signal per resolved purpose, never outside declared classes', () => {
    const c = MOCK_CLASS_A_CONNECTORS[0]; // Class A → case-creation, case-enrichment
    const signals = generateMockSignals(c, 'run-1');
    expect(signals.map((s) => s.purpose).sort()).toEqual(['case-creation', 'case-enrichment']);
  });

  it('signal ids are stable and namespaced by connector + run + index', () => {
    const c = MOCK_CLASS_D_CONNECTORS[0];
    const signals = generateMockSignals(c, 'run-7');
    expect(signals[0].id).toBe(`${c.id}:run-7:0`);
  });

  it('emission timestamps are deterministic (no wall-clock)', () => {
    const c = MOCK_CLASS_C_CONNECTORS[0];
    const s1 = generateMockSignals(c, 'run-1');
    const s2 = generateMockSignals(c, 'run-1');
    expect(s1.map((s) => s.emittedAt)).toEqual(s2.map((s) => s.emittedAt));
  });
});

// ─── 3. All eight signal purposes covered ────────────────────────────────────

describe('Unit 38 — All eight signal purposes covered', () => {
  it('enumerates exactly eight canonical purposes', () => {
    expect(ALL_SIGNAL_PURPOSES.length).toBe(8);
  });

  it('the full mock connector set covers all eight purposes', () => {
    const signals = generateMockSignalsForConnectors(ALL_MOCK_CONNECTORS, 'run-coverage');
    const covered = coveredPurposes(signals);
    expect(covered.sort()).toEqual([...ALL_SIGNAL_PURPOSES].sort());
  });
});

// ─── 4. Mock connector state machine ─────────────────────────────────────────

describe('Unit 38 — Mock connector state machine', () => {
  const base = MOCK_CLASS_A_CONNECTORS[0]; // starts 'active'

  it('active → paused → active', () => {
    const paused = pauseMockConnector(base);
    expect(paused.state).toBe('paused');
    const resumed = resumeMockConnector(paused);
    expect(resumed.state).toBe('active');
  });

  it('active → error → active (recover)', () => {
    const errored = faultMockConnector(base);
    expect(errored.state).toBe('error');
    expect(errored.last_run_status).toBe('failed');
    const recovered = recoverMockConnector(errored);
    expect(recovered.state).toBe('active');
    expect(recovered.last_run_status).toBe('success');
  });

  it('rejects invalid transitions (paused connector cannot directly fault to error)', () => {
    const paused = pauseMockConnector(base);
    expect(canMockTransition(paused, 'error')).toBe(false);
    expect(() => faultMockConnector(paused)).toThrow();
  });

  it('does not mutate the input connector (immutability)', () => {
    const paused = pauseMockConnector(base);
    expect(base.state).toBe('active');
    expect(paused).not.toBe(base);
  });
});
