# The user's folder

Everything lives in plain files in the folder the user opened Claude in (their "motion folder"). Nothing is kept anywhere else, so the user can open, copy, back up or delete any of it.

```
my-motion/                      the folder the user works in
  brand.md                      colours, fonts, look, words, avoid, sound, our rules
  brand/                        optional: logo files, the brand's own font files
  spring-promo/                 one folder per piece
    brief.md                    what it is for, formats, length, words, references, sound
    references/                 optional: reference videos, their stills, style-notes.md
    source/                     the HyperFrames project (Claude's working files)
    storyboard-1/               frames (frame-1.png ...), notes.md, index.html
    v1/                         draft renders, contact.png, phone.png, notes.md, index.html,
                                feedback.md (notes saved from the review page)
    v2/ ...
    final/                      delivery renders, post.md
    cost.md                     tokens and API-price cost of every round
```

## brand.md

Written once ([brand-setup.md](brand-setup.md)), changed when the user asks. Sections: Colours (a table with exact hex values), Fonts (a table), Logo, Look, Words, Avoid, Sound, and **Our rules**: rules the user approved after a piece, one line each with the piece it came from. Read it at the start of every piece and every round. `tools prepare` reads the Colours and Fonts tables, so keep their layout (the template is [templates/brand.md](templates/brand.md)).

## brief.md

From [templates/brief.md](templates/brief.md). The brief is the contract for the piece: if something changes (a new format, new words), update the brief first, then the work.

## Storyboard and version folders

- Never overwrite an earlier round. A new round is a new folder (`storyboard-2/`, `v3/`), so the user can compare.
- Each folder has an `index.html` made by `tools page <folder>`: it shows every video, frame, sheet and note in the folder, and has a notes panel. It opens straight from the file in any browser (notes can then be copied into chat), or through `tools review <piece>`, which also saves the notes to `feedback.md` in that folder.
- `notes.md` in each folder says what is in it, what changed, the scores (versions) and what is left.
- Renders are named by format: `draft-9x16.mp4`, `draft-4x5.mp4`, `draft-16x9.mp4`, `overlay-16x9.mov`, `slide-1.png`.

## source/

The HyperFrames project for the piece. The user never needs to open it. It holds:

- `index.html`: the first format; `formats/<format>.html`: the others.
- `shared/piece.css`, `shared/piece.js`: the look and the timeline, written once for all formats.
- `shared/brand.css` and `shared/fonts/`: made by `tools prepare` from brand.md. Never edit by hand.
- `assets/`: pictures, sounds, local scripts (`assets/vendor/`).
- `compositions/`: library items copied in.

## cost.md

Written by `tools cost` after each round ([SKILL.md](SKILL.md)). It reads the token counts Claude Code records for the session and prices them at Anthropic's API rates (the price table is `scripts/prices.json`). Outside Claude Code there are no token counts; the file then says so.

## Things that never go in the folder

Music or effect files whose licence does not allow use in the piece; passwords or keys; anything the user did not provide or approve.
