import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession, createMockUser, createFormData } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindFirst, mockFindMany, mockSelect, mockTx } = vi.hoisted(() => {
    const mockFindFirst = vi.fn();
    const mockFindMany = vi.fn();
    const mockSelect = vi.fn();
    const mockTx = {
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
        query: {
            users: { findFirst: mockFindFirst },
        },
    };
    return { mockFindFirst, mockFindMany, mockSelect, mockTx };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/password', () => ({
    comparePassword: vi.fn(),
    hashPassword: vi.fn().mockResolvedValue('new-hash'),
}));
vi.mock('@/lib/avatar-storage', () => ({
    saveAvatarFile: vi.fn().mockResolvedValue('/avatars/user.jpg'),
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
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    },
}));

import { getSession } from '@/lib/auth';
import { comparePassword } from '@/lib/password';
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
    vi.mocked(db.transaction).mockImplementation((async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as any);
    vi.mocked(db.update).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) } as any);
    mockTx.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockTx.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
};

describe('getUserProfile', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getUserProfile();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку если пользователь не найден', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockFindFirst.mockResolvedValueOnce(null);
        const result = await getUserProfile();
        expect(result.success).toBe(false);
    });

    it('возвращает профиль пользователя', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const user = createMockUser();
        mockFindFirst.mockResolvedValueOnce(user);
        const result = await getUserProfile();
        expect(result).toEqual({ success: true, data: user });
    });
});

describe('updateProfile', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const fd = new FormData();
        fd.append('name', 'Test User');
        const result = await updateProfile(fd);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при пустом имени', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const fd = new FormData();
        fd.append('name', '');
        const result = await updateProfile(fd);
        expect(result.success).toBe(false);
    });

    it('обновляет профиль при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
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
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await updatePassword(createFormData({ currentPassword: 'old', newPassword: 'new123', confirmPassword: 'new123' }));
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку если пароли не совпадают', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await updatePassword(createFormData({ currentPassword: 'old', newPassword: 'new123', confirmPassword: 'different' }));
        expect(result.success).toBe(false);
        expect((result as { error: string }).error).toContain('совпадают');
    });

    it('возвращает ошибку при неверном текущем пароле', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockFindFirst.mockResolvedValueOnce(createMockUser());
        vi.mocked(comparePassword).mockResolvedValueOnce(false);
        const result = await updatePassword(createFormData({ currentPassword: 'wrongold', newPassword: 'new123', confirmPassword: 'new123' }));
        expect(result).toEqual({ success: false, error: 'Текущий пароль указан неверно' });
    });

    it('обновляет пароль при верных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockFindFirst.mockResolvedValueOnce(createMockUser());
        vi.mocked(comparePassword).mockResolvedValueOnce(true);
        const result = await updatePassword(createFormData({ currentPassword: 'correctold', newPassword: 'new123456', confirmPassword: 'new123456' }));
        expect(result).toEqual({ success: true });
    });
});

describe('getUserStatistics', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getUserStatistics();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает статистику пользователя', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        let callCount = 0;
        mockSelect.mockImplementation(() => {
            callCount++;
            if (callCount === 1) return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ count: 5, totalRevenue: 50000 }]) }) }) };
            if (callCount === 2) return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ count: 2 }]) }) }) };
            if (callCount === 3) return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ groupBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ status: 'done', count: 3 }]) }) }) }) };
            return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ count: 20 }]) }) }) };
        });
        const result = await getUserStatistics();
        expect(result.data).toBeDefined();
    });
});

describe('getUpcomingBirthdays', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
        const result = await getUpcomingBirthdays();
        expect(result.success).toBe(true);
        expect((result as { data: unknown[] }).data).toHaveLength(1);
    });

    it('возвращает пустой массив если именинников нет', async () => {
        mockFindMany.mockResolvedValueOnce([createMockUser({ birthday: '1990-06-15' })]);
        const result = await getUpcomingBirthdays();
        expect(result.success).toBe(true);
    });
});

describe('getUserSchedule', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getUserSchedule();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает задачи пользователя', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const tasks = [{ id: 't1', title: 'Task 1', status: 'new', dueDate: new Date() }];
        mockFindMany.mockResolvedValueOnce(tasks);
        const result = await getUserSchedule();
        expect(result).toEqual({ success: true, data: tasks });
    });
});

describe('getUserActivities', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getUserActivities();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает историю активности пользователя', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
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
