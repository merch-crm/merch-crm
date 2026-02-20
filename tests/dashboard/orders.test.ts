import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession, createMockOrder, createFormData, createMockUser } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindMany, mockFindFirst, mockSelect, mockTx } = vi.hoisted(() => {
    const mockFindMany = vi.fn().mockResolvedValue([]);
    const mockFindFirst = vi.fn().mockResolvedValue(null);
    const mockSelect = vi.fn().mockImplementation(() => {
        const chain: any = {
            from: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            offset: vi.fn().mockReturnThis(),
            then: (resolve: any) => resolve([{ count: 0 }]),
        };
        return chain;
    });
    const mockTx = {
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        select: mockSelect,
        query: {
            users: { findFirst: mockFindFirst },
            orders: { findFirst: mockFindFirst, findMany: mockFindMany },
            clients: { findFirst: mockFindFirst, findMany: mockFindMany },
            orderItems: { findMany: mockFindMany, findFirst: mockFindFirst },
            inventoryItems: { findFirst: mockFindFirst, findMany: mockFindMany },
            promocodes: { findFirst: mockFindFirst },
            inventoryStocks: { findFirst: mockFindFirst, findMany: mockFindMany },
            inventoryTransactions: { findFirst: mockFindFirst, findMany: mockFindMany },
            orderAttachments: { findFirst: mockFindFirst, findMany: mockFindMany },
            payments: { findFirst: mockFindFirst, findMany: mockFindMany },
        },
    };
    return { mockFindFirst, mockFindMany, mockSelect, mockTx };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/notifications', () => ({ sendStaffNotifications: vi.fn() }));
vi.mock('@/app/(main)/admin-panel/branding/actions', () => ({ getBrandingSettings: vi.fn().mockResolvedValue({}) }));
vi.mock('@/lib/automations', () => ({ autoGenerateTasks: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            users: { findFirst: mockFindFirst, findMany: mockFindMany },
            orders: { findFirst: mockFindFirst, findMany: mockFindMany },
            clients: { findFirst: mockFindFirst, findMany: mockFindMany },
            orderItems: { findMany: mockFindMany, findFirst: mockFindFirst },
            inventoryItems: { findFirst: mockFindFirst, findMany: mockFindMany },
            promocodes: { findFirst: mockFindFirst },
            inventoryStocks: { findFirst: mockFindFirst, findMany: mockFindMany },
            orderAttachments: { findFirst: mockFindFirst, findMany: mockFindMany },
            payments: { findFirst: mockFindFirst, findMany: mockFindMany },
        },
        select: mockSelect,
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    },
}));

import { getSession } from '@/lib/auth';
import {
    getOrders,
    searchClients,
    getClientsForSelect,
    getInventoryForSelect,
    createOrder,
    updateOrderStatus,
    updateOrderPriority,
    archiveOrder,
    bulkDeleteOrders,
} from '@/app/(main)/dashboard/orders/actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

const setupMocks = () => {
    vi.resetAllMocks();

    // Restore db.transaction implementation
    vi.mocked(db.transaction).mockImplementation((async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as any);

    // Restore mockTx chainable defaults
    mockTx.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockTx.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) });
    mockTx.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

    // Restore db.update/insert/delete (used outside transactions)
    vi.mocked(db.update).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) } as unknown as any);
    vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) } as unknown as any);
    vi.mocked(db.delete).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) } as unknown as any);

    // Default select chain (thenable)
    const chainObj: Record<string, any> = {};
    chainObj.from = vi.fn().mockReturnValue(chainObj);
    chainObj.where = vi.fn().mockReturnValue(chainObj);
    chainObj.orderBy = vi.fn().mockReturnValue(chainObj);
    chainObj.limit = vi.fn().mockReturnValue(chainObj);
    chainObj.offset = vi.fn().mockReturnValue(chainObj);
    chainObj.innerJoin = vi.fn().mockReturnValue(chainObj);
    chainObj.leftJoin = vi.fn().mockReturnValue(chainObj);
    chainObj.then = (resolve: (val: unknown) => void, reject: (reason: unknown) => void) => Promise.resolve([]).then(resolve, reject);

    mockSelect.mockImplementation(() => chainObj);

    // Also set mockTx.select
    mockTx.select.mockImplementation(() => chainObj);
};

describe('getOrders', () => {
    beforeEach(() => setupMocks());

    it('возвращает список заказов с пагинацией', async () => {
        const orders = [createMockOrder(), createMockOrder({ id: 'o2' })];
        // getOrders calls:
        // 1. db.select({count}).from(orders).innerJoin(clients).where().limit(1) => [{count: N}]
        // 2. db.query.orders.findMany({...}) => orders data
        // 3. getSession() for role check

        // Mock db.select for count query
        vi.mocked(db.select).mockImplementation(() => ({
            from: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([{ count: 2 }])
        } as any));

        // Mock db.query.orders.findMany for paginated data
        mockFindMany.mockResolvedValueOnce(orders);

        // Mock getSession for role check inside getOrders
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());

        const result = await getOrders();
        expect(result.success).toBe(true);
    });

    it('возвращает ошибку при сбое БД', async () => {
        mockFindMany.mockRejectedValueOnce(new Error('DB error'));
        const result = await getOrders();
        expect(result.success).toBe(false);
    });
});

describe('searchClients', () => {
    beforeEach(() => setupMocks());

    // searchClients: query.length < 2 => returns { success: true, data: [] }
    it('возвращает пустой результат при слишком коротком запросе', async () => {
        const result = await searchClients('ab');
        expect(result).toEqual({ success: true, data: [] });
    });

    it('возвращает пустой массив при пустом запросе', async () => {
        const result = await searchClients('');
        expect(result).toEqual({ success: true, data: [] });
    });

    it('ищет клиентов по запросу', async () => {
        const clients = [{ id: 'c1', firstName: 'Иван', lastName: 'Иванов', name: 'Иванов Иван' }];
        mockFindMany.mockResolvedValueOnce(clients);
        const result = await searchClients('Иванов');
        expect(result).toEqual({ success: true, data: clients });
    });
});

describe('getClientsForSelect', () => {
    beforeEach(() => setupMocks());

    it('возвращает клиентов для выбора', async () => {
        const clients = [{ id: '1', name: 'Client 1' }];
        vi.mocked(db.select).mockImplementation(() => ({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue(clients),
                }),
            }),
        } as unknown as any));
        const result = await getClientsForSelect();
        expect(result).toEqual({ success: true, data: clients });
    });
});

describe('getInventoryForSelect', () => {
    beforeEach(() => setupMocks());

    it('возвращает товары для выбора', async () => {
        const items = [{ id: 'i1', name: 'Item 1', quantity: 10 }];
        vi.mocked(db.select).mockImplementation(() => ({
            from: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(items),
            }),
        } as unknown as any));
        const result = await getInventoryForSelect();
        expect(result).toEqual({ success: true, data: items });
    });
});

describe('createOrder', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await createOrder(createFormData({ clientId: '33333333-3333-4333-8333-333333333333' }));
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при невалидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await createOrder(createFormData({ clientId: '' }));
        expect(result.success).toBe(false);
    });

    it('создаёт заказ при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const newOrder = createMockOrder();

        // Mock tx.select for order number generation
        const selectChain: Record<string, unknown> = {};
        selectChain.from = vi.fn().mockReturnValue(selectChain);
        selectChain.orderBy = vi.fn().mockReturnValue(selectChain);
        selectChain.limit = vi.fn().mockResolvedValue([]);
        mockTx.select.mockImplementation(() => selectChain as any);

        // Mock tx.insert for order creation
        mockTx.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newOrder]) }),
        });

        // Mock tx.query.clients.findFirst for logging
        mockTx.query.clients.findFirst = vi.fn().mockResolvedValue({ name: 'Client' });

        // Mock tx.update for inventory reservation
        mockTx.update.mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'inv1' }]),
                }),
            }),
        });

        const items = JSON.stringify([{
            inventoryId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            quantity: 1,
            price: 1000,
            description: 'Test Item'
        }]);

        const result = await createOrder(createFormData({
            clientId: '33333333-3333-4333-8333-333333333333',
            priority: 'normal',
            isUrgent: 'false',
            advanceAmount: '0',
            paymentMethod: 'cash',
            items: items
        }));

        if (!result.success) console.error('createOrder failed:', result.error);
        expect(result.success).toBe(true);
    });
});

describe('updateOrderStatus', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await updateOrderStatus('44444444-4444-4444-8444-444444444444', 'new');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при невалидном статусе', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await updateOrderStatus('44444444-4444-4444-8444-444444444444', 'invalid-status' as unknown as any);
        expect(result.success).toBe(false);
    });

    it('обновляет статус заказа', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        // updateOrderStatus uses tx.query.orders.findFirst
        const mockOrder = { ...createMockOrder({ status: 'new' }), items: [] };
        mockTx.query.orders.findFirst = vi.fn().mockResolvedValue(mockOrder);

        const result = await updateOrderStatus('44444444-4444-4444-8444-444444444444', 'design');
        expect(result).toEqual({ success: true });
    });
});

describe('updateOrderPriority', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await updateOrderPriority('44444444-4444-4444-8444-444444444444', 'high');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при невалидном приоритете', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await updateOrderPriority('44444444-4444-4444-8444-444444444444', 'invalid-priority' as unknown as any);
        expect(result.success).toBe(false);
    });

    it('обновляет приоритет заказа', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        // updateOrderPriority uses db.update(orders).set(...).where(...) — NOT transaction
        // db.update is restored by setupMocks, so it should work
        const result = await updateOrderPriority('44444444-4444-4444-8444-444444444444', 'high');
        expect(result).toEqual({ success: true });
    });
});

describe('archiveOrder', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await archiveOrder('44444444-4444-4444-8444-444444444444');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку если нет прав', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Дизайнер' }));
        // archiveOrder uses db.query.users.findFirst (NOT tx)
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Дизайнер' }, department: { name: 'Дизайн' } }));

        const result = await archiveOrder('44444444-4444-4444-8444-444444444444');
        expect(result.success).toBe(false);
    });

    it('архивирует заказ для администратора', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));
        // archiveOrder uses db.query.users.findFirst (NOT tx)
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Администратор' }, department: null }));

        const result = await archiveOrder('44444444-4444-4444-8444-444444444444');
        expect(result).toEqual({ success: true });
    });
});

describe('bulkDeleteOrders', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await bulkDeleteOrders(['44444444-4444-4444-8444-444444444444']);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку если нет прав', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Дизайнер' }));
        // bulkDeleteOrders uses db.query.users.findFirst (NOT tx)
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Дизайнер' }, department: { name: 'Дизайн' } }));

        const result = await bulkDeleteOrders(['44444444-4444-4444-8444-444444444444']);
        expect(result.success).toBe(false);
    });

    it('удаляет заказы массово для администратора', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));
        // bulkDeleteOrders uses db.query.users.findFirst (NOT tx) for permission check
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Администратор' }, department: null }));
        // Inside tx: tx.query.orders.findMany returns orders to delete
        mockTx.query.orders.findMany = vi.fn().mockResolvedValue([{ id: '44444444-4444-4444-8444-444444444444', status: 'new' }]);
        // releaseOrderReservation calls tx.query.orderItems.findMany
        mockTx.query.orderItems = { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn() };

        const result = await bulkDeleteOrders(['44444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444445']);
        expect(result).toEqual({ success: true });
    });
});
