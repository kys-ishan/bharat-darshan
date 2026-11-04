#!/usr/bin/env python3
"""
Bump the ?v= cache-buster on every local stylesheet and script tag.

    python tools/bump_version.py [new-version]

Why this exists: there is no build step and no control over HTTP cache
headers, so a browser can serve a stale css/ or js/ file from cache and
silently shadow the new one — usually during a live demo. Appending a
query string changes the URL and forces a fresh fetch.

Covers CSS as well as JS. A CSS edit is just as invisible when cached as
a JS edit, and it fails more quietly: the script still runs, the page
just looks like the old version.

The version is a plain token; use a date, or anything new. Commit after
running this so the HTML and the assets land together.

Guard: each file is rewritten only after checking that every rewritten
reference still points at vendor/, css/ or js/. A bad pattern here once
stripped those directory prefixes out of the URLs and broke every page,
so the check now fails loudly and leaves the file untouched instead.
"""
import io, os, re, glob, sys

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

VER = sys.argv[1] if len(sys.argv) > 1 else "2"

pages = sorted(glob.glob('*.html') + glob.glob('stories/*.html'))

# href="css/base.css"  or  href="../css/base.css?v=1"  ->  same path, new version
# Two things must be captured rather than assumed:
#   * the directory prefix (vendor/, css/, js/), or the rewritten URL 404s;
#   * any leading "../", because pages inside stories/ reference assets that
#     way. Missing that silently skipped stories/index.html entirely — the
#     file kept its old ?v= while the tool reported success, which is the
#     exact stale-cache failure it exists to prevent.
PAT = re.compile(
    r'((?:href|src)=")'                  # 1: opening attribute
    r'((?:\.\./)*(?:vendor|css|js)/)'     # 2: directory prefix incl. ../, kept
    r'([^"?]+)'                          # 3: filename
    r'(?:\?v=[^"]*)?'                    #     old version, discarded
    r'(")'                               # 4: closing quote
)

LOCAL = re.compile(r'(?:href|src)="((?:\.\./)*(?:vendor|css|js)/[^"]+)"')

total = changed = 0
for h in pages:
    s = io.open(h, encoding='utf-8').read()
    new, n = PAT.subn(
        lambda m: m.group(1) + m.group(2) + m.group(3) + '?v=' + VER + m.group(4), s)

    if not n:
        continue

    # sanity: the set of referenced files must be identical, only the
    # query string differing. Bail out and leave the file alone otherwise.
    before = sorted(x.split('?')[0] for x in LOCAL.findall(s))
    after = sorted(x.split('?')[0] for x in LOCAL.findall(new))
    if before != after:
        sys.stderr.write('REFUSING TO WRITE %s\n  before: %s\n  after:  %s\n'
                         % (h, before, after))
        sys.exit(1)

    io.open(h, 'w', encoding='utf-8', newline='\n').write(new)
    total += n
    changed += 1

if changed != len(pages):
    sys.stderr.write('note: %d of %d pages carried no local asset tags\n'
                     % (len(pages) - changed, len(pages)))
print('bumped to v=%s — %d tags across %d of %d pages'
      % (VER, total, changed, len(pages)))
