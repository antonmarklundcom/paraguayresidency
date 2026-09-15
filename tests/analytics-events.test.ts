import { afterEach, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({ effects: [] as (() => void)[], ref: { current: false } }));
vi.mock('react', async (original) => ({
  ...await original<typeof import('react')>(),
  useEffect: (effect: () => void) => { hooks.effects.push(effect); },
  useRef: () => hooks.ref,
  useState: (value: unknown) => [value, () => {}],
}));
import { QuizCompleted } from '@/components/QuizCompleted';
import { CheckoutButtonClient } from '@/components/CheckoutButtonClient';

afterEach(() => {
  hooks.effects = []; hooks.ref.current = false;
  vi.unstubAllEnvs(); vi.unstubAllGlobals();
});
it('quiz completion fires once across effect replay and rerender with only site and route', () => {
  vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', 'true');
  const plausible = vi.fn();
  vi.stubGlobal('window', { plausible });
  QuizCompleted({ site: 'flytta', route: 'temporary' });
  hooks.effects[0]();
  hooks.effects[0]();
  QuizCompleted({ site: 'flytta', route: 'temporary' });
  hooks.effects[1]();
  expect(plausible).toHaveBeenCalledExactlyOnceWith('quiz_completed', { props: { site: 'flytta', route: 'temporary' } });
});
it('checkout tracks on click, not rendering, with only site and product', async () => {
  vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', 'true');
  const plausible = vi.fn();
  vi.stubGlobal('window', { plausible, location: { search: '' } });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ error: 'email-required' }) }));
  const element = CheckoutButtonClient({ enabled: true, site: 'guide', product: 'guide-entry', timestamp: 'fixture', labels: { buy: 'Buy', starting: 'Starting', unavailable: 'Unavailable', error: 'Error' } });
  expect(plausible).not.toHaveBeenCalled();
  await element.props.children[0].props.onClick();
  expect(plausible).toHaveBeenCalledExactlyOnceWith('checkout_started', { props: { site: 'guide', product: 'guide-entry' } });
});
