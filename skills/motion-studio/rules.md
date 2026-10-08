# Rules for motion pieces

Colours, fonts and the brand's own avoid list come from `brand.md`, read each round. These rules are method: how pieces are made, whatever the brand. The user's own approved rules are in brand.md under "Our rules" and win over these.

## Banned defaults

These are what a model makes when nobody tells it otherwise, and they make a piece flat and samey. Use one only on purpose, when it does a job for the moment. Glow, purple, small labels and the like are fine when the brand calls for them; whether something "looks AI-made" is not the test, whether it is engaging, readable and on-brand is.

- **Centred text on a gradient.** Use a real layout: text anchored to a grid line or an edge, with something else on the frame that it relates to.
- **Uniform fades.** Not everything fades in with the same ease and timing. Each element enters in a way that suits what it is (a number counts, a line draws, a label slides from where it points, a card drops into place) and the eases vary.
- **Generic particle bursts.** No sparkles, confetti or floating dots as filler. Movement must carry meaning.
- **Everything at once.** No frame where several elements arrive together with the same motion. Stagger with a reason (reading order, cause then effect).
- **Motion with no job.** If a move does not help the viewer read, compare or remember, it goes.
- **Muddled hand-overs.** When one scene gives way to the next, the old one leaves before the new one arrives, or one element visibly becomes the next (a button becomes a slot, a line becomes an underline). Two half-faded scenes on top of each other are never right.
- **Bounce on a calm brand.** Overshoot and bounce eases only when brand.md's look allows playful motion.

## Readability (checked in the phone test)

- The smallest text on screen is 12 pixels tall when the frame is shown 360 pixels wide. That means at least 36 px on a 1080-wide canvas (9:16, 4:5, carousel) and at least 64 px on a 1920-wide canvas (16:9). Labels inside drawings count.
- Headlines at least 90 px on a 1080-wide canvas.
- No more than about 12 words on screen at one time in a video. A carousel slide can hold more, but stays readable at 360 px wide.
- Text never sits on a busy area. Text colour on its background meets 4.5:1 contrast (large display text 3:1); `tools prepare` and HyperFrames' `check` both warn.
- Meaning never depends on colour alone (a "paid" chip says Paid, it is not only green).

## Timing

- Something moves in the first 0.3 seconds, and the hook (what this is and why to keep watching) is readable by 1.5 seconds.
- Every piece of text stays still and fully visible long enough to read: about 0.3 seconds per word, never under 1.2 seconds.
- Change the rhythm: not every beat the same length. Use a held beat before the most important line.
- The last frame holds at least 1.5 seconds and says where to go (the site, the handle, "link in bio").
- With music, cuts and big moves land on the beat. Without music, keep whole-second or half-second beats.
- A clip that loops (carousel slides, social loops) ends on a frame that matches its first frame (`tools clip --loop` cross-fades the seam).

## Visuals and HyperFrames' catalog

- Use the user's real material (screenshots, screen recordings, photos, logo) where the brief points to it, over drawn imitations. If there is none, draw simply in the brand and say in the notes that the drawings are not the real product.
- Screens of a public website: `npx hyperframes capture <url>` saves full-page and section screenshots; use them as pictures in the piece.
- Search the catalog (`npx hyperframes catalog --query "<what it should do>"`) before hand-building a named look. Catalog parts are built for 16:9 and for their own demo content: try them, then adapt or rebuild when they fight a 9:16 brand layout. Say in the notes which parts were used, adapted or replaced, and copy them into `source/compositions/` so the piece keeps working.
- Fonts: only the brand's fonts, through `--brand-font-*`. Do not add other fonts for effect, except inside a library item that says so.

## Content

- Every claim on screen is something the user's product really does or something stated in the brief. Do not invent numbers, customers, logos, quotes or features. Examples must read as examples.
- Write on-screen words the way brand.md's Words section says. Plain, literal, no em dashes unless the brand uses them.
- Never put another company's logo or trademark in a piece unless the brief provides it and the user has the right to use it.

## Sound

See [sound.md](sound.md).
