# Design & engineering decisions

## Design system provenance

The visual system was generated with the `ui-ux-pro-max` skill
(`search.py "building materials hardware store local commerce cement bricks steel premium industrial trust" --design-system --variance 5 --motion 3 --density 3`)
and persisted to `design-system/balajee-trading-centre/MASTER.md`. The following adjustments were made after reviewing the skill's output against the brief:

| Area | Skill output | Decision | Why |
|---|---|---|---|
| Pattern | Feature-Rich Showcase (hero → cards → benefits → proof → CTA) | **Kept** | Matches a local commerce site with one primary action (WhatsApp quote). |
| Palette | Charcoal `#1C1917`, stone neutrals, gold accent `#A16207`, muted steel `#E8ECF0`/`#475569` | **Kept**, added steel-blue `#2B5B84` for links and a bright gold `#E3B341` for highlights on dark | Gives the requested charcoal/stone + gold + steel-blue "industrial confidence" scheme. All text pairs verified ≥ 4.5:1 (see below). |
| Style | *Liquid Glass* (blur, translucency, Apple-system chrome) | **Replaced** with a flat, solid-surface style (skill result `flat-design`) plus restrained card shadows | Glass/blur is a poor fit for a building-materials shop, costs GPU time on low-end Android phones, and the skill's own metadata flags it as "performance: moderate, accessibility: conditional". |
| Typography | Cormorant + Montserrat (luxury fashion mood) | **Replaced** with skill result *Bold Statement*: **Bebas Neue** display + **Source Sans 3** body, plus **Noto Sans Bengali** for the Bengali toggle | Condensed uppercase display reads like construction signage; Source Sans 3 is highly legible at 17px on phones. Cormorant/Montserrat are tuned for fashion/luxury, not trade. |
| Motion | Subtle scroll reveal (GSAP snippet, 300–400 ms) | Implemented natively with IntersectionObserver + CSS (no GSAP dependency), 400 ms fade/12 px rise, disabled under `prefers-reduced-motion` | Same effect, zero library weight. Content is visible by default for no-JS/crawlers. |
| Density | Spacious (24–96 px) | **Kept** | Marketing page, generous whitespace. |

### Contrast audit (WCAG 2.2 AA, normal text ≥ 4.5:1)

| Pair | Ratio |
|---|---|
| White on charcoal `#1C1917` | 17.5 |
| Gold-700 `#A16207` text on white / stone-50 | 4.92 / 4.71 |
| White on gold-700 (accent button) | 4.92 |
| Gold-400 `#E3B341` on charcoal | 8.99 |
| Steel-700 `#2B5B84` links on white | 7.16 |
| Muted text `#475569` on stone-50 | 7.26 |
| Stone-300 on charcoal (muted on dark) | 11.7 |
| White on WhatsApp button `#0E7566` | 5.59 (brand green `#128C7E` failed at 4.14 and was darkened) |
| Danger `#B91C1C` on white | 6.47 |

## Accessibility & interaction

- Every interactive element ≥ 44 × 44 px (`--touch`), buttons 48 px, sticky bar items 52 px.
- `:focus-visible` 3 px ring everywhere; gold ring on dark surfaces.
- Skip link, `<main tabIndex=-1>` focus target after client-side navigation, `aria-current="page"` on active nav.
- Forms: visible labels, `aria-invalid`, `aria-describedby` for hints/errors, an error summary with links that receives focus on failed submit, `inputmode` on numeric/tel inputs.
- `<ul role="list">` is intentional (restores list semantics in Safari/VoiceOver when `list-style: none`), hence Biome's `noRedundantRoles` is disabled.
- `!important` is used only in the `.visually-hidden` utility and the reduced-motion override, hence `noImportantStyles` is disabled.
- `noDescendingSpecificity` is disabled: component CSS is ordered by component, not by specificity, and the rule produced only false positives.

## 3D scene

- Pure CSS 3D (~70 nodes), no WebGL/three.js. Only front/right/top faces are rendered.
- Lazy-loaded (`React.lazy`) after the hero intersects and the browser is idle; static SVG fallback is server-rendered so the hero is never empty.
- Skipped entirely on `navigator.connection.saveData` or `deviceMemory ≤ 2 GB`.
- `prefers-reduced-motion`: no idle float, no pointer tilt — static isometric render.

## Architecture

- **React 19 + TypeScript**, bundled with **esbuild** (`scripts/build.mjs`). Vite was not used because the npm registry was unreachable from the build sandbox; esbuild was the bundler available offline and is production-grade. The `src/` tree is plain React/TSX and can be moved to Vite by adding `vite.config.ts` with `envPrefix: 'PUBLIC_'` if the team prefers.
- **Static pre-rendering**: every route is rendered to HTML at build time (`src/entry-server.tsx`), then hydrated. Crawlers and WhatsApp link previews get real content, titles, descriptions and JSON-LD without a server.
- **Dependency-free router** (`src/lib/router.tsx`) — 4 routes did not justify a routing library.
- **Configuration only via `PUBLIC_*` env vars** (`src/config/env.ts`). No phone number, domain or analytics ID exists in any component.
- **Analytics layer** (`src/lib/analytics.ts`): one `track()` API, providers load only after consent, a PII denylist strips `name/phone/email/message` keys, and every event is mirrored to `window.__bt_events` for tests.
- **Linting** with Biome (TS + CSS + a11y rules) and `tsc --noEmit` in strict mode.
