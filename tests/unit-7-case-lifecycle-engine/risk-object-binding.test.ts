import { describe, it, expect } from 'vitest';
import {
  bindRiskObject,
  BINDING_OUTCOMES,
} from '../../packages/contracts/src/engines/risk-object-binder';
import type { BindingRequest } from '../../packages/contracts/src/engines/risk-object-binder';

/**
 * Unit 7: Risk Object Binding Engine Tests
 *
 * Validates all 5 binding outcomes:
 * - bound_new_case
 * - linked_existing_case
 * - suppressed_approved
 * - residual_risk_accepted
 * - allocation_error
 */

function makeBaseRequest(): BindingRequest {
  return {
    risk_object_id: 'ro-001',
    riskObjectType: 'vulnerability_drift',
    tenant_id: 'tenant-001',
    affected_entity_id: 'asset-001',
    affected_entity_type: 'server',
  };
}

describe('Risk Object Binding — BINDING_OUTCOMES', () => {
  it('contains exactly 5 outcomes', () => {
    expect(BINDING_OUTCOMES).toHaveLength(5);
    expect(BINDING_OUTCOMES).toContain('bound_new_case');
    expect(BINDING_OUTCOMES).toContain('linked_existing_case');
    expect(BINDING_OUTCOMES).toContain('suppressed_approved');
    expect(BINDING_OUTCOMES).toContain('residual_risk_accepted');
    expect(BINDING_OUTCOMES).toContain('allocation_error');
  });
});

describe('Risk Object Binding — bound_new_case', () => {
  it('creates a new case when all fields are valid and no existing case/suppression/acceptance', () => {
    const request = makeBaseRequest();
    const result = bindRiskObject(request);

    expect(result.success).toBe(true);
    expect(result.outcome).toBe('bound_new_case');
    expect(result.case_id).not.toBeNull();
    expect(result.case_id).toContain('tenant-001');
    expect(result.risk_object_id).toBe('ro-001');
    expect(result.error).toBeNull();
    expect(result.timestamp).toBeTruthy();
  });
});

describe('Risk Object Binding — linked_existing_case', () => {
  it('links to existing case when existingCaseId is provided', () => {
    const request: BindingRequest = {
      ...makeBaseRequest(),
      existingCaseId: 'case-existing-001',
    };
    const result = bindRiskObject(request);

    expect(result.success).toBe(true);
    expect(result.outcome).toBe('linked_existing_case');
    expect(result.case_id).toBe('case-existing-001');
    expect(result.risk_object_id).toBe('ro-001');
    expect(result.error).toBeNull();
  });
});

describe('Risk Object Binding — suppressed_approved', () => {
  it('suppresses when suppressionPolicyId is provided', () => {
    const request: BindingRequest = {
      ...makeBaseRequest(),
      suppressionPolicyId: 'policy-suppress-001',
    };
    const result = bindRiskObject(request);

    expect(result.success).toBe(true);
    expect(result.outcome).toBe('suppressed_approved');
    expect(result.case_id).toBeNull();
    expect(result.risk_object_id).toBe('ro-001');
    expect(result.error).toBeNull();
  });

  it('suppression takes priority over existing case link', () => {
    const request: BindingRequest = {
      ...makeBaseRequest(),
      suppressionPolicyId: 'policy-suppress-001',
      existingCaseId: 'case-existing-001',
    };
    const result = bindRiskObject(request);

    expect(result.outcome).toBe('suppressed_approved');
  });
});

describe('Risk Object Binding — residual_risk_accepted', () => {
  it('accepts residual risk when residualRiskAcceptanceId is provided', () => {
    const request: BindingRequest = {
      ...makeBaseRequest(),
      residualRiskAcceptanceId: 'acceptance-001',
    };
    const result = bindRiskObject(request);

    expect(result.success).toBe(true);
    expect(result.outcome).toBe('residual_risk_accepted');
    expect(result.case_id).toBeNull();
    expect(result.risk_object_id).toBe('ro-001');
    expect(result.error).toBeNull();
  });
});

describe('Risk Object Binding — allocation_error', () => {
  it('returns allocation_error when required fields are missing', () => {
    const request: BindingRequest = {
      risk_object_id: '',
      riskObjectType: 'vulnerability_drift',
      tenant_id: 'tenant-001',
      affected_entity_id: 'asset-001',
      affected_entity_type: 'server',
    };
    const result = bindRiskObject(request);

    expect(result.success).toBe(false);
    expect(result.outcome).toBe('allocation_error');
    expect(result.case_id).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('returns allocation_error when affectedEntityId is missing for new case', () => {
    const request: BindingRequest = {
      risk_object_id: 'ro-001',
      riskObjectType: 'vulnerability_drift',
      tenant_id: 'tenant-001',
      affected_entity_id: '',
      affected_entity_type: 'server',
    };
    const result = bindRiskObject(request);

    expect(result.success).toBe(false);
    expect(result.outcome).toBe('allocation_error');
    expect(result.error).toContain('affectedEntityId');
  });

  it('returns allocation_error when tenantId is missing', () => {
    const request: BindingRequest = {
      risk_object_id: 'ro-001',
      riskObjectType: 'vulnerability_drift',
      tenant_id: '',
      affected_entity_id: 'asset-001',
      affected_entity_type: 'server',
    };
    const result = bindRiskObject(request);

    expect(result.success).toBe(false);
    expect(result.outcome).toBe('allocation_error');
  });
});
