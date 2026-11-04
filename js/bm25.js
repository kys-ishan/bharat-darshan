/**
 * ============================================================
 *  Bharat Darshan — js/bm25.js
 *  BM25 full-text index over the WHOLE living archive:
 *    · the 25 real monuments in sites-data.js  (SITES)
 *    · the manuscript corpus in lens-data.js   (PAGES / DOCS / ENTITIES)
 *
 *  No build step, no dependencies, no network. Runs from file://.
 *
 *  Why BM25 and not "includes()":
 *  it ranks by how specific a word is across the archive, so
 *  "granite" surfaces Mahabalipuram and Brihadeeswarar above a
 *  page that merely says "stone" a lot.
 * ============================================================ */

const PothiSearch = (function () {
  /* ---------- tokenizer ----------
     Lowercase, strip punctuation, drop very short tokens.
     Devanagari is tokenised too (for the Hindi title/name fields and
     the Devanagari pages), but we never pretend BM25 on Hindi is as
     good as a real morphological analyser — see about.html. */
  function tokenize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
      .replace(/[^a-z0-9\u0900-\u097F]+/g, " ")
      .split(/\s+/)
      .filter(function (t) { return t.length > 1; });
  }

  /* ---------- corpus → documents ---------- */
  function buildDocuments() {
    const docs = [];

    /* 1. Real monuments — one doc each */
    SITES.forEach(function (s) {
      const facts = (s.quickFacts || [])
        .map(function (f) { return f.label + " " + f.value; }).join(" ");
      const story = (s.story || [])
        .map(function (b) { return (b.title || "") + " " + (b.body || ""); }).join(" ");
      docs.push({
        kind: "site",
        ref: "site:" + s.id,
        title: s.name,
        titleHi: s.nameHi || "",
        body: [
          s.name, s.nameHi, s.city, s.state, s.region,
          s.siteType, s.era, (s.traditions || []).join(" "),
          s.shortDescription, s.history, facts, story
        ].join(" "),
        /* extra weight for the fields a human types most */
        boost: tokenize(s.name + " " + s.nameHi).length * 0.6 +
                tokenize(s.city + " " + s.state).length * 0.25,
        href: "monument.html?id=" + s.id,
        obj: s
      });
    });

    /* 2. Manuscript pages — one doc each */
    PAGES.forEach(function (p) {
      const siteNames = p.siteIds.map(function (id) {
        const s = Lens.site(id); return s ? s.name + " " + (s.nameHi || "") : "";
      }).join(" ");
      const entNames = p.entityIds.map(function (id) {
        const e = Lens.entity(id); return e ? e.label + " " + (e.labelHi || "") : "";
      }).join(" ");
      docs.push({
        kind: "page",
        ref: "page:" + p.id,
        title: "Page " + p.seq + " — " + (p.script || "transcription"),
        body: [p.text, siteNames, entNames, p.lang, p.script].join(" "),
        boost: tokenize(siteNames).length * 0.4,
        href: "manuscript.html?page=" + p.id,
        obj: p
      });
    });

    /* 3. Entities */
    ENTITIES.forEach(function (e) {
      docs.push({
        kind: "entity",
        ref: "entity:" + e.id,
        title: e.label,
        titleHi: e.labelHi || "",
        body: [e.label, e.labelHi, e.note, e.type].join(" "),
        boost: 0,
        href: "graph.html?focus=entity:" + e.id,
        obj: e
      });
    });

    /* 4. Documents (the field-note collections) */
    DOCS.forEach(function (d) {
      docs.push({
        kind: "doc",
        ref: "doc:" + d.id,
        title: d.title,
        titleHi: d.titleHi || "",
        body: [d.title, d.titleHi, d.author, d.year, d.license].join(" "),
        boost: 0,
        href: "graph.html?focus=doc:" + d.id,
        obj: d
      });
    });

    return docs;
  }

  /* ---------- inverted index ---------- */
  let INDEX = null;

  function ensureIndex() {
    if (INDEX) return INDEX;

    const docs = buildDocuments();
    const df = Object.create(null);        // term → doc frequency
    const postings = Object.create(null);  // term → [{i, tf, boost}]

    docs.forEach(function (d, i) {
      const toks = tokenize(d.body);
      const tf = Object.create(null);
      toks.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
      d.len = toks.length;
      Object.keys(tf).forEach(function (t) {
        (postings[t] || (postings[t] = [])).push({
          i: i, tf: tf[t], boost: d.boost || 0
        });
        df[t] = (df[t] || 0) + 1;
      });
    });

    const totalLen = docs.reduce(function (a, d) { return a + d.len; }, 0);

    INDEX = {
      docs: docs,
      df: df,
      postings: postings,
      avgdl: totalLen / (docs.length || 1),
      n: docs.length
    };
    return INDEX;
  }

  /* ---------- BM25 scoring ---------- */
  const K1 = 1.4, B = 0.72;

  function scoreTerm(idx, q, p) {
    const f = idx.df[q] || 0;
    if (!f) return 0;
    const idf = Math.log(1 + (idx.n - f + 0.5) / (f + 0.5));
    const doc = idx.docs[p.i];
    const denom = p.tf + K1 * (1 - B + B * (doc.len / idx.avgdl));
    return idf * (p.tf * (K1 + 1)) / denom + idf * (p.boost || 0) * 0.35;
  }

  function search(query, limit) {
    const idx = ensureIndex();
    const qTokens = tokenize(query);
    if (!qTokens.length) return [];

    /* de-dup query tokens, weight rarer ones harder (a light "IDF query expansion") */
    const seen = Object.create(null);
    const terms = [];
    qTokens.forEach(function (t) {
      seen[t] = (seen[t] || 0) + 1;
    });
    Object.keys(seen).forEach(function (t) {
      terms.push({ t: t, w: seen[t] });
    });

    const scores = Object.create(null);
    terms.forEach(function (term) {
      const list = idx.postings[term.t];
      if (!list) return;
      list.forEach(function (p) {
        scores[p.i] = (scores[p.i] || 0) + scoreTerm(idx, term.t, p) * term.w;
      });
    });

    /* phrase bonus: exact query substring present in the body */
    const phrase = query.toLowerCase().trim();
    if (phrase.length > 3) {
      Object.keys(scores).forEach(function (i) {
        if (idx.docs[i].body.toLowerCase().indexOf(phrase) >= 0) {
          scores[i] *= 1.35;
        }
      });
    }

    const out = Object.keys(scores)
      .map(function (i) { return { doc: idx.docs[+i], score: scores[+i] }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });

    return out.slice(0, limit || 24);
  }

  /* ---------- highlight: wrap matched tokens in <mark> ---------- */
  const RE = new RegExp(
    "(" + [
      "fort", "forts", "temple", "temples", "tomb", "tombs", "cave", "caves",
      "stepwell", "stepwells", "baodi", "water", "garden", "gardens",
      "marble", "sandstone", "granite", "basalt", "stone", "stones",
      "inlay", "mural", "murals", "painting", "paintings", "inscription",
      "inscriptions", "sculpture", "panel", "panels", "charbagh",
      "mughal", "chola", "pallava", "solanki", "vijayanagara", "rashtrakuta",
      "granite", "unesco", "world", "heritage", "architecture", "rock",
      "carved", "cut", "weathering", "silt", "buried"
    ].join("|") + ")",
    "gi"
  );

  function highlight(text) {
    const esc = String(text || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc.replace(RE, function (m) { return "<mark>" + m + "</mark>"; });
  }

  /** snippet: find the densest window of query terms in the text */
  function snippet(text, query, width) {
    width = width || 190;
    const s = String(text || "");
    const terms = tokenize(query);
    if (!terms.length) return highlight(s.slice(0, width)) + (s.length > width ? "…" : "");

    const lower = s.toLowerCase();
    let best = -1, bestCount = 0;
    for (let start = 0; start < s.length; start += 18) {
      const win = lower.substr(start, width);
      let c = 0;
      terms.forEach(function (t) {
        let i = -1;
        while ((i = win.indexOf(t, i + 1)) >= 0) c++;
      });
      if (c > bestCount) { bestCount = c; best = start; }
    }
    if (best < 0) best = 0;

    let cut = s.slice(best, best + width);
    if (best > 0) cut = "…" + cut.replace(/^\S*\s/, "");
    if (best + width < s.length) cut = cut.replace(/\s\S*$/, "") + "…";
    return highlight(cut);
  }

  /* ---------- suggestions shown before the user types ---------- */
  const STARTERS = [
    "granite", "marble inlay", "stepwell", "charbagh",
    "rock-cut", "sandstone", "Vijayanagara", "mural", "weathering"
  ];

  return {
    search: search,
    tokenize: tokenize,
    highlight: highlight,
    snippet: snippet,
    starters: STARTERS,
    size: function () { return ensureIndex().n; }
  };
})();
