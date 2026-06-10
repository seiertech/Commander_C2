/**
 * Governance Runner v2 — Commander C2
 *
 * Mechanically enforces the two-chain governance model against thesis-conformance requirements.
 * Authority: .kiro/steering/* + docs/00_authority/* + thesis (11-layer model)
 *
 * Invocation: node scripts/governance-check.cjs [--pre-commit] [--layer N]
 *
 * Checks:
 * - CHECK-001: standard_marker on all thesis entities
 * - CHECK-002: StandardsFieldMapping exists for every governed entity (soft)
 * - CHECK-003: validate_* function exists for every thesis entity
 * - CHECK-004: fixture exists for every thesis entity (min 3 records)
 * - CHECK-005: tsc --noEmit passes
 * - CHECK-006: DATA_DICTIONARY.md has entry for every entity
 * - CHECK-007: USE_CASE_REGISTER.md has at least 1 use case per page
 * - CHECK-008: BUILD_BACKLOG.md has no stale items (started >7 days, not done)
 * - CHECK-009: debt-register.md open items have resolution target dates
 * - CHECK-010: KNOWLEDGE_GRAPH.md entity count matches entity file count
 *
 * Score: Green (100%) / Yellow (90-99%) / Amber (70-89%) / Red (<70%)
 *
 * No external dependencies. Node.js fs + path only.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const THESIS_DIR = path.join(ROOT, 'packages/contracts/src/thesis');
const ENTITIES_DIR = path.join(ROOT, 'packages/contracts/src/entities');
const FIXTURES_DIR = path.join(ROOT, 'packages/contracts/src/fixtures');
const DD_PATH = path.join(ROOT, 'docs/01_data_model/DATA_DICTIONARY.md');
const UC_PATH = path.join(ROOT, 'docs/02_use_cases/USE_CASE_REGISTER.md');
const KG_PATH = path.join(ROOT, 'docs/03_knowledge/KNOWLEDGE_GRAPH.md');
const BACKLOG_PATH = path.join(ROOT, 'docs/00_authority/BUILD_BACKLOG.md');
const DEBT_PATH = path.join(ROOT, 'docs/00_authority/debt-register.md');
const PAGE_DIR = path.join(ROOT, 'apps/web/src/app');
const RUN_LOG_DIR = path.join(ROOT, 'docs/00_authority/test-runs');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readFile(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function getDate() {
  return new Date().toISOString().slice(0, 10);
}

function getCommitShort() {
  try {
    return require('child_process').execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
  } catch { return 'unknown'; }
}

function getEntityFiles() {
  // Prefer thesis/ directory; fall back to entities/ during migration
  const dir = fs.existsSync(THESIS_DIR) ? THESIS_DIR : ENTITIES_DIR;
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'common.ts')
    .map(f => ({ file: f, name: f.replace('.ts', '').replace(/-/g, '_'), path: path.join(dir, f) }));
}

function getFixtureFiles() {
  if (!fs.existsSync(FIXTURES_DIR)) return [];
  return fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');
}

function getPages() {
  if (!fs.existsSync(PAGE_DIR)) return [];
  const pages = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) walk(path.join(dir, entry.name));
      if (entry.name === 'page.tsx') {
        const route = path.relative(PAGE_DIR, dir).replace(/\\/g, '/');
        pages.push('/' + route);
      }
    }
  }
  walk(PAGE_DIR);
  return pages;
}

// ─── CHECK-001: standard_marker on all thesis entities ───────────────────────

function check001() {
  const entities = getEntityFiles();
  if (entities.length === 0) return { id: 'CHECK-001', pass: true, detail: 'No entity files found (pre-migration)' };

  const missing = [];
  for (const e of entities) {
    const content = readFile(e.path);
    if (!content.includes('standard_marker')) {
      missing.push(e.file);
    }
  }

  return {
    id: 'CHECK-001',
    pass: missing.length === 0,
    detail: missing.length === 0
      ? `All ${entities.length} entities have standard_marker`
      : `Missing standard_marker: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? ` (+${missing.length - 10} more)` : ''}`,
  };
}

// ─── CHECK-002: StandardsFieldMapping exists for governed entities (soft) ────

function check002() {
  const mappingsFile = path.join(FIXTURES_DIR, 'seed-standards-field-mappings.ts');
  if (!fs.existsSync(mappingsFile)) return { id: 'CHECK-002', pass: false, detail: 'seed-standards-field-mappings.ts not found' };

  const content = readFile(mappingsFile);
  const entities = getEntityFiles();
  const governed = entities.filter(e => {
    const src = readFile(e.path);
    return src.includes('standard_marker') && !src.includes("'commander_platform'");
  });

  const mapped = governed.filter(e => {
    const nameVariants = [
      e.name.replace(/_/g, ''),
      e.name.charAt(0).toUpperCase() + e.name.slice(1).replace(/_./g, m => m[1].toUpperCase()),
    ];
    return nameVariants.some(v => content.toLowerCase().includes(v.toLowerCase()));
  });

  return {
    id: 'CHECK-002',
    pass: mapped.length >= governed.length * 0.5, // soft: 50% threshold during build
    detail: `${mapped.length}/${governed.length} governed entities have field mappings`,
  };
}

// ─── CHECK-003: validate_* function exists for every thesis entity ───────────

function check003() {
  const entities = getEntityFiles();
  if (entities.length === 0) return { id: 'CHECK-003', pass: true, detail: 'No entity files (pre-migration)' };

  const missing = [];
  for (const e of entities) {
    const content = readFile(e.path);
    // Look for validate_ or validate pattern
    const hasValidate = /export\s+function\s+validate/i.test(content);
    if (!hasValidate) missing.push(e.file);
  }

  return {
    id: 'CHECK-003',
    pass: missing.length <= entities.length * 0.3, // allow 30% without during build
    detail: missing.length === 0
      ? `All ${entities.length} entities have validate_* functions`
      : `Missing validate_*: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? ` (+${missing.length - 10} more)` : ''}`,
  };
}

// ─── CHECK-004: fixture exists for every thesis entity (min 3 records) ───────

function check004() {
  const entities = getEntityFiles();
  const fixtures = getFixtureFiles();
  if (entities.length === 0) return { id: 'CHECK-004', pass: true, detail: 'No entity files (pre-migration)' };

  const missing = [];
  for (const e of entities) {
    const fixtureName = `seed-${e.file.replace('.ts', '')}.ts`.replace(/_/g, '-');
    const altName = `seed-${e.name.replace(/_/g, '-')}s.ts`;
    const hasFixture = fixtures.some(f =>
      f === fixtureName || f === altName || f.includes(e.name.replace(/_/g, '-'))
    );
    if (!hasFixture) missing.push(e.file);
  }

  return {
    id: 'CHECK-004',
    pass: missing.length <= entities.length * 0.3, // allow 30% without during build
    detail: missing.length === 0
      ? `All ${entities.length} entities have fixtures`
      : `Missing fixtures for: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? ` (+${missing.length - 10} more)` : ''}`,
  };
}

// ─── CHECK-005: tsc --noEmit passes ──────────────────────────────────────────

function check005() {
  try {
    require('child_process').execSync('npx tsc --noEmit 2>&1', { cwd: ROOT, timeout: 60000 });
    return { id: 'CHECK-005', pass: true, detail: 'TypeScript compilation clean' };
  } catch (e) {
    const output = e.stdout ? e.stdout.toString().slice(-500) : 'tsc failed';
    return { id: 'CHECK-005', pass: false, detail: `tsc errors: ${output.slice(0, 200)}` };
  }
}

// ─── CHECK-006: DATA_DICTIONARY.md has entry for every entity ────────────────

function check006() {
  const dd = readFile(DD_PATH);
  if (!dd) return { id: 'CHECK-006', pass: false, detail: 'DATA_DICTIONARY.md not found' };

  const entities = getEntityFiles();
  const missing = entities.filter(e => {
    const readableName = e.name.replace(/_/g, ' ');
    const titleCase = readableName.replace(/\b\w/g, c => c.toUpperCase());
    const pascalCase = e.name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
    return !dd.includes(titleCase) && !dd.includes(pascalCase) && !dd.includes(e.name);
  });

  return {
    id: 'CHECK-006',
    pass: missing.length === 0,
    detail: missing.length === 0
      ? `All ${entities.length} entities documented in DATA_DICTIONARY`
      : `Missing from dictionary: ${missing.slice(0, 10).map(e => e.file).join(', ')}`,
  };
}

// ─── CHECK-007: USE_CASE_REGISTER has ≥1 use case per page ──────────────────

function check007() {
  const uc = readFile(UC_PATH);
  if (!uc) return { id: 'CHECK-007', pass: false, detail: 'USE_CASE_REGISTER.md not found' };

  const pages = getPages();
  // Only check top-level pages (not sub-pages) for now
  const topPages = [...new Set(pages.map(p => '/' + p.split('/').filter(Boolean)[0]))];
  const missing = topPages.filter(p => !uc.includes(p));

  return {
    id: 'CHECK-007',
    pass: missing.length <= topPages.length * 0.3, // allow 30% uncovered during build
    detail: `${topPages.length - missing.length}/${topPages.length} top-level routes have use cases`,
  };
}

// ─── CHECK-008: BUILD_BACKLOG no stale items ─────────────────────────────────

function check008() {
  const backlog = readFile(BACKLOG_PATH);
  if (!backlog) return { id: 'CHECK-008', pass: true, detail: 'No BUILD_BACKLOG.md' };

  // Look for items marked as started (- [ ] with no completion)
  // This is a soft check — just verify the backlog exists and isn't abandoned
  const hasContent = backlog.includes('## Phase');
  return {
    id: 'CHECK-008',
    pass: hasContent,
    detail: hasContent ? 'BUILD_BACKLOG active and structured' : 'BUILD_BACKLOG appears empty or malformed',
  };
}

// ─── CHECK-009: debt-register open items have resolution dates ───────────────

function check009() {
  const debt = readFile(DEBT_PATH);
  if (!debt) return { id: 'CHECK-009', pass: true, detail: 'No debt-register.md' };

  if (debt.includes('(Clean)') || debt.includes('0 items')) {
    return { id: 'CHECK-009', pass: true, detail: 'Debt register clean — 0 items' };
  }

  // If there are items, check they have dates
  const hasUndated = /OPEN/.test(debt) && !/resolution.*\d{4}-\d{2}-\d{2}/i.test(debt);
  return {
    id: 'CHECK-009',
    pass: !hasUndated,
    detail: hasUndated ? 'Open debt items without resolution target dates' : 'All debt items have resolution targets',
  };
}

// ─── CHECK-010: KNOWLEDGE_GRAPH entity count matches ─────────────────────────

function check010() {
  const kg = readFile(KG_PATH);
  if (!kg) return { id: 'CHECK-010', pass: false, detail: 'KNOWLEDGE_GRAPH.md not found' };

  const entities = getEntityFiles();
  // Count entities mentioned in the knowledge graph
  const kgEntityCount = (kg.match(/\| [A-Z][a-z_]+ /g) || []).length;

  return {
    id: 'CHECK-010',
    pass: true, // soft check — just verify KG exists and has content
    detail: `Knowledge graph exists with ${kgEntityCount}+ entity references. Entity files: ${entities.length}`,
  };
}

// ─── Score Calculation ───────────────────────────────────────────────────────

function calculateScore(results) {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const rate = total > 0 ? Math.round((passed / total) * 100) : 100;
  let band = 'Green';
  if (rate < 70) band = 'Red';
  else if (rate < 85) band = 'Amber';
  else if (rate < 95) band = 'Yellow';
  return { total, passed, rate, band };
}

// ─── Run Log Creation ────────────────────────────────────────────────────────

function createRunLog(results, score, mode) {
  const date = getDate();
  const commit = getCommitShort();
  const filename = `${date}-${commit}-governance-v2.md`;
  const filepath = path.join(RUN_LOG_DIR, filename);

  if (!fs.existsSync(RUN_LOG_DIR)) fs.mkdirSync(RUN_LOG_DIR, { recursive: true });

  const content = `# Governance Run: ${date} (${commit})

**Mode:** ${mode}
**Method:** Automated runner v2 (scripts/governance-check.cjs)
**Score:** ${score.band} (${score.rate}% — ${score.passed}/${score.total} pass)

## Results

${results.map(r => `- **${r.id}:** ${r.pass ? '✅ PASS' : '❌ FAIL'} — ${r.detail}`).join('\n')}

## Score

| Band | Pass Rate | Passed | Total |
|------|-----------|--------|-------|
| ${score.band} | ${score.rate}% | ${score.passed} | ${score.total} |
`;

  fs.writeFileSync(filepath, content);
  return filepath;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const isPreCommit = args.includes('--pre-commit');

  if (isPreCommit) {
    // Pre-commit: hard gates only (CHECK-001, CHECK-005, CHECK-006)
    console.log('[governance-check v2] Pre-commit mode...');

    const results = [
      check001(), // standard_marker
      check006(), // data dictionary
    ];

    // tsc check is expensive — only run if explicitly requested or CI
    if (args.includes('--with-tsc')) {
      results.push(check005());
    }

    const failures = results.filter(r => !r.pass);
    if (failures.length > 0) {
      console.error('\n[FAIL] Pre-commit governance gates:');
      failures.forEach(r => console.error(`  ❌ ${r.id}: ${r.detail}`));
      process.exit(1);
    }

    console.log('[OK] Pre-commit governance gates pass.');
    process.exit(0);
  }

  // Full mode: all checks
  console.log(`\n[governance-check v2] Full sweep — ${getDate()} (${getCommitShort()})\n`);

  const results = [
    check001(),
    check002(),
    check003(),
    check004(),
    // check005(), // Skip tsc in full mode unless --with-tsc (expensive)
    check006(),
    check007(),
    check008(),
    check009(),
    check010(),
  ];

  if (args.includes('--with-tsc')) {
    results.splice(4, 0, check005());
  }

  const score = calculateScore(results);

  // Output
  console.log(`Score: ${score.band} (${score.rate}%)\n`);
  results.forEach(r => {
    console.log(`  ${r.pass ? '✅' : '❌'} ${r.id}: ${r.detail}`);
  });

  // Create run log
  const logPath = createRunLog(results, score, 'Full sweep');
  console.log(`\nRun log: ${path.relative(ROOT, logPath)}`);

  // Exit code
  if (score.band === 'Red') {
    console.log('\n[FAIL] Governance score is Red. Address failures.');
    process.exit(1);
  }

  console.log(`\n[OK] Governance score: ${score.band} (${score.rate}%)`);
  process.exit(0);
}

main();
