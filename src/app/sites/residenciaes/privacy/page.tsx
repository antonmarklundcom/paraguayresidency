import type { Metadata } from 'next';
import { Container, Heading, Prose, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/privacy';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Política de Privacidad — Residencia Paraguay',
    description:
      'Cómo Residencia Paraguay recoge, usa y protege la información que compartes con nosotros.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Política de Privacidad</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">Última actualización: 09/09/2026.</p>
        <Prose className="mt-[var(--space-8)]">
          <h2>Qué recogemos</h2>
          <p>
            Cuando envías un formulario en Residencia Paraguay — una consulta, un mensaje de
            contacto, una suscripción al boletín, o el test de ruta — recogemos los datos que nos
            das: tu nombre, correo, teléfono o WhatsApp, país, nacionalidad y mensaje. También
            registramos desde qué página nos escribiste y, cuando das tu consentimiento, la
            atribución de primer contacto (cómo nos encontraste) para saber qué está funcionando de
            verdad.
          </p>
          <h2>Cómo lo usamos</h2>
          <p>
            Para responder a tu consulta, preparar tu lista de documentos y tu trámite si nos
            contratas, y enviarte los correos que razonablemente esperarías — una confirmación, una
            respuesta, una actualización de tu caso. No vendemos tu información.
          </p>
          <h2>Quién más lo ve</h2>
          <p>
            Tu consulta se registra primero en nuestra propia base de datos, y se reenvía a nuestro
            CRM (VenderCRM) para que el equipo pueda hacer seguimiento. Los correos se envían a
            través de Resend o de nuestro propio servidor de correo. Si el CRM no está disponible,
            tu consulta nos llega igual — nunca se pierde esperando a un tercero.
          </p>
          <h2>Boletín</h2>
          <p>
            Las suscripciones al boletín usan doble confirmación: confirmas por correo antes de
            quedar dado de alta, y cada correo lleva un enlace para darte de baja al instante.
          </p>
          <h2>Tus derechos</h2>
          <p>
            Puedes pedirnos qué información tenemos sobre ti, pedirnos que la corrijamos, o
            pedirnos que la borremos, escribiéndonos a través de la{' '}
            <a href="/contact">página de contacto</a>. Todavía no tenemos una herramienta de
            autoservicio automatizada; una petición a una persona real la responde una persona
            real.
          </p>
          <h2>Cookies</h2>
          <p>
            Usamos un número reducido de cookies propias para conservar las respuestas del test de
            ruta durante tu sesión y para registrar cómo nos encontraste. No usamos rastreadores
            publicitarios de terceros.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
