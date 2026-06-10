/**
 * Case Reference Number Generator — Commander C2
 *
 * Source: Spec #08 Case Management, Unit 7 rebaseline
 * Format: CMD-{type_abbrev}-{seq}-{tenant_code}
 *
 * Properties:
 * - Unique: No two cases share the same reference
 * - Deterministic: Same inputs produce same output
 * - Human-readable: Encodes case type and tenant for quick identification
 *
 * Type abbreviations (12 canonical case types):
 *   drift → DRF
 *   vulnerability → VUL
 *   identity → IDN
 *   exposure → EXP
 *   coverage → COV
 *   tool-health → THL
 *   threat-intelligence-estate-match → TIE
 *   external-attack-correlation → EAC
 *   verdict-pattern → VPT
 *   inverse-discovery-coverage-blindspot → IDB
 *   policy-effectiveness → PEF
 *   ooda-tempo-degradation → OTD
 */

import type { CaseType } from '../entities/case';

/** Type abbreviation map for case reference generation */
export const CASE_TYPE_ABBREVIATIONS: Record<CaseType, string> = {
  'drift': 'DRF',
  'vulnerability': 'VUL',
  'identity': 'IDN',
  'exposure': 'EXP',
  'coverage': 'COV',
  'tool-health': 'THL',
  'threat-intelligence-estate-match': 'TIE',
  'external-attack-correlation': 'EAC',
  'verdict-pattern': 'VPT',
  'inverse-discovery-coverage-blindspot': 'IDB',
  'policy-effectiveness': 'PEF',
  'ooda-tempo-degradation': 'OTD',
};

/** Request to generate a case reference number */
export interface CaseRefRequest {
  /** Case type (one of 12 canonical types) */
  case_type: CaseType;
  /** Sequence number (monotonically increasing per tenant) */
  sequenceNumber: number;
  /** Tenant code (short alphanumeric identifier) */
  tenantCode: string;
}

/** Result of case reference generation */
export interface CaseRefResult {
  /** Whether generation succeeded */
  success: boolean;
  /** The generated case reference */
  case_ref: string | null;
  /** Error message if failed */
  error: string | null;
}

/**
 * Generate a case reference number.
 *
 * Format: CMD-{type_abbrev}-{seq_padded}-{tenant_code}
 * Example: CMD-VUL-000042-ACME
 *
 * Rules:
 * - type_abbrev: 3-letter abbreviation from CASE_TYPE_ABBREVIATIONS
 * - seq_padded: 6-digit zero-padded sequence number
 * - tenant_code: uppercase alphanumeric tenant identifier
 */
export function generateCaseRef(request: CaseRefRequest): CaseRefResult {
  // Validate case type
  const abbreviation = CASE_TYPE_ABBREVIATIONS[request.case_type];
  if (!abbreviation) {
    return {
      success: false,
      case_ref: null,
      error: `Invalid case type '${request.case_type}'. Must be one of: ${Object.keys(CASE_TYPE_ABBREVIATIONS).join(', ')}.`,
    };
  }

  // Validate sequence number
  if (!Number.isInteger(request.sequenceNumber) || request.sequenceNumber < 1) {
    return {
      success: false,
      case_ref: null,
      error: `Invalid sequence number '${request.sequenceNumber}'. Must be a positive integer.`,
    };
  }

  // Validate tenant code
  if (!request.tenantCode || !/^[A-Z0-9]+$/i.test(request.tenantCode)) {
    return {
      success: false,
      case_ref: null,
      error: `Invalid tenant code '${request.tenantCode}'. Must be non-empty alphanumeric.`,
    };
  }

  // Generate reference
  const seqPadded = String(request.sequenceNumber).padStart(6, '0');
  const tenantUpper = request.tenantCode.toUpperCase();
  const caseRef = `CMD-${abbreviation}-${seqPadded}-${tenantUpper}`;

  return {
    success: true,
    case_ref,
    error: null,
  };
}

/**
 * Parse a case reference number back into its components.
 * Returns null if the reference is not in valid format.
 */
export function parseCaseRef(case_ref: string): { typeAbbrev: string; sequenceNumber: number; tenantCode: string } | null {
  const match = caseRef.match(/^CMD-([A-Z]{3})-(\d{6})-([A-Z0-9]+)$/);
  if (!match) return null;
  return {
    typeAbbrev: match[1],
    sequenceNumber: parseInt(match[2], 10),
    tenantCode: match[3],
  };
}
