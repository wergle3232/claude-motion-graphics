// ex-titles: kinetic type. "Motion" slams, "graphics" drops in letter by letter,
// swaps through fonts and settles in the brand's Archivo Black, the title glitch-splits
// and snaps back, then "made with Claude Code" types on with a black block. (MORF brand.)
// The entry file sets only the canvas and layout, then calls buildPieceTimeline().
(function () {
  "use strict";

  var T = { slam: 0.0, drop: 0.42, swap: 1.1, split: 1.9, sub: 2.3, block: 2.65, bar: 3.2, total: 5 };
  // Storyboard: the main timeline held at each beat's fullest moment, one second each.
  var BOARD = [0.46, 0.68, 1.38, 2.0, 3.45];

  // The scramble passes through common system fonts (the library's se-font-decode move),
  // then always settles in the brand headline font.
  var FONTS = ["Georgia", "Impact", "Courier New", "Segoe Script", "Arial Black", "Times New Roman", "Trebuchet MS", "Consolas", "Comic Sans MS", "Palatino Linotype"];
  var SPEC_FONTS = ["Georgia", "Impact", "Segoe Script", "Arial Black", "Times New Roman", "Courier New", "Trebuchet MS", "Palatino Linotype", "Comic Sans MS", "Consolas", "Georgia", "Impact"];

  var seed = 0x5e7a11;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function chars(s, cls) { return Array.from(s).map(function (c) { return '<span class="c' + (cls ? " " + cls : "") + '">' + c + "</span>"; }).join(""); }
  function titleHTML(id, final) {
    return '<div class="title"' + (id ? ' id="' + id + '"' : "") + ">" +
      '<span class="line"' + (id ? ' id="w1"' : "") + ">" + chars("Motion") + "</span>" +
      '<span class="line"' + (id ? ' id="w2"' : "") + ">" + chars("graphics", final ? "g" : "").replace(/<span class="c/g, '<span data-layout-allow-overlap class="c') + "</span></div>";
  }

  window.buildPieceTimeline = function () {
    var root = document.getElementById("root");
    var $ = function (s) { return root.querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
    var vars = (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {};
    var cs = getComputedStyle(root);
    var C = { text: cs.getPropertyValue("--brand-text").trim(), accent: cs.getPropertyValue("--brand-accent").trim(), grey: cs.getPropertyValue("--brand-accent-2").trim(), muted: cs.getPropertyValue("--brand-muted").trim() };
    var DISPLAY = '"Archivo Black", sans-serif';
    var SCRAMBLE_COLS = [C.accent, C.text, C.grey, C.accent, C.text];

    // ---- Build the DOM.
    $("#eyebrow").innerHTML = chars("01 / MOVING TITLES");
    $("#main-title").innerHTML = titleHTML("title", false);
    $("#ghosts").innerHTML = '<div class="ghost vi">' + titleHTML("", true) + '</div><div class="ghost gr">' + titleHTML("", true) + "</div>";
    // Bands are cut across the title's own box, measured from the page.
    var tR = $("#title").getBoundingClientRect(), rR = root.getBoundingClientRect();
    var tTop = tR.top - rR.top, tH = tR.height, H = rR.height;
    var NB = 6, bandsHTML = "";
    for (var b = 0; b < NB; b++) {
      var top = tTop + (b / NB) * tH, bot = H - (tTop + ((b + 1) / NB) * tH);
      bandsHTML += '<div class="band" style="clip-path: inset(' + top.toFixed(1) + "px 0 " + bot.toFixed(1) + 'px 0)">' + titleHTML("", true) + "</div>";
    }
    $("#bands").innerHTML = bandsHTML;
    $("#sub .lead").innerHTML = chars("made with");

    // Measure before anything moves. Fix each letter's width so font swaps never shift the line.
    var w1 = $$("#w1 .c"), w2 = $$("#w2 .c");
    w2.forEach(function (c) { c.style.width = c.getBoundingClientRect().width + "px"; });
    var rootR = root.getBoundingClientRect();
    var lead = $$("#sub .lead .c");
    var caretAt = lead.map(function (c) { var r = c.getBoundingClientRect(); return { x: r.right - rootR.left + 6, y: r.top - rootR.top - 2 }; });
    var firstR = lead[0].getBoundingClientRect();

    var tl = gsap.timeline({ paused: true });
    gsap.set(["#spec", "#spec-label", "#caret"], { opacity: 0 });
    gsap.set(lead, { opacity: 0 });
    gsap.set("#tag .blk", { scaleX: 0 });
    gsap.set("#tag .t", { opacity: 0 });
    gsap.set($$("#eyebrow .c"), { opacity: 0 });

    // ---- Beat 1 (0.05 to 0.6): "Motion" slams down from huge and blurred; the frame shakes.
    tl.fromTo("#w1", { scale: 3.4, filter: "blur(30px)" }, { scale: 1, filter: "blur(0px)", duration: 0.25, ease: "power4.in" }, T.slam);
    tl.fromTo("#w1", { opacity: 0 }, { opacity: 1, duration: 0.06, ease: "none" }, 0);
    var land = T.slam + 0.25;
    tl.fromTo("#flash", { opacity: 0.9 }, { opacity: 0, immediateRender: false, duration: 0.16, ease: "power2.out" }, land);
    tl.fromTo("#w1", { scaleY: 0.86 }, { scaleY: 1, immediateRender: false, duration: 0.3, ease: "elastic.out(1.2, 0.4)" }, land);
    [[18, -12], [-14, 10], [10, 6], [-6, -4], [3, 2], [0, 0]].forEach(function (p, i) {
      tl.to("#cam", { x: p[0], y: p[1], duration: 0.04, ease: "none" }, land + i * 0.04);
    });
    tl.fromTo("#topline", { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "expo.out" }, land);
    tl.fromTo("#botline", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out" }, land + 0.08);

    // ---- Beat 2 (0.42 to 1.1): "graphics" letters drop in one after another and bounce.
    w2.forEach(function (c, i) {
      var r = (rnd() - 0.5) * 50;
      tl.fromTo(c, { y: -560, opacity: 0, rotation: r }, { y: 0, opacity: 1, rotation: 0, duration: 0.38, ease: "back.out(2.2)" }, T.drop + i * 0.04);
    });
    // The eyebrow types on as the letters land.
    $$("#eyebrow .c").forEach(function (c, i) { tl.set(c, { opacity: 1 }, 0.62 + i * 0.022); });

    // ---- Beat 3 (1.1 to 1.8): every letter of "graphics" swaps through fonts and colours,
    // then settles left to right in the brand mono, green and glowing. The specimen on the
    // right swaps with it on the brand's red circle and names each font.
    var step = 0.06;
    w2.forEach(function (c, i) {
      var settle = T.swap + 0.3 + i * 0.05;
      for (var t = T.swap; t < settle - 0.001; t += step) {
        tl.set(c, { fontFamily: '"' + FONTS[Math.floor(rnd() * FONTS.length)] + '", serif', color: SCRAMBLE_COLS[Math.floor(rnd() * SCRAMBLE_COLS.length)], fontStyle: rnd() < 0.3 ? "italic" : "normal", scale: 0.9 + rnd() * 0.3 }, t);
      }
      tl.set(c, { fontFamily: DISPLAY, color: C.accent, fontStyle: "normal", scale: 1, attr: { class: "c g" } }, settle);
      tl.fromTo(c, { y: -18 }, { y: 0, immediateRender: false, duration: 0.18, ease: "power3.out" }, settle);
    });
    tl.fromTo("#disc", { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2.2)" }, T.swap - 0.08);
    tl.fromTo("#spec", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, T.swap);
    tl.set("#spec-label", { opacity: 1 }, T.swap);
    var specEnd = T.swap + 0.66;
    for (var k = 0, ts = T.swap; ts < specEnd; ts += step, k++) {
      var f = SPEC_FONTS[k % SPEC_FONTS.length];
      tl.set("#spec", { fontFamily: '"' + f + '", serif' }, ts);
      tl.set("#spec-label", { textContent: f }, ts);
    }
    tl.set("#spec", { fontFamily: DISPLAY }, specEnd);
    tl.set("#spec-label", { textContent: "Archivo Black", color: C.text }, specEnd);
    tl.fromTo("#disc", { scale: 1.1 }, { scale: 1, immediateRender: false, duration: 0.3, ease: "power3.out" }, specEnd);
    tl.fromTo("#spec", { scale: 1.12 }, { scale: 1, immediateRender: false, duration: 0.3, ease: "power3.out" }, specEnd);

    // ---- Beat 4 (1.9 to 2.25): the title glitch-splits into bands that tear sideways,
    // with red and grey ghosts, then snaps back together.
    var bands = $$(".band");
    tl.set("#main-title", { opacity: 0 }, T.split);
    tl.set(bands, { opacity: 1 }, T.split);
    tl.set(".ghost", { opacity: 0.75 }, T.split);
    var OFF = [[-110, 140, -60, 170, -140, 80], [60, -90, 130, -40, 90, -150], [-30, 50, -20, 60, -40, 20]];
    OFF.forEach(function (row, n) {
      bands.forEach(function (bd, i) { tl.set(bd, { x: row[i], skewX: n === 0 ? (i % 2 ? -8 : 8) : 0 }, T.split + n * 0.08); });
      tl.set(".ghost.vi", { x: 30 - n * 8, y: -6 }, T.split + n * 0.08);
      tl.set(".ghost.gr", { x: -30 + n * 8, y: 6 }, T.split + n * 0.08);
    });
    var snap = T.split + 0.3;
    tl.set(bands, { x: 0, skewX: 0, opacity: 0 }, snap);
    tl.set(".ghost", { opacity: 0 }, snap);
    tl.set("#main-title", { opacity: 1 }, snap);
    tl.fromTo("#flash", { opacity: 0.6 }, { opacity: 0, immediateRender: false, duration: 0.12, ease: "power2.out" }, snap);
    [[-12, 6], [8, -4], [-4, 2], [0, 0]].forEach(function (p, i) { tl.to("#cam", { x: p[0], y: p[1], duration: 0.035, ease: "none" }, snap + i * 0.035); });

    // ---- Beat 5 (2.3 to 2.85): "made with" types on behind a red caret, then the
    // black block wipes in and "Claude Code" pops onto it.
    tl.set("#caret", { opacity: 1, x: firstR.left - rootR.left, y: firstR.top - rootR.top - 2 }, T.sub - 0.05);
    lead.forEach(function (c, i) {
      var t = T.sub + i * 0.035;
      tl.set(c, { opacity: 1 }, t);
      tl.set("#caret", { x: caretAt[i].x, y: caretAt[i].y }, t);
    });
    tl.set("#caret", { opacity: 0 }, T.block);
    tl.fromTo("#tag .blk", { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power4.out" }, T.block);
    tl.fromTo("#tag .t", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)" }, T.block + 0.07);
    tl.fromTo("#tag", { scale: 1 }, { scale: 1.06, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }, T.block + 0.1);

    // ---- Hold (2.85 to 5): everything still; a red bar slams in under the title.
    tl.fromTo("#underbar", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "expo.out" }, T.bar);
    tl.fromTo("#w2", { y: 0 }, { y: -10, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" }, T.bar + 0.05);
    tl.set({}, {}, T.total);

    if (vars.mode !== "storyboard") return tl;
    var sb = gsap.timeline({ paused: true });
    BOARD.forEach(function (t, i) { sb.set(tl, { time: t }, i); });
    sb.set({}, {}, T.total);
    return sb;
  };
})();
