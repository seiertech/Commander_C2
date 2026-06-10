// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
'use client';
import { StrategyConfigView } from '../strategy-config-view';
/** Tenant Admin — Routing Configuration. Data: strategy.ts (routing surface) + seed-strategies */
export default function SettingsRoutingPage() {
  return <StrategyConfigView surfaceType="routing" pretitle="Settings › Routing Configuration" title="Routing Strategy" />;
}
