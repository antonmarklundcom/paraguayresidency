# Design prompts — 2026-09-30

Standalone Claude Design prompts. Every prompt carries its full brief, so each one can be pasted on its
own. Brand 1 (done) has separate desktop and mobile prompts; brands 2–4 are ONE prompt each that puts
desktop and mobile in the same zoomable canvas file, mobile under desktop.

The offer-strategy prompt moved to `docs/offer-session-prompt.md`.

- 1. paraguayresidency.co.uk — Paraguay Residency (the hub, British English)
- 2. vidanoparaguai.com — Vida no Paraguai (Brazilian Portuguese) — one prompt
- 3. residenciaenparaguay.es — Residencia en Paraguay (Spanish from Spain) — one prompt
- 4. emigrerennaarparaguay.nl — Emigreren naar Paraguay (Dutch) — one prompt

---

## 1a. paraguayresidency.co.uk — desktop home (1440)

```
Design the desktop homepage (1440 px wide) for "Paraguay Residency", paraguayresidency.co.uk.

WHAT THE BRAND IS
The hub of a family of seven Paraguay-residency websites, all run by one small residency team in
Asunción, Paraguay. This site sells the done-for-you residency service and routes everyone else to
the right sister site. We are a residency team, NOT a law firm: never write lawyer, solicitor or law
firm. Approval is decided by the Paraguayan authority; never promise approval or tax outcomes.

AUDIENCE
Mostly UK residents aged 35–70, plus English speakers from the US, Ireland and Australia arriving
from Google:
- retirees who want their pension to go further,
- founders and remote workers who want a second residency or a Plan B,
- families planning a few years ahead.
Their real fear is not "how", it is "who can I trust in a country I have never visited, with my
passport and my money". Every section must answer that fear.

POSITIONING AND VOICE
"We do your Paraguay residency for you. Fixed scope, in writing, one named case manager, from first
message to cédula." British understatement: calm, competent, plain English, no hype, no exclamation
marks. British spelling (organise, colour, programme). Prices shown in GBP with USD beside them.

SIGNATURE INTERACTION — "Your file, stage by stage"
The spine of the page: a case-file tracker drawn as a row of paper folder tabs. 8 stages: first
message → documents at home (apostilles, translations) → arrival → filing at Migraciones →
biometrics → temporary residency → cédula → RUC and bank. Clicking a tab opens three short columns:
"What we do" / "What you do" / "Where you need to be", plus a duration chip. It should feel like
opening a real, well-kept client folder: tabs, a stamp, one or two handwritten-feel margin notes.
Annotate the interaction on the canvas.

SECONDARY — "Which one sounds like you?"
Four cards that route people honestly: "Do it for me" → the service on this site · "I'm investing" →
Paraguay Investor Pass · "I'll do it myself" → Paraguay Residency Guide · "Not in English" →
Español / Português / Svenska / Nederlands sister sites.

SECTIONS, IN ORDER
1. Header: wordmark, nav (Services, How it works, Pricing, About, Questions), WhatsApp button,
   primary button "Start with a written assessment".
2. Hero: the promise, two buttons ("Start with a written assessment", "WhatsApp us"), one line:
   "Written reply within one working day".
3. Who we are: named team photos and the office street in Asunción (photo placeholders).
4. Your file, stage by stage.
5. Packages: Temporary residency, Permanent residency, Family add-on, Cédula & RUC — each
   "From [PRICE]", with included / not included lists.
6. "What you get in writing before you pay".
7. How payment works [TO CONFIRM] and what happens if something goes wrong [TO CONFIRM].
8. Which one sounds like you?
9. Client stories — a dashed box labelled "HIDDEN UNTIL REAL".
10. FAQ: health cover, leaving UK tax residency (general information, not advice), pets, driving
    licence, getting there.
11. Final call to action with WhatsApp and a short form (name, email, WhatsApp, your situation).
12. Footer: sister brands, privacy, terms, "General information, not legal advice".

VISUAL DIRECTION
Private-bank authority meets a well-kept case file. Ink navy, warm paper, one brass accent. The
display face must NOT be Newsreader (a sister site uses it): choose a sharp high-contrast serif or a
refined grotesk. Imagery: a real-looking Asunción office and paperwork. No stock beaches, no flags.
It must look clearly different from two sister sites: Paraguay Residency Guide (cream and deep green,
book feel) and Paraguay Investor Pass (white and teal, decision-memo feel).

HARD RULES
- Never invent a legal or financial number (fees, thresholds, tax rates, durations, prices). Show
  each as a dashed placeholder chip, e.g. [FACT: fee.temporary], [PRICE], [DURATION].
- No invented testimonials, client counts, star ratings, press logos or awards.
- Exactly one web font (one weight) for display type; body text in the system font stack; any
  monospace uses system ui-monospace.
- Fast page: at most one hero image, no autoplay video, no carousel, no scroll-jacking, CSS-only
  motion that respects prefers-reduced-motion.
- WCAG AA contrast, visible focus states, targets at least 44 px.
- Avoid anything that looks like a visa mill: countdown timers, "guaranteed", fake urgency.

DELIVERABLE
The full desktop homepage in one frame, plus a small spec board beside it: colour tokens, type
scale, spacing, radius, button and chip styles.
```

## 1b. paraguayresidency.co.uk — mobile home (390)

```
Design the mobile homepage (390 px wide) for "Paraguay Residency", paraguayresidency.co.uk. If a
desktop version already exists in this project, match its tokens, type and copy exactly and adapt
the layout; otherwise create the design from this brief.

WHAT THE BRAND IS
The hub of a family of seven Paraguay-residency websites, run by one small residency team in
Asunción. It sells the done-for-you residency service and routes everyone else to the right sister
site. We are a residency team, NOT a law firm: never write lawyer, solicitor or law firm. Never
promise approval or tax outcomes; the authority decides.

AUDIENCE
UK residents aged 35–70 (plus US, Irish, Australian English speakers): retirees stretching a
pension, founders and remote workers wanting a Plan B, families planning ahead. Their fear: "who can
I trust abroad with my passport and my money". Most first visits are on a phone, often from a
Google search or a WhatsApp link.

VOICE
Calm British understatement, plain English, British spelling, no hype, no exclamation marks.
Promise: "We do your Paraguay residency for you. Fixed scope, in writing, one named case manager."
Prices in GBP with USD beside them.

SIGNATURE INTERACTION — "Your file, stage by stage" (mobile form)
A vertical stepper styled as a stack of paper folder tabs. 8 stages: first message → documents at
home → arrival → filing at Migraciones → biometrics → temporary residency → cédula → RUC and bank.
Tapping a stage expands it in place to "What we do" / "What you do" / "Where you need to be" and a
duration chip. One stage open at a time. Annotate the interaction.

SECTIONS, IN ORDER
1. Compact header: wordmark, WhatsApp icon button, menu button (show the open menu as a second
   small frame).
2. Hero: promise, full-width primary button "Start with a written assessment", secondary "WhatsApp
   us", line "Written reply within one working day".
3. Who we are: a horizontal row of three round team photo placeholders, one sentence, office
   location.
4. Your file, stage by stage.
5. Packages as stacked cards (Temporary residency, Permanent residency, Family add-on, Cédula & RUC),
   each "From [PRICE]" with a collapsible "What's included".
6. "What you get in writing before you pay" as a short list.
7. "Which one sounds like you?" — four full-width route cards (do it for me / investing → Paraguay
   Investor Pass / DIY → Paraguay Residency Guide / not in English → sister sites).
8. Client stories — dashed box "HIDDEN UNTIL REAL".
9. FAQ accordion (health cover, leaving UK tax residency — general, not advice, pets, driving
   licence, getting there).
10. Short form: name, email, WhatsApp, your situation.
11. Footer with sister brands and legal links.
12. Sticky bottom bar: "WhatsApp" + "Written assessment", always visible, not covering content.

VISUAL DIRECTION
Private-bank authority meets a well-kept case file: ink navy, warm paper, one brass accent, a
display face that is NOT Newsreader. Must differ from the sister sites Paraguay Residency Guide
(cream/green book feel) and Paraguay Investor Pass (white/teal memo feel). No beaches, no flags.

HARD RULES
- Never invent a legal or financial number; every fee, threshold, rate, duration and price is a
  dashed placeholder chip ([FACT: …], [PRICE], [DURATION]).
- No invented testimonials, counts, ratings, logos or awards.
- One web display font (one weight), system body font, system monospace.
- Mobile performance: at most one small hero image, no autoplay video, no carousel, CSS-only motion
  respecting prefers-reduced-motion.
- WCAG AA contrast, touch targets at least 44 px, body text at least 16 px, no horizontal scroll.

DELIVERABLE
The full mobile homepage as one tall frame, plus the open-menu frame and the stepper with one stage
expanded.
```

---

## 2. vidanoparaguai.com — desktop + mobile in one file

```
Design the homepage for "Vida no Paraguai", vidanoparaguai.com, as ONE canvas file containing BOTH
the desktop version and the mobile version. All copy in Brazilian Portuguese, written natively (it
must not read as a translation).

CANVAS LAYOUT (important)
- Use canvas mode (design_doc_mode = canvas) so the preview can zoom in, zoom out and fit to
  screen, and be panned.
- Frame 1 at the top: "Home — desktop · 1440", the full desktop homepage, 1440 px wide.
- Frame 2 directly UNDER it, left-aligned: "Home — mobile · 390", the full mobile homepage, 390 px
  wide. Beside the mobile frame, small extra frames: the open mobile menu and the quiz states.
- Last, under everything: a spec board with colour tokens, type scale, spacing, radius, button and
  chip styles.
- Both frames share the same tokens, type and copy; only the layout adapts.

WHAT THE BRAND IS
One of eight Paraguay-residency websites run by a small residency team in Asunción. This one serves
Brazilians who want to live, work or run a business in Paraguay. Lead generation: WhatsApp (primary)
and a short form. We are NOT a law firm: never write advogado or escritório de advocacia. Never
promise approval or tax savings, never use "paraíso fiscal".

AUDIENCE
- empresários: small and mid-size business owners, e-commerce, agro, profissionais liberais tired of
  the carga tributária and the burocracia,
- families from Paraná, Mato Grosso do Sul, Santa Catarina and Rio Grande do Sul who know the border
  (Foz ↔ Ciudad del Este, Ponta Porã ↔ Pedro Juan Caballero),
- aposentados and remote workers looking for lower cost of living and segurança.
Many have seen "Paraguai é o novo destino" on YouTube and Instagram and are half-convinced. They need
a trustworthy team that speaks Portuguese and a clear path, not more hype. Most arrive on a phone.

VOICE
Caloroso, direto, "você", like a friend who already made the move. WhatsApp first. Prices in R$
first, then USD.

SIGNATURE INTERACTION — "Seu plano de mudança em 3 perguntas"
Three tap-only questions: Qual é o seu perfil? (empresário / trabalho remoto / aposentado / família)
· Onde você mora hoje? (estado) · Quando quer se mudar? (3 meses / 6 meses / 1 ano ou mais). The
section then rebuilds in place into a personal 3-step roadmap (documents from Brazil → residência no
Paraguai → what comes next for your profile) with a button "Receber meu plano no WhatsApp" that opens
WhatsApp with a pre-filled message.
Desktop: question state and result state side by side. Mobile: one question per full-width card
with big tap targets and progress dots; show question 1, question 3 and the result as small frames.
Annotate how it works.

SECTIONS, IN ORDER (both frames)
1. Header — desktop: wordmark, nav (Como funciona, Para empresários, Para famílias, Preços,
   Perguntas), WhatsApp button. Mobile: wordmark, WhatsApp icon button, menu button.
2. Hero: promise, WhatsApp button, secondary "Fazer as 3 perguntas", badge "Atendimento em
   português", line "Resposta por escrito em até um dia útil". Buttons full-width on mobile.
3. Seu plano de mudança em 3 perguntas.
4. "Brasil × Paraguai, lado a lado": abrir empresa, impostos, energia, custo de vida, tempo até a
   residência. Desktop: a clean table. Mobile: one card per topic. Every value is a dated
   placeholder chip with a source line.
5. Para empresários: company and residency together.
6. Para famílias: schools, health, safety (general information).
7. "Onde os brasileiros moram": illustrated SVG map of Paraguay with Asunción, Ciudad del Este,
   Encarnación, Pedro Juan Caballero and a one-line profile each (tappable pins on mobile).
8. A equipe: a Portuguese-speaking team member, photo placeholders, a video slot shown as a poster
   with a play button (click-to-load).
9. Como funciona + preços "a partir de [PRICE]" (stacked cards on mobile).
10. Histórias de clientes — dashed box "HIDDEN UNTIL REAL".
11. Perguntas (accordion): Posso manter minha empresa no Brasil? E o CPF? Conta bancária? Escola
    para os filhos? Saúde?
12. Final WhatsApp call to action plus a short form (nome, e-mail, WhatsApp, sua situação).
13. Footer: sister brands, privacy, terms, "Informação geral, não é assessoria jurídica".
14. Mobile only: sticky bottom bar with a WhatsApp button, always visible, not covering content.

VISUAL DIRECTION
Warm, sunny, modern and a little bold, like a good Brazilian fintech or lifestyle brand, not a
government site. Motif: the lapacho (ipê), Paraguay's flowering tree that Brazilians know as ipê —
pink and violet blossom against terracotta red earth and a deep evergreen. Absolutely no
green-and-yellow flag palette. One display font with personality (friendly grotesk or rounded
serif). It must look different from the sister sites Paraguay Residency Guide (cream/green book
feel), Paraguay Investor Pass (white/teal memo feel) and Paraguay Residency (navy/paper/brass).

HARD RULES
- Never invent a legal or financial number (taxes, energy prices, fees, durations, prices). Each is a
  dashed placeholder chip ([FACT: …], [PRICE], [DURATION]).
- No invented testimonials, client counts, star ratings, press logos or awards.
- One web display font (one weight), system body font, system monospace.
- Fast page: at most one hero image, no autoplay video, no carousel, no scroll-jacking, CSS-only
  motion respecting prefers-reduced-motion.
- WCAG AA contrast, visible focus, targets at least 44 px; on mobile body text at least 16 px and no
  horizontal scroll.
- No influencer hype ("fique rico"), no stock beaches, no flags.
```

---

## 3. residenciaenparaguay.es — desktop + mobile in one file

```
Design the homepage for "Residencia en Paraguay", residenciaenparaguay.es, as ONE canvas file
containing BOTH the desktop version and the mobile version. All copy in Spanish from Spain
(castellano peninsular), written natively.

CANVAS LAYOUT (important)
- Use canvas mode (design_doc_mode = canvas) so the preview can zoom in, zoom out and fit to
  screen, and be panned.
- Frame 1 at the top: "Home — desktop · 1440", the full desktop homepage, 1440 px wide.
- Frame 2 directly UNDER it, left-aligned: "Home — mobile · 390", the full mobile homepage, 390 px
  wide. Beside the mobile frame, small extra frames: the open mobile menu and the checklist states.
- Last, under everything: a spec board with colour tokens, type scale, spacing, radius, button and
  chip styles.
- Both frames share the same tokens, type and copy; only the layout adapts.

WHAT THE BRAND IS
One of eight Paraguay-residency websites run by a small residency team in Asunción. This one serves
Spaniards. Lead generation: WhatsApp and a short form. We are NOT a law firm: never write abogado or
despacho. Never promise approval or tax outcomes; the Paraguayan authority decides.

AUDIENCE
- autónomos and small online businesses squeezed by the cuota and taxes,
- professionals aged 30–50 who want a Plan B or a second base in Latin America,
- jubilados looking for a cheaper, calmer life in their own language,
- people with a Paraguayan partner or family ties.
The big emotional advantage: no language barrier. "Mudarte a Paraguay, en tu idioma."

VOICE
Castellano peninsular, "tú", frank, a touch of dry humour, like a friend who already did the
papeleo. Spain vocabulary (móvil, piso, gestoría, empadronamiento, apostilla de La Haya). Never
Latin American vocabulary as default, never stiff corporate "usted". Prices in EUR.

SIGNATURE INTERACTION — "Tu papeleo, de Madrid a Asunción"
An interactive checklist drawn as a flight route. "En España" items (documents to request, apostilla,
translations if needed — generic names, no invented rules), then "En Paraguay" items (presentación
del expediente, biometría, cédula, RUC). A small plane moves along a dotted line as items are ticked;
ticks are remembered in the browser. At the end: "¿Lo hacemos por ti?" → WhatsApp / form, and a
quieter "Prefiero hacerlo yo" → Paraguay Residency Guide.
Desktop: the route runs left (España) to right (Paraguay) across the page. Mobile: vertical, with the
dotted line down the left edge. Show an empty and a half-ticked state; annotate how it works.

SECTIONS, IN ORDER (both frames)
1. Header — desktop: wordmark, nav (Cómo funciona, Autónomos, Jubilados, Precios, Preguntas),
   WhatsApp button, primary "Pide tu valoración por escrito". Mobile: wordmark, WhatsApp icon
   button, menu button.
2. Hero: promise ("Mudarte a Paraguay, en tu idioma" or better), two buttons, line "Te respondemos
   por escrito en un día laborable". Buttons full-width on mobile.
3. "En tu idioma": why Spaniards specifically — language, culture, flights and time difference as
   placeholder chips.
4. Tu papeleo, de Madrid a Asunción.
5. Para autónomos.
6. Para jubilados.
7. "Un mes en Asunción vs. un mes en tu ciudad": pick Madrid / Barcelona / Valencia / Sevilla / otra
   (chip row); alquiler, comida, transporte, luz side by side. Every value a dated placeholder chip
   with a source line.
8. El equipo: photo placeholders, office in Asunción.
9. Servicios y precios "desde [PRICE]" (stacked cards on mobile).
10. Historias de clientes — dashed box "HIDDEN UNTIL REAL".
11. Preguntas (accordion): ¿Pierdo la Seguridad Social? ¿Qué pasa con Hacienda? (general
    information, not advice) ¿Puedo ir con mi familia? ¿Vuelos?
12. Final call to action with WhatsApp and a short form (nombre, email, WhatsApp, tu situación).
13. Footer: sister brands, privacidad, aviso legal, "Información general, no asesoramiento
    jurídico".
14. Mobile only: sticky bottom bar with WhatsApp + "Valoración por escrito", always visible, not
    covering content.

VISUAL DIRECTION
A Spanish editorial magazine rather than a consultancy: bold condensed display type, generous white
space, strong photography slots. Palette from Paraguay seen through Spanish eyes: cal (lime white),
tierra roja (Paraguay's red earth), verde yerba (yerba mate and tereré), one ink colour. A subtle
ñandutí lace pattern (Paraguayan lace) as ornament. No red-and-yellow Spanish flag palette. Must
differ from the sister sites Paraguay Residency Guide (cream/green book feel), Paraguay Investor
Pass (white/teal memo feel) and Paraguay Residency (navy/paper/brass).

HARD RULES
- Never invent a legal or financial number (fees, costs, tax, durations, prices, flight times). Each
  is a dashed placeholder chip ([FACT: …], [PRICE], [DURATION]).
- No invented testimonials, client counts, star ratings, press logos or awards.
- One web display font (one weight), system body font, system monospace.
- Fast page: at most one hero image, no autoplay video, no carousel, no scroll-jacking, CSS-only
  motion respecting prefers-reduced-motion.
- WCAG AA contrast, visible focus, targets at least 44 px; on mobile body text at least 16 px and no
  horizontal scroll.
```

---

## 4. emigrerennaarparaguay.nl — desktop + mobile in one file

```
Design the homepage for "Emigreren naar Paraguay", emigrerennaarparaguay.nl, as ONE canvas file
containing BOTH the desktop version and the mobile version. All copy in Dutch (Netherlands), written
natively, not translated.

CANVAS LAYOUT (important)
- Use canvas mode (design_doc_mode = canvas) so the preview can zoom in, zoom out and fit to
  screen, and be panned.
- Frame 1 at the top: "Home — desktop · 1440", the full desktop homepage, 1440 px wide.
- Frame 2 directly UNDER it, left-aligned: "Home — mobile · 390", the full mobile homepage, 390 px
  wide. Beside the mobile frame, small extra frames: the open mobile menu and the quiz states.
- Last, under everything: a spec board with colour tokens, type scale, spacing, radius, button and
  chip styles.
- Both frames share the same tokens, type and copy; only the layout adapts.

WHAT THE BRAND IS
One of eight Paraguay-residency websites run by a small residency team in Asunción. This one serves
people in the Netherlands (and Flanders) who are seriously thinking about emigrating. Lead
generation: WhatsApp and a short form. We are NOT a law firm: never write advocaat or
advocatenkantoor. Never promise approval or tax outcomes; the Paraguayan authority decides.

AUDIENCE
- 45–70-year-olds tired of the housing shortage, rising costs and regulation, including people
  retiring early,
- agrariërs and rural entrepreneurs who look at land and space abroad,
- ondernemers and remote workers who want a second base,
- families who want more space and a slower life.
Many have watched emigration TV and are wary of drama and cowboys. They want the honest story: what
is good, what is hard, what it costs, how long it takes.

VOICE
Nuchter, direct, "je", honest to the point of saying who Paraguay is NOT for. A little dry humour, no
hype, no superlatives. Prices in EUR.

SIGNATURE INTERACTION — "Past Paraguay bij jou? De eerlijke check"
Six quick tap questions (budget per month, work or retired, family, climate tolerance, Spanish,
timeline). The result is an honest verdict in three bands — "Goede match", "Kan, maar let op",
"Waarschijnlijk niet voor jou" — with two or three plain reasons each, and a button "Bespreek je
situatie via WhatsApp". The "not for you" result must look as respectable as the others.
Desktop: question state and one result side by side. Mobile: one question per full-width card with
progress dots; show question 1 and two different results as small frames. Annotate how it works.

SECTIONS, IN ORDER (both frames)
1. Header — desktop: wordmark, nav (Hoe het werkt, De eerlijke check, Kosten, Over ons, Vragen),
   WhatsApp button, primary "Vraag een schriftelijk advies". Mobile: wordmark, WhatsApp icon button,
   menu button.
2. Hero: an honest promise, primary "Doe de eerlijke check", secondary WhatsApp, line "Je krijgt
   binnen één werkdag schriftelijk antwoord". Buttons full-width on mobile.
3. De eerlijke check.
4. "Nederland vs. Paraguay, zonder sausje": woonlasten, boodschappen, energie, belasting in
   hoofdlijnen, ruimte/grond, tijd tot verblijfsvergunning. Desktop: a clean table. Mobile: one card
   per topic. Every value a dated placeholder chip with a source line.
5. "Wat meevalt en wat tegenvalt": two honest columns on desktop, a two-tab toggle on mobile.
6. Hoe het werkt: the steps from documents in the Netherlands (apostille, translations) to cédula,
   durations as placeholder chips (vertical on mobile).
7. Het team: photo placeholders, office in Asunción.
8. Diensten en prijzen "vanaf [PRICE]" (stacked cards on mobile).
9. Verhalen van klanten — dashed box "HIDDEN UNTIL REAL".
10. Vragen (accordion): AOW en pensioen in het buitenland, uitschrijven uit de BRP,
    zorgverzekering, belasting (general information, not advice), rijbewijs, huisdieren.
11. Final call to action with WhatsApp and a short form (naam, e-mail, WhatsApp, je situatie).
12. Footer: sister brands, privacy, voorwaarden, "Algemene informatie, geen juridisch advies".
13. Mobile only: sticky bottom bar with WhatsApp + "Schriftelijk advies", always visible, not
    covering content.

VISUAL DIRECTION
Dutch graphic design tradition: a strong grid, confident sans-serif display type, lots of air, one
saturated accent. Palette: polder-sky grey-blue, Paraguay's red earth (terracotta), the deep green of
the Chaco, off-white. Photography slots: wide skies and open land, a real Asunción street, the team.
No windmills, no tulips, no clogs, no orange overload. Must differ from the sister sites Paraguay
Residency Guide (cream/green book feel), Paraguay Investor Pass (white/teal memo feel) and Paraguay
Residency (navy/paper/brass).

HARD RULES
- Never invent a legal or financial number (costs, tax, pension rules, durations, prices). Each is a
  dashed placeholder chip ([FACT: …], [PRICE], [DURATION]).
- No invented testimonials, client counts, star ratings, press logos or awards.
- One web display font (one weight), system body font, system monospace.
- Fast page: at most one hero image, no autoplay video, no carousel, no scroll-jacking, CSS-only
  motion respecting prefers-reduced-motion.
- WCAG AA contrast, visible focus, targets at least 44 px; on mobile body text at least 16 px and no
  horizontal scroll.
```
