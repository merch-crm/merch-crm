import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockTx, mockQuery, mockDb } = vi.hoisted(() => {
    const mockQuery = {
        users: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
        roles: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
        departments: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
        auditLogs: { findMany: vi.fn().mockResolvedValue([]) },
        clients: { findFirst: vi.fn().mockResolvedValue(null) },
        orders: { findFirst: vi.fn().mockResolvedValue(null) },
        tasks: { findFirst: vi.fn().mockResolvedValue(null) },
        systemSettings: { findFirst: vi.fn().mockResolvedValue(null) },
    };

    const createUpdateChain = () => {
        const chain: any = {};
        chain.set = vi.fn().mockReturnValue(chain);
        chain.where = vi.fn().mockReturnValue(chain);
        chain.returning = vi.fn().mockResolvedValue([{ id: '11111111-1111-4111-8111-111111111111', name: 'Updated' }]);
        return chain;
    };

    const mockTx = {
        insert: vi.fn().mockImplementation(() => {
            const chain: any = {};
            chain.values = vi.fn().mockReturnValue(chain);
            chain.onConflictDoUpdate = vi.fn().mockReturnValue(chain);
            chain.returning = vi.fn().mockResolvedValue([{ id: 'new-id' }]);
            return chain;
        }),
        update: vi.fn().mockImplementation(createUpdateChain),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockReturnThis() }),
        execute: vi.fn().mockResolvedValue({ rows: [] }),
        query: mockQuery,
        select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ count: 2 }]) }) }) }),
    };

    const mockDb = {
        query: mockQuery,
        insert: vi.fn().mockImplementation(() => {
            const chain: any = {};
            chain.values = vi.fn().mockReturnValue(chain);
            chain.onConflictDoUpdate = vi.fn().mockReturnValue(chain);
            chain.returning = vi.fn().mockResolvedValue([{ id: 'new-id' }]);
            return chain;
        }),
        update: vi.fn().mockImplementation(createUpdateChain),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockReturnThis() }),
        select: vi.fn().mockImplementation(() => ({
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            offset: vi.fn().mockReturnThis(),
            then: (resolve: any) => resolve([{ count: 2 }]),
        })),
        transaction: vi.fn().mockImplementation(async (fn: any) => fn(mockTx)),
        execute: vi.fn().mockResolvedValue({ rows: [] }),
    };

    return { mockTx, mockQuery, mockDb };
});

vi.mock('@/lib/db', () => ({ db: mockDb, pool: { connect: vi.fn(), query: vi.fn() } }));

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn(), encrypt: vi.fn().mockResolvedValue('token'), decrypt: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/security-logger', () => ({ logSecurityEvent: vi.fn() }));
vi.mock('@/lib/password', () => ({
    hashPassword: vi.fn().mockResolvedValue('hashed-password'),
    comparePassword: vi.fn(),
}));
vi.mock('@/lib/backup', () => ({ performDatabaseBackup: vi.fn().mockResolvedValue({ success: true }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: vi.fn().mockReturnValue({ set: vi.fn(), get: vi.fn(), delete: vi.fn() }) }));
vi.mock('@/lib/admin', () => ({
    requireAdmin: vi.fn().mockImplementation(async (session: any) => {
        if (!session || session.roleName !== 'Администратор') throw new Error('Доступ запрещен');
        return session;
    }),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import { mockSession, createMockUser, createFormData } from '../helpers/mocks';
import { performDatabaseBackup } from '@/lib/backup';

import { getCurrentUserAction, getUsers, createUser, updateUser, deleteUser } from '@/app/(main)/admin-panel/actions/users.actions';
import { getRoles, createRole, updateRole, deleteRole } from '@/app/(main)/admin-panel/actions/roles.actions';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/app/(main)/admin-panel/actions/departments.actions';
import { getSystemSettings, updateSystemSetting, createDatabaseBackup } from '@/app/(main)/admin-panel/actions/system.actions';
import { getAuditLogs, clearAuditLogs } from '@/app/(main)/admin-panel/actions/security.actions';
import { getStorageDetails } from '@/app/(main)/admin-panel/actions/storage.actions';
import { getNotificationSettingsAction, updateNotificationSettingsAction } from '@/app/(main)/admin-panel/actions/notifications.actions';
import { getBrandingAction, updateBrandingAction, getIconGroups } from '@/app/(main)/admin-panel/actions/branding.actions';

// ─── Setup ────────────────────────────────────────────────────────────────────

function setupMocks() {
    vi.clearAllMocks();
    mockQuery.users.findFirst.mockResolvedValue(createMockUser({ roleName: 'Администратор' }));
    mockQuery.roles.findMany.mockResolvedValue([]);
    mockQuery.departments.findMany.mockResolvedValue([]);
    mockQuery.auditLogs.findMany.mockResolvedValue([]);
    vi.mocked(getSession).mockResolvedValue(mockSession());
    vi.mocked(performDatabaseBackup).mockResolvedValue({ success: true });
}

describe('Admin Panel Actions', () => {
    beforeEach(() => {
        setupMocks();
    });

    describe('getCurrentUserAction', () => {
        it('возвращает текущего пользователя при наличии сессии', async () => {
            const user = createMockUser();
            mockQuery.users.findFirst.mockResolvedValueOnce(user);
            const result = await getCurrentUserAction();
            expect(result.success).toBe(true);
            expect(result.data).toEqual(user);
        });

        it('возвращает ошибку если нет сессии', async () => {
            vi.mocked(getSession).mockResolvedValueOnce(null);
            const result = await getCurrentUserAction();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Не авторизован');
        });
    });

    describe('getUsers', () => {
        it('возвращает список пользователей', async () => {
            const users = [createMockUser(), createMockUser({ id: '2' })];
            mockQuery.users.findMany.mockResolvedValueOnce(users);
            const result = await getUsers();
            expect(result.success).toBe(true);
            expect(result.data?.users).toHaveLength(2);
        });
    });

    describe('createUser', () => {
        it('создает пользователя при валидных данных', async () => {
            const formData = createFormData({
                name: 'New User',
                email: 'new@test.com',
                password: 'password123',
                roleId: '55555555-5555-4555-8555-555555555555'
            });
            const result = await createUser(formData);
            expect(result.success).toBe(true);
        });
    });

    describe('updateUser', () => {
        it('обновляет пользователя при валидных данных', async () => {
            const formData = createFormData({
                name: 'Updated Name',
                email: 'updated@test.com',
                roleId: '55555555-5555-4555-8555-555555555555'
            });
            const result = await updateUser('11111111-1111-4111-8111-111111111111', formData);
            expect(result.success).toBe(true);
        });
    });

    describe('deleteUser', () => {
        it('удаляет пользователя', async () => {
            const result = await deleteUser('22222222-2222-4222-8222-222222222222');
            expect(result.success).toBe(true);
        });
    });

    describe('System Settings & Branding', () => {
        it('getSystemSettings возвращает настройки', async () => {
            mockQuery.systemSettings.findFirst.mockResolvedValueOnce({ id: '1', key: 'test', value: {} });
            const result = await getSystemSettings();
            expect(result.success).toBe(true);
        });

        it('updateBrandingAction обновляет брендинг', async () => {
            const result = await updateBrandingAction({
                companyName: 'New name',
                primaryColor: '#000000',
                logoUrl: null,
                faviconUrl: null,
                radiusOuter: 24,
                radiusInner: 14,
                crmBackgroundBlur: 0,
                crmBackgroundBrightness: 100
            } as any);
            expect(result).toEqual({ success: true });
        });
    });

    describe('Notifications', () => {
        it('getNotificationSettingsAction возвращает настройки', async () => {
            const result = await getNotificationSettingsAction();
            expect(result.success).toBe(true);
        });
    });

    describe('Backup & Logs', () => {
        it('createDatabaseBackup вызывает функцию бэкапа', async () => {
            const result = await createDatabaseBackup();
            expect(result.success).toBe(true);
        });

        it('clearAuditLogs очищает логи', async () => {
            const result = await clearAuditLogs();
            expect(result.success).toBe(true);
        });
    });
});
