import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * No Code Before Validation Test
 *
 * Validates that the repository does not contain premature application code
 * in the designated app/package directories before pack validation.
 *
 * Source: Spec 00 Requirement 6, Domain Requirement 6, v1.3 Requirement 19
 * Authority: AGENTS.md (hard stops), BP-00 (stop conditions)
 */

const ROOT = resolve(import.meta.dirname, '../..');

/** Directories that should not contain application source files without owner approval */
const BLOCKED_APP_DIRS = [
  // apps/web/src is now authorised (owner validated pack and approved implementation)
  // apps/api/src remains blocked until its spec is validated
  'apps/api/src',
  'packages/connectors/src',
  'packages/rules/src',
  'packages/db/src',
] as const;

/** File extensions that indicate application code */
const APP_CODE_EXTENSIONS = ['.tsx', '.jsx', '.vue', '.svelte'];

function hasAppCode(dir: string): string[] {
  const fullPath = resolve(ROOT, dir);
  if (!existsSync(fullPath)) return [];

  const violations: string[] = [];
  const entries = readdirSync(fullPath, { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && APP_CODE_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      violations.push(`${dir}/${entry.name}`);
    }
  }
  return violations;
}

describe('No Code Before Validation', () => {
  it('AGENTS.md declares no-code-before-validation constraint', () => {
    const content = readFileSync(resolve(ROOT, 'AGENTS.md'), 'utf-8');
    expect(content).toMatch(/no.*app.*code|refuse.*code.*generation|validation/i);
  });

  for (const dir of BLOCKED_APP_DIRS) {
    it(`no application UI code in ${dir}`, () => {
      const violations = hasAppCode(dir);
      expect(violations).toEqual([]);
    });
  }

  it('no live infrastructure files in infra/terraform/', () => {
    const terraformDir = resolve(ROOT, 'infra/terraform');
    if (!existsSync(terraformDir)) return; // directory not existing is fine
    const entries = readdirSync(terraformDir, { recursive: true, withFileTypes: true });
    const tfFiles = entries.filter(e => e.isFile() && (e.name.endsWith('.tf') || e.name.endsWith('.tfstate')));
    expect(tfFiles).toEqual([]);
  });
});
