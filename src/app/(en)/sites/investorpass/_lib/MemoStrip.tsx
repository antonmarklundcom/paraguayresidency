import { rulesLastReviewed } from './rules-reviewed';

/** The memo header strip: Subject / Prepared by / Status / Rules last reviewed. */
export function MemoStrip() {
  const reviewed = rulesLastReviewed('investorpass');
  const rows: { label: string; value: string }[] = [
    { label: 'Subject', value: 'Direct permanent residency via the 2026 Investor Pass' },
    { label: 'Prepared by', value: 'Residency team, Asunción' },
    { label: 'Status', value: 'Programme is new; implementing rules still being issued' },
    { label: 'Rules last reviewed', value: reviewed ?? 'Confirmed in writing for your case' },
  ];
  return (
    <div className="ipm-strip">
      <div className="ipm-wrap">
        <dl>
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
