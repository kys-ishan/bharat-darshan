#!/usr/bin/env python3
"""
Validate js/sites-data.js against the schema.

This is a DEVELOPMENT tool. The website does not need it and runs
without Python. Install and run it only when you change site data:

    pip install esprima
    python tools/validate_data.py

It catches the mistakes that actually break things silently:
  - a filter value that is not in FILTER_OPTIONS, so a chip never matches
  - an index out of range, so a quiz answer is unreachable
  - a missing local photo, so a card shows a broken image
  - a coordinate outside India, so a marker lands in the sea
  - a missing photo credit, which is a licence violation, not a style nit
"""
import io, os, re, sys

try:
    import esprima
except ImportError:
    sys.exit("This tool needs esprima:  pip install esprima")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

REGIONS = {"North", "South", "East", "West", "Central", "Northeast"}
SITE_TYPES = {"fort", "temple", "stepwell", "cave", "tomb", "palace", "monument"}
TRADITIONS = {"hindu", "buddhist", "jain", "islamic", "sikh", "colonial", "multi"}
ERAS = {"ancient", "medieval", "mughal", "colonial", "modern"}

REQUIRED = [
    "id", "slug", "name", "nameHi", "latitude", "longitude", "city", "state",
    "region", "siteType", "era", "traditions", "isUnesco", "isOfficiallyProtected",
    "heroImage", "thumbnailImage", "shortDescription", "shortDescriptionHi",
    "history", "historyHi", "story", "quickFacts", "sources", "photoCredit",
    "photoLicense", "featured", "quiz",
]

problems, notes = [], []


def lit(node):
    """Convert an AST literal or simple structure into a Python value."""
    if node is None:
        return None
    t = type(node).__name__
    if t in ("Literal",):
        return node.value
    if t == "Identifier":
        return node.name
    if t == "UnaryExpression":
        v = lit(node.argument)
        return -v if node.operator == "-" else v
    if t == "ArrayExpression":
        return [lit(e) for e in node.elements]
    if t == "ObjectExpression":
        out = {}
        for p in node.properties:
            k = p.key.name if getattr(p.key, "name", None) else p.key.value
            out[k] = lit(p.value)
        return out
    return node


src = io.open("js/sites-data.js", encoding="utf-8").read()
tree = esprima.parseScript(src)

sites = None
for node in tree.body:
    if type(node).__name__ == "VariableDeclaration":
        for d in node.declarations:
            if getattr(d.id, "name", None) == "SITES":
                sites = [lit(e) for e in d.init.elements]

if sites is None:
    sys.exit("Could not find the SITES array.")

# mirror of the client-side flattening in app.js searchText()
def flatten(site):
    parts = [site.get("name"), site.get("nameHi"), site.get("city"),
             site.get("state"), site.get("region"), site.get("siteType"),
             site.get("era"), site.get("protectedBy"),
             site.get("shortDescription"), site.get("shortDescriptionHi"),
             site.get("history"), site.get("historyHi"), site.get("isUnescoRef"),
             " ".join(site.get("traditions") or [])]
    for s in site.get("story") or []:
        parts += [s.get("title"), s.get("body"), s.get("titleHi"), s.get("bodyHi")]
    for f in site.get("quickFacts") or []:
        parts += [f.get("label"), f.get("value")]
    for s in site.get("sources") or []:
        parts.append(s.get("label"))
    return " ".join(str(p) for p in parts if p)


ids = [s["id"] for s in sites]
if len(ids) != len(set(ids)):
    problems.append("Duplicate ids: " + str(sorted({i for i in ids if ids.count(i) > 1})))

for s in sites:
    sid = s.get("id", "?")

    for f in REQUIRED:
        if f not in s:
            problems.append(f"{sid}: missing field '{f}'")

    # enums
    if s.get("region") not in REGIONS:
        problems.append(f"{sid}: region '{s.get('region')}' is not a filter option")
    if s.get("siteType") not in SITE_TYPES:
        problems.append(f"{sid}: siteType '{s.get('siteType')}' is not a filter option")
    if s.get("era") not in ERAS:
        problems.append(f"{sid}: era '{s.get('era')}' is not a filter option")
    for t in s.get("traditions") or []:
        if t not in TRADITIONS:
            problems.append(f"{sid}: tradition '{t}' is not a filter option")

    # coordinates roughly inside India + the neighbourhood
    lat, lon = s.get("latitude"), s.get("longitude")
    if not isinstance(lat, (int, float)) or not 5 < lat < 38:
        problems.append(f"{sid}: latitude {lat} is outside India")
    if not isinstance(lon, (int, float)) or not 67 < lon < 99:
        problems.append(f"{sid}: longitude {lon} is outside India")

    # licence compliance: CC licences legally require attribution
    if not s.get("photoCredit") or "TODO" in str(s.get("photoCredit")):
        problems.append(f"{sid}: missing photoCredit (a licence violation, not a style nit)")
    if not s.get("photoLicense") or "TODO" in str(s.get("photoLicense")):
        problems.append(f"{sid}: missing photoLicense")

    for k in ("heroImage", "thumbnailImage"):
        v = s.get(k) or ""
        if not v.startswith("https://"):
            problems.append(f"{sid}: {k} is not an https URL")

    # the local copy app.js falls back to for cards
    local = os.path.join("assets", "img", sid + ".jpg")
    if not os.path.isfile(local):
        problems.append(f"{sid}: no local photo at {local} (cards will 404)")

    # UNESCO claims must carry a verifiable reference
    if s.get("isUnesco") is True:
        ref = str(s.get("isUnescoRef") or "")
        if not re.search(r"No\.\s*\d+", ref):
            problems.append(f"{sid}: isUnesco true but no listing number in isUnescoRef")

    # quiz: an out-of-range answer makes a question unanswerable
    quiz = s.get("quiz") or []
    if len(quiz) < 1:
        problems.append(f"{sid}: no quiz questions")
    for i, q in enumerate(quiz):
        opts = q.get("options") or []
        a = q.get("answer")
        if not isinstance(a, int) or not 0 <= a < len(opts):
            problems.append(f"{sid}: quiz[{i}] answer {a} out of range ({len(opts)} options)")
        if not q.get("explain"):
            problems.append(f"{sid}: quiz[{i}] has no explanation")

    # story mode needs all five stages
    story = s.get("story") or []
    if len(story) != 5:
        problems.append(f"{sid}: story has {len(stage) if False else len(story)} stages, expected 5")
    for i, st in enumerate(story):
        for k in ("title", "body", "titleHi", "bodyHi"):
            if not st.get(k):
                problems.append(f"{sid}: story[{i}] missing {k}")

    # the detail page prints these directly, so blanks become "undefined"
    for k in ("shortDescription", "history", "historyHi", "shortDescriptionHi"):
        if not s.get(k):
            problems.append(f"{sid}: {k} is empty")

    for i, f in enumerate(s.get("quickFacts") or []):
        if not f.get("label") or not f.get("value"):
            problems.append(f"{sid}: quickFacts[{i}] has an empty label or value")

    # nothing should ship claiming to be finished while saying TODO
    if "TODO" in flatten(s):
        notes.append(f"{sid}: contains a TODO (fine on screen, not fine in a README)")

print(f"sites: {len(sites)}")
print(f"TODO notes: {len(notes)}")
for n in notes:
    print("  note:", n)
print(f"problems: {len(problems)}")
for p in problems:
    print("  FAIL:", p)
sys.exit(1 if problems else 0)
