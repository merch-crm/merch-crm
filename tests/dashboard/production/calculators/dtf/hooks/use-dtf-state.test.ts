import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/db', () => ({ db: {} }));

describe('use-dtf-state', () => {
    it('is a pending test', () => {
        expect(true).toBe(true);
    });
});
