import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession, createFormData, createMockClient, createMockUser, createMockOrder } from '../../tests/helpers/mocks';
import { createOrder, updateOrderField } from '@/app/(main)/dashboard/orders/actions/core.actions';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// Mock dependencies
vi.mock('@/lib/session', () => ({
    getSession: vi.fn(),
}));

vi.mock('@/lib/error-logger', () => ({
    logError: vi.fn(),
}));

vi.mock('@/lib/audit', () => ({
    logAction: vi.fn(),
}));

vi.mock('@/lib/notifications', () => ({
    sendStaffNotifications: vi.fn(),
}));

vi.mock('@/app/(main)/admin-panel/actions/branding.actions', () => ({
    getBrandingSettings: vi.fn().mockResolvedValue({ currencySymbol: '₽' }),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/queue', () => ({
    queueClientStatsUpdate: vi.fn(),
}));

// Mock DB
const createMockTx = () => {
    const tx = {
        insert: vi.fn().mockImplementation(() => tx),
        update: vi.fn().mockImplementation(() => tx),
        delete: vi.fn().mockImplementation(() => tx),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockImplementation(async () => [{ id: 'mock-id' }]),
        query: {
            clients: { findFirst: vi.fn() },
            orders: { findFirst: vi.fn() },
            promocodes: { findFirst: vi.fn() },
            orderItems: { findMany: vi.fn().mockResolvedValue([]) },
        },
        select: vi.fn().mockImplementation(() => ({
            from: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([]),
        })),
    };
    return tx;
};

let mockTx: ReturnType<typeof createMockTx>;

vi.mock('@/lib/db', () => ({
    db: {
        transaction: vi.fn((cb) => cb(mockTx)),
        select: vi.fn().mockReturnThis(),
        query: {
            orders: {
                findFirst: vi.fn(),
            },
            users: {
                findFirst: vi.fn(),
            },
        },
    },
}));

const VALID_CLIENT_ID = '4242a424-b424-4242-a424-c123456789ab';
const VALID_PROMO_ID = '4242a424-b424-4242-a424-c123456789ac';
const VALID_INV_ID = '4242a424-b424-4242-a424-c123456789ad';
const VALID_ORDER_ID = '4242a424-b424-4242-a424-c123456789ae';

describe('Order Actions', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mockTx = createMockTx();
        
        // Ensure mockSession has an id because core.actions.ts uses session.id
        const adminSession = mockSession({ 
            roleSlug: 'admin',
            id: 'user-id' 
        });
        
        vi.mocked(getSession).mockResolvedValue(adminSession);
        vi.mocked(db.transaction).mockImplementation((cb) => cb(mockTx as never));
        vi.mocked(db.query.users.findFirst).mockResolvedValue(createMockUser({ 
            id: 'user-id', 
            roleId: 'role-id',
            role: { slug: 'admin', name: 'Администратор' }
        }) as never);
    });

    describe('createOrder', () => {
        it('должен успешно создать заказ при валидных данных', async () => {
            // 1. Mock order number generation
            mockTx.select.mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ orderNumber: 'ORD-26-1000' }]),
            });

            // 2. Mock order insertion
            const insertOrderMock = vi.fn().mockResolvedValue([{ id: VALID_ORDER_ID }]);
            mockTx.insert.mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: insertOrderMock }) });
            
            // 3. Mock client find for logging
            mockTx.query.clients.findFirst.mockResolvedValueOnce(createMockClient({ id: VALID_CLIENT_ID }));
            
            // 4. Mock orderItems insert
            const insertItemsMock = vi.fn().mockResolvedValue([]);
            mockTx.insert.mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: insertItemsMock }) });

            const formData = createFormData({
                clientId: VALID_CLIENT_ID,
                priority: 'normal',
                isUrgent: 'false',
                advanceAmount: '1000',
                paymentMethod: 'cash',
                items: JSON.stringify([{ description: 'Товар 1', quantity: 2, price: 500 }]),
            });

            const result = await createOrder(formData);

            expect(result.success).toBe(true);
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/orders');
        });

        it('должен вернуть ошибку при нехватке товара на складе', async () => {
            // 1. Mock order number generation (even if failure occurs later)
            mockTx.select.mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ orderNumber: 'ORD-26-1001' }]),
            });

            // 1. Order insertion must succeed
            // 2. Inventory item update must fail (return empty array)
            mockTx.returning
                .mockResolvedValueOnce([{ id: VALID_ORDER_ID }])
                .mockResolvedValueOnce([]);

            const formData = createFormData({
                clientId: VALID_CLIENT_ID,
                priority: 'normal',
                isUrgent: 'false',
                advanceAmount: '0',
                paymentMethod: 'cash',
                items: JSON.stringify([{ description: 'Товар 1', quantity: 100, price: 500, inventoryId: VALID_INV_ID }]),
            });

            const result = await createOrder(formData);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain('Недостаточно товара');
            }
        });

        it('должен корректно применить промокод', async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ roleSlug: 'admin' }));
            
            mockTx.select.mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
            });
            // Order insert
            const insertOrderMock = vi.fn().mockResolvedValue([{ id: VALID_ORDER_ID }]);
            mockTx.insert.mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: insertOrderMock }) });
            // Client find
            mockTx.query.clients.findFirst.mockResolvedValueOnce(createMockClient({ id: VALID_CLIENT_ID }));
            // OrderItems insert
            const insertItemsMock = vi.fn().mockResolvedValue([]);
            mockTx.insert.mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: insertItemsMock }) });
            
            // Active percentage promocode (10%)
            mockTx.query.promocodes.findFirst.mockResolvedValueOnce({
                id: VALID_PROMO_ID,
                isActive: true,
                discountType: 'percentage',
                value: '10',
                usageCount: 0,
            });

            const formData = createFormData({
                clientId: VALID_CLIENT_ID,
                priority: 'normal',
                isUrgent: 'false',
                advanceAmount: '0',
                paymentMethod: 'cash',
                promocodeId: VALID_PROMO_ID,
                items: JSON.stringify([{ description: 'Товар 1', quantity: 1, price: 1000 }]),
            });

            const result = await createOrder(formData);

            expect(result.success).toBe(true);
        });
    });

    describe('updateOrderField', () => {
        it('должен обновить приоритет заказа для администратора', async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ roleSlug: 'admin' }));
            
            mockTx.query.orders.findFirst.mockResolvedValueOnce({ id: VALID_ORDER_ID, clientId: VALID_CLIENT_ID });
            // For the second findFirst after transaction
            vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce(createMockOrder({ id: VALID_ORDER_ID, clientId: VALID_CLIENT_ID }) as never);

            const result = await updateOrderField(VALID_ORDER_ID, 'priority', 'high');

            expect(result.success).toBe(true);
        });

        it('должен отклонить запрос от роли без прав', async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ roleSlug: 'client' }));
            (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                id: 'user-id',
                role: { slug: 'client', name: 'Клиент', permissions: {} },
            });
            
            const result = await updateOrderField(VALID_ORDER_ID, 'priority', 'high');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain('прав');
            }
        });
    });
});
