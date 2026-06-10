// @ts-nocheck
/**
 * Mock Signal Generator — Commander C2 (Unit 38, Connector Layer)
 *
 * Source: Spec #61 Universal Security Signal Connector Contract §3 (Eight Signal Purposes).
 *
 * Deterministic, repeatable signal generation for the mock connectors. Given a
 * connector and a run identifier, produces a stable set of mock signals whose
 * purposes are resolved through the Unit 4 foundation (`resolveSignalPurposes`),
 * so the generator can never emit a purpose outside the connector's declared
 * classes. Determinism: output depends only on (connectorId, runId, index) — no
 * randomness, no wall-clock — so fixtures and tests are repeatable (v1.3 Req 20).
 */

import type { Connector } from '../../contracts/src/entities/connector';
import type { SignalPurpose } from '../../contracts/src/entities/common';
import { resolveSignalPurposes } from '../../contracts/src/resolvers/connector-pull-orchestrator';

/** A single deterministic mock signal. */
export interface MockSignal {
  /** Stable id: <connectorId>:<runId>:<index> */
  id: string;
  connector_id: string;
  runId: string;
  /** One of the eight canonical signal purposes (Spec #61 §3). */
  purpose: SignalPurpose;
  /** Deterministic synthetic payload reference (no real data). */
  payloadRef: string;
  /** Deterministic ISO timestamp derived from the run base + index. */
  emittedAt: string;
}

/** The eight canonical signal purposes (Spec #61 §3) — used for coverage assertions. */
export const ALL_SIGNAL_PURPOSES: SignalPurpose[] = [
  'case-creation',
  'case-enrichment',
  'verdict-pattern',
  'drift-evaluation',
  'coverage-assessment',
  'threat-correlation',
  'identity-behaviour',
  'posture-measurement',
];

/** Fixed base timestamp for deterministic emission times. */
const RUN_BASE_MS = Date.parse('2026-01-15T09:00:00.000Z');

/**
 * Generate deterministic mock signals for one connector pull.
 *
 * Emits exactly one signal per resolved purpose (stable order), so the output
 * is fully determined by the connector's declared classes and the runId.
 */
export function generateMockSignals(connector: Connector, runId: string): MockSignal[] {
  const purposes = resolveSignalPurposes(connector);
  return purposes.map((purpose, index) => ({
    id: `${connector.id}:${runId}:${index}`,
    connector_id: connector.id,
    runId,
    purpose,
    payloadRef: `mock-payload/${connector.source_type}/${purpose}/${index}`,
    // 1 minute apart per index — deterministic, no wall-clock.
    emittedAt: new Date(RUN_BASE_MS + index * 60_000).toISOString(),
  }));
}

/**
 * Generate signals across many connectors for a run, flattened.
 */
export function generateMockSignalsForConnectors(connectors: Connector[], runId: string): MockSignal[] {
  return connectors.flatMap((c) => generateMockSignals(c, runId));
}

/**
 * Compute the set of signal purposes covered by a batch of signals.
 */
export function coveredPurposes(signals: MockSignal[]): SignalPurpose[] {
  const set = new Set<SignalPurpose>();
  for (const s of signals) set.add(s.purpose);
  return ALL_SIGNAL_PURPOSES.filter((p) => set.has(p));
}
