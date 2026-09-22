# Homepage redesign — six standalone prompts (two directions × three brands)

Written 2026-09-22. Scope: **homepage only**, for the three English-language money brands —
`paraguayinvestorpass.com`, `paraguayresidencyguide.com`, `paraguayfrontier.com`.

Each of the six blocks below is a **standalone prompt**. Open a fresh session (Claude Code, claude.ai, or
Claude Design), paste one block, and it produces one self-contained HTML file containing a **desktop homepage
preview** and, **below it, a mobile homepage preview** of the same page. Nothing in a prompt depends on this
repo, on the other five prompts, or on anything said in this document — paste and go, in any order, in parallel.

This complements `docs/design-prompts.md` (F10, three pages per brand in Claude Design). That file explores
*inner pages* in a design tool; this one explores *the homepage, as running HTML*, so the two directions can be
opened side by side in a browser at real widths.

---

## First: can all six really have separate designs in one Node app?

Yes — and not by accident, that is already how the platform is built. Nothing about "separate design" costs an
install, a deploy, or a second app.

- One Next.js app serves all seven brands. `src/middleware.ts` resolves the request host to a `SiteKey` via
  `src/sites/registry.ts`; each brand's pages live in `src/app/(<locale>)/sites/<key>/`.
- Theming is `data-theme="<siteKey>"` on the site layout wrapper. The shared scale (spacing, type, radius,
  motion, container widths) is `src/styles/tokens.css`; each brand overrides colour, fonts, radius and hero
  pattern in `src/styles/themes/<key>.css` — that file is currently **13 lines per brand**.
- One hosting slot, one build, one `node_modules`, one deploy for every domain (plan §1.7).

So the real cost of divergence is not runtime, it is **maintenance surface**. Every shared component
(`Section`, `Container`, `Card`, `Bento`, `EditorialHero`, `SplitHero`, `Fact`, `LeadForm`, `FAQ`) has to keep
working under each theme. Divergence that lives in *tokens* is free forever. Divergence that needs each brand
to own bespoke components is paid for again on every future change.

And that is exactly the diagnosis of why the current sites feel cheap: the three themes **already** diverge
(dark/gold, warm serif/paper, cool/plain) but the three homepages are assembled from the *same four blocks in
the same order* — hero, narrow prose section, bento of cards, FAQ, lead form. Same rhythm, same density, same
silhouette, three paint jobs. The fix is **a distinct hero and one signature block per brand**, not a second
framework per brand.

### The house rules — what keeps them siblings in either direction

Whichever direction wins, all three brands keep these. They are the family resemblance, and every prompt below
restates them:

1. **One accent per brand, never two.** Colour carries brand; layout carries hierarchy.
2. **The evidence chip.** This group's actual differentiator is that it says which numbers are confirmed and
   which are not (`content/shared/facts.ts` — `verified: true/false`). That honesty is a *visual* asset:
   every figure on every brand renders with the same small state marker. Nobody else in this market does it.
3. **Same spacing rhythm and container widths** (~76rem wide, ~46rem narrow, 4/8/12/16/24 spacing steps).
4. **The same lead capture pattern and the same footer cross-link strip** ("same team in Asunción"), because
   the seven domains are one company and the footer is where that is admitted.
5. **No stock-photo gloss, no flags, no passport clip art, no decorative gradients, no fake logos or fake
   testimonials.** The sites have no photography today; every design must still hold up with zero photos.

### The two directions

Prompts 1A / 2A / 3A share a DNA; 1B / 2B / 3B share a different one. Run all six, then pick a *direction*
first and a *brand treatment* second.

**Direction A — "The Record".** Document logic. Hairline rules instead of boxes, near-zero corner radius,
numbered sections (01 / 02 / 03), monospaced numerals, small-caps eyebrows, a dense left-aligned grid, one
accent reserved for state and the primary CTA, rectangular buttons. A status strip of facts sits directly
under the hero with verified / unconfirmed markers. Comparison is a hairline table, not cards. Feels like a
prospectus, a filing, an instrument — the case is made by structure, not by adjectives.

**Direction B — "Open Country".** Editorial logic. Generous air, oversized display type, full-bleed tonal
panels, soft depth, 20px+ radii, a single strong image slot per screen (described placeholder, never a stock
photo), ~60ch measure, pill CTAs, a quiet pull-quote, a sticky action bar on mobile. Feels like a well-made
magazine or a modern product page — the case is made by confidence and space.

### After you pick

Porting a winner is small: the palette, fonts and radius become `src/styles/themes/<key>.css`, the shared
rhythm changes go in `src/styles/tokens.css`, and the hero + signature block become one new variant each in
`src/components/`. No schema, no routing, no second app.

---

## Prompt 1A — paraguayinvestorpass.com · Direction A ("The Record")

```
You are a senior product designer and front-end engineer. Design and build a homepage preview for
paraguayinvestorpass.com. Output is ONE self-contained HTML file — a desktop preview on top, a mobile preview
directly below it. This is a visual design exploration, not production code.

THE BRAND
Paraguay Investor Pass. The Investor Pass is a Paraguayan route to PERMANENT residency for people who bring
qualifying capital into the country — it removes the standard temporary-residency stage entirely. The company
is a small team in Asunción who file these cases themselves; six sister domains serve other audiences and the
footer admits that openly.
Audience: investors, family offices, and migration agents placing clients. High ticket, low volume, sceptical,
allergic to being sold to. Many arrive having read three articles that quote three different numbers.
The page must do exactly two things: make an investor believe these people actually file this, and get them to
either take the Route Finder (a 6-question quiz) or send an enquiry. There is no checkout on this brand.

COPY YOU MUST BUILD AROUND (use it near-verbatim; write the rest in the same voice)
H1: "Permanent residency in Paraguay, in one step."
Sub: "The Investor Pass lets qualifying investors skip temporary residency entirely. We structure the
investment, file the application and stay with you until the permanent card is in your hand."
The four qualifying routes, which are the spine of the page: Real estate · Productive business · Financial
instruments · Tourism.
Primary CTA "Find your route" (quiz). Secondary "Send an enquiry". A WhatsApp link is a tertiary, quiet option.
Voice: plain, specific, unhurried, second person, short sentences, states what takes time. Never "unlock",
"seamless", "world-class", "golden visa", "fast-track".

THE HONESTY RULE — THIS IS THE BRAND'S WHOLE DIFFERENTIATOR, DESIGN FOR IT
Public sources disagree about this programme's minimum investment (USD 70k, 150k and 200k all appear in print),
so the site never prints a threshold. Every figure renders in one of two states and the state is VISIBLE:
  • CONFIRMED — the figure is shown, with a small marker meaning "verified against the resolution text".
  • UNCONFIRMED — no number at all, only hedged wording, with a different marker.
On this page, treat the investment minimum, the programme launch date, the card's validity period and the
per-route thresholds as UNCONFIRMED. Write them as e.g. "from a qualifying investment amount we confirm on your
call" and "the card is issued for a term we confirm before you file". Design a small, reusable inline chip for
these two states — restrained, not a warning banner. Invent no numbers anywhere on the page.

DIRECTION A — "THE RECORD"
Document logic, not marketing logic. The case is made by structure.
  • Hairline rules instead of boxes and shadows. Corner radius 0–4px. No drop shadows.
  • Numbered sections: 01, 02, 03 in the margin or as a prefix to each H2.
  • Monospaced numerals and monospaced labels; small-caps or letter-spaced-uppercase eyebrows at ~12px.
  • Dense, left-aligned editorial grid — 12 columns, asymmetric, plenty of ruled horizontal divisions.
  • One accent colour only, reserved for the primary CTA and state markers. Buttons are rectangles, never pills.
  • Palette: pick something that reads like a private-bank statement rather than a crypto landing page. Deep
    ink, paper or near-black ground, one metal accent. You choose — push past the obvious gold-on-black.
  • Typography does the luxury: a high-contrast display serif or a precise grotesk, set large, tight leading.

PAGE STRUCTURE (in this order)
  1. Slim top bar: wordmark left, 4 nav items, "Find your route" as a rectangular accent button right.
  2. Hero — H1 and sub on a wide measure, no image, ruled off below. Two CTAs. Feels like a title page.
  3. STATUS STRIP (the signature block): a full-width ruled row of 4 facts under the hero — minimum
     investment, launch, card validity, timeline — each showing its hedged wording plus its state chip.
     This is the first thing an investor reads, and it is the thing no competitor does.
  4. 01 What the Investor Pass is — two columns of prose on a narrow measure, one ruled sidenote.
  5. 02 The four routes — a HAIRLINE TABLE, not cards: route / what qualifies / who it suits / threshold
     (hedged). Row hover shows the accent. This must read like a comparison an adviser would print.
  6. 03 How a case actually runs — a numbered horizontal process, 6 steps, thin connecting rule.
  7. 04 Who files this — the Asunción team stated plainly, no headshots, no invented names; a placeholder
     line describing the photograph that will go there later.
  8. 05 For migration agents — one short ruled panel with its own link. Agents are a real audience here.
  9. FAQ — 4 questions as ruled rows that expand. Include "Is the minimum investment fixed?" and answer it
     with the honesty rule above.
 10. Enquiry block — name, email, rough capital (select), timeline (select), message. State plainly that
     nothing is filed until the client has seen cost, timeline and exit options in writing.
 11. Footer — brand, nav columns, and a cross-link strip naming the sister brands as the same team.

OUTPUT CONTRACT
  • One file: investorpass-direction-a.html. Self-contained, opens by double-click, no build step, no
    framework, no CDN JS. A Google Fonts <link> is allowed; no other network requests.
  • The file's outer shell is a plain neutral backdrop (NOT part of the design) holding two labelled previews
    stacked vertically: "Desktop — 1440px" on top, "Mobile — 390px" below it.
  • Write the homepage markup and CSS ONCE, then render it into TWO <iframe> elements (srcdoc or written via
    script) so real CSS media queries fire independently in each frame. Desktop iframe: 1440px wide, full
    content height, scaled to fit the viewport with transform: scale() and transform-origin: top left. Mobile
    iframe: 390 × 844 inside a simple phone frame, scrolling internally through the whole page.
  • The mobile preview is a genuine mobile layout — reflowed, re-ordered where it helps, the hairline table
    becomes stacked ruled rows — not a squeezed desktop.
  • No images from the web. Image slots are CSS/SVG placeholders labelled with one line describing the
    photograph intended for that slot.
  • Real copy everywhere. No lorem ipsum, no fake logos, no invented testimonials, no flags, no passport or
    globe clip art, no decorative gradients.
  • Accessibility: body text ≥16px on mobile, contrast ≥4.5:1, visible focus states, real landmarks and
    heading order, tap targets ≥44px.
  • Under the mobile preview, add a short designer's note (plain text, outside the design): the palette and
    type choices with hex values and font names, and the one idea you want judged.
```

---

## Prompt 1B — paraguayinvestorpass.com · Direction B ("Open Country")

```
You are a senior product designer and front-end engineer. Design and build a homepage preview for
paraguayinvestorpass.com. Output is ONE self-contained HTML file — a desktop preview on top, a mobile preview
directly below it. This is a visual design exploration, not production code.

THE BRAND
Paraguay Investor Pass. The Investor Pass is a Paraguayan route to PERMANENT residency for people who bring
qualifying capital into the country — it removes the standard temporary-residency stage entirely. The company
is a small team in Asunción who file these cases themselves; six sister domains serve other audiences and the
footer admits that openly.
Audience: investors, family offices, and migration agents placing clients. High ticket, low volume, sceptical,
allergic to being sold to. Many arrive having read three articles that quote three different numbers.
The page must do exactly two things: make an investor believe these people actually file this, and get them to
either take the Route Finder (a 6-question quiz) or send an enquiry. There is no checkout on this brand.

COPY YOU MUST BUILD AROUND (use it near-verbatim; write the rest in the same voice)
H1: "Permanent residency in Paraguay, in one step."
Sub: "The Investor Pass lets qualifying investors skip temporary residency entirely. We structure the
investment, file the application and stay with you until the permanent card is in your hand."
The four qualifying routes: Real estate · Productive business · Financial instruments · Tourism.
Primary CTA "Find your route" (quiz). Secondary "Send an enquiry". A WhatsApp link is a tertiary, quiet option.
Voice: plain, specific, unhurried, second person, short sentences, states what takes time. Never "unlock",
"seamless", "world-class", "golden visa", "fast-track".

THE HONESTY RULE — THIS IS THE BRAND'S WHOLE DIFFERENTIATOR, DESIGN FOR IT
Public sources disagree about this programme's minimum investment (USD 70k, 150k and 200k all appear in print),
so the site never prints a threshold. Every figure renders in one of two states and the state is VISIBLE:
  • CONFIRMED — the figure is shown, with a small marker meaning "verified against the resolution text".
  • UNCONFIRMED — no number at all, only hedged wording, with a different marker.
On this page, treat the investment minimum, the programme launch date, the card's validity period and the
per-route thresholds as UNCONFIRMED. Write them as e.g. "from a qualifying investment amount we confirm on your
call". Design a small, reusable state chip for these two states — here it should feel like a considered
editorial device, not a warning. Invent no numbers anywhere on the page.

DIRECTION B — "OPEN COUNTRY"
Editorial logic, not document logic. The case is made by confidence and space.
  • Generous air. Oversized display type (H1 ~72–96px desktop), ~60ch measure, long vertical rhythm.
  • Full-bleed tonal panels that change the page's ground colour section to section.
  • Soft depth: large radii (20px+), one soft shadow layer, cards that overlap panel edges.
  • Pill CTAs, one strong image slot per screen (described placeholder — never a stock photo).
  • A quiet pull-quote somewhere in the middle of the page.
  • Palette: deliberately NOT the dark-and-gold cliché this category defaults to. Try warm ivory or bone as the
    ground, one deep ink, one restrained metal or earth accent — luxury by paper stock rather than by darkness.
    You choose, but justify it in the designer's note.
  • A sticky bottom action bar on mobile carrying the primary CTA.

PAGE STRUCTURE (in this order)
  1. Transparent top bar over the hero: wordmark left, 4 nav items, pill CTA right.
  2. Hero — full-bleed tonal panel, oversized H1, sub at ~60ch, two CTAs, and one large image slot
     (brief: Asunción skyline at dusk, or a desk with filed documents — your call, described in the slot).
  3. The signature block: THE FOUR ROUTES as four large overlapping cards on a tonal panel, each with a
     one-line "who this suits", a hedged threshold line and its state chip. This is the page's centrepiece and
     must be the thing a visitor remembers.
  4. "What the Investor Pass is" — a wide two-column editorial spread, one column prose, one column a short
     ruled list of what is and is not included. Hedged figures with state chips.
  5. Pull-quote — one sentence about why the numbers on this page are hedged, set large, own panel.
  6. "How a case actually runs" — 6 steps as a generous vertical or diagonal sequence with lots of air.
  7. "Who files this" — Asunción team, no invented names, one image slot described for a later photo.
  8. "For migration agents" — a calm full-width panel with its own CTA. Agents are a real audience here.
  9. FAQ — 4 questions, generous spacing. Include "Is the minimum investment fixed?".
 10. Enquiry block on its own tonal panel — name, email, rough capital, timeline, message; plus the line that
     nothing is filed until the client has seen cost, timeline and exit options in writing.
 11. Footer — brand, nav columns, and a cross-link strip naming the sister brands as the same team.

OUTPUT CONTRACT
  • One file: investorpass-direction-b.html. Self-contained, opens by double-click, no build step, no
    framework, no CDN JS. A Google Fonts <link> is allowed; no other network requests.
  • The file's outer shell is a plain neutral backdrop (NOT part of the design) holding two labelled previews
    stacked vertically: "Desktop — 1440px" on top, "Mobile — 390px" below it.
  • Write the homepage markup and CSS ONCE, then render it into TWO <iframe> elements (srcdoc or written via
    script) so real CSS media queries fire independently in each frame. Desktop iframe: 1440px wide, full
    content height, scaled to fit the viewport with transform: scale() and transform-origin: top left. Mobile
    iframe: 390 × 844 inside a simple phone frame, scrolling internally through the whole page.
  • The mobile preview is a genuine mobile layout — reflowed and re-ordered, with the sticky action bar — not a
    squeezed desktop.
  • No images from the web. Image slots are CSS/SVG placeholders labelled with one line describing the
    photograph intended for that slot.
  • Real copy everywhere. No lorem ipsum, no fake logos, no invented testimonials, no flags, no passport or
    globe clip art.
  • Accessibility: body text ≥16px on mobile, contrast ≥4.5:1, visible focus states, real landmarks and
    heading order, tap targets ≥44px.
  • Under the mobile preview, add a short designer's note (plain text, outside the design): the palette and
    type choices with hex values and font names, and the one idea you want judged.
```

---

## Prompt 2A — paraguayresidencyguide.com · Direction A ("The Record")

```
You are a senior product designer and front-end engineer. Design and build a homepage preview for
paraguayresidencyguide.com. Output is ONE self-contained HTML file — a desktop preview on top, a mobile
preview directly below it. This is a visual design exploration, not production code.

THE BRAND
Paraguay Residency Guide. This is the only brand in the group that SELLS SOMETHING DIRECTLY: a written guide
to getting residency in Paraguay, bought online, delivered immediately. Everything on the homepage exists to
sell it. It is written by the same small Asunción team who file these cases every week — that is the entire
reason to buy it rather than read a forum.
Audience: DIY-leaning people who are seriously considering Paraguay, have read three contradictory blog posts,
and want one source that says plainly what is confirmed and what is not. Low ticket, high volume, impulse-
adjacent but sceptical.
The page is a single long-form sales page. Its whole job is: buy the guide.

THE PRODUCT — BUILD THE PAGE AROUND THIS
Twelve chapters, in the order you actually need them:
  1 Why Paraguay (and why not) · 2 The routes compared · 3 Documents, apostilles, translations by nationality
  4 Costs, real ones · 5 Timeline week by week · 6 Cédula and RUC · 7 Banking · 8 Taxes for residents
  9 Family · 10 Investor Pass overview · 11 Mistakes we see monthly · 12 Checklists
Includes 12 months of updates. 14-day refund, no questions. Instant delivery after payment.
There is a second, higher tier called "Insider" that adds a member area — show it as a quiet secondary option
near the price, NOT as a three-column pricing table.
THE PRICE IS FETCHED AT RUNTIME. Wherever a price appears, render the literal string {{PRICE}}, styled exactly
as the real price will be. Do not invent a number.

COPY YOU MUST BUILD AROUND (use it near-verbatim; write the rest in the same voice)
The positioning line: "Most residency information online is a blog post written once, half right, and never
updated. This is the opposite: every step, document and cost we actually see, written down once by the team
that files these cases every week — and kept current, because a guide that goes stale is worse than no guide."
A real sample line from chapter 5, usable as the sample block: "Week 3: this is where most applications stall —
not because anything is wrong, but because a single stamped translation is sitting in a queue. Start this
document in week 1, not week 3, and the rest of the timeline holds."
Primary CTA "Get the guide". Secondary "See what's inside".
Voice: plain, specific, unhurried, second person, admits what takes time. Never "unlock", "seamless",
"ultimate", "everything you need to know", no countdown timers, no fake scarcity, no crossed-out prices.

THE HONESTY RULE — DESIGN FOR IT
This group's differentiator is showing which figures are confirmed and which are not. Any number on this page
(timelines, costs, thresholds) renders in one of two visible states: CONFIRMED (figure shown, small marker) or
UNCONFIRMED (no number, hedged wording, different marker). Design a small reusable inline chip for both.
Invent no numbers anywhere. This is also a selling point — say, in the page, that the guide marks its own
figures this way.

DIRECTION A — "THE RECORD"
Document logic, not marketing logic. The page should feel like the artefact it sells.
  • Hairline rules instead of boxes and shadows. Corner radius 0–4px. No drop shadows.
  • Numbered sections: 01, 02, 03 as a prefix or in the margin — which rhymes with the 12 numbered chapters.
  • Monospaced numerals and labels; letter-spaced uppercase eyebrows at ~12px.
  • Dense, left-aligned editorial grid, asymmetric, plenty of ruled horizontal divisions.
  • One accent colour only, for the buy CTA and the state chips. Rectangular buttons, never pills.
  • Palette: paper. Warm off-white ground, deep ink text, one accent — ink-and-letterpress, not "course
    landing page". A high-contrast display serif is welcome for headings.
  • The chapter list should be the most beautiful thing on the page: a ruled table of contents, 12 rows,
    numerals in the margin, exactly as a well-set book's contents page.

PAGE STRUCTURE (in this order)
  1. Slim top bar: wordmark left, 3 nav items, "Get the guide — {{PRICE}}" as a rectangular accent button.
  2. Hero — title-page composition: H1, sub, two CTAs, ruled off below. No image.
  3. The positioning paragraph, set as a wide ruled statement — this is the promise, give it room.
  4. 01 Who this is for — three ruled rows, one line each, no cards.
  5. 02 What's inside (THE SIGNATURE BLOCK) — the 12 chapters as a ruled table of contents, numerals in the
     margin, each row with a one-line description of what that chapter settles. Rows respond on hover.
  6. 03 A sample page — the chapter 5 quote above, set as a real book page would be, ruled off.
  7. 04 How this stays current — 12 months of updates, and the confirmed/unconfirmed marking explained with
     both chips shown inline. Make the honesty mechanism a feature, visibly.
  8. 05 What this is not — plainly: it is not us filing your case; the service side is a sister brand. Link it.
  9. Price block, anchored #price — {{PRICE}}, what is included, 14-day refund, instant delivery, and the
     quiet "Insider" upgrade line. Rectangular CTA. No scarcity theatre.
 10. FAQ — 4 ruled rows that expand: is this the same as hiring you · is it kept current · refund · do I still
     need a lawyer after reading it.
 11. A small email-capture row for people not ready to buy (one field, one button, plain promise).
 12. Footer — brand, nav columns, and a cross-link strip naming the sister brands as the same team.

OUTPUT CONTRACT
  • One file: guide-direction-a.html. Self-contained, opens by double-click, no build step, no framework, no
    CDN JS. A Google Fonts <link> is allowed; no other network requests.
  • The file's outer shell is a plain neutral backdrop (NOT part of the design) holding two labelled previews
    stacked vertically: "Desktop — 1440px" on top, "Mobile — 390px" below it.
  • Write the homepage markup and CSS ONCE, then render it into TWO <iframe> elements (srcdoc or written via
    script) so real CSS media queries fire independently in each frame. Desktop iframe: 1440px wide, full
    content height, scaled to fit the viewport with transform: scale() and transform-origin: top left. Mobile
    iframe: 390 × 844 inside a simple phone frame, scrolling internally through the whole page.
  • The mobile preview is a genuine mobile layout — the contents table becomes stacked ruled rows, the buy CTA
    stays reachable — not a squeezed desktop.
  • No images from the web. Image slots are CSS/SVG placeholders labelled with one line describing the
    photograph intended for that slot.
  • Real copy everywhere. No lorem ipsum, no fake logos, no invented testimonials or star ratings, no flags,
    no stacked-book mockups bought from a template.
  • Accessibility: body text ≥16px on mobile, contrast ≥4.5:1, visible focus states, real landmarks and
    heading order, tap targets ≥44px.
  • Under the mobile preview, add a short designer's note (plain text, outside the design): the palette and
    type choices with hex values and font names, and the one idea you want judged.
```

---

## Prompt 2B — paraguayresidencyguide.com · Direction B ("Open Country")

```
You are a senior product designer and front-end engineer. Design and build a homepage preview for
paraguayresidencyguide.com. Output is ONE self-contained HTML file — a desktop preview on top, a mobile
preview directly below it. This is a visual design exploration, not production code.

THE BRAND
Paraguay Residency Guide. This is the only brand in the group that SELLS SOMETHING DIRECTLY: a written guide
to getting residency in Paraguay, bought online, delivered immediately. Everything on the homepage exists to
sell it. It is written by the same small Asunción team who file these cases every week — that is the entire
reason to buy it rather than read a forum.
Audience: DIY-leaning people who are seriously considering Paraguay, have read three contradictory blog posts,
and want one source that says plainly what is confirmed and what is not. Low ticket, high volume, impulse-
adjacent but sceptical.
The page is a single long-form sales page. Its whole job is: buy the guide.

THE PRODUCT — BUILD THE PAGE AROUND THIS
Twelve chapters, in the order you actually need them:
  1 Why Paraguay (and why not) · 2 The routes compared · 3 Documents, apostilles, translations by nationality
  4 Costs, real ones · 5 Timeline week by week · 6 Cédula and RUC · 7 Banking · 8 Taxes for residents
  9 Family · 10 Investor Pass overview · 11 Mistakes we see monthly · 12 Checklists
Includes 12 months of updates. 14-day refund, no questions. Instant delivery after payment.
There is a second, higher tier called "Insider" that adds a member area — show it as a quiet secondary option
near the price, NOT as a three-column pricing table.
THE PRICE IS FETCHED AT RUNTIME. Wherever a price appears, render the literal string {{PRICE}}, styled exactly
as the real price will be. Do not invent a number.

COPY YOU MUST BUILD AROUND (use it near-verbatim; write the rest in the same voice)
The positioning line: "Most residency information online is a blog post written once, half right, and never
updated. This is the opposite: every step, document and cost we actually see, written down once by the team
that files these cases every week — and kept current, because a guide that goes stale is worse than no guide."
A real sample line from chapter 5: "Week 3: this is where most applications stall — not because anything is
wrong, but because a single stamped translation is sitting in a queue. Start this document in week 1, not week
3, and the rest of the timeline holds."
Primary CTA "Get the guide". Secondary "See what's inside".
Voice: plain, specific, unhurried, second person, admits what takes time. Never "unlock", "seamless",
"ultimate", "everything you need to know", no countdown timers, no fake scarcity, no crossed-out prices.

THE HONESTY RULE — DESIGN FOR IT
This group's differentiator is showing which figures are confirmed and which are not. Any number on this page
renders in one of two visible states: CONFIRMED (figure shown, small marker) or UNCONFIRMED (no number, hedged
wording, different marker). Design a small reusable chip for both — here as a considered editorial device.
Invent no numbers anywhere. Say in the page that the guide marks its own figures this way; it is a selling
point, not a disclaimer.

DIRECTION B — "OPEN COUNTRY"
Editorial logic. This should feel like a beautifully made magazine issue that happens to be for sale.
  • Generous air. Oversized display type (H1 ~72–96px desktop), ~60ch measure, long vertical rhythm.
  • Full-bleed tonal panels changing the ground colour section to section.
  • Soft depth: large radii (20px+), one soft shadow layer, cards that overlap panel edges.
  • Pill CTAs. A sticky bottom bar on mobile carrying "Get the guide — {{PRICE}}".
  • Palette: warm and inviting — sun-bleached paper, terracotta or ochre accent, one deep ink. Friendly but
    not childish. You choose; justify it in the designer's note.
  • One strong image slot per screen, described placeholders only.

PAGE STRUCTURE (in this order)
  1. Transparent top bar over the hero: wordmark left, 3 nav items, pill CTA "Get the guide — {{PRICE}}".
  2. Hero — full-bleed tonal panel, oversized H1, sub at ~60ch, two CTAs, and one large image slot
     (brief: the guide as an object on a desk, or a document table in Asunción — described, not stocked).
  3. The positioning paragraph on its own panel, set large. This is the promise; give it a whole screen.
  4. THE SIGNATURE BLOCK — "What's inside" as an editorial contents spread: the 12 chapters as generous cards
     or a two-column magazine contents, each with a one-line description of what that chapter settles. This is
     the page's centrepiece and must be the thing a visitor remembers.
  5. A sample page — the chapter 5 quote as a large pull-quote on its own panel, with a soft card mocking up
     how a page of the guide is actually set.
  6. Who this is for — three generous cards, one line each, lots of air.
  7. How this stays current — 12 months of updates, plus the confirmed/unconfirmed marking explained with both
     chips shown inline.
  8. What this is not — plainly: it is not us filing your case; the service side is a sister brand. Link it.
  9. Price block, anchored #price — a single generous card with {{PRICE}}, what is included, 14-day refund,
     instant delivery, and the quiet "Insider" upgrade line. Pill CTA. No scarcity theatre.
 10. FAQ — 4 questions with room to breathe: is this the same as hiring you · is it kept current · refund · do
     I still need a lawyer after reading it.
 11. A small email-capture block for people not ready to buy (one field, one button, plain promise).
 12. Footer — brand, nav columns, and a cross-link strip naming the sister brands as the same team.

OUTPUT CONTRACT
  • One file: guide-direction-b.html. Self-contained, opens by double-click, no build step, no framework, no
    CDN JS. A Google Fonts <link> is allowed; no other network requests.
  • The file's outer shell is a plain neutral backdrop (NOT part of the design) holding two labelled previews
    stacked vertically: "Desktop — 1440px" on top, "Mobile — 390px" below it.
  • Write the homepage markup and CSS ONCE, then render it into TWO <iframe> elements (srcdoc or written via
    script) so real CSS media queries fire independently in each frame. Desktop iframe: 1440px wide, full
    content height, scaled to fit the viewport with transform: scale() and transform-origin: top left. Mobile
    iframe: 390 × 844 inside a simple phone frame, scrolling internally through the whole page.
  • The mobile preview is a genuine mobile layout — reflowed and re-ordered, with the sticky buy bar — not a
    squeezed desktop.
  • No images from the web. Image slots are CSS/SVG placeholders labelled with one line describing the
    photograph intended for that slot.
  • Real copy everywhere. No lorem ipsum, no fake logos, no invented testimonials or star ratings, no flags,
    no template ebook mockups.
  • Accessibility: body text ≥16px on mobile, contrast ≥4.5:1, visible focus states, real landmarks and
    heading order, tap targets ≥44px.
  • Under the mobile preview, add a short designer's note (plain text, outside the design): the palette and
    type choices with hex values and font names, and the one idea you want judged.
```

---

## Prompt 3A — paraguayfrontier.com · Direction A ("The Record")

```
You are a senior product designer and front-end engineer. Design and build a homepage preview for
paraguayfrontier.com. Output is ONE self-contained HTML file — a desktop preview on top, a mobile preview
directly below it. This is a visual design exploration, not production code.

THE BRAND
Paraguay Frontier. A done-for-you residency service, filed by a small team in Asunción — but framed entirely
around OPTIONALITY rather than emigration. The reader is buying a second residency and a tax ID they can hold
in reserve. Most clients never move; that is fine and the site says so.
Audience: Americans and expats weighing a plan B. Politically fatigued, well-read, allergic to hype, and
immunised against "golden visa" content. They have read the posts; they want to know the catch.
The page's job: get them to take the Route Finder (a 6-question quiz) or start a conversation. No checkout.

COPY YOU MUST BUILD AROUND (use it near-verbatim; write the rest in the same voice)
H1: "A second residency you can actually get."
Sub: "Paraguay grants permanent residency without a million-dollar investment, a points test or a decade of
waiting. We handle the paperwork in Asunción. You decide how much of your life to move here."
The three routes: Temporary residency (the standard first step) · Permanent residency (the long-term card,
presence rules apply) · Investor Pass (straight to permanent, with qualifying capital — a sister brand).
The brand's single best asset, which belongs high on the page, not buried in an FAQ: "Paraguay is a real
country with real bureaucracy, not a loophole. Documents take longer than a blog post suggests, some offices
move slowly, and the presence rules matter more than people admit online. We tell you this upfront because a
client who knows what to expect is easier to serve well than one who was sold a fantasy."
Primary CTA "Find your route". Secondary "Talk to us". WhatsApp as a quiet tertiary option.
Voice: plain, sceptical, unhurried, second person. NEVER say "tax-free", never promise a "golden visa", never
"unlock", "seamless", "escape", "sovereign". Territorial tax is explained as what it does and does not cover,
with "confirm your own case with an accountant" stated on the page.

THE HONESTY RULE — THIS IS THE ENTIRE BRAND, SO MAKE IT THE DESIGN
Every figure on the site renders in one of two visible states: CONFIRMED (figure shown, small marker meaning
verified) or UNCONFIRMED (no number at all, hedged wording, different marker). Treat the presence rules, the
territorial tax rate, the timeline and all costs as UNCONFIRMED on this page — hedged wording only. Design a
small reusable inline chip for the two states. Invent no numbers. On this brand the chip is not a caveat, it
is the product: "we state the catch" is the positioning.

DIRECTION A — "THE RECORD"
Document logic. Think field manual or dossier — sober, technical, trustworthy, not military cosplay.
  • Hairline rules instead of boxes and shadows. Corner radius 0–4px. No drop shadows.
  • Numbered sections: 01, 02, 03 as a prefix or in the margin.
  • Monospaced numerals and labels; letter-spaced uppercase eyebrows at ~12px.
  • Dense, left-aligned grid, asymmetric, plenty of ruled divisions.
  • One accent only, for the primary CTA and state chips. Rectangular buttons, never pills.
  • Palette: cool, sober, slightly institutional — stone, slate, a single muted green or blue. It must look
    like it was made by people who are not trying to excite you. A precise grotesk throughout.

PAGE STRUCTURE (in this order)
  1. Slim top bar: wordmark left, 4 nav items, "Find your route" as a rectangular accent button right.
  2. Hero — H1, sub, two CTAs, ruled off below. No image.
  3. THE SIGNATURE BLOCK, directly under the hero: "What the catch is." The bureaucracy paragraph above, set
     as a plain ruled statement, with three short ruled sub-points: presence rules, document timelines, what
     territorial tax does not cover — each with its UNCONFIRMED chip and hedged wording. Putting the catch
     above the sales pitch is the whole brand; the layout must make that legible at a glance.
  4. 01 Three routes, compared — a HAIRLINE TABLE, not cards: route / what it gives you / what it asks of you
     / presence (hedged). Row hover shows the accent.
  5. 02 Territorial tax without the hype — two columns of prose on a narrow measure, one ruled sidenote
     stating plainly that this is not "tax-free" and that the reader's own country's rules are their
     accountant's question.
  6. 03 What a case actually looks like — a numbered horizontal process, 6 steps, thin connecting rule,
     including the step where the client has to appear in Asunción in person.
  7. 04 Who files this — the Asunción team stated plainly, no invented names, a placeholder line describing
     the photograph that will go there later.
  8. 05 How this differs from our other sites — one short ruled panel admitting the sister brands and who each
     one is for. Do not hide the network; owning it is more credible than pretending.
  9. FAQ — 4 ruled rows that expand: do I have to move · is Paraguay really tax-free · what is the catch ·
     how is this different from the hub site.
 10. Contact block — name, email, country, what you are weighing (select), message; plus the WhatsApp option.
 11. Footer — brand, nav columns, and a cross-link strip naming the sister brands as the same team.

OUTPUT CONTRACT
  • One file: frontier-direction-a.html. Self-contained, opens by double-click, no build step, no framework,
    no CDN JS. A Google Fonts <link> is allowed; no other network requests.
  • The file's outer shell is a plain neutral backdrop (NOT part of the design) holding two labelled previews
    stacked vertically: "Desktop — 1440px" on top, "Mobile — 390px" below it.
  • Write the homepage markup and CSS ONCE, then render it into TWO <iframe> elements (srcdoc or written via
    script) so real CSS media queries fire independently in each frame. Desktop iframe: 1440px wide, full
    content height, scaled to fit the viewport with transform: scale() and transform-origin: top left. Mobile
    iframe: 390 × 844 inside a simple phone frame, scrolling internally through the whole page.
  • The mobile preview is a genuine mobile layout — the comparison table becomes stacked ruled rows — not a
    squeezed desktop.
  • No images from the web. Image slots are CSS/SVG placeholders labelled with one line describing the
    photograph intended for that slot.
  • Real copy everywhere. No lorem ipsum, no fake logos, no invented testimonials, no flags, no passport or
    globe clip art, no maps with pins.
  • Accessibility: body text ≥16px on mobile, contrast ≥4.5:1, visible focus states, real landmarks and
    heading order, tap targets ≥44px.
  • Under the mobile preview, add a short designer's note (plain text, outside the design): the palette and
    type choices with hex values and font names, and the one idea you want judged.
```

---

## Prompt 3B — paraguayfrontier.com · Direction B ("Open Country")

```
You are a senior product designer and front-end engineer. Design and build a homepage preview for
paraguayfrontier.com. Output is ONE self-contained HTML file — a desktop preview on top, a mobile preview
directly below it. This is a visual design exploration, not production code.

THE BRAND
Paraguay Frontier. A done-for-you residency service, filed by a small team in Asunción — but framed entirely
around OPTIONALITY rather than emigration. The reader is buying a second residency and a tax ID they can hold
in reserve. Most clients never move; that is fine and the site says so.
Audience: Americans and expats weighing a plan B. Politically fatigued, well-read, allergic to hype, and
immunised against "golden visa" content. They have read the posts; they want to know the catch.
The page's job: get them to take the Route Finder (a 6-question quiz) or start a conversation. No checkout.

COPY YOU MUST BUILD AROUND (use it near-verbatim; write the rest in the same voice)
H1: "A second residency you can actually get."
Sub: "Paraguay grants permanent residency without a million-dollar investment, a points test or a decade of
waiting. We handle the paperwork in Asunción. You decide how much of your life to move here."
The three routes: Temporary residency (the standard first step) · Permanent residency (the long-term card,
presence rules apply) · Investor Pass (straight to permanent, with qualifying capital — a sister brand).
The brand's single best asset, which belongs high on the page, not buried in an FAQ: "Paraguay is a real
country with real bureaucracy, not a loophole. Documents take longer than a blog post suggests, some offices
move slowly, and the presence rules matter more than people admit online. We tell you this upfront because a
client who knows what to expect is easier to serve well than one who was sold a fantasy."
Primary CTA "Find your route". Secondary "Talk to us". WhatsApp as a quiet tertiary option.
Voice: plain, sceptical, unhurried, second person. NEVER say "tax-free", never promise a "golden visa", never
"unlock", "seamless", "escape", "sovereign". Territorial tax is explained as what it does and does not cover,
with "confirm your own case with an accountant" stated on the page.

THE HONESTY RULE — THIS IS THE ENTIRE BRAND, SO MAKE IT THE DESIGN
Every figure renders in one of two visible states: CONFIRMED (figure shown, small marker meaning verified) or
UNCONFIRMED (no number at all, hedged wording, different marker). Treat the presence rules, the territorial
tax rate, the timeline and all costs as UNCONFIRMED here. Design a small reusable chip for the two states, as
a considered editorial device. Invent no numbers. "We state the catch" is the positioning, not a disclaimer.

DIRECTION B — "OPEN COUNTRY"
Editorial logic. Calm, wide, landscape-minded — the visual argument is "there is room here, and time to think".
  • Generous air. Oversized display type (H1 ~72–96px desktop), ~60ch measure, long vertical rhythm.
  • Full-bleed tonal panels changing the ground colour section to section.
  • Soft depth: large radii (20px+), one soft shadow layer, cards overlapping panel edges.
  • Pill CTAs. A sticky bottom action bar on mobile carrying "Find your route".
  • One strong image slot per screen, described placeholders only.
  • Palette: cool and open — sky, stone, a muted green horizon, one warm accent used sparingly. Calm, adult,
    never apocalyptic and never tropical-holiday. You choose; justify it in the designer's note.

PAGE STRUCTURE (in this order)
  1. Transparent top bar over the hero: wordmark left, 4 nav items, pill CTA right.
  2. Hero — full-bleed tonal panel, oversized H1, sub at ~60ch, two CTAs, one wide image slot
     (brief: an open Paraguayan landscape or an ordinary Asunción street at mid-morning — described, not
     stocked; explicitly NOT a beach and NOT a skyline-of-wealth cliché).
  3. THE SIGNATURE BLOCK, immediately after the hero: "What the catch is." The bureaucracy paragraph set
     large on its own panel, with three generous cards beneath — presence rules, document timelines, what
     territorial tax does not cover — each carrying its UNCONFIRMED chip and hedged wording. An honest page
     that leads with the catch is the memorable idea; make it the most designed moment on the page.
  4. Three routes — three large cards on a tonal panel: what it gives you, what it asks of you, presence
     (hedged). One is a sister brand and says so.
  5. Territorial tax without the hype — wide two-column editorial spread, one column prose, one column a
     short list of what it does and does not cover, plus the accountant line.
  6. Pull-quote — one sentence on why this site refuses to say "tax-free", set large, own panel.
  7. What a case actually looks like — 6 steps as a generous vertical sequence with lots of air, including
     the step where the client must appear in Asunción in person.
  8. Who files this — Asunción team, no invented names, one described image slot for a later photo.
  9. How this differs from our other sites — a calm full-width panel naming the sister brands and who each
     one is for. Owning the network is more credible than hiding it.
 10. FAQ — 4 questions with room to breathe: do I have to move · is Paraguay really tax-free · what is the
     catch · how is this different from the hub site.
 11. Contact block on its own tonal panel — name, email, country, what you are weighing, message; plus the
     WhatsApp option.
 12. Footer — brand, nav columns, and a cross-link strip naming the sister brands as the same team.

OUTPUT CONTRACT
  • One file: frontier-direction-b.html. Self-contained, opens by double-click, no build step, no framework,
    no CDN JS. A Google Fonts <link> is allowed; no other network requests.
  • The file's outer shell is a plain neutral backdrop (NOT part of the design) holding two labelled previews
    stacked vertically: "Desktop — 1440px" on top, "Mobile — 390px" below it.
  • Write the homepage markup and CSS ONCE, then render it into TWO <iframe> elements (srcdoc or written via
    script) so real CSS media queries fire independently in each frame. Desktop iframe: 1440px wide, full
    content height, scaled to fit the viewport with transform: scale() and transform-origin: top left. Mobile
    iframe: 390 × 844 inside a simple phone frame, scrolling internally through the whole page.
  • The mobile preview is a genuine mobile layout — reflowed and re-ordered, with the sticky action bar — not
    a squeezed desktop.
  • No images from the web. Image slots are CSS/SVG placeholders labelled with one line describing the
    photograph intended for that slot.
  • Real copy everywhere. No lorem ipsum, no fake logos, no invented testimonials, no flags, no passport or
    globe clip art, no maps with pins.
  • Accessibility: body text ≥16px on mobile, contrast ≥4.5:1, visible focus states, real landmarks and
    heading order, tap targets ≥44px.
  • Under the mobile preview, add a short designer's note (plain text, outside the design): the palette and
    type choices with hex values and font names, and the one idea you want judged.
```

---

## Reviewing the six

Open all six HTML files in a browser, at the real widths, in this order: 1A 2A 3A, then 1B 2B 3B.

1. **Do the three A's look like siblings? Do the three B's?** If a direction only holds together because the
   three files share a colour, the direction is not real yet — the family has to survive different palettes.
2. **Would you know which brand you were on with the logo covered?** Investor Pass should feel like money and
   discretion, the Guide like an object worth paying for, Frontier like someone telling you the truth.
3. **Does the evidence chip carry?** It is the one idea nobody in this market has. If it reads as a disclaimer
   in any of the six, that design got it wrong.
4. **Mobile first, honestly.** Scroll the 390px frame before the desktop one — that is where most of this
   traffic is. A direction that only sings at 1440 loses.
5. Then pick **one direction** as the house system, and take the best **brand treatment** of the other
   direction as the exception if one genuinely earns it.

What the winner turns into, in this repo: palette + fonts + radius → `src/styles/themes/<key>.css`; shared
rhythm changes → `src/styles/tokens.css`; the hero and the signature block → one new component variant each in
`src/components/`. No schema change, no routing change, no second app (plan §1.1, §1.8).
