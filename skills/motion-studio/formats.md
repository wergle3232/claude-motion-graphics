# Formats

All formats of a piece come from one set of designed frames and one timeline, so they say the same thing at the same moments. Only the layout changes per format.

## Sizes and safe zones

| Format | Canvas | Keep text and key content inside | Used for |
|---|---|---|---|
| video 9:16 | 1080 x 1920 | 60 px from the left, 140 px from the right (like and share buttons), 250 px from the top, 450 px from the bottom (caption and account name) | Reels, Shorts, TikTok, Stories |
| video 4:5 | 1080 x 1350 | 80 px from every edge; nothing critical in the 40 px at each side (the profile grid crops to 3:4) | Instagram, LinkedIn and Facebook feeds |
| video 16:9 | 1920 x 1080 | 96 px from every edge; keep the bottom-right 400 x 220 clear (YouTube end screens, watermarks) | YouTube, website, X, LinkedIn |
| overlay 16:9 / 9:16 | as the video it goes over | as that video's format, and keep the centre (the face) clear | Graphics placed over talking-head footage in an editor |
| carousel | 1080 x 1350 per slide (LinkedIn also takes 1080 x 1080) | as 4:5 | Instagram and LinkedIn carousels |

## One timeline, a layout per format

The worked example is [examples/kiln-promo/source](examples/kiln-promo/source) (a 15 s promo in 9:16, 4:5 and 16:9).

- `index.html` is the first format in the brief. Each other format is its own entry file in `formats/`, named for it: `formats/video-16x9.html`, `formats/video-4x5.html`, `formats/overlay-9x16.html`. HyperFrames allows only one composition at the project root.
- `shared/piece.css` holds the look and `shared/piece.js` builds the timeline: the beats, their times, the words and the motion, written once (`window.buildPieceTimeline()`). Each entry file sets only its canvas size and its layout, as CSS custom properties on `#root` (where the headline sits, its size, where the drawings sit), and registers the timeline inline, because HyperFrames' check looks for it there:

  ```html
  <script>document.fonts.ready.then(function () { window.__timelines["main"] = window.buildPieceTimeline(); });</script>
  ```

- Positions that depend on layout (where a moving thing starts and lands) are measured from the page when the timeline is built, before any tween runs, not typed in per format.
- A 9:16 layout is not the 16:9 layout squeezed. Stack what sits side by side, make the type larger, move content out of the safe-zone margins. On 16:9, anything inside a drawing must still be 64 px or more.
- **Paths in a `formats/` file:** stylesheets and scripts are relative to the file (`../shared/piece.css`, `../assets/...`), but `data-composition-src` is always written from the project root (`compositions/x.html`); the render cannot find it otherwise.
- **Library items per format:** HyperFrames sizes an item by its own root, so copy it with `tools item <source> <item> --size <W>x<H>` for each canvas size. 1920 x 1080 lands in `compositions/`, other sizes in `compositions/<W>x<H>/`. The command prints the mount snippet.
- Inside `source/`, run HyperFrames at the version in its `package.json` (`npx --yes hyperframes@<version> ...`) so a piece keeps rendering the same way.
- Check every format: `check` in `source/` for `index.html`, and `tools check <source> formats/<file>.html` for each other one. (HyperFrames' own lint flags the `../` paths in format files; `tools check` checks them the way the render reads them.)
- Render: `render --quality draft -o ../v<N>/draft-9x16.mp4` for `index.html`, adding `--composition formats/video-16x9.html` for the others.

## Variants (light and dark, and the like)

A variant of the same piece is a composition variable, not more entry files. Declare it on each entry file's `<html>` (`data-composition-variables='[{"id":"theme","type":"string","label":"Theme: dark or light","default":"dark"}]'`), have `piece.js` read it (`window.__hyperframes.getVariables()`) and set `data-theme` on `#root`. brand.css already holds a `[data-theme="light"]` set when brand.md has "(light)" colours. Render with `--variables '{"theme":"light"}'`; check with `tools check ... --set theme=light`. The storyboard round uses the same idea (`mode: storyboard`).

## Overlays for talking-head video

- Transparent background: `html`, `body` and `#root` have `background: transparent`, and nothing full-frame is drawn.
- Keep graphics in the lower-left and upper-right thirds; never over the centre, where the face is. One graphic on screen at a time unless the brief says otherwise. Over busy footage, put text on a plate (a brand-coloured panel at about 85% opacity); the lower-third item has a `plate` setting.
- Render each overlay format twice: `--format mov` (ProRes 4444 with alpha: Premiere Pro, Final Cut Pro, DaVinci Resolve; large files) and `--format webm` (VP9 with alpha: web, CapCut, small files). An MP4 cannot carry transparency.
- Judge it over footage, never over black: `tools overlay-preview <overlay.webm|mov> <footage.mp4 or "standin"> <preview.mp4>`. "standin" draws a plain head-and-shoulders shape; use the user's real footage when they give it.
- Tell the user how to place it: put the overlay file on the track above their footage at the time it should appear; it is already timed from 0.

## Carousel

- Built from the 4:5 layout (or 1:1 for LinkedIn if the brief asks). Each slide is either a still (a beat at its most visible moment, pulled with `tools stills`) or a short clip that loops (`tools clip --from --to --loop`).
- Slide 1 is the hook and must make someone swipe. The last slide says where to go.
- 3 to 10 slides. A clip slide loops in whole bars of the music if there is music (4 beats x 60 / BPM seconds per bar), otherwise 3 to 6 whole seconds, and ends on a frame that matches its start.
- A carousel slide can hold more words than a video frame, but still reads at 360 px wide (phone-test every slide).
- Deliver: `slide-1.png` ... (Instagram takes PNG or JPG; clip slides as MP4), one PDF of the still versions for LinkedIn (`tools pdf carousel.pdf slide-*.png`), and a preview that plays them in order (`tools join carousel-preview.mp4 slide-1.png slide-2.mp4 ... --each 2.5`).
- Easiest build: one timeline whose beats are the slides, each held for its slide time; stills come from the hold, clip slides from the moving parts.
