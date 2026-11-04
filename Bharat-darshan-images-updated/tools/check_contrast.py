#!/usr/bin/env python3
"""
Check WCAG contrast of the text/background pairings the theme actually uses.

    python tools/check_contrast.py

Parses the colour tokens out of css/base.css:root so it always reads the
real values, then tests each pairing that appears in the stylesheet as
coloured text on a surface. 4.5:1 is the WCAG AA threshold for normal
body text; 3:1 is the floor for large display text and non-text UI such
as map pins and hairlines.

Running this before a palette change is what stops a "warmer" colour
from quietly becoming unreadable.
"""
import io, os, re, sys

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

css = io.open('css/base.css', encoding='utf-8').read()

# --- pull the :root block and flatten every --name: value ---
root = re.search(r':root\s*\{(.*?)\n\}', css, re.S)
# strip the leading '--' so the pairing tables below read as plain names
tokens = {name[2:]: val for name, val in
          re.findall(r'(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})', root.group(1))}


def hex_to_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def luminance(h):
    """WCAG relative luminance."""
    def chan(v):
        v /= 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (chan(v) for v in hex_to_rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg, bg):
    a, b = luminance(fg), luminance(bg)
    if a < b:
        a, b = b, a
    return (a + 0.05) / (b + 0.05)


# pairs that appear as coloured text on a surface in the stylesheet
TEXT_ON_SURFACE = [
    ('body text',      'ink',       'parchment'),
    ('links',          'teal',      'parchment'),
    ('secondary text', 'moss',      'parchment'),
    ('emphasis',       'oxblood',   'parchment'),
    ('on card',        'ink',       'surface'),
    ('on card 2',      'ink',       'surface-2'),
    ('link on card',   'teal',      'surface'),
    ('kicker on hero', 'gold',      'ink'),
    ('display on hero','gold-bright','ink'),
    ('hero body',      'parchment', 'ink'),
    ('button text',    'on-rose',   'rose'),
    ('button on ink',  'parchment', 'ink'),
]

# larger text and non-text UI — 3:1 is the applicable floor
LARGE_OR_UI = [
    ('pin: fort',      'm-fort',     'parchment'),
    ('pin: temple',    'm-temple',   'parchment'),
    ('pin: stepwell',  'm-stepwell', 'parchment'),
    ('pin: cave',      'm-cave',     'parchment'),
    ('cluster number', 'parchment',  'teal'),
]

# Hairlines, card borders and dashed dividers carry no information on their
# own — the content they frame is what matters — so WCAG 1.4.11 does not
# apply to them. Reported for interest, never counted as a failure.
DECORATIVE = [
    ('gold hairline',  'gold',       'parchment'),
    ('gold on card',   'gold',       'surface'),
]

missing = [k for _, a, b in TEXT_ON_SURFACE + LARGE_OR_UI + DECORATIVE
           for k in (a, b) if k not in tokens]
if missing:
    sys.stderr.write('tokens not found in :root: %s\n' % sorted(set(missing)))
    sys.exit(1)

bad = 0
print('TEXT — WCAG AA needs 4.5:1')
print('  %-18s %6s   %s' % ('pairing', 'ratio', 'verdict'))
for label, fg, bg in TEXT_ON_SURFACE:
    r = contrast(tokens[fg], tokens[bg])
    ok = r >= 4.5
    bad += 0 if ok else 1
    print('  %-18s %5.2f:1  %s  (%s on %s)'
          % (label, r, 'PASS' if ok else 'FAIL', fg, bg))

print('\nLARGE TEXT / UI — needs 3:1')
for label, fg, bg in LARGE_OR_UI:
    r = contrast(tokens[fg], tokens[bg])
    ok = r >= 3.0
    bad += 0 if ok else 1
    print('  %-18s %5.2f:1  %s  (%s on %s)'
          % (label, r, 'PASS' if ok else 'FAIL', fg, bg))

print('\nDECORATIVE — not graded, shown for interest')
for label, fg, bg in DECORATIVE:
    r = contrast(tokens[fg], tokens[bg])
    print('  %-18s %5.2f:1  info  (%s on %s)'
          % (label, r, fg, bg))

print('\nfailures:', bad)
sys.exit(1 if bad else 0)
