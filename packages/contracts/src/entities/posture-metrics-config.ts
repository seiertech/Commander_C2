/**
 * Posture Metrics Config — Commander C2 Canonical Model
 *
 * Source: Spec #65 External Operating Picture, Spec #66 Internal Operating Picture,
 *         MP §24 (Workspace Model — posture rollups), Unit 16b deliverables.
 *
 * Defines the data-point-to-metric mapping artifact required by Unit 16b.
 * Each posture metric maps a KPI label to a confirmed data source (strategy surface,
 * domain page, or engine), declares strategy-sourced thresholds, and carries
 * time-series history for sparkline rendering.
 *
 * Strategy values sourced from the Strategy Layer (Spec #32 — posture, threshold,
 * effectiveness-targets surfaces). No hardcoded threshold literals in page code.
 */

import type { CommonFields } from './common';

// ─── Time Period ─────────────────────────────────────────────────────────────

/** Supported time-range periods for posture metric rollups */
export type PostureTimePeriod = '24h' | '7d' | '30d' | 'ytd';

export const POSTURE_TIME_PERIODS: PostureTimePeriod[] = ['24h', '7d', '30d', 'ytd'];

export const POSTURE_TIME_PERIOD_LABELS: Record<PostureTimePeriod, string> = {
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
  'ytd': 'Year to Date',
};

// ─── Trend Direction ─────────────────────────────────────────────────────────

/** Trend direction for a metric over a time period */
export type TrendDirection = 'up' | 'down' | 'flat';

// ─── Threshold Band ──────────────────────────────────────────────────────────

/** Band classification derived from strategy-sourced thresholds */
export type ThresholdBand = 'green' | 'amber' | 'red';

// ─── Metric Domain ───────────────────────────────────────────────────────────

/** Security domain that a posture metric belongs to */
export type PostureMetricDomain =
  | 'vulnerability'
  | 'exposure'
  | 'identity'
  | 'coverage'
  | 'sla'
  | 'posture'
  | 'configuration'
  | 'threat-intelligence';

export const POSTURE_METRIC_DOMAINS: PostureMetricDomain[] = [
  'vulnerability',
  'exposure',
  'identity',
  'coverage',
  'sla',
  'posture',
  'configuration',
  'threat-intelligence',
];

// ─── Metric Time-Series Point ────────────────────────────────────────────────

/** A single data point in the metric sparkline history */
export interface PostureMetricDataPoint {
  /** ISO timestamp for this observation */
  timestamp: string;
  /** Numeric value at this point */
  value: number;
}

// ─── Strategy Threshold Reference ────────────────────────────────────────────

/** Threshold values sourced from strategy layer — never hardcoded */
export interface StrategyThresholdRef {
  /** Strategy surface type that owns these thresholds */
  strategySurface: string;
  /** Policy ID from the strategy layer */
  policyId: string;
  /** Green threshold (value >= green means healthy) — for higher-is-better metrics */
  green: number;
  /** Amber threshold (value >= amber means degraded) — between amber and green */
  amber: number;
  /** Red is anything below amber */
}

// ─── Per-Period Metric Snapshot ──────────────────────────────────────────────

/** Metric data for a single time period */
export interface PostureMetricPeriodSnapshot {
  /** Which time period this snapshot covers */
  period: PostureTimePeriod;
  /** Current computed value */
  currentValue: number;
  /** Previous period value (for delta calculation) */
  previousValue: number;
  /** Trend direction */
  trend: TrendDirection;
  /** 7-point sparkline history (evenly distributed across period) */
  history: PostureMetricDataPoint[];
  /** Current band derived from strategy thresholds */
  band: ThresholdBand;
}

// ─── Posture Metric Config ───────────────────────────────────────────────────

/** A single posture metric in the aggregate rollup */
export interface PostureMetricConfig extends CommonFields {
  entityType: 'posture-metric-config';
  /** Human-readable metric label */
  label: string;
  /** Short metric key (slug) for programmatic reference */
  metricKey: string;
  /** Security domain this metric belongs to */
  domain: PostureMetricDomain;
  /** Unit of measurement (e.g., '%', 'count', 'hours', 'score') */
  unit: string;
  /** Whether higher values are better (true) or lower values are better (false) */
  higherIsBetter: boolean;
  /** Strategy-sourced thresholds — never hardcoded */
  thresholds: StrategyThresholdRef;
  /** Per-period snapshots (one per supported time period) */
  periods: PostureMetricPeriodSnapshot[];
  /** Display order in the posture grid (1-based) */
  displayOrder: number;
}
