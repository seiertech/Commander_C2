import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Baseline Conflict Resolution Test
 *
 * Validates that the authority model defines a clear precedence stack
 * and that conflict resolution rules are documented.
 *
 * Source: Spec 00 Domain Requirement 2, v1.3 Requirement 18
 * Authority: docs/00_authority/AUTHORITY_MODEL.md
 */

const ROOT = resolve(import.meta.dirname, '../..');

describe('Baseline Conflict Resolution', () => {
  const authorityModelPath = resolve(ROOT, 'docs/00_authority/AUTHORITY_MODEL.md');

  it('AUTHORITY_MODEL.md exists', () => {
    expect(existsSync(authorityModelPath)).toBe(true);
  });

  it('defines a precedence stack with numbered tiers', () => {
    const content = readFileSync(authorityModelPath, 'utf-8');
    // Must contain tier numbering
    expect(content).toMatch(/Tier.*1/i);
    expect(content).toMatch(/\|\s*[5-8]\s*\|/);
  });

  it('establishes that higher tiers override lower tiers', () => {
    const content = readFileSync(authorityModelPath, 'utf-8');
    // Must contain language about precedence/override
    expect(content).toMatch(/bypass|override|supersede|precedence/i);
  });

  it('DECISIONS.md exists for recording conflicts', () => {
    expect(existsSync(resolve(ROOT, 'DECISIONS.md'))).toBe(true);
  });

  it('steering file defines conflict behaviour', () => {
    const steeringPath = resolve(ROOT, '.kiro/steering/authority-and-precedence.md');
    expect(existsSync(steeringPath)).toBe(true);
    const content = readFileSync(steeringPath, 'utf-8');
    expect(content).toMatch(/conflict/i);
  });

  it('authority source defines precedence rules', () => {
    const sourcePath = resolve(ROOT, 'docs/00_authority/source_00_AUTHORITY_AND_PRECEDENCE_v2_6.md');
    expect(existsSync(sourcePath)).toBe(true);
    const content = readFileSync(sourcePath, 'utf-8');
    expect(content).toMatch(/Precedence Rule/i);
  });
});
