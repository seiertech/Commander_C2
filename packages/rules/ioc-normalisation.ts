/**
 * IOC Normalisation — Pure Function (C1)
 *
 * Feature: platform-intelligence-ioc-distribution
 * Authority: Requirements 6.1, 6.3, 8.1, 8.3
 *
 * Per-category normalisation: case folding, defang reversal, URL/scheme/host handling,
 * IP/CIDR canonicalisation, hash lowercasing, NFC + whitespace trim.
 * Always preserves originalRawValue. Total over non-empty strings. Idempotent.
 */

import type { IocCategory } from '../contracts/src/entities/intelligence-common';

export interface NormalisationResult {
  normalisedValue: string;
  originalRawValue: string;
}

/**
 * Reverse common defanging patterns:
 * hxxp → http, hxxps → https, [.] → ., (dot) → ., [:]→:
 */
function reverseDefanging(value: string): string {
  return value
    .replace(/hxxps?/gi, (match) => match.toLowerCase().replace('xx', 'tt'))
    .replace(/\[\.\]/g, '.')
    .replace(/\(dot\)/gi, '.')
    .replace(/\[\:\]/g, ':');
}

/**
 * Normalise an IOC value according to its category.
 * Pure, deterministic, idempotent.
 */
export function normaliseIoc(category: IocCategory, rawValue: string): NormalisationResult {
  const originalRawValue = rawValue;

  // Baseline: Unicode NFC normalisation + whitespace trimming
  let normalised = rawValue.trim().normalize('NFC');

  switch (category) {
    // Hash categories → lowercase + trim
    case 'file_hash_md5':
    case 'file_hash_sha1':
    case 'file_hash_sha256':
      normalised = normalised.toLowerCase();
      break;

    // Domain-family categories → lowercase + defang reversal + trim
    case 'domain':
    case 'fqdn':
    case 'sender_domain':
      normalised = reverseDefanging(normalised).toLowerCase();
      // Remove trailing dot if present (but not if the entire value IS just a dot)
      if (normalised.endsWith('.') && normalised.length > 1) {
        normalised = normalised.slice(0, -1);
      }
      break;

    // Email addresses → lowercase + defang reversal
    case 'email_address':
      normalised = reverseDefanging(normalised).toLowerCase();
      break;

    // URLs → defang reversal, lowercase scheme + host, preserve path case
    case 'url':
      normalised = reverseDefanging(normalised);
      try {
        // Try to parse as URL to lowercase scheme+host but preserve path
        const schemeMatch = normalised.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
        if (schemeMatch) {
          const scheme = schemeMatch[1].toLowerCase();
          const rest = normalised.slice(schemeMatch[0].length);
          // Split host from path
          const slashIndex = rest.indexOf('/');
          if (slashIndex >= 0) {
            const host = rest.slice(0, slashIndex).toLowerCase();
            const path = rest.slice(slashIndex);
            normalised = `${scheme}://${host}${path}`;
          } else {
            normalised = `${scheme}://${rest.toLowerCase()}`;
          }
        } else {
          normalised = normalised.toLowerCase();
        }
      } catch {
        normalised = normalised.toLowerCase();
      }
      break;

    // IP addresses → defang reversal, trim, remove leading zeros
    case 'ip_address':
      normalised = reverseDefanging(normalised).trim();
      // Remove brackets sometimes used in defanging
      normalised = normalised.replace(/[\[\]]/g, '');
      // For IPv4: remove leading zeros from each octet
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalised)) {
        normalised = normalised.split('.').map(octet => String(parseInt(octet, 10))).join('.');
      }
      // IPv6: lowercase
      if (normalised.includes(':')) {
        normalised = normalised.toLowerCase();
      }
      break;

    // CIDR ranges → same as IP + preserve prefix length
    case 'cidr_range':
      normalised = reverseDefanging(normalised).trim();
      normalised = normalised.replace(/[\[\]]/g, '');
      // Split network/prefix
      const slashIdx = normalised.lastIndexOf('/');
      if (slashIdx >= 0) {
        let network = normalised.slice(0, slashIdx);
        const prefix = normalised.slice(slashIdx);
        // Normalise the network portion
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(network)) {
          network = network.split('.').map(octet => String(parseInt(octet, 10))).join('.');
        }
        if (network.includes(':')) {
          network = network.toLowerCase();
        }
        normalised = network + prefix;
      }
      break;

    // All other categories: NFC + trim (already applied above)
    default:
      break;
  }

  return { normalisedValue: normalised, originalRawValue };
}
