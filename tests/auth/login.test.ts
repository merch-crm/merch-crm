import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFormData } from '../helpers/mocks';

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn(), encrypt: vi.fn().mockResolvedValue('session-token') }));
vi.mock('@/lib/db', () => ({ pool: { query: vi.fn() } }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true }),
    resetRateLimit: vi.fn(),
}));
vi.mock('@/lib/rate-limit-config', () => ({
    RATE_LIMITS: { login: { limit: 5, windowSec: 60, message: 'Слишком много попыток' } },
}));
vi.mock('@/lib/security-logger', () => ({ logSecurityEvent: vi.fn() }));
vi.mock('@/lib/password', () => ({
    comparePassword: vi.fn(),
    hashPassword: vi.fn(),
}));
vi.mock('@/app/(auth)/login/validation', () => ({
    LoginSchema: {
        safeParse: vi.fn((data: Record<string, unknown>) => {
            if (!data.email || !data.password) {
                return { success: false, error: { issues: [{ message: 'Email и пароль обязательны' }] } };
            }
            return { success: true, data: { email: data.email, password: data.password } };
        }),
    },
}));
vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Map([['x-forwarded-for', '127.0.0.1']])),
    cookies: vi.fn().mockResolvedValue({ set: vi.fn(), delete: vi.fn(), get: vi.fn(), has: vi.fn() }),
}));
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { loginAction } from '@/app/(auth)/login/actions';
import { rateLimit } from '@/lib/rate-limit';
import { comparePassword } from '@/lib/password';
import { redirect } from 'next/navigation';

// ─── Tests ────────────────────────────────────────────────────────────────────

const setupMocks = () => {
    vi.clearAllMocks();
    // Restore default successful rate limit
    vi.mocked(rateLimit).mockResolvedValue({ success: true, remaining: 5, resetIn: 60 });
};

describe('loginAction', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку при пустом email/пароле', async () => {
        const fd = createFormData({ email: '', password: '' });
        const result = await loginAction(null, fd);
        expect(result).toMatchObject({ error: expect.any(String) });
    });

    it('возвращает ошибку при превышении rate limit', async () => {
        vi.mocked(rateLimit).mockResolvedValueOnce({ success: false, remaining: 0, resetIn: 60 });
        const fd = createFormData({ email: 'user@test.com', password: 'password123' });
        const result = await loginAction(null, fd);
        expect(result).toMatchObject({ error: 'Слишком много попыток' });
    });

    it('возвращает ошибку если пользователь не найден', async () => {
        const { pool } = await import('@/lib/db');
        vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as never);
        const fd = createFormData({ email: 'notfound@test.com', password: 'password123' });
        const result = await loginAction(null, fd);
        expect(result).toMatchObject({ error: 'Неверный email или пароль' });
    });

    it('возвращает ошибку при неверном пароле', async () => {
        const { pool } = await import('@/lib/db');
        vi.mocked(pool.query).mockResolvedValueOnce({
            rows: [{ id: 'u1', email: 'user@test.com', password_hash: 'hash', role_id: null, department_id: null, name: 'User' }],
        } as never);
        vi.mocked(comparePassword).mockResolvedValueOnce(false);
        const fd = createFormData({ email: 'user@test.com', password: 'wrongpassword' });
        const result = await loginAction(null, fd);
        expect(result).toMatchObject({ error: 'Неверный email или пароль' });
    });

    it('успешный вход устанавливает cookie и делает redirect', async () => {
        const { pool } = await import('@/lib/db');

        vi.mocked(pool.query)
            .mockResolvedValueOnce({
                rows: [{ id: 'u1', email: 'admin@test.com', password_hash: 'hash', role_id: 'r1', department_id: null, name: 'Admin' }],
            } as never)
            .mockResolvedValueOnce({ rows: [{ id: 'r1', name: 'Администратор' }] } as never);

        vi.mocked(comparePassword).mockResolvedValueOnce(true);

        const fd = createFormData({ email: 'admin@test.com', password: 'correctpassword' });

        try {
            await loginAction(null, fd);
        } catch {
            // redirect() throws in Next.js, that's expected
        }

        expect(redirect).toHaveBeenCalledWith('/dashboard');
    });
});
