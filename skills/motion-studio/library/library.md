# The library

Moves that worked before, kept so the next piece is faster and still looks like the brand. Read this before every storyboard. It holds only things that were used or tested; everything else is found in HyperFrames' catalog or built when a moment needs it.

## When a moment needs something

1. Look here first, by the job the moment has to do.
2. Then HyperFrames' catalog: `npx --yes hyperframes@<version> catalog --query "<what it should do>"` (several hundred items, mixed quality). The notes at the end say how their timing behaves.
3. Otherwise build it.

Claude proposes moves moment by moment ("at 0:12, 'twelve dollars a month': price shimmer"); the user says yes, no or "something else here". Whatever is built or fixed for a real piece and could be used again comes back here as an item.

## Using an item

Items in `items/` are HyperFrames sub-compositions. Copy one into a piece with the tool, once per canvas size, and paste the snippet it prints into the entry file:

```bash
tools item <piece>/source se-price-shimmer                  # 1920 x 1080
tools item <piece>/source se-price-shimmer --size 1080x1920 # 9:16
```

```html
<div id="price" class="clip"
  data-composition-id="se-price-shimmer" data-composition-src="compositions/1080x1920/se-price-shimmer.html"
  data-variable-values='{"text":"From $12 a month.","length":1.5}'
  data-start="4.2" data-duration="1.5" data-track-index="3"
  data-width="1080" data-height="1920" style="position:absolute;inset:0"></div>
```

- **Brand:** items take colours and fonts from the piece's `shared/brand.css` (`--brand-*`). Leave colour settings out (or empty) to use the brand; set one only to override it.
- `length` is the slot length in seconds; the whole move stretches or shrinks to fit. Set `data-duration` to the same number.
- Text and size are settings (the header of each file lists them). Items fill the host box and centre on it; lower `size` if a line is too wide for a tall frame.
- The same item can be mounted more than once with different settings.
- Each item's script finds its root with `document.getElementById("root")`: HyperFrames runs it with a document scoped to that copy. Don't change that to a page-wide lookup.
- To see them all in a brand: make a scratch HyperFrames project, `tools prepare` it with brand.md, then `tools library <project>`; one preview clip per item lands in `<project>/previews/`.

## Status

- **tried:** used in a test or a real piece.
- **approved:** the user said to keep using it. Only on their word; record it here with the date.

## Items

| Job | Item | Settings | Base length | Status |
|---|---|---|---|---|
| Makes a price or a number stand out | `se-price-shimmer` | text, letters shown at once, size, sweep colour | 1.5 s | tried |
| Shows many tools, features or sections at once, landing on one | `se-name-roll` | names (optional "Name\|#colour"), size | 1.3 s | tried |
| A brand or ending moment: a word swaps through fonts and settles into the logo font | `se-font-decode` | text, size, scramble colours, final colour (the scramble uses common system fonts) | 1.3 s | tried |
| "Better quality" or a reveal: blocky words sharpen | `se-pixel-resolve` | text, size, block colour | 0.84 s | tried |
| Sending or sharing something out: a word shatters into glass | `clips/se-paint-shatter.html` | the word is in the file; render it on its own, then place the video (not mountable) | 0.8 s | tried |
| Brings a real screen in through the sentence that names it | `se-open-to-screen` | first words, last word, picture, size, accent | 2.05 s | tried |
| Points at one word, the way a design tool does | `se-weight-shift` | word, rest, size, caret colour | 1.55 s | tried |
| A dramatic exit: a word bursts into sparkles and smoke (only when it means something) | `se-particle-burst` | text, size, sparkle colours, glow, smoke | 1.75 s | tried |
| Doing something live or in rhythm: pads light up as the line types | `se-type-pads` | text, size, pads, accent | 0.73 s | tried |
| Something repeating or looping: a word flips round twice | `se-flip` | word, rest, size | 0.78 s | tried |
| Picking or choosing: a pointer selects a line and it lights up | `se-select` | text, size, accent | 0.62 s | tried |
| Writing or drafting: typed, then bent onto a curve with a pen line | `se-type-curve` | text, size, accent | 1.12 s | tried |
| Throwing something away, a "no": crumpled into a bin | `se-crumple-bin` | text, size, scrap colours | 2.14 s | tried |
| Getting organised: scattered letters snap into line | `se-scatter-snap` | text, size, guides | 0.64 s | tried |
| Three parts of one system, with depth: frosted glass cards in a light | `se-glass-cards` | three labels, picture behind, beam and floor colours | 3 s | tried |
| A lower third over footage: name rises, accent line draws, role follows | `lt-accent-underline` | title, subtitle, side, size, subtitle size, accent, plate, distance from bottom | 4.8 s | tried (overlay trial) |
| Builds a numbered set of cards (a feature overview, a recap) | `grid-card-assemble` | items, layout, columns, cues, accent, exit | 4.5 s (from `data-composition-duration`) | tried |
| Shows progress through steps: a rail of status chips | `state-chip-rail` | states, times, badges, accent, exit | 5 s | tried |
| A title whose words rise into place | `per-word-rise` | text, split, cues, accent, exit | 3.5 s | tried |
| Moves attention between two things on screen (scale, blur, dim) | `focus-swap` | focus, blur, dim (a component: pasted into a scene, not mounted) | 1.5 s | tried |
| Pulls back from one card to the whole grid | `parallax-unzoom` | progress, focus scale, sibling push and fade (a component: CSS and a helper, driven by the piece's own timeline) | any | tried |
| A loud landing for a word or short title: drops from huge and blurred, flash, squash, shake | `se-slam` | text, size, flash colour (or none), shake | 0.75 s | tried (MORF titles) |
| A word or line being disrupted: tears into bands with coloured ghosts, snaps back | `se-glitch-split` | text, size, bands, two ghost colours | 0.7 s | tried (MORF titles) |
| Showing type or a font choice: "Aa" on a disc swaps fonts, each named, settles in the brand font | `se-font-specimen` | letters, disc size, fonts, final name, disc colour | 1.1 s | tried (MORF titles) |
| Changing one shape into another, many times | `se-shape-morph` | forms (square, circle, triangle, star, diamond), a colour per form, size, seconds per form | 1.5 s (0.3 s + 0.3 s a form) | tried (MORF shapes) |
| A loud opening: shapes pour in and pile up, then implode into one shape | `se-shape-storm` | count, the shape at the end (square, circle, none), its size | 1.5 s | tried (MORF shapes) |
| Something dropping and landing with weight: a ball falls, squashes, bounces lower each time, rolls to a stop; optional ghost copies | `se-physics-bounce` | size, speed kept per bounce, sideways travel, ghosts, shadow, colour (a longer length is real slow motion) | 4.1 s | tried (MORF ball reel) |

The last five come from HyperFrames' catalog with small changes; their accent setting picks `--brand` (the brand accent), `--accent` (second accent) or `--accent-2` (third). The items whose header says "From HyperFrames" or names a HyperFrames recipe are covered by [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

The 3 items with a fixed length in their file (`grid-card-assemble`, `state-chip-rail`, `per-word-rise`) read their length from `data-composition-duration` in their own file: change that number in the piece's copy to fit a slot.

## Recipes (techniques for a piece's own timeline)

- [Camera dive](recipes/camera-dive.md): zoom into a shape until it fills the frame, swap the scene under the colour, pull back out of a shape in the next scene. Tried (MORF shapes).
- **Slow-motion replay of the same motion:** work the motion out from the time (see `se-physics-bounce` and `examples/ex-ball/source/shared/sim.js`), then play a stretch of it again through a time-warp: a list of (piece time, motion time) points joined by straight lines, slowest at the moment that matters. Leave ghost copies at equal steps of motion time to show the spacing, and point at things with callout labels whose line can follow a moving target. Tried (MORF ball reel).
- **See-through version:** a `mode` variable that hides everything but the subject ([formats.md](../formats.md), "See-through version of any piece"). Tried (MORF ball reel).

## Noted, not built

- A line drawn by a point of light with a glowing tail. Build it the first time a real piece needs a line or connector.
- Hand-offs instead of dissolves: a line that becomes the next word's underline, a card that slides out as the next slides in. (The Kiln promo example has one: the "Booked" button flies into its slot in the week grid.)
- Catalog items worth trying: chart-story, ui-focus-zoom, browser-device-stage, before-after-wipe, comparison-split, screen-flow-carousel, text-state-swap, data-chart, flowchart, code-highlight.

## HyperFrames' catalog: how its timing behaves

- **Paste-in effects** (focus-blur-resolve, slot-machine-roll, matrix-decode): markup, styles and one suggested move; the piece's timeline sets the timing, so any length works.
- **Self-timed effects** (text-shimmer, particle-text-dissolve, char-slam-explode): they read a length that isn't the slot's (the `data-duration` written in their file, often the full demo length), so they play too long and get cut off in a short slot. Set the slot length in the copy; to stretch, change their base time numbers too.
- **Showcase blocks** (vfx-shatter, transitions-destruction, liquid-glass-widgets): 8 to 14 second demos. Change the time numbers at the top, render the block as its own clip, place the video. vfx-shatter also needed its capture wrapped in try/catch.
- Some items are partial (matrix-decode has no scramble routine); text-shimmer fails HyperFrames' own check and clips descenders; liquid-glass shader blocks can render black on computers without a GPU (CSS backdrop-filter glass works).
- HyperFrames 0.8.142's lint requires `data-width` and `data-height` on every composition root, including items; older catalog items lack them. `tools item` adds them.
- Catalog parts are built for 16:9 and their own demo content; most work best as techniques, not drop-ins.

## Adding to the library

When a piece builds or fixes something that could be used again:

1. Make it an item in `items/` like the others: a sub-composition (`<template>`, styles and script inside it) with text, size and `length` as settings and colour settings empty by default; colours and fonts from `--brand-*` through the `brand()` helper or `var(--brand-...)`; the job, where it came from and its settings in its header comment; its root found with `document.getElementById("root")`; no data-width or data-height on the root (`tools item` adds them); no `Math.random` (use a fixed-seed random).
2. Preview it in a brand with `tools library <project> <item>` and look at the clip.
3. Add a row above with status tried and the piece it came from.
4. If it was adapted from a HyperFrames catalog item, say so in its header and add it to THIRD-PARTY-NOTICES.md.
