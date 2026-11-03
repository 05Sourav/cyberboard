"""ATS HTTP Fetchers for Greenhouse, Lever (US & EU), and Ashby.
Includes retry logic, backoff, user-agent politeness, and optional single-job pay pass.
"""
import os
import time
import datetime as dt
from typing import List, Dict, Optional, Any
import requests

DEFAULT_UA = os.environ.get(
    "FETCHER_USER_AGENT",
    "cyberboard-fetcher/1.0 (contact: contact@cyberboard.co)"
)
HEADERS = {"User-Agent": DEFAULT_UA}
TIMEOUT = 30
MAX_RETRIES = 3
LEVER_HOSTS = {
    "us": "https://api.lever.co",
    "eu": "https://api.eu.lever.co",
}


def _request_with_retry(url: str, params: Optional[Dict[str, str]] = None) -> Optional[requests.Response]:
    """Execute GET request with exponential backoff on 429 and 5xx errors."""
    delay = 1.0
    for attempt in range(MAX_RETRIES):
        try:
            r = requests.get(url, params=params, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code == 404:
                return None
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(delay)
                delay *= 2
                continue
            r.raise_for_status()
            return r
        except requests.RequestException:
            if attempt == MAX_RETRIES - 1:
                raise
            time.sleep(delay)
            delay *= 2
    return None


def _blank_job(**kw) -> Dict[str, Any]:
    base: Dict[str, Any] = {
        "external_id": "",
        "title": "",
        "location": "",
        "remote": None,
        "department": "",
        "apply_url": "",
        "posted_at": None,
        "salary_min": None,
        "salary_max": None,
        "salary_currency": None,
        "salary_text": None,
    }
    base.update(kw)
    return base


def fetch_greenhouse(slug: str, fetch_individual_pay: bool = False) -> Optional[List[Dict[str, Any]]]:
    """Fetch jobs from Greenhouse public boards API."""
    url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs"
    resp = _request_with_retry(url)
    if resp is None:
        return None
    data = resp.json()
    jobs_raw = data.get("jobs", [])
    out: List[Dict[str, Any]] = []

    for j in jobs_raw:
        job_id = str(j.get("id"))
        loc = (j.get("location") or {}).get("name") or ""
        depts = [d.get("name") for d in (j.get("departments") or []) if d.get("name")]
        
        job_item = _blank_job(
            external_id=job_id,
            title=j.get("title", "").strip(),
            location=loc.strip(),
            remote=True if "remote" in loc.lower() else None,
            department=", ".join(depts),
            apply_url=j.get("absolute_url", ""),
            posted_at=None,  # Greenhouse list only provides updated_at; per plan we do not use as posted_at
        )

        if fetch_individual_pay:
            # Optional pay pass for priority companies
            try:
                single_resp = _request_with_retry(f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs/{job_id}")
                if single_resp:
                    s_data = single_resp.json()
                    # Parse pay if exposed in metadata/pay fields
                    pay = s_data.get("pay_range") or s_data.get("compensation")
                    if pay and isinstance(pay, dict):
                        job_item["salary_min"] = pay.get("min_value")
                        job_item["salary_max"] = pay.get("max_value")
                        job_item["salary_currency"] = pay.get("currency")
            except Exception:
                pass

        out.append(job_item)
    return out


def fetch_lever(slug: str, host_key: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
    """Fetch jobs from Lever public API (testing US or EU endpoint)."""
    hosts_to_try = [LEVER_HOSTS[host_key]] if host_key in LEVER_HOSTS else list(LEVER_HOSTS.values())

    for base_url in hosts_to_try:
        url = f"{base_url}/v0/postings/{slug}"
        resp = _request_with_retry(url, params={"mode": "json"})
        if resp is None:
            continue
        data = resp.json()
        if isinstance(data, list):
            out: List[Dict[str, Any]] = []
            for p in data:
                cats = p.get("categories") or {}
                sal = p.get("salaryRange") or {}
                created = p.get("createdAt")
                posted_iso = None
                if isinstance(created, (int, float)):
                    posted_iso = dt.datetime.fromtimestamp(created / 1000, dt.timezone.utc).isoformat()

                out.append(_blank_job(
                    external_id=str(p.get("id")),
                    title=p.get("text", "").strip(),
                    location=(cats.get("location") or "").strip(),
                    remote=True if (p.get("workplaceType") == "remote") else None,
                    department=(cats.get("department") or cats.get("team") or "").strip(),
                    apply_url=p.get("hostedUrl", ""),
                    posted_at=posted_iso,
                    salary_min=sal.get("min"),
                    salary_max=sal.get("max"),
                    salary_currency=sal.get("currency"),
                ))
            return out
    return None


def fetch_ashby(slug: str) -> Optional[List[Dict[str, Any]]]:
    """Fetch jobs from Ashby job board API with compensation summary."""
    url = f"https://api.ashbyhq.com/posting-api/job-board/{slug}"
    resp = _request_with_retry(url, params={"includeCompensation": "true"})
    if resp is None:
        return None
    data = resp.json()
    jobs_raw = data.get("jobs", [])
    out: List[Dict[str, Any]] = []

    for j in jobs_raw:
        comp = j.get("compensation") or {}
        out.append(_blank_job(
            external_id=str(j.get("id")),
            title=j.get("title", "").strip(),
            location=(j.get("location") or "").strip(),
            remote=j.get("isRemote"),
            department=(j.get("department") or j.get("team") or "").strip(),
            apply_url=j.get("jobUrl", ""),
            posted_at=j.get("publishedAt"),
            salary_text=comp.get("compensationTierSummary") or comp.get("scrapeableCompensationSalarySummary"),
        ))
    return out


FETCHERS = {
    "greenhouse": fetch_greenhouse,
    "lever": fetch_lever,
    "ashby": fetch_ashby,
}
