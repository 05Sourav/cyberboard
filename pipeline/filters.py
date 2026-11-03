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

# Excluded titles / phrases to reject physical security or non-infosec roles
EXCLUDE_PATTERNS = [
    r"\bsecurity guard\b",
    r"\bsecurity officer\b",
    r"\bsocial security\b",
    r"\bsecurity deposit\b",
    r"\bphysical security guard\b",
    r"\bbuilding security\b",
]

SECURITY_COMPILED = [(pat, re.compile(pat, re.IGNORECASE)) for pat in SECURITY_PATTERNS]
EXCLUDE_COMPILED = [re.compile(pat, re.IGNORECASE) for pat in EXCLUDE_PATTERNS]


def is_security(title: str, department: str = "") -> Tuple[bool, Optional[str]]:
    """Determine whether a role is cybersecurity-related.
    Returns (is_match, matched_keyword).
    """
    text = f"{title or ''} {department or ''}".strip()
    if not text:
        return False, None

    # Check exclusions first
    for ex in EXCLUDE_COMPILED:
        if ex.search(text):
            return False, None

    # Check for security inclusion
    for pat_str, regex in SECURITY_COMPILED:
        m = regex.search(text)
        if m:
            return True, m.group(0)

    return False, None
