# Critique loop

Claude checks its own render before the user sees it, the way a designer would: look at the frames, score them honestly, fix the worst thing, look again.

## Make the proof (code, not judgment)

For each version, after the draft renders:

```bash
tools contact <piece>/v<N>/draft-<first format>.mp4 <piece>/v<N>/contact.png
tools phone <piece>/v<N>/phone.png <piece>/v<N>/draft-9x16.mp4 <piece>/v<N>/draft-4x5.mp4 <piece>/v<N>/draft-16x9.mp4 [slide-1.png ...] [--at <times at the hand-overs and the end>]
tools loudness <piece>/v<N>/draft-<format>.mp4
```

The contact sheet shows frames every half second or so, labelled with their time: read it for motion, rhythm, composition and hand-overs. The phone test shows frames at the size a phone shows them (360 pixels wide), one row per format: read it for readability. Pass `--at` with the moments most likely to go wrong (just after each hand-over, the end frame). Open both images and look at them; do not score from memory of the code.

For an overlay, judge it over footage: `tools overlay-preview <overlay> standin <out.mp4>` (or the user's real footage), then contact-sheet that. For a carousel, phone-test every slide.

## Score each 1 to 10

| Score | What it asks | An 8 means |
|---|---|---|
| `hook` | Does the first 1.5 seconds make someone stop scrolling? (carousel: does slide 1 make someone swipe?) | Something moves at once and the point is clear by 1.5 s |
| `readability` | Can every word be read at phone size, in the time it is on screen? | Every word readable in the phone test, held long enough by the timing rules |
| `motion` | Does every move have a job, with varied, well-timed eases and clean hand-overs? | No banned default; each element enters in a way that suits it; no muddled overlaps |
| `variety` | Does the rhythm and the layout change across the piece? | No two neighbouring beats look or move alike |
| `composition` | Is each frame laid out with intent, inside the safe zones, in every format? | Clear focal point, grid-anchored, nothing in the margins, no big dead areas |
| `brand` | Does it look like brand.md (its colours, fonts, look) and avoid what it avoids? | Only the brand's colours and fonts; nothing on its avoid list; motion matches its look |
| `sound` | Does the sound support the motion, at the right level? | Hits land on the moments; levels in range ([sound.md](sound.md)); for a silent piece, score whether it works with no sound (feeds play muted) |

Score from what the frames show, not from what was intended. Write the 3 biggest problems with a time or slide, for example "0:04 the label overlaps the logo in 9:16" or "Carousel slide 3: body text 28 px, too small".

## The loop

1. Make the proof, score, list the problems.
2. If every score is 8 or more, stop.
3. Otherwise fix the lowest scores first, render again into the same `v<N>/` folder (the user has not seen it yet), and go back to 1.
4. At most 3 rounds. If it is still under 8 after round 3, show it anyway with the real scores and say in the notes what is still short and why.

Put the final round's scores and problems in `v<N>/notes.md`, with one line per earlier round saying what it fixed. Never raise a score to get past the loop.
