/**
 * ============================================================
 *  Bharat Darshan — js/lens-page.js
 *  Manuscript Lens: facsimile + per-word OCR confidence,
 *  plus a genuine in-browser OCR uploader (tesseract.js, loaded
 *  on demand, degrading to a clear offline message).
 *
 *  Runs entirely from file:// — the CDN is only touched when the
 *  user presses "Read this image".
 * ============================================================ */
(function () {
  if (typeof window.$ !== "function") {
    window.$ = function (id) { return document.getElementById(id); };
  }
  function safeURL(url) {
    try { history.replaceState(null, "", url); } catch (e) { /* file:// */ }
  }

  var current = null;

  /* ---------- page picker, grouped by the monument each leaf describes ----------
     This was a flat row of "leaf 1 · English, leaf 2 · English, leaf 3 · हिन्दी"
     repeated once per document, so the same three numbers appeared twice and
     nothing said which site any of them belonged to. Grouping by the page's
     primary site gives each run a name you can read at a glance. */
  function renderPicker() {
    var box = $("pagePicker");
    box.innerHTML = "";

    var groups = [];
    PAGES.forEach(function (p) {
      var key = (p.siteIds && p.siteIds[0]) || "__none";
      var g = null;
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].key === key) { g = groups[i]; break; }
      }
      if (!g) { g = { key: key, pages: [] }; groups.push(g); }
      g.pages.push(p);
    });

    groups.forEach(function (g) {
      var site = Lens.site(g.key);
      var section = document.createElement("div");
      section.className = "page-group";

      var head = document.createElement("div");
      head.className = "page-group-head";
      var name = document.createElement("span");
      name.className = "page-group-name";
      name.textContent = site ? site.name : g.key;
      head.appendChild(name);
      if (site) {
        var link = document.createElement("a");
        link.className = "page-group-link";
        link.href = "index.html?focus=" + site.id;
        link.textContent = "on map";
        head.appendChild(link);
      }
      section.appendChild(head);

      g.pages.forEach(function (p) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-page", p.id);
        b.textContent = "Leaf " + p.seq + " · " + (p.lang === "hi" ? "हिन्दी" : "English");
        b.addEventListener("click", function () { show(p); });
        section.appendChild(b);
      });

      box.appendChild(section);
    });
  }

  /* ---------- facsimile with absolutely-positioned word boxes ---------- */
  function renderStage(page) {
    var stage = $("stage");
    stage.innerHTML = "";

    var holder = document.createElement("div");
    holder.style.cssText = "position:absolute;inset:0";
    holder.innerHTML = facsimileSVG(page);
    stage.appendChild(holder);

    /* Word boxes are positioned in PERCENTAGES of the SVG viewBox, so
       there is no dependency on layout timing or on the SVG being
       fully measured before they land. */
    page.words.forEach(function (w, i) {
      var box = document.createElement("div");
      box.className = "wordbox" + (w.c < 78 ? " low" : "");
      box.setAttribute("data-wi", i);
      box.setAttribute("tabindex", "0");
      box.setAttribute("role", "button");
      box.setAttribute("aria-label", w.t + ", confidence " + w.c);
      box.title = w.t + " · " + w.c;
      box.style.left   = (w.x / FACSIMILE_W * 100) + "%";
      box.style.top    = (w.y / FACSIMILE_H * 100) + "%";
      box.style.width  = (w.w / FACSIMILE_W * 100) + "%";
      box.style.height = (w.h / FACSIMILE_H * 100) + "%";

      function sel() { selectWord(i); }
      box.addEventListener("click", sel);
      box.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sel(); }
      });
      stage.appendChild(box);
    });
  }

  /* ---------- per-word confidence list ---------- */
  function renderWords(page) {
    var box = $("wordList");
    box.innerHTML = page.words.map(function (w, i) {
      var col = w.c >= 92 ? "var(--moss)" : w.c >= 78 ? "var(--gold)" : "var(--oxblood)";
      return '<div class="wordrow" data-wi="' + i + '">' +
        '<span>' + esc(w.t) + '</span>' +
        '<span><span class="conf-bar"><i style="width:' + w.c + '%;background:' + col + '"></i></span>' +
        '<span class="conf-num">' + w.c + '</span></span>' +
      '</div>';
    }).join("");

    box.querySelectorAll(".wordrow").forEach(function (row) {
      row.addEventListener("click", function () { selectWord(+row.getAttribute("data-wi")); });
    });
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function selectWord(i) {
    document.querySelectorAll(".wordbox.sel, .wordrow.sel").forEach(function (el) {
      el.classList.remove("sel");
    });
    var b = document.querySelector('.wordbox[data-wi="' + i + '"]');
    var r = document.querySelector('.wordrow[data-wi="' + i + '"]');
    if (b) { b.classList.add("sel"); b.focus(); }
    if (r) { r.classList.add("sel"); r.scrollIntoView({ block: "nearest" }); }
  }

  /* ---------- show one page ---------- */
  function show(page) {
    if (!page) return;
    current = page;
    safeURL("?page=" + page.id);

    document.querySelectorAll("#pagePicker button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-page") === page.id));
    });

    var doc = Lens.doc(page.docId);
    var sites = page.siteIds.filter(function (id) { return Lens.site(id); });
    var primary = sites.length ? Lens.site(sites[0]) : null;

    $("pageTitle").textContent = "Leaf " + page.seq;

    /* Name the monuments this leaf actually describes. Previously the meta
       line only carried the corpus title, so a reader could not tell which
       site any leaf belonged to — the same reason the picker is grouped. */
    var siteNames = sites.map(function (id) { return Lens.site(id).name; });
    $("pageMeta").innerHTML =
      (siteNames.length ? esc(siteNames.join(", ")) + " · " : "") +
      (doc ? esc(doc.title) + " · " : "") +
      esc(page.script || "") + " · " + page.wordCount + " words";

    /* The actual monument, photographed. Sits beside the transcription so the
       text is read next to the thing it describes instead of on its own. */
    var fig = $("lensPhoto");
    if (primary) {
      $("sitePhoto").src = "assets/img/" + primary.id + ".jpg";
      $("sitePhoto").alt = primary.name;
      $("sitePhotoCap").textContent =
        primary.name + (primary.city ? " · " + primary.city + ", " + primary.state : "");
      fig.hidden = false;
    } else {
      fig.hidden = true;
    }

    var tr = $("transcript");
    tr.className = "transcript" + (page.lang === "hi" ? " deva" : "");
    tr.innerHTML = page.lines.map(function (l, i) {
      return '<span style="display:block">' + esc(l) + '</span>';
    }).join("");

    var t = $("translation");
    if (page.translation && page.translation.en) {
      t.hidden = false;
      t.innerHTML = '<span style="display:block;font-size:.86rem;color:var(--teal);' +
        'letter-spacing:.04em;text-transform:uppercase;margin-bottom:4px">Gloss</span>' +
        '<span style="display:block;font-family:inherit;font-size:.95rem;color:#3D5248">' +
        esc(page.translation.en) + '</span>';
    } else {
      t.hidden = true;
    }

    renderStage(page);
    renderWords(page);

    /* cross-links: this leaf → its monuments (`sites` computed above) */
    $("siteLink").href = sites.length
      ? "index.html?focus=" + sites[0]
      : "index.html";
    $("graphLink").href = "graph.html?focus=page:" + page.id;
  }

  /* ============================================================
     Live OCR — real tesseract.js, loaded only on demand.
     ============================================================ */
  var TESS_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js";
  var tesseractLoading = null;

  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (tesseractLoading) return tesseractLoading;

    tesseractLoading = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = TESS_URL;
      s.async = true;
      s.onload = function () { resolve(window.Tesseract); };
      s.onerror = function () {
        tesseractLoading = null;
        reject(new Error("offline"));
      };
      document.head.appendChild(s);
    });
    return tesseractLoading;
  }

  function runOCR(langCode) {
    var input = $("ocrFile");
    var status = $("ocrStatus");
    var out = $("ocrOut");
    var file = input.files && input.files[0];

    if (!file) {
      status.textContent = "Choose an image first — a photograph or scan of any printed or written page.";
      out.hidden = true;
      return;
    }

    status.textContent = "Loading the OCR engine…";
    out.hidden = true;

    loadTesseract().then(function (T) {
      status.textContent = "Reading the image (this can take a few seconds)…";
      return T.recognize(file, langCode, {
        logger: function (m) {
          if (m.status === "recognizing text") {
            status.textContent = "Reading the image — " + Math.round((m.progress || 0) * 100) + "%";
          }
        }
      });
    }).then(function (res) {
      var words = (res && res.data && res.data.words) || [];
      status.textContent = words.length
        ? "Read " + words.length + " word regions at " +
          Math.round((res.data.confidence || 0)) + "% mean confidence."
        : "No words found — try a sharper or better-lit image.";

      out.innerHTML = words.map(function (w) {
        var c = Math.round(w.confidence || 0);
        var col = c >= 92 ? "var(--moss)" : c >= 78 ? "var(--gold)" : "var(--oxblood)";
        return '<span class="w" title="confidence ' + c + '" style="background:' + col +
          '22;border-bottom:2px solid ' + col + '">' + esc(w.text) + "</span>";
      }).join(" ") || "";
      out.hidden = false;
    }).catch(function (err) {
      status.textContent = (err && err.message === "offline")
        ? "The OCR engine could not be downloaded — you appear to be offline. " +
          "The demo leaves above are fully offline and need no download."
        : "The OCR engine could not read that image. " +
          "Try a flatter, better-lit photograph of a printed page.";
      out.hidden = true;
    });
  }

  /* ---------- boot ---------- */
  function init() {
    initLang();
    initA11y();

    renderPicker();

    $("ocrBtn").addEventListener("click", function () { runOCR("eng"); });
    $("ocrHiBtn").addEventListener("click", function () { runOCR("hin"); });

    var initial = "";
    try { initial = new URLSearchParams(location.search).get("page") || ""; } catch (e) { /* file:// */ }
    show(Lens.page(initial) || PAGES[0]);

    document.addEventListener("langchange", function () { show(current); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
