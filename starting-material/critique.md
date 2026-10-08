# Critique loop

Claude checks its own render before Wayne sees it, the way a designer would: look at the frames, score them honestly, fix the worst thing, look again.

## Make the proof (code, not judgment)

For each video format's draft render:

```bash
python .claude/skills/motion-studio/motion_tools.py contact <render.mp4> <folder>/v<N>/contact.png
python .claude/skills/motion-studio/motion_tools.py phone <folder>/v<N>/phone.png <render-9x16.mp4> <render-16x9.mp4> <slide-1.png> ...
```

The contact sheet shows frames every half second or so, labelled with their time; read it for motion, rhythm and composition. The phone test shows frames at the size a phone shows them (360 pixels wide); read it for readability. One contact sheet goes to HQ (the first video format); the phone test covers every format in one image.

## Score each 1 to 10

| Score | What it asks | An 8 means |
|---|---|---|
| `hook` | Does the first 1.5 seconds make someone stop scrolling? | Something moves at once and the point is clear by 1.5 s |
| `readability` | Can every word be read at phone size, in the time it is on screen? | Every word readable in the phone test, held long enough by the timing rules |
| `motion` | Does every move have a job, with varied, well-timed eases? | No banned default; each element enters in a way that suits it |
| `variety` | Does the rhythm and the layout change across the piece? | No two neighbouring beats look or move alike |
| `composition` | Is each frame laid out with intent, inside the safe zones? | Clear focal point, grid-anchored, nothing in the margins |
| `brand` | Does it look like StackEngine (guide's fonts, colours, direction) and avoid what the guide avoids? | Only guide colours and fonts; nothing on the guide's avoid list |
| `sound` | Does the sound support the motion? | Hits land on the cuts; for a silent piece, score whether it works with no sound (feeds play muted) |

Score from what the frames show, not from what was intended. Write the 3 biggest problems with a time or slide, for example "0:04 the label overlaps the logo in 9:16" or "Carousel slide 3: body text 28 px, too small".

## The loop

1. Make the proof, score, list the problems.
2. If every score is 8 or more, stop.
3. Otherwise fix the lowest scores first, render again, go back to 1.
4. At most 3 rounds. If it is still under 8 after round 3, upload anyway with the real scores and say in the notes what is still short and why.

Upload the final round's scores and problems in `version.json`. Never raise a score to get past the loop.
