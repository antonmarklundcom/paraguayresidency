import { Button, Container, Heading, Section } from '@/components';
import { t } from '@/i18n';
import type { SiteKey } from '@/sites/registry';

export function NotFoundBody({ site }: { site: SiteKey }) {
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>{t(site, 'notFound.title')}</Heading>
        <p className="mt-[var(--space-6)] text-[var(--fg-muted)]">{t(site, 'notFound.body')}</p>
        <div className="mt-[var(--space-8)]">
          <Button href="/">{t(site, 'common.backHome')}</Button>
        </div>
      </Container>
    </Section>
  );
}
