/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSession, createMockClient, createMockUser } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindMany, mockFindFirst, mockSelect, mockTx } = vi.hoisted(() => {
    const mockFindMany = vi.fn();
    const mockFindFirst = vi.fn();
    const mockSelect = vi.fn();
    const mockTx = {
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        query: {
            clients: { findFirst: mockFindFirst, findMany: mockFindMany },
            orders: { findMany: mockFindMany, findFirst: mockFindFirst },
            orderItems: { findMany: mockFindMany },
            inventoryItems: { findFirst: mockFindFirst, findMany: mockFindMany },
            users: { findFirst: mockFindFirst },
        },
    };
    return { mockFindMany, mockFindFirst, mockSelect, mockTx };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            clients: { findMany: mockFindMany, findFirst: mockFindFirst },
            users: { findMany: mockFindMany, findFirst: mockFindFirst },
            orders: { findMany: mockFindMany, findFirst: mockFindFirst },
            orderItems: { findMany: mockFindMany },
        },
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        select: mockSelect,
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    },
}));

import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import {
    getManagers,
    getClients,
    checkClientDuplicates,
    addClient,
    updateClient,
    deleteClient,
    toggleClientArchived,
    bulkDeleteClients,
} from '@/app/(main)/dashboard/clients/actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

const setupMocks = () => {
    vi.resetAllMocks();

    vi.mocked(db.transaction).mockImplementation((async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as any);

    mockTx.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockTx.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) });
    mockTx.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

    // Restore db.update/insert/delete (used outside transactions by some actions)
    vi.mocked(db.update).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) } as unknown as any);
    vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) } as unknown as any);
    vi.mocked(db.delete).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) } as unknown as any);

    // Default select chain
    const chainObj: Record<string, any> = {};
    chainObj.from = vi.fn().mockReturnValue(chainObj);
    chainObj.where = vi.fn().mockReturnValue(chainObj);
    chainObj.limit = vi.fn().mockReturnValue(chainObj);
    chainObj.offset = vi.fn().mockReturnValue(chainObj);
    chainObj.leftJoin = vi.fn().mockReturnValue(chainObj);
    chainObj.innerJoin = vi.fn().mockReturnValue(chainObj);
    chainObj.groupBy = vi.fn().mockReturnValue(chainObj);
    chainObj.having = vi.fn().mockReturnValue(chainObj);
    chainObj.orderBy = vi.fn().mockReturnValue(chainObj);
    chainObj.$dynamic = vi.fn().mockReturnValue(chainObj);
    chainObj.then = (resolve: (val: unknown) => void, reject: (reason: unknown) => void) => Promise.resolve([]).then(resolve, reject);
    mockSelect.mockImplementation(() => chainObj);
};

describe('getManagers', () => {
    beforeEach(() => setupMocks());

    it('возвращает список менеджеров', async () => {
        const managers = [{ id: 'u1', name: 'Manager 1', roleName: 'Менеджер' }];
        mockFindMany.mockResolvedValueOnce(managers);
        const result = await getManagers();
        expect(result).toEqual({ success: true, data: managers });
    });

    it('возвращает ошибку при сбое БД', async () => {
        mockFindMany.mockRejectedValueOnce(new Error('DB error'));
        const result = await getManagers();
        expect(result.success).toBe(false);
    });
});

describe('getClients', () => {
    beforeEach(() => setupMocks());

    it('возвращает список клиентов с пагинацией', async () => {
        // getClients uses db.select({...}).from(clients).leftJoin(...).where(...).groupBy(...).$dynamic()
        // then .limit().offset() => data
        // then another db.select({count}).from(clients).where(...).limit(1) => total
        const clientData = [createMockClient(), createMockClient({ id: 'c2' })];

        // The chainObj from setupMocks handles all chaining and resolves to []
        // We need to make it resolve to our data on first await, then count on second
        const chainObj: Record<string, any> = {};
        chainObj.from = vi.fn().mockReturnValue(chainObj);
        chainObj.where = vi.fn().mockReturnValue(chainObj);
        chainObj.leftJoin = vi.fn().mockReturnValue(chainObj);
        chainObj.groupBy = vi.fn().mockReturnValue(chainObj);
        chainObj.having = vi.fn().mockReturnValue(chainObj);
        chainObj.orderBy = vi.fn().mockReturnValue(chainObj);
        chainObj.$dynamic = vi.fn().mockReturnValue(chainObj);
        chainObj.limit = vi.fn().mockReturnValue(chainObj);
        chainObj.offset = vi.fn().mockReturnValue(chainObj);
        // First await returns client data
        chainObj.then = (resolve: (val: unknown) => void, reject: (reason: unknown) => void) => Promise.resolve(clientData).then(resolve, reject);

        // Second call for count query
        const countChain: Record<string, any> = {};
        countChain.from = vi.fn().mockReturnValue(countChain);
        countChain.where = vi.fn().mockReturnValue(countChain);
        countChain.limit = vi.fn().mockReturnValue(countChain);
        countChain.then = (resolve: (val: unknown) => void, reject: (reason: unknown) => void) => Promise.resolve([{ count: 2 }]).then(resolve, reject);

        vi.mocked(db.select)
            .mockImplementationOnce(() => chainObj as any)
            .mockImplementationOnce(() => countChain as any);

        const result = await getClients({ page: 1, limit: 10 });
        expect(result.success).toBe(true);
    });
});

describe('checkClientDuplicates', () => {
    beforeEach(() => setupMocks());

    it('возвращает пустой массив при пустых данных', async () => {
        const result = await checkClientDuplicates({});
        expect(result).toEqual({ success: true, data: [] });
    });

    // checkClientDuplicates: phone '123' has 3 digits < 6, so no conditions → returns { success: true, data: [] }
    it('возвращает пустой массив при слишком коротком номере телефона', async () => {
        const result = await checkClientDuplicates({ phone: '123' });
        expect(result).toEqual({ success: true, data: [] });
    });

    it('ищет дубликаты по телефону', async () => {
        const existing = [createMockClient()];
        // checkClientDuplicates uses db.select().from(clients).where(...).limit(5)
        // Update chainObj type to avoid explicit any
        // We use unknown and cast when needed or just rely on the fact that these are mocks
        const chainObj: Record<string, unknown> = {};
        chainObj.from = vi.fn().mockReturnValue(chainObj);
        chainObj.where = vi.fn().mockReturnValue(chainObj);
        chainObj.limit = vi.fn().mockReturnValue(chainObj);
        chainObj.then = (resolve: (val: unknown) => void, reject: (reason: unknown) => void) => Promise.resolve(existing).then(resolve, reject);
        vi.mocked(db.select).mockImplementationOnce(() => chainObj as any);

        const result = await checkClientDuplicates({ phone: '+79001234567' });
        expect(result.success).toBe(true);
    });
});

describe('addClient', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        // addClient takes FormData
        const fd = new FormData();
        fd.append('lastName', 'Иванов');
        fd.append('firstName', 'Иван');
        const result = await addClient(fd);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при невалидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const fd = new FormData();
        fd.append('lastName', '');
        fd.append('firstName', '');
        const result = await addClient(fd);
        expect(result.success).toBe(false);
    });

    it('создаёт клиента при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const newClient = createMockClient();

        // addClient checks duplicates using db.select().from(clients).where().limit(5)
        // Mock to return no duplicates
        const dupChain: Record<string, unknown> = {};
        dupChain.from = vi.fn().mockReturnValue(dupChain);
        dupChain.where = vi.fn().mockReturnValue(dupChain);
        dupChain.limit = vi.fn().mockReturnValue(dupChain);
        dupChain.then = (resolve: (val: unknown[]) => void, reject: (reason: unknown) => void) => Promise.resolve([]).then(resolve, reject);
        vi.mocked(db.select).mockImplementationOnce(() => dupChain as any);

        mockTx.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newClient]) }),
        });

        const fd = new FormData();
        fd.append('lastName', 'Иванов');
        fd.append('firstName', 'Иван');
        fd.append('phone', '+79001234567');
        fd.append('clientType', 'b2c');

        const result = await addClient(fd);
        expect(result.success).toBe(true);
    });
});

describe('updateClient', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const fd = new FormData();
        fd.append('lastName', 'Updated');
        // updateClient takes (clientId: string, formData: FormData)
        const result = await updateClient('33333333-3333-4333-8333-333333333333', fd);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('обновляет клиента при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        // updateClient calls db.query.users.findFirst to check user role
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Администратор' } }));

        const fd = new FormData();
        fd.append('lastName', 'Иванов');
        fd.append('firstName', 'Иван');
        fd.append('phone', '+79001234567');
        fd.append('clientType', 'b2c');

        const result = await updateClient('33333333-3333-4333-8333-333333333333', fd);
        if (!result.success) console.error('updateClient failed:', result.error);
        expect(result).toEqual({ success: true });
    });
});

describe('deleteClient', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await deleteClient('33333333-3333-4333-8333-333333333333');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку если не администратор', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Менеджер' }));
        // deleteClient uses db.query.users.findFirst (NOT tx)
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Менеджер' } }));
        const result = await deleteClient('33333333-3333-4333-8333-333333333333');
        expect(result.success).toBe(false);
        expect((result as { error: string }).error).toContain('администратор');
    });

    it('удаляет клиента для администратора', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));
        // deleteClient uses db.query.users.findFirst (NOT tx) to check admin rights
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Администратор' } }));
        // Inside tx: tx.query.clients.findFirst returns client with no orders
        mockTx.query.clients.findFirst = vi.fn().mockResolvedValue(createMockClient());

        const result = await deleteClient('33333333-3333-4333-8333-333333333333');
        expect(result).toEqual({ success: true });
    });
});

describe('toggleClientArchived', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await toggleClientArchived('33333333-3333-4333-8333-333333333333', true);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('архивирует клиента', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await toggleClientArchived('33333333-3333-4333-8333-333333333333', true);
        expect(result).toEqual({ success: true });
    });
});

describe('bulkDeleteClients', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await bulkDeleteClients(['33333333-3333-4333-8333-333333333333']);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при пустом массиве', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await bulkDeleteClients([]);
        expect(result.success).toBe(false);
    });

    it('возвращает ошибку если не администратор', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Менеджер' }));
        // bulkDeleteClients uses db.query.users.findFirst (NOT tx)
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Менеджер' } }));
        const result = await bulkDeleteClients(['33333333-3333-4333-8333-333333333333']);
        expect(result.success).toBe(false);
    });

    it('удаляет клиентов массово для администратора', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));
        // bulkDeleteClients uses db.query.users.findFirst (NOT tx) for permission check
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Администратор' } }));
        // Inside tx: tx.query.orders.findMany returns no orders for these clients
        mockTx.query.orders.findMany = vi.fn().mockResolvedValue([]);

        const result = await bulkDeleteClients(['33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333334']);
        expect(result).toEqual({ success: true });
    });
});
