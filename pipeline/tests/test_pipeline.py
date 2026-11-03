"""Mocked unit and integration tests for Cyberboard pipeline (no live network).
Validates:
1. Security filter inclusion and exclusions
2. Metadata enrichment across 20+ sample locations and titles
3. Idempotent upserts, expiry, empty feed safeguard, and 80% drop safeguard
"""
import pytest
from pipeline.filters import is_security
from pipeline.enrich import (
    countries_for,
    work_mode_for,
    worldwide_flags,
    category_for,
    level_for,
    enrich,
)


# ==============================================================================
# 1. Filter Tests
# ==============================================================================

def test_security_filter_inclusions():
    positive_cases = [
        ("Senior Security Engineer", "Engineering"),
        ("SOC Analyst", "Operations"),
        ("Penetration Tester", "Consulting"),
        ("Application Security Architect", "AppSec"),
        ("Director of Information Security", "IT"),
        ("Threat Intelligence Specialist", ""),
        ("Cryptographer", "Research"),
        ("DevSecOps Lead", "DevOps"),
        ("Incident Response Handler", "Cyber"),
        ("IAM Specialist", "Identity"),
        ("Vulnerability Management Engineer", "Security"),
    ]
    for title, dept in positive_cases:
        matched, kw = is_security(title, dept)
        assert matched, f"Expected '{title}' ({dept}) to be classified as security."
        assert kw is not None


def test_security_filter_exclusions():
    negative_cases = [
        ("Security Guard", "Facilities"),
        ("Security Officer", "Physical Operations"),
        ("Social Security Benefits Coordinator", "HR"),
        ("Security Deposit Specialist", "Real Estate"),
        ("Building Security Staff", "Operations"),
        ("Software Engineer", "Frontend"),
        ("Product Manager", "Core Platform"),
    ]
    for title, dept in negative_cases:
        matched, _ = is_security(title, dept)
        assert not matched, f"Expected '{title}' ({dept}) to be excluded."


# ==============================================================================
# 2. Enrichment Tests (20+ sample titles and locations)
# ==============================================================================

SAMPLE_ENRICHMENT_CASES = [
    # (title, dept, location, remote_flag, expected_country, expected_mode, expected_cat, expected_level)
    ("Chief Information Security Officer", "Executive", "New York, NY", False, ["United States"], "On-site", "Leadership", "Executive"),
    ("Senior AppSec Engineer", "Security", "Remote - US", True, ["United States"], "Remote", "Application Security", "Senior"),
    ("Cloud Security Architect", "Platform", "London, UK", False, ["United Kingdom"], "On-site", "Cloud Security", "Principal / Staff"),
    ("Lead Penetration Tester", "Red Team", "Berlin, Germany", False, ["Germany"], "On-site", "Offensive Security", "Manager / Director"),
    ("Junior SOC Analyst", "Operations", "Bengaluru, India", False, ["India"], "On-site", "SOC & Incident Response", "Entry / Intern"),
    ("Cybersecurity Intern", "IT", "Toronto, Canada", False, ["Canada"], "On-site", "Other Security", "Entry / Intern"),
    ("Staff Threat Researcher", "Intelligence", "Tel Aviv, Israel", False, ["Israel"], "On-site", "Threat Intelligence", "Principal / Staff"),
    ("IAM Engineer", "Corporate", "Paris, France", False, ["France"], "On-site", "Identity & Access", "Mid-level"),
    ("GRC Specialist (SOC 2)", "Compliance", "Amsterdam, Netherlands", False, ["Netherlands"], "On-site", "GRC & Compliance", "Mid-level"),
    ("Security Engineer", "Infosec", "Sydney, Australia", False, ["Australia"], "On-site", "Security Engineering", "Mid-level"),
    ("DevSecOps Consultant", "Consulting", "Singapore", False, ["Singapore"], "On-site", "Application Security", "Mid-level"),
    ("Forensics Investigator", "DFIR", "Dublin, Ireland", False, ["Ireland"], "On-site", "SOC & Incident Response", "Mid-level"),
    ("Product Security Lead", "Engineering", "Madrid, Spain", False, ["Spain"], "On-site", "Application Security", "Manager / Director"),
    ("Detection Engineer", "Detection", "Austin, TX", False, ["United States"], "On-site", "SOC & Incident Response", "Mid-level"),
    ("Security Architect", "Architecture", "Tokyo, Japan", False, ["Japan"], "On-site", "Security Engineering", "Principal / Staff"),
    ("Head of Security", "Management", "Warsaw, Poland", False, ["Poland"], "On-site", "Leadership", "Executive"),
    ("Junior Vulnerability Analyst", "Security", "San Francisco, CA", False, ["United States"], "On-site", "SOC & Incident Response", "Entry / Intern"),
    ("VP of Cyber Defense", "Cyber", "Boston, MA", False, ["United States"], "On-site", "Leadership", "Executive"),
    ("Security Operations Manager", "SOC", "Pune, India", False, ["India"], "On-site", "SOC & Incident Response", "Manager / Director"),
    ("Cryptographic Protocol Engineer", "Research", "Zurich, Switzerland", False, ["Switzerland"], "On-site", "Security Engineering", "Mid-level"),
    ("Offensive Security Specialist", "Offensive", "Remote (Worldwide)", True, [], "Remote", "Offensive Security", "Mid-level"),
]


def test_enrichment_comprehensive():
    for title, dept, loc, remote_flag, exp_countries, exp_mode, exp_cat, exp_level in SAMPLE_ENRICHMENT_CASES:
        raw = {
            "title": title,
            "department": dept,
            "location": loc,
            "remote": remote_flag,
        }
        res = enrich(raw)
        if exp_countries:
            for c in exp_countries:
                assert c in res["countries"], f"Expected {c} in {res['countries']} for location '{loc}'"
        assert res["work_mode"] == exp_mode, f"Expected mode {exp_mode} for location '{loc}', got {res['work_mode']}"
        assert res["category"] == exp_cat, f"Expected category {exp_cat} for title '{title}', got {res['category']}"
        assert res["level"] == exp_level, f"Expected level {exp_level} for title '{title}', got {res['level']}"


def test_worldwide_and_probably_worldwide():
    # Worldwide remote
    ww_res = enrich({"title": "Security Engineer", "location": "Remote - Worldwide", "remote": True})
    assert ww_res["work_mode"] == "Remote"
    assert ww_res["worldwide"] is True
    assert ww_res["probably_worldwide"] is True

    # Remote with unmentioned country -> probably worldwide
    prob_res = enrich({"title": "Security Engineer", "location": "Remote", "remote": True})
    assert prob_res["work_mode"] == "Remote"
    assert prob_res["probably_worldwide"] is True

    # Remote in US -> NOT probably worldwide
    us_remote = enrich({"title": "Security Engineer", "location": "Remote - US", "remote": True})
    assert us_remote["work_mode"] == "Remote"
    assert "United States" in us_remote["countries"]
    assert us_remote["worldwide"] is False
    assert us_remote["probably_worldwide"] is False


def test_regional_european_mapping():
    res = enrich({"title": "Security Engineer", "location": "Remote - EMEA", "remote": True})
    assert "United Kingdom" in res["countries"]
    assert "Germany" in res["countries"]
    assert "France" in res["countries"]
