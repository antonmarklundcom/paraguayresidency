import { describe, expect, it } from 'vitest';
import matter from 'gray-matter';
import {
  SUBSCRIBER_SOURCE,
  buildImportPlan,
  mapMinTier,
  mapProductSlug,
  mapTier,
  slugify,
  summarise,
  toCents,
  type PararesiData,
} from '@/lib/pararesi-import';
import { frontmatterSchema } from '@/content/schema';
import { GUIDE_ENTRY_SLUG, GUIDE_INSIDER_SLUG } from '@/sites/registry';

/**
 * A tiny copy of pararesi's shape (plan §5.4.8: the import is tested against a
 * fixture, never against production).
 */
const NOW = new Date('2026-09-07T12:00:00Z');

const fixture: PararesiData = {
  users: [
    {
      id: 1,
      email: 'Buyer@Example.com',
      name: 'A Buyer',
      role: 'member',
      tier: 'guide',
      tierExpiresAt: null,
      lsCustomerId: 'cust_1',
      createdAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 2,
      email: 'insider@example.com',
      name: null,
      role: 'member',
      tier: 'insider',
      tierExpiresAt: '2026-10-01T00:00:00Z',
      lsCustomerId: 'cust_2',
      createdAt: '2026-04-01T10:00:00Z',
    },
    {
      id: 3,
      email: 'staff@example.com',
      name: 'Staff',
      role: 'admin',
      tier: 'insider',
      tierExpiresAt: null,
      lsCustomerId: null,
      createdAt: '2026-01-01T10:00:00Z',
    },
    // Deliberately broken rows: a missing email and a duplicate.
    { id: 4, email: '  ', name: null, role: 'member', tier: 'none', tierExpiresAt: null, lsCustomerId: null, createdAt: '2026-05-01T10:00:00Z' },
    { id: 5, email: 'buyer@example.com', name: 'Dupe', role: 'member', tier: 'none', tierExpiresAt: null, lsCustomerId: null, createdAt: '2026-05-02T10:00:00Z' },
  ],
  purchases: [
    { id: 1, userId: 1, lsOrderId: '5001', lsProductId: 'p1', lsVariantId: 'v1', productKey: 'guide', amountUsd: 700, status: 'paid', createdAt: '2026-03-01T10:05:00Z' },
    { id: 2, userId: 2, lsOrderId: '5002', lsProductId: 'p1', lsVariantId: 'v1', productKey: 'guide', amountUsd: 700, status: 'refunded', createdAt: '2026-04-01T10:05:00Z' },
    // An orphan: no such user.
    { id: 3, userId: 99, lsOrderId: '5003', lsProductId: 'p1', lsVariantId: 'v1', productKey: 'guide', amountUsd: 700, status: 'paid', createdAt: '2026-04-02T10:05:00Z' },
  ],
  subscriptions: [
    { id: 1, userId: 2, lsSubscriptionId: '9001', status: 'active', renewsAt: '2026-10-01T00:00:00Z', endsAt: null, createdAt: '2026-04-01T10:06:00Z' },
  ],
  modules: [
    { id: 1, slug: 'getting-started', title: 'Getting started', description: 'The first steps.', sortOrder: 1, minTier: 'guide', status: 'published' },
    { id: 2, slug: 'insider-only', title: 'Insider deep dives', description: null, sortOrder: 2, minTier: 'insider', status: 'draft' },
  ],
  lessons: [
    { id: 1, moduleId: 1, slug: 'before-you-fly', title: 'Before you fly', contentMd: '# Before you fly\n\nGet the apostilles first.', videoUrl: null, sortOrder: 1, status: 'published' },
    { id: 2, moduleId: 2, slug: 'tax-deep-dive', title: 'Tax, properly', contentMd: 'The long version.', videoUrl: 'https://video.example/1', sortOrder: 1, status: 'published' },
    // Orphan: module 77 does not exist.
    { id: 3, moduleId: 77, slug: 'orphan', title: 'Orphan lesson', contentMd: 'x', videoUrl: null, sortOrder: 1, status: 'published' },
  ],
  lessonProgress: [
    { userId: 1, lessonId: 1, completedAt: '2026-03-05T10:00:00Z' },
    { userId: 99, lessonId: 1, completedAt: '2026-03-05T10:00:00Z' },
  ],
  resources: [
    { id: 1, title: 'Document checklist (PDF)', description: 'Everything to collect.', fileUrl: 'checklist.pdf', minTier: 'guide', sortOrder: 1, status: 'published' },
  ],
  updatesPosts: [
    { id: 1, title: 'Investor Pass rules moved again', contentMd: 'The resolution changed.', minTier: 'insider', publishedAt: '2026-06-01T00:00:00Z', status: 'published' },
  ],
  blogPosts: [
    { id: 1, slug: 'why-paraguay', title: 'Why Paraguay', excerpt: 'A short answer to the question everyone asks first.', contentMd: 'Because it is achievable.', metaTitle: null, metaDescription: null, publishedAt: '2026-02-01T00:00:00Z', status: 'published' },
    { id: 2, slug: '', title: 'Draft post', excerpt: null, contentMd: 'Not ready.', metaTitle: null, metaDescription: null, publishedAt: null, status: 'draft' },
  ],
  leads: [
    { id: 1, email: 'confirmed@example.com', source: 'home-hero', confirmedAt: '2026-05-01T00:00:00Z', unsubscribedAt: null, createdAt: '2026-04-30T00:00:00Z' },
    { id: 2, email: 'pending@example.com', source: 'guide-page', confirmedAt: null, unsubscribedAt: null, createdAt: '2026-05-02T00:00:00Z' },
    { id: 3, email: 'gone@example.com', source: 'home-hero', confirmedAt: '2026-05-01T00:00:00Z', unsubscribedAt: '2026-06-01T00:00:00Z', createdAt: '2026-04-30T00:00:00Z' },
  ],
};

const plan = buildImportPlan(fixture, { now: NOW, amountUnit: 'cents' });

describe('vocabulary mapping (plan §1.12, §12.3)', () => {
  it('maps pararesi tiers onto ours', () => {
    expect(mapTier('guide')).toBe('entry');
    expect(mapTier('insider')).toBe('insider');
    expect(mapTier('none')).toBe('none');
    expect(mapMinTier('guide')).toBe('entry');
    expect(mapMinTier('insider')).toBe('insider');
  });

  it('maps product keys onto product slugs', () => {
    expect(mapProductSlug('guide')).toBe(GUIDE_ENTRY_SLUG);
    expect(mapProductSlug('insider')).toBe(GUIDE_INSIDER_SLUG);
  });

  it('never guesses cents silently', () => {
    expect(toCents(700, 'cents')).toBe(700);
    expect(toCents(7, 'dollars')).toBe(700);
    // The auto heuristic, which the plan reports in its warnings.
    expect(toCents(7, 'auto')).toBe(700);
    expect(toCents(700, 'auto')).toBe(700);
    expect(toCents(-1, 'cents')).toBe(0);
  });

  it('warns loudly when the amount heuristic had to decide', () => {
    const guessy = buildImportPlan(
      { ...fixture, purchases: [{ ...fixture.purchases[0], amountUsd: 7 }] },
      { now: NOW },
    );
    expect(guessy.warnings.join(' ')).toContain('PARARESI_AMOUNT_UNIT');
    expect(guessy.purchases[0].amountCents).toBe(700);
  });

  it('slugifies a title when there is no slug', () => {
    expect(slugify('Document checklist (PDF)', 'x')).toBe('document-checklist-pdf');
    expect(slugify('', 'fallback-1')).toBe('fallback-1');
    expect(slugify('!!!', 'fallback-2')).toBe('fallback-2');
  });
});

describe('users', () => {
  it('imports members, lowercasing the email', () => {
    expect(plan.users.map((u) => u.email)).toEqual([
      'buyer@example.com',
      'insider@example.com',
      'staff@example.com',
    ]);
  });

  it('skips a row with no email and a duplicate email, and says so', () => {
    expect(plan.warnings.some((w) => w.includes('no email'))).toBe(true);
    expect(plan.warnings.some((w) => w.includes('duplicates the email'))).toBe(true);
  });

  it("never inherits another app's admin role", () => {
    expect(plan.warnings.some((w) => w.includes('was an admin in pararesi'))).toBe(true);
  });

  it('carries the Lemon Squeezy customer id across', () => {
    expect(plan.providerCustomers).toEqual([
      { userEmail: 'buyer@example.com', providerCustomerId: 'cust_1' },
      { userEmail: 'insider@example.com', providerCustomerId: 'cust_2' },
    ]);
  });
});

describe('money', () => {
  it('uses the same checkout id the live webhook writes, so the two never double up', () => {
    expect(plan.purchases[0].providerCheckoutId).toBe('ls_order_5001');
    expect(plan.purchases[0].providerOrderId).toBe('5001');
  });

  it('keeps refunded refunded, and does not date it paid', () => {
    const refunded = plan.purchases.find((p) => p.providerOrderId === '5002')!;
    expect(refunded.status).toBe('refunded');
    expect(refunded.paidAt).toBeNull();
  });

  it('drops a purchase whose user does not exist rather than orphaning it', () => {
    expect(plan.purchases.map((p) => p.providerOrderId)).not.toContain('5003');
    expect(plan.warnings.some((w) => w.includes('5003'))).toBe(true);
  });

  it('maps the subscription onto the Insider product', () => {
    expect(plan.subscriptions).toEqual([
      {
        userEmail: 'insider@example.com',
        productSlug: GUIDE_INSIDER_SLUG,
        providerSubscriptionId: '9001',
        status: 'active',
        currentPeriodEnd: new Date('2026-10-01T00:00:00Z'),
        endsAt: null,
        createdAt: new Date('2026-04-01T10:06:00Z'),
      },
    ]);
  });
});

describe('course content becomes MDX (plan §1.14)', () => {
  it('writes a lesson body per lesson, under content/guide/members/', () => {
    const paths = plan.files.map((f) => f.path);
    expect(paths).toContain('guide/members/getting-started/before-you-fly.mdx');
    expect(paths).toContain('guide/members/insider-only/tax-deep-dive.mdx');
  });

  it('points the lesson row at the file rather than storing the body', () => {
    const lesson = plan.lessons.find((l) => l.slug === 'before-you-fly')!;
    expect(lesson.contentPath).toBe('guide/members/getting-started/before-you-fly.mdx');
    expect(lesson).not.toHaveProperty('contentMd');
  });

  it('inherits the module tier, because pararesi gated at the module', () => {
    expect(plan.lessons.find((l) => l.slug === 'before-you-fly')!.minTier).toBe('entry');
    expect(plan.lessons.find((l) => l.slug === 'tax-deep-dive')!.minTier).toBe('insider');
  });

  it('keeps a video as a link in the body', () => {
    const file = plan.files.find((f) => f.path.endsWith('tax-deep-dive.mdx'))!;
    expect(file.contents).toContain('https://video.example/1');
  });

  it('drops a lesson with no module and says which one', () => {
    expect(plan.lessons.map((l) => l.slug)).not.toContain('orphan');
    expect(plan.warnings.some((w) => w.includes('Orphan lesson'))).toBe(true);
  });

  it('carries draft status through as inactive, not as a deletion', () => {
    expect(plan.modules.find((m) => m.slug === 'insider-only')!.active).toBe(false);
    expect(plan.modules.find((m) => m.slug === 'getting-started')!.active).toBe(true);
  });

  it('drops progress rows whose user or lesson is missing', () => {
    expect(plan.lessonProgress).toEqual([
      {
        userEmail: 'buyer@example.com',
        moduleSlug: 'getting-started',
        lessonSlug: 'before-you-fly',
        completedAt: new Date('2026-03-05T10:00:00Z'),
      },
    ]);
  });

  it('writes updates and blog posts to their own hubs', () => {
    const paths = plan.files.map((f) => f.path);
    expect(paths).toContain('guide/updates/investor-pass-rules-moved-again.mdx');
    expect(paths).toContain('guide/blog/why-paraguay.mdx');
    expect(paths).toContain('guide/blog/draft-post.mdx');
  });

  it('marks an unpublished blog post as a draft', () => {
    const draft = plan.files.find((f) => f.path === 'guide/blog/draft-post.mdx')!;
    expect(matter(draft.contents).data.draft).toBe(true);
  });

  it('every generated MDX file has valid frontmatter', () => {
    expect(plan.files.length).toBeGreaterThan(0);
    for (const file of plan.files) {
      const parsed = matter(file.contents);
      const result = frontmatterSchema.safeParse(parsed.data);
      expect(result.success, `${file.path}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
      expect(parsed.data.site).toBe('guide');
      expect(parsed.content.trim()).not.toBe('');
    }
  });

  it('puts member content in a hub the public content pipeline refuses to serve', async () => {
    const { isReservedHub } = await import('@/content');
    for (const file of plan.files) {
      const hub = file.path.split('/')[1];
      if (file.path.startsWith('guide/members/') || file.path.startsWith('guide/updates/')) {
        expect(isReservedHub(hub)).toBe(true);
      }
    }
    expect(isReservedHub('blog')).toBe(false);
  });
});

describe('leads become subscribers (plan §12.3)', () => {
  it('keeps the consent state they gave pararesi', () => {
    expect(plan.subscribers).toEqual([
      {
        email: 'confirmed@example.com',
        source: SUBSCRIBER_SOURCE,
        status: 'confirmed',
        createdAt: new Date('2026-04-30T00:00:00Z'),
        confirmedAt: new Date('2026-05-01T00:00:00Z'),
      },
      {
        email: 'pending@example.com',
        source: SUBSCRIBER_SOURCE,
        status: 'pending',
        createdAt: new Date('2026-05-02T00:00:00Z'),
        confirmedAt: null,
      },
      {
        email: 'gone@example.com',
        source: SUBSCRIBER_SOURCE,
        status: 'unsubscribed',
        createdAt: new Date('2026-04-30T00:00:00Z'),
        confirmedAt: new Date('2026-05-01T00:00:00Z'),
      },
    ]);
  });
});

describe('the plan is deterministic, which is what makes it idempotent', () => {
  it('produces exactly the same plan twice', () => {
    const again = buildImportPlan(fixture, { now: NOW, amountUnit: 'cents' });
    expect(JSON.stringify(again)).toBe(JSON.stringify(plan));
  });

  it('summarises what a --dry-run would report', () => {
    expect(summarise(plan)).toEqual({
      users: 3,
      provider_customers: 2,
      purchases: 2,
      subscriptions: 1,
      modules: 2,
      lessons: 2,
      lesson_progress: 1,
      resources: 1,
      updates_posts: 1,
      subscribers: 3,
      mdx_files: 5,
    });
  });

  it('handles an empty source without throwing', () => {
    const empty = buildImportPlan(
      {
        users: [], purchases: [], subscriptions: [], modules: [], lessons: [],
        lessonProgress: [], resources: [], updatesPosts: [], blogPosts: [], leads: [],
      },
      { now: NOW },
    );
    expect(summarise(empty)).toEqual({
      users: 0, provider_customers: 0, purchases: 0, subscriptions: 0, modules: 0,
      lessons: 0, lesson_progress: 0, resources: 0, updates_posts: 0, subscribers: 0,
      mdx_files: 0,
    });
  });
});
