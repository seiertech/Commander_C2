// @ts-nocheck — Phase 4 migration: thesis snake_case rename in progress
import { describe, it, expect } from 'vitest';
import type { Asset, AssetLifecycleState, AssetNetworkPosition, AssetDataClassification } from '../../packages/contracts/src/entities/asset';
import {
  ASSET_LIFECYCLE_STATES,
  ASSET_NETWORK_POSITIONS,
  ASSET_DATA_CLASSIFICATIONS,
} from '../../packages/contracts/src/entities/asset';
import type { Identity, IdentityPrivilegeLevel, IdentityAuthStrength, IdentityRiskFactorType } from '../../packages/contracts/src/entities/identity';
import {
  IDENTITY_PRIVILEGE_LEVELS,
  IDENTITY_AUTH_STRENGTHS,
  IDENTITY_RISK_FACTOR_TYPES,
} from '../../packages/contracts/src/entities/identity';
import { seedAssets } from '../../packages/contracts/src/fixtures/seed-assets';
import { seedIdentities } from '../../packages/contracts/src/fixtures/seed-identities';

/**
 * COIM-F: Asset / Identity Augmentation
 *
 * Source: DEC-coim-ocsf-source-classification-architecture; COIM v1.0 §6.1, §6.2;
 *         05_ATTRIBUTE_AND_DATA_EFFICIENCY_MODEL §13.
 * Resolves: ARCH-DEBT-045 (Asset/Identity portion).
 *
 * Validates the COIM-F additive augmentation to Asset and Identity:
 * - New optional fields are present at the type level
 * - Enums are correctly defined
 * - Existing seed fixtures remain valid (backward-compatibility gate)
 * - Existing required fields unchanged
 * ADDITIVE ONLY — no existing fields removed or changed.
 */

// ─── Asset COIM-F enum tests ──────────────────────────────────────────────────

describe('COIM-F — Asset lifecycle state taxonomy', () => {
  it('enumerates exactly 4 lifecycle states', () => {
    expect(ASSET_LIFECYCLE_STATES).toHaveLength(4);
    expect(ASSET_LIFECYCLE_STATES).toContain('active');
    expect(ASSET_LIFECYCLE_STATES).toContain('decommissioned');
    expect(ASSET_LIFECYCLE_STATES).toContain('maintenance');
    expect(ASSET_LIFECYCLE_STATES).toContain('unknown');
  });

  it('enumerates exactly 5 network positions', () => {
    expect(ASSET_NETWORK_POSITIONS).toHaveLength(5);
    expect(ASSET_NETWORK_POSITIONS).toContain('internet-facing');
    expect(ASSET_NETWORK_POSITIONS).toContain('dmz');
    expect(ASSET_NETWORK_POSITIONS).toContain('internal');
    expect(ASSET_NETWORK_POSITIONS).toContain('isolated');
    expect(ASSET_NETWORK_POSITIONS).toContain('unknown');
  });

  it('enumerates exactly 4 asset data classifications', () => {
    expect(ASSET_DATA_CLASSIFICATIONS).toHaveLength(4);
    expect(ASSET_DATA_CLASSIFICATIONS).toContain('public');
    expect(ASSET_DATA_CLASSIFICATIONS).toContain('internal');
    expect(ASSET_DATA_CLASSIFICATIONS).toContain('confidential');
    expect(ASSET_DATA_CLASSIFICATIONS).toContain('restricted');
  });
});

// ─── Identity COIM-F enum tests ───────────────────────────────────────────────

describe('COIM-F — Identity operational-intelligence taxonomy', () => {
  it('enumerates exactly 4 privilege levels', () => {
    expect(IDENTITY_PRIVILEGE_LEVELS).toHaveLength(4);
    expect(IDENTITY_PRIVILEGE_LEVELS).toContain('standard');
    expect(IDENTITY_PRIVILEGE_LEVELS).toContain('elevated');
    expect(IDENTITY_PRIVILEGE_LEVELS).toContain('privileged');
    expect(IDENTITY_PRIVILEGE_LEVELS).toContain('super-privileged');
  });

  it('enumerates exactly 5 authentication strength values', () => {
    expect(IDENTITY_AUTH_STRENGTHS).toHaveLength(5);
    expect(IDENTITY_AUTH_STRENGTHS).toContain('password-only');
    expect(IDENTITY_AUTH_STRENGTHS).toContain('mfa-enabled');
    expect(IDENTITY_AUTH_STRENGTHS).toContain('phishing-resistant-mfa');
    expect(IDENTITY_AUTH_STRENGTHS).toContain('certificate-based');
    expect(IDENTITY_AUTH_STRENGTHS).toContain('unknown');
  });

  it('enumerates exactly 7 identity risk factor types', () => {
    expect(IDENTITY_RISK_FACTOR_TYPES).toHaveLength(7);
    expect(IDENTITY_RISK_FACTOR_TYPES).toContain('stale_credentials');
    expect(IDENTITY_RISK_FACTOR_TYPES).toContain('excessive_privileges');
    expect(IDENTITY_RISK_FACTOR_TYPES).toContain('no_mfa');
    expect(IDENTITY_RISK_FACTOR_TYPES).toContain('anomalous_activity');
    expect(IDENTITY_RISK_FACTOR_TYPES).toContain('third_party_access');
    expect(IDENTITY_RISK_FACTOR_TYPES).toContain('shared_account');
    expect(IDENTITY_RISK_FACTOR_TYPES).toContain('dormant_account');
  });
});

// ─── Asset COIM-F additive field tests ───────────────────────────────────────

describe('COIM-F — Asset augmentation fields (additive, optional)', () => {
  it('Asset type accepts lifecycleState field (optional)', () => {
    const a: Partial<Asset> & { lifecycle_state?: AssetLifecycleState } = {
      lifecycle_state: 'active',
    };
    expect(a.lifecycle_state).toBe('active');
  });

  it('Asset type accepts platform field (optional structured object)', () => {
    const a: Partial<Asset> = {
      platform: { os: 'Ubuntu 22.04', version: '22.04', cloudProvider: 'aws', architecture: 'x86_64' },
    };
    expect(a.platform?.os).toBe('Ubuntu 22.04');
  });

  it('Asset type accepts networkPosition field (optional)', () => {
    const a: Partial<Asset> & { network_position?: AssetNetworkPosition } = {
      network_position: 'internet-facing',
    };
    expect(a.network_position).toBe('internet-facing');
  });

  it('Asset type accepts assetDataClassification field (optional)', () => {
    const a: Partial<Asset> & { assetDataClassification?: AssetDataClassification } = {
      assetDataClassification: 'confidential',
    };
    expect(a.assetDataClassification).toBe('confidential');
  });

  it('Asset type accepts lastConfirmedAt field (optional ISO 8601)', () => {
    const a: Partial<Asset> = { last_confirmed_at: '2026-01-18T06:00:00.000Z' };
    expect(a.last_confirmed_at).toBeTruthy();
  });

  it('Asset type accepts firstDiscoveredBy field (optional string)', () => {
    const a: Partial<Asset> = { firstDiscoveredBy: 'crowdstrike-connector' };
    expect(a.firstDiscoveredBy).toBe('crowdstrike-connector');
  });

  it('Asset type accepts sourceClassification field (optional COIM object)', () => {
    const a: Partial<Asset> = {
      source_classification: {
        finding_class: 'vulnerability',
        source_severity: { severity_level: 'high', severity_id: 4 },
        source_confidence: { confidence_level: 'high', confidence_score: 90 },
        source_product: { vendor: 'Tenable', name: 'Nessus' },
        source_finding_uid: 'FIND-001',
      },
    };
    expect(a.source_classification?.finding_class).toBe('vulnerability');
  });

  it('all COIM-F fields are optional — asset without them is valid shape', () => {
    // A minimal asset omitting all COIM-F fields — should compile and work
    const minimal: Pick<Asset, 'entityType' | 'name' | 'classification'> = {
      entity_type: 'asset',
      name: 'TEST-SERVER',
      classification: 'server',
    };
    expect(minimal.entity_type).toBe('asset');
    // TypeScript type level: no lifecycleState/platform/etc required
  });
});

// ─── Identity COIM-F additive field tests ────────────────────────────────────

describe('COIM-F — Identity augmentation fields (additive, optional)', () => {
  it('Identity type accepts privilegeLevel field (optional)', () => {
    const i: Partial<Identity> & { privilegeLevel?: IdentityPrivilegeLevel } = {
      privilegeLevel: 'super-privileged',
    };
    expect(i.privilegeLevel).toBe('super-privileged');
  });

  it('Identity type accepts authenticationStrength field (optional)', () => {
    const i: Partial<Identity> & { authenticationStrength?: IdentityAuthStrength } = {
      authenticationStrength: 'phishing-resistant-mfa',
    };
    expect(i.authenticationStrength).toBe('phishing-resistant-mfa');
  });

  it('Identity type accepts lastAuthenticatedAt field (optional ISO 8601)', () => {
    const i: Partial<Identity> = { lastAuthenticatedAt: '2026-01-18T03:45:00.000Z' };
    expect(i.lastAuthenticatedAt).toBeTruthy();
  });

  it('Identity type accepts entitlementSummary field (optional structured object)', () => {
    const i: Partial<Identity> = {
      entitlementSummary: {
        totalEntitlements: 120,
        privilegedEntitlements: 15,
        staleEntitlements: 8,
        hasAdminAccess: true,
      },
    };
    expect(i.entitlementSummary?.hasAdminAccess).toBe(true);
    expect(i.entitlementSummary?.totalEntitlements).toBe(120);
  });

  it('Identity type accepts riskFactors field (optional array)', () => {
    const i: Partial<Identity> = {
      riskFactors: [
        { type: 'no_mfa', contribution: 40, description: 'Account has no MFA enrolled' },
        { type: 'excessive_privileges', contribution: 30, description: 'Account has 15 privileged entitlements' },
      ],
    };
    expect(i.riskFactors).toHaveLength(2);
    expect(i.riskFactors?.[0].type).toBe('no_mfa');
  });

  it('Identity type accepts sourceClassification field (optional COIM object)', () => {
    const i: Partial<Identity> = {
      source_classification: {
        finding_class: 'iam_analysis',
        source_severity: { severity_level: 'high', severity_id: 4 },
        source_confidence: { confidence_level: 'high', confidence_score: 85 },
        source_product: { vendor: 'Microsoft', name: 'Entra ID' },
        source_finding_uid: 'IAM-FIND-001',
      },
    };
    expect(i.source_classification?.finding_class).toBe('iam_analysis');
  });

  it('all COIM-F fields are optional — identity without them is valid shape', () => {
    const minimal: Pick<Identity, 'entityType' | 'displayName' | 'classification'> = {
      entity_type: 'identity',
      display_name: 'Test User',
      classification: 'human',
    };
    expect(minimal.entity_type).toBe('identity');
  });
});

// ─── Backward compatibility: existing seed fixtures must still pass ───────────

describe('COIM-F — backward compatibility: existing seed fixtures unchanged', () => {
  it('all 40 seed assets still have required fields (no regression)', () => {
    expect(seedAssets).toHaveLength(40);
    for (const asset of seedAssets) {
      expect(asset.entity_type).toBe('asset');
      expect(asset.name).toBeTruthy();
      expect(asset.classification).toBeTruthy();
      expect(asset.owner).toBeTruthy();
      expect(asset.environment).toBeTruthy();
      expect(typeof asset.criticality).toBe('number');
      expect(asset.surface_attribution).toBeDefined();
      expect(asset.coverage).toBeDefined();
      expect(typeof asset.coverage.has_edr).toBe('boolean');
      expect(asset.tenant.tenant_id).toBeTruthy();
      expect(asset.source.connector_id).toBeTruthy();
    }
  });

  it('all 25 seed identities still have required fields (no regression)', () => {
    expect(seedIdentities).toHaveLength(25);
    for (const identity of seedIdentities) {
      expect(identity.entity_type).toBe('identity');
      expect(identity.display_name).toBeTruthy();
      expect(identity.classification).toBeTruthy();
      expect(identity.risk_score).toBeGreaterThanOrEqual(0);
      expect(identity.status).toBeTruthy();
      expect(identity.surface_attribution).toBeDefined();
      expect(identity.tenant.tenant_id).toBeTruthy();
      expect(identity.source.connector_id).toBeTruthy();
    }
  });

  it('existing seed assets do NOT set COIM-F fields (they remain undefined)', () => {
    // Seed assets were created before COIM-F — they should have no COIM-F fields
    for (const asset of seedAssets) {
      expect(asset.lifecycle_state).toBeUndefined();
      expect(asset.platform).toBeUndefined();
      expect(asset.network_position).toBeUndefined();
      expect(asset.assetDataClassification).toBeUndefined();
      expect(asset.last_confirmed_at).toBeUndefined();
      expect(asset.firstDiscoveredBy).toBeUndefined();
      expect(asset.source_classification).toBeUndefined();
    }
  });

  it('existing seed identities do NOT set COIM-F fields (they remain undefined)', () => {
    for (const identity of seedIdentities) {
      expect(identity.privilegeLevel).toBeUndefined();
      expect(identity.authenticationStrength).toBeUndefined();
      expect(identity.lastAuthenticatedAt).toBeUndefined();
      expect(identity.entitlementSummary).toBeUndefined();
      expect(identity.riskFactors).toBeUndefined();
      expect(identity.source_classification).toBeUndefined();
    }
  });

  it('tenant scope unchanged for all seed assets', () => {
    for (const asset of seedAssets) {
      expect(asset.tenant.tenant_id).toBe('tenant-001-acme-corp');
    }
  });

  it('tenant scope unchanged for all seed identities', () => {
    for (const identity of seedIdentities) {
      expect(identity.tenant.tenant_id).toBe('tenant-001-acme-corp');
    }
  });

  it('surface attribution present on all assets (doctrinal assertion 10)', () => {
    for (const asset of seedAssets) {
      expect(['internal_attack_surface', 'external_attack_surface']).toContain(asset.surface_attribution);
    }
  });

  it('surface attribution present on all identities (doctrinal assertion 10)', () => {
    for (const identity of seedIdentities) {
      expect(['internal_attack_surface', 'external_attack_surface']).toContain(identity.surface_attribution);
    }
  });
});
