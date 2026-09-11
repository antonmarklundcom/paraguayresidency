# Claude Design prompts — one per brand, three pages each

Written by F10 (2026-09-11). Each block below is a standalone prompt: open Claude Design, paste one block, run
it. Every prompt asks for **three separate designs on three separate pages** (artboards) inside one canvas: page 1
is the design idea F10 picked from the audit findings; pages 2 and 3 are Claude Design's own choice from the
brand's page list. The canvases are drafts — a later Sonnet phase per brand (plan §10, "Design uplift") ports the
one you pick into the real Next.js components. Shared constraints the design must respect are in every prompt's
"Rules" line: they come from `plan.md` §1.8, §1.10 and §11.

What the audit found that these prompts lean on: no brand has a trust block (named team, process timeline, case
study); the hub's pricing page has no anchor; article collections have no index page; LatAm brands need a
WhatsApp-first contact path; the paid member area is thinner than the free blog; the site has zero photography
today (system fonts, generated OG cards only), so every design should assume real imagery arrives later and
still work without it.

---

## 1 — paraguayresidency.co.uk (hub, brand "Paraguay Residency")

```
You are designing for Paraguay Residency (paraguayresidency.co.uk), a done-for-you residency service run by a
small team in Asunción, Paraguay, serving English-speaking applicants worldwide (the .co.uk is the domain they
own, not a UK-only brand). Services: temporary residency, permanent residency, cédula (ID card), RUC / tax
residency, family applications. Business model: one fixed fee per route, quoted on a call before the client
commits; the client attends appointments in Asunción, the team does the rest. Funnel: this is the hub — a $7
"Paraguay Residency Guide" (sister brand) feeds it, and it hands investor-grade clients to "Paraguay Investor
Pass" (sister brand). Primary CTAs: "Find your route" (a 6-question route-finder quiz) and "Book a call". Also a
WhatsApp click-to-chat. Voice: plain, specific, unhurried, second person, short sentences, admits what takes
time; never "unlock", "seamless", "world-class". Hero H1 in use: "Paraguay residency, handled end to end."
Sub: "Temporary residency, permanent residency and your cédula, prepared by people who do this every week in
Asunción. You show up for the appointments. We do the rest." Existing design direction: split-screen hero +
bento "routes" grid, restrained palette, one accent, system-font feel is acceptable but a display serif is
welcome.

Create ONE canvas with THREE separate pages, each a full desktop artboard (1440 wide) plus a mobile artboard
(390 wide) beside it:

Page 1 (my idea — build this one first): the SERVICE PAGE for "Temporary residency", redesigned around trust.
Above the fold: route name, one-line promise, the fixed-fee statement ("one fixed fee, quoted on your call"),
and the two CTAs. Then a horizontal PROCESS TIMELINE (6–8 steps: call → document checklist by nationality →
apostilles & translations → arrival & appointments in Asunción → filing → card → cédula → RUC) with "who does
what" split between "you" and "us" on each step and a duration slot that reads "typically N weeks — confirm on
your call". Then a "who files your case" block (team photo placeholders, roles, the weekly cadence, no names
yet), an "what the fee covers / never covers / what you pay the state" three-column card, an FAQ, and an inline
short lead form (name, email, nationality) next to a WhatsApp button. Design a variant of the timeline that
still reads well with zero photography.

Pages 2 and 3: you choose two more pages from this list and design them in the same system: home page, /pricing
(no real numbers exist yet — every figure must be a placeholder chip reading "from — · quoted on your call"),
/guides index (a crawlable listing of ~8 articles across four hubs: documents, taxes, living in Paraguay,
comparisons), /route-finder quiz + result page, /book.

Rules: no legal or financial number anywhere unless it is visibly a placeholder chip; every claim about law
looks hedged ("confirm current thresholds on your call"); a footer that cross-links the sister brands (Paraguay
Investor Pass, Paraguay Residency Guide, Paraguay Frontier, Residencia Paraguay (.es), Vida no Paraguai,
Flytta till Paraguay); WCAG AA contrast; the mobile artboard is not an afterthought. Name each page clearly.
```

## 2 — paraguayinvestorpass.com (brand "Paraguay Investor Pass")

```
You are designing for Paraguay Investor Pass (paraguayinvestorpass.com), the premium sister brand of a
Paraguay residency service. Product: the Investor Pass — direct permanent residency in Paraguay through a
qualifying investment (launched April 2026; four routes: real estate, productive business, financial
instruments, tourism). Audience: investors, family offices, migration agents; different ticket size than the
standard route. Business model: lead-gen — an "investor inquiry" form and a call; the same Asunción team
structures the investment, files, and stays until the permanent card is issued. Voice: precise, calm,
skeptical of hype; every threshold is "quoted on your call" because the program's figures are new and still
moving (public sources disagree). Hero H1 in use: "Permanent residency in Paraguay, in one step." Sub: "The
Investor Pass lets qualifying investors skip temporary residency entirely. We structure the investment, file
the application and stay with you until the permanent card is in your hand." Existing direction: big-type
editorial, dark-first, one gold-ish accent, generous whitespace, feels like a private-bank brochure rather than
a "golden visa" landing page.

Create ONE canvas with THREE separate pages, each a 1440-wide desktop artboard plus a 390-wide mobile artboard:

Page 1 (my idea): the COMPARISON PAGE "Investor Pass vs standard residency". Angle from the brand plan: "the
Pass buys time, not a different outcome — here is when the time is worth the money." Design a side-by-side
ledger (standard route vs Investor Pass) over rows: time to permanent card, capital tied up, presence
requirements, exit options, who it suits; every figure a placeholder chip "confirm on your call". Below it a
"four qualifying routes" section as four editorial cards with a one-line "who this fits", then a decision
prompt ("If you have the capital and want the card this year → inquire. If not → the standard route, same team"
linking to the hub), and an investor-inquiry form with only four fields (name, email, investment range as a
select, message) plus a "prefer a call" link.

Pages 2 and 3: choose two from: home page, /investor-pass/routes (the four routes in depth), /about (the team,
how fees work, why a separate brand), /insights index (six long-form articles listing), /contact.

Rules: no investment threshold, fee or timeline as a real number — placeholder chips only; hedged language
visible in the design; footer cross-links to the sister brands (Paraguay Residency — the hub, Paraguay
Residency Guide, Paraguay Frontier, Residencia Paraguay, Vida no Paraguai, Flytta till Paraguay); AA contrast
on the dark theme; no stock "handshake" imagery — architectural and landscape placeholders only. Name each page.
```

## 3 — paraguayresidencyguide.com (brand "Paraguay Residency Guide")

```
You are designing for Paraguay Residency Guide (paraguayresidencyguide.com), the low-ticket entry brand of a
Paraguay residency service group and the ONLY brand that sells online. Products: "The Paraguay Residency
Guide" — a $7 PDF (12 chapters: why Paraguay and why not, routes compared, documents by nationality, real
costs, week-by-week timeline, cédula & RUC, banking, taxes, family, Investor Pass overview, mistakes we see
monthly, checklists), instant download, 12 months of updates, 14-day refund; and "Paraguay Residency Insider",
a monthly membership (member area with lessons, monthly deep dives, resources, an updates feed). Buyers get a
magic-link login (no password). Funnel: after buying, the thank-you page upsells a call with the team that
wrote it (sister brand Paraguay Residency) and the Insider membership. Voice: plain, honest, "we did this
ourselves"; the hero H1 in use is "The Paraguay residency guide we wish existed before we did it ourselves."
Sub: "Every step, document, cost and mistake, written down once, kept current. Read it in an evening. Decide
with real numbers." Offer line: "Instant PDF · free updates for 12 months · 14-day refund, no questions."
Existing direction: single long-form sales page, warm light theme, big type, book-like.

Create ONE canvas with THREE separate pages, each a 1440-wide desktop artboard plus a 390-wide mobile artboard:

Page 1 (my idea): the MEMBER AREA — /members dashboard and one lesson view, designed so paid content feels
worth more than the free blog. Dashboard: tier badge (Entry / Insider), "continue where you left off", modules
in order with per-lesson checkmarks, locked Insider modules shown as an honest upgrade card (no fake blur),
dripped modules with an "opens on <date>" state, a resources shelf (PDF downloads), and the monthly updates
feed. Lesson view: reading-optimised column, chapter progress, prev/next, "mark complete", inline "fact" callouts
styled as verified/unverified pills (this site renders every legal figure through a fact component that shows a
verification state), and a quiet "book a call with the team" exit. Show both tiers: one artboard as an Entry
member, one as an Insider.

Pages 2 and 3: choose two from: the sales home page (long-form, price read from a chip "$7"), /insider (the
membership sales page — what changes monthly, sample deep dive, price chip, FAQ, refund policy), /blog index,
/thank-you (download + magic-link note + the two upsells), /login (magic link only).

Rules: price chips are placeholders ("$7", "$9/mo") that the build reads live; no legal/financial figure as a
literal outside a fact pill; footer cross-links the sister brands (Paraguay Residency — the hub, Paraguay
Investor Pass, Paraguay Frontier, Residencia Paraguay, Vida no Paraguai, Flytta till Paraguay); AA contrast; a
"who wrote this" trust block with photo placeholders. Name each page.
```

## 4 — paraguayfrontier.com (brand "Paraguay Frontier")

```
You are designing for Paraguay Frontier (paraguayfrontier.com), an English-language sister brand of a Paraguay
residency service, aimed at Americans, Canadians, Britons and Australians who want OPTIONALITY: a second
residency and a tax ID held in reserve, maybe land or a small business, full-time relocation maybe never. The
reader has seen "Paraguay golden visa" hype and wants the catch stated. Services are the same Asunción team
(temporary → permanent residency, cédula, RUC); lead-gen only, no products. Voice: skeptical, practical,
plain; every tax sentence is hedged (territorial tax explained, never "tax-free"). Hero H1 in use: "A second
residency you can actually get." Sub: "Paraguay grants permanent residency without a million-dollar
investment, a points test or a decade of waiting. We handle the paperwork in Asunción. You decide how much of
your life to move here." Pages that exist: home, /why-paraguay, /routes, /tax, /process, /pricing, /about,
/stories (six long-form articles), /guide (bridge to the $7 guide), contact. No existing visual direction beyond
"not the hub's look" — you define it: think field notebook / ledger / frontier map rather than luxury.

Create ONE canvas with THREE separate pages, each a 1440-wide desktop artboard plus a 390-wide mobile artboard:

Page 1 (my idea): the /tax page as a "what territorial tax does and does not do" EXPLAINER, designed for a
reader who distrusts the topic. Structure: a plain-language definition panel; a two-column "generally outside
Paraguay's reach / still your problem at home" ledger with every line hedged ("we say exactly what this does
and does not cover — confirm with your adviser"); a "presence rules, stated plainly" strip; a "Plan B ledger"
card (residency card + tax ID held in reserve, what it costs to keep, what breaks if you never show up); a
short "common misreadings" list; then the CTA pair (route-finder quiz, book a call) and a short lead form with
a WhatsApp alternative. Every number is a placeholder chip with a verified/unverified state.

Pages 2 and 3: choose two from: home page, /routes (land / business / nothing-at-all compared for people who
may never live here full-time), /stories index, /process, /about.

Rules: never the words "tax-free"; no legal or financial figure as a literal; hedges visible in the design;
footer cross-links the sister brands (Paraguay Residency — the hub, Paraguay Investor Pass, Paraguay
Residency Guide, Residencia Paraguay, Vida no Paraguai, Flytta till Paraguay); AA contrast; works without
photography (illustrated maps/diagrams welcome). Name each page.
```

## 5 — residenciaparaguay.es (brand "Residencia Paraguay", Spanish)

```
Estás diseñando para Residencia Paraguay (residenciaparaguay.es), la marca en español de un servicio de
residencia en Paraguay. Público: España primero (el dominio), después Latinoamérica hispanohablante
(Argentina sobre todo). Motivos: presión fiscal, coste de vida, sin barrera de idioma, jubilados y
autónomos. Diferenciadores frente a la marca inglesa: la ruta Mercosur para nacionales de la región y el
ángulo de salida fiscal de España, ambos siempre con reservas ("confírmalo con tu asesor"). Servicios: el
mismo equipo de Asunción — residencia temporal, permanente, cédula, residencia fiscal / RUC, familia;
honorario fijo por trámite cotizado en euros antes de comprometerse. Captación: formulario, llamada y — muy
importante para este público — WhatsApp como primer canal. H1 en uso: "Residencia en Paraguay, sin vueltas."
Sub: "Residencia temporal, permanente y cédula, tramitadas por un equipo que lo hace cada semana en Asunción.
Tú vienes a las citas. Nosotros hacemos el resto." Páginas existentes: inicio, /residencia/temporal,
/residencia/permanente, /residencia/cedula, /residencia-fiscal, /familia, /mercosur, /pase-inversor (puente a
la marca Investor Pass), /precios, /nosotros, /guias (8 artículos en 4 categorías), contacto. Toda la interfaz
en español de España, tuteo. Dirección visual: cálida, luminosa, mediterránea-asunceña, seria sin ser fría.

Crea UN lienzo con TRES páginas separadas, cada una con un artboard de escritorio (1440) y uno móvil (390):

Página 1 (mi idea): la página /mercosur rediseñada como el diferenciador de la marca, con CONTACTO POR
WHATSAPP PRIMERO. Estructura: qué simplifica de verdad el acuerdo Mercosur y qué sigue igual (dos columnas,
cada línea con reserva visible); "¿tu nacionalidad entra?" como una lista de banderas/países con estado
"consulta"; comparativa ruta Mercosur vs ruta estándar en una tabla con chips de marcador de posición
("confírmalo en tu llamada"); un bloque "quién lleva tu caso" (fotos de equipo como placeholders, cadencia
semanal en Asunción); y un módulo de contacto donde el botón de WhatsApp es el principal (con mensaje
prellenado visible) y el formulario corto (nombre + WhatsApp) es la alternativa, con el formulario completo
plegado. Móvil: el WhatsApp fijo abajo.

Páginas 2 y 3: elige dos de: inicio, /precios (sin cifras reales: cada precio es un chip "desde — · te lo
cotizamos en la llamada"), /guias índice, /residencia-fiscal, /nosotros.

Reglas: ninguna cifra legal, fiscal o de precio como texto real — solo chips de marcador; las reservas
("confírmalo con tu asesor") visibles; pie de página con enlaces a las marcas hermanas (Paraguay Residency —
el hub, Paraguay Investor Pass, Paraguay Residency Guide, Paraguay Frontier, Vida no Paraguai, Flytta till
Paraguay); contraste AA; funciona sin fotografía. Nombra cada página.
```

## 6 — vidanoparaguai.com (brand "Vida no Paraguai", Brazilian Portuguese)

```
Você está desenhando para Vida no Paraguai (vidanoparaguai.com), a marca em português de um serviço de
residência no Paraguai, voltada a brasileiros que pensam numa VIDA no Paraguai, não só num documento — a maior
comunidade estrangeira do país, muito na fronteira (Foz / Ciudad del Este, Pedro Juan) e no cinturão agro.
Motivos: custo de vida, imposto, negócio ou terra, proximidade, Mercosul, ritmo mais calmo. O nome é a
promessa; a residência é o produto que a começa, e toda página termina nela. Serviços: o mesmo time de
Assunção — residência temporária, permanente, cédula, residência fiscal / RUC, família; honorário fixo por
rota, cotado em reais ou dólares antes de decidir. Voz: fala com um vizinho, em "você", sem vender paraíso;
diz em voz alta o que é pior que no Brasil (saúde fora de Assunção, burocracia, estradas) para o resto ser
acreditado; nunca "imposto zero"; "confirme com seu contador" onde for preciso. H1 em uso: "Morar no Paraguai
começa pela residência. Nós cuidamos dela." Páginas existentes: início, /residencia/temporaria, /permanente,
/cedula, /residencia-fiscal, /familia, /mercosul, /custo-de-vida, /investor-pass (ponte), /precos, /sobre,
/guias (9 artigos: documentos, morar no paraguai, impostos, comparativos), contato. WhatsApp é o primeiro canal
de contato. Direção visual: fotográfica e de "vida" (mercado, rua, fronteira, escola, obra) com placeholders
honestos, quente, sem clichê de paraíso tropical.

Crie UM canvas com TRÊS páginas separadas, cada uma com um artboard desktop (1440) e um mobile (390):

Página 1 (minha ideia): a página INÍCIO reconstruída como "uma vida, depois a rota": um hero que mostra a
promessa (morar) e o produto (residência) no mesmo quadro; uma faixa "o que ninguém explica direito" com
quatro cartões (custo de vida, fronteira, negócio/terra, sua declaração no Brasil), cada um levando a um guia;
uma seção "o que é pior que no Brasil" tratada com honestidade visual (não escondida); as rotas de residência
como três cartões com "quem se encaixa"; um bloco "quem cuida do seu caso" (time, cadência semanal em
Assunção, placeholders de foto); e o contato com WhatsApp em primeiro lugar (mensagem pré-preenchida visível),
formulário curto (nome + WhatsApp) como alternativa. Toda cifra é um chip de marcador com estado
verificado/não verificado. No mobile o WhatsApp fica fixo embaixo.

Páginas 2 e 3: escolha duas entre: /custo-de-vida (comparativo qualitativo com uma capital média brasileira,
sem números reais), /mercosul, /precos (chips "a partir de — · cotado na sua conversa"), /guias índice, /sobre.

Regras: nenhuma cifra legal, fiscal ou de preço como texto real — só chips; "imposto zero" nunca aparece, nem
negado num título; rodapé com as marcas irmãs (Paraguay Residency — o hub, Paraguay Investor Pass, Paraguay
Residency Guide, Paraguay Frontier, Residencia Paraguay, Flytta till Paraguay); contraste AA. Nomeie cada
página.
```

## 7 — flyttatillparaguay.se (brand "Flytta till Paraguay", Swedish)

```
Du designar för Flytta till Paraguay (flyttatillparaguay.se), den svenska systersajten till en
residency-tjänst i Paraguay. Det här är grundarens egen historia — en svensk familj som flyttade — och den
enda av sju sajter där "vi" i första person är tillåtet. Målgrupp: svenskar som väger en flytt: skatt vid
utflyttning (väsentlig anknytning, 183-dagarsregeln — alltid "stäm av med en skatterådgivare"), kostnader,
klimat, ett enklare liv. Tjänster: samma team i Asunción — uppehållstillstånd (temporärt → permanent), cédula,
skatteregistrering, familj; fast pris per väg, i kronor, innan du bestämmer dig. Röst: ärlig, utan
skönmålning, säger vad som tar tid och när Paraguay inte är rätt. H1 i bruk: "Vi flyttade till Paraguay. Så
här gör du." Sub: "Uppehållstillstånd, cédula och skatt, förklarat av någon som gjort resan själv — och ett
team i Asunción som sköter pappren åt dig." Sidor som finns: start, /uppehallstillstand, /skatt, /kostnader,
/familj, /var-historia, /process, /priser, /guide (bro till den engelska $7-guiden), /guider (32 artiklar),
/stader (7 stadsprofiler: Asunción, Encarnación, Ciudad del Este, San Bernardino, Luque, Villarrica m.fl.),
kontakt. Visuell riktning: nordiskt lugn, mycket luft, varm men inte tropisk, redaktionell; fotografi från
vardagen (placeholders) hellre än turistbilder.

Skapa EN canvas med TRE separata sidor, var och en som en desktop-artboard (1440) och en mobil-artboard (390):

Sida 1 (min idé): /var-historia + /stader som en KOMBINERAD "resan och platserna"-upplevelse: en tidslinje
för familjens flytt (beslut → Skatteverket → papper → ankomst → cédula → vardag) i första person plural, där
varje steg har en "det här tar tid / det här kostar"-ruta med platshållarchips ("stäm av med rådgivare"),
följt av ett stadsindex: 7 stadskort med klimat/avstånd/"passar dig som…" i kvalitativ form, och ett
"ärligt om vad som är sämre än i Sverige"-block. Avsluta med kontakt: kort formulär (namn + e-post) och
"boka ett samtal", och en tydlig länk till den engelska guiden som "inte redo än"-utgång.

Sida 2 och 3: välj två av: startsidan, /skatt (utflyttning förklarad med synliga förbehåll), /guider-index
(32 artiklar i kategorier), /priser (chips "från — · i kronor, innan du bestämmer dig"), /process.

Regler: inga verkliga siffror för skatt, avgifter, priser eller tider — bara platshållarchips med
verifierad/overifierad status; förbehållen synliga; sidfot som länkar systersajterna (Paraguay Residency —
navet, Paraguay Investor Pass, Paraguay Residency Guide, Paraguay Frontier, Residencia Paraguay, Vida no
Paraguai); AA-kontrast; fungerar utan fotografi. Namnge varje sida.
```
