import type { Metadata } from 'next';
import Link from 'next/link';
import { Band, Breadcrumbs, Eyebrow, Heading, Prose } from '@/components';
import { Mdx } from '@/content/mdx';
import { FREE_GUIDE_PATH, FREE_GUIDE_READ_PATH, freeGuideChapters } from '@/lib/free-guide';
import { siteMetadata } from '@/lib/metadata';
import { textLink } from '@/lib/text-styles';

const SITE = 'residenciaes' as const;

// The reward behind the form: reachable by link, kept out of search results.
export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Guía gratis de residencia en Paraguay: los cinco capítulos',
    description: 'La guía gratuita completa de residencia en Paraguay para latinoamericanos y españoles: vías, documentos, costos, errores y checklist.',
    path: FREE_GUIDE_READ_PATH,
    noindex: true,
  });
}

export default function Page() {
  const chapters = freeGuideChapters();
  return (
    <Band>
      <Breadcrumbs
        site={SITE}
        items={[
          { label: 'Guía gratis', href: FREE_GUIDE_PATH },
          { label: 'Leer', href: FREE_GUIDE_READ_PATH },
        ]}
      />
      <div className="mx-auto mt-10 max-w-[var(--measure)]">
        <Eyebrow>Guía gratuita · 2026</Eyebrow>
        <Heading level={1} className="mt-4">Cómo obtener la residencia en Paraguay</Heading>
        <nav aria-labelledby="indice" className="mt-10 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-alt)] p-6">
          <h2 id="indice" className="text-(length:--text-xs) font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Índice</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <a href={`#${chapter.id}`} className={textLink}>
                  {chapter.frontmatter.title.replace(/^Capítulo \d+: /, '')}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        {chapters.map((chapter) => (
          <article key={chapter.id} id={chapter.id} aria-labelledby={`${chapter.id}-title`} className="mt-16 scroll-mt-24 border-t border-[var(--border)] pt-12">
            <Heading level={2} id={`${chapter.id}-title`}>{chapter.frontmatter.title}</Heading>
            <Prose className="mt-8">
              <Mdx source={chapter.body} site={SITE} />
            </Prose>
          </article>
        ))}
        <p className="mt-16 text-(length:--text-sm) text-[var(--fg-muted)]">
          ¿Prefieres que lo hagamos por ti? <Link href="/contact" className={textLink}>Escríbenos</Link> o mira los <Link href="/precios" className={textLink}>precios</Link>.
        </p>
      </div>
    </Band>
  );
}
