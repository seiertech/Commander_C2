/**
 * Audit Event Entity — Commander C2 Canonical Model
 *
 * Source: Spec #05 §6.4.5 AuditEntry
 * v1.3 Requirement 6: Audit fixture completeness
 * v1.3 Requirement 15 (Spec 00): Audit-first operation
 */

import type { CommonFields } from './common';

export interface AuditEvent extends CommonFields {
  entityType: 'audit-event';
  /** Actor who performed the action */
  actor: AuditActor;
  /** Action performed */
  action: string;
  /** Entity reference (what was acted upon) */
  entityRef: {
    entityType: string;
    entityId: string;
  };
  /** Source signal that triggered this event */
  sourceSignal: string | null;
  /** Prior state (if applicable) */
  priorState: Record<string, unknown> | null;
  /** New state (if applicable) */
  newState: Record<string, unknown> | null;
  /** Machine-readable rationale */
  rationale: string;
  /** Whether this is an immutable audit record */
  immutable: true;
}

export interface AuditActor {
  type: 'system' | 'user' | 'connector' | 'commander-ai';
  id: string;
  name: string;
}
