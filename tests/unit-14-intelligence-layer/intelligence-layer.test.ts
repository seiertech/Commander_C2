import { describe, it, expect } from 'vitest';
import {
  INTELLIGENCE_STREAMS,
  STREAM_LABELS,
  CLASS_TO_STREAM,
  STREAM_SURFACE_AFFINITY,
  resolveStreamForClass,
  routeClassesToStreams,
  composeEstateIntelligencePicture,
  classifyPreWarned,
  detectVerdictDisagreement,
  evaluateInverseDiscovery,
  detectBehaviouralAnomaly,
  scoreThreatRelevance,
  aggregateSilentDefence,
} from '../../packages/contracts/src/engines/intelligence-layer';
import type {
  IntelligenceStream,
  StreamSignal,
  PriorPostureKnowledge,
  ToolVerdict,
  BehaviouralProfile,
  ThreatRelevanceInput,
  DefensiveAction,
} from '../../packages/contracts/src/engines/intelligence-layer';
import type { ConnectorClass } from '../../packages/contracts/src/entities/common';

/**
 * Unit 14: Intelligence Layer — Four Streams Integration
 *
 * Source: Spec #59 Intelligence Layer Architecture (binding);
 *         Spec #60 (surface attribution); Spec #61 (connector classes); Spec #62 (verdicts)
 *
 * Validates:
 * 1. Four intelligence streams are exactly four (Doctrinal Assertion 9)
 * 2. Estate Intelligence Picture (EIP) composition
 * 3. Six cross-stream correlations
 * 4. Connector class → stream routing
 * 5. Surface attribution affinity
 */

// ─── Helper: make a StreamSignal ──────────────────────────────────────────────

function sig(overrides: Partial<StreamSignal> = {}): StreamSignal {
  return {
    stream: 'external_threat',
    connectorClass: 'D',
    sourceConnectorId: 'conn-test-001',
    boundEntityId: 'asset-0001',
    boundEntityType: 'asset',
    observedAt: '2026-01-18T06:00:00.000Z',
    surfaceAttribution: 'external_attack_surface',
    payload: {},
    ...overrides,
  };
}

// ─── 1. Four Streams (Doctrinal Assertion 9) ──────────────────────────────────

describe('Unit 14 — Four Intelligence Streams (Doctrinal Assertion 9)', () => {
  it('enumerates exactly 4 streams', () => {
    expect(INTELLIGENCE_STREAMS).toHaveLength(4);
  });

  it('stream names match doctrine', () => {
    expect(INTELLIGENCE_STREAMS).toContain('external_threat');
    expect(INTELLIGENCE_STREAMS).toContain('external_attack');
    expect(INTELLIGENCE_STREAMS).toContain('internal_behavioural');
    expect(INTELLIGENCE_STREAMS).toContain('posture');
  });

  it('each stream has a human-readable label', () => {
    for (const stream of INTELLIGENCE_STREAMS) {
      expect(STREAM_LABELS[stream]).toBeTruthy();
    }
  });

  it('class-to-stream mapping covers all 4 connector classes (A/B/C/D)', () => {
    const classes: ConnectorClass[] = ['A', 'B', 'C', 'D'];
    for (const cls of classes) {
      expect(CLASS_TO_STREAM[cls]).toBeTruthy();
    }
  });

  it('each connector class maps to a distinct stream', () => {
    const streams = Object.values(CLASS_TO_STREAM);
    expect(new Set(streams).size).toBe(4);
  });

  it('resolveStreamForClass returns correct mapping', () => {
    expect(resolveStreamForClass('D')).toBe('external_threat');
    expect(resolveStreamForClass('A')).toBe('external_attack');
    expect(resolveStreamForClass('B')).toBe('internal_behavioural');
    expect(resolveStreamForClass('C')).toBe('posture');
  });

  it('routeClassesToStreams deduplicates and preserves canonical order', () => {
    const result = routeClassesToStreams(['D', 'A', 'D', 'C']);
    expect(result).toEqual(['external_threat', 'external_attack', 'posture']);
  });

  it('stream surface affinity defined for all 4 streams', () => {
    for (const stream of INTELLIGENCE_STREAMS) {
      expect(['internal_attack_surface', 'external_attack_surface', 'both']).toContain(
        STREAM_SURFACE_AFFINITY[stream],
      );
    }
  });
});

// ─── 2. Estate Intelligence Picture (EIP) ─────────────────────────────────────

describe('Unit 14 — Estate Intelligence Picture (EIP)', () => {
  const ts = '2026-01-18T08:00:00.000Z';

  it('always emits all four stream summaries (even empty)', () => {
    const eip = composeEstateIntelligencePicture([], ts);
    expect(eip.streams).toHaveLength(4);
    for (const s of eip.streams) {
      expect(s.signalCount).toBe(0);
      expect(s.boundEntityCount).toBe(0);
      expect(s.unboundSignalCount).toBe(0);
      expect(s.lastSignalAt).toBeNull();
    }
  });

  it('counts signals per stream correctly', () => {
    const signals = [
      sig({ stream: 'external_threat', connectorClass: 'D' }),
      sig({ stream: 'external_threat', connectorClass: 'D' }),
      sig({ stream: 'posture', connectorClass: 'C' }),
    ];
    const eip = composeEstateIntelligencePicture(signals, ts);
    const et = eip.streams.find((s) => s.stream === 'external_threat')!;
    const pos = eip.streams.find((s) => s.stream === 'posture')!;
    expect(et.signalCount).toBe(2);
    expect(pos.signalCount).toBe(1);
    expect(eip.totalSignals).toBe(3);
  });

  it('counts distinct bound entities', () => {
    const signals = [
      sig({ boundEntityId: 'asset-0001' }),
      sig({ boundEntityId: 'asset-0001' }), // duplicate
      sig({ boundEntityId: 'asset-0002' }),
    ];
    const eip = composeEstateIntelligencePicture(signals, ts);
    expect(eip.distinctEntityCount).toBe(2);
  });

  it('tracks unbound signals (inverse discovery candidates)', () => {
    const signals = [
      sig({ boundEntityId: null, boundEntityType: null }),
      sig({ boundEntityId: 'asset-0001' }),
    ];
    const eip = composeEstateIntelligencePicture(signals, ts);
    expect(eip.unboundSignalCount).toBe(1);
  });

  it('records composedAt timestamp', () => {
    const eip = composeEstateIntelligencePicture([], ts);
    expect(eip.composedAt).toBe(ts);
  });

  it('lastSignalAt tracks freshest signal per stream', () => {
    const signals = [
      sig({ stream: 'external_threat', connectorClass: 'D', observedAt: '2026-01-17T10:00:00.000Z' }),
      sig({ stream: 'external_threat', connectorClass: 'D', observedAt: '2026-01-18T05:00:00.000Z' }),
    ];
    const eip = composeEstateIntelligencePicture(signals, ts);
    const et = eip.streams.find((s) => s.stream === 'external_threat')!;
    expect(et.lastSignalAt).toBe('2026-01-18T05:00:00.000Z');
  });
});

// ─── 3a. Cross-stream: Pre-Warned / Protected / Novel (§6.1) ─────────────────

describe('Unit 14 — Pre-Warned Classification (§6.1)', () => {
  it('classifies pre_warned when prior drift exists', () => {
    const r = classifyPreWarned({ hadActiveDrift: true, hadControlGap: false, wasFullyProtected: false, postureKnown: true });
    expect(r.classification).toBe('pre_warned');
  });

  it('classifies pre_warned when control gap exists', () => {
    const r = classifyPreWarned({ hadActiveDrift: false, hadControlGap: true, wasFullyProtected: false, postureKnown: true });
    expect(r.classification).toBe('pre_warned');
  });

  it('classifies protected when entity fully protected', () => {
    const r = classifyPreWarned({ hadActiveDrift: false, hadControlGap: false, wasFullyProtected: true, postureKnown: true });
    expect(r.classification).toBe('protected');
  });

  it('classifies novel when posture not known', () => {
    const r = classifyPreWarned({ hadActiveDrift: true, hadControlGap: true, wasFullyProtected: false, postureKnown: false });
    expect(r.classification).toBe('novel');
  });

  it('classifies novel when posture known but no drift/gap/protected', () => {
    const r = classifyPreWarned({ hadActiveDrift: false, hadControlGap: false, wasFullyProtected: false, postureKnown: true });
    expect(r.classification).toBe('novel');
  });

  it('returns a non-empty rationale string', () => {
    const r = classifyPreWarned({ hadActiveDrift: true, hadControlGap: false, wasFullyProtected: false, postureKnown: true });
    expect(r.rationale.length).toBeGreaterThan(0);
  });
});

// ─── 3b. Cross-stream: Verdict Disagreement (§6.2) ───────────────────────────

describe('Unit 14 — Verdict Disagreement Detection (§6.2)', () => {
  it('detects disagreement when block + allow coexist', () => {
    const verdicts: ToolVerdict[] = [
      { sourceConnectorId: 'tool-a', polarity: 'block', entityId: 'asset-001', issuedAt: '2026-01-18T06:00:00.000Z' },
      { sourceConnectorId: 'tool-b', polarity: 'allow', entityId: 'asset-001', issuedAt: '2026-01-18T06:05:00.000Z' },
    ];
    const r = detectVerdictDisagreement(verdicts);
    expect(r.disagreement).toBe(true);
    expect(r.contributingTools).toContain('tool-a');
    expect(r.contributingTools).toContain('tool-b');
  });

  it('detects disagreement when restrict + allow coexist', () => {
    const verdicts: ToolVerdict[] = [
      { sourceConnectorId: 'tool-a', polarity: 'restrict', entityId: 'asset-001', issuedAt: '2026-01-18T06:00:00.000Z' },
      { sourceConnectorId: 'tool-b', polarity: 'allow', entityId: 'asset-001', issuedAt: '2026-01-18T06:05:00.000Z' },
    ];
    const r = detectVerdictDisagreement(verdicts);
    expect(r.disagreement).toBe(true);
  });

  it('no disagreement when all same polarity', () => {
    const verdicts: ToolVerdict[] = [
      { sourceConnectorId: 'tool-a', polarity: 'block', entityId: 'asset-001', issuedAt: '2026-01-18T06:00:00.000Z' },
      { sourceConnectorId: 'tool-b', polarity: 'block', entityId: 'asset-001', issuedAt: '2026-01-18T06:05:00.000Z' },
    ];
    const r = detectVerdictDisagreement(verdicts);
    expect(r.disagreement).toBe(false);
  });

  it('returns rationale in all cases', () => {
    const r = detectVerdictDisagreement([
      { sourceConnectorId: 'tool-a', polarity: 'monitor', entityId: 'asset-001', issuedAt: '2026-01-18T06:00:00.000Z' },
    ]);
    expect(r.rationale.length).toBeGreaterThan(0);
  });
});

// ─── 3c. Cross-stream: Inverse Discovery (§6.3) ──────────────────────────────

describe('Unit 14 — Inverse Discovery (§6.3)', () => {
  it('triggers on unbound signal from external_threat', () => {
    const r = evaluateInverseDiscovery(sig({ stream: 'external_threat', connectorClass: 'D', boundEntityId: null }));
    expect(r.triggered).toBe(true);
    expect(r.rootCause).toBe('discovery_gap');
  });

  it('triggers on unbound signal from external_attack', () => {
    const r = evaluateInverseDiscovery(sig({ stream: 'external_attack', connectorClass: 'A', boundEntityId: null }));
    expect(r.triggered).toBe(true);
  });

  it('does NOT trigger on posture stream (internally generated)', () => {
    const r = evaluateInverseDiscovery(sig({ stream: 'posture', connectorClass: 'C', boundEntityId: null }));
    expect(r.triggered).toBe(false);
  });

  it('does NOT trigger when entity is bound', () => {
    const r = evaluateInverseDiscovery(sig({ boundEntityId: 'asset-0001' }));
    expect(r.triggered).toBe(false);
  });

  it('accepts a root-cause hint', () => {
    const r = evaluateInverseDiscovery(
      sig({ stream: 'internal_behavioural', connectorClass: 'B', boundEntityId: null }),
      'shadow_it',
    );
    expect(r.triggered).toBe(true);
    expect(r.rootCause).toBe('shadow_it');
  });
});

// ─── 3d. Cross-stream: Behavioural Anomaly (§6.4) ────────────────────────────

describe('Unit 14 — Behavioural Anomaly Detection (§6.4)', () => {
  it('flags anomaly when zScore exceeds sensitivity', () => {
    const profile: BehaviouralProfile = {
      identityId: 'identity-001',
      verdictDensity: 50,
      peerBaselineMean: 10,
      peerBaselineStdDev: 5,
    };
    const r = detectBehaviouralAnomaly(profile, 2.0);
    expect(r.anomalous).toBe(true);
    expect(r.zScore).toBe(8); // (50-10)/5
  });

  it('does not flag when within sensitivity', () => {
    const profile: BehaviouralProfile = {
      identityId: 'identity-002',
      verdictDensity: 12,
      peerBaselineMean: 10,
      peerBaselineStdDev: 5,
    };
    const r = detectBehaviouralAnomaly(profile, 2.0);
    expect(r.anomalous).toBe(false);
    expect(r.zScore).toBeCloseTo(0.4);
  });

  it('handles zero-variance peer baseline (edge case)', () => {
    const profile: BehaviouralProfile = {
      identityId: 'identity-003',
      verdictDensity: 15,
      peerBaselineMean: 10,
      peerBaselineStdDev: 0,
    };
    const r = detectBehaviouralAnomaly(profile, 2.0);
    expect(r.anomalous).toBe(true);
    expect(r.zScore).toBe(Number.POSITIVE_INFINITY);
  });

  it('no anomaly when density matches uniform peer baseline', () => {
    const profile: BehaviouralProfile = {
      identityId: 'identity-004',
      verdictDensity: 10,
      peerBaselineMean: 10,
      peerBaselineStdDev: 0,
    };
    const r = detectBehaviouralAnomaly(profile, 2.0);
    expect(r.anomalous).toBe(false);
    expect(r.zScore).toBe(0);
  });

  it('sensitivity is configurable (no hardcoded threshold)', () => {
    const profile: BehaviouralProfile = {
      identityId: 'identity-005',
      verdictDensity: 25,
      peerBaselineMean: 10,
      peerBaselineStdDev: 5,
    };
    expect(detectBehaviouralAnomaly(profile, 2.0).anomalous).toBe(true);
    expect(detectBehaviouralAnomaly(profile, 4.0).anomalous).toBe(false);
  });
});

// ─── 3e. Cross-stream: Threat Relevance (§6.5) ───────────────────────────────

describe('Unit 14 — Threat Relevance Scoring (§6.5)', () => {
  it('scores 0 when threat does not target estate technology', () => {
    const r = scoreThreatRelevance({
      threatId: 'threat-001',
      affectsEstateTechnology: false,
      estateMatchCount: 5,
      knownExploited: true,
      hasRelevantExposure: true,
    });
    expect(r.relevanceScore).toBe(0);
    expect(r.relevant).toBe(false);
  });

  it('base score 40 when threat targets estate tech', () => {
    const r = scoreThreatRelevance({
      threatId: 'threat-002',
      affectsEstateTechnology: true,
      estateMatchCount: 0,
      knownExploited: false,
      hasRelevantExposure: false,
    });
    expect(r.relevanceScore).toBe(40);
    expect(r.relevant).toBe(true);
  });

  it('adds 5 per estate match, capped at +30', () => {
    const r = scoreThreatRelevance({
      threatId: 'threat-003',
      affectsEstateTechnology: true,
      estateMatchCount: 10, // 10×5 = 50, capped at 30
      knownExploited: false,
      hasRelevantExposure: false,
    });
    expect(r.relevanceScore).toBe(70); // 40 + 30
  });

  it('adds +20 for known-exploited', () => {
    const r = scoreThreatRelevance({
      threatId: 'threat-004',
      affectsEstateTechnology: true,
      estateMatchCount: 0,
      knownExploited: true,
      hasRelevantExposure: false,
    });
    expect(r.relevanceScore).toBe(60); // 40 + 20
  });

  it('adds +10 for relevant exposure', () => {
    const r = scoreThreatRelevance({
      threatId: 'threat-005',
      affectsEstateTechnology: true,
      estateMatchCount: 0,
      knownExploited: false,
      hasRelevantExposure: true,
    });
    expect(r.relevanceScore).toBe(50); // 40 + 10
  });

  it('caps at 100', () => {
    const r = scoreThreatRelevance({
      threatId: 'threat-006',
      affectsEstateTechnology: true,
      estateMatchCount: 20,
      knownExploited: true,
      hasRelevantExposure: true,
    });
    expect(r.relevanceScore).toBe(100);
  });
});

// ─── 3f. Cross-stream: Silent Defence Aggregation (§6.6) ─────────────────────

describe('Unit 14 — Silent Defence Aggregation (§6.6)', () => {
  it('counts actions by type', () => {
    const actions: DefensiveAction[] = [
      { sourceConnectorId: 'tool-a', action: 'block', occurredAt: '2026-01-18T06:00:00.000Z' },
      { sourceConnectorId: 'tool-a', action: 'block', occurredAt: '2026-01-18T06:01:00.000Z' },
      { sourceConnectorId: 'tool-b', action: 'quarantine', occurredAt: '2026-01-18T06:02:00.000Z' },
    ];
    const r = aggregateSilentDefence(actions);
    expect(r.totalActions).toBe(3);
    expect(r.byAction['block']).toBe(2);
    expect(r.byAction['quarantine']).toBe(1);
  });

  it('tracks contributing tools', () => {
    const actions: DefensiveAction[] = [
      { sourceConnectorId: 'tool-a', action: 'block', occurredAt: '2026-01-18T06:00:00.000Z' },
      { sourceConnectorId: 'tool-b', action: 'coach', occurredAt: '2026-01-18T06:05:00.000Z' },
    ];
    const r = aggregateSilentDefence(actions);
    expect(r.contributingTools.sort()).toEqual(['tool-a', 'tool-b']);
  });

  it('tracks time window', () => {
    const actions: DefensiveAction[] = [
      { sourceConnectorId: 'tool-a', action: 'block', occurredAt: '2026-01-18T06:00:00.000Z' },
      { sourceConnectorId: 'tool-a', action: 'block', occurredAt: '2026-01-18T09:00:00.000Z' },
    ];
    const r = aggregateSilentDefence(actions);
    expect(r.windowStart).toBe('2026-01-18T06:00:00.000Z');
    expect(r.windowEnd).toBe('2026-01-18T09:00:00.000Z');
  });

  it('handles empty input gracefully', () => {
    const r = aggregateSilentDefence([]);
    expect(r.totalActions).toBe(0);
    expect(r.contributingTools).toEqual([]);
    expect(r.windowStart).toBeNull();
    expect(r.windowEnd).toBeNull();
  });

  it('rationale mentions aggregate-only (no cases generated)', () => {
    const r = aggregateSilentDefence([
      { sourceConnectorId: 'tool-a', action: 'allow', occurredAt: '2026-01-18T06:00:00.000Z' },
    ]);
    expect(r.rationale).toContain('no cases generated');
  });
});
