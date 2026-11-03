-- 20261101000000_init.sql
-- Cyberboard Database Schema & Row Level Security

create extension if not exists "pgcrypto";

-- 1. Companies Table
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  ats text not null check (ats in ('greenhouse', 'lever', 'ashby')),
  lever_host text check (lever_host in ('us', 'eu')),
  domain text,
  logo_url text,
  hq_country text,
  blocked boolean not null default false,
  created_at timestamptz default now()
);

-- 2. Jobs Table
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('greenhouse', 'lever', 'ashby', 'direct')),
  company_id uuid references companies(id) on delete cascade,
  external_id text not null,
  title text not null,
  location text,
  countries text[] not null default '{}',
  work_mode text not null check (work_mode in ('Remote', 'Hybrid', 'On-site')),
  worldwide boolean not null default false,
  probably_worldwide boolean not null default false,
  department text,
  category text not null,
  level text not null,
  apply_url text not null,
  posted_at timestamptz,
  salary_min numeric,
  salary_max numeric,
  salary_currency text,
  salary_text text,
  status text not null default 'active' check (status in ('active', 'expired', 'removed')),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique (source, company_id, external_id)
);

create index if not exists idx_jobs_status_first_seen on jobs (status, first_seen desc);
create index if not exists idx_jobs_countries on jobs using gin (countries);
create index if not exists idx_jobs_category on jobs (category);
create index if not exists idx_jobs_company_id on jobs (company_id);

-- 3. Promotions Table
create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  tier text not null check (tier in ('featured', 'featured_plus')),
  highlight boolean not null default false,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  price_cents int,
  currency text default 'USD',
  notes text,
  contact_email text,
  report_token text unique default encode(gen_random_bytes(16), 'hex')
);

create index if not exists idx_promotions_active on promotions (starts_at, ends_at);

-- 4. Events Table (views and apply clicks for employer reports)
create table if not exists events (
  id bigint generated always as identity primary key,
  job_id uuid references jobs(id) on delete set null,
  kind text not null check (kind in ('view', 'apply_click')),
  country text,
  was_promoted boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists idx_events_job_created on events (job_id, created_at);

-- 5. Removal Requests Table
create table if not exists removal_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  contact_email text,
  message text,
  status text default 'open' check (status in ('open', 'resolved', 'ignored')),
  created_at timestamptz default now()
);

-- 6. Pipeline Runs Table (monitoring)
create table if not exists pipeline_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz default now(),
  finished_at timestamptz,
  companies_ok int default 0,
  companies_failed int default 0,
  jobs_active int default 0,
  jobs_expired int default 0,
  errors jsonb default '[]'::jsonb
);

-- ==========================================
-- Row Level Security (RLS)
-- ==========================================
alter table companies enable row level security;
alter table jobs enable row level security;
alter table promotions enable row level security;
alter table events enable row level security;
alter table removal_requests enable row level security;
alter table pipeline_runs enable row level security;

-- Anonymous and authenticated read policies
create policy "Public can view unblocked companies"
  on companies for select
  to anon, authenticated
  using (blocked = false);

create policy "Public can view active jobs of unblocked companies"
  on jobs for select
  to anon, authenticated
  using (
    status = 'active'
    and exists (
      select 1 from companies c
      where c.id = jobs.company_id and c.blocked = false
    )
  );

create policy "Public can view active promotions"
  on promotions for select
  to anon, authenticated
  using (now() between starts_at and ends_at);

-- Anonymous insert policies
create policy "Public can insert events"
  on events for insert
  to anon, authenticated
  with check (true);

create policy "Public can insert removal requests"
  on removal_requests for insert
  to anon, authenticated
  with check (true);

-- Service role bypasses RLS by default in Supabase, but explicit service role grant:
-- Admins/Pipelines using SUPABASE_SERVICE_ROLE_KEY bypass RLS completely.
