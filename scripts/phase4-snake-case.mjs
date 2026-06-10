#!/usr/bin/env node
/**
 * Phase 4: camelCase → snake_case field rename across contracts layer
 * 
 * Scope: entities/, fixtures/, engines/, resolvers/, profiles/, knowledge/
 * Convention: thesis is LAW, snake_case fields, adherence not compliance.
 * 
 * This script does a comprehensive rename of all camelCase property/field
 * names to snake_case throughout the contracts package.
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const ROOT = '/projects/sandbox/Commander_C2/packages/contracts/src';

// ─── Comprehensive camelCase → snake_case mapping ────────────────────────────
// Built from actual field usage analysis. Ordered by frequency.
const FIELD_MAP = {
  // CommonFields
  'entityType': 'entity_type',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'sourceSystem': 'source_system',
  'importRunId': 'import_run_id',
  'sourceTimestamp': 'source_timestamp',
  'connectorId': 'connector_id',
  'tenantId': 'tenant_id',
  'tenantName': 'tenant_name',

  // Case fields
  'caseRef': 'case_ref',
  'caseType': 'case_type',
  'caseId': 'case_id',
  'relatedEntities': 'related_entities',
  'surfaceAttribution': 'surface_attribution',
  'targetDate': 'target_date',
  'closedAt': 'closed_at',
  'actionDecomposition': 'action_decomposition',
  'coimCategory': 'coim_category',
  'coimSubCategory': 'coim_sub_category',
  'coimImpactScore': 'coim_impact_score',
  'coimConfidence': 'coim_confidence',
  'coimAttackMapping': 'coim_attack_mapping',
  'sourceClassification': 'source_classification',
  'sourceSeverity': 'source_severity',
  'sourceConfidence': 'source_confidence',
  'sourceProduct': 'source_product',
  'sourceFindingUid': 'source_finding_uid',
  'sourceActivity': 'source_activity',
  'severityLevel': 'severity_level',
  'severityId': 'severity_id',
  'confidenceLevel': 'confidence_level',
  'confidenceScore': 'confidence_score',
  'connectorClass': 'connector_class',
  'findingClass': 'finding_class',

  // Asset fields
  'lifecycleState': 'lifecycle_state',
  'networkPosition': 'network_position',
  'hasEdr': 'has_edr',
  'hasVulnScan': 'has_vuln_scan',
  'hasPatchManagement': 'has_patch_management',
  'hasBackup': 'has_backup',
  'associatedAssets': 'associated_assets',
  'riskScore': 'risk_score',
  'displayName': 'display_name',

  // Identity fields
  'sourceSystemLineage': 'source_system_lineage',

  // Connector fields
  'sourceType': 'source_type',
  'lastRunAt': 'last_run_at',
  'lastRunStatus': 'last_run_status',
  'mappingPackVersion': 'mapping_pack_version',

  // Strategy fields
  'surfaceType': 'surface_type',
  'policyVersion': 'policy_version',
  'effectiveFrom': 'effective_from',
  'effectiveUntil': 'effective_until',
  'simulationRef': 'simulation_ref',
  'proposedBy': 'proposed_by',
  'proposedAt': 'proposed_at',
  'approvedBy': 'approved_by',
  'approvedAt': 'approved_at',

  // Risk Object fields
  'affectedEntityId': 'affected_entity_id',
  'affectedEntityType': 'affected_entity_type',
  'affectedEntities': 'affected_entities',
  'treatmentState': 'treatment_state',
  'expiryOrReviewTrigger': 'expiry_or_review_trigger',
  'firstDetectedAt': 'first_detected_at',
  'lastConfirmedAt': 'last_confirmed_at',
  'normalisedAt': 'normalised_at',

  // Event fields
  'entityRef': 'entity_ref',
  'eventType': 'event_type',

  // Evidence fields
  'collectedAt': 'collected_at',
  'evidenceType': 'evidence_type',
  'retentionPolicy': 'retention_policy',
  'expiresAt': 'expires_at',

  // Mission fields
  'progressPercent': 'progress_percent',
  'targetMet': 'target_met',

  // SLA fields
  'responseHours': 'response_hours',
  'escalationCadenceMinutes': 'escalation_cadence_minutes',

  // Pulse fields
  'teamOrAnalyst': 'team_or_analyst',
  'openCases': 'open_cases',
  'highPriorityCases': 'high_priority_cases',
  'slaBreachedCases': 'sla_breached_cases',
  'workloadBand': 'workload_band',
  'hoursSinceLastClosure': 'hours_since_last_closure',
  'escalationQueueDepth': 'escalation_queue_depth',
  'snapshotAt': 'snapshot_at',
  'pendingValidation': 'pending_validation',
  'failedValidation': 'failed_validation',
  'closureBlockers': 'closure_blockers',
  'activeRiskObjects': 'active_risk_objects',
  'meanResolutionHours': 'mean_resolution_hours',

  // System Pulse
  'connectorHealth': 'connector_health',
  'activeConnectors': 'active_connectors',
  'failedConnectors': 'failed_connectors',
  'ruleEngineStatus': 'rule_engine_status',
  'rulesActive': 'rules_active',
  'rulesDisabled': 'rules_disabled',
  'queueDepth': 'queue_depth',
  'processingLatencyMs': 'processing_latency_ms',
  'ingestionEventsPerMinute': 'ingestion_events_per_minute',

  // Platform fields
  'ruleType': 'rule_type',
  'lastTriggeredAt': 'last_triggered_at',
  'triggerCount': 'trigger_count',
  'modelType': 'model_type',
  'falsePositiveRate': 'false_positive_rate',
  'lastEvaluatedAt': 'last_evaluated_at',
  'executionCount': 'execution_count',
  'lastExecutedAt': 'last_executed_at',
  'requiresApproval': 'requires_approval',
  'featureKey': 'feature_key',
  'displayName': 'display_name',
  'controlScope': 'control_scope',

  // Action fields
  'actionType': 'action_type',
  'parentActionId': 'parent_action_id',
  'completedAt': 'completed_at',
  'assignedTo': 'assigned_to',
  'assignedAt': 'assigned_at',
  'dueDate': 'due_date',

  // Control Framework fields
  'frameworkId': 'framework_id',
  'controlId': 'control_id',
  'requirementId': 'requirement_id',
  'evaluationId': 'evaluation_id',
  'evaluatedAt': 'evaluated_at',
  'evaluatedBy': 'evaluated_by',
  'mappingId': 'mapping_id',
  'sourceFrameworkId': 'source_framework_id',
  'targetFrameworkId': 'target_framework_id',
  'sourceControlId': 'source_control_id',
  'targetControlId': 'target_control_id',
  'lastAssessedAt': 'last_assessed_at',
  'controlCount': 'control_count',
  'licenceType': 'licence_type',
  'publishedBy': 'published_by',

  // Report fields
  'reportType': 'report_type',
  'generatedAt': 'generated_at',
  'generatedBy': 'generated_by',
  'reportPeriod': 'report_period',
  'outputFormat': 'output_format',

  // Decision Record fields
  'decisionType': 'decision_type',
  'decidedBy': 'decided_by',
  'decidedAt': 'decided_at',
  'decisionRef': 'decision_ref',
  'contextSnapshot': 'context_snapshot',
  'impactAssessment': 'impact_assessment',

  // Topology fields
  'nodeCount': 'node_count',
  'edgeCount': 'edge_count',
  'generatedFrom': 'generated_from',

  // Notification fields
  'channelType': 'channel_type',
  'sentAt': 'sent_at',
  'readAt': 'read_at',
  'relatedEntity': 'related_entity',

  // Communication fields
  'threadId': 'thread_id',
  'threadType': 'thread_type',
  'channelId': 'channel_id',
  'participantRoles': 'participant_roles',
  'messageCount': 'message_count',
  'lastMessageAt': 'last_message_at',
  'playbookId': 'playbook_id',
  'playbookType': 'playbook_type',
  'templateVersion': 'template_version',
  'requiredApprovals': 'required_approvals',

  // War Room
  'activatedAt': 'activated_at',
  'deactivatedAt': 'deactivated_at',
  'activatedBy': 'activated_by',
  'memberCount': 'member_count',
  'escalationLevel': 'escalation_level',

  // Exposure fields
  'exposureVector': 'exposure_vector',
  'blastZone': 'blast_zone',
  'coverageGaps': 'coverage_gaps',
  'detectedAt': 'detected_at',
  'remediatedAt': 'remediated_at',

  // Customer / Deployment / Licence
  'deploymentId': 'deployment_id',
  'deployedAt': 'deployed_at',
  'deployedBy': 'deployed_by',
  'customerId': 'customer_id',
  'accountType': 'account_type',
  'onboardedAt': 'onboarded_at',
  'primaryContact': 'primary_contact',
  'licenceId': 'licence_id',
  'validFrom': 'valid_from',
  'validUntil': 'valid_until',
  'maxUsers': 'max_users',
  'maxAssets': 'max_assets',

  // Entitlement
  'entitlementId': 'entitlement_id',
  'entitlementType': 'entitlement_type',
  'grantedAt': 'granted_at',
  'grantedBy': 'granted_by',
  'expiresAt': 'expires_at',

  // Tenant Config
  'configKey': 'config_key',
  'configValue': 'config_value',
  'setBy': 'set_by',
  'setAt': 'set_at',

  // Support Operation
  'operationType': 'operation_type',
  'requestedBy': 'requested_by',
  'requestedAt': 'requested_at',
  'resolvedAt': 'resolved_at',
  'resolvedBy': 'resolved_by',

  // Auth Session
  'sessionId': 'session_id',
  'userId': 'user_id',
  'startedAt': 'started_at',
  'expiresAt': 'expires_at',
  'lastActivityAt': 'last_activity_at',
  'ipAddress': 'ip_address',
  'userAgent': 'user_agent',

  // RBAC
  'policyId': 'policy_id',
  'policyName': 'policy_name',
  'roleId': 'role_id',
  'roleName': 'role_name',
  'permissionSet': 'permission_set',

  // Case Follow
  'followedAt': 'followed_at',
  'followedBy': 'followed_by',

  // Case Transition Audit
  'transitionId': 'transition_id',
  'fromState': 'from_state',
  'toState': 'to_state',
  'transitionedAt': 'transitioned_at',
  'transitionedBy': 'transitioned_by',

  // Teams Decision Events
  'eventId': 'event_id',
  'decisionOutcome': 'decision_outcome',
  'decisionContext': 'decision_context',

  // Cloud Security Posture
  'cloudProvider': 'cloud_provider',
  'accountId': 'account_id',
  'regionId': 'region_id',
  'postureScore': 'posture_score',

  // Findings
  'findingId': 'finding_id',
  'findingType': 'finding_type',
  'foundAt': 'found_at',
  'resolvedAt': 'resolved_at',

  // Blast Radius
  'blastRadiusId': 'blast_radius_id',
  'impactedAssets': 'impacted_assets',
  'impactedServices': 'impacted_services',
  'computedAt': 'computed_at',

  // Break Glass
  'requestId': 'request_id',
  'requestedAt': 'requested_at',
  'requestedBy': 'requested_by',
  'justification': 'justification',
  'approvedAt': 'approved_at',
  'approvedBy': 'approved_by',
  'expiresAt': 'expires_at',
  'revokedAt': 'revoked_at',

  // IOC
  'iocType': 'ioc_type',
  'iocValue': 'ioc_value',
  'firstSeenAt': 'first_seen_at',
  'lastSeenAt': 'last_seen_at',

  // Intelligence
  'assessmentId': 'assessment_id',
  'assessedAt': 'assessed_at',
  'assessedBy': 'assessed_by',
  'intelligenceType': 'intelligence_type',

  // Vulnerability Intelligence
  'cveId': 'cve_id',
  'publishedAt': 'published_at',
  'epssScore': 'epss_score',
  'cvssScore': 'cvss_score',
  'exploitMaturity': 'exploit_maturity',
  'patchAvailable': 'patch_available',

  // Inbound Email
  'receivedAt': 'received_at',
  'processedAt': 'processed_at',
  'fromAddress': 'from_address',
  'toAddress': 'to_address',
  'subjectLine': 'subject_line',

  // Posture
  'postureId': 'posture_id',
  'assetId': 'asset_id',
  'postureStatus': 'posture_status',
  'assessmentTime': 'assessment_time',
  'patchStatus': 'patch_status',
  'vulnerabilityExposure': 'vulnerability_exposure',
  'monitoringCoverage': 'monitoring_coverage',
  'responseReadiness': 'response_readiness',
  'recoveryReadiness': 'recovery_readiness',
  'governanceStatus': 'governance_status',

  // Mission Binding
  'bindingId': 'binding_id',
  'missionId': 'mission_id',
  'boundAt': 'bound_at',
  'boundBy': 'bound_by',

  // Search Config
  'indexName': 'index_name',
  'indexType': 'index_type',
  'refreshInterval': 'refresh_interval',

  // Governed Compose
  'composeId': 'compose_id',
  'draftedBy': 'drafted_by',
  'draftedAt': 'drafted_at',

  // Pre-Warned Classification
  'classificationId': 'classification_id',
  'classifiedAt': 'classified_at',
  'classifiedBy': 'classified_by',

  // Push Governance
  'pushId': 'push_id',
  'initiatedAt': 'initiated_at',
  'initiatedBy': 'initiated_by',
  'completedAt': 'completed_at',
  'targetSystem': 'target_system',

  // Vendor Advisory
  'advisoryId': 'advisory_id',
  'publishedDate': 'published_date',
  'vendorName': 'vendor_name',

  // Simulation
  'simulationId': 'simulation_id',
  'startedAt': 'started_at',
  'completedAt': 'completed_at',
  'simulationType': 'simulation_type',

  // Stix Bundle
  'bundleId': 'bundle_id',
  'ingestedAt': 'ingested_at',
  'objectCount': 'object_count',

  // Direction Board
  'boardId': 'board_id',
  'boardType': 'board_type',

  // Threat Hunt
  'huntId': 'hunt_id',
  'huntType': 'hunt_type',
  'startedAt': 'started_at',
  'completedAt': 'completed_at',

  // Phishing
  'reportedAt': 'reported_at',
  'reportedBy': 'reported_by',
  'analysedAt': 'analysed_at',

  // Detonation
  'verdictId': 'verdict_id',
  'submittedAt': 'submitted_at',
  'completedAt': 'completed_at',

  // Inverse Discovery
  'discoveryId': 'discovery_id',
  'discoveredAt': 'discovered_at',

  // Observable
  'observableType': 'observable_type',
  'observableValue': 'observable_value',
  'observedAt': 'observed_at',

  // Posture Metrics
  'metricId': 'metric_id',
  'metricType': 'metric_type',
  'computedAt': 'computed_at',

  // Posture Accountability
  'accountabilityId': 'accountability_id',

  // Case Strategy Binding (already snake_case in thesis)

  // Analytics
  'analyticsId': 'analytics_id',
  'computedAt': 'computed_at',
  'metricName': 'metric_name',
  'metricValue': 'metric_value',

  // Platform Intelligence Source
  'sourceId': 'source_id',
  'sourceUrl': 'source_url',
  'lastFetchedAt': 'last_fetched_at',

  // Risk Scores
  'scoreId': 'score_id',
  'scoredAt': 'scored_at',
  'scoringModel': 'scoring_model',

  // Tenant Intelligence
  'subscriptionId': 'subscription_id',
  'subscribedAt': 'subscribed_at',
  'evaluationId': 'evaluation_id',
  'evaluatedAt': 'evaluated_at',
  'matchId': 'match_id',
  'matchedAt': 'matched_at',

  // Allow/Block
  'entryId': 'entry_id',
  'entryType': 'entry_type',
  'addedAt': 'added_at',
  'addedBy': 'added_by',

  // Vulnerability Case Link
  'linkId': 'link_id',
  'linkedAt': 'linked_at',
  'linkedBy': 'linked_by',

  // Standards Field Mapping
  'fieldPath': 'field_path',
  'standardRef': 'standard_ref',
  'mappedBy': 'mapped_by',
};

// ─── Helper: apply rename map to file content ────────────────────────────────
function applyRenames(content) {
  // Sort by length descending to avoid partial matches (e.g. "sourceSystem" before "source")
  const sorted = Object.entries(FIELD_MAP).sort((a, b) => b[0].length - a[0].length);
  
  for (const [camel, snake] of sorted) {
    // Match the camelCase word as a property key or reference:
    // - Object key: `camelCase:` or `camelCase?:`
    // - Interface property: `camelCase:` or `camelCase?:`
    // - Dot access: `.camelCase`
    // - Destructure: `{ camelCase }` or `{ camelCase, ... }`
    // - String literal references in documentation are left alone
    
    // Property definition/object key: word followed by optional ? then :
    const propRegex = new RegExp(`\\b${camel}(\\??\\s*:)`, 'g');
    content = content.replace(propRegex, `${snake}$1`);
    
    // Dot access: .camelCase (not followed by another word char that would make it a different identifier)
    const dotRegex = new RegExp(`\\.${camel}\\b`, 'g');
    content = content.replace(dotRegex, `.${snake}`);
    
    // Standalone identifier (variable reference, destructuring, etc.)
    // Be careful not to rename import/export names, function names, or type names
    // Only rename when it appears as a property access context
    // This handles: obj[camelCase], { camelCase }, camelCase (when preceded by , or { or ( )
    const destructRegex = new RegExp(`([{,]\\s*)${camel}(\\s*[},])`, 'g');
    content = content.replace(destructRegex, `$1${snake}$2`);
    
    // Also handle: `key === 'camelCase'` patterns in string comparisons of field names
    // And map-style lookups: map[status] patterns where the key is a field name
  }
  
  return content;
}

// ─── Find all TypeScript files in contracts package ──────────────────────────
const dirs = ['entities', 'fixtures', 'engines', 'resolvers', 'profiles', 'knowledge'];
const allFiles = [];

for (const dir of dirs) {
  try {
    const files = execSync(`find ${ROOT}/${dir} -name "*.ts"`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    allFiles.push(...files);
  } catch (e) {
    // directory might not exist
  }
}

// Also include the contracts index.ts
allFiles.push(`${ROOT}/index.ts`);

console.log(`Found ${allFiles.length} files to process`);

let changedCount = 0;

for (const filePath of allFiles) {
  const original = readFileSync(filePath, 'utf8');
  const converted = applyRenames(original);
  
  if (converted !== original) {
    writeFileSync(filePath, converted);
    changedCount++;
  }
}

console.log(`Converted ${changedCount} files from camelCase to snake_case`);

// ─── Phase 4b: Also convert UI layer field references ────────────────────────
console.log('\n--- Phase 4b: Converting UI layer field references ---');

const uiFiles = execSync(
  'find apps/web/src -name "*.tsx" -o -name "*.ts"',
  { cwd: '/projects/sandbox/Commander_C2', encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

console.log(`Found ${uiFiles.length} UI files to check`);

let uiChanged = 0;
for (const relFile of uiFiles) {
  const filePath = `/projects/sandbox/Commander_C2/${relFile}`;
  const original = readFileSync(filePath, 'utf8');
  const converted = applyRenames(original);
  if (converted !== original) {
    writeFileSync(filePath, converted);
    uiChanged++;
  }
}

console.log(`Converted ${uiChanged} UI files`);
