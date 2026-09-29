import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AfterYouMessage,
  ArticleCards,
  Band,
  Button,
  Disclosure,
  Eyebrow,
  Fact,
  FAQ,
  Guarantee,
  Heading,
  HeroContact,
  IntentTiles,
  LeadPanel,
  PhotoHero,
  PriceTable,
  Section,
  SectionHeader,
  TeamSection,
  TrustBar,
  heroTrust,
  Testimonials,
  CaseSnapshots,
} from '@/components';
import { curatedArticles } from '@/lib/curated-articles';
import { siteMetadata } from '@/lib/metadata';
import { t } from '@/i18n';
import { NationalityPicker } from './_lib/por-pais';

const SITE = 'residenciaes' as const;

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'home.metaTitle'),
    description: t(SITE, 'home.metaDescription'),
    path: '/',
  });
}

const FAQ_ITEMS = [
  {
    question: '¿Cómo sé qué ruta me conviene?',
    answer:
      'Mira primero tu nacionalidad: si tu país está en la lista Mercosur, tu ruta suele ser la residencia Mercosur; si no, la residencia temporal general. Para confirmarlo, haz el test de ruta —seis preguntas, dos minutos— o escríbenos y te lo decimos directamente, incluido cuándo la ruta estándar no te conviene.',
  },
  {
    question: '¿Cuánto cuesta esto?',
    answer:
      'Un honorario fijo por ruta, cotizado por escrito antes de que te comprometas, más las tasas oficiales, que van directas al Estado. La página de precios explica qué incluye cada ruta y qué no.',
  },
  {
    question: '¿Tengo que mudarme a Paraguay para conseguir la residencia?',
    answer:
      'No. Tienes que asistir en persona a las citas, que agendamos juntos, pero la mudanza completa es decisión tuya, no un requisito de la residencia en sí.',
  },
  {
    question: '¿Y si mi caso es poco habitual?',
    answer:
      'Cuéntanoslo en tu primer mensaje. Preferimos orientarte hacia el Pase de Inversor, o decirte que esperes, antes que presentar algo que no sirva a tu caso.',
  },
];

const link = 'text-[var(--accent)] underline underline-offset-2';
const label = 'text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--fg-muted)]';

export default function Page() {
  const actions = (
    <>
      <Button href="/guias/por-pais">Elige tu nacionalidad</Button>
      <HeroContact site={SITE} message="Hola, me gustaría saber más sobre la residencia en Paraguay." fallbackHref="#contact" />
    </>
  );

  const guides = curatedArticles(SITE, [
    { slugPath: 'documentos/cuanto-cuesta-la-residencia-en-paraguay', eyebrow: 'Costes' },
    { slugPath: 'documentos/como-obtener-la-residencia-en-paraguay-paso-a-paso', eyebrow: 'Paso a paso' },
    { slugPath: 'comparativas/residencia-mercosur-o-residencia-temporal', eyebrow: 'Mercosur' },
    { slugPath: 'comparativas/paraguay-vs-espana', eyebrow: 'Comparativa' },
    { slugPath: 'vivir-en-paraguay/costo-de-vida-en-paraguay', eyebrow: 'Vivir aquí' },
    { slugPath: 'impuestos/sistema-tributario-territorial', eyebrow: 'Impuestos' },
  ]);

  return (
    <>
      <PhotoHero
        image="residenciaes-hero-cafe-arcade-plaza"
        locale="es"
        focus="62% center"
        video={{ id: 'residenciaes-hero-cafe-arcade-plaza' }}
        eyebrow="Residencia en Paraguay"
        title="Residencia en Paraguay, sin vueltas."
        sub="Dinos de qué país eres y te decimos tu ruta, tus documentos y tu honorario fijo, por escrito, antes de que decidas nada. Tú vienes a las citas; el resto lo hacemos nosotros, desde Asunción."
        actions={actions}
        trust={heroTrust(SITE)}
      />

      <TrustBar site={SITE} />

      <Band tone="alt" labelledBy="pais-title" data-nationality-picker>
        <SectionHeader
          id="pais-title"
          eyebrow="Por país"
          title="¿De dónde eres?"
          intro="Tu pasaporte decide más de lo que parece: la ruta, quién emite tus certificados y dónde se apostillan. Elige tu país y lo vemos con tu caso."
          aside={<Link href="/guias/por-pais" className={`inline-flex min-h-11 items-center gap-2 font-medium ${link}`}>Todas las nacionalidades <span aria-hidden="true">→</span></Link>}
        />
        <NationalityPicker />
      </Band>

      <Band labelledBy="mercosur-title" data-mercosur-block>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          <div>
            <Eyebrow>Vía Mercosur</Eyebrow>
            <h2 id="mercosur-title" className="mt-4 font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">
              Si tu país está en el Mercosur, empieza por aquí.
            </h2>
            <p className="mt-5 max-w-[52ch] text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">
              Es la ruta corta: menos papeles y una tasa oficial reducida. Antes de nada te decimos si tu nacionalidad entra, porque la lista no es la que mucha gente supone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/mercosur">Ver la vía Mercosur</Button>
              <Button href="/route-finder" variant="secondary">Hacer el test de ruta</Button>
            </div>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--border)] shadow-[var(--elev-1)]">
            <div className="bg-[var(--surface)] p-6 md:p-8">
              <dt className={label}>La ruta</dt>
              <dd className="mt-2 leading-relaxed first-letter:uppercase"><Fact k="mercosur.residency_route" site={SITE} /></dd>
            </div>
            <div className="bg-[var(--surface)] p-6 md:p-8">
              <dt className={label}>La tasa oficial</dt>
              <dd className="mt-2 leading-relaxed first-letter:uppercase"><Fact k="fees.mercosur_residency" site={SITE} /></dd>
            </div>
            <div className="bg-[var(--surface)] p-6 md:p-8">
              <dt className={label}>El plazo que no se puede perder</dt>
              <dd className="mt-2 leading-relaxed first-letter:uppercase"><Fact k="mercosur.conversion_deadline" site={SITE} /></dd>
            </div>
          </dl>
        </div>
      </Band>

      <PriceTable
        site={SITE}
        tone="alt"
        routes={['temporary', 'permanent', 'cedula']}
        title="Un honorario fijo por trámite, por escrito antes de empezar"
        intro="Sabes lo que pagas antes de empezar. Las tasas oficiales van directas al Estado y se detallan aparte, así que nada queda escondido en nuestro honorario."
      />

      <IntentTiles
        locale="es"
        title="¿Qué necesitas resolver?"
        intro="Cuatro puntos de partida. Si no lo tienes claro, el test de ruta te orienta en dos minutos."
        tiles={[
          { label: 'Residencia temporal', note: 'El primer paso habitual', href: '/residencia/temporal', image: 'residenciaes-tile-esquina-centro-historico' },
          { label: 'Documentos y apostillas', note: 'En el orden en que caducan', href: '/guias/documentos', image: 'residenciaes-tile-pasaporte-apostilla' },
          { label: 'Residencia permanente', note: 'Con la regla de presencia clara', href: '/residencia/permanente', image: 'residenciaes-tile-llaves-puerta-colonial' },
          { label: 'Vía Mercosur', note: 'Si tu país está en la lista', href: '/mercosur', image: 'residenciaes-tile-terminal-omnibus-viajeros' },
        ]}
      />

      <AfterYouMessage
        site={SITE}
        tone="alt"
        message="Hola, me gustaría saber más sobre la residencia en Paraguay."
      />

      <ArticleCards
        site={SITE}
        title="Lo que más nos preguntan"
        articles={guides}
        more={{ href: '/guias', label: 'Todas las guías' }}
      />

      <TeamSection site={SITE} tone="alt" />
      <Testimonials site={SITE} tone="alt" />
      <CaseSnapshots site={SITE} />

      <Guarantee site={SITE} />

      <Section width="narrow">
        <Heading level={2} className="mb-[var(--space-6)]">Los detalles</Heading>
        <Disclosure title="Para quién es esto">
          <p>
            Personas que se trasladan por trabajo, jubilación o familia; nómadas y autónomos que
            quieren una base legal y un RUC que puedan usar de verdad; nacionales del Mercosur con
            una vía propia (busca tu país en la <Link href="/guias/por-pais" className={link}>guía por nacionalidad</Link>);
            e inversores que prefieren ir directos a la permanente. Si no sabes cuál de estos eres,
            el <Link href="/route-finder" className={link}>test de ruta</Link> te lo dice en dos minutos.
          </p>
        </Disclosure>
        <Disclosure title="¿Inviertes capital? El Pase de Inversor">
          <p>
            Con una inversión que califique puedes ir directo a la residencia permanente. Es una
            marca aparte con el mismo equipo:{' '}
            <Link href="/pase-inversor" className={link}>mira cómo funciona</Link>.
          </p>
        </Disclosure>
        <Disclosure title="¿Vienes de España?">
          <p>
            Tenemos guías pensadas para quien sale de España: los certificados y la apostilla, el
            ángulo fiscal y la comparación con quedarse.{' '}
            <Link href="/guias/documentos/documentos-y-apostillas-para-espanoles" className={link}>Documentos y apostillas para españoles</Link>,{' '}
            <Link href="/guias/impuestos/irse-de-espana-a-paraguay-fiscalidad" className={link}>irse de España a Paraguay: fiscalidad</Link> y{' '}
            <Link href="/guias/vivir-en-paraguay/vivir-en-paraguay-siendo-espanol" className={link}>vivir en Paraguay siendo español</Link>.
          </p>
        </Disclosure>
        <Disclosure title="Preguntas frecuentes">
          <FAQ items={FAQ_ITEMS} />
        </Disclosure>
      </Section>

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
