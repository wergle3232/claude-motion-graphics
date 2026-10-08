# Our library

What has worked before, kept so the next piece is faster and looks the same. Read this before every storyboard (motion pieces) and before proposing production enhancements (long videos). It is not a catalogue of every effect: it holds only things that were used or tested. Everything else is found in HyperFrames' library or built when a moment needs it.

## When a moment needs something

1. Look here first, by the job the moment has to do.
2. Then HyperFrames' library: `npx hyperframes catalog --query "<what it should do>"` (about 386 items, HeyGen's, mixed quality). The notes at the end say how their timing behaves.
3. Otherwise build it.

Whatever is built or fixed for a real piece comes back here as an item, with its settings and a preview. Wayne never picks effects from this list; Claude proposes moment by moment ("at 0:12, 'twelve dollars a month': price shimmer") and Wayne says yes, no or "something else here".

## Status

- **noted**: an idea or a part that hasn't been used yet. Nothing to mount.
- **tried**: used in a test or a real piece, with Wayne's reaction recorded.
- **approved**: Wayne said to keep using it. Only on his word.

## Using an item

Items in `items/` are HyperFrames sub-compositions. Copy the file into the piece's `source/compositions/` and mount it:

```html
<div id="price" class="clip"
  data-composition-id="se-price-shimmer" data-composition-src="compositions/se-price-shimmer.html"
  data-variable-values='{"text":"Get it for $12.99/mo.","accent":"#8b5cf6","length":1.5}'
  data-start="4.2" data-duration="1.5" data-track-index="3"
  data-width="1920" data-height="1080" style="position:absolute;inset:0"></div>
```

- `length` is the slot length in seconds; the whole move stretches or shrinks to fit (tested at half and double). Set `data-duration` to the same number.
- Text, size and colours are settings (the header of each file lists them). Defaults are StackEngine's colours and fonts (Inter, JetBrains Mono).
- The same item can be mounted more than once in one video with different settings; each copy keeps its own settings and timeline (tested).
- Items fill the host box and centre on it, so they work in 9:16 and 4:5 too; lower `size` if a line is too wide for a tall frame.
- Each item's script finds its root with `document.getElementById("root")`: HyperFrames runs it with a document scoped to that copy. Don't change that to a page-wide lookup.

Previews: rendered locally with `make_previews.py` (not included).

## Items

| Job | Item | Settings | From | Status |
|---|---|---|---|---|
| Makes a price or a number stand out | `se-price-shimmer` | text, letters shown at once, size, sweep colour, length (1.5 s) | Apple test 2, "Get it for $12.99/mo." (HyperFrames text-shimmer, timing fixed) | tried, Wayne 85% |
| Shows many tools, features or sections at once, landing on one | `se-name-roll` | names with colours, size, length (1.3 s) | Apple test 2, the names roll (slot-machine-roll's method) | tried, Wayne 80% |
| A brand or ending moment: a word swaps through fonts and settles into the logo | `se-font-decode` | text, size, scramble colours, final colour, length (1.3 s) | Apple test 2, "StackEngine" (matrix-decode cells) | tried, Wayne 85% |
| "Better quality" or a reveal: blocky words sharpen | `se-pixel-resolve` | text, size, block colour, length (0.84 s) | Apple test 2, "Upscale it." (focus-blur-resolve) | tried, Wayne 80% |
| Sending or sharing something out: a word shatters into shards | `clips/se-paint-shatter.html` | text and timing are in the file (render it as its own clip, then place the video) | Apple test 2, "Share it." (vfx-shatter cut from 12 s to 0.8 s) | tried, Wayne 70% |
| Brings a real screen in through the sentence that names it | `se-open-to-screen` | first words, last word, picture, size, accent, length (2.05 s) | Apple test 1, "Edit a video." | tried |
| Points at one word, the way a design tool does | `se-weight-shift` | word, rest, size, caret colour, length (1.55 s) | Apple test 1, "Take your" | tried |
| A dramatic exit: a word bursts into sparkles and smoke | `se-particle-burst` | text, size, sparkle colours, glow, smoke, length (1.75 s) | Apple test 1, "Prompt it." | tried |
| Doing something live or in rhythm: pads light up as the line types | `se-type-pads` | text, size, pads, accent, length (0.73 s) | Apple test 1, "Perform it." | tried |
| Something repeating or looping: a word flips round twice | `se-flip` | word, rest, size, length (0.78 s) | Apple test 1, "Loop it." | tried |
| Picking or choosing: a pointer selects a line and it lights up | `se-select` | text, size, accent, length (0.62 s) | Apple test 1, "Select it." | tried |
| Writing or drafting: typed, then bent onto a curve with a pen line | `se-type-curve` | text, size, accent, length (1.12 s) | Apple test 1, "Write it." | tried |
| Throwing something away, a "no": crumpled into a bin | `se-crumple-bin` | text, size, scrap colours, length (2.14 s) | Apple test 1, "Scrap it." | tried |
| Getting organised: scattered letters snap into line | `se-scatter-snap` | text, size, guides, length (0.64 s) | Apple test 1, "Move it." | tried |
| Three parts of one system, with depth: frosted glass cards in a light | `se-glass-cards` | three labels, picture behind, beam and floor colours, length (3 s) | Apple test 1, the glass check (Zelios NeuraFlow) | tried |

Wayne rated Apple test 1 "right around 80 to 90%" on most shots (2026-10-05) and test 2 "really good" with the per-shot numbers above (2026-10-06).

### From Marketing Engine's video editing

Made for the DaVinci Resolve AI-tools test video (September 2026) and used there. Previews: `me-four-part-feature-overview.mp4` (the first five together) and `lt-accent-underline.mp4`.

| Job | Item | Settings | Status |
|---|---|---|---|
| Builds a numbered set of cards (a chapter set, a feature overview, a recap) | `grid-card-assemble` | items, layout, columns, cues, accent, exit | tried |
| Shows progress through steps: a rail of status chips | `state-chip-rail` | states, times, badges, accent, exit | tried |
| A title whose words rise into place | `per-word-rise` | text, split, cues, accent, exit | tried |
| Moves attention between two things on screen (scale, blur, dim) | `focus-swap` | focus, blur, dim (a component: pasted into a scene, not mounted) | tried |
| Pulls back from one card to the whole grid | `parallax-unzoom` | progress, focus scale, sibling push and fade (a component) | tried |
| A lower third over camera footage: title rises, accent line draws | `lt-accent-underline` | text in the file | tried |
| A route or decision card placed natively in DaVinci Resolve | `resolve/stackengine-native-route-card/` | headline, accent colour (Resolve's own controls) | **approved** (Wayne: "visually indistinguishable from HyperFrames") |

The first three read their length from `data-duration` in their own file (3.5, 4.5 and 5 seconds): change that number in the copy to fit a slot. The Resolve card is placed with Marketing Engine's executor (`build-resolve-ograf-executor.mjs` in Marketing Engine OS, `skills/me-video-editing`); its README in the folder says how.

## Noted, not built

- A line drawn by a point of light with a glowing tail (Jamie Fenn's rule 3, 2026-10-06). Build it the first time a real piece needs a line or connector.
- Hand-offs instead of dissolves: a line that becomes the next word's underline, a card that slides out as the next slides in (Jamie Fenn's rule 5).
- Marketing Engine candidates never tested: chart-story, ui-focus-zoom, browser-device-stage, before-after-wipe, comparison-split, screen-flow-carousel, titlecard-calm, text-state-swap, data-chart, flowchart, code-highlight, code-scroll (all in HyperFrames' library).
- Marketing Engine recipes (combinations that were used): four-part feature overview, topic lower third (4K and 1080p), iteration rail, grid comparison. Their files stay in Marketing Engine OS (`brands/stackengine/projects/marketing-engine/projects/ai-video-editing/hyperframes/registry/`).

## HyperFrames' library: how its timing behaves

Proved in the two Apple tests (2026-10-05 and 06).

- **Paste-in effects** (focus-blur-resolve, slot-machine-roll, matrix-decode): markup, styles and one suggested move; our timeline sets the timing, so any length works.
- **Self-timed effects** (text-shimmer, particle-text-dissolve, char-slam-explode): they read a length that isn't the slot's (the `data-duration` written in their file, often the full demo length), so they play too long and get cut off in a short slot. Set the slot length in a copy; to stretch, change their base time numbers too.
- **Showcase blocks** (vfx-shatter, transitions-destruction, liquid-glass-widgets): 8 to 14 second demos. Change the time numbers at the top, render the block as its own clip, place the video. vfx-shatter also needed its capture wrapped in try/catch.
- Some items are partial (matrix-decode has no scramble routine); text-shimmer fails HyperFrames' own check by design and clips descenders; liquid-glass shader blocks render black on this PC (CSS backdrop-filter glass works).
- Registry parts are built for 16:9 and their own demo content; most were used as techniques, not drop-ins.

## Adding to the library

When a piece builds or fixes something that could be used again:

1. Make it an item in `items/` like the others: a sub-composition with text, colours, size and `length` as settings, the job and source in its header, its root found with `document.getElementById("root")`, no `Math.random` (use a fixed-seed random).
2. Make its preview with `make_previews.py`.
3. Add a row above with status tried and Wayne's reaction.
4. Approved only when Wayne says so.
