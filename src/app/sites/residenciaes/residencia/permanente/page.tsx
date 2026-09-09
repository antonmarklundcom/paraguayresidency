import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residenciaes/_lib/ServicePage';

const PATH = '/residencia/permanente';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Residencia Permanente en Paraguay — La Cédula de Larga Duración',
    description:
      'Residencia permanente en Paraguay tras la temporal, o directa vía el Pase de Inversor. Qué significa de verdad la regla de presencia.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Residencia permanente"
      title="Residencia permanente — la tarjeta de larga duración"
      intro="La mayoría llega aquí tras la residencia temporal. Un grupo más pequeño salta directo gracias al Pase de Inversor. En cualquiera de los dos casos, la tarjeta es la misma, y también lo es la regla que suele confundir a la gente: la presencia."
      faq={[
        {
          question: '¿Puedo ir directo a la residencia permanente?',
          answer:
            'Sí, mediante el Pase de Inversor, que concede la residencia permanente directamente a una inversión que califique, sin pasar antes por la temporal. Es una marca aparte con el mismo equipo — mira el Pase de Inversor.',
        },
        {
          question: '¿Qué pasa si no visito Paraguay con suficiente frecuencia?',
          answer:
            'La tarjeta permanente lleva una regla de presencia mínima. Qué significa exactamente para tu forma concreta de viajar merece una llamada antes de presentar el expediente, no después — preferimos decírtelo ahora que dejarte descubrirlo por las malas.',
        },
        {
          question: '¿La residencia permanente caduca?',
          answer:
            'Tiene un plazo de validez largo. Te confirmamos la cifra exacta y cómo funciona la renovación en tu llamada, en vez de dar aquí un número que no podamos respaldar.',
        },
      ]}
      serviceName="Trámite de residencia permanente en Paraguay"
      serviceDescription="Trámite de la residencia permanente en Paraguay tras la temporal, o directamente vía el Pase de Inversor, incluida la explicación de la regla de presencia."
      path={PATH}
    >
      <h2>Las dos vías de entrada</h2>
      <p>
        La vía estándar es la <a href="/residencia/temporal">residencia temporal</a> primero, y
        después una solicitud de estatus permanente una vez cumplido el período requerido. La vía
        directa es el <a href="/pase-inversor">Pase de Inversor</a>, que concede la residencia
        permanente en un solo trámite a los inversores que califican — una marca distinta con el
        mismo equipo, para un tipo de solicitante distinto.
      </p>
      <h2>La regla de presencia, dicha con claridad</h2>
      <p>
        La residencia permanente viene con{' '}
        <Fact k="permanent.presence_rule" site="residenciaes" />. Es la cifra que más se cita mal
        en este sector, y preferimos que la escuches de nosotros antes de presentar el expediente
        a que asumas algo leído en un foro. Lo que significa en la práctica depende de cómo
        planeas repartir tu tiempo — lo revisamos según tu patrón concreto en la llamada.
      </p>
      <h2>Qué tramitamos por ti</h2>
      <ul>
        <li>La solicitud de residencia permanente en sí, una vez que califiques.</li>
        <li>Una explicación clara de lo que significa la regla de presencia para tus planes de viaje.</li>
        <li>Coordinación con la renovación de tu cédula, para que ambas vayan sincronizadas.</li>
      </ul>
      <p>
        ¿No sabes si te conviene más esperar a que termine la temporal o calificar ya para el Pase
        de Inversor? El <a href="/route-finder">test de ruta</a> compara ambas opciones frente a tu
        situación real en unos dos minutos.
      </p>
    </ServicePage>
  );
}
