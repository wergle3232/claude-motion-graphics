# Examples

Finished pieces, kept as recipes: what each one is for, a sentence to start one like it, what is on screen, and its source to copy the structure from. Claude reads these when a new piece does the same job; you can also open them to see how a piece is built.

| Example | The job | Length |
|---|---|---|
| [kiln-promo](kiln-promo/) | A product promo in 9:16, 4:5 and 16:9 from one timeline (made-up brand Kiln) | 15 s |
| [ex-titles](ex-titles/) | A title card: words that slam, split and change fonts | 5 s |
| [ex-shapes](ex-shapes/) | Explaining an idea with simple shapes | 7 s |
| [ex-data](ex-data/) | A stat: a number, a chart and a ring, docking into a dashboard | 7.5 s |
| [ex-screen](ex-screen/) | A product feature: a screen tilted, zoomed and pointed at | 9 s |
| [ex-overlay](ex-overlay/) | Graphics over your own talking-head footage, each on its word | 15 s |
| [ex-logo](ex-logo/) | A logo sting for an intro or an outro | 4 s |
| [ex-ball](ex-ball/) | A ball drop in real time, then in slow motion with labels (what goes into simple motion) | 12.7 s |

The `ex-*` pieces use **MORF**, a made-up brand for a fictional motion graphics platform ([brand-morf/](brand-morf/): brand.md, logo, brand sheet). MORF is not a real company or product.

## Rendering one yourself

1. Copy the example's folder and `brand-morf/` into a working folder.
2. Copy the sound effects its README lists from HyperFrames' bundled set (`~/.claude/skills/media-use/audio/assets/sfx/`) into `source/assets/sfx/`. They are not shipped here because their licence (Pixabay Content License) is for use inside finished videos.
3. Run `tools prepare source --brand brand-morf/brand.md` (it makes `shared/brand.css`, the fonts and the local GSAP copy, which are not shipped either).
4. In `source/`, run `npx --yes hyperframes@0.8.142 render`.

Or just ask Claude: "render the ball reel example in my folder".
