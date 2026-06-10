import { describe, it, expect } from 'vitest';
import {
  EVIDENCE_TYPES,
  EVIDENCE_SOURCES,
  FRESHNESS_STATUSES,
  MAX_CONFIDENCE,
  MIN_CONFIDENCE,
  validateEvidence,
} from '../../packages/contracts/src/entities/evidence';
import type {
  Evidence,
  EvidenceType,
  EvidenceSource,
  FreshnessStatus,
} from '../../packages/contracts/src/entities/evidence';
import { seedEvidence } from '../../packages/contracts/src/fixtures/seed-evidence';

/**
 * COIM-B: Evidence Entity
 *
 * Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §4.4;
 *         04_EVIDENCE_MODEL.md (full).
 * Resolves: ARCH-DEBT-040 (evidence entity absence).
 *
 * Validates the Evidence entity contract, validation logic, seed-fixture
 * conformance, ownership model, and immutability rules.
 * No engine-logic dependency — entity shape and provenance only.
 */

function makeValidEvidence(): Evidence {
  return {
    id: 'evidence-test-001',
    entityType: 'evidence',
    tenant: { tenantId: 'tenant-test-001', tenantName: 'Test Tenant' },
    createdAt: '2026-01-18T06:00:00.000Z',
    updatedAt: '2026-01-18T06:00:00.000Z',
    source: {
      connectorId: 'connector-test-001',
      importRunId: 'run-test-001',
      sourceSystem: 'test-system',
      sourceTimestamp: '2026-01-18T05:55:00.000Z',
    },
    evidenceType: 'scan',
    evidenceSource: 'connector',
    collectedAt: '2026-01-18T05:55:00.000Z',
    contentRef: 's3://test-bucket/evidence/scan-001.json',
    immutabilityHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    confidence: 90,
    expiresAt: '2026-01-19T05:55:00.000Z',
    freshnessStatus: 'fresh',
    caseId: 'case-0001',
    subActionId: undefined,
    validationDecisionId: undefined,
    riskObjectId: undefined,
  };
}

describe('COIM-B — evidence type taxonomy', () => {
  it('enumerates exactly 9 evidence types', () => {
    expect(EVIDENCE_TYPES).toHaveLength(9);
    expect(EVIDENCE_TYPES).toContain('log');
    expect(EVIDENCE_TYPES).toContain('scan');
    expect(EVIDENCE_TYPES).toContain('verdict');
    expect(EVIDENCE_TYPES).toContain('screenshot');
    expect(EVIDENCE_TYPES).toContain('config');
    expect(EVIDENCE_TYPES).toContain('network_capture');
    expect(EVIDENCE_TYPES).toContain('file_hash');
    expect(EVIDENCE_TYPES).toContain('process_dump');
    expect(EVIDENCE_TYPES).toContain('ai_analysis');
  });

  it('enumerates exactly 3 evidence sources', () => {
    expect(EVIDENCE_SOURCES).toHaveLength(3);
    expect(EVIDENCE_SOURCES).toContain('connector');
    expect(EVIDENCE_SOURCES).toContain('analyst');
    expect(EVIDENCE_SOURCES).toContain('system');
  });

  it('enumerates exactly 4 freshness statuses', () => {
    expect(FRESHNESS_STATUSES).toHaveLength(4);
    expect(FRESHNESS_STATUSES).toContain('fresh');
    expect(FRESHNESS_STATUSES).toContain('aging');
    expect(FRESHNESS_STATUSES).toContain('stale');
    expect(FRESHNESS_STATUSES).toContain('expired');
  });

  it('defines confidence bounds', () => {
    expect(MIN_CONFIDENCE).toBe(0);
    expect(MAX_CONFIDENCE).toBe(100);
  });
});

describe('COIM-B — validateEvidence', () => {
  it('accepts a well-formed evidence entity', () => {
    const result = validateEvidence(makeValidEvidence());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects unknown evidenceType', () => {
    const ev = makeValidEvidence();
    (ev as unknown as { evidenceType: string }).evidenceType = 'unknown_type';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('evidenceType');
  });

  it('rejects unknown evidenceSource', () => {
    const ev = makeValidEvidence();
    (ev as unknown as { evidenceSource: string }).evidenceSource = 'unknown_source';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('evidenceSource');
  });

  it('rejects confidence below 0', () => {
    const ev = makeValidEvidence();
    ev.confidence = -1;
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('confidence');
  });

  it('rejects confidence above 100', () => {
    const ev = makeValidEvidence();
    ev.confidence = 101;
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('confidence');
  });

  it('accepts confidence at boundaries (0 and 100)', () => {
    const ev0 = makeValidEvidence();
    ev0.confidence = 0;
    expect(validateEvidence(ev0).valid).toBe(true);

    const ev100 = makeValidEvidence();
    ev100.confidence = 100;
    expect(validateEvidence(ev100).valid).toBe(true);
  });

  it('rejects empty collectedAt', () => {
    const ev = makeValidEvidence();
    ev.collectedAt = '';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('collectedAt');
  });

  it('rejects empty contentRef', () => {
    const ev = makeValidEvidence();
    ev.contentRef = '';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('contentRef');
  });

  it('rejects invalid immutabilityHash (not SHA-256)', () => {
    const ev = makeValidEvidence();
    ev.immutabilityHash = 'not-a-valid-hash';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('immutabilityHash');
  });

  it('rejects empty immutabilityHash', () => {
    const ev = makeValidEvidence();
    ev.immutabilityHash = '';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('immutabilityHash');
  });

  it('rejects empty caseId (required binding)', () => {
    const ev = makeValidEvidence();
    ev.caseId = '';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('caseId');
  });

  it('rejects unknown freshnessStatus', () => {
    const ev = makeValidEvidence();
    (ev as unknown as { freshnessStatus: string }).freshnessStatus = 'unknown';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('freshnessStatus');
  });

  it('rejects expiresAt before collectedAt', () => {
    const ev = makeValidEvidence();
    ev.collectedAt = '2026-01-18T06:00:00.000Z';
    ev.expiresAt = '2026-01-17T06:00:00.000Z'; // before collectedAt
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('expiresAt');
  });

  it('accepts evidence without optional bindings', () => {
    const ev = makeValidEvidence();
    ev.subActionId = undefined;
    ev.validationDecisionId = undefined;
    ev.riskObjectId = undefined;
    const result = validateEvidence(ev);
    expect(result.valid).toBe(true);
  });

  it('accepts evidence with all optional bindings populated', () => {
    const ev = makeValidEvidence();
    ev.subActionId = 'sub-action-001';
    ev.validationDecisionId = 'validation-decision-001';
    ev.riskObjectId = 'risk-object-001';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(true);
  });

  it('collects multiple errors when multiple fields are invalid', () => {
    const ev = makeValidEvidence();
    ev.confidence = 200;
    ev.collectedAt = '';
    ev.immutabilityHash = 'bad';
    ev.caseId = '';
    const result = validateEvidence(ev);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe('COIM-B — seed fixture conformance', () => {
  it('provides exactly 5 seed evidence artifacts', () => {
    expect(seedEvidence).toHaveLength(5);
  });

  it('every seed evidence has entityType "evidence"', () => {
    for (const ev of seedEvidence) {
      expect(ev.entityType).toBe('evidence');
    }
  });

  it('every seed evidence passes structural validation', () => {
    for (const ev of seedEvidence) {
      const result = validateEvidence(ev);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('every seed evidence has a valid SHA-256 immutabilityHash', () => {
    const sha256Pattern = /^[a-f0-9]{64}$/i;
    for (const ev of seedEvidence) {
      expect(ev.immutabilityHash).toMatch(sha256Pattern);
    }
  });

  it('every seed evidence has a non-empty contentRef (object-store pointer)', () => {
    for (const ev of seedEvidence) {
      expect(ev.contentRef).toBeTruthy();
      expect(ev.contentRef.startsWith('s3://')).toBe(true);
    }
  });

  it('every seed evidence has a required caseId binding', () => {
    for (const ev of seedEvidence) {
      expect(ev.caseId).toBeTruthy();
    }
  });

  it('every seed evidence has confidence in valid range (0-100)', () => {
    for (const ev of seedEvidence) {
      expect(ev.confidence).toBeGreaterThanOrEqual(0);
      expect(ev.confidence).toBeLessThanOrEqual(100);
    }
  });

  it('expiresAt is after collectedAt for every seed evidence', () => {
    for (const ev of seedEvidence) {
      if (ev.expiresAt) {
        expect(new Date(ev.expiresAt).getTime()).toBeGreaterThan(
          new Date(ev.collectedAt).getTime(),
        );
      }
    }
  });

  it('seed evidence covers multiple evidence types', () => {
    const types = new Set(seedEvidence.map(ev => ev.evidenceType));
    expect(types.size).toBeGreaterThanOrEqual(4);
  });

  it('seed evidence covers multiple evidence sources', () => {
    const sources = new Set(seedEvidence.map(ev => ev.evidenceSource));
    expect(sources.size).toBeGreaterThanOrEqual(2);
  });

  it('seed evidence covers multiple freshness statuses', () => {
    const statuses = new Set(seedEvidence.map(ev => ev.freshnessStatus));
    expect(statuses.size).toBeGreaterThanOrEqual(2);
  });

  it('seed evidence includes ai_analysis type (Commander AI grounding)', () => {
    const aiEvidence = seedEvidence.find(ev => ev.evidenceType === 'ai_analysis');
    expect(aiEvidence).toBeDefined();
    expect(aiEvidence!.evidenceSource).toBe('system');
  });

  it('seed evidence includes risk object binding where applicable', () => {
    const withRiskObject = seedEvidence.filter(ev => ev.riskObjectId);
    expect(withRiskObject.length).toBeGreaterThanOrEqual(1);
  });
});

describe('COIM-B — ownership model assertions', () => {
  it('evidence entity has entityType discriminator', () => {
    const ev = makeValidEvidence();
    expect(ev.entityType).toBe('evidence');
  });

  it('source-owned fields are present and typed', () => {
    const ev = makeValidEvidence();
    // These fields are immutable after write — type system enforces presence
    expect(typeof ev.evidenceType).toBe('string');
    expect(typeof ev.evidenceSource).toBe('string');
    expect(typeof ev.collectedAt).toBe('string');
    expect(typeof ev.contentRef).toBe('string');
    expect(typeof ev.immutabilityHash).toBe('string');
  });

  it('commander-owned fields are present and typed', () => {
    const ev = makeValidEvidence();
    // These fields are mutable by Commander governance engines
    expect(typeof ev.confidence).toBe('number');
    expect(typeof ev.freshnessStatus).toBe('string');
    // expiresAt is optional
  });

  it('binding fields are present (caseId required, others optional)', () => {
    const ev = makeValidEvidence();
    expect(typeof ev.caseId).toBe('string');
    // Optional bindings may be undefined
    expect(ev.subActionId === undefined || typeof ev.subActionId === 'string').toBe(true);
    expect(ev.validationDecisionId === undefined || typeof ev.validationDecisionId === 'string').toBe(true);
    expect(ev.riskObjectId === undefined || typeof ev.riskObjectId === 'string').toBe(true);
  });
});
