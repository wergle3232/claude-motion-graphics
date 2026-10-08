---
name: motion-studio
description: Make or revise a StackEngine motion piece held in HQ (sizzle reel, promo video, carousel, infographic, slide show, with no footage of Wayne) from its brief to approval, in the brand, built with HyperFrames. Use when Wayne says a motion piece is ready, asks to work on one, or when list_motion_pieces shows a piece with turn "claude". Runs one turn at a time: storyboard or next version, critique loop, upload to HQ.
---

# Motion Studio

Makes StackEngine's motion pieces. HQ holds the piece (brief, storyboard, versions, comments, whose turn it is); this skill does Claude's turn and hands it back. HyperFrames does the building. This skill adds HQ, the brand, StackEngine's rules and the critique loop.

Files in this folder:

- [rules.md](rules.md): banned defaults, readability, timing, and Wayne's own rules. Read before designing anything.
- [formats.md](formats.md): sizes, safe zones, and how every format comes from one timeline.
- [critique.md](critique.md): the seven scores and the loop.
- [upload.md](upload.md): folders, manifests and the upload command.
- [library/library.md](library/library.md): our library, the moves and blocks that worked before, by job. Read before every storyboard.
- `motion_tools.py`: contact sheet, phone test, stills, loop clips, previews, PDF, reference breakdown. Run `python .claude/skills/motion-studio/motion_tools.py --help`.

## HQ is the review surface

Wayne reviews in HQ, not in chat. So:

- Do not run the HyperFrames intent interview or ask the brief questions in chat. The HQ brief answers them. If something the build truly needs is missing from the brief, add a note to the piece with `add_motion_comment` and say so in chat, then stop.
- HyperFrames' own checkpoints ("render now?", "preview first, or render?", Studio preview, plan review) are answered by HQ: the storyboard round is the plan review, and when the piece is Claude's turn, rendering previews for upload is approved. Final full-quality renders happen after Wayne approves a version in HQ.
- Do not record HyperFrames preferences (`prefs.mjs record`) and do not freeze recipes. Rules worth keeping go in [rules.md](rules.md), on Wayne's yes.
- Use `npx hyperframes ...` the way earlier projects did; npx keeps its own copy and fetches a newer version by itself when one exists. After `init`, the piece's `source/package.json` names the version; use that version for the piece's whole life. Do not run `npx hyperframes skills update` unless Wayne asks.

## One turn

1. **Read the piece.** `get_motion_piece` (or `list_motion_pieces` to find it). Act only when `turn` is `claude`. `whatToDo` says which job this is. Read every open comment; each says what it is about. Read the documents it lists with role `used` (`get_document`); they are what the piece is made from. If it lists source files, download them into the folder: `node scripts/hq-motion.mjs sources <pieceId> "<folder>/sources"`.
2. **Read the brand from HQ** with `get_brand_document`: `stackengine-visual-style-guide` every turn; `stackengine-brand-profile` and `video-production-direction` on the piece's first turn only (they are long, and the production direction is mostly about videos with Wayne on camera; take from it the graphics vocabulary and the warning against one repeated card treatment). If the piece speaks to an audience, use exactly one audience profile (AI-builder pieces use The Independent Builder Making AI Systems Dependable, loosely). Never copy brand text into this skill; brand truth stays in Marketing Engine OS.
3. **Set up the source** (first turn only). The piece's `folder` holds everything ([upload.md](upload.md)). Run `npx hyperframes init "<folder>/source" --non-interactive --example=blank --skill=general-video` (`--skill=motion-graphics` for a single short graphic under about 10 seconds). Then write:
   - `source/BRIEF.md` from the HQ brief, with `flow: automation` and `storyboard: no` (HQ runs the storyboard, so HyperFrames asks nothing). Put the HQ brief's job, made-from, feel, references and avoid in the body.
   - `source/frame.md`: the design spec, written from the Visual Style Guide's colour tokens and fonts (quote hex values exactly) and its direction and avoid lists. Rewrite it at the start of each turn if the guide has changed. It is a working copy, never edited by hand.
4. **References**, if the brief lists any and there are no style notes yet: download each into `<folder>/references/` with `yt-dlp` (or use the file Wayne named), run `motion_tools.py refs <video> <folder>/references/<name>`, look at the contact sheet, and write style notes: shot length, type, colour, how things enter and leave, transitions, what makes it work. Save them in HQ as one project document, "Style notes: <piece title>", with `create_document`, and use them. Copy the feel, never the content.
5. **Load HyperFrames knowledge** the way `general-video` (or `motion-graphics`) section 4 says: `/hyperframes-core`, `/hyperframes-creative` house-style and video-composition, `/hyperframes-animation`. Brand fonts win over HyperFrames' "banned monoculture" list: Inter and JetBrains Mono are the brand.
6. **Storyboard turn** (`stage` is `storyboard`):
   - Plan the beats (what the viewer sees and reads, second by second) and the one sentence the piece must leave behind.
   - For each beat, decide what job the moment has, then look in [our library](library/library.md) first, then HyperFrames' library, then build. Say in the frame's line which item a beat uses.
   - Build the timeline with each beat's frame at its most visible moment, little or no motion yet. Use the layout of the first format in the brief.
   - Render a draft and pull one still per beat with `motion_tools.py stills`. Write one plain line per frame: what is on screen and what moves.
   - New round from comments: change only what the comments ask, keep the rest, and list the comment ids in `addressed`.
   - Upload with `hq-motion.mjs storyboard` ([upload.md](upload.md)). The turn goes to Wayne.
7. **Version turn** (`stage` is `versions`):
   - Build from the brief, the approved storyboard, the style notes and every open comment. The storyboard stills are the start of the build, not drawings to redraw.
   - One timeline, a layout per format ([formats.md](formats.md)).
   - The check must pass for each format (see [formats.md](formats.md); the tool's `check` command covers formats other than `index.html`).
   - Render drafts, make previews, run the critique loop ([critique.md](critique.md)) until every score is 8 or more, at most 3 rounds.
   - Upload with `hq-motion.mjs version`, with notes saying what changed, the scores, the 3 biggest problems left, the contact sheet, the phone test, and the comment ids dealt with. The turn goes to Wayne.
   - Anything built or fixed that could be used again goes into [our library](library/library.md) as an item (its "Adding to the library" section), status tried.
8. **After approval** (`stage` is `approved`):
   - Render the approved version at `--quality delivery` into `<folder>/final/`, one file per format, and upload them to the piece's Ready to post box: `node scripts/hq-motion.mjs attach <pieceId> final <files>...` (up to 100 MB each; Wayne posts from his phone with them).
   - If the piece is for posting, write its posting package as a project document ("Posting package: <piece title>") and link it to the piece with `link_motion_document` role `posting`, so it shows under Ready to post, following Wayne's posting-package rules in Marketing Engine OS `skills/me-reels-studio/references/rules.md` (Instagram first with the caption inline, posting steps for computer and phone, the cover's full path, YouTube title options with a recommendation, the description in his order with the booking and community links). Make the cover as a still from a `formats/cover.html` composition, everything important inside the 3:4 profile-grid crop (y 240 to 1680), saved as one JPG only (no PNG copy; the composition is the source), and upload it with the finals. Use clean real screens on the cover, not busy frames that turn into a jumble at that size.
   - When Wayne says where he posted it, record it with `motion_posted` (or he adds it under Posted). Example: project 4, "Posting package: Marketing Engine sizzle reel 1".
   - Read every comment Wayne made on this piece. Propose rules worth keeping for future pieces, one line each, in chat. Add a rule to [rules.md](rules.md) under "Wayne's rules" only after Wayne says yes to it. Do not add any on a general "go".

## Reporting in chat

Short: which piece, what was done, the scores, anything that could not be met and why, and the HQ link `https://hq.apps.stackengine.ai/projects/<projectId>/motion/<pieceId>`.

After an upload, if Wayne is still in the session, start `node scripts/hq-motion.mjs wait <pieceId>` in the background. It ends when Wayne hands the piece back in HQ (Send my comments, Looks good, Approve), so you hear about it without him typing "check HQ"; then read the piece and take the turn.
