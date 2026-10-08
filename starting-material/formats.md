# Formats

All formats of a piece come from one set of designed frames and one timeline, so they say the same thing at the same moments. Only the layout changes per format.

## Sizes and safe zones

| HQ format | Canvas | Keep text and key content inside | Used for |
|---|---|---|---|
| `video-9x16` | 1080 x 1920 | 60 px from the left, 140 px from the right (like and share buttons), 250 px from the top, 450 px from the bottom (caption and account name) | Reels, Shorts, TikTok, Stories |
| `video-4x5` | 1080 x 1350 | 80 px from every edge; nothing critical in the 40 px at each side (the profile grid crops to 3:4) | Instagram, LinkedIn and Facebook feeds |
| `video-16x9` | 1920 x 1080 | 96 px from every edge; keep the bottom-right 400 x 220 clear for YouTube end screens and the watermark | YouTube, website, X |
| `carousel` | 1080 x 1350 per slide | as 4:5 | Instagram and LinkedIn carousels |
| `infographic` | 1080 wide, 1350 to 2700 tall | 80 px from every edge | One tall image for feeds, the site and articles |
| `slideshow` | 1920 x 1080 per slide | as 16:9, without the end-screen corner | Presentations, LinkedIn documents, the site |

## One timeline, a layout per format

In the piece's `source/` HyperFrames project (worked example: `projects/motion-graphics-builder/motion/test-three-steps-card/source/`):

- `index.html` is the first video format in the brief.
- Each other format is its own entry file in `formats/`, named for it: `formats/video-16x9.html`, `formats/video-4x5.html`. HyperFrames allows only one composition file at the project root, and its paths to shared files start with `../shared/`.
- `shared/piece.css` holds the look and `shared/piece.js` builds the timeline: the beats, their times, the text and the motion, written once. Lines and paths that depend on layout are measured from the page when the timeline is built, not typed in per format. Each entry file sets only its canvas size, its layout (where things sit, how big, what stacks and what sits side by side) and any per-format values as CSS custom properties on `#root` that the script reads. A change to a beat is made once and appears in every format.
- Each entry file registers the timeline inline, because HyperFrames' check looks for it there: `document.fonts.ready.then(() => { window.__timelines["main"] = window.buildPieceTimeline(); });`
- A 9:16 layout is not the 16:9 layout squeezed. Stack what sits side by side, make the type larger, move content out of the safe-zone margins.
- Inside `source/`, run HyperFrames at the version in its `package.json` (for example `npx --yes hyperframes@0.8.113 check`), so a piece keeps rendering the same way.
- Check every format: `check` in `source/` for `index.html`, and `python .claude/skills/motion-studio/motion_tools.py check <source> formats/video-16x9.html` for each other one.
- Render: `render --quality draft --output ../v<N>/draft-9x16.mp4` for `index.html`, adding `--composition formats/video-16x9.html` for the others.

## Variants (light and dark, and the like)

A variant of the same piece, such as a light-background version, is a composition variable, not more entry files. Declare it on each entry file's `<html>` (`data-composition-variables='[{"id":"theme","type":"string","label":"Theme: dark or light","default":"dark"}]'`), have the timeline script read it (`window.__hyperframes.getVariables()`) and set `data-theme` on `#root`, and keep the colours as roles (`--bg`, `--text`, `--muted`, `--accent`, `--zone`) with one set per theme in the shared stylesheet. Render with `--variables '{"theme":"light"}'`; check with the tool's `check ... --set theme=light`. On light, follow the guide: no bright green small text, violet for accents. In HQ, list each variant's preview in the same format, dark first, and say the order in the notes.

## Carousel

- Built from the 4:5 layout. Each slide is either a still (a beat at its most visible moment, pulled with `motion_tools.py stills`) or a short clip that loops (`motion_tools.py clip`).
- Slide 1 is the hook and must make someone swipe. The last slide says where to go.
- 3 to 10 slides. A slide that is a clip loops in whole bars of the music if there is music (4 beats x 60 / BPM seconds per bar), otherwise in whole seconds, 3 to 6 seconds, and ends on a frame that matches its start.
- Also make a PDF of the still versions (`motion_tools.py pdf`) for LinkedIn, kept in the folder.

## Infographic

- One tall still, made as its own entry file (`infographic.html`) using the same frames' elements laid out top to bottom, then pulled at its last frame with `motion_tools.py stills`.
- It must read at 360 px wide without zooming.

## Slide show

- Built from the 16:9 layout: one still per beat, pulled with `motion_tools.py stills`, plus a PDF of them in the folder.
- One idea per slide.
