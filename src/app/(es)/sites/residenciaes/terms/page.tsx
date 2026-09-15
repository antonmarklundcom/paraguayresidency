import type { Metadata } from 'next';
import { Container, Heading, Prose, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/terms';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Términos de Servicio — Residencia Paraguay',
    description:
      'Los términos que aplican cuando contratas a Residencia Paraguay para tu residencia, cédula o residencia fiscal.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Términos de Servicio</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">Última actualización: 09/09/2026.</p>
        <Prose className="mt-[var(--space-8)]">
          <h2>Qué ofrecemos</h2>
          <p>
            Residencia Paraguay prepara y presenta solicitudes de residencia, cédula y residencia
            fiscal en Paraguay en tu nombre. Cotizamos un honorario fijo para tu caso concreto
            antes de empezar cualquier trabajo, basándonos en la información que nos das.
          </p>
          <h2>Qué no podemos garantizar</h2>
          <p>
            Preparamos y presentamos tu caso de forma correcta y completa. La decisión de aprobar
            cualquier solicitud es exclusiva de la autoridad migratoria paraguaya, y ningún
            prestador de servicios puede garantizar el resultado ni el plazo de una decisión
            gubernamental. Te decimos con honestidad cuándo tu caso tiene algo poco habitual, en
            vez de prometer un resultado que no controlamos.
          </p>
          <h2>Honorarios</h2>
          <p>
            El honorario que te cotizamos cubre nuestro trabajo de preparación y presentación
            según lo descrito en tu encargo. Las tasas gubernamentales, los costes de mensajería,
            la apostilla y las traducciones cobradas por terceros son aparte y se comunican antes
            de incurrir en ellos.
          </p>
          <h2>Asesoría legal y fiscal</h2>
          <p>
            Somos un servicio de tramitación de residencia, no un despacho de abogados ni una
            asesoría fiscal. Cuando una pregunta necesita de verdad asesoría legal o fiscal
            específica para tu situación, lo decimos y te derivamos a un profesional cualificado en
            vez de responderla nosotros mismos.
          </p>
          <h2>Cambios</h2>
          <p>
            Podemos actualizar estos términos a medida que cambien nuestros servicios. La versión
            vigente es la publicada aquí en el momento en que nos contratas.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
