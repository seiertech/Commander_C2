/**
 * Seed Posture Metrics — Commander C2 Test Fixtures
 *
 * 12 posture metrics with 4 time periods each (24h, 7d, 30d, YTD) and
 * 7-point history arrays. Strategy-sourced thresholds per Performance Doctrine.
 *
 * Source: Unit 16b deliverables, Spec #65/#66 Operating Pictures, MP §24.
 * No hardcoded threshold values in UI code — thresholds live here,
 * sourced from strategy layer policy references.
 */

import type { PostureMetricConfig, PostureMetricPeriodSnapshot } from '../entities/posture-metrics-config';
import { SEED_TENANT, SEED_SOURCE, seedId } from './seed-tenant';

const POSTURE_SOURCE = { ...SEED_SOURCE, sourceSystem: 'commander-posture-engine' };
const BASE_DATE = '2026-01-18T06:00:00.000Z';

/** Helper: generate 7-point history with slight variance around a base value */
function genHistory(base: number, variance: number, period: string): { timestamp: string; value: number }[] {
  const points: { timestamp: string; value: number }[] = [];
  const periodHours = period === '24h' ? 24 : period === '7d' ? 168 : period === '30d' ? 720 : 2160;
  const step = periodHours / 6; // 7 points = 6 intervals
  for (let i = 0; i < 7; i++) {
    const offset = Math.round((base + (variance * (Math.sin(i * 1.2) * 0.7 + Math.cos(i * 0.8) * 0.3))) * 10) / 10;
    const ts = new Date(new Date(BASE_DATE).getTime() - (6 - i) * step * 3600000).toISOString();
    points.push({ timestamp: ts, value: Math.max(0, Math.min(100, offset)) });
  }
  return points;
}

/** Helper: determine band based on thresholds and direction */
function getBand(value: number, green: number, amber: number, higherIsBetter: boolean): 'green' | 'amber' | 'red' {
  if (higherIsBetter) {
    if (value >= green) return 'green';
    if (value >= amber) return 'amber';
    return 'red';
  }
  // Lower is better: thresholds are inverted (green <= greenThreshold)
  if (value <= green) return 'green';
  if (value <= amber) return 'amber';
  return 'red';
}

/** Helper: determine trend */
function getTrend(current: number, previous: number): 'up' | 'down' | 'flat' {
  const delta = current - previous;
  if (Math.abs(delta) < 0.5) return 'flat';
  return delta > 0 ? 'up' : 'down';
}

/** Helper: build 4 period snapshots for a metric */
function buildPeriods(
  values: { '24h': [number, number]; '7d': [number, number]; '30d': [number, number]; 'ytd': [number, number] },
  green: number,
  amber: number,
  higherIsBetter: boolean,
  variance: number,
): PostureMetricPeriodSnapshot[] {
  return (['24h', '7d', '30d', 'ytd'] as const).map((period) => {
    const [current, previous] = values[period];
    return {
      period,
      currentValue: current,
      previousValue: previous,
      trend: getTrend(current, previous),
      history: genHistory(current, variance, period),
      band: getBand(current, green, amber, higherIsBetter),
    };
  });
}

export const seedPostureMetrics: PostureMetricConfig[] = [
  // ─── 1. Overall Posture Score ──────────────────────────────────────────────
  {
    id: seedId('pm', 1), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Overall Posture Score', metricKey: 'overall-posture-score',
    domain: 'posture', unit: '%', higherIsBetter: true, displayOrder: 1,
    thresholds: { strategySurface: 'posture', policyId: 'pol-posture-001', green: 80, amber: 60 },
    periods: buildPeriods(
      { '24h': [74, 72], '7d': [73, 71], '30d': [72, 68], 'ytd': [71, 65] },
      80, 60, true, 4,
    ),
  },
  // ─── 2. SLA Adherence ─────────────────────────────────────────────────────
  {
    id: seedId('pm', 2), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'SLA Adherence', metricKey: 'sla-adherence',
    domain: 'sla', unit: '%', higherIsBetter: true, displayOrder: 2,
    thresholds: { strategySurface: 'sla', policyId: 'pol-sla-001', green: 95, amber: 85 },
    periods: buildPeriods(
      { '24h': [91, 93], '7d': [89, 90], '30d': [88, 86], 'ytd': [87, 84] },
      95, 85, true, 3,
    ),
  },
  // ─── 3. Control Coverage ───────────────────────────────────────────────────
  {
    id: seedId('pm', 3), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Control Coverage', metricKey: 'control-coverage',
    domain: 'coverage', unit: '%', higherIsBetter: true, displayOrder: 3,
    thresholds: { strategySurface: 'effectiveness-targets', policyId: 'pol-eff-001', green: 90, amber: 75 },
    periods: buildPeriods(
      { '24h': [82, 81], '7d': [81, 79], '30d': [80, 77], 'ytd': [78, 74] },
      90, 75, true, 3,
    ),
  },
  // ─── 4. Vulnerability Density ──────────────────────────────────────────────
  {
    id: seedId('pm', 4), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Vulnerability Density', metricKey: 'vulnerability-density',
    domain: 'vulnerability', unit: 'count', higherIsBetter: false, displayOrder: 4,
    thresholds: { strategySurface: 'threshold', policyId: 'pol-thresh-001', green: 10, amber: 25 },
    periods: buildPeriods(
      { '24h': [18, 20], '7d': [19, 22], '30d': [21, 24], 'ytd': [23, 28] },
      10, 25, false, 3,
    ),
  },
  // ─── 5. Mean Time to Remediate ─────────────────────────────────────────────
  {
    id: seedId('pm', 5), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Mean Time to Remediate', metricKey: 'mttr',
    domain: 'vulnerability', unit: 'hours', higherIsBetter: false, displayOrder: 5,
    thresholds: { strategySurface: 'sla', policyId: 'pol-sla-002', green: 48, amber: 96 },
    periods: buildPeriods(
      { '24h': [62, 68], '7d': [65, 70], '30d': [72, 78], 'ytd': [75, 82] },
      48, 96, false, 8,
    ),
  },
  // ─── 6. Exposure Score ─────────────────────────────────────────────────────
  {
    id: seedId('pm', 6), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Exposure Score', metricKey: 'exposure-score',
    domain: 'exposure', unit: 'score', higherIsBetter: false, displayOrder: 6,
    thresholds: { strategySurface: 'threshold', policyId: 'pol-thresh-002', green: 20, amber: 50 },
    periods: buildPeriods(
      { '24h': [35, 38], '7d': [37, 40], '30d': [40, 44], 'ytd': [42, 48] },
      20, 50, false, 5,
    ),
  },
  // ─── 7. Identity Risk Index ────────────────────────────────────────────────
  {
    id: seedId('pm', 7), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Identity Risk Index', metricKey: 'identity-risk-index',
    domain: 'identity', unit: 'score', higherIsBetter: false, displayOrder: 7,
    thresholds: { strategySurface: 'threshold', policyId: 'pol-thresh-003', green: 15, amber: 35 },
    periods: buildPeriods(
      { '24h': [28, 30], '7d': [29, 32], '30d': [31, 34], 'ytd': [33, 37] },
      15, 35, false, 4,
    ),
  },
  // ─── 8. Configuration Drift Rate ──────────────────────────────────────────
  {
    id: seedId('pm', 8), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Configuration Drift Rate', metricKey: 'config-drift-rate',
    domain: 'configuration', unit: '%', higherIsBetter: false, displayOrder: 8,
    thresholds: { strategySurface: 'threshold', policyId: 'pol-thresh-004', green: 5, amber: 15 },
    periods: buildPeriods(
      { '24h': [8, 7], '7d': [9, 8], '30d': [11, 10], 'ytd': [12, 11] },
      5, 15, false, 2,
    ),
  },
  // ─── 9. Threat Intelligence Coverage ───────────────────────────────────────
  {
    id: seedId('pm', 9), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Threat Intel Coverage', metricKey: 'threat-intel-coverage',
    domain: 'threat-intelligence', unit: '%', higherIsBetter: true, displayOrder: 9,
    thresholds: { strategySurface: 'effectiveness-targets', policyId: 'pol-eff-002', green: 85, amber: 70 },
    periods: buildPeriods(
      { '24h': [78, 76], '7d': [77, 74], '30d': [75, 72], 'ytd': [74, 70] },
      85, 70, true, 3,
    ),
  },
  // ─── 10. Open Critical Cases ───────────────────────────────────────────────
  {
    id: seedId('pm', 10), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Open Critical Cases', metricKey: 'open-critical-cases',
    domain: 'posture', unit: 'count', higherIsBetter: false, displayOrder: 10,
    thresholds: { strategySurface: 'threshold', policyId: 'pol-thresh-005', green: 3, amber: 8 },
    periods: buildPeriods(
      { '24h': [5, 6], '7d': [6, 7], '30d': [7, 8], 'ytd': [8, 10] },
      3, 8, false, 2,
    ),
  },
  // ─── 11. Asset Visibility ──────────────────────────────────────────────────
  {
    id: seedId('pm', 11), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Asset Visibility', metricKey: 'asset-visibility',
    domain: 'coverage', unit: '%', higherIsBetter: true, displayOrder: 11,
    thresholds: { strategySurface: 'effectiveness-targets', policyId: 'pol-eff-003', green: 95, amber: 80 },
    periods: buildPeriods(
      { '24h': [88, 86], '7d': [87, 85], '30d': [86, 83], 'ytd': [85, 81] },
      95, 80, true, 3,
    ),
  },
  // ─── 12. Automation Effectiveness ──────────────────────────────────────────
  {
    id: seedId('pm', 12), entityType: 'posture-metric-config',
    tenant: SEED_TENANT, createdAt: BASE_DATE, updatedAt: BASE_DATE, source: POSTURE_SOURCE,
    label: 'Automation Effectiveness', metricKey: 'automation-effectiveness',
    domain: 'posture', unit: '%', higherIsBetter: true, displayOrder: 12,
    thresholds: { strategySurface: 'automation-boundary', policyId: 'pol-auto-001', green: 70, amber: 50 },
    periods: buildPeriods(
      { '24h': [63, 60], '7d': [61, 58], '30d': [59, 55], 'ytd': [57, 52] },
      70, 50, true, 4,
    ),
  },
];
