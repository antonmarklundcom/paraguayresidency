import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import type { Metadata } from 'next';
import {
  ArticleCards,
  Button,
  Disclosure,
  Fact,
  FAQ,
  Heading,
  IntentTiles,
  LeadPanel,
  PhotoHero,
  heroTrust,
  Reasons,
  Section,
  Steps,
  TeamStrip,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'residenciaes' as const;

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Residencia en Paraguay para Españoles — Temporal, Permanente y Cédula',
    description:
      'Trámite de residencia en Paraguay llave en mano. Honorarios fijos en euros, documentos según tu nacionalidad, citas en Asunción. Descubre tu ruta en 2 minutos.',
    path: '/',
  });
}

const FAQ_ITEMS = [
  {
    question: '¿Cómo sé qué ruta me conviene?',
    answer:
      'Haz el test de ruta — seis preguntas, dos minutos — o reserva una llamada y te lo decimos directamente, incluido cuándo la ruta estándar no te conviene.',
  },
  {
    question: '¿Cuánto cuesta esto?',
    answer:
      'Un honorario fijo por ruta, cotizado en euros antes de que te comprometas, según tu nacionalidad y tu situación. Consulta la página de precios para ver qué cubre cada ruta.',
  },
  {
    question: '¿Tengo que mudarme a Paraguay para conseguir la residencia?',
    answer:
      'No. Tienes que asistir en persona a las citas, que agendamos juntos, pero la mudanza completa es decisión tuya, no un requisito de la residencia en sí.',
  },
  {
    question: '¿Y si mi caso es poco habitual?',
    answer:
      'Cuéntanoslo en la primera llamada. Preferimos orientarte hacia el Pase de Inversor, o decirte que esperes, antes que presentar algo que no sirva a tu caso.',
  },
];

const STEPS = [
  { title: 'Una llamada', body: 'Confirmamos tu ruta y tu honorario fijo, en euros, antes de que te comprometas.' },
  { title: 'Tus documentos', body: 'Una lista hecha para tu nacionalidad: apostillas y traducciones en el orden correcto.' },
  { title: 'Asunción', body: 'Presentamos el expediente y te acompañamos a las citas. Tú vienes; nosotros hacemos el resto.' },
  { title: 'Tu cédula', body: 'Aprobada la residencia, tramitamos tu cédula paraguaya y te decimos qué sigue.' },
];

export default function Page() {
  const latest = getPages(SITE).slice(0, 3);
  const actions = (
    <>
      <Button href="/route-finder">Descubre tu ruta</Button>
      <Button href="#contact" variant="secondary">
        Habla con nosotros
      </Button>
    </>
  );

  return (
    <>
      <PhotoHero
        image="guide-hero-reading-terrace-asuncion"
        locale="es"
        focus="65% center"
        eyebrow="Residencia Paraguay"
        title="Residencia en Paraguay, sin vueltas."
        sub="Residencia temporal, permanente y cédula, tramitadas por un equipo que lo hace cada semana en Asunción. Tú vienes a las citas. Nosotros hacemos el resto."
        actions={actions}
        trust={heroTrust(SITE)}
      />

      <IntentTiles
        locale="es"
        title="¿Por dónde empiezas?"
        intro="Elige tu punto de partida. Si no lo tienes claro, el test de ruta te lo dice en dos minutos."
        tiles={[
          { label: '¿Qué ruta me conviene?', note: 'Seis preguntas, dos minutos', href: '/route-finder', image: 'guide-tile-route-fork' },
          { label: 'Residencia temporal', note: 'El primer paso habitual', href: '/residencia/temporal', image: 'guide-tile-documents-desk' },
          { label: 'Residencia permanente', note: 'Con reglas de presencia claras', href: '/residencia/permanente', image: 'frontier-tile-open-door-patio' },
          { label: 'Vía Mercosur', note: 'Si tienes nacionalidad del Mercosur', href: '/mercosur', image: 'frontier-tile-three-roads' },
        ]}
      />

      <Reasons
        title="Por qué Paraguay"
        intro="Sin promesas de folleto: esto es lo que la ley ofrece hoy, y lo confirmamos contigo antes de presentar nada."
        reasons={[
          { title: 'Un primer paso claro', body: <>Duración de la residencia temporal: <Fact k="temporary.duration" site={SITE} />.</> },
          { title: 'Una permanente que dura', body: <>La permanente tiene una regla de presencia: <Fact k="permanent.presence_rule" site={SITE} />.</> },
          {
            title: 'Vía propia para el Mercosur',
            body: (
              <>
                Para nacionales del Mercosur, la vía de residencia es la siguiente:{' '}
                <Fact k="mercosur.residency_route" site={SITE} /> —{' '}
                <a href="/mercosur" className="text-[var(--accent)] underline underline-offset-2">mira si te aplica</a>.
              </>
            ),
          },
        ]}
      />

      <Steps
        tone="alt"
        title="Cómo funciona"
        intro="Cuatro pasos, en el orden en que de verdad ocurren."
        steps={STEPS}
        link={{ href: '/proceso', label: 'El proceso completo, paso a paso' }}
      />

      <TeamStrip site={SITE} />

      <Section width="narrow">
        <Heading level={2} className="mb-[var(--space-6)]">Los detalles</Heading>
        <Disclosure title="Para quién es esto">
          <p>
            Personas que se trasladan por trabajo, jubilación o familia; nómadas y autónomos que
            quieren una base legal y un RUC que puedan usar de verdad; nacionales del Mercosur con
            una vía propia; e inversores que prefieren ir directos a la permanente. Si no sabes
            cuál de estos eres, el{' '}
            <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
              test de ruta
            </a>{' '}
            te lo dice en dos minutos.
          </p>
        </Disclosure>
        <Disclosure title="¿Inviertes capital? El Pase de Inversor">
          <p>
            Con una inversión que califique puedes ir directo a la residencia permanente. Es una
            marca aparte con el mismo equipo:{' '}
            <a href="/pase-inversor" className="text-[var(--accent)] underline underline-offset-2">
              mira cómo funciona
            </a>
            .
          </p>
        </Disclosure>
        <Disclosure title="Preguntas frecuentes">
          <FAQ items={FAQ_ITEMS} />
        </Disclosure>
      </Section>

      <ArticleCards
        site={SITE}
        title="Lee antes de decidir"
        articles={latest.map((post) => ({
          title: post.frontmatter.title,
          description: post.frontmatter.description,
          href: contentHref(SITE, post.slugPath),
        }))}
        more={{ href: '/guias', label: 'Todas las guías' }}
      />

      <LeadPanel
        site={SITE}
        variant="contact"
        title="¿Listo para descubrir tu ruta?"
        intro="Cuéntanos tu caso en dos líneas. Te decimos qué ruta encaja, qué documentos necesitas y cuánto cuesta — o que esperes, si es lo mejor para ti."
        whatsappMessage="Hola, me gustaría saber más sobre la residencia en Paraguay."
      />
    </>
  );
}
