# Design prompts — 2026-09-30

Prompts for Claude Design (and one for the offer session). Paste the **shared brief** above each brand
prompt. Nothing here changes code; it is input for design sessions.

---

## Shared brief (paste above every brand prompt)

```
CONTEXT
You are designing one brand in a family of seven Paraguay-residency websites. They all run on ONE
Next.js app; each brand has its own colour tokens, its own page layouts, and exactly ONE self-hosted
display font (one static weight, ~20 KB). Body text uses the system font stack. Any monospace uses
system ui-monospace, never a second web font.

SISTER BRANDS YOU MUST LOOK DIFFERENT FROM
- Paraguay Residency Guide (paraguayresidencyguide.com): cream + deep green, book/field-guide feel, Newsreader serif.
- Paraguay Investor Pass (paraguayinvestorpass.com): white + teal, "decision memo" feel, grotesk + mono labels.

HARD RULES
1. Never invent a legal or financial number (fees, thresholds, tax rates, timelines, prices, flight
   times). Show every one as a dashed placeholder chip, e.g. [FACT: fee.temporary] or [PRICE]. They
   are filled later from a verified, dated facts file.
2. No invented testimonials, client counts, star ratings, press logos or awards. Proof slots are
   dashed boxes labelled "HIDDEN UNTIL REAL".
3. We are a residency team in Asunción, not a law firm. Never say lawyer/abogado/advogado/law firm.
   Approval is decided by the authority; never promise approval or tax savings.
4. Leads: WhatsApp + a short form (name, email, WhatsApp, situation). Promise: written reply within
   one working day.
5. Performance budget (mobile Lighthouse >= 0.90): one optional hero image, no autoplay video
   (poster + click-to-load only), no carousels, no scroll-jacking, CSS-only motion that respects
   prefers-reduced-motion.
6. Accessibility: WCAG AA contrast, touch targets >= 44 px, visible focus, sticky mobile CTA bar.
7. Write the copy natively in the target language and culture. It must not read as a translation.

DELIVERABLE
In one canvas: homepage desktop (1440) + homepage mobile (390) + one inner page (services/pricing)
desktop + mobile. Show the design tokens (colours, type scale, spacing, radius) as a small spec
board at the end. Name the ONE signature interaction and annotate how it works.
```

---

## 1. paraguayresidency.co.uk — "Paraguay Residency" (the hub, done-for-you service, British English)

```
BRAND: Paraguay Residency — paraguayresidency.co.uk — the hub of the family. It sells the
done-for-you residency service and routes everyone else to the right sister site.

AUDIENCE
Mostly UK residents, 35–70, plus English speakers from the US, Ireland, Australia who arrive from
Google:
- retirees who want their pension to go further,
- founders and remote workers who want a second residency / Plan B,
- families thinking a few years ahead.
Their fear is not "how", it is "who can I trust in a country I have never been to, with my passport
and my money". Every section must answer that fear.

POSITIONING
"We do your Paraguay residency for you. Fixed scope, in writing, one named case manager, from first
message to cédula." British understatement. Calm, competent, no hype, no exclamation marks.
British spelling (organise, colour, programme). GBP shown next to USD.

SIGNATURE INTERACTION — "Your file, stage by stage"
A case-file tracker that is the spine of the homepage. 8 stages: first message → documents at home
(apostilles, translations) → arrival → filing at Migraciones → biometrics → temporary residency →
cédula → RUC and bank. Desktop: a horizontal row of file tabs; mobile: a vertical stepper. Each stage
opens to three short columns: "What we do" / "What you do" / "Where you need to be", plus a
[FACT: duration] chip. It should feel like opening a real, well-kept client folder: paper tabs,
stamps, a handwritten-feel annotation or two.

SECONDARY: "Which one sounds like you?"
Four situation cards that route people honestly: "Do it for me" → service on this site; "I'm
investing" → Paraguay Investor Pass; "I'll do it myself" → Paraguay Residency Guide; "Not in
English" → Español / Português / Svenska sister sites. Routing people away builds trust.

HOMEPAGE SECTIONS
Header · hero (promise + two CTAs: "Start with a written assessment", "WhatsApp us") · who we are
(named team photos, office street in Asunción, placeholders) · Your file, stage by stage ·
packages (Temporary residency, Permanent residency, Family add-on, Cédula & RUC — each "From [PRICE]",
included / not included) · "What you get in writing before you pay" · how payment works (staged,
[TO CONFIRM]) · what happens if something goes wrong ([TO CONFIRM]) · Which one sounds like you? ·
proof slot HIDDEN UNTIL REAL · FAQ (health cover, leaving UK tax residency — general, not advice,
pets, driving licence, getting there) · final CTA · footer with sister brands.

VISUAL DIRECTION
Private-bank authority meets a well-kept case file. Keep the hub's ink navy + warm paper + one brass
accent, but choose a display face that is NOT Newsreader (the Guide uses it) — e.g. a sharp
high-contrast serif or a refined grotesk. Imagery: real-looking Asunción office and paperwork, no
stock beaches, no flags.

AVOID
Anything that looks like a visa mill: countdown timers, "guaranteed", fake urgency, stacks of flags.
```

---

## 2. vidanoparaguai.com — "Vida no Paraguai" (Brazilian Portuguese)

```
BRAND: Vida no Paraguai — vidanoparaguai.com — written in Brazilian Portuguese for Brazilians.

AUDIENCE
- empresários: small and mid-size business owners, e-commerce, agro, profissionais liberais,
  tired of the carga tributária and burocracia,
- families from Paraná, Mato Grosso do Sul, Santa Catarina, Rio Grande do Sul who already know the
  border (Foz ↔ Ciudad del Este, Ponta Porã ↔ Pedro Juan Caballero),
- aposentados and remote workers looking for cost of living and segurança.
Many already heard "Paraguai é o novo destino" on YouTube/Instagram and are half-convinced; they
need a trustworthy, Portuguese-speaking team and a clear path, not more hype.

TONE
Caloroso, direto, "você", like a friend who already made the move. WhatsApp is the PRIMARY CTA
(Brazilians decide on WhatsApp); the form is secondary. Prices in R$ first, then USD.
All tax/energy/company-opening numbers are [FACT] chips with a date. Never "paraíso fiscal",
never promise savings.

SIGNATURE INTERACTION — "Seu plano de mudança em 3 perguntas"
Three tap-only questions (Qual é o seu perfil? empresário / trabalho remoto / aposentado / família ·
Onde você mora hoje? estado · Quando quer se mudar? 3 meses / 6 meses / 1 ano+). The page then
rebuilds a personal 3-step roadmap in place (documents from Brazil, residência no Paraguai, what
comes next for your profile), with a "Receber meu plano no WhatsApp" button that pre-fills the
message. No numbers invented; durations and costs are [FACT] chips.

SECONDARY: "Brasil × Paraguai, lado a lado"
A clean comparison table (abrir empresa, impostos, energia, custo de vida, tempo até a residência),
every value a dated [FACT] chip, with a source line. And an illustrated SVG map "Onde os
brasileiros moram": Asunción, Ciudad del Este, Encarnación, Pedro Juan Caballero — one-line profile
each.

HOMEPAGE SECTIONS
Hero (promise + WhatsApp CTA + "Atendimento em português" badge) · Seu plano de mudança ·
Brasil × Paraguai · for empresários (company + residency together) · for families · map ·
the team (Portuguese-speaking member, photo placeholders, short video slot with poster) ·
how it works + pricing "a partir de [PRICE]" · proof slot HIDDEN UNTIL REAL · FAQ (can I keep my
Brazilian company? CPF? bank accounts? school for the kids? health?) · WhatsApp CTA · footer.

VISUAL DIRECTION
Warm, sunny, modern and a little bold — think a good Brazilian fintech or lifestyle brand, not a
government site. Motif: the lapacho (ipê) — Paraguay's flowering tree that Brazilians know as ipê —
pink/violet blossom against terracotta red earth and a deep evergreen. Absolutely no green-and-yellow
flag palette. One display font with personality (a friendly grotesk or rounded serif).

AVOID
Influencer-style hype, "fique rico", tax-haven language, stock beach photos, flags.
```

---

## 3. residenciaenparaguay.es — "Residencia en Paraguay" (Spanish from Spain)

```
BRAND: Residencia en Paraguay — residenciaenparaguay.es — written in castellano de España for
Spaniards.

AUDIENCE
- autónomos and small online businesses squeezed by the cuota and taxes,
- professionals 30–50 who want a Plan B or a second base in Latin America,
- jubilados looking for a cheaper, calmer life in their own language,
- people with a Paraguayan partner or family ties.
The big emotional advantage: no language barrier. "Mudarte a Paraguay, en tu idioma."

TONE
Castellano peninsular, tú, frank, a touch of dry humour, like a friend who already did the
papeleo. Spain vocabulary (móvil, piso, gestoría, empadronamiento, apostilla de La Haya). Prices in
EUR first. WhatsApp + form. All numbers are [FACT] chips.

SIGNATURE INTERACTION — "Tu papeleo, de Madrid a Asunción"
An interactive checklist drawn as a flight route: the left side is "En España" (documents to
request, apostille, translations if any — all placeholders), the right side is "En Paraguay"
(filing, biometrics, cédula, RUC). A small plane/dotted line advances as the user ticks items
(ticks remembered in the browser). At the end: "¿Lo hacemos por ti?" → WhatsApp / form, and a
secondary "Prefiero hacerlo yo" → the Guide.

SECONDARY: "Un mes en Asunción vs. un mes en tu ciudad"
Pick Madrid / Barcelona / Valencia / Sevilla / otra; a side-by-side of rent, food, transport,
electricity — every value a dated [FACT] chip with source.

HOMEPAGE SECTIONS
Hero · "En tu idioma" (why Spaniards specifically: language, culture, time zone vs Spain as
[FACT]) · Tu papeleo, de Madrid a Asunción · para autónomos · para jubilados · un mes en
Asunción vs tu ciudad · el equipo (photo placeholders) · servicios y precios "desde [PRICE]" ·
proof slot HIDDEN UNTIL REAL · preguntas (¿pierdo la Seguridad Social? ¿qué pasa con Hacienda? —
general, no asesoramiento · ¿puedo ir con mi familia? · vuelos) · CTA · footer.

VISUAL DIRECTION
A Spanish editorial magazine rather than a consultancy: bold condensed display type, generous
whitespace, strong photography slots. Palette from Paraguay seen through Spanish eyes: cal (lime
white), tierra roja (Paraguay's red earth), verde yerba (tereré/yerba mate), one ink colour. Small
ñandutí lace pattern (Paraguayan lace) as a subtle ornament. No red-and-yellow Spain flag palette.

AVOID
Latin American vocabulary as default, "usted" corporate stiffness, promising tax outcomes.
```

---

## 4. Offer session (Fable 5.1 or Opus 5.5, tomorrow) — "Grand Slam Offer" for paraguayresidencyguide.com

```
You are my offer strategist. Use Alex Hormozi's "$100M Offers" framework rigorously: the value
equation (dream outcome × perceived likelihood ÷ time delay × effort & sacrifice), listing every
problem the buyer has at every step and turning each into a solution, choosing delivery vehicles
(DIY / done-with-you / done-for-you; 1:1 / group / software), trimming and stacking, bonuses,
guarantees, honest scarcity and urgency, and naming (MAGIC).

THE BUSINESS
A small residency team in Asunción, Paraguay, running seven brand sites on one platform:
- paraguayresidencyguide.com: today sells a 12-chapter residency guide (PDF + member area +
  checklists + 12 months of updates) for a low one-time price, plus an "Insider" monthly
  membership (updates + deep-dive chapters). 14-day refund. This is the only brand that sells
  digital products (Stripe one-time, Lemon Squeezy subscriptions).
- paraguayresidency.co.uk: done-for-you residency service (the hub).
- paraguayinvestorpass.com: service for investors using Paraguay's 2026 Investor Pass (direct
  permanent residency).
- Spanish, Brazilian-Portuguese and Swedish sites for those markets.
The guide is currently the cheap front door. I think "a 12-step PDF" undersells what we know.

WHAT I WANT
1. First, interview me: ask up to 10 sharp questions (my real capacity, what clients struggle with,
   what we can actually deliver, refund history, prices of the service) before proposing anything.
2. Then map the buyer's full journey from "is Paraguay right for me?" to "cédula in hand, bank
   account open, settled" and list every problem/obstacle at each step.
3. Propose 3 offer ladders, each with: the core offer, the value stack (item → problem it kills →
   perceived value → our real cost/time), bonuses, a guarantee we can honour, price anchors, and
   a name. At least one ladder should include a "done-with-you" middle tier (e.g. document review,
   live group calls, a WhatsApp channel, a personalised document checklist by nationality).
4. Show how the guide ascends into the service on paraguayresidency.co.uk and the Investor Pass,
   so the cheap offer is a profitable customer-acquisition step, not the product.
5. Tell me which ladder you would launch first and a 30-day test plan (what to measure, which
   price points to test).

CONSTRAINTS (non-negotiable)
- We cannot guarantee residency approval — the authority decides. Guarantees may only cover what
  we control (response times, document review accuracy, refunds, redoing work).
- No legal or tax advice promises; we are not a law firm.
- No fake scarcity, fake testimonials or invented numbers. Where you need a number I have not
  given you, ask or mark it [TO CONFIRM].
- Delivery must be realistic for a small team; prefer things that scale (software, group, templates)
  over unlimited 1:1.
Output the final result as a structured document I can hand to a designer and a developer.
```
