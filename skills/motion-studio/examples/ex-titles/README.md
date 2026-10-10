# Example: Moving titles (MORF, 16:9, 5 s)

**The job:** A title card for a video or a post: words that slam, split and change fonts.

**A sentence to start one like it:** "Make a 5-second title card for my video: "Motion graphics", made with Claude Code. Over the top is fine."

It was made over a short conversation, not from that one sentence: a first version, then a few notes. The sentence is a good way to start.

**What is on screen**

- 0 to 0.6 s: "Motion" slams down from huge and blurred; flash and shake.
- 0.4 to 1.1 s: "graphics" drops in letter by letter.
- 1.1 to 1.8 s: its letters swap through fonts and settle in the brand font; "Aa" on a red disc swaps with them and names each font.
- 1.9 to 2.3 s: the title tears into bands with red and grey ghosts, then snaps back.
- 2.3 to 5 s: "made with" types on, "Claude Code" pops onto a black block, a red bar slams in, hold.

**Library moves in it:** `se-slam`, `se-font-specimen`, `se-glitch-split` (and `se-font-decode` for the letter scramble).

**Files:** `source/index.html` (the canvas and layout), `source/shared/piece.css` (the look), `source/shared/piece.js` (the beats and motion).

**Sound:** Sound effects from HyperFrames' bundled set (copy them in, see [the examples README](../README.md)): click-soft.mp3, click.mp3, glitch-1.mp3, impact-bass-1.mp3, pop.mp3, typing.mp3, whoosh-short.mp3.
