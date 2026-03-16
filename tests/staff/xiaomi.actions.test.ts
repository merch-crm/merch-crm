import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getXiaomiAccounts,
    loginXiaomi,
    verifyXiaomi,
    syncXiaomiDevices,
    deleteXiaomiAccount
} from '@/app/(main)/staff/actions/xiaomi.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, queryMock, chainable, mockEncrypt, mockDecrypt } = vi.hoisted(() => {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((cb: (args: unknown[]) => void) => cb([])),
    };

    const queryMock = {
        xiaomiAccounts: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    };

    const mockDb = {
        query: queryMock,
        select: vi.fn().mockReturnValue(chainable),
        update: vi.fn().mockReturnValue(chainable),
        insert: vi.fn().mockReturnValue(chainable),
    };

    return {
        mockDb,
        queryMock,
        chainable,
        mockEncrypt: vi.fn().mockReturnValue('encrypted_token'),
        mockDecrypt: vi.fn().mockReturnValue('{"token":"mock_token"}')
    };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/admin', () => ({ requireAdmin: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/crypto', () => ({ encrypt: mockEncrypt, decrypt: mockDecrypt }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getSession } from '@/lib/session';
import { type Session as _Session } from "@/lib/auth";
import type { Session } from "@/lib/session";
import type { Session } from "@/lib/session";;
import { requireAdmin } from '@/lib/admin';
import { mockSession } from '../helpers/mocks';

describe('Xiaomi Actions', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as _Session);
        vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
        chainable.then.mockImplementation((cb: (args: unknown[]) => void) => cb([]));
        global.fetch = vi.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('getXiaomiAccounts', () => {
        it('should return active accounts without encrypted tokens', async () => {
            const mockAccounts = [
                { id: '1', encryptedToken: 'secret', cameras: [{ id: 'c1' }, { id: 'c2' }] }
            ];
            queryMock.xiaomiAccounts.findMany.mockResolvedValueOnce(mockAccounts);

            const result = await getXiaomiAccounts();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data).toHaveLength(1);
                expect(result.data[0].encryptedToken).toBeUndefined();
                expect(result.data[0].camerasCount).toBe(2);
            }
        });
    });

    describe('loginXiaomi', () => {
        const formData = new FormData();
        formData.append('username', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('region', 'ru');

        it('should handle immediate login and update DB', async () => {
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    requireVerification: false,
                    userId: 'xiaomi123',
                    email: 'test@example.com',
                    nickname: 'Test User',
                    token: { some: 'token' }
                })
            });

            chainable.returning.mockResolvedValueOnce([{ id: 'acc1' }]);

            const result = await loginXiaomi(formData);

            expect(result.success).toBe(true);
            expect(mockDb.insert).toHaveBeenCalled();
            if (result.success && result.data) {
                expect(result.data.nickname).toBe('Test User');
            }
        });

        it('should return verification requirement if needed', async () => {
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    requireVerification: true,
                    verificationMethod: 'email',
                    maskedContact: 't**t@example.com'
                })
            });

            const result = await loginXiaomi(formData);

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.requireVerification).toBe(true);
                expect(result.data.sessionId).toBeDefined();
            }
        });

        it('should return error on failed fetch', async () => {
            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: false,
                text: () => Promise.resolve('Invalid credentials')
            });

            const result = await loginXiaomi(formData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid credentials');
        });
    });

    describe('verifyXiaomi', () => {
        it('should return error for invalid session', async () => {
            const formData = new FormData();
            formData.append('code', '123456');
            formData.append('sessionId', 'invalid-or-expired');

            const result = await verifyXiaomi(formData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Сессия истекла');
        });

        // Testing successful verification is complex because the session map is internal.
        // But we proved the login session logic sets it. We could write a combined test
        // or just test the failure branch for unit testing purposes.
        it('should combine login and verify successfully', async () => {
            const loginData = new FormData();
            loginData.append('username', 'test@example.com');
            loginData.append('password', 'password123');
            loginData.append('region', 'ru');

            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    requireVerification: true,
                    verificationMethod: 'email',
                    maskedContact: 't**t@example.com'
                })
            });

            const loginResult = await loginXiaomi(loginData);
            expect(loginResult.success).toBe(true);
            const sessionId = loginResult.success && loginResult.data ? loginResult.data.sessionId : '';

            // Now verify
            const verifyData = new FormData();
            verifyData.append('code', '123456');
            verifyData.append('sessionId', sessionId as string);

            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    userId: 'xiaomi123',
                    email: 'test@example.com',
                    nickname: 'Test User',
                    token: { some: 'token' }
                })
            });

            chainable.returning.mockResolvedValueOnce([{ id: 'acc1' }]);

            const result = await verifyXiaomi(verifyData);

            expect(result.success).toBe(true);
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });

    describe('syncXiaomiDevices', () => {
        it('should fetch devices and sync cameras to DB', async () => {
            queryMock.xiaomiAccounts.findFirst.mockResolvedValueOnce({
                id: 'acc1',
                isActive: true,
                encryptedToken: 'encrypted',
                region: 'ru'
            });

            const mockDevices = [
                { did: 'd1', model: 'xiaomi.camera.v1', name: 'Cam 1', localIp: '192.168.1.10', isOnline: true },
                { did: 'd2', model: 'yeelight.light.v1', name: 'Lamp', localIp: '192.168.1.11', isOnline: true }
            ];

            global.fetch = vi.fn().mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockDevices)
            });

            const result = await syncXiaomiDevices('acc1');

            expect(result.success).toBe(true);
            // Should only process 'xiaomi.camera'
            expect(mockDb.insert).toHaveBeenCalledTimes(1);
            expect(mockDb.update).toHaveBeenCalled(); // to update lastSyncAt
        });

        it('should return error if account not found', async () => {
            queryMock.xiaomiAccounts.findFirst.mockResolvedValueOnce(null);
            const result = await syncXiaomiDevices('invalid');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Аккаунт не найден');
        });
    });

    describe('deleteXiaomiAccount', () => {
        it('should soft delete account', async () => {
            queryMock.xiaomiAccounts.findFirst.mockResolvedValueOnce({ id: 'acc1', xiaomiUserId: 'x1' });

            const result = await deleteXiaomiAccount('acc1');

            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalled();
            expect(chainable.set).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
        });
    });
});
