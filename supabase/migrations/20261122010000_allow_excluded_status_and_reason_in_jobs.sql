-- 20261122010000_allow_excluded_status_and_reason_in_jobs.sql
-- Allow 'excluded' status in jobs table and add exclusion_reason column.

-- 1. Drop existing status check constraint
alter table jobs drop constraint if exists jobs_status_check;

-- 2. Add updated status check constraint allowing 'excluded'
alter table jobs add constraint jobs_status_check
  check (status in ('active', 'expired', 'removed', 'excluded'));

-- 3. Add optional exclusion_reason column for audit tracking
alter table jobs add column if not exists exclusion_reason text;

