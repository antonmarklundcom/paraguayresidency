import type { Metadata } from 'next';
import { siteMetadata } from '@/lib/metadata';
import { ServicoPage } from '@/app/sites/residenciapt/_lib/ServicoPage';

const PATH = '/familia';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Residência para a Família no Paraguai — Cônjuge e Filhos',
    description:
      'Como pedir residência no Paraguai para cônjuge, filhos e dependentes junto com o titular. Documentos, ordem do processo e o que muda por idade.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicoPage
      crumbLabel="Família"
      title="Levando a família junto"
      intro="A maioria de quem vem morar no Paraguai não vem sozinho. Cônjuge, filhos e, às vezes, pais dependentes entram no mesmo processo, com documentos e prazos próprios para cada um — e é aqui que um checklist genérico normalmente falha."
      faq={[
        {
          question: 'Meus filhos precisam de um processo separado do meu?',
          answer:
            'Eles entram como dependentes no mesmo processo, mas com documentos próprios — certidão de nascimento, e no caso de menores, autorização do outro responsável quando aplicável.',
        },
        {
          question: 'E se eu e meu cônjuge não somos casados oficialmente?',
          answer:
            'União estável tem seu próprio caminho de comprovação, diferente do casamento civil. Explicamos o que a repartição paraguaia aceita para o seu caso específico.',
        },
        {
          question: 'Meus filhos vão poder estudar no Paraguai com esse status?',
          answer:
            'Sim, residência (mesmo temporária) já permite matrícula em escola. Falamos mais sobre a rotina escolar na nossa página sobre saúde e escola para brasileiros.',
        },
      ]}
      serviceName="Residência Familiar no Paraguai"
      serviceDescription="Protocolo de residência no Paraguai para cônjuge, filhos e dependentes junto com o titular do processo."
      path={PATH}
    >
      <h2>Quem conta como dependente</h2>
      <p>
        Cônjuge (casado ou em união estável comprovada), filhos menores de idade e, em alguns
        casos, filhos maiores ainda dependentes ou pais idosos sob sua responsabilidade. Cada
        categoria tem sua própria lista de documentos, e misturar tudo em um checklist único é a
        forma mais comum de atrasar o processo de todo mundo.
      </p>
      <h2>A ordem que evita atraso</h2>
      <p>
        Normalmente o titular do processo — quem tem a renda ou o vínculo principal — entra
        primeiro, e os dependentes seguem amarrados a esse processo. Organizamos essa ordem antes
        de qualquer protocolo, para nenhum documento vencer enquanto espera o de outra pessoa da
        família.
      </p>
      <h2>O que muda por idade</h2>
      <p>
        Crianças pequenas, adolescentes e dependentes adultos têm exigências diferentes — desde
        autorização de viagem de menores até comprovação de dependência econômica para adultos.
        Levantamos isso caso a caso na consulta, em vez de aplicar uma régua única para todo mundo.
      </p>
      <h2>O que está incluído</h2>
      <ul>
        <li>Checklist por pessoa, não um documento genérico para a família toda.</li>
        <li>Ordem de protocolo pensada para ninguém ficar esperando o processo de outro sem necessidade.</li>
        <li>
          Um honorário por pessoa adicional, cotado junto com o do titular — veja{' '}
          <a href="/precos">nossos preços</a>.
        </li>
      </ul>
    </ServicoPage>
  );
}
