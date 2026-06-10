import { describe, it, expect } from 'vitest';
import {
  matchEntities,
  resolveAuthority,
  processVerdict,
  resolveVerdictConflict,
  routeInverseDiscovery,
  assignSurfaceAttribution,
} from '../../packages/contracts/src/engines/normalisation-layer';
import type {
  EntityMatchCandidate,
  AuthorityClaim,
  VerdictRecord,
  ThreatIndicator,
  EstateEntity,
  SurfaceAttributionInput,
} from '../../packages/contracts/src/engines/normalisation-layer';

/**
 * Unit 5: Normalisation Layer Tests
 *
 * Validates:
 * 1. Entity matching engine (exact, fuzzy, composite, no-match)
 * 2. Authority resolution (class priority, confidence, freshness tiebreak)
 * 3. Verdict semantics processing (all 8 dispositions, expiry, conflict resolution)
 * 4. Inverse discovery routing (match, no-match, classification)
 * 5. Surface attribution (external, internal, boundary)
 */

// ─── Test Fixtures ───────────────────────────────────────────────────────────

const BASE_TIME = '2026-01-15T12:00:00.000Z';

function hoursAfter(base: string, hours: number): string {
  const d = new Date(base);
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

function hoursBefore(base: string, hours: number): string {
  return hoursAfter(base, -hours);
}

function makeCandidate(overrides: Partial<EntityMatchCandidate> & { entityId: string }): EntityMatchCandidate {
  return {
    entityType: 'asset',
    sourceConnectorId: 'connector-001',
    connectorClass: 'B',
    attributes: {},
    confidence: 80,
    lastSeenAt: BASE_TIME,
    ...overrides,
  };
}

function makeClaim(overrides: Partial<AuthorityClaim> & { sourceConnectorId: string }): AuthorityClaim {
  return {
    entityId: 'entity-001',
    connectorClass: 'B',
    claimedAttributes: { hostname: 'server-01' },
    confidence: 80,
    lastUpdatedAt: BASE_TIME,
    ...overrides,
  };
}

function makeVerdict(overrides: Partial<VerdictRecord> & { id: string }): VerdictRecord {
  return {
    entityId: 'entity-001',
    sourceConnectorId: 'connector-001',
    disposition: 'MONITOR',
    confidence: 80,
    policyRef: 'POL-001',
    issuedAt: BASE_TIME,
    expiresAt: null,
    timeBound: false,
    ...overrides,
  };
}

function makeThreatIndicator(overrides: Partial<ThreatIndicator> & { id: string }): ThreatIndicator {
  return {
    type: 'ip',
    value: '10.0.0.1',
    severity: 'high',
    sourceConnectorId: 'threat-feed-001',
    firstSeenAt: BASE_TIME,
    ...overrides,
  };
}

function makeEstateEntity(overrides: Partial<EstateEntity> & { entityId: string }): EstateEntity {
  return {
    entityType: 'asset',
    attributes: {},
    surfaceAttribution: 'internal_attack_surface',
    ...overrides,
  };
}

// ─── 1. Entity Matching Engine ───────────────────────────────────────────────

describe('Entity Matching Engine', () => {
  describe('matchEntities', () => {
    it('returns no match when no candidates provided', () => {
      const result = matchEntities([]);
      expect(result.matched).toBe(false);
      expect(result.canonicalEntityId).toBeNull();
      expect(result.matchScore).toBe(0);
      expect(result.matchMethod).toBe('none');
    });

    it('returns no match for a single candidate (no cross-source matching possible)', () => {
      const candidate = makeCandidate({
        entityId: 'asset-001',
        attributes: { hostname: 'web-server-01' },
      });
      const result = matchEntities([candidate]);
      expect(result.matched).toBe(false);
      expect(result.canonicalEntityId).toBeNull();
      expect(result.matchScore).toBe(0);
      expect(result.matchMethod).toBe('none');
      expect(result.matchedCandidates).toHaveLength(1);
    });

    it('exact match by shared attribute value (same key, same value)', () => {
      const a = makeCandidate({
        entityId: 'asset-001',
        sourceConnectorId: 'crowdstrike-001',
        attributes: { hostname: 'web-server-01', ip: '192.168.1.10' },
        confidence: 90,
      });
      const b = makeCandidate({
        entityId: 'asset-002',
        sourceConnectorId: 'intune-001',
        attributes: { hostname: 'web-server-01', os: 'linux' },
        confidence: 85,
      });
      const result = matchEntities([a, b]);
      expect(result.matched).toBe(true);
      expect(result.matchScore).toBe(100);
      expect(result.matchMethod).toBe('exact');
      expect(result.canonicalEntityId).toBe('asset-001'); // highest confidence wins
      expect(result.matchedCandidates).toHaveLength(2);
    });

    it('fuzzy match by partial attribute overlap (case-insensitive)', () => {
      const a = makeCandidate({
        entityId: 'asset-001',
        sourceConnectorId: 'source-a',
        attributes: { hostname: 'WEB-SERVER-01' },
        confidence: 70,
      });
      const b = makeCandidate({
        entityId: 'asset-002',
        sourceConnectorId: 'source-b',
        attributes: { hostname: 'web-server-01' },
        confidence: 80,
      });
      const result = matchEntities([a, b]);
      expect(result.matched).toBe(true);
      expect(result.matchScore).toBe(50);
      expect(result.matchMethod).toBe('fuzzy');
      expect(result.canonicalEntityId).toBe('asset-002'); // higher confidence
    });

    it('composite match with 2+ partial attribute overlaps', () => {
      const a = makeCandidate({
        entityId: 'asset-001',
        sourceConnectorId: 'source-a',
        attributes: { hostname: 'WEB-SERVER-01', domain: 'CORP.LOCAL' },
        confidence: 75,
      });
      const b = makeCandidate({
        entityId: 'asset-002',
        sourceConnectorId: 'source-b',
        attributes: { hostname: 'web-server-01', domain: 'corp.local' },
        confidence: 80,
      });
      const result = matchEntities([a, b]);
      expect(result.matched).toBe(true);
      expect(result.matchScore).toBe(75);
      expect(result.matchMethod).toBe('composite');
    });

    it('no match when candidates have different entity types', () => {
      const a = makeCandidate({
        entityId: 'asset-001',
        entityType: 'asset',
        attributes: { hostname: 'web-server-01' },
      });
      const b = makeCandidate({
        entityId: 'identity-001',
        entityType: 'identity',
        attributes: { hostname: 'web-server-01' },
      });
      const result = matchEntities([a, b]);
      expect(result.matched).toBe(false);
      expect(result.matchScore).toBe(0);
      expect(result.matchMethod).toBe('none');
    });

    it('no match when candidates share no attribute keys', () => {
      const a = makeCandidate({
        entityId: 'asset-001',
        attributes: { hostname: 'web-server-01' },
      });
      const b = makeCandidate({
        entityId: 'asset-002',
        attributes: { ip: '10.0.0.5' },
      });
      const result = matchEntities([a, b]);
      expect(result.matched).toBe(false);
      expect(result.matchScore).toBe(0);
    });

    it('no match when candidates share keys but values differ completely', () => {
      const a = makeCandidate({
        entityId: 'asset-001',
        attributes: { hostname: 'alpha-server' },
      });
      const b = makeCandidate({
        entityId: 'asset-002',
        attributes: { hostname: 'beta-server' },
      });
      const result = matchEntities([a, b]);
      expect(result.matched).toBe(false);
      expect(result.matchScore).toBe(0);
    });

    it('multiple candidates scored correctly — best pair wins', () => {
      const a = makeCandidate({
        entityId: 'asset-001',
        sourceConnectorId: 'source-a',
        attributes: { hostname: 'alpha' },
        confidence: 60,
      });
      const b = makeCandidate({
        entityId: 'asset-002',
        sourceConnectorId: 'source-b',
        attributes: { hostname: 'beta' },
        confidence: 70,
      });
      const c = makeCandidate({
        entityId: 'asset-003',
        sourceConnectorId: 'source-c',
        attributes: { hostname: 'alpha' }, // exact match with a
        confidence: 90,
      });
      const result = matchEntities([a, b, c]);
      expect(result.matched).toBe(true);
      expect(result.matchScore).toBe(100);
      expect(result.matchMethod).toBe('exact');
      expect(result.canonicalEntityId).toBe('asset-003'); // highest confidence among matched pair
    });

    it('fuzzy match via substring containment', () => {
      const a = makeCandidate({
        entityId: 'asset-001',
        attributes: { fqdn: 'web-server-01.corp.local' },
        confidence: 85,
      });
      const b = makeCandidate({
        entityId: 'asset-002',
        attributes: { fqdn: 'web-server-01' },
        confidence: 80,
      });
      const result = matchEntities([a, b]);
      expect(result.matched).toBe(true);
      expect(result.matchScore).toBe(50);
      expect(result.matchMethod).toBe('fuzzy');
    });
  });
});


// ─── 2. Authority Resolution ─────────────────────────────────────────────────

describe('Authority Resolution', () => {
  describe('resolveAuthority', () => {
    it('throws when no claims provided', () => {
      expect(() => resolveAuthority([])).toThrow('Cannot resolve authority: no claims provided.');
    });

    it('single claim resolves to that source without conflict', () => {
      const claim = makeClaim({
        sourceConnectorId: 'intune-001',
        connectorClass: 'C',
        claimedAttributes: { os: 'Windows 11', adherence: 'true' },
        confidence: 95,
      });
      const result = resolveAuthority([claim]);
      expect(result.winningClaim).toBe(claim);
      expect(result.resolvedAttributes).toEqual({ os: 'Windows 11', adherence: 'true' });
      expect(result.rationale).toContain('Single claim');
      expect(result.rationale).toContain('intune-001');
    });

    it('connector class priority: C > B > A > D', () => {
      const classD = makeClaim({
        sourceConnectorId: 'threat-intel-001',
        connectorClass: 'D',
        confidence: 99,
      });
      const classC = makeClaim({
        sourceConnectorId: 'intune-001',
        connectorClass: 'C',
        confidence: 50, // lower confidence but higher class
      });
      const result = resolveAuthority([classD, classC]);
      expect(result.winningClaim.sourceConnectorId).toBe('intune-001');
      expect(result.rationale).toContain('Connector class priority');
    });

    it('same class — higher confidence wins', () => {
      const low = makeClaim({
        sourceConnectorId: 'source-low',
        connectorClass: 'B',
        confidence: 60,
        lastUpdatedAt: hoursAfter(BASE_TIME, 1), // more recent but lower confidence
      });
      const high = makeClaim({
        sourceConnectorId: 'source-high',
        connectorClass: 'B',
        confidence: 95,
        lastUpdatedAt: BASE_TIME,
      });
      const result = resolveAuthority([low, high]);
      expect(result.winningClaim.sourceConnectorId).toBe('source-high');
      expect(result.rationale).toContain('Confidence tiebreak');
    });

    it('same class, same confidence — most recent wins (freshness tiebreak)', () => {
      const older = makeClaim({
        sourceConnectorId: 'source-older',
        connectorClass: 'A',
        confidence: 80,
        lastUpdatedAt: hoursBefore(BASE_TIME, 24),
      });
      const newer = makeClaim({
        sourceConnectorId: 'source-newer',
        connectorClass: 'A',
        confidence: 80,
        lastUpdatedAt: BASE_TIME,
      });
      const result = resolveAuthority([older, newer]);
      expect(result.winningClaim.sourceConnectorId).toBe('source-newer');
      expect(result.rationale).toContain('Freshness tiebreak');
    });

    it('multiple claims resolved by full priority chain', () => {
      const claims = [
        makeClaim({ sourceConnectorId: 'soc-telemetry', connectorClass: 'A', confidence: 90 }),
        makeClaim({ sourceConnectorId: 'config-state', connectorClass: 'C', confidence: 70 }),
        makeClaim({ sourceConnectorId: 'verdict-tool', connectorClass: 'B', confidence: 85 }),
        makeClaim({ sourceConnectorId: 'threat-intel', connectorClass: 'D', confidence: 99 }),
      ];
      const result = resolveAuthority(claims);
      // C has highest class priority
      expect(result.winningClaim.sourceConnectorId).toBe('config-state');
    });

    it('resolved attributes come from the winning claim', () => {
      const loser = makeClaim({
        sourceConnectorId: 'loser',
        connectorClass: 'D',
        claimedAttributes: { hostname: 'wrong-name', os: 'linux' },
      });
      const winner = makeClaim({
        sourceConnectorId: 'winner',
        connectorClass: 'C',
        claimedAttributes: { hostname: 'correct-name', os: 'windows' },
      });
      const result = resolveAuthority([loser, winner]);
      expect(result.resolvedAttributes).toEqual({ hostname: 'correct-name', os: 'windows' });
    });
  });
});


// ─── 3. Verdict Semantics Processing ─────────────────────────────────────────

describe('Verdict Semantics Processing', () => {
  describe('processVerdict — all 8 dispositions', () => {
    const dispositions = [
      { disposition: 'BLOCK' as const, actionRequired: true },
      { disposition: 'QUARANTINE' as const, actionRequired: true },
      { disposition: 'COACH' as const, actionRequired: true },
      { disposition: 'REQUIRE_MFA' as const, actionRequired: true },
      { disposition: 'REQUIRE_COMPLIANT' as const, actionRequired: true },
      { disposition: 'MONITOR' as const, actionRequired: false },
      { disposition: 'ALLOW' as const, actionRequired: false },
      { disposition: 'AUDIT' as const, actionRequired: false },
    ];

    for (const { disposition, actionRequired } of dispositions) {
      it(`processes ${disposition} correctly (actionRequired: ${actionRequired})`, () => {
        const verdict = makeVerdict({ id: `verdict-${disposition}`, disposition });
        const result = processVerdict(verdict, BASE_TIME);
        expect(result.effectiveDisposition).toBe(disposition);
        expect(result.isExpired).toBe(false);
        expect(result.actionRequired).toBe(actionRequired);
        expect(result.rationale).toContain(disposition);
      });
    }
  });

  describe('processVerdict — expiry handling', () => {
    it('expired time-bound verdict reverts to ALLOW', () => {
      const verdict = makeVerdict({
        id: 'verdict-expired',
        disposition: 'BLOCK',
        timeBound: true,
        expiresAt: hoursBefore(BASE_TIME, 1), // expired 1 hour ago
      });
      const result = processVerdict(verdict, BASE_TIME);
      expect(result.effectiveDisposition).toBe('ALLOW');
      expect(result.isExpired).toBe(true);
      expect(result.confidenceWeighted).toBe(0);
      expect(result.actionRequired).toBe(false);
    });

    it('non-expired time-bound verdict retains its disposition', () => {
      const verdict = makeVerdict({
        id: 'verdict-active',
        disposition: 'QUARANTINE',
        timeBound: true,
        expiresAt: hoursAfter(BASE_TIME, 24), // expires in 24 hours
        confidence: 90,
      });
      const result = processVerdict(verdict, BASE_TIME);
      expect(result.effectiveDisposition).toBe('QUARANTINE');
      expect(result.isExpired).toBe(false);
      expect(result.actionRequired).toBe(true);
    });

    it('non-time-bound verdict with null expiresAt never expires', () => {
      const verdict = makeVerdict({
        id: 'verdict-permanent',
        disposition: 'MONITOR',
        timeBound: false,
        expiresAt: null,
      });
      const result = processVerdict(verdict, hoursAfter(BASE_TIME, 8760)); // 1 year later
      expect(result.effectiveDisposition).toBe('MONITOR');
      expect(result.isExpired).toBe(false);
    });

    it('time-bound verdict with null expiresAt does not expire', () => {
      const verdict = makeVerdict({
        id: 'verdict-timebound-null',
        disposition: 'COACH',
        timeBound: true,
        expiresAt: null,
      });
      const result = processVerdict(verdict, BASE_TIME);
      expect(result.effectiveDisposition).toBe('COACH');
      expect(result.isExpired).toBe(false);
    });
  });

  describe('processVerdict — confidence weighting', () => {
    it('confidence-weighted score reflects disposition severity', () => {
      const blockVerdict = makeVerdict({ id: 'v-block', disposition: 'BLOCK', confidence: 100 });
      const allowVerdict = makeVerdict({ id: 'v-allow', disposition: 'ALLOW', confidence: 100 });
      const blockResult = processVerdict(blockVerdict, BASE_TIME);
      const allowResult = processVerdict(allowVerdict, BASE_TIME);
      // BLOCK severity 8, ALLOW severity 1
      expect(blockResult.confidenceWeighted).toBe(8);
      expect(allowResult.confidenceWeighted).toBe(1);
    });

    it('lower confidence reduces weighted score proportionally', () => {
      const verdict = makeVerdict({ id: 'v-half', disposition: 'BLOCK', confidence: 50 });
      const result = processVerdict(verdict, BASE_TIME);
      // (50/100) * 8 = 4
      expect(result.confidenceWeighted).toBe(4);
    });
  });

  describe('resolveVerdictConflict', () => {
    it('no verdicts defaults to ALLOW', () => {
      const result = resolveVerdictConflict([], BASE_TIME);
      expect(result.effectiveDisposition).toBe('ALLOW');
      expect(result.actionRequired).toBe(false);
    });

    it('all expired verdicts default to ALLOW', () => {
      const verdicts = [
        makeVerdict({
          id: 'v1',
          disposition: 'BLOCK',
          timeBound: true,
          expiresAt: hoursBefore(BASE_TIME, 2),
        }),
        makeVerdict({
          id: 'v2',
          disposition: 'QUARANTINE',
          timeBound: true,
          expiresAt: hoursBefore(BASE_TIME, 1),
        }),
      ];
      const result = resolveVerdictConflict(verdicts, BASE_TIME);
      expect(result.effectiveDisposition).toBe('ALLOW');
      expect(result.isExpired).toBe(true);
    });

    it('highest severity wins when multiple active verdicts conflict', () => {
      const verdicts = [
        makeVerdict({ id: 'v-allow', disposition: 'ALLOW' }),
        makeVerdict({ id: 'v-monitor', disposition: 'MONITOR' }),
        makeVerdict({ id: 'v-block', disposition: 'BLOCK' }),
        makeVerdict({ id: 'v-coach', disposition: 'COACH' }),
      ];
      const result = resolveVerdictConflict(verdicts, BASE_TIME);
      expect(result.effectiveDisposition).toBe('BLOCK');
      expect(result.actionRequired).toBe(true);
    });

    it('expired verdicts are excluded from conflict resolution', () => {
      const verdicts = [
        makeVerdict({
          id: 'v-block-expired',
          disposition: 'BLOCK',
          timeBound: true,
          expiresAt: hoursBefore(BASE_TIME, 1),
        }),
        makeVerdict({ id: 'v-monitor-active', disposition: 'MONITOR' }),
      ];
      const result = resolveVerdictConflict(verdicts, BASE_TIME);
      expect(result.effectiveDisposition).toBe('MONITOR');
      expect(result.actionRequired).toBe(false);
    });

    it('single active verdict wins by default', () => {
      const verdicts = [makeVerdict({ id: 'v-only', disposition: 'REQUIRE_MFA' })];
      const result = resolveVerdictConflict(verdicts, BASE_TIME);
      expect(result.effectiveDisposition).toBe('REQUIRE_MFA');
      expect(result.actionRequired).toBe(true);
    });

    it('rationale includes winning verdict ID and count of active verdicts', () => {
      const verdicts = [
        makeVerdict({ id: 'v-quarantine', disposition: 'QUARANTINE' }),
        makeVerdict({ id: 'v-audit', disposition: 'AUDIT' }),
      ];
      const result = resolveVerdictConflict(verdicts, BASE_TIME);
      expect(result.rationale).toContain('v-quarantine');
      expect(result.rationale).toContain('QUARANTINE');
      expect(result.rationale).toContain('2 active verdict(s)');
    });
  });
});


// ─── 4. Inverse Discovery Routing ────────────────────────────────────────────

describe('Inverse Discovery Routing', () => {
  describe('routeInverseDiscovery', () => {
    it('returns empty array when no indicators provided', () => {
      const estate: EstateEntity[] = [
        makeEstateEntity({ entityId: 'asset-001', attributes: { ips: ['10.0.0.1'] } }),
      ];
      const result = routeInverseDiscovery([], estate);
      expect(result).toEqual([]);
    });

    it('returns empty array when no estate entities provided', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-001', type: 'ip', value: '10.0.0.1' }),
      ];
      const result = routeInverseDiscovery(indicators, []);
      expect(result).toEqual([]);
    });

    it('known entity matched by IP returns inverse discovery match', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-001', type: 'ip', value: '192.168.1.100', severity: 'critical' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({
          entityId: 'asset-web-01',
          attributes: { ips: ['192.168.1.100', '10.0.0.5'] },
          surfaceAttribution: 'external_attack_surface',
        }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(1);
      expect(result[0].threatIndicatorId).toBe('ti-001');
      expect(result[0].matchedEntityId).toBe('asset-web-01');
      expect(result[0].matchedAttribute).toBe('ips');
      expect(result[0].matchedValue).toBe('192.168.1.100');
      expect(result[0].severity).toBe('critical');
      expect(result[0].surfaceAttribution).toBe('external_attack_surface');
    });

    it('no match when indicator value does not exist in estate', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-001', type: 'ip', value: '203.0.113.50' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({ entityId: 'asset-001', attributes: { ips: ['10.0.0.1', '10.0.0.2'] } }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(0);
    });

    it('matches domain indicators against domain attributes', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-domain', type: 'domain', value: 'malicious.example.com', severity: 'high' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({
          entityId: 'asset-dns',
          attributes: { domains: ['malicious.example.com', 'safe.internal.local'] },
        }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(1);
      expect(result[0].matchedAttribute).toBe('domains');
      expect(result[0].matchedValue).toBe('malicious.example.com');
    });

    it('matches hash indicators against hash attributes', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-hash', type: 'hash', value: 'abc123def456', severity: 'medium' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({
          entityId: 'asset-endpoint',
          attributes: { hashes: ['abc123def456', 'xyz789'] },
        }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(1);
      expect(result[0].matchedAttribute).toBe('hashes');
    });

    it('matches email indicators against email attributes', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-email', type: 'email', value: 'attacker@evil.com', severity: 'high' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({
          entityId: 'identity-001',
          entityType: 'identity',
          attributes: { emails: ['attacker@evil.com'] },
        }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(1);
      expect(result[0].matchedEntityType).toBe('identity');
    });

    it('matches CVE indicators against vulnerability attributes', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-cve', type: 'cve', value: 'CVE-2024-1234', severity: 'critical' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({
          entityId: 'asset-vuln',
          attributes: { cves: ['CVE-2024-1234', 'CVE-2023-5678'] },
        }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(1);
      expect(result[0].matchedValue).toBe('CVE-2024-1234');
    });

    it('matches URL indicators against url attributes', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-url', type: 'url', value: 'https://phishing.example.com/login', severity: 'high' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({
          entityId: 'asset-proxy',
          attributes: { urls: ['https://phishing.example.com/login'] },
        }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(1);
      expect(result[0].matchedAttribute).toBe('urls');
    });

    it('case-insensitive matching for indicator values', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-domain-case', type: 'domain', value: 'MALWARE.EXAMPLE.COM' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({
          entityId: 'asset-001',
          attributes: { domains: ['malware.example.com'] },
        }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(1);
    });

    it('one indicator can match multiple estate entities', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-shared-ip', type: 'ip', value: '10.0.0.99' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({ entityId: 'asset-a', attributes: { ips: ['10.0.0.99'] } }),
        makeEstateEntity({ entityId: 'asset-b', attributes: { ips: ['10.0.0.99', '10.0.0.100'] } }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(2);
      expect(result.map((m) => m.matchedEntityId).sort()).toEqual(['asset-a', 'asset-b']);
    });

    it('multiple indicators can each match different entities', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-ip', type: 'ip', value: '10.0.0.1' }),
        makeThreatIndicator({ id: 'ti-domain', type: 'domain', value: 'bad.example.com' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({ entityId: 'asset-ip', attributes: { ips: ['10.0.0.1'] } }),
        makeEstateEntity({ entityId: 'asset-domain', attributes: { domains: ['bad.example.com'] } }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(2);
      expect(result[0].threatIndicatorId).toBe('ti-ip');
      expect(result[1].threatIndicatorId).toBe('ti-domain');
    });

    it('alternative attribute keys are checked (ip_addresses, hostnames, fqdns)', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-alt-ip', type: 'ip', value: '172.16.0.1' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({
          entityId: 'asset-alt',
          attributes: { ip_addresses: ['172.16.0.1'] },
        }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result).toHaveLength(1);
      expect(result[0].matchedAttribute).toBe('ip_addresses');
    });

    it('rationale includes indicator details and matched entity', () => {
      const indicators: ThreatIndicator[] = [
        makeThreatIndicator({ id: 'ti-rationale', type: 'ip', value: '10.10.10.10', severity: 'high' }),
      ];
      const estate: EstateEntity[] = [
        makeEstateEntity({ entityId: 'asset-target', attributes: { ips: ['10.10.10.10'] } }),
      ];
      const result = routeInverseDiscovery(indicators, estate);
      expect(result[0].rationale).toContain('ti-rationale');
      expect(result[0].rationale).toContain('asset-target');
      expect(result[0].rationale).toContain('high');
    });
  });
});


// ─── 5. Surface Attribution ──────────────────────────────────────────────────

describe('Surface Attribution', () => {
  describe('assignSurfaceAttribution', () => {
    it('externally accessible entity gets external_attack_surface', () => {
      const input: SurfaceAttributionInput = {
        entityId: 'asset-web',
        entityType: 'asset',
        isExternallyAccessible: true,
        hasExternalExposure: false,
        networkZone: 'internal', // even internal zone, if externally accessible → external
      };
      const result = assignSurfaceAttribution(input);
      expect(result).toBe('external_attack_surface');
    });

    it('DMZ entity gets external_attack_surface', () => {
      const input: SurfaceAttributionInput = {
        entityId: 'asset-dmz',
        entityType: 'asset',
        isExternallyAccessible: false,
        hasExternalExposure: false,
        networkZone: 'dmz',
      };
      const result = assignSurfaceAttribution(input);
      expect(result).toBe('external_attack_surface');
    });

    it('cloud-public entity gets external_attack_surface', () => {
      const input: SurfaceAttributionInput = {
        entityId: 'asset-cloud-pub',
        entityType: 'asset',
        isExternallyAccessible: false,
        hasExternalExposure: false,
        networkZone: 'cloud-public',
      };
      const result = assignSurfaceAttribution(input);
      expect(result).toBe('external_attack_surface');
    });

    it('internal network zone entity gets internal_attack_surface', () => {
      const input: SurfaceAttributionInput = {
        entityId: 'asset-internal',
        entityType: 'asset',
        isExternallyAccessible: false,
        hasExternalExposure: false,
        networkZone: 'internal',
      };
      const result = assignSurfaceAttribution(input);
      expect(result).toBe('internal_attack_surface');
    });

    it('cloud-private entity gets internal_attack_surface', () => {
      const input: SurfaceAttributionInput = {
        entityId: 'asset-cloud-priv',
        entityType: 'asset',
        isExternallyAccessible: false,
        hasExternalExposure: false,
        networkZone: 'cloud-private',
      };
      const result = assignSurfaceAttribution(input);
      expect(result).toBe('internal_attack_surface');
    });

    it('unknown zone with external exposure gets external_attack_surface', () => {
      const input: SurfaceAttributionInput = {
        entityId: 'asset-unknown-exposed',
        entityType: 'asset',
        isExternallyAccessible: false,
        hasExternalExposure: true,
        networkZone: 'unknown',
      };
      const result = assignSurfaceAttribution(input);
      expect(result).toBe('external_attack_surface');
    });

    it('unknown zone without external exposure gets internal_attack_surface', () => {
      const input: SurfaceAttributionInput = {
        entityId: 'asset-unknown-internal',
        entityType: 'asset',
        isExternallyAccessible: false,
        hasExternalExposure: false,
        networkZone: 'unknown',
      };
      const result = assignSurfaceAttribution(input);
      expect(result).toBe('internal_attack_surface');
    });

    it('identity entity type follows same rules', () => {
      const input: SurfaceAttributionInput = {
        entityId: 'identity-external',
        entityType: 'identity',
        isExternallyAccessible: true,
        hasExternalExposure: true,
        networkZone: 'unknown',
      };
      const result = assignSurfaceAttribution(input);
      expect(result).toBe('external_attack_surface');
    });

    it('isExternallyAccessible takes precedence over network zone', () => {
      // Even cloud-private, if externally accessible → external
      const input: SurfaceAttributionInput = {
        entityId: 'asset-override',
        entityType: 'asset',
        isExternallyAccessible: true,
        hasExternalExposure: false,
        networkZone: 'cloud-private',
      };
      const result = assignSurfaceAttribution(input);
      expect(result).toBe('external_attack_surface');
    });
  });
});
