import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/db', () => ({ db: {} }));

describe('use-sublimation-calculator', () => {
    it('is a pending test', () => {
        expect(true).toBe(true);
    });
});
