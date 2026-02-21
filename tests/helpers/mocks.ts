/**
 * Shared mock factories and helpers for all tests.
 * Import from this file to get consistent mock objects.
 */
import { vi } from 'vitest';
import { Task } from '@/app/(main)/dashboard/tasks/types';

// ─── Session ─────────────────────────────────────────────────────────────────

export function mockSession(overrides: Partial<{
    id: string;
    email: string;
    name: string;
    roleId: string;
    roleName: string;
    departmentName: string;
    expires: Date;
}> = {}) {
    return {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'admin@test.com',
        name: 'Test Admin',
        roleId: 'role-uuid-1234',
        roleName: 'Администратор',
        departmentName: 'Руководство',
        expires: new Date(Date.now() + 86400000),
        ...overrides,
    };
}

// ─── DB Mock ──────────────────────────────────────────────────────────────────

/**
 * Creates a chainable Drizzle-like query builder mock.
 * Usage: const { db } = createDbMock({ findMany: [item1, item2] })
 */
export function createDbMock(queryResults: Record<string, unknown> = {}) {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(queryResults.returning ?? []),
        $dynamic: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(queryResults.execute ?? []),
    };

    const queryMock = {
        findMany: vi.fn().mockResolvedValue(queryResults.findMany ?? []),
        findFirst: vi.fn().mockResolvedValue(queryResults.findFirst ?? null),
    };

    const txMock = {
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue(queryResults.insert ?? []) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue(queryResults.update ?? []) }) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        query: { ...Object.fromEntries(Object.keys(queryResults).map(k => [k, queryMock])) },
        select: vi.fn().mockReturnValue(chainable),
    };

    const db = {
        query: new Proxy({} as Record<string, typeof queryMock>, {
            get: () => queryMock,
        }),
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue(queryResults.insert ?? []),
            }),
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue(queryResults.update ?? []),
                }),
            }),
        }),
        delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
        }),
        select: vi.fn().mockReturnValue(chainable),
        selectDistinct: vi.fn().mockReturnValue(chainable),
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock)),
    };

    return { db, queryMock, txMock, chainable };
}

// ─── Entity Factories ─────────────────────────────────────────────────────────

export function createMockTask(overrides: Partial<Task> = {}): Task {
    return {
        id: '22222222-2222-4222-8222-222222222222',
        title: 'Test Task',
        description: 'Test description',
        status: 'new',
        priority: 'normal',
        type: 'other',
        createdBy: '11111111-1111-4111-8111-111111111111',
        assignedToUserId: null,
        assignedToRoleId: null,
        assignedToDepartmentId: null,
        orderId: null,
        dueDate: null,
        createdAt: new Date('2026-01-01'),
        ...overrides,
    } as Task;
}

export function createMockClient(overrides: Record<string, unknown> = {}) {
    return {
        id: 'client-uuid-1234',
        name: 'Иванов Иван',
        firstName: 'Иван',
        lastName: 'Иванов',
        patronymic: null,
        clientType: 'individual',
        company: null,
        phone: '+79001234567',
        telegram: null,
        instagram: null,
        email: 'ivan@test.com',
        city: 'Москва',
        address: null,
        comments: null,
        socialLink: null,
        acquisitionSource: null,
        managerId: null,
        isArchived: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        ...overrides,
    };
}

export function createMockOrder(overrides: Record<string, unknown> = {}) {
    return {
        id: 'order-uuid-1234',
        orderNumber: 'ORD-26-1000',
        clientId: 'client-uuid-1234',
        status: 'new',
        priority: 'normal',
        isUrgent: false,
        totalAmount: '5000',
        paidAmount: '0',
        discountAmount: '0',
        cancelReason: null,
        isArchived: false,
        createdBy: '11111111-1111-4111-8111-111111111111',
        deadline: null,
        promocodeId: null,
        category: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        ...overrides,
    };
}

export function createMockUser(overrides: Record<string, unknown> = {}) {
    return {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Test Admin',
        email: 'admin@test.com',
        passwordHash: '$2b$10$hashedpassword',
        roleId: 'role-uuid-1234',
        departmentId: null,
        isSystem: false,
        avatar: null,
        phone: null,
        telegram: null,
        instagram: null,
        socialMax: null,
        birthday: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        role: { id: 'role-uuid-1234', name: 'Администратор' },
        department: null,
        ...overrides,
    };
}

export function createMockExpense(overrides: Record<string, unknown> = {}) {
    return {
        id: 'expense-uuid-1234',
        category: 'other',
        amount: '1000',
        description: 'Test expense',
        date: '2026-01-01',
        createdBy: '11111111-1111-4111-8111-111111111111',
        createdAt: new Date('2026-01-01'),
        ...overrides,
    };
}

// ─── FormData helper ──────────────────────────────────────────────────────────

export function createFormData(data: Record<string, string>): FormData {
    const map = new Map(Object.entries(data));
    const formData = {
        append: (key: string, value: string | Blob) => {
            map.set(key, typeof value === 'string' ? value : '');
        },
        get: (key: string) => map.get(key) ?? null,
        getAll: (key: string) => {
            const val = map.get(key);
            return val !== undefined ? [val] : [];
        },
        has: (key: string) => map.has(key),
        entries: function* () { yield* Array.from(map.entries()); },
        [Symbol.iterator]: function* () { yield* Array.from(map.entries()); },
        forEach: (cb: Parameters<Map<string, string>['forEach']>[0]) => map.forEach(cb),
    } as unknown as FormData;

    return formData;
}
