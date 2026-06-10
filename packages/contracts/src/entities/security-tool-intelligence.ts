/**
 * Security Tool Intelligence Entity — Commander C2 Canonical Model
 *
 * Source: Spec #61 Universal Security Signal Connector Contract,
 *         Master Technical Specification §Tool Effectiveness
 *
 * Security tool intelligence records model the effectiveness assessment
 * of security tools in the estate — tracking coverage contribution,
 * detection capabilities, known blind spots and trend over time.
 *
 * Ownership: All authenticated (read), System (assess)
 * Build Unit: Tier 3 batch (phase1-engine-entities)
 * Unlocks: /tool-intelligence, tool effectiveness surfaces
 */

import type { CommonFields } from './common';

// ─── Tool Categories ─────────────────────────────────────────────────────────

export const SECURITY_TOOL_CATEGORIES = [
  'edr',
  'siem',
  'vulnerability_scanner',
  'identity_provider',
  'cloud_posture',
  'network_monitor',
  'email_security',
  'waf',
] as const;
export type SecurityToolCategory = typeof SECURITY_TOOL_CATEGORIES[number];

// ─── Tool Trend ──────────────────────────────────────────────────────────────

export const SECURITY_TOOL_TRENDS = ['improving', 'stable', 'degrading'] as const;
export type SecurityToolTrend = typeof SECURITY_TOOL_TRENDS[number];

// ─── Security Tool Intelligence Entity ───────────────────────────────────────

export interface SecurityToolIntelligence extends CommonFields {
  entityType: 'security-tool-intelligence';
  /** Engine instance that produced this assessment */
  engineId: string;
  /** Reference to the connector being assessed */
  connectorRef: string;
  /** Category of the security tool */
  toolCategory: SecurityToolCategory;
  /** Effectiveness score (0-100) */
  effectivenessScore: number;
  /** Coverage contribution to the overall estate (0-100) */
  coverageContribution: number;
  /** Detection capabilities the tool provides */
  detectionCapabilities: string[];
  /** Known blind spots in the tool's coverage */
  knownBlindSpots: string[];
  /** When this assessment was last performed */
  lastAssessedAt: string;
  /** Trend direction of the tool's effectiveness */
  trend: SecurityToolTrend;
  /** Recommended actions to improve effectiveness */
  recommendedActions: string[];
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface SecurityToolIntelligenceValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a SecurityToolIntelligence entity for structural correctness.
 */
export function validateSecurityToolIntelligence(record: SecurityToolIntelligence): SecurityToolIntelligenceValidation {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') {
    errors.push('id: required');
  }
  if (!record.tenant || !record.tenant.tenantId || record.tenant.tenantId.trim() === '') {
    errors.push('tenant.tenantId: required');
  }
  if (!record.engineId || record.engineId.trim() === '') {
    errors.push('engineId: required');
  }
  if (!record.connectorRef || record.connectorRef.trim() === '') {
    errors.push('connectorRef: required');
  }
  if (!record.toolCategory || !SECURITY_TOOL_CATEGORIES.includes(record.toolCategory)) {
    errors.push(`toolCategory: must be one of: ${SECURITY_TOOL_CATEGORIES.join(', ')}`);
  }
  if (typeof record.effectivenessScore !== 'number' || record.effectivenessScore < 0 || record.effectivenessScore > 100) {
    errors.push('effectivenessScore: must be 0-100');
  }
  if (typeof record.coverageContribution !== 'number' || record.coverageContribution < 0 || record.coverageContribution > 100) {
    errors.push('coverageContribution: must be 0-100');
  }
  if (!Array.isArray(record.detectionCapabilities)) {
    errors.push('detectionCapabilities: must be an array');
  }
  if (!Array.isArray(record.knownBlindSpots)) {
    errors.push('knownBlindSpots: must be an array');
  }
  if (!record.lastAssessedAt || record.lastAssessedAt.trim() === '') {
    errors.push('lastAssessedAt: required');
  }
  if (!record.trend || !SECURITY_TOOL_TRENDS.includes(record.trend)) {
    errors.push(`trend: must be one of: ${SECURITY_TOOL_TRENDS.join(', ')}`);
  }
  if (!Array.isArray(record.recommendedActions)) {
    errors.push('recommendedActions: must be an array');
  }

  return { valid: errors.length === 0, errors };
}
