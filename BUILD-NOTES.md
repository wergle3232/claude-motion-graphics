# Build notes

Built in a Claude Code cloud session on 2026-10-08, from BUILD-PLAN.md.

## What is here

- A Claude Code plugin, **motion-graphics-studio** (`.claude-plugin/plugin.json` and `marketplace.json`), with two skills:
  - `skills/motion-studio/`: makes and revises pieces from brief to final. Plain files instead of HQ (brand.md, `<piece>/brief.md`, storyboard and version folders with a preview page, `feedback.md` from a review page, `cost.md`). Method, rules, critique loop and formats from the starting material, rewritten for anyone's brand. Also sound rules, brand setup, a worked example (the Kiln promo source) and the library of moves.
  - `skills/brand-setup/`: writes brand.md from a website (HyperFrames' `capture`) or from five questions.
- `skills/motion-studio/scripts/motion-tools.mjs`: replaces `motion_tools.py`. Needs only Node and FFmpeg (no Python). Prepares a piece from brand.md (brand.css, Google Fonts downloaded, GSAP made local), contact sheet, phone test, stills, looping clips, carousel PDF and preview, overlay preview over a stand-in, loudness and levelling, preview pages, a local review server that saves notes to a file, the cost log, library previews, and copying library items into a piece at the right size.
- The library: 20 items and 1 clip. Every one now takes the piece's brand colours and fonts; private names removed. Items adapted from HyperFrames keep its Apache-2.0 notice (`library/THIRD-PARTY-NOTICES.md` and a copy of the licence).
- README.md: install for Windows and Mac, first run, making a piece, feedback, formats, cost, troubleshooting.
- `starting-material/` is deleted.

## What was tested, and how

All in the cloud machine (Ubuntu 24.04 Linux, Node 22, FFmpeg 6.1, HyperFrames 0.8.142, Claude Code 2.1.294).

- `claude plugin validate .` passes (one warning: no version number, on purpose: see decisions).
- Every tool command was run on real renders.
- All library items rendered together in a light brand (`tools library`) and checked frame by frame; then again after the fixes below.
- Trial pieces, on the `trials` branch: a product promo (9:16, 4:5, 16:9 from one timeline; storyboard plus three critique rounds, all scores 8 or more) and talking-head overlays (16:9 and 9:16, transparent MOV and WebM, two critique rounds). Two made-up brands, light and dark.
- Brand setup from a website: `hyperframes capture` run on a small test site served on this machine (the cloud's network blocks most real websites). It extracted exact colours, fonts and type roles as brand-setup.md describes.

## Not tested

- **Install on Windows and on Mac.** A Linux cloud machine cannot test either. I started a from-zero install in a clean Linux container following the README, but this cloud's network blocks Homebrew's servers and Claude Code's installer download (formulae.brew.sh, pkg-containers.githubusercontent.com, downloads.claude.ai), so it could not run as written. I stopped it rather than test the cloud instead of the plugin. The first real install test is on the owner's Windows 11 PC.
- **The GitHub sign-in step** (`gh auth login`): this cloud's proxy supplies GitHub access itself.
- **Installing the plugin from GitHub and using it in a fresh Claude Code session.** The trials were made by following the skill files by hand in this session, not through the installed plugin.
- **Explainer and carousel trials:** not made, by agreement. They will be made with the owner using the installed plugin; the carousel commands (`stills`, `clip --loop`, `pdf`, `join`) were tested on their own.
- **Music:** no music track was used (none can be downloaded here, and the plugin must not ship any). `tools music` and `normalize --lufs` were not run on real music.
- **Cowork and Codex.** The skills are plain skill folders, but both need Node and FFmpeg on the machine that runs them.

## What broke, and how it was fixed

1. **Library items ignored the brand.** HyperFrames fills in each setting's declared default, so colour defaults always won. Colour settings now default to empty, and the items read `--brand-*` from the piece's brand.css.
2. **Brand fonts did not render.** HyperFrames only fetches fonts it sees named directly, not fonts held in a CSS variable. `prepare` now downloads the brand's Google Fonts into the piece and writes real `@font-face` rules.
3. **GSAP from the CDN could not load here.** It is now copied from npm into each piece, so renders no longer need a CDN.
4. **HyperFrames' lint rejected `../` in asset paths**, even in a stylesheet. Fonts now sit next to brand.css.
5. **Format files and sub-compositions.** In `formats/*.html`, `data-composition-src` must be written from the project root while styles and scripts are relative to the file. `tools check` used to hide this; it now catches it.
6. **Library items were the wrong size in 9:16.** Items fixed their root at 1920 x 1080, and HyperFrames 0.8.142's lint requires a root size. New `tools item` copies an item per format with that format's size. Found by the overlay trial: the lower third covered the face.
7. **Muddled hand-overs** (two half-faded scenes at once) in the promo's first version. This is now a banned default in rules.md and a motion criterion in critique.md.
8. **Effects-only sound was too quiet** and LUFS targets mean little over mostly silence. Added `normalize --peak`; sound.md says when to use which.
9. **The plugin name `claude-motion-graphics` is refused** by Claude Code (third-party names may not start with "claude-"). Renamed to `motion-graphics-studio`.
10. **HyperFrames needs Node 22**, not 18 as first written; the README and skill now say 22.
11. **Smaller fixes:** the shared counter text did not match the grid (21 slots shown as "/ 20"), the lower third had no plate or position settings for 9:16, and the 16:9 end frame text collided with the drawing.

## For the owner to decide

1. **The plugin's final name.** It is `motion-graphics-studio` for now; it cannot start with "claude-". Renaming later means changing both `.claude-plugin` files and telling testers to reinstall.
2. **Licence.** None yet, as the plan says. Parts adapted from HyperFrames carry its Apache-2.0 notice whatever you choose.
3. **Before making the repository public:** its git history still holds `starting-material/` (HQ, StackEngine, owner and client names, private paths, in the first commit), and `BUILD-PLAN.md` itself mentions HQ and StackEngine. Making the current files public is not enough. Either start a fresh public repository from the current files, or rewrite the history. The `trials` branch must never be pushed to the public one.
4. **Branches.** At the owner's request the plugin is on `main` (the branch GitHub shows and the plugin installs from). The trial videos stay on the separate `trials` branch.
5. **Version number.** `plugin.json` has no `version` on purpose, so every push reaches testers (`claude plugin marketplace update motion-graphics-studio`, then restart). Add a version once it is stable.
6. **Dropped from the starting material:** the DaVinci Resolve OGraf route card (it depends on a private executor and registry). Approval statuses and ratings from the internal tests were reset to "tried", since they described your reactions inside HQ.
7. **Cost logs on the trials** count this whole build session, not only the piece, because the session also built the plugin. Real pieces will log only their own rounds.
8. **Telemetry:** HyperFrames sends anonymous usage statistics by default. The README tells users how to turn them off; you may prefer the plugin to turn them off itself.

## Next

Install on the owner's Windows 11 PC following the README, then make a carousel (and an explainer) with the plugin in the Claude desktop app, and fix what breaks.
