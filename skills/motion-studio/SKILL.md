---
name: motion-studio
description: Make or revise a motion graphics piece in the user's own brand with HyperFrames - a promo, explainer, data piece, social video (9:16, 4:5, 16:9), a transparent overlay for talking-head footage, or a carousel for Instagram or LinkedIn. Works from plain files in the user's folder (brand.md, <piece>/brief.md, storyboard and version folders), storyboards before building, critiques its own renders before showing them, and logs the cost of each round. Use when the user asks for a motion graphic, animated video, promo, explainer, overlay, lower third, carousel or animated post, or gives feedback on one.
---

# Motion studio

Makes motion pieces that look like the user's brand, not like generic AI video. HyperFrames does the rendering (HTML to video). This skill adds the brand, the method, the rules, a library of moves that worked, and a critique loop, and keeps everything in plain files in the user's own folder.

`${CLAUDE_SKILL_DIR}` below means the folder this file is in. (If your tool does not fill it in, use that folder's path.) The tool script is run as:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/motion-tools.mjs" <command> ...
```

It is called **tools** below (`tools contact ...` means that command). Run it with `help` for every command. It needs only Node and FFmpeg.

Files in this folder, read when the step says:

- [files.md](files.md): the user's folder: brand.md, brief.md, storyboard and version folders, what goes where. Read first, every time.
- [brand-setup.md](brand-setup.md): making brand.md when there is none.
- [rules.md](rules.md): banned defaults, readability, timing, content. Read before designing anything.
- [formats.md](formats.md): sizes, safe zones, one timeline with a layout per format, overlays, carousels.
- [critique.md](critique.md): the seven scores and the loop.
- [sound.md](sound.md): music, effects, where to get licensed music, levels.
- [library/library.md](library/library.md): moves that worked before, by the job a moment has to do. Read before every storyboard.
- [examples/kiln-promo/](examples/kiln-promo/): a finished piece's source (three formats from one timeline) to copy the structure from.

## Before the first piece

1. **Check the tools** quietly: `node --version` (22 or newer; HyperFrames needs it), `ffmpeg -version`, and that HyperFrames' skills are installed (a `hyperframes-core` skill is listed, or `~/.claude/skills/hyperframes-core/` exists). If something is missing, say exactly what, point to the README's install section, and stop.
2. **Brand.** Look for `brand.md` in the working folder. If there is none, follow [brand-setup.md](brand-setup.md) before anything else. Read brand.md at the start of every piece and every round; it may have changed.

## One piece, start to finish

The user works in chat. Keep messages short and plain; they are not developers. Show work as files they can open (the preview page) and say where it is.

### 1. Brief

- A piece is a folder: `<piece>/` in the working folder, a short lowercase name (`spring-promo`). Write `<piece>/brief.md` from [templates/brief.md](templates/brief.md).
- Fill it from what the user said. Ask only what you cannot sensibly decide, in **one** message, at most four short questions, each with a suggested answer they can accept ("Formats: 9:16 for Reels and 4:5 for LinkedIn?"). Usual gaps: what it is for, formats, length, the words, sound. If the user says "you decide", decide and write it down.
- If the brand has both a light and a dark version and the brief does not say which, ask.
- Never invent claims, numbers, customers or features. If the piece needs a number the user has not given, ask, or use a clearly marked example and say so in the brief.

### 2. Set up the source (first round only)

```bash
npx --yes hyperframes init "<piece>/source" --non-interactive --example=blank --resolution <portrait|landscape>
tools prepare "<piece>/source" --brand brand.md
```

- `prepare` writes `source/shared/brand.css` from brand.md (every colour as `--brand-*`, fonts downloaded into `shared/fonts/`), links it from the entry files, and makes CDN scripts (GSAP) local. Run it again whenever brand.md changes or a new entry file is added. Read what it prints: it warns about weak contrast.
- Copy the structure of [examples/kiln-promo/source](examples/kiln-promo/source): `shared/piece.css` (the look), `shared/piece.js` (the beats and motion, written once), `index.html` for the first format, `formats/<format>.html` for the others. [formats.md](formats.md) says how.
- After `init`, `source/package.json` names the HyperFrames version. Use that version for the piece's whole life (`npx --yes hyperframes@<version> ...`); do not upgrade mid-piece.
- Use only the brand's colours and fonts, through the `--brand-*` variables. Brand fonts win over HyperFrames' "banned fonts" list.

### 3. References

If the brief lists reference videos and there are no style notes yet: get each file into `<piece>/references/` (a file the user gives, or `yt-dlp <url>` if installed and the user has the right to use it), run `tools refs <video> <piece>/references/<name>`, look at the contact sheet, and write `<piece>/references/style-notes.md`: shot length, type, colour, how things enter and leave, transitions, what makes it work. Copy the feel, never the content.

### 4. HyperFrames knowledge

Load the HyperFrames skills the work needs: `hyperframes-core` (always, before writing composition HTML), `hyperframes-animation` (motion), `hyperframes-creative` (typography and design thinking), `hyperframes-cli` (commands), `hyperframes-registry` (catalog items), `media-use` (images, audio). Their rules about composition structure, timing and determinism apply. This skill decides the process: do **not** run HyperFrames' own intent interview, brief or storyboard workflow, do not record HyperFrames preferences, and do not run `npx hyperframes skills update` unless the user asks.

### 5. Storyboard round

1. Write the one sentence the piece must leave behind, and plan the beats: what the viewer sees and reads, second by second. Follow [rules.md](rules.md) timing.
2. For each beat, decide the job the moment has, then look in [our library](library/library.md) first, then HyperFrames' catalog (`npx --yes hyperframes@<version> catalog --query "<the job>"`), then build. Say in the frame's line which item a beat uses.
3. Build the timeline with each beat at its most visible moment and little or no motion (the example's `mode` variable does this: `--variables '{"mode":"storyboard"}'`). Use the first format's layout.
4. `npx --yes hyperframes@<version> check` in `source/` until it passes, then render: `render --quality draft --variables '{"mode":"storyboard"}' -o ../storyboard-<N>/storyboard.mp4`.
5. `tools stills <render> <piece>/storyboard-<N> --at <one time per beat> --prefix frame-`, and look at every frame yourself before showing it. Fix what is plainly wrong.
6. Write `<piece>/storyboard-<N>/notes.md`: the one sentence, then one plain line per frame (what is on screen, what will move, which library item, which sound). Then `tools page <piece>/storyboard-<N>` and `tools cost <piece> --round "storyboard <N>" --session ${CLAUDE_SESSION_ID}`.
7. Show it: say where the page is (`<piece>/storyboard-<N>/index.html`, opens in any browser), give the frame lines in chat, and ask for feedback. Stop and wait.

A new storyboard round from feedback changes only what the feedback asks and keeps the rest.

### 6. Version round

1. Build from the brief, the approved storyboard, any style notes and all feedback. The storyboard frames are the start of the build, not drawings to redraw.
2. One timeline, a layout per format ([formats.md](formats.md)). `check` must pass for every format (`tools check <source> formats/<format>.html` for entry files other than index.html).
3. Render drafts into `<piece>/v<N>/` (`draft-9x16.mp4`, `draft-4x5.mp4`, ...), level the sound ([sound.md](sound.md)), then run the critique loop ([critique.md](critique.md)) until every score is 8 or more, at most 3 rounds.
4. Write `<piece>/v<N>/notes.md`: what changed and why, the scores, the 3 biggest problems left, the sound sources and licences, which feedback was dealt with. Keep the contact sheet and phone test in the folder. Then `tools page <piece>/v<N>` and `tools cost <piece> --round "v<N>" --session ${CLAUDE_SESSION_ID}`.
5. Show it: the page path, the scores, the problems left. Offer the review page for notes on exact moments: start `tools review <piece>` in the background and give the user `http://localhost:4321/v<N>/`; notes they save land in `<piece>/v<N>/feedback.md`.
6. Anything built or fixed that could be used again goes into the library as an item (its "Adding to the library" section), status tried.

### 7. Feedback

Feedback comes typed in chat, or saved from the review page into `<piece>/v<N>/feedback.md` (read it when the user says their notes are ready). Make the next version change only what was asked; list in the notes which notes were dealt with and how. If two notes conflict, ask.

### 8. Final

When the user approves a version:

- Render each format at `--quality delivery` into `<piece>/final/` (`<piece>-9x16.mp4` and so on), level the sound again, and check loudness ([sound.md](sound.md)).
- Overlays: also render `--format mov` (ProRes 4444 with transparency, for Premiere, Final Cut and DaVinci Resolve) and `--format webm` (for web and CapCut); see [formats.md](formats.md).
- Carousels: the slides as PNG, any clip slides as MP4, and one PDF for LinkedIn ([formats.md](formats.md)).
- Write `<piece>/final/post.md` if the piece is for posting: a caption in the brand's voice, alt text for each slide or the video, and where each file goes.
- Run `tools cost <piece> --round "final" --session ${CLAUDE_SESSION_ID}` and give the total.
- Read all the feedback on this piece. Propose rules worth keeping for future pieces, one line each. Add one to `brand.md` (brand rules) or to the user's own rules only when the user says yes.

## Reporting in chat

Short and plain: which piece, what was done, the scores, anything that could not be met and why, the path of the page to open, and the cost of the round. No jargon: say "the 9:16 version for Reels", not "the portrait composition".
