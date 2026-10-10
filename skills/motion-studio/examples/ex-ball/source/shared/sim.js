// ex-ball: the bouncing ball, worked out as a little physics model so every frame is a pure
// function of time (seek-safe). Shared by piece.js and by the script that prints the sound
// cue times. Units: pixels and seconds. "bottom" is the y of the ball's lowest point.
(function (root) {
  "use strict";

  var G = 840;          // the ground: y where the ball's bottom touches
  var R = 75;           // ball radius (150 px ball)
  var X0 = 740, VX = 275; // where it drops from, and its sideways speed
  var FALL = 0.6;       // seconds for the first drop
  var H0 = G - (-90 + R); // drop height: ball centre starts at y -90, just above the frame
  var GRAV = 2 * H0 / (FALL * FALL);
  var V1 = GRAV * FALL; // speed at the first landing
  var E = 0.7;          // how much speed survives each bounce (heights about halve)
  var STOP = 300;       // stop bouncing below this speed
  var ROLL = 0.4;       // seconds it rolls to a stop after the last bounce
  var STRETCH = 0.25, SQUASH = 0.42, DWELL = 0.07;

  // Segments: the drop, then contact / air pairs, then rest.
  var segs = [{ type: "fall", t0: 0, dur: FALL }];
  var t = FALL, vin = V1, contacts = [], apexes = [];
  while (true) {
    var vout = E * vin, d = DWELL * Math.sqrt(vin / V1);
    segs.push({ type: "contact", t0: t, dur: d, vin: vin, vout: vout });
    contacts.push({ t: t, v: vin / V1 });
    t += d;
    if (vout < STOP) break;
    var air = 2 * vout / GRAV;
    segs.push({ type: "air", t0: t, dur: air, vu: vout });
    apexes.push({ t: t + vout / GRAV, h: vout * vout / (2 * GRAV) });
    t += air;
    vin = vout;
  }
  var REST = t, END = REST + ROLL;

  function xAt(s) {
    if (s <= REST) return X0 + VX * s;
    var tau = Math.min(s - REST, ROLL), a = VX / ROLL;
    return X0 + VX * REST + VX * tau - 0.5 * a * tau * tau;
  }

  // State of the ball at sim time s: x, bottom, scale x/y, height above the ground.
  function at(s) {
    var x = xAt(s);
    if (s <= 0) return { x: x, bottom: G - H0, sx: 1, sy: 1, hgt: H0 };
    for (var i = 0; i < segs.length; i++) {
      var g = segs[i], tau = s - g.t0;
      if (tau < 0 || tau >= g.dur) continue;
      if (g.type === "fall" || g.type === "air") {
        var hgt = g.type === "fall" ? H0 - 0.5 * GRAV * tau * tau : g.vu * tau - 0.5 * GRAV * tau * tau;
        var vy = g.type === "fall" ? GRAV * tau : g.vu - GRAV * tau;
        var st = STRETCH * Math.pow(Math.abs(vy) / V1, 2);
        return { x: x, bottom: G - Math.max(0, hgt), sx: 1 - 0.45 * st, sy: 1 + st, hgt: Math.max(0, hgt) };
      }
      var u = tau / g.dur, a = SQUASH * g.vin / V1;
      var sq = a * Math.sin(Math.PI * u);
      var pre = STRETCH * Math.pow(g.vin / V1, 2) * Math.max(0, 1 - u / 0.25);
      var post = g.vout < STOP ? 0 : STRETCH * Math.pow(g.vout / V1, 2) * Math.max(0, (u - 0.75) / 0.25);
      return { x: x, bottom: G, sx: 1 + 0.9 * sq - 0.45 * (pre + post), sy: 1 - sq + pre + post, hgt: 0 };
    }
    return { x: x, bottom: G, sx: 1, sy: 1, hgt: 0 };
  }

  // Part 2 plays the same drop in slow motion. Piece time (from the start of part 2) to sim
  // time, as straight pieces: quick while the ball is above the frame, slowest at the first
  // landing, then speeding back up to real time.
  var KNOTS = [[0, 0], [0.3, 0.22], [1.7, 0.56], [2.7, 0.72], [3.9, 1.6], [4.8, 2.35]];
  function slowSim(p) {
    if (p <= 0) return 0;
    for (var i = 1; i < KNOTS.length; i++) {
      var a = KNOTS[i - 1], b = KNOTS[i];
      if (p <= b[0]) return a[1] + (b[1] - a[1]) * (p - a[0]) / (b[0] - a[0]);
    }
    var last = KNOTS[KNOTS.length - 1];
    return Math.min(END, last[1] + (p - last[0]));
  }
  function slowPiece(s) {
    for (var i = 1; i < KNOTS.length; i++) {
      var a = KNOTS[i - 1], b = KNOTS[i];
      if (s <= b[1]) return a[0] + (b[0] - a[0]) * (s - a[1]) / (b[1] - a[1]);
    }
    var last = KNOTS[KNOTS.length - 1];
    return last[0] + (s - last[1]);
  }

  // The piece's own clock.
  var T = {};
  T.p1End = END + 0.35;            // part 1: real time, then a short hold at rest
  T.p2 = T.p1End + 0.3;            // the ball pops out, the label changes, part 2 starts
  T.p2End = T.p2 + slowPiece(END); // part 2 has played the whole drop
  T.clear = T.p2End + 1.5;         // hold the finished diagram
  T.total = Math.round((T.clear + 0.55) * 10) / 10; // clear back to the empty first frame

  root.BallSim = { G: G, R: R, H0: H0, END: END, REST: REST, at: at, contacts: contacts, apexes: apexes, segs: segs, slowSim: slowSim, slowPiece: slowPiece, T: T };
})(typeof window !== "undefined" ? window : globalThis);
