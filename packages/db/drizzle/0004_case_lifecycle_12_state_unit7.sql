-- Migration: 12-State Case Lifecycle (Unit 7)
-- Source: Spec #08 Case Management, Spec #30 Validation/Closure
-- Workload class: operational-write
--
-- Upgrades the case_status enum from 6 states to 12 states.
-- Old states are removed; new states represent the full closed-loop lifecycle.
--
-- 12 states: detected, bound, routed, prioritised, action_decomposed, in_progress,
--            pending_validation, validation_running, validated_pass, validated_fail,
--            pending_closure_gates, closed_by_system, reopened_by_system

-- Step 1: Create new enum type with 12 states
CREATE TYPE case_status_new AS ENUM (
  'detected',
  'bound',
  'routed',
  'prioritised',
  'action_decomposed',
  'in_progress',
  'pending_validation',
  'validation_running',
  'validated_pass',
  'validated_fail',
  'pending_closure_gates',
  'closed_by_system',
  'reopened_by_system'
);

-- Step 2: Migrate existing data (map old states to new)
ALTER TABLE cases
  ALTER COLUMN status TYPE case_status_new
  USING CASE status::text
    WHEN 'open' THEN 'detected'::case_status_new
    WHEN 'in_progress' THEN 'in_progress'::case_status_new
    WHEN 'awaiting_validation' THEN 'pending_validation'::case_status_new
    WHEN 'awaiting_closure' THEN 'pending_closure_gates'::case_status_new
    WHEN 'closed' THEN 'closed_by_system'::case_status_new
    WHEN 'reopened' THEN 'reopened_by_system'::case_status_new
    ELSE 'detected'::case_status_new
  END;

-- Step 3: Drop old enum and rename new
DROP TYPE case_status;
ALTER TYPE case_status_new RENAME TO case_status;

-- Step 4: Update default
ALTER TABLE cases ALTER COLUMN status SET DEFAULT 'detected'::case_status;
