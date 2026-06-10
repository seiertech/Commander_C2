/**
 * Mock Connector State Machine — Commander C2 (Unit 38, Connector Layer)
 *
 * Source: Spec #61 Universal Security Signal Connector Contract.
 *
 * A thin, deterministic wrapper over the Unit 4 connector state machine
 * (`transitionState` / `isValidTransition`), restricted to the operational
 * subset relevant to mock connectors: active ⇄ paused, active → error,
 * error → active. Mock connectors never touch pending-approval/decommissioned
 * lifecycle transitions (those are governance/admin actions out of mock scope).
 *
 * No live behaviour — this only computes the next state object; it performs no
 * I/O and no vendor calls.
 */

import type { Connector, ConnectorState } from '../../contracts/src/entities/connector';
import { isValidTransition, transitionState } from '../../contracts/src/resolvers/connector-pull-orchestrator';

/** Operational mock state subset. */
export type MockConnectorState = Extract<ConnectorState, 'active' | 'paused' | 'error'>;

/** Pause an active mock connector. Returns a new connector object (immutable). */
export function pauseMockConnector(connector: Connector): Connector {
  const next = transitionState(connector, 'paused');
  return { ...connector, state: next };
}

/** Resume a paused mock connector to active. */
export function resumeMockConnector(connector: Connector): Connector {
  const next = transitionState(connector, 'active');
  return { ...connector, state: next };
}

/** Fault an active mock connector into error. */
export function faultMockConnector(connector: Connector): Connector {
  const next = transitionState(connector, 'error');
  return { ...connector, state: next, last_run_status: 'failed' };
}

/** Recover an errored mock connector back to active. */
export function recoverMockConnector(connector: Connector): Connector {
  const next = transitionState(connector, 'active');
  return { ...connector, state: next, last_run_status: 'success' };
}

/** Whether a mock connector may transition to the given operational state. */
export function canMockTransition(connector: Connector, to: MockConnectorState): boolean {
  return isValidTransition(connector.state, to);
}
