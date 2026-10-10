// ex-overlay: graphics over a talking head. The clip (not included: use your own) is a 15 s talking head where the speaker
// says: "So here's the scoreboard. GPT image 2.5 won five of the seven jobs. The bedroom, the family
// room, the amp photo, the print ad and the poster. Nano Banano took the infographic and the house
// front was a split." Every graphic lands on its word. Times are seconds into the clip.
// MORF look; the words on the graphics are the speaker's words. The entry file sets the canvas (and the
// footage, in the preview); this builds the graphics and the timeline.
(function () {
  "use strict";

  // Word times from the transcript (clip time = recording time - 425.0).
  var W = { gpt: 1.71, five: 3.87, seven: 4.35, jobs: 4.75, bedroom: 5.55, family: 6.35, amp: 7.23, print: 8.27, poster: 9.23, nano: 9.95, info: 11.79, house: 12.99, split: 13.87, end: 15 };
  var X = 1130;   // the column to the right of his head where graphics sit

  window.buildPieceTimeline = function () {
    var root = document.getElementById("root"), cam = document.getElementById("cam");
    var tl = gsap.timeline({ paused: true });
    function plate(cls, text, x, y) {
      var d = document.createElement("div"); d.className = "plate " + cls; d.textContent = text;
      d.style.left = x + "px"; d.style.top = y + "px"; cam.appendChild(d); gsap.set(d, { opacity: 0 }); return d;
    }
    // Enters: a plate stamps in (grows from its left edge) and leaves by wiping to the right.
    function stamp(el, t) {
      tl.set(el, { opacity: 1 }, t);
      tl.fromTo(el, { scaleX: 0.02 }, { scaleX: 1, duration: 0.16, ease: "expo.out", immediateRender: false }, t);
    }
    function slideIn(el, t, from) {
      tl.set(el, { opacity: 1 }, t);
      tl.fromTo(el, { x: from }, { x: 0, duration: 0.3, ease: "power4.out", immediateRender: false }, t);
    }
    function out(el, t, dx) { tl.to(el, { x: dx, duration: 0.18, ease: "power3.in" }, t); tl.set(el, { opacity: 0 }, t + 0.19); }

    // 1. Name bar (lower left), slides in from the left edge, leaves before the next graphic.
    var name = plate("name", "YOUR NAME", 96, 790);
    slideIn(name, 0.1, -700);
    out(name, 1.4, -700);

    // 2. Keyword callout on "GPT image 2.5" (upper right).
    var gpt = plate("call", "GPT IMAGE 2.5", X, 150);
    stamp(gpt, W.gpt);
    out(gpt, 3.4, 900);

    // 3. Stat: a ring fills to 5 of 7 as he says it.
    var disc = document.getElementById("disc"), ringsvg = document.getElementById("ringsvg"), num = document.getElementById("ringnum");
    var R = 140, C = 2 * Math.PI * R;
    ringsvg.innerHTML =
      '<circle cx="170" cy="170" r="' + R + '" fill="none" stroke="#E4E0D6" stroke-width="40"/>' +
      '<circle id="arc" cx="170" cy="170" r="' + R + '" fill="none" stroke="#FF3D00" stroke-width="40" transform="rotate(-90 170 170)" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/>';
    var arc = document.getElementById("arc");
    num.textContent = "";
    var jobs = plate("chip", "JOBS WON", X + 120, 664);
    gsap.set([disc, ringsvg, num], { opacity: 0 });
    tl.set([disc, ringsvg, num], { opacity: 1 }, 3.6);
    tl.fromTo(disc, { scale: 0.2 }, { scale: 1, duration: 0.25, ease: "back.out(2)", immediateRender: false }, 3.6);
    tl.fromTo(ringsvg, { scale: 0.2 }, { scale: 1, duration: 0.25, ease: "back.out(2)", immediateRender: false }, 3.6);
    var prog = { v: 0 };
    tl.to(prog, { v: 5 / 7, duration: 0.9, ease: "power2.out", onUpdate: function () { arc.setAttribute("stroke-dashoffset", C * (1 - prog.v)); } }, W.five - 0.05);
    // The number is set from the time, so it is right whichever frame is shown.
    var clock = { v: 0 };
    tl.to(clock, { v: 1, duration: 1.7, ease: "none", onUpdate: function () {
      var t = tl.time();
      num.textContent = t < W.five ? "" : t < W.five + 0.2 ? "5" : t < W.seven ? "5/" : "5/7";
    } }, 3.6);
    stamp(jobs, W.jobs);
    tl.to([disc, ringsvg, num, jobs], { x: 700, duration: 0.2, ease: "power3.in" }, 5.25);
    tl.set([disc, ringsvg, num, jobs], { opacity: 0 }, 5.46);

    // 4. The five jobs: each chip lands on its word, in a stack.
    var jobList = [["BEDROOM", W.bedroom], ["FAMILY ROOM", W.family], ["AMP PHOTO", W.amp], ["PRINT AD", W.print], ["POSTER", W.poster]];
    var chips = jobList.map(function (j, i) { var c = plate("chip", j[0], X, 150 + i * 104); stamp(c, j[1]); return c; });
    chips.forEach(function (c, i) { out(c, 9.75 + i * 0.03, 900); });

    // 5. Close: "Nano Banano took the infographic and the house front was a split."
    var nano = plate("call hot", "NANO BANANA", X, 150);
    stamp(nano, W.nano);
    var info = plate("chip", "INFOGRAPHIC", X, 280);
    stamp(info, W.info);
    var house = plate("chip", "HOUSE FRONT", X, 390);
    stamp(house, W.house);
    var split = plate("chip hot", "SPLIT", X, 500);
    stamp(split, W.split);
    [nano, info, house, split].forEach(function (e, i) { out(e, 14.6 + i * 0.03, 900); });

    tl.set({}, {}, W.end);
    return tl;
  };
})();
