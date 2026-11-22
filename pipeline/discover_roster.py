"""
Cyberboard roster discovery script.
Probes candidate companies on Greenhouse, Lever US, Lever EU, and Ashby,
verifies slug identity, counts security jobs, and writes results to
pipeline/roster/discovery_results.json.

Polite: 0.5 s pause between requests, real contact email in User-Agent.
Run from the pipeline/ directory or project root.
"""

import sys
import os
import re
import json
import time
import datetime as dt
from pathlib import Path
from typing import Optional, List, Dict, Tuple, Any

# ── allow running from any directory ─────────────────────────────────────────
ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

import requests
from filters import is_security

# ── constants ─────────────────────────────────────────────────────────────────
PAUSE       = 0.5          # seconds between HTTP requests
TIMEOUT     = 20           # seconds per request
UA          = "secruit-discovery/1.0 (contact: singhsouraav4512@gmail.com)"
HEADERS     = {"User-Agent": UA}

CANDIDATES_PATH = ROOT / "roster" / "candidates.txt"
OUT_PATH        = ROOT / "roster" / "discovery_results.json"
ROSTER_PATH     = ROOT / "roster" / "companies.json"
WATCHLIST_PATH  = ROOT / "roster" / "watchlist.json"
UNSUPPORTED_PATH= ROOT / "roster" / "unsupported.txt"

GH_BOARD_API  = "https://boards-api.greenhouse.io/v1/boards"
LEVER_US_API  = "https://api.lever.co/v0/postings"
LEVER_EU_API  = "https://api.eu.lever.co/v0/postings"
ASHBY_API     = "https://api.ashbyhq.com/posting-api/job-board"

# ── existing roster (to avoid re-probing already-verified entries) ────────────
def load_existing_roster() -> Dict[Tuple[str, str], Dict]:
    """Returns dict keyed by (ats, slug)."""
    if ROSTER_PATH.exists():
        data = json.loads(ROSTER_PATH.read_text(encoding="utf-8"))
        return {(c["ats"], c["slug"]): c for c in data}
    return {}


# ── HTTP helper ───────────────────────────────────────────────────────────────
def _get(url: str, params: dict = None) -> Optional[requests.Response]:
    """Single GET with backoff on 429/5xx; returns None on 404 or hard failure."""
    delay = 1.0
    for attempt in range(3):
        try:
            r = requests.get(url, params=params, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code == 404:
                return None
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(delay)
                delay *= 2
                continue
            if r.status_code >= 400:
                return None
            return r
        except requests.RequestException:
            if attempt == 2:
                return None
            time.sleep(delay)
            delay *= 2
    return None


def _pause():
    time.sleep(PAUSE)


# ── name normalisation for identity check ────────────────────────────────────
def _norm(s: str) -> str:
    """Lower-case, strip common suffixes and punctuation for fuzzy name match."""
    s = s.lower().strip()
    for suffix in [" inc", " inc.", " llc", " ltd", " corp", " co.", " co",
                   " security", " labs", " systems", " technologies", " tech",
                   " hq", " io", ", inc"]:
        if s.endswith(suffix):
            s = s[: -len(suffix)].strip()
    return re.sub(r"[^a-z0-9 ]", "", s).strip()


def _names_match(candidate: str, returned: str, threshold: float = 0.6) -> bool:
    """True if the returned board name is sufficiently close to the candidate."""
    cn = _norm(candidate)
    rn = _norm(returned)
    if cn == rn:
        return True
    # Allow if one contains the other (handles "Palo Alto Networks" vs "PAN")
    if cn in rn or rn in cn:
        return True
    # Jaccard on words
    cw = set(cn.split())
    rw = set(rn.split())
    if not cw or not rw:
        return False
    j = len(cw & rw) / len(cw | rw)
    return j >= threshold


# ── security job counting ─────────────────────────────────────────────────────
def _count_security(jobs: List[Dict]) -> Tuple[int, int]:
    """Returns (total_jobs, security_jobs)."""
    sec = 0
    for j in jobs:
        matched, _ = is_security(j.get("title", ""), j.get("department", ""))
        if matched:
            sec += 1
    return len(jobs), sec


# ── ATS probe functions ───────────────────────────────────────────────────────
def probe_greenhouse(candidate_name: str, slug: str) -> Optional[Dict]:
    """
    Returns dict with keys: ats, slug, board_name, status, total_jobs, security_jobs
    or None if not found.
    """
    # First fetch board metadata for identity check
    meta_url = f"{GH_BOARD_API}/{slug}"
    r_meta = _get(meta_url)
    _pause()
    if r_meta is None:
        return None

    try:
        meta = r_meta.json()
    except Exception:
        return None

    board_name = meta.get("name", "")

    # Fetch jobs list
    jobs_url = f"{GH_BOARD_API}/{slug}/jobs"
    r_jobs = _get(jobs_url)
    _pause()
    if r_jobs is None:
        return None

    try:
        jobs_data = r_jobs.json().get("jobs", [])
    except Exception:
        jobs_data = []

    total, sec = _count_security(jobs_data)

    if _names_match(candidate_name, board_name):
        status = "verified"
    else:
        status = "needs_review"

    return {
        "ats": "greenhouse",
        "slug": slug,
        "board_name": board_name,
        "status": status,
        "total_jobs": total,
        "security_jobs": sec,
    }


def probe_lever(candidate_name: str, slug: str, host: str = "us") -> Optional[Dict]:
    """host = 'us' | 'eu'"""
    base = LEVER_US_API if host == "us" else LEVER_EU_API
    url = f"{base}/{slug}"
    r = _get(url, params={"mode": "json"})
    _pause()
    if r is None:
        return None

    try:
        data = r.json()
    except Exception:
        return None

    if not isinstance(data, list):
        return None

    # Build job dicts for counting
    jobs = [
        {
            "title": p.get("text", ""),
            "department": ((p.get("categories") or {}).get("department") or
                           (p.get("categories") or {}).get("team") or ""),
        }
        for p in data
    ]

    # Identity check: scan apply URLs for the domain hint, or just check name loosely
    # Lever doesn't return a board-level name; use the apply URL domain
    sample_domain = ""
    if data:
        hosted_url = data[0].get("hostedUrl", "")
        # hostedUrl looks like https://jobs.lever.co/{slug}/...
        m = re.search(r"lever\.co/([^/]+)", hosted_url)
        if m:
            sample_domain = m.group(1)

    if sample_domain and _names_match(candidate_name, sample_domain):
        status = "verified"
    elif not sample_domain and len(data) > 0:
        # Can't verify name but got jobs — mark needs_review
        status = "needs_review"
    elif len(data) == 0:
        status = "verified"  # board exists, just empty
    else:
        status = "needs_review"

    total, sec = _count_security(jobs)
    ats_key = "lever" if host == "us" else "lever_eu"
    return {
        "ats": ats_key,
        "slug": slug,
        "board_name": sample_domain or slug,
        "status": status,
        "total_jobs": total,
        "security_jobs": sec,
        "lever_host": host,
    }


def probe_ashby(candidate_name: str, slug: str) -> Optional[Dict]:
    url = f"{ASHBY_API}/{slug}"
    r = _get(url, params={"includeCompensation": "true"})
    _pause()
    if r is None:
        return None

    try:
        data = r.json()
    except Exception:
        return None

    board_name = data.get("organization", {}).get("name", "") if isinstance(data, dict) else ""
    jobs_raw = data.get("jobs", []) if isinstance(data, dict) else []

    jobs = [
        {"title": j.get("title", ""), "department": j.get("department", "") or j.get("team", "")}
        for j in jobs_raw
    ]

    total, sec = _count_security(jobs)

    if board_name and _names_match(candidate_name, board_name):
        status = "verified"
    elif board_name:
        status = "needs_review"
    else:
        status = "verified"  # Ashby doesn't always return org name; treat as ok

    return {
        "ats": "ashby",
        "slug": slug,
        "board_name": board_name or slug,
        "status": status,
        "total_jobs": total,
        "security_jobs": sec,
    }


# ── slug generation ───────────────────────────────────────────────────────────
def generate_slugs(name: str) -> List[str]:
    """Return ordered list of slug variants to try."""
    base = re.sub(r"[^a-z0-9]", "", name.lower())
    hyphenated = re.sub(r"[^a-z0-9]", "-", name.lower()).strip("-")
    words = re.sub(r"[^a-z0-9 ]", "", name.lower()).split()

    variants = []
    # Exact forms
    variants.append(base)
    variants.append(hyphenated)
    variants.append("".join(words))
    # Word joins
    if len(words) > 1:
        variants.append(words[0])
        variants.append("".join(words[:2]))

    # Common suffixes
    for suffix in ["hq", "inc", "security", "labs", "io", "ai", "tech"]:
        variants.append(base + suffix)

    # Dedupe while preserving order
    seen = set()
    out = []
    for v in variants:
        if v and v not in seen:
            seen.add(v)
            out.append(v)
    return out


# ── candidate parser ──────────────────────────────────────────────────────────
def parse_candidates(path: Path) -> List[Dict]:
    """
    Parse candidates.txt.
    Format lines: name|hint_ats|hint_slug|domain|hq_country|notes
    Lines starting with # or empty are skipped.
    """
    candidates = []
    seen_names = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 2:
            continue
        name = parts[0]
        if name.lower() in seen_names:
            continue
        seen_names.add(name.lower())
        candidates.append({
            "name": name,
            "hint_ats": parts[1] if len(parts) > 1 else "greenhouse",
            "hint_slug": parts[2] if len(parts) > 2 else "",
            "domain": parts[3] if len(parts) > 3 else "",
            "hq_country": parts[4] if len(parts) > 4 else "United States",
            "notes": parts[5] if len(parts) > 5 else "",
        })
    return candidates


# ── probe one candidate ───────────────────────────────────────────────────────
def probe_candidate(candidate: Dict, existing: Dict) -> Dict:
    """Try all relevant ATS + slug combos and return the best result."""
    name       = candidate["name"]
    hint_ats   = candidate["hint_ats"]
    hint_slug  = candidate["hint_slug"]
    domain     = candidate["domain"]
    hq_country = candidate["hq_country"]

    # Build slug list: hint first, then auto-generated
    slugs_to_try = []
    if hint_slug:
        slugs_to_try.append(hint_slug)
    for s in generate_slugs(name):
        if s not in slugs_to_try:
            slugs_to_try.append(s)

    # Determine which ATS to try (and in what order)
    ats_order = []
    if hint_ats in ("greenhouse", "lever", "lever_eu", "ashby"):
        ats_order.append(hint_ats)
    for fallback in ["greenhouse", "ashby", "lever", "lever_eu"]:
        if fallback not in ats_order:
            ats_order.append(fallback)

    best: Optional[Dict] = None

    for ats in ats_order:
        for slug in slugs_to_try[:6]:  # limit slug variants per ATS to keep runtime sane
            # Skip if already in roster as verified
            if (ats, slug) in existing:
                r = existing[(ats, slug)].copy()
                r["status"] = "verified"
                r["total_jobs"] = r.get("total_jobs", 0)
                r["security_jobs"] = r.get("security_jobs", 0)
                r["board_name"] = r.get("name", name)
                best = r
                break

            if ats == "greenhouse":
                result = probe_greenhouse(name, slug)
            elif ats == "lever":
                result = probe_lever(name, slug, host="us")
            elif ats == "lever_eu":
                result = probe_lever(name, slug, host="eu")
            elif ats == "ashby":
                result = probe_ashby(name, slug)
            else:
                result = None

            if result is not None:
                # Prefer verified over needs_review
                if best is None or (result["status"] == "verified" and best["status"] != "verified"):
                    best = result
                if best["status"] == "verified":
                    break  # stop trying more slugs once we have a verified hit

        if best and best["status"] == "verified":
            break  # stop trying more ATS once verified

    if best is None:
        return {
            "name": name,
            "ats": hint_ats,
            "slug": hint_slug or generate_slugs(name)[0],
            "board_name": "",
            "status": "not_found",
            "total_jobs": 0,
            "security_jobs": 0,
            "domain": domain,
            "hq_country": hq_country,
            "notes": candidate.get("notes", ""),
        }

    best["name"] = name
    best.setdefault("domain", domain)
    best.setdefault("hq_country", hq_country)
    best["notes"] = candidate.get("notes", "")
    return best


# ── main ──────────────────────────────────────────────────────────────────────
def main():
    if not CANDIDATES_PATH.exists():
        print(f"ERROR: {CANDIDATES_PATH} not found")
        sys.exit(1)

    candidates = parse_candidates(CANDIDATES_PATH)
    existing   = load_existing_roster()
    results    = []
    total      = len(candidates)

    print(f"[{dt.datetime.now().isoformat()}] Starting discovery: {total} candidates")
    print(f"User-Agent: {UA}")
    print()

    for idx, cand in enumerate(candidates, 1):
        name = cand["name"]
        print(f"[{idx}/{total}] Probing: {name} (hint_ats={cand['hint_ats']}, hint_slug={cand['hint_slug']})", end=" ... ", flush=True)
        result = probe_candidate(cand, existing)
        results.append(result)
        status_icon = {"verified": "✅", "needs_review": "⚠️ ", "not_found": "❌"}.get(result["status"], "?")
        print(f"{status_icon} {result['status']} | {result['security_jobs']} sec / {result['total_jobs']} total [{result['ats']}:{result['slug']}]")

    # ── write discovery_results.json ─────────────────────────────────────────
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(results, indent=2, default=str), encoding="utf-8")
    print(f"\nWrote {len(results)} results → {OUT_PATH}")

    # ── partition results ─────────────────────────────────────────────────────
    verified_with_sec  = [r for r in results if r["status"] == "verified" and r["security_jobs"] >= 1]
    verified_zero_sec  = [r for r in results if r["status"] == "verified" and r["security_jobs"] == 0]
    needs_review       = [r for r in results if r["status"] == "needs_review"]
    not_found          = [r for r in results if r["status"] == "not_found"]

    # ── update roster ─────────────────────────────────────────────────────────
    # Load current roster (the cleaned 18-entry version)
    current_roster = json.loads(ROSTER_PATH.read_text(encoding="utf-8"))
    roster_keys    = {(c["ats"], c["slug"]) for c in current_roster}

    added = 0
    for r in verified_with_sec:
        key = (r["ats"], r["slug"])
        if key not in roster_keys:
            entry = {
                "name": r["name"],
                "slug": r["slug"],
                "ats": r["ats"],
                "domain": r.get("domain", ""),
                "hq_country": r.get("hq_country", "United States"),
            }
            if r.get("lever_host"):
                entry["lever_host"] = r["lever_host"]
            current_roster.append(entry)
            roster_keys.add(key)
            added += 1

    # Dedupe by name (keep first occurrence)
    seen_names = set()
    deduped = []
    for entry in current_roster:
        key = entry["name"].lower().strip()
        if key not in seen_names:
            seen_names.add(key)
            deduped.append(entry)
    current_roster = deduped

    ROSTER_PATH.write_text(json.dumps(current_roster, indent=2), encoding="utf-8")
    print(f"Roster updated: {len(current_roster)} entries ({added} new added)")

    # ── watchlist ─────────────────────────────────────────────────────────────
    watchlist = [
        {"name": r["name"], "ats": r["ats"], "slug": r["slug"],
         "total_jobs": r["total_jobs"], "security_jobs": 0,
         "domain": r.get("domain", ""), "notes": r.get("notes", "")}
        for r in verified_zero_sec
    ]
    WATCHLIST_PATH.write_text(json.dumps(watchlist, indent=2), encoding="utf-8")
    print(f"Watchlist: {len(watchlist)} companies with board but 0 security jobs → {WATCHLIST_PATH}")

    # ── unsupported list ──────────────────────────────────────────────────────
    unsupported_lines = [
        f"{r['name']} | tried {r['ats']}:{r['slug']} | {r.get('notes', '')}"
        for r in not_found
    ]
    UNSUPPORTED_PATH.write_text("\n".join(unsupported_lines), encoding="utf-8")
    print(f"Unsupported (not found on any ATS): {len(not_found)} → {UNSUPPORTED_PATH}")

    # ── summary ───────────────────────────────────────────────────────────────
    print("\n──── DISCOVERY SUMMARY ────")
    print(f"  Candidates probed : {total}")
    print(f"  Verified + sec>=1 : {len(verified_with_sec)}")
    print(f"  Verified + sec=0  : {len(verified_zero_sec)}")
    print(f"  Needs review      : {len(needs_review)}")
    print(f"  Not found         : {len(not_found)}")
    print(f"  Roster size now   : {len(current_roster)}")

    if needs_review:
        print("\n──── NEEDS REVIEW ────")
        for r in needs_review:
            print(f"  {r['name']:<30} ats={r['ats']:<12} slug={r['slug']:<25} board_name='{r.get('board_name','')}' sec={r['security_jobs']}")


if __name__ == "__main__":
    main()

