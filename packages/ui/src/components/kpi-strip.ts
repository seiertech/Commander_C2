/**
 * KPI Strip — Commander C2 (DS-1.0)
 *
 * Horizontal row of 8-10 KPI tiles directly under every page header.
 * DS-1.0 §21 Requirement 26: mandatory on every dashboard page.
 *
 * Source: DESIGN_SYSTEM.md §21; mockup: command-centre-standard.png, command-centre-mission.png
 */

import { componentTokens } from '../tokens/components';

export interface KpiStripStyles {
  container: Record<string, string>;
}

export function getKpiStripStyles(): KpiStripStyles {
  return {
    container: {
      display: 'flex',
      gap: componentTokens.gridGap,
      overflowX: 'auto',
      padding: `${componentTokens.cardPadding} 0`,
    },
  };
}
