# Cyberboard

A high-signal job board for the cybersecurity sector, aggregating real, active roles from employers' public career pages (Greenhouse, Lever US/EU, Ashby).

## Key Principles & Guardrails
- **Link-out only:** We store metadata and redirect candidates directly to employer career pages. No scraped job descriptions are stored.
- **Employer-stated pay only:** No AI-estimated salaries. If an employer has not published pay, we display "Salary not disclosed".
- **Daily freshness:** Positions are checked daily and expired automatically when removed from the employer's board.
- **Fair placement:** Targeted promoted roles matching visitor filters with random rotation.

## Monorepo Architecture
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
│  ├─ migrations/             # SQL schemas & RLS policies
│  └─ seed.sql                # sample promotions for local testing
├─ web/                       # Next.js app (App Router, Tailwind CSS, TypeScript)
└─ docs/
   └─ PLAN.md                 # Implementation specification
```

## Setup & Development

### 1. Ingestion Pipeline
```bash
# Install dependencies
pip install -r pipeline/requirements.txt

# Run test suite
pytest pipeline/tests -v

# Run verification on roster slugs
python pipeline/verify_roster.py

# Run ingestion pipeline
python pipeline/main.py
```

### 2. Database Migrations
Migrations are managed in `supabase/migrations/`.
Apply to your Supabase project using the Supabase CLI or the SQL Editor.
