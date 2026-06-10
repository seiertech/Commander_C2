/**
 * Report Entity — Commander SDR Canonical Model
 *
 * Source: Spec #29 Universal Risk Object (reporting cadences),
 *         Master Technical Specification §Surface Layer (reporting)
 *
 * Reports are generated artefacts — scheduled or on-demand snapshots of
 * Commander operational posture, adherence status, or executive briefings.
 */

import type { CommonFields } from './common';

export type ReportType = 'executive-briefing' | 'adherence-pack' | 'posture-snapshot' | 'sla-report' | 'team-performance' | 'ciso-pack';

export type ReportStatus = 'scheduled' | 'generating' | 'completed' | 'failed' | 'archived';

export type ReportCadence = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on-demand';

export const REPORT_TYPES: ReportType[] = ['executive-briefing', 'adherence-pack', 'posture-snapshot', 'sla-report', 'team-performance', 'ciso-pack'];
export const REPORT_STATUSES: ReportStatus[] = ['scheduled', 'generating', 'completed', 'failed', 'archived'];
export const REPORT_CADENCES: ReportCadence[] = ['daily', 'weekly', 'monthly', 'quarterly', 'on-demand'];

export interface Report extends CommonFields {
  entityType: 'report';
  /** Report title */
  title: string;
  /** Report type */
  reportType: ReportType;
  /** Generation cadence */
  cadence: ReportCadence;
  /** Current status */
  status: ReportStatus;
  /** Target audience / RBAC scope */
  audience: string[];
  /** Reporting period start */
  periodStart: string;
  /** Reporting period end */
  periodEnd: string;
  /** When this report was last generated */
  lastGeneratedAt: string | null;
  /** When next generation is scheduled */
  nextScheduledAt: string | null;
  /** Export format */
  format: 'pdf' | 'html' | 'csv' | 'json';
  /** Summary description */
  description: string;
}
