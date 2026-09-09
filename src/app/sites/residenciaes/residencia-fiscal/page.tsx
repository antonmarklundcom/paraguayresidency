import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/sites/residenciaes/_lib/ServicePage';

const PATH = '/residencia-fiscal';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Residencia Fiscal y RUC en Paraguay — A Quién le Conviene',
    description:
      'Paraguay aplica un sistema territorial — qué cubre y qué no para tu renta extranjera, a quién le conviene la residencia fiscal, y qué confirma tu asesor.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Residencia fiscal"
      title="Residencia fiscal y RUC — a quién le conviene de verdad"
      intro="Paraguay funciona con un sistema territorial, y esa frase se usa con demasiada ligereza en internet. Te decimos con claridad qué cubre y qué no, te tramitamos el RUC, y no entramos en lo que le corresponde decidir a tu propio asesor."
      faq={[
        {
          question: '¿Hacerme residente fiscal aquí significa que dejo de pagar impuestos en España?',
          answer:
            'No automáticamente, y no vamos a decirte que sí. Las reglas de España — los 183 días, el centro de intereses económicos — deciden esa pregunta. Confírmalo con tu asesor antes de dar nada por hecho.',
        },
        {
          question: '¿Necesito un RUC aunque no tenga un negocio aquí?',
          answer:
            'Muchas veces sí — la banca y algunos contratos lo piden. Revisamos si tu caso lo necesita y lo tramitamos junto con tu residencia.',
        },
        {
          question: '¿Qué renta se grava realmente aquí?',
          answer:
            'El sistema territorial grava lo que se origina en Paraguay, no tu renta mundial. Te explicamos qué significa eso para tus ingresos concretos en la llamada, no en términos genéricos aquí.',
        },
      ]}
      serviceName="Residencia fiscal y alta de RUC en Paraguay"
      serviceDescription="Alta de RUC y orientación sobre residencia fiscal bajo el sistema territorial paraguayo, explicado con honestidad y sus límites."
      path={PATH}
    >
      <h2>Qué significa de verdad el sistema territorial</h2>
      <p>
        Paraguay aplica <Fact k="tax.territorial_rate" site="residenciaes" /> bajo un sistema en el
        que <Fact k="tax.foreign_income_treatment" site="residenciaes" />. Es una ventaja real y
        útil para quien tiene renta de fuente extranjera. También es una afirmación más acotada que
        el marco de &ldquo;paraíso fiscal&rdquo; que circula por internet, y preferimos ser el
        sitio que lo dice así antes que el que lo vende de más.
      </p>
      <h2>El ángulo español: los 183 días y el centro de intereses</h2>
      <p>
        Dejar de ser residente fiscal en España no depende de Paraguay, depende de las normas
        españolas: la regla de los 183 días y el criterio del centro de intereses económicos.
        Confírmalo con tu asesor antes de tomar cualquier decisión — es exactamente el tipo de
        pregunta que necesita mirar tu caso concreto, no una regla general.
      </p>
      <h2>A quién le conviene de verdad</h2>
      <p>
        Las personas con renta originada fuera de Paraguay — trabajo remoto, inversiones en el
        extranjero, una pensión — suelen sacar el beneficio más claro del sistema. Quien tiene
        renta de fuente paraguaya, o un negocio que opera localmente, tiene un panorama fiscal más
        ordinario, y lo decimos desde el principio en vez de mezclarlo todo en un mismo argumento
        de venta.
      </p>
      <h2>El RUC</h2>
      <p>
        El RUC es el número de identificación tributaria de Paraguay, y la mayoría de residentes
        termina necesitando uno para la banca o los contratos aunque no tengan negocio local. Lo
        damos de alta junto con tu trámite de residencia para que no tengas que hacer un segundo
        viaje después.
      </p>
      <h2>Lo que hacemos, y lo que no</h2>
      <ul>
        <li>Damos de alta tu RUC y te explicamos el sistema territorial en términos generales.</li>
        <li>
          No asesoramos sobre tus obligaciones fiscales en España — eso es trabajo de tu asesor, y
          lo decimos en vez de adivinar.
        </li>
        <li>
          ¿No estás seguro de si la residencia fiscal es lo que realmente necesitas? El{' '}
          <a href="/route-finder">test de ruta</a> pregunta directamente por tu motivo fiscal.
        </li>
      </ul>
    </ServicePage>
  );
}
