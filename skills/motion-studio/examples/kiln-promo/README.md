# Worked example: Kiln promo

A 15-second product promo for a made-up brand (Kiln, booking software for pottery studios), in 9:16, 4:5 and 16:9 from one timeline. It went through one storyboard round and three critique rounds; `notes-v3.md` has the final scores and what each round fixed.

- `brand.md`, `brief.md`: the files the piece was made from.
- `source/index.html` (9:16), `source/formats/video-4x5.html`, `source/formats/video-16x9.html`: entry files. Each sets only its canvas and its layout (CSS custom properties on `#root`) and lists its sound effects.
- `source/shared/piece.css`: the look, using only `--brand-*` colours and fonts.
- `source/shared/piece.js`: the beats, words and motion, written once. Its `mode` variable renders the storyboard (`--variables '{"mode":"storyboard"}'`).

Not included, because `tools prepare` makes them: `shared/brand.css`, `shared/fonts/`, `assets/vendor/` (GSAP). The sound effects in `assets/sfx/` come from HyperFrames' media-use skill. To render it yourself: copy `source/` and `brand.md` into a folder, copy click.mp3, click-soft.mp3, pop.mp3, chime.mp3 and whoosh-short.mp3 into `source/assets/sfx/`, run `tools prepare source --brand brand.md`, then `npx --yes hyperframes@0.8.142 render` in `source/`.
