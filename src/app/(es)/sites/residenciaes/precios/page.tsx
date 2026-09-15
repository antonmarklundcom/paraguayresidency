import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Fact, Heading, LeadForm, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/precios';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Precios de la Residencia en Paraguay — Honorarios Fijos, Cotizados Antes',
    description:
      'Lo que cuestan nuestros trámites de residencia en Paraguay. Honorarios fijos, cotizados antes de que te comprometas — cifras reales confirmadas en tu llamada hasta que se publiquen aquí.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciaes" items={[{ label: 'Precios', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">Un honorario fijo, con los gastos separados claros antes de decidir</Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">La cotización empieza con una llamada sobre tu nacionalidad, documentos, ruta y planes de viaje. Acordamos el trabajo y el honorario fijo antes de que te comprometas. No hay calculadora automática: el alcance depende de los documentos y de las personas que solicitan.</p>
        <section className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="temporary">
          <Heading level={2} id="temporary"><a href="/residencia/temporal" className="text-[var(--accent)] underline">Residencia temporal</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorario del servicio: <Fact k="pricing.temporary" site="residenciaes" /></p>
          <dl className="mt-[var(--space-6)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Preparamos la lista de documentos según tu nacionalidad, coordinamos las citas en Asunción y presentamos la solicitud temporal. Ordenar los documentos para las citas forma parte del trabajo.</dd></div>
            <div><dt className="font-semibold">Qué nunca incluye</dt><dd>Las tasas públicas, apostillas y traducciones necesarias nunca están incluidas en nuestro honorario. Identificamos qué gastos documentales corresponden a esta solicitud antes de que decidas.</dd></div>
            <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En la llamada revisamos tu nacionalidad y los documentos que ya tienes antes de cotizar la presentación. También revisamos si corresponde evaluar la vía Mercosur.</dd></div>
            <div><dt className="font-semibold">Qué pagas al Estado y qué nos pagas a nosotros</dt><dd>Pagas las tasas oficiales aplicables a la solicitud directamente al Estado paraguayo. Nos pagas por la preparación y coordinación descritas aquí. Las apostillas y traducciones se pagan por separado a sus proveedores.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="permanent">
          <Heading level={2} id="permanent"><a href="/residencia/permanente" className="text-[var(--accent)] underline">Residencia permanente</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorario del servicio: <Fact k="pricing.permanent" site="residenciaes" /></p>
          <dl className="mt-[var(--space-6)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Presentamos la solicitud permanente cuando calificas, explicamos la regla de presencia para tus viajes y coordinamos los tiempos con la renovación de tu cédula.</dd></div>
            <div><dt className="font-semibold">Qué nunca incluye</dt><dd>Las tasas públicas, apostillas y traducciones necesarias nunca están incluidas en nuestro honorario. Identificamos qué gastos documentales corresponden a esta solicitud antes de que decidas.</dd></div>
            <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En la llamada revisamos tu estatus y si calificas, y cotizamos la solicitud permanente por separado de cualquier trámite temporal anterior.</dd></div>
            <div><dt className="font-semibold">Qué pagas al Estado y qué nos pagas a nosotros</dt><dd>Pagas las tasas oficiales aplicables a la solicitud directamente al Estado paraguayo. Nos pagas por la preparación y coordinación descritas aquí. Las apostillas y traducciones se pagan por separado a sus proveedores.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="cedula">
          <Heading level={2} id="cedula"><a href="/residencia/cedula" className="text-[var(--accent)] underline">Cédula de identidad</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorario del servicio: <Fact k="pricing.cedula" site="residenciaes" /></p>
          <dl className="mt-[var(--space-6)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Coordinamos la solicitud tras aprobarse la residencia, incluidas las citas, la foto y los datos biométricos. Te avisamos sobre los tiempos de renovación.</dd></div>
            <div><dt className="font-semibold">Qué nunca incluye</dt><dd>Las tasas públicas, apostillas y traducciones necesarias nunca están incluidas en nuestro honorario. Identificamos qué gastos documentales corresponden a esta solicitud antes de que decidas.</dd></div>
            <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En la llamada revisamos en qué etapa está tu residencia y si la coordinación de la cédula ya figura en tu cotización, para no cotizar el mismo trabajo de nuevo.</dd></div>
            <div><dt className="font-semibold">Qué pagas al Estado y qué nos pagas a nosotros</dt><dd>Pagas las tasas oficiales aplicables a la solicitud directamente al Estado paraguayo. Nos pagas por la preparación y coordinación descritas aquí. Las apostillas y traducciones se pagan por separado a sus proveedores.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="tax_residency">
          <Heading level={2} id="tax_residency"><a href="/residencia-fiscal" className="text-[var(--accent)] underline">Residencia fiscal y RUC</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorario del servicio: <Fact k="pricing.tax_residency" site="residenciaes" /></p>
          <dl className="mt-[var(--space-6)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Damos de alta tu RUC y explicamos el sistema territorial en términos generales, coordinando el trabajo administrativo con tu trámite de residencia.</dd></div>
            <div><dt className="font-semibold">Qué nunca incluye</dt><dd>El honorario no cubre el asesoramiento de tu propio asesor ni los pagos al Estado. Las apostillas y traducciones necesarias son gastos separados; confirmamos si corresponden a tu caso.</dd></div>
            <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En la llamada hablamos de tu actividad y del alta de RUC que necesitas. Las obligaciones en España o en tu país de origen las revisas con tu propio asesor.</dd></div>
            <div><dt className="font-semibold">Qué pagas al Estado y qué nos pagas a nosotros</dt><dd>Nos pagas por el alta de RUC y la orientación acordadas. Cualquier tasa oficial aplicable se paga directamente al Estado paraguayo; la identificamos en la llamada sin dar por hecho que exista una tasa de alta.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-12)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="family">
          <Heading level={2} id="family"><a href="/familia" className="text-[var(--accent)] underline">Trámite familiar</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorario del servicio: <Fact k="pricing.family" site="residenciaes" /></p>
          <dl className="mt-[var(--space-6)] space-y-[var(--space-4)]">
            <div><dt className="font-semibold">Qué cubre el honorario fijo</dt><dd>Coordinamos la lista de documentos de cada familiar, aclaramos quién puede solicitar como dependiente y agrupamos las citas cuando la oficina lo permite. Cada persona necesita su propio expediente.</dd></div>
            <div><dt className="font-semibold">Qué nunca incluye</dt><dd>Las tasas públicas, apostillas y traducciones necesarias nunca están incluidas en nuestro honorario. Identificamos qué gastos documentales corresponden a esta solicitud antes de que decidas.</dd></div>
            <div><dt className="font-semibold">Cómo cotizamos esta ruta</dt><dd>En la llamada revisamos a cada familiar y sus documentos. Cotizamos el servicio por persona adicional junto con el del solicitante principal, identificando a quién cubre.</dd></div>
            <div><dt className="font-semibold">Qué pagas al Estado y qué nos pagas a nosotros</dt><dd>Pagas las tasas oficiales aplicables a la solicitud directamente al Estado paraguayo. Nos pagas por la preparación y coordinación descritas aquí. Las apostillas y traducciones se pagan por separado a sus proveedores.</dd></div>
          </dl>
        </section>
        <p className="mt-[var(--space-6)]">La <a href="/mercosur" className="underline">vía Mercosur</a> se evalúa dentro de la cotización de residencia según tu nacionalidad y documentación.</p>
        <p className="mt-[var(--space-8)]"><a href="/pase-inversor" className="text-[var(--accent)] underline">El Pase de Inversor tiene su propio alcance y cotización en nuestra marca hermana. Consulta la ruta del Pase de Inversor.</a></p>
        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Recibe tu cotización por escrito</Heading>
          <p className="mt-[var(--space-4)]">Dinos tu nacionalidad, ruta y plazo. En la llamada confirmamos el alcance y después detallamos por escrito el honorario fijo y los gastos separados, antes de que decidas.</p>
          <div className="mt-[var(--space-6)]"><Button href="/contact">Solicitar una llamada</Button></div>
          <div className="mt-[var(--space-8)]"><LeadForm site="residenciaes" variant="consultation" pagePath={PATH} /></div>
        </div>
      </Container>
    </Section>
  );
}
