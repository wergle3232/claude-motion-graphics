---
name: setup
description: Set up this computer for making motion graphics - check for and install Node.js, FFmpeg, Git and HyperFrames (its skills and its render browser), asking the user once before installing anything. Use when the user says "set up motion graphics", after installing the motion-graphics-studio plugin, or when the motion-studio skill finds a tool missing.
---

# Set up the computer

The plugin makes videos on the user's own computer, so it needs four things: **Node.js 22 or newer**, **FFmpeg**, **Git**, and **HyperFrames** (its skills for Claude and the small browser it renders with). This skill checks for them and installs what is missing. The user is not a developer: do the work, explain in one plain line what each thing is for, and never ask them to type commands unless a step below says so.

## 1. Check

Run each check and note what is missing. On Windows use PowerShell syntax if the shell is PowerShell.

| Need | Check | Good when |
|---|---|---|
| Node.js | `node --version` | v22 or higher |
| FFmpeg | `ffmpeg -version` | prints a version |
| Git | `git --version` | prints a version |
| HyperFrames skills | the folder `~/.claude/skills/hyperframes-core` exists (Windows: `$HOME\.claude\skills\hyperframes-core`) | it exists |
| Render browser | `npx --yes hyperframes doctor` | its "Chrome" line has a tick |

If everything is there, say so in one line ("Your computer is ready.") and skip to step 4.

## 2. Ask once

List what is missing in plain words and ask once, for example:

> To make videos on this computer I need to install: Node.js (runs the tools), FFmpeg (puts the video files together) and HyperFrames (turns designs into video). It takes about 5 minutes. Shall I install them?

Wait for yes.

## 3. Install

### Windows

Use winget (built into Windows 10 and 11). Install only what is missing:

```powershell
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
```

- Windows may show a "Do you want to allow this app to make changes" box for each; tell the user to click Yes.
- Newly installed programs are not visible to the running Claude session. After installing, either load the new PATH into the session:

  ```powershell
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
  ```

  and re-run the checks, or, if the checks still fail, ask the user to close Claude (the whole app or terminal) and open it again, then say "continue setup".
- If winget itself is missing (rare; very old Windows 10), ask the user to install "App Installer" from the Microsoft Store, then continue.

### Mac

If Homebrew is installed (`brew --version` works):

```bash
brew install node ffmpeg git
```

If Homebrew is not installed, it needs the user's Mac password, which Claude cannot type. Ask the user to open Terminal (Cmd + Space, type Terminal, Enter), paste this line, press Enter and type their Mac password when asked (nothing shows while typing):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

When it finishes it prints "Next steps": ask them to run those lines too, or to paste them to you. Then run `brew install node ffmpeg git` yourself (if `brew` is still not found in your session, try `/opt/homebrew/bin/brew` on Apple silicon or `/usr/local/bin/brew` on Intel Macs).

### Linux

Use the system's package manager for FFmpeg and Git (for example `sudo apt install ffmpeg git`, which needs the user's password: ask them to run it). For Node 22, point them to nodejs.org's download page if the system's version is older.

### HyperFrames (every system, once Node works)

```bash
npx --yes hyperframes skills
npx --yes hyperframes browser ensure
```

The first installs HyperFrames' skills for Claude (in the user's `.claude/skills` and `.agents/skills` folders); the second downloads the browser it renders with (about 115 MB). Tell the user HyperFrames sends anonymous usage statistics, and offer to turn them off with `npx --yes hyperframes telemetry disable`.

## 4. Confirm

Re-run the checks from step 1 and show a short list with a tick or a cross for each. Then run `npx --yes hyperframes doctor` and read it: crosses on whisper, TTS, MusicGen and Docker are optional and can be ignored; a cross on Node, FFmpeg or Chrome is not.

New HyperFrames skills load in a new session: if they were just installed, tell the user to start a new session (or restart the app) before making a piece.

Finally, if there is no `brand.md` in the working folder, offer to set up their brand next (the brand-setup skill).

## If something fails

Say what failed in one plain sentence, quote the error line, and give the matching manual step from the README's "Manual setup" section. Do not try more than two different ways to install the same thing; stop and ask.
