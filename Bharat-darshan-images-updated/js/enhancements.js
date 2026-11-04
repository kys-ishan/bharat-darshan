/**
 * ============================================================
 *  Bharat Darshan — enhancements.js
 *  Visual micro-interactions, scroll-reveal, and polish
 * ============================================================
 *  This file is purely cosmetic. The site works without it.
 *  Loaded after page-specific scripts on every page. It adds:
 *    • scroll-reveal (IntersectionObserver)
 *    • staggered card animations
 *    • smooth number counters (hero facts)
 *    • nav scroll state (glassmorphism shadow on scroll)
 *    • button active press micro-interaction
 *    • dynamic card observation on list view rendering
 * ============================================================ */

(function () {
  "use strict";

  /* ---- 0. Reduced-motion guard ---- */
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function motionOk() {
    return (
      !prefersReduced &&
      !document.body.classList.contains("reduce-motion")
    );
  }

  // Listen for OS reduced-motion preference changes
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", function (e) {
        prefersReduced = e.matches;
        if (prefersReduced) showAllImmediately();
      });
  }

  // Also listen for runtime toggle via body class (accessibility panel)
  var bodyObserver = new MutationObserver(function () {
    if (document.body.classList.contains("reduce-motion")) {
      showAllImmediately();
    }
  });
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  function showAllImmediately() {
    var targets = document.querySelectorAll(
      ".reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale"
    );
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---- 1. Scroll-reveal (IntersectionObserver) ---- */
  var revealObserver = null;

  function initReveal() {
    var targets = document.querySelectorAll(
      ".reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale"
    );
    if (!targets.length) return;

    if (!("IntersectionObserver" in window) || !motionOk()) {
      showAllImmediately();
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -20px 0px",
        }
      );
    }

    targets.forEach(function (el) {
      if (el.classList.contains("is-visible")) return;
      var rect = el.getBoundingClientRect();
      // If already in initial viewport, reveal immediately without lag
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        revealObserver.observe(el);
      }
    });
  }

  /* ---- 2. Auto-tag sections and cards for reveal ---- */
  function tagRevealTargets() {
    // Section heads
    document.querySelectorAll(".section-head, .block-head").forEach(function (el) {
      if (!el.classList.contains("reveal")) el.classList.add("reveal");
    });

    // Feature band content
    var featureCopy = document.querySelector(".feature-copy");
    if (featureCopy && !featureCopy.classList.contains("reveal")) {
      featureCopy.classList.add("reveal", "reveal-right");
    }
    var featureMedia = document.querySelector(".feature-media");
    if (featureMedia && !featureMedia.classList.contains("reveal")) {
      featureMedia.classList.add("reveal", "reveal-left");
    }

    // Triple cards with stagger
    document.querySelectorAll(".triple").forEach(function (triple) {
      var cards = triple.querySelectorAll(".triple-card");
      cards.forEach(function (card, i) {
        if (!card.classList.contains("reveal")) {
          card.classList.add("reveal", "reveal-up", "reveal-d" + Math.min(i + 1, 4));
        }
      });
    });

    // Footer columns
    var footerGrid = document.querySelector(".footer-grid");
    if (footerGrid) {
      var cols = footerGrid.children;
      for (var i = 0; i < cols.length; i++) {
        if (!cols[i].classList.contains("reveal")) {
          cols[i].classList.add("reveal", "reveal-up", "reveal-d" + Math.min(i + 1, 4));
        }
      }
    }

    // Story stages
    document.querySelectorAll(".story-stage").forEach(function (stage, i) {
      if (!stage.classList.contains("reveal")) {
        stage.classList.add("reveal", "reveal-up", "reveal-d" + Math.min(i + 1, 4));
      }
    });

    // Archive cards
    document.querySelectorAll(".archive-card").forEach(function (card, i) {
      if (!card.classList.contains("reveal")) {
        card.classList.add("reveal", "reveal-up", "reveal-d" + ((i % 4) + 1));
      }
    });

    // Fact strips
    document.querySelectorAll(".facts-grid .fact").forEach(function (fact, i) {
      if (!fact.classList.contains("reveal")) {
        fact.classList.add("reveal", "reveal-up", "reveal-d" + ((i % 4) + 1));
      }
    });

    // Source list items
    document.querySelectorAll(".source-list li").forEach(function (li, i) {
      if (!li.classList.contains("reveal")) {
        li.classList.add("reveal", "reveal-up", "reveal-d" + ((i % 3) + 1));
      }
    });

    // Notes
    document.querySelectorAll(".note, .credit-box, .honesty").forEach(function (n) {
      if (!n.classList.contains("reveal")) {
        n.classList.add("reveal");
      }
    });

    // Badges
    document.querySelectorAll(".badge").forEach(function (b, i) {
      if (!b.classList.contains("reveal")) {
        b.classList.add("reveal", "reveal-scale", "reveal-d" + ((i % 4) + 1));
      }
    });

    // Prose sections
    document.querySelectorAll(".prose").forEach(function (p) {
      if (!p.classList.contains("reveal")) {
        p.classList.add("reveal");
      }
    });

    // Listen panels
    document.querySelectorAll(".listen").forEach(function (l) {
      if (!l.classList.contains("reveal")) {
        l.classList.add("reveal");
      }
    });

    // Quiz cards
    document.querySelectorAll(".q-card").forEach(function (q, i) {
      if (!q.classList.contains("reveal")) {
        q.classList.add("reveal", "reveal-up", "reveal-d" + ((i % 3) + 1));
      }
    });

    // Story card grid on stories/index.html
    document.querySelectorAll(".story-card").forEach(function (card, i) {
      if (!card.classList.contains("reveal")) {
        card.classList.add("reveal", "reveal-up", "reveal-d" + ((i % 4) + 1));
      }
    });
  }

  /* ---- 3. Nav compact on scroll ---- */
  function initNavScroll() {
    var nav = document.querySelector(".nav");
    if (!nav) return;

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      nav.classList.toggle("nav-scrolled", y > 30);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- 4. Hero counters (animate "25 sites · 6 regions · 4 eras") ---- */
  function initHeroCounters() {
    if (!motionOk()) return;
    var facts = document.querySelector(".hero-facts");
    if (!facts) return;

    var spans = facts.querySelectorAll("span");
    var hasRun = false;

    function runCounters() {
      if (hasRun) return;
      hasRun = true;

      spans.forEach(function (span) {
        var text = span.textContent.trim();
        var match = text.match(/^(\d+)\s*(.*)$/);
        if (!match) return;

        var target = parseInt(match[1], 10);
        var label = match[2];
        var duration = 1200;
        var startTime = null;

        function animate(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(eased * target);
          span.textContent = current + (label ? " " + label : "");
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            span.textContent = target + (label ? " " + label : "");
          }
        }

        requestAnimationFrame(animate);
      });
    }

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            runCounters();
            obs.unobserve(facts);
          }
        },
        { threshold: 0.3 }
      );
      obs.observe(facts);
    } else {
      runCounters();
    }
  }

  /* ---- 5. Button active press effect ---- */
  function initButtonEffects() {
    document.addEventListener("mousedown", function (e) {
      var btn = e.target.closest(".btn, .pill, .chip, .seg button");
      if (btn) btn.classList.add("is-pressed");
    });
    document.addEventListener("mouseup", function () {
      document.querySelectorAll(".is-pressed").forEach(function (b) {
        b.classList.remove("is-pressed");
      });
    });
  }

  /* ---- 6. Dynamic card stagger on list view render ---- */
  function initCardGridObserver() {
    var grid = document.getElementById("cardGrid");
    if (!grid) return;

    var mo = new MutationObserver(function () {
      var cards = grid.querySelectorAll(".card");
      cards.forEach(function (card, i) {
        if (!card.classList.contains("reveal")) {
          card.classList.add("reveal", "reveal-up", "reveal-d" + ((i % 4) + 1));
        }
      });
      initReveal();
    });

    mo.observe(grid, { childList: true });
  }

  /* ---- BOOT ---- */
  function init() {
    tagRevealTargets();
    initReveal();
    initNavScroll();
    initHeroCounters();
    initButtonEffects();
    initCardGridObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
