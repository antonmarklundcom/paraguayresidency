import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residenciaes/_lib/ServicePage';

const PATH = '/residencia/temporal';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Residencia Temporal en Paraguay — Requisitos y Trámite',
    description:
      'Cómo funciona la residencia temporal en Paraguay: quién califica, los documentos, las citas y qué cuesta. Tramitada por nosotros en Asunción.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Residencia temporal"
      title="Residencia temporal, el primer paso habitual"
      intro="Casi todo el mundo empieza aquí. La residencia temporal es la vía que espera la oficina de migraciones, y es la forma más rápida de tener un pie en el país — una tarjeta, la solicitud de la cédula, y una razón legal para estar mientras decides hasta dónde quieres llegar."
      faq={[
        {
          question: '¿Cuánto dura la residencia temporal?',
          answer:
            'Tiene un plazo inicial fijo, tras el cual solicitas la permanente — te confirmamos el plazo vigente y qué pasa si lo dejas vencer en tu llamada.',
        },
        {
          question: '¿Tengo que vivir en Paraguay a tiempo completo para mantenerla?',
          answer:
            'No. La residencia temporal no lleva las mismas exigencias de presencia mínima que la permanente. Te explicamos la diferencia práctica para tu forma de viajar antes de presentar nada.',
        },
        {
          question: '¿Y si mis documentos caducan antes de que presentemos el expediente?',
          answer:
            'Es el retraso más común. Ordenamos la recolección de tus documentos para que ninguno caduque antes de su cita — consulta nuestra guía sobre qué necesitas antes de solicitar.',
        },
      ]}
      serviceName="Trámite de residencia temporal en Paraguay"
      serviceDescription="Trámite llave en mano de la residencia temporal en Paraguay: lista de documentos, citas y presentación."
      path={PATH}
    >
      <h2>Para quién es esta vía</h2>
      <p>
        La residencia temporal encaja con casi cualquiera que quiera un pie legal en Paraguay sin
        comprometerse todavía con las exigencias de presencia y trámite más profundas de la
        permanente. Nómadas digitales, jubilados que prueban el país antes de mudarse del todo, y
        personas construyendo hacia la permanente usan todos esta vía como entrada. Si eres
        nacional de un país del Mercosur, además tienes{' '}
        <a href="/mercosur">una vía propia que conviene revisar primero</a>.
      </p>
      <h2>Qué implica el trámite en la práctica</h2>
      <p>
        Aportas un conjunto de documentos legalizados — certificado de nacimiento, antecedentes
        penales y prueba de medios, cada uno apostillado y traducido para la oficina de migraciones
        paraguaya. Armamos esa lista según tu nacionalidad concreta, no un PDF genérico, porque lo
        que importa (qué oficinas de antecedentes se aceptan, cómo se legaliza un documento)
        cambia según el país. A partir de ahí es presentación, un conjunto de citas en Asunción y
        una espera hasta la aprobación — tras la cual sigue la solicitud de la cédula.
      </p>
      <h2>Plazos y qué viene después</h2>
      <p>
        La residencia temporal dura <Fact k="temporary.duration" site="residenciaes" />. La
        mayoría de nuestros clientes usa ese margen para decidir si solicita la{' '}
        <a href="/residencia/permanente">residencia permanente</a>, y algunos, tras conocer el
        país, miran el <a href="/pase-inversor">Pase de Inversor</a> si una inversión que califique
        tiene más sentido para ellos. Si no sabes qué ruta encaja, el{' '}
        <a href="/route-finder">test de ruta</a> te lo dice en dos minutos.
      </p>
      <h2>Qué incluye</h2>
      <ul>
        <li>Una lista de documentos hecha para tu nacionalidad, no una lista genérica.</li>
        <li>Coordinación de citas para que un solo viaje cubra la presentación.</li>
        <li>
          Un honorario fijo, cotizado antes de que te comprometas — consulta nuestros{' '}
          <a href="/precios">precios</a>.
        </li>
      </ul>
    </ServicePage>
  );
}
