/**
 * Vulnerability Domain Profile — Unit Tests (SLA modifiers, closure gates, reopening triggers)
 * CMEP-1.0: Case Management Excellence
 */

import { describe, it, expect } from 'vitest';
import { evaluateVulnSlaModifiers, DEFAULT_VULN_SLA_CONFIG } from '../../packages/contracts/src/profiles/vulnerability/vuln-sla-modifiers';
import { evaluateVulnClosureGates } from '../../packages/contracts/src/profiles/vulnerability/vuln-closure-gates';
import { evaluateVulnReopeningTriggers } from '../../packages/contracts/src/profiles/vulnerability/vuln-reopening-triggers';
import type { VulnSlaContext } from '../../packages/contracts/src/profiles/vulnerability/vuln-sla-modifiers';
import type { VulnClosureContext } from '../../packages/contracts/src/profiles/vulnerability/vuln-closure-gates';
import type { VulnReopeningContext } from '../../packages/contracts/src/profiles/vulnerability/vuln-reopening-triggers';

describe('Vulnerability SLA Modifiers', () => {
  it('all modifiers active when all conditions true', () => {
    const context: VulnSlaContext = {
      exploitMaturityActive: true,
      kevListed: true,
      hasCompensatingControl: true,
      internetFacing: true,
    };

    const result = evaluateVulnSlaModifiers(context);
    expect(result).toHaveLength(4);
    expect(result.every((m) => m.active)).toBe(true);
  });

  it('no modifiers active when all conditions false', () => {
    const context: VulnSlaContext = {
      exploitMaturityActive: false,
      kevListed: false,
      hasCompensatingControl: false,
      internetFacing: false,
    };

    const result = evaluateVulnSlaModifiers(context);
    expect(result.every((m) => !m.active)).toBe(true);
  });

  it('uses configured multiplier values', () => {
    const context: VulnSlaContext = {
      exploitMaturityActive: true,
      kevListed: false,
      hasCompensatingControl: false,
      internetFacing: false,
    };

    const config = { ...DEFAULT_VULN_SLA_CONFIG, exploitMaturityActiveMultiplier: 0.3 };
    const result = evaluateVulnSlaModifiers(context, config);
    const exploitMod = result.find((m) => m.name === 'exploit-maturity')!;
    expect(exploitMod.multiplier).toBe(0.3);
    expect(exploitMod.active).toBe(true);
  });
});

describe('Vulnerability Closure Gates', () => {
  it('all gates satisfied when all conditions met', () => {
    const context: VulnClosureContext = {
      vulnAbsentOnRescan: true,
      lastRescanAt: '2026-01-15T10:00:00Z',
      stabilityPeriodElapsed: true,
      stabilityHoursRemaining: 0,
      newExploitIntelSinceRemediation: false,
      openRelatedCaseCount: 0,
    };

    const gates = evaluateVulnClosureGates(context);
    expect(gates).toHaveLength(4);
    expect(gates.every((g) => g.satisfied)).toBe(true);
  });

  it('gates blocked when conditions not met', () => {
    const context: VulnClosureContext = {
      vulnAbsentOnRescan: false,
      lastRescanAt: '2026-01-15T10:00:00Z',
      stabilityPeriodElapsed: false,
      stabilityHoursRemaining: 24,
      newExploitIntelSinceRemediation: true,
      openRelatedCaseCount: 2,
    };

    const gates = evaluateVulnClosureGates(context);
    expect(gates.every((g) => !g.satisfied)).toBe(true);
  });

  it('reports correct gate IDs', () => {
    const context: VulnClosureContext = {
      vulnAbsentOnRescan: true,
      lastRescanAt: null,
      stabilityPeriodElapsed: true,
      stabilityHoursRemaining: 0,
      newExploitIntelSinceRemediation: false,
      openRelatedCaseCount: 0,
    };

    const gates = evaluateVulnClosureGates(context);
    const gateIds = gates.map((g) => g.gateId);
    expect(gateIds).toContain('vuln-absent-on-rescan');
    expect(gateIds).toContain('stability-period');
    expect(gateIds).toContain('no-new-exploit-intel');
    expect(gateIds).toContain('related-cases-clear');
  });
});

describe('Vulnerability Reopening Triggers', () => {
  it('no triggers fired when all conditions false', () => {
    const context: VulnReopeningContext = {
      cveReappeared: false,
      newExploitPublished: false,
      patchRolledBack: false,
      relatedCampaignEscalated: false,
    };

    const triggers = evaluateVulnReopeningTriggers(context);
    expect(triggers).toHaveLength(4);
    expect(triggers.every((t) => !t.fired)).toBe(true);
  });

  it('all triggers fired when all conditions true', () => {
    const context: VulnReopeningContext = {
      cveReappeared: true,
      newExploitPublished: true,
      patchRolledBack: true,
      relatedCampaignEscalated: true,
    };

    const triggers = evaluateVulnReopeningTriggers(context);
    expect(triggers.every((t) => t.fired)).toBe(true);
  });

  it('reports correct trigger IDs', () => {
    const context: VulnReopeningContext = {
      cveReappeared: false,
      newExploitPublished: false,
      patchRolledBack: false,
      relatedCampaignEscalated: false,
    };

    const triggers = evaluateVulnReopeningTriggers(context);
    const triggerIds = triggers.map((t) => t.triggerId);
    expect(triggerIds).toContain('cve-reappears');
    expect(triggerIds).toContain('new-exploit-published');
    expect(triggerIds).toContain('patch-rollback');
    expect(triggerIds).toContain('related-campaign-escalation');
  });
});
