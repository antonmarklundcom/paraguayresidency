import 'server-only';
import { and, desc, eq, gte, inArray, like, lte, sql, type SQL } from 'drizzle-orm';
import { getDb, hasDatabase } from '@/db';
import {
  factsVerification,
  leads,
  products,
  providerCustomers,
  purchases,
  subscriptions,
  users,
} from '@/db/schema';
import { LEAD_KINDS, type LeadKind } from './lead-schema';
import { isSiteKey, type SiteKey } from '@/sites/registry';

/** Read models for the admin screens. No mutation lives here. */

export interface LeadFilters {
  site?: SiteKey;
  kind?: LeadKind;
  from?: string;
  to?: string;
  page?: number;
}

export const LEAD_PAGE_SIZE = 50;

export function parseLeadFilters(params: Record<string, string | string[] | undefined>): LeadFilters {
  const one = (key: string): string | undefined => {
    const value = params[key];
    const found = Array.isArray(value) ? value[0] : value;
    return found && found !== '' ? found : undefined;
  };
  const site = one('site');
  const kind = one('kind');
  const page = Number.parseInt(one('page') ?? '1', 10);
  return {
    site: isSiteKey(site) ? site : undefined,
    kind: (LEAD_KINDS as readonly string[]).includes(kind ?? '') ? (kind as LeadKind) : undefined,
    from: isDate(one('from')) ? one('from') : undefined,
    to: isDate(one('to')) ? one('to') : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

function isDate(value: string | undefined): boolean {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function leadWhere(filters: LeadFilters): SQL | undefined {
  const clauses: SQL[] = [];
  if (filters.site) clauses.push(eq(leads.site, filters.site));
  if (filters.kind) clauses.push(eq(leads.kind, filters.kind));
  if (filters.from) clauses.push(gte(leads.createdAt, new Date(`${filters.from}T00:00:00Z`)));
  if (filters.to) clauses.push(lte(leads.createdAt, new Date(`${filters.to}T23:59:59Z`)));
  return clauses.length ? and(...clauses) : undefined;
}

export async function listLeads(filters: LeadFilters) {
  if (!hasDatabase()) return { rows: [], total: 0, page: 1, pages: 1, unavailable: true as const };
  const db = getDb();
  const where = leadWhere(filters);
  const page = filters.page ?? 1;

  const [rows, [count]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.id))
      .limit(LEAD_PAGE_SIZE)
      .offset((page - 1) * LEAD_PAGE_SIZE),
    db.select({ n: sql<number>`count(*)` }).from(leads).where(where),
  ]);

  const total = Number(count?.n ?? 0);
  return {
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / LEAD_PAGE_SIZE)),
    unavailable: false as const,
  };
}

/** Unbounded read for the CSV export — the admin asked for everything matching. */
export async function allLeadsForExport(filters: LeadFilters) {
  if (!hasDatabase()) return [];
  return getDb().select().from(leads).where(leadWhere(filters)).orderBy(desc(leads.id)).limit(5000);
}

export async function listPurchases() {
  if (!hasDatabase()) return { rows: [], unavailable: true as const };
  const rows = await getDb()
    .select({
      id: purchases.id,
      site: purchases.site,
      email: purchases.email,
      name: purchases.name,
      status: purchases.status,
      provider: purchases.provider,
      amountCents: purchases.amountCents,
      currency: purchases.currency,
      providerCheckoutId: purchases.providerCheckoutId,
      providerOrderId: purchases.providerOrderId,
      userId: purchases.userId,
      createdAt: purchases.createdAt,
      paidAt: purchases.paidAt,
      productName: products.name,
    })
    .from(purchases)
    .leftJoin(products, eq(products.id, purchases.productId))
    .orderBy(desc(purchases.id))
    .limit(200);
  return { rows, unavailable: false as const };
}

export async function listSubscriptions() {
  if (!hasDatabase()) return { rows: [], unavailable: true as const };
  const rows = await getDb()
    .select({
      id: subscriptions.id,
      site: subscriptions.site,
      status: subscriptions.status,
      provider: subscriptions.provider,
      providerSubscriptionId: subscriptions.providerSubscriptionId,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelledAt: subscriptions.cancelledAt,
      endsAt: subscriptions.endsAt,
      createdAt: subscriptions.createdAt,
      updatedAt: subscriptions.updatedAt,
      email: users.email,
      userId: users.id,
      productName: products.name,
    })
    .from(subscriptions)
    .leftJoin(users, eq(users.id, subscriptions.userId))
    .leftJoin(products, eq(products.id, subscriptions.productId))
    .orderBy(desc(subscriptions.id))
    .limit(200);
  return { rows, unavailable: false as const };
}

/**
 * The member list (plan §5.4.9). `tier` here is the CACHED column — it is
 * labelled as such on screen, because the truth is `entitlements.ts` and a
 * disagreement between the two is exactly what the admin needs to see.
 */
export async function listMembers(search?: string) {
  if (!hasDatabase()) return { rows: [], unavailable: true as const };
  const where = search?.trim()
    ? and(eq(users.role, 'member'), like(users.email, `%${search.trim().toLowerCase()}%`))
    : eq(users.role, 'member');

  const rows = await getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      tier: users.tier,
      tierExpiresAt: users.tierExpiresAt,
      homeSite: users.homeSite,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.id))
    .limit(200);

  if (!rows.length) return { rows: [], unavailable: false as const };

  // One extra query rather than N: the provider ids for everyone on the page.
  const ids = rows.map((r) => r.id);
  const customers = await getDb()
    .select({
      userId: providerCustomers.userId,
      provider: providerCustomers.provider,
      providerCustomerId: providerCustomers.providerCustomerId,
    })
    .from(providerCustomers)
    .where(inArray(providerCustomers.userId, ids));

  const byUser = new Map<number, string[]>();
  for (const c of customers) {
    const list = byUser.get(c.userId) ?? [];
    list.push(`${c.provider}:${c.providerCustomerId}`);
    byUser.set(c.userId, list);
  }

  return {
    rows: rows.map((r) => ({ ...r, providerIds: byUser.get(r.id) ?? [] })),
    unavailable: false as const,
  };
}

export async function listFactVerification() {
  if (!hasDatabase()) return { rows: [], unavailable: true as const };
  const rows = await getDb().select().from(factsVerification);
  return { rows, unavailable: false as const };
}

/** RFC 4180 quoting. A lead's message can contain commas, quotes and newlines. */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const cell = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const text =
      value instanceof Date
        ? value.toISOString()
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => cell(row[column])).join(',')),
  ].join('\r\n');
}

export const LEAD_CSV_COLUMNS = [
  'id',
  'createdAt',
  'site',
  'kind',
  'name',
  'email',
  'phone',
  'whatsapp',
  'country',
  'nationality',
  'quizResult',
  'crmStatus',
  'pagePath',
  'message',
];
