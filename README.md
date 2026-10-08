# Motion graphics studio

A plugin for Claude Code that makes motion graphics and carousels in your own brand.

You describe what you want in plain words ("a 15-second promo for our booking app, for Reels and LinkedIn"). Claude writes a short brief, shows you a storyboard, builds the piece, checks its own work against design rules, and shows you a preview page. You give feedback in the chat, and it makes the next version. Everything is kept as ordinary files in a folder on your computer.

It can make:

- **Videos** for social media and websites: 9:16 (Reels, Shorts, TikTok, Stories), 4:5 (Instagram and LinkedIn feeds) and 16:9 (YouTube, websites). One piece can come out in all three.
- **Overlays** for talking-head videos: name titles, quotes and end cards with a transparent background, to place over your own footage in your video editor.
- **Carousels** for Instagram and LinkedIn: a set of slides as images, slides that are short looping clips, and a PDF for LinkedIn.

The videos are made on your own computer by [HyperFrames](https://hyperframes.heygen.com), a free tool that turns web pages into video. Claude does the design and the writing.

## What you need

- A Windows 10 or 11 PC or a Mac (macOS 13 or newer), with about 3 GB of free disk space.
- A paid Claude plan that includes Claude Code (Pro, Max, Team or Enterprise).
- The Claude desktop app (use its **Code** tab), or Claude Code in a terminal.

> **What was tested so far:** the plugin and its tools were built and tested on Linux in a cloud computer. The install below has not yet been tried on a real Windows PC or Mac; that test comes next. If a step does not work as written, tell Claude what happened, or see [Troubleshooting](#troubleshooting).

## Install: three steps

**1. Add the plugin.** Open the Claude desktop app, go to the **Code** tab and start a **local** session in any folder (or type `claude` in a terminal). Then say:

> Install the Claude Code plugin from the GitHub repository wergle3232/claude-motion-graphics: add it as a marketplace, then install motion-graphics-studio from it.

Claude runs the two commands for you; say yes when it asks. (They are `claude plugin marketplace add wergle3232/claude-motion-graphics` and `claude plugin install motion-graphics-studio@motion-graphics-studio`, if you prefer to type them yourself.) If Claude says Git is missing, let it install Git and try again. If it says it cannot reach the repository, see [Troubleshooting](#troubleshooting).

**2. Set up your computer.** Close the app and open it again (or start a new session), then say:

> Set up motion graphics

Claude checks your computer and installs what is missing, after asking you once: Node.js (runs the tools), FFmpeg (puts video files together) and HyperFrames (turns designs into video). It takes about five minutes. Windows may ask "Do you want to allow this app to make changes" for each program: click Yes. If Claude asks you to restart the app at the end, do so. On a Mac without Homebrew, Claude will ask you to paste one line into Terminal, because it needs your Mac password.

**3. Set up your brand.** Make a folder for your motion work (for example `my-motion` in Documents), start a session in that folder, and say:

> Set up my brand from https://your-website.com

or, without a website, "Set up my brand". Claude reads your site (colours, fonts, the look) or asks you five short questions, then writes `brand.md` in your folder and shows you what it found. Check the colours and fonts and say if anything is wrong. If you have logo files or your brand's own font files, put them in a `brand` folder inside `my-motion` first.

That's it. Work in that folder from now on: each piece gets its own folder inside it.

Claude asks your permission before running commands. You can say yes each time, or choose "don't ask again" for commands you are happy with.

## Making a piece

Ask for what you want, in your own words. For example:

> Make a 15-second promo for our new booking feature, for Instagram Reels and LinkedIn. End with our website.

> Make a 6-slide LinkedIn carousel explaining our three pricing plans.

> Make overlays for my podcast video: my guest's name and title, one quote, and "New episodes every Tuesday" at the end. The video is 16:9.

Then:

1. **Brief.** Claude asks a few short questions if it needs to (each with a suggested answer), then writes `<piece>/brief.md`.
2. **Storyboard.** Claude shows you still frames of each moment and one line about what will move. Open `<piece>/storyboard-1/index.html` (double-click it) to see them. Say what to change, or "go ahead".
3. **Version 1.** Claude builds the piece, renders it, checks it against its design rules and fixes the weak points (up to three rounds) before showing it to you. Open `<piece>/v1/index.html` to watch every format.
4. **Your feedback** makes version 2, and so on. Each version keeps its own folder, so you can compare.
5. **Final.** When you say it is approved, Claude makes full-quality files in `<piece>/final/`, ready to post or to drop into your editor, and a short `post.md` with a caption and alt text.

### What is in your folder

```
my-motion/
  brand.md            your brand: colours, fonts, look, words, things to avoid
  spring-promo/       one folder per piece
    brief.md          what the piece is for
    storyboard-1/     the storyboard frames and a page to view them
    v1/  v2/          each version's videos, contact sheet, notes and page
    final/            the finished files
    cost.md           what each round used
    source/           Claude's working files (you never need to open these)
```

You can edit `brand.md` and `brief.md` yourself in any text editor; Claude reads them again each round.

## Giving feedback

Type it in the chat, as specifically as you can: "the logo comes in too late", "make the 9:16 headline bigger", "slide 3 has too many words".

Or use the review page, to point at exact moments: ask Claude to "open the review page". It gives you a link like `http://localhost:4321/v1/`. Open it in your browser, pause a video where something should change, type a note and press **Add note**; the time is added for you. Press **Save notes** when you are done and tell Claude your notes are ready. They are saved in `v1/feedback.md`, which Claude reads.

(If you open a version's `index.html` straight from the folder instead, the notes panel still works, but **Save** cannot write files from there: press **Copy notes** and paste them into the chat.)

## Formats

| Format | Size | For |
|---|---|---|
| Video 9:16 | 1080 x 1920 | Instagram Reels and Stories, YouTube Shorts, TikTok |
| Video 4:5 | 1080 x 1350 | Instagram, LinkedIn and Facebook feeds |
| Video 16:9 | 1920 x 1080 | YouTube, websites, X, LinkedIn |
| Overlay | 16:9 or 9:16, transparent | Over talking-head video in your editor. You get a `.mov` (Premiere Pro, Final Cut Pro, DaVinci Resolve) and a `.webm` (web, CapCut). Put it on the track above your footage. |
| Carousel | 1080 x 1350 per slide | Instagram (PNG images, and MP4 for moving slides) and LinkedIn (one PDF) |

Text is kept out of the areas each app covers with its buttons and captions, and every word is checked for readability at phone size.

**Sound.** Pieces work muted (most feeds play muted). Claude can add sound effects that come with HyperFrames. For music, choose a track from a source whose licence allows it in videos, such as [Pixabay Music](https://pixabay.com/music/) or YouTube's Audio Library, download it and give Claude the file and the page you got it from. Social videos are levelled to about -14 LUFS, the loudness Instagram, TikTok and YouTube expect. Claude cannot listen, so trust your own ears on the final mix.

## What it costs

The plugin and HyperFrames are free, and rendering runs on your computer. The cost is Claude's work: reading, designing, writing code, and looking at its renders.

- **Each piece writes `cost.md`**: the tokens Claude used in each round (brief, storyboard, each version) and what the same work would cost at Anthropic's API prices. On a Pro or Max plan you do not pay those amounts; they show how heavy the work was.
- **On a Pro, Max, Team or Enterprise plan**, your plan has usage limits that reset every few hours and every week. Type `/usage` in Claude Code to see them: bars show how much of the current session window and of the week you have used, as percentages, and when each resets. The breakdown under the bars shows how much of your recent usage went to skills and plugins, including this one. Motion pieces are heavy work: a 15-second piece in three formats with a storyboard and three critique rounds can use a large share of a Pro plan's session window. On a busy week, Max plans give more room.
- **On an API (Console) account**, `/usage` shows the session's cost in dollars, and `cost.md` gives it per round.

To spend less: keep pieces short, ask for one format first and add the others once you like it, and start a new chat (`/clear`) for each new piece.

## Troubleshooting

**"command not found" or "not recognized" after installing something.** Close Terminal or PowerShell and open it again. On Windows, if `ffmpeg` is still not found, sign out of Windows and back in.

**Adding the plugin fails with "Repository not found", "Authentication failed" or a git error.** The repository is private, so your computer must be signed in to GitHub with an account that has access. Ask Claude: "Sign me in to GitHub so git can reach a private repository." It installs the GitHub tool (`winget install --id GitHub.cli -e` on Windows, `brew install gh` on a Mac) and runs `gh auth login` and `gh auth setup-git`; you approve in your browser. Then try step 1 again.

**The plugin installed but Claude does not seem to use it.** Close Claude Code and start it again in your motion folder. In Claude Code, `/plugin` shows installed plugins; `motion-graphics-studio` should be enabled. You can also call it directly: `/motion-graphics-studio:motion-studio make a 10-second logo sting`.

**Claude says something is missing** (Node, FFmpeg or HyperFrames). Say "Set up motion graphics" again, or follow [Manual setup](#manual-setup), then start a new session.

**A render fails or is very slow.** Run `npx --yes hyperframes doctor` and read the lines with a cross. Rendering a 15-second video takes about 30 seconds to a few minutes depending on your computer; a full-quality render takes longer than a draft. Close other heavy programs if your computer has 8 GB of memory or less.

**Fonts look wrong in a render.** Fonts come from `brand.md`. Fonts listed as "Google Fonts" are downloaded when a piece is set up, so the computer must be online then. For your own font files, put them in `brand/fonts/` and write the file names in brand.md's Fonts table. Then ask Claude to "run prepare again".

**Updating the plugin.** `claude plugin marketplace update motion-graphics-studio`, then restart Claude Code.

**Removing it.** `claude plugin uninstall motion-graphics-studio@motion-graphics-studio`. Your motion folder and its files stay where they are.

## Manual setup

Only needed if the automatic setup in step 2 does not work. Install these, then start a new Claude session.

**Windows** (in PowerShell: press the Windows key, type PowerShell, press Enter):

```powershell
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Gyan.FFmpeg -e
winget install --id Git.Git -e
```

Close PowerShell and open it again so it finds the new programs.

**Mac** (in Terminal: Cmd + Space, type Terminal, Enter). If `brew --version` does not print a version, install Homebrew first with `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` and run the "Next steps" lines it prints. Then:

```bash
brew install node ffmpeg git
```

**Both**, once those are in:

```bash
node --version
npx --yes hyperframes skills
npx --yes hyperframes browser ensure
```

`node --version` must print v22 or higher (HyperFrames needs it). The other two install HyperFrames' instructions for Claude and the browser it renders with (about 115 MB). HyperFrames sends anonymous usage statistics; `npx --yes hyperframes telemetry disable` turns that off.

## Other tools

The plugin's skills are ordinary skill folders (`skills/motion-studio`, `skills/brand-setup`), so they can also be copied into other tools that read skills, such as Codex (copy both folders into `~/.agents/skills/`). The plugin may also work in Claude Cowork, but it needs Node and FFmpeg on the computer it runs on. Neither has been tested yet.

## Licence

This repository has no licence yet. Some library items are adapted from HyperFrames (Apache License 2.0): see `skills/motion-studio/library/THIRD-PARTY-NOTICES.md`.
