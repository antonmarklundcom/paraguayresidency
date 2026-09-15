import { afterEach, expect, it, vi } from 'vitest';
import { whatsappHref } from '@/lib/whatsapp';

afterEach(() => vi.unstubAllEnvs());
it('omits the link when the number is missing', () => {
  vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', undefined);
  expect(whatsappHref('Hello')).toBeNull();
});
it('omits the link when the configured number has no digits', () => {
  vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '+ ()');
  expect(whatsappHref('Hello')).toBeNull();
});
it('strips phone formatting and percent-encodes the complete message', () => {
  vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '+595 (981) 123-456');
  const message = 'Olá! A&B?\nTell me more.';
  expect(whatsappHref(message)).toBe(`https://wa.me/595981123456?text=${encodeURIComponent(message)}`);
});
it('retains an empty text parameter for an empty message', () => {
  vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '595981123456');
  expect(whatsappHref('')).toBe('https://wa.me/595981123456?text=');
});
