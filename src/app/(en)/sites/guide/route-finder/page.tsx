import type { Metadata } from 'next';
import { Breadcrumbs, Container, Heading, Section } from '@/components';
import { Quiz } from '@/features/quiz/Quiz';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'guide' as const;

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'quiz.metaTitle'),
    description: t(SITE, 'quiz.metaDescription'),
    path: '/route-finder',
  });
}

export default function Page() {
  return (
    <Section>
      <Container>
        <Breadcrumbs site={SITE} items={[{ label: t(SITE, 'quiz.h1'), href: '/route-finder' }]} />
        <Heading level={1} className="mt-[var(--space-8)]">{t(SITE, 'quiz.h1')}</Heading>
        <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-[var(--fg-muted)]">
          {t(SITE, 'quiz.sub')}
        </p>
        <div className="mt-[var(--space-12)]">
          <Quiz site={SITE} />
        </div>
      </Container>
    </Section>
  );
}
