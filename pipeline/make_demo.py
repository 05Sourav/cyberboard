"""Generates SAMPLE data (fictional companies) so the site can be previewed before the first live pull."""
import json, datetime as dt
from enrich import enrich

today = dt.date(2026, 10, 31)
cos = ["Northwall Security", "Halcyon Labs", "Tessera Cloud", "Ironbridge Systems", "Parallax Identity",
       "Kestrel Defense", "Brightlane Bank", "Meridian Health", "Orbital Pay", "Larkfield Networks"]
rows = [
 ("Senior Security Engineer", 0, "Remote - US", "Security", 165, 205, "USD", 1),
 ("Detection Engineer", 0, "Austin, TX", "Security", 150, 185, "USD", 2),
 ("SOC Analyst I", 5, "Dublin, Ireland", "Security Operations", None, None, None, 2),
 ("Head of Product Security", 1, "London, UK", "Security", 140, 170, "GBP", 3),
 ("Cloud Security Engineer", 2, "Berlin, Germany", "Platform", None, None, None, 3),
 ("Penetration Tester", 3, "Remote (Worldwide)", "Offensive Security", None, None, None, 4),
 ("Staff Application Security Engineer", 1, "Remote - US", "Security", 190, 235, "USD", 4),
 ("GRC Analyst", 6, "New York, NY", "Risk & Compliance", 95, 120, "USD", 5),
 ("Security Operations Manager", 8, "Bengaluru, India", "Security", None, None, None, 5),
 ("Threat Intelligence Analyst", 5, "Washington, DC", "Intelligence", 120, 150, "USD", 6),
 ("Identity and Access Management Engineer", 4, "Toronto, Canada", "IT Security", 110, 140, "CAD", 6),
 ("Incident Response Lead", 0, "Remote - EU", "Security", None, None, None, 7),
 ("Security Intern, Summer 2027", 9, "Seattle, WA", "Security", None, None, None, 8),
 ("Director of Security Engineering", 2, "San Francisco, CA", "Security", 260, 320, "USD", 8),
 ("Malware Reverse Engineer", 5, "Tel Aviv, Israel", "Research", None, None, None, 9),
 ("DevSecOps Engineer", 3, "Remote - US", "Engineering", 145, 175, "USD", 9),
 ("Security Compliance Manager (SOC 2, ISO 27001)", 7, "Amsterdam, Netherlands", "Compliance", None, None, None, 10),
 ("Vulnerability Management Analyst", 6, "Hybrid - Chicago, IL", "Security", 100, 130, "USD", 11),
 ("Red Team Operator", 1, "Remote (Global)", "Offensive Security", None, None, None, 12),
 ("CISO", 7, "Boston, MA", "Executive", None, None, None, 13),
 ("Junior SOC Analyst", 8, "Pune, India", "Security Operations", None, None, None, 14),
 ("Security Architect", 2, "Singapore", "Architecture", None, None, None, 14),
 ("Product Security Engineer", 4, "Remote - Canada", "Security", 120, 150, "CAD", 15),
 ("Digital Forensics Examiner", 9, "Sydney, Australia", "Forensics", None, None, None, 16),
 ("Senior Security Analyst, Cloud Detection", 3, "Remote - UK", "Security", 85, 105, "GBP", 17),
 ("Privacy and Security Counsel", 7, "Paris, France", "Legal", None, None, None, 18),
 ("Security Software Engineer", 5, "Denver, CO", "Engineering", 155, 190, "USD", 19),
 ("Principal Cryptography Engineer", 4, "Remote - Europe", "Research", None, None, None, 20),
 ("Threat Hunter", 0, "Atlanta, GA", "Security", 130, 160, "USD", 21),
 ("Security Engineer, Endpoint", 9, "Warsaw, Poland", "Security", None, None, None, 22),
 ("AppSec Engineer", 1, "Gurugram, India", "Security", None, None, None, 23),
 ("IAM Analyst", 6, "Madrid, Spain", "IT Security", None, None, None, 24),
 ("Senior GRC Engineer", 3, "Remote - US", "Security", 150, 180, "USD", 26),
 ("Security Analyst Intern", 8, "Mumbai, India", "Security", None, None, None, 27),
 ("Network Security Engineer", 9, "Frankfurt, Germany", "Network", None, None, None, 28),
]
jobs = []
for i, (t, c, loc, dept, lo, hi, cur, ago) in enumerate(rows):
    posted = (today - dt.timedelta(days=ago)).isoformat() + "T09:00:00+00:00"
    j = dict(source="demo", company_slug=cos[c].lower().replace(" ", ""), job_id=f"demo-{i}", company=cos[c], title=t,
             location=loc, remote=None, department=dept, url="https://example.com/careers/sample", posted_at=posted,
             salary_min=lo * 1000 if lo else None, salary_max=hi * 1000 if hi else None, salary_currency=cur,
             salary_text=None, status="active", first_seen=posted, last_seen=posted)
    jobs.append(enrich(j))
json.dump(jobs, open("site/jobs.json", "w"), indent=1)
json.dump([
  {"company": "Northwall Security", "job_id": "demo-0", "tier": "featured", "until": "2026-12-31"},
  {"company": "Tessera Cloud", "job_id": "demo-4", "tier": "featured", "until": "2026-12-31"},
  {"company": "Kestrel Defense", "job_id": None, "tier": "premium", "until": "2026-12-31"},
], open("site/promoted.json", "w"), indent=1)
print(len(jobs), "sample jobs")
