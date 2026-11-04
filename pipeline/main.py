"""Cyberboard main ingestion entry point.
Fetches public career feeds from verified roster, filters cybersecurity roles,
enriches them with classification metadata, and upserts them to Supabase Postgres.
"""
import sys
import json
import time
import argparse
import datetime as dt
from pathlib import Path

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).parent))

from filters import is_security
from enrich import enrich
from fetchers import FETCHERS

ROSTER_PATH = Path(__file__).parent / "roster" / "companies.json"
PAUSE_BETWEEN_COMPANIES = 0.5


def run_pipeline(export_json_path: str = None, limit: int = None, target_company: str = None):
    started_at = dt.datetime.now(dt.timezone.utc).isoformat()
    print(f"[{started_at}] Starting Cyberboard Ingestion Pipeline...")

    if not ROSTER_PATH.exists():
        print(f"Error: Roster file not found at {ROSTER_PATH}")
        sys.exit(1)

    companies = json.loads(ROSTER_PATH.read_text(encoding="utf-8"))
    if target_company:
        companies = [c for c in companies if c["slug"].lower() == target_company.lower()]
        print(f"Filtered to target company: {target_company} (found {len(companies)})")
    elif limit and limit > 0:
        companies = companies[:limit]
        print(f"Limited run to first {limit} companies.")
    else:
        print(f"Loaded {len(companies)} companies from roster.")

    # Determine database mode
    use_supabase = False
    try:
        from db import ensure_company, sync_company_jobs, log_pipeline_run
        use_supabase = True
    except Exception as e:
        print(f"Note: Supabase credentials not found or error ({e}). Running in offline/export mode.")

    companies_ok = 0
    companies_failed = 0
    total_active_jobs = 0
    total_expired_jobs = 0
    errors = []
    all_enriched_jobs = []

    for idx, c in enumerate(companies):
        name = c.get("name", c["slug"])
        slug = c["slug"]
        ats = c.get("ats", "greenhouse")
        host_key = c.get("lever_host")

        fetcher = FETCHERS.get(ats)
        if not fetcher:
            print(f"[{idx+1}/{len(companies)}] Unknown ATS '{ats}' for {name}")
            companies_failed += 1
            errors.append({"company": name, "error": f"Unknown ATS: {ats}"})
            continue

        try:
            if ats == "lever":
                raw_jobs = fetcher(slug, host_key)
            else:
                raw_jobs = fetcher(slug)
        except Exception as err:
            print(f"[{idx+1}/{len(companies)}] ❌ Fetch error for {name}: {err}")
            companies_failed += 1
            errors.append({"company": name, "error": str(err)})
            time.sleep(PAUSE_BETWEEN_COMPANIES)
            continue

        if raw_jobs is None:
            print(f"[{idx+1}/{len(companies)}] ⚠️  404/Empty board for {name} ({slug}) on {ats}")
            companies_failed += 1
            errors.append({"company": name, "error": "Board returned 404"})
            time.sleep(PAUSE_BETWEEN_COMPANIES)
            continue

        # Filter & enrich cybersecurity roles
        sec_jobs = []
        for j in raw_jobs:
            matched, keyword = is_security(j.get("title", ""), j.get("department", ""))
            if matched:
                j["company"] = name
                j["company_slug"] = slug
                j["matched_keyword"] = keyword
                enriched = enrich(j)
                sec_jobs.append(enriched)
                all_enriched_jobs.append(enriched)

        if use_supabase:
            try:
                comp_row = ensure_company(c)
                if comp_row is None:
                    print(f"[{idx+1}/{len(companies)}] Company {name} is blocked; skipped.")
                    continue
                n_upsert, n_exp, warn = sync_company_jobs(comp_row, ats, sec_jobs, started_at)
                if warn:
                    errors.append({"company": name, "warning": warn})
                total_active_jobs += n_upsert
                total_expired_jobs += n_exp
                print(f"[{idx+1}/{len(companies)}] ✅ {name} [{ats}]: {len(raw_jobs)} total -> {len(sec_jobs)} security ({n_exp} expired)")
            except Exception as db_err:
                print(f"[{idx+1}/{len(companies)}] Database error for {name}: {db_err}")
                errors.append({"company": name, "error": str(db_err)})
        else:
            total_active_jobs += len(sec_jobs)
            print(f"[{idx+1}/{len(companies)}] ✅ {name} [{ats}]: {len(raw_jobs)} total -> {len(sec_jobs)} security")

        companies_ok += 1
        time.sleep(PAUSE_BETWEEN_COMPANIES)

    finished_at = dt.datetime.now(dt.timezone.utc).isoformat()
    print("\n================ Pipeline Finished ================")
    print(f"Companies OK: {companies_ok} | Failed: {companies_failed}")
    print(f"Total Security Jobs Active: {total_active_jobs} | Expired: {total_expired_jobs}")

    if export_json_path:
        out_file = Path(export_json_path)
        out_file.parent.mkdir(parents=True, exist_ok=True)
        out_file.write_text(json.dumps(all_enriched_jobs, indent=2, default=str), encoding="utf-8")
        print(f"Exported {len(all_enriched_jobs)} jobs to {export_json_path}")

    if use_supabase:
        log_pipeline_run(
            started_at=started_at,
            finished_at=finished_at,
            companies_ok=companies_ok,
            companies_failed=companies_failed,
            jobs_active=total_active_jobs,
            jobs_expired=total_expired_jobs,
            errors=errors,
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cyberboard Ingestion Pipeline")
    parser.add_argument("--export-json", type=str, default=None, help="Path to export JSON output (e.g. site/jobs.json)")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of companies to process")
    parser.add_argument("--company", type=str, default=None, help="Process a specific company by slug")
    args = parser.parse_args()
    run_pipeline(export_json_path=args.export_json, limit=args.limit, target_company=args.company)
