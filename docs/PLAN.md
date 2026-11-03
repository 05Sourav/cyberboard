# Cyberboard Implementation Plan

Nov 1, 2026 · @Sourav

## 1. Goal and success criteria

Build Cyberboard, a job board for the whole cybersecurity sector, fill it with real listings pulled from employers' public career pages, and use it to win one paying employer.

- **Primary goal:** one paid listing within 4 to 6 weeks of launch. This is the gate. If roughly 50 to 100 relevant employers are asked and none will pay even $99, stop and switch niches.
- **Launch quality bar:** at least 300 active, real security roles from at least 80 employers on day one.
- **Longer-term goal:** $5K+ MRR. Do not build for this yet.
- **Builder context:** one person, no existing community, marketing through X, Reddit and other platforms. Prefer boring, cheap, low-maintenance choices. Everything must run on free tiers until revenue exists.
- **Positioning:** a board that is fresh (checked daily), honest about pay (employer-stated only), and easy to filter by country and role type. It does not narrow to a sub-niche at the start.

## 2. Locked decisions

These were decided with the owner. Do not re-open them while building.

**Product**

- Niche: the whole cybersecurity sector. No sub-niche at launch.
- Cold start: seed the board with real jobs from employers' public ATS APIs (Greenhouse, Lever including its EU host, Ashby), then sell paid placement to employers whose jobs already appear.
- Aggregated listings are free for employers and link out to the employer's own apply page.
- Location: visitors pick a country. Remote roles are handled separately (see section 7).
- Filters: search, role type, level, work mode, date posted, salary shown only.
- Logos are shown next to each employer, like RemoteOK does. Until a logo source is chosen, show a letter placeholder.
- Reference for look and monetization: RemoteOK's promoted rows at the top, highlighted (yellow) rows, a "NEW" tag, salary chips, and a "Probably worldwide" tag for remote roles with no named country.

**Data and copy**

- Store only title, company, location, department, remote flag, posted date, employer-stated salary and the original apply URL. Do not copy job descriptions.
- Show salary only when the employer published it. Otherwise show "Salary not disclosed". Never show AI-estimated pay. Never claim "100% salary transparency".
- Never claim "zero ghost jobs". Say: "Checked daily, removed within 24 hours of the employer taking it down."
- No claim of filling roles "without a single sales call". Outreach to employers is part of the plan.

**Pricing**

| Plan | Price | Duration | What it includes |
| --- | --- | --- | --- |
| Listed | Free | While the career page is public | Appears, searchable, links out |
| Featured | $199 | 30 days | Pinned for matching searches, Featured label, weekly report, free re-post if no clicks in 14 days |
| Featured Plus | $399 | 45 days | Featured plus newsletter slot, social post, up to 3 roles |
| Highlight add-on | price to set later | same as the listing | Colored row, like RemoteOK's yellow row |
| Founding employer | $99 | 30 days | First 10 employers get Featured at $99 and keep that price for their next listing |

Benchmarks that justify these prices: niche cyber boards charge about $197 to $495 per 30-day post.

**Legal stance**

No lawyer is needed now. Use link-out only, poll politely, read the ATS terms once, publish a "remove my company" email and honor removals fast. Revisit a lawyer only after a formal complaint or if descriptions, bulk data resale or paid logo use are added. This is not legal advice.

## 3. Tech stack

Use the cheapest, most common tools so one person can run the whole thing on free tiers.

| Layer | Choice | Why |
| --- | --- | --- |
| Web app | Next.js (App Router), TypeScript, Tailwind CSS | Server-rendered pages for SEO, one codebase for site, admin and API routes |
| Hosting | Vercel (free tier) | Zero-config deploys from GitHub |
| Database | Supabase Postgres (free tier) | Hosted Postgres, auth and storage in one place |
| DB access | supabase-js with generated types, SQL migrations in /supabase/migrations | No ORM needed at this size |
| Ingestion | Python 3.12 script using requests | Already prototyped, easy to test |
| Scheduler | GitHub Actions cron, every 6 hours | Free, no server to run |
| Click tracking | Next.js route handler at /go/\[jobId\] that logs then redirects | Reliable per-employer numbers for the weekly report |
| Page analytics | Plausible or self-hosted Umami | Visits, sources, country |
| Admin auth | Supabase Auth magic link, allowlist of one owner email | Simple and safe |
| Email | Resend for the weekly employer report and alerts | Free tier covers launch volume |
| Newsletter | Buttondown or Beehiiv (decide later) | Weekly digest for traffic |
| Payments | Phase 1: a hosted payment link plus manual invoice. Phase 2: self-serve checkout | The owner is in India, so check which processor is available (Stripe, Lemon Squeezy, Paddle or Razorpay) before building checkout |
| Logos | Placeholder letter tile first. Then a favicon from the company domain for free listings, and an uploaded logo in Supabase Storage for paying employers | Avoids depending on a paid logo API |
| Tests | pytest for the pipeline, Vitest for filter logic, Playwright for one end-to-end flow | Keeps changes safe |

**AI (Gemini):** not needed at launch. Classification is rule-based (see section 6). It may be added later to improve role-type labels, but it must never invent salary, seniority or location. If used, cache results per job so each job is classified once.

**Environment variables:** NEXT\_PUBLIC\_SUPABASE\_URL, NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY, SUPABASE\_SERVICE\_ROLE\_KEY (server and GitHub Actions only, never in the browser), SITE\_URL, CONTACT\_EMAIL, FETCHER\_USER\_AGENT, RESEND\_API\_KEY, ADMIN\_EMAIL.

## 4. Project structure

One monorepo with the web app and the Python pipeline side by side.

```text
cyberboard/
├─ README.md
├─ .env.example
├─ .github/workflows/
│  ├─ fetch-jobs.yml          # cron every 6h: runs pipeline/main.py
│  ├─ weekly-report.yml       # cron Monday 06:00 UTC: runs the employer report
│  └─ ci.yml                  # lint + tests on every PR
├─ pipeline/                  # Python ingestion
│  ├─ requirements.txt
│  ├─ main.py                 # entry: load roster, fetch, enrich, upsert, expire
│  ├─ fetchers.py             # greenhouse, lever (US+EU), ashby
│  ├─ enrich.py               # country, work mode, category, level, salary flag
│  ├─ filters.py              # is_security() include/exclude rules
│  ├─ db.py                   # Supabase upsert + expiry
│  ├─ verify_roster.py        # checks every slug and prints the ones to fix
│  ├─ roster/companies.json   # name, slug, ats, domain, hq_country
│  └─ tests/                  # mocked HTTP: upsert, expiry, outage safeguard, enrich
├─ supabase/
│  ├─ migrations/             # SQL for section 5
│  └─ seed.sql                # sample promotions for local testing
├─ web/                       # Next.js app
│  ├─ package.json
│  ├─ app/
│  │  ├─ page.tsx                      # home: search, location, filters, list
│  │  ├─ jobs/country/[country]/page.tsx   # SEO landing pages
│  │  ├─ jobs/role/[category]/page.tsx     # SEO landing pages
│  │  ├─ companies/[slug]/page.tsx     # company page with its open roles
│  │  ├─ employers/page.tsx            # pricing + how placement works
│  │  ├─ go/[jobId]/route.ts           # click log + 302 to apply URL
│  │  ├─ remove/page.tsx               # "remove my company" request form
│  │  ├─ privacy/page.tsx, terms/page.tsx
│  │  ├─ admin/                        # owner-only (see section 10)
│  │  ├─ api/jobs/route.ts             # filtered, paginated job query
│  │  ├─ sitemap.ts, robots.ts
│  ├─ components/                      # JobCard, FilterRail, LocationPicker, Logo, PromotedBlock
│  ├─ lib/                             # supabase client, filter logic, ranking, formatters
│  └─ tests/
└─ docs/
   └─ PLAN.md                 # this document
```

## 5. Database schema

Postgres on Supabase. Public visitors can read active jobs and nothing else. All writes come from the pipeline or the admin using the service role.

```sql
create table companies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,            -- ATS board slug
  name text not null,
  ats text not null check (ats in ('greenhouse','lever','ashby')),
  lever_host text,                      -- 'us' or 'eu' when ats = 'lever'
  domain text,                          -- for the favicon logo
  logo_url text,                        -- uploaded logo (paying employers)
  hq_country text,
  blocked boolean not null default false, -- removal request: never list
  created_at timestamptz default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null,                 -- greenhouse | lever | ashby | direct
  company_id uuid references companies(id),
  external_id text not null,            -- the ATS job id
  title text not null,
  location text,
  countries text[] not null default '{}',
  work_mode text not null,              -- Remote | Hybrid | On-site
  worldwide boolean not null default false,
  probably_worldwide boolean not null default false,
  department text,
  category text not null,               -- see section 6 list
  level text not null,
  apply_url text not null,
  posted_at timestamptz,                -- ATS date if reliable, else null
  salary_min numeric, salary_max numeric,
  salary_currency text, salary_text text,
  status text not null default 'active' check (status in ('active','expired','removed')),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique (source, company_id, external_id)
);
create index on jobs (status, first_seen desc);
create index on jobs using gin (countries);
create index on jobs (category);

create table promotions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  job_id uuid references jobs(id),      -- null = every role of that company
  tier text not null check (tier in ('featured','featured_plus')),
  highlight boolean not null default false,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  price_cents int, currency text,       -- for your own records
  notes text
);

create table events (                   -- clicks and views for employer reports
  id bigint generated always as identity primary key,
  job_id uuid references jobs(id),
  kind text not null check (kind in ('view','apply_click')),
  country text,                         -- from the request, never an IP address
  was_promoted boolean not null default false,
  created_at timestamptz default now()
);
create index on events (job_id, created_at);

create table removal_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text, contact_email text, message text,
  status text default 'open', created_at timestamptz default now()
);

create table pipeline_runs (             -- one row per fetch run, for monitoring
  id bigint generated always as identity primary key,
  started_at timestamptz, finished_at timestamptz,
  companies_ok int, companies_failed int, jobs_active int, jobs_expired int, errors jsonb
);
```

**Row level security:** enable it on every table. Anonymous role may `select` from `jobs` where `status = 'active'`, from `companies` where `blocked = false`, and from `promotions` where `now()` is between `starts_at` and `ends_at`. Anonymous role may `insert` into `events` and `removal_requests` only. Everything else needs the service role.

**Privacy:** do not store IP addresses or user identifiers in `events`. Store the country only.

## 6. Ingestion pipeline

A Python job that runs every 6 hours, turns each employer's public career feed into rows in `jobs`, and removes roles that disappear. A working SQLite prototype exists (section 12); port it to Postgres and keep its behavior.

**6.1 Roster**

- `pipeline/roster/companies.json`, at least 100 cybersecurity employers at launch: security vendors, cloud and identity companies, fintechs, consultancies and large employers with security teams.
- Entry shape: `{"name", "slug", "ats": "greenhouse|lever|ashby", "lever_host": "us|eu", "domain", "hq_country"}`.
- Every slug must be verified. `verify_roster.py` calls each board and prints the slugs that return 404 or empty so the owner can fix them. If `ats` is missing, try all three and cache the one that works.
- Not covered: Workday, SuccessFactors, iCIMS and custom career sites. Do not try to scrape them in v1.

**6.2 Public endpoints (no auth, GET only)**

| ATS | URL | Notes |
| --- | --- | --- |
| Greenhouse | `https://boards-api.greenhouse.io/v1/boards/{slug}/jobs` | List has no pay. Single job at `/jobs/{id}` has pay ranges. |
| Lever | `https://api.lever.co/v0/postings/{slug}?mode=json` and `https://api.eu.lever.co/...` | Has `createdAt` (ms) and `salaryRange` when set. |
| Ashby | `https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true` | Has `publishedAt` and a compensation summary. |

**6.3 Security filter**

Keep a job only if the title or department matches the security pattern and does not match the exclude pattern.

- Include words: security, cyber, soc, grc, incident response, pentest, penetration, iam, identity, cryptograph\*, ciso, vulnerabilit\*, appsec, threat, malware, forensic\*, red team, blue team, devsecops, detection.
- Exclude phrases: security guard, security officer, social security, security deposit.
- Words like "identity" and "detection" cause false positives (for example a product manager for an identity platform). Store the matched keyword per job and review the first full run by hand. Add exclusions as they are found, each with a test.

**6.4 Enrichment (rules only, no network)**

- `countries`: from the location text, using country names, major cities and US state codes. A job can have several.
- `work_mode`: Remote, Hybrid or On-site from the location text and the ATS remote flag.
- `worldwide`: location says global, worldwide or anywhere.
- `probably_worldwide`: remote with no country found. Shown with the "Probably worldwide" tag.
- `category`, first match wins in this order: Leadership, GRC & Compliance, Offensive Security, Application Security, Cloud Security, Identity & Access, SOC & Incident Response, Threat Intelligence, Security Engineering, else Other Security.
- `level`, first match wins: Executive, Manager / Director, Principal / Staff, Senior, Entry / Intern, else Mid-level.
- Never infer salary. Salary fields come only from the ATS.

**6.5 Dates**

Greenhouse's list endpoint gives `updated_at`, not the posting date, so it must not be displayed as "posted". Use `first_seen` for the NEW tag and for sorting when the ATS gives no real posting date. Show NEW only when `first_seen` is within the last 3 days and after the site's launch date, so the first full run does not mark everything NEW.

**6.6 Upsert and expiry**

1. Upsert each security job on `(source, company_id, external_id)`, set `status = 'active'` and `last_seen` to the run time (a full timestamp, not a date, so two runs in one day still expire correctly).
2. After a company's feed was fetched successfully, mark its active jobs with an older `last_seen` as `expired`.
3. Safeguards: never expire when the fetch errored or returned an empty list; if a company's job count drops by more than 80% in one run, skip expiry for it and write a warning to `pipeline_runs.errors`.
4. Skip companies where `blocked = true` and set their jobs to `removed`.
5. Optional pay pass: for new Greenhouse security jobs at companies that are customers or prospects, call the single-job endpoint once and store the pay range if present.

**6.7 Politeness**

User-agent `cyberboard-fetcher/1.0 (contact: <CONTACT_EMAIL>)`, 0.5 second pause between companies, 30 second timeout, retry with backoff on 429 and 5xx, one run every 6 hours. Never run more often.

**6.8 Monitoring and tests**

- Write one `pipeline_runs` row per run. The admin dashboard shows the last run and any failing slugs.
- Mocked tests (no network) must cover: upsert twice does not duplicate, a vanished job expires, an empty feed does not expire anything, an 80% drop skips expiry, excluded titles are dropped, and enrichment for at least 20 sample locations and titles.

## 7. Public site features

**7.1 Location**

- A "Location" dropdown beside the search box. First option is "Anywhere", then every country that has active jobs, sorted by job count and showing the count.
- Pre-select the visitor's country from their timezone (for example Asia/Calcutta gives India) and remember the choice in localStorage. If that country has no jobs, default to "Anywhere".
- A checkbox "Include remote roles open to my location", on by default.
- Matching rule for a chosen country C: show a job if `C` is in its `countries`, or if the checkbox is on and the job is Remote and (`worldwide` or `probably_worldwide` or `C` is in its `countries`). A "Remote - US" role must not show to a visitor who chose India.
- Region words such as Europe, EU and EMEA in the location text map to the set of European countries in the dropdown.
- Remote roles with no named country get the "Probably worldwide" tag.

**7.2 Filters** (left rail on desktop, collapsible "Filters" button on phones)

| Filter | Type | Values |
| --- | --- | --- |
| Search | text, multi-word AND | title, company, department, location, role type |
| Role type | multi-select | Security Engineering, SOC & Incident Response, Application Security, Cloud Security, GRC & Compliance, Offensive Security, Identity & Access, Threat Intelligence, Leadership, Other Security |
| Level | multi-select | Entry / Intern, Mid-level, Senior, Principal / Staff, Manager / Director, Executive |
| Work mode | multi-select | Remote, Hybrid, On-site |
| Posted | single | Any time, last 3 days, last 7 days, last 30 days |
| Salary shown only | checkbox | only jobs with employer-stated pay |
| Sort | single | Newest, Highest salary |

- Each option shows a live count computed with every other filter applied. Options with zero results are disabled unless already selected.
- "Clear filters" appears when any filter is active. Empty state tells the visitor to try another country or turn on remote roles.
- 25 results per page with a "Show more" button.
- All filter state lives in the URL query string (`?country=India&category=GRC...`) so searches can be shared and indexed.

**7.3 Job card**

Logo tile (letter placeholder, then favicon or uploaded logo), title, "Company · Location", then tags in this order: NEW (if applicable), work mode, "Probably worldwide" (if applicable), role type, level, and a salary chip such as `$165k – 205k` or the muted text "Salary not disclosed". Right side: age ("2 days ago") and an Apply button. Apply links go to `/go/{jobId}`, which logs the click and redirects to the employer's apply URL in a new tab. Promoted cards also show a "Featured" label and use `rel="sponsored nofollow noopener"`.

**7.4 Pages**

| Route | Purpose |
| --- | --- |
| `/` | search, location, filters, list |
| `/jobs/country/[country]` and `/jobs/role/[category]` | server-rendered landing pages for search traffic. Index them only when they have 5 or more jobs. |
| `/companies/[slug]` | one employer's open security roles |
| `/employers` | pricing and how placement works (section 8) |
| `/remove` | "remove my company" form that writes to `removal_requests` and emails the owner |
| `/privacy`, `/terms` | generated from a template, reviewed by the owner |

**7.5 SEO and performance**

Server-render everything, revalidate every 10 minutes, generate `sitemap.xml` and `robots.txt`, set canonical URLs and Open Graph tags. Do not add JobPosting structured data to aggregated listings: Google requires a full description, which this site deliberately does not store. Direct-posted jobs (section 10) may include it.

**7.6 Visual design**

The prototype's design tokens are the starting point: IBM Plex Sans and IBM Plex Mono, a cool light grey background, deep ink text, blue for primary actions, and a single orange "signal" color reserved for Featured and promoted items. Support light and dark mode through `prefers-color-scheme`. Mobile first: 16px side gutters, no horizontal scroll at 400px width, visible keyboard focus states.

**7.7 Footer copy**

"Checked daily, removed within 24 hours of the employer taking it down. Salaries are shown only when the employer publishes them. Want a company removed? \[email\]."

## 8. Paid placement rules

Placement is the product employers pay for, so it must be targeted, fair and clearly labelled.

**8.1 Rules**

1. **Targeted:** a promoted role is pinned only when it matches every active filter, including the visitor's country and remote setting. Promotion never overrides a filter.
2. **Pinned block:** at most 3 promoted roles are pinned at the top under a "Featured roles" label, above the normal list.
3. **Fair rotation:** when more than 3 promoted roles match, choose which 3 at random on every page load (client-side shuffle of the eligible pool, or an uncached API call) so each paying employer gets equal exposure. Do not let page caching freeze the order.
4. **One slot per employer:** a company-wide promotion (`job_id` null) pins only its single best-matching role per page view, so one employer with many roles cannot take all 3 slots.
5. **Overflow is not hidden:** promoted roles beyond the 3 pinned appear in the normal list in their usual order, still labelled Featured.
6. **Highlight add-on:** `highlight = true` gives the row a tinted background in both the pinned block and the normal list. It does not change ranking.
7. **Labelling:** every promoted row shows a "Featured" label. Do not mix promoted and unpaid rows without it.
8. **Same rules everywhere:** the pinned block also appears at the top of matching country and role landing pages.
9. **Lifecycle:** a promotion applies only between `starts_at` and `ends_at`. If the underlying ATS job expires, pause the promotion, alert the owner, and offer the employer a replacement role or an extension.
10. **Unpaid listings stay fully visible.** They are never hidden, down-ranked below the fold artificially, or labelled negatively.

**8.2 What the employer gets**

| Benefit | Featured ($199 / 30 days) | Featured Plus ($399 / 45 days) |
| --- | --- | --- |
| Pinned for matching searches | yes | yes |
| Featured label | yes | yes |
| Highlight color | add-on | included |
| Weekly views and apply-click report | yes | yes |
| Newsletter placement | no | yes |
| Social post | no | yes |
| Roles covered | 1 | up to 3 |
| Re-post free if 0 apply clicks in 14 days | yes | yes |

The founding offer gives the first 10 employers Featured at $99, and they keep $99 for their next listing.

**8.3 Direct listings**

A job posted directly (not from an ATS) is treated exactly like an aggregated job for ranking. It may include a description because the employer wrote it for this site.

## 9. Tracking and the weekly employer report

The report is what makes a paid listing feel worth it, so the numbers must be real and the tracking reliable.

**9.1 Apply clicks**

`GET /go/[jobId]` looks up the job, inserts an `apply_click` row, then returns a 302 to `apply_url`.

- Record `country` from the platform's geo header (on Vercel, `x-vercel-ip-country`). Never store the IP address.
- Set `was_promoted` by checking whether an active promotion covered the job at click time.
- Ignore bots: skip user agents matching bot, crawler, spider, preview, and HEAD requests.
- De-duplicate repeat clicks from the same browser with a 30 minute cookie per job.
- If the job is expired or removed, redirect to the company page instead of a dead link.

**9.2 Views (impressions)**

Log a `view` only for promoted jobs, when the card is at least half visible (IntersectionObserver), batched and sent with `navigator.sendBeacon` to `POST /api/events`. Limit to one view per job per browser session. Free listings only count clicks, which keeps storage small.

**9.3 Weekly report**

A GitHub Actions job runs every Monday 06:00 UTC. For each active promotion it computes, for the last 7 days and the whole campaign:

- views, apply clicks and click-through rate
- top 5 countries of clickers
- comparison: median apply clicks of unpromoted roles in the same role type
- days remaining

Send it by email through Resend and also expose it at `/report/[token]`, a private page with an unguessable token, so the employer never depends on email. Add `contact_email` and `report_token` columns to `promotions`. Show the real numbers even when they are small.

**9.4 Guarantee check**

A daily job finds promotions at day 14 with zero apply clicks, extends `ends_at` by 30 days, writes a note in `promotions.notes`, and emails the owner.

**9.5 Site analytics**

Add Plausible (or Umami) to every page for visits, referrers and countries. These are the numbers to show employers when asking for the first listing.

## 10. Admin, direct posting and payments

**10.1 Admin area (`/admin`, owner only)**

Authenticate with a Supabase magic link and allow only the address in `ADMIN_EMAIL`. Pages:

- **Dashboard:** last pipeline run, failing slugs, active job count, visits this week, apply clicks this week.
- **Companies:** add or edit roster entries, test a slug live, upload a logo, toggle `blocked`.
- **Promotions:** create a promotion (company, optional job, tier, highlight, dates, price, contact email), see its live numbers, extend or end it.
- **Removal requests:** list with one-click "block company" that sets `blocked = true` and marks matching jobs `removed`.
- **Jobs:** search all jobs, manually remove one, mark one as direct.

**10.2 Phase 1: manual selling (build first)**

No self-serve checkout. The owner talks to an employer, sends a payment link from the chosen processor, then creates the promotion in the admin. This is enough to win the first 10 customers and avoids building payments before demand is proven.

**10.3 Phase 2: self-serve (build only after the first paid listing)**

1. `/employers/post` form: company, role title, apply URL, location, salary (optional), contact email, plan.
2. Create a `pending` direct job and a processor checkout session.
3. A webhook on successful payment sets the job `active`, creates the promotion, and emails a receipt and the report link.
4. Direct jobs may include a description and get JobPosting structured data.
5. Confirm which payment processor accepts an India-based seller before choosing. Do not store card data; the processor hosts the payment page.

**10.4 Removal requests**

The `/remove` form writes to `removal_requests` and emails the owner. Target response time is 24 hours. Blocking a company stops the pipeline from ever listing it again.

## 11. Compliance guardrails and copy rules

Light, cheap rules that keep the board low-risk. This is not legal advice.

**Data**

- Link out to the employer's apply page. Store only the fields listed in section 5. Never store or display scraped job descriptions for aggregated jobs.
- Poll politely (section 6.7), with a real contact email in the user-agent.
- Read the Greenhouse, Lever and Ashby API terms once and note anything that restricts reuse in the README.
- Honor removal requests within 24 hours and keep blocked companies blocked.
- Show a company's logo only next to that company's own jobs. Never use logos in ads or marketing in a way that implies the company endorses the board.
- Do not store IP addresses or personal data about visitors. Store only the country on events.

**Copy that is allowed**

- "Checked daily, removed within 24 hours of the employer taking it down."
- "Salaries are shown only when the employer publishes them."
- "Featured" label on every paid row.

**Copy that is not allowed**

- "Zero ghost jobs", "100% salary transparency", "every job verified", or any AI-estimated salary presented as real.
- Any claim about traffic or applicant numbers that the analytics cannot back up.
- Any claim that employers were contacted or approved when they were not.

**When to get a lawyer:** after a formal complaint or cease-and-desist letter, or before adding descriptions, selling bulk data, or running paid logo placements.

## 12. Build phases, prototype files and scope

**12.1 Phases**

Build in this order. Do not start a phase until the previous one meets its done criteria.

| Phase | Build | Done when |
| --- | --- | --- |
| 0. Setup | Repo, Supabase project and migrations (section 5), Vercel project, `.env.example`, CI | `ci.yml` runs green and the migrations apply to a fresh database |
| 1. Pipeline | Port the prototype to Postgres, 100+ verified roster entries, GitHub Actions cron, tests (6.8) | A live run gives 300+ active roles from 80+ employers. A second run creates no duplicates. A removed test job expires. |
| 2. Public site | Home page, location picker, all filters, job card, letter logos, URL state, mobile layout | Acceptance tests A1 to A8 below pass |
| 3. Placement and tracking | `promotions` table, pinned block, `/go` redirect, view logging, admin promotions page | Acceptance tests B1 to B7 pass |
| 4. Trust and SEO | `/remove`, `/privacy`, `/terms`, `/employers`, company pages, landing pages, sitemap | A removal request blocks a company on the next run; landing pages are indexable only with 5+ jobs |
| 5. Launch | Custom domain, Plausible, favicon logos, first outreach list of 100 employers | Site is live and the owner can send the first outreach message |
| 6. After the first paid listing | Weekly report email, `/report/[token]`, self-serve checkout, newsletter | Only start when a first employer has paid |

**12.2 Acceptance tests**

- **A1:** with country India selected, results include roles located in India and remote roles marked worldwide or probably worldwide, and exclude "Remote - US" roles.
- **A2:** unchecking "Include remote roles" removes all remote-only results.
- **A3:** each filter facet count equals the number of results after selecting it.
- **A4:** "Salary shown only" returns only jobs with employer-stated pay.
- **A5:** filter state survives a reload and a shared link.
- **A6:** at 400px width the page does not scroll horizontally and filters collapse behind a button.
- **A7:** a job with no pay shows "Salary not disclosed", never a number.
- **A8:** the first full pipeline run shows no NEW tags.
- **B1:** at most 3 promoted roles are pinned, and only roles matching all active filters.
- **B2:** over 20 reloads with 5 eligible promoted roles, each appears pinned at least once.
- **B3:** a company-wide promotion pins one role, not several.
- **B4:** a click on Apply logs one `apply_click`, then redirects; a second click within 30 minutes does not log again.
- **B5:** an expired job redirects to its company page.
- **B6:** an expired promotion disappears from the pinned block with no deploy.
- **B7:** an anonymous Supabase client cannot read `events`, blocked companies or expired jobs, and cannot write to `jobs`.

**12.3 Existing prototype files**

The owner will hand these to you. They are working references, not final code.

| File | State |
| --- | --- |
| `fetch_jobs.py` | SQLite version of the pipeline: fetchers, security filter, upsert, expiry with empty-feed safeguard, JSON export. Tested only with mocked data. |
| `enrich.py` | Country, work mode, category, level and salary-flag rules. Lightly tested. Needs `probably_worldwide`, region words (Europe, EU, EMEA) and more cities. |
| `test_mock.py` | Mocked three-run test for upsert and expiry. Passes. |
| `companies.json` | 10 starter employers. Slugs are unverified guesses. |
| `make_demo.py` and `site/jobs.json` | 35 clearly fictional sample jobs for previewing the UI. Never ship them. |
| `site/index.html` | Single-file static prototype of the UI: location, filters, pinned featured block, employers page. Written but not yet run in a browser. |

The live ATS APIs were not reachable from the environment where the prototype was written, so the fetchers have never run against real data. Expect to fix field names or edge cases on the first live run.

**12.4 Out of scope for now**

User accounts, saved jobs and job alerts, on-site applications, AI-estimated salaries, scraping sites that are not Greenhouse, Lever or Ashby, storing job descriptions for aggregated roles, multiple languages, native mobile apps, company reviews.

**12.5 After the build**

Two documents follow: a traffic plan (X, Reddit, weekly digest, country and role landing pages) and the founding-employer outreach message. They are not part of this build.
