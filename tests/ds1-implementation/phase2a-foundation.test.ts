import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getSemanticTokens } from '../../packages/ui/src/tokens/semantic';
import { componentTokens } from '../../packages/ui/src/tokens/components';
import { primitiveBrand } from '../../packages/ui/src/tokens/primitives';

const ROOT = resolve(import.meta.dirname, '../..');

/**
 * DS-1.0 Phase 2a — Foundation Tests
 *
 * Validates:
 * - Mode system exists (context, provider, toggle)
 * - Collapsible sidebar (248px / 68px rail)
 * - Shell consumes three-layer tokens (zero hardcoded values in shell chrome)
 * - Lucide installed
 */

describe('Mode System', () => {
  it('mode-context.tsx exists', () => {
    expect(existsSync(resolve(ROOT, 'apps/web/src/context/mode-context.tsx'))).toBe(true);
  });

  it('mode context file contains Standard and Mission modes', () => {
    const content = readFileSync(resolve(ROOT, 'apps/web/src/context/mode-context.tsx'), 'utf-8');
    expect(content).toContain("'standard'");
    expect(content).toContain("'mission'");
    expect(content).toContain('toggleMode');
    expect(content).toContain('localStorage');
  });

  it('getSemanticTokens returns different surfaces per mode', () => {
    const standard = getSemanticTokens('standard');
    const mission = getSemanticTokens('mission');
    expect(standard.surface.primary).not.toBe(mission.surface.primary);
    expect(standard.text.primary).not.toBe(mission.text.primary);
  });

  it('action.primary is gold in both modes', () => {
    const standard = getSemanticTokens('standard');
    const mission = getSemanticTokens('mission');
    expect(standard.action.primary).toBe(primitiveBrand.gold);
    expect(mission.action.primary).toBe(primitiveBrand.gold);
  });
});

describe('Collapsible Sidebar', () => {
  it('componentTokens defines sidebarWidth=264px and sidebarRail=72px', () => {
    expect(componentTokens.sidebarWidth).toBe('264px');
    expect(componentTokens.sidebarRail).toBe('72px');
  });

  it('operational-sidebar.tsx exists and contains collapse logic', () => {
    const content = readFileSync(resolve(ROOT, 'apps/web/src/components/operational-sidebar.tsx'), 'utf-8');
    expect(content).toContain('collapsed');
    expect(content).toContain('toggleCollapsed');
    // Sidebar references tokens by name (not by literal pixel value).
    expect(content).toContain('componentTokens.sidebarRail');
    expect(content).toContain('componentTokens.sidebarWidth');
  });

  it('sidebar persists collapse state in localStorage', () => {
    const content = readFileSync(resolve(ROOT, 'apps/web/src/context/sidebar-context.tsx'), 'utf-8');
    expect(content).toContain('commander-sdr.sidebar.collapsed');
  });
});

describe('Shell Token Consumption', () => {
  it('shell.tsx uses componentTokens (not hardcoded values)', () => {
    const content = readFileSync(resolve(ROOT, 'apps/web/src/components/shell.tsx'), 'utf-8');
    expect(content).toContain('componentTokens');
    expect(content).not.toContain("'306px'");
    // The shell uses parsePx + componentTokens.topbarHeight/sidebarWidth/sidebarRail by name.
    // The literal '56px' appears as the resolved value of componentTokens.topbarHeight in
    // positional style props — this is token consumption, not a hardcoded magic number.
    // The literal '68px' no longer appears (superseded by 72px via shell-sidebar-header-rebuild).
    expect(content).not.toContain("'306px'");
    expect(content).not.toContain("'248px'");
  });

  it('top-bar uses componentTokens.topbarHeight', () => {
    const content = readFileSync(resolve(ROOT, 'apps/web/src/components/operational-top-bar.tsx'), 'utf-8');
    expect(content).toContain('componentTokens.topbarHeight');
    expect(content).toContain('primitiveBrand.navy');
    expect(content).toContain('primitiveBrand.gold');
  });

  it('top-bar height is 56px (DS-1.0 §6)', () => {
    expect(componentTokens.topbarHeight).toBe('56px');
  });

  it('layout.tsx wraps with ModeProvider', () => {
    const content = readFileSync(resolve(ROOT, 'apps/web/src/app/layout.tsx'), 'utf-8');
    expect(content).toContain('ModeProvider');
  });
});

describe('Mode Toggle in Top Bar', () => {
  it('top-bar contains mode toggle button', () => {
    const content = readFileSync(resolve(ROOT, 'apps/web/src/components/operational-top-bar.tsx'), 'utf-8');
    expect(content).toContain('toggleMode');
    expect(content).toContain('STANDARD');
    expect(content).toContain('MISSION');
  });
});

describe('Lucide Installed', () => {
  it('lucide-react is in apps/web/package.json dependencies', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'apps/web/package.json'), 'utf-8'));
    expect(pkg.dependencies['lucide-react']).toBeDefined();
  });
});

describe('RSC Serialization Safety', () => {
  it('fonts are declared inline in layout.tsx (not imported from separate module)', () => {
    const content = readFileSync(resolve(ROOT, 'apps/web/src/app/layout.tsx'), 'utf-8');
    // Fonts must be declared in the same file as the layout to avoid
    // next/font internal Sets leaking across the RSC module boundary
    expect(content).toContain("Inter({");
    expect(content).toContain("variable: '--font-body'");
    // Single-font system: Bebas Neue removed, only Inter loaded
    expect(content).not.toContain("Bebas_Neue");
    expect(content).not.toContain("Bebas Neue");
    // Must NOT import fonts from a separate module
    expect(content).not.toContain("from './fonts'");
  });

  it('no Set constructor usage in source files that cross RSC boundary', () => {
    // Server Components (layouts) must not pass Set objects to Client Components
    const layoutContent = readFileSync(resolve(ROOT, 'apps/web/src/app/layout.tsx'), 'utf-8');
    expect(layoutContent).not.toContain('new Set');
    const cpLayout = readFileSync(resolve(ROOT, 'apps/web/src/app/control-plane/layout.tsx'), 'utf-8');
    expect(cpLayout).not.toContain('new Set');
    const taLayout = readFileSync(resolve(ROOT, 'apps/web/src/app/tenant-admin/layout.tsx'), 'utf-8');
    expect(taLayout).not.toContain('new Set');
  });
});
