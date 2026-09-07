/**
 * `npm run reconcile:tiers` — the nightly job behind plan §5.4.4.
 *
 * `users.tier` is a cache written by the webhooks. Webhooks get lost, and a
 * subscription can lapse with no event at all, so once a night every member's
 * cached tier is recomputed from their purchase and subscription rows and
 * corrected. The run is recorded in `cron_runs`, which is what makes "nothing
 * changed" distinguishable from "the cron never fired".
 *
 * Idempotent and safe to run by hand at any time.
 */
import { reconcileTiers } from '../src/lib/entitlements';
import { hasDatabase } from '../src/db';

async function main() {
  if (!hasDatabase()) {
    console.error('DATABASE_URL is not set. Set it (see .env.example) and re-run.');
    process.exit(1);
  }

  const result = await reconcileTiers();
  console.log(`checked ${result.checked} member(s), corrected ${result.changed}`);
  for (const change of result.changes) {
    console.log(`  · user ${change.userId}: ${change.from} → ${change.to}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('reconcile failed:', err);
  process.exit(1);
});
