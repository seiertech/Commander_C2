> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# Spec #55 — Baseline Configuration, Framework, Model and Defaults

## Status
Active baseline authority for Commander SDR v2.5.

## Purpose
Define editable baseline configuration profiles so every tenant begins with a safe, governed and operationally usable configuration across risk, SLA, routing, validation, controls frameworks, rule packs, models, AI, RBAC and automation.

## Binding Doctrine
- Tenants must not start from empty configuration.
- Commander SDR must ship with baseline configuration profiles.
- Baselines are templates; tenants operate an active configuration derived from a selected template.
- Baseline templates are owned and versioned in the Commander Commercial Control Plane.
- Tenant Admin applies and customises active tenant configuration.
- Every override is versioned, audited and drift-visible.

## Baseline Layers
1. Operational Baselines
2. Governance / Control Framework Baselines
3. Model / Rule / Intelligence Baselines
4. Risk Baselines
5. AI / Commander AI Baselines
6. RBAC / Approval Baselines
7. Communication / Automation Baselines

## Baseline Template Examples
- Standard Enterprise Baseline
- High-Security Baseline
- Military-Intelligence High Assurance Baseline
- Observer / Read-Only Baseline
- Demo / Trial Baseline
- Cloud-First Baseline
- Vulnerability Emergency Baseline
- Identity Hardening Baseline
- Ransomware Resilience Baseline

## Risk Baselines
Risk baseline profiles must cover:
- Risk Taxonomy
- Risk Classes
- Risk Severity Bands
- Risk Priority Bands
- Risk Scoring Model
- Risk Appetite Defaults
- Risk Tolerance Thresholds
- Risk Acceptance Rules
- Residual Risk Rules
- Security Debt Rules
- Compensating Control Rules
- Control Framework Mapping
- Mission Impact Weighting
- Blast Radius Weighting
- Exposure Weighting
- Exploitability Weighting
- Asset Criticality Weighting
- Identity Privilege Weighting
- Source Confidence Weighting
- Data Freshness Weighting
- Closure Gate Risk Rules
- Reopening Risk Rules
- Risk Reporting Defaults
- Risk Drift From Baseline

## Control Framework Baselines
Commander SDR baseline profiles may include:
- ISO 27001 mapping
- NIST CSF mapping
- CIS Controls mapping
- MITRE ATT&CK mapping
- AWS Well-Architected Security Pillar mapping
- Azure/Microsoft security baseline mapping
- CTEM operating model
- Zero Trust maturity model
- Ransomware resilience baseline
- Identity security baseline
- Cloud security baseline
- Vulnerability management baseline
- Military/intelligence assurance baseline

Control framework baselines define:
- control objectives
- evidence requirements
- closure evidence defaults
- validation expectations
- governance cadence
- reporting outputs
- compliance mapping fields

## Operational Baseline Defaults
Baseline profiles may define defaults for:
- SLA profiles
- routing profiles
- P0 Zero-Day profile
- validation windows
- closure gates
- reopening triggers
- communication cadence
- automation boundaries
- RBAC templates
- approval matrices
- notification rules
- exception rules
- suppression rules

## Rule / Model Defaults
Baseline profiles may include:
- active rule packs
- drift rule defaults
- exposure rule defaults
- vulnerability rule defaults
- identity rule defaults
- control rule defaults
- P0 trigger rules
- risk scoring model
- prioritisation model
- routing model
- validation model
- closure/reopening model
- Fusion Map relationship model
- source confidence model

## AI Defaults
Baseline profiles may include:
- Commander AI enabled/disabled
- allowed AI actions
- recommendation-only mode
- model routing profile
- prompt/grounding pack
- usage limits
- approval mode
- case context access
- email thread access
- AI audit requirements

## Tenant Active Configuration
Tenant active configuration stores:
- selected baseline template
- active values
- local overrides
- override reasons
- approvals
- version history
- baseline drift
- reset-to-baseline options

## Baseline Drift
Commander SDR must show drift from selected baseline:
- changed settings
- relaxed thresholds
- disabled controls
- changed SLA
- changed P0 triggers
- changed AI/action boundaries
- changed framework evidence requirements
- changed risk appetite/tolerance

Baseline drift is itself a governance signal and may become a risk object when configured.

## Commercial Control Plane Ownership
Commercial Control Plane owns:
- baseline template registry
- template versions
- industry packs
- high-security packs
- military/intelligence packs
- demo/trial packs
- tenant template allocation
- template rollback

## Tenant Admin Ownership
Tenant Admin owns:
- active baseline selection
- tenant overrides
- review required items
- baseline drift review
- reset to baseline
- override approval workflow

## Required Routes
Tenant Admin:
- `/admin/baseline/active`
- `/admin/baseline/templates`
- `/admin/baseline/risk`
- `/admin/baseline/frameworks`
- `/admin/baseline/models`
- `/admin/baseline/rules`
- `/admin/baseline/ai`
- `/admin/baseline/rbac`
- `/admin/baseline/drift`
- `/admin/baseline/history`

Commercial Control Plane:
- `/commercial/baselines/templates`
- `/commercial/baselines/risk`
- `/commercial/baselines/frameworks`
- `/commercial/baselines/models`
- `/commercial/baselines/rules`
- `/commercial/baselines/allocation`
- `/commercial/baselines/versioning`
- `/commercial/baselines/rollback`

---

# v2.6 Extension — Baseline Configuration Addendum

**Extension version:** v2.6.0
**Extension date:** May 2026
**Extension scope:** Adds all v2.6 configurable parameters with system defaults. All existing baseline configuration above this section remains in force unchanged.

## V2.6-1. Verdict Pattern Detection Parameters

| Parameter | Default Value | Description | Scope |
|---|---|---|---|
| `verdict_pattern.peer_deviation_threshold` | 2.5 (standard deviations) | Z-score threshold for peer-deviation detection | Per identity scope |
| `verdict_pattern.peer_deviation_window_hours` | 168 (7 days) | Time window for peer comparison | Per identity scope |
| `verdict_pattern.temporal_clustering_min_events` | 5 | Minimum verdict events to trigger temporal clustering check | Per identity scope |
| `verdict_pattern.temporal_clustering_window_minutes` | 60 | Window for temporal clustering | Per identity scope |
| `verdict_pattern.geographic_anomaly_distance_km` | 500 | Distance from normal location for geographic anomaly | Per identity scope |
| `verdict_pattern.policy_concentration_threshold` | 10 | Verdict count from single policy in window to trigger concentration check | Per identity scope |
| `verdict_pattern.policy_concentration_window_hours` | 24 | Window for policy concentration | Per identity scope |
| `verdict_pattern.minimum_baseline_days` | 14 | Minimum days of verdict history required before pattern detection runs (cold start protection) | Per identity scope |

## V2.6-2. Verdict Semantics Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `verdict_semantics.trust_calibration_window_days` | 30 | Window for trust calibration computation |
| `verdict_semantics.density_aggregation_window_minutes` | 60 | Default density aggregation window |
| `verdict_semantics.disagreement_threshold_seconds` | 300 | Maximum time window between conflicting verdicts to detect disagreement |
| `verdict_semantics.hot_storage_hours` | 72 | Hot tier verdict retention |
| `verdict_semantics.warm_storage_days` | 30 | Warm tier verdict retention |
| `verdict_semantics.cold_storage_days` | 365 | Cold tier verdict retention |

## V2.6-3. Pre-Warned Classification Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `pre_warned.confidence_threshold_pre_warned` | 0.75 | Confidence threshold to classify as Pre-Warned |
| `pre_warned.confidence_threshold_protected` | 0.75 | Confidence threshold to classify as Protected |
| `pre_warned.novel_default_when_below_threshold` | true | When confidence below both thresholds, default to Novel |
| `pre_warned.audit_retention_years` | 7 | Audit retention for pre-warned classifications |
| `pre_warned.posture_lookback_days` | 90 | How far back to look for posture knowledge of the affected entity |

## V2.6-4. Inverse Discovery Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `inverse_discovery.minimum_reference_count` | 1 | Minimum external signal references required before opening Coverage Blindspot case |
| `inverse_discovery.deduplication_window_hours` | 24 | Window for deduplicating multiple references to same unknown entity |
| `inverse_discovery.root_cause_classifier_confidence` | 0.6 | Minimum confidence for auto-classifying root cause |

## V2.6-5. OODA Phase Health Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `ooda.tempo_degradation_threshold_factor` | 0.7 | Phase health below `baseline × this_factor` triggers degradation |
| `ooda.tempo_degradation_sustained_window_hours` | 12 | Sustained window required before opening OODA Tempo Degradation case |
| `ooda.tempo_degradation_recovery_window_hours` | 6 | Recovery window required before closing OODA Tempo Degradation case |
| `ooda.phase_health_observe_weight_connector_freshness` | 0.3 | Observe phase health weight: connector freshness |
| `ooda.phase_health_observe_weight_signal_volume` | 0.2 | Observe phase health weight: signal volume |
| `ooda.phase_health_observe_weight_coverage_completeness` | 0.3 | Observe phase health weight: coverage completeness |
| `ooda.phase_health_observe_weight_inverse_discovery_rate` | 0.2 | Observe phase health weight: inverse discovery rate (inverted) |
| `ooda.baseline_window_days` | 30 | Window for computing phase health baseline |

(Additional Orient/Decide/Act weight parameters follow the same pattern. Full list in the Tenant Configuration Registry.)

## V2.6-6. Policy Effectiveness Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `policy_effectiveness.override_rate_threshold` | 0.20 | Override rate above this triggers Policy Effectiveness case |
| `policy_effectiveness.override_rate_window_days` | 30 | Window for override rate measurement |
| `policy_effectiveness.zero_fire_window_days` | 90 | Window after which zero-fire is anomalous |
| `policy_effectiveness.minimum_baseline_days` | 30 | Minimum days of policy operation before effectiveness checks run |

## V2.6-7. Context-Aware Drift Priority Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `context_priority.kill_switch` | false | Master kill switch for context-aware modulation |
| `context_priority.kill_switch_max_duration_days` | 7 | Maximum duration kill switch can be on before requiring re-enable |
| `context_priority.active_attack_boost` | 2.0 | Priority boost multiplier when active attack on same entity |
| `context_priority.adjacent_attack_boost` | 1.5 | Priority boost when active attack on adjacent entity |
| `context_priority.threat_intel_relevance_boost` | 1.3 | Priority boost when threat intel match |
| `context_priority.decay_half_life_days` | 14 | Decay half-life for attack context relevance |

## V2.6-8. Internal Operating Picture Sensitivity Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `internal_op_picture.default_mode` | aggregate_only | Default visualisation mode (aggregate_only / per_identity_with_ir_auth) |
| `internal_op_picture.per_identity_unlock_requires` | internal_risk_authority | RBAC requirement to unlock per-identity detail |
| `internal_op_picture.peer_deviation_visualisation_threshold` | 1.5 | Z-score threshold for peer-deviation visualisation |

## V2.6-9. Identity Intelligence Surface Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `identity_intelligence.risk_score_verdict_weight` | 0.05 | Weight of verdict pattern divergence in identity risk score (conservative default) |
| `identity_intelligence.behavioural_section_visible_to` | internal_risk_authority | RBAC requirement to view behavioural intelligence section |
| `identity_intelligence.case_history_lookback_days` | 365 | How far back to show case history |

## V2.6-10. Connector Conformance Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `connector.conformance.certified_test_interval_hours` | 24 | How often certified connectors run conformance tests |
| `connector.conformance.degraded_alert_threshold` | 3 | Consecutive failed conformance tests before degraded status |
| `connector.multi_class.allowed` | true | Allow connectors to declare against multiple classes |

## V2.6-11. Internal Risk Investigation Sub-Lifecycle Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `internal_risk.ingestion_enabled` | true | Whether Internal Behavioural Intelligence stream is ingested at all (jurisdictional disable option) |
| `internal_risk.works_council_notification_required` | false | Flag for jurisdictions requiring Works Council consultation |
| `internal_risk.case_visibility_default_roles` | [internal_risk_lead, internal_risk_analyst, ciso] | Default roles with Verdict Pattern case visibility |
| `internal_risk.audit_of_access_enabled` | true | Whether to audit every access to verdict pattern data |
| `internal_risk.evidence_retention_years` | 3 | Retention for Verdict Pattern case evidence |

## V2.6-12. Configuration Governance

All v2.6 parameters follow the existing configuration governance model:

- System defaults at build (above)
- Tenant-customisable via Tenant Admin surface
- Versioned per Tenant Configuration Registry
- Audited on every change
- Governed by Commercial Control Plane baseline profile authority
- Kill switches and emergency reset paths per existing doctrine

## V2.6-13. Pilot Configuration Recommendations

For pilot deployments of v2.6 capabilities, recommended initial configuration:

- Start with `internal_risk.ingestion_enabled = false` until customer confirms jurisdictional and works-council readiness.
- Use conservative thresholds for verdict pattern detection initially (raise pattern detection thresholds 25-50% above defaults during first 30 days).
- Enable pre-warned classification audit logging immediately (the audit trail is itself valuable evidence).
- Enable Silent Defence Reporting immediately — high-value early demonstration of Commander's intelligence aperture.
- Keep `context_priority.kill_switch` off initially; consider enabling temporarily during major operational events.
- Calibrate OODA phase health baselines over the first 30 days before activating OODA Tempo Degradation case generation.

