#!/usr/bin/env python3
"""
Report every colour literal in the site that still belongs to the OLD palette.

    python tools/find_stale_colours.py

The palette is declared once in css/base.css:root, but colour also leaks
into rgba() literals in gradients, shadows and translucent panels, into
inline SVG in the HTML pages, and into a few JavaScript maps. This scans
all of them.

Spacing matters and is the whole reason this file exists: the navigation
bar's background was written as `rgba(247, 244, 213, .93)` with spaces
after the commas, while the migration pattern looked for `247,244,213`
without them. The tokens all changed, the checker passed, and the bar
quietly kept the old cream for two commits. Patterns here therefore match
any spacing.

Gold is intentionally absent from the list below: the palette change
kept --gold at #C9A227 and only moved the translucent hairline
--line-gold, so every #C9A227 in the tree is still correct.
"""
import io, os, re, glob, sys

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# name -> (old hex, old red, old green, old blue)
OLD = {
    'ink':       ('0A3323', 10, 51, 35),
    'moss':      ('839958', 131, 153, 88),
    'parchment': ('F7F4D5', 247, 244, 213),
    'surface':   ('FFFDF2', 255, 253, 242),
    'surface2':  ('F1ECD6', 241, 236, 214),
    'line':      ('DCD3B4', 220, 211, 180),
    'rose':      ('D3968C', 211, 150, 140),
    'teal':      ('105666', 16, 86, 102),
    'oxblood':   ('7B2E2E', 123, 46, 46),
    'fort':      ('A93226', 169, 50, 38),
    'stepwell':  ('12868F', 18, 134, 143),
    'temple':    ('C08A1E', 192, 138, 30),
    'cave':      ('6E8B3D', 110, 139, 61),
    'heroTop':   ('17563C', 23, 86, 60),
}

files = [f for f in sorted(glob.glob('*.html') + glob.glob('stories/*.html')
                           + glob.glob('css/*.css') + glob.glob('js/*.js'))
         if not f.startswith('vendor')]

stale = 0
for f in files:
    s = io.open(f, encoding='utf-8').read()
    for name, (hx, r, g, b) in OLD.items():
        checks = [
            (re.compile(r'#' + hx + r'\b', re.I), 'hex'),
            # \s* so "247,244,213" and "247, 244, 213" both match
            (re.compile(r'\b%s\s*,\s*%s\s*,\s*%s\b' % (r, g, b)), 'rgb'),
        ]
        for pat, kind in checks:
            for m in pat.finditer(s):
                line = s[:m.start()].count('\n') + 1
                print('  %-22s line %-4d %-4s -> %s' % (f, line, kind, name))
                stale += 1

print('\nstale literals:', stale)
sys.exit(1 if stale else 0)
