import { describe, expect, it } from 'vitest';
import { DEFAULT_ORPHAN_IDLE_MS, exitReason, policyFromEnv } from '@/lib/process-lifecycle-policy';

const MIN = 60_000;
const def = policyFromEnv({});
const base = { ppidAtStart: 4242, ppidNow: 4242, inFlight: 0, idleMs: 0 };

describe('process lifecycle policy', () => {
  it('defaults: orphan exit 120 s, idle exit off', () => {
    expect(def.orphanIdleMs).toBe(DEFAULT_ORPHAN_IDLE_MS);
    expect(def.idleExitMs).toBeNull();
  });

  it('a copy whose launcher is still its parent never exits by default', () => {
    expect(exitReason({ ...base, idleMs: 60 * MIN }, def)).toBeNull();
  });

  it('an orphan exits only once idle long enough, never with a request in flight', () => {
    expect(exitReason({ ...base, ppidNow: 1, idleMs: MIN }, def)).toBeNull();
    expect(exitReason({ ...base, ppidNow: 1, idleMs: 2 * MIN }, def)).not.toBeNull();
    expect(exitReason({ ...base, ppidNow: 77, idleMs: 3 * MIN }, def)).not.toBeNull();
    expect(exitReason({ ...base, ppidNow: 1, inFlight: 1, idleMs: 30 * MIN }, def)).toBeNull();
  });

  it('a process born with PPID 1 is not an orphan', () => {
    expect(exitReason({ ...base, ppidAtStart: 1, ppidNow: 1, idleMs: 60 * MIN }, def)).toBeNull();
  });

  it('ORPHAN_EXIT_IDLE_SECONDS=0 turns orphan exit off', () => {
    const off = policyFromEnv({ ORPHAN_EXIT_IDLE_SECONDS: '0' });
    expect(off.orphanIdleMs).toBeNull();
    expect(exitReason({ ...base, ppidNow: 1, idleMs: 60 * MIN }, off)).toBeNull();
  });

  it('IDLE_EXIT_MINUTES ends any idle copy, including a PPID-1-born one, never in flight', () => {
    const idle = policyFromEnv({ IDLE_EXIT_MINUTES: '20' });
    expect(idle.idleExitMs).toBe(20 * MIN);
    expect(exitReason({ ...base, idleMs: 19 * MIN }, idle)).toBeNull();
    expect(exitReason({ ...base, idleMs: 20 * MIN }, idle)).not.toBeNull();
    expect(exitReason({ ...base, ppidAtStart: 1, ppidNow: 1, idleMs: 25 * MIN }, idle)).not.toBeNull();
    expect(exitReason({ ...base, inFlight: 2, idleMs: 99 * MIN }, idle)).toBeNull();
  });

  it('garbage env falls back to the defaults', () => {
    const junk = policyFromEnv({ ORPHAN_EXIT_IDLE_SECONDS: 'abc', IDLE_EXIT_MINUTES: '-5' });
    expect(junk.orphanIdleMs).toBe(DEFAULT_ORPHAN_IDLE_MS);
    expect(junk.idleExitMs).toBeNull();
  });
});
