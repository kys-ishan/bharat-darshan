/**
 * ============================================================
 *  Bharat Darshan — journey.js
 *  Renders journey.html: itinerary, route, passport, badges.
 *  Person B owns this file.
 * ============================================================
 *
 *  Everything reads from Store (localStorage). There is no server,
 *  so "saving" is just writing to this browser.
 * ============================================================
 */

(function () {
  "use strict";

  var map = null, routeLayer = null;
  var els = {};

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

  /* ---------------- badges ---------------- */

  var BADGES = [
    { id: "mughal-explorer",     en: "Mughal Explorer",     hi: "मुग़ल खोजी",
      hintEn: "Mark a Mughal-era site as visited",
      hintHi: "किसी मुग़ल-कालीन स्थल को देखा हुआ चिह्नित करें",
      test: function (v) { return v.some(function (s) { return s.era === "mughal"; }); } },
    { id: "temple-trailblazer",  en: "Temple Trailblazer",  hi: "मंदिर अन्वेषक",
      hintEn: "Mark two temple sites as visited",
      hintHi: "दो मंदिर स्थलों को देखा हुआ चिह्नित करें",
      test: function (v) {
        return v.filter(function (s) { return s.siteType === "temple"; }).length >= 2;
      } },
    { id: "cave-chronicle",      en: "Cave Chronicle",      hi: "गुफ़ा गाथा",
      hintEn: "Mark a rock-cut cave site as visited",
      hintHi: "किसी रॉक-कट गुफ़ा स्थल को देखा हुआ चिह्नित करें",
      test: function (v) { return v.some(function (s) { return s.siteType === "cave"; }); } },
    { id: "heritage-scholar",    en: "Heritage Scholar",    hi: "धरोहर विद्वान",
      hintEn: "Mark five different sites as visited",
      hintHi: "पाँच अलग-अलग स्थलों को देखा हुआ चिह्नित करें",
      test: function (v) { return v.length >= 5; } },
    { id: "india-atlas-explorer", en: "India Atlas Explorer", hi: "भारत मानचित्र अन्वेषक",
      hintEn: "Fill all five journey stops",
      hintHi: "यात्रा के सभी पाँच पड़ाव भरें",
      test: function (v, journey) { return journey.length >= 5; } }
  ];

  /* ---------------- derived data ---------------- */

  function stopSites() {
    return Store.getJourney()
      .map(function (id) { return SITE_BY_ID[id]; })
      .filter(Boolean);
  }

  function visitedSites() {
    var v = Store.getVisited();
    return SITES.filter(function (s) { return v[s.id]; });
  }

  function cumulativeKm(sites) {
    var total = 0;
    for (var i = 1; i < sites.length; i++) total += haversineKm(sites[i - 1], sites[i]);
    return total;
  }

  /* ---------------- renderers ---------------- */

  function renderSummary(sites) {
    var total = cumulativeKm(sites);
    // Rough average speed only. Clearly labelled as an estimate.
    var hours = total / 55;
    var duration = hours < 1
      ? Math.round(hours * 60) + " min"
      : (hours < 10 ? hours.toFixed(1) : Math.round(hours)) + " h";

    var regions = [];
    sites.forEach(function (s) {
      if (regions.indexOf(s.region) === -1) regions.push(s.region);
    });

    var facts = [
      { label: "Stops", value: sites.length + " of " + Store.MAX_STOPS },
      { label: "Approx. straight-line distance", value: total.toFixed(0) + " km" },
      { label: "Rough travel time (estimate)", value: sites.length > 1 ? duration : "—" },
      { label: "Regions covered", value: regions.length ? regions.join(", ") : "—" }
    ];
    $("summaryGrid").innerHTML = facts.map(function (f) {
      return '<div class="fact"><dt>' + esc(f.label) + "</dt><dd>" + esc(f.value) + "</dd></div>";
    }).join("");

    // passport ring
    var done = visitedSites().length;
    var pct = SITES.length ? Math.round((done / SITES.length) * 100) : 0;
    var ring = $("passportRing");
    ring.style.setProperty("--pct", pct);
    $("ringNum").textContent = done + "/" + SITES.length;
    $("ringLabel").textContent = LANG === "hi" ? "स्थल देखे गए" : "sites visited";
    ring.setAttribute("aria-label",
      (LANG === "hi" ? "देखे गए स्थल: " : "Sites visited: ") + done + " of " + SITES.length);
  }

  function renderStops(sites) {
    var list = $("stopList");
    $("emptyJourney").hidden = sites.length > 0;
    $("routeShell").hidden = sites.length < 2;
    $("routeNote").hidden = sites.length < 2;

    list.innerHTML = sites.map(function (s, i) {
      var km = i > 0 ? haversineKm(sites[i - 1], s) : null;
      var leg = km === null
        ? (LANG === "hi" ? "शुरुआती बिंदु" : "Starting point")
        : "+ " + km.toFixed(0) + " km " +
          (LANG === "hi" ? "(सीधी दूरी)" : "(straight line)");
      var visited = Store.isVisited(s.id);

      return (
        '<article class="stop" data-id="' + esc(s.id) + '">' +
          '<img src="assets/img/' + esc(s.id) + '.jpg" alt="" loading="lazy" ' +
            'data-fallback="' + esc(s.heroImage) + '" />' +
          "<div>" +
            "<h3>" + (i + 1) + ". " + esc(nameOf(s)) + "</h3>" +
            '<div class="leg">' + esc(s.city + ", " + s.state) + " · " + esc(leg) + "</div>" +
            '<div class="meta-row" style="margin-bottom:0">' +
              '<span class="tag">' + esc(t("siteType." + s.siteType)) + "</span>" +
              (s.isUnesco ? '<span class="tag tag-un">' + esc(t("tag.unesco")) + "</span>" : "") +
              (visited ? '<span class="tag">' + esc(t("pv.visitedOn")) + "</span>" : "") +
            "</div>" +
          "</div>" +
          '<div class="stop-controls">' +
            '<button data-act="up" data-id="' + esc(s.id) + '"' +
              (i === 0 ? " disabled" : "") + ' aria-label="Move ' + esc(nameOf(s)) + ' earlier">↑</button>' +
            '<button data-act="down" data-id="' + esc(s.id) + '"' +
              (i === sites.length - 1 ? " disabled" : "") +
              ' aria-label="Move ' + esc(nameOf(s)) + ' later">↓</button>' +
            '<button data-act="remove" data-id="' + esc(s.id) + '"' +
              ' aria-label="Remove ' + esc(nameOf(s)) + ' from journey">✕</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");

    list.querySelectorAll("img[data-fallback]").forEach(function (im) {
      im.addEventListener("error", function once() {
        im.removeEventListener("error", once);
        im.src = im.dataset.fallback;
      });
    });
  }

  function renderRoute(sites) {
    if (sites.length < 2) {
      if (map) { map.remove(); map = null; }
      return;
    }

    if (!map) {
      map = L.map("routeMap", { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      routeLayer = L.layerGroup().addTo(map);
    }

    routeLayer.clearLayers();

    var pts = sites.map(function (s) { return [s.latitude, s.longitude]; });

    // Dashed line: explicitly not a road route.
    L.polyline(pts, {
      color: "#C9A227", weight: 3, dashArray: "9 11", opacity: 0.95
    }).addTo(routeLayer);

    sites.forEach(function (s, i) {
      L.circleMarker([s.latitude, s.longitude], {
        radius: 15, color: "#123A2E", weight: 2,
        fillColor: i === 0 ? "#BF8250" : "#1D5A6E", fillOpacity: 1
      }).addTo(routeLayer)
        .bindTooltip(String(i + 1), { permanent: true, direction: "center",
                                      className: "cluster-tip" })
        .bindPopup("<b>" + esc(nameOf(s)) + "</b><br />" + esc(s.city + ", " + s.state));
    });

    map.fitBounds(L.latLngBounds(pts), { padding: [34, 34] });
    setTimeout(function () { map.invalidateSize(); }, 80);
  }

  function renderBadges() {
    var visited = visitedSites();
    var journey = Store.getJourney();

    BADGES.forEach(function (b) {
      if (b.test(visited, journey)) Store.award(b.id);
    });
    var earned = Store.getBadges();

    $("badgeGrid").innerHTML = BADGES.map(function (b) {
      var on = earned.indexOf(b.id) !== -1;
      var name = LANG === "hi" ? b.hi : b.en;
      var hint = LANG === "hi" ? b.hintHi : b.hintEn;
      return (
        '<div class="badge' + (on ? " on" : "") + '">' +
          '<span class="medal" aria-hidden="true">' + (on ? "★" : "☆") + "</span>" +
          "<span><span class='bt'>" + esc(name) + "</span><br />" +
          '<span class="bs">' + esc(on ? (LANG === "hi" ? "अर्जित" : "Earned") : hint) +
          "</span></span>" +
          (on ? '<span class="visually-hidden">' +
                (LANG === "hi" ? "अर्जित" : "Earned") + "</span>" : "") +
        "</div>"
      );
    }).join("");
  }

  function renderShare() {
    var n = visitedSites().length;
    var text = LANG === "hi"
      ? "मैंने भारत दर्शन पर " + n + " धरोहर स्थल घूमे!"
      : "I explored " + n + " heritage sites on Bharat Darshan!";

    $("waShare").href = "https://wa.me/?text=" + encodeURIComponent(text);
    $("sharePreview").textContent = "“" + text + "”";
  }

  function renderAll() {
    var sites = stopSites();
    renderSummary(sites);
    renderStops(sites);
    renderBadges();
    renderShare();
    if (sites.length >= 2) renderRoute(sites);
    else if (map) { map.remove(); map = null; }
  }

  /* ---------------- events ---------------- */

  function bind() {
    $("stopList").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var id = btn.dataset.id, act = btn.dataset.act;

      if (act === "up" || act === "down") {
        Store.moveStop(id, act);
        renderAll();
        // keep keyboard focus on the equivalent button after re-render
        var next = document.querySelector(
          '#stopList button[data-act="' + act + '"][data-id="' + id + '"]'
        );
        if (next && !next.disabled) next.focus();
        else {
          var stop = document.querySelector('.stop[data-id="' + id + '"]');
          if (stop) stop.querySelector("button").focus();
        }
      } else if (act === "remove") {
        Store.removeStop(id);
        toast(t("journey.remove"));
        renderAll();
        var head = $("itHead");
        if (head) head.focus();
      }
    });

    $("copyShare").addEventListener("click", function () {
      var text = $("sharePreview").textContent.replace(/^[“"]|[”"]$/g, "");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(function () { toast(LANG === "hi" ? "पाठ कॉपी हो गया" : "Text copied"); })
          .catch(function () { toast(text); });
      } else {
        toast(text);
      }
    });

    $("clearAll").addEventListener("click", function () {
      if (!confirm(LANG === "hi"
            ? "क्या आप अपनी यात्रा और देखे गए चिह्न मिटाना चाहते हैं?"
            : "Clear your journey and all visited marks?")) return;
      Store.getJourney().slice().forEach(function (id) { Store.removeStop(id); });
      SITES.forEach(function (s) { Store.setVisited(s.id, false); });
      renderAll();
      toast(LANG === "hi" ? "यात्रा साफ़ की गई" : "Journey cleared");
    });

    document.addEventListener("langchange", renderAll);
  }

  /* ---------------- boot ---------------- */

  function init() {
    els = { toast: $("toast") };
    initLang();
    initA11y();
    bind();
    renderAll();

    // The summary heading is a focus target after removing a stop.
    $("itHead").setAttribute("tabindex", "-1");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
