# Source Reference Documents — GUIDANCE ONLY

**Status:** Reference material. NOT authoritative for Commander C2 build decisions.

**Purpose:** These documents are copied from the original Commander SDR repository (`johanndewinnaar-blip/Kiro_Commander_SDR`) as historical context and architectural guidance. They represent the product vision and technical architecture as designed through v2.6 of the SDR programme.

**How to use these documents:**
- Use them to understand intent, terminology, and architectural decisions
- Cross-reference against what has already been built in Commander C2 (`packages/contracts/`, `packages/rules/`, `docs/`)
- Do NOT treat them as binding build instructions — the Commander C2 thesis entities, data dictionary, and governance docs in `docs/00_authority/` take precedence where conflicts exist

**What's here:**
- `Master_Proposition_v5_0.md` — Product vision, capability model, commercial model, persona model
- `Master_Technical_Specification_v7_0.md` — Platform architecture, integration model, data model, security model
- `child_specs/` — 75 child specifications covering individual domains
- `api_specs/` — API contract index and intake rules (actual .docx contracts not converted)

**Binding precedence (Commander C2):**
1. `.kiro/steering/` files
2. `docs/00_authority/` governance documents
3. `docs/01_data_model/DATA_DICTIONARY.md`
4. `packages/contracts/src/` (implemented entities and engines)
5. These source reference documents (guidance only)

**Last copied:** 2026-06-13 from `Kiro_Commander_SDR` baseline v2.6.2
