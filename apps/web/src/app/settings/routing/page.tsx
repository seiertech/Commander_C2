'use client';
import { StrategyConfigView } from '../strategy-config-view';
/** Tenant Admin — Routing Configuration. Data: strategy.ts (routing surface) + seed-strategies */
export default function SettingsRoutingPage() {
  return <StrategyConfigView surface_type="routing" pretitle="Settings › Routing Configuration" title="Routing Strategy" />;
}
