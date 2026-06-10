/**
 * Unit Tests — Phishing Report Pipeline
 *
 * Feature: communications-excellence
 * Tests: all 3 verdict paths, observable emission, notification text
 */

import { describe, it, expect } from 'vitest';
import { processPhishingReport } from '../../packages/rules/phishing-report-pipeline';
import { seedPhishingReports } from '../../packages/contracts/src/fixtures/seed-phishing-reports';
import { seedDetonationVerdicts } from '../../packages/contracts/src/fixtures/seed-detonation-verdicts';

describe('Phishing Report Pipeline — Malicious Path', () => {
  it('produces risk object + case recommendation for malicious verdict', () => {
    const report = seedPhishingReports[0]; // malicious
    const verdict = seedDetonationVerdicts[2]; // malicious
    const result = processPhishingReport(report, verdict, []);

    expect(result.triageVerdict).toBe('malicious');
    expect(result.riskObjectRecommendation).not.toBeNull();
    expect(result.riskObjectRecommendation!.type).toBe('detection');
    expect(result.caseRecommendation).not.toBeNull();
    expect(result.caseRecommendation!.caseType).toBe('threat-intelligence-estate-match');
    expect(result.caseRecommendation!.priority).toBe('P1');
  });

  it('emits observables for malicious verdict', () => {
    const report = seedPhishingReports[0];
    const verdict = seedDetonationVerdicts[2];
    const result = processPhishingReport(report, verdict, []);
    expect(result.observablesEmitted.length).toBeGreaterThan(0);
  });

  it('produces "contained" notification for malicious', () => {
    const report = seedPhishingReports[0];
    const verdict = seedDetonationVerdicts[2];
    const result = processPhishingReport(report, verdict, []);
    expect(result.employeeNotification).toContain('contained');
  });
});

describe('Phishing Report Pipeline — Suspicious Path', () => {
  it('routes to analyst queue without risk object or case', () => {
    const report = seedPhishingReports[1]; // suspicious
    const verdict = seedDetonationVerdicts[1]; // suspicious
    const result = processPhishingReport(report, verdict, []);

    expect(result.triageVerdict).toBe('suspicious');
    expect(result.riskObjectRecommendation).toBeNull();
    expect(result.caseRecommendation).toBeNull();
  });

  it('produces appropriate notification for suspicious', () => {
    const report = seedPhishingReports[1];
    const verdict = seedDetonationVerdicts[1];
    const result = processPhishingReport(report, verdict, []);
    expect(result.employeeNotification).toContain('analyst');
  });
});

describe('Phishing Report Pipeline — Clean Path', () => {
  it('produces no risk object or case for clean verdict', () => {
    const report = seedPhishingReports[2]; // clean
    const verdict = seedDetonationVerdicts[0]; // clean
    const result = processPhishingReport(report, verdict, []);

    expect(result.triageVerdict).toBe('clean');
    expect(result.riskObjectRecommendation).toBeNull();
    expect(result.caseRecommendation).toBeNull();
  });

  it('produces "appears safe" notification for clean', () => {
    const report = seedPhishingReports[2];
    const verdict = seedDetonationVerdicts[0];
    const result = processPhishingReport(report, verdict, []);
    expect(result.employeeNotification).toContain('appears safe');
  });

  it('emits minimal observables for clean verdict', () => {
    const report = seedPhishingReports[2];
    const verdict = seedDetonationVerdicts[0];
    const result = processPhishingReport(report, verdict, []);
    // Clean verdict with all-pass checks should emit only email observable
    expect(result.observablesEmitted.length).toBeLessThanOrEqual(1);
  });
});

describe('Phishing Report Pipeline — Observable Dedup', () => {
  it('does not emit duplicate observables present in inventory', () => {
    const report = seedPhishingReports[0];
    const verdict = seedDetonationVerdicts[2];
    // Pre-populate inventory with the email observable
    const inventory = [{ id: `obs-email-${report.reportId}`, type: 'email', value: report.originalEmailRef }];
    const result = processPhishingReport(report, verdict, inventory);
    // Should not include the email observable since it's already in inventory
    expect(result.observablesEmitted).not.toContain(`obs-email-${report.reportId}`);
  });
});
