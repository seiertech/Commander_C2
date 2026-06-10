import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Scope-Out Enforcement Test
 *
 * Validates that prohibited scope items (live AWS, real connectors,
 * billing, n8n, custom powers) are explicitly blocked in governance docs.
 *
 * Source: Spec 00 Scope Out, BP-00 Scope Out
 * Authority: AGENTS.md (hard stops), .kiro/steering/tech.md
 */

const ROOT = resolve(import.meta.dirname, '../..');

describe('Scope-Out Enforcement', () => {
  describe('AGENTS.md hard stops', () => {
    let content: string;

    it('AGENTS.md exists', () => {
      const path = resolve(ROOT, 'AGENTS.md');
      expect(existsSync(path)).toBe(true);
      content = readFileSync(path, 'utf-8');
    });

    it('blocks live AWS infrastructure', () => {
      expect(content).toMatch(/live AWS/i);
    });

    it('blocks real vendor connectors', () => {
      expect(content).toMatch(/real vendor/i);
    });

    it('blocks billing implementation', () => {
      expect(content).toMatch(/billing/i);
    });

    it('blocks n8n', () => {
      expect(content).toMatch(/n8n/i);
    });

    it('blocks custom Kiro powers', () => {
      expect(content).toMatch(/custom Kiro powers/i);
    });
  });

  describe('tech steering enforcement', () => {
    it('tech.md blocks app code during validation', () => {
      const path = resolve(ROOT, '.kiro/steering/tech.md');
      expect(existsSync(path)).toBe(true);
      const content = readFileSync(path, 'utf-8');
      expect(content).toMatch(/No application code.*authorised/i);
    });
  });

  describe('build pack stop conditions', () => {
    it('BP-00 defines stop conditions', () => {
      const path = resolve(ROOT, 'docs/04_build_packs/bp-00-programme-foundation-and-authority.md');
      expect(existsSync(path)).toBe(true);
      const content = readFileSync(path, 'utf-8');
      expect(content).toMatch(/Stop.*condition/i);
      expect(content).toMatch(/live AWS/i);
    });
  });

  describe('no .env or credential files', () => {
    it('no .env file at root', () => {
      expect(existsSync(resolve(ROOT, '.env'))).toBe(false);
    });

    it('no .env.local file at root', () => {
      expect(existsSync(resolve(ROOT, '.env.local'))).toBe(false);
    });

    it('no credentials.json at root', () => {
      expect(existsSync(resolve(ROOT, 'credentials.json'))).toBe(false);
    });
  });
});
