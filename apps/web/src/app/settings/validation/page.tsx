'use client';
import { StrategyConfigView } from '../strategy-config-view';
/** Tenant Admin — Validation Rules. Data: strategy.ts (validation-window surface) + seed-strategies */
export default function SettingsValidationPage() {
  return <StrategyConfigView surface_type="validation-window" pretitle="Settings › Validation Rules" title="Validation Window Strategy" />;
}
