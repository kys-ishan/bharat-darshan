#!/usr/bin/env python3
"""
Check that every translated string on every page actually exists.

    python tools/check_i18n.py

The site has two dictionaries, English and Hindi, in js/i18n.js. Any element
carrying data-i18n, data-i18n-ph or data-i18n-al is filled in from them at
load. If a key is missing the lookup fails quietly and the raw key — say
"facts.eras" — is painted straight onto the page. Nothing throws and nothing
is logged; it only shows up when somebody switches to Hindi during a demo.

Two things this has to get right, both learned the hard way:

  * The dictionaries are matched by balanced braces, not "from here to the end
    of the file". Scanning to the end picked up `LANG === "hi" ? "true" :
    "false"` and reported `hi` and `true` as dictionary entries.

  * Some keys are built at runtime: t("siteType." + site.siteType). A naive
    match sees the string "siteType." and calls it a missing key. Those are
    treated as prefixes instead, and every value the prefix can take is read
    out of js/sites-data.js and checked, which is the check that actually
    matters — a missing one there renders as "siteType.stepwell" on the map.
"""
import io, os, re, glob, sys

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def block_at(src, start):
    """Return the text of the {...} whose opening brace is at `start`."""
    depth, i, quote = 0, start, None
    while i < len(src):
        c = src[i]
        if quote:
            if c == '\\':
                i += 2
                continue
            if c == quote:
                quote = None
        elif c in '"\'':
            quote = c
        elif c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return src[start:i + 1]
        i += 1
    return src[start:]


def entries(text):
    """Every "key": "value" pair inside an already-isolated dictionary block.

    A global match over the block, not a line-based or char-by-char walk. Both
    of those were tried and both were wrong in ways worth recording:

      * Scanning character by character and tracking quote state silently
        dropped any key whose opening quote the scanner stepped onto directly
        rather than the space before it. It returned 146 of 197 keys and
        reported the rest as missing, simple headings included.

      * Matching one key per line then missed the pairs the file packs onto a
        shared line — `"region.North": "North", "region.South": "South",` —
        which made it claim four of six regions were untranslated when they
        were present all along.

    Running this over the block rather than the whole file is what makes the
    global match safe. Elsewhere in i18n.js there are ternaries such as
    `LANG === "hi" ? "true" : "false"`, which look exactly like an entry and
    were once reported as a language code used as a dictionary key.

    Only key existence is checked here, so a value continued over the next line
    with `+` is captured as its first segment. That is deliberate.
    """
    return {m.group(1): m.group(2) for m in re.finditer(
        r'["\']([\w.\-]+)["\']\s*:\s*["\']((?:[^"\'\\]|\\.)*)["\']', text)}


src = io.open('js/i18n.js', encoding='utf-8').read()
keys = {}
for lang in ('en', 'hi'):
    m = re.search(r'\b%s\s*:\s*\{' % lang, src)
    if not m:
        print('could not find the %s: dictionary in js/i18n.js' % lang)
        sys.exit(2)
    keys[lang] = entries(block_at(src, src.index('{', m.start())))

# keys asked for by name
used = {}
for f in sorted(glob.glob('*.html') + glob.glob('stories/*.html')):
    for m in re.finditer(r'data-i18n(?:-ph|-al)?=["\']([\w.\-]+)["\']',
                         io.open(f, encoding='utf-8').read()):
        used.setdefault(m.group(1), set()).add(f)

# keys built at runtime, e.g. t("region." + site.region)
prefixes = set()
for f in sorted(glob.glob('js/*.js')):
    if f.endswith('i18n.js'):
        continue
    s = io.open(f, encoding='utf-8').read()
    for m in re.finditer(r'\bt\(\s*["\']([\w.\-]+\.)["\']\s*\+', s):
        prefixes.add(m.group(1))
    for m in re.finditer(r'data-i18n(?:-ph|-al)?=["\']([\w.\-]+)["\']', s):
        used.setdefault(m.group(1), set()).add(f)

# what value can each prefix take? read it straight out of the site data
data = io.open('js/sites-data.js', encoding='utf-8').read()
FIELD = {'siteType.': 'siteType', 'region.': 'region', 'era.': 'era'}

problems = 0
print('static keys used: %d   en: %d   hi: %d   runtime prefixes: %s'
      % (len(used), len(keys['en']), len(keys['hi']),
         ', '.join(sorted(prefixes)) or 'none'))

for k in sorted(used):
    for lang in ('en', 'hi'):
        if k not in keys[lang]:
            print('  MISSING in %-2s  %-24s used by %s'
                  % (lang, k, ', '.join(sorted(used[k]))[:2]))
            problems += 1

for p in sorted(prefixes):
    field = FIELD.get(p)
    if not field:
        print('  unchecked      %-24s no data field known for this prefix' % p)
        continue
    vals = sorted(set(re.findall(field + r':\s*["\']([^"\']+)', data)))
    if not vals:
        print('  no values      %-24s field %s not found in sites-data.js' % (p, field))
        problems += 1
        continue
    bad = [v for v in vals if p + v not in keys['en'] or p + v not in keys['hi']]
    print('  %-14s %-24s %d/%d values translated'
          % ('OK' if not bad else 'MISSING', p, len(vals) - len(bad), len(vals)))
    for v in bad:
        for lang in ('en', 'hi'):
            if p + v not in keys[lang]:
                print('        MISSING in %-2s  %s%s' % (lang, p, v))
        problems += 1

for k in sorted(set(keys['en']) ^ set(keys['hi'])):
    print('  ONE LANGUAGE   %-24s %s only — the other language shows the raw key'
          % (k, 'en' if k in keys['en'] else 'hi'))
    problems += 1

# Hints only. A key called as t(name) where name is a variable cannot be seen
# here, so several of these are in live use. Do not delete on this evidence.
dynamic = [p for p in prefixes if p]
unused = [k for k in sorted(set(keys['en']) | set(keys['hi']))
          if k not in used and not any(k.startswith(p) for p in dynamic)]
if unused:
    print('\n%d keys no page or script names directly — a hint, NOT a deletion '
          'list. Calls like t(name) with a variable are invisible to this check.'
          % len(unused))
    for k in unused:
        print('  unreferenced   %s' % k)

print('\nproblems:', problems)
sys.exit(1 if problems else 0)
