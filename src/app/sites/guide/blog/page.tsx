import type { Metadata } from 'next';
import { Card, Container, Heading, Section } from '@/components';
import { getHub } from '@/content';
import { contentHref } from '@/lib/site-pages';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/blog';

export function generateMetadata(): Metadata {
  return siteMetadata('guide', {
    title: 'Articles — Paraguay Investor Guide',
    description:
      'Costs, banking, timelines and mistakes: honest answers to the questions people ask before they buy the guide.',
    path: PATH,
  });
}

export default function Page() {
  const posts = getHub('guide', 'blog');

  return (
    <Section>
      <Container>
        <Heading level={1}>Articles</Heading>
        <p className="mt-[var(--space-2)] max-w-[var(--measure)] text-[var(--fg-muted)]">
          Free samples of the same voice and the same honesty as the guide itself.
        </p>
        <div className="mt-[var(--space-10)] grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={post.slugPath}
              eyebrow={new Date(post.frontmatter.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              title={post.frontmatter.title}
              href={contentHref('guide', post.slugPath)}
            >
              {post.frontmatter.description}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
