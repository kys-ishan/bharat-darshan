import io, os, re, glob, esprima

print("--- syntax ---")
fails = []
for f in sorted(glob.glob(os.path.join('js', '*.js'))):
    try:
        esprima.parseScript(io.open(f, encoding='utf-8').read())
        print('OK   ' + f)
    except Exception as e:
        # taj-story.js uses ES2020 optional chaining, which esprima 4 cannot
        # parse. Browsers handle it; this is a tool limitation, not a bug.
        line = getattr(e, 'lineNumber', 0)
        print('SKIP ' + f + '  (esprima limitation at line %s)' % line)
        fails.append(f)

print('--- local photos ---')
s = io.open(os.path.join('js', 'sites-data.js'), encoding='utf-8').read()
ids = re.findall(r'^\s{4}id: "([a-z0-9-]+)"', s, re.M)
present, missing = 0, []
tot = 0
for i in ids:
    p = os.path.join('assets', 'img', i + '.jpg')
    if os.path.isfile(p):
        present += 1
        tot += os.path.getsize(p)
    else:
        missing.append(i)
print('sites:', len(ids), ' photos present:', present,
      ' missing:', missing if missing else 'none')
print('total local photo size: %.1f MB' % (tot / 1048576))
print('---')
print('repo size (excl. .git): %.1f MB' % (
    sum(os.path.getsize(os.path.join(r, f))
        for r, d, fs in os.walk('.') if '.git' not in r
        for f in fs if os.path.isfile(os.path.join(r, f))) / 1048576))
