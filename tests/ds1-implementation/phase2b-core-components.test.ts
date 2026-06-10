import { describe, it, expect } from 'vitest';
import { getKpiStripStyles } from '../../packages/ui/src/components/kpi-strip';
import { getKpiTileStyles, getTrendIndicator } from '../../packages/ui/src/components/kpi-tile';
import { getGaugeStyles, getGaugeBand, getGaugeChartConfig } from '../../packages/ui/src/components/instrument-gauge';
import { getRankedTableStyles, getTrendArrow, getBarColor } from '../../packages/ui/src/components/ranked-table';
import { getLiveFeedStyles, getSeverityColor } from '../../packages/ui/src/components/live-feed';
import { componentTokens } from '../../packages/ui/src/tokens/components';
import { primitiveSignal, primitiveFonts } from '../../packages/ui/src/tokens/primitives';

/**
 * DS-1.0 Phase 2b — Core Data Component Tests
 *
 * Validates:
 * - KPI strip/tile renders with correct tokens
 * - Instrument gauge supports Standard + Mission modes
 * - Gauge uses threshold bands (never colour alone)
 * - Ranked table uses correct row heights and inline bar
 * - Live feed uses severity dots with correct signal colours
 * - All components use three-layer tokens (zero hardcoded values)
 */

describe('KPI Strip', () => {
  it('renders with grid gap from component tokens', () => {
    const styles = getKpiStripStyles();
    expect(styles.container.gap).toBe(componentTokens.gridGap);
  });

  it('uses flex layout for horizontal strip', () => {
    const styles = getKpiStripStyles();
    expect(styles.container.display).toBe('flex');
  });
});

describe('KPI Tile', () => {
  it('Standard mode: value uses body font', () => {
    const styles = getKpiTileStyles('standard');
    expect(styles.value.fontFamily).toContain('Inter');
  });

  it('Mission mode: value uses Inter font (single-font system)', () => {
    const styles = getKpiTileStyles('mission');
    expect(styles.value.fontFamily).toContain('Inter');
  });

  it('label is uppercase with 0.06em tracking', () => {
    const styles = getKpiTileStyles('standard');
    expect(styles.label.textTransform).toBe('uppercase');
    expect(styles.label.letterSpacing).toBe('0.06em');
  });

  it('trend indicator returns correct arrow and colour', () => {
    const up = getTrendIndicator('up', true);
    expect(up.arrow).toBe('↑');
    expect(up.color).toBe(primitiveSignal.success);
    const down = getTrendIndicator('down', true);
    expect(down.color).toBe(primitiveSignal.critical);
  });
});

describe('Instrument Gauge', () => {
  it('Standard mode: no glow', () => {
    const styles = getGaugeStyles('standard');
    expect(styles.container.boxShadow).toBe('none');
  });

  it('Mission mode: has glow', () => {
    const styles = getGaugeStyles('mission');
    expect(styles.container.boxShadow).not.toBe('none');
  });

  it('value text uses Inter font (single-font system)', () => {
    const styles = getGaugeStyles('standard');
    expect(styles.valueText.fontFamily).toContain('Inter');
  });

  it('label text is uppercase with 0.06em tracking', () => {
    const styles = getGaugeStyles('standard');
    expect(styles.labelText.textTransform).toBe('uppercase');
    expect(styles.labelText.letterSpacing).toBe('0.06em');
  });

  it('arc colours use signal tokens (never hardcoded)', () => {
    const styles = getGaugeStyles('standard');
    expect(styles.arc.critical).toBe(primitiveSignal.critical);
    expect(styles.arc.warning).toBe(primitiveSignal.warning);
    expect(styles.arc.success).toBe(primitiveSignal.success);
  });

  it('getGaugeBand returns band + colour + label (never colour alone)', () => {
    const band = getGaugeBand(20, 100, { critical: 0.3, warning: 0.6, success: 1.0 });
    expect(band.band).toBe('critical');
    expect(band.color).toBe(primitiveSignal.critical);
    expect(band.label).toBe('Critical');
  });

  it('getGaugeBand healthy range', () => {
    const band = getGaugeBand(80, 100, { critical: 0.3, warning: 0.6, success: 1.0 });
    expect(band.band).toBe('success');
    expect(band.label).toBe('Healthy');
  });

  it('ApexCharts config is generated for gauge', () => {
    const config = getGaugeChartConfig({ value: 75, max: 100, label: 'Score' }, 'standard');
    expect(config.series[0]).toBe(75);
    expect(config.options.chart.type).toBe('radialBar');
    expect(config.options.labels[0]).toBe('Score');
  });
});

describe('Ranked Table', () => {
  it('row height matches component token (36px)', () => {
    const styles = getRankedTableStyles('standard');
    expect(styles.row.height).toBe(componentTokens.tableRowHeight);
  });

  it('header height matches component token (40px)', () => {
    const styles = getRankedTableStyles('standard');
    expect(styles.headerRow.height).toBe(componentTokens.tableHeaderHeight);
  });

  it('Mission mode: value cell uses Inter font (single-font system)', () => {
    const styles = getRankedTableStyles('mission');
    expect(styles.valueCell.fontFamily).toContain('Inter');
  });

  it('Standard mode: value cell uses body font', () => {
    const styles = getRankedTableStyles('standard');
    expect(styles.valueCell.fontFamily).toContain('Inter');
  });

  it('getTrendArrow returns correct arrow and colour', () => {
    const up = getTrendArrow('up', true);
    expect(up.arrow).toBe('↑');
    expect(up.color).toBe(primitiveSignal.success);
  });

  it('getBarColor returns signal colours based on ratio', () => {
    expect(getBarColor(80, 100)).toBe(primitiveSignal.success);
    expect(getBarColor(50, 100)).toBe(primitiveSignal.warning);
    expect(getBarColor(20, 100)).toBe(primitiveSignal.critical);
  });
});

describe('Live Activity Feed', () => {
  it('renders with correct container styles', () => {
    const styles = getLiveFeedStyles('standard');
    expect(styles.container.padding).toBe(componentTokens.cardPadding);
    expect(styles.container.borderRadius).toBe(componentTokens.cardRadius);
  });

  it('timestamp uses Inter font (single-font system)', () => {
    const styles = getLiveFeedStyles('standard');
    expect(styles.timestamp.fontFamily).toContain('Inter');
  });

  it('header is uppercase with 0.06em tracking', () => {
    const styles = getLiveFeedStyles('standard');
    expect(styles.header.textTransform).toBe('uppercase');
    expect(styles.header.letterSpacing).toBe('0.06em');
  });

  it('getSeverityColor returns correct signal colours', () => {
    expect(getSeverityColor('critical')).toBe(primitiveSignal.critical);
    expect(getSeverityColor('warning')).toBe(primitiveSignal.warning);
    expect(getSeverityColor('success')).toBe(primitiveSignal.success);
    expect(getSeverityColor('info')).toBe(primitiveSignal.info);
    expect(getSeverityColor('neutral')).toBe(primitiveSignal.neutral);
  });

  it('Mission mode: different surface colours', () => {
    const standard = getLiveFeedStyles('standard');
    const mission = getLiveFeedStyles('mission');
    expect(standard.container.background).not.toBe(mission.container.background);
  });
});
