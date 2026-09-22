export function TeamStrip() {
  return (
    <section aria-label="Your team" className="border-y border-[var(--border)] bg-[var(--surface-alt)] px-5 py-16 text-center md:py-24">
      <ul className="mx-auto flex max-w-xl justify-center gap-5 sm:gap-12">
        {['Anton Marklund', 'Yanina Alvarez', 'Diana Davalos'].map(name => (
          <li key={name} className="min-w-0 flex-1">
            <span aria-hidden="true" className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent-soft)] font-[family-name:var(--display-font)] text-xl text-[var(--accent)] sm:size-20">{name.split(' ').map(part => part[0]).join('')}</span>
            <p className="text-sm font-medium">{name}</p>
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-8 max-w-sm text-[var(--fg-muted)]">We read and answer every message ourselves.</p>
    </section>
  );
}
