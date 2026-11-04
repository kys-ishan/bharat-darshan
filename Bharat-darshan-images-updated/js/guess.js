/**
 * ============================================================
 *  Bharat Darshan — guess.js
 *  "Guess the Monument": 5 rounds, 4 options each.
 *  Person B owns this file.
 *
 *  Rules the game keeps:
 *    - images come from the same licensed files the map uses
 *    - distractors are other sites in the local data file
 *    - nothing is sent anywhere; no score is stored
 * ============================================================
 */

(function () {
  "use strict";

  var ROUNDS = 5;
  var OPTIONS = 4;

  var state = { round: 0, score: 0, deck: [], answered: false };

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function nameOf(s) { return (LANG === "hi" && s.nameHi) ? s.nameHi : s.name; }

  /* --------------------------------------------------------
     Deck building — pick ROUNDS distinct sites that have a
     photograph, then build 4 options for each.
     -------------------------------------------------------- */

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildDeck() {
    var pool = SITES.filter(function (s) { return !!s.heroImage; });
    if (pool.length < OPTIONS) return [];
    return shuffle(pool).slice(0, ROUNDS).map(function (answer) {
      var wrong = shuffle(pool.filter(function (s) { return s.id !== answer.id; }))
        .slice(0, OPTIONS - 1);
      return { answer: answer, options: shuffle([answer].concat(wrong)) };
    });
  }

  /* --------------------------------------------------------
     Rendering
     -------------------------------------------------------- */

  function renderProgress() {
    var dots = "";
    for (var i = 0; i < ROUNDS; i++) {
      var cls = i < state.round ? "done" : (i === state.round ? "on" : "");
      dots += '<i class="' + cls + '"></i>';
    }
    $("progress").innerHTML = dots;
    $("roundLabel").textContent = t("guess.round")
      .replace("{n}", String(state.round + 1))
      .replace("{t}", String(ROUNDS));
  }

  function showStart() {
    $("startScreen").hidden = false;
    $("roundScreen").hidden = true;
    $("resultScreen").hidden = true;
    $("roundLabel").textContent = "";
    $("progress").innerHTML = "";
  }

  function showRound() {
    var q = state.deck[state.round];
    if (!q) return showResult();

    state.answered = false;
    $("startScreen").hidden = true;
    $("resultScreen").hidden = true;
    $("roundScreen").hidden = false;
    $("feedback").hidden = true;
    $("roundActions").hidden = true;
    $("seePage").hidden = true;

    renderProgress();

    var img = $("quizImg");
    // Zoom into a detail so the whole building is not immediately obvious.
    var ox = 25 + Math.random() * 50;
    var oy = 25 + Math.random() * 45;
    img.style.objectPosition = ox + "% " + oy + "%";
    img.style.transform = "scale(2.4)";
    img.alt = t("guess.alt");
    // Local copy first, same as every other page. The Wikimedia original is
    // only a fallback, so the game still works offline and is not exposed to
    // remote rate limiting during a demo.
    img.onerror = function () {
      img.onerror = null;
      img.onerror = function () {
        img.onerror = null;
        img.alt = t("guess.missing");
        img.style.transform = "none";
      };
      img.src = q.answer.heroImage;
    };
    img.src = "assets/img/" + q.answer.id + ".jpg";
    img.onload = function () { img.style.transform = "scale(2.4)"; };

    $("options").innerHTML = q.options.map(function (s, i) {
      return '<button type="button" data-id="' + esc(s.id) + '">' +
             esc(nameOf(s)) + "</button>";
    }).join("");
  }

  function answer(pickedId) {
    if (state.answered) return;
    var q = state.deck[state.round];
    var correct = pickedId === q.answer.id;
    if (correct) state.score++;
    state.answered = true;

    var btns = $("options").querySelectorAll("button[data-id]");
    btns.forEach(function (b) {
      b.disabled = true;
      if (b.dataset.id === q.answer.id) b.classList.add("right");
      else if (b.dataset.id === pickedId) b.classList.add("wrong");
    });

    var fb = $("feedback");
    fb.hidden = false;
    fb.innerHTML = correct
      ? "<b>✓ " + esc(t("guess.right")) + "</b><br />" + esc(q.answer.shortDescription || "")
      : "<b>✗ " + esc(t("guess.wrong")) + "</b><br />" +
        esc(t("guess.answer")) + ": <b>" + esc(nameOf(q.answer)) + "</b>";

    // Reveal the full photograph.
    $("quizImg").style.transform = "none";

    $("roundActions").hidden = false;
    $("nextBtn").textContent =
      state.round === ROUNDS - 1 ? t("guess.finish") : t("guess.next");
    $("seePage").hidden = false;
    $("seePage").href = "monument.html?id=" + encodeURIComponent(q.answer.id);
    $("nextBtn").focus();
  }

  function showResult() {
    $("startScreen").hidden = true;
    $("roundScreen").hidden = true;
    $("resultScreen").hidden = false;
    $("progress").innerHTML = "";
    $("roundLabel").textContent = "";

    $("scoreBig").textContent = state.score + "/" + ROUNDS;
    $("resultTitle").textContent = t("guess.done");
    $("resultBody").textContent =
      state.score >= 4 ? t("guess.great") :
      state.score >= 2 ? t("guess.ok") :
      t("guess.try");
  }

  /* --------------------------------------------------------
     Wiring
     -------------------------------------------------------- */

  function start() {
    state.round = 0;
    state.score = 0;
    state.deck = buildDeck();
    if (!state.deck.length) {
      toast(t("guess.empty"));
      return;
    }
    showRound();
  }

  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  function renderAll() {
    $("crumb").textContent = t("guess.title");
    if (!$("roundScreen").hidden) {
      // Re-render the current round so names follow the language.
      var keep = state.round, keepScore = state.score, keepDeck = state.deck;
      showRound();
      state.round = keep; state.score = keepScore; state.deck = keepDeck;
    } else if (!$("resultScreen").hidden) {
      showResult();
    }
  }

  function init() {
    initLang();
    initA11y();

    $("startBtn").addEventListener("click", start);
    $("againBtn").addEventListener("click", start);

    $("options").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-id]");
      if (b) answer(b.dataset.id);
    });

    $("nextBtn").addEventListener("click", function () {
      state.round++;
      showRound();
    });

    document.addEventListener("langchange", renderAll);
    showStart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
