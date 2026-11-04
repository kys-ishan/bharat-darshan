/**
 * ============================================================
 *  Bharat Darshan — store.js
 *  All saved user data lives here. There is NO backend and NO
 *  login: everything is written to localStorage on this device
 *  and never leaves it unless the user shares it themselves.
 * ============================================================
 *
 *  Keys used:
 *    bd.journey    array of site ids, max 5, in visiting order
 *    bd.visited    object { siteId: true }
 *    bd.badges     array of earned badge ids
 *    bd.lang       "en" | "hi"
 *    bd.a11y       { contrast, text, motion }
 * ============================================================
 */

const Store = (function () {
  const MAX_STOPS = 5;

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      // Storage blocked (private mode / disabled) — degrade to memory only.
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  /* ---------------- journey ---------------- */

  function getJourney() { return read("bd.journey", []); }

  function inJourney(id) { return getJourney().indexOf(id) !== -1; }

  /** @returns {{ok:boolean, message:string, journey:string[]}} */
  function addStop(id) {
    const journey = getJourney();
    if (journey.indexOf(id) !== -1) {
      return { ok: false, message: "already", journey };
    }
    if (journey.length >= MAX_STOPS) {
      return { ok: false, message: "full", journey };
    }
    journey.push(id);
    write("bd.journey", journey);
    return { ok: true, message: "added", journey };
  }

  function removeStop(id) {
    const journey = getJourney().filter((x) => x !== id);
    write("bd.journey", journey);
    return { ok: true, message: "removed", journey };
  }

  /** Move a stop up or down. Used by the accessible reorder buttons. */
  function moveStop(id, direction) {
    const journey = getJourney();
    const i = journey.indexOf(id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= journey.length) return journey;
    const tmp = journey[i];
    journey[i] = journey[j];
    journey[j] = tmp;
    write("bd.journey", journey);
    return journey;
  }

  /* ---------------- visited ---------------- */

  function getVisited() { return read("bd.visited", {}); }
  function isVisited(id) { return !!getVisited()[id]; }

  function setVisited(id, value) {
    const v = getVisited();
    if (value) v[id] = true; else delete v[id];
    write("bd.visited", v);
    return !!value;
  }

  function visitedCount() { return Object.keys(getVisited()).length; }

  /* ---------------- badges ---------------- */

  function getBadges() { return read("bd.badges", []); }

  function award(id) {
    const b = getBadges();
    if (b.indexOf(id) === -1) { b.push(id); write("bd.badges", b); return true; }
    return false;
  }

  /* ---------------- accessibility ---------------- */

  function getA11y() {
    return read("bd.a11y", { contrast: false, text: false, motion: false });
  }

  function setA11y(patch) {
    const next = Object.assign(getA11y(), patch);
    write("bd.a11y", next);
    return next;
  }

  /** Push the saved accessibility flags onto <body> as classes. */
  function applyA11y() {
    const a = getA11y();
    document.body.classList.toggle("high-contrast", !!a.contrast);
    document.body.classList.toggle("large-text", !!a.text);
    document.body.classList.toggle("reduce-motion", !!a.motion);
    return a;
  }

  return {
    MAX_STOPS,
    getJourney, inJourney, addStop, removeStop, moveStop,
    getVisited, isVisited, setVisited, visitedCount,
    getBadges, award,
    getA11y, setA11y, applyA11y
  };
})();

/**
 * Haversine distance in kilometres. Used for "Near me" and for the
 * journey's cumulative distance, which we always label approximate.
 */
function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Wire the mobile navigation drawer. Safe to call on every page.
 *
 * The drawer used to be open on first load on phones because the markup
 * had no `hidden` attribute and the only [hidden] rule lived inside the
 * mobile media query. This keeps the state in one place, closes the menu
 * when a link is followed, restores it when the viewport grows, and makes
 * Escape return focus to the toggle.
 */
function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  const mobile = window.matchMedia("(max-width: 900px)");

  function setOpen(open) {
    const isOpen = !!open && mobile.matches;
    links.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  }

  setOpen(false);
  toggle.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));

  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!links.classList.contains("is-open")) return;
    if (links.contains(event.target) || toggle.contains(event.target)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && links.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  if (mobile.addEventListener) {
    mobile.addEventListener("change", () => setOpen(false));
  } else if (mobile.addListener) {
    mobile.addListener(() => setOpen(false));
  }
}

/** Wire the header accessibility popover. Safe to call on every page. */
function initA11y() {
  const toggle = document.getElementById("a11yToggle");
  const panel = document.getElementById("a11yPanel");
  if (!toggle || !panel) return;

  const saved = Store.applyA11y();
  const map = {
    optContrast: "contrast",
    optText: "text",
    optMotion: "motion"
  };
  Object.keys(map).forEach((id) => {
    const box = document.getElementById(id);
    if (!box) return;
    box.checked = !!saved[map[id]];
    box.addEventListener("change", () => {
      Store.setA11y({ [map[id]]: box.checked });
      Store.applyA11y();
    });
  });

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  document.addEventListener("click", (e) => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== toggle) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) { setOpen(false); toggle.focus(); }
  });
}

/* The shared chrome must work even on pages whose own script failed to
   load. DOMContentLoaded is late enough for the header to exist. */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNav);
} else {
  initNav();
}
