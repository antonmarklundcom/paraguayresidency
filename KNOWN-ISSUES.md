# Known issues

Non-blocking findings. Each entry names the phase that found it and, where it
matters, the phase that should clear it.

## Deferred from O1 — migrate + seed against a real MySQL

The O1 exit criterion "schema migrated on a local/remote MySQL and seed
idempotent (run twice)" could **not** be executed: the build container has no
MySQL server and no Docker. Everything that does not need a live database was
done instead — the complete schema (`src/db/schema.ts`, 8 tables), the
generated migration SQL (`drizzle/0000_green_lord_hawal.sql`) and an idempotent
`scripts/seed.ts`. The app never touches the database at build time, so this
does not block `npm run verify`, `next build`, or CI.

**To clear this (first person with a real MySQL — Anton, or phase S6 during
deploy):**

```bash
cp .env.example .env                       # then set DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
npx drizzle-kit migrate                    # applies drizzle/0000_*.sql
npm run db:seed                            # 1st run: creates admin, product, 7 facts
npm run db:seed                            # 2nd run: must print "already present" / "upserted", insert nothing new
mysql -h <host> -u <user> -p <db> -e "select count(*) from users; select count(*) from products; select count(*) from facts_verification;"
```

Expected after two runs: exactly 1 admin user, 1 product row, 7 facts rows.
`/api/health` must report `db: "ok"` once `DATABASE_URL` is set; it reports
`db: "down"` gracefully until then.

## O1 — `/pricing`, `/contact`, `/about`, `/route-finder` are not built yet

O1 ships placeholder homes only; the nav and footer in `src/sites/registry.ts`
already point at these paths, so they 404 in dev. S3–S5 (pages) and O2 (quiz,
forms) fill them. Not a bug — noted so nobody re-diagnoses it as a routing
fault.

## O1 — no `private/guide-placeholder.pdf` yet

`scripts/seed.ts` defaults `products.file_key` to `guide-placeholder.pdf`. The
file itself ships in S5 per plan §6.3.

## O1 — themes use system/serif font stacks, not `next/font`

Plan §5.1.5 allows up to two `next/font` typefaces per theme. O1 ships CSS font
stacks (`--display-font`, `--body-font`) so the token plumbing is in place
without committing to a typeface the design phases have not chosen yet. S3–S5
swap in `next/font` faces by redefining those two variables per theme — no
component changes needed.
