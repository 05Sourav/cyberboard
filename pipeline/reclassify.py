"""One-time reclassification script for stored jobs.
Re-runs tightened security filter and refined category rules.
Disqualified jobs are updated to status='excluded' with exclusion_reason (never deleted).
Bypasses the 80% drop safeguard deliberately.
Supports --dry-run and --apply modes.
"""
import sys
import json
import argparse
from pathlib import Path
from collections import defaultdict, Counter

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

sys.path.insert(0, str(Path(__file__).parent))

from filters import is_security
from enrich import category_for, level_for

JOBS_JSON_PATH = Path(__file__).parent / "roster" / "jobs.json"


def reclassify(dry_run: bool = True):
    print("=" * 70)
    print(f"Cyberboard Job Reclassification (Mode: {'DRY-RUN' if dry_run else 'APPLY'})")
    print("=" * 70)

    # 1. Attempt DB connection
    client = None
    use_supabase = False
    try:
        from db import get_client
        client = get_client()
        client.table("companies").select("id").limit(1).execute()
        use_supabase = True
        print("Connected to Supabase Postgres database.")
    except Exception as e:
        print(f"Note: Supabase unreachable ({e}). Using local roster/jobs.json.")

    jobs_data = []
    if use_supabase:
        try:
            res = client.table("jobs").select("*, companies(name, slug)").execute()
            jobs_data = res.data or []
            print(f"Fetched {len(jobs_data)} jobs from Supabase.")
        except Exception as e:
            print(f"Supabase fetch failed: {e}. Falling back to jobs.json.")
            use_supabase = False

    if not use_supabase:
        if not JOBS_JSON_PATH.exists():
            print(f"Error: {JOBS_JSON_PATH} not found.")
            sys.exit(1)
        jobs_data = json.loads(JOBS_JSON_PATH.read_text(encoding="utf-8"))
        print(f"Loaded {len(jobs_data)} jobs from {JOBS_JSON_PATH.name}.")

    # Tracking metrics
    company_before = Counter()
    company_after = Counter()
    company_excluded = Counter()
    exclusion_reasons = Counter()
    category_before = Counter()
    category_after = Counter()

    to_exclude = []
    to_update = []
    kept_other_security = []

    for j in jobs_data:
        comp_name = j.get("company") or (j.get("companies") or {}).get("name") or "Unknown"
        title = j.get("title") or ""
        dept = j.get("department") or ""
        current_status = j.get("status") or "active"
        current_cat = j.get("category") or "Other Security"

        # Record before stats (for currently active / stored jobs)
        if current_status == "active":
            company_before[comp_name] += 1
            category_before[current_cat] += 1

        # Check qualification with new tightened filter
        is_sec, kw, reason = is_security(title, dept, explain=True)

        if not is_sec:
            company_excluded[comp_name] += 1
            exclusion_reasons[reason] += 1
            to_exclude.append({
                "job": j,
                "company": comp_name,
                "title": title,
                "department": dept,
                "reason": reason,
            })
        else:
            new_cat = category_for(title, dept)
            new_level = level_for(title)
            company_after[comp_name] += 1
            category_after[new_cat] += 1

            if new_cat == "Other Security":
                kept_other_security.append((comp_name, title))

            to_update.append({
                "job": j,
                "company": comp_name,
                "title": title,
                "category": new_cat,
                "level": new_level,
                "matched_keyword": kw,
            })

    # Summary calculations
    total_before = sum(company_before.values())
    total_excluded = len(to_exclude)
    total_after = len(to_update)

    print("\n" + "=" * 70)
    print("Table B: Dry-Run Summary (Per-Company Exclusions & Totals)")
    print("=" * 70)
    print(f"{'Company':<32} | {'Before':<8} | {'Excluded':<9} | {'After':<8}")
    print("-" * 65)

    all_companies = sorted(set(list(company_before.keys()) + list(company_excluded.keys())))
    for c in all_companies:
        b = company_before[c]
        ex = company_excluded[c]
        a = company_after[c]
        if ex > 0 or b > 0:
            print(f"{c:<32} | {b:<8} | {ex:<9} | {a:<8}")

    print("-" * 65)
    print(f"{'TOTAL':<32} | {total_before:<8} | {total_excluded:<9} | {total_after:<8}")

    print("\n" + "=" * 70)
    print("Top Exclusion Reasons")
    print("=" * 70)
    for r, cnt in exclusion_reasons.most_common():
        print(f"  {cnt:3d}x | {r}")

    print("\n" + "=" * 70)
    print("Table C: Category Distribution Before vs After")
    print("=" * 70)
    print(f"{'Category':<26} | {'Before':<15} | {'After':<15}")
    print("-" * 65)

    all_cats = [
        "Leadership",
        "GRC & Compliance",
        "Offensive Security",
        "Application Security",
        "Cloud Security",
        "Identity & Access",
        "SOC & Incident Response",
        "Threat Intelligence",
        "Security Engineering",
        "Other Security",
    ]

    for cat in all_cats:
        b_cnt = category_before[cat]
        b_pct = (b_cnt / total_before * 100) if total_before else 0
        a_cnt = category_after[cat]
        a_pct = (a_cnt / total_after * 100) if total_after else 0
        print(f"{cat:<26} | {b_cnt:3d} ({b_pct:5.1f}%)    | {a_cnt:3d} ({a_pct:5.1f}%)")

    other_pct = (category_after['Other Security'] / total_after * 100) if total_after else 0
    print(f"\nOther Security share: {other_pct:.1f}% (target: <10%)")
    print(f"Remaining 'Other Security' roles ({len(kept_other_security)}):")
    for comp, tit in kept_other_security[:10]:
        print(f"  [{comp}] {tit}")
    if len(kept_other_security) > 10:
        print(f"  ... and {len(kept_other_security) - 10} more.")

    # 4. If APPLY mode, write changes
    if not dry_run:
        print("\n" + "=" * 70)
        print("Applying changes...")
        print("=" * 70)

        # Update Supabase if available
        if use_supabase and client:
            print("Updating Supabase database rows...")
            for item in to_exclude:
                job_id = item["job"]["id"]
                client.table("jobs").update({
                    "status": "excluded",
                    "exclusion_reason": item["reason"]
                }).eq("id", job_id).execute()

            for item in to_update:
                job_id = item["job"]["id"]
                client.table("jobs").update({
                    "category": item["category"],
                    "level": item["level"],
                }).eq("id", job_id).execute()
            print("Supabase update complete.")

        # Always update local jobs.json
        print(f"Updating {JOBS_JSON_PATH}...")
        updated_jobs_json = []
        for item in to_update:
            j = item["job"]
            j["status"] = "active"
            j["category"] = item["category"]
            j["level"] = item["level"]
            j["matched_keyword"] = item["matched_keyword"]
            updated_jobs_json.append(j)

        # Also preserve excluded jobs with status = 'excluded'
        for item in to_exclude:
            j = item["job"]
            j["status"] = "excluded"
            j["exclusion_reason"] = item["reason"]
            updated_jobs_json.append(j)

        JOBS_JSON_PATH.write_text(json.dumps(updated_jobs_json, indent=2), encoding="utf-8")
        print(f"Successfully wrote {len(updated_jobs_json)} jobs ({len(to_update)} active, {len(to_exclude)} excluded) to {JOBS_JSON_PATH.name}.")
    else:
        print("\n[Dry-run complete. Run with --apply to commit changes.]")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reclassify stored jobs")
    parser.add_argument("--dry-run", action="store_true", default=False, help="Dry run without writing changes")
    parser.add_argument("--apply", action="store_true", default=False, help="Apply changes to DB and jobs.json")
    args = parser.parse_args()

    is_dry_run = not args.apply
    reclassify(dry_run=is_dry_run)

