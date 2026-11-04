/**
 * ============================================================
 *  Bharat Darshan — monument.js
 *  Renders monument.html?id=<site-id>
 *  Person C owns this file.
 *
 *  Everything below is rendered from js/sites-data.js. Nothing is
 *  hard-coded here, so adding a monument to the data file is all it
 *  takes to get a full detail page.
 * ============================================================
 */

(function () {
  "use strict";

  var site = null;
  var els = {};

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /** Site name in the current language; falls back to English. */
  function nameOf(s) { return (LANG === "hi" && s.nameHi) ? s.nameHi : s.name; }

  /** Body/history text in the current language. */
  function pick(s, enKey, hiKey) {
    return (LANG === "hi" && s[hiKey]) ? s[hiKey] : s[enKey];
  }

  function toast(msg) {
    var el = els.toast;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  /* ---------------- story mode icons ---------------- */

  var STAGE_ICONS = [
    // why it was built — a scroll
    '<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    // who built it — a chisel / tools
    '<path d="M3 21l6-6"/><path d="M9 15l6-6 3-3 3 3-3 3-6 6z"/><path d="M14 6l4 4"/>',
    // what to notice — an eye
    '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
    // how it changed — a clock
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    // why it matters — a star
    '<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.4l6-.8z"/>'
  ];

  function stageIcon(i) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (STAGE_ICONS[i] || STAGE_ICONS[0]) + "</svg>";
  }

  /* ---------------- renderers ---------------- */

  function renderHero() {
    var img = $("heroImg");
    img.alt = nameOf(site);
    img.src = "assets/img/" + site.id + ".jpg";
    img.onerror = function () { img.onerror = null; img.src = site.heroImage; };

    $("crumbName").textContent = nameOf(site);
    $("siteName").textContent = nameOf(site);
    document.title = nameOf(site) + " — Bharat Darshan";

    var kickerBits = [];
    if (site.isUnesco) kickerBits.push("UNESCO World Heritage Site");
    else kickerBits.push(t("siteType." + site.siteType));
    if (site.era) kickerBits.push(t("era." + site.era));
    $("heroKicker").textContent = kickerBits.join(" · ");

    $("siteLoc").textContent =
      site.city + ", " + site.state + " · " + t("region." + site.region) +
      (site.protectedBy ? " · " + site.protectedBy : "");

    var tags = ['<span class="tag">' + esc(t("siteType." + site.siteType)) + "</span>"];
    tags.push('<span class="tag">' + esc(t("era." + site.era)) + "</span>");
    (site.traditions || []).forEach(function (tr) {
      tags.push('<span class="tag">' + esc(t("traditions." + tr)) + "</span>");
    });
    if (site.isUnesco) tags.push('<span class="tag tag-un">' + esc(t("tag.unesco")) + "</span>");
    if (site.isOfficiallyProtected === true) {
      tags.push('<span class="tag">' + esc(t("tag.asi")) + "</span>");
    }
    $("siteTags").innerHTML = tags.join("");

    $("btnMap").href = "index.html?focus=" + encodeURIComponent(site.id);
    syncButtons();
  }

  function syncButtons() {
    var inJ = Store.inJourney(site.id);
    $("btnJourney").textContent = inJ ? t("journey.remove") : t("mon.journey");
    $("btnJourney").setAttribute("aria-pressed", String(inJ));

    var v = Store.isVisited(site.id);
    $("btnVisited").textContent = v ? t("pv.visitedOn") : t("mon.visited");
    $("btnVisited").setAttribute("aria-pressed", String(v));
  }

  function renderFacts() {
    $("factsGrid").innerHTML = (site.quickFacts || []).map(function (f) {
      return '<div class="fact"><dt>' + esc(f.label) + "</dt><dd>" + esc(f.value) + "</dd></div>";
    }).join("");
  }

  function renderStory() {
    var stages = site.story || [];
    var rail = $("storyRail");

    if (!stages.length) {
      rail.innerHTML = '<p class="empty-state">Story content is not written yet for this site.</p>';
      $("storyDots").innerHTML = "";
      return;
    }

    rail.innerHTML = stages.map(function (st, i) {
      var title = (LANG === "hi" && st.titleHi) ? st.titleHi : st.title;
      var body  = (LANG === "hi" && st.bodyHi)  ? st.bodyHi  : st.body;
      // Every site has a local photograph; `st.image` is reserved for
      // stage-specific shots when a site supplies one. Falling back to the
      // site photo is far more evocative than an icon on a flat panel.
      var art = st.image
        ? '<img src="' + esc(st.image) + '" alt="" loading="lazy" />'
        : '<img src="assets/img/' + esc(site.id) + '.jpg" alt="" loading="lazy"' +
          ' onerror="this.onerror=null;this.src=\'' + esc(site.heroImage) + '\'" />' +
          '<span class="stage-icon-badge" aria-hidden="true">' + stageIcon(i) + "</span>";
      return (
        '<article class="story-stage" id="stage-' + i + '">' +
          '<div class="stage-num"><b>' + (i + 1) + "</b> " + esc(t("story.stage")) + "</div>" +
          '<div class="stage-art">' + art + "</div>" +
          '<div class="stage-body"><h3>' + esc(title) + "</h3><p>" + esc(body) + "</p></div>" +
        "</article>"
      );
    }).join("");

    $("storyDots").innerHTML = stages.map(function (_, i) {
      return '<span class="' + (i === 0 ? "on" : "") + '"></span>';
    }).join("");

    // "What makes it special" is derived from our own story stages,
    // so it can never drift from the rest of the page.
    var triples = [
      { h: "Architecture", i: 2, s: 2 },
      { h: "History", i: 0, s: 0 },
      { h: "Cultural significance", i: 4, s: 4 }
    ];
    var icons = [
      '<path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/>',
      '<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
      '<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.4l6-.8z"/>'
    ];
    $("tripleCards").innerHTML = triples.map(function (c, idx) {
      var st = stages[c.s];
      if (!st) return "";
      var body = (LANG === "hi" && st.bodyHi) ? st.bodyHi : st.body;
      return (
        '<article class="triple-card">' +
          '<div class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + icons[idx] + "</svg></div>" +
          "<h3>" + esc(c.h) + "</h3><p>" + esc(body) + "</p>" +
        "</article>"
      );
    }).join("");

    wireStoryNav();
  }

  /* ---------------- story navigation ---------------- */

  function wireStoryNav() {
    var rail = $("storyRail");
    var stages = rail.querySelectorAll(".story-stage");
    var dots = $("storyDots").querySelectorAll("span");
    var index = 0;

    function goTo(i) {
      if (!stages.length) return;
      index = Math.max(0, Math.min(stages.length - 1, i));
      stages[index].scrollIntoView({
        behavior: document.body.classList.contains("reduce-motion") ? "auto" : "smooth",
        block: "nearest",
        inline: "start"
      });
      update();
    }

    function update() {
      dots.forEach(function (d, i) { d.classList.toggle("on", i === index); });
      $("storyPrev").disabled = index === 0;
      $("storyNext").disabled = index === stages.length - 1;
    }

    // Track which stage is actually in view (works on mobile rail and
    // on the desktop vertical timeline alike).
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          index = Array.prototype.indexOf.call(stages, e.target);
          update();
        }
      });
    }, { root: rail, threshold: 0.6 });
    stages.forEach(function (s) { observer.observe(s); });

    $("storyPrev").addEventListener("click", function () { goTo(index - 1); });
    $("storyNext").addEventListener("click", function () { goTo(index + 1); });

    rail.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
      if (e.key === "Home") { e.preventDefault(); goTo(0); }
      if (e.key === "End") { e.preventDefault(); goTo(stages.length - 1); }
    });

    update();
  }

  /* ---------------- history + speech ---------------- */

  function historyText() {
    return pick(site, "history", "historyHi") || "";
  }

  function renderHistory() {
    var text = historyText();
    var paras = text.split(/\n+/).filter(Boolean);
    $("historyText").innerHTML = paras.map(function (p) {
      return "<p>" + esc(p) + "</p>";
    }).join("") || "<p>History text is not written yet for this site.</p>";
  }

  function initSpeech() {
    var synth = window.speechSynthesis;
    var supported = !!synth;
    var utter = null;

    ["playBtn", "pauseBtn", "resumeBtn", "stopBtn"].forEach(function (id) {
      var b = $(id);
      if (!supported) b.disabled = true;
    });

    if (!supported) {
      $("listenHint").textContent = t("listen.unsupported");
      return;
    }

    function setStates() {
      var speaking = synth.speaking;
      var paused = synth.paused;
      $("playBtn").disabled = speaking;
      $("pauseBtn").disabled = !speaking || paused;
      $("resumeBtn").disabled = !speaking || !paused;
      $("stopBtn").disabled = !speaking;
    }

    function makeUtterance() {
      var u = new SpeechSynthesisUtterance(historyText());
      u.lang = LANG === "hi" ? "hi-IN" : "en-IN";
      u.rate = 0.98;
      u.onstart = setStates;
      u.onend = setStates;
      u.onerror = setStates;
      return u;
    }

    $("playBtn").addEventListener("click", function () {
      synth.cancel();
      utter = makeUtterance();
      synth.speak(utter);
      setStates();
    });
    $("pauseBtn").addEventListener("click", function () { synth.pause(); setStates(); });
    $("resumeBtn").addEventListener("click", function () { synth.resume(); setStates(); });
    $("stopBtn").addEventListener("click", function () { synth.cancel(); setStates(); });

    // Keep the button states honest even if the engine changes state
    // on its own (e.g. the system interrupts playback).
    setInterval(setStates, 700);
    window.addEventListener("beforeunload", function () { synth.cancel(); });
  }

  /* ---------------- quiz ---------------- */

  function renderQuiz() {
    var qs = site.quiz || [];
    var block = $("quizBlock");
    if (!qs.length) { block.hidden = true; return; }
    block.hidden = false;

    $("quiz").innerHTML = qs.map(function (q, qi) {
      return (
        '<div class="q-card" data-q="' + qi + '">' +
          "<h3>" + (qi + 1) + ". " + esc(q.q) + "</h3>" +
          '<div class="q-opts">' +
            q.options.map(function (o, oi) {
              return '<button type="button" data-o="' + oi + '">' + esc(o) + "</button>";
            }).join("") +
          "</div>" +
          '<p class="q-explain" hidden></p>' +
        "</div>"
      );
    }).join("");

    $("quiz").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-o]");
      if (!btn) return;
      var card = btn.closest(".q-card");
      if (card.dataset.done === "1") return;

      var qi = Number(card.dataset.q);
      var q = qs[qi];
      var chosen = Number(btn.dataset.o);

      card.dataset.done = "1";
      card.querySelectorAll("button[data-o]").forEach(function (b) {
        var oi = Number(b.dataset.o);
        b.disabled = true;
        if (oi === q.answer) b.classList.add("right");
        else if (oi === chosen) b.classList.add("wrong");
      });

      var ex = card.querySelector(".q-explain");
      ex.textContent = (chosen === q.answer ? "Correct. " : "Not quite. ") + (q.explain || "");
      ex.hidden = false;
    });
  }

  /* ---------------- sources & credits ---------------- */

  function renderSources() {
    var srcs = site.sources || [];
    if (!srcs.length) {
      $("sourceList").innerHTML =
        '<li><span>No verified source yet — <b>TODO</b>: add a link only after opening it.</span></li>';
    } else {
      $("sourceList").innerHTML = srcs.map(function (s) {
        var official = site.officialSourceUrl === s.url;
        return (
          "<li>" +
            (official ? '<span class="badge-official">Official</span>' : "") +
            '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
              esc(s.label) +
            "</a>" +
            '<span class="muted" style="margin-left:auto">opens in a new tab</span>' +
          "</li>"
        );
      }).join("");
    }

    $("creditBox").innerHTML =
      "<b>Image:</b> " + esc(site.photoCredit || "see Wikimedia Commons") +
      " · <b>Licence:</b> " + esc(site.photoLicense || "unknown") +
      "<br />Downloaded from Wikimedia Commons for this demo. " +
      "If this site's photo is CC BY or CC BY-SA, this credit must stay. " +
      (site.isUnescoRef ? "<br /><b>UNESCO status:</b> " + esc(site.isUnescoRef) + "." : "") +
      (site.isOfficiallyProtected === null
        ? "<br /><b>TODO:</b> official protection status not verified yet."
        : "");
  }

  /* ---------------- modal ---------------- */

  function openModal(title, html) {
    $("modalTitle").textContent = title;
    $("modalBody").innerHTML = html;
    $("modalBack").hidden = false;
    $("modalClose").focus();
  }

  function closeModal() {
    $("modalBack").hidden = true;
  }

  /* ---------------- boot ---------------- */

  function renderAll() {
    renderHero();
    renderFacts();
    renderStory();
    renderHistory();
    renderQuiz();
    renderSources();
  }

  function showNotFound() {
    document.getElementById("main").innerHTML =
      '<section class="section"><div class="wrap"><div class="empty-state">' +
      '<h2>' + esc(t("mon.notfound")) + "</h2>" +
      "<p>" + esc(t("mon.notfoundHelp")) + "</p>" +
      '<p style="margin-top:16px"><a class="btn btn-primary" href="index.html">' +
      esc(t("nav.map")) + "</a></p></div></div></section>";
  }

  function init() {
    els = { toast: $("toast") };

    initLang();
    initA11y();

    var id = new URLSearchParams(location.search).get("id");
    site = id ? SITE_BY_ID[id] : null;

    if (!site) { showNotFound(); return; }

    renderAll();
    initSpeech();

    $("btnJourney").addEventListener("click", function () {
      var r = Store.addStop(site.id);
      if (!r.ok && r.message === "full") toast(t("journey.full"));
      else if (r.ok) toast(t("journey.add"));
      else { Store.removeStop(site.id); toast(t("journey.remove")); }
      syncButtons();
    });

    $("btnVisited").addEventListener("click", function () {
      var next = !Store.isVisited(site.id);
      Store.setVisited(site.id, next);
      toast(next ? t("visited.set") : t("visited.unset"));
      syncButtons();
    });

    $("modalClose").addEventListener("click", closeModal);
    $("modalBack").addEventListener("click", function (e) {
      if (e.target === $("modalBack")) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("modalBack").hidden) closeModal();
    });

    // Rebuild everything that carries translated or dynamic text.
    document.addEventListener("langchange", function () {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      renderAll();
      $("playBtn").textContent = t("listen.play");
      $("pauseBtn").textContent = t("listen.pause");
      $("resumeBtn").textContent = t("listen.resume");
      $("stopBtn").textContent = t("listen.stop");
      $("listenHint").textContent = t("listen.hint");
      if (!window.speechSynthesis) $("listenHint").textContent = t("listen.unsupported");
    });

    // Static controls that use i18n keys.
    $("playBtn").textContent = t("listen.play");
    $("pauseBtn").textContent = t("listen.pause");
    $("resumeBtn").textContent = t("listen.resume");
    $("stopBtn").textContent = t("listen.stop");
    $("listenHint").textContent = window.speechSynthesis
      ? t("listen.hint") : t("listen.unsupported");
  }

  // openModal is exposed for the manuscript lens on the Taj page to reuse.
  window.BD = { openModal: openModal, closeModal: closeModal };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
