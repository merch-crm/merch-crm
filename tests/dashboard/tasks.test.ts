import { getSession } from "@/lib/session";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession, createMockTask } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const hoisted = vi.hoisted(() => {
    const mockFindMany = vi.fn();
    const mockFindFirst = vi.fn();
    const mockSelect = vi.fn();
    const createGenericMock = () => ({
        id: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242',
        taskId: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242', // for checklists
        title: 'Mock Object',
        createdBy: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242',
        userId: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242',
        status: 'new',
        priority: 'normal',
        type: 'other',
        content: 'Mock Content',
    });
    const mockTx = {
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([createGenericMock()]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        select: mockSelect,
        query: {
            tasks: { findFirst: mockFindFirst, findMany: mockFindMany },
            taskComments: { findMany: mockFindMany },
            taskChecklists: { findFirst: mockFindFirst, findMany: mockFindMany },
        },
    };
    const mockGetSession = vi.fn();
    return { mockFindMany, mockFindFirst, mockSelect, mockTx, mockGetSession, createGenericMock };
});

const { mockFindMany, mockFindFirst, mockSelect, mockTx, mockGetSession: _mockGetSession, createGenericMock } = hoisted;

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/session', () => ({ getSession: hoisted.mockGetSession }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/app/(main)/dashboard/tasks/notifications', () => ({ 
    notifyTaskCreated: vi.fn(), 
    notifyStatusChanged: vi.fn(), 
    notifyCommentAdded: vi.fn(),
    sendTaskNotification: vi.fn() 
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/session', () => ({ 
    getSession: hoisted.mockGetSession,
    auth: {
        api: {
            getSession: hoisted.mockGetSession,
        }
    }
}));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            tasks: { findFirst: hoisted.mockFindFirst, findMany: hoisted.mockFindMany },
            taskComments: { findMany: hoisted.mockFindMany },
            taskChecklists: { findFirst: hoisted.mockFindFirst, findMany: hoisted.mockFindMany },
        },
        select: hoisted.mockSelect,
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(hoisted.mockTx)),
    },
}));

import {
    getTasks,
    createTask,
    addTaskComment,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
} from '@/app/(main)/dashboard/tasks/actions';
import { type CreateTaskInput } from '@/app/(main)/dashboard/tasks/validation';

// ─── Tests ────────────────────────────────────────────────────────────────────

const setupMocks = () => {
    vi.clearAllMocks();
    vi.mocked(db.transaction).mockImplementation((async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as unknown as (fn: (tx: never) => Promise<unknown>) => Promise<unknown>);
    vi.mocked(db.update).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) } as unknown as ReturnType<typeof db.update>);
    vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) } as unknown as ReturnType<typeof db.insert>);
    vi.mocked(db.delete).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) } as unknown as ReturnType<typeof db.delete>);
    mockTx.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockTx.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    mockFindFirst.mockResolvedValue(createGenericMock());
    mockSelect.mockReset();
    mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnValue({
                limit: vi.fn().mockImplementation((val) => {
                    if (val === 1) return Promise.resolve([createGenericMock()]);
                    return Promise.resolve([createGenericMock(), createGenericMock()]);
                }),
                then: vi.fn().mockImplementation((resolve) => resolve([createGenericMock()])),
            }),
            limit: vi.fn().mockResolvedValue([createGenericMock()]),
            then: vi.fn().mockImplementation((resolve) => resolve([createGenericMock()])),
        })
    });
};

describe('getTasks', () => {
    beforeEach(() => setupMocks());

    it('возвращает список задач с пагинацией', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const tasks = [createMockTask(), createMockTask({ id: 't2' })];
        mockFindMany.mockResolvedValueOnce(tasks);
        mockSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{ count: 2 }]),
                }),
            }),
        });
        const result = await getTasks();
        expect(result.success).toBe(true);
    });

    it('возвращает ошибку при сбое БД', async () => {
        mockFindMany.mockRejectedValueOnce(new Error('DB error'));
        const result = await getTasks();
        expect(result.success).toBe(false);
    });
});

describe('createTask', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await createTask({ title: 'Test', priority: 'normal', type: 'general', deadline: new Date(), assigneeIds: ['user-1'] });
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при пустом заголовке', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await createTask({ title: '', priority: 'normal', type: 'general', deadline: new Date(), assigneeIds: ['user-1'] });
        expect(result.success).toBe(false);
    });

    it('создаёт задачу при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValue(mockSession());
        const taskInput = {
            title: 'New Task',
            description: 'Test Description',
            priority: 'normal',
            type: 'other',
            deadline: new Date(),
            assigneeIds: ['4242XXXX-XXXX-4242-4242-XXXXXXXX4242'],
            watcherIds: []
        };
        const result = await createTask(taskInput as CreateTaskInput);
        expect(result.success).toBe(true);
    });
});

describe('addTaskComment', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку при пустом комментарии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await addTaskComment('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', '');
        expect(result.success).toBe(false);
    });

    it('добавляет комментарий', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockTx.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242', content: 'Comment' }]) }),
        });
        const result = await addTaskComment('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', 'Test Comment');
        expect(result).toMatchObject({ success: true });
    });
});

describe('addChecklistItem', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку при пустом пункте', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await addChecklistItem('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', '');
        expect(result.success).toBe(false);
    });

    it('добавляет пункт чеклиста', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockTx.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: '4242XXXX-XXXX-4242-4242-XXXXXXXX4242', title: 'Item' }]) }),
        });
        const result = await addChecklistItem('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', 'Test Item');
        expect(result).toMatchObject({ success: true });
    });
});

describe('toggleChecklistItem', () => {
    beforeEach(() => setupMocks());

    it('переключает статус пункта чеклиста', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await toggleChecklistItem('4242XXXX-XXXX-4242-4242-XXXXXXXX4242', true);
        expect(result).toMatchObject({ success: true });
    });
});

describe('deleteChecklistItem', () => {
    beforeEach(() => setupMocks());

    it('удаляет пункт чеклиста', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        // deleteChecklistItem checks permissions:
        // 1. find item to get taskId
        mockFindFirst.mockResolvedValueOnce({ id: 'item1', taskId: 'task1' });
        // 2. find task to get creator
        mockFindFirst.mockResolvedValueOnce({ createdBy: 'u1' });

        const result = await deleteChecklistItem('4242XXXX-XXXX-4242-4242-XXXXXXXX4242');
        expect(result).toMatchObject({ success: true });
    });
});
