import type { FactKey } from '@content/shared/facts';
import { Fact } from '@/components';
import { ROUTES } from './RoutesTable';

const COMMON = [
  'Valid passport',
  'Birth certificate, apostilled or legalised',
  'Criminal record certificate from country of residence',
  'Proof of lawful origin of funds',
  'Sworn translations into Spanish where required',
];

/** The design's indicative lists. The sourced wording for each route sits above them, as a Fact. */
const BY_ROUTE: { items: string[]; fact: FactKey }[] = [
  { fact: 'investorpass.real_estate_evidence', items: ['Purchase contract and title deed', 'Independent valuation of the property', 'Proof of transfer of funds', 'Registration of the title'] },
  { fact: 'investorpass.productive_conditions', items: ['Company incorporation documents', 'Business plan and investment schedule', 'Proof of capital transfer into the company', 'Local tax registration'] },
  { fact: 'investorpass.financial_conditions', items: ['Certificate from the holding institution', 'Confirmation of term and amount', 'Proof of transfer of funds'] },
  { fact: 'investorpass.tourism_conditions', items: ['Project description and investment plan', 'Registration with the tourism authority', 'Proof of transfer of funds', 'Licences for the project site'] },
];

function List({ items, route = false }: { items: string[]; route?: boolean }) {
  return (
    <ol className={`ipm-doclist${route ? ' ipm-doclist-route' : ''}`}>
      {items.map((item, index) => (
        <li key={item}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** Route tabs without JavaScript: four radio inputs drive which panel shows (see investorpass-memo.css). */
export function Documents() {
  return (
    <div>
      <fieldset className="ipm-tabs">
        <legend>Choose a route to see its documents</legend>
        {ROUTES.map((route, index) => (
          <input key={route.id} type="radio" name="doc-route" id={`doc-route-${index}`} defaultChecked={index === 0} />
        ))}
        <div className="ipm-tablist">
          {ROUTES.map((route, index) => (
            <label key={route.id} htmlFor={`doc-route-${index}`}>{route.name}</label>
          ))}
        </div>
        <div className="ipm-panels">
          {ROUTES.map((route, index) => (
            <div key={route.id} className="ipm-panel">
              <p className="ipm-rulefact">
                <b>What the rules say for this route:</b> <Fact k={BY_ROUTE[index].fact} site="investorpass" />
              </p>
              <div className="ipm-col-route">
                <p className="ipm-docs-h ipm-docs-h-route">Plus, for {route.name.toLowerCase()}</p>
                <List items={BY_ROUTE[index].items} route />
              </div>
              <div>
                <p className="ipm-docs-h">Every applicant, typically</p>
                <List items={COMMON} />
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <p className="ipm-rulefact" style={{ marginTop: 24 }}>
        <b>Personal documents:</b> <Fact k="investorpass.cie_documents" site="investorpass" />
      </p>
      <p className="ipm-rulefact">
        <b>Documents from abroad:</b> <Fact k="investorpass.foreign_documents" site="investorpass" />
      </p>
    </div>
  );
}
