"""Tests for synchronization logic:
- Upsert twice does not duplicate (idempotence)
- Vanished job expires (normal healthy expiry)
- Empty feed within 18h grace window does not expire roles
- Empty feed past 18h grace window expires stale roles
- 80% drop within 18h grace window skips expiry
- 80% drop past 18h grace window expires stale roles
- Failed fetch / 404 past 72h expires stale roles
- Expired job is reactivated when it reappears in a later fetch
"""
import pytest
import datetime as dt


class MockSyncSimulator:
    """Simulates the stateful job sync logic in pipeline/db.py."""
    def __init__(self):
        self.jobs = {}  # key: (source, company_id, external_id) -> dict

    def sync(self, company_id, source, new_jobs, run_ts):
        run_dt = dt.datetime.fromisoformat(run_ts.replace("Z", "+00:00"))
        cutoff_18h = (run_dt - dt.timedelta(hours=18)).isoformat()

        if not new_jobs:
            # Empty feed safeguard: do not expire on run_ts, but expire stale > 18h
            stale_expired = 0
            for j in self.jobs.values():
                if j["company_id"] == company_id and j["status"] == "active" and j["last_seen"] < cutoff_18h:
                    j["status"] = "expired"
                    stale_expired += 1
            warn = (
                f"Empty feed: expired {stale_expired} stale roles >18h"
                if stale_expired > 0
                else "Empty feed: expiry skipped (within 18h grace window)"
            )
            return 0, stale_expired, warn

        prev_active = [
            j for j in self.jobs.values()
            if j["company_id"] == company_id and j["status"] == "active"
        ]
        prev_count = len(prev_active)

        # Upsert
        upserted = 0
        for item in new_jobs:
            key = (source, company_id, item["external_id"])
            if key not in self.jobs:
                self.jobs[key] = {
                    "source": source,
                    "company_id": company_id,
                    "external_id": item["external_id"],
                    "title": item["title"],
                    "status": "active",
                    "first_seen": run_ts,
                    "last_seen": run_ts,
                }
                upserted += 1
            else:
                self.jobs[key]["last_seen"] = run_ts
                self.jobs[key]["status"] = "active"
                upserted += 1

        # Safeguard: > 80% drop
        new_count = len(new_jobs)
        if prev_count >= 5 and new_count < (prev_count * 0.2):
            stale_expired = 0
            for j in self.jobs.values():
                if j["company_id"] == company_id and j["status"] == "active" and j["last_seen"] < cutoff_18h:
                    j["status"] = "expired"
                    stale_expired += 1
            warn = (
                f"Safeguard triggered (>80% drop). Expired {stale_expired} stale roles >18h"
                if stale_expired > 0
                else f"Count dropped from {prev_count} to {new_count} (>80% drop). Safeguard triggered."
            )
            return new_count, stale_expired, warn

        # Normal healthy expiry
        expired = 0
        for j in self.jobs.values():
            if j["company_id"] == company_id and j["status"] == "active" and j["last_seen"] < run_ts:
                j["status"] = "expired"
                expired += 1

        return new_count, expired, None

    def expire_on_failure(self, company_id, run_ts, reason, threshold_hours=72):
        """Simulates expire_stale_jobs_on_failure in pipeline/db.py."""
        run_dt = dt.datetime.fromisoformat(run_ts.replace("Z", "+00:00"))
        cutoff = (run_dt - dt.timedelta(hours=threshold_hours)).isoformat()
        stale_expired = 0
        for j in self.jobs.values():
            if j["company_id"] == company_id and j["status"] == "active" and j["last_seen"] < cutoff:
                j["status"] = "expired"
                stale_expired += 1
        warn = f"Fetch failed ({reason}): expired {stale_expired} stale roles >{threshold_hours}h" if stale_expired else None
        return stale_expired, warn


def test_upsert_idempotence():
    sim = MockSyncSimulator()
    job = {"external_id": "job-1", "title": "Security Engineer"}
    
    # Run 1
    sim.sync("comp-1", "greenhouse", [job], "2026-11-01T10:00:00Z")
    assert len(sim.jobs) == 1
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "active"

    # Run 2 with same job
    sim.sync("comp-1", "greenhouse", [job], "2026-11-01T16:00:00Z")
    assert len(sim.jobs) == 1
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["last_seen"] == "2026-11-01T16:00:00Z"


def test_normal_expiry_unchanged():
    sim = MockSyncSimulator()
    job1 = {"external_id": "job-1", "title": "Security Engineer"}
    job2 = {"external_id": "job-2", "title": "SOC Analyst"}

    # Run 1: both present
    sim.sync("comp-1", "greenhouse", [job1, job2], "2026-11-01T10:00:00Z")
    assert len([j for j in sim.jobs.values() if j["status"] == "active"]) == 2

    # Run 2 (6h later): job2 vanished in normal run
    _, expired, warn = sim.sync("comp-1", "greenhouse", [job1], "2026-11-01T16:00:00Z")
    assert expired == 1
    assert warn is None
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "active"
    assert sim.jobs[("greenhouse", "comp-1", "job-2")]["status"] == "expired"


def test_empty_feed_within_grace_window():
    sim = MockSyncSimulator()
    job1 = {"external_id": "job-1", "title": "Security Engineer"}

    # Initial sync at 10:00
    sim.sync("comp-1", "greenhouse", [job1], "2026-11-01T10:00:00Z")

    # 6 hours later (16:00): Empty feed arrives (within 18h grace window)
    _, expired, warn = sim.sync("comp-1", "greenhouse", [], "2026-11-01T16:00:00Z")
    assert expired == 0
    assert "within 18h grace window" in warn
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "active"


def test_empty_feed_past_grace_window():
    sim = MockSyncSimulator()
    job1 = {"external_id": "job-1", "title": "Security Engineer"}

    # Initial sync at Day 1 10:00
    sim.sync("comp-1", "greenhouse", [job1], "2026-11-01T10:00:00Z")

    # 24 hours later (past 18h grace window): Empty feed arrives
    _, expired, warn = sim.sync("comp-1", "greenhouse", [], "2026-11-02T10:00:00Z")
    assert expired == 1
    assert "expired 1 stale roles" in warn
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "expired"


def test_eighty_percent_drop_within_grace_window():
    sim = MockSyncSimulator()
    initial_jobs = [{"external_id": f"job-{i}", "title": f"Security Role {i}"} for i in range(10)]
    # Initial sync at 10:00
    sim.sync("comp-1", "greenhouse", initial_jobs, "2026-11-01T10:00:00Z")

    # 6 hours later (16:00): Sudden drop to 1 role (within 18h grace window)
    _, expired, warn = sim.sync("comp-1", "greenhouse", [initial_jobs[0]], "2026-11-01T16:00:00Z")
    assert expired == 0
    assert "Safeguard triggered" in warn
    # All 10 remain active
    active_count = len([j for j in sim.jobs.values() if j["status"] == "active"])
    assert active_count == 10


def test_eighty_percent_drop_past_grace_window():
    sim = MockSyncSimulator()
    initial_jobs = [{"external_id": f"job-{i}", "title": f"Security Role {i}"} for i in range(10)]
    # Initial sync at Day 1 10:00
    sim.sync("comp-1", "greenhouse", initial_jobs, "2026-11-01T10:00:00Z")

    # 24 hours later: Persistent drop to 1 role (missing 9 roles > 18h)
    _, expired, warn = sim.sync("comp-1", "greenhouse", [initial_jobs[0]], "2026-11-02T10:00:00Z")
    assert expired == 9
    assert "Expired 9 stale roles" in warn
    assert sim.jobs[("greenhouse", "comp-1", "job-0")]["status"] == "active"
    for i in range(1, 10):
        assert sim.jobs[("greenhouse", "comp-1", f"job-{i}")]["status"] == "expired"


def test_failed_fetch_past_seventy_two_hours():
    sim = MockSyncSimulator()
    job1 = {"external_id": "job-1", "title": "Security Engineer"}

    # Initial sync on Nov 1
    sim.sync("comp-1", "greenhouse", [job1], "2026-11-01T10:00:00Z")

    # Nov 2 (24h later): Failure -> within 72h, no expiry
    exp_24h, _ = sim.expire_on_failure("comp-1", "2026-11-02T10:00:00Z", "HTTP 500", threshold_hours=72)
    assert exp_24h == 0
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "active"

    # Nov 5 (96h later): Persistent failure -> past 72h, expires
    exp_96h, warn = sim.expire_on_failure("comp-1", "2026-11-05T10:00:00Z", "HTTP 500", threshold_hours=72)
    assert exp_96h == 1
    assert "expired 1 stale roles" in warn
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "expired"


def test_expired_job_reactivated_on_reappearance():
    sim = MockSyncSimulator()
    job1 = {"external_id": "job-1", "title": "Security Engineer"}

    # Run 1: Active
    sim.sync("comp-1", "greenhouse", [job1], "2026-11-01T10:00:00Z")

    # Run 2: Missing -> expired
    sim.sync("comp-1", "greenhouse", [], "2026-11-02T12:00:00Z")  # 26h later
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "expired"

    # Run 3: Job reappears in ATS -> reactivated
    sim.sync("comp-1", "greenhouse", [job1], "2026-11-02T18:00:00Z")
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "active"
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["last_seen"] == "2026-11-02T18:00:00Z"
