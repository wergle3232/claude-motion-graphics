// ex-ball (the ball reel): a ball dropped once in real time, then the same drop in slow
// motion with ghost copies tracing its path and callouts naming what an animator has to
// get right: FALLS FASTER, STRETCH, SQUASH, LOWER EACH TIME, SHADOW. Then it clears back
// to the first frame so it loops. (MORF brand.)
// Every frame is drawn by render(t), a pure function of the piece time (seek-safe).
// The bounce itself is the model in sim.js.
(function () {
  "use strict";

  var B = window.BallSim, T = B.T, G = B.G, R = B.R;
  var GHOST_STEP = 1 / 12;           // one ghost per twelfth of a second of the drop
  var GHOST_END = B.contacts[3].t;   // ghosts for the drop and the three bounces that get a tick
  var GHOST_GAP = 38;                // skip a ghost this close to the last one (keeps the tops of the bounces readable)
  var tOf = function (s) { return T.p2 + B.slowPiece(s); };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function prog(t, t0, d) { return clamp((t - t0) / d, 0, 1); }
  function expoOut(u) { return u >= 1 ? 1 : 1 - Math.pow(2, -10 * u); }
  function backIn(u) { var c = 1.70158; return (c + 1) * u * u * u - c * u * u; }
  function backOut(u) { var c = 2.2; u -= 1; return 1 + (c + 1) * u * u * u + c * u * u; }
  function chars(el, lines) {
    el.innerHTML = lines.map(function (l) { return "<div>" + Array.from(l).map(function (c) { return '<span class="c">' + c + "</span>"; }).join("") + "</div>"; }).join("");
    return Array.prototype.slice.call(el.querySelectorAll(".c"));
  }
  // Show the first n characters.
  function showN(list, n) { for (var i = 0; i < list.length; i++) list[i].style.opacity = i < n ? 1 : 0; }

  window.buildPieceTimeline = function () {
    var root = document.getElementById("root");
    var $ = function (q) { return root.querySelector(q); };
    var vars = (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {};
    var overlay = vars.mode === "overlay";
    if (overlay) { root.classList.add("overlay"); document.documentElement.classList.add("overlay"); }

    var ball = $("#ball"), shadow = $("#shadow"), svg = $("#ink");
    var eyeA = chars($("#eyeA"), ["REAL TIME"]), eyeB = chars($("#eyeB"), ["SLOW MOTION"]);

    // Ghost copies: the ball's shape at every step of the drop, laid down as the slow-motion ball passes.
    var ghosts = [], gl = $("#ghosts"), last = null;
    for (var s = GHOST_STEP; s < GHOST_END; s += GHOST_STEP) {
      var st = B.at(s);
      if (st.bottom - 2 * R * st.sy < 220) continue; // keep the top band (the label) clear
      var cy = st.bottom - R * st.sy;
      if (last && Math.hypot(st.x - last.x, cy - last.y) < GHOST_GAP) continue;
      last = { x: st.x, y: cy };
      var g = document.createElement("div");
      g.className = "ghost";
      g.style.transform = "translate(" + (st.x - R) + "px," + (st.bottom - 2 * R) + "px) scale(" + st.sx + "," + st.sy + ")";
      gl.appendChild(g);
      ghosts.push({ el: g, s: s, t: tOf(s) });
    }

    // A tick over the top of each of the first three bounces.
    var ticks = B.apexes.slice(0, 3).map(function (a) {
      var el = document.createElement("div"), x = B.at(a.t).x, top = G - a.h - 2 * R;
      el.className = "tick";
      el.style.transform = "translate(" + (x - 40) + "px," + (top - 26) + "px)";
      $("#ticks").appendChild(el);
      return { el: el, t: tOf(a.t), x: x, y: top - 22 };
    });

    // Callouts. Each: where its text sits, what its leader points at, when it appears.
    function edgeLeft(s) { var st = B.at(s); return { x: st.x - R * st.sx - 10, y: st.bottom - R * st.sy }; }
    var sqS = B.contacts[0].t + B.segs[1].dur / 2;
    var CALL = [
      { id: "FF", lines: ["FALLS", "FASTER"], x: 150, y: 360, side: "right", target: function () { return edgeLeft(0.45); }, t: tOf(0.45) - 0.05 },
      { id: "ST", lines: ["STRETCH"], x: 150, y: 580, side: "right", target: function () { return edgeLeft(0.55); }, t: tOf(0.55) - 0.05 },
      { id: "SQ", lines: ["SQUASH"], x: 150, y: 726, side: "right", target: function () { return edgeLeft(sqS); }, t: tOf(B.contacts[0].t) + 0.03 },
      { id: "LO", lines: ["LOWER", "EACH TIME"], x: 1400, y: 300, side: "left", target: function () { return { x: ticks[1].x + 48, y: ticks[1].y + 4 }; }, t: ticks[1].t + 0.12 },
      { id: "SH", lines: ["SHADOW"], x: 1350, y: 918, side: "top", target: null, t: 0 },
    ];
    CALL[4].t = CALL[3].t + 0.55;
    var NS = "http://www.w3.org/2000/svg";
    CALL.forEach(function (c) {
      var el = document.createElement("div");
      el.className = "label";
      el.style.transform = "translate(" + c.x + "px," + c.y + "px)";
      $("#labels").appendChild(el);
      c.chars = chars(el, c.lines);
      var w = el.offsetWidth, h = el.offsetHeight;
      c.anchor = c.side === "right" ? { x: c.x + w + 24, y: c.y + h / 2 } : c.side === "left" ? { x: c.x - 24, y: c.y + h - 36 } : { x: c.x + w / 2, y: c.y - 14 };
      c.line = document.createElementNS(NS, "line");
      c.dot = document.createElementNS(NS, "circle");
      c.line.setAttribute("stroke", "var(--brand-text)"); c.line.setAttribute("stroke-width", "5"); c.line.setAttribute("stroke-linecap", "square");
      c.dot.setAttribute("r", "9"); c.dot.setAttribute("fill", "var(--brand-text)");
      svg.appendChild(c.line); svg.appendChild(c.dot);
    });

    // ---- One frame.
    function render(t) {
      // Which part, and the ball's own clock.
      var s, scale = 1, slow = false;
      if (t < T.p1End) s = t;
      else if (t < T.p2) { s = B.END; scale = 1 - backIn(prog(t, T.p1End, 0.2)); }
      else if (t < T.clear + 0.05) { s = B.slowSim(t - T.p2); slow = true; }
      else { s = B.END; slow = true; scale = 1 - backIn(prog(t, T.clear + 0.05, 0.22)); }
      scale = Math.max(0, scale);

      var st = B.at(s);
      ball.style.transform = "translate(" + (st.x - R) + "px," + (st.bottom - 2 * R) + "px) scale(" + (st.sx * scale) + "," + (st.sy * scale) + ")";
      // The shadow is small and faint when the ball is high, big and dark as it lands.
      var k = clamp(st.hgt / 760, 0, 1);
      shadow.style.transform = "translate(" + (st.x - 85) + "px," + (G - 17) + "px) scale(" + ((1.1 - 0.72 * k) * scale) + ")";
      shadow.style.opacity = (0.95 * (1 - k)).toFixed(3);
      if (overlay) return;

      // The label in the top band: REAL TIME, then SLOW MOTION, then back.
      showN(eyeA, t < T.p1End ? 99 : t < T.clear + 0.2 ? Math.round(9 * (1 - prog(t, T.p1End, 0.15))) : Math.floor((t - T.clear - 0.2) / 0.035) + 1);
      showN(eyeB, t < T.p2 - 0.1 || t >= T.clear + 0.15 ? 0 : t < T.clear ? Math.floor((t - T.p2 + 0.1) / 0.035) + 1 : Math.round(11 * (1 - prog(t, T.clear, 0.15))));

      // Clearing at the end: everything leaves, newest first, before the ball goes.
      var clr = prog(t, T.clear, 0.25);
      var keep = Math.round(ghosts.length * (1 - clr));
      ghosts.forEach(function (g, i) { g.el.style.opacity = slow && t >= g.t && i < keep ? 1 : 0; });
      ticks.forEach(function (k2) {
        var u = slow ? backOut(prog(t, k2.t, 0.18)) * (1 - clr) : 0;
        k2.el.style.opacity = u > 0 ? 1 : 0;
        k2.el.style.transform = "translate(" + (k2.x - 40) + "px," + (k2.y - 4) + "px) scaleX(" + Math.max(0, u) + ")";
      });

      CALL.forEach(function (c) {
        var tg = c.target ? c.target() : { x: st.x, y: G - 8 }; // the SHADOW leader follows the shadow
        var on = slow && t >= c.t;
        var draw = on ? expoOut(prog(t, c.t, 0.28)) * (1 - clr) : 0;
        var x2 = tg.x + (c.anchor.x - tg.x) * draw, y2 = tg.y + (c.anchor.y - tg.y) * draw;
        c.line.setAttribute("x1", tg.x); c.line.setAttribute("y1", tg.y);
        c.line.setAttribute("x2", x2); c.line.setAttribute("y2", y2);
        c.line.style.opacity = draw > 0.01 ? 1 : 0;
        c.dot.setAttribute("cx", tg.x); c.dot.setAttribute("cy", tg.y);
        c.dot.setAttribute("r", (9 * backOut(on ? prog(t, c.t, 0.16) : 0) * (1 - clr)).toFixed(2));
        var n = on ? Math.floor((t - c.t - 0.16) / 0.03) + 1 : 0;
        if (clr > 0) n = Math.min(n, Math.round(c.chars.length * (1 - clr)));
        showN(c.chars, n);
      });
    }

    var tl = gsap.timeline({ paused: true });
    var clock = { t: 0 };
    tl.fromTo(clock, { t: 0 }, { t: T.total, duration: T.total, ease: "none", onUpdate: function () { render(clock.t); } }, 0);
    render(0);
    return tl;
  };
})();
