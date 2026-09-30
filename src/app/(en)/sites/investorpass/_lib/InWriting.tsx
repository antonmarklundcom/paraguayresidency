const ITEMS = [
  { title: 'Cost', body: 'Every line itemised: the investment itself, government fees, our fee, translations and apostilles, and the holding costs of the asset.' },
  { title: 'Timeline', body: 'Each stage in order, what it depends on, and where the authority sets the pace rather than us.' },
  { title: 'Exit options', body: 'What happens if you sell, withdraw or the rules change, and how each choice may affect your residency status.' },
  { title: 'Documents per nationality', body: 'The list for your passport(s), which papers need apostille or legalisation, and what each family member needs.' },
];

export function InWriting() {
  return (
    <ul className="ipm-checks">
      {ITEMS.map((item) => (
        <li key={item.title}>
          <span aria-hidden="true" className="ipm-tick">✓</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
