import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';

// Exercise both snapshots explicitly: server/hydration uses the base form;
// after mount, the external-store hook reads the browser URL.
const mode = vi.hoisted(() => ({ client: false }));
vi.mock('react', async (original) => ({
  ...await original<typeof import('react')>(),
  useSyncExternalStore: (_subscribe: unknown, browserSnapshot: () => unknown, serverSnapshot: () => unknown) => mode.client ? browserSnapshot() : serverSnapshot(),
}));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
import { ProgressiveForm } from '@/components/ProgressiveForm';
function render(kind: 'newsletter' | 'magic') {
  const fields = { site: 'guide' as const, timestamp: 'fixture', id: 'query-test', source: 'inline', labels: { email: 'Email', submit: 'Send', sending: 'Sending', note: 'Note', sentTitle: 'Sent', sentBody: 'Check inbox' } };
  return renderToStaticMarkup(createElement(ProgressiveForm, { kind, fields, base: createElement('form', null, 'Base form'), success: createElement('p', { role: 'status' }, 'Existing success message') }));
}
afterEach(() => { mode.client = false; vi.unstubAllGlobals(); });
it('server output and initial hydration retain the base form even when the browser URL has a result', () => {
  vi.stubGlobal('window', { location: { search: '?newsletter=ok' } });
  expect(render('newsletter')).toContain('<form>Base form</form>');
  expect(render('newsletter')).not.toContain('role="status"');
});
it('the browser snapshot replaces the form with success for each matching query key', () => {
  mode.client = true;
  for (const kind of ['newsletter', 'magic'] as const) {
    vi.stubGlobal('window', { location: { search: `?${kind}=ok` } });
    expect(render(kind)).toContain('role="status"');
    expect(render(kind)).not.toContain('<form');
  }
});
it('an error query keeps a working form with an inline alert', () => {
  mode.client = true;
  vi.stubGlobal('window', { location: { search: '?newsletter=error' } });
  expect(render('newsletter')).toContain('role="alert"');
  expect(render('newsletter')).toContain('<form>Base form</form>');
});
