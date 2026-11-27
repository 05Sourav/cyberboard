"""Security title and department matching rules for Cyberboard ingestion.
Ensures only relevant cybersecurity roles are ingested while filtering out false positives.
"""
import re
from typing import Tuple, Optional

# Keywords that qualify a posting as cybersecurity-relevant
SECURITY_PATTERNS = [
    r"\bsecurity\b",
    r"\bcyber\b",
    r"\bsoc\b",
    r"\bgrc\b",
    r"\bincident response\b",
    r"\bpentest\w*\b",
    r"\bpenetration\b",
    r"\biam\b",
    r"\bidentity\b",
    r"\bcryptograph\w*\b",
    r"\bciso\b",
    r"\bvulnerabilit\w*\b",
    r"\bappsec\b",
    r"\bthreat\b",
    r"\bmalware\b",
    r"\bforensic\w*\b",
    r"\bred team\b",
    r"\bblue team\b",
    r"\bdevsecops\b",
    r"\bdetection\b",
]

# Excluded titles / phrases to reject physical security, non-infosec, sales, marketing, design, etc.
EXCLUDE_PATTERNS = [
    # Physical / non-infosec
    r"\bphysical security\b",
    r"\bglobal security\b",
    r"\bsecurity guard\b",
    r"\bsecurity officer\b",
    r"\bsocial security\b",
    r"\bsecurity deposit\b",
    r"\bbuilding security\b",

    # Clearance and facility / workplace ops / physical safety
    r"\bfacility security officer\b",
    r"\bfacilities\b",
    r"\bfso\b",
    r"\bpersonnel security\b",
    r"\bworkplace operations\b",
    r"\bworkplace safety\b",
    r"\bexecutive protection\b",
    r"\bhealth (and|&) safety\b",
    r"\behs\b",

    # Sales / BD
    r"\baccount executive\b",
    r"\bsales executive\b",
    r"(?<!technical )\baccount manager\b",
    r"\bbusiness development\b",
    r"\bbdr\b",
    r"\bsdr\b",
    r"\bregional director\b",
    r"\bspecialist sales\b",
    r"\bsales director\b",
    r"\bterritory\b",
    r"\bpartner manager\b",
    r"\bchannel manager\b",
    r"\bchannel (manager|account|sales|director|partner manager)\b",

    # Design / creative
    r"\bproduct design(er)?\b",
    r"\b(ux/ui|ui/ux|ux|ui) designer\b",
    r"\bvisual designer\b",
    r"\bgraphic designer\b",

    # Marketing
    r"\bproduct marketing\b",
    r"\bpmm\b",
    r"\bcontent marketer\b",
    r"\bdemand gen\b",
    r"\bgrowth marketing\b",
    r"\bproduct growth\b",

    # Operations / Recruiting / HR / Finance / Legal unless technical security term
    r"(?<!security )\boperations analyst\b",
    r"\b(technical recruiter|recruiter|talent acquisition|sourcer)\b",
    r"\b(hr generalist|hr manager|hr business partner|hrbp)\b",
    r"\b(legal counsel|paralegal|commercial counsel)\b",
    r"\b(executive assistant|office manager|workplace coordinator)\b",
]

# Technical customer-facing roles specifically preserved at security companies
KEEP_SALES_TECH_ROLES = re.compile(
    r"\b(sales engineer|solutions architect|customer success engineer|technical account manager)\b",
    re.IGNORECASE
)

# Dedicated security departments
CLEAR_SECURITY_DEPTS = re.compile(
    r"\b(security|infosec|information security|cybersecurity|cyber security|trust & security|trust and security|product security|cloud security|application security|appsec|enterprise security|security operations|information assurance|sirt)\b",
    re.IGNORECASE
)

SECURITY_COMPILED = [(pat, re.compile(pat, re.IGNORECASE)) for pat in SECURITY_PATTERNS]
EXCLUDE_COMPILED = [re.compile(pat, re.IGNORECASE) for pat in EXCLUDE_PATTERNS]

SAFETY_AND_SECURITY_RE = re.compile(r"\bsafety\s*(?:&|and)\s*security\b", re.IGNORECASE)
TECH_SECURITY_OVERRIDE_RE = re.compile(
    r"\b(cyber\w*|infosec|information security|application security|appsec|application|cloud|network|product security|security engineer\w*|devsecops)\b",
    re.IGNORECASE,
)

IDENTITY_COOCCUR_RE = re.compile(
    r"\b(access|iam|governance|infrastructure|security|engineer\w*|architect\w*|authentication)\b",
    re.IGNORECASE
)


def is_security(title: str, department: str = "", explain: bool = False):
    """Determine whether a role is cybersecurity-related.
    By default returns (is_match, matched_keyword).
    If explain=True, returns (is_match, matched_keyword, exclusion_reason_or_none).
    """
    t = (title or "").strip()
    d = (department or "").strip()

    if not t and not d:
        return (False, None, "Empty title and department") if explain else (False, None)

    # 1. Check exclusions on title
    is_sales_tech = bool(KEEP_SALES_TECH_ROLES.search(t))
    if not is_sales_tech:
        for ex in EXCLUDE_COMPILED:
            if ex.search(t):
                reason = f"Excluded by pattern: {ex.pattern}"
                return (False, None, reason) if explain else (False, None)
        if SAFETY_AND_SECURITY_RE.search(t) and not TECH_SECURITY_OVERRIDE_RE.search(t):
            reason = f"Excluded by pattern: {SAFETY_AND_SECURITY_RE.pattern} (no technical security term)"
            return (False, None, reason) if explain else (False, None)

    # 2. Strip 'security clearance' so it doesn't count as a security keyword match
    t_clean = re.sub(r"\bsecurity clearance\b", "", t, flags=re.IGNORECASE)

    # 3. Check title for security patterns
    matched_kw = None
    for pat_str, regex in SECURITY_COMPILED:
        m = regex.search(t_clean)
        if m:
            kw = m.group(0)
            # Require 'identity' to co-occur with required terms
            if kw.lower() == "identity" and not IDENTITY_COOCCUR_RE.search(t):
                continue
            # Filter generic anomaly detection
            if kw.lower() == "detection":
                if re.search(r"\banomaly detection\b", t_clean, re.I) and not re.search(
                    r"\b(threat|intrusion|security|incident|fraud)\b", t_clean, re.I
                ):
                    continue
            matched_kw = kw
            break

    if matched_kw:
        return (True, matched_kw, None) if explain else (True, matched_kw)

    # 4. If not matched in title, check if department is explicitly security
    if d and CLEAR_SECURITY_DEPTS.search(d):
        return (True, "department_security", None) if explain else (True, "department_security")

    reason = "No security keyword in title or dedicated security department"
    return (False, None, reason) if explain else (False, None)
