/**
 * Connector Pull Orchestrator — Commander SDR
 *
 * Source: Spec #61 Universal Security Signal Connector Contract
 * Baseline: docs/99_source_archive/baseline_v2_6_2/docs/02_child_specs/61_Universal_Security_Signal_Connector_Contract_Spec.md
 *
 * Implements:
 * - Pull orchestration framework (read-only by default)
 * - Signal purpose resolution (every pull resolves to 1+ of 8 purposes)
 * - Connector state machine enforcement (5 states, valid transitions only)
 * - Multi-class declaration support
 * - Conformance tier tracking per connector per class
 *
 * All operations are read-only. No write operations to source platforms.
 * Per Spec #61 §4.1: "no write operations to source platform under any circumstance"
 */

import type { Connector, ConnectorState, ConformanceTier, ClassConformance, PullResult, SignalPurposeResolution } from '../entities/connector';
import type { ConnectorClass, SignalPurpose } from '../entities/common';

// ─── Signal Purpose Resolution ───────────────────────────────────────────────

/**
 * Maps connector classes to their consumed signal purposes per Spec #61 §4.
 *
 * Class A (SOC Telemetry): case-creation, case-enrichment
 * Class B (Operational Verdict): verdict-pattern, identity-behaviour
 * Class C (Configuration State): drift-evaluation, coverage-assessment, posture-measurement
 * Class D (Threat Intelligence): threat-correlation
 */
export const CLASS_TO_SIGNAL_PURPOSES: Record<ConnectorClass, SignalPurpose[]> = {
  A: ['case-creation', 'case-enrichment'],
  B: ['verdict-pattern', 'identity-behaviour'],
  C: ['drift-evaluation', 'coverage-assessment', 'posture-measurement'],
  D: ['threat-correlation'],
};

/**
 * Resolve signal purposes for a pull operation based on the connector's declared classes.
 * Every pull resolves to 1+ of 8 purposes (exhaustive per Spec #61 §3).
 */
export function resolveSignalPurposes(connector: Connector): SignalPurpose[] {
  const purposes = new Set<SignalPurpose>();
  for (const cls of connector.classes) {
    for (const purpose of CLASS_TO_SIGNAL_PURPOSES[cls]) {
      purposes.add(purpose);
    }
  }
  return [...purposes];
}

/**
 * Create a signal purpose resolution record for a pull operation.
 */
export function createSignalPurposeResolution(
  connector: Connector,
  pullRunId: string,
): SignalPurposeResolution {
  return {
    connectorId: connector.id,
    pullRunId,
    resolvedPurposes: resolveSignalPurposes(connector),
    resolvedAt: new Date().toISOString(),
  };
}

// ─── Connector State Machine ─────────────────────────────────────────────────

/**
 * Valid state transitions per Spec #61 connector lifecycle.
 * Connectors start in 'pending-approval' and progress through the lifecycle.
 */
export const VALID_STATE_TRANSITIONS: Record<ConnectorState, ConnectorState[]> = {
  'pending-approval': ['active', 'decommissioned'],
  'active': ['paused', 'error', 'decommissioned'],
  'paused': ['active', 'decommissioned'],
  'error': ['active', 'paused', 'decommissioned'],
  'decommissioned': [], // terminal state
};

/**
 * Check whether a state transition is valid.
 */
export function isValidTransition(from: ConnectorState, to: ConnectorState): boolean {
  return VALID_STATE_TRANSITIONS[from].includes(to);
}

/**
 * Attempt a state transition. Returns the new state if valid, throws if invalid.
 */
export function transitionState(connector: Connector, newState: ConnectorState): ConnectorState {
  if (!isValidTransition(connector.state, newState)) {
    throw new Error(
      `Invalid connector state transition: ${connector.state} → ${newState}. ` +
      `Valid transitions from '${connector.state}': [${VALID_STATE_TRANSITIONS[connector.state].join(', ')}]`
    );
  }
  return newState;
}

// ─── Pull Orchestration ──────────────────────────────────────────────────────

/**
 * Determine whether a connector is eligible to pull (must be in 'active' state).
 */
export function canPull(connector: Connector): boolean {
  return connector.state === 'active';
}

/**
 * Execute a pull operation (read-only). Returns a PullResult.
 *
 * This is the orchestration framework — actual data retrieval is delegated
 * to connector-specific adapters (Phase 2). In Phase 1, this produces a
 * deterministic mock result for testing.
 *
 * Per Spec #61: "no write operations to source platform under any circumstance"
 * Per Spec #61 §4.1: "every pull operation logged with timestamp, status, payload size"
 */
export function executePull(connector: Connector, runId: string): PullResult {
  if (!canPull(connector)) {
    return {
      connectorId: connector.id,
      runId,
      status: 'failed',
      recordsIngested: 0,
      signalPurposes: [],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      errorDetail: `Connector not in 'active' state (current: '${connector.state}'). Pull rejected.`,
    };
  }

  const purposes = resolveSignalPurposes(connector);

  return {
    connectorId: connector.id,
    runId,
    status: 'success',
    recordsIngested: 0, // Phase 1: no real data; mock connectors (Unit 38) will produce records
    signalPurposes: purposes,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    errorDetail: null,
  };
}

// ─── Conformance Tier Assessment ─────────────────────────────────────────────

/**
 * Assess conformance tier for a connector per class.
 * Returns the current ClassConformance records.
 *
 * In Phase 1, all connectors start at 'planned' tier.
 * Promotion to baseline/full/certified requires conformance test suite (Unit 39, Phase 2).
 */
export function assessConformanceTiers(connector: Connector): ClassConformance[] {
  return connector.classes.map((cls) => ({
    class: cls,
    tier: 'planned' as ConformanceTier,
    certifiedAt: null,
    lastAssessedAt: new Date().toISOString(),
  }));
}

// ─── Multi-Class Validation ──────────────────────────────────────────────────

/**
 * Validate that a connector's class declarations are valid (A/B/C/D only).
 * Per Spec #61 Doctrinal Assertion 11: "Connector classes are A/B/C/D only."
 */
export function validateClassDeclarations(classes: string[]): { valid: boolean; invalid: string[] } {
  const validClasses: ConnectorClass[] = ['A', 'B', 'C', 'D'];
  const invalid = classes.filter((c) => !validClasses.includes(c as ConnectorClass));
  return { valid: invalid.length === 0, invalid };
}
