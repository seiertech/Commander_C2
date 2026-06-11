'use client';
import { StrategyConfigView } from '../strategy-config-view';

import { thesisTenantConfigs, thesisRbacPolicies, thesisConnectors, thesisRules, thesisFeatureRegistry, thesisAssets, thesisCases, thesisStrategies, thesisMissions, thesisPostures } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';/** Tenant Admin — Validation Rules. Data: strategy.ts (validation-window surface) + seed-strategies */
export default function SettingsValidationPage() {
  return <StrategyConfigView surface_type="validation-window" pretitle="Settings › Validation Rules" title="Validation Window Strategy" />;
}
