> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# API Reference Specification Index

## Status
Active index for Commander SDR v2.5.2. Governed by `API_SPEC_INTAKE_RULES.md` and Spec #56.

## Reference-Input Reminder
The specifications catalogued below are **reference inputs** consumed by build packs. They are not in the binding precedence chain. They do not outrank child specs, the Master Technical Specification, the Master Proposition, the Feature Registry or the route/menu registry. See `API_SPEC_INTAKE_RULES.md` for full intake doctrine.

## Categories
| Category | Sub-folder | Count |
|---|---|---|
| Identity | `identity/` | 4 |
| Collaboration | `collaboration/` | 2 |
| Endpoint Management | `endpoint_management/` | 2 |
| Audit & Telemetry | `audit_telemetry/` | 1 |
| Security Tools | `security_tools/` | 2 |
| Vulnerability & Exposure | `vulnerability_exposure/` | 3 |
| Network Security | `network_security/` | 3 |
| Cloud Infrastructure | `cloud_infrastructure/` | 2 |
| **Total** | | **19** |

## Active Specifications

### Identity (`identity/`)
Authority sources for identity, access, MFA, lifecycle and entitlement signal. Consumed by Spec #18 (Unified Identity Architecture), normalised per Spec #05.

| File | Vendor | Module | Governing Specs | Build Pack Owner |
|---|---|---|---|---|
| `microsoft_graph_entra_id_v1.docx` | Microsoft | Entra ID (Identity & Access) | #18, #05, #19 | Connector pack (post BP-13) |
| `okta_core_v1.docx` | Okta | Identity Cloud core management, SCIM, system log | #18, #05, #19 | Connector pack (post BP-13) |
| `okta_identity_engine_oie_v1.docx` | Okta | Identity Engine deep-dive (authn/authz flows) | #18, #05 | Connector pack (post BP-13) |
| `okta_workflows_public_subset_v1.docx` | Okta | Workflows (orchestration/automation) | #18, #14 | Connector pack (post BP-13) |

### Collaboration (`collaboration/`)
Mail, calendar, chat, files and productivity surfaces. Consumed by Spec #26 (Case Communication) and Spec #26a (Closed-Loop Email Case Communication Lifecycle); normalised per Spec #05.

| File | Vendor | Module | Governing Specs | Build Pack Owner |
|---|---|---|---|---|
| `microsoft_graph_core_v1.docx` | Microsoft | Graph API core (foundation for all Graph workloads) | #05, #24 | Connector pack (post BP-13) |
| `microsoft_graph_collaboration_v1.docx` | Microsoft | Mail, Calendar, Teams, SharePoint, OneDrive | #26, #26a, #05 | BP-ADMIN-07 / Connector pack |

### Endpoint Management (`endpoint_management/`)
EDR, MDM, UEM, device posture and endpoint inventory. Consumed by Spec #22 (Architecture Intelligence) and Spec #23 (Security Tool Intelligence); normalised per Spec #05.

| File | Vendor | Module | Governing Specs | Build Pack Owner |
|---|---|---|---|---|
| `microsoft_graph_intune_v1.docx` | Microsoft | Intune / Endpoint Manager (device management) | #22, #23, #05 | Connector pack (post BP-13) |
| `crowdstrike_falcon_v1.docx` | CrowdStrike | Falcon platform (EDR, threat intel, IOAs/IOCs) | #23, #05 | Connector pack (post BP-13) |

### Audit & Telemetry (`audit_telemetry/`)
Sign-in logs, audit logs, activity reports, telemetry exports. Consumed by Spec #23 (Security Tool Intelligence); normalised per Spec #05.

| File | Vendor | Module | Governing Specs | Build Pack Owner |
|---|---|---|---|---|
| `microsoft_graph_reports_audit_v1.docx` | Microsoft | Graph Reports & Audit Logs | #23, #05 | Connector pack (post BP-13) |

### Security Tools (`security_tools/`)
Detection telemetry, threat intel, network detection. Consumed by Spec #23 (Security Tool Intelligence) and Spec #15 (SIEM/SOAR Rule Generation); normalised per Spec #05.

| File | Vendor | Module | Governing Specs | Build Pack Owner |
|---|---|---|---|---|
| `microsoft_graph_security_v1.docx` | Microsoft | Graph Security API (alerts, secure score, incidents) | #23, #15, #05 | Connector pack (post BP-13) |
| `darktrace_v1.docx` | Darktrace | Network detection, antigena, threat visualiser | #23, #05 | Connector pack (post BP-13) |

### Vulnerability & Exposure (`vulnerability_exposure/`)
Vulnerability scanners, exposure management, attack surface, IoT/OT asset visibility. Consumed by Spec #05 (Connector Normalisation), Spec #22 (Architecture Intelligence) and the Vulnerability/Exposure operational domains.

| File | Vendor | Module | Governing Specs | Build Pack Owner |
|---|---|---|---|---|
| `tenable_one_v1.docx` | Tenable | Tenable One — unified inventory, vulnerabilities, EV/XM, Lumin scores, attack paths | #05, #22 | Connector pack (post BP-13) |
| `tenable_io_v1.docx` | Tenable | Tenable.io — vulnerability management | #05 | Connector pack (post BP-13) |
| `armis_v1.docx` | Armis | Asset and device visibility (IT/IoT/OT/medical) | #05, #22 | Connector pack (post BP-13) |

### Network Security (`network_security/`)
Firewalls, secure web gateway, zero-trust network access, secure private access. Consumed by Spec #25 (Trust Boundary), Spec #14 (Push Engine) and Spec #22 (Architecture Intelligence); normalised per Spec #05.

| File | Vendor | Module | Governing Specs | Build Pack Owner |
|---|---|---|---|---|
| `palo_alto_unified_v1.docx` | Palo Alto Networks | Unified API (PAN-OS, Prisma, Cortex) | #25, #14, #05 | Connector pack (post BP-13) |
| `zscaler_zia_v1.docx` | Zscaler | Internet Access (secure web gateway) | #25, #05 | Connector pack (post BP-13) |
| `zscaler_zpa_v1.docx` | Zscaler | Private Access (ZTNA) | #25, #05 | Connector pack (post BP-13) |

### Cloud Infrastructure (`cloud_infrastructure/`)
IaaS/PaaS platforms, DNS, cloud-native services. Consumed by Spec #22 (Architecture Intelligence); normalised per Spec #05.

| File | Vendor | Module | Governing Specs | Build Pack Owner |
|---|---|---|---|---|
| `aws_general_v1.docx` | Amazon Web Services | General AWS API surface (IAM, EC2, S3, etc.) | #22, #05 | Connector pack (post BP-13) |
| `aws_route53_v1.docx` | Amazon Web Services | Route 53 (DNS, health checks) | #22, #05 | Connector pack (post BP-13) |

## Retired Specifications
None at v2.5.2 release.

## Pending Categories
The following sub-folders are reserved for known intake categories where no spec has yet arrived:

- `bas/` — Breach and attack simulation platforms (per Spec #21).
- `siem_soar/` — SIEM and SOAR platforms (per Spec #15).
- `ticketing/` — ITSM and approval systems.
- `push_targets/` — Closed-loop action targets (per Spec #14).

These will be created when the first spec arrives in each category.

## Build-Pack Consumption Map (Summary)

Until BP-03 (Risk Object Model) is locked, no connector consumes any of the specs above. After BP-03 and BP-13 (Connector Test Harness), connector build packs will be generated against each spec, one per vendor-module pair, scoped narrowly to that contract.

A connector build pack is **not authorised** until:

1. BP-03 has shipped the canonical `RiskObject` schema.
2. BP-13 has shipped the connector test harness.
3. The target API spec carries required front-matter (vendor, version, retrieval date, source URL, governing child specs, owning BP).
4. The connector build pack itself passes the v2.5 acceptance gate (route/menu registration, RBAC, entitlement, feature flag, build-mode visibility, runtime visibility, backend enforcement, audit events, baseline impact).

## Cross-References
- `API_SPEC_INTAKE_RULES.md` — intake, versioning, retirement, change-coupling rules.
- `../../docs/02_child_specs/56_Shell_Reference_vs_Build_Authority_Doctrine_Spec.md` — governing doctrine for reference inputs.
- `../../docs/00_master/00_AUTHORITY_AND_PRECEDENCE_v2_5_2.md` — binding precedence chain.
- `../../docs/02_child_specs/05_Data_Connector_Normalisation_Implementation_Spec_v1_5.md` — normalisation contract.
- `../../docs/02_child_specs/09_Connector_Architecture_Spec.md` — connector architecture authority.
- `../../docs/02_child_specs/24_Connector_API_Reference_Framework_Spec.md` — connector API reference framework.

---

## v2.6 Extension — Connector Schedule

**Extension version:** v2.6.0
**Extension date:** May 2026
**Extension scope:** Adds SOC Telemetry (Class A) and Operational Verdict (Class B) connector categories per Spec #61. The reference inputs catalogued below remain outside the binding precedence chain per `API_SPEC_INTAKE_RULES.md`.

### Four Connector Classes (v2.6)

Per Spec #61, connectors declare against one or more of four classes:

- **Class A — SOC Telemetry** — Case and detection signal from SIEM, XDR, EDR, NDR platforms
- **Class B — Operational Verdict** — Real-time security decisions from email security, endpoint compliance, web filtering, identity policy, DLP, MDM
- **Class C — Configuration State** — The existing v2.5 connector universe (extended)
- **Class D — Threat Intelligence** — External threat intelligence feeds

A single connector may declare against multiple classes (multi-class declaration). Microsoft Defender for Endpoint, for example, is Class A (incident signal), Class B (prevention verdicts), and Class C (policy configuration).

### v2.6 Tier 1 Connectors — Certified for June Demos

| Connector | Vendor | Class Declaration | Conformance Tier | Build Pack |
|---|---|---|---|---|
| Microsoft Sentinel | Microsoft | A + C | Certified | v2.6 BP-A-01 |
| Microsoft Defender for Endpoint | Microsoft | A + B + C (canonical multi-class) | Certified | v2.6 BP-A-02 |
| Google SecOps / Chronicle | Google | A | Certified | v2.6 BP-A-03 |
| Splunk Enterprise Security | Splunk | A | Certified | v2.6 BP-A-04 |
| CrowdStrike Falcon (extended) | CrowdStrike | A + B + C | Certified | v2.6 BP-A-05 |
| Rapid7 InsightIDR | Rapid7 | A | Certified | v2.6 BP-A-06 |
| Darktrace (extended) | Darktrace | A + B (Antigena Email + Network) | Certified | v2.6 BP-A-07 |

### v2.6 Tier 2 Connectors — Named in Schedule

| Connector | Vendor | Class Declaration | Conformance Tier |
|---|---|---|---|
| Palo Alto XSIAM | Palo Alto Networks | A | Planned |
| IBM QRadar | IBM | A | Planned |
| SentinelOne Singularity | SentinelOne | A + B + C | Planned |
| Elastic Security | Elastic | A | Planned |
| Vectra AI | Vectra | A | Planned |
| ExtraHop Reveal(x) | ExtraHop | A | Planned |

### Operational Verdict (Class B) Schedule

Email security:
- Microsoft Defender for Office 365 — Class B
- Mimecast — Class B
- Proofpoint — Class B
- Darktrace Antigena Email — Class B (via Darktrace Tier 1 connector)

Endpoint compliance and prevention:
- Microsoft Intune — Class B + C (compliance verdicts + configuration state)
- Jamf — Class B + C
- VMware Workspace ONE — Class B + C
- CrowdStrike Falcon Prevention — Class B (via CrowdStrike Tier 1 connector)
- Microsoft Defender for Endpoint Prevention — Class B (via Defender Tier 1 connector)

Web filtering:
- Zscaler — Class B + C
- Netskope — Class B + C
- Palo Alto Prisma Access — Class B + C
- Cisco Umbrella — Class B
- Darktrace Network — Class B (via Darktrace Tier 1 connector)

Identity policy enforcement:
- Microsoft Conditional Access (via Entra ID) — Class B + C
- Okta Policies — Class B + C
- Microsoft Defender for Identity — Class B + A
- CrowdStrike Falcon Identity Protection — Class B + A

DLP enforcement:
- Microsoft Purview DLP — Class B + C
- Symantec DLP — Class B + C
- Forcepoint DLP — Class B + C
- Code42 — Class B + C

### Threat Intelligence (Class D) Schedule

Threat Intelligence connector entries are catalogued separately under existing categories. The v2.6 release does not introduce new Class D connectors but formalises the Class D categorisation across existing threat intelligence integrations.

### New Vendor API Specifications to Add

The following vendor API specifications will be added to the category folders in v2.6 (the actual spec documents are reference inputs and will be added to the appropriate sub-folders):

- `security_tools/microsoft_sentinel_v1.docx` — SOC Telemetry Class A
- `security_tools/microsoft_defender_for_endpoint_v1.docx` — Multi-class A+B+C
- `security_tools/google_secops_chronicle_v1.docx` — SOC Telemetry Class A
- `security_tools/splunk_enterprise_security_v1.docx` — SOC Telemetry Class A
- `security_tools/rapid7_insightidr_v1.docx` — SOC Telemetry Class A

### Category Folder Update

A new sub-folder `security_tools/soc_telemetry/` is added for v2.6 SOC Telemetry connector specifications. Existing `security_tools/` content is preserved.

### Reference-Input Reminder (re-iteration)

The schedule above catalogues reference inputs. The binding precedence chain remains:
1. AGENTS.md
2. Authority and Precedence document
3. Master Proposition v5.0
4. Master Technical Specification v7.0
5. Child specs #01-#75
6. Feature Registry FR001

The vendor API specifications are reference inputs consumed by build packs. They do not outrank child specs.

