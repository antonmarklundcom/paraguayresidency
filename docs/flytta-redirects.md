# flyttatillparaguay.se → paraguayresidency app: redirect map

Every public URL `antonmarklundcom/flyttatillparaguay` served (per its
`app/sitemap.ts`, `app/robots.ts` and the routes under `app/`), mapped to its
new path in this app (plan §6.8, §12.4). S15 turns this table into the
per-site 301 map in the registry when `flyttatillparaguay.se` DNS moves over
(plan §6.10 task 4) — this file is the data, not the redirect logic itself.

Complete, not sampled: every route the old site's `app/` directory defined is
listed below, including the one route it explicitly excluded from its own
sitemap (`/tack`).

## Static pages

| Old URL | New URL | Why |
|---|---|---|
| `/` | `/` | Home, same role. |
| `/residency` | `/uppehallstillstand` | The old money page (Anton's own service, priced in EUR) becomes the routes-overview topic page in the consolidated lead-gen model (plan §1.2, §6.8). |
| `/fastigheter` | `/guider/kopa-tomt-som-utlanning` | Land/property buying was never a service this app's plan sells as its own page (§6.8's route list has no property page); the closest surviving content is the ported "buying land as a foreigner" guide. |
| `/livet-i-paraguay` | `/` | The old city-list index has no equivalent index route in the new plan (§6.8 lists only `/stader/[slug]` detail pages, matching how `residency`'s own `/guides/[hub]/[slug]` has no hub-index page either); the home page's "cities" section is the new discovery surface. |
| `/plan-b` | `/var-historia` | The old "why you need a plan B" page is closest in spirit to the personal-story page, which is also where the brand's differentiation argument now lives. |
| `/guider` | `/` | Same reasoning as `/livet-i-paraguay`: no guide-index route exists in the new plan; the home page's "guides" section replaces it. |
| `/om` | `/var-historia` | "About Anton" becomes the (now "vi") personal-story page. |
| `/kontakt` | `/contact` | Shared conversion route keeps its English path on every brand (plan §1.3). |
| `/integritetspolicy` | `/privacy` | Same rule (§1.3). |
| `/villkor` | `/terms` | Same rule (§1.3). |
| `/tack` | `/contact` | The old lead-form thank-you page; the new `LeadForm` shows its success state in place (no separate route, plan §5.2.2), so the closest safe landing is the form itself. |

## City profiles — `/livet-i-paraguay/[stad]` → `/stader/[slug]`

1:1, same slug, per plan §12.4 ("`content/guider/`, `content/stader/` →
`content/flytta/…` on the existing pipeline").

| Old URL | New URL |
|---|---|
| `/livet-i-paraguay/asuncion` | `/stader/asuncion` |
| `/livet-i-paraguay/aregua` | `/stader/aregua` |
| `/livet-i-paraguay/ciudad-del-este` | `/stader/ciudad-del-este` |
| `/livet-i-paraguay/encarnacion` | `/stader/encarnacion` |
| `/livet-i-paraguay/san-bernardino` | `/stader/san-bernardino` |

(`/stader/luque` and `/stader/villarrica` are new pages with no old-site
equivalent — nothing to redirect.)

## Guides — `/guider/[slug]` → `/guider/[slug]`

1:1, same slug, for all 32 ported guides plus the one guide already written
directly on this app (`sa-gar-flytten-till`, which never existed on the old
site — nothing to redirect for it).

| Old URL | New URL |
|---|---|
| `/guider/apostille-och-dokument-fran-sverige` | `/guider/apostille-och-dokument-fran-sverige` |
| `/guider/arrende-och-avkastning` | `/guider/arrende-och-avkastning` |
| `/guider/bygga-hus-kostnad-och-process` | `/guider/bygga-hus-kostnad-och-process` |
| `/guider/cedula-processen` | `/guider/cedula-processen` |
| `/guider/darfor-behover-du-en-plan-b` | `/guider/darfor-behover-du-en-plan-b` |
| `/guider/dejting-och-relationer-som-svensk` | `/guider/dejting-och-relationer-som-svensk` |
| `/guider/driva-bolag-fran-paraguay` | `/guider/driva-bolag-fran-paraguay` |
| `/guider/dubbelt-boende-sverige-paraguay` | `/guider/dubbelt-boende-sverige-paraguay` |
| `/guider/efter-beviljad-residency-nasta-steg` | `/guider/efter-beviljad-residency-nasta-steg` |
| `/guider/en-vanlig-dag-i-paraguay` | `/guider/en-vanlig-dag-i-paraguay` |
| `/guider/fallgropar-vid-markkop` | `/guider/fallgropar-vid-markkop` |
| `/guider/flytta-till-paraguay-med-familj` | `/guider/flytta-till-paraguay-med-familj` |
| `/guider/klimat-och-arstider` | `/guider/klimat-och-arstider` |
| `/guider/kopa-tomt-som-utlanning` | `/guider/kopa-tomt-som-utlanning` |
| `/guider/kottkultur-och-asado` | `/guider/kottkultur-och-asado` |
| `/guider/lara-sig-spanska-och-guarani` | `/guider/lara-sig-spanska-och-guarani` |
| `/guider/levnadskostnader-paraguay` | `/guider/levnadskostnader-paraguay` |
| `/guider/markpriser-per-region` | `/guider/markpriser-per-region` |
| `/guider/narproducerat-och-matkvalitet` | `/guider/narproducerat-och-matkvalitet` |
| `/guider/oppna-bankkonto-i-paraguay` | `/guider/oppna-bankkonto-i-paraguay` |
| `/guider/paraguay-vs-alternativen` | `/guider/paraguay-vs-alternativen` |
| `/guider/permanent-vs-temporar-residency` | `/guider/permanent-vs-temporar-residency` |
| `/guider/residency-i-paraguay-komplett-guide` | `/guider/residency-i-paraguay-komplett-guide` |
| `/guider/residency-krav-och-dokument` | `/guider/residency-krav-och-dokument` |
| `/guider/residency-tidslinje-och-kostnad` | `/guider/residency-tidslinje-och-kostnad` |
| `/guider/sakerhet-i-paraguay-arligt` | `/guider/sakerhet-i-paraguay-arligt` |
| `/guider/sjukvard-och-forsakring` | `/guider/sjukvard-och-forsakring` |
| `/guider/skattehemvist-och-183-dagarsregeln` | `/guider/skattehemvist-och-183-dagarsregeln` |
| `/guider/skattesystemet-i-paraguay-10-10-10` | `/guider/skattesystemet-i-paraguay-10-10-10` |
| `/guider/ta-med-pengar-och-vaxla` | `/guider/ta-med-pengar-och-vaxla` |
| `/guider/vad-du-inte-flyr-ifran` | `/guider/vad-du-inte-flyr-ifran` |
| `/guider/vanliga-misstag-residency` | `/guider/vanliga-misstag-residency` |

## Not carried over

`/api/lead` was the old site's own form-submission endpoint, not a public
page — no redirect needed; the new site's lead capture is
`src/app/actions/lead.ts` (shared O2 machinery, off-limits to this phase,
plan §4.7).
