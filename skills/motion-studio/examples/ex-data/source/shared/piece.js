// ex-data: three counters, one after another, 7.5 s. A big number counts up and lands; a bar chart
// builds; a ring fills. Each one docks into a slot along the bottom, so the end is a three-part
// dashboard. All numbers are made up (MORF is a made-up brand).
// The entry file sets only the canvas and the sounds, then calls buildPieceTimeline().
(function () {
  "use strict";

  var T = { b1: 0.3, land1: 1.4, dock1: 1.95, b2: 2.3, land2: 3.4, dock2: 3.95, b3: 4.3, land3: 5.5, dock3: 6.05, pulse: 6.5, total: 7.5 };
  var DOCK_Y = 706, DOCK_H = 134, SLOT_W = 576, SLOT_X0 = 96, CHIP_Y = 856;

  function chars(el) { el.innerHTML = Array.from(el.textContent).map(function (c) { return '<span class="c">' + c + "</span>"; }).join(""); return Array.prototype.slice.call(el.querySelectorAll(".c")); }
  // Numbers are set digit by digit in fixed-width cells so they never jitter while counting.
  function setNum(el, text) {
    el.innerHTML = Array.from(text).map(function (c) {
      var k = c === "," ? "cm" : c === "%" ? "pc" : "dg";
      return '<span class="d ' + k + '">' + c + "</span>";
    }).join("");
  }
  function fmt(n) { var s = String(Math.round(n)); return s.length > 3 ? s.slice(0, s.length - 3) + "," + s.slice(-3) : s; }

  window.buildPieceTimeline = function () {
    var root = document.getElementById("root");
    var $ = function (q) { return root.querySelector(q); };
    var tl = gsap.timeline({ paused: true });

    $("#eyebrow").textContent = "03 / DATA";
    var eyebrow = chars($("#eyebrow"));
    var n1 = $("#n1"), n3 = $("#n3"), val2 = $("#val2");
    setNum(n1, "10,000"); setNum(n3, "87%"); setNum(val2, "4,200");

    // Bar chart: five bars standing on the floor.
    var heights = [70, 120, 170, 240, 330], bars = [];
    var g2 = $("#g2");
    heights.forEach(function (h, i) {
      var b = document.createElement("div");
      b.className = "bar" + (i === 4 ? " hot" : "");
      b.style.left = 150 + i * 230 + "px"; b.style.top = 682 - h + "px"; b.style.height = h + "px";
      g2.appendChild(b); bars.push(b);
    });
    // Ring: a pale track and an orange-red arc, starting at the top.
    var R = 192, C = 2 * Math.PI * R, ringTarget = 0.87;
    $("#ringsvg").innerHTML =
      '<circle cx="220" cy="220" r="' + R + '" fill="none" stroke="#E4E0D6" stroke-width="56"/>' +
      '<circle id="arc" cx="220" cy="220" r="' + R + '" fill="none" stroke="#FF3D00" stroke-width="56" transform="rotate(-90 220 220)" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/>';
    var arc = $("#arc");

    // Chips (captions) and groups. Measure each group once, at rest with its final text, so it can
    // be scaled into its dock slot.
    var groups = ["#g1", "#g2", "#g3"].map(function (q) { return $(q); });
    var chips = [$("#chip1"), $("#chip2"), $("#chip3")];
    var CHIP_TEXT = ["VIDEOS MADE", "PER MONTH", "FIRST TRY"];
    chips.forEach(function (c, i) { c.textContent = CHIP_TEXT[i]; });
    var CHIP_POS = [[150, 580], [1330, 500], [740, 560]];   // on the stage
    var rootRect = root.getBoundingClientRect();
    // A group is a zero-size wrapper (its children are absolute), so measure the union of its children.
    function unionRect(g) {
      var l = 1e9, t = 1e9, rt = -1e9, b = -1e9;
      Array.prototype.forEach.call(g.querySelectorAll("*"), function (e) {
        if (e.closest(".d") && !e.classList.contains("d")) return;
        var q = e.getBoundingClientRect();
        if (!q.width || !q.height) return;
        l = Math.min(l, q.left); t = Math.min(t, q.top); rt = Math.max(rt, q.right); b = Math.max(b, q.bottom);
      });
      return { left: l, top: t, width: rt - l, height: b - t };
    }
    var dock = groups.map(function (g, i) {
      var r = unionRect(g);
      var rx = r.left - rootRect.left, ry = r.top - rootRect.top;
      var s = Math.min((SLOT_W - 72) / r.width, DOCK_H / r.height);
      var sx = SLOT_X0 + i * SLOT_W + 24;
      return { s: s, x: sx + ((SLOT_W - 72) - r.width * s) / 2 - rx * s, y: DOCK_Y + (DOCK_H - r.height * s) / 2 - ry * s, chipX: sx, chipY: CHIP_Y };
    });
    setNum(n1, "0"); setNum(n3, "0%"); setNum(val2, "0");

    // Starting state.
    gsap.set(eyebrow, { opacity: 0 });
    gsap.set(groups, { opacity: 0 });
    gsap.set(chips, { opacity: 0 });
    chips.forEach(function (c, i) { gsap.set(c, { x: CHIP_POS[i][0], y: CHIP_POS[i][1] }); });
    gsap.set("#topline, #floor, #botline", { scaleX: 0 });
    gsap.set(".vsep", { scaleY: 0 });
    gsap.set(bars, { scaleY: 0 });
    gsap.set("#pulse", { opacity: 0, x: 96 });
    gsap.set(val2, { opacity: 0 });

    function shake(t, amp) {
      var d = [[amp, -amp * 0.6], [-amp * 0.8, amp * 0.5], [amp * 0.4, -amp * 0.3], [0, 0]];
      d.forEach(function (p, i) { tl.set("#cam", { x: p[0], y: p[1] }, t + i * 0.04); });
    }
    function flash(t) { tl.set("#flash", { opacity: 1 }, t).set("#flash", { opacity: 0 }, t + 0.1); }
    function stamp(i, t) {
      tl.set(chips[i], { opacity: 1 }, t);
      tl.fromTo(chips[i], { scale: 1.5 }, { scale: 1, duration: 0.18, ease: "expo.out", immediateRender: false }, t);
    }
    function doDock(i, t) {
      var d = dock[i];
      tl.to(groups[i], { x: d.x, y: d.y, scale: d.s, duration: 0.3, ease: "power3.inOut" }, t);
      tl.to(chips[i], { x: d.chipX, y: d.chipY, duration: 0.3, ease: "power3.inOut" }, t);
    }

    // Frame: label types in, rules sweep.
    eyebrow.forEach(function (ch, i) { tl.set(ch, { opacity: 1 }, 0.1 + i * 0.03); });
    tl.to("#topline", { scaleX: 1, duration: 0.3, ease: "power4.out" }, 0);
    tl.to("#floor", { scaleX: 1, duration: 0.4, ease: "power4.out" }, 0.1);
    tl.to("#botline", { scaleX: 1, duration: 0.4, ease: "power4.out" }, 0.15);
    tl.to(".vsep", { scaleY: 1, duration: 0.25, ease: "power3.out", stagger: 0.08 }, T.dock1);

    // 1. Count-up: 0 to 10,000, lands hard.
    tl.set(groups[0], { opacity: 1 }, T.b1);
    var c1 = { v: 0 };
    tl.to(c1, { v: 10000, duration: T.land1 - T.b1, ease: "power2.out", onUpdate: function () { setNum(n1, fmt(c1.v)); } }, T.b1);
    tl.fromTo(n1, { scaleY: 1 }, { scaleY: 0.86, duration: 0.07, ease: "power2.in", immediateRender: false }, T.land1);
    tl.to(n1, { scaleY: 1, duration: 0.22, ease: "back.out(3)" }, T.land1 + 0.07);
    flash(T.land1); shake(T.land1, 14);
    stamp(0, T.land1 + 0.15);
    doDock(0, T.dock1);

    // 2. Bar chart: bars grow one by one; the last is orange-red and tallest; its value counts up.
    tl.set(groups[1], { opacity: 1 }, T.b2);
    bars.forEach(function (b, i) {
      if (i < 4) tl.to(b, { scaleY: 1, duration: 0.32, ease: "back.out(1.6)" }, T.b2 + i * 0.2);
    });
    var tLast = T.b2 + 4 * 0.2;
    tl.set(val2, { opacity: 1 }, tLast);
    tl.to(bars[4], {
      scaleY: 1, duration: T.land2 - tLast, ease: "power3.out",
      onUpdate: function () {
        var s = gsap.getProperty(bars[4], "scaleY");
        setNum(val2, fmt(4200 * s));
        gsap.set(val2, { y: 330 * (1 - s) });
      }
    }, tLast);
    flash(T.land2); shake(T.land2, 10);
    tl.fromTo(bars[4], { scaleX: 1.2 }, { scaleX: 1, duration: 0.25, ease: "back.out(3)", immediateRender: false }, T.land2);
    stamp(1, T.land2 + 0.15);
    doDock(1, T.dock2);

    // 3. Progress ring: sweeps to 87%, the number counts beside it.
    tl.set(groups[2], { opacity: 1 }, T.b3);
    var c3 = { v: 0 };
    tl.to(c3, {
      v: 87, duration: T.land3 - T.b3, ease: "power2.inOut",
      onUpdate: function () { setNum(n3, Math.round(c3.v) + "%"); arc.setAttribute("stroke-dashoffset", C * (1 - ringTarget * c3.v / 87)); }
    }, T.b3);
    flash(T.land3); shake(T.land3, 14);
    tl.fromTo(n3, { scale: 1.12 }, { scale: 1, duration: 0.25, ease: "back.out(3)", immediateRender: false }, T.land3);
    stamp(2, T.land3 + 0.15);
    doDock(2, T.dock3);

    // Finish: an orange-red pulse runs along the rule, the dashboard holds, then a hard cut.
    tl.set("#pulse", { opacity: 1 }, T.pulse);
    tl.fromTo("#pulse", { x: 96 }, { x: 1824 - 220, duration: 0.55, ease: "power2.inOut", immediateRender: false }, T.pulse);
    tl.set("#pulse", { opacity: 0 }, T.pulse + 0.56);
    tl.set({}, {}, T.total);
    return tl;
  };
})();
