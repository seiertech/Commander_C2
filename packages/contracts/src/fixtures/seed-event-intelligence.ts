/**
 * Layer 3 Fixtures — Event & Intelligence
 *
 * Thesis §7: Signal, Finding_Event, Remediation_Event, Intelligence_Assessment
 * Standards: OCSF 1.3, NATO/Admiralty
 */

import type { Signal } from '../entities/signal';
import type { FindingEvent } from '../entities/finding-event';
import type { RemediationEvent } from '../entities/remediation-event';
import type { IntelligenceAssessment } from '../entities/intelligence-assessment';

// ─── Signal Fixtures ─────────────────────────────────────────────────────────

export const SIGNAL_FIXTURES: Signal[] = [
  {
    signal_id: 'sig-001',
    source_system: 'CrowdStrike Falcon',
    source_event_id: 'cs-evt-98765',
    ocsf_category: 'Security Finding',
    ocsf_class: 'Detection Finding',
    signal_type: 'endpoint_detection',
    severity: 4,
    time_observed: '2026-06-10T08:15:00Z',
    raw_payload: '{"detection_id":"cs-evt-98765","type":"ProcessInjection","host":"ws-fin-042"}',
    normalized_payload: '{"class_uid":2001,"category_uid":2,"severity_id":4,"activity_id":1}',
    asset_resolution_status: 'resolved',
    standard_marker: 'OCSF 1.3',
  },
  {
    signal_id: 'sig-002',
    source_system: 'Microsoft Sentinel',
    source_event_id: 'ms-inc-44231',
    ocsf_category: 'Security Finding',
    ocsf_class: 'Security Finding',
    signal_type: 'siem_alert',
    severity: 3,
    time_observed: '2026-06-10T09:22:00Z',
    raw_payload: '{"incident_id":"ms-inc-44231","title":"Suspicious sign-in from tor exit","severity":"Medium"}',
    normalized_payload: '{"class_uid":2001,"category_uid":2,"severity_id":3,"activity_id":2}',
    asset_resolution_status: 'resolved',
    standard_marker: 'OCSF 1.3',
  },
  {
    signal_id: 'sig-003',
    source_system: 'OSINT Feed - AlienVault OTX',
    source_event_id: 'otx-pulse-88712',
    ocsf_category: 'Discovery',
    ocsf_class: 'Device Inventory Info',
    signal_type: 'threat_intelligence',
    severity: 2,
    time_observed: '2026-06-10T06:00:00Z',
    raw_payload: '{"pulse_id":"otx-pulse-88712","ioc":"185.220.101.42","type":"ipv4","tags":["tor","c2"]}',
    normalized_payload: '{"class_uid":5001,"category_uid":5,"severity_id":2,"activity_id":1}',
    asset_resolution_status: 'unresolved',
    standard_marker: 'OCSF 1.3',
  },
  {
    signal_id: 'sig-004',
    source_system: 'Qualys VMDR',
    source_event_id: 'qid-379456',
    ocsf_category: 'Findings',
    ocsf_class: 'Vulnerability Finding',
    signal_type: 'vulnerability_scan',
    severity: 5,
    time_observed: '2026-06-10T02:30:00Z',
    raw_payload: '{"qid":379456,"cve":"CVE-2026-1234","cvss":9.8,"host":"db-prod-01"}',
    normalized_payload: '{"class_uid":2002,"category_uid":2,"severity_id":5,"activity_id":1}',
    asset_resolution_status: 'resolved',
    standard_marker: 'OCSF 1.3',
  },
];

// ─── Finding_Event Fixtures ──────────────────────────────────────────────────

export const FINDING_EVENT_FIXTURES: FindingEvent[] = [
  {
    finding_event_id: 'fe-001',
    signal_id: 'sig-001',
    event_family: 'Security Finding',
    title: 'Process Injection Detected on Finance Workstation',
    description: 'CrowdStrike detected process injection technique (T1055) on ws-fin-042. Process explorer.exe injected into svchost.exe.',
    normalized_severity: 4,
    threat_context: 'MITRE ATT&CK T1055 — Process Injection. Associated with credential theft and lateral movement.',
    exploitability_hint: 'Active exploitation observed in the wild',
    standard_marker: 'OCSF 1.3',
  },
  {
    finding_event_id: 'fe-002',
    signal_id: 'sig-002',
    event_family: 'Security Finding',
    title: 'Suspicious Sign-In from Tor Exit Node',
    description: 'Identity anomaly: user john.doe@acme.com authenticated from known Tor exit relay 185.220.101.42.',
    normalized_severity: 3,
    threat_context: 'Authentication from anonymisation network. Possible credential compromise or policy violation.',
    exploitability_hint: null,
    standard_marker: 'OCSF 1.3',
  },
  {
    finding_event_id: 'fe-003',
    signal_id: 'sig-004',
    event_family: 'Findings',
    title: 'Critical RCE Vulnerability on Production Database',
    description: 'CVE-2026-1234 (CVSS 9.8) — Remote code execution in PostgreSQL replication module. Affects db-prod-01.',
    normalized_severity: 5,
    threat_context: 'CVE-2026-1234 is on CISA KEV. Active exploitation confirmed by multiple vendors.',
    exploitability_hint: 'CISA KEV listed. Public exploit available. EPSS > 0.95.',
    standard_marker: 'OCSF 1.3',
  },
];

// ─── Remediation_Event Fixtures ──────────────────────────────────────────────

export const REMEDIATION_EVENT_FIXTURES: RemediationEvent[] = [
  {
    remediation_event_id: 're-001',
    related_case_id: 'case-001',
    related_action_id: 'action-001',
    outcome: 'success',
    result_state: 'isolated',
    execution_time: '2026-06-10T08:45:00Z',
    output_summary: 'Workstation ws-fin-042 isolated from network. Process killed. Forensic image captured.',
    ocsf_category: 'Remediation',
    ocsf_class: 'Remediation Activity',
    standard_marker: 'OCSF 1.3',
  },
  {
    remediation_event_id: 're-002',
    related_case_id: 'case-002',
    related_action_id: 'action-002',
    outcome: 'success',
    result_state: 'credentials_rotated',
    execution_time: '2026-06-10T10:00:00Z',
    output_summary: 'User john.doe@acme.com password reset. MFA re-enrolled. Active sessions terminated.',
    ocsf_category: 'Remediation',
    ocsf_class: 'Remediation Activity',
    standard_marker: 'OCSF 1.3',
  },
  {
    remediation_event_id: 're-003',
    related_case_id: 'case-003',
    related_action_id: 'action-003',
    outcome: 'partial',
    result_state: 'patched_pending_restart',
    execution_time: '2026-06-10T04:00:00Z',
    output_summary: 'Patch applied to db-prod-01 but service restart deferred to maintenance window.',
    ocsf_category: 'Remediation',
    ocsf_class: 'Remediation Activity',
    standard_marker: 'OCSF 1.3',
  },
];

// ─── Intelligence_Assessment Fixtures ────────────────────────────────────────

export const INTELLIGENCE_ASSESSMENT_FIXTURES: IntelligenceAssessment[] = [
  {
    intelligence_assessment_id: 'ia-001',
    signal_id: 'sig-001',
    source_reliability: 'A',
    information_credibility: 1,
    combined_rating: 'A1',
    analytic_note: 'CrowdStrike is a fully vetted, tier-1 EDR source. Detection confirmed by telemetry correlation.',
    graded_by: 'system',
    graded_time: '2026-06-10T08:15:01Z',
    standard_marker: 'NATO/Admiralty',
  },
  {
    intelligence_assessment_id: 'ia-002',
    signal_id: 'sig-003',
    source_reliability: 'C',
    information_credibility: 3,
    combined_rating: 'C3',
    analytic_note: 'OSINT feed (AlienVault OTX). Community-sourced IOC. Possibly true but not independently confirmed.',
    graded_by: 'analyst-kira',
    graded_time: '2026-06-10T06:30:00Z',
    standard_marker: 'NATO/Admiralty',
  },
  {
    intelligence_assessment_id: 'ia-003',
    signal_id: 'sig-004',
    source_reliability: 'A',
    information_credibility: 1,
    combined_rating: 'A1',
    analytic_note: 'Qualys authenticated scan. CVE confirmed on CISA KEV and NVD. High confidence.',
    graded_by: 'system',
    graded_time: '2026-06-10T02:30:01Z',
    standard_marker: 'NATO/Admiralty',
  },
  {
    intelligence_assessment_id: 'ia-004',
    signal_id: 'sig-002',
    source_reliability: 'B',
    information_credibility: 2,
    combined_rating: 'B2',
    analytic_note: 'Microsoft Sentinel usually reliable. Tor exit correlation is probably true but could be VPN misconfiguration.',
    graded_by: 'analyst-marcus',
    graded_time: '2026-06-10T09:30:00Z',
    standard_marker: 'NATO/Admiralty',
  },
];
