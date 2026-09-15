import type { Metadata } from 'next';
import { Breadcrumbs, Container, Fact, FAQ, Heading, LeadForm, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/mercosur';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Residencia Mercosur en Paraguay — Quién Califica',
    description:
      'La vía Mercosur para argentinos, uruguayos y otros nacionales del bloque: qué simplifica de verdad y qué sigue igual. Sin promesas sin confirmar.',
    path: PATH,
  });
}

const FAQ_ITEMS = [
  {
    question: '¿Tener nacionalidad Mercosur me da la residencia automáticamente?',
    answer:
      'No es automática — sigue siendo un trámite. Lo que cambia es qué parte del camino se simplifica, y eso depende de tu nacionalidad y tu caso concreto, que revisamos contigo antes de presentar nada.',
  },
  {
    question: '¿Qué países entran en esta vía?',
    answer:
      'Los Estados parte y asociados del Mercosur — Argentina, Uruguay, Brasil, Chile y otros según el acuerdo vigente. Confirmamos si tu nacionalidad concreta califica en la primera llamada.',
  },
  {
    question: '¿Sigo necesitando apostillar y traducir documentos?',
    answer:
      'En la mayoría de los casos, sí, aunque la lista puede ser más corta que la de un solicitante fuera del bloque. Te damos el listado real para tu nacionalidad, no una lista genérica.',
  },
  {
    question: '¿Esta vía me sirve si vengo de España?',
    answer:
      'No — la vía Mercosur es para nacionales del bloque. Si vienes de España, tu camino es la residencia temporal o permanente estándar, que explicamos en el resto del sitio.',
  },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciaes" items={[{ label: 'Mercosur', href: PATH }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>La vía Mercosur: quién califica y qué simplifica</Heading>
          <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
            Si eres nacional de un país del Mercosur, hay{' '}
            <Fact k="mercosur.residency_route" site="residenciaes" />.
            No es una entrada automática ni un trámite distinto de cero — es el mismo proceso, con
            algunas piezas más sencillas para ciertas nacionalidades. Te decimos exactamente cuáles
            aplican a la tuya antes de que presentes nada.
          </p>
        </header>

        <div className="mt-[var(--space-12)] space-y-[var(--space-8)] text-[var(--fg-muted)]">
          <div>
            <Heading level={2}>Lo que de verdad cambia</Heading>
            <p className="mt-[var(--space-2)]">
              El acuerdo de residencia del Mercosur se implementa a través de normas nacionales que
              cambian con el tiempo, así que nunca lo publicamos como un derecho fijo. Lo que sí
              podemos decirte es qué partes del trámite —qué documentos, qué plazos, qué
              antecedentes se piden— tiende a simplificarse para nacionales del bloque frente a
              otros solicitantes, y lo confirmamos para tu nacionalidad concreta en la llamada.
            </p>
          </div>
          <div>
            <Heading level={2}>Lo que no cambia</Heading>
            <p className="mt-[var(--space-2)]">
              La cédula sigue el mismo camino tras la aprobación de tu residencia. La regla de
              presencia de la residencia permanente sigue aplicando igual. Y si tu motivo es
              fiscal, la residencia fiscal y el RUC son un trámite aparte —consulta{' '}
              <a href="/residencia-fiscal" className="text-[var(--accent)] underline underline-offset-2">
                residencia fiscal
              </a>
              — que ninguna nacionalidad se salta.
            </p>
          </div>
          <div>
            <Heading level={2}>Argentina y Uruguay, en concreto</Heading>
            <p className="mt-[var(--space-2)]">
              Son las dos nacionalidades que más vemos llegar por esta vía, casi siempre por
              cercanía, coste de vida y familiaridad con la región. El trámite en sí no difiere
              entre ambas más de lo que difiere por tu situación personal — te lo confirmamos caso
              por caso, no por nacionalidad en abstracto.
            </p>
          </div>
        </div>

        <div className="mt-[var(--space-16)]">
          <FAQ title="Preguntas frecuentes" items={FAQ_ITEMS} />
        </div>

        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Confirma si te aplica</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Dinos tu nacionalidad. Te decimos qué simplifica el acuerdo Mercosur en tu caso, y el
            honorario fijo antes de que te comprometas.
          </p>
          <div className="mt-[var(--space-8)]">
            <LeadForm site="residenciaes" variant="consultation" pagePath={PATH} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
