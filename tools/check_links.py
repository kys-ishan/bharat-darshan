#!/usr/bin/env python3
"""
Check that every internal link in the site resolves to a file that exists.

Development tool only — the website does not need it.

    python tools/check_links.py

Catches the classic static-site break: a page moved or renamed, leaving
behind a link that 404s on a host and errors on file://.
"""
import io, os, re, glob, sys

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

pages = sorted(glob.glob('*.html') + glob.glob('stories/*.html'))
bad, checked = [], 0

HREF = re.compile(r'href="([^"]+?\.html)(?:[?#][^"]*)?"')
SRC = re.compile(r'src="([^"]+?\.js)(?:[?#][^"]*)?"')

for h in pages:
    s = io.open(h, encoding='utf-8').read()
    d = os.path.dirname(h)
    for kind, pat in (("link", HREF), ("script", SRC)):
        for ref in set(pat.findall(s)):
            if ref.startswith(('http:', 'https:')):
                continue
            checked += 1
            tgt = os.path.normpath(os.path.join(d, ref))
            if not os.path.isfile(tgt):
                bad.append('%s: %s -> %s' % (h, kind, ref))

# also confirm every local asset a site record points at exists
data = io.open(os.path.join('js', 'sites-data.js'), encoding='utf-8').read()
ids = re.findall(r'^\s{4}id: "([a-z0-9-]+)"', data, re.M)
missing = [i for i in ids if not os.path.isfile(os.path.join('assets', 'img', i + '.jpg'))]

print('pages checked:', len(pages))
print('refs checked :', checked)
print('broken refs  :', len(bad))
for b in bad:
    print('   FAIL', b)
print('site photos  : %d/%d present' % (len(ids) - len(missing), len(ids)))
for m in missing:
    print('   FAIL missing assets/img/%s.jpg' % m)

sys.exit(1 if (bad or missing) else 0)
