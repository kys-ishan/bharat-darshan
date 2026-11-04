/**
 * ============================================================
 *  Bharat Darshan — js/stories-index.js
 *  Builds the Heritage Stories index from js/sites-data.js.
 *
 *  Nothing about a site is written into this file. The card, its
 *  photograph, its tags and its link are all derived, so adding a
 *  monument to sites-data.js puts it on this page without touching
 *  anything here.
 *
 *  Only the Taj Mahal links to stories/taj-mahal.html, because that
 *  is the one with the full interactive treatment and 360° tour.
 *  Every other site links to its record on monument.html, which
 *  carries the same five-part story. The page says so in plain words
 *  rather than implying all 25 are built out the same way.
 *
 *  FAILURE IS LOUD. Every helper this page needs is optional: a
 *  missing store.js, a missing i18n.js or a half-read sites-data.js
 *  must degrade to something readable, never to an empty box. An
 *  earlier version called initA11y() unguarded, store.js had not been
 *  included, the exception escaped before render() ran, and the page
 *  came up with a headline, a paragraph of prose and 25 sites' worth
 *  of nothing — with nothing on screen to say why.
 * ============================================================ */
(function () {
  if (typeof window.$ !== "function") {
    window.$ = function (id) { return document.getElementById(id); };
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /**
   * Translate a key, falling back to English written here.
   * Returns the fallback whenever i18n.js is absent, the key is unknown,
   * or the lookup throws — so a broken dictionary degrades to readable
   * English instead of printing "stories.go" at the reader.
   */
  function T(key, en) {
    try {
      if (typeof t === "function") {
        var v = t(key);
        if (v && v !== key) return v;
      }
    } catch (e) { /* no dictionary loaded */ }
    return en;
  }

  /** Pick the English or Hindi wording of a field, per the current language. */
  function pick(en, hi) {
    var lang;
    try { lang = typeof LANG !== "undefined" ? LANG : "en"; } catch (e) { lang = "en"; }
    return (lang === "hi" && hi) ? hi : (en || hi || "");
  }

  /** Used only on the fallback path, when i18n.js is missing and a raw
      siteType like "stepwell" has to stand in for its translated label. */
  function titleCase(s) {
    s = String(s || "");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function card(s) {
    var featured = s.id === "taj-mahal";
    var href = featured ? "taj-mahal.html" : "../monument.html?id=" + s.id;

    // siteType and era are keyed by their data value, exactly as the map is
    var tags = [
      T("siteType." + s.siteType, titleCase(s.siteType)),
      T("era." + s.era, titleCase(s.era))
    ];
    if (s.isUnesco) tags.push(T("flags.unesco", "UNESCO World Heritage"));

    var desc = pick(s.shortDescription, s.shortDescriptionHi);
    var name = pick(s.name, s.nameHi);
    var place = [s.city, s.state].filter(Boolean).join(", ");

    return '<a class="story-card' + (featured ? " featured" : "") + '" href="' + href + '"' +
      ' data-site="' + esc(s.id) + '">' +
      '<img class="story-card-img" src="../assets/img/' + esc(s.id) + '.jpg" alt="" loading="lazy" />' +
      '<span class="story-card-body">' +
        '<span class="story-card-name">' + esc(name) + '</span>' +
        '<span class="story-card-place">' + esc(place) + '</span>' +
        '<span class="story-card-desc">' + esc(desc) + '</span>' +
        '<span class="story-card-tags">' +
          tags.map(function (g) { return "<i>" + esc(g) + "</i>"; }).join("") +
        '</span>' +
        (featured
          ? '<span class="story-card-flag">' + esc(T("stories.tourFlag", "360° tour")) + '</span>'
          : "") +
        '<span class="story-card-go">' +
          esc(featured ? T("stories.goFull", "Open the full story →")
                       : T("stories.go", "Open this story →")) + '</span>' +
      '</span>' +
    '</a>';
  }

  /** Put something on screen that explains itself if the list cannot be built. */
  function fail(err) {
    var grid = $("storyGrid");
    if (grid) {
      grid.innerHTML = '<p class="story-fallback">The site list could not be built: ' +
        esc(err && err.message ? err.message : err) +
        '. Check that js/sites-data.js, js/i18n.js and js/store.js all loaded, then reload.</p>';
    }
    if (window.console && console.error) console.error("stories-index:", err);
  }

  function render() {
    if (typeof SITES === "undefined" || !SITES || !SITES.length) {
      throw new Error("js/sites-data.js did not load, so there are no sites to list");
    }

    var grid = $("storyGrid");
    if (!grid) return;

    grid.innerHTML = SITES.map(card).join("");

    var regions = {};
    SITES.forEach(function (s) { if (s.region) regions[s.region] = 1; });

    if ($("storyCount")) {
      $("storyCount").textContent =
        T("stories.count", "{sites} sites · {regions} regions")
          .replace("{sites}", SITES.length)
          .replace("{regions}", Object.keys(regions).length);
    }
  }

  function init() {
    // Optional helpers first, each guarded. The grid must render even if the
    // header cannot be translated or the accessibility panel cannot wire up.
    try { initLang(); } catch (e) { /* header stays in its default language */ }
    try { initA11y(); } catch (e) { /* panel stays as shipped */ }

    try {
      render();
    } catch (e) {
      fail(e);
      return;
    }

    // re-render so names and tags follow the language switch
    document.addEventListener("langchange", function () {
      try { render(); } catch (e) { fail(e); }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
