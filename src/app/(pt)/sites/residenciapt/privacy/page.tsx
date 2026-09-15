import type { Metadata } from 'next';
import { Container, Heading, Prose, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { getSite } from '@/sites/registry';

/**
 * Portuguese privacy body (plan §6.7). Not built from `src/lib/legal-pages.tsx`
 * — that shared component is English prose and would violate "no English UI
 * string visible" on this brand (plan §6.7 exit). residenciapt-only.
 */
export function generateMetadata(): Metadata {
  const config = getSite('residenciapt');
  return siteMetadata('residenciapt', {
    title: `Política de Privacidade — ${config.name}`,
    description: `Como ${config.name} coleta, usa e protege as informações que você compartilha com a gente.`,
    path: '/privacy',
  });
}

export default function Page() {
  const config = getSite('residenciapt');
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Política de Privacidade</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">Atualizado em 09/09/2026.</p>
        <Prose className="mt-[var(--space-8)]">
          <h2>O que coletamos</h2>
          <p>
            Quando você preenche um formulário no {config.name} — um pedido de consulta, uma
            mensagem de contato, uma inscrição na newsletter ou o teste de rota — coletamos os
            dados que você informa: nome, e-mail, telefone ou WhatsApp, país, nacionalidade e
            mensagem. Também registramos de qual página você enviou e, quando consentido, a
            origem do seu acesso (como você nos encontrou), para sabermos o que realmente funciona.
          </p>
          <h2>Como usamos</h2>
          <p>
            Para responder sua dúvida, preparar seu checklist de documentos e protocolo se você
            contratar nosso serviço, e enviar os e-mails que você razoavelmente espera — uma
            confirmação, uma resposta, uma atualização do seu caso. Não vendemos suas informações.
          </p>
          <h2>Quem mais tem acesso</h2>
          <p>
            Sua mensagem é registrada primeiro no nosso próprio banco de dados, e encaminhada ao
            nosso CRM (VenderCRM) para o time acompanhar. E-mails são enviados pelo Resend ou pelo
            nosso próprio servidor de e-mail. Se o CRM estiver indisponível, sua mensagem continua
            chegando até nós — ela nunca se perde esperando um terceiro.
          </p>
          <h2>Newsletter</h2>
          <p>
            Inscrições na newsletter usam confirmação dupla: você confirma por e-mail antes de
            entrar na lista, e todo e-mail traz um link de cancelamento que te remove
            imediatamente.
          </p>
          <h2>Seus direitos</h2>
          <p>
            Você pode perguntar o que temos sobre você, pedir correção ou pedir exclusão,
            escrevendo pela <a href="/contact">página de contato</a>. Ainda não temos uma
            ferramenta de autoatendimento para isso — um pedido para uma pessoa de verdade é
            respondido por uma pessoa de verdade.
          </p>
          <h2>Cookies</h2>
          <p>
            Usamos um pequeno número de cookies próprios para manter as respostas do teste de
            rota durante sua sessão e para registrar como você nos encontrou pela primeira vez.
            Não rodamos rastreadores de publicidade de terceiros.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
