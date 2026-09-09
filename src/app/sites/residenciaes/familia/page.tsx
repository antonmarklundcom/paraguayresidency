import type { Metadata } from 'next';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residenciaes/_lib/ServicePage';

const PATH = '/familia';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Residencia en Paraguay para Cónyuges, Hijos y Dependientes',
    description:
      'Sumar a tu cónyuge, hijos o dependientes a tu trámite de residencia en Paraguay: qué corre en paralelo y qué necesita sus propios documentos.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Familia"
      title="Traer a tu familia contigo"
      intro="Un cónyuge, hijos y algunos dependientes pueden incluirse en un trámite de residencia en Paraguay. Cada persona sigue necesitando su propio conjunto de documentos — una solicitud familiar no es una sola solicitud estirada para cubrir a todos, y la planificamos así desde el principio."
      faq={[
        {
          question: '¿Mis hijos necesitan su propio conjunto de documentos?',
          answer:
            'Sí — certificados de nacimiento y, según la edad, sus propios antecedentes penales, cada uno apostillado y traducido igual que los tuyos. Armamos un único listado coordinado para que el expediente de un menor nunca quede como algo secundario.',
        },
        {
          question: '¿Podemos ir todos a las mismas citas?',
          answer:
            'Cuando la oficina de migraciones lo permite, agendamos a tu familia junta para que un solo viaje a Asunción cubra a todos en vez de varios.',
        },
        {
          question: '¿Qué cuenta como dependiente más allá de cónyuge e hijos?',
          answer:
            'Varía según el caso — un padre u otro familiar a veces puede calificar. Dinos a quién quieres traer y te decimos honestamente si su caso encaja, y qué necesita si es así.',
        },
      ]}
      serviceName="Trámite de residencia familiar en Paraguay"
      serviceDescription="Trámite coordinado de residencia en Paraguay para cónyuges, hijos y dependientes junto al solicitante principal."
      path={PATH}
    >
      <h2>Misma ruta, más documentos</h2>
      <p>
        Ya sea que tu familia tramite bajo la{' '}
        <a href="/residencia/temporal">residencia temporal</a> o el{' '}
        <a href="/pase-inversor">Pase de Inversor</a>, la ruta en sí no cambia porque haya familia
        de por medio. Lo que cambia es el volumen de documentos: cada persona adicional aporta su
        propio certificado de nacimiento, antecedentes y, si aplica, certificado de matrimonio,
        legalizados de la misma forma que los del solicitante principal.
      </p>
      <h2>Qué coordinamos en un trámite familiar</h2>
      <ul>
        <li>Un solo listado que cubre a cada miembro de la familia, ordenado para que nada caduque fuera de secuencia.</li>
        <li>Citas agendadas juntas siempre que la oficina de migraciones lo permita.</li>
        <li>Respuestas claras sobre qué familiares califican como dependientes en tu caso concreto.</li>
      </ul>
      <p>
        Algunos miembros de la familia terminan mejor servidos por rutas distintas — un cónyuge que
        tramita bajo la tuya, un hijo adulto que tramita de forma independiente. Si no tienes claro
        cómo encaja tu núcleo familiar, empieza con el{' '}
        <a href="/route-finder">test de ruta</a> o <a href="/contact">cuéntanos tu situación</a>{' '}
        directamente.
      </p>
    </ServicePage>
  );
}
