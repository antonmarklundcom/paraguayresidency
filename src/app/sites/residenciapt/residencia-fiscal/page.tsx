import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicoPage } from '@/app/sites/residenciapt/_lib/ServicoPage';

const PATH = '/residencia-fiscal';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Residência Fiscal no Paraguai — RUC e o Sistema Territorial',
    description:
      'Residência fiscal, RUC e o sistema territorial de impostos no Paraguai, explicados para brasileiros — sem promessa de imposto zero.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicoPage
      crumbLabel="Residência fiscal"
      title="Residência fiscal, RUC e o sistema territorial"
      intro="Residência migratória e residência fiscal são coisas diferentes, e é aqui que a maioria das explicações na internet se perde. Separamos os dois, dizemos o que o Paraguai realmente tributa, e deixamos claro onde a resposta é 'confirme com seu contador'."
      formVariant="contact"
      faq={[
        {
          question: 'Virar residente no Paraguai me tira automaticamente do imposto de renda no Brasil?',
          answer:
            'Não é automático. Sair da condição de residente fiscal brasileiro segue regras próprias da Receita Federal, independentes da sua residência paraguaia — confirme com seu contador antes de declarar qualquer coisa diferente.',
        },
        {
          question: 'O Paraguai é "imposto zero"?',
          answer:
            'Não, e não vendemos essa ideia. O Paraguai tributa por sistema territorial, o que é diferente de isenção total — explicamos exatamente o que isso significa na consulta.',
        },
        {
          question: 'Preciso de RUC para tudo?',
          answer:
            'Só se você vai gerar renda registrada no Paraguai — abrir empresa, faturar como autônomo. Quem só tem residência sem atividade econômica local normalmente não precisa.',
        },
      ]}
      serviceName="Residência Fiscal e RUC no Paraguai"
      serviceDescription="Orientação e registro de residência fiscal e RUC no Paraguai para brasileiros, com o sistema territorial explicado caso a caso."
      path={PATH}
    >
      <h2>Residência migratória não é residência fiscal</h2>
      <p>
        Ter o cartão de residência paraguaio não faz de você, automaticamente, um residente fiscal
        no Paraguai, e muito menos tira você da condição de residente fiscal no Brasil. São dois
        sistemas separados, cada um com suas próprias regras — e o que muda especificamente na sua
        declaração no Brasil é pergunta para o seu contador, não para nós.
      </p>
      <h2>O sistema territorial, sem exagero</h2>
      <p>
        O Paraguai tributa por um sistema territorial: <Fact k="tax.territorial_rate" site="residenciapt" />
        . Isso é diferente de &ldquo;imposto zero&rdquo; — renda de fonte paraguaia é tributada normalmente, e o
        que conta como renda de fonte paraguaia tem critérios próprios que explicamos no seu caso.
        Nunca prometemos isenção total, porque não é isso que a lei diz.
      </p>
      <h2>Quando o RUC entra em jogo</h2>
      <p>
        O RUC (Registro Único de Contribuinte) é necessário quando você vai faturar, abrir empresa
        ou registrar atividade econômica no Paraguai. Se seu plano inclui negócio ou terra — comum
        entre brasileiros na região da fronteira e no cinturão agro — tratamos o registro junto com
        a sua residência, na ordem certa.
      </p>
      <h2>O que fazemos por você</h2>
      <ul>
        <li>Explicamos a diferença entre residência migratória e fiscal para o seu caso específico.</li>
        <li>Registramos o RUC quando sua atividade exige.</li>
        <li>
          Dizemos com clareza onde a resposta certa é &ldquo;confirme com seu contador&rdquo; — em vez de
          inventar uma.
        </li>
      </ul>
    </ServicoPage>
  );
}
