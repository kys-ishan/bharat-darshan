/**
 * ============================================================
 *  Bharat Darshan — taj-story.js
 *  Renders stories/taj-mahal.html
 *  Person C owns this file.
 *
 *  Sections built here:
 *    1. hero + quick facts        (from js/sites-data.js)
 *    2. 360° tour (Pannellum)     (local panorama, 5 hotspots)
 *    3. Heritage Story Mode       (the 5 stages in sites-data.js)
 *    4. Manuscript Lens           (real CC0 museum object + metadata)
 *    5. quiz, sources, audio
 *
 *  Nothing here is hard-coded except the hotspot annotations, which
 *  describe what is visibly in the panorama.
 * ============================================================
 */

(function () {
  "use strict";

  var site = SITE_BY_ID["taj-mahal"];
  var els = {};
  var viewer = null;

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function nameOf(s) { return (LANG === "hi" && s.nameHi) ? s.nameHi : s.name; }

  function toast(msg) {
    var el = els.toast;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  /* ==========================================================
     1. HERO + FACTS
     ========================================================== */

  function renderHero() {
    var img = $("heroImg");
    img.alt = "The Taj Mahal seen from the terrace";
    // Reuse the same licensed photograph the map uses.
    img.src = "../assets/360/taj-mahal.jpg";
    img.style.objectPosition = "center 30%";

    $("siteLoc").textContent =
      site.city + ", " + site.state + " · " + t("region." + site.region) +
      " · " + site.protectedBy;

    var tags = ['<span class="tag">' + esc(t("siteType." + site.siteType)) + "</span>"];
    tags.push('<span class="tag">' + esc(t("era." + site.era)) + "</span>");
    (site.traditions || []).forEach(function (tr) {
      tags.push('<span class="tag">' + esc(t("traditions." + tr)) + "</span>");
    });
    tags.push('<span class="tag tag-un">' + esc(t("tag.unesco")) + "</span>");
    tags.push('<span class="tag">' + esc(t("tag.asi")) + "</span>");
    $("siteTags").innerHTML = tags.join("");
  }

  function renderFacts() {
    $("factsGrid").innerHTML = (site.quickFacts || []).map(function (f) {
      return '<div class="fact"><dt>' + esc(f.label) + "</dt><dd>" + esc(f.value) + "</dd></div>";
    }).join("");
  }

  /* ==========================================================
     2. 360° TOUR
     ========================================================== */

  /**
   * Hotspot coordinates are given as image fractions (u, v) on the
   * 2048x1024 equirectangular panorama and converted to Pannellum
   * angles:  yaw = (u - 0.5) * 360,  pitch = (0.5 - v) * 180.
   * They were placed by inspecting the panorama itself.
   */
  var HOTSPOTS = [
    {
      u: 0.465, v: 0.190, key: "dome",
      title: "Main dome", titleHi: "मुख्य गुम्बद",
      text: "The great onion dome sits on the roof above this parapet — from the garden it " +
            "reads as a single swelling curve, and it is flanked by four smaller domed " +
            "kiosks called chhatris. In this terrace photograph the roofline hides its base."
    },
    {
      u: 0.427, v: 0.280, key: "calligraphy",
      title: "Calligraphy", titleHi: "क़लाबद्ध लिपि",
      text: "A band of script frames the great arched entrance. The letters grow slightly " +
            "larger as they rise, so the writing reads at an even size from the ground " +
            "rather than looking stretched at the top."
    },
    {
      u: 0.440, v: 0.360, key: "inlay",
      title: "Marble inlay", titleHi: "संगमरमर जड़ाई",
      text: "Semi-precious stones are cut and fitted into the marble so closely that the " +
            "join is hard to find. This technique is called pietra dura in Europe and " +
            "parchin kari in India, and it runs in floral and geometric bands over the walls."
    },
    {
      u: 0.115, v: 0.480, key: "garden",
      title: "Charbagh garden", titleHi: "चारबाग़ बग़ीचा",
      text: "The garden is divided into four quarters by water channels — a charbagh, the " +
            "classic Persian form. Paths, pool and building all sit on one shared axis, " +
            "which is why the reflection lines up so precisely."
    },
    {
      u: 0.315, v: 0.400, key: "minarets",
      title: "Minarets", titleHi: "मीनारें",
      text: "Four minarets stand free at the corners of the plinth rather than being attached " +
            "to the building. They lean very slightly outward, so that if one ever fell it " +
            "would fall away from the mausoleum instead of onto it."
    }
  ];

  function hsTitle(h) { return (LANG === "hi" && h.titleHi) ? h.titleHi : h.title; }

  function toAngles(u, v) {
    return { yaw: (u - 0.5) * 360, pitch: (0.5 - v) * 180 };
  }

  function openHotspot(i) {
    var h = HOTSPOTS[i];
    if (!h) return;
    window.BD.openModal(hsTitle(h), "<p>" + esc(h.text) + "</p>");
  }

  function renderHotspotList() {
    $("hotspotList").innerHTML = HOTSPOTS.map(function (h, i) {
      var a = toAngles(h.u, h.v);
      return (
        '<button type="button" class="hotspot-btn" data-i="' + i + '">' +
          '<span class="hs-ico" aria-hidden="true">' + (i + 1) + "</span>" +
          "<span><b>" + esc(hsTitle(h)) + "</b><br />" +
          '<small class="muted">yaw ' + Math.round(a.yaw) + "° · pitch " +
          Math.round(a.pitch) + "°</small></span>" +
        "</button>"
      );
    }).join("");

    $("hotspotList").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]");
      if (b) openHotspot(Number(b.dataset.i));
    });
  }

  /**
   * Pannellum fetches equirectangular panoramas with XMLHttpRequest.
   * Browsers block XHR on file:// URLs, so a double-clicked index.html
   * would show a "file access error". We load the image ourselves with
   * an Image element (which IS allowed on file://) and hand the decoded
   * image to Pannellum in dynamic mode, which skips its own loader.
   * Result: identical behaviour over http:// and file://.
   */
  function initPanorama() {
    if (typeof pannellum === "undefined" || !$("pano")) {
      showPanoFallback();
      return;
    }

    var img = new Image();
    img.onload = function () { createViewer(img); };
    img.onerror = function () { showPanoFallback(); };
    // Cache-bust so a stale file:// copy is never reused.
    img.src = "../assets/360/taj-mahal.jpg";
  }

  function showPanoFallback() {
    var fb = $("panoFallback"), pn = $("pano");
    if (fb) fb.hidden = false;
    if (pn) pn.hidden = true;
  }

  function createViewer(img) {
    try {
      viewer = pannellum.viewer("pano", {
        type: "equirectangular",
        dynamic: true,          // skip Pannellum's XHR loader
        dynamicUpdate: true,    // required for `dynamic` to accept panorama
        panorama: img,
        autoLoad: true,
        compass: true,
        yaw: -15,
        pitch: 24,
        hfov: 95,
        minHfov: 40,
        maxHfov: 110,
        pitchLimits: [-85, 85],
        strings: {
          loadButtonLabel: "Click to load the panorama",
          loadingLabel: "Loading panorama…",
          bylineLabel: "by %s",
          noPanoramaError: "The panorama file could not be found.",
          networkErrorLabel: "Network error while loading the panorama.",
          panoramaErrorLabel: "The panorama could not be loaded.",
          accessTokenLabel: "Access token:"
        },
        hotSpots: HOTSPOTS.map(function (h, i) {
          var a = toAngles(h.u, h.v);
          return {
            pitch: a.pitch,
            yaw: a.yaw,
            text: hsTitle(h),           // Pannellum builds the tooltip from this
            clickHandlerFunc: function (evt, args) {
              evt.preventDefault();
              openHotspot(args.index);
            },
            clickHandlerArgs: { index: i }
          };
        })
      });

      viewer.on("error", showPanoFallback);
    } catch (e) {
      showPanoFallback();
    }
  }

  /* ==========================================================
     3. HERITAGE STORY MODE
     ========================================================== */

  var STAGE_ICONS = [
    '<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    '<path d="M3 21l6-6"/><path d="M9 15l6-6 3-3 3 3-3 3-6 6z"/><path d="M14 6l4 4"/>',
    '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    '<path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.4l6-.8z"/>'
  ];

  function renderStory() {
    var stages = site.story || [];
    var rail = $("storyRail");

    rail.innerHTML = stages.map(function (st, i) {
      var title = (LANG === "hi" && st.titleHi) ? st.titleHi : st.title;
      var body = (LANG === "hi" && st.bodyHi) ? st.bodyHi : st.body;
      return (
        '<article class="story-stage" id="stage-' + i + '">' +
          '<div class="stage-num"><b>' + (i + 1) + "</b> " + esc(t("story.stage")) + "</div>" +
          '<div class="stage-art"><span class="stage-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24">' + STAGE_ICONS[i] + "</svg></span></div>" +
          '<div class="stage-body"><h3>' + esc(title) + "</h3><p>" + esc(body) + "</p></div>" +
        "</article>"
      );
    }).join("");

    $("storyDots").innerHTML = stages.map(function (_, i) {
      return '<span class="' + (i === 0 ? "on" : "") + '"></span>';
    }).join("");

    wireStoryNav();
  }

  function wireStoryNav() {
    var rail = $("storyRail");
    var stages = rail.querySelectorAll(".story-stage");
    var dots = $("storyDots").querySelectorAll("span");
    var index = 0;

    function update() {
      dots.forEach(function (d, i) { d.classList.toggle("on", i === index); });
      $("storyPrev").disabled = index === 0;
      $("storyNext").disabled = index === stages.length - 1;
    }

    function goTo(i) {
      if (!stages.length) return;
      index = Math.max(0, Math.min(stages.length - 1, i));
      stages[index].scrollIntoView({
        behavior: document.body.classList.contains("reduce-motion") ? "auto" : "smooth",
        block: "nearest", inline: "start"
      });
      update();
    }

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

  /* ==========================================================
     4. MANUSCRIPT LENS
     Real object: Cleveland Museum of Art, accession 2013.342.b
     Metadata and the English translation below were fetched from
     the museum's open-access API — they are not our own wording.
     ========================================================== */

  var MS = {
    image: "../assets/img/manuscript-quatrain.jpg",
    object: "Calligraphy of a Quatrain (verso)",
    date: "c. 1760 (1755–1765)",
    culture: "India, Farrukhabad, Mughal, 18th century",
    type: "Calligraphy",
    technique: "Gum tempera, ink, and gold on paper",
    measurements: "Page: 28.2 × 20.2 cm (11 1/8 × 7 15/16 in.)",
    department: "Indian and Southeast Asian Art",
    accession: "2013.342.b",
    script: "nasta‘liq",
    language: "Persian",
    licence: "CC0 (public domain dedication)",
    credit: "Cleveland Museum of Art",
    source: "https://www.clevelandart.org/art/2013.342.b",
    creditline:
      "Gift in honor of Madeline Neves Clapp; Gift of Mrs. Henry White Cannon by exchange; " +
      "Bequest of Louise T. Cooper; Leonard C. Hanna Jr. Fund; From the Catherine and " +
      "Ralph Benkaim Collection",
    translation:
      "Your eyes have shed so much blood in the world at large, / " +
      "That around your home corpses are strewn together in disorderly piles. / " +
      "A hundred thousand faces were cast into molds of loveliness and beauty, / " +
      "But rarely came out stamped as comely as you."
  };

  // Regions as percentages of the image, chosen by looking at the page.
  var MS_REGIONS = [
    {
      left: 8, top: 11, w: 84, h: 48,
      title: "The quatrain",
      desc: "Four lines of Persian verse written across the middle of the page. This is the " +
            "text the object is named after.",
      transcription: MS.translation,
      transLabel: "English translation (museum-supplied)",
      meta: [
        ["Script", MS.script],
        ["Language", MS.language],
        ["Transcription from", MS.credit + " object record"]
      ],
      note: "The Persian wording and the English translation both come from the museum's own " +
            "object record. We did not translate this ourselves."
    },
    {
      left: 5, top: 4, w: 90, h: 6,
      title: "Gold border",
      desc: "A ruled band of gold runs around the page. It is decoration rather than text, " +
            "so there is nothing to transcribe here.",
      transcription: null,
      transLabel: "Transcription",
      meta: [
        ["Technique", MS.technique],
        ["Support", "Paper"],
        ["Measured", MS.measurements]
      ],
      note: "Not a text region — the gold band frames the writing and carries no letters."
    },
    {
      left: 8, top: 64, w: 84, h: 15,
      title: "Black-ground panel",
      desc: "Below the quatrain the ground reverses to black and the script is written in " +
            "gold instead of black. Alternating light and dark panels are a normal feature " +
            "of Mughal calligraphy albums.",
      transcription: null,
      transLabel: "Transcription",
      meta: [
        ["Object type", MS.type],
        ["Made", MS.date],
        ["Culture", MS.culture]
      ],
      note: "TODO — the museum's record describes one Persian quatrain for this side of the " +
            "folio, so we cannot say what (if anything) is written here. We have not guessed."
    }
  ];

  function cropStyle(r) {
    return (
      "width:100%;aspect-ratio:16/9;" +
      "background-image:url(" + MS.image + ");" +
      "background-size:" + (10000 / r.w).toFixed(2) + "% " + (10000 / r.h).toFixed(2) + "%;" +
      "background-position:" + (r.left / (100 - r.w) * 100).toFixed(2) + "% " +
                              (r.top / (100 - r.h) * 100).toFixed(2) + "%;" +
      "background-repeat:no-repeat;" +
      "border:1px solid var(--line-gold);border-radius:6px;" +
      "background-color:#E9E1CC;"
    );
  }

  function renderManuscript() {
    var img = $("msImg");
    img.src = MS.image;
    img.onerror = function () {
      img.onerror = null;
      img.alt = "Manuscript image unavailable offline";
      img.style.display = "none";
      var ph = document.createElement("div");
      ph.className = "ms-placeholder";
      ph.innerHTML = "<b>Image file missing</b><span>Expected at assets/img/" +
        "manuscript-quatrain.jpg</span>";
      $("msFrame").insertBefore(ph, $("msFrame").firstChild);
    };

    // Position the three highlight rectangles over the image.
    var hotspots = $("msFrame").querySelectorAll(".ms-hot");
    MS_REGIONS.forEach(function (r, i) {
      var el = hotspots[i];
      if (!el) return;
      el.style.left = r.left + "%";
      el.style.top = r.top + "%";
      el.style.width = r.w + "%";
      el.style.height = r.h + "%";
    });
  }

  function selectRegion(i) {
    var r = MS_REGIONS[i];
    if (!r) return;

    $("msFrame").querySelectorAll(".ms-hot").forEach(function (el, idx) {
      el.setAttribute("aria-pressed", String(idx === i));
    });

    $("msTitle").textContent = r.title;
    $("msDesc").textContent = r.desc;

    $("msMeta").innerHTML =
      '<div style="margin:14px 0;border:1px solid var(--line);border-radius:6px;overflow:hidden">' +
        '<div style="' + cropStyle(r) + '" role="img" aria-label="Zoomed crop of the ' +
          esc(r.title.toLowerCase()) + '"></div>' +
      "</div>" +
      "<b style='font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--oxblood)'>" +
        esc(r.transLabel) + "</b>" +
      (r.transcription
        ? '<p style="font-family:var(--serif);font-size:1.02rem;line-height:1.7;' +
          'background:var(--surface-2);padding:12px 14px;border-radius:6px;margin:6px 0 0">' +
          esc(r.transcription) + "</p>"
        : '<p style="margin:6px 0 0;color:var(--oxblood);font-weight:600">' +
          esc(r.transcription || "TODO — not transcribed") + "</p>") +
      "<dl style='display:grid;grid-template-columns:auto 1fr;gap:6px 14px;" +
        "margin:14px 0 0;font-size:.88rem'>" +
        r.meta.map(function (m) {
          return "<dt>" + esc(m[0]) + "</dt><dd>" + esc(m[1]) + "</dd>";
        }).join("") +
      "</dl>";

    $("msNote").textContent = r.note;
  }

  function wireManuscript() {
    $("msFrame").addEventListener("click", function (e) {
      var b = e.target.closest(".ms-hot");
      if (b) selectRegion(Number(b.dataset.region));
    });
    selectRegion(0);
  }

  /* ==========================================================
     5. QUIZ / SOURCES / AUDIO
     ========================================================== */

  function renderQuiz() {
    var qs = site.quiz || [];
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

      var q = qs[Number(card.dataset.q)];
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

  function renderSources() {
    var srcs = (site.sources || []).slice();
    // Add the manuscript's own archive record as a verified source.
    srcs.push({
      label: "Cleveland Museum of Art — " + MS.object + " (" + MS.accession + ")",
      url: MS.source
    });

    $("sourceList").innerHTML = srcs.map(function (s) {
      var official = site.officialSourceUrl === s.url;
      return (
        "<li>" +
          (official ? '<span class="badge-official">Official</span>' : "") +
          '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
            esc(s.label) + "</a>" +
          '<span class="muted" style="margin-left:auto">opens in a new tab</span>' +
        "</li>"
      );
    }).join("");

    $("creditBox").innerHTML =
      "<b>360° panorama &amp; hero photo:</b> " + esc(site.photoCredit) +
      " · <b>Licence:</b> " + esc(site.photoLicense) +
      " (Wikimedia Commons)<br />" +
      "<b>Manuscript page:</b> " + esc(MS.credit) + " · <b>Licence:</b> " + esc(MS.licence) +
      " · accession " + esc(MS.accession) + "<br />" +
      "<b>Credit line:</b> " + esc(MS.creditline) + "<br />" +
      "<b>UNESCO status:</b> " + esc(site.isUnescoRef) + ". " +
      (site.isOfficiallyProtected === null
        ? "<br /><b>TODO:</b> official protection status not verified."
        : "");
  }

  function historyText() {
    return (LANG === "hi" && site.historyHi) ? site.historyHi : site.history;
  }

  function initSpeech() {
    var synth = window.speechSynthesis;
    if (!synth) {
      ["playBtn", "pauseBtn", "resumeBtn", "stopBtn"].forEach(function (id) {
        $(id).disabled = true;
      });
      $("listenHint").textContent = t("listen.unsupported");
      return;
    }

    function setStates() {
      var speaking = synth.speaking, paused = synth.paused;
      $("playBtn").disabled = speaking;
      $("pauseBtn").disabled = !speaking || paused;
      $("resumeBtn").disabled = !speaking || !paused;
      $("stopBtn").disabled = !speaking;
    }

    $("playBtn").addEventListener("click", function () {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(historyText());
      u.lang = LANG === "hi" ? "hi-IN" : "en-IN";
      u.rate = 0.97;
      u.onstart = setStates; u.onend = setStates; u.onerror = setStates;
      synth.speak(u);
      setStates();
    });
    $("pauseBtn").addEventListener("click", function () { synth.pause(); setStates(); });
    $("resumeBtn").addEventListener("click", function () { synth.resume(); setStates(); });
    $("stopBtn").addEventListener("click", function () { synth.cancel(); setStates(); });

    setInterval(setStates, 700);
    window.addEventListener("beforeunload", function () { synth.cancel(); });
    $("listenHint").textContent = t("listen.hint");
  }

  /* ==========================================================
     BOOT
     ========================================================== */

  function renderAll() {
    renderHero();
    renderFacts();
    renderStory();
    renderQuiz();
    renderSources();
    $("playBtn").textContent = t("listen.play");
    $("pauseBtn").textContent = t("listen.pause");
    $("resumeBtn").textContent = t("listen.resume");
    $("stopBtn").textContent = t("listen.stop");
    $("listenHint").textContent = window.speechSynthesis
      ? t("listen.hint") : t("listen.unsupported");
  }

  function init() {
    els = { toast: $("toast") };

    initLang();
    initA11y();

    if (!site) {
      location.replace("../monument.html");
      return;
    }

    // Modal helpers shared with the detail page.
    window.BD = {
      openModal: function (title, html) {
        $("modalTitle").textContent = title;
        $("modalBody").innerHTML = html;
        $("modalBack").hidden = false;
        $("modalClose").focus();
      },
      closeModal: function () { $("modalBack").hidden = true; }
    };

    renderAll();
    renderHotspotList();
    renderManuscript();
    wireManuscript();
    initPanorama();
    initSpeech();

    $("modalClose").addEventListener("click", window.BD.closeModal);
    $("modalBack").addEventListener("click", function (e) {
      if (e.target === $("modalBack")) window.BD.closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("modalBack").hidden) window.BD.closeModal();
    });

    document.addEventListener("langchange", function () {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      renderAll();
      selectRegion(Number(
        ($("msFrame").querySelector('.ms-hot[aria-pressed="true"]') || {}).dataset?.region || 0
      ));
      if (viewer && typeof viewer.setHfov === "function") viewer.setHfov(95, false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
