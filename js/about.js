/**
 * ============================================================
 *  Bharat Darshan — about.js
 *  Renders about.html.
 *
 *  The credits table is generated straight from js/sites-data.js
 *  so it can never disagree with what the site actually loads.
 * ============================================================
 */

(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function nameOf(s) { return (LANG === "hi" && s.nameHi) ? s.nameHi : s.name; }

  /* ---------- Credits table ---------- */

  function fileName(path) {
    if (!path) return "—";
    return path.split("/").pop();
  }

  function renderCredits() {
    var rows = (SITES || []).map(function (s) {
      return (
        "<tr>" +
          '<td><a href="monument.html?id=' + esc(s.id) + '">' + esc(nameOf(s)) + "</a></td>" +
          "<td>" + esc(s.photoCredit || "—") + "</td>" +
          "<td>" + esc(s.photoLicense || "—") + "</td>" +
          '<td class="file-cell"><code>' + esc(fileName(s.heroImage)) + "</code></td>" +
        "</tr>"
      );
    });

    // The panorama and the manuscript are not in the sites array.
    rows.push(
      '<tr><td colspan="4" class="muted" style="font-style:italic">' +
        esc(t("cred.alsoUsed")) +
      "</td></tr>"
    );

    $("credTable").querySelector("tbody").innerHTML = rows.join("");
  }

  /* ---------- Standing sources ---------- */

  var STANDING = [
    {
      label: "UNESCO World Heritage Centre — official List of World Heritage Properties",
      url: "https://whc.unesco.org/en/list/"
    },
    {
      label: "Archaeological Survey of India — official protected-monuments portal",
      url: "https://asi.nic.in/"
    },
    {
      label: "Cleveland Museum of Art — Open Access API (CC0 objects and metadata)",
      url: "https://www.clevelandart.org/open-access"
    },
    {
      label: "Wikimedia Commons — photograph licences and attribution",
      url: "https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia"
    },
    {
      label: "OpenStreetMap contributors — map data licence",
      url: "https://www.openstreetmap.org/copyright"
    },
    {
      label: "Leaflet — the map library, bundled locally under vendor/",
      url: "https://leafletjs.com/"
    },
    {
      label: "Pannellum — the 360° viewer, bundled locally under vendor/",
      url: "https://pannellum.org/"
    }
  ];

  function renderSources() {
    $("standingSources").innerHTML = STANDING.map(function (s) {
      return (
        "<li>" +
          '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
            esc(s.label) + "</a>" +
          '<span class="muted" style="margin-left:auto">opens in a new tab</span>' +
        "</li>"
      );
    }).join("");
  }

  /* ---------- Boot ---------- */

  function renderAll() {
    renderCredits();
    renderSources();
  }

  function init() {
    initLang();
    initA11y();

    renderAll();

    document.addEventListener("langchange", renderAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
