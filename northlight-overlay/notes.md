# Version 1: Northlight episode 12 overlays

Transparent overlays for a talking-head video, 14 s, in 16:9 and 9:16: a lower third (the library's `lt-accent-underline`, with its new plate setting), a pull quote, and an end chip. Made for a second made-up brand (dark, yellow accent) to show the library items taking a different brand.

Files here: `preview-*.mp4` show the overlay over a plain stand-in for footage (a grey head-and-shoulders shape, not a real person). `overlay-*.webm` are the transparent files (VP9 with alpha). The ProRes 4444 `.mov` versions (for Premiere, Final Cut, Resolve) were rendered too but are 60 MB each, so they are not on this branch.

## Scores (critique round 2)

| hook | readability | motion | variety | composition | brand | sound |
|---|---|---|---|---|---|---|
| 8 | 8 | 8 | 7 | 8 | 9 | n/a (silent by design) |

## What round 1 found and round 2 fixed

- 9:16: the lower third sat on the face. Cause: library items fixed their own size at 1920 x 1080, so in a tall frame they filled only the top part. Fixed in the plugin (items are now copied per format size with `tools item`).
- 16:9: the role line was 38 px, under the 64 px phone minimum. The lower third got a subtitle size setting.
- 16:9: the quote card touched the side of the face; moved right.

## Problems left

1. Variety 7: the three graphics share one plate style; fine for a series look, but a quote with no plate would vary it.
2. Judged over a stand-in only; real footage may need the graphics moved.
3. No storyboard round was made for this trial (it went straight to version 1).
