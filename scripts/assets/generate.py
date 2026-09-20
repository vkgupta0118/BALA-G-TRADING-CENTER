#!/usr/bin/env python3
"""
Generates the binary assets under public/ that are NOT derived from the source tree:

  public/fonts/*.woff            – subsets of Bebas Neue, Source Sans 3, Noto Sans Bengali (OFL)
  public/fonts/LICENSE-*.txt     – the fonts' OFL licences
  public/favicon.ico, apple-touch-icon.png, icon-512.png, og-image.png – brand mark + Open Graph image

Existing files are kept unless --force is given, so committed originals always win.
Runs in CI (see .github/workflows/deploy.yml) and locally with:

    pip install fonttools pillow
    npm run assets

Font sources: https://github.com/google/fonts (branch main). Set FONT_SRC_DIR to a local
checkout of that repo's ofl/ folder to work offline.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
FONTS_DIR = PUBLIC / "fonts"

GOOGLE_FONTS_RAW = "https://raw.githubusercontent.com/google/fonts/main/ofl"

LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,"
    "U+2074,U+20AC,U+20B9,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
)
BENGALI = "U+0000-00FF,U+0964-0965,U+0980-09FF,U+200C-200D,U+2000-206F,U+20B9,U+25CC"

FONTS = [
    # (family dir, source file, output woff, unicodes, pin variation axes)
    ("bebasneue", "BebasNeue-Regular.ttf", "bebas-neue-latin.woff", LATIN, None),
    ("sourcesans3", "SourceSans3[wght].ttf", "source-sans-3-latin-var.woff", LATIN, None),
    ("notosansbengali", "NotoSansBengali[wdth,wght].ttf", "noto-sans-bengali-var.woff", BENGALI, "wdth=100"),
]
LICENSES = {
    "bebasneue": "LICENSE-BebasNeue-OFL.txt",
    "sourcesans3": "LICENSE-SourceSans3-OFL.txt",
    "notosansbengali": "LICENSE-NotoSansBengali-OFL.txt",
}

GOLD = (227, 179, 65)
CHAR = (28, 25, 23)
STONE = (214, 211, 209)
WHITE = (255, 255, 255)


def log(msg: str) -> None:
    print(f"[assets] {msg}")


def fetch_font(family: str, filename: str, work: Path) -> Path:
    """Returns a local path to the font file, downloading it from google/fonts if needed."""
    src_dir = os.environ.get("FONT_SRC_DIR")
    if src_dir:
        local = Path(src_dir) / family / filename
        if local.exists():
            return local
    dest = work / filename
    url = f"{GOOGLE_FONTS_RAW}/{family}/{urllib.request.quote(filename)}"
    log(f"downloading {url}")
    with urllib.request.urlopen(url, timeout=60) as resp, open(dest, "wb") as out:
        shutil.copyfileobj(resp, out)
    return dest


def fetch_license(family: str, work: Path) -> Path | None:
    src_dir = os.environ.get("FONT_SRC_DIR")
    if src_dir and (Path(src_dir) / family / "OFL.txt").exists():
        return Path(src_dir) / family / "OFL.txt"
    dest = work / f"{family}-OFL.txt"
    try:
        with urllib.request.urlopen(f"{GOOGLE_FONTS_RAW}/{family}/OFL.txt", timeout=60) as resp, open(dest, "wb") as out:
            shutil.copyfileobj(resp, out)
        return dest
    except Exception as exc:  # licence text is nice-to-have; never fail the build on it
        log(f"could not fetch OFL.txt for {family}: {exc}")
        return None


def build_fonts(force: bool) -> None:
    try:
        import fontTools  # noqa: F401
    except ImportError:
        log("fontTools not installed – skipping font generation (pip install fonttools)")
        return
    FONTS_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        for family, filename, out_name, unicodes, pin in FONTS:
            out = FONTS_DIR / out_name
            if out.exists() and not force:
                log(f"keep {out.relative_to(ROOT)}")
                continue
            src = fetch_font(family, filename, work)
            if pin:
                pinned = work / f"pinned-{filename}"
                subprocess.run(
                    [sys.executable, "-m", "fontTools.varLib.instancer", str(src), pin, "-o", str(pinned)],
                    check=True,
                    capture_output=True,
                )
                src = pinned
            subprocess.run(
                [
                    sys.executable, "-m", "fontTools.subset", str(src),
                    f"--unicodes={unicodes}", "--flavor=woff", "--layout-features=*",
                    f"--output-file={out}",
                ],
                check=True,
                capture_output=True,
            )
            log(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
        for family, lic_name in LICENSES.items():
            out = FONTS_DIR / lic_name
            if out.exists() and not force:
                continue
            lic = fetch_license(family, work)
            if lic:
                shutil.copyfile(lic, out)
                log(f"wrote {out.relative_to(ROOT)}")


def brand_mark(size: int):
    from PIL import Image, ImageDraw

    s = size / 40
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(8 * s), fill=GOLD)
    for x, y in [(7, 9), (21, 9), (13, 17), (7, 25), (21, 25)]:
        d.rounded_rectangle([x * s, y * s, (x + 12) * s, (y + 6) * s], radius=max(1, int(s)), fill=CHAR)
    return im


def build_images(force: bool) -> None:
    try:
        from PIL import Image, ImageDraw, ImageFilter, ImageFont
    except ImportError:
        log("Pillow not installed – skipping icon/OG generation (pip install pillow)")
        return

    targets = {
        "apple-touch-icon.png": lambda: brand_mark(180),
        "icon-512.png": lambda: brand_mark(512),
    }
    for name, make in targets.items():
        out = PUBLIC / name
        if out.exists() and not force:
            log(f"keep public/{name}")
        else:
            make().save(out)
            log(f"wrote public/{name}")

    ico = PUBLIC / "favicon.ico"
    if not ico.exists() or force:
        brand_mark(64).save(ico, sizes=[(16, 16), (32, 32), (48, 48)])
        log("wrote public/favicon.ico")

    og = PUBLIC / "og-image.png"
    if og.exists() and not force:
        log("keep public/og-image.png")
        return

    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        try:
            bebas = str(fetch_font("bebasneue", "BebasNeue-Regular.ttf", work))
            body_path = str(fetch_font("sourcesans3", "SourceSans3[wght].ttf", work))
        except Exception as exc:
            log(f"font download failed ({exc}); using default bitmap font for og-image")
            bebas = body_path = None

        W, H = 1200, 630
        im = Image.new("RGB", (W, H), CHAR)
        glow = Image.new("RGB", (W, H), CHAR)
        ImageDraw.Draw(glow).ellipse([700, -250, 1400, 300], fill=(92, 72, 35))
        glow = glow.filter(ImageFilter.GaussianBlur(160))
        im = Image.blend(im, glow, 0.9)
        d = ImageDraw.Draw(im)
        d.rectangle([0, H - 10, W, H], fill=GOLD)

        def fit(path, text, maxw, start):
            size = start
            while size > 20:
                f = ImageFont.truetype(path, size) if path else ImageFont.load_default()
                if not path or d.textlength(text, font=f) <= maxw:
                    return f
                size -= 2
            return f

        mark = brand_mark(96)
        im.paste(mark, (80, 80), mark)
        d.text((200, 84), "M/S BALAJEE TRADING CENTRE", font=fit(bebas, "M/S BALAJEE TRADING CENTRE", 900, 64), fill=GOLD)
        d.text((80, 215), "CEMENT · BRICKS · TMT STEEL", font=fit(bebas, "CEMENT · BRICKS · TMT STEEL", 1040, 120), fill=WHITE)
        d.text((80, 335), "HARDWARE & BUILDING MATERIALS", font=fit(bebas, "HARDWARE & BUILDING MATERIALS", 1040, 120), fill=STONE)
        body = ImageFont.truetype(body_path, 32) if body_path else ImageFont.load_default()
        try:
            body.set_variation_by_axes([600])
        except Exception:
            pass
        d.text((80, 480), "Champasari Road, Debidanga, Siliguri 734003", font=body, fill=WHITE)
        d.text((80, 528), "Get today’s price on WhatsApp", font=body, fill=GOLD)
        im.save(og, optimize=True)
        log("wrote public/og-image.png")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--force", action="store_true", help="regenerate even if files exist")
    parser.add_argument("--fonts-only", action="store_true")
    parser.add_argument("--images-only", action="store_true")
    args = parser.parse_args()
    if not args.images_only:
        build_fonts(args.force)
    if not args.fonts_only:
        build_images(args.force)
    missing = [p for p in ["favicon.ico", "apple-touch-icon.png", "icon-512.png", "og-image.png"] if not (PUBLIC / p).exists()]
    missing += [f"fonts/{f[2]}" for f in FONTS if not (FONTS_DIR / f[2]).exists()]
    if missing:
        log(f"WARNING: still missing: {', '.join(missing)}")
        return 1
    log("all assets present")
    return 0


if __name__ == "__main__":
    sys.exit(main())
