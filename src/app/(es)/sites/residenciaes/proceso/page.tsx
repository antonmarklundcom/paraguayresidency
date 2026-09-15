import type { Metadata } from 'next';
import { Breadcrumbs, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/proceso';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'El Proceso de Residencia en Paraguay, Paso a Paso',
    description:
      'De la primera llamada a la cédula en mano: el proceso de residencia en Paraguay paso a paso, con la lista de documentos y qué pasa en cada etapa.',
    path: PATH,
  });
}

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: '1. La llamada',
    body: 'Preguntamos por tu nacionalidad, tu objetivo y tu plazo, te decimos qué ruta encaja, y cotizamos tu honorario fijo — antes de presentar nada.',
  },
  {
    title: '2. Tu lista de documentos',
    body: 'Hecha para tu nacionalidad concreta: qué oficinas de antecedentes se aceptan, qué cadena de apostilla aplica, qué traducciones reconoce de verdad la oficina de migraciones paraguaya. Te decimos por cuál empezar porque es el más lento.',
  },
  {
    title: '3. Legalización',
    body: 'Apostillas y traducciones juradas, ordenadas para que nada caduque antes de su cita. Aquí es donde ocurren la mayoría de los retrasos cuando nadie gestiona el orden — nosotros lo gestionamos.',
  },
  {
    title: '4. Presentación y citas',
    body: 'Agendamos las citas en Asunción y presentamos tu solicitud. Cuando hay familia de por medio, agendamos a todos juntos siempre que la oficina lo permita.',
  },
  {
    title: '5. Aprobación y cédula',
    body: 'Una vez aprobada la residencia, sigue la solicitud de la cédula. Se emite dentro de una ventana que confirmamos, no que prometemos, y te mantenemos al tanto en vez de dejarte revisando una página de estado.',
  },
  {
    title: '6. Lo que viene después',
    body: 'La residencia temporal cumple su plazo, tras el cual la mayoría de nuestros clientes solicita la permanente. Algunos, tras conocer el país, miran el Pase de Inversor en su lugar. Seguimos contigo en cualquiera de los dos casos.',
  },
];

const DOCUMENT_CHECKLIST = [
  'Certificado de nacimiento, apostillado',
  'Antecedentes penales de tu país de residencia, apostillados',
  'Prueba de medios (varía según la ruta — confirmamos qué califica para la tuya)',
  'Traducciones juradas de cada documento en idioma extranjero',
  'Pasaporte, vigente durante todo el trámite',
  'Certificado de matrimonio y documentos de dependientes, si presentas como familia',
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciaes" items={[{ label: 'Proceso', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Qué pasa realmente, paso a paso
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Ningún paso aquí se oculta hasta que ya has pagado por él. Este es el proceso completo,
          en el orden en que ocurre de verdad, para la residencia temporal, la permanente y la
          cédula que las sigue.
        </p>

        <ol className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          {STEPS.map((step) => (
            <li key={step.title} className="border-l-2 border-[var(--accent)] pl-[var(--space-6)]">
              <Heading level={3}>{step.title}</Heading>
              <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-[var(--space-16)]">
          <Heading level={2}>La lista de documentos, de un vistazo</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            La versión genérica, para orientarte. Tu lista real se construye según tu nacionalidad
            — consulta{' '}
            <a href="/guias/documentos/que-necesitas-para-solicitar" className="text-[var(--accent)] underline underline-offset-2">
              qué necesitas antes de solicitar
            </a>
            .
          </p>
          <ul className="mt-[var(--space-6)] list-disc space-y-[var(--space-2)] pl-6 text-[var(--fg-muted)]">
            {DOCUMENT_CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="mt-[var(--space-12)] text-[var(--fg-muted)]">
          La residencia temporal dura <Fact k="temporary.duration" site="residenciaes" />, y la
          cédula <Fact k="cedula.timeline" site="residenciaes" />. ¿Listo para empezar?{' '}
          <a href="/contact" className="text-[var(--accent)] underline underline-offset-2">
            Cuéntanos tu caso
          </a>{' '}
          o haz primero el{' '}
          <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
            test de ruta
          </a>
          .
        </p>
      </Container>
    </Section>
  );
}
