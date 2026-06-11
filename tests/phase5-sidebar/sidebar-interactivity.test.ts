import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { OPERATIONAL_NAV_GROUPS } from '../../apps/web/src/registry/nav-groups';

const ROOT = resolve(import.meta.dirname, '../..');
const SIDEBAR_PATH = resolve(ROOT, 'apps/web/src/components/operational-sidebar.tsx');
const sidebarSource = readFileSync(SIDEBAR_PATH, 'utf-8');

/**
 * Phase 5 Sidebar Interactivity Tests — Commander C2
 *
 * Validates:
 * - OPERATIONAL_NAV_GROUPS has 18 groups
 * - Each group has an id field (used for localStorage key)
 * - Sidebar component contains 'use client' directive
 * - Sidebar component contains aria-expanded
 * - Sidebar component contains localStorage
 * - Sidebar component contains useState
 */

describe('Phase 5 — Sidebar Interactivity', () => {
  it('OPERATIONAL_NAV_GROUPS has exactly 18 groups', () => {
    expect(OPERATIONAL_NAV_GROUPS.length).toBe(18);
  });

  it('every group has an id field', () => {
    for (const group of OPERATIONAL_NAV_GROUPS) {
      expect(group.id).toBeDefined();
      expect(typeof group.id).toBe('string');
      expect(group.id.length).toBeGreaterThan(0);
    }
  });

  it('group ids are unique', () => {
    const ids = OPERATIONAL_NAV_GROUPS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('sidebar component contains "use client" directive', () => {
    expect(sidebarSource).toContain("'use client'");
  });

  it('sidebar component contains aria-expanded', () => {
    expect(sidebarSource).toContain('aria-expanded');
  });

  it('sidebar component contains localStorage', () => {
    expect(sidebarSource).toContain('localStorage');
  });

  it('sidebar component contains useState', () => {
    expect(sidebarSource).toContain('useState');
  });

  it('sidebar component contains useEffect for hydration', () => {
    expect(sidebarSource).toContain('useEffect');
  });

  it('sidebar uses stable localStorage key pattern per group', () => {
    expect(sidebarSource).toContain('commander-sdr.sidebar.');
  });

  it('default expansion is only case-management', () => {
    expect(sidebarSource).toContain("'case-management'");
  });

  it('caret rotates on collapse (rotate(-90deg))', () => {
    expect(sidebarSource).toContain('rotate(-90deg)');
  });

  it('group header is a button element for keyboard accessibility', () => {
    expect(sidebarSource).toContain('<button');
  });
});
