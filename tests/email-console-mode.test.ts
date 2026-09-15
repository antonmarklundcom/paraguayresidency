import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emailMode, sendEmail } from '@/lib/email';

/**
 * O18 §14.2.3 / `docs/improvement-report.md` §1.9 — console mode is a DEGRADED
 * state, not a success, and it never writes a credential or a stranger's PII
 * into the host's log.
 */

const env = { ...process.env };

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...env };
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const magicLink = {
  to: 'member@example.com',
  subject: 'Your sign-in link',
  html: '<a href="https://example.test/auth/magic/SECRET-TOKEN">Sign in</a>',
  text: 'Sign in: https://example.test/auth/magic/SECRET-TOKEN',
};

const logged = () =>
  [...vi.mocked(console.info).mock.calls, ...vi.mocked(console.error).mock.calls]
    .flat()
    .join('\n');

describe('console mode with nothing configured', () => {
  it('is the mode when there is no Resend key and no SMTP config', () => {
    expect(emailMode()).toBe('console');
  });

  it('in PRODUCTION reports failure, so the caller can surface it', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const outcome = await sendEmail(magicLink);
    expect(outcome).toMatchObject({ ok: false, mode: 'console' });
    expect(outcome.error).toContain('not configured');
  });

  it('in PRODUCTION logs the recipient and subject only — never the body', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    await sendEmail(magicLink);
    const output = logged();
    expect(output).toContain('member@example.com');
    expect(output).toContain('Your sign-in link');
    // The live credential must not be in Hostinger's log.
    expect(output).not.toContain('SECRET-TOKEN');
  });

  it('in DEVELOPMENT still prints the body — the log IS the delivery there', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const outcome = await sendEmail(magicLink);
    expect(outcome).toMatchObject({ ok: true, mode: 'console' });
    expect(logged()).toContain('SECRET-TOKEN');
  });

  it('says plainly that nothing was sent, whichever environment it is', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    await sendEmail(magicLink);
    expect(logged()).toContain('NOTHING WAS SENT');
  });

  it('still refuses a message with no recipient before anything else', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(await sendEmail({ ...magicLink, to: '' })).toMatchObject({
      ok: false,
      error: 'no recipient',
    });
  });
});
