# Photograph asset plan

The site is image-led. This document records what the shop has supplied, what it
still needs, and the rule every photograph on the site follows.

## The rule

Only photographs the shop owns are used. No stock photography of somebody else's
yard, no Google Maps imagery, no brand press photos, and nothing scraped. A
category with no photograph shows a clearly-marked *"Photograph of … coming
soon"* panel instead of borrowing one — an honest gap looks better than a
generic image, and it is the difference between a real shop and a template.

## Pipeline

Originals live in `assets-source/photos/` at full resolution. `npm run images`
(`scripts/assets/images.py`) crops them, derives every size and format, and
writes `src/config/images.generated.ts` with the intrinsic dimensions.

Each photograph is emitted as **AVIF → WebP → JPEG** at several widths. The
`<Picture>` component renders a `<picture>` with both modern formats ahead of the
JPEG fallback, sets `width`/`height` and an `aspect-ratio` so the box is reserved
before the bytes arrive, and marks everything except the hero `loading="lazy"`
`fetchpriority="low"`. The hero alone is `eager` / `high`, so there is exactly one
image on the critical path.

Budget check: the hero at 640px wide is **39 KB in AVIF** — small enough to be the
largest contentful paint on a mid-range Android over mobile data.

```
public/images/<slug>/<slug>-<width>.{avif,webp,jpg}
```

## Supplied so far

| Slug | Source | Used for | Notes |
|---|---|---|---|
| `bricks-stack` | `bricks-mrb-stack.jpg` | **Hero** + Bricks category | MRB-stamped red bricks in the yard. The bottom 10% is cropped to remove the "REDMI NOTE 6 PRO" camera watermark. |
| `cement-stock` | `cement-dalmia.jpg` | Cement category | Dalmia bags stacked in the godown. |
| `cement-brands` | `cement-ultratech-ambuja.jpg` | Brands card | UltraTech Premium and Ambuja bags together — this photo is the evidence behind the brand list, which is why the list makes no dealership claim. |
| `cement-godown` | `cement-ambuja.jpg` | held in reserve | Ambuja stack; not currently placed. |
| `visiting-card` | `2022-02-06.jpg` | not published | Kept as the source of truth for the shop name, address and proprietor. Not shown on the site because it carries five third-party brand logos. |

## Still needed from the owner

These seven are what would finish the job. A phone camera in daylight is enough —
no filters, no editing, landscape orientation, and nothing staged.

1. **Storefront and signboard** — the whole shop front from across the road, with
   the board readable. *This is the single most valuable photo on the list.* It is
   the one thing that proves the shop exists, and it should become the hero.
2. **Cement stock** — supplied, but a wider shot showing the counter or a person
   would be better than bags alone.
3. **Bricks** — supplied. A second close-up of a single brick face would help the
   Bricks category page.
4. **TMT rods / bundles** — currently a "coming soon" panel. Bundles standing in
   the rack, or laid out with the diameters visible.
5. **Hardware shelf** — currently a "coming soon" panel. The shelf or counter with
   the actual range visible.
6. **Puja Samagri display** — currently a "coming soon" panel. The counter as it
   is arranged for customers.
7. **Delivery vehicle** — now that delivery is confirmed, a photo of the vehicle
   loading or unloading would carry that claim far better than the sentence does.

A person in frame — the proprietor at the counter, or staff loading a vehicle —
does more for trust than any of the product shots. If only one more photo is ever
taken, make it the signboard; if two, make the second one with a person in it.

## Alt text

Alt text describes what is actually in the frame and names the shop, so it reads
correctly both to a screen reader and to a search engine:

> "Stack of red clay bricks in the yard at M/S Balajee Trading Centre, Debidanga Bazar"

Not "hero image", not "bricks". When a new photograph is added, its alt text goes
in `src/config/products.ts` beside the slug, and the Bengali equivalent belongs in
`src/i18n/bn.ts` — currently only the hero has a translated alt string.
