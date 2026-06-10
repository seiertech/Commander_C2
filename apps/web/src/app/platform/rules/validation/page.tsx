'use client';

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import {
  validateRule,
  type RuleSpec,
} from '../../../../../../../packages/contracts/src/engines/rule-validation-engine';
import { componentTokens } from '../../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../../packages/ui/src/tokens/primitives';

/**
 * Platform — Rule Validation (Pre-Activation Status)
 *
 * Source: Thesis Drift and Rule Engine
 * Use Case: UC-168 — Validate rule before activation
 * Engine: rule-validation-engine (validateRuleSchema, checkOperatorWhitelist,
 *         rejectCodeExecution, validateTenantScope)
 * Route: /platform/rules/validation | Nav Group: Platform | Status: BUILD
 *
 * Display-only. Runs candidate rule specs through the validation engine and
 * surfaces pass/fail, schema errors, and the security envelope outcome. No rule
 * is activated here — validation is the gate before activation.
 */

{/* AI-PLACEMENT: AICAP-PLATFORM-003 — Commander AI rule remediation suggestion */}

// Candidate rule specs (as they would arrive from the YAML authoring surface).
const CANDIDATE_RULES: Array<{ label: string; spec: RuleSpec }> = [
  {
    label: 'MFA drift on privileged identity',
    spec: {
      name: 'MFA disabled on privileged identity',
      ruleType: 'drift',
      tenantScope: 'tenant-001-acme-corp',
      severity: 5,
      conditions: [
        { field: 'identity.privileged', operator: 'eq', value: true },
        { field: 'identity.mfaEnabled', operator: 'eq', value: false },
      ],
      actions: ['create-case', 'raise-priority'],
    },
  },
  {
    label: 'Non-whitelisted operator',
    spec: {
      name: 'Bad operator rule',
      ruleType: 'detection',
      tenantScope: 'tenant-001-acme-corp',
      severity: 3,
      conditions: [{ field: 'asset.region', operator: 'regex_eval', value: '.*' }],
    },
  },
  {
    label: 'Embedded code execution (rejected)',
    spec: {
      name: 'Malicious rule',
      ruleType: 'custom',
      tenantScope: 'tenant-001-acme-corp',
      severity: 4,
      conditions: [{ field: 'asset.tag', operator: 'matches', value: 'eval(process.exit(1))' }],
    },
  },
  {
    label: 'Missing tenant scope',
    spec: {
      name: 'Unscoped rule',
      ruleType: 'drift',
      tenantScope: '',
      severity: 2,
      conditions: [{ field: 'control.status', operator: 'neq', value: 'compliant' }],
    },
  },
];

export default function PlatformRuleValidationPage() {
  const { tokens } = useMode();

  const results = CANDIDATE_RULES.map((c) => ({ ...c, result: validateRule(c.spec) }));
  const passing = results.filter((r) => r.result.valid).length;
  const failing = results.length - passing;

  return (
    <PageContainer pretitle="Platform › Rule Engine › Validation" title="Rule Validation">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Candidates" value={String(results.length)} />
        <KpiCard tokens={tokens} label="Activatable" value={String(passing)} accent={primitiveSignal.success} />
        <KpiCard tokens={tokens} label="Blocked" value={String(failing)} accent={primitiveSignal.critical} />
      </section>

      <div style={{ display: 'grid', gap: componentTokens.gridGap }}>
        {results.map(({ label, spec, result }) => (
          <div key={label} style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: componentTokens.cardHeaderMargin }}>
              <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: 0 }}>{label}</h3>
              <span style={{ padding: '2px 8px', fontSize: primitiveTypeScale.micro, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', color: '#fff', background: result.valid ? primitiveSignal.success : primitiveSignal.critical }}>
                {result.valid ? 'Activatable' : 'Blocked'}
              </span>
            </div>

            <div style={{ fontSize: primitiveTypeScale.micro, color: tokens.text.muted, fontFamily: primitiveFonts.mono, marginBottom: primitiveSpacing[2] }}>
              {spec.ruleType} • severity {spec.severity} • scope {Array.isArray(spec.tenantScope) ? spec.tenantScope.join(', ') : (spec.tenantScope || '—')}
            </div>

            {result.errors.length > 0 && (
              <div style={{ marginBottom: primitiveSpacing[2] }}>
                <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: primitiveSignal.critical, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, marginBottom: primitiveSpacing[1] }}>Errors</span>
                <ul style={{ margin: 0, paddingLeft: primitiveSpacing[4] }}>
                  {result.errors.map((e, i) => (
                    <li key={i} style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div>
                <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: primitiveSignal.warning, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, marginBottom: primitiveSpacing[1] }}>Warnings</span>
                <ul style={{ margin: 0, paddingLeft: primitiveSpacing[4] }}>
                  {result.warnings.map((w, i) => (
                    <li key={i} style={{ fontSize: primitiveTypeScale.caption, color: tokens.text.muted, fontFamily: primitiveFonts.mono }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.valid && result.warnings.length === 0 && (
              <span style={{ fontSize: primitiveTypeScale.caption, color: primitiveSignal.success }}>Passed all validation stages — schema, operator whitelist, code-execution rejection, tenant scope.</span>
            )}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

function KpiCard({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span>
    </div>
  );
}
