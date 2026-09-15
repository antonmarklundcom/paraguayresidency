import type { Metadata } from 'next';
import {
  Bento,
  Button,
  Card,
  Container,
  Fact,
  FAQ,
  Heading,
  Section,
  SplitHero,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Residencia en Paraguay para Españoles — Temporal, Permanente y Cédula',
    description:
      'Trámite de residencia en Paraguay llave en mano. Honorarios fijos en euros, documentos según tu nacionalidad, citas en Asunción. Descubre tu ruta en 2 minutos.',
    path: '/',
  });
}

const ROUTES = [
  {
    eyebrow: 'Residencia temporal',
    title: 'El primer paso habitual',
    body: 'Dos años, y después permanente.',
    href: '/residencia/temporal',
  },
  {
    eyebrow: 'Residencia permanente',
    title: 'Cédula de larga duración',
    body: 'Con reglas de presencia — te las explicamos.',
    href: '/residencia/permanente',
  },
  {
    eyebrow: 'Pase de Inversor',
    title: 'Directo a la permanente',
    body: 'Con una inversión que califique. Marca aparte, mismo equipo.',
    href: '/pase-inversor',
  },
];

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

export default function Page() {
  const actions = (
    <>
      <Button href="/route-finder">Descubre tu ruta</Button>
      <Button href="/contact" variant="secondary">
        Habla con nosotros
      </Button>
    </>
  );

  return (
    <>
      <SplitHero
        eyebrow="Residencia Paraguay"
        title="Residencia en Paraguay, sin vueltas."
        sub="Residencia temporal, permanente y cédula, tramitadas por un equipo que lo hace cada semana en Asunción. Tú vienes a las citas. Nosotros hacemos el resto."
        actions={actions}
        aside={
          <ul className="space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>Un honorario fijo por trámite, cotizado en euros antes de que te comprometas.</li>
            <li>
              Lista de documentos según tu nacionalidad: apostillas, traducciones y plazos reales,
              no un PDF genérico.
            </li>
            <li>Si Paraguay no te conviene, fiscalmente o de otra forma, te lo decimos en la primera llamada.</li>
          </ul>
        }
      />

      <Section>
        <Container width="narrow">
          <Heading level={2}>Para quién es esto</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Personas que se trasladan por trabajo, jubilación o familia; nómadas y autónomos que
            quieren una base legal y un RUC que puedan usar de verdad; nacionales del Mercosur con
            una vía propia; e inversores que prefieren ir directos a la permanente. Si no sabes
            cuál de estos eres, el{' '}
            <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
              test de ruta
            </a>{' '}
            te lo dice en dos minutos.
          </p>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <Heading level={2}>Tres rutas, un equipo</Heading>
          <div className="mt-[var(--space-8)]">
            <Bento>
              {ROUTES.map((route) => (
                <Card key={route.href} eyebrow={route.eyebrow} title={route.title} href={route.href}>
                  {route.body}
                </Card>
              ))}
            </Bento>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <Heading level={2}>Cómo funciona</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Una llamada para confirmar tu ruta y tu honorario, un listado de documentos hecho para
            tu nacionalidad, legalización en el orden correcto, presentación y citas en Asunción, y
            por último la cédula una vez aprobada la residencia. Consulta el{' '}
            <a href="/proceso" className="text-[var(--accent)] underline underline-offset-2">
              proceso completo, paso a paso
            </a>
            .
          </p>
        </Container>
      </Section>

      <Section tone="accent">
        <Container width="narrow">
          <Heading level={2}>Por qué Paraguay</Heading>
          <ul className="mt-[var(--space-6)] space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>
              La residencia temporal dura <Fact k="temporary.duration" site="residenciaes" />, una
              de las vías estándar más accesibles que existen.
            </li>
            <li>
              La permanente lleva <Fact k="permanent.presence_rule" site="residenciaes" /> — te
              explicamos exactamente qué significa para tu forma de viajar.
            </li>
            <li>
              Si eres nacional del Mercosur, hay{' '}
              <Fact k="mercosur.residency_route" site="residenciaes" /> —{' '}
              <a href="/mercosur" className="text-[var(--accent)] underline underline-offset-2">
                mira si te aplica
              </a>
              .
            </li>
          </ul>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <FAQ title="Preguntas frecuentes" items={FAQ_ITEMS} />
        </Container>
      </Section>

      <Section tone="alt">
        <Container width="narrow" className="text-center">
          <Heading level={2}>¿Listo para descubrir tu ruta?</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Dos minutos te dicen qué ruta encaja. O salta directo a una llamada.
          </p>
          <div className="mt-[var(--space-8)] flex flex-wrap justify-center gap-[var(--space-3)]">
            {actions}
          </div>
        </Container>
      </Section>
    </>
  );
}
