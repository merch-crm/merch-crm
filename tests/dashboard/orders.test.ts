import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession, createMockOrder, createFormData, createMockUser } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindMany, mockFindFirst, mockSelect, mockTx } = vi.hoisted(() => {
    const mockFindMany = vi.fn().mockResolvedValue([]);
    const mockFindFirst = vi.fn().mockResolvedValue(null);
    const mockSelect = vi.fn().mockImplementation(() => {
        const chain: Record<string, unknown> = {
            from: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            offset: vi.fn().mockReturnThis(),
            then: (resolve: (val: unknown) => void) => resolve([{ count: 0 }]),
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

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
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
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx as unknown as typeof mockTx)),
    },
}));

import { getSession } from '@/lib/session';
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
    vi.mocked(db.transaction).mockImplementation((async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as unknown as (fn: (tx: never) => Promise<unknown>) => Promise<unknown>);

    // Restore mockTx chainable defaults
    mockTx.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockTx.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) });
    mockTx.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

    // Restore users.findFirst for withAuth
    mockFindFirst.mockResolvedValue(createMockUser({ role: { name: 'Администратор' } }));

    // Restore db.update/insert/delete (used outside transactions)
    vi.mocked(db.update).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) } as unknown as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) } as unknown as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    vi.mocked(db.delete).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) } as unknown as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    // Default select chain (thenable)
    const chainObj: Record<string, unknown> = {};
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
        const orders = [
            createMockOrder({ client: { name: 'Иван Петров' } }), 
            createMockOrder({ id: 'o2', client: { name: 'Иван Петров' } })
        ];

        // Mock db.select for count query
        vi.mocked(db.select).mockImplementation(() => ({
            from: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnValue({
              then: (resolve: (val: unknown) => void) => resolve([{ count: 2 }] as unknown as any) // eslint-disable-line @typescript-eslint/no-explicit-any
            })
        } as unknown as any)); // eslint-disable-line @typescript-eslint/no-explicit-any

        // Mock db.query.orders.findMany for paginated data
        mockFindMany.mockResolvedValueOnce(orders);

        // Mock getSession for role check inside getOrders
        vi.mocked(getSession).mockResolvedValue(mockSession({ roleName: 'Администратор' }));

        const result = await getOrders();
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.orders).toEqual(orders);
            expect(result.data.pagination.total).toBe(2);
        }
    });

    it('возвращает ошибку при сбое БД', async () => {
        mockFindMany.mockRejectedValueOnce(new Error('DB error'));
        const result = await getOrders();
        expect(result.success).toBe(false);
    });
});

describe('searchClients', () => {
    beforeEach(() => setupMocks());

    it('возвращает пустой результат при слишком коротком запросе', async () => {
        vi.mocked(getSession).mockResolvedValue(mockSession());
        const result = await searchClients('ab');
        expect(result).toEqual({ success: true, data: [] });
    });

    it('возвращает пустой массив при пустом запросе', async () => {
        vi.mocked(getSession).mockResolvedValue(mockSession());
        const result = await searchClients('');
        expect(result).toEqual({ success: true, data: [] });
    });

    it('ищет клиентов по запросу', async () => {
        vi.mocked(getSession).mockResolvedValue(mockSession());
        const mockClients = [{ id: 'c1', firstName: 'Иван', lastName: 'Иванов', name: 'Иванов Иван' }];
        mockFindMany.mockResolvedValueOnce(mockClients);
        const result = await searchClients('Иванов');
        expect(result).toEqual({ success: true, data: mockClients });
    });
});

describe('getClientsForSelect', () => {
    beforeEach(() => setupMocks());

    it('возвращает клиентов для выбора', async () => {
        vi.mocked(getSession).mockResolvedValue(mockSession());
        const clients = [{ id: '1', name: 'Client 1' }];
        vi.mocked(db.select).mockImplementation(() => ({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue(clients),
                }),
            }),
        } as unknown as any)); // eslint-disable-line @typescript-eslint/no-explicit-any
        const result = await getClientsForSelect();
        expect(result).toEqual({ success: true, data: clients });
    });
});

describe('getInventoryForSelect', () => {
    beforeEach(() => setupMocks());

    it('возвращает товары для выбора', async () => {
        vi.mocked(getSession).mockResolvedValue(mockSession());
        const items = [{ id: 'i1', name: 'Item 1', quantity: 10 }];
        vi.mocked(db.select).mockImplementation(() => ({
            from: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(items),
            }),
        } as unknown as any)); // eslint-disable-line @typescript-eslint/no-explicit-any
        const result = await getInventoryForSelect();
        expect(result).toEqual({ success: true, data: items });
    });
});

describe('createOrder', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await createOrder(createFormData({ clientId: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242' }));
        expect(result).toEqual({ success: false, error: 'Не авторизован', code: 'UNAUTHORIZED' });
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
        mockTx.select.mockImplementation(() => selectChain as unknown as any); // eslint-disable-line @typescript-eslint/no-explicit-any

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
            clientId: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242',
            priority: 'normal',
            isUrgent: 'false',
            advanceAmount: '0',
            paymentMethod: 'cash',
            items: items
        }));

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual({ orderId: newOrder.id });
        }
    });
});

describe('updateOrderStatus', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await updateOrderStatus('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', 'new');
        expect(result).toEqual({ success: false, error: "Не авторизован", code: "UNAUTHORIZED" });
    });

    it('возвращает ошибку при невалидном статусе', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await updateOrderStatus('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', 'invalid-status' as unknown as never);
        expect(result.success).toBe(false);
    });

    it('обновляет статус заказа', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const mockOrder = { ...createMockOrder({ status: 'new' }), items: [] };
        mockTx.query.orders.findFirst = vi.fn().mockResolvedValue(mockOrder);

        const result = await updateOrderStatus('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', 'design');
        expect(result).toEqual({ success: true, data: undefined });
    });
});

describe('updateOrderPriority', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await updateOrderPriority('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', 'high');
        expect(result).toEqual({ success: false, error: "Не авторизован", code: "UNAUTHORIZED" });
    });

    it('возвращает ошибку при невалидном приоритете', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await updateOrderPriority('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', 'invalid-priority' as unknown as never);
        expect(result.success).toBe(false);
    });

    it('обновляет приоритет заказа', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await updateOrderPriority('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', 'high');
        expect(result).toEqual({ success: true, data: undefined });
    });
});

describe('archiveOrder', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await archiveOrder('4242XXXX-XXXX-4242-4242-XXXXXXXX4242');
        expect(result).toEqual({ success: false, error: 'Не авторизован', code: 'UNAUTHORIZED' });
    });

    it('возвращает ошибку если нет прав', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Дизайнер' }));
        mockFindFirst.mockResolvedValueOnce({ 
            id: 'mock-id', 
            name: 'Designer', 
            email: 'd@d.com', 
            role: { id: 'd-role', name: 'Дизайнер', permissions: {} },
            department: { id: 'd-dept', name: 'Дизайн' }
        });

        const result = await archiveOrder('4242XXXX-XXXX-4242-4242-XXXXXXXX4242');
        expect(result).toEqual({ success: false, error: 'Недостаточно прав', code: 'FORBIDDEN' });
    });

    it('архивирует заказ для администратора', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Администратор' }, department: null }));

        const result = await archiveOrder('4242XXXX-XXXX-4242-4242-XXXXXXXX4242');
        expect(result).toEqual({ success: true, data: undefined });
    });
});

describe('bulkDeleteOrders', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await bulkDeleteOrders(['4242XXXX-XXXX-4242-4242-XXXXXXXX4242']);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку если нет прав', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Дизайнер' }));
        mockFindFirst.mockResolvedValueOnce({ 
            id: 'id', role: { name: 'Дизайнер' }, department: { name: 'Дизайн' } 
        });

        const result = await bulkDeleteOrders(['4242XXXX-XXXX-4242-4242-XXXXXXXX4242']);
        expect(result).toEqual({ success: false, error: 'Недостаточно прав' });
    });

    it('удаляет заказы массово для администратора', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));
        mockFindFirst.mockResolvedValueOnce(createMockUser({ role: { name: 'Администратор' }, department: null }));
        mockTx.query.orders.findMany = vi.fn().mockResolvedValue([{ id: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242', status: 'new' }]);
        mockTx.query.orderItems = { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn() };

        const result = await bulkDeleteOrders(['4242XXXX-XXXX-4242-4242-XXXXXXXX4242', '4242XXXX-XXXX-4242-4242-XXXXXXXX4242']);
        expect(result).toEqual({ success: true, data: undefined });
    });
});
