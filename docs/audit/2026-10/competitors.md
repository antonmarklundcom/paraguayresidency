# Competitor benchmark — Paraguay residency, all markets (2026-10)

Research date: 2026-09-28. Researcher: Opus 5.5 subagent (read-only; no forms, sign-ups or contact with any competitor).
Screenshots: `docs/audit/2026-10/competitors/<name>-<page>-<width>.jpg`, each 1440×2700 or 390×2532 (the first three viewports of the page).

**Method and limits.** Google, Bing and DuckDuckGo SERPs are CAPTCHA-walled for automated access, so the
competitor set comes from WebSearch (US index), Google autocomplete (per locale), competitor sitemaps and
their own nav. Every price below was read on the competitor's public page on 2026-09-28. Palettes and fonts
are computed styles pulled with Playwright; mobile CTA data comes from a DOM probe at iPhone 13 size. The
Ahrefs and Similarweb connectors are not authorized, so there is no traffic data. Anything marked *(snippet)*
was only seen in a search snippet.

---

## 0. Before the benchmark: our own sites are mostly offline

These findings outrank everything below. The live check was run on 2026-09-28 against 8.8.8.8 and 1.1.1.1:

| Domain | State | Evidence |
|---|---|---|
| `paraguayresidency.co.uk` (hub) | **Does not resolve** (SERVFAIL) | The Hostinger nameservers (`*.dns-parking.com`) answer "Query refused": no zone exists for the domain |
| `paraguayinvestorpass.com` | **Does not resolve** (SERVFAIL) | Same: registered 2026-04-17 and delegated to dns-parking, but no zone behind it |
| `vidanoparaguai.com` (PT) | **NXDOMAIN** | Registered at Tucows/DreamHost with NS1/NS2.dns-parking.com, and no zone behind it |
| `flyttatillparaguay.se` (SV) | **NXDOMAIN** | Nothing resolves |
| `residenciaenparaguay.es` | Up, but **the homepage renders unstyled** | Hostinger CDN (`server: hcdn`) serves homepage HTML that is 3.6 days old (`age: 310801`, `s-maxage=31536000`). It references `/_next/static/chunks/33ay9itvxsnxy.css`, which now returns **404**. Other ES pages are fine. See `competitors/us-residenciaes-home-390.jpg` |
| `paraguayfrontier.com`, `paraguayresidencyguide.com` | Up, styled | — |

Also, on every live brand:
- **There are zero `wa.me` links**, because `NEXT_PUBLIC_WHATSAPP_NUMBER` is empty (`src/lib/whatsapp.ts`). The only WhatsApp option is "leave your number" in a form. No brand has a floating or sticky mobile CTA.
- The live ES, frontier and guide footers link to the hub and Investor Pass domains, which are dead, so those links are broken for users and crawlers.

Fixes: add the DNS zones in hPanel for the 4 domains, purge the Hostinger CDN after every deploy (and stop
caching HTML for a year), and set the WhatsApp number, then rebuild (it is a build-time variable).

---

## 1. Who we're up against

| # | Competitor | Market(s) | What it is | Why it is in the set |
|---|---|---|---|---|
| 1 | **movetoparaguay.com** | EN, ES, PT-BR, RU | Info site (~170 posts per language, 732 URLs). **Changed model:** now funded by ads behind a cookie wall, sells a USD 150 orientation call and refers filings to partners (Grupo Gaia, Agescon) | Ranked #1 on 3 of 5 test queries in Sept (`docs/seo-competitor-analysis-movetoparaguay.md`). Its ES and BR sections are translations with English slugs |
| 2 | **paraguaysovereign.com** | EN | Premium agency. Packages at $2,290/$3,390/$5,490, ~404 URLs in topic clusters (banking/, business/, citizenship/, living/) | Strongest English commercial page |
| 3 | **paraguaysimply.com** | EN (+CS) | Boutique agency run by a named founder (Jakub). Fixed-price "routes", Trustpilot | Clearest fixed-price proposition in English |
| 4 | **paraguaypathways.com** | EN, ES, PT-BR, IT, FR, RU, EL | Agency. Prices in PYG, WTC address, "1,000+ individuals from 40+ countries" | Multilingual, covers ES and PT |
| 5 | **residenciaparaguay.com** | ES | WordPress gestoría ("#1 en trámites migratorios"). "+10 años, +500 clientes, 35 % más baratos", nationality pages | Owns the exact-match ES domain. Ranks for "residencia paraguay" |
| 6 | **gestoriaenparaguay.com.py** (Sosa Group) | ES, EN, PT | 30-year gestoría led by Gloria Sosa. WTC office, 30+ photo testimonials, Google reviews widget | Best proof in the whole niche |
| 7 | **paraguailivre.com** | PT (BR+PT) | Solo founder (Yannick Schroth, a German in Asunción). From $600, refund guarantee, ~100 PT articles, quiz, price calculator, 12-page PDF | **The Brazil leader to beat**: content, price and guarantee in one |
| 8 | **residenciaparaguai.com.br** | PT | Single-page funnel: "Residência legal no Paraguai por US$ 999", WhatsApp reply "em até 2 horas" | Owns the exact-match .com.br. Clearest Brazil offer |
| 9 | **settee.io** | PT (+EN) | Brazilian "plan B" company (Settee International LLC, Florida). Residency, offshore, podcast, magazine, Telegram community | Big PT brand. "residencia paraguai settee" shows up in autocomplete |
| 10 | **moveparaguay.com** | **SV** + 32 other languages | Programmatic guide and services site, ~139 pages × 33 languages. The Swedish text is machine-translated | The only commercial Swedish-language competitor for "flytta till paraguay" |
| + | invertirenasuncion.com | ES | Closed price of USD 1,950, a registered accountant (CO-1985), reply "en 24 h", tax-savings calculator | ES price reference |
| + | planbparaguay.com | EN | GoHighLevel funnel. "Residency in 90 days". Community (dinners, padel, WhatsApp group) | Autocomplete: "plan b paraguay reviews/cost" |

Also seen but not profiled: paraguayresidency.com ("Paraguay Residency S.A.", **SSL certificate expired**,
and autocomplete shows "paraguay residency sa asunción reviews"; this brand collides with our hub's name),
getresidencyparaguay.com, easyparaguay.com (PT/EN, USD 1,300/1,700), prestigeparaguay.com,
vfparaguaygestiones.com.py, paraguaidigital.com.br and viaparaguay.com (large PT portals), migrapyassessoria.com,
paraguaydocs.com, imigraparaguai.com.

**Swedish market:** moveparaguay.com/sv is the only Swedish commercial player we found. The rest of the Swedish
SERP is general emigration content (boutomlands.se, flyttautomlands.nu, sviv.se, Sweden Abroad) and
English-language sites. The market is uncontested but small.

---

## 2. Score table (0–3 per criterion; 24 max)

Rubric: **3** = best in niche, **2** = solid, **1** = present but weak, **0** = missing.
"Speed" = WhatsApp prominence plus a stated reply time. "Mobile CTA" = what a thumb can reach at 390 px after scrolling.
"Us" is scored on the live `residenciaenparaguay.es`, `paraguayfrontier.com` and `paraguayresidencyguide.com`,
plus the repo. The other four domains could not be loaded.

| Competitor | Hero promise | Proof | Price transparency | Guarantee | Speed-to-contact | Mobile CTA | Content depth | Lead magnet | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| paraguailivre.com (PT) | 3 | 1 | 3 | 3 | 2 | 2 | 3 | 3 | **20** |
| paraguaysovereign.com (EN) | 2 | 2 | 3 | 2 | 2 | 2 | 3 | 2 | **18** |
| moveparaguay.com (SV/33) | 2 | 0 | 3 | 2 | 2 | 2 | 3 | 3 | **17** |
| paraguaysimply.com (EN) | 3 | 2 | 3 | 1 | 2 | 2 | 1 | 2 | **16** |
| residenciaparaguai.com.br (PT) | 3 | 1 | 3 | 0 | 3 | 3 | 0 | 2 | **15** |
| settee.io (PT) | 1 | 2 | 3 | 1 | 1 | 1 | 3 | 3 | **15** |
| invertirenasuncion.com (ES) | 2 | 2 | 3 | 0 | 3 | 2 | 1 | 2 | **15** |
| movetoparaguay.com (EN/ES/BR) | 1 | 1 | 2 | 0 | 2 | 2 | 3 | 2 | **13** |
| gestoriaenparaguay.com.py (ES) | 2 | 3 | 0 | 0 | 2 | 2 | 2 | 2 | **13** |
| residenciaparaguay.com (ES) | 2 | 2 | 0 | 0 | 3 | 2 | 2 | 1 | **12** |
| paraguaypathways.com (EN/ES/PT) | 1 | 1 | 2 | 1 | 2 | 1 | 1 | 1 | **10** |
| **Us (live + repo)** | 2 | 0 | 0 | 0 | 1 | 0 | 2 | 2 | **7** |

Why we score so low: the hero copy is good ("Residencia en Paraguay, sin vueltas", "A second residency you can
actually get"). Proof is initials only (AM / YA / DD) and "we read every message ourselves", with no face, count, review or office photo.
Every `pricing.*` fact is hedged to "fixed fee confirmed in writing". The only guarantee is the $7 guide's 14-day refund; the services have none.
There is no WhatsApp link and no sticky CTA. Content is solid on ES (26 articles) and EN, and thin on PT (10). The lead
magnets are the 2-minute route finder, the document checklist and the EN guide. **Five of the eight gaps are inputs
only Anton can supply (prices, WhatsApp number, photos, reviews, a guarantee policy). None of them is a build problem.**

---

## 3. One paragraph per competitor

**movetoparaguay.com.** It is no longer an agency. The homepage now opens with an "Accept cookies to continue"
wall ("funded by advertising"). It sells a USD 150 / 90-minute orientation and PDF guides "from $9.99", and hands
filings to Grupo Gaia (residency) and Agescon (company, RUC) through pre-filled WhatsApp links with a `source=`
tag. Its strength is still content: 176 EN / 171 ES / 151 BR / 153 RU posts, a residency cost calculator,
correct hreflang, and alternatives pages naming competitors ("gpb180.com alternatives", "mersanlaw.com alternatives").
The weakness is that the ES and BR sections are the US-centric English set translated, with English slugs
(`/br/blog/move-paraguay-from-america`). It has nothing on Pix, INSS, carro brasileiro, saída definitiva or
autónomos. No faces, no reviews. Palette: emerald `#047857` / `#0b835d` on white with `#fffbeb` cream bands, all in Inter 800.

**paraguaysovereign.com.** The most polished English agency. The hero reads "Paraguay Residency. *Your Move.*" in 96 px
Playfair Display on a painterly cream background. Under it sits a stat bar: "0 % tax on foreign income · 98 % approval
rate · 350+ clients served · 81 avg days to residency", then country names in a "trusted by clients from" row and a tax-savings calculator.
Packages are Premium $2,290, Fast Track $3,390 and Investor $5,490, with 5 % off for Bitcoin. The guarantee reads "if denied, we fix it
and help you reapply". There's a floating WhatsApp button on mobile. About 404 URLs in clean topic clusters, including a /for-agents/
page. Weaknesses: no faces, no named team, no third-party reviews, "0 % tax" framing. Palette: **terracotta
`#b85c38` on cream `#f9f7f2`, taupe text `#4a4238`, square buttons**. That is almost exactly our current guide theme
(`#b4471f` on `#fdf8f1`, Fraunces).

**paraguaysimply.com.** "Residency in Paraguay. *Structured. Legal. Predictable.*" The hero offers two choice
cards: "I want a legal second residency, from $1,480" and "I need a defensible tax structure, from $2,490". Three residency
routes ($1,480 / $1,890 / $2,180) include government and notary fees. Two tax protocols ($2,490 / $2,990). "No upfront fee" and a
free pre-check. For proof it has a Trustpilot link, the founder's name (Jakub), its RUC number printed on the page, and two anonymised client scenarios.
WhatsApp and Telegram float on mobile. Thin content (a handful of guides). Palette: charcoal-to-navy gradient hero, **gold
`#d4a056`** accents, ink `#0d1b2a`, Playfair Display over Inter. This is the "navy + gold boutique" look.

**paraguaypathways.com.** "The experts of Tax Residency in Paraguay." Seven languages. Prices are in **PYG**:
Gold temporary package PYG 20,000,000 (≈ US$3,400 at G 5,870) including cédula, RUC, translations and airport
transfers, and SUACE permanent PYG 35,000,000 (≈ US$6,000) plus the US$70,000 investment. "No down payment until procedures
begin", "we answer within 24 hours", "1,000+ individuals from 40+ countries", WTC address. The design is dated: Raleway,
royal blue `#0333af` and red `#ce2a1d` (flag colours), no floating CTA.

**residenciaparaguay.com (ES).** "Consigue tu residencia legal en Paraguay." The first mobile CTA is a green **"Contactar
por Whatsapp"** button, the second is "Reserva tu consulta online" (Tidycal). Stat stack: "+10 años de experiencia · +500
clientes · 35 % más baratos que la competencia", with a testimonials page (photo plus country). It has nationality pages for
argentinos, bolivianos, brasileños, españoles and uruguayos, a "nosotros vs otros proveedores" page, a "plan B" page and a
Telegram handle. No prices anywhere; the services page is a list of services with "reserva tu consulta". Palette:
white, slate text `#576071`, **coral-red CTA `#ed5050`** and sage WhatsApp green `#448c74`, all Inter.

**gestoriaenparaguay.com.py (Sosa Group).** This is what proof looks like in the niche: "Desde hace más de 30 años ayudamos a
miles de personas…", director **Gloria Sosa** photographed at her desk, the WTC Asunción tower with their own sign
("Gloria Sosa & Asociadas") as office proof, 30+ testimonials with photos and home countries, a Google reviews section,
chamber memberships, "Gloria te responde" Q&A and a free report. No prices. The design is 2015 WordPress: **magenta/pink
bars and mauve buttons**, condensed Oswald-style headings. It is the reference for the proof we lack and for the
colours we should avoid.

**paraguailivre.com (PT).** The Brazil benchmark. The hero reads "Estabeleça sua residência no Paraguai. 0 % de imposto paraguaio
sobre a renda do exterior. **Acompanhamento a partir de $600.**" A founder section follows (Yannick Schroth, emigrated
himself, lives in Asunción), then "Preços transparentes, sem custos ocultos": Light **$600** (crossed out $875), Standard and Premium.
Every package carries a **refund if the application is refused through no fault of yours**. Lead magnets: a visa quiz, a price calculator and a **12-page PDF
checklist**. ~100 PT articles, including every Brazil topic we lack (Pix, INSS, carro com placa paraguaia,
medicina, Pedro Juan Caballero, comprar terra, golpes e despachantes), plus audience pages (para-brasileiros,
para-aposentados, para-famílias, para-nômades, and one per Lusophone country). The weaknesses: a +49 German WhatsApp number, no reviews, a cookie modal covering the
mobile hero, and the "0 %" claim. Palette: slate `#1f2937` on `#f8fafc`, WhatsApp green CTA, an orange accent; Outfit headings over DM Sans.

**residenciaparaguai.com.br (PT).** A one-page funnel: "Residência legal no Paraguai por **US$ 999**. Acompanhamento
completo em português, com presença física no Paraguai." The price is split into US$500 government fees and US$499 fees
(R$ 5,994). Family discounts run 25–50 %, and there's an interactive family calculator. Reply "em até 2 horas úteis", a large floating WhatsApp
button ("Fale conosco!") and "Solicitar Análise Gratuita". Its proof is weak: "22 mil+ brasileiros pediram residência
em 2025" is a market statistic, and "5★ avaliação média" has no source. No blog. Palette: **navy `#0f1f3d` night-city hero, teal `#339985`
CTAs**, Playfair Display over DM Sans.

**settee.io (PT).** A Brazilian plan-B lifestyle brand ("Porque a sua vida te pertence") sold through a US LLC. Residency Padrão
**US$1,699**, Full **US$3,299** (RUC, tax certificate, licence, banking), permanent US$1,899, citizenship "a partir de
US$15,000", RUC US$185. Proof is press logos (Valor, Band, Gizmodo, CoinTelegraph) and two testimonials. Community
and content are its moat: the "Contra o Vento" podcast, the "Rota de Fuga" magazine, a Telegram mastermind, e-books and a newsletter. The form
reply promise is 72 h, which is slow. Palette: white, **yellow `#ffcb14`**, deep indigo `#0d0a2c`, DM Sans throughout.

**moveparaguay.com (SV).** "Flytta till Paraguay. Noll skatt på utländska inkomster." It's a clean editorial design: a stat row
(0 % · US$450 government fee · 5 days via MigraMóvil · 10 years), a three-route table, a table of contents on the right. It's programmatic: 139 pages × 33
languages (regions, calculators, cheat sheet, compare tool, quiz). The prices contradict each other: the homepage bundles are
$199 / $695 / **$1,895 full residency** / $295 per year citizenship track, while `/sv/services/` lists $1,150 document package,
**$2,195** complete (+ ca US$500–600 government fees), $3,450 concierge, from $5,900 investor and $45/month compliance. It offers a full refund
of the service fee if not delivered. No names or faces. The Swedish is machine-translated ("Från ditt köksbord till din
Cédula"). Palette: near-black `#0a0a0a` on `#fafafa`, a brown accent `#7a4500`, system UI sans and monospace labels.

**invertirenasuncion.com (ES).** "Su residencia paraguaya, gestionada de principio a fin." A **closed price of USD 1,950**
(residencia + cédula + RUC), a named registered accountant (CO-1985), "respuesta en 24 h", and a savings calculator that
shows "el servicio se recupera en…". Floating WhatsApp. Palette: **midnight navy `#0a192f` and gold `#c5a059`**, Playfair
Display over Montserrat. The third navy-and-gold site in the set.

---

## 4. Visible prices per route (for our pricing position)

All figures are in USD unless stated, and all were visible on the competitor's page on 2026-09-28. PYG is converted at ~G 5,870/USD
(BCP, late Sept 2026, as in `content/shared/facts.ts`).

| Route | Competitor prices seen | Range | Where the market clusters |
|---|---|---|---|
| **Temporary residency + cédula** (service) | paraguailivre from 600 (gov fees extra) · residenciaparaguai.com.br **999 all-in** (499 fee + 500 gov) · easyparaguay 1,300 (+ RUC), fast-track 1,700 · paraguaysimply 1,480 / 1,890 / 2,180 (gov + notary incl.) · settee 1,699 · moveparaguay 1,895 (bundle) or 2,195 + gov fees · invertirenasuncion **1,950 closed** (+ RUC) · paraguaysovereign 2,290 / fast track 3,390 · getresidencyparaguay 2,900+ per person · paraguaypathways PYG 20M ≈ 3,400 (+ RUC, translations, transfers) | **600 – 3,400** | **1,500 – 2,300** for the full service. The PT market anchors low (US$600–999) |
| Temporary, "full/concierge" tier (+ RUC, bank, licence) | settee 3,299 · moveparaguay concierge 3,450 · sovereign fast track 3,390 | 3,300 – 3,450 | ~3,400 |
| **Permanent residency** (conversion after 2 years) | settee 1,899 · others quote on request. Government fee Gs 2,787,550 ≈ 475, or Gs 2,230,040 ≈ 380 under Mercosur (vfparaguaygestiones FAQ) | ~1,900 service + ~400–475 gov | Few publish it: **a visible permanent price is an easy differentiator** |
| **Investor Pass / SUACE** (service fee, investment excluded) | paraguaysovereign Investor 5,490 · moveparaguay from 5,900 · paraguaypathways PYG 35M ≈ 6,000 | 5,500 – 6,000 | ~5,500–6,000 on top of the 70k–200k investment |
| **RUC / tax residency** | settee RUC 185 · moveparaguay RUC 395 + tax residency 695 · paraguaysimply tax protocols 2,490 / 2,990 | 185 – 2,990 | RUC as an add-on at 185–395; "tax structure" packages at ~2,500–3,000 |
| **Family** | residenciaparaguai.com.br −25 % (2nd member) to −50 % (5th+) · settee 1,899 per dependent | — | Percentage discounts beat per-head pricing |
| **Citizenship** | moveparaguay 1,495 prep + 3,950 court filing (+ 295/yr "track") · settee from 15,000 | 5,400 – 15,000 | Few offer it. It's an upsell after permanent residency |
| **Consultation** | movetoparaguay 150 / 90 min · almost everyone else free (30 min) | 0 – 150 | Free |
| **Documents only / DIY support** | moveparaguay 199 review, 695 "move from home", 1,150 document package | 199 – 1,150 | — |

Market notes:
- **ES:** only invertirenasuncion publishes a number (1,950). The two strongest ES gestorías (residenciaparaguay.com, Sosa) publish none. A euro price on the `.es` brand would be unique (§11.6 already promises "cotizado en euros").
- **PT:** the price *is* the headline (US$999, from $600). A Brazilian compares on price in the first screen. §11.7 promises "cotado em reais ou dólares", so publish both.
- **SV:** only moveparaguay, only in USD. A SEK price (§11.8 "Fast pris per väg, i kronor") would be unique.
- **Positioning suggestion** (Anton decides; it goes into `pricing.*` facts via `/admin/facts`): publish a fixed temporary + cédula fee at or just above the market median (≈ US$1,900–2,400, all government fees itemised), a "full" tier with RUC and bank account near US$3,400, a visible permanent-conversion fee, percentage family discounts, and a written refund rule. That's premium without being out of range, and it beats every competitor that hides its number.

---

## 5. Palette and typography of the top competitors

| Competitor | Background / text | Accent(s) | Display / body font | Look |
|---|---|---|---|---|
| paraguaysovereign | `#f9f7f2` cream / `#4a4238` taupe | terracotta `#b85c38`, sand `#c6a87c` | Playfair Display 400 (96 px) / Inter | Warm editorial luxury. **Near-identical to our guide theme** |
| paraguaysimply | white, charcoal hero / `#2d3748` | gold `#d4a056`, ink `#0d1b2a` | Playfair Display / Inter | Navy + gold boutique |
| invertirenasuncion | white, `#0a192f` navy bands | gold `#c5a059` | Playfair Display / Montserrat | Navy + gold private banking |
| planbparaguay | black hero, `#f3ece1` cream | navy `#0e2a47`, red `#b8302d` | Instrument Serif (100 px) / Plus Jakarta Sans | Big-serif editorial |
| residenciaparaguai.com.br | `#f9fafb` / navy `#0f1f3d` | teal `#339985`, WhatsApp green | Playfair Display / DM Sans | Navy + teal fintech |
| paraguailivre | `#f8fafc` / slate `#1f2937` | WhatsApp green, orange | Outfit / DM Sans | Friendly SaaS |
| movetoparaguay | white / slate | emerald `#047857` | Inter 800 | Utility / docs |
| moveparaguay | `#fafafa` / `#0a0a0a` | brown `#7a4500`, blue links | system UI + monospace labels | Editorial data sheet |
| residenciaparaguay.com | white / `#576071` | coral-red `#ed5050`, sage `#448c74` | Inter | Generic WordPress |
| gestoriaenparaguay (Sosa) | white | **magenta/pink bars, mauve buttons** | condensed sans | Dated. Avoid |
| settee | white / grey | yellow `#ffcb14`, indigo | DM Sans | Loud startup |

What the benchmark says: **Playfair Display over Inter or DM Sans is the niche default (5 of 11 sites)**; navy with gold is
taken three times, terracotta on cream once (Sovereign, which our guide already resembles), and pink or peach only appears on the
weakest-looking site (Sosa). Nobody uses real photography of real people. Stock or AI imagery is everywhere.

### Recommended direction: "notarial calm" (premium, trust-first, no pink)

- **Base:** warm paper `#F6F4EF` (bg), white `#FFFFFF` (surface), stone `#E6E1D6` (surface-alt), ink `#0F1B2D` (text and dark bands), muted `#5A6472`.
- **Primary accent, per service brand:** a deep, institutional colour, never a bright one:
  hub `residency` = **yerba green `#1E5B48`**; `residenciaes` = **Asunción brick `#8C3A24`**, a deeper red-earth than Sovereign's orange-terracotta, used on ink rather than on cream; `residenciapt` = **deep teal `#0E5563`**, used on paper; `frontier` = **slate blue `#23466B`**; `flytta` = **Nordic navy `#1B3A5C`**; `investorpass` keeps its dark theme + brass.
- **One shared "seal" colour:** brass `#A8834B` for hairlines, stat numbers, verified-by badges and price figures, at no more than ~5 % of the page. It ties the brands into one company without the navy-and-gold cliché.
- **WhatsApp green `#25D366` only on WhatsApp buttons**, so it always means "chat now".
- **Kill** the guide's peach `#fbe7dc` band and move `guide` off terracotta-on-cream (it reads as Sovereign's twin). Use ink `#0F1B2D` on paper with the brass seal and a single green buy button.
- **Type:** keep the fonts already loaded (`src/styles/fonts.css`) and pick a lane competitors aren't in. Use **Fraunces** for display at high optical size with the SOFT/WONK axes at 0, which reads as a crisp editorial serif, not Playfair. Use **Inter Tight** for UI and body. Use **tabular lining figures** for every price and stat. Drop Bricolage on `residenciapt` (too playful for trust). Keep Instrument Serif only on `investorpass`.
- **Imagery rule:** real team photos in the Asunción office and at Migraciones beat any hero shot. The benchmark shows faces are the scarcest trust signal in the niche.

---

## 6. What they have that we don't

1. **A price in the first screen** (paraguailivre "a partir de $600", residenciaparaguai "US$ 999", paraguaysimply "From $1,480"). Six of 11 publish full price tables, two more publish a single headline price, and four offer **price, cost or family calculators**.
2. **A floating WhatsApp button on mobile** (7 of 11) and **a stated reply time**: 2 h (residenciaparaguai.com.br), 24 h (pathways, paraguailivre, invertirenasuncion, imigra). We have neither: no `wa.me` link exists on any brand.
3. **Real faces and a real office:** Gloria Sosa at her desk, the WTC tower with their nameplate, 30+ testimonial photos with countries (Sosa), and a founder portrait and bio (paraguailivre).
4. **Hard numbers:** "98 % approval · 350+ clients · 81 avg days" (Sovereign), "+10 años · +500 clientes" (residenciaparaguay.com), "30 años" (Sosa), "1,000+ from 40+ countries" (Pathways).
5. **Third-party reviews:** Trustpilot (paraguaysimply), a Google reviews block (Sosa). Nobody in the set has **video testimonials**. That lane is open.
6. **A written guarantee:** a refund if refused through no fault of the client (paraguailivre), a full service-fee refund if not delivered (moveparaguay), "we fix it and reapply" (Sovereign), "no upfront fee" (paraguaysimply), "no down payment until procedures begin" (Pathways).
7. **Lead magnets beyond a quiz:** a 12-page PDF checklist (paraguailivre), a cheat sheet and compare tool (moveparaguay), tax-savings calculators (Sovereign, invertirenasuncion), a free "pre-check" (paraguaysimply).
8. **Audience and nationality landing pages:** residenciaparaguay.com has one per nationality (5); paraguailivre has pages for aposentados, famílias, nômades, empresários, investidores and 8 Lusophone countries.
9. **Community:** Plan B Paraguay (dinners, padel, a WhatsApp community for arrivals), settee (Telegram mastermind, podcast, magazine).
10. **Booking calendars** (Tidycal on residenciaparaguay.com, Sosa) and **alternative channels** (Telegram, Signal).
11. **A named registration number on the page** (paraguaysimply's RUC, invertirenasuncion's accountant licence CO-1985) as cheap legitimacy.
12. **Scale:** movetoparaguay ~170 posts per language × 4, Sovereign ~404 URLs, moveparaguay 139 × 33 languages, paraguailivre ~100 in PT (we have 10 in PT).

## 7. Where we can clearly beat them

1. **Native, market-specific content in PT, ES and SV.** The big content players are translations: movetoparaguay's `/br/` and `/es/` are US posts with English slugs, and moveparaguay's Swedish is machine-translated. No one covers DSDP/CSDP (saída definitiva), the Brazilian income-tax reform, Pix-friendly accounts, INSS in Paraguay, carro brasileiro or medicine students together with residency. No one does Spain-specific autónomos, cuarentena fiscal or pensionista español content. No one writes native Swedish on pension and SINK tax. See `seo-gap.md`.
2. **Accuracy as a brand.** Nearly every competitor sells "0 % tax", "Noll skatt" or "Viva sem imposto de renda". Our `<Fact>`/sourced-figure system with cited sources and bylines is what AI answer engines quote, and it matches the honest voice in plan §11. Say it out loud: "Every figure on this page links to its source."
3. **Technical SEO is already ahead of most:** Article + FAQPage + BreadcrumbList + Person JSON-LD, llms.txt, RSS, answer-first articles with "Puntos clave" and "Fuentes". The WordPress gestorías (residenciaparaguay.com, Sosa, Pathways) have little or none of this.
4. **A premium design against dated WordPress.** In ES the two strongest players look 2015 (Sosa, residenciaparaguay.com). Once the ES CSS and DNS are fixed, a calm, photo-honest site with visible prices wins the "who looks safest to wire money to" test.
5. **One team, seven native-language doors.** No competitor has separate native brands per market. For multilingual queries (e.g. "residencia paraguay" searched from Brazil or Spain) we can hold several results.
6. **The UK angle is empty:** ACRO, HMRC, the frozen UK state pension and post-Brexit comparisons. No competitor targets Brits specifically.
7. **Price transparency where the local leaders hide it:** ES (only 1 of 5 publishes), permanent-residency conversion (only settee), SEK and EUR prices (nobody).
8. **Speed-to-contact is a free win** once `NEXT_PUBLIC_WHATSAPP_NUMBER` is set. The components (`WhatsApp.tsx`, the click tracker) already exist. Add a sticky mobile WhatsApp + "Descubre tu ruta" bar and a same-day reply promise to match the 2-hour benchmark.

---

## 8. Screenshot index

`docs/audit/2026-10/competitors/` has 68 files, ~8.8 MB, JPEG q55, the first three viewports of each page:
- `movetoparaguay-{home,services,contact,home-br,home-es}-{1440,390}.jpg` (contact = `/en/consultancy`)
- `paraguaysovereign-{home,pricing,contact}-*`, `paraguaysimply-{home,pricing,contact}-*` (contact = `/about`; the site has no contact page, only WhatsApp and Telegram)
- `paraguaypathways-{home,pricing,contact}-*`, `residenciaparaguay-com-{home,services,contact}-*`, `gestoriaenparaguay-{home,services,contact}-*`
- `paraguailivre-{home,pricing,contact}-*` (contact = `/calculadora-de-precos`, the page its CTAs lead to), `residenciaparaguai-br-home-*` (a single-page site), `settee-{home,pricing,contact}-*`
- `moveparaguay-{home,pricing,contact}-*` (Swedish `/sv/`, contact = `/sv/about/`), `invertirenasuncion-home-*`, `planbparaguay-home-*`
- Us: `us-residenciaes-home-*` (shows the unstyled page caused by the 404 CSS) and `us-frontier-home-*`. The hub, investorpass, residenciapt and flytta could not be captured (DNS).

Cookie banners were left untouched; nothing was accepted or clicked. They are visible in some shots, notably movetoparaguay (a full cookie wall), paraguailivre and settee.
