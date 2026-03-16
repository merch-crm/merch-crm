import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSession } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDelete, mockSelect, mockInsert } = vi.hoisted(() => {
    const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ success: true })
    });
    const mockSelect = vi.fn();
    const mockInsert = vi.fn(() => ({
        values: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 'new-id' }]))
        }))
    }));
    return { mockDelete, mockSelect, mockInsert };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/redis', () => ({ invalidateCache: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/db', () => ({
    db: {
        delete: mockDelete,
        select: mockSelect,
        insert: mockInsert,
    },
}));

import { deleteCollection } from '@/app/(main)/dashboard/design/prints/actions/collection-actions';
import { deleteDesign } from '@/app/(main)/dashboard/design/prints/actions/design-actions';
import { deleteDesignVersion } from '@/app/(main)/dashboard/design/prints/actions/version-actions';
import { deleteDesignFile } from '@/app/(main)/dashboard/design/prints/actions/file-actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Print Designs Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelect.mockReset();
        mockDelete.mockClear();
    });

    describe('deleteCollection', () => {
        it('администратор может удалить любую коллекцию', async () => {
            vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));

            // 1. Permission check
            mockSelect.mockReturnValueOnce({
                from: vi.fn(() => ({
                    where: vi.fn(() => ({
                        limit: vi.fn(() => Promise.resolve([{ createdBy: 'other-id' }]))
                    }))
                }))
            });

            // 2. Dependency check (linesCount)
            mockSelect.mockReturnValueOnce({
                from: vi.fn(() => ({
                    where: vi.fn(() => Promise.resolve([{ count: 0 }]))
                }))
            });

            const result = await deleteCollection('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
            expect(result.success).toBe(true);
        });

        it('обычный пользователь не может удалить чужую коллекцию (IDOR)', async () => {
            vi.mocked(getSession).mockResolvedValueOnce(mockSession({ id: 'my-id', roleName: 'Дизайнер' }));

            mockSelect.mockReturnValueOnce({
                from: vi.fn(() => ({
                    where: vi.fn(() => ({
                        limit: vi.fn(() => Promise.resolve([{ createdBy: 'other-id' }]))
                    }))
                }))
            });

            const result = await deleteCollection('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
            expect(result).toEqual({ success: false, error: 'Недостаточно прав для удаления' });
        });
    });

    describe('deleteDesign', () => {
        it('требует наличия прав администратора или владения для удаления дизайна', async () => {
            const creatorId = 'creator-id';
            vi.mocked(getSession).mockResolvedValueOnce(mockSession({ id: creatorId, roleName: 'Дизайнер' }));

            // select().from().innerJoin().where().limit(1)
            mockSelect.mockReturnValueOnce({
                from: vi.fn(() => ({
                    innerJoin: vi.fn(() => ({
                        where: vi.fn(() => ({
                            limit: vi.fn(() => Promise.resolve([{ collectionId: 'coll-id', creator: creatorId }]))
                        }))
                    }))
                }))
            });

            const result = await deleteDesign('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
            expect(result.success).toBe(true);
        });
    });

    describe('deleteDesignVersion', () => {
        it('возвращает ошибку при попытке удаления чужой версии', async () => {
            vi.mocked(getSession).mockResolvedValueOnce(mockSession({ id: 'bad-user', roleName: 'Дизайнер' }));

            // select().from().innerJoin().innerJoin().where().limit(1)
            mockSelect.mockReturnValueOnce({
                from: vi.fn(() => ({
                    innerJoin: vi.fn(() => ({
                        innerJoin: vi.fn(() => ({
                            where: vi.fn(() => ({
                                limit: vi.fn(() => Promise.resolve([{ id: 'v-id', designId: 'd-id', creator: 'the-real-creator' }]))
                            }))
                        }))
                    }))
                }))
            });

            const result = await deleteDesignVersion('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
            expect(result).toEqual({ success: false, error: 'Недостаточно прав для удаления' });
        });
    });

    describe('deleteDesignFile', () => {
        beforeEach(() => {
            vi.clearAllMocks();
            mockSelect.mockReset();
            mockDelete.mockClear();
        });

        it('администратор может удалить любой файл', async () => {
            vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));

            // 1. File lookup
            mockSelect.mockReturnValueOnce({
                from: vi.fn(() => ({
                    where: vi.fn(() => ({
                        limit: vi.fn(() => Promise.resolve([{ id: 'f-1', path: 'p-1', versionId: 'v-1' }]))
                    }))
                }))
            });

            // 2. Creator check join
            mockSelect.mockReturnValueOnce({
                from: vi.fn(() => ({
                    innerJoin: vi.fn(() => ({
                        innerJoin: vi.fn(() => ({
                            where: vi.fn(() => ({
                                limit: vi.fn(() => Promise.resolve([{ creator: 'other-user' }]))
                            }))
                        }))
                    }))
                }))
            });

            const result = await deleteDesignFile('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
            expect(result.success).toBe(true);
        });

        it('создатель коллекции может удалить файл своего дизайна', async () => {
            const userId = 'creator-id';
            vi.mocked(getSession).mockResolvedValueOnce(mockSession({ id: userId, roleName: 'Дизайнер' }));

            mockSelect.mockReturnValueOnce({
                from: vi.fn(() => ({
                    where: vi.fn(() => ({
                        limit: vi.fn(() => Promise.resolve([{ id: 'f-1', path: 'p-1', versionId: 'v-1' }]))
                    }))
                }))
            });

            mockSelect.mockReturnValueOnce({
                from: vi.fn(() => ({
                    innerJoin: vi.fn(() => ({
                        innerJoin: vi.fn(() => ({
                            where: vi.fn(() => ({
                                limit: vi.fn(() => Promise.resolve([{ creator: userId }]))
                            }))
                        }))
                    }))
                }))
            });

            const result = await deleteDesignFile('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
            expect(result.success).toBe(true);
        });
    });
});
