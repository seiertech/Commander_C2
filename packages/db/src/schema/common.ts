/**
 * Common Schema Fields — Commander SDR Persistence Layer
 *
 * Every table includes tenant scope, timestamps, and source provenance.
 *
 * Source: Spec #05 §6.4.1 Common Fields
 * Data classifications per Master Technical Specification §11.1:
 * - Configuration, State, Verdict, Detection, Case, Threat Intelligence, Audit
 *
 * Data residency per Master Technical Specification §11.2:
 * - UK and US residency boundaries honoured per tenant selection
 */

import { pgTable, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

/** Data classification enum per Master Technical Specification §11.1 */
export const dataClassificationEnum = pgEnum('data_classification', [
  'configuration',
  'state',
  'verdict',
  'detection',
  'case',
  'threat_intelligence',
  'audit',
]);

/** Data residency enum per Master Technical Specification §11.2 */
export const dataResidencyEnum = pgEnum('data_residency', [
  'uk',
  'us',
  'eu',
]);

/** Connector class enum per Spec #61 — A/B/C/D only */
export const connectorClassEnum = pgEnum('connector_class', [
  'A',
  'B',
  'C',
  'D',
]);

/** Surface attribution enum per Spec #60 */
export const surfaceAttributionEnum = pgEnum('surface_attribution', [
  'internal_attack_surface',
  'external_attack_surface',
]);

/** Case status enum — 12-state system-owned lifecycle (Unit 7) */
export const caseStatusEnum = pgEnum('case_status', [
  'detected',
  'bound',
  'routed',
  'prioritised',
  'action_decomposed',
  'in_progress',
  'pending_validation',
  'validation_running',
  'validated_pass',
  'validated_fail',
  'pending_closure_gates',
  'closed_by_system',
  'reopened_by_system',
]);

/** Priority enum */
export const priorityEnum = pgEnum('priority', [
  'P0',
  'P1',
  'P2',
  'P3',
  'P4',
]);
