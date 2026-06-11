'use client';
import { StrategyConfigView } from '../strategy-config-view';

import { thesisTenantConfigs, thesisRbacPolicies, thesisConnectors, thesisRules, thesisFeatureRegistry, thesisAssets, thesisCases, thesisStrategies, thesisMissions, thesisPostures } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';/** Tenant Admin — SLA Configuration. Data: strategy.ts (sla surface) + seed-strategies */
export default function SettingsSlaPage() {
  return <StrategyConfigView surface_type="sla" pretitle="Settings › SLA Configuration" title="SLA Strategy" />;
}
