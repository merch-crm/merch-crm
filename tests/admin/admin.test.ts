import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const hoisted = vi.hoisted(() => {
    const mockQuery = {
        users: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
        roles: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
        departments: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
        auditLogs: { findMany: vi.fn().mockResolvedValue([]) },
        clients: { findFirst: vi.fn().mockResolvedValue(null) },
        orders: { findFirst: vi.fn().mockResolvedValue(null) },
        tasks: { findFirst: vi.fn().mockResolvedValue(null) },
        systemSettings: { findFirst: vi.fn().mockResolvedValue(null) },
        accounts: { findFirst: vi.fn().mockResolvedValue(null) },
    };

    const createUpdateChain = () => {
        const chain: Record<string, unknown> = {};
        chain.set = vi.fn().mockReturnValue(chain);
        chain.where = vi.fn().mockReturnValue(chain);
        chain.returning = vi.fn().mockResolvedValue([{ id: '11111111-1111-4111-8111-111111111111', name: 'Updated' }]);
        return chain;
    };

    const mockTx = {
        insert: vi.fn().mockImplementation(() => {
            const chain: Record<string, unknown> = {};
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
            const chain: Record<string, unknown> = {};
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
            then: (resolve: (val: unknown) => void) => resolve([{ count: 2 }]),
        })),
        transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(mockTx)),
        execute: vi.fn().mockResolvedValue({ rows: [] }),
    };

    const mockGetSession = vi.fn();
    return { mockTx, mockQuery, mockDb, mockGetSession };
});

const { mockQuery, mockGetSession } = hoisted;

vi.mock('@/lib/db', () => ({ db: hoisted.mockDb, pool: { connect: vi.fn(), query: vi.fn() } }));

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/session', () => ({ getSession: hoisted.mockGetSession }));
vi.mock('@/lib/session', () => ({ 
    getSession: hoisted.mockGetSession, 
    auth: {
        api: {
            getSession: hoisted.mockGetSession,
            createUser: vi.fn().mockResolvedValue({ 
                user: { id: 'new-id', email: 'new@test.com', name: 'New User' } 
            }),
            changePassword: vi.fn().mockResolvedValue({ success: true }),
        }
    }
}));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            createUser: vi.fn().mockResolvedValue({ 
                user: { id: 'new-id', email: 'new@test.com', name: 'New User' } 
            }),
            changePassword: vi.fn().mockResolvedValue({ success: true }),
            getSession: hoisted.mockGetSession,
        }
    },
    getSession: hoisted.mockGetSession,
}));
vi.mock('@/lib/security-logger', () => ({ logSecurityEvent: vi.fn() }));
vi.mock('@/lib/password', () => ({
    hashPassword: vi.fn().mockResolvedValue('hashed-password'),
    comparePassword: vi.fn(),
}));
vi.mock('@/lib/backup', () => ({ performDatabaseBackup: vi.fn().mockResolvedValue({ success: true, fileName: 'backup.json' }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({ 
    cookies: vi.fn().mockReturnValue({ set: vi.fn(), get: vi.fn(), delete: vi.fn() }),
    headers: vi.fn().mockResolvedValue(new Map()),
}));
vi.mock('@/lib/admin', () => ({ 
    requireAdmin: vi.fn(async (session: unknown) => {
        const s = session as { user?: { id: string; roleName: string }; id?: string; roleName?: string };
        if (!s) throw new Error('Unauthorized');
        if (s.user?.roleName === 'User' || s.roleName === 'User') {
            throw new Error('Доступ запрещен');
        }
        return { id: s.user?.id || s.id || 'admin-id', role: { name: 'Администратор' } };
    }),
    checkIsAdmin: vi.fn().mockResolvedValue(true)
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import type { Session } from "@/lib/session";
import type { Session } from "@/lib/session";
import { getSession } from "@/lib/session";
import { requireAdmin } from '@/lib/admin';
import { mockSession, createMockUser, createFormData } from '../helpers/mocks';
import { performDatabaseBackup } from '@/lib/backup';

import { 
    getCurrentUserAction, 
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser 
} from '@/app/(main)/admin-panel/actions/users.actions';
import { 
    getSystemSettings, 
    createDatabaseBackup 
} from '@/app/(main)/admin-panel/actions/system.actions';
import { clearAuditLogs } from '@/app/(main)/admin-panel/actions/security.actions';
import { updateBrandingAction } from '@/app/(main)/admin-panel/actions/branding.actions';
import { getNotificationSettingsAction } from '@/app/(main)/admin-panel/actions/notifications.actions';

// ─── Setup ────────────────────────────────────────────────────────────────────

function setupMocks() {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue(mockSession({ roleName: 'Администратор' }) as Session);
    const mockAdmin = { id: 'admin-id', role: { name: 'Администратор' } };
    vi.mocked(requireAdmin).mockResolvedValue(mockAdmin as unknown as { id: string; role: { name: string } } as never);
    mockQuery.users.findFirst.mockResolvedValue(createMockUser({ 
        role: { id: '55555555-5555-4555-8555-555555555555', name: 'Администратор' } 
    }));
    mockQuery.roles.findMany.mockResolvedValue([]);
    mockQuery.departments.findMany.mockResolvedValue([]);
    mockQuery.auditLogs.findMany.mockResolvedValue([]);
    
    if (mockQuery.accounts) {
        mockQuery.accounts.findFirst = vi.fn().mockResolvedValue({ userId: '1', providerId: 'credential', password: 'hashed-password' });
    }
    vi.mocked(performDatabaseBackup).mockResolvedValue({ success: true, fileName: 'backup.json' });
}

describe('Admin Panel Actions', () => {
    beforeEach(() => {
        setupMocks();
    });

    describe('getCurrentUserAction', () => {
        beforeEach(() => {
            setupMocks();
        });

        it('возвращает текущего пользователя при наличии сессии', async () => {
            const user = createMockUser();
            mockQuery.users.findFirst.mockResolvedValueOnce(user);
            const result = await getCurrentUserAction();
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(user);
            }
        });

        it('возвращает ошибку если нет сессии', async () => {
            vi.mocked(getSession).mockResolvedValueOnce(null);
            const result = await getCurrentUserAction();
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Не авторизован');
            }
        });
    });

    describe('getUsers', () => {
        beforeEach(() => {
            setupMocks();
        });

        it('возвращает список пользователей', async () => {
            const users = [createMockUser(), createMockUser({ id: '2' })];
            mockQuery.users.findMany.mockResolvedValueOnce(users);
            const result = await getUsers();
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data?.users).toHaveLength(2);
            }
        });
    });

    describe('createUser', () => {
        beforeEach(() => {
            setupMocks();
        });

        it('создает пользователя при валидных данных', async () => {
            mockQuery.users.findFirst.mockResolvedValueOnce(createMockUser({ 
                role: { id: '55555555-5555-4555-8555-555555555555', name: 'Администратор' } 
            }));
            const formData = new FormData();
            formData.append('name', 'New User');
            formData.append('email', 'new@test.com');
            formData.append('password', 'TestPassword123');
            formData.append('roleId', '55555555-5555-4555-8555-555555555555');

            const result = await createUser(formData);
            if (!result.success) {
                console.error('Create user failed WITH ERROR:', (result as { error: string }).error);
            }
            expect(result.success).toBe(true);
        });
    });

    describe('updateUser', () => {
        beforeEach(() => {
            setupMocks();
        });

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
        beforeEach(() => {
            setupMocks();
        });

        it('удаляет пользователя', async () => {
            const result = await deleteUser('22222222-2222-4222-8222-222222222222');
            expect(result.success).toBe(true);
        });
    });

    describe('System Settings & Branding', () => {
        beforeEach(() => {
            setupMocks();
        });

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
                crmBackgroundBrightness: 100
            } as Parameters<typeof updateBrandingAction>[0]);
            expect(result).toEqual({ success: true });
        });
    });

    describe('Notifications', () => {
        beforeEach(() => {
            setupMocks();
        });

        it('getNotificationSettingsAction возвращает настройки', async () => {
            const result = await getNotificationSettingsAction();
            expect(result.success).toBe(true);
        });
    });

    describe('Backup & Logs', () => {
        beforeEach(() => {
            setupMocks();
        });

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
