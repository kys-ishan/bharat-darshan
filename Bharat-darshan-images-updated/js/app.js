/**
 * ============================================================
 *  Bharat Darshan — app.js
 *  Home page: map, markers, clustering, search, filters,
 *  preview card, list view and "Near me".
 *  Person B owns this file.
 * ============================================================
 *
 *  Design notes
 *  ------------
 *  • Every marker is an <svg> with its own glyph AND is mirrored in
 *    the keyboard-accessible list view — colour is never the only
 *    way to tell markers apart.
 *  • Filtering happens in one place (applyFilters) so the map, the
 *    list and the result counter can never disagree.
 *  • No network calls beyond map tiles. All data is in sites-data.js.
 * ============================================================ */

(function () {
  "use strict";

  /* ---------------- configuration ---------------- */

  // Marker colours, by siteType. Each maps to a custom property declared
  // in css/base.css:root rather than to a hex literal, so the legend
  // swatches and the pins drawn on the map always agree. They used to be
  // two hand-copied copies of the same values, which meant any palette
  // change had to be applied twice or the two silently disagreed.
  var TYPE_COLOR_VAR = {
    fort:     "--m-fort",
    monument: "--m-fort",
    tomb:     "--m-fort",
    palace:   "--m-fort",
    temple:   "--m-temple",
    stepwell: "--m-stepwell",
    cave:     "--m-cave"
  };
  var FALLBACK_COLOR = "#8A6D4F";   // --m-other, if the stylesheet never loads

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }

  var FILTER_OPTIONS = {
    region: ["North", "South", "East", "West", "Central", "Northeast"],
    siteType: ["fort", "temple", "stepwell", "cave", "tomb", "palace", "monument"],
    traditions: ["hindu", "buddhist", "jain", "islamic", "sikh", "colonial", "multi"],
    era: ["ancient", "medieval", "mughal", "colonial", "modern"],
    flags: ["unesco", "asi"]
  };

  // Used by the "Choose a city" fallback when geolocation is refused.
  var CITIES = {
    Delhi: [28.6139, 77.2090],
    Mumbai: [19.0760, 72.8777],
    Jaipur: [26.9124, 75.7873],
    Agra: [27.1767, 78.0081],
    Chennai: [13.0827, 80.2707],
    Bengaluru: [12.9716, 77.5946],
    Kolkata: [22.5726, 88.3639],
    Hyderabad: [17.3850, 78.4867],
    Varanasi: [25.3176, 82.9739]
  };

  var NEAR_RADIUS_KM = 50;

  /* ---------------- state ---------------- */

  var state = {
    filters: { region: [], siteType: [], traditions: [], era: [], flags: [] },
    query: "",
    view: "map",
    origin: null,      // { lat, lng, label } once the user picks "Near me"
    originRadius: null // km, or null to show everything
  };

  var map, cluster, markersById = {}, baseLayers = {};
  var els = {};

  /* ---------------- small helpers ---------------- */

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function colorFor(site) {
    var key = TYPE_COLOR_VAR[site.siteType];
    return key ? cssVar(key, FALLBACK_COLOR) : FALLBACK_COLOR;
  }

  /**
   * Site name in the current language. We ship a real Hindi name for
   * every site, but we never invent one — if it is missing we keep
   * the English name rather than making something up.
   */
  function displayName(site) {
    return (LANG === "hi" && site.nameHi) ? site.nameHi : site.name;
  }

  function typeLabel(site) { return t("siteType." + site.siteType); }

  /**
   * The little white glyph inside the pin. Each site type gets a
   * different shape, so two markers are distinguishable in
   * greyscale as well as by colour.
   */
  function glyphFor(type) {
    var g = {
      // crenellated rampart
      fort:
        '<path d="M1 15V7h2V5h2v2h2V5h2v2h2V5h2v2h2v8z"/>',
      // generic monumental block
      monument:
        '<path d="M8 1l6 5v9H2V6z"/>',
      // domed mausoleum between two minarets (Taj silhouette)
      tomb:
        '<path d="M4.6 14V10.2a3.4 3.4 0 0 1 6.8 0V14z"/>' +
        '<path d="M1.6 14h12.8v1.6H1.6z"/>' +
        '<path d="M2.6 10.4h1.2V14H2.6zM12.2 10.4h1.2V14h-1.2z"/>',
      // palace roofline
      palace:
        '<path d="M2 15V7l3 2 3-4 3 4 3-2v8z"/>',
      // stepped shikhara tower
      temple:
        '<path d="M8 1.4l3.9 6.2v6.1H4.1V7.6z"/>' +
        '<path d="M2.4 14.9h11.2v1.4H2.4z"/>',
      // three descending water levels
      stepwell:
        '<path d="M2 5h12v2H2z"/><path d="M2 9h12v2H2z"/><path d="M2 13h12v2H2z"/>',
      // arched cave mouth
      cave:
        '<path d="M3 15v-4a5 5 0 0 1 10 0v4h-2v-4a3 3 0 0 0-6 0v4z"/>'
    };
    return g[type] || g.monument;
  }

  /** Build the pin as inline SVG — exact control, no rotation maths. */
  function pinHtml(site) {
    var c = colorFor(site);
    // Border, glyph and UNESCO star come from the stylesheet too, so a pin
    // keeps its contrast against the page background after a palette change.
    var surface = cssVar("--surface", "#FBF4E6");
    var gold    = cssVar("--gold",    "#C9A227");
    var ink     = cssVar("--ink",     "#123A2E");
    var star = site.isUnesco
      ? '<path d="M24.5 1.6l1.3 3.4 3.6.2-2.8 2.3.9 3.5-3-2-3 2 .9-3.5-2.8-2.3 3.6-.2z" ' +
        'fill="' + gold + '" stroke="' + ink + '" stroke-width=".7"/>'
      : "";
    return (
      '<svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true" focusable="false">' +
      '<path d="M15 1C7.8 1 2 6.8 2 14c0 9.4 13 23 13 23s13-13.6 13-23c0-7.2-5.8-13-13-13z" ' +
      'fill="' + c + '" stroke="' + surface + '" stroke-width="2"/>' +
      '<g transform="translate(7,7) scale(.62)" fill="' + surface + '">' + glyphFor(site.siteType) + "</g>" +
      star +
      "</svg>"
    );
  }

  function markerFor(site) {
    var icon = L.divIcon({
      className: "site-pin",
      html: pinHtml(site),
      iconSize: [30, 38],
      iconAnchor: [15, 38],
      popupAnchor: [0, -34]
    });
    var m = L.marker([site.latitude, site.longitude], {
      icon: icon,
      keyboard: true,
      riseOnHover: true,
      alt: displayName(site) + (site.isUnesco ? " — UNESCO World Heritage Site" : "")
    });
    // One tooltip, in our palette, shown on hover and cleared on leave.
    //
    // The native `title` attribute is what produced the stack of grey and
    // white labels across the Delhi-Agra corridor: the browser draws its
    // own box per pin in its own styling, and moving the mouse across a
    // cluster leaves several of them on screen at the same time.
    m.bindTooltip(displayName(site), {
      direction: "top",
      offset: [0, -38],
      opacity: 1,
      className: "site-tip"
    });
    m.on("click", function () { selectSite(site.id, { fly: false }); });
    return m;
  }

  /* ---------------- filtering ---------------- */

  function matchesFilters(site) {
    var f = state.filters;

    if (f.region.length && f.region.indexOf(site.region) === -1) return false;
    if (f.siteType.length && f.siteType.indexOf(site.siteType) === -1) return false;
    if (f.era.length && f.era.indexOf(site.era) === -1) return false;

    if (f.traditions.length) {
      var hit = (site.traditions || []).some(function (x) {
        return f.traditions.indexOf(x) !== -1;
      });
      if (!hit) return false;
    }

    if (f.flags.indexOf("unesco") !== -1 && !site.isUnesco) return false;
    if (f.flags.indexOf("asi") !== -1 && site.isOfficiallyProtected !== true) return false;

    if (state.query) {
      var q = state.query.toLowerCase();
      // Every readable word about the site, not just its label. This is what
      // makes the archive searchable: a researcher typing "stepwell",
      // "Mughal" or "Shah Jahan" should land on the right page.
      if (searchText(site).indexOf(q) === -1) return false;
    }

    return true;
  }

  function withinRadius(site) {
    if (!state.origin || state.originRadius == null) return true;
    var d = haversineKm(state.origin, site);
    return d <= state.originRadius;
  }

  /**
   * Flatten every readable field of a site into one lowercase string and
   * cache it on the object, so filtering stays O(n) over short strings
   * instead of re-joining arrays on every keystroke.
   *
   * Sources are included on purpose: typing "unesco" or "asi" or a
   * museum's name should surface the relevant sites.
   */
  function searchText(site) {
    if (site._search) return site._search;

    var parts = [
      site.name, site.nameHi, site.city, site.state, site.region,
      site.siteType, site.era, site.protectedBy,
      site.shortDescription, site.shortDescriptionHi,
      site.history, site.historyHi,
      site.isUnescoRef,
      (site.traditions || []).join(" "),
      (site.sources || []).map(function (s) { return s.label; }).join(" ")
    ];

    (site.story || []).forEach(function (st) {
      parts.push(st.title, st.body, st.titleHi, st.bodyHi);
    });

    (site.quickFacts || []).forEach(function (f) {
      parts.push(f.label, f.value);
    });

    site._search = parts.filter(Boolean).join(" ").toLowerCase();
    return site._search;
  }

  function filteredSites() {
    return SITES.filter(function (s) { return matchesFilters(s) && withinRadius(s); });
  }

  /* ---------------- map ---------------- */

  function buildMap() {
    map = L.map("map", {
      center: [22.5, 79],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true
    });

    baseLayers.street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    baseLayers.satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
      }
    );

    baseLayers.street.addTo(map);
    L.control.layers(
      { "Street map": baseLayers.street, "Satellite imagery": baseLayers.satellite },
      {},
      { position: "topright" }
    ).addTo(map);

    cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      // 48px let the Delhi-Agra corridor uncluster into a stack of overlapping
      // pins at a zoom where they are still 40km apart on the ground. 90px
      // keeps a city reading as one marker until you zoom in properly.
      maxClusterRadius: 90,
      iconCreateFunction: function (c) {
        return L.divIcon({
          html: '<div class="cluster">' + c.getChildCount() + "</div>",
          className: "cluster-wrap",
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
      }
    });
    map.addLayer(cluster);

    SITES.forEach(function (s) { markersById[s.id] = markerFor(s); });
  }

  function renderMarkers(sites) {
    cluster.clearLayers();
    sites.forEach(function (s) {
      if (markersById[s.id]) cluster.addLayer(markersById[s.id]);
    });
  }

  function flyTo(site) {
    if (!map) return;
    // flyTo animates via requestAnimationFrame, which browsers throttle
    // in background tabs — so it is a no-op there by design.
    map.flyTo([site.latitude, site.longitude], Math.max(map.getZoom(), 12), {
      duration: 0.9
    });
  }

  /* ---------------- preview card ---------------- */

  function syncPreviewLayout() {
    // The map grid reserves 372px for the preview even while it is hidden,
    // leaving an empty column. Let the shell know the aside is gone.
    var layout = $("mapLayout");
    if (layout) layout.classList.toggle("no-preview", els.preview.hidden);
  }

  function selectSite(id, opts) {
    var site = SITE_BY_ID[id];
    if (!site) return;
    opts = opts || {};

    document.querySelectorAll(".site-pin").forEach(function (n) {
      n.classList.remove("is-active");
    });
    if (markersById[id]) markersById[id].getElement() &&
      markersById[id].getElement().classList.add("is-active");

    fillPreview(site);
    els.preview.hidden = false;
    syncPreviewLayout();

    if (opts.fly !== false) flyTo(site);
  }

  function fillPreview(site) {
    var img = els.pvImg;
    img.alt = displayName(site);
    img.src = "assets/img/" + site.id + ".jpg";
    img.onerror = function () { img.onerror = null; img.src = site.heroImage; };

    els.pvName.textContent = displayName(site);
    els.pvName.dataset.id = site.id;
    els.pvLoc.textContent = site.city + ", " + site.state + " · " + t("region." + site.region);

    var tags = [];
    tags.push('<span class="tag">' + esc(typeLabel(site)) + "</span>");
    tags.push('<span class="tag">' + esc(t("era." + site.era)) + "</span>");
    if (site.isUnesco) tags.push('<span class="tag tag-un">' + esc(t("tag.unesco")) + "</span>");
    if (site.isOfficiallyProtected === true) {
      tags.push('<span class="tag">' + esc(t("tag.asi")) + "</span>");
    }
    if (state.origin) {
      var km = Math.round(haversineKm(state.origin, site));
      tags.push('<span class="tag">' + esc(tf("dist", { d: km })) + "</span>");
    }
    els.pvTags.innerHTML = tags.join("");

    els.pvDesc.textContent = site.shortDescription;
    els.pvDetails.href = "monument.html?id=" + encodeURIComponent(site.id);

    var inJ = Store.inJourney(site.id);
    els.pvJourney.textContent = inJ ? t("journey.remove") : t("pv.journey");
    els.pvJourney.dataset.id = site.id;

    var v = Store.isVisited(site.id);
    els.pvVisited.textContent = v ? t("pv.visitedOn") : t("pv.visited");
    els.pvVisited.dataset.id = site.id;
    els.pvVisited.setAttribute("aria-pressed", String(v));
  }

  function closePreview() {
    els.preview.hidden = true;
    syncPreviewLayout();
    document.querySelectorAll(".site-pin").forEach(function (n) {
      n.classList.remove("is-active");
    });
  }

  /* ---------------- list view + cards ---------------- */

  function tagsHtml(site) {
    var out = ['<span class="tag">' + esc(typeLabel(site)) + "</span>"];
    if (site.isUnesco) out.push('<span class="tag tag-un">' + esc(t("tag.unesco")) + "</span>");
    if (state.origin) {
      out.push('<span class="tag">' +
        esc(tf("dist", { d: Math.round(haversineKm(state.origin, site)) })) + "</span>");
    }
    return out.join("");
  }

  function renderCards(sites) {
    var grid = els.cardGrid;
    els.emptyState.hidden = sites.length > 0;

    grid.innerHTML = sites.map(function (s) {
      var inJ = Store.inJourney(s.id);
      var v = Store.isVisited(s.id);
      return (
        '<article class="card" data-id="' + esc(s.id) + '">' +
          '<div class="card-media"><img src="assets/img/' + esc(s.id) + '.jpg" alt="' + esc(displayName(s)) +
            '" loading="lazy" data-fallback="' + esc(s.heroImage) + '" /></div>' +
          '<div class="card-body">' +
            "<h3>" + esc(displayName(s)) + "</h3>" +
            '<div class="card-loc">' + esc(s.city + ", " + s.state) + " · " +
              esc(t("region." + s.region)) + "</div>" +
            '<div class="meta-row">' + tagsHtml(s) + "</div>" +
            '<p class="card-desc">' + esc(s.shortDescription) + "</p>" +
            '<div class="card-actions">' +
              '<a class="btn btn-primary btn-sm" href="monument.html?id=' + esc(s.id) + '">' +
                esc(t("pv.details")) + "</a>" +
              '<button class="btn btn-ghost btn-sm" data-act="journey" data-id="' + esc(s.id) + '">' +
                esc(inJ ? t("journey.remove") : t("pv.journey")) + "</button>" +
              '<button class="btn btn-ghost btn-sm" data-act="visited" data-id="' + esc(s.id) +
                '" aria-pressed="' + v + '">' +
                esc(v ? t("pv.visitedOn") : t("pv.visited")) + "</button>" +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    // Cards keep the same remote fallback the preview card uses.
    grid.querySelectorAll("img[data-fallback]").forEach(function (im) {
      im.addEventListener("error", function once() {
        im.removeEventListener("error", once);
        im.src = im.dataset.fallback;
      });
    });
  }

  /* ---------------- search suggestions ---------------- */

  function hideSuggestions() {
    els.suggestions.hidden = true;
    els.searchInput.setAttribute("aria-expanded", "false");
  }

  function renderSuggestions() {
    var q = state.query.trim().toLowerCase();
    var box = els.suggestions;
    if (!q) { hideSuggestions(); box.innerHTML = ""; return; }

    var hits = SITES.filter(function (s) {
      return [s.name, s.nameHi, s.city, s.state, s.region]
        .join(" ").toLowerCase().indexOf(q) !== -1;
    }).slice(0, 6);

    if (!hits.length) { hideSuggestions(); box.innerHTML = ""; return; }

    box.innerHTML = hits.map(function (s) {
      return '<button type="button" role="option" data-id="' + esc(s.id) + '">' +
        esc(displayName(s)) + " <small>— " + esc(s.city + ", " + s.state) + "</small></button>";
    }).join("");
    box.hidden = false;
    els.searchInput.setAttribute("aria-expanded", "true");
  }

  /* ---------------- the one place results are computed ---------------- */

  function refresh() {
    var sites = filteredSites();

    // Keep marker tooltips in the current language before re-adding them.
    SITES.forEach(function (s) {
      var m = markersById[s.id];
      if (m) m.setTooltipContent(displayName(s));
    });

    renderMarkers(sites);
    if (state.view === "list") renderCards(sites);

    els.resultCount.textContent =
      sites.length === 1 ? t("countOne") : tf("count", { n: sites.length });

    // Keep chips in sync with the current language and status without
    // rebuilding them — rebuilding drops keyboard focus on the chip just
    // pressed and restarts hover/focus rings.
    syncChips();
  }

  /* ---------------- chips ---------------- */

  function chipKey(group, value) {
    if (group === "flags") return "flags." + value;
    if (group === "siteType") return "siteType." + value;
    if (group === "traditions") return "traditions." + value;
    return group + "." + value;
  }

  function buildChips() {
    document.querySelectorAll(".filter-group").forEach(function (grp) {
      var group = grp.getAttribute("data-group");
      var host = grp.querySelector(".chips");
      if (!host || !FILTER_OPTIONS[group]) return;

      host.innerHTML = FILTER_OPTIONS[group].map(function (value) {
        var on = state.filters[group].indexOf(value) !== -1;
        return '<button type="button" class="chip" data-group="' + group +
          '" data-value="' + esc(value) + '" aria-pressed="' + on + '">' +
          esc(t(chipKey(group, value))) + "</button>";
      }).join("");
    });
  }

  function syncChips() {
    document.querySelectorAll(".filter-group").forEach(function (grp) {
      var group = grp.getAttribute("data-group");
      var host = grp.querySelector(".chips");
      if (!host || !FILTER_OPTIONS[group]) return;

      var buttons = host.querySelectorAll(".chip");
      if (buttons.length !== FILTER_OPTIONS[group].length) {
        buildChips();
        return;
      }

      FILTER_OPTIONS[group].forEach(function (value, i) {
        var btn = buttons[i];
        var label = t(chipKey(group, value));
        btn.setAttribute("aria-pressed", String(state.filters[group].indexOf(value) !== -1));
        if (btn.textContent !== label) btn.textContent = label;
      });
    });
  }

  /* ---------------- view switching ---------------- */

  function setView(view) {
    state.view = view;
    var isMap = view === "map";

    $("viewMap").setAttribute("aria-pressed", String(isMap));
    $("viewList").setAttribute("aria-pressed", String(!isMap));
    $("mapLayout").hidden = !isMap;
    $("listView").hidden = isMap;

    if (isMap && map) {
      // A hidden map has no size; invalidate it when it comes back.
      setTimeout(function () { map.invalidateSize(); }, 60);
    } else {
      renderCards(filteredSites());
    }
  }

  /* ---------------- "Near me" ---------------- */

  function setOrigin(lat, lng, label) {
    state.origin = { latitude: lat, longitude: lng, label: label };
    state.originRadius = NEAR_RADIUS_KM;
    refresh();

    var sites = filteredSites();
    if (!sites.length) {
      // Nothing within the radius — widen rather than show an empty map.
      state.originRadius = null;
      refresh();
      sites = filteredSites();
      announce(tf("near.empty", { d: NEAR_RADIUS_KM }));
    }
    if (sites.length) {
      var b = L.latLngBounds(sites.map(function (s) {
        return [s.latitude, s.longitude];
      }));
      map.fitBounds(b.pad(0.35));
    }
  }

  function announce(msg) {
    els.resultCount.textContent = msg;
  }

  function showCityPicker() {
    // The picker lives inside the filter drawer, so open it first —
    // otherwise geolocation refusal appears to do nothing at all.
    $("filters").hidden = false;
    $("filterToggle").setAttribute("aria-expanded", "true");
    syncChips();
    $("cityPickWrap").hidden = false;
    if (!$("cityPick").options.length) {
      Object.keys(CITIES).forEach(function (name) {
        var o = document.createElement("option");
        o.value = name;
        o.textContent = name;
        $("cityPick").appendChild(o);
      });
    }
    announce(t("near.fallback"));
    $("cityPick").focus();
  }

  function handleNearMe() {
    if (!navigator.geolocation) { showCityPicker(); return; }
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setOrigin(pos.coords.latitude, pos.coords.longitude, "you");
      },
      function () { showCityPicker(); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }

  /* ---------------- wiring ---------------- */

  function bindEvents() {
    // search
    els.searchInput.addEventListener("input", function (e) {
      state.query = e.target.value;
      renderSuggestions();
      refresh();
    });
    els.searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { hideSuggestions(); }
      if (e.key === "ArrowDown" && !els.suggestions.hidden) {
        var first = els.suggestions.querySelector("button");
        if (first) { e.preventDefault(); first.focus(); }
      }
    });
    els.suggestions.addEventListener("keydown", function (e) {
      var options = Array.prototype.slice.call(els.suggestions.querySelectorAll("button[data-id]"));
      var i = options.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        (options[i + 1] || options[0]).focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (i <= 0) els.searchInput.focus();
        else options[i - 1].focus();
      } else if (e.key === "Escape") {
        hideSuggestions();
        els.searchInput.focus();
      }
    });
    els.suggestions.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-id]");
      if (!b) return;
      var site = SITE_BY_ID[b.dataset.id];
      hideSuggestions();
      els.searchInput.value = displayName(site);
      state.query = site.name;
      refresh();
      selectSite(site.id, { fly: true });
    });
    document.addEventListener("click", function (e) {
      if (!els.suggestions.contains(e.target) && e.target !== els.searchInput) {
        hideSuggestions();
      }
    });

    // view toggle
    $("viewMap").addEventListener("click", function () { setView("map"); });
    $("viewList").addEventListener("click", function () { setView("list"); });

    // filters drawer
    $("filterToggle").addEventListener("click", function () {
      var open = $("filters").hidden;
      $("filters").hidden = !open;
      $("filterToggle").setAttribute("aria-expanded", String(open));
      if (open) syncChips();
    });

    $("filters").addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (chip) {
        var g = chip.dataset.group, v = chip.dataset.value;
        var arr = state.filters[g];
        var i = arr.indexOf(v);
        if (i === -1) arr.push(v); else arr.splice(i, 1);
        refresh();
        return;
      }
      if (e.target.id === "clearFilters") {
        Object.keys(state.filters).forEach(function (k) { state.filters[k] = []; });
        state.origin = null;
        state.originRadius = null;
        state.query = "";
        els.searchInput.value = "";
        $("cityPickWrap").hidden = true;
        refresh();
        map.fitBounds(allBounds(), { padding: [24, 24] });
      }
    });

    $("cityPick").addEventListener("change", function (e) {
      var c = CITIES[e.target.value];
      if (c) setOrigin(c[0], c[1], e.target.value);
    });

    $("nearMe").addEventListener("click", handleNearMe);

    // preview actions
    $("previewClose").addEventListener("click", closePreview);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !els.preview.hidden) closePreview();
    });
    els.pvJourney.addEventListener("click", function () {
      var id = els.pvJourney.dataset.id;
      var r = Store.addStop(id);
      if (!r.ok && r.message === "full") { alert(t("journey.full")); }
      else if (r.ok) { announce(t("journey.add")); }
      else { Store.removeStop(id); announce(t("journey.remove")); }
      fillPreview(SITE_BY_ID[id]);
      renderCards(filteredSites());
    });
    els.pvVisited.addEventListener("click", function () {
      var id = els.pvVisited.dataset.id;
      var next = !Store.isVisited(id);
      Store.setVisited(id, next);
      announce(next ? t("visited.set") : t("visited.unset"));
      fillPreview(SITE_BY_ID[id]);
      renderCards(filteredSites());
    });

    // card actions (delegated)
    els.cardGrid.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (btn) {
        var id = btn.dataset.id;
        if (btn.dataset.act === "journey") {
          var r = Store.addStop(id);
          if (!r.ok && r.message === "full") alert(t("journey.full"));
          else if (r.ok) announce(t("journey.add"));
          else { Store.removeStop(id); announce(t("journey.remove")); }
        } else {
          var next = !Store.isVisited(id);
          Store.setVisited(id, next);
          announce(next ? t("visited.set") : t("visited.unset"));
        }
        renderCards(filteredSites());
        if (!els.preview.hidden) fillPreview(SITE_BY_ID[id]);
        return;
      }
      // clicking the body of a card focuses it on the map
      var card = e.target.closest(".card");
      if (card && !e.target.closest("a")) selectSite(card.dataset.id, { fly: true });
    });

    // re-render dynamic text when the language flips
    document.addEventListener("langchange", function () {
      var site = els.preview.hidden ? null : SITE_BY_ID[els.pvName.dataset.id];
      refresh();
      if (state.view === "list") renderCards(filteredSites());
      if (site) fillPreview(site);
      if (!els.suggestions.hidden) renderSuggestions();
    });
  }

  function allBounds() {
    return L.latLngBounds(SITES.map(function (s) { return [s.latitude, s.longitude]; }));
  }

  /* ---------------- boot ---------------- */

  function init() {
    els = {
      searchInput: $("searchInput"),
      suggestions: $("suggestions"),
      resultCount: $("resultCount"),
      preview: $("preview"),
      pvImg: $("pvImg"),
      pvName: $("pvName"),
      pvLoc: $("pvLoc"),
      pvTags: $("pvTags"),
      pvDesc: $("pvDesc"),
      pvDetails: $("pvDetails"),
      pvJourney: $("pvJourney"),
      pvVisited: $("pvVisited"),
      cardGrid: $("cardGrid"),
      emptyState: $("emptyState")
    };

    if (!window.L || !SITES || !SITES.length) {
      // Fail loudly but visibly rather than showing a blank page.
      document.getElementById("main").innerHTML =
        '<div class="wrap"><div class="empty-state"><h2>Map library failed to load</h2>' +
        "<p>Leaflet is bundled in <code>vendor/leaflet/</code>. If it is missing, restore it " +
        "from the repository and reload.</p></div></div>";
      return;
    }

    initLang();
    initA11y();

    buildMap();
    bindEvents();
    buildChips();
    refresh();
    map.fitBounds(allBounds(), { padding: [24, 24] });
    setView("map");
    syncPreviewLayout();

    // monument.html links here as index.html?focus=<id>
    var focusId = new URLSearchParams(location.search).get("focus");
    if (focusId && SITE_BY_ID[focusId]) {
      selectSite(focusId, { fly: true });
    }

    // index.html?zoom=7 opens the map at a chosen zoom level. Handy for
    // sharing one region, and for opening the walkthrough recording
    // straight on Delhi or the Deccan. animate:false so it also applies in
    // a background tab, where the animated flyTo above is throttled away.
    var wantZoom = new URLSearchParams(location.search).get("zoom");
    if (wantZoom !== null) {
      var z = Math.min(18, Math.max(3, parseFloat(wantZoom)));
      if (!isNaN(z)) map.setZoom(z, { animate: false });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
