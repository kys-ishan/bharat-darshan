/**
 * ============================================================
 *  Bharat Darshan — js/archive-page.js
 *  Living Archive hub + BM25 search over SITES + PAGES + ENTITIES.
 *
 *  Runs entirely from file:// — no fetch, no modules, no network.
 * ============================================================ */
(function () {
  /* belt-and-braces: their $ helper lives in app.js, which this page
     does not load, so provide one if it is missing. */
  if (typeof window.$ !== "function") {
    window.$ = function (id) { return document.getElementById(id); };
  }

  /* file:// has an opaque origin, so history.replaceState can throw a
     SecurityError. Deep-linking is a nicety — never let it kill a page. */
  function safeURL(url) {
    try { history.replaceState(null, "", url); } catch (e) { /* file:// */ }
  }

  var lastQuery = "";

  /* ---------- starter chips ---------- */
  function renderChips() {
    var box = $("chips");
    if (!box) return;
    box.innerHTML = "";
    PothiSearch.starters.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pill";
      b.textContent = s;
      b.addEventListener("click", function () {
        $("q").value = s;
        run(s);
      });
      box.appendChild(b);
    });
  }

  /* ---------- stat strip ---------- */
  function renderStats() {
    var box = $("stats");
    if (!box) return;
    var s = Lens.stats();
    var rows = [
      [s.sites, "monuments"],
      [s.pages, "ms. pages"],
      [s.entities, "entities"],
      [s.words, "OCR'd words"],
      [PothiSearch.size(), "indexed docs"]
    ];
    box.innerHTML = rows.map(function (r) {
      return "<div><b>" + r[0] + "</b><span>" + r[1] + "</span></div>";
    }).join("");
  }

  /* ---------- one result row ---------- */
  function resultHTML(r) {
    var d = r.doc, kind = d.kind, o = d.obj;
    var thumb, where, excerpt, links;

    if (kind === "site") {
      thumb = (o.heroImage)
        ? '<img src="' + o.heroImage + '" alt="" loading="lazy" />'
        : thumbSVG(PAGES[0]);
      where = [o.city, o.state, o.era].filter(Boolean).join(" · ");
      excerpt = PothiSearch.snippet(o.history || o.shortDescription || "", lastQuery);
      links =
        '<a class="btn btn-ghost btn-sm" href="monument.html?id=' + o.id + '">Open the record</a>' +
        '<a class="btn btn-ghost btn-sm" href="graph.html?focus=site:' + o.id + '">Trace in graph</a>';
    } else if (kind === "page") {
      thumb = thumbSVG(o);
      var doc = Lens.doc(o.docId);
      where = (doc ? doc.title + " · " : "") + "leaf " + o.seq + " · " + (o.script || "");
      excerpt = PothiSearch.snippet(o.text, lastQuery);
      links =
        '<a class="btn btn-ghost btn-sm" href="manuscript.html?page=' + o.id + '">Read the field note</a>' +
        '<a class="btn btn-ghost btn-sm" href="graph.html?focus=page:' + o.id + '">Trace in graph</a>';
    } else if (kind === "entity") {
      thumb = '<div style="display:flex;align-items:center;justify-content:center;height:100%">' +
              '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#1D5A6E" stroke-width="1.6">' +
              '<circle cx="12" cy="12" r="8"/></svg></div>';
      where = (o.type || "") + " · entity";
      excerpt = PothiSearch.snippet(o.note || "", lastQuery);
      links = '<a class="btn btn-ghost btn-sm" href="graph.html?focus=entity:' + o.id + '">See its neighbours</a>';
    } else {
      thumb = '<div style="display:flex;align-items:center;justify-content:center;height:100%">' +
              '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#4B1216" stroke-width="1.6">' +
              '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/></svg></div>';
      where = (o.author || "") + " · " + (o.year || "");
      excerpt = PothiSearch.snippet(o.license || "", lastQuery);
      links = '<a class="btn btn-ghost btn-sm" href="graph.html?focus=doc:' + o.id + '">Open the collection</a>';
    }

    var title = kind === "site" ? o.name : (d.title || o.id);
    var hi = d.titleHi ? '<span style="font-family:\'Noto Sans Devanagari\',serif;color:var(--teal);font-size:.9rem"> ' + d.titleHi + '</span>' : "";

    return '<article class="result">' +
      '<div class="result-thumb">' + thumb + '</div>' +
      '<div>' +
        '<span class="result-kind" data-kind="' + kind + '">' + kind + '</span>' +
        '<h3><a href="' + d.href + '">' + PothiSearch.highlight(title) + '</a>' + hi + '</h3>' +
        '<p class="where">' + where + '</p>' +
        '<p class="excerpt">' + excerpt + '</p>' +
        '<div class="row">' + links + '</div>' +
      '</div>' +
    '</article>';
  }

  /* ---------- run a query ---------- */
  function run(q) {
    lastQuery = q || "";
    var out = $("results"), count = $("resultCount");
    safeURL(lastQuery ? "?q=" + encodeURIComponent(lastQuery) : location.pathname);

    if (!lastQuery) {
      out.innerHTML = "";
      count.textContent = "Type to search " + PothiSearch.size() +
        " documents — or pick one of the suggestions above.";
      return;
    }

    var hits = PothiSearch.search(lastQuery, 24);
    count.textContent = hits.length
      ? hits.length + " result" + (hits.length === 1 ? "" : "s") + " for “" + lastQuery + "”"
      : "Nothing in the archive matches “" + lastQuery + "”.";
    out.innerHTML = hits.map(resultHTML).join("");
  }

  /* ---------- boot ---------- */
  function init() {
    initLang();
    initA11y();

    renderChips();
    renderStats();

    $("searchForm").addEventListener("submit", function (e) {
      e.preventDefault();
      run($("q").value.trim());
    });

    /* deep link: archive.html?q=granite */
    var initial = "";
    try { initial = new URLSearchParams(location.search).get("q") || ""; } catch (e) { /* file:// */ }
    if (initial) $("q").value = initial;
    run(initial);

    document.addEventListener("langchange", function () { run(lastQuery); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
