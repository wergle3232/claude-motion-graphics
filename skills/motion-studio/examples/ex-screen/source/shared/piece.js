// ex-screen: a made-up MORF Studio window slams in, tilts in 3D, the camera zooms into the RENDER
// button, a callout "ONE CLICK" is pinned to it, the camera pulls back while the timeline renders.
// 9.0 s. (MORF brand; the screen is drawn, not a real product.)
// The entry file sets only the canvas and the sounds, then calls buildPieceTimeline().
(function () {
  "use strict";

  var T = { slam: 0.0, tilt: 0.5, zoom: 2.3, cursor: 3.1, click: 3.85, back: 4.2, fill: 4.6, done: 5.6, grab: 6.0, resize: 6.2, stamp2: 7.45, total: 9.0 };
  var W = 1200, H = 680;           // the screen's size; its centre sits at the frame centre (960, 540)
  var BTN = { x: 1064, y: 44 };    // the RENDER button's centre, in the screen's own coordinates
  var FINAL = { s: 0.78, cx: 618, cy: 600 };  // pulled-back state: scale and where the screen's centre ends up

  function chars(el) { el.innerHTML = Array.from(el.textContent).map(function (c) { return '<span class="c">' + c + "</span>"; }).join(""); return Array.prototype.slice.call(el.querySelectorAll(".c")); }
  // Where the screen must go (x, y offsets from its resting place) to put its point (px, py) at frame point (fx, fy) at scale s.
  function aim(s, px, py, fx, fy) { return { x: fx - 960 - (px - W / 2) * s, y: fy - 540 - (py - H / 2) * s }; }

  window.buildPieceTimeline = function () {
    var root = document.getElementById("root");
    var $ = function (q) { return root.querySelector(q); };
    var tl = gsap.timeline({ paused: true });

    $("#eyebrow").textContent = "04 / SCREENS";
    var eyebrow = chars($("#eyebrow"));
    $("#btn").textContent = "RENDER";
    $("#cblock2").textContent = "RESPONSIVE";

    // Screen furniture drawn from data (all plain shapes, nothing to read).
    var scr = $("#screen"), layers = $("#layers"), tlEl = $("#tl"), topbar = $("#topbar");
    var tabs = [];
    [24, 150, 276].forEach(function (x) { var d = document.createElement("div"); d.className = "tab"; d.style.left = x + 180 + "px"; topbar.appendChild(d); tabs.push(d); });
    var bars = [];
    [[180, 0], [140, 0], [200, 1], [120, 0], [160, 0]].forEach(function (r, i) {
      var d = document.createElement("div"); d.className = "row" + (r[1] ? " hot" : ""); d.style.top = 28 + i * 64 + "px"; d.style.width = r[0] + "px"; layers.appendChild(d);
    });
    [[40, [[0, 200], [230, 150], [410, 300], [740, 180]]], [80, [[0, 120], [150, 280], [470, 200], [710, 260]]], [120, [[0, 300], [330, 100], [470, 320], [830, 200]]]].forEach(function (t) {
      t[1].forEach(function (b) { var d = document.createElement("div"); d.className = "bar"; tlEl.appendChild(d); bars.push({ el: d, t: t[0], l: b[0], w: b[1] }); });
    });

    var cam = $("#cam"), cblock2 = $("#cblock2"), cursor = $("#cursor"), btn = $("#btn");
    var pvEl = $("#preview"), pvsq = $("#pvsq"), pvci = $("#pvci"), progEl = $("#prog"), fillEl = $("#fill"), headEl = $("#playhead");

    // Responsive layout: the window's contents are laid out from its width and height, so resizing
    // the window reflows them (sidebar collapses, tabs drop, shapes stack, timeline tightens).
    var S = { w: 1200, h: 680, p: 0 };
    function lerp(a, b, t) { return a + (b - a) * t; }
    function layout() {
      var w = S.w, h = S.h, iw = w - 16, ih = h - 16;
      var t = Math.min(1, Math.max(0, (1200 - w) / 680)), tt = t * t * (3 - 2 * t);
      scr.style.left = 360 + (1200 - w) / 2 + "px"; scr.style.top = 200 + (680 - h) / 2 + "px"; scr.style.width = w + "px"; scr.style.height = h + "px";
      topbar.style.width = iw + "px";
      tabs.forEach(function (d) { d.style.opacity = Math.max(0, 1 - tt * 3); });
      btn.style.width = lerp(200, 150, tt) + "px"; btn.style.right = lerp(28, 14, tt) + "px";
      var tlH = lerp(160, 120, tt), lw = 250 * (1 - Math.min(1, tt * 1.6));
      layers.style.width = lw + "px"; layers.style.height = ih - 80 - tlH + "px"; layers.style.borderRightWidth = lw > 10 ? "8px" : "0px";
      var pw = iw - lw, ph = ih - 80 - tlH, sz = lerp(190, 150, tt);
      pvEl.style.left = lw + "px"; pvEl.style.width = pw + "px"; pvEl.style.height = ph + "px";
      pvsq.style.width = pvsq.style.height = pvci.style.width = pvci.style.height = sz + "px";
      pvsq.style.left = lerp(pw * 0.3, pw * 0.5, tt) - sz / 2 + "px"; pvsq.style.top = lerp(ph * 0.5, ph * 0.28, tt) - sz / 2 + "px";
      pvci.style.left = lerp(pw * 0.68, pw * 0.5, tt) - sz / 2 + "px"; pvci.style.top = lerp(ph * 0.5, ph * 0.72, tt) - sz / 2 + "px";
      tlEl.style.top = ih - tlH + "px"; tlEl.style.width = iw + "px"; tlEl.style.height = tlH + "px";
      progEl.style.width = fillEl.style.width = iw - 48 + "px";
      gsap.set(fillEl, { scaleX: S.p });
      headEl.style.left = 24 + S.p * (iw - 48 - 8) + "px"; headEl.style.height = tlH - 8 + "px";
      var k = (iw - 48) / 1136;
      bars.forEach(function (b) { b.el.style.top = b.t * (1 - 0.3 * tt) + "px"; b.el.style.left = 24 + b.l * k + "px"; b.el.style.width = b.w * k + "px"; });
    }
    layout();

    // Starting state.
    gsap.set(eyebrow, { opacity: 0 });
    gsap.set("#topline, #botline", { scaleX: 0 });
    gsap.set(scr, { transformPerspective: 1700, transformOrigin: "50% 50%", scale: 2.1, rotationY: 0, rotationX: 0, rotationZ: 0, x: 0, y: 0 });
    gsap.set("#fill", { scaleX: 0 });
    gsap.set([cblock2, cursor], { opacity: 0 });
    gsap.set(cursor, { x: 1100, y: 800 });

    function shake(t, amp) {
      [[amp, -amp * 0.6], [-amp * 0.8, amp * 0.5], [amp * 0.4, -amp * 0.3], [0, 0]].forEach(function (p, i) { tl.set(cam, { x: p[0], y: p[1] }, t + i * 0.04); });
    }
    function flash(t, d) { tl.set("#flash", { opacity: 1 }, t).set("#flash", { opacity: 0 }, t + (d || 0.1)); }

    // Frame: rules sweep; the label types in once the screen has stepped back.
    tl.to("#topline", { scaleX: 1, duration: 0.3, ease: "power4.out" }, 0.1);
    tl.to("#botline", { scaleX: 1, duration: 0.4, ease: "power4.out" }, 0.15);
    eyebrow.forEach(function (ch, i) { tl.set(ch, { opacity: 1 }, 1.0 + i * 0.03); });

    // 1. Slam: the screen drops in huge and flat, squashes, settles.
    tl.fromTo(scr, { scale: 2.6 }, { scale: 1.55, duration: 0.28, ease: "expo.out", immediateRender: false }, T.slam);
    flash(T.slam + 0.05, 0.08); shake(T.slam + 0.05, 16);

    // 2. Tilt: pull back and swing into a steep 3D angle; then a slow drift.
    tl.to(scr, { scale: 1.05, rotationY: -32, rotationX: 10, rotationZ: -3, x: 40, y: 10, duration: 1.2, ease: "power3.inOut" }, T.tilt);
    tl.to(scr, { rotationY: -24, rotationX: 7, x: 80, duration: 0.6, ease: "sine.inOut" }, T.tilt + 1.2);

    // 3. Zoom into the RENDER button (the button ends at frame point (640, 540)).
    var z = aim(3, BTN.x, BTN.y, 640, 540);
    tl.to(scr, { scale: 3, rotationY: 0, rotationX: 0, rotationZ: 0, x: z.x, y: z.y, duration: 0.8, ease: "power4.inOut" }, T.zoom);

    // 4. A cursor comes in and clicks the button.
    tl.set(cursor, { opacity: 1 }, T.cursor);
    tl.fromTo(cursor, { x: 1000, y: 760 }, { x: 650, y: 560, duration: 0.7, ease: "power3.out", immediateRender: false }, T.cursor);
    tl.to(cursor, { scale: 0.86, duration: 0.06 }, T.click - 0.06);
    tl.to(cursor, { scale: 1, duration: 0.12 }, T.click);
    tl.to(btn, { scale: 0.9, duration: 0.06, ease: "power2.in" }, T.click - 0.06);
    tl.to(btn, { scale: 1.12, duration: 0.12, ease: "power2.out" }, T.click);
    tl.to(btn, { scale: 1, duration: 0.2, ease: "power2.inOut" }, T.click + 0.12);
    flash(T.click, 0.06);
    tl.set(cursor, { opacity: 0 }, T.click + 0.3);

    // 5. Pull back; the timeline renders; a hit on complete.
    var f = aim(FINAL.s, BTN.x, BTN.y, 0, 0);
    // The screen's centre ends at (FINAL.cx, FINAL.cy): x, y are offsets of its centre from the frame centre.
    tl.to(scr, { scale: FINAL.s, x: FINAL.cx - 960, y: FINAL.cy - 540, duration: 0.8, ease: "power3.inOut" }, T.back);
    tl.to(S, { p: 1, duration: T.done - T.fill, ease: "power1.inOut", onUpdate: layout }, T.fill);
    flash(T.done, 0.08); shake(T.done, 10);

    // 6. Responsive: a cursor grabs the window's right edge and drags it down to phone width;
    //    the layout reflows as it goes, and the window grows a little so the phone reads.
    tl.set(cursor, { x: 0, y: 0, scale: 1 }, T.grab - 0.05);
    tl.set(cursor, { opacity: 1 }, T.grab);
    tl.to(cursor, { scale: 0.86, duration: 0.06 }, T.resize - 0.08);
    tl.to(S, { w: 380, h: 700, duration: 1.2, ease: "power3.inOut", onUpdate: layout }, T.resize);
    tl.to(scr, { scale: 0.95, duration: 1.2, ease: "power3.inOut" }, T.resize);
    tl.to(cursor, { scale: 1, duration: 0.12 }, T.resize + 1.25);
    tl.set(cursor, { opacity: 0 }, T.resize + 1.5);
    tl.set(cblock2, { opacity: 1 }, T.stamp2);
    tl.fromTo(cblock2, { scaleX: 0.01 }, { scaleX: 1, duration: 0.2, ease: "expo.out", immediateRender: false }, T.stamp2);
    flash(T.stamp2, 0.06);

    // A ticker re-pins things that must follow the window: the cursor while it drags the edge, and the RESPONSIVE label beside the window.
    var pin = { v: 0 };
    tl.to(pin, {
      v: 1, duration: T.total - T.grab, ease: "none",
      onUpdate: function () {
        var t = tl.time(), rr = root.getBoundingClientRect(), sr = scr.getBoundingClientRect();
        cblock2.style.left = sr.right - rr.left + 110 + "px"; cblock2.style.top = sr.top - rr.top + sr.height / 2 - 56 + "px";
        if (t >= T.grab && t <= T.resize + 1.55) { cursor.style.left = sr.right - rr.left - 6 + "px"; cursor.style.top = sr.top - rr.top + sr.height / 2 + "px"; }
        else { cursor.style.left = "0px"; cursor.style.top = "0px"; }
      }
    }, T.grab);
    tl.set({}, {}, T.total);
    return tl;
  };
})();
