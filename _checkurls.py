import io, os, re, subprocess, time

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
src = io.open("js/sites-data.js", encoding="utf-8").read()
urls = sorted(set(u for u in re.findall(r'https://[^\s"\',)]+', src)
                  if "wikimedia.org" in u))
UA = "BharatDarshanHackathon/1.0 (heritage atlas; contact via repo issues)"

bad = []
for i, u in enumerate(urls, 1):
    code = ""
    for attempt in range(3):
        p = subprocess.run(
            ["curl.exe", "-s", "-o", "NUL", "-w", "%{http_code}", "-L",
             "--max-time", "30", "-A", UA, u], capture_output=True, text=True)
        code = p.stdout.strip()
        if code == "200":
            break
        time.sleep(3)
    ok = code == "200"
    print(("OK   " if ok else "FAIL ") + f"{code}  [{i}/{len(urls)}] " + u.rsplit('/', 1)[-1][:60])
    if not ok:
        bad.append((code, u))
    time.sleep(1.2)

print("---")
print("wikimedia urls:", len(urls), " failing:", len(bad))
for c, u in bad:
    print("  ", c, u)
