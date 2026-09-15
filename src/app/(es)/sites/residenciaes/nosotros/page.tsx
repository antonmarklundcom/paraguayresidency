import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/nosotros';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Sobre Residencia Paraguay — Quién Tramita tu Caso',
    description:
      'Un equipo con base en Asunción, tramitando residencia, cédula y residencia fiscal en Paraguay cada semana. Quiénes somos y cómo trabajamos.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciaes" items={[{ label: 'Nosotros', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Un equipo en Asunción, haciendo esto cada semana
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          La residencia en Paraguay no es complicada en principio. Es complicada en los detalles —
          qué cadena de apostilla necesita un país concreto, qué documento caduca antes de qué
          cita, qué pide de verdad un banco antes de abrir una cuenta. Nos ocupamos de los detalles
          porque los manejamos constantemente, no porque sean un secreto.
        </p>

        <div className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          <div>
            <Heading level={2}>Cómo trabajamos</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Un honorario fijo por ruta, cotizado antes de que te comprometas. Una lista de
              documentos hecha para tu nacionalidad, no un PDF genérico. Y cuando la ruta estándar
              no te conviene, te lo decimos en la primera llamada — y te orientamos hacia el Pase
              de Inversor, o hacia esperar, en vez de presentar algo que no va a servirte.
            </p>
          </div>
          <div>
            <Heading level={2}>Lo que no hacemos</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              No damos cifras que no podamos respaldar — cada número legal o financiero en este
              sitio está confirmado o claramente marcado como una estimación que confirmamos en tu
              llamada. No asesoramos sobre las reglas fiscales de tu propio país; esa es una
              pregunta para tu asesor, y lo decimos en vez de adivinar.
            </p>
          </div>
          <div>
            <Heading level={2}>Si vienes por la vía Mercosur</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Si eres nacional de un país del Mercosur, revisa{' '}
              <a href="/mercosur" className="text-[var(--accent)] underline underline-offset-2">
                la vía Mercosur
              </a>{' '}
              antes de tu llamada — te decimos exactamente qué se simplifica y qué sigue igual para
              tu nacionalidad.
            </p>
          </div>
        </div>

        <div className="mt-[var(--space-16)] flex flex-wrap gap-[var(--space-3)]">
          <Button href="/contact">Contáctanos</Button>
          <Button href="/route-finder" variant="secondary">
            Descubre tu ruta
          </Button>
        </div>
      </Container>
    </Section>
  );
}
