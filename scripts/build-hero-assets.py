"""build-hero-assets.py: turns the talking intro video into the seamless looping hero clip.

    python scripts/build-hero-assets.py [--src VIDEO] [--photo PHOTO] [--crop W:H:X:Y] [--xfade 0.5] [--length 10]

Needs ffmpeg/ffprobe on PATH and numpy. Writes into public/:
    hero/hero.mp4     H.264 yuv420p, CRF 24, preset slow, AAC 96 kbps, +faststart
    hero/hero.webm    VP9 CRF 36, Opus 80 kbps
    hero/poster.webp  the loop's first frame (video poster, and the still shown with reduced motion)
    hero/intro.vtt    captions for the spoken intro, timed to the loop
    portrait-bust.webp  480x600 head-to-shirt crop (from --photo when given, else the clearest video frame)
    og.jpg              1200x630 social card

Steps, as the portfolio guide specifies:
 1. Find the person (every frame sampled, a dark-against-backdrop mask, union of the boxes) and crop tightly
    head to toe at the hero's 768:960 aspect, person centred; scale to 768 px wide. --crop overrides.
 2. Whiten the backdrop. The AI backdrop is not flat (about 252 in the middle, 225 in the corners, 236 on the
    floor), so the guide's colorlevels alone would leave a grey box under mix-blend-mode: multiply. A smooth
    plate is fitted to the backdrop (a sigma-clipped 2-D polynomial, so the contact shadow survives) and the
    frame is divided by it (ffmpeg blend divide, flat-field style), then colorlevels=...max=0.98 as the guide says,
    and the crop's side and bottom edges are feathered to white so the floor shadow never ends in a hard line.
 3. Make the loop seamless: take the first --length seconds, cross-fade the last --xfade seconds of picture into
    the first --xfade seconds (ffmpeg xfade) and do the same cross-fade on the audio sample-accurately in numpy
    (no acrossfade). Nothing is stretched or retimed, so the lips stay in sync.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Since 2026-10-10 the hero speaks in Andre's OWN voice: intro-v3-own-voice.mp4 is wan2_7 (Higgsfield, 1080p, 12 s)
# lip-synced to his phone recording (voice/andre-intro-take1.aac, lightly cleaned: trimmed, 70 Hz high-pass, gentle
# afftdn, +2.17 dB to the old intro's -19.7 LUFS), with intro-v2's first frame as both start and end image so the
# framing matches take 2 and the clip returns to its first pose for the loop. intro-v2.mp4 (the AI voice) stays as
# the previous source.
DEFAULT_SRC = r"C:\Users\andre\loomwest\planning\portfolio-andre\video\intro-v3-own-voice.mp4"
DEFAULT_PHOTO = r"C:\Users\andre\loomwest\code-review\site-unused-2026-09-30\assets\candidates\andre-headshot-A.jpg"
OUT_W, OUT_H = 768, 960
# feather the crop's left, right and bottom edges to white (64 px and 20 px), so the floor shadow that runs off the
# crop never ends in a hard line on the page
FEATHER = "{c}(X,Y)+(255-{c}(X,Y))*max(clip(1-min(X,W-1-X)/64,0,1),clip(1-(H-1-Y)/20,0,1))"
PAPER = np.array([0xF4, 0xF2, 0xEE], dtype=np.float32)

# Andre's own words (2026-10-10 recording; faster-whisper base.en, small.en and medium.en all hear "the founder" without a
# second "I'm" and "online in a few days"), cue times in SOURCE seconds read off the cleaned audio (speech 0.72 to
# 11.45 s; word times from medium.en, the first onset from silencedetect). Shifted by the loop's start when written.
CUES = [
    (0.72, 1.86, "Hi, I'm Andre,"),
    (2.36, 5.66, "the founder of Loomwest, a web design studio in Gilroy."),
    (6.20, 9.64, "I build fast, hand-built websites for local businesses,"),
    (9.66, 11.45, "online in a few days."),
]


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, **kw)
    if r.returncode != 0:
        sys.stderr.write((r.stderr or b"").decode("utf-8", "replace")[-3000:])
        raise SystemExit(f"command failed: {' '.join(map(str, cmd[:6]))} ...")
    return r.stdout


def probe(src):
    info = json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-of", "json", src]))
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    num, den = map(int, v["r_frame_rate"].split("/"))
    return int(v["width"]), int(v["height"]), num / den, a


def frames(src, w, h, fps=None):
    vf = ["-vf", f"fps={fps}"] if fps else []
    raw = run(["ffmpeg", "-v", "error", "-i", src, *vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


def detect_person(fr):
    """union bounding box of everything clearly darker than the backdrop, across all sampled frames"""
    lum = fr.astype(np.float32).mean(axis=3)
    mask = (lum < 200).any(axis=0)
    rows = np.where(mask.sum(axis=1) >= 5)[0]
    cols = np.where(mask.sum(axis=0) >= 5)[0]
    return int(cols.min()), int(rows.min()), int(cols.max()), int(rows.max())


def crop_box(bbox, w, h):
    x0, y0, x1, y1 = bbox
    bh = y1 - y0
    top = max(0, y0 - int(0.04 * bh))
    bottom = min(h, y1 + int(0.03 * bh))          # keep the soft ground shadow under the shoes
    ch = bottom - top
    cw = int(round(ch * OUT_W / OUT_H))
    cx = (x0 + x1) / 2
    x = int(round(cx - cw / 2))
    x = max(0, min(w - cw, x))
    cw -= cw % 2; ch -= ch % 2; x -= x % 2; top -= top % 2
    return cw, ch, x, top


def fit_plate(fr, bbox, w, h):
    """a smooth backdrop plate: median frame, person excluded, sigma-clipped degree-4 polynomial in x and y"""
    med = np.median(fr.astype(np.float32).mean(axis=3), axis=0)
    yy, xx = np.mgrid[0:h, 0:w]
    x0, y0, x1, y1 = bbox
    keep = np.ones((h, w), bool)
    keep[max(0, y0 - 30):min(h, y1 + 30), max(0, x0 - 60):min(w, x1 + 60)] = False
    keep &= med > 205
    X = (xx / (w - 1)) * 2 - 1
    Y = (yy / (h - 1)) * 2 - 1
    terms = [X ** i * Y ** j for i in range(5) for j in range(5 - i)]
    A = np.stack([t[keep] for t in terms], axis=1)
    b = med[keep]
    sel = np.ones(len(b), bool)
    for _ in range(4):                               # drop shadowed pixels below the fit so they do not pull it down
        coef, *_ = np.linalg.lstsq(A[sel], b[sel], rcond=None)
        resid = b - A @ coef
        sel = resid > -2.5 * resid[sel].std()
    plate = sum(c * t for c, t in zip(coef, terms))
    plate = np.clip(plate, 150, 255)
    print(f"  plate: {plate.min():.1f} to {plate.max():.1f} (median backdrop {np.median(b):.1f}), fit rms {resid[sel].std():.2f}")
    return plate


def write_png_gray(path, arr):
    """8-bit RGB PNG of a grey plate, via ffmpeg (no Pillow needed)"""
    a = np.repeat(np.clip(np.round(arr), 0, 255).astype(np.uint8)[..., None], 3, axis=2)
    h, w = a.shape[:2]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-i", "-",
                    "-frames:v", "1", path], input=a.tobytes(), check=True)


def audio_loop(src, start, length, xf, sr=48000):
    raw = run(["ffmpeg", "-v", "error", "-i", src, "-f", "f32le", "-ac", "2", "-ar", str(sr), "-"])
    a = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    n_len, n_start, n_xf = int(round(length * sr)), int(round(start * sr)), int(round(xf * sr))
    a = a[:n_len]
    if len(a) < n_len:
        a = np.vstack([a, np.zeros((n_len - len(a), 2))])
    body = a[n_start:n_len].copy()                    # source [start, length)
    head = a[0:n_xf]                                  # source [0, xf)
    t = (np.arange(n_xf) + 0.5) / n_xf
    fade_out = np.cos(t * np.pi / 2)[:, None]         # equal-power, sample-accurate
    fade_in = np.sin(t * np.pi / 2)[:, None]
    body[-n_xf:] = body[-n_xf:] * fade_out + head * fade_in
    seam = abs(body[-1] - body[0]).max()
    print(f"  audio: {len(body)} samples ({len(body) / sr:.3f} s), seam step {seam:.5f} (last sample to first)")
    return body, sr


def write_wav(path, x, sr):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())


def vtt(path, start, loop_len):
    def ts(s):
        return f"00:{int(s // 60):02d}:{s % 60:06.3f}"
    lines = ["WEBVTT", ""]
    for a, b, text in CUES:
        a, b = max(0.0, a - start), min(loop_len, b - start)
        lines += [f"{ts(a)} --> {ts(b)}", text, ""]
    open(path, "w", encoding="utf-8", newline="\n").write("\n".join(lines))


def sharpest(fr):
    """index of the clearest frame: highest Laplacian variance (focus) with the mouth at rest preferred later"""
    g = fr.astype(np.float32).mean(axis=3)
    lap = np.abs(g[:, 1:-1, 1:-1] * 4 - g[:, :-2, 1:-1] - g[:, 2:, 1:-1] - g[:, 1:-1, :-2] - g[:, 1:-1, 2:])
    return int(np.argmax(lap.reshape(len(fr), -1).var(axis=1)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=DEFAULT_SRC)
    ap.add_argument("--photo", default=DEFAULT_PHOTO, help="photo for portrait-bust.webp ('' = use the clearest frame)")
    ap.add_argument("--crop", help="W:H:X:Y in source pixels, skips detection")
    ap.add_argument("--xfade", type=float, default=0.5)
    ap.add_argument("--length", type=float, default=12.0)
    args = ap.parse_args()

    src, xf, length = args.src, args.xfade, args.length
    w, h, fps, astream = probe(src)
    print(f"source: {w}x{h} @ {fps:g} fps, audio {'yes' if astream else 'no'}")
    sample = frames(src, w, h, fps=4)
    bbox = detect_person(sample)
    if args.crop:
        cw, ch, cx, cy = map(int, args.crop.split(":"))
    else:
        cw, ch, cx, cy = crop_box(bbox, w, h)
    print(f"  person box x {bbox[0]}-{bbox[2]}, y {bbox[1]}-{bbox[3]}; crop={cw}:{ch}:{cx}:{cy} -> {OUT_W}x{OUT_H}")
    plate = fit_plate(sample, bbox, w, h)

    out_hero = os.path.join(ROOT, "public", "hero")
    os.makedirs(out_hero, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        plate_png = os.path.join(tmp, "plate.png")
        write_png_gray(plate_png, plate)
        body, sr = audio_loop(src, xf, length, xf)
        wav = os.path.join(tmp, "loop.wav")
        write_wav(wav, body, sr)
        loop_len = length - xf

        # picture: whiten -> crop -> scale -> levels -> split -> [xf, length) cross-faded into [0, xf)
        graph = (
            f"[0:v]format=gbrp,setsar=1[src];[1:v]format=gbrp[plate];"
            f"[src][plate]blend=all_mode=divide:shortest=1,"
            f"crop={cw}:{ch}:{cx}:{cy},scale={OUT_W}:{OUT_H}:flags=lanczos,"
            f"colorlevels=rimax=0.98:gimax=0.98:bimax=0.98,format=gbrp,"
            f"geq=r='{FEATHER.format(c='r')}':g='{FEATHER.format(c='g')}':b='{FEATHER.format(c='b')}',"
            f"format=yuv420p,split=2[a][b];"
            f"[a]trim=start={xf}:end={length},setpts=PTS-STARTPTS,fps={fps:g}[main];"
            f"[b]trim=start=0:end={xf},setpts=PTS-STARTPTS,fps={fps:g}[head];"
            f"[main][head]xfade=transition=fade:duration={xf}:offset={loop_len - xf},format=yuv420p[v]"
        )
        master = os.path.join(tmp, "master.mkv")
        run(["ffmpeg", "-v", "error", "-y", "-i", src, "-loop", "1", "-framerate", f"{fps:g}", "-i", plate_png, "-i", wav,
             "-filter_complex", graph, "-map", "[v]", "-map", "2:a", "-c:v", "ffv1", "-c:a", "pcm_s16le",
             "-t", f"{loop_len}", master])
        mp4 = os.path.join(out_hero, "hero.mp4")
        webm = os.path.join(out_hero, "hero.webm")
        run(["ffmpeg", "-v", "error", "-y", "-i", master, "-c:v", "libx264", "-crf", "24", "-preset", "slow",
             "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", mp4])
        run(["ffmpeg", "-v", "error", "-y", "-i", master, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0",
             "-row-mt", "1", "-c:a", "libopus", "-b:a", "80k", webm])
        run(["ffmpeg", "-v", "error", "-y", "-i", master, "-frames:v", "1", "-c:v", "libwebp", "-quality", "82",
             os.path.join(out_hero, "poster.webp")])
        vtt(os.path.join(out_hero, "intro.vtt"), xf, loop_len)

        # stills: decode the finished loop once for the og card (and the portrait when no photo is given)
        loop_frames = frames(master, OUT_W, OUT_H)
        print(f"  loop: {len(loop_frames)} frames ({len(loop_frames) / fps:.3f} s)")

    # og.jpg: the clearest whitened frame multiplied onto the paper colour, as the page shows it
    k = sharpest(loop_frames[: int(fps * 2)])
    f = loop_frames[k].astype(np.float32)
    scale = 600 / OUT_H
    small = run(["ffmpeg", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OUT_W}x{OUT_H}", "-i", "-",
                 "-vf", f"scale={int(OUT_W * scale) // 2 * 2}:600:flags=lanczos", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                input=f.astype(np.uint8).tobytes())
    sw = int(OUT_W * scale) // 2 * 2
    small = np.frombuffer(small, np.uint8).reshape(600, sw, 3).astype(np.float32)
    og = np.ones((630, 1200, 3), np.float32) * PAPER
    ox, oy = (1200 - sw) // 2, 30
    og[oy:oy + 600, ox:ox + sw] = og[oy:oy + 600, ox:ox + sw] * small / 255.0
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1200x630", "-i", "-",
                    "-q:v", "3", os.path.join(ROOT, "public", "og.jpg")], input=og.astype(np.uint8).tobytes(), check=True)

    # portrait-bust.webp: a head-to-shirt crop, 480x600
    bust = os.path.join(ROOT, "public", "portrait-bust.webp")
    if args.photo:
        pw, ph = map(int, run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                               "-of", "csv=p=0", args.photo]).decode().strip().split(","))
        cw2 = min(pw, int(ph * 0.8)) // 2 * 2
        ch2 = int(cw2 / 0.8) // 2 * 2
        run(["ffmpeg", "-v", "error", "-y", "-i", args.photo, "-vf",
             f"crop={cw2}:{ch2}:{(pw - cw2) // 2}:0,scale=480:600:flags=lanczos", "-c:v", "libwebp", "-quality", "84", bust])
    else:
        top = loop_frames[k][0:int(OUT_H * 0.42)]
        hh = top.shape[0]
        ww = int(hh * 0.8) // 2 * 2
        x = (OUT_W - ww) // 2
        crop = np.ascontiguousarray(top[:, x:x + ww])
        run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{ww}x{hh}", "-i", "-",
             "-vf", "scale=480:600:flags=lanczos", "-c:v", "libwebp", "-quality", "84", bust], input=crop.tobytes())
    for p in ["hero/hero.mp4", "hero/hero.webm", "hero/poster.webp", "hero/intro.vtt", "portrait-bust.webp", "og.jpg"]:
        full = os.path.join(ROOT, "public", p)
        print(f"  wrote public/{p}: {os.path.getsize(full):,} bytes")


if __name__ == "__main__":
    main()
