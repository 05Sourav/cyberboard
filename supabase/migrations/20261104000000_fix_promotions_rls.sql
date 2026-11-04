-- 20261104000000_fix_promotions_rls.sql
-- Fix promotions RLS & public data exposure
-- Revokes direct access to promotions table and creates a secure public view

-- 1. Drop existing public SELECT policy on promotions table
drop policy if exists "Public can view active promotions" on promotions;

-- 2. Revoke direct SELECT on promotions table from public roles
revoke select on table promotions from anon, authenticated;

-- 3. Create active_promotions_public view exposing ONLY safe public fields
-- Strictly excludes contact_email, report_token, price_cents, and notes
create or replace view active_promotions_public as
select
  id,
  job_id,
  company_id,
  tier,
  highlight,
  starts_at,
  ends_at
from promotions
where now() between starts_at and ends_at;

-- 4. Grant SELECT on the view to public roles
grant select on active_promotions_public to anon, authenticated;

