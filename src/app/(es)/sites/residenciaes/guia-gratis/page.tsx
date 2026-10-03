import type { Metadata } from 'next';
import Link from 'next/link';
import { Band, Breadcrumbs, Eyebrow, FAQ, Heading, LeadForm, SectionHeader } from '@/components';
import { FREE_GUIDE_PATH, FREE_GUIDE_READ_PATH, freeGuideChapters } from '@/lib/free-guide';
import { siteMetadata } from '@/lib/metadata';
import { textLink } from '@/lib/text-styles';

const SITE = 'residenciaes' as const;

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Guía gratis: cómo obtener la residencia en Paraguay (2026)',
    description:
      'Guía gratuita para latinoamericanos y españoles: qué vía te corresponde, qué documentos pedir, costos reales y los errores que más retrasan el trámite.',
    path: FREE_GUIDE_PATH,
  });
}

const FOR_WHOM = [
  { title: 'Argentinos, uruguayos, chilenos, bolivianos, peruanos, colombianos, ecuatorianos y brasileños', body: 'Tienes la vía Mercosur y entras con tu documento de identidad. La guía te dice qué pedir en tu país y cuál es el plazo que no te puedes pasar.' },
  { title: 'Venezolanos y cubanos', body: 'Necesitas visa y tus documentos tardan más en llegar. La guía te ayuda a planificar el orden para no perder la ventana del certificado de antecedentes.' },
  { title: 'Mexicanos, centroamericanos y españoles', body: 'Vas por la residencia temporal general. La guía te explica qué cambió en 2026 y, si eres español, los tratados que te conviene conocer.' },
];

const FAQ_ITEMS = [
  { question: '¿La guía es realmente gratis?', answer: 'Sí. Dejas tu nombre, tu correo y tu WhatsApp, y la lees al instante en esta misma página. No te pedimos tarjeta ni pago.' },
  { question: '¿Para qué piden mi WhatsApp?', answer: 'Porque la mayoría de nuestros clientes prefiere resolver dudas por WhatsApp. Una persona del equipo puede escribirte una vez para ver si tienes preguntas; si no quieres, lo dices y listo.' },
  { question: '¿Sirve si quiero hacer el trámite por mi cuenta?', answer: 'Para eso está escrita. Tiene la lista de documentos, el orden en que pedirlos, las tasas y una checklist final para imprimir.' },
  { question: '¿Está actualizada a 2026?', answer: 'Sí. Incluye el control de presencia, la nueva exigencia de solvencia para la permanente y el Pase de Inversor. Las cifras salen de nuestro registro de datos verificados, con su fuente.' },
];

export default function Page() {
  const chapters = freeGuideChapters();
  return (
    <>
      <Band>
        <Breadcrumbs site={SITE} items={[{ label: 'Guía gratis', href: FREE_GUIDE_PATH }]} />
        <div className="mt-10 grid gap-12 lg:grid-cols-[7fr_5fr] lg:items-start">
          <div>
            <Eyebrow>Guía gratuita · 2026</Eyebrow>
            <Heading level={1} className="mt-4">Cómo obtener la residencia en Paraguay, explicado para latinoamericanos</Heading>
            <p className="mt-6 text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">
              Cinco capítulos escritos por el equipo que presenta estos trámites cada semana en Asunción: qué vía te corresponde
              según tu país, qué documentos pedir y en qué orden, cuánto cuesta de verdad y los errores que más retrasan un expediente.
            </p>
            <ol className="mt-10 space-y-4" aria-label="Capítulos de la guía">
              {chapters.map((chapter, index) => (
                <li key={chapter.id} className="flex gap-4">
                  <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-medium text-[var(--accent)]">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{chapter.frontmatter.title.replace(/^Capítulo \d+: /, '')}</span>
                    <span className="mt-1 block text-(length:--text-sm) text-[var(--fg-muted)]">{chapter.frontmatter.description}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div id="descargar" className="scroll-mt-24 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <h2 className="font-[family-name:var(--display-font)] text-(length:--text-xl)">Recibe la guía gratis</h2>
            <p className="mt-2 text-(length:--text-sm) text-[var(--fg-muted)]">La abres al instante y te enviamos el enlace por correo.</p>
            <div className="mt-6">
              <LeadForm
                site={SITE}
                variant="contact"
                pagePath={FREE_GUIDE_PATH}
                copy={{
                  submit: 'Quiero la guía gratis',
                  message: '¿Algo que quieras contarnos? (opcional: tu nacionalidad, tu situación)',
                  nextStep: 'Sin pagos ni tarjeta. Usamos tus datos solo para enviarte la guía y responder tus dudas.',
                  successTitle: 'Listo, tu guía está lista',
                  successBody: 'Ábrela ahora. También te enviamos el enlace por correo para que la tengas a mano.',
                  successLinkHref: FREE_GUIDE_READ_PATH,
                  successLinkLabel: 'Abrir la guía',
                }}
              />
            </div>
            <p className="mt-6 border-t border-[var(--border)] pt-4 text-(length:--text-sm) text-[var(--fg-muted)]">
              ¿Ya la pediste? <Link href={FREE_GUIDE_READ_PATH} className={textLink}>Ábrela aquí</Link>.
            </p>
          </div>
        </div>
      </Band>

      <Band tone="alt" labelledBy="para-quien">
        <SectionHeader id="para-quien" eyebrow="Para quién es" title="Escrita para hispanohablantes, no traducida del inglés" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FOR_WHOM.map((item) => (
            <div key={item.title} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="font-medium">{item.title}</h3>
              <p className="mt-3 text-(length:--text-sm) text-[var(--fg-muted)]">{item.body}</p>
            </div>
          ))}
        </div>
      </Band>

      <Band labelledBy="preguntas">
        <SectionHeader id="preguntas" eyebrow="Preguntas" title="Antes de pedirla" />
        <div className="mt-8 max-w-3xl">
          <FAQ items={FAQ_ITEMS} />
        </div>
        <p className="mt-10">
          <a href="#descargar" className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-brand)] bg-[var(--accent)] px-5 py-3 text-(length:--text-sm) font-medium text-[var(--accent-fg)] hover:opacity-90">
            Quiero la guía gratis
          </a>
        </p>
      </Band>
    </>
  );
}
