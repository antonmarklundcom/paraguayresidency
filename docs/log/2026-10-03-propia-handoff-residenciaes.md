# residenciaenparaguay.es: handoff from propia.node, and what we found (2026-10-03)

## What propia.node reported

From 2026-10-01 (propia.node PR #263) until 2026-10-03, the real-estate app `antonmarklundcom/propia.node`
also had `residenciaenparaguay.es` registered as one of its domains, as a residency "door" with 14 flat
Spanish landing pages. Its post-deploy check (`check:live`) fetched `https://residenciaenparaguay.es/sitemap.xml`,
got this app's `/guias/<hub>/<slug>` URLs, and saw **21 of them return HTTP 500** (never 404) between about
2026-10-01 and 2026-10-03. The first eight it recorded:

```
/guias/documentos/residencia-vencida-en-paraguay-multa-y-prorroga
/guias/documentos/de-residencia-temporal-a-permanente
/guias/vivir-en-paraguay/nomada-digital-y-teletrabajo-en-paraguay
/guias/vivir-en-paraguay/comprar-casa-en-paraguay-siendo-extranjero
/guias/vivir-en-paraguay/trabajar-en-paraguay-siendo-extranjero
/guias/impuestos/residencia-fiscal-paraguaya-para-argentinos
/guias/por-pais/residencia-en-paraguay-para-cubanos
/guias/por-pais/residencia-en-paraguay-para-uruguayos
```

**On 2026-10-03 Anton removed the domain from propia.node completely** (door config, pages, sitemap,
header/footer, tests). propia.node no longer answers for, links to or monitors this domain.

## What we checked in this repo

The likely cause is **not** this repo. The best fit is that propia.node was also serving the domain during
that window. This is inferred: propia's deploy history was not visible from here.

- All eight slugs exist in `content/residenciaes/<hub>/<slug>.mdx` with matching `site` and `hub`.
  A mismatch would have failed the build in `parse()` (`src/content/index.ts`).
- The sitemap is built from `getPages()`, so it cannot list a missing page.
- The route has `dynamicParams = false` with `generateStaticParams`, and `ArticlePage` calls `notFound()`.
  An unknown slug gives 404, not 500.
- Every `<Fact k>` and `{{fact:…}}` key used in `content/residenciaes` exists, and `Fact` returns null in
  production rather than throwing.
- No database call sits on the article render path.
- The code deployed on 2026-10-01 (`e1843e5`) and HEAD (`b08f2fc`) differ only in the process-lifecycle
  files and the Next bump, nothing on the article route.
- `docs/hosting-process-cap-plan.md` already flagged the domain as "also exists in propia.node".
  propia's pages are request-time MySQL reads under the shared process cap, and its own notes describe 500s
  from exactly that, including a 404 page that 500'd when MySQL was unwell. That fits "500, never 404".

## Checklist (Anton, in hPanel)

1. Confirm `residenciaenparaguay.es` and `www.residenciaenparaguay.es` are attached **only** to the
   paraguayresidency Node.js app, not to the propia.node site. Remove any propia mapping.
2. Purge the Hostinger CDN cache for the domain.
3. Check which app answers: this app sends `x-request-id` and a static CSP; propia sends a nonce CSP.
4. Open two or three of the URLs above, then ask Search Console to re-validate the 5xx report.
5. Optional: propia's 14 landing texts can be recovered from propia.node commit `fcb947e`
   (`src/content/residency/pages-a.ts`, `pages-b.ts`; claims in `docs/log/residencia-claims.md`). They are
   unverified drafts, and this site already covers the same topics, so we have not imported them.
6. propia's Telegram alerts no longer cover this domain. Uptime/sitemap monitoring for it is this repo's job
   (`npm run smoke:hosts`, `/api/health`).
