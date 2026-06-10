import { describe, it, expect } from 'vitest';
import {
  FINDING_CLASSES,
  SEVERITY_ID,
  MAX_ATTACK_BINDINGS,
  MAX_OBSERVABLES,
  validateSourceClassification,
} from '../../packages/contracts/src/entities/coim';
import type {
  SourceClassification,
  AttackMapping,
  ObservableRef,
} from '../../packages/contracts/src/entities/coim';
import { seedRiskObjects } from '../../packages/contracts/src/fixtures/seed-risk-objects';

/**
 * COIM-A: Risk Object Source Classification + Timeline Augmentation
 *
 * Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §4.1, §4.12.
 * Resolves: ARCH-DEBT-039 (source-classification gap), ARCH-DEBT-045 (Risk Object timeline).
 *
 * Validates the additive COIM composed objects, the bounded-array storage
 * efficiency limits, the timeline model, and seed-fixture conformance.
 * No engine-logic dependency — provenance shape only.
 */

function makeValidClassification(): SourceClassification {
  return {
    findingClass: 'vulnerability',
    sourceSeverity: { severityLevel: 'critical', severityId: 5 },
    sourceConfidence: { confidenceLevel: 'high', confidenceScore: 95 },
    sourceProduct: { vendor: 'Tenable', name: 'Nessus', version: '10.7', connectorClass: 'C' },
    sourceFindingUid: 'nessus-CVE-2026-1234-host-01',
    sourceActivity: 'Vulnerability Drift',
    attacks: [],
    observables: [],
  };
}

describe('COIM-A — finding class taxonomy', () => {
  it('enumerates exactly 7 finding classes', () => {
    expect(FINDING_CLASSES).toHaveLength(7);
    expect(FINDING_CLASSES).toContain('vulnerability');
    expect(FINDING_CLASSES).toContain('detection');
    expect(FINDING_CLASSES).toContain('adherence');
    expect(FINDING_CLASSES).toContain('incident');
    expect(FINDING_CLASSES).toContain('data_security');
    expect(FINDING_CLASSES).toContain('iam_analysis');
    expect(FINDING_CLASSES).toContain('application_security');
  });

  it('maps severity levels to numeric IDs 1-5', () => {
    expect(SEVERITY_ID.informational).toBe(1);
    expect(SEVERITY_ID.low).toBe(2);
    expect(SEVERITY_ID.medium).toBe(3);
    expect(SEVERITY_ID.high).toBe(4);
    expect(SEVERITY_ID.critical).toBe(5);
  });
});

describe('COIM-A — validateSourceClassification', () => {
  it('accepts a well-formed classification', () => {
    const result = validateSourceClassification(makeValidClassification());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects severityId out of range', () => {
    const sc = makeValidClassification();
    sc.sourceSeverity.severityId = 9;
    const result = validateSourceClassification(sc);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('severityId');
  });

  it('rejects confidenceScore out of range', () => {
    const sc = makeValidClassification();
    sc.sourceConfidence.confidenceScore = 150;
    const result = validateSourceClassification(sc);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('confidenceScore');
  });

  it('requires sourceFindingUid', () => {
    const sc = makeValidClassification();
    sc.sourceFindingUid = '';
    const result = validateSourceClassification(sc);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('sourceFindingUid');
  });

  it('requires sourceProduct vendor and name', () => {
    const sc = makeValidClassification();
    sc.sourceProduct = { vendor: '', name: '' };
    const result = validateSourceClassification(sc);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('sourceProduct');
  });

  it('enforces the bounded ATT&CK array (storage efficiency)', () => {
    const sc = makeValidClassification();
    const attack: AttackMapping = {
      tactic: 'Initial Access',
      technique: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      version: 'v14.1',
    };
    sc.attacks = Array.from({ length: MAX_ATTACK_BINDINGS + 1 }, () => ({ ...attack }));
    const result = validateSourceClassification(sc);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('attacks[]');
  });

  it('enforces the bounded observables array (storage efficiency)', () => {
    const sc = makeValidClassification();
    const obs: ObservableRef = { observableType: 'ip', value: '203.0.113.1' };
    sc.observables = Array.from({ length: MAX_OBSERVABLES + 1 }, () => ({ ...obs }));
    const result = validateSourceClassification(sc);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('observables[]');
  });
});

describe('COIM-A — seed fixture conformance', () => {
  it('every seed risk object carries a valid source classification', () => {
    for (const ro of seedRiskObjects) {
      expect(ro.sourceClassification).toBeDefined();
      const result = validateSourceClassification(ro.sourceClassification!);
      expect(result.valid).toBe(true);
    }
  });

  it('every seed risk object carries the timeline model', () => {
    for (const ro of seedRiskObjects) {
      expect(ro.firstDetectedAt).toBeTruthy();
      expect(ro.normalisedAt).toBeTruthy();
    }
  });

  it('normalisedAt is at or after firstDetectedAt for every seed risk object', () => {
    for (const ro of seedRiskObjects) {
      expect(new Date(ro.normalisedAt!).getTime()).toBeGreaterThanOrEqual(
        new Date(ro.firstDetectedAt!).getTime(),
      );
    }
  });

  it('preserves the singular affectedEntityId for back-compatibility', () => {
    for (const ro of seedRiskObjects) {
      expect(ro.affectedEntityId).toBeTruthy();
      expect(ro.affectedEntities).toContain(ro.affectedEntityId);
    }
  });
});
