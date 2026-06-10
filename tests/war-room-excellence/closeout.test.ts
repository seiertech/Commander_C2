/**
 * Unit Tests — War Room Close-Out Report Generation
 *
 * Feature: war-room-communication-excellence (WRCEP-1.0)
 * Tests: All sections populated, immutability contract, generated-by attribution
 */

import { describe, it, expect } from 'vitest';
import { generateCloseOutReport } from '../../packages/rules/war-room-closeout';
import { seedWarRooms } from '../../packages/contracts/src/fixtures/seed-war-rooms';

describe('War Room Close-Out Report', () => {
  const closedWarRoom = seedWarRooms[2]; // status: 'closed'

  const cases = [
    { case_id: 'case-005', case_ref: 'CASE-005', status: 'closed_by_system', priority: 'P0', resolvedAt: '2026-01-12T16:00:00.000Z' },
    { case_id: 'case-006', case_ref: 'CASE-006', status: 'closed_by_system', priority: 'P1', resolvedAt: '2026-01-12T17:00:00.000Z' },
    { case_id: 'case-007', case_ref: 'CASE-007', status: 'in_progress', priority: 'P2', resolvedAt: null },
  ];

  const auditTimeline = [
    { timestamp: '2026-01-10T06:00:00.000Z', actor: 'war-room-activation-engine', action: 'activated', detail: 'War Room activated' },
    { timestamp: '2026-01-11T10:00:00.000Z', actor: 'user-senior-001', action: 'transitioned', detail: 'Moved to monitoring' },
    { timestamp: '2026-01-12T18:00:00.000Z', actor: 'user-senior-001', action: 'closed', detail: 'War Room closed' },
  ];

  const memberParticipation = [
    { user_id: 'user-senior-001', role: 'senior_owner', joined_at: '2026-01-10T06:00:00.000Z', left_at: '2026-01-12T18:00:00.000Z', actionsCount: 5, decisionsCount: 3 },
    { user_id: 'user-coord-002', role: 'coordinator', joined_at: '2026-01-10T06:30:00.000Z', left_at: '2026-01-12T18:00:00.000Z', actionsCount: 8, decisionsCount: 1 },
  ];

  const communicationRecords = [
    { channel: 'teams_adaptive_card', direction: 'outbound' as const, timestamp: '2026-01-10T06:05:00.000Z', summary: 'Initial alert card' },
    { channel: 'email_structured', direction: 'outbound' as const, timestamp: '2026-01-10T08:00:00.000Z', summary: 'Status update' },
    { channel: 'teams', direction: 'inbound' as const, timestamp: '2026-01-10T09:00:00.000Z', summary: 'CISO response' },
  ];

  const aiRecords = [
    { briefingVersion: 1, generatedAt: '2026-01-10T06:00:00.000Z', recommendationsGenerated: 3, recommendationsActioned: 2, recommendationsDeclined: 1 },
    { briefingVersion: 2, generatedAt: '2026-01-11T10:00:00.000Z', recommendationsGenerated: 2, recommendationsActioned: 1, recommendationsDeclined: 0 },
  ];

  const decisions = [
    { decisionId: 'dec-001', description: 'Approved emergency patch', decidedBy: 'user-senior-001', decidedAt: '2026-01-10T07:00:00.000Z', outcome: 'approved' },
  ];

  const evidenceChain = [
    { evidenceId: 'ev-001', type: 'validation', description: 'Patch verification scan', collected_at: '2026-01-11T14:00:00.000Z', source: 'vulnerability-scanner' },
  ];

  it('generates report with all required sections', () => {
    const report = generateCloseOutReport(
      closedWarRoom, cases, auditTimeline, memberParticipation,
      communicationRecords, aiRecords, decisions, evidenceChain,
    );

    expect(report.warRoomRef).toBe(closedWarRoom.warRoomRef);
    expect(report.activationTimestamp).toBe(closedWarRoom.created_at);
    expect(report.closureTimestamp).toBeDefined();
    expect(report.totalDuration).toBeDefined();
    expect(report.executiveSummary).toBeDefined();
    expect(report.boundCases).toHaveLength(3);
    expect(report.timeline).toHaveLength(3);
    expect(report.membershipRecord).toHaveLength(2);
    expect(report.subscriberRecord).toHaveLength(closedWarRoom.subscribers.length);
    expect(report.decisionsRecord).toHaveLength(1);
    expect(report.evidenceChain).toHaveLength(1);
    expect(report.reportId).toBeDefined();
    expect(report.generatedAt).toBeDefined();
  });

  it('sets generatedBy to close-out-engine', () => {
    const report = generateCloseOutReport(
      closedWarRoom, cases, auditTimeline, memberParticipation,
      communicationRecords, aiRecords, decisions, evidenceChain,
    );
    expect(report.generatedBy).toBe('close-out-engine');
  });

  it('aggregates AI analysis correctly', () => {
    const report = generateCloseOutReport(
      closedWarRoom, cases, auditTimeline, memberParticipation,
      communicationRecords, aiRecords, decisions, evidenceChain,
    );
    expect(report.aiAnalysisRecord.briefingVersions).toBe(2);
    expect(report.aiAnalysisRecord.recommendationsGenerated).toBe(5); // 3 + 2
    expect(report.aiAnalysisRecord.recommendationsActioned).toBe(3); // 2 + 1
    expect(report.aiAnalysisRecord.recommendationsDeclined).toBe(1); // 1 + 0
  });

  it('aggregates communication records correctly', () => {
    const report = generateCloseOutReport(
      closedWarRoom, cases, auditTimeline, memberParticipation,
      communicationRecords, aiRecords, decisions, evidenceChain,
    );
    expect(report.communicationRecord.outbound).toBe(2);
    expect(report.communicationRecord.inbound).toBe(1);
    expect(report.communicationRecord.teams).toBe(1); // 'teams' channel
    expect(report.communicationRecord.adaptiveCards).toBe(1); // 'teams_adaptive_card'
  });

  it('generates lessons with requiresReview: true', () => {
    const report = generateCloseOutReport(
      closedWarRoom, cases, auditTimeline, memberParticipation,
      communicationRecords, aiRecords, decisions, evidenceChain,
    );
    expect(report.lessonsRecommendations.length).toBeGreaterThan(0);
    for (const lesson of report.lessonsRecommendations) {
      expect(lesson.requiresReview).toBe(true);
    }
  });

  it('includes executive summary with key metrics', () => {
    const report = generateCloseOutReport(
      closedWarRoom, cases, auditTimeline, memberParticipation,
      communicationRecords, aiRecords, decisions, evidenceChain,
    );
    expect(report.executiveSummary).toContain(closedWarRoom.warRoomRef);
    expect(report.executiveSummary).toContain('3 case(s)');
    expect(report.executiveSummary).toContain('2 resolved');
    expect(report.executiveSummary).toContain('1 decision(s)');
  });

  it('handles empty inputs gracefully', () => {
    const report = generateCloseOutReport(
      closedWarRoom, [], [], [], [], [], [], [],
    );
    expect(report.boundCases).toHaveLength(0);
    expect(report.timeline).toHaveLength(0);
    expect(report.aiAnalysisRecord.briefingVersions).toBe(0);
    expect(report.communicationRecord.outbound).toBe(0);
  });
});
