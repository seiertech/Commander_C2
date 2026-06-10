// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
'use client';
import { StrategyConfigView } from '../strategy-config-view';
/** Tenant Admin — SLA Configuration. Data: strategy.ts (sla surface) + seed-strategies */
export default function SettingsSlaPage() {
  return <StrategyConfigView surfaceType="sla" pretitle="Settings › SLA Configuration" title="SLA Strategy" />;
}
