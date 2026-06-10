/**
 * Correlation Engine — Unit Tests
 * CMEP-1.0: Case Management Excellence
 */

import { describe, it, expect } from 'vitest';
import { correlateFindings, DEFAULT_CORRELATION_POLICY } from '../../packages/rules/correlation-engine';
import type { CorrelationFinding } from '../../packages/rules/correlation-engine';

describe('Correlation Engine', () => {
  describe('CVE dedup', () => {
    it('groups findings with the same CVE across different entities', () => {
      const findings: CorrelationFinding[] = [
        { findingId: 'f1', cveId: 'CVE-2024-1234', affectedEntityId: 'asset-1', detectedAt: '2026-01-15T10:00:00Z', attackTechniques: [], severityScore: 80 },
        { findingId: 'f2', cveId: 'CVE-2024-1234', affectedEntityId: 'asset-2', detectedAt: '2026-01-15T11:00:00Z', attackTechniques: [], severityScore: 80 },
        { findingId: 'f3', cveId: 'CVE-2024-5678', affectedEntityId: 'asset-3', detectedAt: '2026-01-15T12:00:00Z', attackTechniques: [], severityScore: 50 },
      ];

      const result = correlateFindings(findings);
      expect(result.stats.dedupGroups).toBe(1);
      const dedupGroup = result.groups.find((g) => g.correlationType === 'cve-dedup');
      expect(dedupGroup).toBeDefined();
      expect(dedupGroup!.findingIds).toContain('f1');
      expect(dedupGroup!.findingIds).toContain('f2');
      expect(dedupGroup!.blastRadius).toBe(2);
    });

    it('does not group single-occurrence CVEs', () => {
      const findings: CorrelationFinding[] = [
        { findingId: 'f1', cveId: 'CVE-2024-1111', affectedEntityId: 'asset-1', detectedAt: '2026-01-15T10:00:00Z', attackTechniques: [], severityScore: 80 },
        { findingId: 'f2', cveId: 'CVE-2024-2222', affectedEntityId: 'asset-2', detectedAt: '2026-01-15T11:00:00Z', attackTechniques: [], severityScore: 70 },
      ];

      const result = correlateFindings(findings);
      expect(result.stats.dedupGroups).toBe(0);
    });
  });

  describe('temporal clustering', () => {
    it('clusters findings within the time window', () => {
      const findings: CorrelationFinding[] = [
        { findingId: 'f1', cveId: null, affectedEntityId: 'asset-1', detectedAt: '2026-01-15T10:00:00Z', attackTechniques: [], severityScore: 60 },
        { findingId: 'f2', cveId: null, affectedEntityId: 'asset-2', detectedAt: '2026-01-15T12:00:00Z', attackTechniques: [], severityScore: 60 },
        { findingId: 'f3', cveId: null, affectedEntityId: 'asset-3', detectedAt: '2026-01-15T14:00:00Z', attackTechniques: [], severityScore: 60 },
      ];

      const result = correlateFindings(findings, { ...DEFAULT_CORRELATION_POLICY, temporalWindowHours: 24 });
      expect(result.stats.temporalClusters).toBeGreaterThanOrEqual(1);
    });

    it('does not cluster findings outside the time window', () => {
      const findings: CorrelationFinding[] = [
        { findingId: 'f1', cveId: null, affectedEntityId: 'asset-1', detectedAt: '2026-01-15T00:00:00Z', attackTechniques: [], severityScore: 60 },
        { findingId: 'f2', cveId: null, affectedEntityId: 'asset-2', detectedAt: '2026-01-20T00:00:00Z', attackTechniques: [], severityScore: 60 },
      ];

      const result = correlateFindings(findings, { ...DEFAULT_CORRELATION_POLICY, temporalWindowHours: 2 });
      expect(result.stats.temporalClusters).toBe(0);
    });
  });

  describe('blast-radius aggregation', () => {
    it('groups findings when distinct entities exceed threshold', () => {
      const findings: CorrelationFinding[] = Array.from({ length: 5 }, (_, i) => ({
        findingId: `f${i}`,
        cveId: null,
        affectedEntityId: `asset-${i}`,
        detectedAt: `2026-01-${15 + i}T10:00:00Z`, // spread across days to avoid temporal
        attackTechniques: [],
        severityScore: 50,
      }));

      const result = correlateFindings(findings, {
        ...DEFAULT_CORRELATION_POLICY,
        blastRadiusThreshold: 3,
        temporalWindowHours: 1, // short window to prevent temporal grouping
      });
      // After temporal clustering doesn't catch them, blast radius should
      expect(result.stats.blastRadiusGroups + result.stats.temporalClusters).toBeGreaterThanOrEqual(1);
    });
  });

  describe('attack-chain detection', () => {
    it('detects attack chain from technique overlap', () => {
      const findings: CorrelationFinding[] = [
        { findingId: 'f1', cveId: null, affectedEntityId: 'asset-1', detectedAt: '2026-01-15T10:00:00Z', attackTechniques: ['T1059'], severityScore: 70 },
        { findingId: 'f2', cveId: null, affectedEntityId: 'asset-1', detectedAt: '2026-01-18T10:00:00Z', attackTechniques: ['T1078'], severityScore: 80 },
        { findingId: 'f3', cveId: null, affectedEntityId: 'asset-2', detectedAt: '2026-01-21T10:00:00Z', attackTechniques: ['T1048'], severityScore: 90 },
      ];

      const result = correlateFindings(findings, {
        ...DEFAULT_CORRELATION_POLICY,
        attackChainMinLength: 2,
        temporalWindowHours: 1, // prevent temporal grouping
        blastRadiusThreshold: 100, // prevent blast radius grouping
      });
      expect(result.stats.attackChains).toBeGreaterThanOrEqual(1);
    });
  });

  describe('statistics', () => {
    it('reports correct totals', () => {
      const findings: CorrelationFinding[] = [
        { findingId: 'f1', cveId: 'CVE-2024-1234', affectedEntityId: 'asset-1', detectedAt: '2026-01-15T10:00:00Z', attackTechniques: [], severityScore: 80 },
        { findingId: 'f2', cveId: 'CVE-2024-1234', affectedEntityId: 'asset-2', detectedAt: '2026-01-15T11:00:00Z', attackTechniques: [], severityScore: 80 },
        { findingId: 'f3', cveId: null, affectedEntityId: 'asset-3', detectedAt: '2026-01-15T12:00:00Z', attackTechniques: [], severityScore: 50 },
      ];

      const result = correlateFindings(findings);
      expect(result.stats.totalFindings).toBe(3);
      expect(result.stats.groupedFindings + result.ungroupedFindingIds.length).toBe(3);
    });
  });
});
