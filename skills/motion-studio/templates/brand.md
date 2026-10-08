# Brand: <name>

Written <date> from <the website / answers in chat / a brand guide>. Claude reads this file before every piece. Change it by hand or ask Claude to; the colour and font tables are read by a script, so keep their layout.

## Colours

Exact hex values. The Role column is read by the script: keep the words Background, Surface, Text, Muted text, Accent, Second accent, Third accent, Border. Add "(light)" rows only if the brand has a light version too.

| Role | Hex | Use |
|---|---|---|
| Background | #000000 | the main background |
| Surface | #000000 | cards and panels on the background |
| Text | #000000 | headlines and body text |
| Muted text | #000000 | labels, captions, secondary lines |
| Accent | #000000 | the one colour that points at things |
| Second accent | #000000 | a second series in a chart, a second highlight |
| Border | #000000 | hairlines and dividers |

## Fonts

| Role | Font | Weights | Where it comes from |
|---|---|---|---|
| Headlines | <font> | 700 | Google Fonts |
| Body | <font> | 400 | Google Fonts |
| Numbers and labels | <font> | 400 | Google Fonts |

"Google Fonts" works for any font listed on fonts.google.com. For the brand's own font files, put them in a `brand/fonts/` folder next to this file and write the file name instead, for example `brand/fonts/Acme-Bold.woff2`.

## Logo

- `brand/logo.svg`: <which version: light on dark, dark on light>

## Look

How the brand looks and moves, in a few plain lines. For example: lots of space, one idea per frame, flat colour, no gradients, motion that is quick and precise, never bouncy.

## Words

How the brand writes on screen. For example: short sentences, sentence case, no exclamation marks, no jargon.

## Avoid

Things that would look wrong for this brand. For example: stock-photo people, neon glows, centred text on a gradient.

## Sound

Music style if any (for example: calm electronic, no vocals, about 100 BPM), or "silent by default".
