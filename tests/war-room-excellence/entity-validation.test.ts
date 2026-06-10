/**
 * Unit Tests — War Room Entity Validation
 *
 * Feature: war-room-communication-excellence (WRCEP-1.0)
 * Tests: War Room entity validation — all field constraints, role membership, subscription validity
 */

import { describe, it, expect } from 'vitest';
import { validateWarRoom } from '../../packages/contracts/src/entities/war-room';
import { seedWarRooms } from '../../packages/contracts/src/fixtures/seed-war-rooms';

describe('War Room Entity Validation', () => {
  it('validates all seed War Rooms as valid', () => {
    for (const warRoom of seedWarRooms) {
      const result = validateWarRoom(warRoom);
      expect(result.valid, `War Room ${warRoom.id} should be valid: ${result.errors.join(', ')}`).toBe(true);
    }
  });

  it('rejects War Room with missing id', () => {
    const invalid = { ...seedWarRooms[0], id: '' };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('id'))).toBe(true);
  });

  it('rejects War Room with missing tenant', () => {
    const invalid = { ...seedWarRooms[0], tenant: { tenant_id: '', tenant_name: '' } };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('tenant.tenant_id'))).toBe(true);
  });

  it('rejects War Room with missing warRoomRef', () => {
    const invalid = { ...seedWarRooms[0], war_room_ref: '' };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('warRoomRef'))).toBe(true);
  });

  it('rejects War Room with invalid status', () => {
    const invalid = { ...seedWarRooms[0], status: 'invalid' as any };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('status'))).toBe(true);
  });

  it('rejects War Room with missing activationReason', () => {
    const invalid = { ...seedWarRooms[0], activation_reason: '' };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('activationReason'))).toBe(true);
  });

  it('rejects War Room with invalid activationSource', () => {
    const invalid = { ...seedWarRooms[0], activation_source: 'manual' as any };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('activationSource'))).toBe(true);
  });

  it('rejects War Room with empty boundCaseIds', () => {
    const invalid = { ...seedWarRooms[0], boundCaseIds: [] };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('boundCaseIds'))).toBe(true);
  });

  it('rejects War Room with empty membership', () => {
    const invalid = { ...seedWarRooms[0], membership: [] };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('membership'))).toBe(true);
  });

  it('rejects War Room without a senior_owner in membership', () => {
    const invalid = {
      ...seedWarRooms[0],
      membership: [
        { user_id: 'user-1', role: 'analyst' as const, joined_at: '2026-01-01T00:00:00.000Z', acknowledged_at: null, left_at: null },
      ],
    };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('senior_owner'))).toBe(true);
  });

  it('rejects War Room with invalid member role', () => {
    const invalid = {
      ...seedWarRooms[0],
      membership: [
        { user_id: 'user-1', role: 'invalid_role' as any, joined_at: '2026-01-01T00:00:00.000Z', acknowledged_at: null, left_at: null },
      ],
    };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('role'))).toBe(true);
  });

  it('rejects War Room with subscriber using invalid channel', () => {
    const invalid = {
      ...seedWarRooms[0],
      subscribers: [
        { user_id: 'user-1', channels: ['sms' as any], cadence: 'live' as const, subscribed_at: '2026-01-01T00:00:00.000Z', unsubscribed_at: null },
      ],
    };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('channel'))).toBe(true);
  });

  it('rejects War Room with subscriber using invalid cadence', () => {
    const invalid = {
      ...seedWarRooms[0],
      subscribers: [
        { user_id: 'user-1', channels: ['in_app' as const], cadence: 'weekly' as any, subscribed_at: '2026-01-01T00:00:00.000Z', unsubscribed_at: null },
      ],
    };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('cadence'))).toBe(true);
  });

  it('rejects War Room with zero cadence values', () => {
    const invalid = {
      ...seedWarRooms[0],
      communication_cadence: {
        activatedCadenceMinutes: 0,
        monitoringCadenceMinutes: 60,
        windingDownCadenceMinutes: 240,
        execUpdateCadenceMinutes: 120,
      },
    };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('activatedCadenceMinutes'))).toBe(true);
  });

  it('rejects War Room with missing seniorOwnerId', () => {
    const invalid = { ...seedWarRooms[0], seniorOwnerId: '' };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('seniorOwnerId'))).toBe(true);
  });

  it('rejects War Room with invalid aiOrientationState', () => {
    const invalid = { ...seedWarRooms[0], aiOrientationState: 'running' as any };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('aiOrientationState'))).toBe(true);
  });

  it('rejects War Room with missing auditTrailRef', () => {
    const invalid = { ...seedWarRooms[0], auditTrailRef: '' };
    const result = validateWarRoom(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('auditTrailRef'))).toBe(true);
  });
});
