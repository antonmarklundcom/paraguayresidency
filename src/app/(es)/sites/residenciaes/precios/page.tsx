import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AfterYouMessage,
  Band,
  Breadcrumbs,
  Button,
  Eyebrow,
  Guarantee,
  Heading,
  LeadForm,
  PriceTable,
  SectionHeader,
  StickyCta,
  TrustBar,
  CompareTable,
  Testimonials,
  CaseSnapshots,
  FromPrice,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { termLabel, textLink } from '@/lib/text-styles';

const SITE = 'residenciaes' as const;
const PATH = '/precios';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Precios de la residencia en Paraguay: honorarios fijos',
    description:
      'Lo que cuestan nuestros trámites de residencia en Paraguay: honorarios fijos, cotizados por escrito para tu caso antes de que te comprometas.',
    path: PATH,
  });
}

const link = textLink;
const term = termLabel;

function Detail({ id, route, title, href, children }: {
  id: string; route: string; title: string; href: string; children: React.ReactNode;
}) {
  return (
    <section data-route-section={route} aria-labelledby={id} className="border-t border-[var(--border)] py-10">
      <Heading level={2} id={id} className="!text-(length:--step-2)">
        <Link href={href} className={link}>{title}</Link>
      </Heading>
      {children}
    </section>
  );
}

export default function Page() {
  return (
    <>
      <Band>
        <Breadcrumbs site={SITE} items={[{ label: 'Precios', href: PATH }]} />
        <div className="mt-10 max-w-3xl">
          <Eyebrow>Precios</Eyebrow>
          <Heading level={1} className="mt-4">Un honorario fijo, con los gastos separados claros antes de decidir</Heading>
          <p className="mt-6 text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">
            La cotización empieza con un mensaje —por WhatsApp o el formulario— sobre tu nacionalidad,
            documentos, ruta y planes de viaje. Acordamos el trabajo y el honorario fijo por escrito antes
            de que te comprometas. No hay calculadora automática: el alcance depende de los documentos y
            de las personas que solicitan.
          </p>
          <div data-service-cta className="mt-8 flex flex-wrap gap-3">
            <Button href="#inquiry">Habla con nosotros</Button>
            <Button href="/route-finder" variant="secondary">Descubre tu ruta</Button>
          </div>
        </div>
      </Band>

      <TrustBar site={SITE} />

      <PriceTable
        site={SITE}
        tone="alt"
        routes={['temporary', 'permanent', 'cedula']}
        title="Las tres rutas, lado a lado"
        intro="Nuestro honorario y las tasas oficiales, por separado, y qué incluye cada ruta. Pide el presupuesto por escrito con el botón de cada fila."
      />

      <Band labelledBy="detalle-title">
        <SectionHeader id="detalle-title" eyebrow="El detalle" title="Qué cubre cada honorario y cómo cotizamos" />
        <div className="mt-10 max-w-3xl">
          <section data-fee-terms className="rounded-[var(--radius-brand)] bg-[var(--surface-alt)] p-6 md:p-8">
            <Heading level={2} className="!text-(length:--step-2)">Qué cubre cada honorario</Heading>
            <p className="mt-4">La preparación, coordinación y orientación acordadas para tu ruta, descritas abajo.</p>
            <dl className="mt-4 space-y-4">
              <div><dt className="font-semibold">Qué nunca incluye</dt><dd>Las tasas públicas, apostillas y traducciones necesarias nunca están incluidas en nuestro honorario. Identificamos qué gastos documentales corresponden a esta solicitud antes de que decidas.</dd></div>
              <div><dt className="font-semibold">Qué pagas al Estado y qué nos pagas a nosotros</dt><dd>Pagas las tasas oficiales aplicables a la solicitud directamente al Estado paraguayo. Nos pagas por la preparación y coordinación descritas aquí. Las apostillas y traducciones se pagan por separado a sus proveedores.</dd></div>
            </dl>
            <p className="mt-4">El asesoramiento de tu propio asesor se paga aparte. Para el RUC, te confirmamos por escrito si corresponde alguna tasa oficial de alta.</p>
          </section>

          <Detail id="temporary" route="temporary" title="Residencia temporal" href="/residencia/temporal">
            <dl className="mt-4 space-y-3">
              <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Preparamos la lista de documentos según tu nacionalidad, coordinamos las citas en Asunción y presentamos la solicitud temporal. Ordenar los documentos para las citas forma parte del trabajo.</dd></div>
              <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En tu primer mensaje revisamos tu nacionalidad y los documentos que ya tienes antes de cotizar la presentación. También revisamos si corresponde evaluar la vía Mercosur.</dd></div>
            </dl>
          </Detail>

          <Detail id="permanent" route="permanent" title="Residencia permanente" href="/residencia/permanente">
            <dl className="mt-4 space-y-3">
              <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Presentamos la solicitud permanente cuando calificas, explicamos la regla de presencia para tus viajes y coordinamos los tiempos con la renovación de tu cédula.</dd></div>
              <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En tu primer mensaje revisamos tu estatus y si calificas, y cotizamos la solicitud permanente por separado de cualquier trámite temporal anterior.</dd></div>
            </dl>
          </Detail>

          <Detail id="cedula" route="cedula" title="Cédula de identidad" href="/residencia/cedula">
            <dl className="mt-4 space-y-3">
              <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Coordinamos la solicitud tras aprobarse la residencia, incluidas las citas, la foto y los datos biométricos. Te avisamos sobre los tiempos de renovación.</dd></div>
              <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En tu primer mensaje revisamos en qué etapa está tu residencia y si la coordinación de la cédula ya figura en tu cotización, para no cotizar el mismo trabajo de nuevo.</dd></div>
            </dl>
          </Detail>

          <Detail id="tax_residency" route="tax_residency" title="Residencia fiscal y RUC" href="/residencia-fiscal">
            <p className="mt-4">
              <span className={term}>Honorario del servicio</span><br />
              <span className="font-medium first-letter:uppercase"><FromPrice site={SITE} route="tax_residency" /></span>
            </p>
            <dl className="mt-3 space-y-3">
              <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Damos de alta tu RUC y explicamos el sistema territorial en términos generales, coordinando el trabajo administrativo con tu trámite de residencia.</dd></div>
              <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En tu primer mensaje nos cuentas tu actividad y el alta de RUC que necesitas. Las obligaciones en España o en tu país de origen las revisas con tu propio asesor.</dd></div>
            </dl>
          </Detail>

          <Detail id="family" route="family" title="Trámite familiar" href="/familia">
            <p className="mt-4">
              <span className={term}>Honorario del servicio</span><br />
              <span className="font-medium first-letter:uppercase"><FromPrice site={SITE} route="family" /></span>
            </p>
            <dl className="mt-3 space-y-3">
              <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Coordinamos la lista de documentos de cada familiar, aclaramos quién puede solicitar como dependiente y agrupamos las citas cuando la oficina lo permite. Cada persona necesita su propio expediente.</dd></div>
              <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En tu primer mensaje revisamos a cada familiar y sus documentos. Cotizamos el servicio por persona adicional junto con el del solicitante principal, identificando a quién cubre.</dd></div>
            </dl>
          </Detail>

          <p className="border-t border-[var(--border)] pt-8">
            La <Link href="/mercosur" className={link}>vía Mercosur</Link> se evalúa dentro de la cotización de residencia según tu nacionalidad y documentación. Si eres de un país de la lista, empieza por la{' '}
            <Link href="/guias/por-pais" className={link}>guía por nacionalidad</Link>.
          </p>
          <p className="mt-6">
            <Link href="/pase-inversor" className={link}>El Pase de Inversor tiene su propio alcance y cotización en nuestra marca hermana. Consulta la ruta del Pase de Inversor.</Link>
          </p>
        </div>
      </Band>
      <CompareTable site={SITE} />

      <AfterYouMessage site={SITE} tone="alt" />
      <Testimonials site={SITE} tone="alt" />
      <CaseSnapshots site={SITE} />

      <Guarantee site={SITE} />

      <Band tone="alt" labelledBy="inquiry-title" id="inquiry">
        <div className="mx-auto max-w-3xl rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--elev-1)] md:p-10">
          <Heading level={2} id="inquiry-title">Recibe tu cotización por escrito</Heading>
          <p className="mt-4">Dinos tu nacionalidad, ruta y plazo. Confirmamos el alcance por escrito y después detallamos el honorario fijo y los gastos separados, antes de que decidas.</p>
          <div className="mt-6"><Button href="/contact">Escríbenos</Button></div>
          <div className="mt-8"><LeadForm site={SITE} variant="consultation" pagePath={PATH} /></div>
        </div>
      </Band>
      <StickyCta formId="inquiry" label="Escríbenos" />
    </>
  );
}
