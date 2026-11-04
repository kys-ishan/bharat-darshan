#!/usr/bin/env python3
"""
Generate the SVG path for a cusped (multifoil) Mughal arch.

    python tools/make_arch.py

A rounded rectangle with border-radius gives a plain semicircular head.
A real Mughal arch is cusped: a run of small foils bulging outward,
meeting in sharp points that project into the opening. Getting those
points right by hand is fiddly, so they are computed here and the
resulting `d` attribute pasted into index.html.

Seven foils, the count used on the Taj Mahal's own iwan arches.
The head sits on an ellipse rather than a circle so the arch reads as
wide and low the way the real ones do, instead of being as tall as it
is wide.
"""
import math

W, H = 800, 640      # viewBox
CX, CY = W / 2, 320  # centre of the arch head
RX, RY = 356, 248    # ellipse radii — wide and low, not a full semicircle
FOILS = 7
SPRING = 330         # y where the arch meets its uprights
BASE = 596           # bottom of the frame

# points along the ellipse, left springing to right
pts = []
for i in range(FOILS + 1):
    a = math.pi - (math.pi * i / FOILS)      # pi -> 0
    pts.append((CX + RX * math.cos(a), CY - RY * math.sin(a)))

# each foil is an arc bulging outward; radius sized so consecutive foils
# meet in a visible cusp rather than smoothing into a curve
d = ['M %.1f %.1f' % pts[0]]
for i in range(FOILS):
    x1, y1 = pts[i]
    x2, y2 = pts[i + 1]
    chord = math.hypot(x2 - x1, y2 - y1)
    r = chord * 0.66
    # travelling left->right over the head, sweep=1 always bulges away from
    # the opening, which is what puts the sharp cusp points INTO it
    d.append('A %.1f %.1f 0 0 1 %.1f %.1f' % (r, r, x2, y2))

# uprights down to the base, then close along the bottom
d.append('L %.1f %.1f' % (pts[-1][0], BASE))
d.append('L %.1f %.1f' % (pts[0][0], BASE))
d.append('Z')

path = ' '.join(d)
print('viewBox: 0 0 %d %d' % (W, H))
print('cusp points: %d foils' % FOILS)
print('\npath d:\n')
print(path)
print('\nlength: %d chars' % len(path))
