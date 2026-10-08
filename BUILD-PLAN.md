# Build plan: the Claude motion graphics plugin

This repository becomes a Claude Code plugin that makes high-quality motion graphics with Claude Code and HyperFrames. It is built in a Claude Code cloud session so that it cannot depend on anything on the owner's computer. Read this file in full before doing anything.

## Who it is for

Anyone with Claude Code (and, if it works, Claude Cowork; the same skill files should also work in Codex). They install the plugin from this repository, follow the README, and make motion graphics in their own brand. They have none of the owner's tools, files or settings.

## What is here now

`starting-material/` is the owner's private motion builder (a skill called motion-studio) and its library of moves. It was written for an internal app called HQ, which holds the brief, storyboards, versions and comments. Viewers do not have HQ. Use the method, rules, critique loop, formats and library; replace every HQ part with plain files. When the plugin is built, delete `starting-material/`.

## What to build

1. **A Claude Code plugin**, installable with `/plugin marketplace add <owner>/<repo>` and `/plugin install`. Check the current Claude Code plugin documentation for the exact layout (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `skills/`). Working name: claude-motion-graphics. The final name is the owner's choice. Do not name a skill `motion-graphics`: HyperFrames already has a skill with that name.
2. **Plain files instead of HQ**, all inside the user's own project folder:
   - `brand.md`: colours (exact hex), fonts, look, things to avoid.
   - `<piece>/brief.md`: what it is for, format(s), length, words, references, sound.
   - `<piece>/storyboard-1/`, `<piece>/v1/`, `v2/` ...: frames or renders, plus an HTML preview page.
   - Feedback is typed in chat. Optional, if it is simple: a local review page where you click a moment in the video and type a note, saved to a file Claude reads.
3. **Brand setup on first run**: if there is no `brand.md`, offer to read the user's website or ask a few short questions, then write it. Pieces must look like the user's brand, not a generic AI look.
4. **The library of moves** (`starting-material/library/`), shipped with the plugin. Order when a moment needs something: the plugin's library, then HyperFrames' catalog (`npx hyperframes catalog`), then build new. Item defaults are StackEngine's colours and fonts; they must take the user's brand from `brand.md`.
5. **Output formats**: video 16:9, 9:16 and 4:5; transparent overlays to place over a talking-head video; carousels (a set of slides as images, or slides that are short clips) for Instagram and LinkedIn.
6. **Quality loop**: storyboard frames before the full build; after each render Claude makes a contact sheet and phone-size frames, checks them against the rules and the critique (`starting-material/critique.md`), and fixes the weak points before showing a version.
7. **Sound**: rules for music and effects, where to get licensed music (for example Pixabay), levels (about -14 LUFS for social video). Never ship music files whose licence does not allow redistribution.
8. **Cost log**: every piece writes `<piece>/cost.md`: token counts per round where available, and what the same work would cost at API prices. Plan users see usage percentages in Claude Code; explain in the README how to read them.
9. **README** (named README.md, as GitHub expects): what it does, what you need, install steps for Windows and Mac (Node, FFmpeg, Claude Code, HyperFrames, the plugin), first run, making a piece, giving feedback, formats, cost, troubleshooting. Plain language. Say honestly which systems were tested.
10. **Licence**: the owner chooses. Until then, no licence file. Library items reworked from HyperFrames' catalog keep whatever notice HyperFrames' licence requires; check it.

## Rules

- Nothing private in this repository, ever: no keys, tokens or passwords, no client material, no paths or details from the owner's computer, nothing from HQ. The repository may become public with its whole history.
- No large binary files in the main branch. Trial renders go on a separate branch called `trials` (an MP4 per trial plus its brief), so the owner can watch them; that branch is never made public.
- Write for people who are not developers. Plain words, exact steps.
- Prove each step works in this cloud machine: install everything from zero following the README exactly as written, then make at least one piece in each format. Fix the README wherever reality differs.

## Done when

- A fresh machine following only the README installs everything and makes a good piece.
- Trial pieces on the `trials` branch: a product promo, a data or explainer piece, an overlay for a talking-head clip, and a carousel.
- `starting-material/` is deleted.
- A short `BUILD-NOTES.md` lists what was tested, what broke and how it was fixed, and anything the owner must decide.
