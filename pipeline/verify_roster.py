"""Verify every slug in the roster against public ATS APIs.
Flags 404s and empty boards, detects ATS when unspecified, and updates the verified roster.
"""
import json
import time
from pathlib import Path
from fetchers import FETCHERS

ROSTER_PATH = Path(__file__).parent / "roster" / "companies.json"
PAUSE = 0.5


def verify_slug(slug: str, ats: str = None, host_key: str = None):
    order = [ats] if ats else ["greenhouse", "lever", "ashby"]
    for candidate_ats in order:
        fetcher = FETCHERS.get(candidate_ats)
        try:
            if candidate_ats == "lever":
                jobs = fetcher(slug, host_key)
            else:
                jobs = fetcher(slug)
        except Exception as e:
            print(f"  [error] {slug} on {candidate_ats}: {e}")
            jobs = None

        if jobs is not None:
            return candidate_ats, len(jobs)
    return None, 0


def main():
    if not ROSTER_PATH.exists():
        print(f"Roster not found at {ROSTER_PATH}")
        return

    companies = json.loads(ROSTER_PATH.read_text(encoding="utf-8"))
    print(f"Verifying {len(companies)} companies in roster...\n")

    valid = []
    failed = []
    empty = []

    for idx, c in enumerate(companies):
        name = c.get("name", c["slug"])
        slug = c["slug"]
        ats = c.get("ats")
        host_key = c.get("lever_host")

        detected_ats, count = verify_slug(slug, ats, host_key)
        if detected_ats is None:
            failed.append((name, slug))
            print(f"[{idx+1}/{len(companies)}] ❌ FAILED: {name} ({slug}) - no board found")
        elif count == 0:
            c["ats"] = detected_ats
            valid.append(c)
            empty.append((name, slug, detected_ats))
            print(f"[{idx+1}/{len(companies)}] ⚠️  EMPTY: {name} ({slug}) on {detected_ats} (0 jobs)")
        else:
            c["ats"] = detected_ats
            valid.append(c)
            print(f"[{idx+1}/{len(companies)}] ✅ OK: {name} ({slug}) on {detected_ats} -> {count} jobs")

        time.sleep(PAUSE)

    print("\n--- Summary ---")
    print(f"Total: {len(companies)} | Valid: {len(valid)} | Failed: {len(failed)} | Empty: {len(empty)}")
    if failed:
        print("\nSlugs requiring attention:")
        for name, slug in failed:
            print(f"  - {name}: slug '{slug}' returned 404 across all ATS")


if __name__ == "__main__":
    main()
