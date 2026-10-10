---
name: motion-studio
description: Make or revise a motion graphics piece in the user's own brand with HyperFrames - a social post or Reel (9:16, 4:5, 16:9), graphics to lay over the user's own video (see-through overlays, lower thirds), a product promo, an explainer from a script, a data piece, a logo sting, or a carousel for Instagram or LinkedIn. Quick by default (the user says what they want, Claude goes straight to a version and adjusts from feedback), with a storyboard round when asked. Works from plain files in the user's folder (brand.md, <piece>/brief.md, version folders) and critiques its own renders before showing them. Use when the user asks for a motion graphic, animated video, promo, explainer, overlay, lower third, carousel or animated post, or gives feedback on one.
---

# Motion studio

Makes motion pieces that look like the user's brand, not like generic AI video. HyperFrames does the rendering (HTML to video). This skill adds the brand, the method, the rules, a library of moves that worked, and a critique loop, and keeps everything in plain files in the user's own folder.

It is for anyone who wants motion graphics: business owners, YouTubers, people making things for clients, agencies. Do not assume one kind of user: find out what the piece is for (a social post, graphics to lay over their own video, a product promo, an explainer from a script) and make that, in their brand.

`${CLAUDE_SKILL_DIR}` below means the folder this file is in. (If your tool does not fill it in, use that folder's path.) The tool script is run as:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/motion-tools.mjs" <command> ...
```

It is called **tools** below (`tools contact ...` means that command). Run it with `help` for every command. It needs only Node and FFmpeg.

Files in this folder, read when the step says:

- [files.md](files.md): the user's folder: brand.md, brief.md, version folders, what goes where. Read first, every time.
- [brand-setup.md](brand-setup.md): making brand.md when there is none.
- [rules.md](rules.md): banned defaults, readability, timing, content, and the code rules for HyperFrames timelines. Read before designing anything.
- [formats.md](formats.md): sizes, safe zones, one timeline with a layout per format, overlays and see-through versions, carousels.
- [critique.md](critique.md): the seven scores and the loop.
- [sound.md](sound.md): music, effects, where to get licensed music, levels.
- [library/library.md](library/library.md): moves that worked before, by the job a moment has to do. Read before building.
- [prompting-guide.md](prompting-guide.md): what to say to get each kind of piece, with a finished example for each. Point users to it when they ask what they can make or how to ask.
- [examples/](examples/): finished pieces' sources to copy the structure from: `kiln-promo` (three formats from one timeline) and the six MORF examples (titles, shapes, data, screens, graphics over video, logo sting).

## Before the first piece

1. **Check the tools** quietly: `node --version` (22 or newer), `ffmpeg -version`, and that HyperFrames' skills are installed (`~/.claude/skills/hyperframes-core/` exists). If anything is missing, follow the setup skill (`${CLAUDE_SKILL_DIR}/../setup/SKILL.md`): it asks the user once and installs what is missing. Do not send the user to install things by hand.
2. **Brand.** Look for `brand.md` in the working folder. If there is none, follow [brand-setup.md](brand-setup.md) before anything else: the normal first step is the user's website ("set up my brand from https://..."), not a form. Read brand.md at the start of every piece and every round; it may have changed.

## Two ways to work

- **Quick (the default).** The user says what they want in a sentence or two. Claude writes the brief itself, builds a version, checks it with the critique loop, and shows it. The user adjusts from there. Over-asking does not give better results, and skipping the storyboard roughly halves the cost.
- **Careful (when the user asks, or the piece is long or high-stakes).** A few brief questions first, then a storyboard round of still frames, then versions. Use it when the user says "storyboard first", when the piece is longer than about 30 seconds, or when it is for a launch or a client and a wrong guess would waste a round. Offer it in one line if you think it is worth it; do not insist.

**Keep each piece in one chat, finished in one sitting.** Every step re-reads the whole conversation, so a long chat costs more, and after a break of more than an hour the whole conversation is loaded again at full price. If the user comes back to a piece after a break, or the chat has grown long with other work, suggest a new chat for the next piece (everything the piece needs is in its folder).

## One piece, start to finish

The user works in chat. Keep messages short and plain; they are not developers. Show work as files they can open (the preview page) and say where it is.

### 1. Brief

- A piece is a folder: `<piece>/` in the working folder, a short lowercase name (`spring-promo`). Write `<piece>/brief.md` from [templates/brief.md](templates/brief.md).
- **Quick:** fill it from what the user said and decide the rest yourself (formats, length, words, sound), writing each decision down. Ask only if something is missing that you cannot sensibly decide, such as the words of a claim or a number. Then go straight to a version (step 6).
- **Careful:** ask what you cannot sensibly decide, in **one** message, at most four short questions, each with a suggested answer they can accept ("Formats: 9:16 for Reels and 4:5 for LinkedIn?"). Usual gaps: what it is for, formats, length, the words, sound. If the user says "you decide", decide and write it down.
- If the brand has both a light and a dark version and the brief does not say which, pick the one that suits where it will be seen and say so (careful mode: ask).
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

A finished piece can be a reference too ("like the ball one, but raining balls"): read its `brief.md`, `notes.md` and `source/`, and reuse its code where it fits.

### 4. HyperFrames knowledge

Load the HyperFrames skills the work needs: `hyperframes-core` (always, before writing composition HTML), `hyperframes-animation` (motion), `hyperframes-creative` (typography and design thinking), `hyperframes-cli` (commands), `hyperframes-registry` (catalog items), `media-use` (images, audio). Their rules about composition structure, timing and determinism apply. This skill decides the process: do **not** run HyperFrames' own intent interview, brief or storyboard workflow, do not record HyperFrames preferences, and do not run `npx hyperframes skills update` unless the user asks.

### 5. Storyboard round (careful mode only)

1. Write the one sentence the piece must leave behind, and plan the beats: what the viewer sees and reads, second by second. Follow [rules.md](rules.md) timing.
2. For each beat, decide the job the moment has, then look in [our library](library/library.md) first, then HyperFrames' catalog (`npx --yes hyperframes@<version> catalog --query "<the job>"`), then build. Say in the frame's line which item a beat uses.
3. Build the timeline with each beat at its most visible moment and little or no motion (the example's `mode` variable does this: `--variables '{"mode":"storyboard"}'`). Use the first format's layout.
4. `npx --yes hyperframes@<version> check` in `source/` until it passes, then render: `render --quality draft --variables '{"mode":"storyboard"}' -o ../storyboard-<N>/storyboard.mp4`.
5. `tools stills <render> <piece>/storyboard-<N> --at <one time per beat> --prefix frame-`, and look at every frame yourself before showing it. Fix what is plainly wrong.
6. Write `<piece>/storyboard-<N>/notes.md`: the one sentence, then one plain line per frame (what is on screen, what will move, which library item, which sound). Write times in seconds ("0.4 s", "1.1 to 1.8 s"), never "0:40" (it gets read as forty seconds). Then `tools page <piece>/storyboard-<N>`; the page says the storyboard video only flips through still frames and is not the animation.
7. Show it: say where the page is, give the frame lines in chat, and ask for feedback. Stop and wait.

A new storyboard round from feedback changes only what the feedback asks and keeps the rest.

### 6. Version round

1. Build from the brief, the approved storyboard if there is one, any style notes and all feedback. In quick mode, plan the beats as in step 5.1 and 5.2 (one sentence, the job of each moment, library first) before writing code.
2. One timeline, a layout per format ([formats.md](formats.md)). `check` must pass for every format (`tools check <source> formats/<format>.html` for entry files other than index.html).
3. Render drafts into `<piece>/v<N>/` (`draft-9x16.mp4`, `draft-4x5.mp4`, ...), level the sound ([sound.md](sound.md)), then run the critique loop ([critique.md](critique.md)) until every score is 8 or more, at most 3 rounds.
4. Write `<piece>/v<N>/notes.md`: what is on screen second by second (in seconds), what changed and why, the scores, the 3 biggest problems left, the sound sources and licences, which feedback was dealt with. Keep the contact sheet and phone test in the folder. Then `tools page <piece>/v<N>`.
5. Show it: the page path, the scores, the problems left. If the user's viewer cannot play videos from a plain file (some app panes open local files without media), start `tools serve <piece>` in the background and give them `http://localhost:4321/v<N>/`.
6. Anything built or fixed that could be used again goes into the library as an item (its "Adding to the library" section), status tried.

### 7. Feedback

Feedback comes in the chat: the user says what to change, ideally naming the video and the moment in seconds. Make the next version change only what was asked; list in the notes which notes were dealt with and how. If two notes conflict, ask.

### 8. Final

When the user approves a version:

- Render each format at `--quality delivery` into `<piece>/final/` (`<piece>-9x16.mp4` and so on), level the sound again, and check loudness ([sound.md](sound.md)).
- Overlays: also render `--format mov` (ProRes 4444 with transparency, for Premiere, Final Cut and DaVinci Resolve) and `--format webm` (for web and CapCut); see [formats.md](formats.md). Any other piece can get a see-through version the same way when the user wants to lay it over their own footage (formats.md, "See-through version of any piece"). Ask before making .mov files the user did not ask for: they are large.
- Carousels: the slides as PNG, any clip slides as MP4, and one PDF for LinkedIn ([formats.md](formats.md)).
- Write `<piece>/final/post.md` if the piece is for posting: a caption in the brand's voice, alt text for each slide or the video, and where each file goes.
- Read all the feedback on this piece. Propose rules worth keeping for future pieces, one line each. Add one to `brand.md` (brand rules) or to the user's own rules only when the user says yes.

## Cost counting (off unless the user asks)

Only when the user asks what a piece costs, or asks to keep count: after each round run `tools cost <piece> --round "<round>" --session ${CLAUDE_SESSION_ID}`. It writes `<piece>/cost.md`: what each round would cost at API prices, split into what Claude wrote (the work) and the cost of re-reading and loading the conversation. Explain it that way: on a Pro or Max plan it is usage, not money, and most of the total is the conversation, not the graphic. Once the user turns it on, keep doing it for that piece and give the round's cost in the report.

## Reporting in chat

Short and plain: which piece, what was done, the scores, anything that could not be met and why, the path of the page to open, and (if cost counting is on) the cost of the round. No jargon: say "the 9:16 version for Reels", not "the portrait composition". Times in seconds.
