"""Builds preview clips of library items.

    python .claude/skills/motion-studio/library/make_previews.py <project> [item ...]

<project> is a HyperFrames project folder (made once with
`npx hyperframes init <project> --non-interactive --example=blank`). The script
copies each item into <project>/compositions/, writes an index.html that plays
the items one after another (each with its name in a corner and a short gap),
renders it, and cuts one preview clip per item into <project>/previews/.
With item names, only those items are previewed. Preview settings come from
PREVIEW below; anything not listed plays with the item's own defaults.
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
ITEMS = HERE / "items"
GAP = 0.6  # seconds of empty frame around each item, so a clip shows its start and end

# Settings used for each item's preview (its defaults when not listed).
PREVIEW: dict[str, dict] = {
    "se-open-to-screen": {"image": "assets/hq-strip.jpg"},
    "se-glass-cards": {"image": "assets/hq-today.jpg"},
}


def item_ids():
    return sorted(p.stem for p in ITEMS.glob("se-*.html"))


def base_length(item_id: str) -> float:
    html = (ITEMS / f"{item_id}.html").read_text(encoding="utf-8")
    start = html.index("data-composition-variables='") + len("data-composition-variables='")
    variables = json.loads(html[start : html.index("'>", start)])
    return float(next(v["default"] for v in variables if v["id"] == "length"))


def main():
    project = Path(sys.argv[1]).resolve()
    chosen = sys.argv[2:] or item_ids()
    comps = project / "compositions"
    comps.mkdir(exist_ok=True)
    slots, t = [], 0.0
    for item_id in chosen:
        shutil.copy(ITEMS / f"{item_id}.html", comps / f"{item_id}.html")
        values = PREVIEW.get(item_id, {})
        length = float(values.get("length", base_length(item_id)))
        slots.append((item_id, t + GAP, length, values))
        t += GAP + length + GAP
    total = round(t, 3)

    mounts, labels = [], []
    for i, (item_id, start, length, values) in enumerate(slots):
        mounts.append(
            f'      <div id="m{i}" class="clip" data-composition-id="{item_id}" '
            f'data-composition-src="compositions/{item_id}.html" '
            f"data-variable-values='{json.dumps(values)}' "
            f'data-start="{start:.3f}" data-duration="{length:.3f}" data-track-index="{i + 1}" '
            f'data-width="1920" data-height="1080" style="position:absolute;inset:0"></div>'
        )
        labels.append(
            f'      <div id="label{i}" class="label clip" data-start="{start - GAP:.3f}" data-duration="{length + 2 * GAP:.3f}" '
            f'data-track-index="0">{item_id}</div>'
        )
    index = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1920px; height: 1080px; overflow: hidden; background: #0a0a0f; }}
      #root {{ position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #0a0a0f; }}
      .label {{ position: absolute; left: 48px; top: 40px; font-family: "JetBrains Mono", monospace; font-size: 30px; color: #6b6b6b; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="1920" data-height="1080">
{chr(10).join(labels)}
{chr(10).join(mounts)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }}).set({{}}, {{}}, {total});
    </script>
  </body>
</html>
"""
    (project / "index.html").write_text(index, encoding="utf-8")
    render = project / "render.mp4"
    subprocess.run(
        ["npx", "hyperframes", "render", "--output", str(render), "--quality", "draft"],
        cwd=project, check=True, shell=sys.platform == "win32",
    )
    out = project / "previews"
    out.mkdir(exist_ok=True)
    for item_id, start, length, _ in slots:
        clip = out / f"{item_id}.mp4"
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{start - GAP / 2:.3f}", "-i", str(render),
             "-t", f"{length + GAP:.3f}", "-vf", "scale=960:-2", "-c:v", "libx264", "-pix_fmt", "yuv420p",
             "-crf", "23", "-an", str(clip)],
            check=True,
        )
        print(f"{clip}")


if __name__ == "__main__":
    main()
