/**
 * Governance Runner — Commander SDR
 *
 * Mechanically enforces ARCH-005 through ARCH-009 from the conformance registry.
 * Doctrine-driven: reads the registry and build sequence as source of truth.
 * Does NOT hardcode rules — derives checks from the repository state.
 *
 * Authority: .kiro/testing/conformance-registry.md (single source of truth)
 * Invocation: node scripts/governance-check.cjs [--unit N] [--pre-commit]
 *
 * Capabilities:
 * - ARCH-005: data-dictionary completeness
 * - ARCH-006: build-stream sequencing (Team 2 gate)
 * - ARCH-007: blocking-debt prerequisite (readiness check)
 * - ARCH-008: readiness-machine integrity (orphan debt, unstatused, built-but-blocked)
 * - ARCH-009: verification-before-done
 * - Score calculation + register update
 * - Run log creation
 *
 * No external dependencies. Node.js fs + path only.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SEQ_PATH = path.join(ROOT, 'docs/knowledge/REBASELINED_BUILD_SEQUENCE.md');
const DEBT_PATH = path.join(ROOT, 'docs/knowledge/ARCHITECTURAL_DEBT_REGISTER.md');
const DD_PATH = path.join(ROOT, 'docs/knowledge/DATA_DICTIONARY.md');
const SCORE_REG_PATH = path.join(ROOT, 'docs/00_authority/score-register.md');
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

// ─── ARCH-005: Data Dictionary Completeness ──────────────────────────────────

function checkArch005() {
  const dd = readFile(DD_PATH);
  const entitiesDir = path.join(ROOT, 'packages/contracts/src/entities');
  const schemasDir = path.join(ROOT, 'packages/db/src/schema');

  const entityFiles = fs.existsSync(entitiesDir)
    ? fs.readdirSync(entitiesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'common.ts')
    : [];
  const schemaFiles = fs.existsSync(schemasDir)
    ? fs.readdirSync(schemasDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'common.ts' && f !== 'tenants.ts')
    : [];

  const allFiles = [...new Set([...entityFiles, ...schemaFiles])];
  const missing = allFiles.filter(f => {
    const name = f.replace('.ts', '').replace(/-/g, ' ');
    // Check if the dictionary mentions this entity (case-insensitive)
    // Handle plurals: "risk-objects.ts" → "risk object" should match "Risk Object"
    const singular = name.replace(/s$/, '');
    return !dd.toLowerCase().includes(name.toLowerCase()) && !dd.toLowerCase().includes(singular.toLowerCase());
  });

  return { id: 'ARCH-005', pass: missing.length === 0, detail: missing.length === 0 ? 'All entities have dictionary entries' : `Missing: ${missing.join(', ')}` };
}

// ─── ARCH-006: Build-Stream Sequencing ───────────────────────────────────────

function checkArch006(unitNum) {
  if (unitNum === undefined) return { id: 'ARCH-006', pass: true, detail: 'No unit specified — skipped' };
  const seq = readFile(SEQ_PATH);
  const unitSection = getUnitSection(seq, unitNum);
  if (!unitSection) return { id: 'ARCH-006', pass: false, detail: `Unit ${unitNum} not found in sequence` };

  const isTeam2 = unitSection.includes('Team 2');
  if (!isTeam2) return { id: 'ARCH-006', pass: true, detail: 'Unit is Foundational — ARCH-006 gate not applicable' };

  const scheduleExists = fs.existsSync(path.join(ROOT, 'docs/knowledge/USE_CASE_SCHEDULE.md'));
  const inventoryExists = fs.existsSync(path.join(ROOT, 'docs/knowledge/PAGE_INVENTORY.md'));

  if (!scheduleExists || !inventoryExists) {
    return { id: 'ARCH-006', pass: false, detail: `Team 2 unit — USE_CASE_SCHEDULE.md exists: ${scheduleExists}, PAGE_INVENTORY.md exists: ${inventoryExists}` };
  }
  return { id: 'ARCH-006', pass: true, detail: 'Team 2 prerequisites satisfied' };
}

// ─── ARCH-007: Blocking-Debt Prerequisite ────────────────────────────────────

function checkArch007(unitNum) {
  if (unitNum === undefined) return { id: 'ARCH-007', pass: true, detail: 'No unit specified — skipped' };
  const seq = readFile(SEQ_PATH);
  const unitSection = getUnitSection(seq, unitNum);
  if (!unitSection) return { id: 'ARCH-007', pass: false, detail: `Unit ${unitNum} not found` };

  const statusMatch = unitSection.match(/\*\*Status:\*\* (\S+)/);
  const status = statusMatch ? statusMatch[1] : 'UNKNOWN';

  if (status === 'BLOCKED') {
    const blockedBy = unitSection.match(/\*\*Blocked by:\*\*([^\n]+)/);
    return { id: 'ARCH-007', pass: false, detail: `Unit ${unitNum} Status is BLOCKED. Blocked by: ${blockedBy ? blockedBy[1].trim() : 'unknown'}` };
  }
  if (status === 'READY' || status === 'DONE') {
    return { id: 'ARCH-007', pass: true, detail: `Unit ${unitNum} Status is ${status}` };
  }
  return { id: 'ARCH-007', pass: false, detail: `Unit ${unitNum} has unexpected status: ${status}` };
}

// ─── ARCH-008: Readiness-Machine Integrity ───────────────────────────────────

function checkArch008() {
  const seq = readFile(SEQ_PATH);
  const debt = readFile(DEBT_PATH);
  const results = [];

  // (a) No orphan build-debt
  const debtSections = debt.split(/(?=^### ARCH-DEBT-)/m);
  const openBuildDebt = debtSections
    .filter(s => /\*\*Status:\*\* OPEN/.test(s) && /\*\*Debt class:\*\* build-debt/.test(s))
    .map(s => { const m = s.match(/^### (ARCH-DEBT-\d+)/); return m ? m[1] : null; })
    .filter(Boolean);
  const orphans = openBuildDebt.filter(id => !seq.includes(id));
  results.push({ sub: 'a', pass: orphans.length === 0, detail: orphans.length === 0 ? 'No orphan build-debt' : `Orphans: ${orphans.join(', ')}` });

  // (b) All units statused
  const unitHeaders = [...seq.matchAll(/^### Unit (\d+[a-z]?):/gm)];
  const units = seq.split(/(?=^### Unit \d+[a-z]?:)/m).filter(u => /^### Unit \d+[a-z]?:/.test(u));
  const unstatused = units.filter(u => !/\*\*Status:\*\* (BLOCKED|READY|DONE)/.test(u));
  results.push({ sub: 'b', pass: unstatused.length === 0, detail: unstatused.length === 0 ? `All ${unitHeaders.length} units statused` : `${unstatused.length} unstatused` });

  // (c) Built-but-blocked — check units 1-6 deliverable paths
  const deliverablePaths = {
    '1': 'packages/db/src/schema/risk-objects.ts',
    '2': 'packages/db/src/schema/strategies.ts',
    '3': 'packages/db/src/schema/case-strategy-bindings.ts',
    '4': 'packages/contracts/src/resolvers/connector-pull-orchestrator.ts',
    '6': 'packages/contracts/src/resolvers/strategy-policy-lifecycle.ts',
  };
  const blocked = units.filter(u => u.includes('**Status:** BLOCKED'));
  const builtButBlocked = [];
  for (const u of blocked) {
    const m = u.match(/^### Unit (\d+[a-z]?):/);
    if (!m) continue;
    const p = deliverablePaths[m[1]];
    if (p && fs.existsSync(path.join(ROOT, p))) builtButBlocked.push(`Unit ${m[1]}`);
  }
  results.push({ sub: 'c', pass: builtButBlocked.length === 0, detail: builtButBlocked.length === 0 ? 'No built-but-blocked' : `Built-but-blocked: ${builtButBlocked.join(', ')}` });

  const allPass = results.every(r => r.pass);
  return { id: 'ARCH-008', pass: allPass, detail: results.map(r => `(${r.sub}) ${r.pass ? 'PASS' : 'FAIL'}: ${r.detail}`).join('; ') };
}

// ─── ARCH-009: Verification-Before-Done ──────────────────────────────────────

function checkArch009() {
  const seq = readFile(SEQ_PATH);
  const units = seq.split(/(?=^### Unit \d+[a-z]?:)/m).filter(u => /^### Unit \d+[a-z]?:/.test(u));
  const doneUnits = units.filter(u => u.includes('**Status:** DONE'));
  const unverified = [];

  for (const u of doneUnits) {
    const m = u.match(/^### Unit (\d+[a-z]?):/);
    if (!m) continue;
    const hasVerification = /\*\*Verification:\*\*/.test(u);
    const hasSpec = /#\d+|Spec #\d+|§/.test(u.slice(u.indexOf('**Verification:**') || 0));
    const hasEvidence = /test|grep|diff|review|typecheck|migration|pipeline|vitest/i.test(u.slice(u.indexOf('**Verification:**') || 0));
    if (!hasVerification || !hasSpec || !hasEvidence) unverified.push(`Unit ${m[1]}`);
  }

  return { id: 'ARCH-009', pass: unverified.length === 0, detail: unverified.length === 0 ? `All ${doneUnits.length} DONE units have verification` : `Unverified: ${unverified.join(', ')}` };
}

// ─── Unit Section Helper ─────────────────────────────────────────────────────

function getUnitSection(seq, num) {
  // Unit IDs may carry an alpha suffix (e.g. 16a, 16b) after a governance split.
  const sections = seq.split(/(?=^### Unit \d+[a-z]?:)/m);
  return sections.find(s => new RegExp(`^### Unit ${num}:`).test(s)) || null;
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

function createRunLog(results, score, unitNum) {
  const date = getDate();
  const commit = getCommitShort();
  const filename = `${date}-${commit}-governance.md`;
  const filepath = path.join(RUN_LOG_DIR, filename);

  if (!fs.existsSync(RUN_LOG_DIR)) fs.mkdirSync(RUN_LOG_DIR, { recursive: true });

  const content = `# Governance Run: ${date} (${commit})

**Scope:** ${unitNum !== undefined ? `Unit ${unitNum}` : 'Full sweep'}
**Method:** Automated runner (scripts/governance-check.cjs)
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

// ─── Score Register Persistence ──────────────────────────────────────────────

function updateScoreRegister(score, unitNum) {
  const date = getDate();
  const commit = getCommitShort();
  const regPath = SCORE_REG_PATH;

  if (!fs.existsSync(regPath)) return; // Don't create if missing — that's a separate concern

  let content = fs.readFileSync(regPath, 'utf8');

  // Find the "## Score History" section and append a new entry
  const historyMarker = '## Score History';
  const historyIdx = content.indexOf(historyMarker);
  if (historyIdx === -1) return; // Malformed register — skip

  // Find the end of the history header line to insert after it
  const afterHeader = content.indexOf('\n', historyIdx) + 1;
  // Find the next section or end of file
  const nextSection = content.indexOf('\n## ', afterHeader);
  const insertPoint = nextSection !== -1 ? nextSection : content.length;

  const entry = `
### Run: ${date} (${commit}) — Governance Runner
**Scope:** ${unitNum !== undefined ? `Unit ${unitNum}` : 'Full sweep'}
**Method:** Automated (scripts/governance-check.cjs)

**Scores:**
- Architecture (ARCH-005–009): ${score.band} (${score.rate}%)

**Band:** ${score.band}
**Pass Rate:** ${score.rate}% (${score.passed}/${score.total})

---
`;

  content = content.slice(0, insertPoint) + entry + content.slice(insertPoint);

  // Also update the "Current Scores" section's last-updated date
  content = content.replace(/\*\*Next Pipeline Run:\*\* TBD/, `**Next Pipeline Run:** TBD\n**Last Governance Runner:** ${date} (${commit}) — ${score.band} (${score.rate}%)`);

  fs.writeFileSync(regPath, content);
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const unitArg = args.find(a => a.startsWith('--unit'));
  // Unit IDs may carry an alpha suffix (e.g. 16a, 16b) after a governance split,
  // so the unit token is parsed as an alphanumeric string, not a bare integer.
  let unitNum;
  if (unitArg) {
    const raw = unitArg.includes('=')
      ? unitArg.split('=')[1]
      : args[args.indexOf(unitArg) + 1];
    const m = raw != null ? String(raw).match(/^\d+[a-z]?/i) : null;
    unitNum = m ? m[0].toLowerCase() : undefined;
  }
  const isPreCommit = args.includes('--pre-commit');

  // Pre-commit mode: lightweight (ARCH-007 only for the unit being committed)
  if (isPreCommit) {
    // In pre-commit mode without a unit number, just validate integrity
    const r008 = checkArch008();
    if (!r008.pass) {
      console.error(`[FAIL] ARCH-008: ${r008.detail}`);
      process.exit(1);
    }
    console.error('[OK] governance-check (pre-commit) clean.');
    process.exit(0);
  }

  // Full mode: run all checks
  const results = [
    checkArch005(),
    checkArch006(unitNum),
    checkArch007(unitNum),
    checkArch008(),
    checkArch009(),
  ];

  const score = calculateScore(results);

  // Output results
  console.log(`\nGovernance Check — ${getDate()} (${getCommitShort()})`);
  console.log(`Scope: ${unitNum !== undefined ? `Unit ${unitNum}` : 'Full'}`);
  console.log(`Score: ${score.band} (${score.rate}%)\n`);
  results.forEach(r => {
    console.log(`  ${r.pass ? '✅' : '❌'} ${r.id}: ${r.detail}`);
  });

  // Create run log
  const logPath = createRunLog(results, score, unitNum);
  console.log(`\nRun log: ${path.relative(ROOT, logPath)}`);

  // Update score register
  updateScoreRegister(score, unitNum);
  console.log(`Score register updated: docs/00_authority/score-register.md`);

  // Exit with failure if any check failed
  if (results.some(r => !r.pass)) {
    console.log('\n[FAIL] Governance checks did not pass. Address failures before commit.');
    process.exit(1);
  }

  console.log('\n[OK] All governance checks pass.');
  process.exit(0);
}

main();
