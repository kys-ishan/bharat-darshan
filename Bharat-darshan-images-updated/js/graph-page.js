/**
 * ============================================================
 *  Bharat Darshan — js/graph-page.js
 *  A hand-written force-directed knowledge graph on <canvas>.
 *  No library, no CDN, no build step — works from file://.
 *
 *  Nodes: 25 real monuments + every entity + manuscript pages + docs.
 *  Edges: only relationships stated in sites-data.js / lens-data.js.
 * ============================================================ */
(function () {
  if (typeof window.$ !== "function") {
    window.$ = function (id) { return document.getElementById(id); };
  }
  function safeURL(url) {
    try { history.replaceState(null, "", url); } catch (e) { /* file:// */ }
  }

  var canvas = $("canvas");
  var ctx = canvas.getContext("2d");
  var DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  /* ---------- palette (from base.css tokens) ---------- */
  var KIND_COLOR = {
    site:     "#123A2E",
    entity:   "#1D5A6E",
    page:     "#A8741A",
    doc:      "#4B1216"
  };
  var SITE_TYPE_COLOR = {
    fort:     "#9D473A",
    stepwell: "#416A81",
    temple:   "#A8741A",
    cave:     "#4A5F2E",
    tomb:     "#4B1216",
    palace:   "#8A6D4F",
    monument: "#1D5A6E"
  };
  var REDUCED = false;
  try {
    REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) { /* older browser */ }

  /* ---------- build the graph ---------- */
  var nodes = [], links = [], byRef = Object.create(null);

  function addNode(ref, kind, label, sub, extra) {
    if (byRef[ref]) return byRef[ref];
    var n = {
      ref: ref, kind: kind, label: label, sub: sub || "",
      x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600,
      vx: 0, vy: 0, deg: 0, dim: false
    };
    Object.assign(n, extra || {});
    nodes.push(n);
    byRef[ref] = n;
    return n;
  }
  function link(a, b, rel) {
    var A = byRef[a], B = byRef[b];
    if (!A || !B) return;
    A.deg++; B.deg++;
    links.push({ a: A, b: B, rel: rel, hub: rel === "CLASSIFIED_AS" });
  }

  /* monuments first */
  SITES.forEach(function (s) {
    var facts = (s.quickFacts || []).map(function (f) { return f.label + " " + f.value; }).join(" ");
    var story = (s.story || []).map(function (b) { return (b.title || "") + " " + (b.body || ""); }).join(" ");
    addNode("site:" + s.id, "site", s.name,
      [s.city, s.state, s.era].filter(Boolean).join(" · "),
      {
        color: SITE_TYPE_COLOR[s.siteType] || "#1D5A6E",
        siteId: s.id,
        /* full-record haystack, so "granite" finds the temples whose
           history mentions granite — not just a node labelled Granite */
        haystack: [s.name, s.nameHi, s.city, s.state, s.region, s.siteType,
                   s.era, (s.traditions || []).join(" "),
                   s.shortDescription, s.history, facts, story].join(" ")
      });
  });
  /* entities */
  ENTITIES.forEach(function (e) {
    addNode("entity:" + e.id, "entity", e.label, e.type, { note: e.note, color: KIND_COLOR.entity });
  });
  /* pages + docs */
  PAGES.forEach(function (p) {
    addNode("page:" + p.id, "page", "Leaf " + p.seq, p.script || "", { pageId: p.id, color: KIND_COLOR.page });
  });
  DOCS.forEach(function (d) {
    addNode("doc:" + d.id, "doc", d.title, (d.year || "") + "", { note: d.license, color: KIND_COLOR.doc });
  });
  /* edges */
  LENS_EDGES.forEach(function (e) { link(e.s, e.d, e.r); });

  var REDUCED_COUNT = nodes.length;

  /* ---------- camera ---------- */
  var cam = { x: 0, y: 0, k: 1 };
  var W = 0, H = 0;

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", function () { resize(); });

  /* ---------- simulation ---------- */
  var energy = 1;

  function tick() {
    var n = nodes.length;
    if (!n) return;

    /* repulsion (Barnes-Hut-free O(n²) is fine at this size) */
    for (var i = 0; i < n; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < n; j++) {
        var b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 1) d2 = 1;
        var d = Math.sqrt(d2);
        var force = 5200 / d2;
        var fx = (dx / d) * force, fy = (dy / d) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
    }
    /* springs */
    links.forEach(function (L) {
      var dx = L.b.x - L.a.x, dy = L.b.y - L.a.y;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var rest = 92;
      var f = (d - rest) * 0.012;
      var fx = (dx / d) * f, fy = (dy / d) * f;
      L.a.vx += fx; L.a.vy += fy;
      L.b.vx -= fx; L.b.vy -= fy;
    });
    /* gentle pull to centre + integrate */
    nodes.forEach(function (a) {
      a.vx -= a.x * 0.0016;
      a.vy -= a.y * 0.0016;
      a.vx *= 0.86; a.vy *= 0.86;
      a.x += a.vx * energy;
      a.y += a.vy * energy;
    });
  }

  function reheat(k) {
    energy = k == null ? 1 : k;
    nodes.forEach(function (a) {
      a.vx += (Math.random() - 0.5) * 6;
      a.vy += (Math.random() - 0.5) * 6;
    });
    if (REDUCED) {   /* settle instantly for reduced-motion users */
      for (var s = 0; s < 220; s++) tick();
      energy = 0;
    }
  }

  /* ---------- draw ---------- */
  function radius(n) {
    if (n.kind === "site") return 7 + Math.min(7, n.deg * 0.45);
    if (n.kind === "doc") return 9;
    if (n.kind === "page") return 6;
    return 4.5 + Math.min(5, n.deg * 0.5);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2 + cam.x, H / 2 + cam.y);
    ctx.scale(cam.k, cam.k);

    /* edges */
    ctx.lineWidth = 1 / cam.k;
    links.forEach(function (L) {
      if (L.a.dim || L.b.dim) ctx.globalAlpha = 0.09;
      else ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "#123A2E";
      ctx.beginPath();
      ctx.moveTo(L.a.x, L.a.y);
      ctx.lineTo(L.b.x, L.b.y);
      ctx.stroke();
    });

    /* nodes */
    nodes.forEach(function (a) {
      var r = radius(a);
      ctx.globalAlpha = a.dim ? 0.16 : 1;
      ctx.beginPath();
      ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
      ctx.fillStyle = a.color || KIND_COLOR[a.kind] || "#123A2E";
      ctx.fill();
      ctx.lineWidth = 1.5 / cam.k;
      ctx.strokeStyle = "#FBF4E6";
      ctx.stroke();

      /* label the well-connected nodes only */
      if (!a.dim && (a.kind !== "entity" || a.deg >= 3)) {
        ctx.globalAlpha = 0.96;
        ctx.font = (12 / cam.k) + 'px Inter, system-ui, sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var labelY = a.y + r + 13 / cam.k;
        /* parchment halo keeps labels readable over links and clusters */
        ctx.lineWidth = 4 / cam.k;
        ctx.strokeStyle = "rgba(248, 241, 226, .92)";
        ctx.lineJoin = "round";
        ctx.strokeText(a.label, a.x, labelY);
        ctx.fillStyle = "#123A2E";
        ctx.fillText(a.label, a.x, labelY);
      }
    });
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  var running = false;
  function loop() {
    if (energy > 0.002) { tick(); energy *= 0.994; }
    draw();
    if (running) requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  /* ---------- hit testing ---------- */
  function toWorld(px, py) {
    return { x: (px - W / 2 - cam.x) / cam.k, y: (py - H / 2 - cam.y) / cam.k };
  }
  function pick(px, py) {
    var w = toWorld(px, py);
    var best = null, bestD = Infinity;
    nodes.forEach(function (a) {
      if (a.dim) return;
      var dx = a.x - w.x, dy = a.y - w.y;
      var d = dx * dx + dy * dy;
      var r = radius(a) + 3;
      if (d < r * r && d < bestD) { bestD = d; best = a; }
    });
    return best;
  }

  /* ---------- panel ---------- */
  function openPanel(n) {
    if (!n) return;
    $("panel").hidden = false;
    $("pTitle").textContent = n.label;
    $("pMeta").textContent = n.kind + (n.sub ? " · " + n.sub : "") + " · " + n.deg + " link" + (n.deg === 1 ? "" : "s");
    $("pNote").textContent = n.note || (n.kind === "site"
      ? (Lens.site(n.siteId) ? Lens.site(n.siteId).shortDescription : "")
      : "");

    var linksBox = $("pLinks");
    linksBox.innerHTML = "";
    if (n.kind === "site") {
      linksBox.appendChild(btn("Open the record", "monument.html?id=" + n.siteId));
      linksBox.appendChild(btn("Show on map", "index.html?focus=" + n.siteId));
      var pages = Lens.pagesForSite(n.siteId);
      if (pages.length) linksBox.appendChild(btn("Read leaf " + pages[0].seq, "manuscript.html?page=" + pages[0].id));
    } else if (n.kind === "page") {
      linksBox.appendChild(btn("Read the field note", "manuscript.html?page=" + n.pageId));
    }
    safeURL("?focus=" + n.ref);
  }
  function btn(text, href) {
    var a = document.createElement("a");
    a.className = "btn btn-ghost btn-sm";
    a.href = href;
    a.textContent = text;
    return a;
  }

  /* ---------- interaction ---------- */
  var drag = null;

  function pos(e) {
    var r = canvas.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }

  canvas.addEventListener("mousedown", function (e) {
    var p = pos(e);
    var n = pick(p.x, p.y);
    drag = { p: p, moved: 0, node: n };
    if (n) { openPanel(n); }
  });
  window.addEventListener("mousemove", function (e) {
    if (!drag) return;
    var p = pos(e);
    var dx = p.x - drag.p.x, dy = p.y - drag.p.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.node) {
      var w = toWorld(p.x, p.y);
      drag.node.x = w.x; drag.node.y = w.y;
      drag.node.vx = 0; drag.node.vy = 0;
      energy = Math.max(energy, 0.25);
    } else {
      cam.x += dx; cam.y += dy;
    }
    drag.p = p;
  });
  window.addEventListener("mouseup", function () { drag = null; });

  canvas.addEventListener("wheel", function (e) {
    e.preventDefault();
    var p = pos(e);
    var before = toWorld(p.x, p.y);
    cam.k *= (e.deltaY < 0 ? 1.12 : 0.89);
    cam.k = Math.max(0.25, Math.min(3.2, cam.k));
    var after = toWorld(p.x, p.y);
    cam.x += (after.x - before.x) * cam.k;
    cam.y += (after.y - before.y) * cam.k;
    draw();
  }, { passive: false });

  /* keyboard */
  canvas.addEventListener("keydown", function (e) {
    var step = 26;
    if (e.key === "ArrowLeft")  cam.x += step;
    else if (e.key === "ArrowRight") cam.x -= step;
    else if (e.key === "ArrowUp")    cam.y += step;
    else if (e.key === "ArrowDown")  cam.y -= step;
    else if (e.key === "+" || e.key === "=") cam.k = Math.min(3.2, cam.k * 1.15);
    else if (e.key === "-") cam.k = Math.max(0.25, cam.k * 0.87);
    else if (e.key === "Enter") {
      var f = nodes.filter(function (n) { return !n.dim; })
                   .sort(function (a, b) { return b.deg - a.deg; })[0];
      if (f) openPanel(f);
    } else return;
    e.preventDefault();
    draw();
  });

  /* ---------- filter ----------
     Match against the full record, then keep each match's direct
     neighbours visible too — so "granite" shows the material AND the
     monuments built from it, rather than one lonely dot. */
  function applyFilter(q) {
    var s = (q || "").toLowerCase().trim();

    nodes.forEach(function (a) {
      a.dim = s
        ? (a.haystack || (a.label + " " + a.sub + " " + (a.note || "")))
            .toLowerCase().indexOf(s) < 0
        : false;
    });

    if (s) {
      links.forEach(function (L) {
        /* skip the generated CLASSIFIED_AS edges — they are hubs that
           would fan one match out to every temple or fort in the archive */
        if (L.hub) return;
        if (!L.a.dim || !L.b.dim) {      // keep the whole edge if either end matched
          L.a.dim = false;
          L.b.dim = false;
        }
      });
    }

    energy = Math.max(energy, 0.18);
    $("gstats").textContent = s
      ? nodes.filter(function (n) { return !n.dim; }).length + " of " + nodes.length +
        " nodes match “" + q + "” (with their neighbours)"
      : nodes.length + " nodes · " + links.length + " edges · drag, scroll to zoom, click to trace";
  }

  /* ---------- legend + stats ---------- */
  function renderLegend() {
    var items = [
      ["Monument", KIND_COLOR.site],
      ["Material / technique", KIND_COLOR.entity],
      ["Manuscript leaf", KIND_COLOR.page],
      ["Field-note collection", KIND_COLOR.doc]
    ];
    $("legend").innerHTML = items.map(function (i) {
      return '<span><i style="background:' + i[1] + '"></i>' + i[0] + "</span>";
    }).join("");
  }

  /* ---------- boot ---------- */
  function init() {
    initLang();
    initA11y();
    renderLegend();

    resize();
    reheat(1);
    /* Settle a few steps and paint once up front. requestAnimationFrame is
       throttled in a background tab, so without this the canvas can sit
       empty until the tab is focused — which reads as a broken page, and
       is exactly what happens if a screen recording switches tabs. */
    for (var s = 0; s < 60; s++) tick();
    draw();
    start();
    applyFilter("");

    $("gsearch").addEventListener("input", function () { applyFilter(this.value); });
    $("reheat").addEventListener("click", function () { reheat(1); });
    $("resetView").addEventListener("click", function () { cam = { x: 0, y: 0, k: 1 }; draw(); });
    $("panelClose").addEventListener("click", function () {
      $("panel").hidden = true;
      safeURL(location.pathname);
    });

    /* deep link: graph.html?focus=site:taj-mahal */
    var focus = "";
    try { focus = new URLSearchParams(location.search).get("focus") || ""; } catch (e) { /* file:// */ }
    if (focus && byRef[focus]) {
      var n = byRef[focus];
      cam.x = -n.x * cam.k; cam.y = -n.y * cam.k;
      openPanel(n);
      draw();
    }

    document.addEventListener("langchange", renderLegend);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
