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


def reset_client():
    global _client
    _client = None


def get_client(force_new: bool = False):
    global _client
    if force_new or _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.")
        from supabase import create_client
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def ensure_company(company_meta: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Get or insert company in companies table. If blocked, return None to skip."""
    slug = company_meta["slug"]
    for attempt in range(2):
        try:
            client = get_client()
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
        except Exception as e:
            reset_client()
            if attempt == 1:
                raise



def sync_company_jobs(
    company_row: Dict[str, Any],
    source: str,
    jobs: List[Dict[str, Any]],
    run_ts: str,
) -> Tuple[int, int, Optional[str]]:
    """Upsert security jobs, apply 80% safeguard, and expire vanished roles.
    Safeguards:
    - Empty feed or >80% drop skips immediate expiry, but expires active jobs not seen for >18h.
    Returns (num_upserted, num_expired, warning_or_error_msg).
    """
    company_id = company_row["id"]
    company_name = company_row["name"]

    run_dt = dt.datetime.fromisoformat(run_ts.replace("Z", "+00:00"))
    cutoff_18h = (run_dt - dt.timedelta(hours=18)).isoformat()

    if not jobs:
        # Empty feed safeguard: skip immediate expiry, but expire jobs stale >18h
        for attempt in range(2):
            try:
                client = get_client()
                stale_res = client.table("jobs") \
                    .update({"status": "expired"}) \
                    .eq("company_id", company_id) \
                    .eq("status", "active") \
                    .lt("last_seen", cutoff_18h) \
                    .execute()
                stale_expired = len(stale_res.data or [])
                if stale_expired > 0:
                    warn = f"Empty feed for {company_name}: expired {stale_expired} stale roles older than 18h grace period."
                else:
                    warn = f"Empty feed for {company_name}; expiry skipped (within 18h grace window)."
                return 0, stale_expired, warn
            except Exception:
                reset_client()
                if attempt == 1:
                    raise
        return 0, 0, f"Empty feed for {company_name}; expiry skipped"

    for attempt in range(2):
        try:
            client = get_client()
            # Fetch currently active job count for this company to check 80% drop safeguard
            existing_res = client.table("jobs") \
                .select("id, external_id", count="exact") \
                .eq("company_id", company_id) \
                .eq("status", "active") \
                .execute()
            
            prev_active_count = existing_res.count if existing_res.count is not None else len(existing_res.data or [])

            # Fetch any jobs marked 'excluded' so normal runs never reactivate them
            excluded_res = client.table("jobs") \
                .select("external_id") \
                .eq("company_id", company_id) \
                .eq("status", "excluded") \
                .execute()
            excluded_external_ids = {str(r["external_id"]) for r in (excluded_res.data or [])}

            # Prepare upsert batch (skipping any permanently excluded external IDs)
            upsert_rows = []
            for j in jobs:
                ext_id = str(j["external_id"])
                if ext_id in excluded_external_ids:
                    continue
                row = {
                    "source": source,
                    "company_id": company_id,
                    "external_id": ext_id,
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

            # Safeguard check: If count drops by > 80%, skip immediate expiry, but expire jobs stale >18h
            new_count = len(upsert_rows)
            if prev_active_count >= 5 and new_count < (prev_active_count * 0.2):
                stale_res = client.table("jobs") \
                    .update({"status": "expired"}) \
                    .eq("company_id", company_id) \
                    .eq("status", "active") \
                    .lt("last_seen", cutoff_18h) \
                    .execute()
                stale_expired = len(stale_res.data or [])
                if stale_expired > 0:
                    warning = f"Safeguard triggered for {company_name}: count dropped from {prev_active_count} to {new_count} (>80% drop). Expired {stale_expired} stale roles older than 18h grace period."
                else:
                    warning = f"Safeguard triggered for {company_name}: count dropped from {prev_active_count} to {new_count} (>80% drop). Expiry skipped (within 18h grace window)."
                return new_count, stale_expired, warning

            # Normal healthy expiry: mark roles not seen in this run as expired
            expire_res = client.table("jobs") \
                .update({"status": "expired"}) \
                .eq("company_id", company_id) \
                .eq("status", "active") \
                .lt("last_seen", run_ts) \
                .execute()

            expired_count = len(expire_res.data or [])
            return new_count, expired_count, None
        except Exception as e:
            reset_client()
            if attempt == 1:
                raise


def expire_stale_jobs_on_failure(
    company_row: Dict[str, Any],
    run_ts: str,
    reason: str,
    threshold_hours: int = 72,
) -> Tuple[int, Optional[str]]:
    """Expire active jobs for a company whose fetch failed or returned 404,
    if they have not been seen for longer than threshold_hours (default: 72h).
    """
    company_id = company_row["id"]
    company_name = company_row["name"]
    run_dt = dt.datetime.fromisoformat(run_ts.replace("Z", "+00:00"))
    cutoff_ts = (run_dt - dt.timedelta(hours=threshold_hours)).isoformat()

    for attempt in range(2):
        try:
            client = get_client()
            stale_res = client.table("jobs") \
                .update({"status": "expired"}) \
                .eq("company_id", company_id) \
                .eq("status", "active") \
                .lt("last_seen", cutoff_ts) \
                .execute()
            stale_expired = len(stale_res.data or [])
            if stale_expired > 0:
                warning = f"Fetch failed for {company_name} ({reason}): expired {stale_expired} stale roles older than {threshold_hours}h grace period."
                return stale_expired, warning
            return 0, None
        except Exception:
            reset_client()
            if attempt == 1:
                raise


def log_pipeline_run(
    started_at: str,
    finished_at: str,
    companies_ok: int,
    companies_failed: int,
    jobs_active: int,
    jobs_expired: int,
    errors: List[Dict[str, Any]],
    company_stats: Optional[List[Dict[str, Any]]] = None,
):
    """Record execution telemetry in pipeline_runs table.
    company_stats is written to the jsonb column if the column exists; silently
    skipped if the migration has not been applied yet.
    """
    try:
        client = get_client()
        payload: Dict[str, Any] = {
            "started_at": started_at,
            "finished_at": finished_at,
            "companies_ok": companies_ok,
            "companies_failed": companies_failed,
            "jobs_active": jobs_active,
            "jobs_expired": jobs_expired,
            "errors": errors,
        }
        if company_stats is not None:
            payload["company_stats"] = company_stats
        try:
            client.table("pipeline_runs").insert(payload).execute()
        except Exception as inner:
            # If company_stats column does not exist yet, retry without it
            if "company_stats" in str(inner) and company_stats is not None:
                payload.pop("company_stats", None)
                client.table("pipeline_runs").insert(payload).execute()
            else:
                raise
    except Exception as e:
        print(f"Warning: Failed to log pipeline run: {e}")
