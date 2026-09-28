import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicePage } from '@/app/(en)/sites/residency/_lib/ServicePage';

const PATH = '/residency/citizenship';

export function generateMetadata(): Metadata {
  return siteMetadata('residency', {
    title: 'Paraguay Citizenship: Requirements After Permanent Residency',
    description:
      'Paraguay citizenship requirements: permanent residency first, then naturalisation through the Supreme Court. Who qualifies, the timeline and dual nationality.',
    path: PATH,
  });
}

const cell = 'border-b border-[var(--border)] px-4 py-3 align-top';
const head = 'border-b border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 font-semibold';

export default function Page() {
  return (
    <ServicePage
      crumbLabel="Citizenship"
      title="Paraguay citizenship: residency first, then naturalisation"
      intro="There is no shortcut to a Paraguayan passport. You hold permanent residency, live here for the required time, then apply to the Supreme Court for naturalisation. We handle the residency years that application rests on, and plan them around the date you can apply."
      faq={[
        {
          question: 'How long does it take to get Paraguayan citizenship?',
          answer:
            'The residency stages come first: usually temporary residency, then permanent residency, then the minimum period of permanent residency before you can apply. The naturalisation itself is a court process with no published processing time. Plan in years, not months, and count from the date on your permanent residency resolution.',
        },
        {
          question: 'Can I skip temporary residency to get there faster?',
          answer:
            'Only through the Investor Pass, which grants permanent residency directly to qualifying investors. It shortens the residency stage. It does not shorten the time you must hold permanent residency before applying for citizenship.',
        },
        {
          question: 'Can I keep my British passport?',
          answer:
            'The UK allows its citizens to hold another nationality. Paraguay only admits multiple nationality through a treaty with your country of origin, so check how that applies to you before you file anything. We would rather you asked that question in year one than in the week you apply.',
        },
        {
          question: 'Do I need to speak Spanish or Guaraní?',
          answer:
            'The four conditions in the Constitution do not include a language test. The process itself runs in Spanish, though, so if yours is limited, plan for help with the court stage.',
        },
        {
          question: 'Is there citizenship by investment in Paraguay?',
          answer:
            'No. Paraguay has no programme that sells citizenship. Investment can get you permanent residency faster; the years of residence and the court application still apply.',
        },
      ]}
      serviceName="Paraguay Residency Pathway to Citizenship"
      serviceDescription="Temporary and permanent residency filings in Paraguay, planned around the naturalisation date, with a written brief on the Supreme Court citizenship application."
      path={PATH}
    >
      <h2>The short answer</h2>
      <p>
        Paraguay&apos;s Constitution sets four conditions for naturalisation:{' '}
        <Fact k="citizenship.constitutional_requirements" site="residency" />. In practice the
        residence has to be as a permanent resident: <Fact k="citizenship.years" site="residency" />.
        Nothing about citizenship is automatic. After the qualifying period you apply to the
        Supreme Court (Corte Suprema de Justicia), which reviews the file and, if it is satisfied,
        issues a naturalisation certificate (carta de naturalización).
      </p>

      <h2>The path, stage by stage</h2>
      <div className="not-prose my-[var(--space-6)] overflow-x-auto rounded-[var(--radius-brand)] border border-[var(--border)]">
        <table className="w-full border-collapse text-left text-(length:--text-sm)">
          <thead>
            <tr>
              <th className={head}>Stage</th>
              <th className={head}>What it takes</th>
              <th className={head}>Who decides</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cell}>1. Temporary residency</td>
              <td className={cell}>
                <Fact k="temporary.duration" site="residency" />
              </td>
              <td className={cell}>Migration office (DNM)</td>
            </tr>
            <tr>
              <td className={cell}>2. Permanent residency</td>
              <td className={cell}>
                A change of category from temporary, or direct through the Investor Pass. Proof of
                means is <Fact k="solvency.requirement" site="residency" />.
              </td>
              <td className={cell}>Migration office (DNM)</td>
            </tr>
            <tr>
              <td className={cell}>3. Qualifying residence</td>
              <td className={cell}>
                <Fact k="citizenship.years" site="residency" />, living and working here, not just
                holding the card
              </td>
              <td className={cell}>You, by how you live</td>
            </tr>
            <tr>
              <td className={cell}>4. Naturalisation</td>
              <td className={cell}>
                An application to the Supreme Court with your residency record, identity documents
                and background checks
              </td>
              <td className={cell}>Corte Suprema de Justicia</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The first two stages are the ones we file every week. See{' '}
        <a href="/residency/temporary-residency">temporary residency</a> and{' '}
        <a href="/residency/permanent-residency">permanent residency</a> for how each one works,
        or the <a href="/investor-pass">Investor Pass</a> if you are considering the direct route.
      </p>

      <h2>Living here, not just holding a card</h2>
      <p>
        The permanent card has its own minimum-presence rule:{' '}
        <Fact k="permanent.presence_rule" site="residency" />. That rule keeps the card alive. It
        does not, on its own, show that you have lived in Paraguay and worked here, which is what
        the Constitution asks of a new citizen. Someone who spends most of the year abroad and
        flies in once every few years may only find that out at the court stage, when it is too
        late to change the record.
      </p>
      <p>
        If citizenship is the goal, build the record as you go: a lease or property in your name,
        a RUC and tax filings if you work or run a business here, and a clean history of entries
        and exits. The migration office issues a certificate of your movements, and it is worth
        checking yours every year rather than once, at the end. How a court weighs each item is
        case by case, which is exactly why it helps to plan it from the start.
      </p>

      <h2>Can you keep your current passport?</h2>
      <p>
        This is the question to settle first, not last. Paraguay&apos;s rule is that{' '}
        <Fact k="citizenship.dual_nationality" site="residency" />. The UK allows its citizens to
        hold another nationality; other countries do not, and some remove citizenship when you
        naturalise elsewhere. Check both sides for your own nationality before you file, with your
        own country&apos;s authorities and with the lawyer who prepares the application.
      </p>

      <h2>What citizenship adds, and what it doesn&apos;t</h2>
      <ul>
        <li>
          <strong>It adds</strong> a Paraguayan passport and freedom from the residency presence
          rule.
        </li>
        <li>
          <strong>It doesn&apos;t change</strong> your tax position by itself. Paraguay taxes on a
          territorial basis whatever your nationality, and the UK taxes on residence, not
          citizenship.
        </li>
        <li>
          <strong>You don&apos;t need it</strong> to live, work, bank or buy property here.
          Permanent residency already covers all of that, which is why most residents never
          need it.
        </li>
      </ul>

      <h2>What we do, and what we don&apos;t</h2>
      <p>
        We file the residency stages: temporary residency, the change to permanent residency and
        the cédula. If you tell us at the start that citizenship is the goal, we plan those stages
        around it: the resolution dates kept safe, your travel pattern checked against both the
        presence rule and the residence test, and the records you will need later collected as you
        go. Our fee for each stage is quoted in writing before you commit; see{' '}
        <a href="/pricing">pricing</a>.
      </p>
      <p>
        The naturalisation application itself is a court filing. Before you reach that stage, we
        tell you in writing who prepares it, what it involves and what it costs. We don&apos;t
        quote it on a web page, because the court stage depends on your record and not on a
        standard package. If you are comparing providers for any of this, our guide to{' '}
        <a href="/guides/documents/choosing-a-paraguay-residency-agent">
          choosing a Paraguay residency agent
        </a>{' '}
        lists the questions worth asking, including of us.
      </p>
      <p>
        Not sure yet which residency route starts the clock soonest for you? The{' '}
        <a href="/route-finder">Route Finder</a> takes about two minutes. Anyone selling
        citizenship for an investment is selling something Paraguay doesn&apos;t offer: the{' '}
        <a href="https://paraguayinvestorpass.com/insights/paraguay-citizenship-by-investment">
          Investor Pass team explains why
        </a>
        .
      </p>
    </ServicePage>
  );
}
