#!/usr/bin/env node
/**
 * Phase 3 Migration Script — Commander C2
 * 
 * Rewrites all page files to import from thesis-adapters instead of individual
 * seed files. Updates variable references from seedXxx → thesisXxx.
 * 
 * Convention: thesis is LAW, snake_case, adherence not compliance.
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// ─── Mapping: old import name → thesis adapter name ──────────────────────────
const RENAME_MAP = {
  'seedCases': 'thesisCases',
  'seedAssets': 'thesisAssets',
  'seedMissions': 'thesisMissionSeeds',
  'seedConnectors': 'thesisConnectors',
  'seedIdentities': 'thesisIdentities',
  'seedStrategies': 'thesisStrategies',
  'seedRiskObjects': 'thesisRiskObjects',
  'seedEvents': 'thesisEvents',
  'seedExposures': 'thesisExposures',
  'seedTeamPulse': 'thesisTeamPulse',
  'seedDomainPulse': 'thesisDomainPulse',
  'seedSystemPulse': 'thesisSystemPulse',
  'seedRules': 'thesisRules',
  'seedModels': 'thesisModels',
  'seedAutomationRules': 'thesisAutomationRules',
  'seedFeatureRegistry': 'thesisFeatureRegistry',
  'seedActions': 'thesisActions',
  'seedSubActions': 'thesisSubActions',
  'seedControlFrameworks': 'thesisControlFrameworks',
  'seedFrameworkControls': 'thesisFrameworkControls',
  'seedControlRequirements': 'thesisControlRequirements',
  'seedControlEvaluations': 'thesisControlEvaluations',
  'seedControlMappings': 'thesisControlMappings',
  'seedTopology': 'thesisTopology',
  'seedArchitectureComponents': 'thesisArchitectureComponents',
  'ARCHITECTURE_CLASSIFICATION_FIXTURES': 'thesisArchitectureClassifications',
  'TOPOLOGY_NODE_FIXTURES': 'thesisTopologyNodes',
  'TOPOLOGY_EDGE_FIXTURES': 'thesisTopologyEdges',
  'seedVulnerabilityIntelligence': 'thesisVulnerabilityIntelligence',
  'seedReports': 'thesisReports',
  'seedDecisionRecords': 'thesisDecisionRecords',
  'seedSimulationResults': 'thesisSimulationResults',
  'seedEvidence': 'thesisEvidence',
  'seedWarRooms': 'thesisWarRooms',
  'seedCustomers': 'thesisCustomers',
  'seedDeployments': 'thesisDeployments',
  'seedLicences': 'thesisLicences',
  'seedEntitlements': 'thesisEntitlements',
  'seedTenantConfigs': 'thesisTenantConfigs',
  'seedSupportOperations': 'thesisSupportOperations',
  'seedPostureMetrics': 'thesisPostureMetrics',
  'seedPostureAccountability': 'thesisPostureAccountability',
  'seedCisoSummary': 'thesisCisoSummary',
  'seedMissionBindings': 'thesisMissionBindings',
  'seedNotifications': 'thesisNotifications',
  'seedAuthSessions': 'thesisAuthSessions',
  'seedRbacPolicies': 'thesisRbacPolicies',
  'seedCaseFollows': 'thesisCaseFollows',
  'seedCaseTransitionAudits': 'thesisCaseTransitionAudits',
  'seedCaseStrategyBindings': 'thesisCaseStrategyBindings',
  'seedCommunicationThreads': 'thesisCommunicationThreads',
  'seedCommunicationPlaybooks': 'thesisCommunicationPlaybooks',
  'seedEmailCommunications': 'thesisEmailCommunications',
  'seedTeamsDecisionEvents': 'thesisTeamsDecisionEvents',
  'seedCloudSecurityPosture': 'thesisCloudSecurityPosture',
  'seedFindings': 'thesisFindings',
  'seedRiskScores': 'thesisRiskScores',
  'seedBlastRadius': 'thesisBlastRadius',
  'seedSearchConfigs': 'thesisSearchConfigs',
  'seedBreakGlassRequests': 'thesisBreakGlass',
  'seedGovernedCompose': 'thesisGovernedCompose',
  'seedIocs': 'thesisIocs',
  'seedAttackClassificationAudits': 'thesisAttackClassificationAudits',
  'SEED_TENANT': 'thesisTenant',
};

// Find all page files that import from seed fixtures
const files = execSync(
  "grep -rl \"from '.*fixtures/seed-\" apps/web/src/app/",
  { cwd: '/projects/sandbox/Commander_C2', encoding: 'utf8' }
).trim().split('\n');

console.log(`Found ${files.length} files to migrate`);

let totalChanges = 0;

for (const relPath of files) {
  const fullPath = `/projects/sandbox/Commander_C2/${relPath}`;
  let content = readFileSync(fullPath, 'utf8');

  // Step 1: Find all seed import lines
  const seedImportRegex = /import\s*\{([^}]+)\}\s*from\s*'([^']*fixtures\/seed-[^']*)';?\n?/g;
  const importedNames = new Set();
  let match;
  
  while ((match = seedImportRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim()).filter(Boolean);
    for (const name of names) {
      const cleanName = name.includes(' as ') ? name.split(' as ')[0].trim() : name;
      importedNames.add(cleanName);
    }
  }

  if (importedNames.size === 0) continue;

  // Step 2: Compute the relative path to thesis-adapters
  const afterApp = relPath.replace('apps/web/src/app/', '');
  const dirs = afterApp.split('/').length - 1;
  const levelsUp = 4 + dirs;
  const prefix = '../'.repeat(levelsUp);
  const thesisPath = `${prefix}packages/contracts/src/fixtures/thesis-adapters`;

  // Step 3: Build thesis import names
  const thesisNames = [];
  for (const name of importedNames) {
    if (RENAME_MAP[name]) {
      thesisNames.push(RENAME_MAP[name]);
    } else {
      console.log(`  WARN: unmapped import '${name}' in ${relPath}`);
    }
  }

  if (thesisNames.length === 0) continue;

  // Step 4: Remove old seed import lines
  content = content.replace(/import\s*\{[^}]+\}\s*from\s*'[^']*fixtures\/seed-[^']*';?\n?/g, '');
  
  // Clean multiple consecutive blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  // Step 5: Build and insert the new import
  const thesisImport = `import { ${thesisNames.join(', ')} } from '${thesisPath}';\n`;
  
  // Insert after last remaining import
  const importInsertRegex = /(import\s+[^;]+;\n)(?!import\s)/;
  const lastImportMatch = content.match(/([\s\S]*)(import\s+[^\n]+;\n)(?!import)/);
  
  if (lastImportMatch) {
    // Find the position after all imports
    let pos = 0;
    const importLineRegex = /import\s[^\n]+;\n/g;
    let m;
    while ((m = importLineRegex.exec(content)) !== null) {
      pos = m.index + m[0].length;
    }
    content = content.slice(0, pos) + thesisImport + content.slice(pos);
  } else {
    // No imports left, add at top (after 'use client' if present)
    const useClientMatch = content.match(/^'use client';\n\n?/);
    if (useClientMatch) {
      const afterUC = useClientMatch[0].length;
      content = content.slice(0, afterUC) + thesisImport + content.slice(afterUC);
    } else {
      content = thesisImport + content;
    }
  }

  // Step 6: Replace all variable references in the body
  for (const oldName of importedNames) {
    const newName = RENAME_MAP[oldName];
    if (!newName) continue;
    const regex = new RegExp(`\\b${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    content = content.replace(regex, newName);
  }

  writeFileSync(fullPath, content);
  totalChanges++;
}

console.log(`\nMigrated ${totalChanges} files total`);
