import unittest
from update_scholar_citations import SCHOLAR_ID, parse_citations


def profile(count, recent="42", scholar_id=SCHOLAR_ID):
    return f'<link rel="canonical" href="https://scholar.google.com/citations?user={scholar_id}&amp;hl=en"><table id="gsc_rsb_st"><tr><td>Citations</td><td class="gsc_rsb_std">{count}</td><td class="gsc_rsb_std">{recent}</td></tr></table>'


class CitationTests(unittest.TestCase):
    def test_all_time_not_recent(self):
        self.assertEqual(parse_citations(profile("1,330")), 1330)

    def test_zero(self):
        self.assertEqual(parse_citations(profile("0")), 0)

    def test_nested_markup(self):
        self.assertEqual(parse_citations(profile("<span>2,568</span>")), 2568)

    def test_reject_block_or_invalid_data(self):
        for html in ["<h1>Too many requests</h1>", profile("N/A"), profile("-1"), profile("1,2"), profile("1330", scholar_id="other")]:
            with self.subTest(html=html), self.assertRaises(ValueError):
                parse_citations(html)


if __name__ == "__main__":
    unittest.main()
