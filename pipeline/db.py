"""Database operations for Cyberboard pipeline (Supabase Postgres).
Handles company resolution, idempotent job upserts, expiry logic, safeguards,
and telemetry logging to pipeline_runs.
"""
import os
import datetime as dt
from typing import List, Dict, Any, Tuple, Optional
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()
load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent.parent / "web" / ".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SECRET_KEY")

_client = None


def get_client():
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.")
        from supabase import create_client
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def ensure_company(company_meta: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Get or insert company in companies table. If blocked, return None to skip."""
    client = get_client()
    slug = company_meta["slug"]
    
    # Query existing company
    res = client.table("companies").select("*").eq("slug", slug).execute()
    if res.data and len(res.data) > 0:
        c = res.data[0]
        if c.get("blocked"):
            # Ensure its jobs are marked 'removed'
            client.table("jobs").update({"status": "removed"}).eq("company_id", c["id"]).execute()
            return None
        return c

    # Insert new company
    payload = {
        "slug": slug,
        "name": company_meta.get("name", slug),
        "ats": company_meta.get("ats", "greenhouse"),
        "lever_host": company_meta.get("lever_host"),
        "domain": company_meta.get("domain"),
        "hq_country": company_meta.get("hq_country"),
        "blocked": False,
    }
    insert_res = client.table("companies").insert(payload).execute()
    if insert_res.data and len(insert_res.data) > 0:
        return insert_res.data[0]
    return None


def sync_company_jobs(
    company_row: Dict[str, Any],
    source: str,
    jobs: List[Dict[str, Any]],
    run_ts: str,
) -> Tuple[int, int, Optional[str]]:
    """Upsert security jobs, apply 80% safeguard, and expire vanished roles.
    Returns (num_upserted, num_expired, warning_or_error_msg).
    """
    client = get_client()
    company_id = company_row["id"]
    company_name = company_row["name"]

    if not jobs:
        # Empty feed safeguard: do not expire anything
        return 0, 0, f"Empty feed for {company_name}; expiry skipped"

    # Fetch currently active job count for this company to check 80% drop safeguard
    existing_res = client.table("jobs") \
        .select("id, external_id", count="exact") \
        .eq("company_id", company_id) \
        .eq("status", "active") \
        .execute()
    
    prev_active_count = existing_res.count if existing_res.count is not None else len(existing_res.data or [])

    # Prepare upsert batch
    upsert_rows = []
    for j in jobs:
        row = {
            "source": source,
            "company_id": company_id,
            "external_id": str(j["external_id"]),
            "title": j["title"],
            "location": j.get("location"),
            "countries": j.get("countries", []),
            "work_mode": j.get("work_mode", "On-site"),
            "worldwide": j.get("worldwide", False),
            "probably_worldwide": j.get("probably_worldwide", False),
            "department": j.get("department"),
            "category": j.get("category", "Other Security"),
            "level": j.get("level", "Mid-level"),
            "apply_url": j.get("apply_url", ""),
            "posted_at": j.get("posted_at"),
            "salary_min": j.get("salary_min"),
            "salary_max": j.get("salary_max"),
            "salary_currency": j.get("salary_currency"),
            "salary_text": j.get("salary_text"),
            "status": "active",
            "last_seen": run_ts,
        }
        upsert_rows.append(row)

    if upsert_rows:
        # Upsert in chunks to avoid payload limits
        chunk_size = 50
        for i in range(0, len(upsert_rows), chunk_size):
            chunk = upsert_rows[i:i + chunk_size]
            client.table("jobs").upsert(
                chunk,
                on_conflict="source,company_id,external_id"
            ).execute()

    # Safeguard check: If count drops by > 80%, skip expiry
    warning = None
    new_count = len(upsert_rows)
    if prev_active_count >= 5 and new_count < (prev_active_count * 0.2):
        warning = f"Safeguard triggered for {company_name}: count dropped from {prev_active_count} to {new_count} (>80% drop). Expiry skipped."
        return new_count, 0, warning

    # Mark roles not seen in this run as expired
    expire_res = client.table("jobs") \
        .update({"status": "expired"}) \
        .eq("company_id", company_id) \
        .eq("status", "active") \
        .lt("last_seen", run_ts) \
        .execute()

    expired_count = len(expire_res.data or [])
    return new_count, expired_count, None


def log_pipeline_run(
    started_at: str,
    finished_at: str,
    companies_ok: int,
    companies_failed: int,
    jobs_active: int,
    jobs_expired: int,
    errors: List[Dict[str, Any]]
):
    """Record execution telemetry in pipeline_runs table."""
    try:
        client = get_client()
        client.table("pipeline_runs").insert({
            "started_at": started_at,
            "finished_at": finished_at,
            "companies_ok": companies_ok,
            "companies_failed": companies_failed,
            "jobs_active": jobs_active,
            "jobs_expired": jobs_expired,
            "errors": errors,
        }).execute()
    except Exception as e:
        print(f"Warning: Failed to log pipeline run: {e}")
