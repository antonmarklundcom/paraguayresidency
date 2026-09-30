import type { FactKey } from '@content/shared/facts';
import { Fact } from '@/components';

interface Route {
  id: string;
  name: string;
  fact: FactKey;
  capital: string;
  capitalNote: string;
  burden: string;
  burdenNote: string;
  holding: string;
  holdingNote: string;
  best: string;
}

/** The four routes, in the order the resolution lists them. Thresholds come from Fact, never from here. */
export const ROUTES: Route[] = [
  { id: 'real_estate', name: 'Real estate', fact: 'investorpass.route_real_estate_usd', capital: 'Locked', capitalNote: 'Held in property for the required period', burden: 'Low', burdenNote: 'Rental or management can be delegated', holding: 'Moderate', holdingNote: 'Property tax, upkeep, management', best: 'Investors who want a tangible asset and possibly a base in the country' },
  { id: 'productive_business', name: 'Productive business', fact: 'investorpass.route_business_usd', capital: 'Productive', capitalNote: 'Deployed in operations and staff', burden: 'High', burdenNote: 'Staffing, tax and compliance reporting', holding: 'Variable', holdingNote: 'Tied to how the business performs', best: 'Operators expanding into the region who would invest anyway' },
  { id: 'financial_instruments', name: 'Financial instruments', fact: 'investorpass.route_financial_usd', capital: 'Locked', capitalNote: 'Held for the required term', burden: 'Low', burdenNote: 'Largely passive once placed', holding: 'Low', holdingNote: 'Custody and account fees', best: 'Passive investors and family offices wanting the simplest structure' },
  { id: 'tourism', name: 'Tourism', fact: 'investorpass.route_tourism_usd', capital: 'Productive', capitalNote: 'Placed in a tourism or hospitality project', burden: 'Medium to high', burdenNote: 'Project delivery and licensing', holding: 'Moderate to high', holdingNote: 'Operating costs until the project runs', best: 'Investors with hospitality experience or an existing project' },
];

function Pair({ k, note }: { k: string; note: string }) {
  return (
    <span>
      <span className="ipm-cell-k">{k}</span>
      <span className="ipm-cell-n">{note}</span>
    </span>
  );
}

/** A real table on desktop; the same table reflows into stacked cards on a phone (CSS only). */
export function RoutesTable() {
  return (
    <div className="ipm-tablewrap">
      <table className="ipm-routes">
        <caption>The four Investor Pass routes compared: minimum capital, what happens to the capital, operating burden, holding costs and who each suits</caption>
        <thead>
          <tr>
            <th scope="col">Route</th>
            <th scope="col">Minimum capital</th>
            <th scope="col">Capital is</th>
            <th scope="col">Operating burden</th>
            <th scope="col">Holding costs</th>
            <th scope="col">Best for</th>
          </tr>
        </thead>
        <tbody>
          {ROUTES.map((route, index) => (
            <tr key={route.id}>
              <th scope="row">
                <span>
                  <span className="ipm-route-no">R{index + 1}</span>
                  <span className="ipm-route-name">{route.name}</span>
                </span>
              </th>
              <td className="ipm-cap" data-label="Min. capital"><Fact k={route.fact} site="investorpass" /></td>
              <td data-label="Capital is"><Pair k={route.capital} note={route.capitalNote} /></td>
              <td data-label="Operating burden"><Pair k={route.burden} note={route.burdenNote} /></td>
              <td data-label="Holding costs"><Pair k={route.holding} note={route.holdingNote} /></td>
              <td data-label="Best for">{route.best}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
