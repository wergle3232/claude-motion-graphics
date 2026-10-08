# Third-party notices

Some library items are adapted from HyperFrames' catalog and recipes.

HyperFrames, Copyright 2026 HeyGen, Inc., is licensed under the Apache License, Version 2.0. A copy of that licence is in [LICENSE-HYPERFRAMES-APACHE-2.0.txt](LICENSE-HYPERFRAMES-APACHE-2.0.txt). HyperFrames' repository: https://github.com/heygen-com/hyperframes. HyperFrames has no NOTICE file to carry over (checked 2026-10-08).

These files are derived from HyperFrames material and were changed. Each file's header says what it came from and what was changed:

| File | From HyperFrames | Main changes |
|---|---|---|
| `items/focus-swap.html` | focus-swap primitive | brand tokens from brand.css; header notice |
| `items/grid-card-assemble.html` | grid-card-assemble primitive | brand tokens; accent labels renamed |
| `items/per-word-rise.html` | per-word-rise primitive | brand tokens; accent labels renamed |
| `items/state-chip-rail.html` | state-chip-rail primitive | brand tokens; accent labels renamed |
| `items/parallax-unzoom.html` | parallax-unzoom component | header notice |
| `items/lt-accent-underline.html` | lt-accent-underline registry item | rewritten as a sub-composition with settings (title, subtitle, side, sizes, plate, position, length) and brand colours and fonts |
| `clips/se-paint-shatter.html` | vfx-shatter block | cut to 0.8 s, faster shards, capture in try/catch, one word, brand colours and fonts |
| `items/se-price-shimmer.html` | text-shimmer gradient | typing and timing by hand; brand colours |
| `items/se-name-roll.html` | slot-machine-roll method | row sizing by hand; brand colours |
| `items/se-font-decode.html` | matrix-decode cells | fed fonts instead of characters; scramble by hand; brand colours |
| `items/se-pixel-resolve.html` | focus-blur-resolve recipe | blocky steps by hand; brand colours |
| `items/se-type-curve.html` | hw-path-text idea | built by hand on an SVG text path; brand colours |
| `items/se-open-to-screen.html` | text-state-swap idea | built by hand; brand colours |

The other items (`se-crumple-bin`, `se-flip`, `se-glass-cards`, `se-particle-burst`, `se-scatter-snap`, `se-select`, `se-type-pads`, `se-weight-shift`) were built by hand for this library.

Sound effects are not included in this plugin. Pieces use the effects that come with HyperFrames' `media-use` skill (Pixabay Content License; see that skill's `audio/assets/sfx/CREDITS.md`).

GSAP (gsap.com) is not included either; `tools prepare` downloads it from npm into each piece. It is free to use under GreenSock's standard no-charge licence (https://gsap.com/standard-license).
