import type { Metadata } from 'next';
import { Container, Heading, Section } from '@/components';
import { Quiz } from '@/features/quiz/Quiz';
import { t } from '@/i18n';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'residenciaes' as const;

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
        <Heading level={1}>{t(SITE, 'quiz.h1')}</Heading>
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
