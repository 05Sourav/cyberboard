"""Derive country, work mode, worldwide flags, category and level from job title/location.
Deterministic pure functions without network calls.
"""
import re
from typing import List, Dict, Any, Tuple


COUNTRIES = {
    "United States": [
        "united states", "usa", "u.s.", "u.s.a", "us-", "new york", "san francisco", "austin", "seattle", "boston",
        "chicago", "denver", "atlanta", "washington, dc", "washington dc", "los angeles", "san jose",
        "mountain view", "palo alto", "dallas", "houston", "miami", "reston", "mclean", "arlington, va",
        "remote - us", "remote, us", "us remote", "remote us", "remote - usa", "remote, usa",
        "california", "texas", "virginia", "maryland", "florida", "washington", "massachusetts"
    ],
    "Canada": ["canada", "toronto", "vancouver", "montreal", "ottawa", "calgary", "ontario", "british columbia", "quebec"],
    "United Kingdom": ["united kingdom", "uk", "london", "manchester", "edinburgh", "cambridge, uk", "bristol", "england", "belfast", "scotland"],
    "Ireland": ["ireland", "dublin", "cork", "galway"],
    "Germany": ["germany", "berlin", "munich", "hamburg", "frankfurt", "cologne", "stuttgart"],
    "France": ["france", "paris", "lyon", "toulouse"],
    "Netherlands": ["netherlands", "amsterdam", "rotterdam", "utrecht", "the hague"],
    "Spain": ["spain", "madrid", "barcelona", "valencia"],
    "Poland": ["poland", "warsaw", "krakow", "wroclaw", "gdansk"],
    "Israel": ["israel", "tel aviv", "herzliya", "haifa", "jerusalem"],
    "India": ["india", "bangalore", "bengaluru", "pune", "hyderabad", "mumbai", "delhi", "gurgaon", "gurugram", "chennai", "noida", "kolkata"],
    "Singapore": ["singapore"],
    "Australia": ["australia", "sydney", "melbourne", "canberra", "brisbane", "perth"],
    "Japan": ["japan", "tokyo", "osaka"],
    "Brazil": ["brazil", "sao paulo", "são paulo", "rio de janeiro"],
    "Luxembourg": ["luxembourg"],
    "Switzerland": ["switzerland", "zurich", "geneva"],
    "Sweden": ["sweden", "stockholm", "gothenburg"],
    "Estonia": ["estonia", "tallinn"],
}

EUROPEAN_COUNTRIES = [
    "United Kingdom", "Ireland", "Germany", "France", "Netherlands",
    "Spain", "Poland", "Luxembourg", "Switzerland", "Sweden", "Estonia"
]

US_STATES_REGEX = re.compile(
    r"\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|"
    r"NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV|WY|DC)\b"
)

CATEGORIES = [
    ("Leadership", r"\b(ciso|chief information security|head of security|vp[, ]|vice president|director of security)\b"),
    ("GRC & Compliance", r"\b(grc|compliance|risk|audit|governance|privacy|policy|iso 27001|soc 2|fedramp|regulatory)\b"),
    ("Offensive Security", r"\b(pentest\w*|penetration|red team|offensive|exploit|vulnerability research|bug bounty|ethical hacker)\b"),
    ("Application Security", r"\b(appsec|application security|product security|devsecops|secure code|software security)\b"),
    ("Cloud Security", r"\b(cloud security|kubernetes security|container security|cspm|infrastructure security|aws security)\b"),
    ("Identity & Access", r"\b(iam|identity|access management|pam|authentication|authorization|directory)\b"),
    ("SOC & Incident Response", r"\b(soc|incident|dfir|forensic\w*|threat hunt\w*|detection|analyst|blue team|response|mdr|csirt)\b"),
    ("Threat Intelligence", r"\b(threat intel\w*|intelligence|malware|reverse engineer\w*|cti)\b"),
    ("Security Engineering", r"\b(security engineer\w*|security architect\w*|network security|endpoint|cryptograph\w*|detection engineer\w*)\b"),
]

LEVELS = [
    ("Executive", r"\b(ciso|chief|vp|vice president|head of)\b"),
    ("Manager / Director", r"\b(manager|director|lead)\b"),
    ("Principal / Staff", r"\b(principal|staff|distinguished|architect|fellow)\b"),
    ("Senior", r"\b(senior|sr\.?|iii|iv|v)\b"),
    ("Entry / Intern", r"\b(intern|internship|junior|jr\.?|graduate|associate|entry|apprentice|trainee|i)\b"),
]


def countries_for(location: str) -> List[str]:
    """Detect matching countries from a raw location string."""
    loc = (location or "").lower()
    found: List[str] = []

    # Check for European regional keywords (Europe, EU, EMEA)
    if re.search(r"\b(emea|europe|eu)\b", loc):
        for c in EUROPEAN_COUNTRIES:
            if c not in found:
                found.append(c)

    # Check individual country dictionaries
    for country, keys in COUNTRIES.items():
        if country in found:
            continue
        for k in keys:
            pat = r"(?<![a-z])" + re.escape(k) + r"(?![a-z])"
            if re.search(pat, loc):
                found.append(country)
                break

    # If nothing matched yet, check for US state abbreviations
    if not found and US_STATES_REGEX.search(location or ""):
        found.append("United States")

    return found


def work_mode_for(location: str, remote_flag: Any) -> str:
    loc = (location or "").lower()
    if "hybrid" in loc:
        return "Hybrid"
    if remote_flag is True or "remote" in loc or "anywhere" in loc or "virtual" in loc:
        return "Remote"
    return "On-site"


def worldwide_flags(location: str, mode: str, countries_found: List[str]) -> Tuple[bool, bool]:
    loc = (location or "").lower()
    is_remote = mode == "Remote"
    
    # Worldwide: explicitly global, anywhere, worldwide or purely 'remote'
    is_worldwide = is_remote and bool(
        "global" in loc or "worldwide" in loc or "anywhere" in loc or loc.strip() in ("remote", "virtual", "remote / virtual")
    )

    # Probably worldwide: Remote role where no specific target country was identified
    is_probably_worldwide = is_remote and (len(countries_found) == 0 or is_worldwide)

    return is_worldwide, is_probably_worldwide


def category_for(title: str, department: str = "") -> str:
    text = f"{title or ''} {department or ''}".lower()
    for name, pat in CATEGORIES:
        if re.search(pat, text):
            return name
    return "Other Security"


def level_for(title: str) -> str:
    t = (title or "").lower()
    for name, pat in LEVELS:
        if re.search(pat, t):
            return name
    return "Mid-level"


def enrich(job: Dict[str, Any]) -> Dict[str, Any]:
    """Enrich job dictionary with derived classification fields."""
    loc = job.get("location") or ""
    ctry = countries_for(loc)
    mode = work_mode_for(loc, job.get("remote"))
    ww, prob_ww = worldwide_flags(loc, mode, ctry)

    job["countries"] = ctry
    job["work_mode"] = mode
    job["worldwide"] = ww
    job["probably_worldwide"] = prob_ww
    job["category"] = category_for(job.get("title", ""), job.get("department", ""))
    job["level"] = level_for(job.get("title", ""))
    return job
