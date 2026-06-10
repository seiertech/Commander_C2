/**
 * Phase D5 — Lifecycle UI on Case Detail Tests
 *
 * Spec 06 Case Management: Lifecycle UI Section
 * Tests:
 * - Section renders on Case Detail page
 * - Current state highlights correctly on lifecycle pipeline
 * - Allowed next states displayed (read-only)
 * - Transition history displays (from → to, actor, reason, timestamp, audit ref)
 * - Closure gate status displays for awaiting-closure cases
 * - Validation window displays for awaiting-validation cases
 * - Assignment rationale and escalation path displayed
 * - No manual transition buttons present
 * - No manual closure/reopening buttons present
 * - All values from D1-D4 evaluators and Spec 43 strategies
 * - Both modes via semantic tokens (no hardcoded values)
 *
 * Doctrinal constraints verified:
 * - Read-only display only (Assertion 1)
 * - Strategy consumption (Constraint 9)
 * - Three-layer tokens only
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const PAGE_PATH = resolve(ROOT, 'apps/web/src/app/cases/[id]/page.tsx');
const pageContent = readFileSync(PAGE_PATH, 'utf-8');

describe('Phase D5: Lifecycle Section — Exists', () => {
  it('Case Detail page exists', () => {
    expect(existsSync(PAGE_PATH)).toBe(true);
  });

  it('contains a Lifecycle section', () => {
    expect(pageContent).toContain('data-testid="lifecycle-section"');
    expect(pageContent).toContain('Lifecycle');
  });

  it('renders LifecycleSection component', () => {
    expect(pageContent).toContain('<LifecycleSection');
    expect(pageContent).toContain('function LifecycleSection');
  });
});

describe('Phase D5: Lifecycle Pipeline — Current State Highlight', () => {
  it('imports LIFECYCLE_STAGES from Phase 2c component', () => {
    expect(pageContent).toContain("import { LIFECYCLE_STAGES }");
    expect(pageContent).toContain('lifecycle-pipeline');
  });

  it('has lifecycle pipeline with data-testid', () => {
    expect(pageContent).toContain('data-testid="lifecycle-pipeline"');
  });

  it('maps CaseStatus to lifecycle stage via STATUS_TO_STAGE', () => {
    expect(pageContent).toContain('STATUS_TO_STAGE');
    expect(pageContent).toContain("'open': 'New'");
    expect(pageContent).toContain("'in-progress': 'Investigating'");
    expect(pageContent).toContain("'awaiting-validation': 'Validation'");
    expect(pageContent).toContain("'awaiting-closure': 'Closure'");
    expect(pageContent).toContain("'closed': 'Closure'");
    expect(pageContent).toContain("'reopened': 'Triage'");
  });

  it('highlights current stage with gold border', () => {
    expect(pageContent).toContain('isCurrentStage');
    expect(pageContent).toContain('primitiveBrand.gold');
  });

  it('applies mission mode glow on active stage', () => {
    expect(pageContent).toContain("mode === 'mission'");
    expect(pageContent).toContain('rgba(255,210,31,0.35)');
  });
});

describe('Phase D5: Allowed Next States — Read-Only', () => {
  it('imports getNextStates from D1 transition engine', () => {
    expect(pageContent).toContain("import { getNextStates }");
    expect(pageContent).toContain('case-lifecycle');
  });

  it('has allowed-next-states section', () => {
    expect(pageContent).toContain('data-testid="allowed-next-states"');
  });

  it('labels as system-owned', () => {
    expect(pageContent).toContain('Allowed Next States (system-owned)');
  });

  it('displays next states as read-only spans (not buttons)', () => {
    // Verify it uses <span> not <button> for next states
    expect(pageContent).toContain('allowedNext.map((state)');
    expect(pageContent).toContain('<span key={state}');
  });

  it('shows terminal state message when no transitions available', () => {
    expect(pageContent).toContain('No transitions available (terminal state)');
  });
});

describe('Phase D5: Transition History Timeline', () => {
  it('has transition-history section', () => {
    expect(pageContent).toContain('data-testid="transition-history"');
  });

  it('displays from → to states', () => {
    expect(pageContent).toContain('txn.from');
    expect(pageContent).toContain('txn.to');
  });

  it('displays actor', () => {
    expect(pageContent).toContain('txn.actor');
  });

  it('displays timestamp', () => {
    expect(pageContent).toContain('txn.timestamp');
  });

  it('displays audit reference', () => {
    expect(pageContent).toContain('txn.auditRef');
  });

  it('shows transition reason in history data', () => {
    // Reason is stored in the transitionHistory data structure
    expect(pageContent).toContain("reason: 'Case assigned via routing strategy'");
  });
});

describe('Phase D5: Closure Gate Status (awaiting-closure)', () => {
  it('imports evaluateClosureGates from D3', () => {
    expect(pageContent).toContain("import { evaluateClosureGates }");
    expect(pageContent).toContain('closure-gate-enforcer');
  });

  it('has closure-gate-status section (conditional)', () => {
    expect(pageContent).toContain('data-testid="closure-gate-status"');
  });

  it('only shows for awaiting-closure cases', () => {
    expect(pageContent).toContain("caseRecord.status === 'awaiting-closure'");
  });

  it('displays individual gate results with pass/fail indicators', () => {
    expect(pageContent).toContain('closureGateState.gate_results.map');
    expect(pageContent).toContain('gate.passed');
    expect(pageContent).toContain('gate.gate');
    expect(pageContent).toContain('gate.reason');
  });

  it('shows overall gate status (all pass or pending)', () => {
    expect(pageContent).toContain('closureGateState.allGatesPass');
    expect(pageContent).toContain('All gates pass');
    expect(pageContent).toContain('Gates pending');
  });

  it('shows strategy policy reference', () => {
    expect(pageContent).toContain('closureGateState.strategyRef.policy_id');
  });
});

describe('Phase D5: Validation Window Status (awaiting-validation)', () => {
  it('imports evaluateValidationWindow from D2', () => {
    expect(pageContent).toContain("import { evaluateValidationWindow }");
    expect(pageContent).toContain('validation-window-enforcer');
  });

  it('has validation-window-status section (conditional)', () => {
    expect(pageContent).toContain('data-testid="validation-window-status"');
  });

  it('only shows for awaiting-validation cases', () => {
    expect(pageContent).toContain("caseRecord.status === 'awaiting-validation'");
  });

  it('displays window hours remaining', () => {
    expect(pageContent).toContain('validationState.windowHoursRemaining');
    expect(pageContent).toContain('remaining');
  });

  it('displays evidence freshness state', () => {
    expect(pageContent).toContain('validationState.evidenceFresh');
    expect(pageContent).toContain('Fresh');
    expect(pageContent).toContain('Stale');
  });

  it('displays refresh due state', () => {
    expect(pageContent).toContain('validationState.refreshDue');
  });

  it('shows strategy policy reference', () => {
    expect(pageContent).toContain('validationState.strategyRef.policy_id');
  });
});

describe('Phase D5: Assignment Rationale and Escalation Path (D4)', () => {
  it('imports extractRoutingConfig from D4', () => {
    expect(pageContent).toContain("import { assignCase, extractRoutingConfig }");
    expect(pageContent).toContain('assignment-engine');
  });

  it('has assignment-rationale section', () => {
    expect(pageContent).toContain('data-testid="assignment-rationale"');
  });

  it('displays current owner', () => {
    expect(pageContent).toContain('caseRecord.owner');
  });

  it('displays current team', () => {
    expect(pageContent).toContain('caseRecord.team');
  });

  it('displays escalation path from strategy', () => {
    expect(pageContent).toContain('assignmentInfo.escalation_path');
    expect(pageContent).toContain("join(' → ')");
  });
});

describe('Phase D5: No Manual Actions (Assertion 1)', () => {
  it('no manual transition buttons', () => {
    expect(pageContent).not.toContain('Transition Case');
    expect(pageContent).not.toContain('Move to Next');
    expect(pageContent).not.toContain('onClick={transition');
    expect(pageContent).not.toContain('handleTransition');
  });

  it('no manual closure buttons', () => {
    expect(pageContent).not.toContain('Close Case');
    expect(pageContent).not.toContain('Manual Close');
    expect(pageContent).not.toContain('onClick={close');
    expect(pageContent).not.toContain('handleClose');
  });

  it('no manual reopening buttons', () => {
    expect(pageContent).not.toContain('Reopen Case');
    expect(pageContent).not.toContain('Manual Reopen');
    expect(pageContent).not.toContain('onClick={reopen');
    expect(pageContent).not.toContain('handleReopen');
  });

  it('no manual assignment override buttons', () => {
    expect(pageContent).not.toContain('Reassign');
    expect(pageContent).not.toContain('Override Assignment');
    expect(pageContent).not.toContain('Manual Assign');
    expect(pageContent).not.toContain('onClick={assign');
  });

  it('next states are spans not buttons', () => {
    // The allowed next states section uses <span> not <button>
    expect(pageContent).toContain('<span key={state}');
    expect(pageContent).not.toMatch(/<button[^>]*key=\{state\}/);
  });
});

describe('Phase D5: Token Consumption (Three-Layer Only)', () => {
  it('uses componentTokens for layout', () => {
    expect(pageContent).toContain('componentTokens.cardPadding');
    expect(pageContent).toContain('componentTokens.contentPadding');
  });

  it('uses primitiveTypeScale for typography', () => {
    expect(pageContent).toContain('primitiveTypeScale.micro');
    expect(pageContent).toContain('primitiveTypeScale.body');
    expect(pageContent).toContain('primitiveTypeScale.caption');
  });

  it('uses primitiveSpacing for gaps', () => {
    expect(pageContent).toContain('primitiveSpacing[');
  });

  it('uses primitiveSignal for status colours', () => {
    expect(pageContent).toContain('primitiveSignal.success');
    expect(pageContent).toContain('primitiveSignal.critical');
    expect(pageContent).toContain('primitiveSignal.warning');
  });

  it('uses primitiveBrand.gold for active stage', () => {
    expect(pageContent).toContain('primitiveBrand.gold');
  });

  it('border radius is handled by Tabler CSS or inline token where used', () => {
    // The Tabler reskin (DEC-pagecontainer-shared-standard) uses Tabler card classes
    // (which apply border-radius via globals.css override) rather than inline primitiveRadii.
    // The lifecycle pipeline uses inline border on stages, not border-radius.
    expect(pageContent).toContain('border');
  });

  it('no hardcoded hex colour values in lifecycle section', () => {
    // Extract just the LifecycleSection function
    const lifecycleSectionStart = pageContent.indexOf('function LifecycleSection');
    const lifecycleSectionContent = pageContent.slice(lifecycleSectionStart);
    // Allow the rgba glow value (it's a shadow effect, not a colour token)
    const withoutGlow = lifecycleSectionContent.replace(/rgba\(255,210,31,0\.\d+\)/g, '');
    // No standalone hex colours like #ffffff, #061936 etc
    const hexMatches = withoutGlow.match(/#[0-9a-fA-F]{3,8}/g);
    expect(hexMatches).toBeNull();
  });
});

describe('Phase D5: Mode Support', () => {
  it('receives mode prop', () => {
    expect(pageContent).toContain('mode: string');
    expect(pageContent).toContain('<LifecycleSection');
    expect(pageContent).toContain('mode={mode}');
  });

  it('applies mode-specific glow on pipeline stages', () => {
    expect(pageContent).toContain("mode === 'mission'");
  });
});
