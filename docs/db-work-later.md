# Database work for Anton later

Build sessions never run migrations against a real database. Each row: what, why, migration file, how to run it
(see `docs/runbook.md`), what breaks if it is not run, and whether the code degrades safely without it.

## How to run a pending migration (same for every entry below)

1. Back up first: hPanel → Databases → phpMyAdmin → select the database → Export → Quick → Go.
2. Find out how the database was migrated so far. In phpMyAdmin run
   `SELECT id, hash, created_at FROM __drizzle_migrations;`
   - **Two or more rows** (0000 and 0001 were applied with `drizzle-kit migrate`, as the O2 log records):
     from your machine, with Remote MySQL allowed for your IP (`nextjs-deploy-hostinger` skill §6a),
     run `DATABASE_URL="mysql://…" npx drizzle-kit migrate`. It applies only the files it has not applied yet,
     in order, and records them.
   - **The table does not exist** (the schema was created some other way): open the migration file below,
     paste its statements into phpMyAdmin → SQL, and run them. Ignore the `--> statement-breakpoint` lines
     (they are comments to MySQL).
3. Check: `/api/health` on any host → `leads.queue` should read `"table"` within a minute (the app re-checks the
   schema every minute until it sees the new tables; no redeploy needed).

Never use `npm run db:push` on production for these: it diffs instead of running the reviewed file.

## Pending

### 1. `drizzle/0002_o24_lead_engine.sql` — lead delivery queue, WhatsApp lead kind, click events (O24 items 1–2)

| | |
|---|---|
| What | `CREATE TABLE lead_deliveries` (retry queue: one row per lead and channel), `CREATE TABLE site_events` (anonymous WhatsApp click beacons), `ALTER TABLE leads MODIFY kind enum(…, 'whatsapp')`, four indexes. Additive only: no drop, no rename, no data change. The enum change appends a value, which MySQL does in place. |
| Why | Item 1 needs per-channel attempt counts and a next-attempt time to retry with backoff; `leads.crm_status` has neither and nothing records email failures. Item 2 asks for WhatsApp capture as its own `leads.kind`, and for a beacon to post to. |
| How | See above. Takes well under a second on a table of this size. |
| If not run | Nothing breaks. `src/lib/db-features.ts` sees the old schema and: WhatsApp leads are stored as `kind='contact'` with `attribution.lead_kind='whatsapp'` (the admin shows them as `whatsapp` anyway); the retry queue falls back to re-pushing `crm_status='failed'` leads of the last 7 days (no email retries, no backoff); `/api/health` reports `leads.queue: "legacy"`; WhatsApp clicks are not stored (the beacon answers 204 and drops them). |
| Degrades safely | Yes — tested against a real MariaDB before and after the migration (`tests/lead-delivery-live-db.test.ts`). |
| After running | Set `LEAD_QUEUE_SECRET` (24+ chars) in hPanel and add the cron in `docs/runbook.md` → "Lead delivery queue". Then press **Run queue incl. skipped** once on `/admin/leads` if the CRM key was set after leads came in. |
