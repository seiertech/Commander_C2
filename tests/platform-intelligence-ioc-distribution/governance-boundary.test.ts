/**
 * Phase 1 Boundary and Governance Tests
 *
 * Feature: platform-intelligence-ioc-distribution
 * Task: 17.3 — Assert absence of network/mailbox/push clients and UI/API artifacts,
 * synthetic-only fixtures, presence of DATA_DICTIONARY entries per entity.
 * Requirements: 21.4, 21.5, 26.1, 26.2, 26.3, 26.4, 26.6
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const RULES_DIR = path.resolve(__dirname, '../../packages/rules');
const ENTITIES_DIR = path.resolve(__dirname, '../../packages/contracts/src/entities');
const FIXTURES_DIR = path.resolve(__dirname, '../../packages/contracts/src/fixtures');

function readAllFilesInDir(dir: string): string {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));
  return files.map(f => fs.readFileSync(path.join(dir, f), 'utf-8')).join('\n');
}

describe('Phase 1 boundary assertions', () => {
  const rulesCode = readAllFilesInDir(RULES_DIR);
  const entitiesCode = readAllFilesInDir(ENTITIES_DIR);

  it('no network/HTTP client imports in rules package', () => {
    expect(rulesCode).not.toContain("import fetch");
    expect(rulesCode).not.toContain("import axios");
    expect(rulesCode).not.toContain("import got");
    expect(rulesCode).not.toContain("import node-fetch");
    expect(rulesCode).not.toContain("require('http')");
    expect(rulesCode).not.toContain("require('https')");
  });

  it('no mailbox/IMAP/SMTP client imports', () => {
    expect(rulesCode).not.toContain("import imap");
    expect(rulesCode).not.toContain("import nodemailer");
    expect(rulesCode).not.toContain("import smtp");
    expect(entitiesCode).not.toContain("import imap");
  });

  it('no live push/EDR/SIEM client imports', () => {
    expect(rulesCode).not.toContain("import crowdstrike");
    expect(rulesCode).not.toContain("import sentinel");
    expect(rulesCode).not.toContain("import splunk");
    // The string 'live_push_deferred' is a valid status; 'executeLivePush' would be bad
    expect(rulesCode).not.toContain("executeLivePush");
    expect(rulesCode).not.toContain("performLivePush");
  });

  it('no UI/React/Next.js imports in the intelligence layer', () => {
    expect(rulesCode).not.toContain("import React");
    expect(rulesCode).not.toContain("from 'next");
    expect(entitiesCode).not.toContain("import React");
  });

  it('no API route/endpoint definitions', () => {
    expect(rulesCode).not.toContain("app.get(");
    expect(rulesCode).not.toContain("app.post(");
    expect(rulesCode).not.toContain("router.");
    expect(rulesCode).not.toContain("express");
  });

  it('fixtures use synthetic .example domains and (Mock) markers', () => {
    const fixturesCode = readAllFilesInDir(FIXTURES_DIR);
    const intelligenceFixtures = fixturesCode.match(/seed-platform-intelligence|seed-iocs/g);
    // Our fixtures use .example domains
    const sourceFixtures = fs.readFileSync(
      path.join(FIXTURES_DIR, 'seed-platform-intelligence-sources.ts'), 'utf-8'
    );
    expect(sourceFixtures).toContain('.example.com');
    expect(sourceFixtures).toContain('(Mock)');
  });

  it('no real AWS credentials or secrets in fixtures', () => {
    const fixturesCode = readAllFilesInDir(FIXTURES_DIR);
    expect(fixturesCode).not.toMatch(/AKIA[A-Z0-9]{16}/); // AWS access key pattern
    // No raw secret values
    expect(fixturesCode).not.toMatch(/["']sk-[a-zA-Z0-9]{32,}["']/); // Secret key with length
  });
});
