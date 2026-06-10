-- Migration: 0012_strategy_surface_expansion
-- Purpose: Expand strategy_surface_type enum from 13 to 20 values
-- Authority: docs/00_authority/JOURNEY_INTELLIGENCE.md (JI-1.0) §5.5
-- Resolves: Existing ARCH-DEBT (contract 19 values vs DB 13 values) + adds surface #20
-- Non-breaking: ALTER TYPE ADD VALUE is non-blocking in Postgres

ALTER TYPE strategy_surface_type ADD VALUE IF NOT EXISTS 'sla-modifier';
ALTER TYPE strategy_surface_type ADD VALUE IF NOT EXISTS 'correlation-policy';
ALTER TYPE strategy_surface_type ADD VALUE IF NOT EXISTS 'effectiveness-targets';
ALTER TYPE strategy_surface_type ADD VALUE IF NOT EXISTS 'ssvc-decision-tree';
ALTER TYPE strategy_surface_type ADD VALUE IF NOT EXISTS 'communication-playbook';
ALTER TYPE strategy_surface_type ADD VALUE IF NOT EXISTS 'war-room-cadence';
ALTER TYPE strategy_surface_type ADD VALUE IF NOT EXISTS 'journey-intelligence-formula';
