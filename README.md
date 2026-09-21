# M/S Balajee Trading Centre — website & WhatsApp quote builder

Mobile-first marketing site for a building-materials shop on Champasari Road, Debidanga, Siliguri. The primary conversion is a **WhatsApp quote request**; every CTA opens `https://wa.me/<number>?text=<prefilled message>` using a number that comes **only** from the `PUBLIC_WHATSAPP_E164` environment variable.

- **Stack:** React 19 · TypeScript (strict) · esbuild · static pre-rendering · Playwright · Biome
- **Pages:** Home · Products · Quote builder · Contact · 404 (all pre-rendered to HTML)
- **Languages:** English + Bengali toggle for all conversion text
- **Docs:** `docs/90-day-growth-plan.md` · `docs/google-business-profile-checklist.md` · `docs/design-decisions.md` · `design-system/balajee-trading-centre/MASTER.md`

---

## Before launch — what the owner must provide

Nothing below is guessed. Until each item is supplied, the site shows an honest "not configured" state or hides the section.

| # | Item | Where it goes | Current state |
|---|---|---|---|
| 1 | **Verified WhatsApp Business number** (E.164 digits) | `.env.production` → `PUBLIC_WHATSAPP_E164` | **Set: 919339188629** (93391 88629, confirmed by the owner on 20 Sep 2026). Make sure WhatsApp Business runs on this SIM. |
| 2 | Click-to-call number | `.env.production` → `PUBLIC_PHONE_E164` | **Set: 917908246939** (79082 46939, the number printed on the shop's visiting card; confirmed by the owner on 21 Sep 2026). WhatsApp and Call are deliberately different numbers. |
| 3 | **Domain** | `.env.production` → `PUBLIC_SITE_URL` + `PUBLIC_BASE_PATH` | Set to the free GitHub Pages address `https://vkgupta0118.github.io/BALA-G-TRADING-CENTER`. Buy a custom domain later (e.g. `balajeetrading.in`) and update both values. |
| 4 | **Final business name spelling** | `.env` → `PUBLIC_BUSINESS_NAME` | **Set: M/S Balajee Trading Centre** (as printed on the visiting card). Google still shows *M.S. BALA G TRADING CENTER* — correct the Google Business Profile to match. |
| 5 | **Business hours** for every day | `src/config/site.ts` → `openingHours`, then `PUBLIC_HOURS_VERIFIED=true` | **Verified 21 Sep 2026: open every day, 8:00–18:00** (`PUBLIC_HOURS_VERIFIED=true`). Shown in the hero, contact page and JSON-LD. |
| 6 | **Delivery areas** and whether delivery is offered | `src/config/site.ts` → `serviceAreas`; `PUBLIC_DELIVERY_VERIFIED=true` | **Delivery confirmed by the owner** (`PUBLIC_DELIVERY_VERIFIED=true`). The site says "We deliver across Siliguri" and never "same-day". Localities remain a picker list. |
| 7 | **Product list / brands stocked** | `src/config/products.ts`; `src/config/site.ts` → `brands`; `PUBLIC_SHOW_BRANDS=true` | Six categories incl. **Puja Samagri** (counter name `PUBLIC_PUJA_COUNTER_NAME=Vikash Store`). Cement brands listed are the five printed on the visiting card; the site never says "authorised dealer". |
| 8 | **Original photos** | `assets-source/photos/` → `npm run images` → `public/images/` | 5 owner photos in use (bricks, cement stock ×3, visiting card). **7 more needed** — see `docs/image-asset-plan.md`. No Google Maps imagery is used. |
| 9 | Logo (if one exists) | Replace `public/favicon.svg`, `apple-touch-icon.png`, `icon-512.png`, `og-image.png`, and `BrandMark` in `src/components/Header.tsx` | A neutral brick-mark placeholder is used. |
| 10 | Analytics IDs (optional) | `.env` → `PUBLIC_GA4_MEASUREMENT_ID`, `PUBLIC_GOOGLE_ADS_ID`, `PUBLIC_META_PIXEL_ID` | Empty → no third-party scripts load at all. |
| 11 | Privacy / contact email | `.env` → `PUBLIC_CONTACT_EMAIL` | Empty → not displayed. |
| 12 | Real testimonials (with permission) | `src/config/site.ts` → `testimonials` | Empty → section links to Google reviews instead of inventing quotes. |
| 13 | Google Maps embed URL (optional) | Replace `LocationArt` in `src/components/LocationSection.tsx` with the `<iframe>` from Maps → Share → Embed | A stylised non-map card is shown; Directions button uses the real Maps link. |

---

## Quick start

```bash
npm install                  # Node 20+
cp .env.example .env         # fill in the verified values
npm run dev                  # http://localhost:5173  (shows a config banner if the number is missing)
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Production build → `dist/` (code-split JS, hashed assets, 5 pre-rendered HTML pages, sitemap.xml, robots.txt). Set `STRICT_ENV=1` to fail the build when launch-critical env is missing. |
| `npm run preview -- --port 4173` | Serves `dist/` like a static host (directory index, 404 page, immutable asset caching). |
| `npm run typecheck` | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). |
| `npm run lint` / `npm run lint:fix` | Biome: TS/TSX/CSS lint + format, incl. a11y and React-hooks rules. |
| `npm run test:unit` | Node test runner: quote validation, message builder, E.164 handling, unconfigured state. |
| `npm run test:e2e` | Playwright (desktop + Pixel 7): quote validation, WhatsApp link/message, call & directions links, keyboard navigation, sticky bar, SEO, i18n. Builds with test placeholder numbers first. |
| `npm run screenshots` | Full-page + viewport screenshots at 375/768/1024/1440 → `screenshots/`, and asserts no horizontal overflow. |
| `npm run verify` | typecheck → lint → unit → build → e2e. |
| `npm run images` | Builds the responsive AVIF/WebP/JPEG photographs in `public/images/` from the shop's originals in `assets-source/photos/` (needs Python + Pillow). Run once after cloning; CI runs it on every build. Add `-- --force` to rebuild. See `docs/image-asset-plan.md`. |
| `npm run assets` | Regenerates any missing binary assets (WOFF font subsets from `google/fonts`, favicon/touch icons, OG image) with Python (`pip install fonttools pillow`). Committed files are kept; use `-- --force` to rebuild. CI runs this automatically. |

---

## Configuration

All configuration is via `PUBLIC_*` variables (see `.env.example`). Precedence: `.env` < `.env.<mode>` < `.env.local` < `.env.<mode>.local` < process environment. Only `PUBLIC_*` keys reach the browser; never put secrets in them.

- **WhatsApp number** — `PUBLIC_WHATSAPP_E164`. Validated at build time (`scripts/lib/env.mjs`) and at runtime (`src/config/env.ts`). If missing or invalid, every WhatsApp button renders a visible "WhatsApp number not configured" state and the dev server shows a banner; no `wa.me` link is ever generated with a wrong number.
- **Business facts** — `src/config/site.ts` (address, hours draft, brands, areas, testimonials) and `src/config/products.ts` (categories, units, what to ask for). No prices or stock levels are stored anywhere.
- **Copy / translations** — `src/i18n/en.ts` and `src/i18n/bn.ts`. Every key exists in both.

---

## Tracking

`src/lib/analytics.ts` exposes `track(event, params)` for:
`whatsapp_click` · `call_click` · `directions_click` · `quote_started` · `quote_submitted` (plus `language_change`, `consent_update`).

- Provider scripts (GA4 / Google Ads / Meta Pixel) load **only** when their ID is set **and** the visitor accepts the consent banner. With no IDs configured, no third-party request is made and no banner is shown.
- Params never include names, phone numbers or message text (denylist in `sanitise()`); events carry `source` (which button) and `page_path` only.
- Every event is also pushed to `window.__bt_events`, which is how the E2E tests verify tracking without any account.

---

## Deployment

### Live: GitHub Pages (free) — automatic on every push

`.github/workflows/deploy.yml` builds the site and publishes `dist/` to GitHub Pages whenever `main` is pushed. Public configuration is committed in `.env.production` (WhatsApp/call number, site URL and the repository sub-path); it contains no secrets — every `PUBLIC_*` value is visible in the site anyway.

- Live URL: **https://vkgupta0118.github.io/BALA-G-TRADING-CENTER/**
- Repository → *Settings → Pages → Build and deployment → Source: GitHub Actions* (the workflow also tries to enable this itself).
- The build runs `typecheck`, `lint`, `test:unit` and a `STRICT_ENV=1` build before deploying; an `e2e` job runs the Playwright suite in parallel and uploads a report on failure.
- Because a *project* Pages site lives under `/BALA-G-TRADING-CENTER/`, `PUBLIC_BASE_PATH` is set. Moving to a custom domain later means: add the domain in *Settings → Pages*, set `PUBLIC_SITE_URL=https://your-domain` and `PUBLIC_BASE_PATH=` (empty) in `.env.production`, push.
- Preview a sub-path build locally: `npm run build && npm run preview -- --base /BALA-G-TRADING-CENTER` → http://localhost:4173/BALA-G-TRADING-CENTER/

### Optional: Streamlit Community Cloud mirror

Streamlit hosts Python apps, not websites, so it cannot serve the site's real URLs, sitemap or WhatsApp link previews. `streamlit_app.py` is a thin mirror that embeds the GitHub Pages site so a share.streamlit.io link also works: *share.streamlit.io → New app → repo `vkgupta0118/BALA-G-TRADING-CENTER`, branch `main`, main file `streamlit_app.py`*. Use the GitHub Pages URL in Google Business Profile and ads.

### Any other static host

The build is fully static. For Netlify / Vercel / Cloudflare Pages / Nginx: build command `npm ci && STRICT_ENV=1 npm run build`, publish directory `dist`, set `PUBLIC_BASE_PATH=` (empty) and `PUBLIC_SITE_URL` to the final domain. Serve `404.html` for unknown paths and cache `/assets/*` as immutable.

### After every deploy
1. On a real phone: tap WhatsApp (opens the chat with the prefilled text), Call, Directions; submit a test quote; switch to Bengali.
2. Google Search Console: verify the property and submit `<site>/sitemap.xml`.
3. Google Business Profile: add the website URL (`docs/google-business-profile-checklist.md`).

## Project structure

```
index.html                 HTML template (head/app/script slots)
.env.production            committed PUBLIC_* values for the GitHub Pages deployment
.github/workflows/         deploy.yml – build, test, publish to GitHub Pages
streamlit_app.py           optional Streamlit Community Cloud mirror (embeds the live site)
scripts/
  build.mjs                client bundle + server render → dist/
  dev.mjs                  esbuild watch + serve with live reload
  preview.mjs              zero-dependency static server for dist/
  test-unit.mjs            bundles tests/unit and runs node --test
  lib/env.mjs              PUBLIC_* env loading & validation
  lib/html.mjs             template rendering, copyDir
src/
  main.tsx                 hydrate/render
  entry-server.tsx         build-time pre-rendering
  App.tsx                  providers + route switch
  config/  env.ts, site.ts, products.ts
  lib/     router.tsx, whatsapp.ts, quote.ts, analytics.ts, head.ts
  i18n/    en.ts, bn.ts, index.tsx
  seo/     jsonld.ts, pages.ts
  components/  Header, Footer, StickyBar, ConversionLinks, ConsentBanner, DevConfigBanner,
               LocationSection, PageHeader, Reveal, Picture (responsive <picture> + photo-pending panel), icons
  pages/   HomePage, ProductsPage, QuotePage, ContactPage, NotFoundPage
  styles/  tokens.css, base.css, components.css
public/    fonts (OFL, self-hosted), favicon, icons, og-image (reproducible via scripts/assets/generate.py)
           images/ - responsive photo derivatives, generated by scripts/assets/images.py (not committed)
assets-source/photos/   the shop's own photographs, the single source for public/images/
tests/     unit/, e2e/, screenshots/
docs/      growth plan, GBP checklist, design decisions
design-system/             generated MASTER.md from ui-ux-pro-max
```

## Licences

Fonts are self-hosted under the SIL Open Font License (see `public/fonts/LICENSE-*.txt`): Bebas Neue, Source Sans 3, Noto Sans Bengali. No third-party images or brand assets are included.
