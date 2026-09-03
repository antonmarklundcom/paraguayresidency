import {
  bigint,
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
  text,
} from 'drizzle-orm/mysql-core';

/**
 * Complete schema for all three brands (plan §2). Written in full in O1 —
 * later phases use these tables, they never retrofit them.
 */

export const siteEnum = ['residency', 'investorpass', 'guide'] as const;

const id = () => bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey();
const createdAt = () => timestamp('created_at').notNull().defaultNow();

export const users = mysqlTable(
  'users',
  {
    id: id(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 120 }),
    role: mysqlEnum('role', ['admin', 'editor']).notNull().default('admin'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('users_email_uq').on(t.email)],
);

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
    utm: json('utm'),
    crmStatus: mysqlEnum('crm_status', ['pending', 'sent', 'failed']).notNull().default('pending'),
    crmResponse: json('crm_response'),
    createdAt: createdAt(),
  },
  (t) => [
    index('leads_site_idx').on(t.site),
    index('leads_kind_idx').on(t.kind),
    index('leads_created_at_idx').on(t.createdAt),
    index('leads_email_idx').on(t.email),
  ],
);

export const leadEvents = mysqlTable(
  'lead_events',
  {
    id: id(),
    leadId: bigint('lead_id', { mode: 'number', unsigned: true }).notNull(),
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

export const products = mysqlTable(
  'products',
  {
    id: id(),
    slug: varchar('slug', { length: 120 }).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    priceCents: int('price_cents').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    stripePriceId: varchar('stripe_price_id', { length: 120 }),
    /** Key into `private/` or the object store — never a public URL. */
    fileKey: varchar('file_key', { length: 255 }),
    version: varchar('version', { length: 40 }).notNull().default('1'),
    active: boolean('active').notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('products_slug_uq').on(t.slug)],
);

export const orders = mysqlTable(
  'orders',
  {
    id: id(),
    productId: bigint('product_id', { mode: 'number', unsigned: true }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 160 }),
    stripeSessionId: varchar('stripe_session_id', { length: 255 }).notNull(),
    stripePaymentIntent: varchar('stripe_payment_intent', { length: 255 }),
    amountCents: int('amount_cents').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    status: mysqlEnum('status', ['pending', 'paid', 'refunded']).notNull().default('pending'),
    site: mysqlEnum('site', siteEnum).notNull().default('guide'),
    utm: json('utm'),
    createdAt: createdAt(),
    paidAt: datetime('paid_at'),
  },
  (t) => [
    uniqueIndex('orders_stripe_session_uq').on(t.stripeSessionId),
    index('orders_email_idx').on(t.email),
    index('orders_status_idx').on(t.status),
  ],
);

export const downloadTokens = mysqlTable(
  'download_tokens',
  {
    id: id(),
    orderId: bigint('order_id', { mode: 'number', unsigned: true }).notNull(),
    token: varchar('token', { length: 96 }).notNull(),
    expiresAt: datetime('expires_at').notNull(),
    downloads: int('downloads').notNull().default(0),
    maxDownloads: int('max_downloads').notNull().default(5),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('download_tokens_token_uq').on(t.token),
    index('download_tokens_order_idx').on(t.orderId),
  ],
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
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type DownloadToken = typeof downloadTokens.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
