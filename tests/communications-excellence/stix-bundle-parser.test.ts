/**
 * Unit Tests — STIX Bundle Parser
 *
 * Feature: communications-excellence
 * Tests: valid/invalid bundles, object mapping, relevance scoring
 */

import { describe, it, expect } from 'vitest';
import { parseStixBundle, mapStixToCommander, scoreRelevance } from '../../packages/rules/stix-bundle-parser';
import type { StixObject, EstateAsset, EstateIdentity } from '../../packages/rules/stix-bundle-parser';

const VALID_BUNDLE = JSON.stringify({
  type: 'bundle',
  id: 'bundle--test-001',
  spec_version: '2.1',
  objects: [
    { type: 'indicator', id: 'indicator--001', name: 'Malicious IP', pattern: "[ipv4-addr:value = '10.0.0.1']", labels: ['malicious-activity'] },
    { type: 'indicator', id: 'indicator--002', name: 'Phishing Domain', pattern: "[domain-name:value = 'evil.example']", labels: ['phishing'] },
    { type: 'attack-pattern', id: 'attack-pattern--001', name: 'T1566.001 - Spearphishing Attachment', labels: ['mitre-attack'] },
    { type: 'malware', id: 'malware--001', name: 'EvilLoader', labels: ['trojan'] },
    { type: 'campaign', id: 'campaign--001', name: 'Operation Nightfall', labels: [] },
  ],
});

describe('STIX Bundle Parser — parseStixBundle', () => {
  it('parses a valid STIX bundle', () => {
    const result = parseStixBundle(VALID_BUNDLE);
    expect(result.valid).toBe(true);
    expect(result.version).toBe('2.1');
    expect(result.objects.length).toBe(5);
    expect(result.errors.length).toBe(0);
  });

  it('rejects invalid JSON', () => {
    const result = parseStixBundle('not-json{{{');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid JSON');
  });

  it('reports error for missing spec_version', () => {
    const bundle = JSON.stringify({ type: 'bundle', objects: [{ type: 'indicator', id: 'i-1', name: 'test', pattern: '' }] });
    const result = parseStixBundle(bundle);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('spec_version'))).toBe(true);
  });

  it('reports error for empty objects array', () => {
    const bundle = JSON.stringify({ type: 'bundle', spec_version: '2.1', objects: [] });
    const result = parseStixBundle(bundle);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('no objects'))).toBe(true);
  });

  it('silently skips unsupported STIX object types', () => {
    const bundle = JSON.stringify({
      type: 'bundle',
      spec_version: '2.1',
      objects: [
        { type: 'relationship', id: 'rel-1', name: 'rel' }, // not in our supported types
        { type: 'indicator', id: 'indicator--001', name: 'Test', pattern: "[ipv4-addr:value = '1.2.3.4']" },
      ],
    });
    const result = parseStixBundle(bundle);
    expect(result.valid).toBe(true);
    expect(result.objects.length).toBe(1); // only the indicator
  });
});

describe('STIX Bundle Parser — mapStixToCommander', () => {
  it('maps indicators to observables and IOCs', () => {
    const result = parseStixBundle(VALID_BUNDLE);
    const mappings = mapStixToCommander(result.objects);
    expect(mappings.observables.length).toBeGreaterThan(0);
    expect(mappings.iocs.length).toBeGreaterThan(0);
  });

  it('maps attack patterns with technique IDs', () => {
    const result = parseStixBundle(VALID_BUNDLE);
    const mappings = mapStixToCommander(result.objects);
    expect(mappings.attackPatterns.length).toBe(1);
    expect(mappings.attackPatterns[0].technique_id).toBe('T1566.001');
  });

  it('maps malware to IOCs', () => {
    const objects: StixObject[] = [
      { type: 'malware', id: 'malware--001', name: 'TestLoader', labels: ['trojan'] },
    ];
    const mappings = mapStixToCommander(objects);
    expect(mappings.iocs.length).toBe(1);
    expect(mappings.iocs[0].value).toBe('TestLoader');
    expect(mappings.iocs[0].labels).toContain('malware');
  });

  it('returns empty mappings for empty input', () => {
    const mappings = mapStixToCommander([]);
    expect(mappings.observables.length).toBe(0);
    expect(mappings.iocs.length).toBe(0);
    expect(mappings.attackPatterns.length).toBe(0);
  });
});

describe('STIX Bundle Parser — scoreRelevance', () => {
  const estateAssets: EstateAsset[] = [
    { id: 'asset-1', hostname: 'webserver01', ipAddress: '10.0.0.1', software: ['nginx'] },
    { id: 'asset-2', hostname: 'dbserver01', ipAddress: '10.0.0.2', software: ['postgres'] },
  ];

  const estateIdentities: EstateIdentity[] = [
    { id: 'id-1', email: 'admin@acme.example', username: 'admin' },
  ];

  it('returns high score when STIX data matches estate assets', () => {
    const result = parseStixBundle(VALID_BUNDLE);
    const mappings = mapStixToCommander(result.objects);
    const score = scoreRelevance(mappings, estateAssets, estateIdentities);
    expect(score.relevanceScore).toBeGreaterThan(30);
    expect(score.affectedAssetCount).toBeGreaterThanOrEqual(1); // IP 10.0.0.1 matches
  });

  it('returns low score when no estate match', () => {
    const noMatchAssets: EstateAsset[] = [
      { id: 'asset-1', hostname: 'safe-server', ipAddress: '192.168.1.1', software: ['apache'] },
    ];
    const result = parseStixBundle(VALID_BUNDLE);
    const mappings = mapStixToCommander(result.objects);
    const score = scoreRelevance(mappings, noMatchAssets, []);
    expect(score.affectedAssetCount).toBe(0);
    expect(score.recommendCaseCreation).toBe(false);
  });

  it('returns 0 for empty mappings', () => {
    const emptyMappings = { observables: [], iocs: [], attackPatterns: [] };
    const score = scoreRelevance(emptyMappings, estateAssets, estateIdentities);
    expect(score.relevanceScore).toBe(0);
    expect(score.recommendCaseCreation).toBe(false);
  });

  it('relevance score is bounded 0-100', () => {
    const result = parseStixBundle(VALID_BUNDLE);
    const mappings = mapStixToCommander(result.objects);
    const score = scoreRelevance(mappings, estateAssets, estateIdentities);
    expect(score.relevanceScore).toBeGreaterThanOrEqual(0);
    expect(score.relevanceScore).toBeLessThanOrEqual(100);
  });
});
