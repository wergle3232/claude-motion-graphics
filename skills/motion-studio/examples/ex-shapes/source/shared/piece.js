// ex-shapes (storyboard 2): one continuous move, 7 s. A storm of shapes pours in and is
// sucked into one big black square; the square snaps through circle, triangle, star and
// back to a red circle; the camera dives into the red circle and pulls back out of the
// MORF mark's circle, revealing "Idea -> MORF -> Motion"; arrows draw, labels type, a red
// pulse runs along the arrows, hold. (MORF brand.)
// The entry file sets only the canvas and layout, then calls buildPieceTimeline().
(function () {
  "use strict";

  var T = { suck: 0.92, form: 1.2, chain: 1.5, step: 0.3, dive: 2.85, red: 3.2, lock: 4.05, lines: 4.2, labels: 4.4, pulse: 5.0, total: 7 };
  // Storyboard: the main timeline held at each beat's fullest moment, one second each.
  var BOARD = [0.86, 1.32, 2.22, 3.08, 3.62, 5.05];

  var seed = 0x5a9e3;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function chars(el) { el.innerHTML = Array.from(el.textContent).map(function (c) { return '<span class="c">' + c + "</span>"; }).join(""); return Array.prototype.slice.call(el.querySelectorAll(".c")); }

  // Morphing: every form is the same 48-point polygon, found by casting rays from the centre
  // to the outline, so GSAP can tween clip-path from any form to any other.
  var NPTS = 48;
  function rayHit(dx, dy, verts) {
    var best = Infinity;
    for (var i = 0; i < verts.length; i++) {
      var a = verts[i], b = verts[(i + 1) % verts.length];
      var ex = b[0] - a[0], ey = b[1] - a[1], den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      var t = (a[0] * ey - a[1] * ex) / den, u = (a[0] * dy - a[1] * dx) / den;
      if (t > 0 && u >= -1e-9 && u <= 1 + 1e-9 && t < best) best = t;
    }
    return best;
  }
  function poly(verts) {
    var pts = [];
    for (var k = 0; k < NPTS; k++) {
      var th = -Math.PI / 2 + (k * 2 * Math.PI) / NPTS, dx = Math.cos(th), dy = Math.sin(th);
      var r = verts ? rayHit(dx, dy, verts) : 1;
      pts.push([50 + 50 * r * dx, 50 + 50 * r * dy]);
    }
    return pts;
  }
  // The clip-path for a blend between two forms (t can overshoot past 1 for a snappy ease).
  function clip(a, b, t) {
    return "polygon(" + a.map(function (p, i) { return (p[0] + (b[i][0] - p[0]) * t).toFixed(2) + "% " + (p[1] + (b[i][1] - p[1]) * t).toFixed(2) + "%"; }).join(", ") + ")";
  }
  var star = [];
  for (var s = 0; s < 10; s++) { var a = -Math.PI / 2 + (s * Math.PI) / 5, rr = s % 2 ? 0.45 : 1; star.push([rr * Math.cos(a), rr * Math.sin(a)]); }
  var FORM = {
    square: poly([[-1, -1], [1, -1], [1, 1], [-1, 1]]),
    circle: poly(null),
    triangle: poly([[0, -1], [1, 0.85], [-1, 0.85]]),
    star: poly(star),
  };

  window.buildPieceTimeline = function () {
    var root = document.getElementById("root");
    var $ = function (q) { return root.querySelector(q); };
    var vars = (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {};
    var cs = getComputedStyle(root);
    var num = function (n) { return parseFloat(cs.getPropertyValue("--" + n)); };
    var C = { ink: cs.getPropertyValue("--brand-text").trim(), red: cs.getPropertyValue("--brand-accent").trim(), grey: cs.getPropertyValue("--brand-accent-2").trim() };
    var Y = num("row-y"), LY = num("lab-y"), XL = num("xl"), XM = num("xm"), XR = num("xr");

    // The diagram's geometry: node edges, the mark (square + circle, 200 each, 30 apart), the arrows.
    var NODE = 250, MK = 200, GAP = 30, HEAD = 40, HERO = 360;
    var mkSq = XM - (MK + 30) / 2, mkCi = XM + (MK + 30) / 2;
    var l1x = XL + NODE / 2 + GAP, l1e = mkSq - MK / 2 - GAP;
    var l2x = mkCi + MK / 2 + GAP, l2e = XR - NODE / 2 - GAP;

    $("#eyebrow").textContent = "02 / SHAPES";
    var eyebrow = chars($("#eyebrow"));
    var labs = [chars($("#labL")), chars($("#labM")), chars($("#labR"))];

    // The storm: 40 shapes on a jittered grid that fills the frame, each arriving from above
    // or from a side, in a fixed, natural-looking order.
    var storm = $("#storm"), bits = [];
    var COLS = 8, ROWS = 5, KINDS = ["sq", "ci", "tr"], PAL = [C.ink, C.ink, C.red, C.red, C.grey];
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var size = 80 + rnd() * 110, kind = KINDS[Math.floor(rnd() * 3)];
      var e = document.createElement("div");
      e.className = "st " + kind;
      e.style.width = e.style.height = size.toFixed(0) + "px";
      e.style.background = PAL[Math.floor(rnd() * PAL.length)];
      storm.appendChild(e);
      bits.push({ el: e, x: 190 + c * 220 + (rnd() - 0.5) * 110, y: 280 + r * 150 + (rnd() - 0.5) * 80, rot: (rnd() - 0.5) * 120, side: rnd() < 0.3 ? (rnd() < 0.5 ? -1 : 1) : 0, delay: rnd() * 0.42 });
    }

    var tl = gsap.timeline({ paused: true });
    var centre = { xPercent: -50, yPercent: -50 };
    gsap.set(["#hero", "#nodeL", "#nodeR", "#mk", ".st"], centre);
    var hero = $("#hero");
    gsap.set("#hero", { x: XM, y: Y, scale: 0, clipPath: clip(FORM.square, FORM.square, 0), backgroundColor: C.ink });
    gsap.set("#ring", { opacity: 0 });
    gsap.set("#nodeL", { x: XL, y: Y, opacity: 0 });
    gsap.set("#nodeR", { x: XR, y: Y, opacity: 0 });
    gsap.set("#mk", { x: mkSq, y: Y, scale: 0 });
    gsap.set("#l1", { x: l1x, y: Y - 7, width: l1e - l1x - HEAD, scaleX: 0 });
    gsap.set("#h1", { x: l1e - HEAD, y: Y - 24, scale: 0 });
    gsap.set("#l2", { x: l2x, y: Y - 7, width: l2e - l2x - HEAD, scaleX: 0 });
    gsap.set("#h2", { x: l2e - HEAD, y: Y - 24, scale: 0 });
    gsap.set(["#p1", "#p2"], { y: Y - 7, opacity: 0 });
    gsap.set("#labL", { x: XL, y: LY, xPercent: -50 });
    gsap.set("#labM", { x: XM, y: LY, xPercent: -50 });
    gsap.set("#labR", { x: XR, y: LY, xPercent: -50 });
    labs.forEach(function (l) { gsap.set(l, { opacity: 0 }); });
    gsap.set(eyebrow, { opacity: 0 });
    gsap.set("#cam", { transformOrigin: XM + "px " + Y + "px" });

    // ---- Frame: rules draw, label types (on top of the storm).
    tl.fromTo("#topline", { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "expo.out" }, 0.1);
    tl.fromTo("#botline", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out" }, 0.2);
    eyebrow.forEach(function (ch, i) { tl.set(ch, { opacity: 1 }, 0.25 + i * 0.03); });

    // ---- Beat 1 (0 to 1.3): the storm pours in and piles up, then everything is sucked
    // into the middle and one big black square punches out of the point.
    // The first ten start already in the frame and falling, so the very first frame moves.
    bits.forEach(function (b, n) {
      if (n % 4 === 0) { b.delay = 0; b.side = 0; b.early = true; }
      var from = b.early ? { x: b.x + (rnd() - 0.5) * 120, y: b.y - 260, rotation: b.rot - 120 } : b.side ? { x: b.side < 0 ? -250 : 2170, y: b.y - 200, rotation: b.rot - 200 * b.side } : { x: b.x + (rnd() - 0.5) * 200, y: -250 - rnd() * 300, rotation: b.rot - 180 };
      tl.fromTo(b.el, from, { x: b.x, y: b.y, rotation: b.rot, duration: 0.42, ease: b.side ? "back.out(1.6)" : "bounce.out" }, b.delay);
      tl.to(b.el, { x: XM, y: Y, scale: 0, rotation: b.rot + 360, duration: 0.3, ease: "power3.in" }, T.suck + rnd() * 0.06);
    });
    tl.to("#hero", { scale: 1, duration: 0.22, ease: "back.out(2.6)" }, T.form);
    [[14, -10], [-12, 8], [8, -5], [-4, 2], [0, 0]].forEach(function (p, i) { tl.to("#cam", { x: p[0], y: p[1], duration: 0.04, ease: "none" }, T.form + 0.05 + i * 0.04); });

    // ---- Beat 2 (1.5 to 2.85): the square snaps through forms on the beat, a quarter turn
    // and a punch on each: circle (red), triangle (ink), star (red), circle (red).
    var CHAIN = [["circle", C.red], ["triangle", C.ink], ["star", C.red], ["circle", C.red]];
    // The outline is blended point by point from a proxy (seek-safe: each step sets the whole outline).
    var prev = FORM.square;
    CHAIN.forEach(function (f, i) {
      var t = T.chain + i * T.step, a = prev, b = FORM[f[0]], m = { t: 0 };
      tl.fromTo(m, { t: 0 }, { t: 1, immediateRender: false, duration: 0.18, ease: "back.out(1.8)", onUpdate: function () { hero.style.clipPath = clip(a, b, m.t); } }, t);
      tl.set("#hero", { backgroundColor: f[1] }, t + 0.03);
      tl.fromTo("#hero", { rotation: i % 2 ? 50 : -50 }, { rotation: 0, immediateRender: false, duration: 0.24, ease: "back.out(2)" }, t);
      tl.fromTo("#hero", { scale: 1.16 }, { scale: 1, immediateRender: false, duration: 0.22, ease: "power2.out" }, t);
      prev = b;
    });

    // Once the chain is done, swap the 48-point outline for a true circle so it stays smooth when the camera dives in.
    tl.set("#hero", { clipPath: "circle(50% at 50% 50%)" }, T.chain + 3 * T.step + 0.25);

    // ---- Beat 3 (2.85 to 3.9): the camera dives into the red circle until the frame is red;
    // under cover of the red, the circle becomes the MORF mark's circle and the diagram is set,
    // then the camera pulls back out of it.
    tl.to("#cam", { scale: 14, duration: T.red - T.dive, ease: "power3.in" }, T.dive);
    tl.set("#hero", { x: mkCi, scale: MK / HERO, rotation: 0 }, T.red);
    tl.set("#cam", { transformOrigin: mkCi + "px " + Y + "px", scale: 14 * HERO / MK }, T.red);
    tl.set(["#nodeL", "#nodeR"], { opacity: 1 }, T.red);
    tl.to("#cam", { scale: 1, duration: 1.0, ease: "power3.out" }, T.red + 0.04);
    tl.fromTo("#mk", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, immediateRender: false, duration: 0.22, ease: "back.out(2.5)" }, T.lock);
    tl.to("#l1", { scaleX: 1, duration: 0.25, ease: "power2.inOut" }, T.lines);
    tl.to("#h1", { scale: 1, duration: 0.15, ease: "back.out(3)" }, T.lines + 0.22);
    tl.to("#l2", { scaleX: 1, duration: 0.25, ease: "power2.inOut" }, T.lines + 0.2);
    tl.to("#h2", { scale: 1, duration: 0.15, ease: "back.out(3)" }, T.lines + 0.42);

    // ---- Beat 4 (4.15 to 7): labels type on; a red pulse runs along the arrows and the play
    // triangle kicks; then it holds.
    labs.forEach(function (l, n) { l.forEach(function (ch, i) { tl.set(ch, { opacity: 1 }, T.labels + n * 0.15 + i * 0.035); }); });
    tl.set("#p1", { opacity: 1 }, T.pulse);
    tl.fromTo("#p1", { x: l1x }, { x: l1e - HEAD - 90, immediateRender: false, duration: 0.3, ease: "power1.inOut" }, T.pulse);
    tl.set("#p1", { opacity: 0 }, T.pulse + 0.31);
    tl.fromTo("#mk", { scale: 1 }, { scale: 1.08, immediateRender: false, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }, T.pulse + 0.3);
    tl.set("#p2", { opacity: 1 }, T.pulse + 0.38);
    tl.fromTo("#p2", { x: l2x }, { x: l2e - HEAD - 90, immediateRender: false, duration: 0.3, ease: "power1.inOut" }, T.pulse + 0.38);
    tl.set("#p2", { opacity: 0 }, T.pulse + 0.69);
    tl.fromTo("#nodeR", { scale: 1 }, { scale: 1.15, immediateRender: false, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }, T.pulse + 0.68);
    tl.set({}, {}, T.total);

    if (vars.mode !== "storyboard") return tl;
    var sb = gsap.timeline({ paused: true });
    BOARD.forEach(function (t, i) { sb.set(tl, { time: t }, i); });
    sb.set({}, {}, T.total);
    return sb;
  };
})();
