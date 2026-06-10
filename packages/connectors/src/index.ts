/**
 * @commander-sdr/connectors — Connector Package
 *
 * Unit 38: Mock Connectors (Connector Layer, Foundational).
 * Mock connectors for all four classes (A/B/C/D), deterministic signal
 * generation across all eight signal purposes, and a mock state machine.
 * Local-first; no live vendor APIs or credentials (Phase-2 gated).
 *
 * Source: Spec #61 Universal Security Signal Connector Contract.
 */

export {
  MOCK_CLASS_A_CONNECTORS,
  MOCK_CLASS_B_CONNECTORS,
  MOCK_CLASS_C_CONNECTORS,
  MOCK_CLASS_D_CONNECTORS,
  ALL_MOCK_CONNECTORS,
  mockConnectorsForClass,
} from './mock-connectors';

export type { MockSignal } from './mock-signal-generator';
export {
  ALL_SIGNAL_PURPOSES,
  generateMockSignals,
  generateMockSignalsForConnectors,
  coveredPurposes,
} from './mock-signal-generator';

export type { MockConnectorState } from './mock-connector-state';
export {
  pauseMockConnector,
  resumeMockConnector,
  faultMockConnector,
  recoverMockConnector,
  canMockTransition,
} from './mock-connector-state';
