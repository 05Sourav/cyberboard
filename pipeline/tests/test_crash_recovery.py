"""Tests for pipeline crash recovery and failure handling in pipeline/main.py:
1. When an unexpected exception occurs mid-run, assert that:
   (a) A pipeline_runs row is written with the exception text in errors
   (b) The process exits non-zero (SystemExit code != 0)
2. When the database is unreachable at the logging step in finally, assert that:
   (a) The error is handled gracefully without an unhandled exception
   (b) The process exits non-zero (SystemExit code != 0)
"""
import sys
from pathlib import Path
from unittest.mock import MagicMock
import pytest

# Ensure pipeline dir is in sys.path
pipeline_dir = Path(__file__).resolve().parent.parent
if str(pipeline_dir) not in sys.path:
    sys.path.insert(0, str(pipeline_dir))

import db
import main


def test_crash_mid_run_writes_pipeline_runs_and_exits_nonzero(monkeypatch):
    """Prove that an unhandled crash mid-run writes pipeline_runs with exception in errors,
    and exits non-zero."""
    # Ensure env vars are present so CI check passes
    monkeypatch.setenv("NEXT_PUBLIC_SUPABASE_URL", "https://mock.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "mock-service-key")
    monkeypatch.setenv("FETCHER_USER_AGENT", "cyberboard-test/1.0")

    # Mock DB client for preflight check
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.limit.return_value.execute.return_value = MagicMock()
    monkeypatch.setattr(db, "get_client", lambda: mock_client)

    # Capture log_pipeline_run calls
    logged_runs = []
    def mock_log_pipeline_run(**kwargs):
        logged_runs.append(kwargs)
    monkeypatch.setattr(db, "log_pipeline_run", mock_log_pipeline_run)

    # Mock ensure_company and sync_company_jobs
    monkeypatch.setattr(db, "ensure_company", lambda c: {"id": "mock-comp", "slug": c["slug"], "name": c.get("name")})
    monkeypatch.setattr(db, "sync_company_jobs", lambda comp, ats, jobs, ts: (len(jobs), 0, None))

    # Force an unhandled exception in the loop
    def crash_sleep(_duration):
        raise RuntimeError("Simulated mid-run crash failure")
    monkeypatch.setattr(main.time, "sleep", crash_sleep)

    # Run pipeline with limit=1 to process one company and trigger the crash
    with pytest.raises(SystemExit) as exc_info:
        main.run_pipeline(limit=1)

    # (a) Assert a pipeline_runs row was written with the exception text in errors
    assert len(logged_runs) == 1, "Expected log_pipeline_run to be called in finally block"
    logged = logged_runs[0]
    assert logged["finished_at"] is not None
    assert any("Simulated mid-run crash failure" in str(err) for err in logged["errors"]), (
        f"Expected exception text in errors, got: {logged['errors']}"
    )

    # (b) Assert process exits non-zero
    assert exc_info.value.code != 0, f"Expected non-zero exit code, got {exc_info.value.code}"


def test_db_unreachable_at_logging_step_exits_nonzero_without_unhandled_exception(monkeypatch):
    """Prove that when Supabase is unreachable at the logging step in finally,
    the pipeline exits non-zero without raising an unhandled exception."""
    monkeypatch.setenv("NEXT_PUBLIC_SUPABASE_URL", "https://mock.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "mock-service-key")
    monkeypatch.setenv("FETCHER_USER_AGENT", "cyberboard-test/1.0")

    # Mock DB client for preflight check
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.limit.return_value.execute.return_value = MagicMock()
    monkeypatch.setattr(db, "get_client", lambda: mock_client)

    # Make log_pipeline_run raise DB unreachable exception
    def broken_log_pipeline_run(**kwargs):
        raise ConnectionError("Supabase DB connection refused: unreachable")
    monkeypatch.setattr(db, "log_pipeline_run", broken_log_pipeline_run)

    # Mock ensure_company and sync_company_jobs to succeed normally
    monkeypatch.setattr(db, "ensure_company", lambda c: {"id": "mock-comp", "slug": c["slug"], "name": c.get("name")})
    monkeypatch.setattr(db, "sync_company_jobs", lambda comp, ats, jobs, ts: (len(jobs), 0, None))
    monkeypatch.setattr(main.time, "sleep", lambda _s: None)

    # Must raise SystemExit (exit non-zero) and NOT raise ConnectionError (unhandled)
    with pytest.raises(SystemExit) as exc_info:
        main.run_pipeline(limit=1)

    assert exc_info.value.code != 0, f"Expected non-zero exit code, got {exc_info.value.code}"
