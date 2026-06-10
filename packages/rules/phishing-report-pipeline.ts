/**
 * Phishing Report Pipeline — Commander C2
 *
 * Communications Excellence Phase 1.
 * Pure function for processing phishing reports through triage.
 *
 * Verdicts:
 * - malicious → risk object + case + "thank you, contained" notification
 * - suspicious → analyst queue
 * - clean → "thank you, appears safe" + log as intelligence
 *
 * Constraints:
 * - SOC read-only boundary: verdicts consumed, not produced
 * - No live email notifications (Phase 1 — intent/status only)
 */

import type { PhishingReport } from '../contracts/src/entities/phishing-report';
import type { DetonationVerdict } from '../contracts/src/entities/detonation-verdict';
import type { PhishingTriageVerdict } from '../contracts/src/entities/phishing-report';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Observable inventory entry for checking existing observables */
export interface ObservableInventoryEntry {
  id: string;
  type: string;
  value: string;
}

/** Risk object recommendation */
export interface RiskObjectRecommendation {
  type: 'detection';
  title: string;
  severity: number;
  confidence: number;
}

/** Case creation recommendation */
export interface CaseRecommendation {
  case_type: 'threat-intelligence-estate-match';
  title: string;
  priority: 'P1' | 'P2';
}

/** Phishing report pipeline result */
export interface PhishingPipelineResult {
  /** Determined triage verdict */
  triageVerdict: PhishingTriageVerdict;
  /** Observable IDs emitted from report analysis */
  observablesEmitted: string[];
  /** Risk object recommendation (malicious only) */
  riskObjectRecommendation: RiskObjectRecommendation | null;
  /** Case creation recommendation (malicious only) */
  caseRecommendation: CaseRecommendation | null;
  /** Employee notification message */
  employeeNotification: string;
}

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Process a phishing report through the triage pipeline.
 *
 * @param report - The phishing report to process
 * @param detonationVerdict - The detonation verdict for the reported email
 * @param observableInventory - Existing observable inventory for dedup
 * @returns PhishingPipelineResult with verdict, recommendations, and notification
 */
export function processPhishingReport(
  report: PhishingReport,
  detonationVerdict: DetonationVerdict,
  observableInventory: ObservableInventoryEntry[],
): PhishingPipelineResult {
  const triageVerdict = determineTriageVerdict(detonationVerdict);
  const observablesEmitted = emitObservables(report, detonationVerdict, observableInventory);

  switch (triageVerdict) {
    case 'malicious':
      return {
        triageVerdict: 'malicious',
        observablesEmitted,
        riskObjectRecommendation: {
          type: 'detection',
          title: `Phishing detection: ${report.originalEmailRef}`,
          severity: 4,
          confidence: getHighestConfidence(detonationVerdict),
        },
        caseRecommendation: {
          case_type: 'threat-intelligence-estate-match',
          title: `Confirmed phishing: reported by ${report.reported_by}`,
          priority: 'P1',
        },
        employeeNotification: buildMaliciousNotification(report),
      };

    case 'suspicious':
      return {
        triageVerdict: 'suspicious',
        observablesEmitted,
        riskObjectRecommendation: null,
        caseRecommendation: null,
        employeeNotification: buildSuspiciousNotification(report),
      };

    case 'clean':
      return {
        triageVerdict: 'clean',
        observablesEmitted,
        riskObjectRecommendation: null,
        caseRecommendation: null,
        employeeNotification: buildCleanNotification(report),
      };
  }
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function determineTriageVerdict(detonationVerdict: DetonationVerdict): PhishingTriageVerdict {
  return detonationVerdict.overallVerdict;
}

function emitObservables(
  report: PhishingReport,
  verdict: DetonationVerdict,
  inventory: ObservableInventoryEntry[],
): string[] {
  const emitted: string[] = [];

  // Emit observable for the email message
  const emailObsId = `obs-email-${report.reportId}`;
  if (!inventory.find((o) => o.id === emailObsId)) {
    emitted.push(emailObsId);
  }

  // Emit observables for each failed check
  for (const check of verdict.checks) {
    if (check.result === 'fail' || check.result === 'suspicious') {
      const checkObsId = `obs-${check.checkType}-${report.reportId}`;
      if (!inventory.find((o) => o.id === checkObsId)) {
        emitted.push(checkObsId);
      }
    }
  }

  return emitted;
}

function getHighestConfidence(verdict: DetonationVerdict): number {
  if (verdict.checks.length === 0) return 70;
  return Math.max(...verdict.checks.map((c) => c.confidence));
}

function buildMaliciousNotification(report: PhishingReport): string {
  return `Thank you for reporting this email. Our analysis has confirmed it is malicious. The threat has been contained and appropriate security measures have been applied. Your vigilance helps protect the organisation.`;
}

function buildSuspiciousNotification(report: PhishingReport): string {
  return `Thank you for reporting this email. Our initial analysis indicates it may be suspicious. An analyst will review it further and take any necessary action. We appreciate your vigilance.`;
}

function buildCleanNotification(report: PhishingReport): string {
  return `Thank you for reporting this email. Our analysis indicates it appears safe. No further action is required. Your vigilance helps keep the organisation secure.`;
}
