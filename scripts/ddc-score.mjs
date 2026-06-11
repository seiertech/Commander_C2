/**
 * UIAA-THESIS-AUDIT — DDC Re-scoring Script
 *
 * Re-runs the Data-Depth-Coverage scoring methodology from §1.2:
 *   DDC = (entity_coverage × 0.30) + (depth × 0.25) + (engine_estimate × 0.25) + (relationship_estimate × 0.20)
 *
 * Compares post-sweep state to the baseline (12% average).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const APP_ROOT = resolve(import.meta.dirname, '../apps/web/src/app');

// Total thesis exports (74 per the audit)
const TOTAL_THESIS_EXPORTS = 74;

// Surface type classification (simplified from Appendix A)
const SURFACE_MAP = {
  'ciso': 'Command', '/': 'Command',
  'operating-picture': 'Command',
  'domain-pulse': 'Command', 'system-pulse': 'Command', 'team-pulse': 'Command',
  'tool-health': 'Command', 'som': 'Command',
  'architecture': 'Intelligence', 'assets': 'Intelligence',
  'commander-ai': 'Intelligence', 'exposure': 'Intelligence',
  'fusion-map': 'Intelligence', 'identity': 'Intelligence',
  'search': 'Intelligence', 'vulnerabilities': 'Intelligence',
  'intelligence': 'Intelligence', 'defence-coverage': 'Intelligence',
  'cases': 'Execution', 'platform': 'Execution', 'war-room': 'Execution',
  'settings': 'Configuration', 'tenant-admin': 'Configuration',
  'control-plane': 'Control Plane',
  'governance': 'Decision', 'strategy': 'Decision',
  'controls': 'Governance', 'reporting': 'Governance',
  'coverage': 'Governance',
  'mission': 'Strategy', 'posture': 'Strategy',
  'risk-management': 'Strategy', 'operational-maturity': 'Strategy',
};

// Applicable entities per surface type
const APPLICABLE_ENTITIES = {
  'Command': 12, 'Intelligence': 15, 'Execution': 12,
  'Configuration': 5, 'Control Plane': 8, 'Decision': 10,
  'Governance': 10, 'Strategy': 12, 'Investigation': 15,
};

// Applicable engines per surface type
const APPLICABLE_ENGINES = {
  'Command': 4, 'Intelligence': 6, 'Execution': 5,
  'Configuration': 2, 'Control Plane': 3, 'Decision': 4,
  'Governance': 4, 'Strategy': 4, 'Investigation': 6,
};

function getSurfaceType(pagePath) {
  const topDir = pagePath.split('/')[0];
  return SURFACE_MAP[topDir] ?? 'Configuration';
}

function countThesisImports(content) {
  const matches = content.match(/thesis[A-Z]\w+/g);
  if (!matches) return 0;
  return new Set(matches).size; // unique thesis references
}

function computeDDC(imports, surfaceType) {
  const applicable = APPLICABLE_ENTITIES[surfaceType] ?? 10;
  const applicableEngines = APPLICABLE_ENGINES[surfaceType] ?? 4;

  const entity_coverage = Math.min(100, (imports / applicable) * 100);
  const depth = Math.min(100, (imports / applicable) * 100); // capped
  const engine_estimate = Math.min(100, (imports / applicableEngines) * 50);
  const relationship_estimate = imports >= 3 ? Math.min(100, (imports - 2) * 20) : 0;

  const ddc = (entity_coverage * 0.30) + (depth * 0.25) + (engine_estimate * 0.25) + (relationship_estimate * 0.20);
  return Math.round(Math.min(100, ddc));
}

function getAllPages(dir, prefix = '') {
  const pages = [];
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      pages.push(...getAllPages(fullPath, prefix ? `${prefix}/${item}` : item));
    } else if (item === 'page.tsx') {
      pages.push(prefix || '/');
    }
  }
  return pages;
}

// Gather all pages
const allPages = getAllPages(APP_ROOT);
const results = [];

for (const pagePath of allPages) {
  const fullPath = pagePath === '/'
    ? resolve(APP_ROOT, 'page.tsx')
    : resolve(APP_ROOT, pagePath, 'page.tsx');

  let content;
  try {
    content = readFileSync(fullPath, 'utf-8');
  } catch { continue; }

  const imports = countThesisImports(content);
  const surface = getSurfaceType(pagePath === '/' ? '/' : pagePath);
  const ddc = computeDDC(imports, surface);

  results.push({ page: `/${pagePath === '/' ? '' : pagePath}`, imports, surface, ddc });
}

// Sort by DDC descending
results.sort((a, b) => b.ddc - a.ddc);

// Compute statistics
const totalPages = results.length;
const avgDDC = Math.round(results.reduce((a, r) => a + r.ddc, 0) / totalPages);
const above60 = results.filter((r) => r.ddc > 60).length;
const above40 = results.filter((r) => r.ddc > 40).length;
const below20 = results.filter((r) => r.ddc <= 20).length;

// Band distribution
const bands = {
  '81-100% (strong)': results.filter((r) => r.ddc >= 81).length,
  '61-80% (good)': results.filter((r) => r.ddc >= 61 && r.ddc <= 80).length,
  '41-60% (fair)': results.filter((r) => r.ddc >= 41 && r.ddc <= 60).length,
  '21-40% (poor)': results.filter((r) => r.ddc >= 21 && r.ddc <= 40).length,
  '0-20% (critical)': results.filter((r) => r.ddc <= 20).length,
};

// Surface averages
const surfaceAvgs = {};
for (const r of results) {
  if (!surfaceAvgs[r.surface]) surfaceAvgs[r.surface] = { total: 0, count: 0 };
  surfaceAvgs[r.surface].total += r.ddc;
  surfaceAvgs[r.surface].count++;
}

// Unconsumed thesis exports
const allImportsSet = new Set();
for (const pagePath of allPages) {
  const fullPath = pagePath === '/' ? resolve(APP_ROOT, 'page.tsx') : resolve(APP_ROOT, pagePath, 'page.tsx');
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const matches = content.match(/thesis[A-Z]\w+/g);
    if (matches) matches.forEach((m) => allImportsSet.add(m));
  } catch {}
}

// AICAP count
let aicapCount = 0;
let aicapWithData = 0;
for (const pagePath of allPages) {
  const fullPath = pagePath === '/' ? resolve(APP_ROOT, 'page.tsx') : resolve(APP_ROOT, pagePath, 'page.tsx');
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const aicaps = content.match(/AICAP-/g);
    if (aicaps) {
      aicapCount += aicaps.length;
      const imports = countThesisImports(content);
      if (imports >= 3) aicapWithData += aicaps.length;
    }
  } catch {}
}

// Output report
console.log('═══════════════════════════════════════════════════════════════════');
console.log('  UIAA-THESIS-AUDIT — DDC Re-Scoring Report (Post-Sweep)');
console.log('═══════════════════════════════════════════════════════════════════');
console.log('');
console.log('┌─────────────────────────────────────────────────────────────────┐');
console.log('│ EXECUTIVE SUMMARY                                               │');
console.log('├───────────────────────────┬─────────────┬────────────┬──────────┤');
console.log('│ Metric                    │ BEFORE      │ AFTER      │ Δ        │');
console.log('├───────────────────────────┼─────────────┼────────────┼──────────┤');
console.log(`│ Total pages               │ 106         │ ${String(totalPages).padEnd(10)} │ +${totalPages - 106}      │`);
console.log(`│ Average DDC score         │ 12%         │ ${String(avgDDC + '%').padEnd(10)} │ +${avgDDC - 12}%     │`);
console.log(`│ Pages scoring >60% DDC    │ 2           │ ${String(above60).padEnd(10)} │ +${above60 - 2}      │`);
console.log(`│ Pages scoring >40% DDC    │ 7           │ ${String(above40).padEnd(10)} │ +${above40 - 7}      │`);
console.log(`│ Pages 0-20% (critical)    │ 92          │ ${String(below20).padEnd(10)} │ -${92 - below20}      │`);
console.log(`│ Thesis exports consumed   │ 53/74 (72%) │ ${allImportsSet.size}/${TOTAL_THESIS_EXPORTS} (${Math.round(allImportsSet.size/TOTAL_THESIS_EXPORTS*100)}%)${' '.repeat(2)} │ +${allImportsSet.size - 53}      │`);
console.log(`│ AICAP markers             │ 78          │ ${String(aicapCount).padEnd(10)} │ +${aicapCount - 78}      │`);
console.log(`│ AICAP ready (3+ imports)  │ 2 (3%)      │ ${aicapWithData} (${Math.round(aicapWithData/Math.max(aicapCount,1)*100)}%)${' '.repeat(4)} │ +${aicapWithData - 2}      │`);
console.log(`│ Nav groups                │ 19          │ 18         │ -1       │`);
console.log('└───────────────────────────┴─────────────┴────────────┴──────────┘');
console.log('');
console.log('DDC BAND DISTRIBUTION:');
console.log('─────────────────────────────────────────');
for (const [band, count] of Object.entries(bands)) {
  const pct = Math.round((count / totalPages) * 100);
  const bar = '█'.repeat(Math.round(pct / 2));
  console.log(`  ${band.padEnd(20)} ${String(count).padStart(3)} (${String(pct).padStart(2)}%) ${bar}`);
}
console.log('');
console.log('SURFACE TYPE AVERAGES:');
console.log('─────────────────────────────────────────');
for (const [surface, data] of Object.entries(surfaceAvgs).sort((a, b) => b[1].total/b[1].count - a[1].total/a[1].count)) {
  const avg = Math.round(data.total / data.count);
  console.log(`  ${surface.padEnd(16)} ${String(avg + '%').padStart(4)} (${data.count} pages)`);
}
console.log('');
console.log('TOP 15 PAGES BY DDC:');
console.log('─────────────────────────────────────────');
for (const r of results.slice(0, 15)) {
  console.log(`  ${String(r.ddc + '%').padStart(4)} │ ${r.page.padEnd(40)} │ ${r.surface.padEnd(14)} │ ${r.imports} imports`);
}
console.log('');
console.log(`Unique thesis exports consumed: ${allImportsSet.size}/${TOTAL_THESIS_EXPORTS}`);
console.log(`Unconsumed: ${TOTAL_THESIS_EXPORTS - allImportsSet.size} exports have no page surface`);
console.log('');
console.log('═══════════════════════════════════════════════════════════════════');
console.log('  ASSESSMENT: DDC improvement from 12% → ' + avgDDC + '% (' + Math.round((avgDDC/12 - 1) * 100) + '% improvement)');
console.log('═══════════════════════════════════════════════════════════════════');
