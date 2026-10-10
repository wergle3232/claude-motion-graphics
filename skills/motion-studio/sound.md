# Sound

Most feeds play muted, so every piece must work with no sound. Sound is still worth doing well: it makes a piece feel finished when people turn it on.

## Choose

- **Silent:** overlays (the conversation is the sound), and carousels.
- **Effects only:** short UI-style pieces. A click on a tap, a soft whoosh on a slide, a chime on a success, a pop when something lands. On moments things appear or change, not on every move.
- **Music:** promos, sizzle reels, anything over about 15 seconds that is not narrated. One track, cut to the piece's length. If the piece has music, plan the beats to it: cuts and big moves on the beat (`npx hyperframes beats <audio>` finds them).
- The brand's Sound section in brand.md decides the style.

## Where sound comes from

- **Effects:** HyperFrames ships a set of effects (whoosh, pop, click, chime, typing, riser and others) in its `media-use` skill: `~/.claude/skills/media-use/audio/assets/sfx/`, with a `manifest.json` describing each and `CREDITS.md` with the licence (Pixabay Content License, free to use in videos). Copy the ones used into `source/assets/sfx/`.
- **Effects made for the piece:** a simple sound (a thud, a tick, a soft hit) can be made with FFmpeg's `aevalsrc` (a sine that drops in pitch and fades fast, plus a little noise for the attack), saved in `source/assets/sfx/`. No licence is needed. Say in the notes that it was made for the piece. Music made by code sounded mechanical when tried, so keep this to short effects.
- **Music:** the user chooses and downloads it; Claude never downloads music on its own. Good sources whose licences allow use in videos posted online:
  - Pixabay Music (pixabay.com/music): free, no attribution required, use in videos allowed; the music file itself may not be redistributed on its own.
  - YouTube Audio Library (studio.youtube.com, Audio Library): free; some tracks require attribution in the description; safest for YouTube.
  - Paid libraries the user already subscribes to (Epidemic Sound, Artlist, Musicbed): follow their licence for the platform.
- Ask the user for the file and its source page. Record in `brief.md` and the version notes: title, artist, source URL, licence, any attribution text.
- **Never** put a music file in the plugin, in a shared repository, or anywhere it would be passed on by itself; most licences allow it inside a finished video only. Never use commercial songs, or music "found on YouTube", without a licence the user holds.

## Placing it

- Music and effects are `<audio>` clips in each entry file, each with an `id` (without one HyperFrames leaves it silent), a `data-start`, a `data-duration` no longer than the file, and `data-volume` (0 to 1).
- Cut and fade the music to the piece first: `tools music <track> source/assets/music.m4a --length <seconds> --from <start in the track> --fade-out 2`. It also levels the track to about -15 LUFS.
- Keep effects under the music: effects `data-volume` about 0.3 to 0.6 with music, up to 1 without.

## Levels

Claude cannot listen. The sound score comes from placement and measured levels, and the notes say so; the user's ears decide.

- **With music or voice:** after rendering, `tools normalize <render> <out> --lufs -14`, then `tools loudness <out>`. Aim -16 to -14 LUFS integrated, true peak under -1 dBTP. That suits Instagram, TikTok, YouTube and LinkedIn.
- **Effects only:** loudness over mostly silence means little. `tools normalize <render> <out> --peak -3`, so the loudest effect peaks at -3 dBTP.
- **Silent:** nothing to do; `tools loudness` says "no sound track".
