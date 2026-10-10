# Example: The ball reel (MORF, 16:9, 12.7 s, loops)

**The job:** Showing how much goes into simple motion: a ball drop in real time, then the same drop in slow motion with labels.

**A sentence to start one like it:** "Make a ball drop: in real time first, then the same drop in slow motion with grey copies tracing its path and labels for what an animator has to get right (falls faster, stretch, squash, lower each time, shadow). Loop it."

It was made over a short conversation, not from that one sentence: a first version, then a few notes. The sentence is a good way to start.

**What is on screen**

- 0 to 4.1 s, REAL TIME: the ball drops in, lands five times, each about half as high, and rolls to a stop.
- 4.4 to 10.7 s, SLOW MOTION: the same drop, slowest at the first landing; ghost copies and labels appear as each thing happens.
- 10.7 to 12.15 s: the finished diagram holds; then everything clears back to the first frame.

**Library moves in it:** `se-physics-bounce`; the slow-motion replay is in the library's recipes. `source/shared/sim.js` is the bounce model. A see-through version is built in: `--variables '{"mode":"overlay"}' --format mov`.

**Files:** `source/index.html` (the canvas and layout), `source/shared/piece.css` (the look), `source/shared/piece.js` (the beats and motion), `source/shared/sim.js` (the bounce model).

**Sound:** The thuds in `source/assets/sfx/` were made for this piece with FFmpeg; no licence needed.
