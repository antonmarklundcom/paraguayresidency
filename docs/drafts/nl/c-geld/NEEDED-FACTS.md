# NEEDED-FACTS (c-geld batch, emigreren)

## 0. Locale note
Every `<Fact>` used in these drafts renders the `en` display until an `nl` display is added to `content/shared/facts.ts` (`FactLocale` has no `nl` yet). Facts used: tax.foreign_income_treatment, tax.territorial_rate, tax.double_tax_treaties, tax.ire_rate, tax.resimple, tax.dividends, tax.iva_rate, tax.residency_certificate, tax.timeline, tax.irp_threshold, ips.contributions, business.eas, company.eas, wages.minimum_monthly, costofliving.overview/rent/monthly_family, fx.reference_rate, customs.cash_declaration, cedula.timeline, residency.timeline, temporary.duration, solvency.requirement, documents.police_certificate_validity, fees.basis, costs.diy_total. Each needs an `nl` display.
Also: article 10 title is 71 chars (mandated title, limit 60); shorten at build if enforced.

## 1. Proposed new facts (stated in words only, no figure, in the drafts)

| Key proposal | Must say | Source |
|---|---|---|
| nl.brp.eight_months_rule | Notify departure to the gemeente when abroad more than 8 of 12 months; notify at least 5 days before leaving; BSN stays, data goes to RNI | https://www.rijksoverheid.nl/onderwerpen/privacy-en-persoonsgegevens/vraag-en-antwoord/uitschrijven-basisregistratie-personen ; https://www.nederlandwereldwijd.nl/brp/wanneer-uitschrijven-gemeente |
| nl.aow.accrual_and_voluntary | AOW accrues 2% per insured year (50 years); voluntary insurance via SVB must be applied for within 1 year after cover ends; requires >=1 year insured directly before leaving; normally max 10 years, exceptions | https://www.svb.nl/nl/vv/wonen-werken-buiten-nederland/voorwaarden-voor-vrijwillig-verzekeren ; https://www.rijksoverheid.nl/onderwerpen/uitkering-meenemen-naar-buitenland/vraag-en-antwoord/bouw-ik-aow-op-als-ik-in-het-buitenland-ga-wonen-of-werken |
| nl.paraguay_tax_treaty | The Netherlands has no income-tax treaty with Paraguay (drafts say "naar ons weten"). Verify against Belastingdienst treaty list | https://www.belastingdienst.nl/wps/wcm/connect/nl/buitenland/content/belastingverdragen (verify) |
| nl.conserverende_aanslag | Conserving assessment on emigration for aanmerkelijk belang (>=5%) and pension/lijfrente rights; deferral of payment generally possible, security usually asked outside EU/EER; conditions change | https://www.belastingdienst.nl/wps/wcm/connect/nl/buitenland/content/conserverende-aanslag-bij-emigratie |
| nl.zvw.emigration | Zvw insurance obligation ends on deregistration for non-EU/EER/treaty countries, unless still working in NL or receiving NL benefit/pension with Zvw levy; no social security treaty NL-Paraguay (verify); after return insure within 4 months | https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/de_zorgverzekeringswet_en_het_buitenland/ ; https://www.nederlandwereldwijd.nl/zorgverzekering-buitenland/check |
| nl.toeslagen.emigration | No huurtoeslag abroad; zorgtoeslag, kinderopvangtoeslag, kindgebonden budget depend on situation; toeslagen do not stop automatically, stop via Mijn toeslagen | https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/wijzigingen_doorgeven/welke_wijzigingen_moet_ik_doorgeven/wonen/ik_verhuis_naar_het_buitenland/ik_verhuis_naar_het_buitenland |
| nl.digid.abroad | DigiD via digid.nl/buitenland, activation via video call with NederlandWereldwijd or counter; SVB route for AOW recipients (post-only code) | https://www.nederlandwereldwijd.nl/digid-buiten-nederland/hoe-aanvragen ; https://www.svb.nl/nl/uitleg-mijnsvb/digid/digid-aanvragen-buiten-nederland-aow |
| banks.py.account_requirements | Documents Paraguayan banks ask foreigners (cedula or process proof, passport, address proof, source of funds, sometimes RUC), typical timeline, fees | Local bank sites / Anton to confirm |
| health.py.private_insurance | Availability and cost bands of private health cover for foreign residents in Paraguay | Anton / insurer quotes |
| fx.eur_usd_pyg_channels | Which transfer routes NL to PY work and their cost | Provider sites; Anton to confirm |
| nl.cash_declaration_eu | EU cash declaration limit on leaving the EU (EUR 10,000) | https://www.douane.nl (verify) |
| remote.work_visa_py | Whether Paraguay has a remote-worker/digital nomad route and its requirements | Anton / DNM |

## 2. Sources consulted for Dutch-side rules (search results only; rijksoverheid.nl was blocked for direct fetch, so re-verify on the page)
- https://www.belastingdienst.nl/wps/wcm/connect/nl/buitenland/content/conserverende-aanslag-bij-emigratie
- https://www.belastingdienst.nl/wps/wcm/connect/nl/buitenland/content/emigreren-checklist
- https://www.belastingdienst.nl/wps/wcm/connect/nl/buitenland/content/uw-volksverzekeringen-als-u-emigreert
- https://www.rijksoverheid.nl/vraag-en-antwoord/uitkering-meenemen-naar-buitenland/wat-regelen-als-ik-ga-emigreren
- https://www.svb.nl/nl/aow/aow-buiten-nederland/wat-gaat-er-van-uw-aow-af-buiten-nederland
- https://www.nederlandwereldwijd.nl/belastingaangifte-buiten-nederland/pensioen-uit-nederland
- https://www.nederlandwereldwijd.nl/brp/hoe-uitschrijven-brp
- Secondary: joho.org, unive.nl, zorgwijzer.nl (Zvw and toeslagen summaries)

## 3. Review flags
accountant: uitschrijven, belasting, aow. legal (trademark/tone): wakker-in-paraguay. The documentary description ("Nederlanders die het vertrouwen in de overheid verliezen en naar Paraguay emigreren; VPRO, NPO, 2026") comes from the brief, not verified against NPO/VPRO; check wording and add link to the programme page. Also unverified: NL-PY treaty absence, the 2% and 8-months rules are from search summaries.
