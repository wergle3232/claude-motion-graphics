// ex-logo: the MORF logo sting, 4 s. A black square drops where the O will be, morphs square ->
// triangle -> circle (turning orange-red), then M slams in from the left, R from above, F from
// below, so the circle reads as the O; flash, shake and a pulse on the last hit; a rule draws
// under the wordmark; hold with a slow push. Letter shapes are the real ones from brand-morf/logo.svg.
// The entry file sets only the canvas and the sounds, then calls buildPieceTimeline().
(function () {
  "use strict";

  var T = { drop: 0.1, land: 0.42, m1: 0.55, m2: 0.85, m3: 1.1, M: 1.5, R: 1.8, F: 2.1, rule: 2.4, total: 4.0 };

  function chars(el) { el.innerHTML = Array.from(el.textContent).map(function (c) { return '<span class="c">' + c + "</span>"; }).join(""); return Array.prototype.slice.call(el.querySelectorAll(".c")); }

  // Morphing: every form is the same 48-point polygon (rays cast from the centre), so clip-path can
  // blend from any form to any other.
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
  function clip(a, b, t) {
    return "polygon(" + a.map(function (p, i) { return (p[0] + (b[i][0] - p[0]) * t).toFixed(2) + "% " + (p[1] + (b[i][1] - p[1]) * t).toFixed(2) + "%"; }).join(", ") + ")";
  }
  var FORM = {
    square: poly([[-1, -1], [1, -1], [1, 1], [-1, 1]]),
    triangle: poly([[0, -1], [1, 0.85], [-1, 0.85]]),
    circle: poly(null),
  };

  window.buildPieceTimeline = function () {
    var root = document.getElementById("root");
    var $ = function (q) { return root.querySelector(q); };
    var tl = gsap.timeline({ paused: true });

    $("#eyebrow").textContent = "06 / LOGO STING";
    var eyebrow = chars($("#eyebrow"));
    var hero = $("#hero"), wm = $("#wm"), cam = $("#cam");
    var lM = $("#lM"), lR = $("#lR"), lF = $("#lF");

    gsap.set(eyebrow, { opacity: 0 });
    gsap.set("#topline, #botline, #rule", { scaleX: 0 });
    gsap.set([lM, lR, lF], { opacity: 0 });
    gsap.set(hero, { y: -900, clipPath: clip(FORM.square, FORM.square, 0), rotation: 0, scaleX: 1, scaleY: 1, backgroundColor: "#0D0D0D" });

    function shake(t, amp) {
      [[amp, -amp * 0.6], [-amp * 0.8, amp * 0.5], [amp * 0.4, -amp * 0.3], [0, 0]].forEach(function (p, i) { tl.set(cam, { x: p[0], y: p[1] }, t + i * 0.04); });
    }
    function flash(t, d) { tl.set("#flash", { opacity: 1 }, t).set("#flash", { opacity: 0 }, t + (d || 0.1)); }

    // Frame.
    tl.to("#topline", { scaleX: 1, duration: 0.3, ease: "power4.out" }, 0.05);
    tl.to("#botline", { scaleX: 1, duration: 0.4, ease: "power4.out" }, 0.1);
    eyebrow.forEach(function (ch, i) { tl.set(ch, { opacity: 1 }, 0.1 + i * 0.03); });

    // 1. The square drops where the O will be, squashes, shakes the frame.
    tl.to(hero, { y: 0, duration: T.land - T.drop, ease: "power3.in" }, T.drop);
    tl.to(hero, { scaleY: 0.78, scaleX: 1.16, duration: 0.05, ease: "power2.out" }, T.land);
    tl.to(hero, { scaleY: 1, scaleX: 1, duration: 0.2, ease: "back.out(3)" }, T.land + 0.05);
    shake(T.land, 14);

    // 2. Morph chain: square -> triangle -> circle, turning orange-red; a click on each.
    var m = { t: 0 };
    function morph(from, to, t, dur, rot) {
      tl.fromTo(m, { t: 0 }, { t: 1, duration: dur, ease: "back.out(1.8)", immediateRender: false, onUpdate: function () { hero.style.clipPath = clip(from, to, m.t); } }, t);
      tl.to(hero, { rotation: rot, duration: dur, ease: "back.out(1.4)" }, t);
    }
    morph(FORM.square, FORM.triangle, T.m1, 0.25, 120);
    morph(FORM.triangle, FORM.square, T.m2, 0.25, 240);
    morph(FORM.square, FORM.circle, T.m3, 0.3, 360);
    tl.to(hero, { backgroundColor: "#FF3D00", duration: 0.12 }, T.m3);
    // Once it is a circle, swap the polygon for a true circle so edges are clean.
    tl.set(hero, { clipPath: "none", borderRadius: "50%" }, T.m3 + 0.36);

    // 3. Letters slam in around the O: M from the left, R from above, F from below.
    tl.set(lM, { opacity: 1, x: -1500 }, T.M - 0.25);
    tl.fromTo(lM, { x: -1500 }, { x: 0, duration: 0.25, ease: "expo.out", immediateRender: false }, T.M - 0.25);
    shake(T.M, 8);
    tl.set(lR, { opacity: 1 }, T.R - 0.25);
    tl.fromTo(lR, { y: -900 }, { y: 0, duration: 0.25, ease: "expo.out", immediateRender: false }, T.R - 0.25);
    shake(T.R, 8);
    tl.set(lF, { opacity: 1 }, T.F - 0.25);
    tl.fromTo(lF, { y: 900 }, { y: 0, duration: 0.25, ease: "expo.out", immediateRender: false }, T.F - 0.25);
    // The last hit: flash, shake, the circle pulses.
    flash(T.F, 0.09); shake(T.F, 18);
    tl.fromTo(hero, { scale: 1 }, { scale: 1.12, duration: 0.08, ease: "power2.out", immediateRender: false }, T.F);
    tl.to(hero, { scale: 1, duration: 0.3, ease: "back.out(3)" }, T.F + 0.08);

    // 4. A rule draws under the wordmark; the whole mark keeps a slow push during the hold.
    tl.to("#rule", { scaleX: 1, duration: 0.5, ease: "power3.out" }, T.rule);
    tl.fromTo(wm, { scale: 1 }, { scale: 1.035, duration: T.total - T.F - 0.1, ease: "sine.inOut", immediateRender: false }, T.F + 0.1);
    tl.set({}, {}, T.total);
    return tl;
  };
})();
