'use client';

import { thesisIocs, thesisVulnerabilityIntelligence, thesisAssets } from '../../../../../../packages/contracts/src/fixtures/thesis-adapters';
import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../../packages/ui/src/tokens/components';
import {
  primitiveTypeScale, primitiveSpacing, primitiveFontWeight,
  primitiveFonts, primitiveLetterSpacing, primitiveSignal,
} from '../../../../../../packages/ui/src/tokens/primitives';

/**
 * Vulnerability Management — Code & Supply Chain
 *
 * Data: IOCs (package_name category) from seed-iocs + vulnerability intelligence
 * Route: /vulnerabilities/supply-chain | Nav Group: Vulnerability Management | Status: BUILD
 * Shows supply chain indicators: malicious packages, container images, code repos.
 */

{/* AI-PLACEMENT: AICAP-VULN-003 — Commander AI supply chain risk correlation */}

export default function VulnerabilitiesSupplyChainPage() {
  const { tokens } = useMode();

  const supplyChainIocs = thesisIocs.filter((ioc) =>
    ioc.ioc_category === 'package_name' || ioc.ioc_category === 'container_image' || ioc.ioc_category === 'file_hash_sha256'
  );
  const supplyChainVulns = thesisVulnerabilityIntelligence.filter((v) =>
    v.affected_products.some((p) => p.includes('library') || p.includes('framework'))
  );
  const activeIocs = supplyChainIocs.filter((ioc) => ioc.active);
  const highConfidence = supplyChainIocs.filter((ioc) => ioc.confidence >= 80);
  const affectedAssets = thesisAssets.filter((a) => a.classification === 'server' || a.classification === 'container').length;
  const externalAssets = thesisAssets.filter((a) => a.surface_attribution === 'external_attack_surface').length;

  return (
    <PageContainer pretitle="Vulnerabilities › Supply Chain" title="Code & Supply Chain">
      {/* KPI strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <KpiCard tokens={tokens} label="Supply Chain IOCs" value={String(supplyChainIocs.length)} />
        <KpiCard tokens={tokens} label="Active" value={String(activeIocs.length)} accent={activeIocs.length > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="High Confidence" value={String(highConfidence.length)} />
        <KpiCard tokens={tokens} label="Related CVEs" value={String(supplyChainVulns.length)} accent={supplyChainVulns.length > 0 ? primitiveSignal.warning : undefined} />
        <KpiCard tokens={tokens} label="Affected Assets" value={String(affectedAssets)} />
        <KpiCard tokens={tokens} label="External Surface" value={String(externalAssets)} accent={externalAssets > 0 ? primitiveSignal.warning : undefined} />
      </section>

      {/* Supply chain IOCs */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Supply Chain Indicators</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['Category', 'Value', 'Confidence', 'Severity', 'TLP', 'Active', 'First Seen'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {supplyChainIocs.map((ioc) => (
                <tr key={ioc.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{ioc.ioc_category.replace(/_/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ioc.value}>{ioc.value}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{ioc.confidence}%</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{ioc.severity}/5</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, textTransform: 'uppercase', fontSize: primitiveTypeScale.micro }}>{ioc.tlpMarking}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}` }}>{ioc.active ? <span style={{ color: primitiveSignal.success }}>●</span> : <span style={{ color: tokens.text.muted }}>○</span>}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{new Date(ioc.first_seen_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related vulnerabilities */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Related Library/Framework CVEs</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr>
                {['CVE ID', 'CVSS', 'Affected Products', 'EPSS', 'Severity'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {supplyChainVulns.map((v) => (
                <tr key={v.id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold, fontFamily: primitiveFonts.mono }}>{v.cve_id}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{v.cvss_score}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontSize: primitiveTypeScale.micro }}>{v.affected_products.join(', ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono }}>{v.epss_score !== null ? `${(v.epss_score * 100).toFixed(0)}%` : '—'}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{v.severity}/5</td>
                </tr>
              ))}
              {supplyChainVulns.length === 0 && (
                <tr><td colSpan={5} style={{ padding: primitiveSpacing[4], textAlign: 'center', color: tokens.text.muted }}>No supply chain CVEs in current intelligence feed.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

function KpiCard({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
      <span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span>
      <span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span>
    </div>
  );
}
