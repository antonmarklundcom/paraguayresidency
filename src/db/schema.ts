import {
  bigint,
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  timestamp,
  uniqueIndex,
  varchar,
  text,
} from 'drizzle-orm/mysql-core';

/**
 * The complete schema for the whole platform (plan §2).
 *
 * O1 wrote the first eight tables; **O9 is the last schema-shaping phase** —
 * every column S10–S15 will ever need exists here now, including the ones only
 * S14's member area uses. Nothing is retrofitted later, and no Sonnet phase
 * may touch this file (plan §4.7).
 */

/**
 * Mirrors `SITE_KEYS` in `src/sites/registry.ts` exactly. It is duplicated
 * rather than imported so `src/db` stays free of app imports, and
 * `tests/schema-sites.test.ts` fails the build the moment the two drift
 * (plan §2).
 */
export const siteEnum = [
  'residency',
  'investorpass',
  'guide',
  'frontier',
  'residenciaes',
  'residenciapt',
  'flytta',
] as const;

/**
 * One product-tier vocabulary for the whole platform (plan §1.12).
 * `entry` = a one-time low-ticket purchase. `insider` = the recurring
 * membership. High-ticket residency work is a SERVICE, not a tier: it is a
 * lead, and nothing is ever gated on it.
 */
export const tierEnum = ['none', 'entry', 'insider'] as const;

/** Content tiers: `none` is not a floor anything can require. */
export const minTierEnum = ['entry', 'insider'] as const;

/** Stripe sells one-time products, Lemon Squeezy sells subscriptions (§1.13). */
export const providerEnum = ['stripe', 'lemonsqueezy'] as const;

const id = () => bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey();
const fk = (name: string) => bigint(name, { mode: 'number', unsigned: true });
const createdAt = () => timestamp('created_at').notNull().defaultNow();
const updatedAt = () => timestamp('updated_at').notNull().defaultNow().onUpdateNow();

/* ------------------------------------------------------------------ people */

/**
 * Staff login AND members in one table (plan §2).
 *
 * `password_hash` is nullable because a $7 buyer never sets one — the email a
 * processor gives us is the identity and a magic link is the credential
 * (§1.15). `tier` is a DENORMALIZED CACHE written after every webhook and by
 * `scripts/reconcile-tiers.ts`; the truth is `effectiveTier()` in
 * `src/lib/entitlements.ts`, computed from `purchases` + `subscriptions`.
 * Never gate access on this column.
 */
export const users = mysqlTable(
  'users',
  {
    id: id(),
    email: varchar('email', { length: 255 }).notNull(),
    /** Staff only. Null for every member. */
    passwordHash: varchar('password_hash', { length: 255 }),
    name: varchar('name', { length: 120 }),
    role: mysqlEnum('role', ['admin', 'editor', 'member']).notNull().default('member'),
    /** Cache — see the note above. */
    tier: mysqlEnum('tier', tierEnum).notNull().default('none'),
    tierExpiresAt: datetime('tier_expires_at'),
    /** Which brand this person arrived through; drives email branding. */
    homeSite: mysqlEnum('home_site', siteEnum),
    createdAt: createdAt(),
    lastLoginAt: datetime('last_login_at'),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('users_email_uq').on(t.email),
    index('users_role_idx').on(t.role),
    index('users_tier_idx').on(t.tier),
  ],
);

/**
 * A user's id at each processor. Two rows for one person is normal: they
 * bought the Guide through Stripe and subscribed through Lemon Squeezy.
 */
export const providerCustomers = mysqlTable(
  'provider_customers',
  {
    id: id(),
    userId: fk('user_id').notNull(),
    provider: mysqlEnum('provider', providerEnum).notNull(),
    providerCustomerId: varchar('provider_customer_id', { length: 128 }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('provider_customers_uq').on(t.provider, t.providerCustomerId),
    index('provider_customers_user_idx').on(t.userId),
  ],
);

/* ------------------------------------------------------------------- leads */

export const leads = mysqlTable(
  'leads',
  {
    id: id(),
    site: mysqlEnum('site', siteEnum).notNull(),
    kind: mysqlEnum('kind', ['consultation', 'investor_inquiry', 'contact', 'quiz']).notNull(),
    name: varchar('name', { length: 160 }),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 40 }),
    whatsapp: varchar('whatsapp', { length: 40 }),
    country: varchar('country', { length: 2 }),
    nationality: varchar('nationality', { length: 2 }),
    message: text('message'),
    quizAnswers: json('quiz_answers'),
    quizResult: varchar('quiz_result', { length: 60 }),
    pagePath: varchar('page_path', { length: 512 }),
    /** Last-touch UTM off the submitting page's query string. */
    utm: json('utm'),
    /**
     * First-touch attribution, ported from flytta in O9 (plan §5.4.7): the
     * utm set, landing path, referrer and first-seen timestamp from the
     * visitor's FIRST session, which is the one that actually earned the lead.
     */
    attribution: json('attribution'),
    /**
     * sha256 of the phone within a fixed window. The unique index is what
     * makes a double submit one lead instead of two (plan §5.4.7); it is
     * nullable because a lead without a phone cannot be deduplicated this way.
     */
    dedupeKey: varchar('dedupe_key', { length: 64 }),
    crmStatus: mysqlEnum('crm_status', ['pending', 'sent', 'failed']).notNull().default('pending'),
    crmResponse: json('crm_response'),
    createdAt: createdAt(),
  },
  (t) => [
    index('leads_site_idx').on(t.site),
    index('leads_kind_idx').on(t.kind),
    index('leads_created_at_idx').on(t.createdAt),
    index('leads_email_idx').on(t.email),
    uniqueIndex('leads_dedupe_key_uq').on(t.dedupeKey),
  ],
);

export const leadEvents = mysqlTable(
  'lead_events',
  {
    id: id(),
    leadId: fk('lead_id').notNull(),
    type: varchar('type', { length: 60 }).notNull(),
    payload: json('payload'),
    createdAt: createdAt(),
  },
  (t) => [index('lead_events_lead_id_idx').on(t.leadId)],
);

export const subscribers = mysqlTable(
  'subscribers',
  {
    id: id(),
    site: mysqlEnum('site', siteEnum).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 160 }),
    source: varchar('source', { length: 120 }),
    status: mysqlEnum('status', ['pending', 'confirmed', 'unsubscribed'])
      .notNull()
      .default('pending'),
    confirmToken: varchar('confirm_token', { length: 64 }),
    createdAt: createdAt(),
    confirmedAt: datetime('confirmed_at'),
  },
  (t) => [
    uniqueIndex('subscribers_email_site_uq').on(t.email, t.site),
    uniqueIndex('subscribers_confirm_token_uq').on(t.confirmToken),
  ],
);

/* ------------------------------------------------------------------ money */

/**
 * Everything sold on any brand. `provider` is what routes a checkout
 * (plan §1.13): Stripe for `one_time`, Lemon Squeezy for `subscription`.
 */
export const products = mysqlTable(
  'products',
  {
    id: id(),
    slug: varchar('slug', { length: 120 }).notNull(),
    site: mysqlEnum('site', siteEnum).notNull().default('guide'),
    name: varchar('name', { length: 200 }).notNull(),
    /** What owning this grants. */
    tier: mysqlEnum('tier', minTierEnum).notNull().default('entry'),
    kind: mysqlEnum('kind', ['one_time', 'subscription']).notNull().default('one_time'),
    provider: mysqlEnum('provider', providerEnum).notNull().default('stripe'),
    /** Stripe price id, or the Lemon Squeezy variant id. */
    providerPriceId: varchar('provider_price_id', { length: 128 }),
    priceCents: int('price_cents').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    interval: mysqlEnum('interval', ['month', 'year']),
    /** Key into `private/` or the object store — never a public URL. */
    fileKey: varchar('file_key', { length: 255 }),
    version: varchar('version', { length: 40 }).notNull().default('1'),
    active: boolean('active').notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('products_slug_uq').on(t.slug), index('products_site_idx').on(t.site)],
);

/**
 * One-time checkouts from either provider. Renamed from `orders` in O9 — the
 * migration is a `RENAME TABLE`, never a drop and re-create, because these are
 * paid orders (plan §5.4.3).
 */
export const purchases = mysqlTable(
  'purchases',
  {
    id: id(),
    site: mysqlEnum('site', siteEnum).notNull().default('guide'),
    productId: fk('product_id').notNull(),
    /** Null until a webhook resolves or creates the buyer's account. */
    userId: fk('user_id'),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 160 }),
    provider: mysqlEnum('provider', providerEnum).notNull().default('stripe'),
    /** Stripe payment intent, or the Lemon Squeezy order id. */
    providerOrderId: varchar('provider_order_id', { length: 255 }),
    /** The Stripe Checkout session id; the LS checkout id if it has one. */
    providerCheckoutId: varchar('provider_checkout_id', { length: 255 }).notNull(),
    amountCents: int('amount_cents').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    status: mysqlEnum('status', ['pending', 'paid', 'refunded']).notNull().default('pending'),
    utm: json('utm'),
    raw: json('raw'),
    createdAt: createdAt(),
    paidAt: datetime('paid_at'),
  },
  (t) => [
    uniqueIndex('purchases_checkout_uq').on(t.providerCheckoutId),
    uniqueIndex('purchases_provider_order_uq').on(t.provider, t.providerOrderId),
    index('purchases_email_idx').on(t.email),
    index('purchases_status_idx').on(t.status),
    index('purchases_user_idx').on(t.userId),
  ],
);

/** Recurring memberships. Lemon Squeezy today; the columns are provider-neutral. */
export const subscriptions = mysqlTable(
  'subscriptions',
  {
    id: id(),
    site: mysqlEnum('site', siteEnum).notNull().default('guide'),
    productId: fk('product_id'),
    userId: fk('user_id').notNull(),
    provider: mysqlEnum('provider', providerEnum).notNull().default('lemonsqueezy'),
    providerSubscriptionId: varchar('provider_subscription_id', { length: 128 }).notNull(),
    status: mysqlEnum('status', ['active', 'past_due', 'cancelled', 'expired', 'paused'])
      .notNull()
      .default('active'),
    /** When the paid-up period ends; the grace clock in entitlements.ts. */
    currentPeriodEnd: datetime('current_period_end'),
    cancelledAt: datetime('cancelled_at'),
    /** Set on cancellation: access runs to here, not to the cancellation. */
    endsAt: datetime('ends_at'),
    raw: json('raw'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('subscriptions_provider_uq').on(t.provider, t.providerSubscriptionId),
    index('subscriptions_user_idx').on(t.userId),
    index('subscriptions_status_idx').on(t.status),
  ],
);

export const downloadTokens = mysqlTable(
  'download_tokens',
  {
    id: id(),
    purchaseId: fk('purchase_id').notNull(),
    token: varchar('token', { length: 96 }).notNull(),
    expiresAt: datetime('expires_at').notNull(),
    downloads: int('downloads').notNull().default(0),
    maxDownloads: int('max_downloads').notNull().default(5),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('download_tokens_token_uq').on(t.token),
    index('download_tokens_purchase_idx').on(t.purchaseId),
  ],
);

/**
 * The idempotency log both webhooks write to BEFORE doing anything else. A
 * duplicate delivery hits the unique index, and the handler answers 200 having
 * changed nothing (plan §5.4.6).
 */
export const webhookEvents = mysqlTable(
  'webhook_events',
  {
    id: id(),
    provider: mysqlEnum('provider', providerEnum).notNull(),
    providerEventId: varchar('provider_event_id', { length: 191 }).notNull(),
    type: varchar('type', { length: 120 }).notNull(),
    payload: json('payload'),
    receivedAt: timestamp('received_at').notNull().defaultNow(),
    processedAt: datetime('processed_at'),
    error: text('error'),
  },
  (t) => [
    uniqueIndex('webhook_events_provider_event_uq').on(t.provider, t.providerEventId),
    index('webhook_events_type_idx').on(t.type),
  ],
);

/**
 * One row per completed scheduled run. A cron that never fires is otherwise
 * invisible — nothing is sent, nothing errors — so recording every run turns
 * "no tiers changed" into a question the admin can answer.
 */
export const cronRuns = mysqlTable(
  'cron_runs',
  {
    id: id(),
    job: varchar('job', { length: 64 }).notNull(),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    finishedAt: datetime('finished_at'),
    ok: boolean('ok').notNull().default(false),
    note: text('note'),
  },
  (t) => [index('cron_runs_job_started_idx').on(t.job, t.startedAt)],
);

/* --------------------------------------------------------- member content */

/**
 * Course sections. `site` null means every brand — the member area is one
 * library that brands draw from, not seven copies (plan §2).
 *
 * Bodies are MDX on disk (§1.14); the database holds only what needs querying:
 * ordering, `min_tier` and the drip offset.
 */
export const modules = mysqlTable(
  'modules',
  {
    id: id(),
    site: mysqlEnum('site', siteEnum),
    slug: varchar('slug', { length: 191 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    sort: int('sort').notNull().default(0),
    minTier: mysqlEnum('min_tier', minTierEnum).notNull().default('entry'),
    /** Days after the member became entitled before this unlocks. */
    dripDays: int('drip_days').notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('modules_site_slug_uq').on(t.site, t.slug)],
);

export const lessons = mysqlTable(
  'lessons',
  {
    id: id(),
    moduleId: fk('module_id').notNull(),
    slug: varchar('slug', { length: 191 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    sort: int('sort').notNull().default(0),
    minTier: mysqlEnum('min_tier', minTierEnum).notNull().default('entry'),
    dripDays: int('drip_days').notNull().default(0),
    /** Repo-relative MDX path, e.g. `guide/members/getting-started/visa.mdx`. */
    contentPath: varchar('content_path', { length: 512 }),
    active: boolean('active').notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('lessons_module_slug_uq').on(t.moduleId, t.slug),
    index('lessons_module_idx').on(t.moduleId),
  ],
);

export const lessonProgress = mysqlTable(
  'lesson_progress',
  {
    userId: fk('user_id').notNull(),
    lessonId: fk('lesson_id').notNull(),
    completedAt: timestamp('completed_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

/** Member downloads, streamed from `private/` — never a public URL. */
export const resources = mysqlTable(
  'resources',
  {
    id: id(),
    site: mysqlEnum('site', siteEnum),
    slug: varchar('slug', { length: 191 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    fileKey: varchar('file_key', { length: 512 }).notNull(),
    minTier: mysqlEnum('min_tier', minTierEnum).notNull().default('entry'),
    sort: int('sort').notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('resources_site_slug_uq').on(t.site, t.slug)],
);

/** The member-only changelog the Insider tier is largely sold on. */
export const updatesPosts = mysqlTable(
  'updates_posts',
  {
    id: id(),
    site: mysqlEnum('site', siteEnum),
    slug: varchar('slug', { length: 191 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    minTier: mysqlEnum('min_tier', minTierEnum).notNull().default('entry'),
    publishedAt: datetime('published_at'),
    contentPath: varchar('content_path', { length: 512 }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('updates_posts_site_slug_uq').on(t.site, t.slug)],
);

/**
 * Mirror of the verification state in `content/shared/facts.ts` so the admin
 * can mark a fact verified without a deploy (plan §2). `facts.ts` stays the
 * source of the copy; this table only carries who/when/note.
 */
export const factsVerification = mysqlTable('facts_verification', {
  key: varchar('key', { length: 120 }).primaryKey(),
  verifiedBy: varchar('verified_by', { length: 160 }),
  verifiedOn: datetime('verified_on'),
  note: text('note'),
  updatedAt: updatedAt(),
});

export type SiteValue = (typeof siteEnum)[number];
export type Tier = (typeof tierEnum)[number];
export type MinTier = (typeof minTierEnum)[number];
export type Provider = (typeof providerEnum)[number];

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ProviderCustomer = typeof providerCustomers.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type DownloadToken = typeof downloadTokens.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type CronRun = typeof cronRuns.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type UpdatesPost = typeof updatesPosts.$inferSelect;
