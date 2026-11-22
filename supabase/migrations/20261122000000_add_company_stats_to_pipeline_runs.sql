-- Migration: add per-company stats jsonb column to pipeline_runs
-- Apply this in Supabase SQL Editor. Do not edit old migrations.
ALTER TABLE pipeline_runs
  ADD COLUMN IF NOT EXISTS company_stats jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN pipeline_runs.company_stats IS
  'Per-company fetch stats for each pipeline run: [{company, ats, slug, status, raw_jobs, security_jobs, error}]';

