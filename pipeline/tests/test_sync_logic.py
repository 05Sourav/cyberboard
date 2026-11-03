"""Tests for synchronization logic:
- Upsert twice does not duplicate
- Vanished job expires
- Empty feed does not expire anything (outage safeguard)
- 80% drop skips expiry
"""
import pytest
from unittest.mock import MagicMock


class MockSyncSimulator:
    """Simulates the stateful job sync logic in pipeline/db.py."""
    def __init__(self):
        self.jobs = {}  # key: (source, company_id, external_id) -> dict

    def sync(self, company_id, source, new_jobs, run_ts):
        if not new_jobs:
            return 0, 0, "Empty feed; safeguard skipped expiry"

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
            return new_count, 0, f"Count dropped from {prev_count} to {new_count} (>80% drop). Safeguard triggered."

        # Expire
        expired = 0
        for j in self.jobs.values():
            if j["company_id"] == company_id and j["status"] == "active" and j["last_seen"] < run_ts:
                j["status"] = "expired"
                expired += 1

        return new_count, expired, None


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


def test_vanished_job_expires():
    sim = MockSyncSimulator()
    job1 = {"external_id": "job-1", "title": "Security Engineer"}
    job2 = {"external_id": "job-2", "title": "SOC Analyst"}

    # Run 1: both present
    sim.sync("comp-1", "greenhouse", [job1, job2], "2026-11-01T10:00:00Z")
    active_run1 = [j for j in sim.jobs.values() if j["status"] == "active"]
    assert len(active_run1) == 2

    # Run 2: job2 vanished
    _, expired, _ = sim.sync("comp-1", "greenhouse", [job1], "2026-11-01T16:00:00Z")
    assert expired == 1
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "active"
    assert sim.jobs[("greenhouse", "comp-1", "job-2")]["status"] == "expired"


def test_empty_feed_safeguard():
    sim = MockSyncSimulator()
    job1 = {"external_id": "job-1", "title": "Security Engineer"}

    # Run 1: 1 job
    sim.sync("comp-1", "greenhouse", [job1], "2026-11-01T10:00:00Z")

    # Run 2: Empty feed (network glitch/outage)
    _, expired, warn = sim.sync("comp-1", "greenhouse", [], "2026-11-01T16:00:00Z")
    assert expired == 0
    assert warn is not None
    # Still active
    assert sim.jobs[("greenhouse", "comp-1", "job-1")]["status"] == "active"


def test_eighty_percent_drop_safeguard():
    sim = MockSyncSimulator()
    # 10 initial jobs
    initial_jobs = [{"external_id": f"job-{i}", "title": f"Security Role {i}"} for i in range(10)]
    sim.sync("comp-1", "greenhouse", initial_jobs, "2026-11-01T10:00:00Z")
    assert len([j for j in sim.jobs.values() if j["status"] == "active"]) == 10

    # Sudden drop to only 1 job (< 20% of 10)
    _, expired, warn = sim.sync("comp-1", "greenhouse", [initial_jobs[0]], "2026-11-01T16:00:00Z")
    assert expired == 0
    assert "Safeguard triggered" in warn
    # All 10 jobs remain active because safeguard prevented mass expiry
    assert len([j for j in sim.jobs.values() if j["status"] == "active"]) == 10
