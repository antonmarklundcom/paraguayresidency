import { t } from '@/i18n';
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
  OfficeStrip,
  TeamSection,
  TrustBar,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'residenciaes' as const;
const PATH = '/nosotros';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Sobre Residencia Paraguay — Quién Tramita tu Caso',
    description:
      'Un equipo con base en Asunción, tramitando residencia, cédula y residencia fiscal en Paraguay cada semana. Quiénes somos y cómo trabajamos.',
    path: PATH,
  });
}

const link = 'text-[var(--accent)] underline underline-offset-2';

export default function Page() {
  return (
    <>
      <Band>
        <Breadcrumbs site={SITE} items={[{ label: 'Nosotros', href: PATH }]} />
        <div className="mt-10 max-w-3xl">
          <Eyebrow>Nosotros</Eyebrow>
          <Heading level={1} className="mt-4">Un equipo en Asunción, haciendo esto cada semana</Heading>
          <p className="mt-6 text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">
            La residencia en Paraguay no es complicada en principio. Es complicada en los detalles —
            qué cadena de apostilla necesita un país concreto, qué documento caduca antes de qué
            cita, qué pide de verdad un banco antes de abrir una cuenta. Nos ocupamos de los detalles
            porque los manejamos constantemente, no porque sean un secreto.
          </p>
        </div>
      </Band>

      <TrustBar site={SITE} />

      <TeamSection site={SITE} tone="alt" />
      <Band tone="alt" className="!pt-0">
        <p className="max-w-[60ch] text-[var(--fg-muted)]">{t(SITE, 'about.teamBody')}</p>
      </Band>

      <Band labelledBy="principios-title">
        <h2 id="principios-title" className="sr-only">Cómo trabajamos</h2>
        <div className="grid gap-x-12 gap-y-12 md:grid-cols-3">
          <div className="border-t-2 border-[var(--accent)] pt-6">
            <Heading level={3} className="!text-(length:--step-2)">Cómo trabajamos</Heading>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              Un honorario fijo por ruta, cotizado antes de que te comprometas. Una lista de
              documentos hecha para tu nacionalidad, no un PDF genérico. Y cuando la ruta estándar
              no te conviene, te lo decimos en tu primer mensaje — y te orientamos hacia el Pase
              de Inversor, o hacia esperar, en vez de presentar algo que no va a servirte.
            </p>
          </div>
          <div className="border-t-2 border-[var(--accent)] pt-6">
            <Heading level={3} className="!text-(length:--step-2)">Lo que no hacemos</Heading>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              No damos cifras que no podamos respaldar — cada número legal o financiero en este
              sitio está confirmado o claramente marcado como una estimación que te confirmamos
              por escrito para tu caso. No asesoramos sobre las reglas fiscales de tu propio país;
              esa es una pregunta para tu asesor, y lo decimos en vez de adivinar.
            </p>
          </div>
          <div className="border-t-2 border-[var(--accent)] pt-6">
            <Heading level={3} className="!text-(length:--step-2)">Si vienes por la vía Mercosur</Heading>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              Si eres nacional de un país del Mercosur, revisa{' '}
              <Link href="/mercosur" className={link}>la vía Mercosur</Link>{' '}
              antes de escribirnos — te decimos exactamente qué se simplifica y qué sigue igual
              para tu nacionalidad. ¿No sabes si tu país entra? Mira la{' '}
              <Link href="/guias/por-pais" className={link}>guía por nacionalidad</Link>.
            </p>
          </div>
        </div>
      </Band>

      <Guarantee site={SITE} tone="alt" />
      <OfficeStrip site={SITE} />
      <AfterYouMessage site={SITE} tone="alt" />

      <Band>
        <div className="flex flex-wrap gap-3">
          <Button href="/contact">Contáctanos</Button>
          <Button href="/route-finder" variant="secondary">Descubre tu ruta</Button>
        </div>
      </Band>
    </>
  );
}
