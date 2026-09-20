# Google Business Profile checklist — M/S Balajee Trading Centre

Work through this in order. Items marked **VERIFY** need the owner to confirm a fact before it is entered anywhere.

## 1. Identity
- [ ] **VERIFY** the final business name. Google currently shows *M.S. BALA G TRADING CENTER*; the signboard shows *M/S BALAJEE TRADING CENTRE*. Pick one spelling that matches your trade licence/GST registration and use it on Google, the website (`PUBLIC_BUSINESS_NAME`), WhatsApp Business and invoices.
- [ ] Do not add keywords to the name (e.g. "Cement Shop Siliguri") — this violates Google's guidelines and risks suspension.
- [ ] Primary category: **Building materials supplier** (or the closest available). Secondary categories: Hardware store, Cement supplier, Brick supplier — only if they exist in Google's list and match what you sell.
- [ ] Business description (750 characters max): what you sell, who you serve (homeowners, masons, contractors in Siliguri), where you are (Champasari Road, Debidanga, near Uttarbanga Kshetriya Gramin Bank), and how to get a price (WhatsApp). No superlatives, no unverified dealership claims.

## 2. Location
- [ ] Address exactly: Champasari Road, near Uttarbanga Kshetriya Gramin Bank, Debidanga, Siliguri, West Bengal 734003.
- [ ] Drag the map pin onto the actual shopfront (check Street View — the June 2025 imagery shows the signboard).
- [ ] Service area: add Siliguri and the localities you actually deliver to. **VERIFY** delivery areas first.

## 3. Contact
- [ ] **VERIFY** the phone number. The signboard shows two numbers and Google shows a third. Use the WhatsApp Business number as the primary phone so calls and WhatsApp land with the same person.
- [ ] Add the website URL once deployed (`PUBLIC_SITE_URL`). Use the plain domain, no tracking parameters.
- [ ] Turn on **Messages** (Google chat) only if someone will answer them; otherwise leave off so customers use WhatsApp.

## 4. Hours
- [ ] **VERIFY** opening and closing time for each day, including Sunday and lunch breaks if the shop closes.
- [ ] Set special hours for public holidays and Puja days in advance.
- [ ] Mirror the same hours in `src/config/site.ts` and set `PUBLIC_HOURS_VERIFIED=true`.

## 5. Products & services
- [ ] Add each category as a product: Cement, Bricks, TMT rods & steel, Hardware, Other building materials. Description only; leave price blank or "Contact for price". Never enter a price you do not update.
- [ ] Add brands as products **only** if you stock them (**VERIFY** — e.g. UltraTech, Dalmia, Star Cement appear on the signboard). Do not write "authorised dealer" unless you hold dealership documentation.
- [ ] Attributes: identify accessibility, payment methods actually accepted (cash/UPI/cards), and "on-site services" honestly.

## 6. Photos (15+ originals)
- [ ] Logo (square) and cover photo (shopfront, landscape, daylight).
- [ ] Exterior from the road showing the signboard and the landmark.
- [ ] Interior: counter, hardware shelves.
- [ ] Products: cement stack, TMT bundles by diameter, bricks, binding wire.
- [ ] Team at work, delivery vehicle being loaded, a completed delivery at a site (with the customer's permission).
- [ ] No stock photos, no brand posters copied from the internet, no screenshots of Google Maps.
- [ ] Add 2–4 new photos every month; Google favours recent imagery.

## 7. Weekly Google Posts
- [ ] One post per week with a photo: stock arrival, material tip, delivery photo, seasonal advice, holiday hours.
- [ ] Every post ends with a "Get a quote" or "Call" button pointing to the website `/quote` page or the phone.
- [ ] Keep claims factual; no "lowest price" or "#1".

## 8. Reviews — ethical workflow
- [ ] After every completed order, send the same thank-you message with the Google review link (WhatsApp quick reply).
- [ ] Ask **every** customer, not only the happy ones — selective asking ("review gating") is against Google policy.
- [ ] Never pay, discount, gift or otherwise incentivise a review, and never ask staff, family or friends to post reviews.
- [ ] Reply to every review within a week: thank positive reviewers briefly; for negative ones, acknowledge, state what you will do, and move the conversation to phone/WhatsApp. Never argue publicly.
- [ ] Report clearly fake reviews through the GBP interface; do not respond aggressively.

## 9. Ongoing
- [ ] Check GBP Performance monthly: searches, calls, direction requests, website clicks. Copy the numbers into the weekly scorecard in `docs/90-day-growth-plan.md`.
- [ ] Answer the Q&A section yourself with common questions (delivery, minimum quantities, payment) — the FAQ on the website has ready wording.
- [ ] Re-verify the profile if Google asks (video verification is common for hardware shops).
