// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
/**
 * Seed Communication Playbooks — Deterministic Fixtures
 *
 * Feature: communications-excellence
 * 2 playbooks: vuln-notification-response, phishing-report-response.
 * Bounded condition grammar only. Synthetic data.
 */

import type { CommunicationPlaybook } from '../entities/communication-playbook';
import { seedId, SEED_TENANT, SEED_SOURCE } from './seed-tenant';

export const seedCommunicationPlaybooks: CommunicationPlaybook[] = [
  {
    id: seedId('playbook', 1),
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-playbook-engine (Mock)' },
    playbook_id: seedId('playbook', 1),
    name: 'Vulnerability Notification Response (Mock)',
    trigger: {
      case_type: 'vulnerability',
      conditions: ['always'],
    },
    steps: [
      {
        stepNumber: 1,
        channel: 'email',
        action: 'send_acknowledgement',
        template: 'vuln-ack-template-001',
        recipients: ['asset_owner'],
        delay: 'PT0S',
        condition: 'always',
      },
      {
        stepNumber: 2,
        channel: 'email',
        action: 'send_remediation_request',
        template: 'vuln-remediation-template-001',
        recipients: ['asset_owner'],
        delay: 'PT1H',
        condition: 'always',
      },
      {
        stepNumber: 3,
        channel: 'teams',
        action: 'send_escalation',
        template: 'vuln-escalation-template-001',
        recipients: ['team_lead'],
        delay: 'P1D',
        condition: 'no_response_to_step_2',
      },
      {
        stepNumber: 4,
        channel: 'email',
        action: 'send_closure_notice',
        template: 'vuln-closure-template-001',
        recipients: ['asset_owner', 'team_lead'],
        delay: 'PT0S',
        condition: 'always',
      },
    ],
    version: '1.0.0',
    status: 'active',
  },
  {
    id: seedId('playbook', 2),
    tenant: SEED_TENANT,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
    source: { ...SEED_SOURCE, source_system: 'commander-playbook-engine (Mock)' },
    playbook_id: seedId('playbook', 2),
    name: 'Phishing Report Response (Mock)',
    trigger: {
      case_type: 'threat-intelligence-estate-match',
      conditions: ["case.priority == 'P1'"],
    },
    steps: [
      {
        stepNumber: 1,
        channel: 'email',
        action: 'send_acknowledgement',
        template: 'phishing-ack-template-001',
        recipients: ['reporter'],
        delay: 'PT0S',
        condition: 'always',
      },
      {
        stepNumber: 2,
        channel: 'teams',
        action: 'send_adaptive_card',
        template: 'phishing-triage-card-001',
        recipients: ['soc_analyst'],
        delay: 'PT5M',
        condition: 'always',
      },
      {
        stepNumber: 3,
        channel: 'teams',
        action: 'post_command_bridge',
        template: 'phishing-bridge-template-001',
        recipients: ['incident_commander'],
        delay: 'PT30M',
        condition: 'no_response_to_step_2',
      },
      {
        stepNumber: 4,
        channel: 'email',
        action: 'send_closure_notice',
        template: 'phishing-closure-template-001',
        recipients: ['reporter'],
        delay: 'PT0S',
        condition: 'always',
      },
    ],
    version: '1.0.0',
    status: 'active',
  },
];
