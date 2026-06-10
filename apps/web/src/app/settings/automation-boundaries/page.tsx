// @ts-nocheck
'use client';
import { StrategyConfigView } from '../strategy-config-view';
/** Tenant Admin — Automation Boundaries. Data: strategy.ts (automation-boundary surface) + seed-strategies */
export default function SettingsAutomationBoundariesPage() {
  return <StrategyConfigView surfaceType="automation-boundary" pretitle="Settings › Automation Boundaries" title="Automation Boundary Strategy" />;
}
