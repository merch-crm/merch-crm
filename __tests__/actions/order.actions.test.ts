import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession, createFormData, createMockClient } from '../../tests/helpers/mocks';
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

vi.mock('@/app/(main)/admin-panel/actions', () => ({
    getBrandingSettings: vi.fn().mockResolvedValue({ currencySymbol: '₽' }),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/queue', () => ({
    queueClientStatsUpdate: vi.fn(),
}));

// Mock DB
const mockTx = {
    insert: vi.fn().mockImplementation(() => ({
        values: vi.fn().mockImplementation(() => ({
            returning: vi.fn().mockResolvedValue([]),
        })),
    })),
    update: vi.fn().mockImplementation(() => ({
        set: vi.fn().mockImplementation(() => ({
            where: vi.fn().mockImplementation(() => ({
                returning: vi.fn().mockResolvedValue([]),
            })),
        })),
    })),
    delete: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockReturnThis(),
    })),
    query: {
        clients: { findFirst: vi.fn() },
        orders: { findFirst: vi.fn() },
        promocodes: { findFirst: vi.fn() },
        orderItems: { findMany: vi.fn().mockResolvedValue([]) },
    },
    select: vi.fn().mockReturnThis(),
};

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

const VALID_CLIENT_ID = '33333333-3333-4333-8333-333333333333';
const VALID_PROMO_ID = '44444444-4444-4444-8444-444444444444';
const VALID_INV_ID = '55555555-5555-4555-8555-555555555555';
const VALID_ORDER_ID = '66666666-6666-4666-8666-666666666666';

describe('Order Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock session user in DB for withAuth
        (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 'user-id',
            name: 'Admin',
            email: 'admin@example.com',
            role: { name: 'Администратор', permissions: {} },
        });

        // Reset mockTx defaults for each test
        mockTx.select.mockImplementation(() => ({
            from: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([]),
        }));
    });

    describe('createOrder', () => {
        it('должен успешно создать заказ при валидных данных', async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ roleName: 'Администратор' }));
            
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
            vi.mocked(getSession).mockResolvedValue(mockSession({ roleName: 'Администратор' }));
            
            // 1. Mock order number generation
            mockTx.select.mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
            });
            // 2. Mock order insertion
            const insertOrderMock = vi.fn().mockResolvedValue([{ id: VALID_ORDER_ID }]);
            mockTx.insert.mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: insertOrderMock }) });
            // 3. Mock client find
            mockTx.query.clients.findFirst.mockResolvedValueOnce(createMockClient({ id: VALID_CLIENT_ID }));
            // 4. Mock orderItems insert
            const insertItemsMock = vi.fn().mockResolvedValue([]);
            mockTx.insert.mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: insertItemsMock }) });
            // 5. Mock inventory update returning empty (STOCK FAILURE)
            const updateStockMock = vi.fn().mockResolvedValue([]);
            mockTx.update.mockReturnValueOnce({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: updateStockMock }) }) });

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
            vi.mocked(getSession).mockResolvedValue(mockSession({ roleName: 'Администратор' }));
            
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
            vi.mocked(getSession).mockResolvedValue(mockSession({ roleName: 'Администратор' }));
            
            mockTx.query.orders.findFirst.mockResolvedValueOnce({ id: VALID_ORDER_ID, clientId: VALID_CLIENT_ID });
            // For the second findFirst after transaction
            vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce({ id: VALID_ORDER_ID, clientId: VALID_CLIENT_ID } as unknown as any); // eslint-disable-line @typescript-eslint/no-explicit-any

            const result = await updateOrderField(VALID_ORDER_ID, 'priority', 'high');

            expect(result.success).toBe(true);
        });

        it('должен отклонить запрос от роли без прав', async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ roleName: 'Клиент' }));
            (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
                id: 'user-id',
                role: { name: 'Клиент', permissions: {} },
            });
            
            const result = await updateOrderField(VALID_ORDER_ID, 'priority', 'high');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain('прав');
            }
        });
    });
});
