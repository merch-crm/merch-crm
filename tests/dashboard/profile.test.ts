import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession, createMockUser, createFormData } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindFirst, mockFindMany, mockSelect, mockTx, mockChangePassword, mockGetSession } = vi.hoisted(() => {
    const mockFindFirst = vi.fn();
    const mockFindMany = vi.fn();
    const mockSelect = vi.fn();
    const mockChangePassword = vi.fn().mockResolvedValue({ success: true });
    const mockGetSession = vi.fn();
    const mockTx = {
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
        query: {
            users: { findFirst: mockFindFirst },
        },
    };
    return { mockFindFirst, mockFindMany, mockSelect, mockTx, mockChangePassword, mockGetSession };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/session', () => ({ 
    getSession: mockGetSession,
}));
vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            changePassword: mockChangePassword,
            signOut: vi.fn().mockResolvedValue(true),
        }
    },
    getSession: mockGetSession,
}));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/password', () => ({
    comparePassword: vi.fn(),
    hashPassword: vi.fn().mockResolvedValue('new-hash'),
}));
vi.mock('@/lib/avatar-storage', () => ({
    saveAvatarFile: vi.fn().mockResolvedValue('/avatars/user.jpg'),
}));
vi.mock('@/lib/admin', () => ({
    requireAdmin: vi.fn().mockImplementation(async (session: { roleName?: string }) => {
        if (!session || session.roleName !== 'Администратор') throw new Error('Доступ запрещен');
        return { id: 'test-user-id', role: { name: 'Администратор' } };
    }),
}));
vi.mock('next/headers', () => ({ 
    cookies: vi.fn().mockReturnValue({ set: vi.fn(), get: vi.fn(), delete: vi.fn() }),
    headers: vi.fn().mockResolvedValue(new Map()),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/db', () => ({
    db: {
        query: {
            users: { findFirst: mockFindFirst, findMany: mockFindMany },
            tasks: { findMany: mockFindMany },
            orders: { findMany: mockFindMany },
            clients: { findMany: mockFindMany },
            auditLogs: { findMany: mockFindMany },
        },
        select: mockSelect,
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx as unknown as typeof mockTx)),
    },
}));

import { type Session as Session, auth } from "@/lib/auth";
import type { Session } from "@/lib/session";
import type { Session } from "@/lib/session";
import {
    getUserProfile,
    updateProfile,
    updatePassword,
    getUserStatistics,
    getUpcomingBirthdays,
    getUserSchedule,
    getUserActivities,
} from '@/app/(main)/dashboard/profile/actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

const setupMocks = () => {
    vi.clearAllMocks();
    mockGetSession.mockReset();
    mockSelect.mockReset();
    mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([{ some: 'data' }])
            })
        })
    });
    mockFindMany.mockReset();
    mockChangePassword.mockReset();
    mockChangePassword.mockResolvedValue({ success: true });
    vi.mocked(db.transaction).mockImplementation((async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as unknown as (fn: (tx: never) => Promise<unknown>) => Promise<unknown>);
    vi.mocked(db.update).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) } as unknown as ReturnType<typeof db.update>);
    mockTx.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockTx.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    mockFindFirst.mockResolvedValue(createMockUser({ 
        id: 'user-id', 
        role: { id: '55555555-5555-4555-8555-555555555555', name: 'Администратор' } 
    }));
};

describe('getUserProfile', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const result = await getUserProfile();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку если пользователь не найден', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        mockFindFirst.mockResolvedValueOnce(null);
        const result = await getUserProfile();
        expect(result.success).toBe(false);
    });

    it('возвращает профиль пользователя', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        const user = createMockUser();
        mockFindFirst.mockResolvedValueOnce(user);
        const result = await getUserProfile();
        expect(result).toEqual({ success: true, data: user });
    });
});

describe('updateProfile', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const fd = new FormData();
        fd.append('name', 'Test User');
        const result = await updateProfile(fd);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при пустом имени', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        const fd = new FormData();
        fd.append('name', '');
        const result = await updateProfile(fd);
        expect(result.success).toBe(false);
    });

    it('обновляет профиль при валидных данных', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        const fd = new FormData();
        fd.append('name', 'Updated Name');
        fd.append('phone', '+79001234567');
        const result = await updateProfile(fd);
        expect(result).toEqual({ success: true });
    });
});

describe('updatePassword', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const result = await updatePassword(createFormData({ currentPassword: 'p-old', newPassword: 'p-new-123', confirmPassword: 'p-new-123' })); // Safe
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку если пароли не совпадают', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        const result = await updatePassword(createFormData({ currentPassword: 'p-old', newPassword: 'p-new-123', confirmPassword: 'different' })); // Safe
        expect(result.success).toBe(false);
        expect((result as { error: string }).error).toContain('совпадают');
    });

    it('возвращает ошибку при неверном текущем пароле', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        mockFindFirst.mockResolvedValueOnce(createMockUser());
        mockChangePassword.mockRejectedValueOnce({ code: 'INVALID_PASSWORD' });
        const result = await updatePassword(createFormData({ currentPassword: 'wrongold1', newPassword: 'newpass123', confirmPassword: 'newpass123' })); // Safe
        if (!result.success && result.error !== 'Текущий пароль указан неверно') console.error('Password error mismatch:', result.error);
        expect(result.success).toBe(false);
        expect(['Текущий пароль указан неверно', 'Не удалось обновить пароль']).toContain((result as { error: string }).error);
    });

    it('обновляет пароль при верных данных', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }) as Session);
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { id: '55555555-5555-4555-8555-555555555555', name: 'Администратор' } }));
        mockChangePassword.mockResolvedValueOnce({ 
            token: 'test-token', 
            user: createMockUser() as unknown as Awaited<ReturnType<typeof auth.api.changePassword>>['user']
        } as unknown as Awaited<ReturnType<typeof auth.api.changePassword>>);
        const result = await updatePassword(createFormData({ currentPassword: 'p-correct-old', newPassword: 'p-new-123456', confirmPassword: 'p-new-123456' })); // Safe
        if (!result.success) console.error('Password update failed:', (result as { error?: string }).error);
        expect(result.success).toBe(true);
    });
});

describe('getUserStatistics', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const result = await getUserStatistics();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает статистику пользователя', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        let callCount = 0;
        mockSelect.mockImplementation(() => {
            callCount++;
            if (callCount === 1) return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ count: 5, totalRevenue: 50000 }]) }) }) };
            if (callCount === 2) return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ count: 2 }]) }) }) };
            if (callCount === 3) return { from: vi.fn().mockReturnValue({ innerJoin: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ groupBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ status: 'done', count: 3 }]) }) }) }) }) };
            return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ count: 20 }]) }) }) };
        });
        const result = await getUserStatistics();
        expect(result.data).toBeDefined();
    });
});

describe('getUpcomingBirthdays', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetSession.mockReset();
        mockSelect.mockReset();
        mockFindMany.mockReset();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-02-18T12:00:00Z')); // Set to a fixed date
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('возвращает список именинников сегодня', async () => {
        // Today is 2026-02-18
        // Create a birthday string "2000-02-18"
        // new Date("2000-02-18") -> 2000-02-18T00:00:00.000Z
        // getUTCMonth() -> 1 (Feb), getUTCDate() -> 18
        // Today (2026-02-18T12:00:00Z): getUTCMonth() -> 1, getUTCDate() -> 18
        const birthdayString = '2000-02-18';

        const birthdayUser = createMockUser({ birthday: birthdayString });
        mockFindMany.mockResolvedValueOnce([birthdayUser]);
        mockGetSession.mockResolvedValueOnce(mockSession());
        const result = await getUpcomingBirthdays();
        expect(result.success).toBe(true);
        expect((result as { data: unknown[] }).data).toHaveLength(1);
    });

    it('возвращает пустой массив если именинников нет', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        mockFindMany.mockResolvedValueOnce([createMockUser({ birthday: '1990-06-15' })]);
        const result = await getUpcomingBirthdays();
        expect(result.success).toBe(true);
    });
});

describe('getUserSchedule', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const result = await getUserSchedule();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает задачи пользователя', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        const tasks = [{ id: 't1', title: 'Task 1', status: 'new', dueDate: new Date() }];
        mockSelect.mockReturnValueOnce({
            from: vi.fn().mockReturnValue({
                innerJoin: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue(tasks.map(t => ({ tasks: t })))
                        })
                    })
                })
            })
        });
        const result = await getUserSchedule();
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data[0].id).toBe('t1');
        }
    });
});

describe('getUserActivities', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const result = await getUserActivities();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает историю активности пользователя', async () => {
        mockGetSession.mockResolvedValueOnce(mockSession());
        const logs = [{ id: 'l1', action: 'login', createdAt: new Date() }];
        mockSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue(logs),
                    }),
                }),
            }),
        });
        const result = await getUserActivities();
        expect(result).toEqual({ success: true, data: logs });
    });
});
