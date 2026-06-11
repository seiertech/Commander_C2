'use client';
import { StrategyConfigView } from '../strategy-config-view';

import { thesisTenantConfigs, thesisRbacPolicies, thesisConnectors, thesisRules, thesisFeatureRegistry, thesisAssets, thesisCases, thesisStrategies, thesisMissions, thesisPostures } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';/** Tenant Admin — Routing Configuration. Data: strategy.ts (routing surface) + seed-strategies */
export default function SettingsRoutingPage() {
  return <StrategyConfigView surface_type="routing" pretitle="Settings › Routing Configuration" title="Routing Strategy" />;
}
