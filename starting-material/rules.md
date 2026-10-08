# Rules for StackEngine motion pieces

Brand colours, fonts and the brand's own avoid list come from the Visual Style Guide in HQ, read each turn. These rules are method: how the pieces are made, whatever the brand.

## Banned defaults

These are what a model makes when nobody tells it otherwise, and they make a piece flat and samey. Use one only on purpose, when it does a job for the moment. Glow, purple, small labels and the like are fine when they suit the piece; whether something looks AI-made is not the test, whether it is engaging and readable is.

- **Centred text on a gradient.** Use a real layout: text anchored to a grid line or an edge, with something else on the frame that it relates to.
- **Uniform fades.** Not everything fades in with the same ease and timing. Each element enters in a way that suits what it is (a number counts, a line draws, a label slides from where it points, a card drops into place) and the eases vary.
- **Generic particle bursts.** No sparkles, confetti or floating dots as filler. Movement must carry meaning.
- **Everything at once.** No frame where several elements arrive together with the same motion. Stagger with a reason (reading order, cause then effect).
- **Motion with no job.** If a move does not help the viewer read, compare or remember, it goes.

## Readability (checked in the phone test)

- The smallest text on screen is 12 pixels tall when the frame is shown 360 pixels wide. That means at least 36 px on a 1080-wide canvas (9:16, 4:5, carousel, infographic) and at least 64 px on a 1920-wide canvas (16:9).
- Headlines at least 90 px on a 1080-wide canvas.
- No more than about 12 words on screen at one time in a video. A carousel or slide show slide can hold more, but stays readable at 360 px wide.
- Text never sits on a busy area. Contrast follows the Visual Style Guide (for example, no bright green small text on the light background).
- Meaning never depends on colour alone.

## Timing

- Something moves in the first 0.3 seconds, and the hook (what this is and why to keep watching) is readable by 1.5 seconds.
- Every piece of text stays still and fully visible long enough to read: about 0.3 seconds per word, never under 1.2 seconds.
- Change the rhythm: not every beat the same length. Use a held beat before the most important line.
- The last frame holds at least 1.5 seconds and says where to go (the YouTube video, the channel, the site).
- With music, cuts and big moves land on the beat. Without music, keep whole-second or half-second beats.
- A clip that loops (carousel slides, social loops) ends on a frame that matches its first frame.

## Sound

- Music and sound effects are `<audio>` clips in each entry file, each with an `id` (without one the renderer leaves it silent), copied into `source/assets/`.
- The bundled sound effects (whoosh, pop, typing, chime, click, riser and others) are in `~/.claude/skills/media-use/audio/assets/sfx/`. Put them on moments things appear; not on every move.
- Cut and fade the music to the piece's length with ffmpeg, and bring it to about -15 LUFS with `loudnorm` before it goes in.
- Measure the finished mix: `ffmpeg -i <render> -af ebur128=peak=true -f null -`. Aim for -16 to -14 LUFS with peaks under -1 dB.
- Claude can't listen. The sound score comes from placement and measured loudness, and the notes say so; Wayne's ears decide.
- Record each track's source and licence in `BRIEF.md` and the version notes.

## Visuals and the HyperFrames library

- Wayne supplies no screenshots; Claude sources them when a piece calls for the real product: HQ screens (Wayne signs in to HQ in the browser pane once) and stackengine.ai. Icons and drawn elements are fine too.
- HQ screens: the pane's screenshots are at most 800 pixels wide, so set the pane to 800 x 470 (dark scheme looks best on a light reel), hide scrollbars with an injected style, take each screenshot at full scale (a scaled screenshot is saved scaled), and copy the saved file into `sources/screens/`.
- Public sites: capture with headless Chrome at double resolution (puppeteer-core and chrome-headless-shell from npx's HyperFrames copy).
- Search the registry (`npx hyperframes catalog --query`) before hand-building a named look. Registry parts are built for 16:9 and for their own demo content: try them, and adapt or rebuild when they fight a 9:16 brand layout (found 2026-10-05: kinetic-type-swap centres its line, caps its size by its box and dropped the last word with custom cues). Say in the version notes which parts were used, adapted or replaced.

## Content

- Every claim on screen is something Wayne's system really does or something stated in the brief. Do not invent numbers, customers, logos or features.
- Use Wayne's real material (screenshots, screen recordings, HQ screens) where the brief points to it, over drawn imitations.
- Write on-screen words the way the Voice and Writing Guide says: plain, literal, no em dashes.

## Wayne's rules

Rules Wayne approved after a piece. Each line says what to do and which piece it came from. Add only on Wayne's yes.

- The brief says dark, light or both. If it doesn't say, ask before building. (Short sample: three steps card, 2026-10-05.)
