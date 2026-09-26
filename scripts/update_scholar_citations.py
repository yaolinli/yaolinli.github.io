"""Fetch all-time Scholar citations; emit JSON only after validation.

Usage: python scripts/update_scholar_citations.py
A blocked request or changed page structure fails without publishing zeros.
"""
import json
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import parse_qs, urlsplit
from urllib.request import Request, urlopen

SCHOLAR_ID = "rZJRGlQAAAAJ"
PROFILE_URL = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en"


class ScholarParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.profile_id = None
        self.in_stats = False
        self.cell = None
        self.cells = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and attrs.get("rel") == "canonical":
            self.profile_id = parse_qs(urlsplit(attrs.get("href", "")).query).get("user", [None])[0]
        if tag == "table" and attrs.get("id") == "gsc_rsb_st":
            self.in_stats = True
        if tag == "td" and self.in_stats and "gsc_rsb_std" in attrs.get("class", "").split():
            self.cell = []

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag == "td" and self.cell is not None:
            self.cells.append("".join(self.cell).strip())
            self.cell = None
        if tag == "table":
            self.in_stats = False


def parse_citations(html):
    parser = ScholarParser()
    parser.feed(html)
    if parser.profile_id != SCHOLAR_ID:
        raise ValueError("The response is not the expected Google Scholar profile.")
    if len(parser.cells) < 2:
        raise ValueError("Citation statistics unavailable; keep the previous data.")
    # First numeric column = all-time citations, not the recent-year column.
    value = parser.cells[0]
    if not re.fullmatch(r"(?:\d+|\d{1,3}(?:,\d{3})+)", value):
        raise ValueError("Invalid citation count; keep the previous data.")
    return int(value.replace(",", ""))


def make_record(count):
    return {"scholar_id": SCHOLAR_ID, "citations": count,
            "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "source": PROFILE_URL}


def main():
    request = Request(PROFILE_URL, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en"})
    with urlopen(request, timeout=30) as response:
        html = response.read().decode(response.headers.get_content_charset() or "utf-8", errors="replace")
    print(json.dumps(make_record(parse_citations(html)), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
