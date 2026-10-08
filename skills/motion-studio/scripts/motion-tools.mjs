#!/usr/bin/env node
// Mechanical jobs for motion pieces, so no model time is spent on them.
// Needs Node 22+ (as HyperFrames does) and FFmpeg (ffmpeg and ffprobe on the PATH). No other installs.
//
// Run with no arguments, or with "help", to see every command.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.dirname(HERE);
const IS_WIN = process.platform === "win32";

const HELP = `motion-tools: mechanical jobs for motion pieces (Node + FFmpeg only)

Setting up a piece
  prepare  <source> --brand <brand.md>   brand.css from brand.md, brand fonts and logo
                                         copied in, GSAP and other CDN scripts made local
  brand-css <brand.md> [out.css]         only write the brand stylesheet (prints it if no out)
  item     <source> <item> [--size 1080x1920]
                                         copies a library item into the piece, sized for
                                         one format, and prints how to mount it
  check    <source> <entry.html> [--set id=value]
                                         HyperFrames check on a format entry file
                                         (check itself only reads index.html)

Looking at a render (the critique reads these)
  contact  <video> <out.png> [--every 0.5] [--at 1,2.5] [--cols 6]
  phone    <out.png> <video-or-image>... [--at 1,2.5]
  stills   <video> <folder> --at 1,4,7 [--prefix slide-]
  refs     <video> <folder>              a reference video's shots as stills + contact sheet

Making deliverables
  clip     <video> <out.mp4> --from 2 --to 6 [--loop]   a silent segment (carousel slide);
                                         --loop cross-fades the end into the start
  join     <out.mp4> <image-or-video>... [--each 2.5] [--size 1080x1350]
                                         plays slides one after another (carousel preview)
  pdf      <out.pdf> <image>...          one PDF from images (LinkedIn carousel)
  overlay-preview <overlay.mov|webm> <background.mp4|standin> <out.mp4>
                                         puts a transparent overlay over footage to check it
  standin  <out.mp4> [--size 1920x1080] [--length 10]
                                         a plain stand-in for talking-head footage
  web      <video> <out.mp4>             a small H.264 copy for sharing

Sound
  loudness <file>                        integrated loudness (LUFS) and true peak
  music    <in> <out.m4a> --length 15 [--from 0] [--fade-in 0.5] [--fade-out 2] [--lufs -15]
                                         cut, fade and level a music track for a piece
  normalize <video> <out.mp4> [--lufs -14 | --peak -3]
                                         levels the finished mix: --lufs for music or voice,
                                         --peak for effects only

Review and records
  page     <folder> [--title "..."]      writes <folder>/index.html: every render, sheet
                                         and note in the folder, with a notes panel
  review   <piece> [--port 4321]         serves the piece's pages; notes typed on a page
                                         are saved to <version>/feedback.md
  cost     <piece> --round "v1" [--session <id>] [--model <id>]
                                         adds this round's token use and API price to
                                         <piece>/cost.md (Claude Code only)
  library  <project> [item...]           preview clips of library items in <project>/previews
`;

// ---------- small helpers ----------

function die(msg) { console.error(msg); process.exit(1); }

function parseArgs(argv) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) opt[key] = true;
      else { (opt[key] = opt[key] === undefined ? next : [].concat(opt[key], next)); i++; }
    } else pos.push(a);
  }
  return { pos, opt };
}

function run(cmd, args, { allowFail = false, cwd } = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", cwd, maxBuffer: 1 << 28, shell: IS_WIN && /^(npm|npx)$/.test(cmd) });
  if (r.error) die(`Could not run ${cmd}: ${r.error.message}. Is it installed and on the PATH?`);
  if (r.status !== 0 && !allowFail) die(`Failed: ${cmd} ${args.join(" ")}\n${(r.stderr || "").slice(-2000)}`);
  return r;
}

const ff = (args, o) => run("ffmpeg", ["-hide_banner", "-v", "error", "-y", ...args], o);

function duration(file) {
  const r = run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "json", file]);
  return Number(JSON.parse(r.stdout).format.duration);
}

function size(file) {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", file]);
  const s = JSON.parse(r.stdout).streams[0];
  return { w: s.width, h: s.height };
}

function hasAudio(file) {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", file]);
  return r.stdout.trim().length > 0;
}

const isImage = (f) => /\.(png|jpe?g|webp)$/i.test(f);
const times = (s) => (s ? String(s).split(",").map(Number).filter((n) => Number.isFinite(n)) : null);
const stamp = (t) => (t < 60 ? `${t.toFixed(2)}s` : `${Math.floor(t / 60)}m${(t % 60).toFixed(2).padStart(5, "0")}s`);
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "motion-tools-"));
const rmrf = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch {} };

// drawtext needs a font; most FFmpeg builds find one through fontconfig. If a build
// cannot, frames are made without labels and the times are printed instead.
let labelsWork = null;
function labelFilter(text, fontsize) {
  const safe = text.replace(/[\\':%]/g, "");
  return `drawtext=text='${safe}':x=8:y=5:fontsize=${fontsize}:fontcolor=white`;
}

// One frame of a video (or an image) scaled to a width, with a label strip above it.
function tile(input, t, out, width, label) {
  const strip = Math.max(22, Math.round(width / 14));
  const base = `scale=${width}:-2,pad=iw:ih+${strip}:0:${strip}:black`;
  const pre = t == null ? [] : ["-ss", t.toFixed(3)];
  if (labelsWork !== false && label) {
    const r = ff([...pre, "-i", input, "-frames:v", "1", "-vf", `${base},${labelFilter(label, Math.round(strip * 0.7))}`, out], { allowFail: true });
    if (r.status === 0) { labelsWork = true; return; }
    labelsWork = false;
    console.error("Note: this FFmpeg cannot draw text, so frames have no time labels.");
  }
  ff([...pre, "-i", input, "-frames:v", "1", "-vf", base, out]);
}

// Lays out same-size images in a grid.
function grid(files, cols, out, bg = "0x282828") {
  const d = tmpdir();
  files.forEach((f, i) => fs.copyFileSync(f, path.join(d, `t${String(i).padStart(4, "0")}.png`)));
  const rows = Math.ceil(files.length / cols);
  ff(["-framerate", "1", "-i", path.join(d, "t%04d.png"), "-vf", `tile=${cols}x${rows}:padding=6:margin=6:color=${bg}`, "-frames:v", "1", out]);
  rmrf(d);
}

// ---------- looking at a render ----------

function contact({ pos, opt }) {
  const [video, out] = pos;
  if (!video || !out) die("contact <video> <out.png>");
  const total = duration(video);
  let ts = times(opt.at);
  if (!ts) {
    const every = Number(opt.every) || Math.max(0.5, Math.round((total / 24) * 2) / 2);
    ts = [];
    for (let t = 0; t < total - 0.2; t += every) ts.push(Math.round(t * 1000) / 1000);
  }
  const d = tmpdir();
  const files = ts.map((t, i) => { const f = path.join(d, `${i}.png`); tile(video, t, f, 320, stamp(t)); return f; });
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  grid(files, Number(opt.cols) || Math.min(6, files.length), out);
  rmrf(d);
  console.log(`${out}: ${files.length} frames at ${ts.map(stamp).join(", ")}`);
}

function phone({ pos, opt }) {
  const [out, ...inputs] = pos;
  if (!out || !inputs.length) die("phone <out.png> <video-or-image>...");
  const d = tmpdir();
  const rows = [];
  inputs.forEach((src, n) => {
    let frames;
    if (isImage(src)) frames = [[null, path.basename(src)]];
    else {
      const total = duration(src);
      frames = (times(opt.at) || [0.1, 0.3, 0.5, 0.7, 0.9].map((p) => Math.round(total * p * 100) / 100)).filter((t) => t < total).map((t) => [t, stamp(t)]);
    }
    const files = frames.map(([t, name], i) => { const f = path.join(d, `${n}-${i}.png`); tile(src, t, f, 360, name); return f; });
    const row = path.join(d, `row-${n}.png`);
    grid(files, files.length, row, "white");
    rows.push(row);
  });
  // Stack the rows, padded to the widest, each with a caption strip naming the input.
  const widths = rows.map((r) => size(r).w), W = Math.max(...widths);
  const args = [], parts = [];
  rows.forEach((r, i) => {
    args.push("-i", r);
    const cap = labelsWork === false ? "" : `,${labelFilter(`${path.basename(inputs[i])} shown 360 pixels wide`, 18).replace("fontcolor=white", "fontcolor=black")}`;
    parts.push(`[${i}:v]pad=${W}:ih+30:0:30:white${cap}[r${i}]`);
  });
  const filter = parts.join(";") + ";" + rows.map((_, i) => `[r${i}]`).join("") + (rows.length > 1 ? `vstack=inputs=${rows.length}[o]` : "null[o]");
  ff([...args, "-filter_complex", filter, "-map", "[o]", "-frames:v", "1", out]);
  rmrf(d);
  console.log(`${out}: ${rows.length} rows (${inputs.map((i) => path.basename(i)).join(", ")})`);
}

function stills({ pos, opt }) {
  const [video, folder] = pos;
  const ts = times(opt.at);
  if (!video || !folder || !ts) die("stills <video> <folder> --at 1,4,7 [--prefix slide-]");
  fs.mkdirSync(folder, { recursive: true });
  ts.forEach((t, i) => {
    const out = path.join(folder, `${opt.prefix || "slide-"}${i + 1}.png`);
    ff(["-ss", t.toFixed(3), "-i", video, "-frames:v", "1", out]);
    console.log(out);
  });
}

function refs({ pos }) {
  const [video, folder] = pos;
  if (!video || !folder) die("refs <video> <folder>");
  fs.mkdirSync(folder, { recursive: true });
  const total = duration(video);
  const cuts = (th) => {
    const r = run("ffmpeg", ["-hide_banner", "-i", video, "-vf", `select='gt(scene,${th})',showinfo`, "-an", "-f", "null", "-"], { allowFail: true });
    return [0, ...[...r.stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]))];
  };
  // Live-action cuts show at 0.3. Motion graphics change continuously, so when that
  // finds under one cut per 4 seconds, try 0.12.
  let c = cuts(0.3);
  if (c.length < total / 4) c = cuts(0.12);
  const shots = c.map((a, i) => [a, c[i + 1] ?? total]).filter(([a, b]) => b - a > 0.15);
  const files = shots.map(([a, b], i) => {
    const f = path.join(folder, `shot-${String(i + 1).padStart(2, "0")}.png`);
    tile(video, a + (b - a) / 3, f, 320, `${i + 1} ${stamp(a)} (${(b - a).toFixed(1)}s)`);
    return f;
  });
  grid(files, Math.min(6, files.length), path.join(folder, "contact.png"));
  const L = shots.map(([a, b]) => b - a);
  console.log(`${path.join(folder, "contact.png")}: ${shots.length} shots in ${total.toFixed(1)}s, average ${(L.reduce((x, y) => x + y, 0) / L.length).toFixed(2)}s, shortest ${Math.min(...L).toFixed(2)}s, longest ${Math.max(...L).toFixed(2)}s`);
}

// ---------- deliverables ----------

function clip({ pos, opt }) {
  const [video, out] = pos;
  const a = Number(opt.from), b = Number(opt.to);
  if (!video || !out || !(b > a)) die("clip <video> <out.mp4> --from 2 --to 6 [--loop]");
  const enc = ["-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
  if (!opt.loop) { ff(["-ss", String(a), "-to", String(b), "-i", video, ...enc, out]); console.log(out); return; }
  // A loop that does not jump: the last 0.4 s cross-fades into the first frames.
  const x = Math.min(0.4, (b - a) / 4), len = b - a;
  ff(["-ss", String(a), "-to", String(b), "-i", video, "-filter_complex",
    `[0:v]split[m][h];[h]trim=0:${x},setpts=PTS-STARTPTS[head];[m]trim=${x}:${len},setpts=PTS-STARTPTS[body];` +
    `[body][head]xfade=transition=fade:duration=${x}:offset=${(len - 2 * x).toFixed(3)}[o]`, "-map", "[o]", ...enc, out]);
  console.log(`${out} (loops: ends on its first frame)`);
}

function join({ pos, opt }) {
  const [out, ...inputs] = pos;
  if (!out || !inputs.length) die("join <out.mp4> <image-or-video>... [--each 2.5] [--size 1080x1350]");
  const each = Number(opt.each) || 2.5;
  const [W, H] = (opt.size || "").split("x").map(Number);
  const s0 = W ? { w: W, h: H } : (isImage(inputs[0]) ? size(inputs[0]) : size(inputs[0]));
  const args = [], parts = [];
  inputs.forEach((f, i) => {
    if (isImage(f)) args.push("-loop", "1", "-t", String(each), "-i", f); else args.push("-i", f);
    parts.push(`[${i}:v]scale=${s0.w}:${s0.h}:force_original_aspect_ratio=decrease,pad=${s0.w}:${s0.h}:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,setsar=1[v${i}]`);
  });
  const filter = parts.join(";") + ";" + inputs.map((_, i) => `[v${i}]`).join("") + `concat=n=${inputs.length}:v=1:a=0[o]`;
  ff([...args, "-filter_complex", filter, "-map", "[o]", "-c:v", "libx264", "-crf", "18", "-movflags", "+faststart", out]);
  console.log(`${out}: ${inputs.length} parts`);
}

function pdf({ pos }) {
  const [out, ...images] = pos;
  if (!out || !images.length) die("pdf <out.pdf> <image>...");
  const d = tmpdir();
  const objs = [];
  const add = (body) => { objs.push(body); return objs.length; };
  const pageIds = [];
  const catalog = add(null), pages = add(null);
  images.forEach((img, i) => {
    const jpg = path.join(d, `${i}.jpg`);
    ff(["-i", img, "-q:v", "2", "-pix_fmt", "yuvj420p", jpg]);
    const { w, h } = size(jpg);
    const data = fs.readFileSync(jpg);
    const im = add(Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`), data, Buffer.from("\nendstream")]));
    const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
    const c = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    pageIds.push(add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${c} 0 R >>`));
  });
  objs[catalog - 1] = `<< /Type /Catalog /Pages ${pages} 0 R >>`;
  objs[pages - 1] = `<< /Type /Pages /Kids [${pageIds.map((p) => `${p} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  const chunks = [Buffer.from("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n", "binary")];
  const offsets = [];
  let len = chunks[0].length;
  objs.forEach((body, i) => {
    offsets.push(len);
    const b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), Buffer.isBuffer(body) ? body : Buffer.from(body), Buffer.from("\nendobj\n")]);
    chunks.push(b); len += b.length;
  });
  const xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
    `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${len}\n%%EOF\n`;
  chunks.push(Buffer.from(xref));
  fs.writeFileSync(out, Buffer.concat(chunks));
  rmrf(d);
  console.log(`${out}: ${images.length} pages`);
}

function standin({ pos, opt }) {
  const [out] = pos;
  if (!out) die("standin <out.mp4> [--size 1920x1080] [--length 10]");
  const [W, H] = (opt.size || "1920x1080").split("x").map(Number);
  const len = Number(opt.length) || 10;
  // A soft background and a grey head-and-shoulders shape, slowly breathing, so an
  // overlay can be judged against something that looks like a person on camera.
  const cx = W * 0.5, hy = H * 0.42, hr = Math.min(W, H) * 0.13, sy = H * 0.95, sw = Math.min(W, H) * 0.42;
  const geq = `geq=r='if(lt(hypot(X-${cx},(Y-${hy})*1.08),${hr}*(1+0.01*sin(T*2))),118,if(lt(hypot((X-${cx})/${sw},(Y-${sy})/${H * 0.36}),1),70,40+30*Y/H))':` +
    `g='if(lt(hypot(X-${cx},(Y-${hy})*1.08),${hr}*(1+0.01*sin(T*2))),104,if(lt(hypot((X-${cx})/${sw},(Y-${sy})/${H * 0.36}),1),74,46+28*Y/H))':` +
    `b='if(lt(hypot(X-${cx},(Y-${hy})*1.08),${hr}*(1+0.01*sin(T*2))),96,if(lt(hypot((X-${cx})/${sw},(Y-${sy})/${H * 0.36}),1),88,58+30*Y/H))'`;
  ff(["-f", "lavfi", "-i", `color=c=black:s=${W}x${H}:r=30:d=${len}`, "-vf", `${geq},gblur=sigma=3,format=yuv420p`, "-c:v", "libx264", "-crf", "20", out]);
  console.log(`${out}: ${W}x${H}, ${len}s stand-in (not a real person)`);
}

function overlayPreview({ pos }) {
  const [overlay, bg, out] = pos;
  if (!overlay || !bg || !out) die("overlay-preview <overlay.mov|webm> <background.mp4|standin> <out.mp4>");
  const { w, h } = size(overlay), len = duration(overlay);
  let back = bg;
  const d = tmpdir();
  if (bg === "standin") { back = path.join(d, "standin.mp4"); standin({ pos: [back], opt: { size: `${w}x${h}`, length: String(Math.ceil(len)) } }); }
  // WebM alpha needs the libvpx decoder to keep transparency.
  const ovIn = /\.webm$/i.test(overlay) ? ["-c:v", "libvpx-vp9", "-i", overlay] : ["-i", overlay];
  ff(["-stream_loop", "-1", "-i", back, ...ovIn, "-filter_complex", `[0:v]scale=${w}:${h},setsar=1[b];[b][1:v]overlay=0:0:shortest=1,format=yuv420p[o]`,
    "-map", "[o]", ...(hasAudio(overlay) ? ["-map", "1:a"] : []), "-t", String(len), "-c:v", "libx264", "-crf", "18", "-movflags", "+faststart", out]);
  rmrf(d);
  console.log(out);
}

function web({ pos }) {
  const [video, out] = pos;
  if (!video || !out) die("web <video> <out.mp4>");
  ff(["-i", video, "-vf", "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'", "-c:v", "libx264", "-crf", "23", "-preset", "medium",
    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", out]);
  console.log(`${out}: ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
}

// ---------- sound ----------

function measure(file) {
  const r = run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"], { allowFail: true });
  const s = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  const I = s.match(/I:\s+(-?[\d.]+|-inf) LUFS/), P = s.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/);
  return { lufs: I ? Number(I[1]) : null, peak: P ? Number(P[1]) : null };
}

function loudness({ pos }) {
  const [file] = pos;
  if (!file) die("loudness <file>");
  if (!hasAudio(file)) { console.log(`${file}: no sound track (silent)`); return; }
  const { lufs, peak } = measure(file);
  const ok = lufs >= -16.5 && lufs <= -13.5 && peak <= -1;
  console.log(`${file}: ${lufs} LUFS integrated, true peak ${peak} dBTP. ${ok ? "Within the social range (-16 to -14 LUFS, peak under -1)." : "Outside the social range (aim -16 to -14 LUFS, peak under -1 dBTP): run normalize."}`);
}

function music({ pos, opt }) {
  const [input, out] = pos;
  const len = Number(opt.length);
  if (!input || !out || !len) die("music <in> <out.m4a> --length 15 [--from 0] [--fade-in 0.5] [--fade-out 2] [--lufs -15]");
  const from = Number(opt.from) || 0, fi = Number(opt["fade-in"] ?? 0.3), fo = Number(opt["fade-out"] ?? 2), target = Number(opt.lufs ?? -15);
  ff(["-ss", String(from), "-t", String(len), "-i", input, "-af",
    `afade=t=in:d=${fi},afade=t=out:st=${Math.max(0, len - fo)}:d=${fo},loudnorm=I=${target}:TP=-1.5:LRA=11`, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", out]);
  const m = measure(out);
  console.log(`${out}: ${len}s from ${from}s, ${m.lufs} LUFS, peak ${m.peak} dBTP`);
}

function normalize({ pos, opt }) {
  const [video, out] = pos;
  if (!video || !out) die("normalize <video> <out.mp4> [--lufs -14 | --peak -3]");
  if (!hasAudio(video)) die(`${video} has no sound track.`);
  if (opt.peak !== undefined) {
    // Effects only (no music or voice): loudness over mostly-silence means little, so the
    // whole mix is raised or lowered until its loudest moment reaches the peak asked for.
    const before = measure(video), gain = Number(opt.peak) - before.peak;
    ff(["-i", video, "-c:v", "copy", "-af", `volume=${gain.toFixed(2)}dB`, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
    const m = measure(out);
    console.log(`${out}: peak ${m.peak} dBTP (was ${before.peak}), ${m.lufs} LUFS`);
    return;
  }
  const target = Number(opt.lufs ?? -14);
  // Two passes: measure, then correct linearly so the mix keeps its dynamics.
  const r = run("ffmpeg", ["-hide_banner", "-i", video, "-af", `loudnorm=I=${target}:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"], { allowFail: true });
  const j = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf("{"), r.stderr.lastIndexOf("}") + 1));
  const af = `loudnorm=I=${target}:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
  ff(["-i", video, "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
  const m = measure(out);
  console.log(`${out}: ${m.lufs} LUFS, peak ${m.peak} dBTP (was ${j.input_i} LUFS)`);
}

// ---------- brand ----------

const ROLE_WORDS = [
  ["accent-3", /third accent|accent 3|tertiary/],
  ["accent-2", /second accent|accent 2|secondary accent|secondary colou?r/],
  ["muted", /muted|secondary text|subtle|caption/],
  ["border", /border|line|divider|stroke/],
  ["surface", /surface|card|panel/],
  ["bg", /background|^bg\b|canvas/],
  ["text", /text|foreground|ink/],
  ["accent", /accent|primary|brand colou?r|highlight/],
];
const FONT_WORDS = [["mono", /mono|number|label|code|data/], ["display", /headline|heading|display|title/], ["body", /body|text|paragraph|copy/]];

function section(md, name) {
  const m = md.match(new RegExp(`^##\\s+${name}[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`, "mi"));
  return m ? m[1] : "";
}

function tableRows(text) {
  return text.split("\n").filter((l) => /^\s*\|/.test(l) && !/^\s*\|\s*-/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())).slice(1);
}

const hexOk = (h) => /^#[0-9a-f]{6}$/i.test(h);
const toRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => "#" + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => toHex(toRgb(a).map((x, i) => x * t + toRgb(b)[i] * (1 - t)));
const lum = (h) => { const c = toRgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

function readBrand(brandFile) {
  const md = fs.readFileSync(brandFile, "utf8");
  const dark = {}, light = {}, fonts = {}, fontFiles = [], googleFonts = [], warnings = [];
  for (const row of tableRows(section(md, "Colou?rs"))) {
    const role = (row[0] || "").toLowerCase(), hex = (row.find((c) => /#[0-9a-f]{6}\b/i.test(c)) || "").match(/#[0-9a-f]{6}/i);
    if (!hex) continue;
    const key = (ROLE_WORDS.find(([, re]) => re.test(role.replace(/\(light\)/, ""))) || [])[0];
    if (!key) { warnings.push(`Colour row not understood: "${row[0]}"`); continue; }
    (/\(light\)|light /.test(role) ? light : dark)[key] = hex[0].toUpperCase();
  }
  const fontRows = tableRows(section(md, "Fonts?"));
  for (const row of fontRows) {
    const role = (row[0] || "").toLowerCase(), family = (row[1] || "").replace(/["'`*]/g, "").trim(), from = row[3] || row[2] || "";
    const key = (FONT_WORDS.find(([, re]) => re.test(role)) || [])[0];
    if (!key || !family) continue;
    if (!fonts[key]) fonts[key] = family;
    const weights = [...String(row[2] || "").matchAll(/\b([1-9]00)\b/g)].map((m) => m[1]);
    if (/google/i.test(from) && !googleFonts.find((g) => g.family === family)) googleFonts.push({ family, weights });
    else if (/google/i.test(from)) googleFonts.find((g) => g.family === family).weights.push(...weights);
    const files = [...from.matchAll(/[\w./\\-]+\.(woff2?|ttf|otf)/gi)].map((m) => m[0]);
    for (const f of files) {
      const abs = path.resolve(path.dirname(brandFile), f);
      if (fs.existsSync(abs)) {
        const weight = (from.match(/\b([1-9]00)\b/) || row[2]?.match(/\b([1-9]00)\b/) || [, "400"])[1];
        fontFiles.push({ family, abs, weight: /bold/i.test(f) && weight === "400" ? "700" : weight, italic: /italic/i.test(f) });
      } else warnings.push(`Font file in brand.md not found: ${f}`);
    }
  }
  const logos = [...section(md, "Logos?").matchAll(/([\w./\\ -]+\.(svg|png|jpe?g|webp))/gi)].map((m) => m[1].trim()).map((f) => path.resolve(path.dirname(brandFile), f)).filter((f) => fs.existsSync(f));
  return { md, dark, light, fonts, fontFiles, googleFonts, logos, warnings };
}

function fillColours(c, fallbackBg) {
  const o = { ...c };
  if (!o.bg) o.bg = fallbackBg;
  if (!o.text) o.text = lum(o.bg) > 0.4 ? "#111111" : "#F5F5F5";
  if (!o.accent) o.accent = o.text;
  if (!o.surface) o.surface = mix(o.text, o.bg, 0.07);
  if (!o.muted) o.muted = mix(o.text, o.bg, 0.62);
  if (!o.border) o.border = mix(o.text, o.bg, 0.18);
  if (!o["accent-2"]) o["accent-2"] = o.accent;
  if (!o["accent-3"]) o["accent-3"] = o["accent-2"];
  return o;
}

function brandCss(brandFile, cssOut, fontUrl = "fonts", fontsDir = null) {
  const b = readBrand(brandFile);
  if (!Object.keys(b.dark).length && !Object.keys(b.light).length) die(`${brandFile}: no colours found. The "## Colours" table needs rows like "| Background | #0B0C0E | ... |".`);
  const main = fillColours(Object.keys(b.dark).length ? b.dark : b.light, "#0B0C0E");
  const lightSet = Object.keys(b.dark).length && Object.keys(b.light).length ? fillColours(b.light, "#FFFFFF") : null;
  const q = (f) => (f ? `"${f}"` : null);
  const fonts = { display: q(b.fonts.display || b.fonts.body) || '"Inter"', body: q(b.fonts.body || b.fonts.display) || '"Inter"', mono: q(b.fonts.mono) || '"JetBrains Mono"' };
  const vars = (c) => Object.entries(c).map(([k, v]) => `  --brand-${k}: ${v};`).join("\n");
  const notes = [...b.warnings];
  const google = fontsDir ? b.googleFonts.map((g) => googleFont(g.family, g.weights, fontsDir, fontUrl)) : [];
  google.forEach((g) => g.note && notes.push(g.note));
  const faces = [...google.map((g) => g.css), ...b.fontFiles.map((f) => `@font-face { font-family: "${f.family}"; src: url("${fontUrl}/${path.basename(f.abs)}"); font-weight: ${f.weight}; font-style: ${f.italic ? "italic" : "normal"}; font-display: block; }`)].filter(Boolean).join("\n");
  const css = `/* Made from brand.md by motion-tools. Do not edit: change brand.md and run prepare again. */
${faces}
:root {
${vars(main)}
  --brand-font-display: ${fonts.display};
  --brand-font-body: ${fonts.body};
  --brand-font-mono: ${fonts.mono};
  /* The same values under HyperFrames' token names, for registry blocks and library items that use them. */
  --bg: var(--brand-bg); --fg: var(--brand-text); --surface: var(--brand-surface); --muted: var(--brand-muted); --border: var(--brand-border);
  --brand: var(--brand-accent); --accent: var(--brand-accent-2); --accent-2: var(--brand-accent-3);
  --font-display: var(--brand-font-display), sans-serif; --font-body: var(--brand-font-body), sans-serif; --font-mono: var(--brand-font-mono), monospace;
}
${lightSet ? `[data-theme="light"] {\n${vars(lightSet)}\n}\n` : ""}`;
  // Readability checks the critique would otherwise find late.
  const chk = (c, name) => {
    const t = contrast(c.text, c.bg), a = contrast(c.accent, c.bg), m = contrast(c.muted, c.bg);
    if (t < 4.5) notes.push(`${name}: text on background contrast ${t.toFixed(1)}:1, under 4.5:1.`);
    if (a < 3) notes.push(`${name}: accent on background contrast ${a.toFixed(1)}:1, under 3:1; do not use it for text.`);
    if (m < 3) notes.push(`${name}: muted text on background contrast ${m.toFixed(1)}:1, under 3:1; keep it for large labels only.`);
  };
  chk(main, "Main colours");
  if (lightSet) chk(lightSet, "Light colours");
  if (cssOut) { fs.mkdirSync(path.dirname(cssOut), { recursive: true }); fs.writeFileSync(cssOut, css); }
  return { css, brand: b, notes, main, lightSet, fonts };
}

// ---------- prepare: brand, fonts and local scripts ----------

// Downloads a Google font's Latin files into <dir> and returns @font-face rules that point
// at them. HyperFrames only fetches fonts it sees named directly in a font-family, not ones
// held in a CSS variable, so the brand's fonts are made local here instead.
function googleFont(family, weights, dir, urlPrefix) {
  const ws = [...new Set(["400", "700", ...weights])].sort();
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
  const get = (spec) => run("curl", ["-sS", "-f", "-A", ua, `https://fonts.googleapis.com/css2?family=${spec}&display=block`], { allowFail: true });
  const name = family.replace(/ /g, "+");
  let r = get(`${name}:wght@${ws.join(";")}`);
  if (r.status !== 0) r = get(name);
  if (r.status !== 0) return { css: "", note: `Could not get "${family}" from Google Fonts (is the name exactly as on fonts.google.com, and is the computer online?).` };
  fs.mkdirSync(dir, { recursive: true });
  const rules = [];
  for (const m of r.stdout.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face \{([^}]*)\}/g)) {
    if (!["latin", "latin-ext"].includes(m[1])) continue;
    const body = m[2], url = (body.match(/url\((https:[^)]+)\)/) || [])[1];
    if (!url) continue;
    const weight = (body.match(/font-weight: (\d+)/) || [, "400"])[1], style = (body.match(/font-style: (\w+)/) || [, "normal"])[1];
    const file = `${family.replace(/\W+/g, "")}-${weight}${style === "italic" ? "i" : ""}-${m[1]}.woff2`;
    if (!fs.existsSync(path.join(dir, file))) run("curl", ["-sS", "-f", "-o", path.join(dir, file), url]);
    const range = (body.match(/unicode-range: ([^;]+);/) || [])[1];
    rules.push(`@font-face { font-family: "${family}"; src: url("${urlPrefix}/${file}") format("woff2"); font-weight: ${weight}; font-style: ${style}; font-display: block;${range ? ` unicode-range: ${range};` : ""} }`);
  }
  return { css: rules.join("\n"), note: rules.length ? "" : `Google Fonts sent no Latin files for "${family}".` };
}

function htmlFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "renders", ".hyperframes", "snapshots"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...htmlFiles(p)); else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function npmFile(pkg, ver, file) {
  const cache = path.join(os.homedir(), ".cache", "claude-motion-graphics", "vendor", `${pkg.replace("/", "+")}@${ver}`);
  const target = path.join(cache, "package", file);
  if (fs.existsSync(target)) return target;
  fs.mkdirSync(cache, { recursive: true });
  const r = run("npm", ["pack", `${pkg}@${ver}`, "--silent"], { cwd: cache });
  const tgz = r.stdout.trim().split("\n").pop();
  run("tar", ["xzf", tgz], { cwd: cache });
  if (!fs.existsSync(target)) die(`${pkg}@${ver} has no file ${file}`);
  return target;
}

function vendor(source) {
  const re = /(<script[^>]*\ssrc=")https:\/\/(?:cdn\.jsdelivr\.net\/npm|unpkg\.com)\/((?:@[\w.-]+\/)?[\w.-]+)@([\w.-]+)\/([^"]+)(")/g;
  let n = 0;
  for (const f of htmlFiles(source)) {
    const s = fs.readFileSync(f, "utf8");
    const t = s.replace(re, (all, pre, pkg, ver, file, post) => {
      const src = npmFile(pkg, ver, file);
      const rel = path.join("assets", "vendor", `${pkg}@${ver}`, file);
      fs.mkdirSync(path.dirname(path.join(source, rel)), { recursive: true });
      fs.copyFileSync(src, path.join(source, rel));
      n++;
      return pre + path.relative(path.dirname(f), path.join(source, rel)).split(path.sep).join("/") + post;
    });
    if (t !== s) fs.writeFileSync(f, t);
  }
  return n;
}

function linkBrand(source) {
  let n = 0;
  for (const f of htmlFiles(source)) {
    const s = fs.readFileSync(f, "utf8");
    // Sub-compositions (a <template>) inherit the host's styles, so only entry files link it.
    if (/<template>/.test(s) || /brand\.css/.test(s) || !/<head>/i.test(s)) continue;
    const href = path.relative(path.dirname(f), path.join(source, "shared", "brand.css")).split(path.sep).join("/");
    fs.writeFileSync(f, s.replace(/<head>/i, `<head>\n    <link rel="stylesheet" href="${href}" />`));
    n++;
  }
  return n;
}

function prepare({ pos, opt }) {
  const [source] = pos;
  if (!source || !fs.existsSync(path.join(source, "index.html"))) die("prepare <source> --brand <brand.md>   (source is a HyperFrames project: it has index.html)");
  const out = [];
  if (opt.brand) {
    const dest = path.join(source, "assets", "brand");
    // Fonts sit next to brand.css (shared/fonts/), so its url()s need no "../", which HyperFrames' lint rejects.
    const fontDir = path.join(source, "shared", "fonts");
    const { brand, notes, fonts } = brandCss(opt.brand, path.join(source, "shared", "brand.css"), "fonts", fontDir);
    for (const f of brand.fontFiles) { fs.mkdirSync(fontDir, { recursive: true }); fs.copyFileSync(f.abs, path.join(fontDir, path.basename(f.abs))); }
    for (const l of brand.logos) { fs.mkdirSync(dest, { recursive: true }); fs.copyFileSync(l, path.join(dest, path.basename(l))); }
    out.push(`shared/brand.css written (fonts: ${fonts.display}, ${fonts.body}, ${fonts.mono}; ${brand.googleFonts.length} Google fonts and ${brand.fontFiles.length} font files made local in shared/fonts/, ${brand.logos.length} logos copied to assets/brand/)`);
    out.push(`brand.css linked from ${linkBrand(source)} entry file(s)`);
    notes.forEach((n) => out.push(`Check: ${n}`));
  }
  out.push(`${vendor(source)} CDN script(s) made local in assets/vendor/`);
  console.log(out.join("\n"));
}

// ---------- check a format entry file ----------

function check({ pos, opt }) {
  const [source, entry] = pos;
  if (!source || !entry) die("check <source> <entry.html> [--set id=value]");
  const src = path.resolve(source);
  const pin = (fs.readFileSync(path.join(src, "package.json"), "utf8").match(/hyperframes@([\d.]+)/) || [])[1];
  const d = tmpdir(), copy = path.join(d, path.basename(src));
  fs.cpSync(src, copy, { recursive: true, filter: (p) => !/(node_modules|renders|snapshots|\.hyperframes)$/.test(p) });
  let html = fs.readFileSync(path.join(src, entry), "utf8");
  const depth = path.dirname(entry) === "." ? 0 : path.dirname(entry).split(/[\\/]/).length;
  // Paths in a format file are relative to it ("../shared/..."), except data-composition-src,
  // which HyperFrames reads from the project root. Make the copy behave as the render does:
  // drop the "../" from file-relative paths, and flag a composition path that has one.
  if (depth) {
    const bad = [...html.matchAll(/data-composition-src="(\.\.\/[^"]*)"/g)].map((m) => m[1]);
    if (bad.length) die(`${entry}: data-composition-src must be written from the project root ("compositions/x.html"), not "${bad[0]}". The render cannot find it.`);
    html = html.split("../".repeat(depth)).join("");
  }
  for (const pair of [].concat(opt.set || [])) {
    const [k, v] = pair.split("=");
    html = html.replace(new RegExp(`("id"\\s*:\\s*"${k}"[^}]*"default"\\s*:\\s*")[^"]*(")`), `$1${v}$2`);
  }
  fs.writeFileSync(path.join(copy, "index.html"), html);
  if (depth) rmrf(path.join(copy, entry.split(/[\\/]/)[0]));
  const r = run("npx", ["--yes", pin ? `hyperframes@${pin}` : "hyperframes", "check"], { cwd: copy, allowFail: true });
  rmrf(d);
  console.log(`${entry}:\n${(r.stdout || "").slice(-6000)}${(r.stderr || "").slice(-2000)}`);
  process.exit(r.status || 0);
}

// ---------- review page and server ----------

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function page({ pos, opt }) {
  const [folder] = pos;
  if (!folder || !fs.existsSync(folder)) die("page <folder> [--title ...]");
  const all = fs.readdirSync(folder, { recursive: true }).map((f) => f.split(path.sep).join("/")).filter((f) => !f.startsWith("index.html")).sort();
  const videos = all.filter((f) => /\.(mp4|webm|mov)$/i.test(f));
  const sheets = all.filter((f) => /(^|\/)(contact|phone)[^/]*\.png$/i.test(f));
  const images = all.filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !sheets.includes(f));
  const docs = all.filter((f) => /\.(md|txt)$/i.test(f) && !/feedback\.md$/.test(f));
  const pdfs = all.filter((f) => /\.pdf$/i.test(f));
  const title = opt.title || `${path.basename(path.dirname(path.resolve(folder)))} / ${path.basename(path.resolve(folder))}`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
:root { --bg:#f6f5f2; --fg:#1b1b1b; --muted:#6b6b6b; --card:#fff; --line:#e3e1dc; --accent:#2457ff; }
@media (prefers-color-scheme: dark) { :root { --bg:#141414; --fg:#eee; --muted:#9a9a9a; --card:#1e1e1e; --line:#333; --accent:#7b9bff; } }
* { box-sizing: border-box; } body { margin:0; font: 16px/1.5 system-ui, sans-serif; background:var(--bg); color:var(--fg); }
main { max-width: 1200px; margin: 0 auto; padding: 24px 16px 120px; } h1 { font-size: 24px; margin: 0 0 4px; } h2 { font-size: 18px; margin: 32px 0 12px; }
p.hint { color: var(--muted); margin: 0 0 16px; } .grid { display:grid; gap:16px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
figure { margin:0; background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px; }
figcaption { font-size: 14px; color: var(--muted); margin-top: 6px; word-break: break-all; }
video, img { width:100%; height:auto; display:block; border-radius:6px; background: repeating-conic-gradient(#bbb 0 25%, #eee 0 50%) 0 0/20px 20px; }
.sheet img { background:none; } pre { white-space: pre-wrap; background:var(--card); border:1px solid var(--line); border-radius:10px; padding:12px; font-size:14px; }
button { font: inherit; border:1px solid var(--line); background:var(--card); color:var(--fg); border-radius:8px; padding:6px 12px; cursor:pointer; }
button.primary { background: var(--accent); color:#fff; border-color: var(--accent); }
#notes { position: fixed; right: 16px; bottom: 16px; width: min(420px, calc(100vw - 32px)); background:var(--card); border:1px solid var(--line); border-radius:12px; padding:12px; box-shadow: 0 8px 30px rgba(0,0,0,.18); }
#notes textarea { width:100%; min-height: 70px; font: inherit; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--bg); color:var(--fg); }
#list { max-height: 30vh; overflow:auto; font-size: 14px; margin: 8px 0; padding-left: 18px; } .row { display:flex; gap:8px; flex-wrap: wrap; }
#status { font-size: 13px; color: var(--muted); }
</style></head><body><main>
<h1>${esc(title)}</h1>
<p class="hint">To leave a note: pause a video where something is wrong, type in the box at the bottom right and press Add note. The time and the video's name are added for you.</p>
${videos.length ? `<h2>Videos</h2><div class="grid">${videos.map((v) => `<figure><video controls preload="metadata" src="${esc(v)}" data-name="${esc(v)}"></video><figcaption>${esc(v)}</figcaption></figure>`).join("")}</div>` : ""}
${sheets.length ? `<h2>Contact sheet and phone test</h2>${sheets.map((s) => `<figure class="sheet"><a href="${esc(s)}"><img src="${esc(s)}" alt="${esc(s)}"></a><figcaption>${esc(s)}</figcaption></figure>`).join("")}` : ""}
${images.length ? `<h2>Frames and slides</h2><div class="grid">${images.map((s) => `<figure><a href="${esc(s)}"><img src="${esc(s)}" alt="${esc(s)}" data-name="${esc(s)}"></a><figcaption>${esc(s)}</figcaption></figure>`).join("")}</div>` : ""}
${pdfs.length ? `<h2>PDF</h2>${pdfs.map((p) => `<p><a href="${esc(p)}">${esc(p)}</a></p>`).join("")}` : ""}
${docs.map((d) => `<h2>${esc(d)}</h2><pre>${esc(fs.readFileSync(path.join(folder, d), "utf8"))}</pre>`).join("")}
</main>
<div id="notes"><strong>Notes</strong>
<ol id="list"></ol>
<textarea id="text" placeholder="What should change? For example: the logo comes in too late"></textarea>
<div class="row"><button class="primary" id="add">Add note</button><button id="save">Save notes</button><button id="copy">Copy notes</button></div>
<div id="status"></div></div>
<script>
(function () {
  var KEY = "notes:" + location.pathname, notes = [];
  try { notes = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) {}
  var list = document.getElementById("list"), text = document.getElementById("text"), status = document.getElementById("status"), last = null;
  document.querySelectorAll("video").forEach(function (v) { ["play", "pause", "seeked"].forEach(function (e) { v.addEventListener(e, function () { last = v; }); }); });
  function stamp(t) { var m = Math.floor(t / 60), s = (t % 60).toFixed(1); return m + ":" + (s < 10 ? "0" : "") + s; }
  function show() {
    list.innerHTML = notes.map(function (n, i) { return "<li>" + (n.where ? "<b>" + n.where + "</b> " : "") + n.text.replace(/</g, "&lt;") + " <a href='#' data-i='" + i + "'>remove</a></li>"; }).join("");
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {}
  }
  list.addEventListener("click", function (e) { if (e.target.dataset.i) { e.preventDefault(); notes.splice(+e.target.dataset.i, 1); show(); } });
  document.getElementById("add").onclick = function () {
    if (!text.value.trim()) return;
    notes.push({ where: last ? last.dataset.name + " at " + stamp(last.currentTime) : "", text: text.value.trim() });
    text.value = ""; show();
  };
  function asText() { return notes.map(function (n) { return "- " + (n.where ? n.where + ": " : "") + n.text; }).join("\\n"); }
  document.getElementById("copy").onclick = function () {
    navigator.clipboard.writeText(asText()).then(function () { status.textContent = "Copied. Paste the notes into the chat with Claude."; }, function () { status.textContent = "Could not copy. Select the notes above and copy them by hand."; });
  };
  document.getElementById("save").onclick = function () {
    if (location.protocol === "file:") { status.textContent = "Saving needs the review page (ask Claude to open it). Use Copy notes and paste them into the chat instead."; return; }
    fetch("feedback", { method: "POST", headers: { "content-type": "text/plain" }, body: asText() }).then(function (r) {
      status.textContent = r.ok ? "Saved to feedback.md in this folder. Tell Claude your notes are ready." : "Could not save. Use Copy notes instead.";
      if (r.ok) { notes = []; show(); }
    }, function () { status.textContent = "Could not save. Use Copy notes instead."; });
  };
  show();
})();
</script></body></html>
`;
  fs.writeFileSync(path.join(folder, "index.html"), html);
  console.log(`${path.join(folder, "index.html")}: ${videos.length} videos, ${sheets.length + images.length} images, ${docs.length} notes`);
}

const MIME = { ".html": "text/html; charset=utf-8", ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".pdf": "application/pdf", ".md": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".m4a": "audio/mp4", ".mp3": "audio/mpeg", ".svg": "image/svg+xml" };

function review({ pos, opt }) {
  const [piece] = pos;
  if (!piece || !fs.existsSync(piece)) die("review <piece> [--port 4321]");
  const root = path.resolve(piece), port = Number(opt.port) || 4321;
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = path.join(root, url);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if (req.method === "POST" && url.endsWith("/feedback")) {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const dir = path.dirname(file);
        const out = path.join(dir, "feedback.md");
        const head = fs.existsSync(out) ? "" : `# Feedback on ${path.basename(dir)}\n\nNotes typed on the review page. Claude reads this file.\n`;
        fs.appendFileSync(out, `${head}\n## ${new Date().toISOString().slice(0, 16).replace("T", " ")}\n\n${body.trim()}\n`);
        console.log(`Saved notes to ${out}`);
        res.writeHead(200).end("ok");
      });
      return;
    }
    let f = file;
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
      f = path.join(f, "index.html");
      if (!fs.existsSync(f)) {
        const dirs = fs.readdirSync(file, { withFileTypes: true }).filter((e) => e.isDirectory() && fs.existsSync(path.join(file, e.name, "index.html"))).map((e) => e.name);
        res.writeHead(200, { "content-type": MIME[".html"] }).end(`<!doctype html><meta charset="utf-8"><title>${esc(path.basename(root))}</title><body style="font:18px system-ui;max-width:700px;margin:40px auto;padding:0 16px"><h1>${esc(path.basename(root))}</h1>${dirs.map((d) => `<p><a href="${esc(d)}/">${esc(d)}</a></p>`).join("") || "<p>No pages yet.</p>"}</body>`);
        return;
      }
    }
    if (!fs.existsSync(f)) { res.writeHead(404).end("Not found"); return; }
    const st = fs.statSync(f), type = MIME[path.extname(f).toLowerCase()] || "application/octet-stream";
    const range = req.headers.range && req.headers.range.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const start = Number(range[1] || 0), end = range[2] ? Number(range[2]) : st.size - 1;
      res.writeHead(206, { "content-type": type, "content-range": `bytes ${start}-${end}/${st.size}`, "accept-ranges": "bytes", "content-length": end - start + 1 });
      fs.createReadStream(f, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { "content-type": type, "content-length": st.size, "accept-ranges": "bytes" });
      fs.createReadStream(f).pipe(res);
    }
  });
  server.listen(port, "127.0.0.1", () => console.log(`Review page: http://localhost:${port}/  (stop with Ctrl+C)`));
}

// ---------- cost log ----------

function transcriptFiles(session) {
  const base = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
  const projects = path.join(base, "projects");
  if (!fs.existsSync(projects)) return [];
  const out = [];
  for (const p of fs.readdirSync(projects)) {
    const main = path.join(projects, p, `${session}.jsonl`);
    if (fs.existsSync(main)) out.push(main);
    const sub = path.join(projects, p, session, "subagents");
    if (fs.existsSync(sub)) for (const f of fs.readdirSync(sub)) if (f.endsWith(".jsonl")) out.push(path.join(sub, f));
  }
  return out;
}

function priceFor(prices, model) {
  const id = String(model || "").replace(/\[.*\]$/, "").replace(/-\d{8}$/, "");
  return prices.models[id] || Object.entries(prices.models).find(([k]) => id.startsWith(k))?.[1] || null;
}

function cost({ pos, opt }) {
  const [piece] = pos;
  if (!piece || !opt.round) die('cost <piece> --round "v1" [--session <id>]');
  const prices = JSON.parse(fs.readFileSync(path.join(HERE, "prices.json"), "utf8"));
  const file = path.join(piece, "cost.md");
  const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const state = JSON.parse((prev.match(/<!-- cost-data (.*) -->/) || [, '{"rows":[],"marks":{}}'])[1]);
  const session = opt.session || process.env.CLAUDE_CODE_SESSION_ID || process.env.CLAUDE_SESSION_ID;
  const row = { round: String(opt.round), when: new Date().toISOString().slice(0, 16).replace("T", " "), models: [], input: 0, write5m: 0, write1h: 0, read: 0, output: 0, usd: 0, note: "" };
  const files = session ? transcriptFiles(session) : [];
  if (!files.length) {
    row.note = session ? "No Claude Code transcript found for this session, so no token counts." : "No session id given, so no token counts (Claude Code passes it to the skill).";
  } else {
    const since = state.marks[session] || "";
    const seen = new Set();
    let latest = since;
    for (const f of files) {
      for (const line of fs.readFileSync(f, "utf8").split("\n")) {
        if (!line.includes('"usage"')) continue;
        let e; try { e = JSON.parse(line); } catch { continue; }
        const m = e.message, u = m && m.usage;
        if (!u || !e.timestamp || e.timestamp <= since) continue;
        const key = m.id || e.requestId || e.uuid;
        if (seen.has(key)) continue;
        seen.add(key);
        if (e.timestamp > latest) latest = e.timestamp;
        const w1h = u.cache_creation?.ephemeral_1h_input_tokens ?? 0;
        const w5m = u.cache_creation?.ephemeral_5m_input_tokens ?? Math.max(0, (u.cache_creation_input_tokens || 0) - w1h);
        const p = priceFor(prices, m.model);
        if (m.model && !row.models.includes(m.model) && m.model !== "<synthetic>") row.models.push(m.model);
        row.input += u.input_tokens || 0; row.write5m += w5m; row.write1h += w1h; row.read += u.cache_read_input_tokens || 0; row.output += u.output_tokens || 0;
        if (p) row.usd += ((u.input_tokens || 0) * p.input + w5m * p.input * 1.25 + w1h * p.input * 2 + (u.cache_read_input_tokens || 0) * p.cache_read + (u.output_tokens || 0) * p.output) / 1e6;
        else if (m.model && m.model !== "<synthetic>") row.note = `No price listed for ${m.model}; its tokens are counted but not priced.`;
      }
    }
    state.marks[session] = latest;
  }
  state.rows.push(row);
  const n = (x) => x.toLocaleString("en-US");
  const tot = state.rows.reduce((a, r) => ({ input: a.input + r.input, write: a.write + r.write5m + r.write1h, read: a.read + r.read, output: a.output + r.output, usd: a.usd + r.usd }), { input: 0, write: 0, read: 0, output: 0, usd: 0 });
  const md = `# Cost: ${path.basename(path.resolve(piece))}

Tokens Claude used for each round of this piece, and what the same tokens would cost at Anthropic's API prices (${prices.as_of}, ${prices.source}). On a Pro or Max plan you do not pay these amounts; your plan's usage limits apply instead (see the README, "What it costs"). Rendering runs on your computer and costs nothing.

| Round | When (UTC) | Model | Input | Cache write | Cache read | Output | At API prices |
|---|---|---|---:|---:|---:|---:|---:|
${state.rows.map((r) => `| ${r.round} | ${r.when} | ${r.models.join(", ") || "-"} | ${n(r.input)} | ${n(r.write5m + r.write1h)} | ${n(r.read)} | ${n(r.output)} | $${r.usd.toFixed(2)} |`).join("\n")}
| **Total** | | | ${n(tot.input)} | ${n(tot.write)} | ${n(tot.read)} | ${n(tot.output)} | **$${tot.usd.toFixed(2)}** |
${state.rows.filter((r) => r.note).map((r) => `\n${r.round}: ${r.note}`).join("")}

Cache reads are the conversation being re-read from Anthropic's cache each turn; they are cheap per token but there are many. Output is what Claude wrote: code, notes, and its own thinking.

<!-- cost-data ${JSON.stringify(state)} -->
`;
  fs.writeFileSync(file, md);
  const last = state.rows[state.rows.length - 1];
  console.log(`${file}: ${last.round} ${n(last.input + last.write5m + last.write1h + last.read)} input-side tokens, ${n(last.output)} output, $${last.usd.toFixed(2)} at API prices; total so far $${tot.usd.toFixed(2)}${last.note ? ` (${last.note})` : ""}`);
}

// ---------- library items ----------

// Copies a library item into a piece. HyperFrames sizes a sub-composition by its own root's
// data-width/data-height (and its lint requires them), so each canvas size gets its own copy:
// compositions/<item>.html for 1920x1080, compositions/<W>x<H>/<item>.html for any other.
function placeItem(source, id, W = 1920, H = 1080) {
  const items = path.join(SKILL, "library", "items");
  const file = path.join(items, `${id}.html`);
  if (!fs.existsSync(file)) die(`No library item "${id}". Items: ${fs.readdirSync(items).map((f) => f.replace(/\.html$/, "")).join(", ")}`);
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/(<div[^>]*\bid="root"[^>]*?)(\s+data-width="\d+")?(\s+data-height="\d+")?([^>]*>)/, (all, a, w, h, b) => `${a.replace(/\s+data-(width|height)="\d+"/g, "")} data-width="${W}" data-height="${H}"${b.replace(/\s+data-(width|height)="\d+"/g, "")}`);
  const rel = W === 1920 && H === 1080 ? `compositions/${id}.html` : `compositions/${W}x${H}/${id}.html`;
  fs.mkdirSync(path.dirname(path.join(source, rel)), { recursive: true });
  fs.writeFileSync(path.join(source, rel), html);
  const len = (html.match(/"id":"length"[^}]*"default":([\d.]+)/) || html.match(/data-composition-duration="([\d.]+)"/) || [, "3"])[1];
  return { rel, len };
}

function item({ pos, opt }) {
  const [source, id] = pos;
  if (!source || !id) die("item <source> <item> [--size 1080x1920]   (copies a library item into the piece and prints how to mount it)");
  const [W, H] = (opt.size || "1920x1080").split("x").map(Number);
  const { rel, len } = placeItem(source, id, W, H);
  console.log(`${path.join(source, rel)}
Mount it in the entry file for this size (data-composition-src is always written from the project root, also in formats/ files):
<div id="${id}-1" class="clip" data-composition-id="${id}" data-composition-src="${rel}"
  data-variable-values='{"length":${len}}' data-start="0" data-duration="${len}" data-track-index="5"
  data-width="${W}" data-height="${H}" style="position:absolute;inset:0"></div>`);
}

// ---------- library previews ----------

function library({ pos }) {
  const [project, ...chosen] = pos;
  if (!project || !fs.existsSync(path.join(project, "index.html"))) die("library <project> [item...]   (project: a HyperFrames project made with init, after prepare)");
  const items = path.join(SKILL, "library", "items");
  const ids = chosen.length ? chosen : fs.readdirSync(items).filter((f) => /\.html$/.test(f) && !/focus-swap|parallax-unzoom/.test(f)).map((f) => f.replace(/\.html$/, ""));
  const comps = path.join(project, "compositions");
  fs.mkdirSync(comps, { recursive: true });
  const GAP = 0.6, slots = [];
  let t = 0;
  for (const id of ids) {
    const len = Number(placeItem(project, id).len);
    slots.push([id, t + GAP, len]);
    t += GAP + len + GAP;
  }
  const total = Math.round(t * 1000) / 1000;
  const index = path.join(project, "index.html");
  const old = fs.readFileSync(index, "utf8");
  const gsapTag = (old.match(/<script[^>]*gsap[^>]*><\/script>/) || ['<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>'])[0];
  const brandTag = fs.existsSync(path.join(project, "shared", "brand.css")) ? '<link rel="stylesheet" href="shared/brand.css" />' : "";
  fs.writeFileSync(index, `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" />
${brandTag}
${gsapTag}
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1920px; height: 1080px; overflow: hidden; background: var(--brand-bg, #0a0a0f); }
#root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: var(--brand-bg, #0a0a0f); }
.label { position: absolute; left: 96px; top: 64px; font-family: var(--brand-font-mono, "JetBrains Mono"), monospace; font-size: 32px; color: var(--brand-muted, #6b6b6b); }
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
${slots.map(([id, s, len], i) => `  <div id="label${i}" class="label clip" data-start="${(s - GAP).toFixed(3)}" data-duration="${(len + 2 * GAP).toFixed(3)}" data-track-index="0">${id}</div>
  <div id="m${i}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${s.toFixed(3)}" data-duration="${len.toFixed(3)}" data-track-index="${i + 1}" data-width="1920" data-height="1080" style="position:absolute;inset:0"></div>`).join("\n")}
</div>
<script>window.__timelines = window.__timelines || {}; window.__timelines["main"] = gsap.timeline({ paused: true }).set({}, {}, ${total});</script>
</body></html>
`);
  vendor(project);
  const pin = (fs.readFileSync(path.join(project, "package.json"), "utf8").match(/hyperframes@([\d.]+)/) || [])[1];
  const render = path.resolve(project, "renders", "library.mp4");
  const r = run("npx", ["--yes", pin ? `hyperframes@${pin}` : "hyperframes", "render", "--quality", "draft", "--output", render], { cwd: project, allowFail: true });
  if (r.status !== 0) die(`Render failed:\n${(r.stdout + r.stderr).slice(-3000)}`);
  const out = path.join(project, "previews");
  fs.mkdirSync(out, { recursive: true });
  for (const [id, s, len] of slots) {
    ff(["-ss", (s - GAP / 2).toFixed(3), "-i", render, "-t", (len + GAP).toFixed(3), "-vf", "scale=960:-2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-an", path.join(out, `${id}.mp4`)]);
    console.log(path.join(out, `${id}.mp4`));
  }
}

// ---------- main ----------

const COMMANDS = {
  prepare, check, item, contact, phone, stills, refs, clip, join, pdf, standin, web, loudness, music, normalize, page, review, cost, library,
  "brand-css": ({ pos }) => {
    if (!pos[0]) die("brand-css <brand.md> [out.css]");
    const r = brandCss(pos[0], pos[1]);
    if (!pos[1]) console.log(r.css);
    r.notes.forEach((n) => console.error(`Check: ${n}`));
  },
  "overlay-preview": overlayPreview,
};

const [cmd, ...rest] = process.argv.slice(2);
if (!cmd || cmd === "help" || cmd === "--help" || !COMMANDS[cmd]) { console.log(HELP); process.exit(cmd && cmd !== "help" && cmd !== "--help" ? 1 : 0); }
COMMANDS[cmd](parseArgs(rest));
