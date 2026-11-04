/**
 * ============================================================
 *  Bharat Darshan — js/lens-data.js
 *  The Living Archive: manuscript pages, entities, and the
 *  edges that bind them to the REAL monuments in sites-data.js.
 *
 *  HONESTY RULES (same as sites-data.js):
 *  1. `provenance: "synthetic-demo"` on every document — these are
 *     sample field notes written to exercise the OCR/search/graph
 *     pipeline. They are NOT quotations from real archives.
 *  2. Every monument claim inside a page is taken from THIS
 *     project's own sites-data.js entries (Solanki/Udayamati,
 *     pietra dura, basalt cliff, granite, charbagh, silt…).
 *     Nothing is asserted that the archive itself does not state.
 *  3. Site IDs are the REAL ids from sites-data.js, so every link
 *     opens monument.html?id=… — never a dead page.
 *  4. Page "images" are stylised SVG facsimiles. No photographs
 *     are used here, so there is no licence risk. Word boxes and
 *     confidence scores model the output shape of a real OCR pass
 *     (tesseract.image_to_data) — deterministic samples, not
 *     measurements. The live uploader on manuscript.html runs
 *     genuine OCR in the browser.
 *
 *  FIELD REFERENCE
 *    DOCS        documents (field-note collections)
 *    PAGES       one OCR'd leaf each: transcription + word boxes
 *    ENTITIES    materials, techniques, cultures, site types
 *    LENS_EDGES  doc→page, page→site, page→entity, entity↔entity
 *    TYPE_ENTITY generated from each site's own siteType
 * ============================================================
 */

/* ---------- deterministic RNG so facsimiles never re-shuffle ---------- */
function _rnd(n) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

/* ---------- transcription line → OCR-style word boxes ----------
   Same fields a real OCR pass emits: text, bbox, confidence 41..99. */
function packLine(words, y, opts) {
  opts = opts || {};
  let x = opts.x0 != null ? opts.x0 : 16;
  const h = opts.h || 10;
  const base = opts.conf != null ? opts.conf : 95;
  const seed = opts.seed || 3;
  const cpl = opts.cpl || 4.8;
  const out = [];
  words.forEach(function (w, i) {
    const cw = Math.max(7, w.length * cpl);
    const r = _rnd(seed + i * 13.7 + y);
    let c = base + (r * 20 - 10);
    if (w.slice(-1) === "…") c -= 22;          // damaged edge marker
    out.push({
      t: w,
      x: Math.round(x),
      y: y + (r > 0.82 ? 1 : 0),
      w: Math.round(cw),
      h: h,
      c: Math.round(Math.min(99, Math.max(41, c)))
    });
    x += cw + 5;
  });
  return out;
}

/* ==================================================================
   DOCUMENTS — synthetic demo corpus (see honesty rules above)
   ================================================================== */
const DOCS = [
  {
    id: "doc-water",
    title: "Field Notes — Stepwells & Water Architecture",
    titleHi: "क्षेत्र नोट्स — बावड़ियाँ और जल संरचना",
    author: "Sample Explorer Fellowship corpus",
    year: 2024,
    license: "Synthetic demo corpus — CC0, written for this project",
    provenance: "synthetic-demo"
  },
  {
    id: "doc-stone",
    title: "Craft & Stone Survey — Rock-cut and Monsoon Sites",
    titleHi: "शिल्प और पत्थर सर्वेक्षण — शैलचित्र एवं मानसून स्थल",
    author: "Sample field survey corpus",
    year: 2025,
    license: "Synthetic demo corpus — CC0, written for this project",
    provenance: "synthetic-demo"
  }
];

/* ==================================================================
   PAGES — siteIds use the REAL monument ids from sites-data.js
   ================================================================== */
const PAGES = [
  {
    id: "p-water-01",
    docId: "doc-water",
    seq: 1,
    siteIds: ["rani-ki-vav"],
    entityIds: ["e-stepwell", "e-sandstone", "e-sculpted-panel", "e-solanki", "e-water"],
    script: "Latin (English)",
    lang: "en",
    damageZone: true,
    lines: [
      "Rani ki Vav descends below ground as a stepped well.",
      "Red and yellow sandstone carries the carved panels.",
      "Queen Udayamati commissioned it under Solanki rule.",
      "Photograph the wall panels before the light drops…",
      "Silt once buried the lower storeys of the well."
    ],
    translation: null
  },
  {
    id: "p-water-02",
    docId: "doc-water",
    seq: 2,
    siteIds: ["rani-ki-vav", "humayuns-tomb"],
    entityIds: ["e-water", "e-charbagh", "e-stepwell"],
    script: "Latin (English)",
    lang: "en",
    damageZone: false,
    lines: [
      "Two sites treat water as architecture, not utility.",
      "At the stepwell the stair draws you down to water.",
      "At the tomb the charbagh divides the garden in four.",
      "Note the temperature of the covered galleries…",
      "Compare gallery depth with the tomb's plinth."
    ],
    translation: null
  },
  {
    id: "p-water-03",
    docId: "doc-water",
    seq: 3,
    siteIds: ["rani-ki-vav"],
    entityIds: ["e-stepwell", "e-sculpted-panel", "e-solanki", "e-weathering"],
    script: "Devanagari transcription",
    lang: "hi",
    damageZone: true,
    lines: [
      "रानी की वाव एक सीढ़ीदार कुआँ है।",
      "दीवारों पर लाल और पीले बलुआ पत्थर के पैनल बने हैं।",
      "रानी उदयमति ने सोलंकी काल में इसे बनवाया।",
      "कई मंज़िलें कई सालों तक मिट्टी में दबी रहीं…"
    ],
    translation: {
      en: "Rani ki Vav is a stepped well. Walls carry panels of red and yellow sandstone. Queen Udayamati had it built during Solanki rule. Several storeys lay buried under silt for many years…"
    }
  },
  {
    id: "p-stone-01",
    docId: "doc-stone",
    seq: 1,
    siteIds: ["ellora", "ajanta"],
    entityIds: ["e-rock-cut", "e-basalt", "e-mural"],
    script: "Latin (English)",
    lang: "en",
    damageZone: false,
    lines: [
      "The caves were cut into a basalt cliff, not built up.",
      "Kailasa was carved downward from a single mass of rock.",
      "Buddhist, Hindu and Jain caves share one cliff face.",
      "At Ajanta the murals survive on the cave walls.",
      "Record the wall surfaces before scaffolding goes up…"
    ],
    translation: null
  },
  {
    id: "p-stone-02",
    docId: "doc-stone",
    seq: 2,
    siteIds: ["hampi", "mahabalipuram", "brihadeeswarar"],
    entityIds: ["e-granite", "e-weathering", "e-inscription", "e-vijayanagara"],
    script: "Latin (English)",
    lang: "en",
    damageZone: true,
    lines: [
      "Hampi's ruins sit in a boulder-strewn landscape.",
      "Market street alignments are still readable in ruins.",
      "At Mahabalipuram the temple is cut granite blocks.",
      "Sea salt and wind have weathered the granite smooth.",
      "Brihadeeswarar's vimana is crowned by one granite block…"
    ],
    translation: null
  },
  {
    id: "p-stone-03",
    docId: "doc-stone",
    seq: 3,
    siteIds: ["taj-mahal"],
    entityIds: ["e-marble", "e-pietra-dura", "e-mughal"],
    script: "Devanagari transcription",
    lang: "hi",
    damageZone: false,
    lines: [
      "सफ़ेद मकराना संगमरमर पर पत्थर की जड़ाई है।",
      "पिएत्रा डूरा में बहुमूल्य पत्थर जड़े जाते हैं।",
      "द्वार पर कॉलिग्राफ़ी पैनल बने हैं।",
      "प्रदूषण से संगमरमर को नुकसान पहुँचा था…"
    ],
    translation: {
      en: "Stone inlay work adorns the white Makrana marble. In pietra dura, precious stones are set into the surface. Calligraphic panels frame the gate. Pollution had damaged the marble…"
    }
  }
];

/* build word boxes from the transcription */
PAGES.forEach(function (p) {
  const words = [];
  let y = 34;
  p.lines.forEach(function (line, li) {
    words.push.apply(words, packLine(line.split(" "), y, {
      seed: (p.id.charCodeAt(2) || 5) * (li + 1),
      conf: p.damageZone && li >= p.lines.length - 2 ? 82 : 95
    }));
    y += 26;
  });
  p.words = words;
  p.text = p.lines.join(" ");
  p.wordCount = p.text.split(/\s+/).length;
});

/* ==================================================================
   ENTITIES — every note rests on facts stated in sites-data.js
   ================================================================== */
const ENTITIES = [
  /* site types: generated from each site's own siteType field */
  { id: "e-fort",      label: "Fort",            labelHi: "किला",         type: "siteType", note: "Defensive and palatial stronghold." },
  { id: "e-temple",    label: "Temple",          labelHi: "मंदिर",        type: "siteType", note: "Structural or rock-cut place of worship." },
  { id: "e-tomb",      label: "Tomb",            labelHi: "समाधि",        type: "siteType", note: "Mausoleum or funerary monument." },
  { id: "e-cave",      label: "Cave",            labelHi: "गुफा",         type: "siteType", note: "Rock-cut cave or shelter group." },
  { id: "e-stepwell",  label: "Stepwell / Baodi", labelHi: "बावड़ी",      type: "structure", note: "Subterranean stepped water architecture, as at Rani ki Vav." },
  { id: "e-palace",    label: "Palace",          labelHi: "महल",          type: "siteType", note: "Residential court architecture." },
  { id: "e-monument",  label: "Monument",        labelHi: "स्मारक",       type: "siteType", note: "Protected structure that is neither fort, temple nor tomb." },

  /* materials & techniques */
  { id: "e-sandstone",  label: "Sandstone",         labelHi: "बलुआ पत्थर",  type: "material", note: "Carving stone — red and yellow at Rani ki Vav, red at Qutub Minar and the Red Fort." },
  { id: "e-marble",     label: "Marble",            labelHi: "संगमरमर",     type: "material", note: "White Makrana marble of the Taj Mahal; also inlaid work at the Golden Temple." },
  { id: "e-granite",    label: "Granite",           labelHi: "ग्रेनाइट",    type: "material", note: "Cut granite blocks at Mahabalipuram and the single crown block of Brihadeeswarar." },
  { id: "e-basalt",     label: "Basalt",            labelHi: "बेसाल्ट",     type: "material", note: "The hard cliff face the Ellora caves were cut into." },
  { id: "e-pietra-dura", label: "Pietra dura inlay", labelHi: "पत्थर की जड़ाई", type: "technique", note: "Setting cut semi-precious stones into marble to form patterns." },
  { id: "e-rock-cut",   label: "Rock-cut technique", labelHi: "शैलचित्र कार्य", type: "technique", note: "Carving architecture out of living rock — downward at Kailasa, Ellora." },
  { id: "e-mural",      label: "Painting (mural & rock)", labelHi: "भित्ति चित्र", type: "technique", note: "Wall and rock-face painting, from Ajanta's murals to Bhimbetka's shelters." },
  { id: "e-charbagh",   label: "Charbagh garden",   labelHi: "चारबाग़",      type: "element",  note: "A garden divided into four quarters by water channels, as at Humayun's Tomb." },
  { id: "e-sculpted-panel", label: "Sculpted panel", labelHi: "मूर्ति पैनल", type: "element", note: "Figurative relief panels in stone, as on the walls of Rani ki Vav." },
  { id: "e-inscription", label: "Inscription",      labelHi: "अभिलेख",      type: "element",  note: "Carved text — Tamil grants recorded on the walls of Brihadeeswarar Temple." },
  { id: "e-weathering", label: "Weathering",        labelHi: "अपरदन",       type: "process",  note: "Surface change over time — sea salt at Mahabalipuram, silt burial at Rani ki Vav." },
  { id: "e-water",      label: "Water architecture", labelHi: "जल संरचना",  type: "concept",  note: "Design built around reaching, holding or moving water: stepwells and charbagh channels." },

  /* cultures named in sites-data.js */
  { id: "e-mughal",         label: "Mughal",         labelHi: "मुग़ल",      type: "culture", note: "Imperial patronage behind the Taj Mahal, Red Fort and Humayun's Tomb." },
  { id: "e-solanki",        label: "Solanki (Chaulukya)", labelHi: "सोलंकी", type: "culture", note: "Dynasty ruling Gujarat when Rani ki Vav was commissioned by Queen Udayamati." },
  { id: "e-vijayanagara",   label: "Vijayanagara",   labelHi: "विजयनगर",    type: "culture", note: "Empire whose capital landscape survives at Hampi." }
];

/* ==================================================================
   EDGES — LENS_EDGES bind documents to the real archive.
   rel: HAS_PAGE | MENTIONS | LINKED_TO
   ================================================================== */
const LENS_EDGES = [
  { s: "doc:doc-water", r: "HAS_PAGE", d: "page:p-water-01" },
  { s: "doc:doc-water", r: "HAS_PAGE", d: "page:p-water-02" },
  { s: "doc:doc-water", r: "HAS_PAGE", d: "page:p-water-03" },
  { s: "doc:doc-stone", r: "HAS_PAGE", d: "page:p-stone-01" },
  { s: "doc:doc-stone", r: "HAS_PAGE", d: "page:p-stone-02" },
  { s: "doc:doc-stone", r: "HAS_PAGE", d: "page:p-stone-03" }
];

/* page → site / entity (generated so data can never drift) */
PAGES.forEach(function (p) {
  p.siteIds.forEach(function (id) {
    if (SITES.some(function (s) { return s.id === id; })) {
      LENS_EDGES.push({ s: "page:" + p.id, r: "MENTIONS", d: "site:" + id });
    }
  });
  p.entityIds.forEach(function (id) {
    LENS_EDGES.push({ s: "page:" + p.id, r: "MENTIONS", d: "entity:" + id });
  });
});

/* entity ↔ entity relationships */
[
  ["e-water", "e-stepwell"], ["e-marble", "e-pietra-dura"],
  ["e-rock-cut", "e-basalt"], ["e-sandstone", "e-sculpted-panel"],
  ["e-mural", "e-rock-cut"],  ["e-charbagh", "e-mughal"],
  ["e-granite", "e-weathering"], ["e-inscription", "e-granite"]
].forEach(function (pair) {
  LENS_EDGES.push({ s: "entity:" + pair[0], r: "LINKED_TO", d: "entity:" + pair[1] });
});

/* every site → its own siteType entity (guarantees no isolated nodes) */
const TYPE_ENTITY = {
  fort: "e-fort", temple: "e-temple", tomb: "e-tomb",
  cave: "e-cave", palace: "e-palace", stepwell: "e-stepwell",
  monument: "e-monument"
};
SITES.forEach(function (s) {
  const e = TYPE_ENTITY[s.siteType];
  if (e) LENS_EDGES.push({ s: "site:" + s.id, r: "CLASSIFIED_AS", d: "entity:" + e });
});

/* extra site → entity links, each verified against sites-data.js */
const SITE_EXTRAS = {
  "taj-mahal":       ["e-marble", "e-pietra-dura", "e-mughal"],
  "humayuns-tomb":   ["e-charbagh", "e-sandstone", "e-mughal"],
  "red-fort":        ["e-sandstone", "e-marble", "e-mughal"],
  "agra-fort":       ["e-sandstone", "e-marble", "e-mughal"],
  "fatehpur-sikri":  ["e-marble", "e-mughal"],
  "qutub-minar":     ["e-sandstone"],
  "golden-temple":   ["e-marble"],
  "rani-ki-vav":     ["e-sandstone", "e-solanki", "e-sculpted-panel", "e-water"],
  "ellora":          ["e-basalt", "e-rock-cut"],
  "ajanta":          ["e-rock-cut", "e-mural"],
  "bhimbetka":       ["e-sandstone", "e-mural"],
  "hampi":           ["e-vijayanagara"],
  "mahabalipuram":   ["e-granite", "e-weathering"],
  "brihadeeswarar":  ["e-granite", "e-inscription"],
  "mysore-palace":   ["e-granite"]
};
Object.keys(SITE_EXTRAS).forEach(function (siteId) {
  if (!SITES.some(function (s) { return s.id === siteId; })) return;  // never invent a site
  SITE_EXTRAS[siteId].forEach(function (eid) {
    LENS_EDGES.push({ s: "site:" + siteId, r: "USES", d: "entity:" + eid });
  });
});

/* ==================================================================
   helpers shared by archive.html / manuscript.html / graph.html
   ================================================================== */
const Lens = {
  site: function (id) { return SITES.filter(function (s) { return s.id === id; })[0]; },
  doc: function (id) { return DOCS.filter(function (d) { return d.id === id; })[0]; },
  page: function (id) { return PAGES.filter(function (p) { return p.id === id; })[0]; },
  entity: function (id) { return ENTITIES.filter(function (e) { return e.id === id; })[0]; },

  /** resolve a "site:x" / "page:x" / "entity:x" / "doc:x" reference */
  node: function (ref) {
    const p = String(ref).split(":");
    if (p[0] === "site") return this.site(p[1]);
    if (p[0] === "doc") return this.doc(p[1]);
    if (p[0] === "page") return this.page(p[1]);
    if (p[0] === "entity") return this.entity(p[1]);
    return null;
  },
  kindOf: function (ref) { return String(ref).split(":")[0]; },

  labelOf: function (ref) {
    const n = this.node(ref);
    if (!n) return ref;
    return n.label || n.title || n.name || n.id;
  },

  /** pages that mention a given monument (for monument deep-dives) */
  pagesForSite: function (siteId) {
    return PAGES.filter(function (p) { return p.siteIds.indexOf(siteId) >= 0; });
  },

  stats: function () {
    return {
      sites: SITES.length,
      docs: DOCS.length,
      pages: PAGES.length,
      entities: ENTITIES.length,
      edges: LENS_EDGES.length,
      words: PAGES.reduce(function (a, p) { return a + p.wordCount; }, 0)
    };
  }
};

/* ==================================================================
   SVG facsimile renderers (shared)
   ================================================================== */
const FACSIMILE_W = 420, FACSIMILE_H = 560;

/** Escape a word for use inside SVG text content. */
function xmlEsc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Full facsimile: aged paper with the transcription actually written on it.
 *
 * Each word is drawn as <text> forced to fill the exact region OCR reported
 * (textLength + lengthAdjust), so the writing occupies the measured box rather
 * than floating inside it. Confidence is carried by the ink colour and by
 * opacity, which is what the legend refers to.
 *
 * This used to draw every word as a plain rectangle. Stacked edge to edge
 * across a whole page those read as coloured bars, not as writing, and the
 * page looked like a chart of its own OCR rather than a manuscript — which was
 * the complaint that prompted the change.
 */
function facsimileSVG(page) {
  const ink = function (c) {
    return c >= 92 ? "#123A2E" : c >= 78 ? "#5F7040" : "#4B1216";
  };
  const font = page.lang === "hi"
    ? "'Noto Sans Devanagari', sans-serif"
    : "'Cormorant Garamond', Georgia, serif";

  let s =
    '<svg viewBox="0 0 ' + FACSIMILE_W + " " + FACSIMILE_H + '" role="img" ' +
    'aria-label="Stylised facsimile of a manuscript page. Each word is written in the region OCR reported and coloured by confidence.">' +
    "<defs>" +
    '<linearGradient id="lensPaper" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#FBF4E6"/><stop offset="1" stop-color="#F1E9CD"/></linearGradient>' +
    "</defs>" +
    '<rect width="100%" height="100%" fill="url(#lensPaper)"/>';

  s += '<rect x="10" y="10" width="' + (FACSIMILE_W - 20) + '" height="' + (FACSIMILE_H - 20) +
       '" fill="none" stroke="#C9A227" stroke-width="1" opacity="0.7"/>';
  s += '<rect x="14" y="14" width="' + (FACSIMILE_W - 28) + '" height="' + (FACSIMILE_H - 28) +
       '" fill="none" stroke="#C9A227" stroke-width="0.5" opacity="0.5"/>';

  page.words.forEach(function (w, i) {
    // faint tint only where OCR struggled, so damaged zones stay findable
    // without covering the writing everywhere else
    if (w.c < 78) {
      s += '<rect x="' + (w.x - 2) + '" y="' + (w.y - 2) +
           '" width="' + (w.w + 4) + '" height="' + (w.h + 4) +
           '" rx="2" fill="#4B1216" opacity="0.10"/>';
    }
    s += '<text data-wi="' + i + '" x="' + w.x +
      '" y="' + (w.y + w.h * 0.88).toFixed(1) +
      '" textLength="' + w.w + '" lengthAdjust="spacingAndGlyphs"' +
      ' font-family="' + font + '"' +
      ' font-size="' + (w.h * 1.18).toFixed(1) + '"' +
      ' fill="' + ink(w.c) + '" opacity="' + (0.45 + (w.c / 100) * 0.55).toFixed(2) + '">' +
      xmlEsc(w.t) + "</text>";
  });
  return s + "</svg>";
}

/** small thumbnail for search results */
function thumbSVG(page) {
  let s = '<svg viewBox="0 0 ' + FACSIMILE_W + " " + FACSIMILE_H + '" aria-hidden="true">' +
    '<rect width="100%" height="100%" fill="#F7F1DE"/>';
  page.words.forEach(function (w) {
    s += '<rect x="' + w.x + '" y="' + w.y + '" width="' + w.w + '" height="' + w.h +
      '" rx="3" fill="' + (w.c < 78 ? "#4B1216" : "#123A2E") + '" opacity="0.82"/>';
  });
  return s + "</svg>";
}

/** confidence helpers shared across pages */
function confClass(c) { return c >= 92 ? "conf-lo" : c >= 78 ? "conf-md" : "conf-hi"; }
function confColor(c) { return c >= 92 ? "var(--moss)" : c >= 78 ? "var(--gold)" : "var(--oxblood)"; }
