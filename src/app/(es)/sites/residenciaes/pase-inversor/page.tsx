import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/pase-inversor';

/**
 * A short bridge page (plan §6.6): the Investor Pass brand is canonical for
 * this content and is English-only (`paraguayinvestorpass.com`, plan §1.11),
 * so this page stays thin, says so, and is noindex to avoid competing with it
 * in search.
 */
export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Pase de Inversor — Residencia Permanente Directa por Inversión',
    description:
      'Sáltate la residencia temporal con una inversión que califique. El Pase de Inversor es nuestra marca dedicada para residencia permanente directa.',
    path: PATH,
    noindex: true,
  });
}

export default function Page() {
  const investorpassOrigin = siteOrigin('investorpass');
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciaes" items={[{ label: 'Pase de Inversor', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Residencia permanente en un solo paso
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          El Pase de Inversor permite que una inversión que califique se salte por completo la
          residencia temporal y vaya directa a la tarjeta permanente —{' '}
          <Fact k="investorpass.min_investment_usd" site="residenciaes" />, en cuatro rutas
          distintas, tramitado por el mismo equipo que lleva todo lo demás en este sitio.
        </p>
        <p className="mt-[var(--space-6)] text-[var(--fg-muted)]">
          Al dirigirse a un tipo de solicitante distinto —inversores, family offices, asesores de
          migración— vive en su propia marca dedicada, en inglés, con su propio detalle: rutas que
          califican, requisitos, plazos y una respuesta directa sobre si calificas.
        </p>
        <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
          <Button href={investorpassOrigin} external variant="primary">
            Visitar el sitio del Investor Pass (en inglés)
          </Button>
          <Button href="/residencia/permanente" variant="secondary">
            Ver la residencia permanente estándar
          </Button>
        </div>
        <p className="mt-[var(--space-8)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          ¿No sabes qué ruta encaja con tu capital y tu plazo?{' '}
          <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
            Haz el test de ruta
          </a>
          .
        </p>
      </Container>
    </Section>
  );
}
