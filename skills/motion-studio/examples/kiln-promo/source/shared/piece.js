// Kiln promo: the beats, their times, the words and the motion, written once.
// Each entry file (index.html, formats/*.html) sets only the canvas and the layout,
// then calls window.buildPieceTimeline() once fonts are ready.
(function () {
  "use strict";

  // Beat times in seconds. Lengths vary on purpose; a held beat comes before the end.
  var T = { b1: 0, b2: 2.8, b3: 5.8, b4: 8.9, end: 11.6, total: 15 };

  var HEADS = {
    h1: [["Wheel 3 is double-booked. "], ["Again.", "accent"]],
    h2: [["Members book from their phone."]],
    h3: [["You see who's coming."]],
    h4: [["And who has paid."]],
  };

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  // Splits a headline into word spans so words can move on their own.
  function head(id, parts) {
    var h = el("div", { id: id, class: "head" });
    parts.forEach(function (p) {
      p[0].split(/(?<=\s)/).forEach(function (word) {
        h.appendChild(el("span", { class: "w" + (p[1] ? " " + p[1] : "") }, word));
      });
    });
    return h;
  }

  function buildDom(stage) {
    Object.keys(HEADS).forEach(function (k) { stage.appendChild(head(k, HEADS[k])); });
    var box = el("div", { class: "box", id: "box" });
    box.innerHTML =
      '<div class="card" id="sheet">' +
        '<div class="row" style="top:0"><span class="mono">W1</span><span>Maya</span></div>' +
        '<div class="row" style="top:170px"><span class="mono">W2</span><span>Leo</span></div>' +
        '<div class="row" id="row3" style="top:340px"><div class="bad"></div><span class="mono">W3</span><span>Sam, Priya</span><span class="flag">!</span></div>' +
      "</div>" +
      '<div class="card" id="phone"><div class="day disp">Saturday</div>' +
        '<div id="slot"><div class="time mono">10:00</div><div class="what">Wheel 3</div></div>' +
        '<div id="book">Book<div class="done">Booked</div></div></div>' +
      '<div id="tap"></div>' +
      '<div id="week"><div class="days mono">' + "MTWTFSS".split("").map(function (d) { return "<span>" + d + "</span>"; }).join("") + "</div>" +
        '<div class="slots"></div></div>' +
      '<div id="count"><span class="n disp">0</span><span class="of mono">/ 21</span></div>' +
      '<div id="count-label">sessions booked</div>' +
      '<div id="handoff"></div>' +
      '<div class="card" id="paid">' +
        ["Maya", "Sam", "Priya"].map(function (n, i) {
          return '<div class="prow" style="top:' + i * 200 + 'px">' + n + '<span class="chip" data-layout-allow-overlap><span class="no">Due</span><span class="yes">Paid</span></span></div>';
        }).join("") +
      "</div>";
    stage.appendChild(box);
    // 21 slots (3 rows x 7 days); 18 of them get booked, in a fixed, natural-looking order.
    var slots = box.querySelector(".slots");
    for (var i = 0; i < 21; i++) slots.appendChild(el("div", { class: "pill" }, "<i></i>"));
    var end = el("div", { id: "end" });
    end.innerHTML = '<div id="mark"><span class="l">K</span><span class="l">i</span><span class="l">l</span><span class="l">n</span><span class="dot"></span></div>' +
      '<div id="rule"></div><div id="tag">Booking for pottery studios.</div><div id="url">kilnstudio.example</div>';
    stage.appendChild(end);
  }

  // Order in which week slots fill: Saturday first (the booking just made), then the rest.
  var FILL = [19, 5, 12, 2, 20, 9, 16, 0, 13, 6, 18, 3, 10, 15, 1, 8, 4, 11];

  window.buildPieceTimeline = function () {
    var root = document.getElementById("root");
    var stage = document.getElementById("stage");
    buildDom(stage);
    var vars = (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {};
    var still = vars.mode === "storyboard";
    var $ = function (s) { return root.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    // Measure the hand-off before any tween moves things (fromTo sets its start at once).
    var box = $("#box"), boxR = box.getBoundingClientRect(), sc = boxR.width / 880 || 1;
    var rel = function (e) { var r = e.getBoundingClientRect(); return { x: (r.left - boxR.left) / sc, y: (r.top - boxR.top) / sc, w: r.width / sc, h: r.height / sc }; };
    var pills0 = $$(".pill");
    var from = rel($("#book")), to = rel(pills0[FILL[0]]);
    var tl = gsap.timeline({ paused: true });

    var h1w = $$("#h1 .w"), h2w = $$("#h2 .w"), h3w = $$("#h3 .w"), h4w = $$("#h4 .w");
    var rows = $$("#sheet .row"), pills = $$(".pill i"), chips = $$(".chip .yes");
    gsap.set(["#h2", "#h3", "#h4", "#phone", "#tap", "#week", "#count", "#count-label", "#paid", "#end"], { opacity: 0 });

    if (still) {
      // Storyboard: each beat at its most visible moment, held, with hard cuts.
      var show = function (t, on, off) { tl.set(on, { opacity: 1 }, t); if (off) tl.set(off, { opacity: 0 }, t); };
      tl.set("#row3 .bad", { opacity: 1 }, 0);
      show(T.b2, ["#h2", "#phone"], ["#h1", "#sheet"]);
      tl.set("#book .done", { opacity: 1 }, T.b2);
      show(T.b3, ["#h3", "#week", "#count", "#count-label"], ["#h2", "#phone"]);
      FILL.forEach(function (i) { tl.set(pills[i], { scaleX: 1 }, T.b3); });
      $("#count .n").textContent = "18";
      show(T.b4, ["#h4", "#paid"], ["#h3", "#week", "#count", "#count-label"]);
      tl.set(chips, { opacity: 1 }, T.b4);
      tl.set($$(".chip .no"), { opacity: 0 }, T.b4);
      show(T.end, ["#end"], ["#h4", "#paid"]);
      tl.set({}, {}, T.total);
      return tl;
    }

    // ---- Beat 1 (0 to 2.8): the hook. Something moves at once; the point reads by 1.5 s.
    tl.fromTo("#sheet", { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 0.05);
    rows.forEach(function (r, i) { tl.fromTo(r, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, 0.15 + i * 0.12); });
    tl.fromTo(h1w.slice(0, 4), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.07 }, 0.2);
    // The clash: the row flushes terracotta and the flag knocks twice.
    tl.to("#row3 .bad", { opacity: 1, duration: 0.18, ease: "power1.out" }, 0.75);
    tl.fromTo("#row3 .flag", { scale: 0 }, { scale: 1, duration: 0.3, ease: "power3.out" }, 0.75);
    tl.to("#row3", { x: 10, duration: 0.05, yoyo: true, repeat: 3, ease: "none" }, 0.95);
    tl.fromTo(h1w[4], { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }, 1.3);

    // ---- Beat 2 (2.8 to 5.8): the member books from their phone. The sheet drops away
    // as the phone rises in its place: cause, then the fix.
    tl.to("#sheet", { y: 120, rotation: -3, opacity: 0, duration: 0.3, ease: "power2.in" }, T.b2 - 0.35);
    tl.to("#h1", { y: -40, opacity: 0, duration: 0.25, ease: "power2.in" }, T.b2 - 0.3);
    tl.set("#h2", { opacity: 1 }, T.b2 + 0.15);
    tl.fromTo("#h2", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power3.inOut" }, T.b2 + 0.15);
    tl.fromTo("#phone", { y: 260, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, T.b2);
    tl.fromTo("#slot", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, T.b2 + 0.55);
    // The tap lands on the button, then the button turns green.
    var tapAt = T.b2 + 1.45;
    tl.add(function () {}, tapAt);
    tl.set("#tap", { left: 350, top: 645 }, 0);
    tl.fromTo("#tap", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" }, tapAt - 0.25);
    tl.to("#tap", { scale: 0.7, opacity: 0, duration: 0.3, ease: "power1.in" }, tapAt + 0.05);
    tl.to("#book", { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }, tapAt);
    tl.to("#book .done", { opacity: 1, duration: 0.2, ease: "power1.out" }, tapAt + 0.1);

    // ---- Beat 3 (5.8 to 8.9): the studio's week. The green button becomes Saturday's
    // first booked slot (a hand-off, not a dissolve), then the week fills.
    var b3 = T.b3;
    tl.to("#h2", { opacity: 0, y: -30, duration: 0.25, ease: "power2.in" }, b3 - 0.35);
    tl.to("#phone", { scale: 0.92, opacity: 0, duration: 0.25, ease: "power2.in" }, b3 - 0.3);
    tl.set("#week", { opacity: 1 }, b3);
    tl.fromTo(".days span", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" }, b3 + 0.05);
    tl.fromTo(".pill", { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.012, ease: "none" }, b3 + 0.1);
    // Hand-off: a green bar travels from the button to Saturday's slot.
    tl.set("#handoff", { x: from.x, y: from.y, width: from.w, height: from.h, borderRadius: 75, opacity: 1 }, b3 - 0.3);
    tl.to("#handoff", { x: to.x, y: to.y, width: to.w, height: to.h, borderRadius: 32, duration: 0.55, ease: "power3.inOut" }, b3);
    tl.set(pills[FILL[0]], { scaleX: 1 }, b3 + 0.55);
    tl.set("#handoff", { opacity: 0 }, b3 + 0.56);
    FILL.slice(1).forEach(function (i, n) { tl.to(pills[i], { scaleX: 1, duration: 0.22, ease: "power2.out" }, b3 + 0.7 + n * 0.075); });
    tl.set("#h3", { opacity: 1 }, b3 + 0.35);
    tl.fromTo(h3w, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: "power3.out" }, b3 + 0.35);
    // The count runs with the slots and stops on 18.
    var count = { n: 0 };
    tl.set(["#count", "#count-label"], { opacity: 1 }, b3 + 0.6);
    tl.fromTo("#count", { y: 30 }, { y: 0, duration: 0.4, ease: "power2.out" }, b3 + 0.6);
    tl.to(count, { n: 18, duration: 1.35, ease: "power1.inOut", onUpdate: function () { $("#count .n").textContent = Math.round(count.n); } }, b3 + 0.65);

    // ---- Beat 4 (8.9 to 11.3): who has paid. The week lifts away, the list slides in.
    var b4 = T.b4;
    tl.to(["#week", "#count", "#count-label"], { y: -60, opacity: 0, duration: 0.28, ease: "power2.in", stagger: 0.03 }, b4 - 0.4);
    tl.to("#h3", { opacity: 0, duration: 0.25 }, b4 - 0.4);
    tl.fromTo("#paid", { x: 220, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, b4 + 0.02);
    tl.set("#h4", { opacity: 1 }, b4 + 0.1);
    tl.fromTo(h4w, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.07, ease: "power2.out" }, b4 + 0.1);
    chips.forEach(function (c, i) {
      var t = b4 + 0.85 + i * 0.35;
      tl.to(c, { opacity: 1, duration: 0.15 }, t);
      tl.to(c.previousSibling, { opacity: 0, duration: 0.12 }, t);
      tl.fromTo(c.parentNode, { scale: 1 }, { scale: 1.08, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" }, t);
    });

    // ---- Held beat (11.3 to 11.6): the paid list holds still before the end.
    // ---- End (11.6 to 15): the name sets down like a pot, the rule draws, the line and address follow.
    var e = T.end;
    tl.to(["#paid", "#h4"], { opacity: 0, y: 30, duration: 0.35, ease: "power2.in" }, e - 0.2);
    tl.set("#end", { opacity: 1 }, e);
    tl.fromTo("#mark .l", { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power4.out" }, e);
    tl.fromTo("#mark .dot", { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power4.out" }, e + 0.45);
    tl.fromTo("#rule", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.inOut" }, e + 0.7);
    tl.fromTo("#tag", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, e + 1.0);
    tl.fromTo("#url", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "none" }, e + 1.35);
    // Wide layouts have room beside the name: the full week comes back as the payoff.
    if (getComputedStyle(root).getPropertyValue("--end-echo").trim() === "1") {
      tl.fromTo(["#week", "#count", "#count-label"], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" }, e + 0.9);
    }
    tl.set({}, {}, T.total);
    return tl;
  };
})();
