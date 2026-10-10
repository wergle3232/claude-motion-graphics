# Example: Graphics over video (MORF, 16:9, 15 s)

**The job:** Graphics laid over your own talking-head footage, each landing on the word being said.

**A sentence to start one like it:** "Add graphics over my clip: my name in a bar, then the key numbers as I say them. Each one should land on the word and leave before the next."

It was made over a short conversation, not from that one sentence: a first version, then a few notes. The sentence is a good way to start.

**What is on screen**

- A name bar, a stat ring and callouts, each arriving on its word in the transcript and leaving before the next.
- Graphics stay out of the centre, where the face is.

**Library moves in it:** `lt-accent-underline` for the name bar idea; the timing comes from word times in a transcript.

**Files:** `source/index.html` (the canvas and layout), `source/shared/piece.css` (the look), `source/shared/piece.js` (the beats and motion), `source/formats/overlay-16x9.html` (the see-through version).

**Not included:** the talking-head clip (the owner's own recording). Put your own 16:9 clip at `source/assets/clip.mp4` and change the word times in `piece.js` to your transcript.

**Sound:** Sound effects from HyperFrames' bundled set (copy them in, see [the examples README](../README.md)): click-soft.mp3, click.mp3, key-press.mp3, pop.mp3, whoosh-short.mp3.
