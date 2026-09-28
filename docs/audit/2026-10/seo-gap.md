# SEO gap and new-page plan per market (2026-10)

Research date: 2026-09-28. Opus 5.5 subagent, read-only. Companion to `competitors.md`.

**Sources.** Google autocomplete per locale (pt-BR/br, es/es, es-419/ar, en/gb, en/us, sv/se), 1,600+ unique
suggestions harvested with alphabet expansion on the head terms. Also: competitor sitemaps and article slugs
(movetoparaguay ×4 languages, paraguailivre, paraguaysovereign, residenciaparaguay.com, moveparaguay, paraguaidigital,
invertirenasuncion), WebSearch SERPs (US index), and our own `content/<brand>/**/*.mdx`. Google, Bing and DDG SERPs
(so "People also ask" and related searches) are CAPTCHA-walled for automation, so question phrasings come from
autocomplete, which surfaces the same questions.

**Volume tiers are estimates, not tool numbers.** **H** = a head term with many autocomplete branches and a crowded SERP.
**M** = a distinct suggestion with several variants. **L** = a single deep suggestion or niche. Validate the P1 rows in
Search Console once the domains resolve (see §0).

**Priority** = impact (1–5) ÷ effort (1–5, 1 = easy). **P1** = impact 5, or impact ≥ 4 with a ratio ≥ 2. **P3** = impact ≤ 2.
Everything else is **P2**. Within each band, pages are ordered by ratio.

**Content rules that apply to every page below** (CLAUDE.md, plan §1.10): no legal or financial number typed into MDX.
Figures come from `<Fact k>` and `{{fact:key}}`, which means new `facts.ts` keys for most tax, pension and fee pages (with a `sourced`
block so they render). Every tax page carries the brand's hedge ("confirme com seu contador" / "confírmalo con tu
asesor" / "stäm av med en skatterådgivare"). "Imposto zero" / "tax-free" never appears.

---

## 0. Fix first: nothing ranks if the site doesn't resolve

| # | Fix | Brands | Severity |
|---|---|---|---|
| T1 | **Create the DNS zones** for `paraguayresidency.co.uk` and `paraguayinvestorpass.com` (both SERVFAIL: the dns-parking nameservers refuse the zone), and for `vidanoparaguai.com` and `flyttatillparaguay.se` (NXDOMAIN). Then check hPanel domain attachment and SSL | hub, investorpass, PT, SV | P0 |
| T2 | **The ES homepage is served stale from the Hostinger CDN** (`age` 3.6 days, `s-maxage=31536000`). It points to a CSS chunk that now 404s, so the page renders unstyled. Purge the CDN, add "purge CDN" to the deploy steps in `docs/runbook.md`, and stop giving HTML a one-year `s-maxage` (short `s-maxage` + `stale-while-revalidate`, as the guide homepage already does) | residenciaes (and any brand after a deploy) | P0 |
| T3 | **Set `NEXT_PUBLIC_WHATSAPP_NUMBER` and rebuild.** There are zero `wa.me` links on any live brand today. Then add a sticky mobile bar (WhatsApp + route finder) | all | P0 (conversion) |
| T4 | Footer and sibling links point at the dead hub and Investor Pass domains, so they're broken for users and crawlers until T1 is done | all live brands | P0 (fixed by T1) |

## 0b. On-page and technical fixes seen on the live sites

1. **Breadcrumbs skip the hub level.** The article JSON-LD and visual breadcrumb are `Inicio › <article>` (2 items), e.g. `/guias/documentos/cuanto-cuesta-la-residencia-en-paraguay`. Emit `Inicio › Guías › Documentos › <article>` so `/guias` and every hub index get a link from each article. This is the cheapest internal-linking gain on the whole platform (`src/lib/article-page.tsx`).
2. **Hub index pages have template meta** ("Explore nossos guias sobre documentos no Paraguai, com orientações…" and "Artigos sobre documentos."). Give each hub a unique title, a 60–120-word intro and a unique description. They are the natural head pages for "impostos no paraguai", "vivir en paraguay" and similar.
3. **Publish prices.** Every `pricing.*` fact is hedged, so our service pages can't be quoted by AI answers or compared in SERPs, while competitors put "US$ 999" in the H1. When Anton fills `/admin/facts`, add `Offer` + `PriceSpecification` to the `Service` JSON-LD on each service page and `/precios`, `/precos`, `/priser`, `/pricing`.
4. **Homepage schema is inconsistent across brands.** The ES home emits only `Organization` + `FAQPage`; frontier emits `WebSite`, `Person` and `PostalAddress`. Standardise every service brand's home on `Organization`/`ProfessionalService` (Asunción `PostalAddress`, `areaServed`, `knowsLanguage`, `sameAs`) + `WebSite`. Add `aggregateRating` only when real reviews exist. Never fake it.
5. **ES home title is 69 characters** ("Residencia en Paraguay para Españoles — Temporal, Permanente y Cédula") and will truncate. Try "Residencia en Paraguay para españoles | Temporal y cédula" (≤ 60).
6. **`/pase-inversor` (ES) and `/investor-pass` (PT) are deliberately thin and noindex**, "to avoid competing with paraguayinvestorpass.com". But that brand is English-only and can't rank for "residencia permanente por inversión paraguay", "residencia paraguay por inversion" or "residência por investimento paraguai", which all have real autocomplete volume. Reconsider (Anton's call): make both full, indexable pages in the brand's language that hand investor-grade detail to the `.com`.
7. **ccTLD reality.** `.es` is geo-targeted to Spain and `.co.uk` to the UK; Search Console can't override that. Informational LatAm pages on `.es` can still rank in AR/CO/MX, but more weakly. Write the Spain-first pages first, and don't expect the Argentina pages to outrank `.com.ar` or `.com` gestorías quickly.
8. **Brand-name collision:** autocomplete shows "paraguay residency sa", "paraguay residency sa asunción reviews" and "paraguay residency hub". Paraguay Residency S.A. (`paraguayresidency.com`, SSL expired) owns that brand search. The hub should always pair the name with the domain or a descriptor in titles and Organization schema (`alternateName`: "Paraguay Residency UK"), and claim its own Google Business Profile so reviews don't mix.
9. **Answer-engine surface (keep):** llms.txt, the article template with "La respuesta corta", "Puntos clave", "Fuentes" and bylines is already better than every competitor. Make sure every new page below uses it.

### hreflang between brands: recommendation

Keep plan §1.3: **no hreflang between brands.** hreflang only works between equivalent pages, and ours are
deliberately not translations (different audiences, different angles, ccTLD geo-targets). Google ignores mismatched
pairs, and pairing `.es` with `.com.br`-style audiences would ask it to swap pages that answer different questions.
Get the benefit another way: give each service brand's header or footer a plain **language switch** that links sibling brand
*homepages* ("Português · Español · Svenska · English"), and link one brand to another inside an article only where the
angle really differs (for example, the ES Investor Pass explainer links to `paraguayinvestorpass.com` for the investor-grade
detail). Revisit only if Search Console shows two brands competing for the *same* query in the *same* country. Right now none of them target the same country.

---

## 1. `residenciapt` — vidanoparaguai.com (pt-BR, Brazil) — 25 pages

**Existing (10):** rotas de residência · apostilamento e tradução · antecedentes e Interpol · impostos no Paraguai e a
declaração no Brasil · custo de vida · fronteira CDE/Foz · saúde e escola · segurança · Paraguai vs Portugal · Paraguai vs
Uruguai. Service pages: `/residencia/{temporaria,permanente,cedula}`, `/residencia-fiscal`, `/mercosul`, `/familia`,
`/custo-de-vida`, `/precos`, `/processo`, `/documentos/lista`, `/investor-pass`, `/sobre`.
**Benchmark:** paraguailivre.com has ~100 PT articles. That is the bar.

### What Brazilians search (autocomplete, pt-BR/br)

| Cluster | Queries (verbatim suggestions) | Tier | We have |
|---|---|---|---|
| Morar | morar no paraguai · …vale a pena · …é bom ou ruim · …é seguro · …2026 · …sendo brasileiro · …legalmente · como é morar no paraguai hoje · morar no paraguai ou no brasil / ou argentina / ou uruguai / ou portugal · desvantagens / pontos negativos de morar no paraguai · morar no paraguai ganhando em real · …e trabalhar no brasil | H | partial (custo de vida, segurança) |
| Residência | residência no paraguai · como tirar residência no paraguai · quanto custa residência no paraguai · residência temporária paraguai valor · documentos para residência no paraguai · residência mercosul paraguai · residência precária / provisória paraguai · fila / mutirão residência paraguai · ratinho residência paraguai (news) | H | rotas, docs (no step-by-step, no cost page) |
| Residência fiscal | residência fiscal paraguai · …morando no brasil · …para brasileiros · …vale a pena · …quanto custa · …reddit · declaração de saída definitiva paraguai · como declarar residência no paraguai | M, rising | impostos + declaração (1 page) |
| Cédula / cidadania | cédula paraguaia como tirar · …valor · …para brasileiros · mutirão cédula paraguaia · cidadania paraguaia (valor, por casamento, por descendência, vantagens, entra nos EUA) | M | service page only |
| Custo / dinheiro | custo de vida no paraguai (em reais, vs brasil, 2026) · quanto custa morar em assunção · salário mínimo paraguai em reais · transferir dinheiro do brasil para o paraguai · abrir conta no paraguai (com pix, com passaporte, sendo brasileiro, como turista, online) · conta bancária no paraguai tem pix | H/M | custo de vida only |
| Negócios / impostos | abrir empresa no paraguai (sendo brasileiro, morando no brasil, vale a pena, ou uruguai) · empresa no paraguai pode prestar serviço no brasil · empresa no paraguai tem cnpj · mei no paraguai / existe mei no paraguai · imposto no paraguai 10 10 10 · impostos no paraguai como funciona · imposto no paraguai vs brasil · dupla tributação brasil paraguai | M | none |
| Aposentado | aposentado brasileiro no paraguai · aposentado pode morar no paraguai · aposentadoria brasileira receber no paraguai · visto de aposentado no paraguai | M | none |
| Carro | carro brasileiro no paraguai · …pode rodar · vou morar no paraguai posso levar meu carro · legalizar / emplacar carro brasileiro no paraguai · vender carro brasileiro no paraguai | M | none |
| Cidades | melhores cidades para morar no paraguai · onde morar no paraguai para brasileiros · morar em assunção / encarnación / ciudad del este / pedro juan caballero / luque · melhor bairro assunção | M | CDE/Foz only |
| Saúde / escola / estudo | plano de saúde paraguai (valor, unimed) · saúde pública no paraguai · escola brasileira no paraguai · escola internacional · **medicina no paraguai (valor, vale a pena, vale no brasil, quantos anos)** · faculdade no paraguai | H (medicina) / M | saúde e escola (1 page) |
| Imóveis / terra | brasileiro pode comprar imóvel no paraguai · comprar terra no paraguai · vale a pena comprar terra no paraguai · aluguel no paraguai (valor, em real) | M | none |
| Trabalho | trabalhar no paraguai (vale a pena, precisa de visto, recebe em dólar) · salário mínimo paraguai 2026 em reais | H (low intent) | none |

Brazil angles no competitor covers together: Declaração/Comunicação de Saída Definitiva do País, the income-tax reform
(Lei 15.270/2025 appears in competitor snippets; verify before citing), Pix-compatible accounts, INSS paid in Paraguay,
Brazilian-plated cars, and medical students needing residency.

### New pages, ranked

New hubs needed: **`negocios`** and **`cidades`**. Each needs a content folder, a label in
`src/app/(pt)/sites/residenciapt/guias/page.tsx` and `[hub]/page.tsx`, a `HUB_SERVICE` entry in `[hub]/[slug]/page.tsx`
(`negocios` → `/residencia-fiscal`, `cidades` → `/residencia/temporaria`) and a line in `src/lib/seo-files.ts`.

| # | Slug (URL) | Target query (+ variants) | Intent | Type | Receives internal links from | I/E | Prio |
|---|---|---|---|---|---|---|---|
| 1 | `/guias/documentos/como-tirar-residencia-no-paraguai` | como tirar residência no paraguai · como morar no paraguai legalmente · solicitar residência temporária | Informational → commercial | Article (answer-first, numbered steps, CTA to service) | Home "rotas" block, `/residencia/temporaria`, `/mercosul`, `/processo`, rotas article, all `documentos` articles | 5/2 | **P1** |
| 2 | `/guias/documentos/quanto-custa-a-residencia-no-paraguai` | quanto custa residência no paraguai · residência temporária paraguai valor · custo residência paraguai | Commercial | Article with cost table (gov fees via `<Fact>`, our fixed fee via `pricing.*`, in R$ and US$) | `/precos` (top), home, #1, `/residencia/temporaria`, custo-de-vida article | 5/2 | **P1** |
| 3 | `/guias/morar-no-paraguai/vale-a-pena-morar-no-paraguai` | morar no paraguai vale a pena · é bom ou ruim · vantagens e desvantagens · desvantagens de morar no paraguai | Informational (decision stage) | Article: honest pros/cons (brand voice: say what is worse than Brazil) | Home hero secondary link, `/custo-de-vida`, segurança, saúde e escola, #4 | 5/2 | **P1** |
| 4 | `/guias/impostos/residencia-fiscal-no-paraguai-morando-no-brasil` | residência fiscal paraguai morando no brasil · …para brasileiros · …vale a pena · …quanto custa | Commercial, high value | Article with a clear "what it can and can't do" box, strongly hedged, CTA to `/residencia-fiscal` | `/residencia-fiscal`, impostos article, #7, #10, #20 | 5/3 | **P1** |
| 5 | `/guias/comparativos/morar-no-paraguai-ou-no-brasil` | melhor morar no paraguai ou no brasil · morar no paraguai é melhor que no brasil · custo de vida paraguai vs brasil · imposto paraguai vs brasil | Informational | Comparison (table: custo, impostos, segurança, saúde, burocracia) | `/guias/comparativos` hub, #3, custo-de-vida, #10 | 4/2 | **P1** |
| 6 | `/guias/morar-no-paraguai/aposentado-brasileiro-no-paraguai` | aposentado brasileiro no paraguai · aposentado pode morar no paraguai · receber aposentadoria/INSS no paraguai · visto de aposentado | Commercial (high-value segment) | Article + route recommendation box | Home "para quem" block, `/familia`, `/residencia/permanente`, #3, saúde e escola | 4/2 | **P1** |
| 7 | `/guias/morar-no-paraguai/abrir-conta-bancaria-no-paraguai` | abrir conta no paraguai · …com pix · …com passaporte brasileiro · …sendo brasileiro · …como turista | Informational → commercial (needs a cédula) | Article: which banks, which documents, why the cédula comes first | `/residencia/cedula`, #1, #13, #18 | 4/2 | **P1** |
| 8 | `/guias/impostos/como-funcionam-os-impostos-no-paraguai` | imposto no paraguai como funciona · impostos paraguai 10 10 10 · impostos no paraguai para empresas · imposto no paraguai é mais barato | Informational | Explainer (IRP, IRE, IVA, all via `<Fact>`), links out to the BR-declaration article | `/residencia-fiscal`, impostos hub, #4, #5, #16 | 4/2 | **P1** |
| 9 | `/guias/cidades/melhores-cidades-para-morar-no-paraguai` | melhores cidades para morar no paraguai · onde morar no paraguai para brasileiros · lugares bons para morar | Informational | Hub-style listicle, one section per city, linking #17, #18, #24 and the CDE/Foz article | Home, `/custo-de-vida`, #3, fronteira article | 4/2 | **P1** |
| 10 | `/guias/documentos/cedula-paraguaia-para-brasileiros` | cédula paraguaia como tirar · …valor · …para brasileiros · mutirão cédula · cédula de identidade paraguaia | Informational (how-to) that sells the service | Article (how-to) → `/residencia/cedula` (done-for-you) | `/residencia/cedula`, #1, #7 | 3/1 | P2 |
| 11 | `/guias/impostos/saida-definitiva-do-pais-para-quem-vai-ao-paraguai` | declaração de saída definitiva paraguai · comunicação de saída definitiva · como declarar residência no paraguai | Informational, Brazil-unique | Article, hedged ("confirme com seu contador"), timeline box | #4, impostos article, `/residencia-fiscal` | 4/3 | P2 |
| 12 | `/guias/negocios/abrir-empresa-no-paraguai-sendo-brasileiro` | abrir empresa no paraguai · …sendo brasileiro · …morando no brasil · …vale a pena · …ou uruguai | Commercial | Article (EAS vs SRL, RUC, what residency changes) | new `negocios` hub, `/residencia-fiscal`, #8, #16 | 4/3 | P2 |
| 13 | `/guias/morar-no-paraguai/medicina-no-paraguai-e-a-residencia` | medicina no paraguai · …vale a pena · …valor · faculdade no paraguai · residência para estudante | Informational; a new segment (students and parents) | Article: the residency side of studying there (student residency, family, cédula). Revalida hedged | #9, #17, #24, saúde e escola, `/familia` | 4/3 | P2 |
| 14 | `/guias/documentos/cidadania-paraguaia-para-brasileiros` | cidadania paraguaia · …valor · …por casamento · …para brasileiros · …vantagens | Informational (long-term) | Article: residency → permanent → naturalisation path | `/residencia/permanente`, #1, #22 | 3/2 | P2 |
| 15 | `/guias/morar-no-paraguai/carro-brasileiro-no-paraguai` | carro brasileiro no paraguai · …pode rodar · posso levar meu carro · legalizar / emplacar | Informational (movers) | Article, hedged, with a "for residents vs for tourists" box | #3, #9, fronteira article, `/processo` | 3/2 | P2 |
| 16 | `/guias/comparativos/paraguai-ou-argentina-para-morar` | morar no paraguai ou argentina · melhor morar no paraguai ou na argentina | Informational | Comparison | comparativos hub, #5, Portugal/Uruguai comparisons | 3/2 | P2 |
| 17 | `/guias/cidades/morar-em-assuncao` | morar em assunção · quanto custa morar em assunção · melhor bairro para morar em assunção | Informational | City guide (bairros, aluguel via `<Fact>`, escolas, clínicas) | #9, `/custo-de-vida`, #7 | 3/2 | P2 |
| 18 | `/guias/cidades/morar-em-encarnacion` | morar em encarnación · aluguel encarnación | Informational | City guide | #9, #13 | 3/2 | P2 |
| 19 | `/guias/morar-no-paraguai/transferir-dinheiro-do-brasil-para-o-paraguai` | transferir dinheiro do brasil para o paraguai · como transferir meu dinheiro · real, dólar e guarani | Informational (affiliate potential) | Article | #7, #6, custo-de-vida | 3/2 | P2 |
| 20 | `/guias/morar-no-paraguai/comprar-imovel-ou-terra-no-paraguai` | brasileiro pode comprar imóvel no paraguai · comprar terra no paraguai · vale a pena comprar terra | Commercial (agro and investor) | Article; bridge to `/investor-pass` (real-estate route) | `/investor-pass`, #12, #9 | 3/2 | P2 |
| 21 | `/guias/negocios/empresa-paraguaia-prestando-servicos-para-o-brasil` | empresa no paraguai pode prestar serviço no brasil · empresa no paraguai tem cnpj · exportar serviços | Commercial (PJ/freelancers) | Article, strongly hedged | #12, #8, #4 | 3/3 | P2 |
| 22 | `/guias/documentos/residencia-precaria-no-paraguai` | residência precária paraguai · residência provisória · protocolo de residência | Informational | Short explainer (what you hold while the file is processed) | #1, #10, `/residencia/temporaria` | 2/1 | P3 |
| 23 | `/guias/negocios/existe-mei-no-paraguai` | mei no paraguai · existe mei no paraguai · abrir mei no paraguai | Informational | Short explainer (the Paraguayan small-taxpayer regimes via `<Fact>`) | #12, #8 | 2/1 | P3 |
| 24 | `/guias/cidades/morar-em-pedro-juan-caballero` | morar em pedro juan caballero · fronteira ponta porã | Informational | City guide (twin of the CDE/Foz article) | #9, fronteira article | 2/2 | P3 |
| 25 | `/guias/morar-no-paraguai/plano-de-saude-no-paraguai` | plano de saúde paraguai · …valor · unimed paraguay · saúde pública no paraguai é boa | Informational | Split out of "saúde e escola" (keep that one as the overview) | saúde e escola, #6, #17 | 2/2 | P3 |

Optional extras: `trabalhar-no-paraguai-e-salario-minimo` (H volume, low intent), `escolas-brasileiras-no-paraguai`,
and a timely news explainer on the Ciudad del Este application queues ("fila / mutirão residência paraguai").
**Also:** consider making `/investor-pass` an indexable pt-BR page ("residência por investimento paraguai", "residência permanente
por investimento"). Today it is deliberately thin and noindex; see §0b.6.

---

## 2. `residenciaes` — residenciaenparaguay.es (es; Spain first, then LatAm) — 20 pages

**Existing (26):** 6 comparisons (vs Argentina, España, Portugal, Uruguay; Mercosur vs temporal; Investor Pass),
12 documentos (4 nationality pages: argentinos, colombianos, españoles, mexicanos; cost; step-by-step; permanente 2026;
cédula; antecedentes ×2; requisitos; rutas), 4 impuestos (tabla 2026, irse de España, RUC, territorial), 4 vivir
(banco, costo de vida, jubilarse (españoles), salud).

### What Spanish speakers search (autocomplete, es/es + es-419/ar)

| Cluster | Queries | Tier | We have |
|---|---|---|---|
| Residencia | residencia en paraguay (requisitos, para extranjeros, 2025) · residencia paraguay precio · residencia temporal paraguay (requisitos, costo, migraciones) · residencia temporal a permanente paraguay · prórroga / renovación residencia · residencia permanente paraguay (requisitos, mercosur, suace, por inversión) · tipos de residencia en paraguay · carnet de residencia temporal | H | strong |
| **Por nacionalidad** | residencia en paraguay para **argentinos · venezolanos · colombianos · mexicanos · chilenos · peruanos · uruguayos · bolivianos · ecuatorianos · cubanos · españoles** · requisitos para vivir en paraguay siendo X · emigrar a paraguay desde X · vivir en paraguay siendo X | M each (AR, VE highest) | 4 of 11, titled for "documentos y apostillas", not for "residencia para X" |
| Fiscal | residencia fiscal paraguay (requisitos, reddit) · residencia fiscal paraguaya para argentinos · residencia fiscal en paraguay para españoles · impuestos paraguay (10 10 10, vs argentina, extranjeros, cripto) · cambiar residencia fiscal paraguay · certificado residencia fiscal | H/M | territorial, tabla, irse de España |
| Vivir | vivir en paraguay (es barato, es seguro, opiniones, reddit, forocoches) · vale la pena vivir en paraguay · lo malo / desventajas de vivir en paraguay · mejores lugares / ciudades / barrios para vivir en paraguay/asunción · vivir en paraguay siendo español / pensionista español · irse a vivir a paraguay | H | costo de vida only |
| Jubilados | jubilarse en paraguay (siendo español) · jubilados argentinos en paraguay · vivir jubilado en paraguay · jubilados españoles en paraguay | M | jubilarse (españoles) |
| Ciudadanía | ciudadanía / nacionalidad paraguaya (requisitos, para extranjeros, por matrimonio, para argentinos, para españoles, beneficios) | M | none |
| Empresa y trabajo | abrir empresa en paraguay (siendo extranjero, siendo argentino, EAS, unipersonal) · cuánto cuesta abrir una empresa · trabajar en paraguay (siendo argentino) · autónomos paraguay | M | RUC only |
| Casa | comprar casa en paraguay (desde España, en euros, siendo extranjero, Asunción, Encarnación) · alquilar en Asunción | M | none |
| Comparativas | costo de vida paraguay vs argentina / chile / colombia / perú · paraguay o uruguay para vivir · es mejor vivir en paraguay o argentina | M | vs AR, vs UY |
| Other | cuenta bancaria paraguay (para extranjeros, no residentes) · cédula paraguaya para extranjeros (requisitos, valor) · "vida y residencia paraguay" (a local police certificate, high volume, mostly Paraguayans: skip unless Migraciones requires it) | M | banco, cédula |

### Upgrades before new pages (no new URLs)

- **Retarget the 4 nationality pages to the head term.** Retitle and expand `documentos-y-apostillas-para-{argentinos,colombianos,espanoles,mexicanos}` to "Residencia en Paraguay para argentinos (2026): requisitos y documentos", ≤ 60 characters, with the apostille content kept as a section. Today they target the long tail and leave "residencia en paraguay para X" to residenciaparaguay.com.
- Consider making `/pase-inversor` a full, indexable page for "residencia permanente por inversión paraguay" (see §0b.6).

### New pages, ranked

New hub: **`por-pais`**. It needs a label in `src/app/(es)/sites/residenciaes/guias/page.tsx` and `[hub]/page.tsx`, a `HUB_SERVICE`
entry (→ `/mercosur` for Mercosur nationals, `/residencia/temporal` otherwise) and `seo-files.ts`. The `/guias/por-pais` index is
itself the nationality selector: link it from the home and `/mercosur`, and cross-link it to the 4 retargeted documentos pages.

| # | Slug (URL) | Target query (+ variants) | Intent | Type | Receives internal links from | I/E | Prio |
|---|---|---|---|---|---|---|---|
| 1 | `/guias/vivir-en-paraguay/vivir-en-paraguay-ventajas-y-desventajas` | vale la pena vivir en paraguay · lo malo de vivir en paraguay · desventajas · vivir en paraguay opiniones | Informational (decision) | Article, honest pros/cons | Home, costo de vida, salud, #8 | 5/2 | **P1** |
| 2 | `/guias/impuestos/residencia-fiscal-paraguaya-para-argentinos` | residencia fiscal paraguaya para argentinos · irse a paraguay ganancias · impuestos paraguay vs argentina | Commercial, high value | Article, hedged (Ganancias/Bienes Personales: "confírmalo con tu contador") | `/residencia-fiscal`, vs-Argentina comparison, argentinos page, #3 | 5/3 | **P1** |
| 3 | `/guias/por-pais/residencia-en-paraguay-para-venezolanos` | residencia en paraguay para venezolanos · requisitos para emigrar a paraguay siendo venezolano · vivir en paraguay siendo venezolano | Commercial | Programmatic by nationality (Venezuela is not on the Mercosur route; apostille and passport issues; verify) | `/guias/por-pais`, `/residencia/temporal`, antecedentes article | 5/3 | **P1** |
| 4 | `/guias/documentos/ciudadania-paraguaya-para-extranjeros` | nacionalidad paraguaya requisitos · ciudadanía paraguaya para extranjeros · por matrimonio · para argentinos / españoles | Informational (long-term) | Article: PR → naturalisation | `/residencia/permanente`, permanente-requisitos, #7 | 4/2 | **P1** |
| 5 | `/guias/vivir-en-paraguay/mejores-lugares-para-vivir-en-paraguay` | mejores lugares / ciudades para vivir en paraguay · mejores barrios para vivir en asunción · dónde vivir en paraguay | Informational | Listicle + barrio guide | Home, costo de vida, #1, #8 | 4/2 | **P1** |
| 6 | `/guias/vivir-en-paraguay/jubilados-argentinos-en-paraguay` | jubilados argentinos en paraguay · vivir jubilado en paraguay · cobrar la jubilación en paraguay | Commercial (segment) | Article + route box (Mercosur) | jubilarse (españoles), `/mercosur`, argentinos page, #2 | 4/2 | **P1** |
| 7 | `/guias/documentos/de-residencia-temporal-a-permanente` | residencia temporal a permanente paraguay · prórroga residencia temporal · renovación residencia permanente · cambio de categoría | Commercial (existing residents, ready to buy) | How-to article → `/residencia/permanente` | `/residencia/permanente`, permanente-requisitos, #4 | 4/2 | **P1** |
| 8 | `/guias/vivir-en-paraguay/vivir-en-paraguay-siendo-espanol` | vivir en paraguay siendo español · emigrar a paraguay desde España · vivir en paraguay siendo pensionista español | Commercial (the core Spain audience) | Hub-style guide for Spaniards linking every Spain page | Home (Spain block), vs-España, irse-de-España, jubilarse, españoles docs page | 4/2 | **P1** |
| 9 | `/guias/por-pais/residencia-en-paraguay-para-chilenos` | residencia en paraguay para chilenos · vivir en paraguay siendo chileno · costo de vida paraguay vs chile | Commercial | Programmatic (Mercosur associate) | `/guias/por-pais`, `/mercosur` | 3/2 | P2 |
| 10 | `/guias/por-pais/residencia-en-paraguay-para-peruanos` | residencia en paraguay para peruanos · vivir en paraguay siendo peruano | Commercial | Programmatic | `/guias/por-pais`, `/mercosur` | 3/2 | P2 |
| 11 | `/guias/por-pais/residencia-en-paraguay-para-uruguayos` | residencia paraguaya para uruguayos · residencia permanente paraguay para uruguayos | Commercial | Programmatic | `/guias/por-pais`, `/mercosur`, vs-Uruguay | 3/2 | P2 |
| 12 | `/guias/por-pais/residencia-en-paraguay-para-bolivianos` | residencia paraguaya para bolivianos · emigrar a paraguay desde bolivia | Commercial | Programmatic | `/guias/por-pais`, `/mercosur` | 3/2 | P2 |
| 13 | `/guias/vivir-en-paraguay/comprar-casa-en-paraguay-siendo-extranjero` | comprar casa en paraguay (siendo extranjero, desde España, en euros) | Commercial | Article; bridge to `/pase-inversor` | #5, #8, `/pase-inversor` | 3/2 | P2 |
| 14 | `/guias/comparativas/costo-de-vida-paraguay-vs-chile-colombia-y-peru` | costo de vida paraguay vs chile / colombia / perú | Informational | Comparison (one table, three columns) | costo de vida, #9, #10, colombianos page | 3/2 | P2 |
| 15 | `/guias/vivir-en-paraguay/trabajar-en-paraguay-siendo-extranjero` | trabajar en paraguay (siendo argentino, extranjero) · vivir y trabajar en paraguay | Informational | Article | #1, #16, `/residencia/temporal` | 3/2 | P2 |
| 16 | `/guias/vivir-en-paraguay/abrir-empresa-en-paraguay-siendo-extranjero` | abrir empresa en paraguay siendo extranjero · EAS paraguay · cuánto cuesta abrir una empresa en paraguay | Commercial | Article (EAS vs SRL, RUC) | RUC article, `/residencia-fiscal`, #17 | 4/3 | P2 |
| 17 | `/guias/impuestos/autonomos-espanoles-en-paraguay` | autónomos paraguay · facturar desde paraguay · dejar de ser autónomo en España | Commercial | Article, hedged (RETA, residencia fiscal) | irse-de-España, #8, #16, `/residencia-fiscal` | 4/3 | P2 |
| 18 | `/guias/impuestos/cuarentena-fiscal-y-convenio-espana-paraguay` | cuarentena fiscal paraguay · convenio doble imposición España Paraguay · residencia fiscal en paraguay para españoles | Commercial, high value | Article. **Verify first** whether Paraguay is on Spain's list of non-cooperative jurisdictions and whether a treaty exists; hedge | irse-de-España, tabla 2026, #17, #8 | 4/3 | P2 |
| 19 | `/guias/por-pais/residencia-en-paraguay-para-ecuatorianos` | residencia en paraguay para ecuatorianos | Commercial | Programmatic | `/guias/por-pais` | 2/2 | P3 |
| 20 | `/guias/por-pais/residencia-en-paraguay-para-cubanos` | residencia en paraguay para cubanos · paraguay da residencia a cubanos | Commercial | Programmatic (visa-required nationality; verify the consular route) | `/guias/por-pais` | 2/3 | P3 |

---

## 3. `residency` — paraguayresidency.co.uk (hub, en-GB) — 10 pages

**Existing (19 guides + service pages):** documents for US/AU/UK/CA/DE/ZA applicants, ACRO, apostilles; Asunción
cost of living; moving from the UK; banking; RUC; territorial tax; UK tax on moving; Paraguay vs Panama and vs Uruguay.
Per the 2026-09-26 amendment, hub articles are UK-adapted and deep global English lives on the guide `.com`.

**Queries (en/gb autocomplete):** paraguay residency (requirements 2026, cost, fee, process, timeline, documents, criminal
record, income requirements, without investment, by bank deposit, agent, agency, lawyer, consultant, services, help, reddit,
uk, from uk) — H/M · paraguay permanent residency (requirements, cost, card, to citizenship) — H · paraguay citizenship (requirements,
cost, after permanent residency, benefits, by marriage) — H · can brits move to paraguay · how to move to paraguay from uk ·
moving to paraguay from uk — M · retire in paraguay (cost, visa requirements) — M · paraguay residency for indians / pakistani
(strong, visa-required) — M · paraguay vs uruguay residency — L.

| # | Slug (URL) | Target query | Intent | Type | Receives links from | I/E | Prio |
|---|---|---|---|---|---|---|---|
| 1 | `/guides/documents/choosing-a-paraguay-residency-agent` | paraguay residency agent / agency / lawyer / consultant / services / help | Commercial (comparison shopping) | Service comparison: agent vs lawyer vs DIY, questions to ask, red flags, what we do | `/pricing`, `/process`, `/about`, home, every service page | 5/2 | **P1** |
| 2 | `/residency/citizenship` | paraguay citizenship · requirements · cost · after permanent residency | Commercial | **Service landing**, only if the team offers naturalisation filings (competitors charge US$5.4k–15k) | `/residency/permanent-residency`, nav, #1 | 4/2 | **P1** |
| 3 | `/guides/living-in-paraguay/uk-state-pension-in-paraguay` | retire in paraguay (UK) · can brits move to paraguay · UK pension abroad | Informational (retiree segment) | Article: frozen-pension rule (verify Paraguay's status), NI contributions, hedged | moving-from-the-UK, UK tax, `/residency/permanent-residency` | 4/2 | **P1** |
| 4 | `/guides/documents/paraguay-residency-with-a-criminal-record` | paraguay residency criminal record · spent convictions ACRO | Commercial (people who fear rejection) | Article, hedged, "talk to us before you apply" CTA | ACRO article, police-certificate article, `/residency/temporary-residency` | 4/2 | **P1** |
| 5 | `/guides/comparisons/paraguay-vs-portugal-for-british-citizens` | paraguay vs portugal residency (post-Brexit) | Informational (decision) | Comparison | comparisons hub, moving-from-the-UK, UK tax | 4/2 | **P1** |
| 6 | `/guides/comparisons/paraguay-vs-dubai-residency` | paraguay vs dubai residency · UK tax exit options | Informational (decision) | Comparison, hedged | comparisons hub, UK tax, #5 | 3/2 | P2 |
| 7 | `/guides/living-in-paraguay/keeping-uk-bank-accounts-after-moving-to-paraguay` | UK bank account after moving abroad · closing accounts of non-residents | Informational | Article | opening-a-bank-account, moving-from-the-UK | 3/2 | P2 |
| 8 | `/guides/taxes/uk-pensions-isas-and-property-after-moving-to-paraguay` | UK ISA/pension/rental income when non-resident | Informational (wealthy movers) | Article, hedged (HMRC, SRT) | UK tax, `/residency/tax-residency` | 3/3 | P2 |
| 9 | `/guides/documents/apostille-and-documents-for-indian-applicants` | paraguay residency for indians · paraguay permanent residency requirements for indians | Commercial (visa-required route) | Programmatic nationality page (same template as the six existing ones; verify the consular-visa step) | documents hub, what-you-need-to-apply | 3/3 | P2 |
| 10 | `/guides/living-in-paraguay/uk-driving-licence-in-paraguay` | uk driving licence paraguay · exchange licence | Informational | Short article | moving-from-the-UK, #7 | 2/1 | P3 |

**Upgrade:** fill `/pricing` with real numbers (it is the money page for "paraguay residency cost / fee / price").

---

## 4. `frontier` — paraguayfrontier.com (en, US/CA/AU plan B) — 8 pages

**Existing (11 stories):** American first 90 days, banking, Canadian and US document chains, cédula and RUC, cost of living, healthcare,
the Interpol myth, land and farms, Paraguay vs Panama/Uruguay/Mexico, presence rules.

**Queries (en/us):** paraguay residency reddit / paraguay permanent residency reddit / paraguay tax residency reddit — M ·
paraguay residency for us citizens / americans · move to paraguay from us — M · can americans retire in paraguay · retire in
paraguay cost — M · does paraguay allow dual citizenship · paraguay passport value — M · paraguay plan b / plan b paraguay cost /
reviews — M · paraguay residency for canadians · can a canadian retire in paraguay — M · moving to paraguay from australia — L ·
is paraguay a tax haven · paraguay territorial tax — M.

| # | Slug (URL) | Target query | Intent | Type | Receives links from | I/E | Prio |
|---|---|---|---|---|---|---|---|
| 1 | `/stories/paraguay-residency-reddit-questions-answered` | paraguay residency reddit · paraguay tax residency reddit | Informational (skeptics) | Article: the recurring threads, answered with sources | home, `/why-paraguay`, presence-rules | 4/2 | **P1** |
| 2 | `/stories/retiring-in-paraguay-on-social-security` | can americans retire in paraguay · retire in paraguay cost | Commercial (retirees) | Article: Social Security abroad, Medicare gap, healthcare (hedged) | healthcare story, cost-of-living, `/routes` | 4/2 | **P1** |
| 3 | `/stories/paraguay-citizenship-and-a-second-passport` | does paraguay allow dual citizenship · paraguay passport value · citizenship after permanent residency | Informational (the plan-B end goal) | Article | presence-rules, `/routes`, cédula-and-RUC | 4/2 | **P1** |
| 4 | `/stories/us-taxes-while-holding-paraguay-residency` | paraguay tax us citizen · FEIE bona fide residence · FBAR/FATCA | Informational, high value | Article, heavily hedged (`<Fact>` + "talk to a US tax pro") | `/tax`, American first 90 days | 4/3 | P2 |
| 5 | `/stories/paraguay-residency-for-canadians` | paraguay residency for canadians · can a canadian retire / move to paraguay | Commercial | Head page for Canadians (the existing doc-chain story becomes its supporting page) | Canadian doc-chain story, `/routes` | 3/2 | P2 |
| 6 | `/stories/moving-to-paraguay-from-australia` | moving to paraguay from australia · australians moving to paraguay | Commercial | Article (links the hub's Australian documents page as the deep dive) | `/routes`, comparisons | 3/2 | P2 |
| 7 | `/stories/paraguay-vs-costa-rica-and-ecuador-for-a-plan-b` | paraguay vs costa rica residency · paraguay vs ecuador | Informational (decision) | Comparison | Panama/Uruguay/Mexico comparison, `/why-paraguay` | 3/2 | P2 |
| 8 | `/stories/the-real-cost-of-holding-a-paraguay-plan-b` | plan b paraguay cost · paraguay residency cost for americans | Commercial | Article: 10-year total cost (visits, renewals, cédula), numbers via `<Fact>` | `/pricing`, presence-rules, #1 | 3/2 | P2 |

---

## 5. `investorpass` — paraguayinvestorpass.com — 5 pages

**Existing:** 8 insights + `/investor-pass/{investment-routes,process,requirements,vs-standard-residency,for-agents}`.
**Queries:** paraguay golden visa (cost, requirements, program) — M/H · paraguay investor pass (residency, resolucion, mic, suace) — M ·
paraguay permanent residency by investment — M · paraguay citizenship by investment — M · residencia permanente paraguay suace (es) — M.

| # | Slug (URL) | Target query | Intent | Type | Receives links from | I/E | Prio |
|---|---|---|---|---|---|---|---|
| 1 | `/insights/paraguay-golden-visa` | paraguay golden visa (cost, requirements, program) | Commercial | Article: "golden visa" = Investor Pass, routes and thresholds via `<Fact>` | home, `/investor-pass/investment-routes`, what-the-investor-pass-is | 5/2 | **P1** |
| 2 | `/insights/investor-pass-vs-suace` | investor pass paraguay suace · residencia permanente paraguay suace | Commercial (route choice) | Comparison | `/investor-pass/vs-standard-residency`, investment-routes, #1 | 4/2 | **P1** |
| 3 | `/insights/paraguay-citizenship-by-investment` | paraguay citizenship by investment | Informational (a misconception to correct) | Short article: no CBI; PR → naturalisation | #1, renewing-and-converting | 4/1 | **P1** |
| 4 | `/insights/financial-instruments-and-tourism-routes` | investor pass stock market / bonds route · tourism investment route | Commercial | Deep dive (the twin of the real-estate route) | investment-routes, real-estate deep dive | 3/2 | P2 |
| 5 | `/insights/investor-pass-resolution-explained` | investor pass paraguay resolucion · MIC | Informational (agents, family offices) | Article, only after the resolution text is obtained (plan §11.4) | `/investor-pass/requirements`, `/investor-pass/for-agents` | 3/3 | P2 |

---

## 6. `flytta` — flyttatillparaguay.se (sv) — 5 pages

**Existing (40):** a strong base (residency, cédula, tax 10/10/10, skattehemvist and 183 days, land, cities ×7, family,
safety, banking, costs). **Queries (sv/se):** "flytta till paraguay" and "bo i paraguay" have tiny volume (single
suggestions); the demand sits in generic emigration queries: flytta utomlands pension (skatt, som pensionär, ta ut pension,
pensionsmyndigheten) — M · flytta från sverige skatteverket (blankett) · utflyttning / avflyttning skatteverket — M ·
flytta utomlands slippa skatt — L/M · väsentlig anknytning (skatteverket, bostad, sambo) — M · paraguay medborgarskap / skatt /
säkerhet — L. The only competitor, moveparaguay.com/sv, is machine-translated and doesn't touch Swedish pensions or Skatteverket.

| # | Slug (URL) | Target query | Intent | Type | Receives links from | I/E | Prio |
|---|---|---|---|---|---|---|---|
| 1 | `/guider/svensk-pension-i-paraguay` | flytta utomlands pension skatt · flytta utomlands som pensionär · ta ut pension utomlands | Commercial (the highest-value SE segment) | Article, hedged (SINK and treaty status via `<Fact>`; verify) | `/skatt`, skattehemvist, levnadskostnader, `/uppehallstillstand` | 4/2 | **P1** |
| 2 | `/guider/anmala-utflyttning-till-skatteverket` | flytta från sverige skatteverket · blankett · utflyttning skatteverket | Informational (practical) | Step-by-step | skattehemvist, sa-gar-flytten-till, #1 | 3/1 | P2 |
| 3 | `/guider/kan-man-slippa-skatt-genom-att-flytta-till-paraguay` | flytta utomlands slippa skatt · paraguay skatt | Informational (an honest answer fits the brand) | Article, links väsentlig anknytning | `/skatt`, skattesystemet 10/10/10, vad-du-inte-flyr-ifran | 3/2 | P2 |
| 4 | `/guider/paraguay-eller-thailand-spanien-for-pensionarer` | flytta utomlands som pensionär (comparison intent) | Informational (decision) | Comparison (extends paraguay-vs-alternativen) | paraguay-vs-alternativen, #1 | 3/2 | P2 |
| 5 | `/guider/paraguayanskt-medborgarskap-och-pass` | paraguay medborgarskap | Informational | Article | permanent-vs-temporar, efter-beviljad-residency | 2/2 | P3 |

---

## 7. Top 10 new pages overall (impact first)

1. PT `/guias/documentos/como-tirar-residencia-no-paraguai`: the step-by-step head term for Brazil's biggest cluster.
2. PT `/guias/documentos/quanto-custa-a-residencia-no-paraguai`: price-led market, highest commercial intent (needs `pricing.*`).
3. PT `/guias/morar-no-paraguai/vale-a-pena-morar-no-paraguai`: the H-volume decision query, a perfect fit for the brand's honest voice.
4. PT `/guias/impostos/residencia-fiscal-no-paraguai-morando-no-brasil`: rising, high value, and nobody answers it carefully.
5. ES `/guias/vivir-en-paraguay/vivir-en-paraguay-ventajas-y-desventajas`: H volume in Spain and LatAm.
6. ES `/guias/impuestos/residencia-fiscal-paraguaya-para-argentinos`: the biggest LatAm buyer segment (Argentines lead applications).
7. ES `/guias/por-pais/residencia-en-paraguay-para-venezolanos` + the `por-pais` hub: opens the nationality programme (6 more follow).
8. Hub `/guides/documents/choosing-a-paraguay-residency-agent`: catches "agent / agency / lawyer" commercial searches.
9. Investor Pass `/insights/paraguay-golden-visa`: the phrase investors actually type.
10. PT `/guias/morar-no-paraguai/aposentado-brasileiro-no-paraguai` (tied with ES `/guias/vivir-en-paraguay/vivir-en-paraguay-siendo-espanol`): the retiree buyers.

Run the PT and ES batches as a Sonnet fan-out (the `fable-directs-sonnet-builds` pattern). Each page is an MDX file with
frontmatter, `related`, FAQ and new `facts.ts` keys. Only the three new hubs (`negocios`, `cidades`, `por-pais`) touch
route files (labels, `HUB_SERVICE`, `seo-files.ts`).
