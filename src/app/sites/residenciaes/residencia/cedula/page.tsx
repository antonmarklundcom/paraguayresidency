import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residenciaes/_lib/ServicePage';

const PATH = '/residencia/cedula';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Cédula de Identidad Paraguaya — Trámite para Extranjeros',
    description:
      'La cédula es tu identificación del día a día una vez aprobada la residencia — banco, contratos, vida diaria. Cómo funciona el trámite.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Cédula"
      title="La cédula: tu identificación del día a día"
      intro="La residencia es el estatus legal. La cédula de identidad es la tarjeta que usas de verdad — en el banco, al firmar un alquiler, al abrir un negocio. Llega después de aprobarse la residencia, y los tiempos sorprenden a quien nadie se lo explica antes."
      faq={[
        {
          question: '¿Puedo sacar la cédula antes de que aprueben mi residencia?',
          answer:
            'No — la cédula sigue a la aprobación de la residencia, no es un trámite paralelo. Construimos tus expectativas sobre la secuencia real, no sobre una ilusión.',
        },
        {
          question: '¿Qué puedo hacer con la cédula que antes no podía?',
          answer:
            'Abrir una cuenta bancaria sin fricción, firmar alquileres y contratos como residente y no como turista, y en general moverte por la vida administrativa diaria como lo hace cualquier paraguayo.',
        },
        {
          question: '¿La cédula hay que renovarla?',
          answer:
            'Sí, con su propio ciclo. Te avisamos con antelación sobre la renovación en vez de dejar que lo descubras con una tarjeta olvidada en un cajón.',
        },
      ]}
      serviceName="Trámite de cédula de identidad en Paraguay"
      serviceDescription="Trámite de la cédula de identidad para residentes extranjeros, coordinado para seguir a la aprobación de la residencia sin demora."
      path={PATH}
    >
      <h2>Dónde encaja la cédula</h2>
      <p>
        Buena parte de la fricción que describen los extranjeros sobre &ldquo;vivir en
        Paraguay&rdquo; — un banco que no abre cuenta, un propietario que pide una identificación
        que reconozca — en realidad es un problema de cédula, no de residencia. La tarjeta de
        residencia demuestra tu estatus legal; la cédula es lo que de verdad te pide un cajero de
        banco o un propietario en el día a día.
      </p>
      <h2>Plazos</h2>
      <p>
        La cédula <Fact k="cedula.timeline" site="residenciaes" />. Te damos una ventana realista
        en vez de el mejor caso posible, porque el tramo entre &ldquo;residencia aprobada&rdquo; y
        &ldquo;cédula en mano&rdquo; es exactamente cuando la gente se siente atascada — puede
        quedarse, pero todavía no puede hacer buena parte del papeleo que exige identificación
        local.
      </p>
      <h2>Qué coordinamos</h2>
      <ul>
        <li>Presentación calculada para seguir a tu aprobación de residencia sin una demora innecesaria.</li>
        <li>La logística de foto, biometría y cita en Asunción.</li>
        <li>Un aviso sobre la renovación bastante antes de que caduque la tarjeta.</li>
      </ul>
      <p>
        Si todavía no has solicitado la residencia, empieza por la{' '}
        <a href="/residencia/temporal">residencia temporal</a> o haz el{' '}
        <a href="/route-finder">test de ruta</a> para ver primero qué ruta encaja con tu caso.
      </p>
    </ServicePage>
  );
}
