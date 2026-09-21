#!/usr/bin/env python3
"""
Builds responsive AVIF/WebP/JPEG derivatives of the shop's own photographs.

Source photographs live in assets-source/photos/ and are the owner's originals.
Outputs land in public/images/<slug>/<slug>-<width>.<ext> plus a manifest that
records every image's intrinsic aspect ratio so the layout can reserve space and
avoid cumulative layout shift.

Run: npm run images       (add -- --force to rebuild existing files)
"""

from __future__ import annotations

import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "assets-source", "photos")
OUT = os.path.join(ROOT, "public", "images")
MANIFEST = os.path.join(ROOT, "src", "config", "images.generated.ts")

FORCE = "--force" in sys.argv

# width sets: hero images are displayed much larger than card images
HERO_WIDTHS = [640, 960, 1280, 1600]
CARD_WIDTHS = [320, 480, 640, 960]

# crop = (left, top, right, bottom) as fractions of the source, applied before resizing.
# The brick photo carries a "REDMI NOTE 6 PRO / MI DUAL CAMERA" camera watermark
# across the bottom strip; it is cropped off rather than shown.
PLAN = [
    {
        "slug": "bricks-stack",
        "src": "bricks-mrb-stack.jpg",
        "widths": HERO_WIDTHS,
        "crop": (0.0, 0.0, 1.0, 0.90),
        "ratio": (4, 3),
        "role": "hero",
    },
    {
        "slug": "cement-stock",
        "src": "cement-dalmia.jpg",
        "widths": CARD_WIDTHS,
        "ratio": (4, 3),
        "role": "card",
    },
    {
        "slug": "cement-brands",
        "src": "cement-ultratech-ambuja.jpg",
        "widths": CARD_WIDTHS,
        "ratio": (4, 3),
        "role": "card",
    },
    {
        "slug": "cement-godown",
        "src": "cement-ambuja.jpg",
        "widths": CARD_WIDTHS,
        "ratio": (4, 3),
        "role": "card",
    },
    {
        "slug": "visiting-card",
        "src": "visiting-card.jpg",
        "widths": [480, 720, 960],
        "ratio": None,  # keep the card's own proportions
        "role": "card",
    },
]


def crop_to_ratio(im: Image.Image, ratio: tuple[int, int] | None) -> Image.Image:
    if ratio is None:
        return im
    target = ratio[0] / ratio[1]
    w, h = im.size
    current = w / h
    if abs(current - target) < 0.01:
        return im
    if current > target:  # too wide -> trim sides
        new_w = int(round(h * target))
        left = (w - new_w) // 2
        return im.crop((left, 0, left + new_w, h))
    # too tall -> trim from the bottom-weighted centre (keeps the subject high in frame)
    new_h = int(round(w / target))
    top = int((h - new_h) * 0.35)
    return im.crop((0, top, w, top + new_h))


def build() -> list[dict]:
    os.makedirs(OUT, exist_ok=True)
    entries = []
    for item in PLAN:
        src_path = os.path.join(SRC, item["src"])
        if not os.path.exists(src_path):
            print(f"  ! missing source {item['src']} - skipped")
            continue
        im = Image.open(src_path).convert("RGB")
        if item.get("crop"):
            l, t, r, b = item["crop"]
            w, h = im.size
            im = im.crop((int(w * l), int(h * t), int(w * r), int(h * b)))
        im = crop_to_ratio(im, item.get("ratio"))
        base_w, base_h = im.size

        slug_dir = os.path.join(OUT, item["slug"])
        os.makedirs(slug_dir, exist_ok=True)
        widths = [w for w in item["widths"] if w <= base_w] or [base_w]
        made = []
        for w in widths:
            h = int(round(w * base_h / base_w))
            resized = im.resize((w, h), Image.LANCZOS)
            for ext, kwargs in (
                ("avif", {"quality": 55}),
                ("webp", {"quality": 74, "method": 6}),
                ("jpg", {"quality": 78, "optimize": True, "progressive": True}),
            ):
                dest = os.path.join(slug_dir, f"{item['slug']}-{w}.{ext}")
                if os.path.exists(dest) and not FORCE:
                    continue
                fmt = "JPEG" if ext == "jpg" else ext.upper()
                try:
                    resized.save(dest, fmt, **kwargs)
                except Exception as exc:  # AVIF plugin may be absent on some hosts
                    if ext == "avif":
                        print(f"  ! avif unavailable ({exc}); skipping avif for {item['slug']}")
                        continue
                    raise
            made.append(w)
        entries.append(
            {
                "slug": item["slug"],
                "widths": widths,
                "width": base_w,
                "height": base_h,
                "role": item["role"],
            }
        )
        total = sum(
            os.path.getsize(os.path.join(slug_dir, f)) for f in os.listdir(slug_dir)
        )
        print(
            f"  {item['slug']}: {base_w}x{base_h}, widths {made}, {total / 1024:.0f}KB total"
        )
    return entries


def write_manifest(entries: list[dict]) -> None:
    lines = [
        "// GENERATED by scripts/assets/images.py - do not edit by hand.",
        "// Intrinsic dimensions are recorded so every <img> can reserve its box",
        "// and the page never shifts while photographs load.",
        "",
        "export interface GeneratedImage {",
        "  slug: string;",
        "  widths: number[];",
        "  width: number;",
        "  height: number;",
        "}",
        "",
        "export const generatedImages = {",
    ]
    # One property per line: this is the shape Biome's formatter settles on, so the
    # file lints clean in CI immediately after being regenerated.
    for e in sorted(entries, key=lambda x: x["slug"]):
        lines += [
            f"  '{e['slug']}': {{",
            f"    slug: '{e['slug']}',",
            f"    widths: {json.dumps(e['widths'])},",
            f"    width: {e['width']},",
            f"    height: {e['height']},",
            "  },",
        ]
    lines += [
        "} as const satisfies Record<string, GeneratedImage>;",
        "",
        "export type GeneratedImageSlug = keyof typeof generatedImages;",
        "",
    ]
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    print(f"  manifest -> {os.path.relpath(MANIFEST, ROOT)}")


if __name__ == "__main__":
    print("Building responsive images from assets-source/photos ...")
    write_manifest(build())
    print("Done.")
