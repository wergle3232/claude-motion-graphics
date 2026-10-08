"""Mechanical jobs for motion pieces, so no model time is spent on them.

  python motion_tools.py contact  <video> <out.png> [--every 0.5] [--at 1,2.5] [--cols 6]
  python motion_tools.py phone    <out.png> <video-or-image>... [--at 1,2.5]
  python motion_tools.py stills   <video> <folder> --at 1,4,7 [--prefix slide-]
  python motion_tools.py clip     <video> <out.mp4> --from 2 --to 6
  python motion_tools.py preview  <video> <out.mp4>
  python motion_tools.py pdf      <out.pdf> <image>...
  python motion_tools.py refs     <video> <folder>
  python motion_tools.py check    <source> formats/video-16x9.html [--set theme=light]

contact: frames every N seconds (default: about 24 frames across the video), each
  labelled with its time, in a grid. This is what the critique reads for motion.
phone:   frames shown 360 pixels wide at actual size, one row per input, the way a
  phone shows them in a feed. Default times: 10, 30, 50, 70 and 90 percent.
stills:  PNG frames at given times (carousel, slide show and infographic slides).
clip:    a silent segment for a looping carousel slide.
preview: a web-friendly H.264 copy for HQ (1080 on the long side at most).
pdf:     joins images into one PDF (LinkedIn carousel, slide show).
refs:    a reference video's scene cuts as stills and a labelled contact sheet.
check:   runs `hyperframes check` on a format entry file (check itself only reads
  index.html), by checking a temporary copy where that file is index.html. --set id=value
  changes a composition variable's default in the copy, to check a variant such as a theme.

Needs ffmpeg and ffprobe on the path, and Pillow.
"""

import argparse
import re
import shutil
import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont



def font(size):
    for name in ("arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def run(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(f"Failed: {' '.join(map(str, cmd))}\n{result.stderr[-2000:]}")
    return result.stdout


def duration(video):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(video)])
    return float(json.loads(out)["format"]["duration"])


def is_image(path):
    return Path(path).suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")


def frame_at(video, t, out):
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(video), "-frames:v", "1", str(out)])
    return Image.open(out).convert("RGB")


def times_arg(text):
    return [float(x) for x in text.split(",") if x.strip()] if text else None


def stamp(seconds):
    return f"{int(seconds // 60)}:{seconds % 60:05.2f}"


def label(img, text):
    """Puts the label in a strip above the frame, so it never hides what is on it."""
    f = font(max(14, img.width // 20))
    h = f.size + 10
    out = Image.new("RGB", (img.width, img.height + h), (0, 0, 0))
    ImageDraw.Draw(out).text((6, 4), text, fill=(255, 255, 255), font=f)
    out.paste(img, (0, h))
    return out


def grid(tiles, cols, gap=6, bg=(40, 40, 40)):
    tw, th = tiles[0].width, tiles[0].height
    rows = math.ceil(len(tiles) / cols)
    sheet = Image.new("RGB", (cols * tw + (cols + 1) * gap, rows * th + (rows + 1) * gap), bg)
    for i, tile in enumerate(tiles):
        r, c = divmod(i, cols)
        sheet.paste(tile, (gap + c * (tw + gap), gap + r * (th + gap)))
    return sheet


def contact(args):
    total = duration(args.video)
    times = times_arg(args.at)
    if not times:
        every = args.every or max(0.5, round(total / 24 * 2) / 2)
        times = [round(i * every, 3) for i in range(int(total / every) + 1) if i * every < total - 0.25]
    with tempfile.TemporaryDirectory() as tmp:
        tiles = []
        for i, t in enumerate(times):
            img = frame_at(args.video, t, Path(tmp) / f"{i}.png")
            img.thumbnail((320, 320))
            tiles.append(label(img, stamp(t)))
    cols = args.cols or min(6, len(tiles))
    grid(tiles, cols).save(args.out)
    print(f"{args.out}: {len(tiles)} frames at {', '.join(stamp(t) for t in times)}")


def phone(args):
    rows = []
    with tempfile.TemporaryDirectory() as tmp:
        for n, source in enumerate(args.inputs):
            if is_image(source):
                imgs = [(Image.open(source).convert("RGB"), Path(source).name)]
            else:
                total = duration(source)
                times = times_arg(args.at) or [round(total * p, 2) for p in (0.1, 0.3, 0.5, 0.7, 0.9)]
                imgs = [(frame_at(source, t, Path(tmp) / f"{n}-{i}.png"), stamp(t)) for i, t in enumerate(times) if t < total]
            tiles = []
            for img, name in imgs:
                img = img.resize((360, round(img.height * 360 / img.width)), Image.LANCZOS)
                tiles.append(label(img, name))
            rows.append((Path(source).name, grid(tiles, len(tiles), bg=(255, 255, 255))))
    width = max(r.width for _, r in rows)
    f = font(18)
    height = sum(r.height + 30 for _, r in rows)
    sheet = Image.new("RGB", (width, height), (255, 255, 255))
    y = 0
    draw = ImageDraw.Draw(sheet)
    for name, row in rows:
        draw.text((8, y + 5), f"{name}, shown 360 pixels wide", fill=(0, 0, 0), font=f)
        sheet.paste(row, (0, y + 30))
        y += row.height + 30
    sheet.save(args.out)
    print(f"{args.out}: {len(rows)} rows")


def stills(args):
    folder = Path(args.folder)
    folder.mkdir(parents=True, exist_ok=True)
    for i, t in enumerate(times_arg(args.at), 1):
        out = folder / f"{args.prefix}{i}.png"
        frame_at(args.video, t, out)
        print(out)


def clip(args):
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(args.start), "-to", str(args.end), "-i", str(args.video),
         "-an", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(args.out)])
    print(args.out)


def preview(args):
    run(["ffmpeg", "-v", "error", "-y", "-i", str(args.video),
         "-vf", "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'",
         "-c:v", "libx264", "-crf", "23", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(args.out)])
    size = Path(args.out).stat().st_size / 1e6
    print(f"{args.out}: {size:.1f} MB" + ("  (over HQ's 40 MB limit)" if size > 40 else ""))


def pdf(args):
    pages = [Image.open(p).convert("RGB") for p in args.images]
    pages[0].save(args.out, save_all=True, append_images=pages[1:], resolution=72)
    print(f"{args.out}: {len(pages)} pages")


def refs(args):
    folder = Path(args.folder)
    folder.mkdir(parents=True, exist_ok=True)
    total = duration(args.video)

    def scene_cuts(threshold):
        out = subprocess.run(
            ["ffmpeg", "-v", "info", "-i", str(args.video), "-vf", f"select='gt(scene,{threshold})',showinfo", "-an", "-f", "null", "-"],
            capture_output=True, text=True,
        ).stderr
        return [0.0] + [float(part.split("pts_time:")[1].split()[0]) for part in out.splitlines() if "pts_time:" in part]

    # Live-action cuts show at 0.3. Motion graphics animate continuously, so when that
    # finds under one cut per 4 seconds, try 0.12 before giving up on cuts.
    cuts = scene_cuts(0.3)
    if len(cuts) < total / 4:
        cuts = scene_cuts(0.12)
    # One still a third of the way into each shot, so a transition isn't what gets captured.
    shots = [(a, b) for a, b in zip(cuts, cuts[1:] + [total]) if b - a > 0.15]
    tiles = []
    for i, (a, b) in enumerate(shots, 1):
        t = a + (b - a) / 3
        img = frame_at(args.video, t, folder / f"shot-{i:02d}.png")
        img.thumbnail((320, 320))
        tiles.append(label(img, f"{i} {stamp(a)} ({b - a:.1f}s)"))
    grid(tiles, min(6, len(tiles))).save(folder / "contact.png")
    lengths = [b - a for a, b in shots]
    print(f"{folder / 'contact.png'}: {len(shots)} shots in {total:.1f}s, average {sum(lengths) / len(lengths):.2f}s, "
          f"shortest {min(lengths):.2f}s, longest {max(lengths):.2f}s")


def check(args):
    source = Path(args.source).resolve()
    version = re.search(r"hyperframes@([\d.]+)", (source / "package.json").read_text())
    cli = f"hyperframes@{version.group(1)}" if version else "hyperframes"
    # A browser can still hold the copy open as check exits, so cleanup errors are ignored.
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp:
        copy = Path(tmp) / source.name
        shutil.copytree(source, copy, ignore=shutil.ignore_patterns("node_modules", "renders", "snapshots", ".hyperframes"))
        entry = (source / args.entry).read_text(encoding="utf-8")
        depth = len(Path(args.entry).parent.parts)
        if depth:
            entry = entry.replace("../" * depth, "")
        for pair in args.set or []:
            key, value = pair.split("=", 1)
            entry = re.sub(r'("id":"%s"[^}]*"default":")[^"]*(")' % re.escape(key), r"\g<1>%s\g<2>" % value, entry)
        (copy / "index.html").write_text(entry, encoding="utf-8")
        shutil.rmtree(copy / Path(args.entry).parts[0]) if depth else None
        result = subprocess.run(f"npx --yes {cli} check", cwd=copy, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print(f"{args.entry}:")
    print(result.stdout[-6000:] + result.stderr[-2000:])
    sys.exit(result.returncode)


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("contact"); c.add_argument("video"); c.add_argument("out")
    c.add_argument("--every", type=float); c.add_argument("--at"); c.add_argument("--cols", type=int)
    ph = sub.add_parser("phone"); ph.add_argument("out"); ph.add_argument("inputs", nargs="+"); ph.add_argument("--at")
    s = sub.add_parser("stills"); s.add_argument("video"); s.add_argument("folder"); s.add_argument("--at", required=True)
    s.add_argument("--prefix", default="slide-")
    cl = sub.add_parser("clip"); cl.add_argument("video"); cl.add_argument("out")
    cl.add_argument("--from", dest="start", type=float, required=True); cl.add_argument("--to", dest="end", type=float, required=True)
    pv = sub.add_parser("preview"); pv.add_argument("video"); pv.add_argument("out")
    pd = sub.add_parser("pdf"); pd.add_argument("out"); pd.add_argument("images", nargs="+")
    r = sub.add_parser("refs"); r.add_argument("video"); r.add_argument("folder")
    ck = sub.add_parser("check"); ck.add_argument("source"); ck.add_argument("entry"); ck.add_argument("--set", action="append")
    args = p.parse_args()
    {"contact": contact, "phone": phone, "stills": stills, "clip": clip, "preview": preview, "pdf": pdf, "refs": refs, "check": check}[args.cmd](args)


if __name__ == "__main__":
    main()
