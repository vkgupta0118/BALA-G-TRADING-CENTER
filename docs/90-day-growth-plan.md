# 90-Day Digital Growth Plan — M/S Balajee Trading Centre, Siliguri

**Goal being pursued:** a 100% increase in monthly sales (revenue) versus the pre-launch baseline, by turning local search and WhatsApp into a steady stream of qualified quote requests that the shop converts into orders.

## Read this first — what this plan can and cannot promise

Doubling sales **cannot be promised**. Whether it happens depends on things no website or ad campaign controls:

| Factor | Why it decides the outcome |
|---|---|
| **Baseline sales** | A shop doing ₹5 lakh/month needs +₹5 lakh; one doing ₹50 lakh needs +₹50 lakh. The same marketing effort produces very different percentage results. |
| **Stock availability** | Quotes that end in "not in stock this week" are lost sales, and lost trust. |
| **Pricing** | Cement and TMT are commodity products; buyers compare 2–3 shops. A quote that is far off the market rate will not convert, no matter how good the website is. |
| **Fulfilment** | Delivery capacity, vehicle availability and timing determine whether a quote can become an order. |
| **Budget** | Google Ads in a competitive category needs a sustained monthly budget for at least 8–10 weeks before the data is reliable. |
| **Speed of follow-up** | A WhatsApp quote answered in 5 minutes converts far better than one answered in 5 hours. This is the single biggest lever the shop controls. |

Treat the 100% target as a direction, review the weekly scorecard honestly, and adjust. Everything below is a plan to *pursue* the target, not a guarantee.

---

## Phase 1 — Weeks 1–2: Foundation

**Outcome by end of week 2:** every channel a customer can find you on is correct, consistent and measurable.

### Google Business Profile (GBP)
- Fix the business name. Google currently shows **"M.S. BALA G TRADING CENTER"**; the signboard reads **"M/S BALAJEE TRADING CENTRE"**. Choose the final legal/trading spelling once and use it everywhere (Google, website, WhatsApp Business, invoices).
- Primary category: **Building materials supplier**; secondary: Hardware store, Cement supplier, Brick supplier (use whichever exist in Google's list).
- Confirm the map pin is on the actual shopfront on Champasari Road, Debidanga; check the address, PIN 734003 and the landmark.
- Confirm business hours for every day, including Sunday, and set holiday hours.
- Add the WhatsApp Business number as the primary phone, then add the website URL once deployed.
- Add products/services (cement, bricks, TMT rods, hardware, other building materials) with "Get a quote" as the call to action.
- Full checklist: `docs/google-business-profile-checklist.md`.

### Website launch
- Provide the verified inputs listed in `README.md → Before launch`.
- Deploy to the chosen host; verify the WhatsApp, Call and Directions buttons on a real phone.
- Submit `sitemap.xml` in Google Search Console; verify the domain.

### Tracking baseline (measure *before* spending on ads)
- Record for the last 4–8 weeks, from memory/books if needed: monthly revenue, number of orders, average order value, gross margin %, number of walk-in vs phone vs WhatsApp enquiries.
- Configure GA4 (optional but recommended) so `whatsapp_click`, `call_click`, `directions_click`, `quote_started`, `quote_submitted` flow in.
- Start the weekly scorecard (below) in week 1 even if numbers are rough.

### Product photos
- Take **15+ original photos**: shopfront with signboard, counter, cement stack, TMT bundles by diameter, bricks, hardware shelves, delivery vehicle loading, the team. Landscape, daylight, no filters. Upload to GBP and keep for the website `public/images/` folder.

### WhatsApp Business setup
- Use **WhatsApp Business** (not personal WhatsApp) on the shop number.
- Business profile: name, address, hours, website, description.
- Catalogue: one item per category with "Ask for today's price" — no fixed prices.
- Quick replies: greeting, "Today's cement rate is…", "Delivery to <area> — charges…", "Please share diameter and weight for TMT", "Thank you — please review us on Google: <link>".
- Away message outside hours with the opening time.

### Customer & review process
- Decide who answers WhatsApp during shop hours and the target response time (aim: under 10 minutes).
- After each completed order, send the thank-you quick reply with the Google review link. Ask every customer the same way; never offer discounts, gifts or cash for reviews, and never select only happy customers to ask.

---

## Phase 2 — Weeks 3–6: Demand generation

**Outcome by end of week 6:** paid and organic channels are producing qualified WhatsApp quote requests at a known cost per lead.

### Google Search & Maps ads (high-intent local keywords)
- Campaign type: Search, with location assets linked to GBP so ads appear in Maps.
- Geo-target: Siliguri and a ~15 km radius (adjust after checking where quotes actually come from).
- Keyword themes (phrase/exact match, in English and Bengali transliteration where searched):
  - cement price siliguri, cement shop near me, cement dealer champasari
  - tmt bar price siliguri, tmt rod dealer siliguri, saria price siliguri
  - bricks supplier siliguri, red bricks price siliguri
  - building materials shop siliguri, hardware shop debidanga
- Negative keywords from day 1: jobs, salary, franchise, manufacturing, factory, wholesale license, plus other cities.
- Ad copy must stay factual: "Cement, TMT & bricks in Siliguri · Get today's price on WhatsApp". No "lowest price", "#1", "same-day delivery" or brand-dealership claims unless verified.
- Landing pages: `/quote` for price keywords, `/products` for category keywords, `/` for brand searches.
- Conversion actions: `quote_submitted` (primary), `whatsapp_click`, `call_click`. Import from GA4 or use the Google Ads tag with `PUBLIC_GOOGLE_ADS_ID`.
- Budget: start modestly, hold it steady for 3 weeks before judging. Optimise on **cost per qualified lead**, not clicks.

### Retargeting — only after consent and measurement are in place
- Do not run remarketing until: the consent banner is live, GA4/Ads/Meta tags fire only after consent, and a privacy notice with a contact email is published.
- Then: a small remarketing audience of visitors who started a quote but did not submit, with a plain reminder ad.

### Contractor / mason referral programme
- Build a list of 30–50 masons, contractors and small builders who already buy or could buy.
- Offer a transparent trade arrangement (for example a credit period or volume rate agreed in writing) — not hidden commissions.
- Give each a WhatsApp quick link to the quote builder to share with their clients.
- Track referrals in a simple sheet: who referred, order value, repeat rate.

### Weekly Google Posts
- One post per week: current stock arrival, a material tip, a completed delivery photo, a seasonal note (monsoon storage of cement, pre-Puja renovation season). Always end with "WhatsApp us for today's price".

### Local Facebook / Instagram / Reels
- 2–3 posts per week, 1 Reel per week: unloading a TMT truck, how to check cement bag date, brick quality check, a mason's tip. Local language, no music copyright issues (use platform-licensed audio).
- Boost only posts that produce WhatsApp enquiries organically.

---

## Phase 3 — Weeks 7–12: Scale what works

**Outcome by end of week 12:** budget concentrated on the campaigns, keywords and messages that produce orders; repeat business measured and growing.

### Scale the winners
- Review the scorecard: which keywords, ads and posts produced *qualified* quotes and *orders*? Move budget there; pause the rest.
- Increase Google Ads budget only while cost per qualified lead and quote-to-order rate stay healthy.

### Repeat-customer offers
- For customers with completed orders: a WhatsApp broadcast (opt-in only) with a genuine, time-bound offer — e.g. a delivery-charge waiver above a quantity, or a bundle for a slab casting (cement + TMT + binding wire).
- Keep it factual and honour every offer exactly as stated.

### Contractor outreach
- Visit or call the referral list monthly; ask what they need next month and pre-plan stock.
- Offer to quote full bar-bending schedules — send them the quote builder link with `?add=tmt`.

### Local SEO content
- Add pages or FAQ entries answering real local questions: "How many cement bags for a 1,000 sq ft roof slab?", "Which TMT grade for a two-storey house?", "Cement storage in Siliguri monsoon".
- Each page: location-led title, one clear WhatsApp CTA, no fabricated prices.
- Ask satisfied contractors and suppliers with websites to link to the site.

### Conversion improvements
- Watch `quote_started` vs `quote_submitted`. If many start and few submit, simplify the form or add clearer unit choices.
- Watch `whatsapp_click` vs actual WhatsApp conversations received; a gap suggests a wrong number or slow replies.
- Add real testimonials to `src/config/site.ts` **only** from customers who agreed to be quoted, with their first name and role.
- Turn on the brands section once the owner confirms which brands are actually stocked (`PUBLIC_SHOW_BRANDS=true`).

---

## Weekly scorecard

Fill this every Monday for the previous week. Keep it in a spreadsheet; the first four weeks establish the baseline.

| Metric | Source | Week 1 | Week 2 | … | Week 12 |
|---|---|---|---|---|---|
| Calls received | Phone log / GBP insights / `call_click` | | | | |
| WhatsApp leads (new conversations) | WhatsApp Business / `whatsapp_click` | | | | |
| Quote requests (form submitted) | `quote_submitted` / WhatsApp count | | | | |
| Quotes sent | Shop log | | | | |
| Orders won | Shop log | | | | |
| **Quote-to-order conversion %** | Orders ÷ quotes sent | | | | |
| **Average order value (₹)** | Revenue ÷ orders | | | | |
| Repeat orders (returning customers) | Shop log | | | | |
| Ad spend (₹) | Google Ads / Meta | | | | |
| Qualified leads from ads | Ads conversions cross-checked with WhatsApp | | | | |
| **Cost per qualified lead (₹)** | Ad spend ÷ qualified leads | | | | |
| Revenue (₹) | Books | | | | |
| **Gross margin (₹ and %)** | Books | | | | |
| GBP: searches, calls, direction requests | GBP performance | | | | |
| Google reviews (count, average) | GBP | | | | |
| Response time to WhatsApp (median minutes) | WhatsApp Business | | | | |

**Decision rules**
- Cost per qualified lead rising for 2 weeks → pause the weakest keywords, tighten geo-targeting.
- Quote-to-order below 25% → check pricing versus the market and the reply speed before buying more traffic.
- WhatsApp clicks high but conversations low → verify the number in `PUBLIC_WHATSAPP_E164` on a real phone.
- Revenue up but margin down → offers are too deep; adjust before scaling.

---

## What "success" looks like at day 90 (targets to aim for, not promises)

- Consistent, accurate Google Business Profile with 15+ photos, weekly posts and a steady flow of honest reviews.
- Website live with verified number, hours and areas; every conversion event measured.
- A known cost per qualified lead from Google Ads and a decision on whether to keep, scale or stop.
- A contractor/mason list that produces repeat orders.
- A scorecard with 12 weeks of data showing where revenue actually came from — which is what makes the next 90 days plannable.
