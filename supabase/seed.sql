-- supabase/seed.sql
-- Sample seed data for local testing

insert into companies (id, slug, name, ats, domain, hq_country)
values 
  ('11111111-1111-1111-1111-111111111111', 'crowdstrike', 'CrowdStrike', 'greenhouse', 'crowdstrike.com', 'United States'),
  ('22222222-2222-2222-2222-222222222222', 'cloudflare', 'Cloudflare', 'greenhouse', 'cloudflare.com', 'United States'),
  ('33333333-3333-3333-3333-333333333333', 'okta', 'Okta', 'greenhouse', 'okta.com', 'United States')
on conflict (slug) do nothing;

insert into jobs (
  id, source, company_id, external_id, title, location, countries, work_mode,
  worldwide, probably_worldwide, department, category, level, apply_url,
  posted_at, salary_min, salary_max, salary_currency, salary_text, status
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'greenhouse',
    '11111111-1111-1111-1111-111111111111',
    'cs-101',
    'Senior Security Engineer, Cloud Detection',
    'Remote - US',
    array['United States'],
    'Remote',
    false,
    false,
    'Cloud Security',
    'Cloud Security',
    'Senior',
    'https://boards.greenhouse.io/crowdstrike/jobs/cs-101',
    now() - interval '2 days',
    165000,
    205000,
    'USD',
    '$165,000 - $205,000 USD',
    'active'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'greenhouse',
    '22222222-2222-2222-2222-222222222222',
    'cf-202',
    'Staff Application Security Architect',
    'Austin, TX',
    array['United States'],
    'Hybrid',
    false,
    false,
    'Product Security',
    'Application Security',
    'Principal / Staff',
    'https://boards.greenhouse.io/cloudflare/jobs/cf-202',
    now() - interval '4 days',
    190000,
    240000,
    'USD',
    '$190,000 - $240,000 USD',
    'active'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'greenhouse',
    '33333333-3333-3333-3333-333333333333',
    'ok-303',
    'Detection & Response Analyst',
    'Remote',
    array[]::text[],
    'Remote',
    true,
    true,
    'Security Operations',
    'SOC & Incident Response',
    'Mid-level',
    'https://boards.greenhouse.io/okta/jobs/ok-303',
    now() - interval '1 day',
    null,
    null,
    null,
    null,
    'active'
  )
on conflict (source, company_id, external_id) do nothing;

insert into promotions (
  company_id, job_id, tier, highlight, starts_at, ends_at, price_cents, notes
) values
  (
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'featured',
    true,
    now() - interval '1 day',
    now() + interval '29 days',
    9900,
    'Founding employer special'
  );
