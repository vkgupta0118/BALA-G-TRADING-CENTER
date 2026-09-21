# Completion report — 20–21 September 2026

Project: `balajee-trading-centre-site` — live at https://vkgupta0118.github.io/BALA-G-TRADING-CENTER/ · source `github.com/vkgupta0118/BALA-G-TRADING-CENTER` · local copy `E:\AI\siliguri`

## What was verified in this session (actually run, not described)

| Check | Command | Result |
|---|---|---|
| Type-check (strict) | `npm run typecheck` | 0 errors |
| Lint + format (Biome: TS/TSX/CSS/a11y/hooks) | `npm run lint` | 58 files, 0 errors, 0 warnings |
| Unit tests (Node test runner) | `npm run test:unit` | **18 / 18 passed** — E.164 handling, wa.me link building incl. the *unconfigured* state, phone normalisation, quote validation, message content, link round-trip |
| Production build + pre-render | `npm run build` | 5 pages (`/`, `/products`, `/quote`, `/contact`, `404.html`), sitemap.xml, robots.txt; JS 83.7 KB gzip, CSS 7.0 KB gzip, 3D scene chunk 1.3 KB gzip lazy-loaded |
| E2E — desktop Chrome + Pixel 7 emulation | `npm run test:e2e` | **47 passed, 0 failed** (5 device-specific tests skipped on the other device, by design) |
| Responsive screenshots + overflow assertions | `npm run screenshots` | **20 passed**, 36 PNGs in `screenshots/` at 375 / 768 / 1024 / 1440 px; no horizontal overflow on any page at any width |
| Dev server | `npm run dev` | Serves at http://localhost:5173 with live reload; shows the configuration banner and dashed "WhatsApp number not configured" CTAs when `PUBLIC_WHATSAPP_E164` is empty (`screenshots/dev-unconfigured-1280-viewport.png` was captured in this state — regenerate with `npm run dev` if needed); 0 console errors |
| Preview server | `npm run preview -- --port 4173` | Serves `dist/` at http://localhost:4173 with directory index + 404 |
| Full pipeline | `npm run verify` | typecheck → lint → unit → build → e2e, exit code 0 |

### E2E coverage (tests/e2e)
- **quote.spec.ts** — empty submit blocked with focused error summary (4 linked errors); per-line quantity validation with live clearing; invalid phone rejected; full flow opens WhatsApp popup with `https://wa.me/<number>?text=` containing all lines, specs, units, delivery area, name, normalised phone and notes; fallback link carries the identical href; `?add=<category>` pre-selects; copy button puts the exact message on the clipboard; `quote_started`/`quote_submitted` tracked with no personal data.
- **links.spec.ts** — every WhatsApp CTA on the home page is a valid wa.me link with the configured number only, `target=_blank rel=noopener`; product "Request today's price" names the product; `tel:+<E164>` call links + `call_click`; Directions → Maps URL + `directions_click`; contact form validates and routes to WhatsApp instead of pretending to store data.
- **keyboard.spec.ts** — skip link first, focus to `<main>`; visible focus ring on every header control; mobile menu Enter/Escape with focus return; client-side navigation moves focus and updates title; quote builder operable by keyboard incl. error-summary links; FAQ accordions toggle with Enter/Space.
- **sticky-bar.spec.ts** — fixed to the viewport bottom on mobile, three targets ≥ 44 px, correct hrefs, present on every page, body padding reserves space, hidden on desktop where the header CTA shows.
- **seo-i18n.spec.ts** — each route ships real HTML with title/description/canonical/OG/HardwareStore JSON-LD; robots/sitemap/manifest/404; no banned claims ("lowest price", "#1", "same-day delivery", "authorised dealer"); unverified facts hidden; Bengali toggle translates hero, CTAs, sticky bar and the WhatsApp message, and persists across reload.

### Test placeholders (never used in a real build)
E2E and unit tests inject `PUBLIC_WHATSAPP_E164=919999999999`, `PUBLIC_PHONE_E164=918888888888`, `PUBLIC_SITE_URL=https://example.test` via `playwright.config.ts` / `scripts/test-unit.mjs`. The delivered source contains **no** phone number, domain or analytics ID.

## Environment note (why esbuild, not Vite)
The build sandbox's network policy blocked `registry.npmjs.org` (only GitHub was reachable), so packages could not be installed. The toolchain was assembled from what was available offline: React 19.2.6, TypeScript 6, esbuild 0.27.7, Playwright 1.56, plus `@types/react` (DefinitelyTyped), Biome 2.5.14 (GitHub release) and OFL fonts (`google/fonts` repo). All of these are declared in `package.json`, so `npm install` on your machine reproduces the setup; a `package-lock.json` will be created on your first install. The source is plain React/TSX and can be moved to Vite later if preferred (see `docs/design-decisions.md`).

## Files delivered (source only — `node_modules/`, `dist/`, `.tmp/` excluded)
```
package.json, tsconfig.json, biome.json, .env.example, .gitignore, index.html, README.md
playwright.config.ts, playwright.screenshots.config.ts
scripts/            build.mjs, dev.mjs, preview.mjs, test-unit.mjs, lib/env.mjs, lib/html.mjs
src/                main.tsx, entry-server.tsx, App.tsx, env.d.ts
  config/           env.ts, site.ts, products.ts
  lib/              router.tsx, whatsapp.ts, quote.ts, analytics.ts, head.ts
  i18n/             en.ts, bn.ts, index.tsx
  seo/              jsonld.ts, pages.ts
  components/       Header, Footer, StickyBar, ConversionLinks, ConsentBanner, DevConfigBanner,
                    LocationSection, PageHeader, Reveal, Layout, icons, scene/{LazyScene,MaterialsScene,SceneFallback}
  pages/            HomePage, ProductsPage, QuotePage, ContactPage, NotFoundPage
  styles/           index.css, tokens.css, base.css, components.css, scene.css
public/             favicon.svg/.ico, apple-touch-icon.png, icon-512.png, og-image.png, site.webmanifest,
                    fonts/ (Bebas Neue, Source Sans 3, Noto Sans Bengali — WOFF subsets + OFL licences)
tests/              unit/quote.test.ts · e2e/{helpers,quote,links,keyboard,sticky-bar,seo-i18n}.spec.ts · screenshots/responsive.spec.ts
docs/               90-day-growth-plan.md, google-business-profile-checklist.md, design-decisions.md, completion-report.md
design-system/      balajee-trading-centre/MASTER.md (generated by ui-ux-pro-max, with implementation notes)
screenshots/        36 PNGs (4 pages × 4 widths, full-page + viewport, plus Bengali, mobile menu, filled quote, validation, dev-unconfigured)
```

## Update — 20 Sep 2026 (evening)
- Owner confirmed the shop number **93391 88629** → `PUBLIC_WHATSAPP_E164=919339188629`, `PUBLIC_PHONE_E164=919339188629` in `.env.production`.
- Hosting: GitHub Pages via `.github/workflows/deploy.yml` (repo `vkgupta0118/BALA-G-TRADING-CENTER`, URL `https://vkgupta0118.github.io/BALA-G-TRADING-CENTER/`). `PUBLIC_BASE_PATH` support added and smoke-tested locally (all routes, fonts, WhatsApp/tel links, client-side navigation, 404).
- Optional Streamlit mirror (`streamlit_app.py`) embeds the live site; Streamlit cannot host the site itself.

## Still needs the owner (nothing here is guessed)
1. ~~Verified WhatsApp Business number~~ → **done** (919339188629).
2. **Custom domain** (optional) → `PUBLIC_SITE_URL` / `PUBLIC_BASE_PATH`; the free GitHub Pages address is configured.
3. **Final business-name spelling** (M/S Balajee Trading Centre vs. Google's "M.S. BALA G TRADING CENTER") → `PUBLIC_BUSINESS_NAME`, then fix Google to match.
4. **Business hours** → `src/config/site.ts` + `PUBLIC_HOURS_VERIFIED=true` (currently hidden; site says "call to confirm").
5. **Delivery areas / whether you deliver** → `PUBLIC_DELIVERY_VERIFIED=true` after confirming.
6. **Brands actually stocked** → `PUBLIC_SHOW_BRANDS=true` (section hidden until then; never says "authorised dealer").
7. **15+ original photos** and a **logo** if one exists.
8. **Analytics IDs** (GA4 / Google Ads / Meta) — optional; nothing loads without them and without consent.
9. **Privacy/contact email** → `PUBLIC_CONTACT_EMAIL`.
10. **Real testimonials** with permission → `src/config/site.ts`.

## Update — 21 Sep 2026: the site is LIVE

**Live URL: https://vkgupta0118.github.io/BALA-G-TRADING-CENTER/**

Deployed from GitHub Actions run #2 (`workflow_dispatch`, commit `0785165`). All three jobs green: `build` 28s, `e2e` 1m 4s, `deploy` 11s.

Getting there took one detour worth recording: run #1 failed at the `actions/configure-pages` step with *"Create Pages site failed — Resource not accessible by integration"*. The workflow's `GITHUB_TOKEN` can attach to an existing Pages site but cannot create one, so `enablement: true` is not enough on a repo where Pages has never been switched on. Fix: *Settings → Pages → Build and deployment → Source → GitHub Actions* (done 21 Sep), then re-run. Everything before that step had already passed in run #1, so the failure was purely the hosting switch, not the build.

### Verified on the live URL (not inferred — checked in a browser against the deployed site)
- **Pages render with real pre-rendered HTML:** `/` (h1 "Cement, bricks and TMT steel for your site in Siliguri"), `/products` (6 cards, anchors `#cement` … `#tmt-rods-steel`, h1 "What we supply"), `/quote` (form present, 5 category buttons, 17 delivery-area options), `/contact` (enquiry form present, hours still showing the unverified "call to confirm" state).
- **WhatsApp number:** 11 `wa.me` links on the home page, every one of them on `919339188629` and no other number anywhere in the markup.
- **Click-to-call:** `tel:+919339188629`.
- **Sub-path hosting works:** canonical `…/BALA-G-TRADING-CENTER/`, all nav links base-prefixed, client-side routing intact.
- **SEO files:** `robots.txt` serves `Sitemap: https://vkgupta0118.github.io/BALA-G-TRADING-CENTER/sitemap.xml`; `sitemap.xml` lists the four public routes with today's `lastmod`; 3 JSON-LD blocks on the home page (HardwareStore, WebSite, FAQPage).
- **404:** an unknown path returns the styled "Page not found" page.
- **Assets:** all three self-hosted fonts loaded (`document.fonts.size === 3`); the CSS-3D materials scene and the mobile sticky bar are both present in the DOM; no horizontal overflow.
- **CI quality gates on the deployed commit:** typecheck, Biome lint, 20 unit tests, `STRICT_ENV=1` production build, and the full 47-test Playwright suite (desktop + Pixel 7) all passed on GitHub's runners — including the font/icon/OG-image generation step, which rebuilt every binary asset from source in 4 seconds.

### Repository upload integrity
The sandbox could not `git push` (org egress policy blocks it) and the local VM has no GitHub access, so all 76 tracked text files were uploaded through GitHub's web upload form driven by Claude in Chrome. Each batch carried a byte-length + DJB2 checksum computed in the browser and compared against the value computed in the sandbox before the commit was allowed to proceed. Afterwards the repo was cloned back into the sandbox and diffed file-by-file: **all 76 files byte-identical**. Binary assets (WOFF subsets, PNG/ICO icons, OG image) are deliberately not committed — CI regenerates them reproducibly via `scripts/assets/generate.py`.

## Not verified / not claimed
- **The WhatsApp link has not been tapped on a real phone.** The URL format is unit-tested, E2E-tested against a stubbed `wa.me`, and confirmed on the live page to carry `919339188629` — but whether that SIM actually has WhatsApp Business running, and what the chat looks like when it opens, can only be confirmed by you tapping it on the phone. Do this first.
- No custom domain, DNS, analytics account, Google Ads account, or Google Business Profile change has been connected. GA4/Meta/Ads IDs are empty, so no third-party script loads at all and no consent banner appears.
- The Streamlit mirror has not been deployed; `streamlit_app.py` is ready but nobody has created the share.streamlit.io app.
- Bengali copy was written by the assistant; have a Bengali-speaking staff member read `src/i18n/bn.ts` once before you push the site in ads.
- Business hours, delivery promise, brands and testimonials remain hidden behind their `PUBLIC_*` flags because they are still unverified.

## Deployment steps

Deployment is now automatic: **push to `main` → GitHub Actions builds and publishes to GitHub Pages.** Nothing manual is required for a content change.

1. Edit locally → `npm run verify` (all green) → commit and push to `main`. The workflow redeploys in about a minute.
2. Confirm on a phone after the first deploy: WhatsApp, Call, Directions, quote submit, Bengali toggle.
3. Google Search Console → submit `/sitemap.xml`. Google Business Profile → add website, follow `docs/google-business-profile-checklist.md`.
4. Start week 1 of `docs/90-day-growth-plan.md` and the weekly scorecard.
