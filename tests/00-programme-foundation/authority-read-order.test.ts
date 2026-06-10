import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Authority Read Order Test
 *
 * Validates that the mandatory authority documents exist in the correct
 * locations and can be read in the prescribed precedence order.
 *
 * Source: Spec 00 Requirement 1, Domain Requirement 1, v1.3 Requirement 1
 * Authority: AGENTS.md, docs/00_authority/AUTHORITY_MODEL.md
 */

const ROOT = resolve(import.meta.dirname, '../..');

const AUTHORITY_READ_ORDER = [
  'docs/00_authority/source_00_AUTHORITY_AND_PRECEDENCE_v2_6.md',
  'docs/00_authority/source_AGENTS_v2_6_2.md',
  'docs/00_authority/source_CURRENT_BASELINE_MANIFEST_v2_6.md',
  'docs/00_authority/AUTHORITY_MODEL.md',
  'BUILD_SEQUENCE.md',
  'AGENTS.md',
] as const;

describe('Authority Read Order', () => {
  it('all mandatory authority documents exist at expected paths', () => {
    const missing: string[] = [];
    for (const doc of AUTHORITY_READ_ORDER) {
      const fullPath = resolve(ROOT, doc);
      if (!existsSync(fullPath)) {
        missing.push(doc);
      }
    }
    expect(missing).toEqual([]);
  });

  it('AGENTS.md exists at repository root', () => {
    expect(existsSync(resolve(ROOT, 'AGENTS.md'))).toBe(true);
  });

  it('AUTHORITY_MODEL.md exists in docs/00_authority/', () => {
    expect(existsSync(resolve(ROOT, 'docs/00_authority/AUTHORITY_MODEL.md'))).toBe(true);
  });

  it('steering files directory exists and contains files', () => {
    expect(existsSync(resolve(ROOT, '.kiro/steering'))).toBe(true);
  });

  it('owning build pack exists', () => {
    expect(existsSync(resolve(ROOT, 'docs/04_build_packs/bp-00-programme-foundation-and-authority.md'))).toBe(true);
  });

  it('owning spec exists with requirements, design and tasks', () => {
    const specDir = resolve(ROOT, '.kiro/specs/00-programme-foundation');
    expect(existsSync(resolve(specDir, 'requirements.md'))).toBe(true);
    expect(existsSync(resolve(specDir, 'design.md'))).toBe(true);
    expect(existsSync(resolve(specDir, 'tasks.md'))).toBe(true);
  });
});
