import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Baseline Immutability Test
 *
 * Validates that the source archive directory exists and contains
 * the baseline documents that must not be modified.
 *
 * Source: Spec 00 v1.3 Requirement 7 (baseline immutability)
 * Authority: .kiro/steering/commander-doctrine.md (assertion 7),
 *            .kiro/steering/authority-and-precedence.md
 */

const ROOT = resolve(import.meta.dirname, '../..');
const SOURCE_ARCHIVE = resolve(ROOT, 'docs/99_source_archive');

describe('Baseline Immutability', () => {
  it('source archive directory exists', () => {
    expect(existsSync(SOURCE_ARCHIVE)).toBe(true);
  });

  it('source archive contains baseline_v2_6_2 subdirectory', () => {
    const baselineDir = resolve(SOURCE_ARCHIVE, 'baseline_v2_6_2');
    expect(existsSync(baselineDir)).toBe(true);
  });

  it('baseline_v2_6_2 directory is not empty', () => {
    const baselineDir = resolve(SOURCE_ARCHIVE, 'baseline_v2_6_2');
    if (!existsSync(baselineDir)) return;
    const entries = readdirSync(baselineDir);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('structure steering prohibits moving source archive without decision record', () => {
    const steeringPath = resolve(ROOT, '.kiro/steering/structure.md');
    expect(existsSync(steeringPath)).toBe(true);
    const content = readFileSync(steeringPath, 'utf-8');
    expect(content).toMatch(/source archive/i);
    expect(content).toMatch(/decision record/i);
  });

  it('commander doctrine asserts baseline immutability', () => {
    const doctrinePath = resolve(ROOT, '.kiro/steering/commander-doctrine.md');
    expect(existsSync(doctrinePath)).toBe(true);
    const content = readFileSync(doctrinePath, 'utf-8');
    expect(content).toMatch(/Baseline immutability/i);
  });
});
