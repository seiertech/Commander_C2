/**
 * Type-Constant Completeness Tests
 *
 * Feature: platform-intelligence-ioc-distribution
 * Task: 1.2 — Assert all type constants are complete and unique
 * Requirements: 1.3, 3.3, 6.2, 7.2, 11.2, 14.1, 15.2
 */

import { describe, it, expect } from 'vitest';
import {
  PLATFORM_INTELLIGENCE_SOURCE_TYPES,
  PLATFORM_RECORD_TYPES,
  IOC_CATEGORIES,
  IOC_RELATIONSHIP_STATES,
  TLP_MARKINGS,
  CVE_STATES,
  SOURCE_FRESHNESS_STATES,
  TENANT_SUBSCRIPTION_STATES,
  EVALUATION_TYPES,
  TENANT_EXPOSURE_STATES,
  IOC_MATCH_TYPES,
  IOC_CASE_LINK_TYPES,
  THREAT_HUNT_STATUSES,
  PUSH_ACTION_TYPES,
  PUSH_INTENT_STATUSES,
  ALLOW_BLOCK_LIST_TYPES,
} from '../../packages/contracts/src/entities/intelligence-common';

describe('Intelligence type-constant completeness', () => {
  it('IOC_CATEGORIES contains all 26 indicator types', () => {
    expect(IOC_CATEGORIES).toHaveLength(26);
    const expected = [
      'file_hash_md5', 'file_hash_sha1', 'file_hash_sha256', 'file_path',
      'domain', 'fqdn', 'url', 'ip_address', 'cidr_range',
      'email_address', 'email_subject', 'sender_domain',
      'registry_key', 'process_name', 'mutex', 'certificate_thumbprint',
      'user_agent', 'yara_rule', 'sigma_rule', 'snort_suricata_rule',
      'cloud_resource_id', 'azure_ad_object_id', 'aws_account_id',
      'container_image', 'package_name', 'other',
    ];
    for (const cat of expected) {
      expect(IOC_CATEGORIES).toContain(cat);
    }
  });

  it('PLATFORM_INTELLIGENCE_SOURCE_TYPES contains all 8 source types', () => {
    expect(PLATFORM_INTELLIGENCE_SOURCE_TYPES).toHaveLength(8);
    const expected = [
      'cisa_kev', 'nvd_cve', 'vendor_advisory', 'commercial_ioc_feed',
      'misp_feed', 'stix_taxii_feed', 'inbound_email', 'manual_submission',
    ];
    for (const st of expected) {
      expect(PLATFORM_INTELLIGENCE_SOURCE_TYPES).toContain(st);
    }
  });

  it('PLATFORM_RECORD_TYPES contains all record types', () => {
    expect(PLATFORM_RECORD_TYPES).toHaveLength(5);
    expect(PLATFORM_RECORD_TYPES).toContain('cve');
    expect(PLATFORM_RECORD_TYPES).toContain('kev_entry');
    expect(PLATFORM_RECORD_TYPES).toContain('vendor_advisory');
    expect(PLATFORM_RECORD_TYPES).toContain('ioc_entry');
    expect(PLATFORM_RECORD_TYPES).toContain('composite_advisory');
  });

  it('IOC_RELATIONSHIP_STATES contains all 11 relationship states', () => {
    expect(IOC_RELATIONSHIP_STATES).toHaveLength(11);
    const expected = [
      'linked_to_cve', 'not_linked_to_cve', 'suspected_cve_link',
      'linked_to_vendor_advisory', 'linked_to_campaign', 'linked_to_malware',
      'linked_to_actor', 'linked_to_case', 'linked_to_risk_object',
      'linked_to_action', 'unclassified',
    ];
    for (const state of expected) {
      expect(IOC_RELATIONSHIP_STATES).toContain(state);
    }
  });

  it('TLP_MARKINGS contains all 5 markings', () => {
    expect(TLP_MARKINGS).toHaveLength(5);
  });

  it('CVE_STATES contains all 4 states', () => {
    expect(CVE_STATES).toHaveLength(4);
  });

  it('SOURCE_FRESHNESS_STATES contains all 4 states', () => {
    expect(SOURCE_FRESHNESS_STATES).toHaveLength(4);
  });

  it('TENANT_SUBSCRIPTION_STATES contains all 3 states', () => {
    expect(TENANT_SUBSCRIPTION_STATES).toHaveLength(3);
  });

  it('EVALUATION_TYPES contains all 3 types', () => {
    expect(EVALUATION_TYPES).toHaveLength(3);
  });

  it('TENANT_EXPOSURE_STATES contains all 8 states', () => {
    expect(TENANT_EXPOSURE_STATES).toHaveLength(8);
  });

  it('IOC_MATCH_TYPES contains all 3 match types', () => {
    expect(IOC_MATCH_TYPES).toHaveLength(3);
  });

  it('IOC_CASE_LINK_TYPES contains all 3 link types', () => {
    expect(IOC_CASE_LINK_TYPES).toHaveLength(3);
  });

  it('THREAT_HUNT_STATUSES contains all 7 statuses', () => {
    expect(THREAT_HUNT_STATUSES).toHaveLength(7);
  });

  it('PUSH_ACTION_TYPES contains all 4 action types', () => {
    expect(PUSH_ACTION_TYPES).toHaveLength(4);
  });

  it('PUSH_INTENT_STATUSES contains all 7 intent statuses', () => {
    expect(PUSH_INTENT_STATUSES).toHaveLength(7);
  });

  it('ALLOW_BLOCK_LIST_TYPES contains both allow and block', () => {
    expect(ALLOW_BLOCK_LIST_TYPES).toHaveLength(2);
    expect(ALLOW_BLOCK_LIST_TYPES).toContain('allow');
    expect(ALLOW_BLOCK_LIST_TYPES).toContain('block');
  });

  it('all type constant arrays have unique values', () => {
    const arrays = [
      IOC_CATEGORIES,
      PLATFORM_INTELLIGENCE_SOURCE_TYPES,
      PLATFORM_RECORD_TYPES,
      IOC_RELATIONSHIP_STATES,
      TLP_MARKINGS,
      CVE_STATES,
      SOURCE_FRESHNESS_STATES,
      TENANT_SUBSCRIPTION_STATES,
      EVALUATION_TYPES,
      TENANT_EXPOSURE_STATES,
      IOC_MATCH_TYPES,
      IOC_CASE_LINK_TYPES,
      THREAT_HUNT_STATUSES,
      PUSH_ACTION_TYPES,
      PUSH_INTENT_STATUSES,
      ALLOW_BLOCK_LIST_TYPES,
    ];
    for (const arr of arrays) {
      const unique = new Set(arr);
      expect(unique.size).toBe(arr.length);
    }
  });
});
