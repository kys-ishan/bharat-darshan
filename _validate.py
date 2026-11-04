import io, os, glob, esprima

base = os.path.dirname(os.path.abspath(__file__))
os.chdir(base)

files = sorted(glob.glob(os.path.join('js', '*.js')))
fails = 0
for f in files:
    src = io.open(f, encoding='utf-8').read()
    try:
        esprima.parseScript(src)
        print('OK   ', f)
    except Exception as e:
        fails += 1
        print('FAIL ', f, '->', getattr(e, 'description', ''), getattr(e, 'lineNumber', ''), getattr(e, 'column', ''))

print('---')
sites = io.open(os.path.join('js', 'sites-data.js'), encoding='utf-8').read()
# evaluate the array literal in isolation by parsing and walking the AST
tree = esprima.parseScript(sites)
ids = []

class Walk:
    pass

def find_sites(node):
    # SITES = [ {...}, {...} ]
    out = []
    if isinstance(node, esprima.object.ObjectExpression):
        props = {p.key.name if hasattr(p.key, 'name') else p.key.value: p.value for p in node.properties}
        if 'id' in props and hasattr(props['id'], 'value'):
            out.append(props)
    return out

# simpler: regex on the parsed source is unreliable; just regex the source
import re
ids = re.findall(r'^\s{4}id: "([a-z0-9-]+)"', sites, re.M)
regions = re.findall(r'^\s{4}region: "([A-Za-z]+)"', sites, re.M)
types = re.findall(r'^\s{4}siteType: "([a-z]+)"', sites, re.M)
eras = re.findall(r'^\s{4}era: "([a-z]+)"', sites, re.M)

from collections import Counter
print('sites parsed:', len(ids))
print('by region:', dict(Counter(regions)))
print('by type  :', dict(Counter(types)))
print('by era   :', dict(Counter(eras)))
print('---')
print('JS files failing syntax:', fails)
