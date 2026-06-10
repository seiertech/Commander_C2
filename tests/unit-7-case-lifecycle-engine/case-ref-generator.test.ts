// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  generateCaseRef,
  parseCaseRef,
  CASE_TYPE_ABBREVIATIONS,
} from '../../packages/contracts/src/engines/case-ref-generator';
import { CASE_TYPES } from '../../packages/contracts/src/entities/case';
import type { CaseType } from '../../packages/contracts/src/entities/case';

/**
 * Unit 7: Case Reference Number Generator Tests
 *
 * Validates:
 * - Format: CMD-{type_abbrev}-{seq_padded}-{tenant_code}
 * - All 12 case types have abbreviations
 * - Uniqueness: different inputs produce different refs
 * - Determinism: same inputs produce same output
 * - Validation: rejects invalid inputs
 * - Parse: round-trip parse/generate
 */

describe('Case Ref Generator — CASE_TYPE_ABBREVIATIONS', () => {
  it('has abbreviations for all 12 canonical case types', () => {
    for (const caseType of CASE_TYPES) {
      expect(CASE_TYPE_ABBREVIATIONS[caseType]).toBeDefined();
      expect(CASE_TYPE_ABBREVIATIONS[caseType]).toHaveLength(3);
    }
  });

  it('all abbreviations are unique', () => {
    const abbrevs = Object.values(CASE_TYPE_ABBREVIATIONS);
    const unique = new Set(abbrevs);
    expect(unique.size).toBe(abbrevs.length);
  });

  it('all abbreviations are uppercase 3-letter codes', () => {
    for (const abbrev of Object.values(CASE_TYPE_ABBREVIATIONS)) {
      expect(abbrev).toMatch(/^[A-Z]{3}$/);
    }
  });
});

describe('Case Ref Generator — generateCaseRef', () => {
  it('generates correct format for vulnerability case', () => {
    const result = generateCaseRef({
      case_type: 'vulnerability',
      sequenceNumber: 42,
      tenantCode: 'ACME',
    });

    expect(result.success).toBe(true);
    expect(result.case_ref).toBe('CMD-VUL-000042-ACME');
    expect(result.error).toBeNull();
  });

  it('generates correct format for drift case', () => {
    const result = generateCaseRef({
      case_type: 'drift',
      sequenceNumber: 1,
      tenantCode: 'SEIER',
    });

    expect(result.success).toBe(true);
    expect(result.case_ref).toBe('CMD-DRF-000001-SEIER');
  });

  it('generates correct format for all 12 case types', () => {
    for (const caseType of CASE_TYPES) {
      const result = generateCaseRef({
        case_type: case_type,
        sequenceNumber: 1,
        tenantCode: 'TEST',
      });
      expect(result.success).toBe(true);
      expect(result.case_ref).toMatch(/^CMD-[A-Z]{3}-000001-TEST$/);
    }
  });

  it('pads sequence number to 6 digits', () => {
    const result = generateCaseRef({
      case_type: 'identity',
      sequenceNumber: 7,
      tenantCode: 'X1',
    });
    expect(result.case_ref).toBe('CMD-IDN-000007-X1');
  });

  it('handles large sequence numbers', () => {
    const result = generateCaseRef({
      case_type: 'exposure',
      sequenceNumber: 999999,
      tenantCode: 'BIG',
    });
    expect(result.case_ref).toBe('CMD-EXP-999999-BIG');
  });

  it('uppercases tenant code', () => {
    const result = generateCaseRef({
      case_type: 'coverage',
      sequenceNumber: 10,
      tenantCode: 'acme',
    });
    expect(result.case_ref).toBe('CMD-COV-000010-ACME');
  });
});

describe('Case Ref Generator — uniqueness', () => {
  it('different sequence numbers produce different refs', () => {
    const ref1 = generateCaseRef({ case_type: 'drift', sequenceNumber: 1, tenantCode: 'A' });
    const ref2 = generateCaseRef({ case_type: 'drift', sequenceNumber: 2, tenantCode: 'A' });
    expect(ref1.case_ref).not.toBe(ref2.case_ref);
  });

  it('different case types produce different refs', () => {
    const ref1 = generateCaseRef({ case_type: 'drift', sequenceNumber: 1, tenantCode: 'A' });
    const ref2 = generateCaseRef({ case_type: 'vulnerability', sequenceNumber: 1, tenantCode: 'A' });
    expect(ref1.case_ref).not.toBe(ref2.case_ref);
  });

  it('different tenants produce different refs', () => {
    const ref1 = generateCaseRef({ case_type: 'drift', sequenceNumber: 1, tenantCode: 'A' });
    const ref2 = generateCaseRef({ case_type: 'drift', sequenceNumber: 1, tenantCode: 'B' });
    expect(ref1.case_ref).not.toBe(ref2.case_ref);
  });
});

describe('Case Ref Generator — determinism', () => {
  it('same inputs produce same output', () => {
    const input = { case_type: 'identity' as CaseType, sequenceNumber: 55, tenantCode: 'ACME' };
    const ref1 = generateCaseRef(input);
    const ref2 = generateCaseRef(input);
    expect(ref1.case_ref).toBe(ref2.case_ref);
  });
});

describe('Case Ref Generator — validation', () => {
  it('rejects invalid case type', () => {
    const result = generateCaseRef({
      case_type: 'invalid-type' as CaseType,
      sequenceNumber: 1,
      tenantCode: 'ACME',
    });
    expect(result.success).toBe(false);
    expect(result.case_ref).toBeNull();
    expect(result.error).toContain('Invalid case type');
  });

  it('rejects zero sequence number', () => {
    const result = generateCaseRef({
      case_type: 'drift',
      sequenceNumber: 0,
      tenantCode: 'ACME',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid sequence number');
  });

  it('rejects negative sequence number', () => {
    const result = generateCaseRef({
      case_type: 'drift',
      sequenceNumber: -1,
      tenantCode: 'ACME',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid sequence number');
  });

  it('rejects empty tenant code', () => {
    const result = generateCaseRef({
      case_type: 'drift',
      sequenceNumber: 1,
      tenantCode: '',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid tenant code');
  });

  it('rejects tenant code with special characters', () => {
    const result = generateCaseRef({
      case_type: 'drift',
      sequenceNumber: 1,
      tenantCode: 'AC-ME',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid tenant code');
  });
});

describe('Case Ref Generator — parseCaseRef', () => {
  it('parses a valid case ref', () => {
    const parsed = parseCaseRef('CMD-VUL-000042-ACME');
    expect(parsed).not.toBeNull();
    expect(parsed!.typeAbbrev).toBe('VUL');
    expect(parsed!.sequenceNumber).toBe(42);
    expect(parsed!.tenantCode).toBe('ACME');
  });

  it('returns null for invalid format', () => {
    expect(parseCaseRef('INVALID')).toBeNull();
    expect(parseCaseRef('CMD-VU-000042-ACME')).toBeNull(); // 2-letter abbrev
    expect(parseCaseRef('CMD-VUL-42-ACME')).toBeNull(); // non-padded seq
    expect(parseCaseRef('')).toBeNull();
  });

  it('round-trips generate → parse', () => {
    const generated = generateCaseRef({
      case_type: 'ooda-tempo-degradation',
      sequenceNumber: 123,
      tenantCode: 'SEIER',
    });
    const parsed = parseCaseRef(generated.case_ref!);
    expect(parsed).not.toBeNull();
    expect(parsed!.typeAbbrev).toBe('OTD');
    expect(parsed!.sequenceNumber).toBe(123);
    expect(parsed!.tenantCode).toBe('SEIER');
  });
});
