> **⚠️ GUIDANCE ONLY — NOT AUTHORITATIVE FOR BUILD DECISIONS**
> This document is a reference copy from Commander SDR v2.6. See `../GUIDANCE_NOTICE.md` for precedence rules.
> Review against what has been built in Commander C2 before acting on any content here.


# API Reference Specification Intake Rules

## Status
Active baseline authority for Commander SDR v2.5.2. Governed by Spec #56 and `00_AUTHORITY_AND_PRECEDENCE_v2_5_2.md`.

## Scope
This document governs how third-party API definition documents are ingested, stored, versioned, retired, and consumed by build packs in the Commander SDR baseline.

## Reference-Input Status
API specifications at `docs/03_api_specs/` are **reference inputs**. They are:

- material consumed by build packs (primarily `BP-13 Connector Test Harness` and downstream connector build packs);
- the canonical source for vendor endpoints, authentication models, payload schemas, rate limits, pagination, error contracts, and webhook contracts;
- the inputs to normalisation logic governed by Spec #05, Spec #09, Spec #18, Spec #21, Spec #23, Spec #24 and Spec #25.

API specifications are **not** authoritative for:

- the canonical `RiskObject` schema (Spec #29 and BP-03 own that);
- closed-loop case doctrine (Spec #08, Spec #30 own that);
- routing, validation, closure or reopening logic (Spec #06, Spec #07, Spec #30, Spec #31 own that);
- mission objective binding (Spec #52 owns that);
- baseline configuration profiles (Spec #55 owns that);
- RBAC, entitlement or feature-flag semantics (Spec #19, Spec #50, FR-001 own those).

API specifications carry **no veto authority** over baseline doctrine. A vendor endpoint that does not fit the canonical model is normalised by Spec #05, not promoted to canonical status.

## Storage Rules

### File naming
- Use snake_case.
- Pattern: `{vendor}_{product_or_module}_v{spec_version}.{ext}`.
- Examples: `okta_core_v1.docx`, `microsoft_graph_security_v1.docx`, `aws_route53_v1.docx`.
- Native format preserved (`.docx`, `.yaml`, `.json`, `.md`); do not reformat vendor output unless explicitly required.

### Sub-folder placement
| Sub-folder | Use for |
|---|---|
| `identity/` | Identity providers, IAM, SSO, MFA, lifecycle, SCIM |
| `collaboration/` | Email, calendar, chat, files, productivity suites |
| `endpoint_management/` | EDR, MDM, UEM, device management, endpoint posture |
| `audit_telemetry/` | Audit logs, sign-in logs, activity reports, telemetry exports |
| `security_tools/` | Generic security telemetry, threat intel, detection feeds |
| `vulnerability_exposure/` | Vulnerability scanners, exposure management, attack surface |
| `network_security/` | Firewalls, secure web gateway, zero-trust network access |
| `cloud_infrastructure/` | IaaS/PaaS platforms, DNS, cloud-native security services |
| `bas/` | Breach and attack simulation platforms (placeholder; per Spec #21) |
| `siem_soar/` | SIEM platforms, SOAR platforms (placeholder; per Spec #15) |
| `ticketing/` | ITSM, change management, approval systems (placeholder) |
| `push_targets/` | Action targets for closed-loop push per Spec #14 (placeholder) |

Empty sub-folders may be created in advance for known categories awaiting first intake.

### Required spec front-matter
Every API spec file should carry, in its first page or first comment block:

- **Vendor**: legal vendor name.
- **Product or module**: specific product, module or API surface covered.
- **API version**: the vendor's API version this document describes.
- **Spec retrieval date**: ISO-8601 date the spec was captured or last verified.
- **Source URL**: vendor-canonical documentation URL.
- **Governing child spec(s)**: the Commander SDR child spec(s) under which this API is normalised (e.g. Spec #05, Spec #18).
- **Owning build pack(s)**: the BP-* stream(s) that will consume this spec.

Where a vendor document does not natively carry this metadata, an inline annotation block shall be added in a wrapper page or sidecar `.md` file in the same sub-folder.

## Versioning Rules

### New version = new file
A vendor API version increment creates a new file. Examples:
- `okta_core_v1.docx` → `okta_core_v2.docx` (new file alongside).
- Old versions are **retained**, not deleted, for audit and drift analysis.

### Patch updates within a major version
A material change to an existing major version (vendor adds endpoints, changes auth, changes payload shape) creates a dated revision file:
- `okta_core_v1.docx` → `okta_core_v1_2026-08-01.docx`.
- The unsuffixed `okta_core_v1.docx` is then retired or removed.

### Trivial editorial corrections
Typo fixes or formatting corrections may be made in place. Material change of meaning is not editorial.

### Retirement
A retired spec is moved to `docs/03_api_specs/_retired/{category}/` with the date of retirement appended. It is not deleted from the repository.

## Change-Intake Coupling

### Pre-build (no consuming connector yet)
A new or updated spec may be added freely. INDEX.md is updated. No further action required.

### Post-build (a connector has shipped against this spec)
A material change to a spec after a connector has shipped against it shall automatically generate a Change Intake item in the Decision Register (via the `baseline_guardian_agent` per Next Stage Pack v1.4). The item shall capture:

- which connector build pack consumed the prior spec version;
- which endpoints, fields or auth surfaces changed;
- whether the change is breaking, semi-breaking, or additive;
- the proposed remediation (re-test, re-version connector, defer).

No connector may silently consume a new spec version without intake.

## Agent Rules
- The `baseline_guardian_agent` shall verify, on every commit, that no API spec file has been modified in place where a connector build pack references it. Modifications shall trigger Change Intake.
- The `build_pack_agent` shall not generate code against an API spec that lacks the required front-matter metadata.
- Agents shall not introduce a new connector build pack whose target API is not represented in `docs/03_api_specs/`.

## Forbidden Behaviours
- Editing a versioned spec file in place where a connector has consumed it.
- Adding a spec to the binding precedence chain.
- Treating API specs as authoritative for canonical schema, case doctrine or routing logic.
- Removing or deleting retired specs (move to `_retired/` instead).
- Mixing two vendor specs into one file. One vendor and one product per file.
- Adding a connector build pack before the connector's API spec is in this folder.

## Acceptance
v2.5.2 build-pack generation and agent execution shall comply with these intake rules. A build pack that violates them is rejected at the acceptance gate.
